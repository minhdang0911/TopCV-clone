import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  // Candidate: apply to a job
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  apply(@Req() req: any, @Body() body: any) {
    return this.applicationsService.apply(req.user.sub, body);
  }

  // Candidate: check if already applied to a job
  @Get('check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  checkApplied(@Req() req: any, @Query('jobId') jobId: string) {
    return this.applicationsService.checkApplied(req.user.sub, jobId);
  }

  // Employer: urgent items for dashboard widget
  @Get('urgent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  getUrgent(@Req() req: any) {
    return this.applicationsService.getUrgentItems(req.user.sub);
  }

  // Candidate: list own applications
  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  findMy(@Req() req: any, @Query() query: any) {
    return this.applicationsService.findMyApplications(req.user.sub, query);
  }

  // Candidate: get own interview schedule for calendar
  @Get('my-interviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  getMyInterviews(
    @Req() req: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    return this.applicationsService.getCandidateInterviews(
      req.user.sub,
      month ? parseInt(month) : now.getMonth() + 1,
      year ? parseInt(year) : now.getFullYear(),
    );
  }

  // Candidate: withdraw application
  @Delete(':id/withdraw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  withdraw(@Req() req: any, @Param('id') id: string) {
    return this.applicationsService.withdraw(req.user.sub, id);
  }

  // Employer: list all applications across their jobs
  @Get('employer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  findAllByEmployer(@Req() req: any, @Query() query: any) {
    return this.applicationsService.findAllByEmployer(req.user.sub, query);
  }

  // Employer: recruitment report with status funnel, time series, per-job breakdown
  @Get('report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  getReport(@Req() req: any, @Query('period') period: string) {
    return this.applicationsService.getApplicationReport(req.user.sub, period as 'daily' | 'monthly');
  }

  // Employer: get interview schedule for calendar
  @Get('interviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  getInterviewSchedule(
    @Req() req: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    return this.applicationsService.getInterviewSchedule(
      req.user.sub,
      month ? parseInt(month) : now.getMonth() + 1,
      year ? parseInt(year) : now.getFullYear(),
    );
  }

  // Employer: list applications for a specific job
  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  findByJob(@Req() req: any, @Param('jobId') jobId: string, @Query() query: any) {
    return this.applicationsService.findByJob(req.user.sub, jobId, query);
  }

  // Employer: update application status
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  updateStatus(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.applicationsService.updateStatus(req.user.sub, id, body);
  }
}
