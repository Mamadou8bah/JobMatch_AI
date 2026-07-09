import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

type PaymentIntentResult = {
  intent_secret?: string;
  payment_link?: string;
  amount?: number;
  currency?: string;
  status?: string;
  [key: string]: unknown;
};

@Injectable()
export class ModemPayService {
  private readonly logger = new Logger(ModemPayService.name);
  private readonly baseUrl = process.env.MODEMPAY_API_BASE || 'https://api.modempay.com/v1';

  isConfigured() {
    return Boolean(process.env.MODEMPAY_SECRET_KEY);
  }

  /** JobMatch uses per-checkout callback_url — no ModemPay dashboard webhook required. */
  resolveCallbackUrl() {
    const explicit =
      process.env.MODEMPAY_CALLBACK_URL || process.env.MODEMPAY_WEBHOOK_URL;
    if (explicit) return explicit.replace(/\/$/, '');

    const apiBase =
      process.env.API_PUBLIC_URL ||
      process.env.BACKEND_URL ||
      'https://jobmatchgambia.onrender.com';
    return `${apiBase.replace(/\/$/, '')}/api/billing/webhook/modempay`;
  }

  private assertConfigured() {
    if (!this.isConfigured()) {
      throw new BadRequestException(
        'ModemPay is not configured. Set MODEMPAY_SECRET_KEY (live API key from Developers → API Keys).',
      );
    }
  }

  async createPaymentIntent(input: {
    amount: number;
    currency?: string;
    title: string;
    description: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string | null;
    returnUrl: string;
    cancelUrl: string;
    callbackUrl?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentIntentResult> {
    this.assertConfigured();

    const body = {
      data: {
        amount: input.amount,
        currency: input.currency || 'GMD',
        title: input.title,
        description: input.description,
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
        ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
        metadata: input.metadata || {},
        customer_email: input.customerEmail,
        customer_name: input.customerName,
        ...(input.customerPhone ? { customer_phone: input.customerPhone } : {}),
        from_sdk: false,
      },
    };

    const res = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MODEMPAY_SECRET_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as {
      status?: boolean;
      message?: string;
      data?: PaymentIntentResult;
    };

    if (!res.ok || json.status === false) {
      this.logger.error(`ModemPay payment intent failed: ${JSON.stringify(json)}`);
      throw new BadRequestException(json.message || 'Failed to create ModemPay checkout');
    }

    return json.data || (json as PaymentIntentResult);
  }

  verifyWebhookSignature(rawBody: string | Buffer, signature?: string) {
    if (!signature) return false;

    const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const secrets = [
      // Per-payment callback_url events are signed with the API secret key
      process.env.MODEMPAY_SECRET_KEY,
      process.env.MODEMPAY_WEBHOOK_SECRET,
      process.env.MODEM_PAY_SECRET_HASH,
    ].filter(Boolean) as string[];

    if (!secrets.length) {
      this.logger.warn('No ModemPay webhook secrets set — skipping signature verification');
      return true;
    }

    return secrets.some((secret) => this.matchesHmac(payload, signature, secret));
  }

  private matchesHmac(payload: string, signature: string, secret: string) {
    const computed = createHmac('sha512', secret).update(payload).digest('hex');
    if (computed.length !== signature.length) return false;
    try {
      return timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}
