import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { runDatabaseSeed } from '../../prisma/seed-data';
import { PrismaService } from './prisma.service';

@Injectable()
export class DatabaseService extends PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  createId() {
    return randomUUID();
  }

  now() {
    return new Date();
  }

  async onModuleInit() {
    await super.onModuleInit();
    await this.seedOnStartup();
  }

  async seedOnStartup() {
    if (process.env.SEED_ON_STARTUP === 'false') {
      this.logger.log('Database seed skipped (SEED_ON_STARTUP=false)');
      return;
    }

    try {
      const counts = await runDatabaseSeed(this);
      this.logger.log(
        `Database seed ready — ${counts.users} users, ${counts.jobs} jobs, ${counts.applications} applications, ` +
          `${counts.trainingCourses} courses, ${counts.notifications} notifications, ${counts.chatThreads} threads, ` +
          `${counts.chatMessages} messages, ${counts.coachMessages} coach messages, ${counts.auditLogs} audit logs`,
      );
    } catch (error) {
      this.logger.error('Database seed failed', error instanceof Error ? error.stack : error);
    }
  }

  toJson(value: any): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
  }
}
