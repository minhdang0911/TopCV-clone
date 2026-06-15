import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EmployersService } from './employers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('employers')
export class EmployersController {
  constructor(private employersService: EmployersService) {}

  // ── Verification (EMPLOYER only) ─────────────────────────────────────────

  @Get('me/verification-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  getVerificationStatus(@Req() req: any) {
    return this.employersService.getVerificationStatus(req.user.sub);
  }

  @Post('me/send-phone-otp')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  sendPhoneOtp(@Req() req: any, @Body('phone') phone: string) {
    return this.employersService.sendPhoneOtp(req.user.sub, phone);
  }

  @Post('me/verify-phone')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  verifyPhone(@Req() req: any, @Body('code') code: string) {
    return this.employersService.verifyPhone(req.user.sub, code);
  }

  @Post('me/business-doc')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  uploadBusinessDoc(@Req() req: any, @Body() body: any) {
    return this.employersService.uploadBusinessDoc(
      req.user.sub,
      body.docType,
      body.docUrl,
      body.docUrl2,
    );
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  @Get('admin/docs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminGetDocs(@Query('status') status?: string) {
    return this.employersService.adminGetDocs(status);
  }

  @Patch('admin/:id/approve-doc')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  approveDoc(@Param('id') id: string, @Body('approve') approve: boolean, @Body('rejectReason') rejectReason?: string) {
    return this.employersService.adminApproveDoc(id, approve, rejectReason);
  }

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
