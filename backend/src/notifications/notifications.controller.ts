import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async listMine(@Req() request: Request & { user: { sub: string } }) {
    return this.notificationsService.listForUser(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markRead(@Req() request: Request & { user: { sub: string } }, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, request.user.sub);
  }
}