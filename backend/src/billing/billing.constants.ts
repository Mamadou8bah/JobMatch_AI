import { BillingInterval, UserRole } from '@prisma/client';

export const BILLING_FEATURES = {
  COACH_CHAT: 'coach_chat',
  LEARNING_ROADMAP: 'learning_roadmap',
  TRAINING_RECS: 'training_recommendations',
  ADVANCED_MATCH: 'advanced_match',
  EMPLOYER_RANKING: 'employer_ranking',
  EMPLOYER_ANALYTICS: 'employer_analytics',
} as const;

export type BillingFeature = (typeof BILLING_FEATURES)[keyof typeof BILLING_FEATURES];

/** Free-tier daily coach messages before upgrade is required. */
export const FREE_COACH_MESSAGES_PER_DAY = 5;

/** Active published/pending jobs free employers may keep open. */
export const FREE_EMPLOYER_ACTIVE_JOBS = 2;

/** Free employers see only the top N ranked candidates. */
export const FREE_EMPLOYER_RANKING_LIMIT = 3;

/** Free training providers may list this many active courses. */
export const FREE_PROVIDER_COURSES = 2;

export const PLAN_PRICES_GMD: Record<
  'job_seeker' | 'employer' | 'training_provider',
  Record<'monthly' | 'yearly', number>
> = {
  job_seeker: {
    monthly: 150,
    yearly: 1500,
  },
  employer: {
    monthly: 500,
    yearly: 5000,
  },
  training_provider: {
    monthly: 300,
    yearly: 3000,
  },
};

export type PlanAudience = 'job_seeker' | 'employer' | 'training_provider';

export function planAudienceForRole(role: UserRole | string): PlanAudience | null {
  const normalized = String(role).toLowerCase().replace('job_seeker', 'job_seeker');
  if (normalized === 'job_seeker') return 'job_seeker';
  if (normalized === 'employer') return 'employer';
  if (normalized === 'training_provider') return 'training_provider';
  return null;
}

export function priceFor(audience: PlanAudience, interval: BillingInterval | 'monthly' | 'yearly') {
  const key = String(interval).toLowerCase() === 'yearly' ? 'yearly' : 'monthly';
  return PLAN_PRICES_GMD[audience][key];
}
