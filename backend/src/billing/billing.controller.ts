import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillingService } from './billing.service';
import { ModemPayService } from './modempay.service';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly modemPay: ModemPayService,
  ) {}

  @Get('plans')
  getPlans() {
    return this.billingService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getStatus(@Req() request: Request & { user: { sub: string } }) {
    return this.billingService.getStatus(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(
    @Req() request: Request & { user: { sub: string } },
    @Body()
    body: {
      interval?: 'monthly' | 'yearly';
      successUrl?: string;
      cancelUrl?: string;
    },
  ) {
    return this.billingService.startCheckout(request.user.sub, body || {});
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  confirm(
    @Req() request: Request & { user: { sub: string } },
    @Body() body: { paymentIntentId?: string },
  ) {
    return this.billingService.confirmCheckout(request.user.sub, body?.paymentIntentId);
  }

  @Post('webhook/modempay')
  async modemPayWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-modem-signature') signature: string,
    @Body() body: { event?: string; payload?: Record<string, unknown> },
  ) {
    const raw =
      (request as RawBodyRequest<Request>).rawBody?.toString('utf8') ||
      JSON.stringify(body);

    if (!this.modemPay.verifyWebhookSignature(raw, signature)) {
      return { received: false, error: 'Invalid signature' };
    }

    return this.billingService.handleWebhook(body);
  }
}
