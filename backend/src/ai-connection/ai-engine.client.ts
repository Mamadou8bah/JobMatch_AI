import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { MatchResult } from '../common/types/job-match.type';
import { DatabaseService } from '../database/database.service';
import type { ResumeParseResult, TrainingRecommendation } from './ai-connection.service';
import type { CareerCoachProfile } from './career-coach.fallback';

@Injectable()
export class AiEngineClient {
  private readonly defaultBaseUrl = process.env.AI_ENGINE_URL ?? 'http://localhost:8000';
  private readonly apiKey = process.env.AI_ENGINE_API_KEY;
  private readonly timeoutMs = Number(process.env.AI_ENGINE_TIMEOUT_MS ?? 15000);

  constructor(private readonly store: DatabaseService) {}

  private async getSettings() {
    return this.store.platformSetting.findUnique({ where: { id: 'global' } });
  }

  private async getBaseUrl() {
    const settings = await this.getSettings();
    return settings?.aiEngineUrl ?? this.defaultBaseUrl;
  }

  async parseResume(input: { text?: string; skills?: string[]; education?: string[]; experience?: string[] }) {
    const result = await this.request<Partial<ResumeParseResult>>('/resume/parse', input);
    return this.normalizeResumeParseResult(result);
  }

  async parseResumeFile(input: { fileName: string; mimeType: string; contentBase64: string }) {
    const result = await this.requestOptional<Partial<ResumeParseResult>>('/resume/parse-file', input);
    return this.normalizeResumeParseResult(result);
  }

  async matchCandidateToJob(
    candidate: { id?: string; skills?: string[]; cvText?: string | null },
    job: { id: string; title: string; description: string; requiredSkills: string[]; experienceLevel?: string },
  ) {
    try {
      const result = await this.request<Record<string, unknown>>('/matching/job', {
        candidate,
        job,
      });

      return this.normalizeMatchResult(result);
    } catch {
      return this.localMatchFallback(candidate.skills ?? [], job.requiredSkills ?? []);
    }
  }

  async skillsGap(candidateSkills: string[] = [], requiredSkills: string[] = []) {
    const result = await this.request<Record<string, unknown>>('/skills/gap', {
      candidateSkills,
      requiredSkills,
    });

    const missingSkills = this.toStringArray(result.missingSkills);
    return {
      missingSkills,
      gapCount: Number(result.gapCount ?? missingSkills.length),
    };
  }

  async recommendTraining(missingSkills: string[] = []) {
    const result = await this.request<Record<string, unknown>>('/training/recommendations', {
      missingSkills,
    });

    return {
      recommendations: this.normalizeRecommendations(result.recommendations),
    };
  }

  async chat(input: {
    message: string;
    user_profile?: CareerCoachProfile;
    conversation_history?: Array<{ role: string; content: string }>;
  }) {
    const result = await this.requestOptional<Record<string, unknown>>('/chat/career', input);
    return {
      response: String(result.response ?? result.message ?? result.reply ?? ''),
      roadmap: result.roadmap,
      parsedWithAi: result.parsedWithAi !== false,
    };
  }

  async learningRoadmap(input: { goal: string; currentSkills?: string[]; userId?: string }) {
    return this.requestOptional<Record<string, unknown>>('/chat/roadmap', input);
  }

  private async requestOptional<T>(path: string, body: unknown): Promise<T> {
    const baseUrl = await this.getBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ServiceUnavailableException(`AI engine request failed: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException('AI engine is unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }

  private async request<T>(path: string, body: unknown): Promise<T> {
    const settings = await this.getSettings();
    if (settings && !settings.aiEnabled) {
      throw new ServiceUnavailableException('AI features are disabled by platform configuration');
    }

    const baseUrl = await this.getBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ServiceUnavailableException(`AI engine request failed: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException('AI engine is unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }

  private normalizeResumeParseResult(result: Partial<ResumeParseResult>): ResumeParseResult {
    return {
      name: result.name ?? null,
      email: result.email ?? null,
      skills: this.toStringArray(result.skills),
      education: this.toStringArray(result.education),
      experience: this.toStringArray(result.experience),
      rawText: result.rawText,
      parsedWithAi: result.parsedWithAi !== false,
    };
  }

  private localMatchFallback(candidateSkills: string[], requiredSkills: string[]): MatchResult {
    const normalizedCandidate = candidateSkills.map((skill) => skill.trim().toLowerCase()).filter(Boolean);
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const required of requiredSkills) {
      const normalizedRequired = required.trim().toLowerCase();
      if (!normalizedRequired) {
        continue;
      }

      const match = normalizedCandidate.find(
        (skill) => skill === normalizedRequired || skill.includes(normalizedRequired) || normalizedRequired.includes(skill),
      );

      if (match) {
        matchedSkills.push(required);
      } else {
        missingSkills.push(required);
      }
    }

    const score =
      requiredSkills.length === 0 ? 0 : Math.round((matchedSkills.length / requiredSkills.length) * 100);

    return { score, matchedSkills, missingSkills };
  }

  private normalizeMatchResult(result: Record<string, unknown>): MatchResult {
    const rawScore = result.score ?? result.matchScore ?? result.matchPercentage ?? result.percentage ?? 0;
    const score = Math.max(0, Math.min(100, Math.round(Number(rawScore))));

    return {
      score,
      matchedSkills: this.toStringArray(result.matchedSkills),
      missingSkills: this.toStringArray(result.missingSkills),
    };
  }

  private normalizeRecommendations(value: unknown): TrainingRecommendation[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => {
      if (typeof item === 'string') {
        return { title: item };
      }

      const recommendation = item as Record<string, unknown>;
      return {
        title: String(recommendation.title ?? recommendation.name ?? 'Recommended course'),
        provider: recommendation.provider ? String(recommendation.provider) : undefined,
        url: recommendation.url ? String(recommendation.url) : undefined,
        skill: recommendation.skill ? String(recommendation.skill) : undefined,
        description: recommendation.description ? String(recommendation.description) : undefined,
      };
    });
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string');
  }
}
