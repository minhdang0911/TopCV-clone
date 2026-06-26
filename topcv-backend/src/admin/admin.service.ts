import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── DASHBOARD (all-in-one) ──────────────────────────────────────────────────

  async getDashboard() {
    const now = new Date();

    // Time boundaries
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newUsersToday,
      totalJobs,
      activeJobs,
      totalApplications,
      paymentAggregate,
      pendingDocs,
      pendingReviews,
      pendingFeedbacks,
      usersByRole,
      recentPayments,
      dailyRegistrations,
      monthlyPayments,
      byGateway,
      byPlan,
      appsByStatus,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.job.count(),
      this.prisma.job.count({ where: { isActive: true } }),
      this.prisma.application.count(),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.employerProfile.count({ where: { businessDocStatus: 'PENDING' } }),
      this.prisma.employerReview.count({ where: { status: 'PENDING' } }),
      this.prisma.feedback.count({ where: { replyText: null } }),
      this.prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
      this.prisma.payment.findMany({
        where: { status: 'SUCCESS' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, orderId: true, amount: true, plan: true,
          gateway: true, createdAt: true,
          user: { select: { id: true, email: true, candidateProfile: { select: { fullName: true } }, employerProfile: { select: { companyName: true } } } },
        },
      }),
      // Daily registrations: last 30 days
      this.prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Monthly payments: last 12 months
      this.prisma.payment.findMany({
        where: { status: 'SUCCESS', createdAt: { gte: twelveMonthsAgo } },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // By gateway
      this.prisma.payment.groupBy({
        by: ['gateway'],
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // By plan
      this.prisma.payment.groupBy({
        by: ['plan'],
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Applications by status
      this.prisma.application.groupBy({ by: ['status'], _count: { id: true } }),
    ]);

    // Helper: format local date as YYYY-MM
    const localMonth = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    // Helper: format local date as YYYY-MM-DD
    const localDay = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // ── Registration chart (last 30 days) ───────────────────────────────────
    const dayMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      dayMap[localDay(d)] = 0;
    }
    for (const u of dailyRegistrations) {
      const key = localDay(u.createdAt);
      if (dayMap[key] !== undefined) dayMap[key]++;
    }
    const registrationChart = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

    // ── Monthly revenue chart (last 12 months including current month) ───────
    // Build keys from 11 months ago up to and including the current month
    const monthMap: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthMap[localMonth(d)] = 0;
    }
    for (const p of monthlyPayments) {
      const key = localMonth(p.createdAt);
      if (monthMap[key] !== undefined) monthMap[key] += p.amount;
    }
    // Format month label: "Th1/25", "Th2/25"...
    const monthlyRevenueChart = Object.entries(monthMap).map(([month, revenue]) => {
      const [year, m] = month.split('-');
      return { month: `Th${parseInt(m)}/${year.slice(2)}`, monthKey: month, revenue };
    });

    // ── Resolve VIEW_APPLICANTS job metadata ─────────────────────────────────
    const enrichedByPlan = await Promise.all(
      byPlan.map(async (p) => {
        const base = {
          plan: p.plan,
          revenue: p._sum.amount ?? 0,
          count: p._count.id,
          jobTitle: null as string | null,
          companyName: null as string | null,
          jobId: null as string | null,
        };
        if (p.plan?.startsWith('VIEW_APPLICANTS:')) {
          const jobId = p.plan.split(':')[1];
          if (jobId) {
            const job = await this.prisma.job.findUnique({
              where: { id: jobId },
              select: {
                title: true,
                employer: { select: { companyName: true } },
              },
            });
            if (job) {
              base.jobTitle = job.title;
              base.companyName = job.employer?.companyName ?? null;
              base.jobId = jobId;
            }
          }
        }
        return base;
      }),
    );

    return {
      overview: {
        totalUsers, newUsersToday,
        totalJobs, activeJobs,
        totalApplications,
        totalPayments: paymentAggregate._count.id,
        totalRevenue: paymentAggregate._sum.amount ?? 0,
        pendingDocs, pendingReviews, pendingFeedbacks,
      },
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.role })),
      applicationsByStatus: appsByStatus.map((s) => ({ status: s.status, count: s._count.id })),
      recentPayments,
      registrationChart,
      revenueChart: {
        monthly: monthlyRevenueChart,
        byGateway: byGateway.map((g) => ({
          gateway: g.gateway,
          revenue: g._sum.amount ?? 0,
          count: g._count.id,
        })),
        byPlan: enrichedByPlan,
      },
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
        { user: { candidateProfile: { fullName: { contains: query.keyword, mode: 'insensitive' } } } },
        { user: { employerProfile: { companyName: { contains: query.keyword, mode: 'insensitive' } } } },
      ];
    }

    const [total, payments] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, orderId: true, amount: true, plan: true,
          gateway: true, status: true, createdAt: true,
          user: { select: { id: true, email: true, candidateProfile: { select: { fullName: true } }, employerProfile: { select: { companyName: true } } } },
        },
      }),
    ]);

    // Resolve VIEW_APPLICANTS:{jobId} → job title + company name
    const jobIds = payments
      .map((p) => p.plan?.startsWith('VIEW_APPLICANTS:') ? p.plan.replace('VIEW_APPLICANTS:', '') : null)
      .filter((id): id is string => !!id);

    const jobMap: Record<string, { title: string; companyName: string }> = {};
    if (jobIds.length) {
      const jobs = await this.prisma.job.findMany({
        where: { id: { in: [...new Set(jobIds)] } },
        select: { id: true, title: true, employer: { select: { companyName: true } } },
      });
      for (const job of jobs) {
        jobMap[job.id] = { title: job.title, companyName: job.employer.companyName };
      }
    }

    const data = payments.map((p) => {
      if (p.plan?.startsWith('VIEW_APPLICANTS:')) {
        const jobId = p.plan.replace('VIEW_APPLICANTS:', '');
        const job = jobMap[jobId];
        return {
          ...p,
          planMeta: {
            type: 'VIEW_APPLICANTS',
            jobId,
            jobTitle: job?.title ?? null,
            companyName: job?.companyName ?? null,
          },
        };
      }
      return { ...p, planMeta: null };
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async adminGetPaymentStats() {
    // Reuse getDashboard revenueChart for stats
    const dash = await this.getDashboard();
    return {
      totalRevenue: dash.overview.totalRevenue,
      totalSuccessCount: dash.overview.totalPayments,
      ...dash.revenueChart,
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
