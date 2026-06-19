import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { ModerateJobDto } from './dto/moderate-job.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('users/:id/approve')
  approveUser(@Req() request: Request & { user: { sub: string } }, @Param('id') id: string) {
    return this.adminService.approveUser(request.user.sub, id, true);
  }

  @Patch('users/:id/unapprove')
  unapproveUser(@Req() request: Request & { user: { sub: string } }, @Param('id') id: string) {
    return this.adminService.approveUser(request.user.sub, id, false);
  }

  @Patch('users/:id/block')
  blockUser(@Req() request: Request & { user: { sub: string } }, @Param('id') id: string) {
    return this.adminService.blockUser(request.user.sub, id, true);
  }

  @Patch('users/:id/unblock')
  unblockUser(@Req() request: Request & { user: { sub: string } }, @Param('id') id: string) {
    return this.adminService.blockUser(request.user.sub, id, false);
  }

  @Patch('jobs/:id/moderate')
  moderateJob(
    @Req() request: Request & { user: { sub: string } },
    @Param('id') id: string,
    @Body() dto: ModerateJobDto,
  ) {
    return this.adminService.moderateJob(request.user.sub, id, dto);
  }

  @Get('analytics')
  analytics() {
    return this.adminService.analytics();
  }

  @Get('audit-logs')
  auditLogs() {
    return this.adminService.listAuditLogs();
  }
}
