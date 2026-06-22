import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private mail: MailService,
  ) {}

  @Cron('*/5 * * * *')
  async sendMeetingReminders() {
    const now = new Date();
    const from = new Date(now.getTime() + 55 * 60 * 1000);
    const to = new Date(now.getTime() + 65 * 60 * 1000);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // ── Video meeting reminders ───────────────────────────────────────────────
    const upcomingMeetings = await this.prisma.meeting.findMany({
      where: {
        scheduledAt: { gte: from, lte: to },
        reminderSent: false,
        status: { not: 'ended' },
      },
      include: {
        hostEmployer: {
          select: {
            userId: true,
            companyName: true,
            user: { select: { email: true } },
          },
        },
        candidate: {
          select: {
            id: true,
            email: true,
            candidateProfile: { select: { fullName: true } },
          },
        },
      },
    });

    for (const meeting of upcomingMeetings) {
      const timeStr = meeting.scheduledAt!.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const title = meeting.title || 'Phong van video';
      const companyName = meeting.hostEmployer.companyName || 'Nha tuyen dung';
      const meetingUrl = `${frontendUrl}/meet/${meeting.roomCode}`;

      this.notifications.create(meeting.candidateId, {
        type: 'MEETING_REMINDER',
        title: `Nhac lich: ${title} luc ${timeStr}`,
        body: `${companyName} dang cho ban trong 1 gio nua`,
        url: `/meet/${meeting.roomCode}`,
      }).catch(() => {});

      if (meeting.candidate.email) {
        this.mail.sendMeetingReminder({
          to: meeting.candidate.email,
          name: meeting.candidate.candidateProfile?.fullName || meeting.candidate.email,
          title,
          scheduledAt: meeting.scheduledAt as Date,
          meetingUrl,
          companyName,
          role: 'candidate',
        }).catch(() => {});
      }

      this.notifications.create(meeting.hostEmployer.userId, {
        type: 'MEETING_REMINDER',
        title: `Nhac lich: ${title} luc ${timeStr}`,
        body: 'Ban co buoi phong van video trong 1 gio nua',
        url: `/meet/${meeting.roomCode}`,
      }).catch(() => {});

      if (meeting.hostEmployer.user?.email) {
        this.mail.sendMeetingReminder({
          to: meeting.hostEmployer.user.email,
          name: companyName,
          title,
          scheduledAt: meeting.scheduledAt as Date,
          meetingUrl,
          companyName,
          role: 'employer',
        }).catch(() => {});
      }

      await this.prisma.meeting.update({
        where: { id: meeting.id },
        data: { reminderSent: true },
      });
    }

    if (upcomingMeetings.length > 0) {
      this.logger.log(`Sent meeting reminders for ${upcomingMeetings.length} meeting(s)`);
    }

    // ── Interview appointment reminders ───────────────────────────────────────
    const upcomingInterviews = await (this.prisma as any).application.findMany({
      where: {
        status: 'INTERVIEW',
        interviewAt: { gte: from, lte: to },
        interviewReminderSent: false,
      },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            candidateProfile: { select: { fullName: true } },
          },
        },
        job: {
          select: {
            title: true,
            employer: {
              select: {
                userId: true,
                companyName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
    });

    for (const app of upcomingInterviews) {
      const timeStr = app.interviewAt!.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const jobTitle = app.job?.title || 'vi tri ung tuyen';
      const companyName = app.job?.employer?.companyName || 'Nha tuyen dung';

      this.notifications.create(app.candidateId, {
        type: 'INTERVIEW_REMINDER',
        title: `Nhac lich phong van luc ${timeStr}`,
        body: `Ban co lich phong van ${jobTitle} tai ${companyName} trong 1 gio nua`,
        url: '/viec-da-ung-tuyen',
      }).catch(() => {});

      if (app.candidate?.email) {
        this.mail.sendInterviewReminder({
          to: app.candidate.email,
          name: app.candidate.candidateProfile?.fullName || app.candidate.email,
          jobTitle,
          companyName,
          interviewAt: app.interviewAt,
          role: 'candidate',
          profileUrl: `${frontendUrl}/viec-da-ung-tuyen`,
        }).catch(() => {});
      }

      if (app.job?.employer?.userId) {
        this.notifications.create(app.job.employer.userId, {
          type: 'INTERVIEW_REMINDER',
          title: `Nhac lich phong van luc ${timeStr}`,
          body: `Ban co lich phong van ung vien cho vi tri ${jobTitle} trong 1 gio nua`,
          url: '/nha-tuyen-dung/lich-phong-van',
        }).catch(() => {});

        if (app.job.employer.user?.email) {
          this.mail.sendInterviewReminder({
            to: app.job.employer.user.email,
            name: companyName,
            jobTitle,
            companyName,
            interviewAt: app.interviewAt,
            role: 'employer',
            profileUrl: `${frontendUrl}/nha-tuyen-dung/lich-phong-van`,
          }).catch(() => {});
        }
      }

      await (this.prisma as any).application.update({
        where: { id: app.id },
        data: { interviewReminderSent: true },
      });
    }

    if (upcomingInterviews.length > 0) {
      this.logger.log(`Sent interview reminders for ${upcomingInterviews.length} interview(s)`);
    }
  }
}
