import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendMail(to: string, subject: string, text: string) {
    const host = process.env.SMTP_HOST;

    if (!host) {
      this.logger.log(`Email not sent (SMTP not configured) to=${to} subject=${subject}`);
      return { queued: true };
    }

    const transport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });

    return transport.sendMail({
      from: process.env.SMTP_FROM ?? 'JobMatch AI <no-reply@jobmatch.ai>',
      to,
      subject,
      text,
    });
  }
}