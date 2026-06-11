import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findAll(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.findAll(req.user.sub, +page, +limit);
  }

  @Get('unread-count')
  unreadCount(@Req() req: any) {
    return this.service.getUnreadCount(req.user.sub);
  }

  @Patch('read-all')
  markAllRead(@Req() req: any) {
    return this.service.markAllRead(req.user.sub);
  }

  @Patch(':id/read')
  markRead(@Req() req: any, @Param('id') id: string) {
    return this.service.markRead(req.user.sub, id);
  }

  @Delete('clear-all')
  deleteAll(@Req() req: any) {
    return this.service.deleteAll(req.user.sub);
  }

  @Delete(':id')
  deleteOne(@Req() req: any, @Param('id') id: string) {
    return this.service.deleteOne(req.user.sub, id);
  }
}
