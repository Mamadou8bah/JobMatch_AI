import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  BillingInterval,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { planAudienceForRole, priceFor } from './billing.constants';
import { EntitlementsService } from './entitlements.service';
import { ModemPayService } from './modempay.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly store: DatabaseService,
    private readonly modemPay: ModemPayService,
    private readonly entitlements: EntitlementsService,
  ) {}

  getPlans() {
    return {
      currency: 'GMD',
      intervals: ['monthly', 'yearly'],
      plans: {
        job_seeker: {
          name: 'Seeker Premium',
          monthly: priceFor('job_seeker', 'monthly'),
          yearly: priceFor('job_seeker', 'yearly'),
          features: [
            'Unlimited AI Career Coach',
            'Personalized learning roadmap',
            'Exact AI match scores & skill gaps',
            'AI course recommendations',
          ],
        },
        employer: {
          name: 'Employer Premium',
          monthly: priceFor('employer', 'monthly'),
          yearly: priceFor('employer', 'yearly'),
          features: [
            'Unlimited job postings',
            'Full AI candidate ranking',
            'Applicant match percentages',
            'Recruitment analytics',
            'Priority visibility for job posts',
          ],
        },
        training_provider: {
          name: 'Provider Premium',
          monthly: priceFor('training_provider', 'monthly'),
          yearly: priceFor('training_provider', 'yearly'),
          features: [
            'Unlimited course listings',
            'Featured course placement',
            'Better discoverability',
            'Promotional opportunities',
          ],
        },
      },
    };
  }

  async getStatus(userId: string) {
    const entitlements = await this.entitlements.getEntitlements(userId);
    const subscription = await this.store.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'PAST_DUE'] } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...entitlements,
      subscription: subscription
        ? {
            id: subscription.id,
            plan: subscription.plan.toLowerCase(),
            status: subscription.status.toLowerCase(),
            interval: subscription.interval.toLowerCase(),
            amountGmd: subscription.amountGmd,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : null,
      modemPayConfigured: this.modemPay.isConfigured(),
    };
  }

  async startCheckout(
    userId: string,
    body: { interval?: 'monthly' | 'yearly'; successUrl?: string; cancelUrl?: string },
  ) {
    const user = await this.entitlements.getUserOrThrow(userId);
    if (user.role === 'ADMIN') {
      throw new BadRequestException('Admins do not need a Premium subscription');
    }

    const audience = planAudienceForRole(user.role);
    if (!audience) {
      throw new BadRequestException('Premium checkout is only for job seekers, employers, and training providers');
    }

    const interval: BillingInterval =
      body.interval === 'yearly' ? BillingInterval.YEARLY : BillingInterval.MONTHLY;
    const amount = priceFor(audience, interval);
    const frontendBase =
      process.env.FRONTEND_URL || process.env.APP_URL || 'https://jobmatchgambia.vercel.app';

    const periodDays = interval === BillingInterval.YEARLY ? 365 : 30;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

    const intent = await this.modemPay.createPaymentIntent({
      amount,
      currency: 'GMD',
      title: `JobMatch ${
        audience === 'employer'
          ? 'Employer'
          : audience === 'training_provider'
            ? 'Provider'
            : 'Seeker'
      } Premium`,
      description: `${interval === BillingInterval.YEARLY ? 'Yearly' : 'Monthly'} Premium — ${amount} GMD`,
      customerEmail: user.email,
      customerName: user.fullName,
      customerPhone: user.phone,
      returnUrl:
        body.successUrl ||
        `${frontendBase}/${
          audience === 'employer'
            ? 'employer'
            : audience === 'training_provider'
              ? 'provider'
              : 'seeker'
        }/billing?status=success`,
      cancelUrl:
        body.cancelUrl ||
        `${frontendBase}/${
          audience === 'employer'
            ? 'employer'
            : audience === 'training_provider'
              ? 'provider'
              : 'seeker'
        }/billing?status=cancelled`,
      callbackUrl: this.modemPay.resolveCallbackUrl(),
      metadata: {
        userId: user.id,
        audience,
        interval: interval.toLowerCase(),
        plan: 'premium',
      },
    });

    const paymentIntentId =
      (intent.intent_secret as string) ||
      (intent.id as string) ||
      `pending-${user.id}-${Date.now()}`;

    const subscription = await this.store.subscription.create({
      data: {
        userId: user.id,
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.PAST_DUE,
        interval,
        amountGmd: amount,
        currency: 'GMD',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        modemPaymentIntentId: paymentIntentId,
        modemPaymentLink: (intent.payment_link as string) || null,
      },
    });

    return {
      checkoutUrl: intent.payment_link,
      paymentIntentId,
      amountGmd: amount,
      currency: 'GMD',
      interval: interval.toLowerCase(),
      subscriptionId: subscription.id,
    };
  }

  async activatePremium(userId: string, opts: {
    paymentIntentId?: string;
    paymentReference?: string;
    interval?: BillingInterval;
    amountGmd?: number;
  }) {
    const user = await this.entitlements.getUserOrThrow(userId);
    const audience = planAudienceForRole(user.role);
    if (!audience) return;

    const interval = opts.interval || BillingInterval.MONTHLY;
    const amount = opts.amountGmd ?? priceFor(audience, interval);
    const now = new Date();
    const days = interval === BillingInterval.YEARLY ? 365 : 30;
    const periodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    await this.store.user.update({
      where: { id: userId },
      data: {
        plan: SubscriptionPlan.PREMIUM,
        planExpiresAt: periodEnd,
      },
    });

    if (opts.paymentIntentId) {
      const updated = await this.store.subscription.updateMany({
        where: { modemPaymentIntentId: opts.paymentIntentId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          lastPaymentReference: opts.paymentReference,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
      if (updated.count === 0) {
        await this.store.subscription.create({
          data: {
            userId,
            plan: SubscriptionPlan.PREMIUM,
            status: SubscriptionStatus.ACTIVE,
            interval,
            amountGmd: amount,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            modemPaymentIntentId: opts.paymentIntentId,
            lastPaymentReference: opts.paymentReference,
          },
        });
      }
    } else {
      await this.store.subscription.create({
        data: {
          userId,
          plan: SubscriptionPlan.PREMIUM,
          status: SubscriptionStatus.ACTIVE,
          interval,
          amountGmd: amount,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          lastPaymentReference: opts.paymentReference,
        },
      });
    }

    this.logger.log(`Activated Premium for user ${userId} until ${periodEnd.toISOString()}`);
  }

  async handleWebhook(event: { event?: string; payload?: Record<string, unknown> }) {
    const type = event?.event;
    const payload = event?.payload || {};

    if (type !== 'charge.succeeded' && type !== 'paymentrequest.success') {
      return { received: true, handled: false };
    }

    const metadata = (payload.metadata || {}) as Record<string, string>;
    let userId: string | undefined = metadata.userId;

    if (!userId && payload.customer_email) {
      const user = await this.store.user.findUnique({
        where: { email: String(payload.customer_email) },
      });
      userId = user?.id;
    }

    const paymentIntentId =
      (payload.payment_intent_id as string) ||
      (payload.intent_secret as string) ||
      (payload.id as string);

    if (!userId && paymentIntentId) {
      const sub = await this.store.subscription.findFirst({
        where: { modemPaymentIntentId: paymentIntentId },
      });
      userId = sub?.userId;
    }

    if (!userId) {
      this.logger.warn(`ModemPay webhook missing user mapping: ${JSON.stringify(payload)}`);
      return { received: true, handled: false };
    }

    const intervalMeta = String(metadata.interval || '').toLowerCase();
    await this.activatePremium(userId, {
      paymentIntentId,
      paymentReference: (payload.transaction_reference as string) || undefined,
      interval: intervalMeta === 'yearly' ? BillingInterval.YEARLY : BillingInterval.MONTHLY,
      amountGmd: Number(payload.amount) || undefined,
    });

    return { received: true, handled: true };
  }

  async confirmCheckout(userId: string, paymentIntentId?: string) {
    if (!paymentIntentId) {
      throw new BadRequestException('paymentIntentId is required');
    }

    const sub = await this.store.subscription.findFirst({
      where: { userId, modemPaymentIntentId: paymentIntentId },
    });
    if (!sub) throw new NotFoundException('Checkout session not found');

    // Soft confirm for test flows when webhook is delayed
    if (process.env.MODEMPAY_ALLOW_CLIENT_CONFIRM === 'true') {
      await this.activatePremium(userId, {
        paymentIntentId,
        interval: sub.interval,
        amountGmd: sub.amountGmd,
      });
    }

    return this.getStatus(userId);
  }
}
