import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { ModerateJobDto } from './dto/moderate-job.dto';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('users/:id/approve')
  @ApiOperation({ summary: 'Approve a user account' })
  @ApiAcceptedResponse({ description: 'The user account has been approved.' })
  @ApiBadRequestResponse({
    description: 'Invalid user ID or user cannot be approved.',
  })
  async approveUser(
    @Req() request: Request & { user: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.adminService.approveUser(request.user.sub, id, true);
  }

  @Patch('users/:id/unapprove')
  @ApiAcceptedResponse({ description: 'The user account has been unapproved.' })
  @ApiBadRequestResponse({
    description: 'Invalid user ID or user cannot be unapproved.',
  })
  async unapproveUser(
    @Req() request: Request & { user: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.adminService.approveUser(request.user.sub, id, false);
  }

  @Patch('users/:id/block')
  @ApiOperation({ summary: 'Block a user account' })
  @ApiAcceptedResponse({ description: 'The user account has been blocked.' })
  @ApiBadRequestResponse({
    description: 'Invalid user ID or user cannot be blocked.',
  })
  async blockUser(
    @Req() request: Request & { user: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.adminService.blockUser(request.user.sub, id, true);
  }

  @Patch('users/:id/unblock')
  @ApiOperation({ summary: 'Unblock a user account' })
  @ApiAcceptedResponse({ description: 'The user account has been unblocked.' })
  @ApiBadRequestResponse({
    description: 'Invalid user ID or user cannot be unblocked.',
  })
  async unblockUser(
    @Req() request: Request & { user: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.adminService.blockUser(request.user.sub, id, false);
  }

  @Patch('jobs/:id/moderate')
  @ApiOperation({ summary: 'Moderate a job posting' })
  @ApiAcceptedResponse({ description: 'The job posting has been moderated.' })
  @ApiBadRequestResponse({
    description: 'Invalid job ID or job cannot be moderated.',
  })
  async moderateJob(
    @Req() request: Request & { user: { sub: string } },
    @Param('id') id: string,
    @Body() dto: ModerateJobDto,
  ) {
    return this.adminService.moderateJob(request.user.sub, id, dto);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics data' })
  @ApiOkResponse({ description: 'Analytics data retrieved successfully.' })
  async analytics() {
    return this.adminService.analytics();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiOkResponse({ description: 'Audit logs retrieved successfully.' })
  async auditLogs() {
    return this.adminService.listAuditLogs();
  }
}
