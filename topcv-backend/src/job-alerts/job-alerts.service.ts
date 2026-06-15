import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class JobAlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(userId: string, dto: any) {
    const alert = await this.prisma.jobAlert.create({
      data: {
        user: { connect: { id: userId } },
        keyword: dto.keyword,
        provinceCode: dto.provinceCode || null,
        districtCode: dto.districtCode || null,
        provinceName: dto.provinceName || null,
        districtName: dto.districtName || null,
        salaryMin: dto.salaryMin ? Number(dto.salaryMin) : null,
        salaryMax: dto.salaryMax ? Number(dto.salaryMax) : null,
        experience: dto.experience || null,
        industryId: dto.industryId ? Number(dto.industryId) : null,
        jobPositionId: dto.jobPositionId ? Number(dto.jobPositionId) : null,
        workingType: dto.workingType || null,
        frequency: dto.frequency || 'DAILY',
        channel: dto.channel || 'BOTH',
        isActive: true,
      },
    });
    return { success: true, message: 'Tạo thông báo việc làm thành công', data: alert };
  }

  async findAll(userId: string) {
    const alerts = await this.prisma.jobAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: alerts };
  }

  async update(userId: string, id: string, dto: any) {
    const alert = await this.prisma.jobAlert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Không tìm thấy thông báo');
    if (alert.userId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.jobAlert.update({
      where: { id },
      data: {
        keyword: dto.keyword ?? alert.keyword,
        provinceCode: dto.provinceCode !== undefined ? dto.provinceCode : alert.provinceCode,
        districtCode: dto.districtCode !== undefined ? dto.districtCode : alert.districtCode,
        provinceName: dto.provinceName !== undefined ? dto.provinceName : alert.provinceName,
        districtName: dto.districtName !== undefined ? dto.districtName : alert.districtName,
        salaryMin: dto.salaryMin !== undefined ? (dto.salaryMin ? Number(dto.salaryMin) : null) : alert.salaryMin,
        salaryMax: dto.salaryMax !== undefined ? (dto.salaryMax ? Number(dto.salaryMax) : null) : alert.salaryMax,
        experience: dto.experience !== undefined ? dto.experience : alert.experience,
        industryId: dto.industryId !== undefined ? (dto.industryId ? Number(dto.industryId) : null) : alert.industryId,
        jobPositionId: dto.jobPositionId !== undefined ? (dto.jobPositionId ? Number(dto.jobPositionId) : null) : alert.jobPositionId,
        workingType: dto.workingType !== undefined ? dto.workingType : alert.workingType,
        frequency: dto.frequency ?? alert.frequency,
        channel: dto.channel ?? alert.channel,
      },
    });
    return { success: true, message: 'Cập nhật thành công', data: updated };
  }

  async toggle(userId: string, id: string) {
    const alert = await this.prisma.jobAlert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Không tìm thấy thông báo');
    if (alert.userId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.jobAlert.update({
      where: { id },
      data: { isActive: !alert.isActive },
    });
    return { success: true, data: updated };
  }

  async remove(userId: string, id: string) {
    const alert = await this.prisma.jobAlert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Không tìm thấy thông báo');
    if (alert.userId !== userId) throw new ForbiddenException();

    await this.prisma.jobAlert.delete({ where: { id } });
    return { success: true, message: 'Đã xóa thông báo việc làm' };
  }

  // ── Cron: daily at 9am ────────────────────────────────────────────────────
  @Cron('0 9 * * *')
  async runDailyAlerts() {
    await this.processAlerts('DAILY', 24 * 60 * 60 * 1000);
  }

  // ── Cron: weekly at 9am Monday ───────────────────────────────────────────
  @Cron('0 9 * * 1')
  async runWeeklyAlerts() {
    await this.processAlerts('WEEKLY', 7 * 24 * 60 * 60 * 1000);
  }

  private async processAlerts(frequency: string, windowMs: number) {
    const alerts = await this.prisma.jobAlert.findMany({
      where: { isActive: true, frequency },
    });

    const since = new Date(Date.now() - windowMs);

    for (const alert of alerts) {
      try {
        const where: any = {
          isActive: true,
          createdAt: { gte: since },
        };

        if (alert.keyword) {
          where.title = { contains: alert.keyword, mode: 'insensitive' };
        }
        if (alert.industryId) where.industryId = alert.industryId;
        if (alert.jobPositionId) where.jobPositionId = alert.jobPositionId;
        if (alert.workingType) where.workingType = alert.workingType;
        if (alert.experience) where.experience = alert.experience;
        if (alert.salaryMin) where.salaryMax = { gte: alert.salaryMin };
        if (alert.salaryMax) {
          where.salaryMin = where.salaryMin
            ? { ...where.salaryMin, lte: alert.salaryMax }
            : { lte: alert.salaryMax };
        }
        if (alert.provinceCode) {
          where.locations = { some: { provinceCode: alert.provinceCode } };
        }

        const jobs = await this.prisma.job.findMany({ where, take: 5 });

        if (jobs.length > 0) {
          const searchUrl = this.buildSearchUrl(alert);
          await this.notifications.create(alert.userId, {
            type: 'JOB_ALERT',
            title: `Có ${jobs.length} việc làm mới cho "${alert.keyword}"`,
            body: `${jobs.slice(0, 2).map(j => j.title).join(', ')}${jobs.length > 2 ? '...' : ''}`,
            url: searchUrl,
            data: { alertId: alert.id, jobCount: jobs.length },
          });

          await this.prisma.jobAlert.update({
            where: { id: alert.id },
            data: { lastSentAt: new Date() },
          });
        }
      } catch {
        // Continue with next alert on error
      }
    }
  }

  private buildSearchUrl(alert: any): string {
    const params = new URLSearchParams();
    if (alert.keyword) params.set('search', alert.keyword);
    if (alert.provinceCode) params.set('provinceCode', alert.provinceCode);
    if (alert.districtCode) params.set('districtCode', alert.districtCode);
    if (alert.industryId) params.set('industryId', String(alert.industryId));
    if (alert.jobPositionId) params.set('jobPositionId', String(alert.jobPositionId));
    if (alert.workingType) params.set('workingType', alert.workingType);
    if (alert.experience) params.set('experience', alert.experience);
    if (alert.salaryMin) params.set('salaryMin', String(alert.salaryMin));
    if (alert.salaryMax) params.set('salaryMax', String(alert.salaryMax));
    return `/viec-lam?${params.toString()}`;
  }
}
