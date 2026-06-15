import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  // Employer/any user — their own logs only
  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyLogs(
    @Req() req: any,
    @Query() query: { page?: number; limit?: number; entity?: string; action?: string; from?: string; to?: string },
  ) {
    return this.auditLogsService.findAll({ ...query, userId: req.user.sub });
  }

  // ADMIN only
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getStats() {
    return this.auditLogsService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }
}
