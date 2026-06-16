import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(userId: string, dto: { topic: string; description: string; rating: number }) {
    const feedback = await this.prisma.feedback.create({
      data: { userId, topic: dto.topic, description: dto.description, rating: dto.rating },
    });
    return { data: feedback };
  }

  async findMy(userId: string, query: { page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, topic: true, description: true, rating: true,
          createdAt: true, replyText: true, repliedAt: true,
        },
      }),
      this.prisma.feedback.count({ where: { userId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findAll(query: { page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.feedback.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, candidateProfile: { select: { fullName: true, avatarUrl: true } } } },
        },
      }),
      this.prisma.feedback.count(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async reply(adminUserId: string, feedbackId: string, replyText: string) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id: feedbackId } });
    if (!feedback) throw new NotFoundException('Feedback không tồn tại');

    const updated = await this.prisma.feedback.update({
      where: { id: feedbackId },
      data: { replyText, repliedAt: new Date(), repliedBy: adminUserId },
    });

    this.notifications.create(feedback.userId, {
      type: 'FEEDBACK_REPLY',
      title: 'Phản hồi của bạn đã được trả lời',
      body: replyText.length > 80 ? replyText.slice(0, 80) + '...' : replyText,
      url: '/phan-hoi',
    }).catch(() => {});

    return { data: updated };
  }
}
