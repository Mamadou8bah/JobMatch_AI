import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { EmployerService } from './employer.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Employer, UserRole.Admin)
@Controller('employer')
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}

  @Get('analytics')
  analytics(@Req() request: Request & { user: { sub: string } }) {
    return this.employerService.analytics(request.user.sub);
  }
}
