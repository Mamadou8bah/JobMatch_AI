import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Application as DbApplication } from '@prisma/client';
import { AiConnectionService } from '../ai-connection/ai-connection.service';
import { UserRole } from '../common/enums/role.enum';
import { DatabaseService } from '../database/database.service';
import { JobsService } from '../jobs/jobs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly store: DatabaseService,
    private readonly jobsService: JobsService,
    private readonly aiConnectionService: AiConnectionService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createApplication(applicantId: string, role: UserRole, dto: CreateApplicationDto) {
    if (role !== UserRole.JobSeeker) {
      throw new ForbiddenException('Only job seekers can apply');
    }

    const applicant = await this.store.user.findUnique({ where: { id: applicantId } });
    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    const job = await this.jobsService.getJobById(dto.jobId);
    const match = await this.aiConnectionService.matchCandidateToJob(
      {
        id: applicant.id,
        skills: applicant.skills,
        cvText: applicant.cvText,
      },
      {
        id: job.id,
        title: job.title,
        description: job.description,
        requiredSkills: job.requiredSkills,
        experienceLevel: job.experienceLevel,
      },
    );

    const existingApplication = await this.store.application.findUnique({
      where: { jobId_applicantId: { jobId: dto.jobId, applicantId } },
    });
    if (existingApplication) {
      return existingApplication;
    }

    const application = await this.store.application.create({
      data: {
        jobId: dto.jobId,
        applicantId,
        employerId: job.employer.id,
        coverLetter: dto.coverLetter,
        status: 'PENDING',
        matchScore: match.score,
      },
    });

    await this.notificationsService.createNotification(job.employer.id, {
      title: 'New application received',
      message: `${applicant.fullName} applied for ${job.title}`,
      type: 'application',
    });
    await this.notificationsService.createNotification(applicantId, {
      title: 'Application submitted',
      message: `Your application for ${job.title} was submitted successfully.`,
      type: 'application',
    });

    return application;
  }

  async listMyApplications(applicantId: string) {
    const applications = await this.store.application.findMany({
      where: { applicantId },
      include: {
        job: {
          include: { employer: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return applications.map((app) => this.serializeApplication(app));
  }

  async listJobApplications(jobId: string, requesterId: string, role: UserRole) {
    const job = await this.jobsService.getJobById(jobId);

    if (role !== UserRole.Admin && job.employer.id !== requesterId) {
      throw new ForbiddenException('You can only view applicants for your own jobs');
    }

    const applications = await this.store.application.findMany({
      where: { jobId },
      include: {
        applicant: true,
        job: { include: { employer: true } },
      },
      orderBy: [{ matchScore: 'desc' }, { createdAt: 'desc' }],
    });
    return applications.map((app) => this.serializeApplication(app));
  }

  async updateApplicationStatus(applicationId: string, requesterId: string, role: UserRole, dto: UpdateApplicationStatusDto) {
    const application = await this.store.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const job = await this.jobsService.getJobById(application.jobId);
    if (role !== UserRole.Admin && job.employer.id !== requesterId) {
      throw new ForbiddenException('You can only update applications for your own jobs');
    }

    const updated = await this.store.application.update({
      where: { id: applicationId },
      data: { status: dto.status.toUpperCase() as DbApplication['status'] },
      include: {
        applicant: true,
        job: { include: { employer: true } },
      },
    });

    const statusLabel = dto.status;
    const isInterview = dto.status === 'interview';

    await this.notificationsService.createNotification(application.applicantId, {
      title: isInterview ? 'Interview invitation' : 'Application status updated',
      message: isInterview
        ? dto.interviewMessage ||
          `You have been invited to interview for ${job.title}. The employer will contact you with details.`
        : `Your application for ${job.title} is now ${statusLabel}.`,
      type: 'application',
    });

    return this.serializeApplication(updated);
  }

  private serializeApplication(
    application: DbApplication & {
      applicant?: {
        id: string;
        fullName: string;
        email: string;
        location: string | null;
        skills: string[];
      } | null;
      job?: {
        id: string;
        title: string;
        location: string | null;
        employer: {
          id: string;
          fullName: string;
          companyName: string | null;
        };
      } | null;
    },
  ) {
    return {
      ...application,
      status: application.status.toLowerCase(),
      applicant: application.applicant
        ? {
            id: application.applicant.id,
            fullName: application.applicant.fullName,
            email: application.applicant.email,
            location: application.applicant.location,
            skills: application.applicant.skills,
          }
        : undefined,
      job: application.job
        ? {
            id: application.job.id,
            title: application.job.title,
            location: application.job.location,
            employer: {
              id: application.job.employer.id,
              fullName: application.job.employer.fullName,
              companyName: application.job.employer.companyName,
            },
          }
        : undefined,
    };
  }
}
