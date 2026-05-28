import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

type OtpType =
  | 'verify_email'
  | 'forgot_password'
  | 'two_factor_login'
  | 'two_factor_enable'
  | 'two_factor_disable';

const otpContent: Record<OtpType, { title: string; description: string }> = {
  verify_email: {
    title: 'Xác thực tài khoản',
    description: 'Nhập mã OTP bên dưới để xác thực tài khoản của bạn.',
  },
  forgot_password: {
    title: 'Đặt lại mật khẩu',
    description: 'Nhập mã OTP bên dưới để đặt lại mật khẩu.',
  },
  two_factor_login: {
    title: 'Xác minh đăng nhập',
    description: 'Mã OTP xác minh đăng nhập 2 bước của bạn.',
  },
  two_factor_enable: {
    title: 'Bật xác minh 2 bước',
    description: 'Nhập mã OTP bên dưới để bật tính năng xác minh 2 bước.',
  },
  two_factor_disable: {
    title: 'Tắt xác minh 2 bước',
    description: 'Nhập mã OTP bên dưới để tắt tính năng xác minh 2 bước.',
  },
};

@Injectable()
export class MailService {
  constructor(private mailer: MailerService) {}

  async sendOtp(email: string, otp: string, type: OtpType) {
    const { title, description } = otpContent[type] ?? {
      title: 'Mã OTP',
      description: 'Nhập mã OTP bên dưới.',
    };

    await this.mailer.sendMail({
      to: email,
      subject: `${title} - TopCV Clone`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:40px auto;background:#fff;border-radius:8px;padding:32px">
          <div style="color:#00b14f;font-size:24px;font-weight:bold">TopCV Clone</div>
          <h2>${title}</h2>
          <p>Xin chào <strong>${email}</strong>,</p>
          <p>${description}</p>
          <div style="background:#f0faf4;border:2px dashed #00b14f;border-radius:8px;text-align:center;padding:24px;margin:24px 0">
            <div style="font-size:36px;font-weight:bold;color:#00b14f;letter-spacing:8px">${otp}</div>
          </div>
          <p style="color:#888;font-size:13px">⏱ Mã OTP có hiệu lực trong <strong>5 phút</strong>.</p>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        </div>
      `,
    });
  }

  async sendResetPassword(email: string, resetUrl: string) {
    await this.mailer.sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu TopCV',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:40px auto;background:#fff;border-radius:8px;padding:32px">
          <div style="color:#00b14f;font-size:24px;font-weight:bold">TopCV Clone</div>
          <h2>Đặt lại mật khẩu</h2>
          <p>Bạn vừa yêu cầu đặt lại mật khẩu. Click vào nút bên dưới:</p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#00b14f;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">
            Đặt lại mật khẩu
          </a>
          <p style="color:#888;font-size:13px">⏱ Link có hiệu lực trong <strong>5 phút</strong> và chỉ dùng được <strong>1 lần</strong>.</p>
          <p style="color:#888;font-size:13px">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        </div>
      `,
    });
  }
}
