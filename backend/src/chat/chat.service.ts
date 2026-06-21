import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '../common/enums/role.enum';
import { DatabaseService } from '../database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateChatThreadDto } from './dto/create-chat-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly database: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createThread(currentUserId: string, role: UserRole, dto: CreateChatThreadDto) {
    const participant = await this.database.user.findUnique({ where: { id: dto.participantId } });
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const employerId = role === UserRole.Employer ? currentUserId : dto.participantId;
    const applicantId = role === UserRole.JobSeeker ? currentUserId : dto.participantId;

    if (role === UserRole.Admin) {
      throw new ForbiddenException('Admins cannot create candidate chat threads');
    }

    if (employerId === applicantId) {
      throw new ForbiddenException('Chat requires an employer and a job seeker');
    }

    if (dto.jobId) {
      const job = await this.database.job.findUnique({ where: { id: dto.jobId } });
      if (!job) {
        throw new NotFoundException('Job not found');
      }
      if (job.employerId !== employerId) {
        throw new ForbiddenException('Only the job employer can chat about this job');
      }
    }

    const existingThread = await this.database.chatThread.findFirst({
      where: { employerId, applicantId, jobId: dto.jobId ?? null },
      include: this.threadInclude(),
    });
    if (existingThread) {
      return existingThread;
    }

    return this.database.chatThread.create({
      data: {
        employerId,
        applicantId,
        jobId: dto.jobId,
      },
      include: this.threadInclude(),
    });
  }

  listThreads(currentUserId: string) {
    return this.database.chatThread.findMany({
      where: {
        OR: [{ employerId: currentUserId }, { applicantId: currentUserId }],
      },
      include: this.threadInclude(),
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async listMessages(threadId: string, currentUserId: string) {
    await this.ensureThreadAccess(threadId, currentUserId);

    return this.database.chatMessage.findMany({
      where: { threadId },
      include: { sender: { select: { id: true, fullName: true, role: true } }, reads: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(threadId: string, senderId: string, dto: SendMessageDto) {
    const thread = await this.ensureThreadAccess(threadId, senderId);

    const message = await this.database.chatMessage.create({
      data: {
        threadId,
        senderId,
        content: dto.content.trim(),
      },
      include: { sender: { select: { id: true, fullName: true, role: true } } },
    });

    await this.database.chatThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() },
    });

    const recipientId = thread.employerId === senderId ? thread.applicantId : thread.employerId;
    const briefContent = message.content.length > 60 ? message.content.substring(0, 60) + '...' : message.content;
    await this.notificationsService.createNotification(recipientId, {
      title: 'New chat message',
      message: `${message.sender.fullName}: ${briefContent}`,
      type: 'chat',
    });

    return message;
  }

  async markThreadRead(threadId: string, userId: string) {
    await this.ensureThreadAccess(threadId, userId);

    const unreadMessages = await this.database.chatMessage.findMany({
      where: {
        threadId,
        senderId: { not: userId },
        reads: { none: { userId } },
      },
      select: { id: true },
    });

    await this.database.chatMessageRead.createMany({
      data: unreadMessages.map((message) => ({ messageId: message.id, userId })),
      skipDuplicates: true,
    });

    return { markedRead: unreadMessages.length };
  }

  private async ensureThreadAccess(threadId: string, userId: string) {
    const thread = await this.database.chatThread.findFirst({
      where: {
        id: threadId,
        OR: [{ employerId: userId }, { applicantId: userId }],
      },
    });

    if (!thread) {
      throw new NotFoundException('Chat thread not found');
    }

    return thread;
  }

  private threadInclude() {
    return {
      employer: { select: { id: true, fullName: true, companyName: true, role: true } },
      applicant: { select: { id: true, fullName: true, role: true } },
      job: { select: { id: true, title: true } },
      messages: { orderBy: { createdAt: 'desc' as const }, take: 1 },
    };
  }
}
