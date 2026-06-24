import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── DASHBOARD ──────────────────────────────────────────────────────────────

  async getDashboard() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      newUsersToday,
      totalJobs,
      activeJobs,
      totalApplications,
      totalPayments,
      totalRevenue,
      pendingDocs,
      pendingReviews,
      pendingFeedbacks,
      usersByRole,
      recentPayments,
      dailyRegistrations,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.job.count(),
      this.prisma.job.count({ where: { isActive: true } }),
      this.prisma.application.count(),
      this.prisma.payment.count({ where: { status: 'SUCCESS' } }),
      this.prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
      this.prisma.employerProfile.count({ where: { businessDocStatus: 'PENDING' } }),
      this.prisma.employerReview.count({ where: { status: 'PENDING' } }),
      this.prisma.feedback.count({ where: { replyText: null } }),
      this.prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
      this.prisma.payment.findMany({
        where: { status: 'SUCCESS' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, orderId: true, amount: true, plan: true, gateway: true, createdAt: true,
          user: { select: { id: true, email: true } },
        },
      }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const dayMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const u of dailyRegistrations) {
      const key = u.createdAt.toISOString().slice(0, 10);
      if (dayMap[key] !== undefined) dayMap[key]++;
    }
    const registrationChart = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

    return {
      overview: {
        totalUsers, newUsersToday, totalJobs, activeJobs,
        totalApplications, totalPayments,
        totalRevenue: totalRevenue._sum.amount ?? 0,
        pendingDocs, pendingReviews, pendingFeedbacks,
      },
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.role })),
      recentPayments,
      registrationChart,
    };
  }

  // ─── PAYMENTS ADMIN ─────────────────────────────────────────────────────────

  async adminGetPayments(query: {
    status?: string; gateway?: string; plan?: string;
    startDate?: string; endDate?: string; keyword?: string;
    page?: string; limit?: string;
  }) {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(100, parseInt(query.limit || '20'));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status.toUpperCase();
    if (query.gateway) where.gateway = query.gateway.toUpperCase();
    if (query.plan) where.plan = query.plan.toUpperCase();
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }
    if (query.keyword) {
      where.OR = [
        { orderId: { contains: query.keyword, mode: 'insensitive' } },
        { user: { email: { contains: query.keyword, mode: 'insensitive' } } },
      ];
    }

    const [total, payments] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, orderId: true, amount: true, plan: true,
          gateway: true, status: true, createdAt: true, updatedAt: true,
          user: { select: { id: true, email: true, phone: true } },
        },
      }),
    ]);

    return { data: payments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async adminGetPaymentStats() {
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [totalRevenue, byGateway, byPlan, byStatus, allSuccessPayments] = await Promise.all([
      this.prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true }, _count: { id: true } }),
      this.prisma.payment.groupBy({ by: ['gateway'], where: { status: 'SUCCESS' }, _sum: { amount: true }, _count: { id: true } }),
      this.prisma.payment.groupBy({ by: ['plan'], where: { status: 'SUCCESS' }, _sum: { amount: true }, _count: { id: true } }),
      this.prisma.payment.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.payment.findMany({
        where: { status: 'SUCCESS', createdAt: { gte: twelveMonthsAgo } },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const monthMap: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date(twelveMonthsAgo);
      d.setMonth(d.getMonth() + i);
      monthMap[d.toISOString().slice(0, 7)] = 0;
    }
    for (const p of allSuccessPayments) {
      const key = p.createdAt.toISOString().slice(0, 7);
      if (monthMap[key] !== undefined) monthMap[key] += p.amount;
    }
    const monthlyRevenueChart = Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue }));

    return {
      totalRevenue: totalRevenue._sum.amount ?? 0,
      totalSuccessCount: totalRevenue._count.id,
      byGateway: byGateway.map((g) => ({ gateway: g.gateway, revenue: g._sum.amount ?? 0, count: g._count.id })),
      byPlan: byPlan.map((p) => ({ plan: p.plan, revenue: p._sum.amount ?? 0, count: p._count.id })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      monthlyRevenueChart,
    };
  }

  // ─── APPLICATIONS STATS ─────────────────────────────────────────────────────

  async adminGetApplicationStats() {
    const [total, byStatus, recentApplications] = await Promise.all([
      this.prisma.application.count(),
      this.prisma.application.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.application.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, status: true, createdAt: true,
          job: { select: { title: true, employer: { select: { companyName: true } } } },
          candidate: { select: { email: true, candidateProfile: { select: { fullName: true } } } },
        },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      recentApplications,
    };
  }
}
