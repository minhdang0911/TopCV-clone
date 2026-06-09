import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EmployersService } from './employers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('employers')
export class EmployersController {
  constructor(private employersService: EmployersService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.employersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employersService.findOne(id);
  }

  @Get(':id/jobs')
  getJobs(@Param('id') id: string, @Query() query: any) {
    return this.employersService.getJobs(id, query);
  }

  @Get(':id/reviews')
  getReviews(@Param('id') id: string) {
    return this.employersService.getReviews(id);
  }

  @Get(':id/follow-status')
  @UseGuards(JwtAuthGuard)
  getFollowStatus(@Req() req: any, @Param('id') id: string) {
    return this.employersService.getFollowStatus(req.user.sub, id);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  follow(@Req() req: any, @Param('id') id: string) {
    return this.employersService.follow(req.user.sub, id);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  unfollow(@Req() req: any, @Param('id') id: string) {
    return this.employersService.unfollow(req.user.sub, id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  createReview(
    @Req() req: any,
    @Param('id') id: string,
    @Body('rating') rating: number,
  ) {
    return this.employersService.createReview(req.user.sub, id, rating);
  }
}
