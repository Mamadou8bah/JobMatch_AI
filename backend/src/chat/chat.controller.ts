import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../common/enums/role.enum';
import { CreateChatThreadDto } from './dto/create-chat-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatService } from './chat.service';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('threads')
  createThread(
    @Req() request: Request & { user: { sub: string; role: UserRole } },
    @Body() dto: CreateChatThreadDto,
  ) {
    return this.chatService.createThread(request.user.sub, request.user.role, dto);
  }

  @Get('threads')
  listThreads(@Req() request: Request & { user: { sub: string } }) {
    return this.chatService.listThreads(request.user.sub);
  }

  @Get('threads/:id/messages')
  listMessages(@Req() request: Request & { user: { sub: string } }, @Param('id') id: string) {
    return this.chatService.listMessages(id, request.user.sub);
  }

  @Post('threads/:id/messages')
  sendMessage(
    @Req() request: Request & { user: { sub: string } },
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(id, request.user.sub, dto);
  }

  @Patch('threads/:id/read')
  markRead(@Req() request: Request & { user: { sub: string } }, @Param('id') id: string) {
    return this.chatService.markThreadRead(id, request.user.sub);
  }
}
