import { Injectable } from '@nestjs/common';
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
}
