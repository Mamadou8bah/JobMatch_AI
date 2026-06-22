import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EmployerService {
  constructor(private readonly database: DatabaseService) {}

  async analytics(employerId: string) {
    const jobs = await this.database.job.findMany({
      where: { employerId },
      select: { id: true, title: true, status: true, views: true, createdAt: true },
    });

    const jobIds = jobs.map((j) => j.id);

    const applications = jobIds.length
      ? await this.database.application.findMany({
          where: { jobId: { in: jobIds } },
          include: {
            applicant: { select: { id: true, fullName: true } },
            job: { select: { id: true, title: true } },
          },
          orderBy: [{ matchScore: 'desc' }, { createdAt: 'desc' }],
        })
      : [];

    const statusCounts = {
      pending: 0,
      shortlisted: 0,
      interview: 0,
      rejected: 0,
      hired: 0,
    };

    let totalMatchScore = 0;
    for (const app of applications) {
      const key = app.status.toLowerCase() as keyof typeof statusCounts;
      if (key in statusCounts) statusCounts[key]++;
      totalMatchScore += app.matchScore;
    }

    const jobStatusCounts = {
      published: jobs.filter((j) => j.status === 'PUBLISHED').length,
      pendingReview: jobs.filter((j) => j.status === 'PENDING_REVIEW').length,
      draft: jobs.filter((j) => j.status === 'DRAFT').length,
      closed: jobs.filter((j) => j.status === 'CLOSED').length,
    };

    const applicationsByJob = jobs.map((job) => {
      const jobApps = applications.filter((a) => a.jobId === job.id);
      return {
        jobId: job.id,
        title: job.title,
        status: job.status.toLowerCase(),
        views: job.views,
        applicantCount: jobApps.length,
        avgMatchScore: jobApps.length
          ? Math.round(jobApps.reduce((sum, a) => sum + a.matchScore, 0) / jobApps.length)
          : 0,
      };
    });

    return {
      jobs: {
        total: jobs.length,
        ...jobStatusCounts,
      },
      applications: {
        total: applications.length,
        byStatus: statusCounts,
        avgMatchScore: applications.length ? Math.round(totalMatchScore / applications.length) : 0,
      },
      funnel: {
        applied: applications.length,
        shortlisted: statusCounts.shortlisted + statusCounts.interview + statusCounts.hired,
        interview: statusCounts.interview + statusCounts.hired,
        hired: statusCounts.hired,
      },
      applicationsByJob: applicationsByJob.sort((a, b) => b.applicantCount - a.applicantCount),
      recentApplications: applications.slice(0, 10).map((app) => ({
        id: app.id,
        status: app.status.toLowerCase(),
        matchScore: app.matchScore,
        createdAt: app.createdAt,
        applicant: app.applicant,
        job: app.job,
      })),
    };
  }
}
