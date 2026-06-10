import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
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
}
