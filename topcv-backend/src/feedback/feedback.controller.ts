import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() body: { topic: string; description: string; rating: number }) {
    return this.feedbackService.create(req.user.sub, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(@Query() query: { page?: number; limit?: number }) {
    return this.feedbackService.findAll(query);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  reply(@Req() req: any, @Param('id') id: string, @Body() body: { replyText: string }) {
    return this.feedbackService.reply(req.user.sub, id, body.replyText);
  }
}
