import { BadRequestException, Body, Controller, Post, Get, Req, Res, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { IsEmail, IsString } from 'class-validator'
import { GoogleGuard, FacebookGuard, LinkedinGuard } from './guards/social-auth.guard'

class VerifyOtpDto {
  @IsEmail() email: string
  @IsString() code: string
  @IsString() type: string
}

class ForgotPasswordDto {
  @IsEmail() email: string
}

class ResendOtpDto {
  @IsEmail() email: string
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.code, dto.type)
  }

  @Post('resend-otp')
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.email)
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email)
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword)
      throw new BadRequestException('Mật khẩu xác nhận không khớp')
    return this.authService.resetPassword(dto.token, dto.newPassword)
  }

  // ─── GOOGLE ───────────────────────────────────────
  @Get('google')
  @UseGuards(GoogleGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  async googleCallback(@Req() req: any, @Res() res: any) {
    const result = await this.authService.loginSocial(req.user)
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${result.accessToken}&role=${result.role}`)
  }

  // ─── FACEBOOK ─────────────────────────────────────
  @Get('facebook')
  @UseGuards(FacebookGuard)
  facebookLogin() {}

  @Get('facebook/callback')
  @UseGuards(FacebookGuard)
  async facebookCallback(@Req() req: any, @Res() res: any) {
    const result = await this.authService.loginSocial(req.user)
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${result.accessToken}&role=${result.role}`)
  }

  // ─── LINKEDIN ─────────────────────────────────────
  @Get('linkedin')
  @UseGuards(LinkedinGuard)
  linkedinLogin() {}

  @Get('linkedin/callback')
  @UseGuards(LinkedinGuard)
  async linkedinCallback(@Req() req: any, @Res() res: any) {
    const result = await this.authService.loginSocial(req.user)
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${result.accessToken}&role=${result.role}`)
  }
}