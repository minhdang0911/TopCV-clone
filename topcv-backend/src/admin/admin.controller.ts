import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // GET /api/admin/dashboard
  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // GET /api/admin/payments?status=SUCCESS&gateway=MOMO&page=1&limit=20
  @Get('payments')
  getPayments(@Query() query: any) {
    return this.adminService.adminGetPayments(query);
  }

  // GET /api/admin/payments/stats
  @Get('payments/stats')
  getPaymentStats() {
    return this.adminService.adminGetPaymentStats();
  }

  // GET /api/admin/applications/stats
  @Get('applications/stats')
  getApplicationStats() {
    return this.adminService.adminGetApplicationStats();
  }
}
