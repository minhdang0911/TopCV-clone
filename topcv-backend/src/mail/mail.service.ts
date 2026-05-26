import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MailService {
  constructor(private mailer: MailerService) {}

  async sendOtp(email: string, otp: string, type: 'verify_email' | 'forgot_password') {
    const isVerify = type === 'verify_email'
    const title = isVerify ? 'Xác thực tài khoản' : 'Đặt lại mật khẩu'

    await this.mailer.sendMail({
      to: email,
      subject: isVerify ? 'Xác thực tài khoản TopCV' : 'Đặt lại mật khẩu TopCV',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:40px auto;background:#fff;border-radius:8px;padding:32px">
          <div style="color:#00b14f;font-size:24px;font-weight:bold">TopCV Clone</div>
          <h2>${title}</h2>
          <p>Xin chào <strong>${email}</strong>,</p>
          <p>${isVerify ? 'Nhập mã OTP bên dưới để xác thực tài khoản.' : 'Nhập mã OTP bên dưới để đặt lại mật khẩu.'}</p>
          <div style="background:#f0faf4;border:2px dashed #00b14f;border-radius:8px;text-align:center;padding:24px;margin:24px 0">
            <div style="font-size:36px;font-weight:bold;color:#00b14f;letter-spacing:8px">${otp}</div>
          </div>
          <p style="color:#888;font-size:13px">⏱ Mã OTP có hiệu lực trong <strong>5 phút</strong>.</p>
        </div>
      `,
    })
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
    })
  }
}