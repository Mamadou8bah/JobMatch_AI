import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.body?.refreshToken ?? request.headers['x-refresh-token'];

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Missing refresh token');
    }

    request.refreshToken = token;
    return true;
  }
}