import { Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SavedJobsService } from './saved-jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('saved-jobs')
export class SavedJobsController {
  constructor(private savedJobsService: SavedJobsService) {}

  @Post(':jobId/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  toggle(@Req() req: any, @Param('jobId') jobId: string) {
    return this.savedJobsService.toggle(req.user.sub, jobId);
  }

  @Get(':jobId/check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  check(@Req() req: any, @Param('jobId') jobId: string) {
    return this.savedJobsService.check(req.user.sub, jobId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  findMy(@Req() req: any, @Query() query: any) {
    return this.savedJobsService.findMySaved(req.user.sub, query);
  }
}
