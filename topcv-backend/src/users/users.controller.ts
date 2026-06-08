import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
      const { companyName, companySize, industryId, website, address, logoUrl, description } = body;
      return this.usersService.updateEmployerProfile(req.user.sub, {
        companyName,
        companySize,
        industryId,
        website,
        address,
        logoUrl,
        description,
      });
    }
    const { avatarUrl, isLookingForJob, allowEmployerSearch } = body;
    return this.usersService.updateCandidateProfile(req.user.sub, {
      avatarUrl,
      isLookingForJob,
      allowEmployerSearch,
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
}
