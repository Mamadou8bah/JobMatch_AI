import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { User as DbUser } from '@prisma/client';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { fromDbUserRole } from '../common/mappers';
import { mergeSkills } from '../common/merge-skills';
import { UserRole } from '../common/enums/role.enum';
import { AiEngineClient } from '../ai-connection/ai-engine.client';
import { DatabaseService } from '../database/database.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { parseCvLocally } from './cv-parser.fallback';

@Injectable()
export class UsersService {
  constructor(
    private readonly store: DatabaseService,
    private readonly aiEngineClient: AiEngineClient,
  ) {}

  async listUsers() {
    const users = await this.store.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map((user) => this.sanitizeUser(user));
  }

  async getUserById(userId: string) {
    const user = await this.store.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(currentUserId: string, dto: UpdateProfileDto) {
    const user = await this.store.user.findUnique({ where: { id: currentUserId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.store.user.update({
      where: { id: currentUserId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        location: dto.location,
        bio: dto.bio,
        skills: dto.skills,
        experienceYears: dto.experienceYears,
        companyName: dto.companyName,
        companyDescription: dto.companyDescription,
      },
    });

    return this.sanitizeUser(updatedUser);
  }

  updateSkills(currentUserId: string, skills: string[]) {
    return this.updateProfile(currentUserId, { skills });
  }

  async uploadCv(currentUserId: string, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('CV file is required');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('CV file must be 5MB or smaller');
    }

    this.assertSupportedCvFile(file);

    const { parsed, parsedWithAi } = await this.parseUploadedCv(file);

    const uploadDirectory = process.env.CV_UPLOAD_DIR ?? join(process.cwd(), 'uploads', 'cvs');
    await mkdir(uploadDirectory, { recursive: true });

    const extension = extname(file.originalname) || this.extensionFromMimeType(file.mimetype);
    const storedFileName = `${currentUserId}-${randomUUID()}${extension}`;
    const storedPath = join(uploadDirectory, storedFileName);
    await writeFile(storedPath, file.buffer);

    const existingUser = await this.store.user.findUnique({ where: { id: currentUserId } });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const mergedSkills = mergeSkills(existingUser.skills, parsed.skills);
    const addedSkills = mergedSkills.filter(
      (skill) => !(existingUser.skills ?? []).some((existing) => existing.toLowerCase() === skill.toLowerCase()),
    );
    const updatedUser = await this.store.user.update({
      where: { id: currentUserId },
      data: {
        cvFileName: file.originalname,
        cvFilePath: storedPath,
        cvMimeType: file.mimetype,
        cvText: parsed.rawText ?? null,
        skills: mergedSkills,
      },
    });

    return {
      user: this.sanitizeUser(updatedUser),
      parsed,
      parsedWithAi,
      addedSkills,
    };
  }

  private async parseUploadedCv(file: Express.Multer.File) {
    try {
      const parsed = await this.aiEngineClient.parseResumeFile({
        fileName: file.originalname,
        mimeType: file.mimetype,
        contentBase64: file.buffer.toString('base64'),
      });

      return {
        parsed,
        parsedWithAi: parsed.parsedWithAi !== false,
      };
    } catch {
      return {
        parsed: await parseCvLocally(file),
        parsedWithAi: false,
      };
    }
  }

  assertAdmin(role: UserRole) {
    if (role !== UserRole.Admin) {
      throw new ForbiddenException('Admin access required');
    }
  }

  sanitizeUser(user: DbUser) {
    const { passwordHash, emailVerificationToken, passwordResetToken, ...safeUser } = user;
    return {
      ...safeUser,
      role: fromDbUserRole(user.role),
    };
  }

  private assertSupportedCvFile(file: Express.Multer.File) {
    if (file.mimetype === 'application/pdf') {
      return;
    }

    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.toLowerCase().endsWith('.docx')
    ) {
      return;
    }

    if (file.mimetype === 'text/plain' || file.originalname.toLowerCase().endsWith('.txt')) {
      return;
    }

    throw new UnsupportedMediaTypeException('CV must be a PDF, DOCX, or plain text file');
  }

  private extensionFromMimeType(mimeType: string) {
    switch (mimeType) {
      case 'application/pdf':
        return '.pdf';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '.docx';
      case 'text/plain':
        return '.txt';
      default:
        return '';
    }
  }
}
