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
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  // PUBLIC

  // QUAN TRỌNG: /stats phải đặt TRƯỚC /:id
  // Nếu đặt sau, NestJS sẽ match 'stats' như một :id param
  @Get('stats')
  getStats() {
    return this.jobsService.getStats();
  }

  @Get()
  findAll(@Query() query: any) {
    return this.jobsService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  findMyJobs(@Req() req: any, @Query() query: any) {
    return this.jobsService.findMyJobs(req.user.sub, query);
  }

  @Get('growth')
  getGrowth(@Query('days') days?: string) {
    return this.jobsService.getGrowth(days ? parseInt(days, 10) : 30);
  }

  @Get('industry-demand')
  getIndustryDemand() {
    return this.jobsService.getIndustryDemand();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  // EMPLOYER

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  create(@Req() req: any, @Body() body: any) {
    return this.jobsService.create(req.user.sub, body, req.ip);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.jobsService.update(req.user.sub, id, body, req.ip);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  toggleActive(@Req() req: any, @Param('id') id: string) {
    return this.jobsService.toggleActive(req.user.sub, id, req.ip);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.jobsService.remove(req.user.sub, id, req.ip);
  }
}
