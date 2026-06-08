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

  // ─── STATS ───────────────────────────────────────────
  // GET /jobs/stats
  // Trả về: tổng job đang tuyển, job mới hôm nay, trend so hôm qua

  async getStats() {
    const cacheKey = 'jobs:stats';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const now = new Date();

    // Đầu ngày hôm nay (00:00:00 giờ local UTC+7 → dùng UTC thẳng cho đơn giản)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Đầu ngày hôm qua
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const [totalActive, newToday, newYesterday, totalCompanies] = await Promise.all([
      // Tổng job đang active
      this.prisma.job.count({
        where: { isActive: true },
      }),

      // Job mới tạo hôm nay
      this.prisma.job.count({
        where: {
          isActive: true,
          createdAt: { gte: todayStart },
        },
      }),

      // Job mới tạo hôm qua (để tính trend)
      this.prisma.job.count({
        where: {
          isActive: true,
          createdAt: {
            gte: yesterdayStart,
            lt: todayStart,
          },
        },
      }),

      // Số công ty đang có job tuyển dụng
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

    // Cache 10 phút (stats không cần realtime)
    await this.redis.set(cacheKey, result, { ex: 600 });
    return result;
  }

  // ─── GROWTH CHART ────────────────────────────────────
  // GET /jobs/growth?days=30
  // Trả về mảng { date, total } — cumulative active jobs mỗi ngày

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

  // ─── INDUSTRY DEMAND ─────────────────────────────────
  // GET /jobs/industry-demand
  // Trả về top 6 ngành theo số job đang tuyển

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
      name: infoMap.get(g.industryId!)?.name ?? 'Khác',
      slug: infoMap.get(g.industryId!)?.slug ?? '',
      count: g._count.industryId,
    }));

    await this.redis.set(cacheKey, result, { ex: 600 });
    return result;
  }

  // ─── CREATE ──────────────────────────────────────────

  async create(
    userId: string,
    data: {
      title: string;
      description: string;
      salaryMin?: number;
      salaryMax?: number;
      salaryType?: string;
      address?: string;
      provinceCode?: string;
      provinceName?: string;
      districtCode?: string;
      districtName?: string;
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
        throw new BadRequestException('Không tìm thấy thông tin công ty');
      }

      const job = await this.prisma.job.create({
        data: {
          ...data,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
          employerId: employer.id,
        },
        include: {
          employer: {
            select: {
              companyName: true,
              logoUrl: true,
            },
          },
          industry: true,
          jobPosition: true,
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
              'Ngành nghề hoặc vị trí công việc không tồn tại',
            );
          case 'P2002':
            throw new BadRequestException('Dữ liệu đã tồn tại');
          case 'P2025':
            throw new BadRequestException('Không tìm thấy dữ liệu liên quan');
        }
      }

      console.error(error);
      throw new BadRequestException('Dữ liệu không hợp lệ');
    }
  }

  // ─── FIND ALL PUBLIC ─────────────────────────────────

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
    address?: string;
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

    if (query.provinceCode) where.provinceCode = query.provinceCode;
    if (query.districtCode) where.districtCode = query.districtCode;

    if (query.address && !query.provinceCode) {
      where.address = { contains: query.address, mode: 'insensitive' };
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

  // ─── FIND ONE ─────────────────────────────────────────

  async findOne(id: string) {
    const cacheKey = `job:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const job = await this.prisma.job.findUnique({
      where: { id },
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
          },
        },
        industry: true,
        jobPosition: true,
      },
    });

    if (!job) throw new BadRequestException('Không tìm thấy job');

    await this.redis.set(cacheKey, job, { ex: 300 });
    return job;
  }

  // ─── MY JOBS (EMPLOYER) ───────────────────────────────

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
      throw new BadRequestException('Không tìm thấy thông tin công ty');

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

  // ─── UPDATE ───────────────────────────────────────────

  async update(userId: string, id: string, data: any, ipAddress?: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!employer)
      throw new BadRequestException('Không tìm thấy thông tin công ty');

    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new BadRequestException('Không tìm thấy job');
    if (job.employerId !== employer.id)
      throw new ForbiddenException('Bạn không có quyền sửa job này');

    const updated = await this.prisma.job.update({
      where: { id },
      data,
      include: {
        industry: true,
        jobPosition: true,
      },
    });

    await this.logAudit(userId, 'UPDATE', id, job, updated, ipAddress);
    await this.invalidateCache();
    await this.redis.del(`job:${id}`);

    return updated;
  }

  // ─── DELETE ───────────────────────────────────────────

  async remove(userId: string, id: string, ipAddress?: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!employer)
      throw new BadRequestException('Không tìm thấy thông tin công ty');

    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new BadRequestException('Không tìm thấy job');
    if (job.employerId !== employer.id)
      throw new ForbiddenException('Bạn không có quyền xóa job này');

    await this.prisma.job.delete({ where: { id } });
    await this.logAudit(userId, 'DELETE', id, job, null, ipAddress);
    await this.invalidateCache();
    await this.redis.del(`job:${id}`);

    return { message: 'Xóa job thành công' };
  }

  // ─── TOGGLE ACTIVE ────────────────────────────────────

  async toggleActive(userId: string, id: string, ipAddress?: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!employer)
      throw new BadRequestException('Không tìm thấy thông tin công ty');

    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new BadRequestException('Không tìm thấy job');
    if (job.employerId !== employer.id)
      throw new ForbiddenException('Không có quyền');

    const updated = await this.prisma.job.update({
      where: { id },
      data: { isActive: !job.isActive },
    });

    await this.logAudit(userId, 'UPDATE', id, job, updated, ipAddress);
    await this.invalidateCache();
    await this.redis.del(`job:${id}`);

    return updated;
  }
}
