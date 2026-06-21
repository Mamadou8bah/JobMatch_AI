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
import { UserRole } from '../common/enums/role.enum';
import { AiConnectionService } from '../ai-connection/ai-connection.service';
import { DatabaseService } from '../database/database.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly store: DatabaseService,
    private readonly aiConnectionService: AiConnectionService,
  ) {}

  async listUsers() {
    const users = await this.store.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
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
    const user = await this.store.user.findUnique({
      where: { id: currentUserId },
    });
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
    const parsed = await this.aiConnectionService.parseResumeFile({
      fileName: file.originalname,
      mimeType: file.mimetype,
      contentBase64: file.buffer.toString('base64'),
    });
    const uploadDirectory =
      process.env.CV_UPLOAD_DIR ?? join(process.cwd(), 'uploads', 'cvs');
    await mkdir(uploadDirectory, { recursive: true });

    const extension =
      extname(file.originalname) || this.extensionFromMimeType(file.mimetype);
    const storedFileName = `${currentUserId}-${randomUUID()}${extension}`;
    const storedPath = join(uploadDirectory, storedFileName);
    await writeFile(storedPath, file.buffer);

    const existingUser = await this.store.user.findUnique({
      where: { id: currentUserId },
    });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const mergedSkills = Array.from(
      new Set([...(existingUser.skills ?? []), ...parsed.skills]),
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
    };
  }

  assertAdmin(role: UserRole) {
    if (role !== UserRole.Admin) {
      throw new ForbiddenException('Admin access required');
    }
  }

  sanitizeUser(user: DbUser) {
    const {
      passwordHash,
      emailVerificationToken,
      passwordResetToken,
      ...safeUser
    } = user;
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
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.toLowerCase().endsWith('.docx')
    ) {
      return;
    }

    if (
      file.mimetype === 'text/plain' ||
      file.originalname.toLowerCase().endsWith('.txt')
    ) {
      return;
    }

    throw new UnsupportedMediaTypeException(
      'CV must be a PDF, DOCX, or plain text file',
    );
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
