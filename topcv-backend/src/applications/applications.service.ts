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

const STATUS_NOTIF: Record<string, { title: string; body: string }> = {
  REVIEWING: { title: 'Hồ sơ đang được xem xét', body: 'Nhà tuyển dụng đang xem hồ sơ của bạn.' },
  INTERVIEW: { title: 'Bạn được mời phỏng vấn!', body: 'Nhà tuyển dụng muốn gặp bạn. Kiểm tra chi tiết ngay.' },
  OFFERED:   { title: 'Chúc mừng! Bạn nhận được Offer!', body: 'Nhà tuyển dụng đã gửi thư mời làm việc cho bạn.' },
  REJECTED:  { title: 'Cập nhật đơn ứng tuyển', body: 'Rất tiếc, vị trí này không phù hợp với bạn lúc này.' },
};

@Injectable()
export class ApplicationsService {
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
    const rows = await (this.prisma as any).application.findMany({
      where: { id: { in: ids } },
      select: { id: true, coverLetterFileUrl: true },
    });
    const map: Record<string, string | null> = {};
    for (const r of rows) map[r.id] = r.coverLetterFileUrl ?? null;
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
        coverLetterFileUrl: coverLetterFileUrl || null,
        status: 'PENDING',
      },
      include: {
        job: { select: { id: true, title: true } },
      },
    });

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
              industryId: true,
              locations: true,
              employer: { select: { id: true, companyName: true, logoUrl: true } },
            },
          },
          resume: { select: { id: true, title: true } },
          location: true,
          meetings: {
            select: {
              id: true, roomCode: true, title: true,
              scheduledAt: true, status: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
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

  async getCandidateInterviews(candidateId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const items = await (this.prisma as any).application.findMany({
      where: {
        candidateId,
        status: 'INTERVIEW',
        interviewAt: { gte: start, lte: end },
      },
      include: {
        job: {
          select: {
            id: true, title: true, slug: true,
            employer: { select: { companyName: true, logoUrl: true } },
          },
        },
        meetings: {
          select: { roomCode: true, status: true, scheduledAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { interviewAt: 'asc' },
    });

    return { data: items };
  }

  async getApplicationReport(employerId: string, period: 'daily' | 'monthly' = 'daily') {
    const employer = await this.prisma.employerProfile.findUnique({ where: { userId: employerId } });
    if (!employer) throw new ForbiddenException();

    const apps = await (this.prisma as any).application.findMany({
      where: { job: { employerId: employer.id } },
      select: {
        id: true, status: true, createdAt: true, jobId: true,
        job: { select: { title: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Status funnel counts
    const STATUSES = ['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN'];
    const statusCounts: Record<string, number> = {};
    for (const s of STATUSES) statusCounts[s] = 0;
    for (const app of apps) {
      if (statusCounts[app.status] !== undefined) statusCounts[app.status]++;
    }

    // Time series
    const now = new Date();
    const timeSeries: any[] = [];
    if (period === 'monthly') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        timeSeries.push({
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          label: `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`,
          total: 0, INTERVIEW: 0, OFFERED: 0, REJECTED: 0,
        });
      }
      for (const app of apps) {
        const d = new Date(app.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const m = timeSeries.find(x => x.key === key);
        if (m) {
          m.total++;
          if (m[app.status] !== undefined) m[app.status]++;
        }
      }
    } else {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        timeSeries.push({
          key: d.toISOString().split('T')[0],
          label: `${d.getDate()}/${d.getMonth() + 1}`,
          total: 0, INTERVIEW: 0, OFFERED: 0, REJECTED: 0,
        });
      }
      for (const app of apps) {
        const key = new Date(app.createdAt).toISOString().split('T')[0];
        const m = timeSeries.find(x => x.key === key);
        if (m) {
          m.total++;
          if (m[app.status] !== undefined) m[app.status]++;
        }
      }
    }

    // Per-job breakdown
    const jobMap = new Map<string, any>();
    for (const app of apps) {
      if (!jobMap.has(app.jobId)) {
        jobMap.set(app.jobId, {
          jobId: app.jobId, jobTitle: app.job?.title || '—',
          total: 0, PENDING: 0, REVIEWING: 0, INTERVIEW: 0, OFFERED: 0, REJECTED: 0, WITHDRAWN: 0,
        });
      }
      const j = jobMap.get(app.jobId);
      j.total++;
      if (j[app.status] !== undefined) j[app.status]++;
    }
    const perJob = Array.from(jobMap.values()).sort((a, b) => b.total - a.total);

    return { statusCounts, timeSeries, perJob, total: apps.length };
  }

  async getInterviewSchedule(employerId: string, month: number, year: number) {
    const employerProfileId = await this.resolveEmployerProfileId(employerId);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const items = await (this.prisma as any).application.findMany({
      where: {
        status: 'INTERVIEW',
        interviewAt: { gte: start, lte: end },
        job: { employerId: employerProfileId },
      },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            candidateProfile: { select: { fullName: true, avatarUrl: true } },
          },
        },
        job: { select: { id: true, title: true } },
      },
      orderBy: { interviewAt: 'asc' },
    });

    return { data: items };
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
          job: { select: { id: true, title: true, employerId: true } },
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

    const statusChanged = app.status !== status;

    const interviewData = status === 'INTERVIEW' ? {
      interviewAt: (interviewDate && interviewTime)
        ? new Date(`${interviewDate}T${interviewTime}`)
        : interviewDate ? new Date(`${interviewDate}T09:00`) : null,
      interviewLocation: interviewLocation || null,
      interviewType: interviewType || null,
    } : {};

    const updated = await (this.prisma as any).application.update({
      where: { id: applicationId },
      data: { status, note: note || null, ...interviewData },
    });

    // Only send notifications when status actually changes
    if (statusChanged) {
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
    }

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

  // Employer: get urgent items for dashboard widget
  async getUrgentItems(userId: string) {
    const employer = await this.prisma.employerProfile.findFirst({ where: { userId } });
    if (!employer) return { data: { pendingApplications: [], upcomingMeetings: [] } };

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [pendingApplications, upcomingMeetings] = await Promise.all([
      (this.prisma as any).application.findMany({
        where: {
          status: 'REVIEWING',
          createdAt: { gte: sevenDaysAgo },
          job: { employerId: employer.id },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          candidate: { select: { id: true, candidateProfile: { select: { fullName: true, avatarUrl: true } } } },
          job: { select: { id: true, title: true } },
        },
      }),
      (this.prisma as any).meeting.findMany({
        where: {
          hostEmployerId: employer.id,
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          status: { not: 'ended' },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
        include: {
          candidate: { select: { id: true, candidateProfile: { select: { fullName: true, avatarUrl: true } } } },
        },
      }),
    ]);

    return { data: { pendingApplications, upcomingMeetings } };
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
