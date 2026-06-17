import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  @Cron('*/5 * * * *')
  async sendMeetingReminders() {
    const now = new Date();
    const from = new Date(now.getTime() + 55 * 60 * 1000);
    const to = new Date(now.getTime() + 65 * 60 * 1000);

    // ── Video meeting reminders ───────────────────────────────────────────────
    const upcomingMeetings = await this.prisma.meeting.findMany({
      where: {
        scheduledAt: { gte: from, lte: to },
        reminderSent: false,
        status: { not: 'ended' },
      },
      include: {
        hostEmployer: { select: { userId: true, companyName: true } },
        candidate: { select: { id: true } },
      },
    });

    for (const meeting of upcomingMeetings) {
      const timeStr = meeting.scheduledAt!.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const title = meeting.title || 'Phỏng vấn video';

      // Notify candidate
      this.notifications.create(meeting.candidateId, {
        type: 'MEETING_REMINDER',
        title: `Nhắc lịch: ${title} lúc ${timeStr}`,
        body: `${meeting.hostEmployer.companyName || 'Nhà tuyển dụng'} đang chờ bạn trong 1 giờ nữa`,
        url: `/meet/${meeting.roomCode}`,
      }).catch(() => {});

      // Notify employer
      this.notifications.create(meeting.hostEmployer.userId, {
        type: 'MEETING_REMINDER',
        title: `Nhắc lịch: ${title} lúc ${timeStr}`,
        body: 'Bạn có buổi phỏng vấn video trong 1 giờ nữa',
        url: `/meet/${meeting.roomCode}`,
      }).catch(() => {});

      // Mark sent
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
        candidate: { select: { id: true } },
        job: {
          select: {
            title: true,
            employer: { select: { userId: true, companyName: true } },
          },
        },
      },
    });

    for (const app of upcomingInterviews) {
      const timeStr = app.interviewAt!.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const jobTitle = app.job?.title || 'vị trí ứng tuyển';
      const companyName = app.job?.employer?.companyName || 'Nhà tuyển dụng';

      // Notify candidate
      this.notifications.create(app.candidateId, {
        type: 'INTERVIEW_REMINDER',
        title: `Nhắc lịch phỏng vấn lúc ${timeStr}`,
        body: `Bạn có lịch phỏng vấn ${jobTitle} tại ${companyName} trong 1 giờ nữa`,
        url: '/viec-da-ung-tuyen',
      }).catch(() => {});

      // Notify employer
      if (app.job?.employer?.userId) {
        this.notifications.create(app.job.employer.userId, {
          type: 'INTERVIEW_REMINDER',
          title: `Nhắc lịch phỏng vấn lúc ${timeStr}`,
          body: `Bạn có lịch phỏng vấn ứng viên cho vị trí ${jobTitle} trong 1 giờ nữa`,
          url: '/nha-tuyen-dung/lich-phong-van',
        }).catch(() => {});
      }

      // Mark sent
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
