import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { fromDbUserRole } from '../common/mappers';
import { AuthPayload } from '../common/types/auth-payload.type';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly store: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization as string | undefined;

    if (!authorization?.startsWith('Bearer ')) {
      return true;
    }

    const token = authorization.slice(7);

    try {
      const payload = await this.jwtService.verifyAsync<AuthPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET ?? 'jobmatch-ai-access-secret',
      });

      if (payload.tokenType && payload.tokenType !== 'access') {
        return true;
      }

      const user = await this.store.user.findUnique({ where: { id: payload.sub } });

      if (user && !user.blocked) {
        request.user = {
          sub: user.id,
          email: user.email,
          role: fromDbUserRole(user.role),
        };
      }
    } catch {
      // Do nothing, proceed as guest
    }

    return true;
  }
}
