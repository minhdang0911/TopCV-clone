import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { JobAlertsService } from './job-alerts.service';

@Controller('job-alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CANDIDATE')
export class JobAlertsController {
  constructor(private readonly jobAlertsService: JobAlertsService) {}

  @Post()
  create(@Request() req, @Body() dto: any) {
    return this.jobAlertsService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.jobAlertsService.findAll(req.user.sub);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.jobAlertsService.update(req.user.sub, id, dto);
  }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  toggle(@Request() req, @Param('id') id: string) {
    return this.jobAlertsService.toggle(req.user.sub, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Request() req, @Param('id') id: string) {
    return this.jobAlertsService.remove(req.user.sub, id);
  }
}
