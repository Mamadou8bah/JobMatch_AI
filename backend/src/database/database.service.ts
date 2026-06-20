import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from './prisma.service';

@Injectable()
export class DatabaseService extends PrismaService {
  createId() {
    return randomUUID();
  }

  now() {
    return new Date();
  }

  async seedAdminIfNeeded() {
    const existingAdmin = await this.user.findFirst({
      where: { email: 'admin@jobmatch.ai' },
    });

    if (existingAdmin) {
      return existingAdmin;
    }

    return this.user.create({
      data: {
        id: this.createId(),
        email: 'admin@jobmatch.ai',
        passwordHash: '$2a$10$adminplaceholderhash',
        role: 'ADMIN',
        fullName: 'System Admin',
        skills: [],
        approved: true,
        emailVerified: true,
      },
    });
  }

  toJson(value: any): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
  }
}
