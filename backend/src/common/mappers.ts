import { ApplicationStatus, JobStatus, NotificationType, UserRole as DbUserRole } from '@prisma/client';
import { UserRole } from './enums/role.enum';

export function toDbUserRole(role: UserRole): DbUserRole {
  switch (role) {
    case UserRole.JobSeeker:
      return DbUserRole.JOB_SEEKER;
    case UserRole.Employer:
      return DbUserRole.EMPLOYER;
    case UserRole.Admin:
      return DbUserRole.ADMIN;
  }
}

export function fromDbUserRole(role: DbUserRole): UserRole {
  switch (role) {
    case DbUserRole.JOB_SEEKER:
      return UserRole.JobSeeker;
    case DbUserRole.EMPLOYER:
      return UserRole.Employer;
    case DbUserRole.ADMIN:
      return UserRole.Admin;
  }
}

export function toDbJobStatus(status: string): JobStatus {
  switch (status.toLowerCase()) {
    case 'draft':
      return JobStatus.DRAFT;
    case 'pending_review':
    case 'pending-review':
    case 'pending':
      return JobStatus.PENDING_REVIEW;
    case 'published':
      return JobStatus.PUBLISHED;
    case 'closed':
      return JobStatus.CLOSED;
    case 'rejected':
      return JobStatus.REJECTED;
    default:
      return JobStatus.PUBLISHED;
  }
}

export function toDbApplicationStatus(status: string): ApplicationStatus {
  switch (status.toLowerCase()) {
    case 'pending':
      return ApplicationStatus.PENDING;
    case 'shortlisted':
      return ApplicationStatus.SHORTLISTED;
    case 'rejected':
      return ApplicationStatus.REJECTED;
    case 'interview':
      return ApplicationStatus.INTERVIEW;
    case 'hired':
      return ApplicationStatus.HIRED;
    default:
      return ApplicationStatus.PENDING;
  }
}

export function toDbNotificationType(type: string): NotificationType {
  switch (type.toLowerCase()) {
    case 'success':
      return NotificationType.SUCCESS;
    case 'warning':
      return NotificationType.WARNING;
    case 'application':
      return NotificationType.APPLICATION;
    case 'job':
      return NotificationType.JOB;
    case 'chat':
      return NotificationType.CHAT;
    case 'system':
      return NotificationType.SYSTEM;
    default:
      return NotificationType.INFO;
  }
}