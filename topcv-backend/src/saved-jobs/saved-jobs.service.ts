import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedJobsService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: string, jobId: string) {
    const existing = await (this.prisma as any).savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });

    if (existing) {
      await (this.prisma as any).savedJob.delete({
        where: { userId_jobId: { userId, jobId } },
      });
      return { data: { saved: false } };
    }

    await (this.prisma as any).savedJob.create({
      data: { userId, jobId },
    });
    return { data: { saved: true } };
  }

  async check(userId: string, jobId: string) {
    const existing = await (this.prisma as any).savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
      select: { id: true },
    });
    return { data: { saved: !!existing } };
  }

  async findMySaved(userId: string, query: any) {
    const { page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const [total, items] = await Promise.all([
      (this.prisma as any).savedJob.count({ where: { userId } }),
      (this.prisma as any).savedJob.findMany({
        where: { userId },
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
              isActive: true,
              deadline: true,
              locations: true,
              company: { select: { companyName: true, logo: true } },
            },
          },
        },
      }),
    ]);

    return { data: items, total, page: Number(page), limit: Number(limit) };
  }
}
