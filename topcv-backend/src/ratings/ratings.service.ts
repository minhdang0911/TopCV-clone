import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(fromUserId: string, body: {
    applicationId: string;
    score: number;
    comment?: string;
    type: 'EMPLOYER_TO_CANDIDATE' | 'CANDIDATE_TO_EMPLOYER';
  }) {
    const app = await this.prisma.application.findUnique({
      where: { id: body.applicationId },
      include: { job: { include: { employer: true } } },
    });
    if (!app) throw new NotFoundException('Application not found');

    let toUserId: string;
    if (body.type === 'EMPLOYER_TO_CANDIDATE') {
      const employer = await this.prisma.employerProfile.findFirst({ where: { userId: fromUserId } });
      if (!employer || app.job.employerId !== employer.id) throw new ForbiddenException();
      toUserId = app.candidateId;
    } else {
      if (app.candidateId !== fromUserId) throw new ForbiddenException();
      toUserId = app.job.employer.userId;
    }

    return this.prisma.rating.upsert({
      where: {
        fromUserId_applicationId_type: {
          fromUserId,
          applicationId: body.applicationId,
          type: body.type,
        },
      },
      create: {
        fromUserId,
        toUserId,
        applicationId: body.applicationId,
        score: body.score,
        comment: body.comment,
        type: body.type,
      },
      update: { score: body.score, comment: body.comment },
    });
  }

  async getForUser(userId: string, type: string) {
    const ratings = await this.prisma.rating.findMany({
      where: { toUserId: userId, type },
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: {
          include: { candidateProfile: true, employerProfile: true },
        },
        application: { include: { job: true } },
      },
    });
    const avg = ratings.length
      ? Math.round((ratings.reduce((s, r) => s + r.score, 0) / ratings.length) * 10) / 10
      : 0;
    return { ratings, avg, count: ratings.length };
  }

  async getMyRating(fromUserId: string, applicationId: string, type: string) {
    return this.prisma.rating.findUnique({
      where: { fromUserId_applicationId_type: { fromUserId, applicationId, type } },
    });
  }
}
