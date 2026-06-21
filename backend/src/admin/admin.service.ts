import { Injectable, NotFoundException } from '@nestjs/common';
import { JobStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
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
