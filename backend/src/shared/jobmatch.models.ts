import { UserRole } from '../common/enums/role.enum';

export interface RegisteredUser {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills: string[];
  experienceYears?: number;
  companyName?: string;
  companyDescription?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobPosting {
  id: string;
  employerId: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  requiredSkills: string[];
  salaryMin?: number;
  salaryMax?: number;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  applicantId: string;
  employerId: string;
  coverLetter?: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'interview' | 'hired';
  matchScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'application' | 'job';
  read: boolean;
  createdAt: string;
}