import { UserRole } from '../enums/role.enum';

export interface AuthPayload {
  sub: string;
  email: string;
  role: UserRole;
  tokenType?: 'access' | 'refresh';
  jti?: string;
}