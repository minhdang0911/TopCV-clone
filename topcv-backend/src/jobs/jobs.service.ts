import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Redis } from '@upstash/redis';
import { Prisma, JobLevel, WorkingType, WorkingDays } from '@prisma/client';

@Injectable()
export class JobsService {
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

  private generateSlug(title: string, id: string): string {
    const base = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0111/g, 'd').replace(/\u0110/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    const short = id.replace(/-/g, '').slice(0, 8);
    return `${base}-${short}`;
  }

  private async logAudit(
    userId: string,
    action: string,
    entityId: string,
    oldData?: any,
    newData?: any,
    ipAddress?: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entity: 'Job',
        entityId,
        oldData,
        newData,
        ipAddress,
      },
    });
  }

  private async invalidateCache() {
    const keys = await this.redis.keys('jobs:*');
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => this.redis.del(key)));
    }
  }

  // â”€â”€â”€ STATS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // GET /jobs/stats
  // Tráº£ vá»: tá»•ng job Ä‘ang tuyá»ƒn, job má»›i hÃ´m nay, trend so hÃ´m qua

  async getStats() {
    const cacheKey = 'jobs:stats';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const now = new Date();

    // Äáº§u ngÃ y hÃ´m nay (00:00:00 giá» local UTC+7 â†’ dÃ¹ng UTC tháº³ng cho Ä‘Æ¡n giáº£n)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Äáº§u ngÃ y hÃ´m qua
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const [totalActive, newToday, newYesterday, totalCompanies] = await Promise.all([
      // Tá»•ng job Ä‘ang active
      this.prisma.job.count({
        where: { isActive: true },
      }),

      // Job má»›i táº¡o hÃ´m nay
      this.prisma.job.count({
        where: {
          isActive: true,
          createdAt: { gte: todayStart },
        },
      }),

      // Job má»›i táº¡o hÃ´m qua (Ä‘á»ƒ tÃ­nh trend)
      this.prisma.job.count({
        where: {
          isActive: true,
          createdAt: {
            gte: yesterdayStart,
            lt: todayStart,
          },
        },
      }),

      // Sá»‘ cÃ´ng ty Ä‘ang cÃ³ job tuyá»ƒn dá»¥ng
      this.prisma.employerProfile.count({
        where: { jobs: { some: { isActive: true } } },
      }),
    ]);

    // trend: 'up' | 'down' | 'stable'
    const trend =
      newToday > newYesterday
        ? 'up'
        : newToday < newYesterday
          ? 'down'
          : 'stable';

    const result = {
      totalActive,
      newToday,
      newYesterday,
      totalCompanies,
      trend,
      date: now.toISOString(),
    };

    // Cache 10 phÃºt (stats khÃ´ng cáº§n realtime)
    await this.redis.set(cacheKey, result, { ex: 600 });
    return result;
  }

  // â”€â”€â”€ GROWTH CHART â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // GET /jobs/growth?days=30
  // Tráº£ vá» máº£ng { date, total } â€” cumulative active jobs má»—i ngÃ y

  async getGrowth(days = 30) {
    const cacheKey = `jobs:growth:${days}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [jobsInRange, totalBefore] = await Promise.all([
      this.prisma.job.findMany({
        where: { isActive: true, createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.job.count({
        where: { isActive: true, createdAt: { lt: startDate } },
      }),
    ]);

    // Build day map
    const dayMap = new Map<string, number>();
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dayMap.set(d.toISOString().slice(0, 10), 0);
    }

    for (const job of jobsInRange) {
      const key = job.createdAt.toISOString().slice(0, 10);
      if (dayMap.has(key)) dayMap.set(key, dayMap.get(key)! + 1);
    }

    let cumulative = totalBefore;
    const result = Array.from(dayMap.entries()).map(([date, newCount]) => {
      cumulative += newCount;
      return { date, total: cumulative };
    });

    await this.redis.set(cacheKey, result, { ex: 600 });
    return result;
  }

  // â”€â”€â”€ BACKFILL industryId from employer profile â”€â”€â”€â”€â”€â”€â”€
  async backfillIndustryId() {
    const jobs = await this.prisma.job.findMany({
      where: { industryId: null },
      select: { id: true, employerId: true },
    });

    let updated = 0;
    for (const job of jobs) {
      const employer = await this.prisma.employerProfile.findUnique({
        where: { id: job.employerId },
        select: { industryId: true },
      });
      if (employer?.industryId) {
        await this.prisma.job.update({
          where: { id: job.id },
          data: { industryId: employer.industryId },
        });
        updated++;
      }
    }

    await this.invalidateCache();
    return { total: jobs.length, updated };
  }

  // â”€â”€â”€ INDUSTRY DEMAND â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // GET /jobs/industry-demand
  // Tráº£ vá» top 6 ngÃ nh theo sá»‘ job Ä‘ang tuyá»ƒn

  async getIndustryDemand(limit = 6) {
    const cacheKey = `jobs:industry-demand:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const grouped = await this.prisma.job.groupBy({
      by: ['industryId'],
      where: { isActive: true, industryId: { not: null } },
      _count: { industryId: true },
      orderBy: { _count: { industryId: 'desc' } },
      take: limit,
    });

    const industryIds = grouped
      .map((g) => g.industryId)
      .filter((id): id is number => id !== null);

    const industries = await this.prisma.industry.findMany({
      where: { id: { in: industryIds } },
    });

    const infoMap = new Map(industries.map((i) => [i.id, i]));

    const result = grouped.map((g) => ({
      id: g.industryId,
      name: infoMap.get(g.industryId!)?.name ?? 'KhÃ¡c',
      slug: infoMap.get(g.industryId!)?.slug ?? '',
      count: g._count.industryId,
    }));

    await this.redis.set(cacheKey, result, { ex: 600 });
    return result;
  }

  // â”€â”€â”€ CREATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async create(
    userId: string,
    data: {
      title: string;
      description: string;
      salaryMin?: number;
      salaryMax?: number;
      salaryType?: string;
      locations?: Array<{
        provinceCode?: string;
        provinceName?: string;
        districtCode?: string;
        districtName?: string;
        address?: string;
      }>;
      jobType?: string;
      experience?: string;
      level?: JobLevel;
      workingType?: WorkingType;
      workingDays?: WorkingDays;
      workingDaysNote?: string;
      quantity?: number;
      deadline?: Date | string;
      industryId?: number;
      jobPositionId?: number;
    },
    ipAddress?: string,
  ) {
    try {
      const employer = await this.prisma.employerProfile.findUnique({
        where: { userId },
      });

      if (!employer) {
        throw new BadRequestException('KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin cÃ´ng ty');
      }

      const { locations, ...jobData } = data;

      const created = await this.prisma.job.create({
        data: {
          ...jobData,
          industryId: jobData.industryId ?? employer.industryId ?? undefined,
          deadline: jobData.deadline ? new Date(jobData.deadline) : undefined,
          employerId: employer.id,
        },
      });

      if (locations && locations.length > 0) {
        await (this.prisma as any).jobLocation.createMany({
          data: locations.map((loc) => ({ ...loc, jobId: created.id })),
        });
      }

      const slug = this.generateSlug(data.title, created.id);
      const job = await this.prisma.job.update({
        where: { id: created.id },
        data: { slug },
        include: {
          employer: {
            select: {
              companyName: true,
              logoUrl: true,
            },
          },
          industry: true,
          jobPosition: true,
          // @ts-ignore -- locations added in migration; TODO: remove after prisma generate
          locations: true,
        },
      });

      await this.logAudit(userId, 'CREATE', job.id, null, job, ipAddress);
      await this.invalidateCache();

      return job;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2003':
            throw new BadRequestException(
              'NgÃ nh nghá» hoáº·c vá»‹ trÃ­ cÃ´ng viá»‡c khÃ´ng tá»“n táº¡i',
            );
          case 'P2002':
            throw new BadRequestException('Dá»¯ liá»‡u Ä‘Ã£ tá»“n táº¡i');
          case 'P2025':
            throw new BadRequestException('KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u liÃªn quan');
        }
      }

      console.error(error);
      throw new BadRequestException('Dá»¯ liá»‡u khÃ´ng há»£p lá»‡');
    }
  }

  // â”€â”€â”€ FIND ALL PUBLIC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    industryId?: number;
    jobPositionId?: number;
    jobType?: string;
    salaryType?: string;
    salaryMin?: number;
    salaryMax?: number;
    experience?: string;
    provinceCode?: string;
    districtCode?: string;
    level?: JobLevel;
    workingType?: WorkingType;
    workingDays?: WorkingDays;
    sort?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `jobs:list:${JSON.stringify(query)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const where: any = { isActive: true };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.industryId) where.industryId = Number(query.industryId);
    if (query.jobPositionId) where.jobPositionId = Number(query.jobPositionId);
    if (query.jobType) where.jobType = query.jobType;
    if (query.salaryType) where.salaryType = query.salaryType;
    if (query.experience) where.experience = query.experience;
    if (query.level) where.level = query.level;
    if (query.workingType) where.workingType = query.workingType;
    if (query.workingDays) where.workingDays = query.workingDays;

    if (query.provinceCode || query.districtCode) {
      const locFilter: any = {};
      if (query.provinceCode) locFilter.provinceCode = query.provinceCode;
      if (query.districtCode) locFilter.districtCode = query.districtCode;
      where.locations = { some: locFilter };
    }

    if (query.salaryMin || query.salaryMax) {
      where.AND = where.AND || [];
      if (query.salaryMin) {
        where.AND.push({
          OR: [
            { salaryMax: { gte: Number(query.salaryMin) } },
            { salaryMax: null },
          ],
        });
      }
      if (query.salaryMax) {
        where.AND.push({
          OR: [
            { salaryMin: { lte: Number(query.salaryMax) } },
            { salaryMin: null },
          ],
        });
      }
    }

    const orderBy: any =
      query.sort === 'salary'
        ? [{ salaryMax: 'desc' }, { createdAt: 'desc' }]
        : query.sort === 'relevant' && query.search
          ? [{ createdAt: 'desc' }]
          : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          employer: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              address: true,
            },
          },
          industry: true,
          jobPosition: true,
          // @ts-ignore -- locations added in migration; TODO: remove after prisma generate
          locations: true,
        },
      }),
      this.prisma.job.count({ where }),
    ]);

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

  // â”€â”€â”€ FIND ONE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async findOne(slugOrId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const cacheKey = `job:${slugOrId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const job = await this.prisma.job.findFirst({
      where: isUuid ? { id: slugOrId } : { slug: slugOrId },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            address: true,
            website: true,
            companySize: true,
            description: true,
            slug: true,
          },
        },
        industry: true,
        jobPosition: true,
        // @ts-ignore -- locations added in migration; TODO: remove after prisma generate
        locations: true,
      },
    });

    if (!job) throw new BadRequestException('KhÃ´ng tÃ¬m tháº¥y job');
    await this.redis.set(cacheKey, job, { ex: 300 });
    return job;
  }

  // â”€â”€â”€ BACKFILL SLUGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async backfillSlugs() {
    const jobs = await this.prisma.job.findMany({ where: { slug: null } });
    let count = 0;
    for (const job of jobs) {
      const slug = this.generateSlug(job.title, job.id);
      try {
        await this.prisma.job.update({ where: { id: job.id }, data: { slug } });
        count++;
      } catch {}
    }
    return { updated: count };
  }

  // â”€â”€â”€ FIND RELATED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async findRelated(jobId: string, industryId?: number | null, limit = 6) {
    return this.prisma.job.findMany({
      where: {
        isActive: true,
        id: { not: jobId },
        ...(industryId ? { industryId } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        employer: { select: { companyName: true, logoUrl: true, slug: true } },
      },
    });
  }

  // â”€â”€â”€ MY JOBS (EMPLOYER) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async findMyJobs(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    },
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!employer)
      throw new BadRequestException('KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin cÃ´ng ty');

    const where: any = { employerId: employer.id };

    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }
    if (query.isActive !== undefined) {
      where.isActive =
        query.isActive === true || query.isActive.toString() === 'true';
    }

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          industry: true,
          jobPosition: true,
          // @ts-ignore -- locations added in migration; TODO: remove after prisma generate
          locations: true,
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // â”€â”€â”€ UPDATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async update(userId: string, id: string, data: any, ipAddress?: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!employer)
      throw new BadRequestException('KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin cÃ´ng ty');

    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new BadRequestException('KhÃ´ng tÃ¬m tháº¥y job');
    if (job.employerId !== employer.id)
      throw new ForbiddenException('Báº¡n khÃ´ng cÃ³ quyá»n sá»­a job nÃ y');

    const { locations, ...jobData } = data;

    if (locations !== undefined) {
      await (this.prisma as any).jobLocation.deleteMany({ where: { jobId: id } });
      if (Array.isArray(locations) && locations.length > 0) {
        await (this.prisma as any).jobLocation.createMany({
          data: locations.map((loc: any) => ({ ...loc, jobId: id })),
        });
      }
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: jobData,
      include: {
        industry: true,
        jobPosition: true,
        // @ts-ignore -- locations added in migration; TODO: remove after prisma generate
        locations: true,
      },
    });

    await this.logAudit(userId, 'UPDATE', id, job, updated, ipAddress);
    await this.invalidateCache();
    await this.redis.del(`job:${id}`);

    return updated;
  }

  // â”€â”€â”€ DELETE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async remove(userId: string, id: string, ipAddress?: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!employer)
      throw new BadRequestException('KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin cÃ´ng ty');

    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new BadRequestException('KhÃ´ng tÃ¬m tháº¥y job');
    if (job.employerId !== employer.id)
      throw new ForbiddenException('Báº¡n khÃ´ng cÃ³ quyá»n xÃ³a job nÃ y');

    await this.prisma.job.delete({ where: { id } });
    await this.logAudit(userId, 'DELETE', id, job, null, ipAddress);
    await this.invalidateCache();
    await this.redis.del(`job:${id}`);

    return { message: 'XÃ³a job thÃ nh cÃ´ng' };
  }

  // â”€â”€â”€ JOB SUGGESTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getJobSuggestions(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      select: { jobPreferences: true },
    });

    const prefs = profile?.jobPreferences as any;
    const include = {
      employer: { select: { companyName: true, logoUrl: true, slug: true } },
      industry: { select: { name: true } },
    };

    if (prefs && !prefs.skipped) {
      const hasIndustry = Array.isArray(prefs.industryIds) && prefs.industryIds.length > 0;
      const industryIds = hasIndustry ? prefs.industryIds.map(Number) : [];

      // Support both old single provinceCode and new multiple provinceCodes
      const rawCodes: string[] = Array.isArray(prefs.provinceCodes) && prefs.provinceCodes.length > 0
        ? prefs.provinceCodes.map(String)
        : prefs.provinceCode ? [String(prefs.provinceCode)] : [];
      const hasProvince = rawCodes.length > 0;

      // Tier 1: industry + province
      if (hasIndustry && hasProvince) {
        const jobs = await this.prisma.job.findMany({
          where: {
            isActive: true,
            industryId: { in: industryIds },
            // @ts-ignore -- locations added in migration; TODO: remove after prisma generate
            locations: { some: { provinceCode: { in: rawCodes } } },
          },
          take: 9,
          orderBy: { createdAt: 'desc' },
          include,
        });
        if (jobs.length >= 1) {
          return { data: jobs, isPersonalized: true };
        }
      }

      // Tier 2: industry only
      if (hasIndustry) {
        const jobs = await this.prisma.job.findMany({
          where: {
            isActive: true,
            industryId: { in: industryIds },
          },
          take: 9,
          orderBy: { createdAt: 'desc' },
          include,
        });
        if (jobs.length >= 1) {
          return { data: jobs, isPersonalized: true };
        }
      }

      // Tier 3: province only
      if (hasProvince) {
        const jobs = await this.prisma.job.findMany({
          where: {
            isActive: true,
            // @ts-ignore -- locations added in migration; TODO: remove after prisma generate
            locations: { some: { provinceCode: { in: rawCodes } } },
          },
          take: 9,
          orderBy: { createdAt: 'desc' },
          include,
        });
        if (jobs.length >= 1) {
          return { data: jobs, isPersonalized: true };
        }
      }
    }

    const fallback = await this.prisma.job.findMany({
      where: { isActive: true },
      take: 9,
      orderBy: { createdAt: 'desc' },
      include,
    });

    return { data: fallback, isPersonalized: false };
  }

  // â”€â”€â”€ TOGGLE ACTIVE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async toggleActive(userId: string, id: string, ipAddress?: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!employer)
      throw new BadRequestException('KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin cÃ´ng ty');

    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new BadRequestException('KhÃ´ng tÃ¬m tháº¥y job');
    if (job.employerId !== employer.id)
      throw new ForbiddenException('KhÃ´ng cÃ³ quyá»n');

    const updated = await this.prisma.job.update({
      where: { id },
      data: { isActive: !job.isActive },
    });

    await this.logAudit(userId, 'UPDATE', id, job, updated, ipAddress);
    await this.invalidateCache();
    await this.redis.del(`job:${id}`);

    return updated;
  }

  // â”€â”€â”€ EMPLOYER DASHBOARD STATS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // GET /jobs/my-stats â€” statistics for the logged-in employer

  async getMyStats(userId: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!employer) throw new BadRequestException('KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin cÃ´ng ty');

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [total, active, inactive, expired, recentJobs, recentJobsForChart] =
      await Promise.all([
        this.prisma.job.count({ where: { employerId: employer.id } }),
        this.prisma.job.count({
          where: {
            employerId: employer.id,
            isActive: true,
            OR: [{ deadline: null }, { deadline: { gte: now } }],
          },
        }),
        this.prisma.job.count({
          where: { employerId: employer.id, isActive: false },
        }),
        this.prisma.job.count({
          where: { employerId: employer.id, isActive: true, deadline: { lt: now } },
        }),
        this.prisma.job.findMany({
          where: { employerId: employer.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, title: true, slug: true, isActive: true, createdAt: true, deadline: true },
        }),
        this.prisma.job.findMany({
          where: { employerId: employer.id, createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true },
        }),
      ]);

    // Build 7-day chart data
    const dayMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const job of recentJobsForChart) {
      const key = job.createdAt.toISOString().slice(0, 10);
      if (dayMap[key] !== undefined) dayMap[key]++;
    }
    const weeklyGrowth = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

    return { total, active, inactive, expired, recentJobs, weeklyGrowth };
  }
}
