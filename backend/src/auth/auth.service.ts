import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';
import { UserRole as DbUserRole } from '@prisma/client';
import { fromDbUserRole, toDbUserRole } from '../common/mappers';
import { UserRole } from '../common/enums/role.enum';
import { AuthPayload } from '../common/types/auth-payload.type';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../mail/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly store: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    await this.store.seedAdminIfNeeded();
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existingUser = await this.store.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const verificationToken = randomUUID();
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.store.user.create({
      data: {
        email,
        passwordHash,
        role: toDbUserRole(dto.role),
        fullName: dto.fullName,
        phone: dto.phone,
        location: dto.location,
        skills: [],
        approved: dto.role !== UserRole.Employer,
        emailVerified: false,
        emailVerificationToken: verificationToken,
      },
    });

    await this.emailService.sendMail(
      user.email,
      'Verify your JobMatch AI account',
      `Use this verification token to verify your account: ${verificationToken}`,
    );

    return this.issueTokens(user, verificationToken);
  }

  async login(dto: LoginDto) {
    const user = await this.store.user.findUnique({ where: { email: dto.email.toLowerCase() } });

    if (!user || user.blocked) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.store.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    await this.store.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    if (storedToken.user.blocked) {
      throw new UnauthorizedException('Account is disabled');
    }

    return this.issueTokens(storedToken.user, undefined, payload.jti);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.store.refreshToken.findUnique({ where: { tokenHash } });

    if (storedToken && !storedToken.revokedAt) {
      await this.store.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
    }

    return { message: 'Logged out successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.store.user.findFirst({ where: { emailVerificationToken: token } });

    if (!user) {
      throw new NotFoundException('Verification token not found');
    }

    await this.store.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null },
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.store.user.findUnique({ where: { email: dto.email.toLowerCase() } });

    if (!user) {
      return { message: 'If the email exists, a reset token has been generated' };
    }

    const resetToken = randomUUID();
    await this.store.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken },
    });

    await this.emailService.sendMail(
      user.email,
      'Reset your JobMatch AI password',
      `Use this password reset token to continue: ${resetToken}`,
    );

    return {
      message: 'Password reset token generated',
      resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.store.user.findFirst({ where: { passwordResetToken: dto.token } });

    if (!user) {
      throw new NotFoundException('Reset token not found');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.store.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null },
    });

    return { message: 'Password updated successfully' };
  }

  async me(userId: string) {
    const user = await this.store.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  sanitizeUser(user: {
    id: string;
    email: string;
    role: DbUserRole;
    fullName: string;
    phone: string | null;
    location: string | null;
    bio: string | null;
    skills: string[];
    experienceYears: number | null;
    companyName: string | null;
    companyDescription: string | null;
    approved: boolean;
    blocked: boolean;
    emailVerified: boolean;
    cvFileName: string | null;
    cvFilePath: string | null;
    cvMimeType: string | null;
    cvText: string | null;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: unknown;
  }) {
    const { passwordHash, emailVerificationToken, passwordResetToken, ...safeUser } = user;
    return {
      ...safeUser,
      role: fromDbUserRole(user.role),
    };
  }

  private async issueTokens(
    user: { id: string; email: string; role: DbUserRole },
    verificationToken?: string,
    replacedByToken?: string,
  ) {
    const accessPayload: AuthPayload = {
      sub: user.id,
      email: user.email,
      role: fromDbUserRole(user.role),
      tokenType: 'access',
    };

    const refreshJti = randomUUID();
    const refreshPayload: AuthPayload = {
      sub: user.id,
      email: user.email,
      role: fromDbUserRole(user.role),
      tokenType: 'refresh',
      jti: refreshJti,
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'jobmatch-ai-access-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'jobmatch-ai-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    });

    await this.store.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: this.calculateExpiry(process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'),
        replacedByToken: replacedByToken ?? null,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: await this.me(user.id),
      verificationToken,
    };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<AuthPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'jobmatch-ai-refresh-secret',
      });

      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private calculateExpiry(expression: string) {
    const now = Date.now();
    const match = expression.trim().match(/^(\d+)([mhd])$/i);

    if (!match) {
      return new Date(now + 7 * 24 * 60 * 60 * 1000);
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multiplier = unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
    return new Date(now + amount * multiplier);
  }
}
