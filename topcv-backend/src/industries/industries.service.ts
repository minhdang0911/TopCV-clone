import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Redis } from '@upstash/redis';

@Injectable()
export class IndustriesService {
  private readonly CACHE_TTL = 1800; // 30 phút

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

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  private async logAudit(
    prisma: PrismaService,
    userId: string,
    action: string,
    entityId: string,
    oldData?: any,
    newData?: any,
    ipAddress?: string,
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity: 'Industry',
        entityId,
        oldData,
        newData,
        ipAddress,
      },
    });
  }

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `industries:${page}:${limit}:${query.search || ''}`;

    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    const where = query.search
      ? {
          name: {
            contains: query.search,
            mode: 'insensitive' as any,
          },
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.industry.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: 'asc',
        },
      }),
      this.prisma.industry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const result = {
      success: true,
      message: 'Lấy danh sách ngành nghề thành công',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    await this.redis.set(cacheKey, result, {
      ex: this.CACHE_TTL,
    });

    return result;
  }

  async findOne(id: number) {
    const cacheKey = `industry:${id}`;

    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.prisma.industry.findUnique({
      where: { id },
    });

    if (!data) {
      return {
        success: false,
        message: 'Không tìm thấy ngành nghề',
        data: null,
      };
    }

    const result = {
      success: true,
      message: 'Lấy chi tiết ngành nghề thành công',
      data,
    };

    await this.redis.set(cacheKey, result, {
      ex: this.CACHE_TTL,
    });

    return result;
  }

  async create(userId: string, data: { name: string }, ipAddress?: string) {
    const slug = this.slugify(data.name);

    const industry = await this.prisma.industry.create({
      data: {
        name: data.name,
        slug,
      },
    });

    await this.logAudit(
      this.prisma,
      userId,
      'CREATE',
      String(industry.id),
      null,
      industry,
      ipAddress,
    );

    await this.invalidateCache();

    return {
      success: true,
      message: 'Tạo ngành nghề thành công',
      data: industry,
    };
  }

  async update(
    userId: string,
    id: number,
    data: { name: string },
    ipAddress?: string,
  ) {
    const old = await this.prisma.industry.findUnique({
      where: { id },
    });

    const slug = this.slugify(data.name);

    const updated = await this.prisma.industry.update({
      where: { id },
      data: {
        name: data.name,
        slug,
      },
    });

    await this.logAudit(
      this.prisma,
      userId,
      'UPDATE',
      String(id),
      old,
      updated,
      ipAddress,
    );

    await this.invalidateCache();

    return {
      success: true,
      message: 'Cập nhật ngành nghề thành công',
      data: updated,
    };
  }

  async remove(userId: string, id: number, ipAddress?: string) {
    const old = await this.prisma.industry.findUnique({
      where: { id },
    });

    await this.prisma.industry.delete({
      where: { id },
    });

    await this.logAudit(
      this.prisma,
      userId,
      'DELETE',
      String(id),
      old,
      null,
      ipAddress,
    );

    await this.invalidateCache();

    return {
      success: true,
      message: 'Xóa ngành nghề thành công',
    };
  }

  async bulkDelete(userId: string, ids: number[], ipAddress?: string) {
    const items = await this.prisma.industry.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    await this.prisma.industry.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    for (const item of items) {
      await this.logAudit(
        this.prisma,
        userId,
        'DELETE',
        String(item.id),
        item,
        null,
        ipAddress,
      );
    }

    await this.invalidateCache();

    return {
      success: true,
      message: `Đã xóa ${items.length} ngành nghề`,
      data: {
        deletedCount: items.length,
      },
    };
  }

  private async invalidateCache() {
    const listKeys = await this.redis.keys('industries:*');
    const detailKeys = await this.redis.keys('industry:*');

    const keys = [...listKeys, ...detailKeys];

    if (keys.length > 0) {
      await Promise.all(keys.map((key) => this.redis.del(key)));
    }
  }
}
