import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Redis } from '@upstash/redis';

@Injectable()
export class JobPositionsService {
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
        entity: 'JobPosition',
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

    const cacheKey = `job-positions:${page}:${limit}:${query.search || ''}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const where = query.search
      ? { name: { contains: query.search, mode: 'insensitive' as any } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.jobPosition.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.jobPosition.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const result = {
      success: true,
      message: 'Lấy danh sách vị trí công việc thành công',
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

    await this.redis.set(cacheKey, result, { ex: 1800 });
    return result;
  }

  async findOne(id: number) {
    const cacheKey = `job-position:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) return cached;

    const data = await this.prisma.jobPosition.findUnique({
      where: { id },
    });

    if (!data) {
      return {
        success: false,
        message: 'Không tìm thấy vị trí công việc',
        data: null,
      };
    }

    const result = {
      success: true,
      message: 'Lấy chi tiết vị trí công việc thành công',
      data,
    };

    await this.redis.set(cacheKey, result, {
      ex: 1800,
    });

    return result;
  }

  async create(userId: string, data: { name: string }, ipAddress?: string) {
    const slug = this.slugify(data.name);
    const position = await this.prisma.jobPosition.create({
      data: { name: data.name, slug },
    });

    await this.logAudit(
      userId,
      'CREATE',
      String(position.id),
      null,
      position,
      ipAddress,
    );
    await this.invalidateCache();

    return {
      success: true,
      message: 'Tạo vị trí công việc thành công',
      data: position,
    };
  }

  async update(
    userId: string,
    id: number,
    data: { name: string },
    ipAddress?: string,
  ) {
    const old = await this.prisma.jobPosition.findUnique({ where: { id } });
    const slug = this.slugify(data.name);

    if (!old) {
      return {
        success: false,
        message: 'Không tìm thấy vị trí công việc',
        data: null,
      };
    }

    const updated = await this.prisma.jobPosition.update({
      where: { id },
      data: { name: data.name, slug },
    });

    await this.logAudit(userId, 'UPDATE', String(id), old, updated, ipAddress);
    await this.invalidateCache();

    return {
      success: true,
      message: 'Cập nhật vị trí công việc thành công',
      data: updated,
    };
  }

  async remove(userId: string, id: number, ipAddress?: string) {
    const old = await this.prisma.jobPosition.findUnique({ where: { id } });

    await this.prisma.jobPosition.delete({ where: { id } });
    await this.logAudit(userId, 'DELETE', String(id), old, null, ipAddress);
    await this.invalidateCache();

    return {
      success: true,
      message: 'Xóa vị trí công việc thành công',
      data: {
        deletedId: id,
      },
    };
  }

  async bulkDelete(userId: string, ids: number[], ipAddress?: string) {
    const items = await this.prisma.jobPosition.findMany({
      where: { id: { in: ids } },
    });

    await this.prisma.jobPosition.deleteMany({
      where: { id: { in: ids } },
    });

    for (const item of items) {
      await this.logAudit(
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
      message: `Đã xóa ${items.length} vị trí công việc`,
      data: {
        deletedCount: items.length,
      },
    };
  }

  private async invalidateCache() {
    const keys = await this.redis.keys('job-positions:*');
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => this.redis.del(key)));
    }
  }
}
