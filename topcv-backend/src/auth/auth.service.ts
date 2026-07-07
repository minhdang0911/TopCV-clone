
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Redis } from '@upstash/redis';
import * as argon2 from 'argon2';
import { MailService } from '../mail/mail.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  private _redis: Redis | null = null;

  private get redis(): Redis {
    if (!this._redis) {
      this._redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    }
    return this._redis;
  }

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  // ─── REGISTER ───────────────────────────────────────
  async register(dto: RegisterDto, ip?: string) {
    if (dto.password !== dto.confirmPassword)
      throw new BadRequestException('Mật khẩu xác nhận không khớp');

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email đã được sử dụng');

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
      phone: dto.phone,
    });

    await this.usersService.createProfile(user.id, dto.fullName, dto.role);
    await this.sendOtp(user.id, user.email, 'verify_email');

    this.auditLogs.create({ userId: user.id, action: 'REGISTER', entity: 'auth', entityId: user.id, ipAddress: ip }).catch((e) => console.error('[AuditLog]', e?.message));

    return {
      message: 'Đăng ký thành công, vui lòng kiểm tra email để xác thực',
    };
  }

  // ─── LOGIN ───────────────────────────────────────────
  async login(dto: LoginDto, ip?: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user)
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    if (!user.passwordHash)
      throw new UnauthorizedException('Tài khoản này dùng đăng nhập social');

    const isMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!isMatch)
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa');

    if (!user.isVerified) {
      await this.sendOtp(user.id, user.email, 'verify_email');
      throw new UnauthorizedException(
        'Tài khoản chưa xác thực, OTP đã được gửi lại',
      );
    }

    // Check 2FA
    if (user.twoFactorEnabled) {
      await this.sendOtp(user.id, user.email, 'two_factor_login');
      return {
        require2FA: true,
        email: user.email,
        role: user.role, // ← thêm role
        message: 'Vui lòng nhập mã OTP',
      };
    }

    this.auditLogs.create({ userId: user.id, action: 'LOGIN', entity: 'auth', entityId: user.id, ipAddress: ip }).catch((e) => console.error('[AuditLog]', e?.message));
    return this.generateTokens(user.id, user.email, user.role);
  }

  // ─── VERIFY OTP ──────────────────────────────────────
  async verifyOtp(email: string, code: string, type: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Email không tồn tại');

    const key = `otp:${type}:${user.id}`;
    const stored = await this.redis.get<string>(key);

    if (!stored || String(stored) !== String(code))
      throw new BadRequestException('OTP không hợp lệ hoặc đã hết hạn');

    await this.redis.del(key);

    if (type === 'verify_email') {
      await this.usersService.updateVerified(user.id);
      return this.generateTokens(user.id, user.email, user.role);
    }

    if (type === 'two_factor_login') {
      return this.generateTokens(user.id, user.email, user.role);
    }

    return { message: 'Xác thực OTP thành công' };
  }

  // ─── RESEND OTP ──────────────────────────────────────
  async resendOtp(email: string, type: string = 'verify_email') {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Email không tồn tại');

    if (type === 'verify_email' && user.isVerified)
      throw new BadRequestException('Tài khoản đã được xác thực');

    if (type === 'two_factor_login' && !user.twoFactorEnabled)
      throw new BadRequestException('2FA chưa được bật');

    await this.sendOtp(user.id, user.email, type);
    return { message: 'OTP đã được gửi lại' };
  }

  // ─── FORGOT PASSWORD ─────────────────────────────────
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Email không tồn tại');

    const token = uuidv4();
    await this.redis.set(`reset:${token}`, user.id, { ex: 300 });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&role=${user.role}`;
    await this.mailService.sendResetPassword(user.email, resetUrl);

    return { message: 'Link đặt lại mật khẩu đã được gửi đến email' };
  }

  // ─── RESET PASSWORD ──────────────────────────────────
  async resetPassword(token: string, newPassword: string) {
    const userId = await this.redis.get<string>(`reset:${token}`);
    if (!userId)
      throw new BadRequestException('Link đã hết hạn hoặc không hợp lệ');

    const passwordHash = await argon2.hash(newPassword);
    await this.usersService.updatePassword(userId.toString(), passwordHash);
    await this.redis.del(`reset:${token}`);

    await this.prisma.refreshToken.deleteMany({
      where: { userId: userId.toString() },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  // ─── REFRESH TOKEN ───────────────────────────────────
  async refresh(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored) throw new UnauthorizedException('Refresh token không hợp lệ');
    if (stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { token } });
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }
    if (!stored.user.isActive)
      throw new UnauthorizedException('Tài khoản đã bị khóa');

    await this.prisma.refreshToken.delete({ where: { token } });
    return this.generateTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role,
    );
  }

  // ─── LOGOUT ──────────────────────────────────────────
  async logout(token: string, ip?: string) {
    // Guard: nếu không có refreshToken thì bỏ qua (tránh Prisma crash)
    if (!token) return { message: 'Đăng xuất thành công' };

    const rt = await this.prisma.refreshToken.findUnique({ where: { token }, select: { userId: true } });
    await this.prisma.refreshToken.deleteMany({ where: { token } });
    if (rt?.userId) {
      this.auditLogs.create({ userId: rt.userId, action: 'LOGOUT', entity: 'auth', entityId: rt.userId, ipAddress: ip }).catch((e) => console.error('[AuditLog]', e?.message));
    }
    return { message: 'Đăng xuất thành công' };
  }

  // ─── 2FA ENABLE ──────────────────────────────────────
  async enable2FA(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    if (user.twoFactorEnabled) throw new BadRequestException('2FA đã được bật');

    await this.sendOtp(userId, user.email, 'two_factor_enable');
    return {
      message: 'Mã OTP đã được gửi đến email, vui lòng xác nhận để bật 2FA',
    };
  }

  // ─── 2FA CONFIRM ─────────────────────────────────────
  async confirm2FA(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    const key = `otp:two_factor_enable:${userId}`;
    const stored = await this.redis.get<string>(key);

    if (!stored || String(stored) !== String(code))
      throw new BadRequestException('OTP không hợp lệ hoặc đã hết hạn');

    await this.redis.del(key);
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { message: 'Bật xác minh 2 bước thành công' };
  }

  // ─── 2FA DISABLE ─────────────────────────────────────
  async disable2FA(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    if (!user.twoFactorEnabled)
      throw new BadRequestException('2FA chưa được bật');

    const key = `otp:two_factor_disable:${userId}`;
    const stored = await this.redis.get<string>(key);

    if (!stored || String(stored) !== String(code))
      throw new BadRequestException('OTP không hợp lệ hoặc đã hết hạn');

    await this.redis.del(key);
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false },
    });

    return { message: 'Tắt xác minh 2 bước thành công' };
  }

  // ─── 2FA SEND DISABLE OTP ────────────────────────────
  async sendDisable2FAOtp(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    if (!user.twoFactorEnabled)
      throw new BadRequestException('2FA chưa được bật');

    await this.sendOtp(userId, user.email, 'two_factor_disable');
    return {
      message: 'Mã OTP đã được gửi đến email, vui lòng xác nhận để tắt 2FA',
    };
  }

  // ─── LOGIN SOCIAL ────────────────────────────────────
  async loginSocial(profile: {
    email: string;
    fullName: string;
    avatar?: string;
    provider: string;
  }, ip?: string) {
    if (!profile.email)
      throw new BadRequestException('Không lấy được email từ tài khoản social');

    let user = await this.usersService.findByEmail(profile.email);

    if (!user) {
      // Tạo mới
      user = await this.usersService.create({
        email: profile.email,
        role: Role.CANDIDATE,
        provider: profile.provider,
      });
      await this.usersService.updateVerified(user.id);
      await this.usersService.createProfile(
        user.id,
        profile.fullName,
        Role.CANDIDATE,
      );
    }

    // Update avatar + fullName mỗi lần login
    await this.usersService.updateCandidateProfile(user.id, {
      ...(profile.avatar && { avatarUrl: profile.avatar }),
      ...(profile.fullName && { fullName: profile.fullName }),
    });

    if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa');

    this.auditLogs.create({ userId: user.id, action: 'LOGIN', entity: 'auth', entityId: user.id, ipAddress: ip }).catch((e) => console.error('[AuditLog]', e?.message));
    return this.generateTokens(user.id, user.email, user.role);
  }

  async loginGoogleOneTap(token: string, ip?: string) {
    try {
      const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      const payload = response.data;

      // Verify audience matches Google Client ID
      if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
        throw new UnauthorizedException('Invalid Google client ID');
      }

      const socialUser = {
        email: payload.email,
        fullName: payload.name || payload.given_name || 'Google User',
        avatar: payload.picture,
        provider: 'google',
      };

      return this.loginSocial(socialUser, ip);
    } catch (e) {
      throw new UnauthorizedException('Xác thực tài khoản Google thất bại');
    }
  }

  async verifyResetToken(token: string) {
    const userId = await this.redis.get<string>(`reset:${token}`);
    if (!userId)
      throw new BadRequestException('Link đã hết hạn hoặc không hợp lệ');
    return { valid: true };
  }

  // ─── DEV ONLY ────────────────────────────────────────
  async devSeedEmployers(
    employers: Array<{
      email: string;
      password: string;
      fullName: string;
      companyName: string;
      industryId: number;
      companySize?: string;
      address?: string;
      website?: string;
    }>,
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Not available in production');
    }

    const results: any[] = [];

    for (const e of employers) {
      const existing = await this.usersService.findByEmail(e.email);
      if (existing) {
        results.push({ email: e.email, status: 'skipped (already exists)' });
        continue;
      }

      const passwordHash = await argon2.hash(e.password);

      const user = await this.prisma.user.create({
        data: {
          email: e.email,
          passwordHash,
          role: Role.EMPLOYER,
          isVerified: true,
          isActive: true,
        },
      });

      await this.prisma.employerProfile.create({
        data: {
          userId: user.id,
          companyName: e.companyName,
          industryId: e.industryId,
          companySize: e.companySize,
          address: e.address,
          website: e.website,
        },
      });

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      results.push({
        email: e.email,
        companyName: e.companyName,
        status: 'created',
        accessToken: tokens.data.accessToken,
      });
    }

    return { success: true, data: results };
  }

  // ─── HELPERS ─────────────────────────────────────────
  private async sendOtp(userId: string, email: string, type: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`otp:${type}:${userId}`, code, { ex: 300 });
    await this.mailService.sendOtp(email, code, type as any);
  }
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    // Dùng JWT_EXPIRES_IN từ env (mặc định 15m), không hardcode
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as any,
    });

    const refreshToken = uuidv4();
    // Refresh token 60 ngày — sliding: mỗi lần refresh lại gia hạn thêm 60 ngày
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    await this.prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt },
    });

    return {
      success: true,
      data: { accessToken, refreshToken, role },
    };
  }
}
