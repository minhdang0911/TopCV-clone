import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Redis } from '@upstash/redis';

@Injectable()
export class EmployersService {
  private _redis: Redis | null = null;

  private get redis(): Redis {
    if (!this._redis) {
      this._redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    }
    return this._redis;
  }

  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    industryId?: string;
    limit?: string;
    page?: string;
  }) {
    const limit = Math.min(Number(query.limit) || 12, 50);
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.industryId) {
      where.industryId = Number(query.industryId);
    }

    const cacheKey = `employers:${query.industryId ?? 'all'}:${page}:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const [raw, total] = await Promise.all([
      this.prisma.employerProfile.findMany({
        where,
        include: {
          industry: { select: { id: true, name: true, slug: true } },
          _count: { select: { jobs: { where: { isActive: true } } } },
        },
        orderBy: { jobs: { _count: 'desc' } },
        skip,
        take: limit,
      }),
      this.prisma.employerProfile.count({ where }),
    ]);

    const data = raw.map((e) => ({
      id: e.id,
      companyName: e.companyName,
      logoUrl: e.logoUrl ?? null,
      companySize: e.companySize ?? null,
      website: e.website ?? null,
      address: e.address ?? null,
      industryId: e.industryId ?? null,
      industryName: e.industry?.name ?? null,
      industrySlug: e.industry?.slug ?? null,
      jobCount: e._count.jobs,
    }));

    const result = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.redis.set(cacheKey, result, { ex: 300 });
    return result;
  }

  async findOne(id: string) {
    const company = await this.prisma.employerProfile.findUnique({
      where: { id },
      include: {
        industry: { select: { id: true, name: true, slug: true } },
        _count: {
          select: {
            jobs: { where: { isActive: true } },
            followers: true,
            reviews: true,
          },
        },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    const reviewStats = await this.prisma.companyReview.aggregate({
      where: { employerProfileId: id },
      _avg: { rating: true },
    });

    // Get similar companies in same industry
    const similar = company.industryId
      ? await this.prisma.employerProfile.findMany({
          where: {
            industryId: company.industryId,
            id: { not: id },
          },
          include: {
            _count: { select: { jobs: { where: { isActive: true } } } },
          },
          take: 8,
          orderBy: { jobs: { _count: 'desc' } },
        })
      : [];

    return {
      id: company.id,
      companyName: company.companyName,
      logoUrl: company.logoUrl ?? null,
      companySize: company.companySize ?? null,
      website: company.website ?? null,
      address: company.address ?? null,
      description: company.description ?? null,
      taxCode: company.taxCode ?? null,
      slug: company.slug ?? null,
      industryId: company.industryId ?? null,
      industryName: company.industry?.name ?? null,
      industrySlug: company.industry?.slug ?? null,
      jobCount: company._count.jobs,
      followerCount: company._count.followers,
      reviewCount: company._count.reviews,
      avgRating: reviewStats._avg.rating ?? null,
      similarCompanies: similar.map((s) => ({
        id: s.id,
        companyName: s.companyName,
        logoUrl: s.logoUrl ?? null,
        industryName: company.industry?.name ?? null,
        jobCount: s._count.jobs,
      })),
    };
  }

  async getJobs(
    id: string,
    query: { page?: string; limit?: string; keyword?: string },
  ) {
    const limit = Math.min(Number(query.limit) || 10, 50);
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;

    const company = await this.prisma.employerProfile.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    const where: any = {
      employerId: id,
      isActive: true,
    };
    if (query.keyword) {
      where.title = { contains: query.keyword, mode: 'insensitive' };
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        select: {
          id: true,
          title: true,
          salaryMin: true,
          salaryMax: true,
          salaryType: true,
          provinceName: true,
          workingType: true,
          deadline: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async follow(userId: string, employerProfileId: string) {
    const company = await this.prisma.employerProfile.findUnique({
      where: { id: employerProfileId },
      select: { id: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    try {
      await this.prisma.companyFollow.create({
        data: { userId, employerProfileId },
      });
    } catch {
      throw new ConflictException('Already following');
    }

    return { followed: true };
  }

  async unfollow(userId: string, employerProfileId: string) {
    await this.prisma.companyFollow.deleteMany({
      where: { userId, employerProfileId },
    });
    return { followed: false };
  }

  async getFollowStatus(userId: string, employerProfileId: string) {
    const follow = await this.prisma.companyFollow.findUnique({
      where: { userId_employerProfileId: { userId, employerProfileId } },
    });
    return { followed: !!follow };
  }

  async createReview(
    userId: string,
    employerProfileId: string,
    rating: number,
  ) {
    const company = await this.prisma.employerProfile.findUnique({
      where: { id: employerProfileId },
      select: { id: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    await this.prisma.companyReview.upsert({
      where: { userId_employerProfileId: { userId, employerProfileId } },
      create: { userId, employerProfileId, rating },
      update: { rating },
    });

    const stats = await this.prisma.companyReview.aggregate({
      where: { employerProfileId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      avgRating: stats._avg.rating,
      reviewCount: stats._count.rating,
    };
  }

  async getReviews(employerProfileId: string) {
    const [stats, distribution] = await Promise.all([
      this.prisma.companyReview.aggregate({
        where: { employerProfileId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      this.prisma.companyReview.groupBy({
        by: ['rating'],
        where: { employerProfileId },
        _count: { rating: true },
      }),
    ]);

    return {
      avgRating: stats._avg.rating ?? null,
      reviewCount: stats._count.rating,
      distribution: distribution.reduce(
        (acc, d) => {
          acc[d.rating] = d._count.rating;
          return acc;
        },
        {} as Record<number, number>,
      ),
    };
  }
}
