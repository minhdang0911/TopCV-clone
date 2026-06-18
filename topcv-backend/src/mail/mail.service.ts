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

  async sendInterviewInvite(params: {
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    companyLogoUrl?: string;
    subject?: string;
    customBody?: string;
    interviewDate?: string;
    interviewTime?: string;
    interviewLocation?: string;
    interviewType?: string;
    interviewNote?: string;
  }) {
    const {
      candidateEmail, candidateName, jobTitle, companyName, companyLogoUrl,
      subject, customBody, interviewDate, interviewTime,
      interviewLocation, interviewType, interviewNote,
    } = params;

    const emailSubject = subject || `[${companyName}] Thư mời phỏng vấn vị trí ${jobTitle}`;

    const logoBlock = companyLogoUrl
      ? `<img src="${companyLogoUrl}" alt="${this.esc(companyName)}" style="height:44px;max-width:160px;object-fit:contain;border-radius:6px;background:#f3f4f6;padding:4px" />`
      : `<div style="width:44px;height:44px;border-radius:10px;background:#7c3aed;display:inline-flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:20px;vertical-align:middle">${(companyName[0] || 'C').toUpperCase()}</div>`;

    const bodyHtml = customBody
      ? this.plainToHtml(customBody)
      : this.buildInterviewBodyHtml({ candidateName, jobTitle, companyName, interviewDate, interviewTime, interviewLocation, interviewType, interviewNote });

    await this.mailer.sendMail({
      to: candidateEmail,
      subject: emailSubject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10)">
          <div style="padding:20px 32px;background:#fafafa;border-bottom:3px solid #7c3aed;display:table;width:100%;box-sizing:border-box">
            <div style="display:table-cell;vertical-align:middle;padding-right:16px">${logoBlock}</div>
            <div style="display:table-cell;vertical-align:middle">
              <div style="font-size:17px;font-weight:700;color:#111827">${this.esc(companyName)}</div>
              <div style="font-size:12px;color:#7c3aed;font-weight:600;margin-top:2px">Thư mời phỏng vấn</div>
            </div>
          </div>
          <div style="padding:28px 32px">${bodyHtml}</div>
          <div style="background:#f9fafb;padding:14px 32px;border-top:1px solid #f3f4f6;text-align:center">
            <div style="font-size:12px;color:#9ca3af">Email gửi tự động qua <strong style="color:#6b7280">TopCV Clone</strong>. Vui lòng không trả lời trực tiếp.</div>
          </div>
        </div>
      `,
    });
  }

  private esc(text: string): string {
    return String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private plainToHtml(text: string): string {
    return this.esc(text)
      .split('\n')
      .map(line =>
        line.trim()
          ? `<p style="margin:0 0 10px;color:#374151;line-height:1.75">${line}</p>`
          : '<p style="margin:0 0 10px">&nbsp;</p>',
      )
      .join('');
  }

  private buildInterviewBodyHtml(p: {
    candidateName: string; jobTitle: string; companyName: string;
    interviewDate?: string; interviewTime?: string; interviewLocation?: string;
    interviewType?: string; interviewNote?: string;
  }): string {
    const dateStr = p.interviewDate
      ? new Date(p.interviewDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : null;

    const typeLabel = p.interviewType === 'online'
      ? 'Phỏng vấn Online' : p.interviewType === 'phone'
      ? 'Phỏng vấn qua điện thoại' : 'Trực tiếp tại văn phòng';

    const rows = [
      dateStr ? `<tr><td style="padding:7px 0;color:#6b7280;font-size:13px;padding-right:20px;vertical-align:top;white-space:nowrap">Thời gian</td><td style="padding:7px 0;font-weight:600;color:#111827;font-size:13px">${dateStr}${p.interviewTime ? ` lúc ${p.interviewTime}` : ''}</td></tr>` : '',
      p.interviewLocation ? `<tr><td style="padding:7px 0;color:#6b7280;font-size:13px;padding-right:20px;vertical-align:top">Địa điểm</td><td style="padding:7px 0;font-weight:600;color:#111827;font-size:13px">${this.esc(p.interviewLocation)}</td></tr>` : '',
      p.interviewType ? `<tr><td style="padding:7px 0;color:#6b7280;font-size:13px;padding-right:20px">Hình thức</td><td style="padding:7px 0;font-weight:600;color:#111827;font-size:13px">${typeLabel}</td></tr>` : '',
    ].filter(Boolean).join('');

    return `
      <p style="margin:0 0 12px;color:#374151;line-height:1.75;font-size:14px">Kính gửi <strong style="color:#111827">${this.esc(p.candidateName)}</strong>,</p>
      <p style="margin:0 0 14px;color:#374151;line-height:1.75;font-size:14px">
        Cảm ơn bạn đã quan tâm và ứng tuyển vào vị trí <strong style="color:#111827">${this.esc(p.jobTitle)}</strong> tại
        <strong style="color:#111827">${this.esc(p.companyName)}</strong>. Sau khi xem xét hồ sơ, chúng tôi nhận thấy bạn phù hợp với yêu cầu tuyển dụng và mong muốn mời bạn tham gia buổi phỏng vấn để trao đổi chi tiết hơn về công việc.
      </p>
      ${rows ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin:0 0 16px"><table style="border-collapse:collapse;width:100%">${rows}</table></div>` : ''}
      ${p.interviewNote ? `<p style="margin:0 0 14px;color:#374151;line-height:1.75;font-size:14px"><strong>Lưu ý:</strong> ${this.esc(p.interviewNote)}</p>` : ''}
      <p style="margin:0 0 14px;color:#374151;line-height:1.75;font-size:14px">Vui lòng xác nhận sự tham gia của bạn bằng cách phản hồi email này. Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
      <p style="margin:0 0 14px;color:#374151;line-height:1.75;font-size:14px">Rất mong được gặp bạn trong buổi phỏng vấn!</p>
      <p style="margin:20px 0 0;color:#374151;font-size:14px">
        Trân trọng,<br/>
        <strong style="color:#111827">Bộ phận Nhân sự</strong><br/>
        <span style="color:#6b7280;font-size:13px">${this.esc(p.companyName)}</span>
      </p>
    `;
  }

  async sendOfferLetter(params: {
    candidateEmail: string; candidateName: string; jobTitle: string;
    companyName: string; companyLogoUrl?: string;
    subject?: string; customBody?: string;
    offerSalary?: string; offerStartDate?: string; offerProbation?: string; offerNote?: string;
  }) {
    const { candidateEmail, candidateName, jobTitle, companyName, companyLogoUrl, subject, customBody, offerSalary, offerStartDate, offerProbation, offerNote } = params;
    const emailSubject = subject || `[${companyName}] Thư thông báo kết quả tuyển dụng – ${jobTitle}`;
    const logoBlock = companyLogoUrl
      ? `<img src="${companyLogoUrl}" alt="${this.esc(companyName)}" style="height:40px;max-width:150px;object-fit:contain;border-radius:6px;background:#f3f4f6;padding:4px" />`
      : `<div style="width:40px;height:40px;border-radius:8px;background:#374151;display:inline-flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:18px;vertical-align:middle">${(companyName[0] || 'C').toUpperCase()}</div>`;

    const dateStr = offerStartDate
      ? new Date(offerStartDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : null;

    const rows = [
      offerSalary ? `<tr><td style="padding:7px 0;color:#6b7280;font-size:13px;padding-right:20px;vertical-align:top">Mức lương</td><td style="padding:7px 0;font-weight:700;color:#059669;font-size:13px">${this.esc(offerSalary)}</td></tr>` : '',
      dateStr ? `<tr><td style="padding:7px 0;color:#6b7280;font-size:13px;padding-right:20px">Ngày bắt đầu</td><td style="padding:7px 0;font-weight:600;color:#111827;font-size:13px">${dateStr}</td></tr>` : '',
      offerProbation ? `<tr><td style="padding:7px 0;color:#6b7280;font-size:13px;padding-right:20px">Thử việc</td><td style="padding:7px 0;font-weight:600;color:#111827;font-size:13px">${this.esc(offerProbation)}</td></tr>` : '',
    ].filter(Boolean).join('');

    const bodyHtml = customBody ? this.plainToHtml(customBody) : `
      <p style="margin:0 0 12px;color:#374151;line-height:1.75;font-size:14px">Kính gửi <strong>${this.esc(candidateName)}</strong>,</p>
      <p style="margin:0 0 14px;color:#374151;line-height:1.75;font-size:14px">Thay mặt <strong>${this.esc(companyName)}</strong>, chúng tôi vui mừng thông báo bạn đã vượt qua vòng phỏng vấn và được nhận vào vị trí <strong>${this.esc(jobTitle)}</strong>.</p>
      ${rows ? `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:14px 18px;margin:0 0 16px"><table style="border-collapse:collapse;width:100%">${rows}</table></div>` : ''}
      ${offerNote ? `<p style="margin:0 0 14px;color:#374151;line-height:1.75;font-size:14px"><strong>Lưu ý:</strong> ${this.esc(offerNote)}</p>` : ''}
      <p style="margin:0 0 14px;color:#374151;line-height:1.75;font-size:14px">Vui lòng xác nhận nhận việc bằng cách phản hồi email này.</p>
      <p style="margin:0 0 14px;color:#374151;line-height:1.75;font-size:14px">Chúng tôi rất mong được chào đón bạn gia nhập đội ngũ!</p>
      <p style="margin:20px 0 0;color:#374151;font-size:14px">Trân trọng,<br/><strong>${this.esc(companyName)}</strong><br/><span style="color:#6b7280;font-size:13px">Bộ phận Nhân sự</span></p>
    `;

    await this.mailer.sendMail({
      to: candidateEmail,
      subject: emailSubject,
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10)">
        <div style="padding:20px 32px;background:#fafafa;border-bottom:3px solid #00b14f;display:table;width:100%;box-sizing:border-box">
          <div style="display:table-cell;vertical-align:middle;padding-right:16px">${logoBlock}</div>
          <div style="display:table-cell;vertical-align:middle"><div style="font-size:17px;font-weight:700;color:#111827">${this.esc(companyName)}</div><div style="font-size:12px;color:#00b14f;font-weight:600;margin-top:2px">Thư mời nhận việc</div></div>
        </div>
        <div style="padding:28px 32px">${bodyHtml}</div>
        <div style="background:#f9fafb;padding:14px 32px;border-top:1px solid #f3f4f6;text-align:center"><div style="font-size:12px;color:#9ca3af">Email gửi tự động qua <strong style="color:#6b7280">TopCV Clone</strong>.</div></div>
      </div>`,
    });
  }

  async sendRejectionLetter(params: {
    candidateEmail: string; candidateName: string; jobTitle: string;
    companyName: string; companyLogoUrl?: string;
    subject?: string; customBody?: string;
  }) {
    const { candidateEmail, candidateName, jobTitle, companyName, companyLogoUrl, subject, customBody } = params;
    const emailSubject = subject || `[${companyName}] Kết quả ứng tuyển vị trí ${jobTitle}`;
    const logoBlock = companyLogoUrl
      ? `<img src="${companyLogoUrl}" alt="${this.esc(companyName)}" style="height:40px;max-width:150px;object-fit:contain;border-radius:6px;background:#f3f4f6;padding:4px" />`
      : `<div style="width:40px;height:40px;border-radius:8px;background:#374151;display:inline-flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:18px;vertical-align:middle">${(companyName[0] || 'C').toUpperCase()}</div>`;

    const bodyHtml = customBody ? this.plainToHtml(customBody) : `
      <p style="margin:0 0 12px;color:#374151;line-height:1.75;font-size:14px">Kính gửi <strong>${this.esc(candidateName)}</strong>,</p>
      <p style="margin:0 0 14px;color:#374151;line-height:1.75;font-size:14px">Cảm ơn bạn đã dành thời gian tham gia phỏng vấn cho vị trí <strong>${this.esc(jobTitle)}</strong> tại <strong>${this.esc(companyName)}</strong>.</p>
      <p style="margin:0 0 14px;color:#374151;line-height:1.75;font-size:14px">Sau khi cân nhắc kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu tuyển dụng hiện tại của chúng tôi.</p>
      <p style="margin:0 0 14px;color:#374151;line-height:1.75;font-size:14px">Chúng tôi trân trọng sự quan tâm của bạn và sẽ lưu lại thông tin để xem xét trong tương lai nếu có vị trí phù hợp hơn.</p>
      <p style="margin:0 0 14px;color:#374151;line-height:1.75;font-size:14px">Chúc bạn thành công trong quá trình tìm kiếm công việc!</p>
      <p style="margin:20px 0 0;color:#374151;font-size:14px">Trân trọng,<br/><strong>${this.esc(companyName)}</strong><br/><span style="color:#6b7280;font-size:13px">Bộ phận Nhân sự</span></p>
    `;

    await this.mailer.sendMail({
      to: candidateEmail,
      subject: emailSubject,
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10)">
        <div style="padding:20px 32px;background:#fafafa;border-bottom:3px solid #374151;display:table;width:100%;box-sizing:border-box">
          <div style="display:table-cell;vertical-align:middle;padding-right:16px">${logoBlock}</div>
          <div style="display:table-cell;vertical-align:middle"><div style="font-size:17px;font-weight:700;color:#111827">${this.esc(companyName)}</div><div style="font-size:12px;color:#6b7280;font-weight:600;margin-top:2px">Kết quả ứng tuyển</div></div>
        </div>
        <div style="padding:28px 32px">${bodyHtml}</div>
        <div style="background:#f9fafb;padding:14px 32px;border-top:1px solid #f3f4f6;text-align:center"><div style="font-size:12px;color:#9ca3af">Email gửi tự động qua <strong style="color:#6b7280">TopCV Clone</strong>.</div></div>
      </div>`,
    });
  }

  async sendQuizAssigned(params: {
    to: string;
    candidateName: string;
    jobTitle: string;
    quizTitle: string;
    durationMinutes: number;
    totalPoints: number;
    endsAt?: Date | null;
    testUrl: string;
  }) {
    const { to, candidateName, jobTitle, quizTitle, durationMinutes, totalPoints, endsAt, testUrl } = params;
    await this.mailer.sendMail({
      to,
      subject: `[TopCV] Bài kiểm tra mới: ${quizTitle}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:40px auto;background:#fff;border-radius:8px;padding:32px;border:1px solid #e2e8f0">
          <div style="color:#00b14f;font-size:22px;font-weight:bold;margin-bottom:16px">TopCV Clone</div>
          <h2 style="font-size:18px;color:#1e293b">Bạn có bài kiểm tra mới!</h2>
          <p style="color:#475569">Xin chào <strong>${candidateName}</strong>,</p>
          <p style="color:#475569">Nhà tuyển dụng đã gửi cho bạn một bài kiểm tra cho vị trí <strong>${jobTitle}</strong>:</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0;font-size:16px;font-weight:bold;color:#166534">${quizTitle}</p>
            <p style="margin:8px 0 0;color:#475569;font-size:13px">
              Thời gian: ${durationMinutes} phút &nbsp;|&nbsp; Tổng điểm: ${totalPoints}
              ${endsAt ? `&nbsp;|&nbsp; Hạn nộp: ${endsAt.toLocaleString('vi-VN')}` : ''}
            </p>
          </div>
          <a href="${testUrl}" style="display:inline-block;background:#00b14f;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">Làm bài kiểm tra ngay</a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">Nếu bạn không phải ứng viên này, vui lòng bỏ qua email.</p>
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
