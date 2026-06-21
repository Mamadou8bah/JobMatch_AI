import { Injectable, NotFoundException } from '@nestjs/common';
import { toDbNotificationType } from '../common/mappers';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../mail/email.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly store: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  async createNotification(
    userId: string,
    input: {
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'application' | 'job' | 'chat' | 'system';
    },
  ) {
    const notification = await this.store.notification.create({
      data: {
        userId,
        title: input.title,
        message: input.message,
        type: toDbNotificationType(input.type),
      },
    });

    const user = await this.store.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (user && user.email) {
      try {
        await this.emailService.sendMail(
          user.email,
          input.title,
          `Hello ${user.fullName},\n\n${input.message}\n\nBest regards,\nJobMatch AI Team`,
        );
      } catch (error) {
        console.error(`Failed to send email notification to ${user.email}:`, error);
      }
    }

    return notification;
  }

  async listForUser(userId: string) {
    return this.store.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.store.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.store.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}
