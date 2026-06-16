import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() body: { plan: string; gateway: string }) {
    return this.paymentsService.create(req.user.sub, body.plan, body.gateway);
  }

  @Get('status/:orderId')
  @UseGuards(JwtAuthGuard)
  getStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getStatus(orderId);
  }

  @Post('momo/confirm')
  @UseGuards(JwtAuthGuard)
  confirmMoMo(@Req() req: any, @Body() body: Record<string, string>) {
    return this.paymentsService.confirmMoMo(req.user.sub, body);
  }

  @Post('zalopay/confirm')
  @UseGuards(JwtAuthGuard)
  confirmZaloPay(@Req() req: any, @Body() body: Record<string, string>) {
    return this.paymentsService.confirmZaloPay(req.user.sub, body);
  }

  @Post('vnpay/verify')
  @UseGuards(JwtAuthGuard)
  verifyVNPay(@Req() req: any, @Body() body: Record<string, string>) {
    return this.paymentsService.verifyVNPay(req.user.sub, body);
  }

  @Get('my-plan')
  @UseGuards(JwtAuthGuard)
  getMyPlan(@Req() req: any) {
    return this.paymentsService.getMyPlan(req.user.sub);
  }

  @Get('my-history')
  @UseGuards(JwtAuthGuard)
  getMyHistory(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getMyHistory(req.user.sub, {
      page: parseInt(page || '1'),
      pageSize: parseInt(pageSize || '10'),
      startDate,
      endDate,
    });
  }

  @Post('create-view-job')
  @UseGuards(JwtAuthGuard)
  createViewJob(@Req() req: any, @Body() body: { jobId: string; gateway: string }) {
    return this.paymentsService.createViewJob(req.user.sub, body.jobId, body.gateway);
  }

  @Get('job-applicant-count/:jobId')
  @UseGuards(JwtAuthGuard)
  getJobApplicantCount(@Req() req: any, @Param('jobId') jobId: string) {
    return this.paymentsService.getJobApplicantCount(req.user.sub, jobId);
  }
}
