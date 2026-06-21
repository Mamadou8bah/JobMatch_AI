import { Injectable } from '@nestjs/common';
import { MatchResult } from '../common/types/job-match.type';
import { DatabaseService } from '../database/database.service';
import { JobsService } from '../jobs/jobs.service';
import { AiEngineClient } from './ai-engine.client';

export interface ResumeParseResult {
  name: string | null;
  email?: string | null;
  skills: string[];
  education: string[];
  experience: string[];
  rawText?: string;
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
    return this.aiEngineClient.parseResumeFile(input);
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
    return this.aiEngineClient.matchCandidateToJob(candidate, job);
  }

  skillsGap(candidateSkills: string[] = [], requiredSkills: string[] = []) {
    return this.aiEngineClient.skillsGap(candidateSkills, requiredSkills);
  }

  recommendTraining(missingSkills: string[] = []) {
    return this.aiEngineClient.recommendTraining(missingSkills);
  }

  chat(input: { message: string; userId?: string }) {
    return this.aiEngineClient.chat(input);
  }

  learningRoadmap(input: { goal: string; currentSkills?: string[]; userId?: string }) {
    return this.aiEngineClient.learningRoadmap(input);
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
}
