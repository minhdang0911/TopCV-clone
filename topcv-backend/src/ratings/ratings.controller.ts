import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ratings')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() body: any) {
    return this.ratingsService.create(req.user.sub, body);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  getForUser(@Query('userId') userId: string, @Query('type') type: string) {
    return this.ratingsService.getForUser(userId, type);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyRating(
    @Req() req: any,
    @Query('applicationId') applicationId: string,
    @Query('type') type: string,
  ) {
    return this.ratingsService.getMyRating(req.user.sub, applicationId, type);
  }
}
