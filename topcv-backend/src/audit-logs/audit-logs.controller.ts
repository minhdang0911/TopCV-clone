import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  findAll(
    @Query()
    query: {
      page?: number;
      limit?: number;
      entity?: string;
      action?: string;
      userId?: string;
    },
  ) {
    return this.auditLogsService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.auditLogsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }
}
