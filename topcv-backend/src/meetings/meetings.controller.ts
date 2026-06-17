import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @Post()
  create(
    @Req() req: any,
    @Body() body: { applicationId?: string; candidateId: string; title?: string; scheduledAt?: string },
  ) {
    return this.meetingsService.create(req.user.sub, body);
  }

  @Get('my')
  getMyMeetings(
    @Req() req: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    return this.meetingsService.getMyMeetings(
      req.user.sub,
      month ? parseInt(month) : now.getMonth() + 1,
      year ? parseInt(year) : now.getFullYear(),
    );
  }

  @Get('my-candidate')
  getMyCandidateMeetings(
    @Req() req: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    return this.meetingsService.getCandidateMeetings(
      req.user.sub,
      month ? parseInt(month) : now.getMonth() + 1,
      year ? parseInt(year) : now.getFullYear(),
    );
  }

  @Get(':code')
  findByCode(@Req() req: any, @Param('code') code: string) {
    return this.meetingsService.findByCode(code, req.user.sub, req.user.role);
  }

  @Post(':code/token')
  getToken(@Req() req: any, @Param('code') code: string, @Body() body: { userName?: string }) {
    return this.meetingsService.getToken(code, req.user.sub, req.user.role, body.userName || 'Người dùng');
  }

  @Patch(':code/end')
  endMeeting(@Req() req: any, @Param('code') code: string) {
    return this.meetingsService.endMeeting(code, req.user.sub);
  }
}
