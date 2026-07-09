import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Job as DbJob, UserRole as DbUserRole } from '@prisma/client';
import { AiEngineClient } from '../ai-connection/ai-engine.client';
import { FREE_EMPLOYER_RANKING_LIMIT } from '../billing/billing.constants';
import { EntitlementsService } from '../billing/entitlements.service';
import { fromDbUserRole, toDbJobStatus } from '../common/mappers';
import { UserRole } from '../common/enums/role.enum';
import { DatabaseService } from '../database/database.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly store: DatabaseService,
    private readonly aiEngineClient: AiEngineClient,
    private readonly entitlements: EntitlementsService,
  ) {}

  async listJobs(currentUserId?: string, currentUserRole?: UserRole, query?: JobQueryDto) {
    const currentUser = currentUserId ? await this.store.user.findUnique({ where: { id: currentUserId } }) : undefined;
    const jobs = await this.store.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        employer: true,
      },
    });

    const normalizedSearch = query?.search?.toLowerCase();
    const normalizedLocation = query?.location?.toLowerCase();
    const normalizedStatus = query?.status?.toLowerCase();
    const employerId = query?.employerId;

    const filteredJobs = jobs
      .filter((job) => {
        if (employerId) {
          return job.employerId === employerId;
        }
        if (normalizedStatus) {
          return job.status.toLowerCase() === normalizedStatus;
        }
        if (currentUserRole === UserRole.Admin) {
          return true;
        }
        if (currentUserRole === UserRole.Employer && currentUserId) {
          return job.status === 'PUBLISHED' || job.employerId === currentUserId;
        }
        return job.status === 'PUBLISHED';
      })
      .filter((job) => !normalizedLocation || job.location.toLowerCase().includes(normalizedLocation))
      .filter((job) => {
        if (!normalizedSearch) return true;

        return [job.title, job.description, ...job.requiredSkills]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      });

    const serialized = await Promise.all(
      filteredJobs.map((job) =>
        this.serializeJob(
          job,
          currentUser?.role === 'JOB_SEEKER'
            ? {
                id: currentUser.id,
                skills: currentUser.skills,
                cvText: currentUser.cvText,
              }
            : undefined,
        ),
      ),
    );

    // Premium employers get priority visibility in public job lists
    return serialized.sort((a, b) => {
      const aPremium = a.employer?.plan === 'premium' || a.employer?.plan === 'PREMIUM' ? 1 : 0;
      const bPremium = b.employer?.plan === 'premium' || b.employer?.plan === 'PREMIUM' ? 1 : 0;
      if (bPremium !== aPremium) return bPremium - aPremium;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async createJob(employerId: string, role: UserRole, dto: CreateJobDto) {
    this.ensureEmployerRole(role);

    const employer = await this.store.user.findUnique({ where: { id: employerId } });
    if (!employer) {
      throw new NotFoundException('Employer not found');
    }
    if (role === UserRole.Employer && !employer.approved) {
      throw new ForbiddenException('Your employer account must be approved before posting jobs');
    }

    await this.entitlements.assertCanPostJob(employerId, employer.role);

    const job = await this.store.job.create({
      data: {
        employerId,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        employmentType: dto.employmentType,
        experienceLevel: dto.experienceLevel,
        requiredSkills: dto.requiredSkills,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        status: toDbJobStatus(dto.status ?? 'published'),
      },
      include: { employer: true },
    });

    return this.serializeJob(job);
  }

  async getJobById(jobId: string, currentUserId?: string) {
    const job = await this.store.job.findUnique({
      where: { id: jobId },
      include: { employer: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const currentUser = currentUserId
      ? await this.store.user.findUnique({ where: { id: currentUserId } })
      : undefined;

    return this.serializeJob(
      job,
      currentUser?.role === 'JOB_SEEKER'
        ? {
            id: currentUser.id,
            skills: currentUser.skills,
            cvText: currentUser.cvText,
          }
        : undefined,
    );
  }

  async updateJob(jobId: string, employerId: string, role: UserRole, dto: UpdateJobDto) {
    const job = await this.store.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    this.ensureEmployerOwnership(job.employerId, employerId, role);

    const updatedJob = await this.store.job.update({
      where: { id: jobId },
      data: {
        ...dto,
        status: dto.status ? toDbJobStatus(dto.status) : undefined,
      },
      include: { employer: true },
    });

    return this.serializeJob(updatedJob);
  }

  async deleteJob(jobId: string, employerId: string, role: UserRole) {
    const job = await this.store.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    this.ensureEmployerOwnership(job.employerId, employerId, role);

    await this.store.job.delete({ where: { id: jobId } });
    return { message: 'Job deleted successfully' };
  }

  async getJobMatches(jobId: string, employerId?: string) {
    const job = await this.store.job.findUnique({ where: { id: jobId } });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const users = await this.store.user.findMany({
      where: { role: 'JOB_SEEKER' },
    });

    const matches = await Promise.all(
      users.map(async (user) => ({
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          location: user.location,
          skills: user.skills,
          avatarUrl: user.avatarUrl,
        },
        match: await this.aiEngineClient.matchCandidateToJob(
          {
            id: user.id,
            skills: user.skills,
            cvText: user.cvText,
          },
          {
            id: job.id,
            title: job.title,
            description: job.description,
            requiredSkills: job.requiredSkills,
            experienceLevel: job.experienceLevel,
          },
        ),
      })),
    );

    const sorted = matches.sort((left, right) => right.match.score - left.match.score);

    if (!employerId || (await this.entitlements.isPremium(employerId))) {
      return sorted;
    }

    return {
      premiumRequired: true,
      message: `Free employers see the top ${FREE_EMPLOYER_RANKING_LIMIT} candidates. Upgrade for full AI ranking.`,
      matches: sorted.slice(0, FREE_EMPLOYER_RANKING_LIMIT).map((entry) => ({
        ...entry,
        match: {
          score: entry.match.score,
          matchedSkills: (entry.match.matchedSkills || []).slice(0, 3),
        },
      })),
      totalCandidates: sorted.length,
    };
  }

  private ensureEmployerRole(role: UserRole) {
    if (role !== UserRole.Employer && role !== UserRole.Admin) {
      throw new ForbiddenException('Employer access required');
    }
  }

  private ensureEmployerOwnership(jobEmployerId: string, currentUserId: string, role: UserRole) {
    if (role === UserRole.Admin) {
      return;
    }

    if (role !== UserRole.Employer || jobEmployerId !== currentUserId) {
      throw new ForbiddenException('You can only manage your own jobs');
    }
  }

  private async serializeJob(
    job: DbJob & {
      employer: {
        id: string;
        email: string;
        role: DbUserRole;
        fullName: string;
        phone: string | null;
        location: string | null;
        bio: string | null;
        skills: string[];
        experienceYears: number | null;
        companyName: string | null;
        companyDescription: string | null;
        avatarUrl: string | null;
        approved: boolean;
        blocked: boolean;
        emailVerified: boolean;
        cvFileName: string | null;
        cvFilePath: string | null;
        cvMimeType: string | null;
        cvText: string | null;
        plan?: string;
        createdAt: Date;
        updatedAt: Date;
      };
    },
    candidate?: { id: string; skills: string[]; cvText: string | null },
  ) {
    const match = candidate
      ? await this.aiEngineClient.matchCandidateToJob(candidate, {
          id: job.id,
          title: job.title,
          description: job.description,
          requiredSkills: job.requiredSkills,
          experienceLevel: job.experienceLevel,
        })
      : undefined;

    const visibleMatch =
      candidate && match
        ? await this.entitlements.redactMatchForPlan(candidate.id, match)
        : match;

    return {
      ...job,
      status: job.status.toLowerCase(),
      employer: {
        id: job.employer.id,
        fullName: job.employer.fullName,
        companyName: job.employer.companyName,
        companyDescription: job.employer.companyDescription,
        location: job.employer.location,
        avatarUrl: job.employer.avatarUrl,
        role: fromDbUserRole(job.employer.role),
        plan: String(job.employer.plan || 'FREE').toLowerCase(),
      },
      match: visibleMatch,
      priorityListing: String(job.employer.plan || '').toUpperCase() === 'PREMIUM',
    };
  }
}