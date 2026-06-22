import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { MatchResult } from '../common/types/job-match.type';
import { DatabaseService } from '../database/database.service';
import { JobsService } from '../jobs/jobs.service';
import { buildLearningRoadmapFallback, CareerCoachProfile } from './career-coach.fallback';
import { parseCvLocally } from '../users/cv-parser.fallback';
import { AiEngineClient } from './ai-engine.client';

export interface ResumeParseResult {
  name: string | null;
  email?: string | null;
  skills: string[];
  education: string[];
  experience: string[];
  rawText?: string;
  parsedWithAi?: boolean;
}

export interface TrainingRecommendation {
  title: string;
  provider?: string;
  url?: string;
  skill?: string;
  description?: string;
}

@Injectable()
export class AiConnectionService {
  constructor(
    private readonly store: DatabaseService,
    private readonly jobsService: JobsService,
    private readonly aiEngineClient: AiEngineClient,
  ) {}

  parseResume(input: { text?: string; skills?: string[]; education?: string[]; experience?: string[] }) {
    return this.aiEngineClient.parseResume(input);
  }

  parseResumeFile(input: { fileName: string; mimeType: string; contentBase64: string }) {
    return this.withFeatureCheck('resumeParsingEnabled', async () => {
      try {
        return await this.aiEngineClient.parseResumeFile(input);
      } catch {
        const buffer = Buffer.from(input.contentBase64, 'base64');
        return parseCvLocally({
          buffer,
          mimetype: input.mimeType,
          originalname: input.fileName,
        });
      }
    });
  }

  async matchScore(candidate: { id?: string; skills?: string[]; cvText?: string | null }, jobId: string): Promise<MatchResult & { jobId: string }> {
    const job = await this.jobsService.getJobById(jobId);
    const match = await this.matchCandidateToJob(candidate, {
      id: job.id,
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills,
      experienceLevel: job.experienceLevel,
    });

    return { jobId, ...match };
  }

  matchCandidateToJob(
    candidate: { id?: string; skills?: string[]; cvText?: string | null },
    job: { id: string; title: string; description: string; requiredSkills: string[]; experienceLevel?: string },
  ) {
    return this.withFeatureCheck('aiEnabled', () => this.aiEngineClient.matchCandidateToJob(candidate, job));
  }

  skillsGap(candidateSkills: string[] = [], requiredSkills: string[] = []) {
    return this.aiEngineClient.skillsGap(candidateSkills, requiredSkills);
  }

  recommendTraining(missingSkills: string[] = []) {
    return this.aiEngineClient.recommendTraining(missingSkills);
  }

  async chat(input: { message: string; userId?: string; conversationHistory?: Array<{ role: string; content: string }> }) {
    return this.withFeatureCheck('careerChatEnabled', async () => {
      const userId = input.userId;
      if (!userId) {
        throw new ServiceUnavailableException('User context is required for career chat');
      }

      const trimmedMessage = input.message.trim();
      const priorMessages = await this.store.coachMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 40,
      });

      const conversationHistory = priorMessages.map((entry) => ({
        role: entry.role === 'USER' ? 'user' : 'assistant',
        content: entry.content,
      }));

      const userProfile = await this.buildUserProfile(userId);

      const aiResult = await this.aiEngineClient.chat({
        message: trimmedMessage,
        user_profile: userProfile,
        conversation_history: conversationHistory,
      });

      const userRecord = await this.store.coachMessage.create({
        data: {
          userId,
          role: 'USER',
          content: trimmedMessage,
        },
      });

      const assistantRecord = await this.store.coachMessage.create({
        data: {
          userId,
          role: 'ASSISTANT',
          content: aiResult.response || 'I could not generate a response.',
        },
      });

      return {
        ...aiResult,
        userMessage: this.formatCoachMessage(userRecord),
        assistantMessage: this.formatCoachMessage(assistantRecord),
      };
    });
  }

  listCoachMessages(userId: string) {
    return this.store.coachMessage
      .findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 200,
      })
      .then((messages) => messages.map((message) => this.formatCoachMessage(message)));
  }

  async clearCoachMessages(userId: string) {
    await this.store.coachMessage.deleteMany({ where: { userId } });
    return { cleared: true };
  }

  private formatCoachMessage(message: { id: string; role: string; content: string; createdAt: Date }) {
    return {
      id: message.id,
      role: message.role === 'USER' ? 'user' : 'assistant',
      content: message.content,
      createdAt: message.createdAt,
    };
  }

  async learningRoadmap(input: { goal: string; currentSkills?: string[]; userId?: string }) {
    return this.withFeatureCheck('careerChatEnabled', async () => {
      const userProfile = await this.buildUserProfile(input.userId);
      const currentSkills = input.currentSkills ?? userProfile?.skills ?? [];
      try {
        return await this.aiEngineClient.learningRoadmap({
          goal: input.goal,
          currentSkills,
          userId: input.userId,
        });
      } catch {
        return buildLearningRoadmapFallback(input.goal, {
          ...userProfile,
          skills: currentSkills,
        });
      }
    });
  }

  private async withFeatureCheck<T>(
    flag: 'aiEnabled' | 'careerChatEnabled' | 'resumeParsingEnabled',
    action: () => Promise<T> | T,
  ): Promise<T> {
    const settings = await this.store.platformSetting.findUnique({ where: { id: 'global' } });
    if (settings && settings[flag] === false) {
      throw new ServiceUnavailableException(`AI feature "${flag}" is disabled`);
    }
    return action();
  }

  async getCandidateMatch(userId: string, jobId: string) {
    const user = await this.store.user.findUnique({ where: { id: userId } });
    return this.matchScore(
      {
        id: user?.id,
        skills: user?.skills ?? [],
        cvText: user?.cvText,
      },
      jobId,
    );
  }

  private async buildUserProfile(userId?: string): Promise<CareerCoachProfile | undefined> {
    if (!userId) {
      return undefined;
    }

    const user = await this.store.user.findUnique({ where: { id: userId } });
    if (!user) {
      return undefined;
    }

    return {
      fullName: user.fullName,
      skills: user.skills ?? [],
      location: user.location ?? undefined,
      education: user.bio ?? undefined,
      experience:
        user.experienceYears != null
          ? `${user.experienceYears} years of experience`
          : user.cvText
            ? user.cvText.slice(0, 500)
            : undefined,
    };
  }
}
