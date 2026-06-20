import { Injectable, NotFoundException } from '@nestjs/common';
import { toDbNotificationType } from '../common/mappers';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly store: DatabaseService) {}

  async createNotification(
    userId: string,
    input: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'application' | 'job' },
  ) {
    return this.store.notification.create({
      data: {
        userId,
        title: input.title,
        message: input.message,
        type: toDbNotificationType(input.type),
      },
    });
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
