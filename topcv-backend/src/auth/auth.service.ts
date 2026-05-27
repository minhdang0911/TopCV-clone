import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { Redis } from '@upstash/redis'
import * as argon2 from 'argon2'
import { MailService } from '../mail/mail.service'
import { v4 as uuidv4 } from 'uuid'
import { Role } from '@prisma/client'

@Injectable()
export class AuthService {
  private _redis: Redis | null = null

  private get redis(): Redis {
    if (!this._redis) {
      this._redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    }
    return this._redis
  }

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // ─── REGISTER ───────────────────────────────────────
  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword)
      throw new BadRequestException('Mật khẩu xác nhận không khớp')

    const existing = await this.usersService.findByEmail(dto.email)
    if (existing) throw new BadRequestException('Email đã được sử dụng')

    const passwordHash = await argon2.hash(dto.password)
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
      phone: dto.phone,
    })

    await this.usersService.createProfile(user.id, dto.fullName, dto.role)
    await this.sendOtp(user.id, user.email, 'verify_email')

    return { message: 'Đăng ký thành công, vui lòng kiểm tra email để xác thực' }
  }

  // ─── LOGIN ───────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email)
    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng')

    if (!user.passwordHash)
      throw new UnauthorizedException('Tài khoản này dùng đăng nhập social')

    const isMatch = await argon2.verify(user.passwordHash, dto.password)
    if (!isMatch) throw new UnauthorizedException('Email hoặc mật khẩu không đúng')

    if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa')

    if (!user.isVerified) {
      await this.sendOtp(user.id, user.email, 'verify_email')
      throw new UnauthorizedException('Tài khoản chưa xác thực, OTP đã được gửi lại')
    }

    return this.generateToken(user.id, user.email, user.role)
  }

  // ─── VERIFY OTP ──────────────────────────────────────
 async verifyOtp(email: string, code: string, type: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new BadRequestException('Email không tồn tại')

    const key = `otp:${type}:${user.id}`
    const stored = await this.redis.get<string>(key)

    if (!stored || String(stored) !== String(code))
        throw new BadRequestException('OTP không hợp lệ hoặc đã hết hạn')

    await this.redis.del(key)

    if (type === 'verify_email') {
        await this.usersService.updateVerified(user.id)
        // Trả về token luôn
        return this.generateToken(user.id, user.email, user.role)
    }

    return { message: 'Xác thực OTP thành công' }
}

  // ─── RESEND OTP ──────────────────────────────────────
  async resendOtp(email: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new BadRequestException('Email không tồn tại')
    if (user.isVerified) throw new BadRequestException('Tài khoản đã được xác thực')
    await this.sendOtp(user.id, user.email, 'verify_email')
    return { message: 'OTP đã được gửi lại' }
  }

  // ─── FORGOT PASSWORD ─────────────────────────────────
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new BadRequestException('Email không tồn tại')

    const token = uuidv4()
    await this.redis.set(`reset:${token}`, user.id, { ex: 300 })

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&role=${user.role}`
    await this.mailService.sendResetPassword(user.email, resetUrl)

    return { message: 'Link đặt lại mật khẩu đã được gửi đến email' }
}

  // ─── RESET PASSWORD ──────────────────────────────────
  async resetPassword(token: string, newPassword: string) {
    const userId = await this.redis.get<string>(`reset:${token}`)
    if (!userId) throw new BadRequestException('Link đã hết hạn hoặc không hợp lệ')

    const passwordHash = await argon2.hash(newPassword)
    await this.usersService.updatePassword(userId.toString(), passwordHash)
    await this.redis.del(`reset:${token}`)

    return { message: 'Đổi mật khẩu thành công' }
  }

  // ─── LOGIN SOCIAL ────────────────────────────────────
  async loginSocial(profile: {
    email: string
    fullName: string
    avatar?: string
    provider: string
  }) {
    if (!profile.email)
      throw new BadRequestException('Không lấy được email từ tài khoản social')

    let user = await this.usersService.findByEmail(profile.email)

  if (!user) {
  user = await this.usersService.create({
    email: profile.email,
    role: Role.CANDIDATE,
    provider: profile.provider,
  })
  await this.usersService.updateVerified(user.id)  // set isVerified = true
  await this.usersService.createProfile(user.id, profile.fullName, Role.CANDIDATE)
}

    if (!user.isActive)
      throw new UnauthorizedException('Tài khoản đã bị khóa')

    return this.generateToken(user.id, user.email, user.role)
  }

  // ─── HELPERS ─────────────────────────────────────────
  private async sendOtp(userId: string, email: string, type: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    await this.redis.set(`otp:${type}:${userId}`, code, { ex: 300 })
    await this.mailService.sendOtp(email, code, type as 'verify_email' | 'forgot_password')
  }

  private generateToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }
    return {
      accessToken: this.jwtService.sign(payload),
      role,
    }
  }
}