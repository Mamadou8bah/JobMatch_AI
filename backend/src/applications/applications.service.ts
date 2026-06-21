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
    return this.store.application.findMany({
      where: { applicantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listJobApplications(jobId: string, requesterId: string, role: UserRole) {
    const job = await this.jobsService.getJobById(jobId);

    if (role !== UserRole.Admin && job.employer.id !== requesterId) {
      throw new ForbiddenException('You can only view applicants for your own jobs');
    }

    return this.store.application.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });
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
    });

    await this.notificationsService.createNotification(application.applicantId, {
      title: 'Application status updated',
      message: `Your application for ${job.title} is now ${dto.status}.`,
      type: 'application',
    });

    return updated;
  }
}
