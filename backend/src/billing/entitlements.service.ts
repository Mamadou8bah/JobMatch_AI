import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionPlan, UserRole as DbUserRole } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import {
  BILLING_FEATURES,
  BillingFeature,
  FREE_COACH_MESSAGES_PER_DAY,
  FREE_EMPLOYER_ACTIVE_JOBS,
  FREE_PROVIDER_COURSES,
} from './billing.constants';

export class PremiumRequiredException extends HttpException {
  constructor(message: string, feature?: string) {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        error: 'PremiumRequired',
        message,
        feature: feature || null,
        upgradePath: '/billing',
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

@Injectable()
export class EntitlementsService {
  constructor(private readonly store: DatabaseService) {}

  async getUserOrThrow(userId: string) {
    const user = await this.store.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async isPremium(userId: string): Promise<boolean> {
    const user = await this.getUserOrThrow(userId);
    if (user.role === 'ADMIN') return true;
    if (user.plan !== SubscriptionPlan.PREMIUM) return false;
    if (user.planExpiresAt && user.planExpiresAt.getTime() < Date.now()) {
      await this.store.user.update({
        where: { id: userId },
        data: { plan: SubscriptionPlan.FREE, planExpiresAt: null },
      });
      return false;
    }
    return true;
  }

  async getEntitlements(userId: string) {
    const user = await this.getUserOrThrow(userId);
    const premium = await this.isPremium(userId);
    const coachUsedToday = await this.getUsageCount(
      userId,
      BILLING_FEATURES.COACH_CHAT,
      this.dayKey(),
    );
    const activeJobs =
      user.role === 'EMPLOYER'
        ? await this.store.job.count({
            where: {
              employerId: userId,
              status: { in: ['PUBLISHED', 'PENDING_REVIEW', 'DRAFT'] },
            },
          })
        : 0;
    const providerCourses =
      user.role === 'TRAINING_PROVIDER'
        ? await this.store.trainingCourse.count({
            where: { ownerId: userId, status: 'ACTIVE' },
          })
        : 0;

    return {
      plan: premium ? 'premium' : 'free',
      planExpiresAt: user.planExpiresAt,
      role: user.role,
      features: {
        coachChat: {
          allowed: premium || coachUsedToday < FREE_COACH_MESSAGES_PER_DAY,
          premiumOnly: false,
          used: coachUsedToday,
          limit: premium ? null : FREE_COACH_MESSAGES_PER_DAY,
        },
        learningRoadmap: { allowed: premium, premiumOnly: true },
        trainingRecommendations: { allowed: premium, premiumOnly: true },
        advancedMatch: { allowed: premium, premiumOnly: true },
        employerRanking: {
          allowed: user.role === 'EMPLOYER' || user.role === 'ADMIN',
          premiumOnly: true,
          fullAccess: premium || user.role === 'ADMIN',
        },
        employerAnalytics: {
          allowed: premium || user.role === 'ADMIN',
          premiumOnly: true,
        },
        jobPosts: {
          used: activeJobs,
          limit: premium || user.role === 'ADMIN' ? null : FREE_EMPLOYER_ACTIVE_JOBS,
          allowed:
            user.role !== 'EMPLOYER' ||
            premium ||
            activeJobs < FREE_EMPLOYER_ACTIVE_JOBS,
        },
        providerCourses: {
          used: providerCourses,
          limit: premium || user.role === 'ADMIN' ? null : FREE_PROVIDER_COURSES,
          allowed:
            user.role !== 'TRAINING_PROVIDER' ||
            premium ||
            providerCourses < FREE_PROVIDER_COURSES,
        },
      },
    };
  }

  async assertPremium(userId: string, feature: BillingFeature, message?: string) {
    if (await this.isPremium(userId)) return;
    throw new PremiumRequiredException(
      message ||
        `This feature requires JobMatch Premium. Upgrade to continue.`,
      feature,
    );
  }

  async assertCanUseCoach(userId: string) {
    if (await this.isPremium(userId)) return;
    const used = await this.getUsageCount(userId, BILLING_FEATURES.COACH_CHAT, this.dayKey());
    if (used >= FREE_COACH_MESSAGES_PER_DAY) {
      throw new PremiumRequiredException(
        `Free plan includes ${FREE_COACH_MESSAGES_PER_DAY} AI coach messages per day. Upgrade to Premium for unlimited guidance.`,
        BILLING_FEATURES.COACH_CHAT,
      );
    }
  }

  async consumeCoachMessage(userId: string) {
    if (await this.isPremium(userId)) return;
    await this.incrementUsage(userId, BILLING_FEATURES.COACH_CHAT, this.dayKey());
  }

  async assertCanPostJob(employerId: string, role: DbUserRole | string) {
    if (role === 'ADMIN' || role === 'admin') return;
    if (await this.isPremium(employerId)) return;

    const activeJobs = await this.store.job.count({
      where: {
        employerId,
        status: { in: ['PUBLISHED', 'PENDING_REVIEW', 'DRAFT'] },
      },
    });

    if (activeJobs >= FREE_EMPLOYER_ACTIVE_JOBS) {
      throw new PremiumRequiredException(
        `Free employers can have up to ${FREE_EMPLOYER_ACTIVE_JOBS} active jobs. Upgrade to Premium for unlimited postings.`,
        'job_posts',
      );
    }
  }

  async assertCanUseAnalytics(employerId: string) {
    if (await this.isPremium(employerId)) return;
    throw new PremiumRequiredException(
      'Recruitment analytics are a Premium feature for employers.',
      BILLING_FEATURES.EMPLOYER_ANALYTICS,
    );
  }

  async assertCanCreateCourse(providerId: string, role: DbUserRole | string) {
    if (role === 'ADMIN' || role === 'admin') return;
    if (await this.isPremium(providerId)) return;

    const count = await this.store.trainingCourse.count({
      where: { ownerId: providerId, status: 'ACTIVE' },
    });

    if (count >= FREE_PROVIDER_COURSES) {
      throw new PremiumRequiredException(
        `Free training providers can list up to ${FREE_PROVIDER_COURSES} active courses. Upgrade for unlimited listings and featured placement.`,
        'provider_courses',
      );
    }
  }

  async redactMatchForPlan(userId: string, match: any) {
    if (!match) return match;
    if (await this.isPremium(userId)) return match;

    const score = Number(match.score ?? 0);
    const band = score >= 80 ? 'strong' : score >= 55 ? 'good' : 'fair';

    return {
      matchBand: band,
      premiumRequired: true,
      matchedSkills: (match.matchedSkills || []).slice(0, 2),
      missingSkills: [],
      reasons: ['Upgrade to Premium for your exact AI match score and skill gap details.'],
    };
  }

  private dayKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }

  private async getUsageCount(userId: string, feature: string, periodKey: string) {
    const row = await this.store.usageCounter.findUnique({
      where: { userId_feature_periodKey: { userId, feature, periodKey } },
    });
    return row?.count ?? 0;
  }

  private async incrementUsage(userId: string, feature: string, periodKey: string) {
    await this.store.usageCounter.upsert({
      where: { userId_feature_periodKey: { userId, feature, periodKey } },
      create: { userId, feature, periodKey, count: 1 },
      update: { count: { increment: 1 } },
    });
  }
}
