import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { IsEmail, IsString } from 'class-validator';
import {
  GoogleGuard,
  FacebookGuard,
  LinkedinGuard,
} from './guards/social-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class VerifyOtpDto {
  @IsEmail() email: string;
  @IsString() code: string;
  @IsString() type: string;
}

class ForgotPasswordDto {
  @IsEmail() email: string;
}

class ResendOtpDto {
  @IsEmail() email: string;
}

class TwoFactorDto {
  @IsString() code: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.authService.register(dto, ip);
  }

  @Post('dev/seed-employers')
  devSeedEmployers(@Body() body: { employers: any[] }) {
    return this.authService.devSeedEmployers(body.employers);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.authService.login(dto, ip);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.code, dto.type);
  }

  @Post('resend-otp')
  resendOtp(@Body() body: { email: string; type?: string }) {
    return this.authService.resendOtp(body.email, body.type);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword)
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') token: string) {
    return this.authService.refresh(token);
  }

  @Post('logout')
  logout(@Body('refreshToken') token: string, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.authService.logout(token, ip);
  }

  // ─── 2FA ──────────────────────────────────────────
  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  enable2FA(@Req() req: any) {
    return this.authService.enable2FA(req.user.sub);
  }

  @Post('2fa/confirm')
  @UseGuards(JwtAuthGuard)
  confirm2FA(@Req() req: any, @Body() dto: TwoFactorDto) {
    return this.authService.confirm2FA(req.user.sub, dto.code);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  sendDisable2FAOtp(@Req() req: any) {
    return this.authService.sendDisable2FAOtp(req.user.sub);
  }

  @Post('2fa/disable/confirm')
  @UseGuards(JwtAuthGuard)
  disable2FA(@Req() req: any, @Body() dto: TwoFactorDto) {
    return this.authService.disable2FA(req.user.sub, dto.code);
  }

  // ─── GOOGLE ───────────────────────────────────────
  @Get('google')
  @UseGuards(GoogleGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  async googleCallback(@Req() req: any, @Res() res: any) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const result = await this.authService.loginSocial(req.user, ip);

    const { accessToken, refreshToken, role } = result.data;

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}&role=${role}`,
    );
  }

  @Post('google-one-tap')
  async googleOneTap(@Body('token') token: string, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.authService.loginGoogleOneTap(token, ip);
  }

  // ─── FACEBOOK ─────────────────────────────────────
  @Get('facebook')
  @UseGuards(FacebookGuard)
  facebookLogin() {}

  @Get('facebook/callback')
  @UseGuards(FacebookGuard)
  async facebookCallback(@Req() req: any, @Res() res: any) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const result = await this.authService.loginSocial(req.user, ip);

    const { accessToken, refreshToken, role } = result.data;

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}&role=${role}`,
    );
  }

  // ─── LINKEDIN ─────────────────────────────────────
  @Get('linkedin')
  @UseGuards(LinkedinGuard)
  linkedinLogin() {}

  @Post('verify-reset-token')
  verifyResetToken(@Body('token') token: string) {
    return this.authService.verifyResetToken(token);
  }

  @Get('linkedin/callback')
  @UseGuards(LinkedinGuard)
  async linkedinCallback(@Req() req: any, @Res() res: any) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const result = await this.authService.loginSocial(req.user, ip);

    const { accessToken, refreshToken, role } = result.data;

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}&role=${role}`,
    );
  }
}
