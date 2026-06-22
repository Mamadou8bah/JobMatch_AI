import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Job as DbJob, UserRole as DbUserRole } from '@prisma/client';
import { AiEngineClient } from '../ai-connection/ai-engine.client';
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
  ) {}

  async listJobs(currentUserId?: string, currentUserRole?: UserRole, query?: JobQueryDto) {
    const currentUser = currentUserId ? await this.store.user.findUnique({ where: { id: currentUserId } }) : undefined;
    const jobs = await this.store.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: { employer: true },
    });

    const normalizedSearch = query?.search?.toLowerCase();
    const normalizedLocation = query?.location?.toLowerCase();
    const normalizedStatus = query?.status?.toLowerCase();

    const filteredJobs = jobs
      .filter((job) => {
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

    return Promise.all(
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

  async getJobMatches(jobId: string) {
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

    return matches.sort((left, right) => right.match.score - left.match.score);
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
        approved: boolean;
        blocked: boolean;
        emailVerified: boolean;
        cvFileName: string | null;
        cvFilePath: string | null;
        cvMimeType: string | null;
        cvText: string | null;
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

    return {
      ...job,
      status: job.status.toLowerCase(),
      employer: {
        ...job.employer,
        role: fromDbUserRole(job.employer.role),
      },
      match,
    };
  }
}
