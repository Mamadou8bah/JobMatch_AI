import { Injectable, NotFoundException } from '@nestjs/common';
import { JobStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { UpdateAiConfigDto } from './dto/update-ai-config.dto';
import { ModerateJobDto } from './dto/moderate-job.dto';

@Injectable()
export class AdminService {
  constructor(private readonly database: DatabaseService) {}

  async approveUser(actorId: string, userId: string, approved: boolean) {
    const user = await this.database.user.update({
      where: { id: userId },
      data: { approved },
    });

    await this.audit(actorId, approved ? 'user.approve' : 'user.unapprove', 'User', userId, { approved });
    return user;
  }

  async blockUser(actorId: string, userId: string, blocked: boolean) {
    const user = await this.database.user.update({
      where: { id: userId },
      data: { blocked },
    });

    await this.audit(actorId, blocked ? 'user.block' : 'user.unblock', 'User', userId, { blocked });
    return user;
  }

  async moderateJob(actorId: string, jobId: string, dto: ModerateJobDto) {
    const job = await this.database.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const updatedJob = await this.database.job.update({
      where: { id: jobId },
      data: { status: this.toJobStatus(dto.status) },
    });

    await this.audit(actorId, 'job.moderate', 'Job', jobId, {
      status: dto.status,
      reason: dto.reason,
    });

    return updatedJob;
  }

  async analytics() {
    const [
      totalUsers,
      jobSeekers,
      employers,
      pendingEmployers,
      totalJobs,
      publishedJobs,
      pendingJobs,
      totalApplications,
      hiredApplications,
      openThreads,
      trainingCourses,
    ] = await Promise.all([
      this.database.user.count(),
      this.database.user.count({ where: { role: 'JOB_SEEKER' } }),
      this.database.user.count({ where: { role: 'EMPLOYER' } }),
      this.database.user.count({ where: { role: 'EMPLOYER', approved: false } }),
      this.database.job.count(),
      this.database.job.count({ where: { status: 'PUBLISHED' } }),
      this.database.job.count({ where: { status: 'PENDING_REVIEW' } }),
      this.database.application.count(),
      this.database.application.count({ where: { status: 'HIRED' } }),
      this.database.chatThread.count({ where: { status: 'OPEN' } }),
      this.database.trainingCourse.count(),
    ]);

    const topSkills = await this.database.job.findMany({
      where: { status: 'PUBLISHED' },
      select: { requiredSkills: true },
    });

    return {
      users: { total: totalUsers, jobSeekers, employers, pendingEmployers },
      jobs: { total: totalJobs, published: publishedJobs, pendingReview: pendingJobs },
      applications: { total: totalApplications, hired: hiredApplications },
      engagement: { openChatThreads: openThreads },
      training: { courses: trainingCourses },
      labourMarket: {
        topRequiredSkills: this.countSkills(topSkills.flatMap((job) => job.requiredSkills)).slice(0, 10),
      },
    };
  }

  listAuditLogs() {
    return this.database.auditLog.findMany({
      include: { actor: { select: { id: true, fullName: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getAiConfig() {
    const settings = await this.ensurePlatformSettings();
    return this.formatAiConfig(settings);
  }

  async updateAiConfig(actorId: string, dto: UpdateAiConfigDto) {
    await this.ensurePlatformSettings();
    const updated = await this.database.platformSetting.update({
      where: { id: 'global' },
      data: {
        aiEngineUrl: dto.aiEngineUrl,
        aiMatchThreshold: dto.aiMatchThreshold,
        aiEnabled: dto.aiEnabled,
        careerChatEnabled: dto.careerChatEnabled,
        resumeParsingEnabled: dto.resumeParsingEnabled,
      },
    });

    await this.audit(actorId, 'ai.config.update', 'PlatformSetting', 'global', dto as Record<string, unknown>);
    return this.formatAiConfig(updated);
  }

  async getAiHealth() {
    const config = await this.getAiConfig();
    const started = Date.now();
    try {
      const response = await fetch(`${config.aiEngineUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      const payload = response.ok
        ? ((await response.json()) as { geminiModel?: string; geminiConfigured?: boolean })
        : null;
      return {
        status: response.ok ? 'online' : 'degraded',
        latencyMs: Date.now() - started,
        httpStatus: response.status,
        aiEngineUrl: config.aiEngineUrl,
        geminiModel: payload?.geminiModel ?? null,
        geminiConfigured: payload?.geminiConfigured ?? null,
        checkedAt: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'offline',
        latencyMs: Date.now() - started,
        aiEngineUrl: config.aiEngineUrl,
        checkedAt: new Date().toISOString(),
      };
    }
  }

  private formatAiConfig(updated: {
    aiEngineUrl: string | null;
    aiMatchThreshold: number;
    aiEnabled: boolean;
    careerChatEnabled: boolean;
    resumeParsingEnabled: boolean;
    updatedAt: Date;
  }) {
    return {
      aiEngineUrl: updated.aiEngineUrl ?? process.env.AI_ENGINE_URL ?? 'http://localhost:8000',
      aiMatchThreshold: updated.aiMatchThreshold,
      aiEnabled: updated.aiEnabled,
      careerChatEnabled: updated.careerChatEnabled,
      resumeParsingEnabled: updated.resumeParsingEnabled,
      updatedAt: updated.updatedAt,
    };
  }

  private async ensurePlatformSettings() {
    return this.database.platformSetting.upsert({
      where: { id: 'global' },
      update: {},
      create: {
        id: 'global',
        aiEngineUrl: process.env.AI_ENGINE_URL ?? 'http://localhost:8000',
      },
    });
  }

  private audit(actorId: string, action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>) {
    return this.database.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: metadata ? this.database.toJson(metadata) : undefined,
      },
    });
  }

  private toJobStatus(status: ModerateJobDto['status']) {
    switch (status) {
      case 'published':
        return JobStatus.PUBLISHED;
      case 'rejected':
        return JobStatus.REJECTED;
      case 'closed':
        return JobStatus.CLOSED;
      default:
        return JobStatus.PENDING_REVIEW;
    }
  }

  private countSkills(skills: string[]) {
    const counts = new Map<string, number>();
    skills.forEach((skill) => counts.set(skill, (counts.get(skill) ?? 0) + 1));

    return Array.from(counts.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((left, right) => right.count - left.count);
  }
}
