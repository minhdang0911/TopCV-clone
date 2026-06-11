import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { neon } from '@neondatabase/serverless';

const STATUS_NOTIF: Record<string, { title: string; body: string }> = {
  REVIEWING: { title: 'Hồ sơ đang được xem xét', body: 'Nhà tuyển dụng đang xem hồ sơ của bạn.' },
  INTERVIEW: { title: 'Bạn được mời phỏng vấn!', body: 'Nhà tuyển dụng muốn gặp bạn. Kiểm tra chi tiết ngay.' },
  OFFERED:   { title: 'Chúc mừng! Bạn nhận được Offer!', body: 'Nhà tuyển dụng đã gửi thư mời làm việc cho bạn.' },
  REJECTED:  { title: 'Cập nhật đơn ứng tuyển', body: 'Rất tiếc, vị trí này không phù hợp với bạn lúc này.' },
};

@Injectable()
export class ApplicationsService {
  private sql = neon(process.env.DATABASE_URL!);

  constructor(
    private prisma: PrismaService,
    private firebase: FirebaseService,
    private users: UsersService,
    private notifications: NotificationsService,
    private mail: MailService,
  ) {}

  private async attachCoverLetterFiles(items: any[]) {
    const ids = items.map((a) => a.id);
    if (!ids.length) return;
    const rows = await this.sql`
      SELECT id, cover_letter_file_url FROM applications WHERE id = ANY(${ids}::text[])
    `;
    const map: Record<string, string | null> = {};
    for (const r of rows) map[r.id] = r.cover_letter_file_url ?? null;
    for (const item of items) item.coverLetterFileUrl = map[item.id] ?? null;
  }

  // Candidate: apply to a job
  async apply(candidateId: string, body: any) {
    const { jobId, jobLocationId, resumeId, cvFileUrl, coverLetter, coverLetterId, coverLetterFileUrl } = body;

    const job = await (this.prisma as any).job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, isActive: true, deadline: true, employerId: true },
    });
    if (!job) throw new NotFoundException('Không tìm thấy việc làm');
    if (!job.isActive) throw new BadRequestException('Tin tuyển dụng đã đóng');
    if (job.deadline && new Date(job.deadline) < new Date()) {
      throw new BadRequestException('Đã hết hạn nộp hồ sơ');
    }

    const existing = await (this.prisma as any).application.findUnique({
      where: { jobId_candidateId: { jobId, candidateId } },
    });
    if (existing) throw new BadRequestException('Bạn đã ứng tuyển vị trí này rồi');

    const application = await (this.prisma as any).application.create({
      data: {
        jobId,
        candidateId,
        locationId: jobLocationId || null,
        resumeId: resumeId || null,
        cvFileUrl: cvFileUrl || null,
        coverLetter: coverLetter || null,
        coverLetterId: coverLetterId || null,
        status: 'PENDING',
      },
      include: {
        job: { select: { id: true, title: true } },
      },
    });

    // Persist cover letter file URL (not in Prisma schema — raw SQL)
    if (coverLetterFileUrl) {
      await this.sql`
        UPDATE applications SET cover_letter_file_url = ${coverLetterFileUrl}
        WHERE id = ${application.id}
      `;
      application.coverLetterFileUrl = coverLetterFileUrl;
    }

    // Notify employer in real-time (fire-and-forget)
    (this.prisma as any).employerProfile
      .findUnique({ where: { id: job.employerId }, select: { userId: true } })
      .then((profile: any) => {
        if (profile?.userId) {
          this.notifications.create(profile.userId, {
            type: 'APPLICATION_RECEIVED',
            title: 'Có hồ sơ ứng tuyển mới',
            body: `Một ứng viên vừa nộp hồ sơ vào vị trí "${job.title}"`,
            url: '/nha-tuyen-dung/ho-so-ung-vien',
            data: { applicationId: application.id, jobId: job.id },
          });
        }
      })
      .catch(() => {});

    return { data: application };
  }

  // Candidate: list their own applications
  async findMyApplications(candidateId: string, query: any) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { candidateId };
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      (this.prisma as any).application.count({ where }),
      (this.prisma as any).application.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              salaryMin: true,
              salaryMax: true,
              salaryType: true,
              jobType: true,
              locations: true,
              company: { select: { companyName: true, logo: true } },
            },
          },
          resume: { select: { id: true, title: true } },
          location: true,
        },
      }),
    ]);

    return { data: items, total, page: Number(page), limit: Number(limit) };
  }

  private async resolveEmployerProfileId(userId: string): Promise<string> {
    const profile = await (this.prisma as any).employerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) throw new ForbiddenException('Không tìm thấy hồ sơ nhà tuyển dụng');
    return profile.id;
  }

  private async attachCoverLetters(items: any[]) {
    const ids = [...new Set(items.map((a) => a.coverLetterId).filter(Boolean))];
    if (!ids.length) return;
    const cls = await (this.prisma as any).coverLetter.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true },
    });
    const clMap: Record<string, any> = {};
    for (const cl of cls) clMap[cl.id] = cl;
    for (const item of items) {
      item.coverLetterDoc = item.coverLetterId ? (clMap[item.coverLetterId] ?? null) : null;
    }
  }

  // Employer: list applications for a specific job
  async findByJob(employerId: string, jobId: string, query: any) {
    const employerProfileId = await this.resolveEmployerProfileId(employerId);
    const job = await (this.prisma as any).job.findFirst({
      where: { id: jobId, employerId: employerProfileId },
      select: { id: true },
    });
    if (!job) throw new ForbiddenException('Không có quyền truy cập');

    const { status, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { jobId };
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      (this.prisma as any).application.count({ where }),
      (this.prisma as any).application.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          candidate: {
            select: {
              id: true,
              email: true,
              phone: true,
              candidateProfile: { select: { fullName: true, avatarUrl: true } },
            },
          },
          resume: { select: { id: true, title: true } },
          location: true,
        },
      }),
    ]);

    await this.attachCoverLetters(items);
    await this.attachCoverLetterFiles(items);
    return { data: items, total, page: Number(page), limit: Number(limit) };
  }

  // Employer: list all applications across their jobs
  async findAllByEmployer(employerId: string, query: any) {
    const employerProfileId = await this.resolveEmployerProfileId(employerId);
    const { status, jobId, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get all job IDs owned by this employer
    const jobs = await (this.prisma as any).job.findMany({
      where: { employerId: employerProfileId },
      select: { id: true },
    });
    const jobIds = jobs.map((j: any) => j.id);

    const where: any = { jobId: { in: jobIds } };
    if (status) where.status = status;
    if (jobId && jobIds.includes(jobId)) where.jobId = jobId;

    const [total, items] = await Promise.all([
      (this.prisma as any).application.count({ where }),
      (this.prisma as any).application.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          job: { select: { id: true, title: true } },
          candidate: {
            select: {
              id: true,
              email: true,
              phone: true,
              candidateProfile: { select: { fullName: true, avatarUrl: true } },
            },
          },
          resume: { select: { id: true, title: true } },
          location: true,
        },
      }),
    ]);

    await this.attachCoverLetters(items);
    await this.attachCoverLetterFiles(items);
    return { data: items, total, page: Number(page), limit: Number(limit) };
  }

  // Employer: update application status
  async updateStatus(employerId: string, applicationId: string, body: any) {
    const employerProfileId = await this.resolveEmployerProfileId(employerId);
    const {
      status, note, sendEmail,
      interviewDate, interviewTime, interviewLocation, interviewType, interviewNote,
      offerSalary, offerStartDate, offerProbation, offerNote,
      emailSubject, emailBody,
    } = body;

    const app = await (this.prisma as any).application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            employerId: true,
            title: true,
            employer: { select: { companyName: true, logoUrl: true } },
          },
        },
        candidate: {
          select: {
            email: true,
            candidateProfile: { select: { fullName: true } },
          },
        },
      },
    });
    if (!app) throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    if (app.job.employerId !== employerProfileId) {
      throw new ForbiddenException('Không có quyền cập nhật');
    }

    const validStatuses = ['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    const updated = await (this.prisma as any).application.update({
      where: { id: applicationId },
      data: { status, note: note || null },
    });

    // WebSocket in-app notification to candidate
    const notif = STATUS_NOTIF[status];
    if (notif) {
      this.notifications.create(app.candidateId, {
        type: 'APPLICATION_STATUS',
        title: notif.title,
        body: `${app.job.title} — ${notif.body}`,
        url: '/viec-da-ung-tuyen',
        data: { applicationId, status },
      }).catch(() => {});
    }

    // FCM push notification to candidate
    this.users.getFcmToken(app.candidateId).then((token) => {
      if (token) {
        this.firebase.sendApplicationStatusNotification(token, app.job.title, status);
      }
    });

    const candidateEmail = app.candidate?.email;
    const candidateName = app.candidate?.candidateProfile?.fullName || candidateEmail || '';
    const jobTitle = app.job.title;
    const companyName = app.job.employer?.companyName || 'Nhà tuyển dụng';
    const companyLogoUrl = app.job.employer?.logoUrl ?? undefined;

    if (sendEmail && candidateEmail) {
      if (status === 'INTERVIEW') {
        this.mail.sendInterviewInvite({
          candidateEmail, candidateName, jobTitle, companyName, companyLogoUrl,
          subject: emailSubject, customBody: emailBody,
          interviewDate, interviewTime, interviewLocation, interviewType, interviewNote,
        }).catch(() => {});
      } else if (status === 'OFFERED') {
        this.mail.sendOfferLetter({
          candidateEmail, candidateName, jobTitle, companyName, companyLogoUrl,
          subject: emailSubject, customBody: emailBody,
          offerSalary, offerStartDate, offerProbation, offerNote,
        }).catch(() => {});
      } else if (status === 'REJECTED') {
        this.mail.sendRejectionLetter({
          candidateEmail, candidateName, jobTitle, companyName, companyLogoUrl,
          subject: emailSubject, customBody: emailBody,
        }).catch(() => {});
      }
    }

    return { data: updated };
  }

  // Candidate: withdraw application
  async withdraw(candidateId: string, applicationId: string) {
    const app = await (this.prisma as any).application.findUnique({
      where: { id: applicationId },
      select: { candidateId: true, status: true },
    });
    if (!app) throw new NotFoundException('Không tìm thấy đơn ứng tuyển');
    if (app.candidateId !== candidateId) {
      throw new ForbiddenException('Không có quyền');
    }
    if (app.status !== 'PENDING') {
      throw new BadRequestException('Chỉ có thể rút đơn ở trạng thái Chờ duyệt');
    }

    await (this.prisma as any).application.delete({ where: { id: applicationId } });
    return { message: 'Đã rút đơn ứng tuyển' };
  }

  // Check if candidate already applied
  async checkApplied(candidateId: string, jobId: string) {
    const app = await (this.prisma as any).application.findUnique({
      where: { jobId_candidateId: { jobId, candidateId } },
      select: { id: true, status: true },
    });
    return { data: app };
  }
}
