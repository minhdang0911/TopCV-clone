import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ModerationService } from './moderation.service';
import { Redis } from '@upstash/redis';

const SPEEDSMS_ENDPOINT = 'https://api.speedsms.vn/index.php/sms/send';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãăạảấầẩẫậắằẳẵặ]/g, 'a')
    .replace(/[èéêẹẻẽếềểễệ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóôõơọỏốồổỗộớờởỡợ]/g, 'o')
    .replace(/[ùúưụủũứừửữự]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

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

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private moderation: ModerationService,
  ) {}

  async findAll(query: { industryId?: string; limit?: string; page?: string; keyword?: string }) {
    const limit = Math.min(Number(query.limit) || 12, 50);
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.industryId) {
      where.industryId = Number(query.industryId);
    }
    if (query.keyword) {
      where.companyName = { contains: query.keyword, mode: 'insensitive' };
    }

    // Skip cache when keyword filter is active
    const cacheKey = `employers:${query.industryId ?? 'all'}:${page}:${limit}`;
    if (!query.keyword) {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    }

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

    const data = (raw as any[]).map((e) => ({
      id: e.id,
      companyName: e.companyName,
      logoUrl: e.logoUrl ?? null,
      coverImage: e.coverImage ?? null,
      slug: e.slug ?? null,
      companySize: e.companySize ?? null,
      website: e.website ?? null,
      address: e.address ?? null,
      description: e.description ?? null,
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

    if (!query.keyword) {
      await this.redis.set(cacheKey, result, { ex: 300 });
    }
    return result;
  }

  async findOne(idOrSlug: string) {
    const where = UUID_RE.test(idOrSlug)
      ? { id: idOrSlug }
      : { slug: idOrSlug };

    const company = await this.prisma.employerProfile.findUnique({
      where,
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

    // Auto-generate slug on first fetch
    if (!company.slug) {
      const slug = `${toSlug(company.companyName)}-${company.id.slice(0, 8)}`;
      await this.prisma.employerProfile
        .update({ where: { id: company.id }, data: { slug } })
        .catch(() => {});
      company.slug = slug;
    }

    const reviewStats = await this.prisma.companyReview.aggregate({
      where: { employerProfileId: company.id },
      _avg: { rating: true },
    });

    // Get similar companies in same industry
    const similar = company.industryId
      ? await this.prisma.employerProfile.findMany({
          where: {
            industryId: company.industryId,
            id: { not: company.id },
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
      coverImage: (company as any).coverImage ?? null,
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

  private async resolveId(idOrSlug: string): Promise<string> {
    if (UUID_RE.test(idOrSlug)) return idOrSlug;
    const company = await this.prisma.employerProfile.findUnique({
      where: { slug: idOrSlug },
      select: { id: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company.id;
  }

  async getJobs(
    idOrSlug: string,
    query: { page?: string; limit?: string; keyword?: string },
  ) {
    const id = await this.resolveId(idOrSlug);
    const limit = Math.min(Number(query.limit) || 10, 50);
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;

    const where: any = {
      employerId: id,
      isActive: true,
    };
    if (query.keyword) {
      where.title = { contains: query.keyword, mode: 'insensitive' };
    }

    const [jobs, total] = await Promise.all([
      // @ts-ignore -- locations added in migration; TODO: remove after prisma generate
      (this.prisma.job.findMany as any)({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          salaryMin: true,
          salaryMax: true,
          salaryType: true,
          workingType: true,
          deadline: true,
          createdAt: true,
          locations: { select: { provinceName: true }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: (jobs as any[]).map((j) => ({
        id: j.id,
        slug: j.slug,
        title: j.title,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        salaryType: j.salaryType,
        workingType: j.workingType,
        deadline: j.deadline,
        createdAt: j.createdAt,
        provinceName: (j.locations as any)[0]?.provinceName ?? null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async follow(userId: string, idOrSlug: string) {
    const employerProfileId = await this.resolveId(idOrSlug);

    try {
      await this.prisma.companyFollow.create({
        data: { userId, employerProfileId },
      });
    } catch {
      throw new ConflictException('Already following');
    }

    return { followed: true };
  }

  async unfollow(userId: string, idOrSlug: string) {
    const employerProfileId = await this.resolveId(idOrSlug);
    await this.prisma.companyFollow.deleteMany({
      where: { userId, employerProfileId },
    });
    return { followed: false };
  }

  async getFollowStatus(userId: string, idOrSlug: string) {
    const employerProfileId = await this.resolveId(idOrSlug);
    const follow = await this.prisma.companyFollow.findUnique({
      where: { userId_employerProfileId: { userId, employerProfileId } },
    });
    return { followed: !!follow };
  }

  async createReview(userId: string, idOrSlug: string, rating: number) {
    const employerProfileId = await this.resolveId(idOrSlug);

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

  // ── VERIFICATION ─────────────────────────────────────────────────────────

  private isCompanyInfoComplete(employer: any): boolean {
    return !!(employer.companyName && employer.address && employer.taxCode);
  }

  async getVerificationStatus(userId: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!employer) throw new NotFoundException('Không tìm thấy hồ sơ công ty');

    const step1 = employer.phoneVerified;
    const step2 = this.isCompanyInfoComplete(employer);
    const step3 = employer.businessDocStatus === 'APPROVED';

    return {
      step1: { done: step1, label: 'Xác thực số điện thoại' },
      step2: {
        done: step2,
        label: 'Cập nhật thông tin công ty',
        hint: 'Điền đầy đủ: tên công ty, địa chỉ, mã số thuế',
      },
      step3: {
        done: step3,
        label: 'Xác thực Giấy đăng ký doanh nghiệp',
        status: employer.businessDocStatus ?? null,
        docType: employer.businessDocType ?? null,
        docUrl: employer.businessDocUrl ?? null,
        docUrl2: employer.businessDocUrl2 ?? null,
        rejectReason: employer.businessDocRejectReason ?? null,
      },
      canPostJob: step1 && step2 && step3,
      level: [step1, step2, step3].filter(Boolean).length,
    };
  }

  private generateOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  async sendPhoneOtp(userId: string, phone: string) {
    const digits = phone.replace(/\D/g, '').replace(/^0/, '');
    if (digits.length < 9)
      throw new BadRequestException('Số điện thoại không hợp lệ');

    const otp = this.generateOtp();
    await this.redis.set(
      `otp:employer:${userId}`,
      { otp, digits },
      { ex: 300 },
    );

    const token = process.env.SPEEDSMS_TOKEN!;
    const res = await fetch(SPEEDSMS_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(token + ':x').toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: ['0' + digits],
        content: `Ma OTP TopCV cua ban la: ${otp}. Co hieu luc 5 phut.`,
        sms_type: 5,
        sender: process.env.SPEEDSMS_DEVICE_ID,
      }),
    });

    const data: any = await res.json();
    console.log('[SpeedSMS]', JSON.stringify(data));
    if (!res.ok || data.status === 'error') {
      throw new BadRequestException(
        'Không thể gửi OTP: ' + (data.message || JSON.stringify(data)),
      );
    }

    return { success: true, message: 'OTP đã được gửi' };
  }

  async verifyPhone(userId: string, code: string) {
    const stored = await this.redis.get(`otp:employer:${userId}`);
    if (!stored)
      throw new BadRequestException('OTP đã hết hạn, vui lòng gửi lại');

    const { otp, digits } = stored as any;
    if (code !== otp) throw new BadRequestException('Mã OTP không đúng');

    const phone = '+84' + digits;
    await this.prisma.user.update({ where: { id: userId }, data: { phone } });
    await this.prisma.employerProfile.update({
      where: { userId },
      data: { phoneVerified: true },
    });
    await this.redis.del(`otp:employer:${userId}`);

    return { success: true, phone };
  }

  async uploadBusinessDoc(userId: string, docType: string, docUrl: string, docUrl2?: string) {
    await this.prisma.employerProfile.update({
      where: { userId },
      data: {
        businessDocType: docType,
        businessDocUrl: docUrl,
        businessDocUrl2: docUrl2 ?? null,
        businessDocStatus: 'PENDING',
        businessDocRejectReason: null,
      },
    });
    return { success: true, message: 'Đã gửi tài liệu, đang chờ admin duyệt' };
  }

  async adminGetDocs(status?: string) {
    const where: any = { businessDocUrl: { not: null } };
    if (status) where.businessDocStatus = status;

    const rows = await this.prisma.employerProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        logoUrl: true,
        taxCode: true,
        address: true,
        businessDocStatus: true,
        businessDocType: true,
        businessDocUrl: true,
        businessDocUrl2: true,
        businessDocRejectReason: true,
        createdAt: true,
      },
    });

    return rows;
  }

  async adminApproveDoc(employerProfileId: string, approve: boolean, rejectReason?: string) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { id: employerProfileId },
    });
    if (!employer) throw new NotFoundException();
    if (!employer.businessDocUrl)
      throw new BadRequestException('Chưa có tài liệu nào');

    await this.prisma.employerProfile.update({
      where: { id: employerProfileId },
      data: {
        businessDocStatus: approve ? 'APPROVED' : 'REJECTED',
        businessDocRejectReason: approve ? null : (rejectReason ?? 'Tài liệu không hợp lệ'),
      },
    });

    await this.notifications.create(employer.userId, approve ? {
      type: 'DOC_APPROVED',
      title: 'Tài liệu đã được phê duyệt',
      body: 'Giấy đăng ký doanh nghiệp của bạn đã được xác thực thành công. Tài khoản đã đủ điều kiện đăng tin tuyển dụng.',
      url: '/nha-tuyen-dung/ho-so-cong-ty/giay-dkkd',
    } : {
      type: 'DOC_REJECTED',
      title: 'Tài liệu bị từ chối',
      body: `Giấy đăng ký doanh nghiệp của bạn bị từ chối. Lý do: ${rejectReason ?? 'Tài liệu không hợp lệ'}. Vui lòng upload lại.`,
      url: '/nha-tuyen-dung/ho-so-cong-ty/giay-dkkd',
    });

    return { success: true, status: approve ? 'APPROVED' : 'REJECTED' };
  }

  async getReviews(idOrSlug: string) {
    const employerProfileId = await this.resolveId(idOrSlug);
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

  // ── EMPLOYER REVIEWS (detailed, itviec-style) ─────────────────────────────

  async getMyEmployerReview(userId: string, idOrSlug: string) {
    const employerProfileId = await this.resolveId(idOrSlug);
    const review = await this.prisma.employerReview.findFirst({
      where: { userId, employerProfileId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, rejectReason: true },
    });
    return review ?? null;
  }

  async submitEmployerReview(userId: string, idOrSlug: string, dto: any) {
    const employerProfileId = await this.resolveId(idOrSlug);

    const existing = await this.prisma.employerReview.findFirst({
      where: { userId, employerProfileId, status: 'APPROVED' },
    });
    if (existing) {
      throw new ConflictException('Bạn đã có đánh giá được duyệt cho công ty này');
    }

    const review = await this.prisma.employerReview.create({
      data: {
        user: { connect: { id: userId } },
        employerProfile: { connect: { id: employerProfileId } },
        title: dto.title,
        rating: dto.rating,
        overtimePolicy: dto.overtimePolicy,
        overtimeReason: dto.overtimeReason ?? null,
        liked: dto.liked,
        improvement: dto.improvement,
        salaryRating: dto.salaryRating,
        trainingRating: dto.trainingRating,
        careRating: dto.careRating,
        cultureRating: dto.cultureRating,
        officeRating: dto.officeRating,
        recommend: dto.recommend,
        status: 'PENDING',
      },
    });

    // Fire-and-forget: AI moderation runs async, candidate gets socket notification when done
    this.runModerationAsync(review.id, userId, employerProfileId, dto).catch(() => {});

    return { id: review.id, status: review.status };
  }

  private async runModerationAsync(
    reviewId: string,
    userId: string,
    employerProfileId: string,
    dto: any,
  ) {
    const result = await this.moderation.moderateReview({
      title: dto.title,
      liked: dto.liked,
      improvement: dto.improvement,
      overtimeReason: dto.overtimeReason,
    });

    const newStatus = result.approved ? 'APPROVED' : 'REJECTED';

    const [updated] = await Promise.all([
      this.prisma.employerReview.update({
        where: { id: reviewId },
        data: { status: newStatus, rejectReason: result.rejectReason ?? null },
        select: { employerProfile: { select: { id: true, slug: true } } },
      }),
    ]);

    const companySlug = updated.employerProfile?.slug ?? employerProfileId;

    await this.notifications.create(userId, {
      type: newStatus === 'APPROVED' ? 'review_approved' : 'review_rejected',
      title: newStatus === 'APPROVED' ? 'Đánh giá được duyệt' : 'Đánh giá bị từ chối',
      body:
        newStatus === 'APPROVED'
          ? 'Đánh giá của bạn đã được duyệt và hiển thị công khai.'
          : `Đánh giá bị từ chối: ${result.rejectReason}`,
      url: `/cong-ty/${companySlug}?tab=reviews`,
    });
  }

  async getEmployerReviews(idOrSlug: string) {
    const employerProfileId = await this.resolveId(idOrSlug);

    const [reviews, stats, distrib, recCount] = await Promise.all([
      this.prisma.employerReview.findMany({
        where: { employerProfileId, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          rating: true,
          overtimePolicy: true,
          overtimeReason: true,
          liked: true,
          improvement: true,
          salaryRating: true,
          trainingRating: true,
          careRating: true,
          cultureRating: true,
          officeRating: true,
          recommend: true,
          createdAt: true,
          // userId NOT included — anonymous
        },
      }),
      this.prisma.employerReview.aggregate({
        where: { employerProfileId, status: 'APPROVED' },
        _avg: {
          rating: true,
          salaryRating: true,
          trainingRating: true,
          careRating: true,
          cultureRating: true,
          officeRating: true,
        },
        _count: { id: true },
      }),
      this.prisma.employerReview.groupBy({
        by: ['rating'],
        where: { employerProfileId, status: 'APPROVED' },
        _count: { rating: true },
      }),
      this.prisma.employerReview.count({
        where: { employerProfileId, status: 'APPROVED', recommend: true },
      }),
    ]);

    const total = stats._count.id;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distrib.forEach((d) => { distribution[d.rating] = d._count.rating; });

    return {
      stats: {
        avgRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : null,
        totalReviews: total,
        recommendPercent: total > 0 ? Math.round((recCount / total) * 100) : 0,
        distribution,
        avgSalary: stats._avg.salaryRating ? Math.round(stats._avg.salaryRating * 10) / 10 : null,
        avgTraining: stats._avg.trainingRating ? Math.round(stats._avg.trainingRating * 10) / 10 : null,
        avgCare: stats._avg.careRating ? Math.round(stats._avg.careRating * 10) / 10 : null,
        avgCulture: stats._avg.cultureRating ? Math.round(stats._avg.cultureRating * 10) / 10 : null,
        avgOffice: stats._avg.officeRating ? Math.round(stats._avg.officeRating * 10) / 10 : null,
      },
      reviews,
    };
  }

  // ── ADMIN: manage employer reviews ────────────────────────────────────────

  async adminGetEmployerReviews(status?: string) {
    return this.prisma.employerReview.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        employerProfile: { select: { companyName: true, logoUrl: true, slug: true, id: true } },
        user: { select: { email: true, candidateProfile: { select: { fullName: true, avatarUrl: true } } } },
      },
    });
  }

  async adminUpdateReviewStatus(reviewId: string, status: 'APPROVED' | 'REJECTED', rejectReason?: string) {
    return this.prisma.employerReview.update({
      where: { id: reviewId },
      data: { status, rejectReason: rejectReason ?? null },
    });
  }
}
