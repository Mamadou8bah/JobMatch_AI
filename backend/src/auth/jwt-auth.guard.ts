import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { fromDbUserRole } from '../common/mappers';
import { AuthPayload } from '../common/types/auth-payload.type';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly store: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization as string | undefined;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authorization.slice(7);

    try {
      const payload = await this.jwtService.verifyAsync<AuthPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET ?? 'jobmatch-ai-access-secret',
      });

      if (payload.tokenType && payload.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid access token');
      }

      const user = await this.store.user.findUnique({ where: { id: payload.sub } });

      if (!user || user.blocked) {
        throw new UnauthorizedException('User account is disabled');
      }

      request.user = {
        sub: user.id,
        email: user.email,
        role: fromDbUserRole(user.role),
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
