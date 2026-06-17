import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return this.usersService.getMe(req.user.sub);
  }

  @Patch('me/info')
  @UseGuards(JwtAuthGuard)
  updatePersonalInfo(
    @Req() req: any,
    @Body() body: { fullName?: string; phone?: string },
  ) {
    return this.usersService.updatePersonalInfo(req.user.sub, body);
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: any, @Body() body: any) {
    const { role } = req.user;
    if (role === 'EMPLOYER') {
      const { companyName, companySize, industryId, industryIds, website, address, logoUrl, description, taxCode } = body;
      return this.usersService.updateEmployerProfile(req.user.sub, {
        companyName,
        companySize,
        industryId,
        industryIds,
        website,
        address,
        logoUrl,
        description,
        taxCode,
      });
    }
    const { avatarUrl, isLookingForJob, allowEmployerSearch, defaultCvId } = body;
    return this.usersService.updateCandidateProfile(req.user.sub, {
      avatarUrl,
      isLookingForJob,
      allowEmployerSearch,
      defaultCvId,
    });
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: any,
    @Body()
    body: { oldPassword: string; newPassword: string; confirmPassword: string },
  ) {
    if (body.newPassword !== body.confirmPassword)
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    return this.usersService.changePassword(
      req.user.sub,
      body.oldPassword,
      body.newPassword,
    );
  }

  @Patch('me/job-preferences')
  @UseGuards(JwtAuthGuard)
  updateJobPreferences(@Req() req: any, @Body() body: any) {
    return this.usersService.updateJobPreferences(req.user.sub, body);
  }

  @Get('candidate/profile')
  @UseGuards(JwtAuthGuard)
  getCandidateProfile(@Req() req: any) {
    return this.usersService.getCandidateProfile(req.user.sub);
  }

  @Get('employer/profile')
  @UseGuards(JwtAuthGuard)
  getEmployerProfile(@Req() req: any) {
    return this.usersService.getEmployerProfile(req.user.sub);
  }

  @Patch('me/fcm-token')
  @UseGuards(JwtAuthGuard)
  saveFcmToken(@Req() req: any, @Body() body: { token: string }) {
    return this.usersService.saveFcmToken(req.user.sub, body.token);
  }

  @Get('candidates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  searchCandidates(@Query() query: any) {
    return this.usersService.searchCandidates(query);
  }
}
