import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  // POST /chat/conversations
  @Post('conversations')
  async findOrCreate(@Req() req: any, @Body() body: any) {
    const userId = req.user.sub;
    const role = req.user.role;
    let candidateUserId: string;
    let employerProfileId: string;
    if (role === 'CANDIDATE') {
      candidateUserId = userId;
      employerProfileId = body.employerProfileId;
    } else {
      candidateUserId = body.candidateUserId;
      employerProfileId = body.employerProfileId;
    }
    return this.chatService.findOrCreate(candidateUserId, employerProfileId);
  }

  // GET /chat/conversations
  @Get('conversations')
  list(@Req() req: any) {
    return this.chatService.listConversations(req.user.sub, req.user.role);
  }

  // GET /chat/conversations/:id/messages
  @Get('conversations/:id/messages')
  messages(
    @Req() req: any,
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.chatService.getMessages(id, req.user.sub, Number(page) || 1, Number(limit) || 30);
  }

  // POST /chat/conversations/:id/messages
  @Post('conversations/:id/messages')
  send(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.chatService.sendMessage(id, req.user.sub, body.content, body.type, body.replyToId);
  }

  // PATCH /chat/conversations/:id/read
  @Patch('conversations/:id/read')
  markRead(@Req() req: any, @Param('id') id: string) {
    return this.chatService.markRead(id, req.user.sub);
  }

  // GET /chat/unread-count
  @Get('unread-count')
  unread(@Req() req: any) {
    return this.chatService.unreadCount(req.user.sub, req.user.role);
  }

  // POST /chat/messages/:id/reactions
  @Post('messages/:id/reactions')
  addReaction(@Req() req: any, @Param('id') msgId: string, @Body() body: any) {
    return this.chatService.addReaction(msgId, req.user.sub, body.emoji);
  }

  // DELETE /chat/messages/:id/reactions
  @Delete('messages/:id/reactions')
  removeReaction(@Req() req: any, @Param('id') msgId: string, @Body() body: any) {
    return this.chatService.removeReaction(msgId, req.user.sub, body.emoji);
  }
}
