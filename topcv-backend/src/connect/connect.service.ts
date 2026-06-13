import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { NotificationsService } from '../notifications/notifications.service';
import { neon } from '@neondatabase/serverless';

@Injectable()
export class ConnectService {
  private sql = neon(process.env.DATABASE_URL!);

  constructor(
    private prisma: PrismaService,
    private mailer: MailerService,
    private notifications: NotificationsService,
  ) {}

  // ─── EMPLOYER: get candidate suggestions ─────────────────────────────────────
  async getSuggestions(
    employerUserId: string,
    query: { page?: string; limit?: string; mode?: string },
  ) {
    const employer = await (this.prisma as any).employerProfile.findUnique({
      where: { userId: employerUserId },
      select: { id: true, industryId: true, companyName: true },
    });
    if (!employer) throw new NotFoundException('Employer profile not found');

    await this.ensureGenderDobColumns();
    await this.ensureEmployerIndustryIdsColumn();

    const limit = Math.min(Number(query.limit) || 10, 50);
    const page = Number(query.page) || 1;
    const offset = (page - 1) * limit;

    // Combine single industryId + industryIds array for multi-industry matching
    const empIdsRows = await this.sql`
      SELECT industry_ids FROM employer_profiles WHERE user_id = ${employerUserId}
    `;
    const rawIds: number[] = (empIdsRows[0]?.industry_ids as number[]) || [];
    const combinedIds = [
      ...new Set([
        ...(employer.industryId ? [employer.industryId] : []),
        ...rawIds,
      ]),
    ];

    // mode='view'  → xem hồ sơ: chỉ cần industry match
    // mode='connect' (default) → kết nối: cần is_looking_for_job + CV + industry match
    const isViewMode = query.mode === 'view';
    const hasIndustry = combinedIds.length > 0;

    // Pass employer industryIds as JSON string; EXISTS checks overlap with candidate's preferences
    const industryJsonbArray = hasIndustry
      ? JSON.stringify(combinedIds)
      : null;

    const rows = isViewMode
      ? hasIndustry
        ? await this.sql`
            SELECT
              cp.id            AS profile_id,
              cp.user_id,
              cp.full_name,
              cp.avatar_url,
              cp.gender,
              cp.dob,
              cp.default_cv_id,
              cp.job_preferences,
              r.title          AS cv_title,
              r.type           AS cv_type,
              r.file_url       AS cv_file_url
            FROM candidate_profiles cp
            LEFT JOIN resumes r ON r.id = cp.default_cv_id
            WHERE cp.allow_employer_search = true
              AND NOT EXISTS (
                SELECT 1 FROM employer_candidate_connects ecc
                WHERE ecc.employer_profile_id = ${employer.id}
                  AND ecc.candidate_user_id = cp.user_id
              )
              AND (
                cp.job_preferences IS NULL
                OR (cp.job_preferences->'industryIds') IS NULL
                OR jsonb_array_length(COALESCE(cp.job_preferences->'industryIds', '[]'::jsonb)) = 0
                OR EXISTS (
                  SELECT 1 FROM jsonb_array_elements(COALESCE(cp.job_preferences->'industryIds', '[]'::jsonb)) cid
                  WHERE ${industryJsonbArray}::jsonb @> cid
                )
              )
            ORDER BY cp.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
        : await this.sql`
            SELECT
              cp.id            AS profile_id,
              cp.user_id,
              cp.full_name,
              cp.avatar_url,
              cp.gender,
              cp.dob,
              cp.default_cv_id,
              cp.job_preferences,
              r.title          AS cv_title,
              r.type           AS cv_type,
              r.file_url       AS cv_file_url
            FROM candidate_profiles cp
            LEFT JOIN resumes r ON r.id = cp.default_cv_id
            WHERE cp.allow_employer_search = true
              AND NOT EXISTS (
                SELECT 1 FROM employer_candidate_connects ecc
                WHERE ecc.employer_profile_id = ${employer.id}
                  AND ecc.candidate_user_id = cp.user_id
              )
            ORDER BY cp.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
      : hasIndustry
        ? await this.sql`
            SELECT
              cp.id            AS profile_id,
              cp.user_id,
              cp.full_name,
              cp.avatar_url,
              cp.gender,
              cp.dob,
              cp.default_cv_id,
              cp.job_preferences,
              r.title          AS cv_title,
              r.type           AS cv_type,
              r.file_url       AS cv_file_url
            FROM candidate_profiles cp
            LEFT JOIN resumes r ON r.id = cp.default_cv_id
            WHERE cp.is_looking_for_job = true
              AND cp.default_cv_id IS NOT NULL
              AND cp.allow_employer_search = true
              AND NOT EXISTS (
                SELECT 1 FROM employer_candidate_connects ecc
                WHERE ecc.employer_profile_id = ${employer.id}
                  AND ecc.candidate_user_id = cp.user_id
              )
              AND (
                cp.job_preferences IS NULL
                OR (cp.job_preferences->'industryIds') IS NULL
                OR jsonb_array_length(COALESCE(cp.job_preferences->'industryIds', '[]'::jsonb)) = 0
                OR EXISTS (
                  SELECT 1 FROM jsonb_array_elements(COALESCE(cp.job_preferences->'industryIds', '[]'::jsonb)) cid
                  WHERE ${industryJsonbArray}::jsonb @> cid
                )
              )
            ORDER BY cp.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
        : await this.sql`
            SELECT
              cp.id            AS profile_id,
              cp.user_id,
              cp.full_name,
              cp.avatar_url,
              cp.gender,
              cp.dob,
              cp.default_cv_id,
              cp.job_preferences,
              r.title          AS cv_title,
              r.type           AS cv_type,
              r.file_url       AS cv_file_url
            FROM candidate_profiles cp
            LEFT JOIN resumes r ON r.id = cp.default_cv_id
            WHERE cp.is_looking_for_job = true
              AND cp.default_cv_id IS NOT NULL
              AND cp.allow_employer_search = true
              AND NOT EXISTS (
                SELECT 1 FROM employer_candidate_connects ecc
                WHERE ecc.employer_profile_id = ${employer.id}
                  AND ecc.candidate_user_id = cp.user_id
              )
            ORDER BY cp.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;

    const countRows = isViewMode
      ? hasIndustry
        ? await this.sql`
            SELECT COUNT(*)::int AS total
            FROM candidate_profiles cp
            WHERE cp.allow_employer_search = true
              AND NOT EXISTS (
                SELECT 1 FROM employer_candidate_connects ecc
                WHERE ecc.employer_profile_id = ${employer.id}
                  AND ecc.candidate_user_id = cp.user_id
              )
              AND (
                cp.job_preferences IS NULL
                OR (cp.job_preferences->'industryIds') IS NULL
                OR jsonb_array_length(COALESCE(cp.job_preferences->'industryIds', '[]'::jsonb)) = 0
                OR EXISTS (
                  SELECT 1 FROM jsonb_array_elements(COALESCE(cp.job_preferences->'industryIds', '[]'::jsonb)) cid
                  WHERE ${industryJsonbArray}::jsonb @> cid
                )
              )
          `
        : await this.sql`
            SELECT COUNT(*)::int AS total
            FROM candidate_profiles cp
            WHERE cp.allow_employer_search = true
              AND NOT EXISTS (
                SELECT 1 FROM employer_candidate_connects ecc
                WHERE ecc.employer_profile_id = ${employer.id}
                  AND ecc.candidate_user_id = cp.user_id
              )
          `
      : hasIndustry
        ? await this.sql`
            SELECT COUNT(*)::int AS total
            FROM candidate_profiles cp
            WHERE cp.is_looking_for_job = true
              AND cp.default_cv_id IS NOT NULL
              AND cp.allow_employer_search = true
              AND NOT EXISTS (
                SELECT 1 FROM employer_candidate_connects ecc
                WHERE ecc.employer_profile_id = ${employer.id}
                  AND ecc.candidate_user_id = cp.user_id
              )
              AND (
                cp.job_preferences IS NULL
                OR (cp.job_preferences->'industryIds') IS NULL
                OR jsonb_array_length(COALESCE(cp.job_preferences->'industryIds', '[]'::jsonb)) = 0
                OR EXISTS (
                  SELECT 1 FROM jsonb_array_elements(COALESCE(cp.job_preferences->'industryIds', '[]'::jsonb)) cid
                  WHERE ${industryJsonbArray}::jsonb @> cid
                )
              )
          `
        : await this.sql`
            SELECT COUNT(*)::int AS total
            FROM candidate_profiles cp
            WHERE cp.is_looking_for_job = true
              AND cp.default_cv_id IS NOT NULL
              AND cp.allow_employer_search = true
              AND NOT EXISTS (
                SELECT 1 FROM employer_candidate_connects ecc
                WHERE ecc.employer_profile_id = ${employer.id}
                  AND ecc.candidate_user_id = cp.user_id
              )
          `;

    return {
      data: rows.map((r: any) => ({
        profileId: r.profile_id,
        userId: r.user_id,
        fullName: r.full_name,
        avatarUrl: r.avatar_url,
        gender: r.gender,
        dob: r.dob,
        defaultCvId: r.default_cv_id,
        cvTitle: r.cv_title,
        cvType: r.cv_type,
        cvFileUrl: r.cv_file_url,
        jobPreferences: r.job_preferences,
      })),
      meta: {
        total: countRows[0].total,
        page,
        limit,
        totalPages: Math.ceil(countRows[0].total / limit),
      },
    };
  }

  // ─── EMPLOYER: skip candidate ─────────────────────────────────────────────────
  async skip(employerUserId: string, candidateUserId: string) {
    const employer = await (this.prisma as any).employerProfile.findUnique({
      where: { userId: employerUserId },
      select: { id: true },
    });
    if (!employer) throw new NotFoundException('Employer profile not found');

    await this.sql`
      INSERT INTO employer_candidate_connects (id, employer_profile_id, candidate_user_id, status)
      VALUES (gen_random_uuid()::text, ${employer.id}, ${candidateUserId}, 'SKIPPED')
      ON CONFLICT (employer_profile_id, candidate_user_id) DO UPDATE SET status = 'SKIPPED', updated_at = NOW()
    `;

    return { skipped: true };
  }

  // ─── EMPLOYER: send connect request ──────────────────────────────────────────
  async request(employerUserId: string, candidateUserId: string) {
    const employer = await (this.prisma as any).employerProfile.findUnique({
      where: { userId: employerUserId },
      select: { id: true, companyName: true },
    });
    if (!employer) throw new NotFoundException('Employer profile not found');

    const candidate = await (this.prisma as any).user.findUnique({
      where: { id: candidateUserId },
      select: {
        id: true,
        email: true,
        candidateProfile: { select: { fullName: true } },
      },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const existing = await this.sql`
      SELECT id, status FROM employer_candidate_connects
      WHERE employer_profile_id = ${employer.id} AND candidate_user_id = ${candidateUserId}
    `;

    if (existing.length > 0 && existing[0].status === 'CONNECTED') {
      throw new BadRequestException('Đã kết nối với ứng viên này');
    }
    if (existing.length > 0 && existing[0].status === 'PENDING') {
      throw new BadRequestException('Đã gửi yêu cầu kết nối, đang chờ ứng viên phản hồi');
    }

    await this.sql`
      INSERT INTO employer_candidate_connects (id, employer_profile_id, candidate_user_id, status)
      VALUES (gen_random_uuid()::text, ${employer.id}, ${candidateUserId}, 'PENDING')
      ON CONFLICT (employer_profile_id, candidate_user_id)
      DO UPDATE SET status = 'PENDING', updated_at = NOW()
    `;

    const candidateName = candidate.candidateProfile?.fullName ?? 'Ứng viên';

    // Send in-app notification
    await this.notifications.create(candidateUserId, {
      type: 'CONNECT_REQUEST',
      title: 'Nhà tuyển dụng muốn kết nối với bạn',
      body: `${employer.companyName} muốn kết nối với bạn. Hãy xem và phản hồi ngay!`,
      url: '/connect-to-employer/list',
      data: { employerProfileId: employer.id },
    });

    // Send email
    try {
      await this.mailer.sendMail({
        to: candidate.email,
        subject: `${employer.companyName} muốn kết nối với bạn - TopCV Clone`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:40px auto;background:#fff;border-radius:8px;padding:32px;border:1px solid #e5e7eb">
            <div style="color:#00b14f;font-size:22px;font-weight:bold;margin-bottom:16px">TopCV Clone</div>
            <h2 style="font-size:18px;margin-bottom:12px">Nhà tuyển dụng muốn kết nối với bạn</h2>
            <p>Xin chào <strong>${candidateName}</strong>,</p>
            <p><strong>${employer.companyName}</strong> đã xem hồ sơ của bạn và muốn kết nối để trao đổi về cơ hội nghề nghiệp phù hợp.</p>
            <div style="text-align:center;margin:24px 0">
              <a href="${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/connect-to-employer/list"
                 style="display:inline-block;background:#00b14f;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                Xem yêu cầu kết nối
              </a>
            </div>
            <p style="color:#888;font-size:13px">Vui lòng đăng nhập vào TopCV Clone để chấp nhận hoặc từ chối yêu cầu này.</p>
          </div>
        `,
      });
    } catch (e) {
      // Email failure shouldn't block the request
      console.error('[Connect] email send failed:', (e as any)?.message);
    }

    return { requested: true };
  }

  // ─── CANDIDATE: list incoming requests ───────────────────────────────────────
  async myRequests(
    candidateUserId: string,
    query: { page?: string; limit?: string; status?: string },
  ) {
    const limit = Math.min(Number(query.limit) || 10, 50);
    const page = Number(query.page) || 1;
    const offset = (page - 1) * limit;
    const status = query.status ?? 'PENDING';

    const rows = await this.sql`
      SELECT
        ecc.id,
        ecc.status,
        ecc.created_at,
        ecc.updated_at,
        ep.id           AS employer_profile_id,
        ep.company_name,
        ep.logo_url,
        ep.slug         AS employer_slug
      FROM employer_candidate_connects ecc
      JOIN employer_profiles ep ON ep.id = ecc.employer_profile_id
      WHERE ecc.candidate_user_id = ${candidateUserId}
        AND ecc.status = ${status}
      ORDER BY ecc.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countRows = await this.sql`
      SELECT COUNT(*)::int AS total
      FROM employer_candidate_connects
      WHERE candidate_user_id = ${candidateUserId} AND status = ${status}
    `;

    return {
      data: rows.map((r: any) => ({
        id: r.id,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        employer: {
          id: r.employer_profile_id,
          companyName: r.company_name,
          logoUrl: r.logo_url,
          slug: r.employer_slug,
        },
      })),
      meta: {
        total: countRows[0].total,
        page,
        limit,
        totalPages: Math.ceil(countRows[0].total / limit),
      },
    };
  }

  // ─── CANDIDATE: accept request → create chat ─────────────────────────────────
  async accept(candidateUserId: string, connectId: string) {
    const rows = await this.sql`
      SELECT ecc.*, ep.company_name, ep.id AS employer_profile_id
      FROM employer_candidate_connects ecc
      JOIN employer_profiles ep ON ep.id = ecc.employer_profile_id
      WHERE ecc.id = ${connectId} AND ecc.candidate_user_id = ${candidateUserId}
    `;

    if (rows.length === 0) throw new NotFoundException('Yêu cầu kết nối không tồn tại');
    const connect = rows[0] as any;
    if (connect.status !== 'PENDING') {
      throw new BadRequestException('Yêu cầu này đã được xử lý');
    }

    await this.sql`
      UPDATE employer_candidate_connects
      SET status = 'CONNECTED', updated_at = NOW()
      WHERE id = ${connectId}
    `;

    // Create or find conversation
    const convRows = await this.sql`
      INSERT INTO conversations (id, candidate_id, employer_profile_id)
      VALUES (gen_random_uuid()::text, ${candidateUserId}, ${connect.employer_profile_id})
      ON CONFLICT (candidate_id, employer_profile_id) DO UPDATE SET candidate_id = EXCLUDED.candidate_id
      RETURNING id
    `;
    const conversationId = convRows[0].id;

    // Get employer user id to use as message sender
    const empUserRows = await this.sql`
      SELECT user_id FROM employer_profiles WHERE id = ${connect.employer_profile_id}
    `;
    const employerUserId = empUserRows[0]?.user_id;

    // Get candidate name
    const candRows = await this.sql`
      SELECT full_name FROM candidate_profiles WHERE user_id = ${candidateUserId}
    `;
    const candidateName = candRows[0]?.full_name ?? 'bạn';

    const openingMsg = `Chào ${candidateName}, chúng tôi rất ấn tượng với hồ sơ của bạn và muốn kết nối để trao đổi về cơ hội nghề nghiệp phù hợp. Vui lòng liên hệ với chúng tôi để biết thêm chi tiết!`;

    await this.sql`
      INSERT INTO messages (id, conversation_id, sender_id, content, type)
      VALUES (gen_random_uuid()::text, ${conversationId}, ${employerUserId}, ${openingMsg}, 'text')
    `;

    await this.sql`
      UPDATE conversations SET last_message_at = NOW() WHERE id = ${conversationId}
    `;

    // Notify employer
    if (employerUserId) {
      const candName = candRows[0]?.full_name ?? 'Ứng viên';
      await this.notifications.create(employerUserId, {
        type: 'CONNECT_ACCEPTED',
        title: 'Ứng viên đã chấp nhận kết nối',
        body: `${candName} đã chấp nhận yêu cầu kết nối của bạn. Hãy bắt đầu trò chuyện!`,
        url: `/nha-tuyen-dung/tin-nhan/${conversationId}`,
        data: { conversationId },
      });
    }

    return { accepted: true, conversationId };
  }

  // ─── CANDIDATE: reject request ────────────────────────────────────────────────
  async reject(candidateUserId: string, connectId: string) {
    const rows = await this.sql`
      SELECT id, status FROM employer_candidate_connects
      WHERE id = ${connectId} AND candidate_user_id = ${candidateUserId}
    `;

    if (rows.length === 0) throw new NotFoundException('Yêu cầu kết nối không tồn tại');
    if ((rows[0] as any).status !== 'PENDING') {
      throw new BadRequestException('Yêu cầu này đã được xử lý');
    }

    await this.sql`
      UPDATE employer_candidate_connects
      SET status = 'REJECTED', updated_at = NOW()
      WHERE id = ${connectId}
    `;

    return { rejected: true };
  }

  // ─── EMPLOYER: record profile view ──────────────────────────────────────────
  private genderDobEnsured = false;
  private async ensureGenderDobColumns() {
    if (this.genderDobEnsured) return;
    await this.sql`
      ALTER TABLE candidate_profiles
      ADD COLUMN IF NOT EXISTS gender TEXT,
      ADD COLUMN IF NOT EXISTS dob DATE
    `;
    this.genderDobEnsured = true;
  }

  private employerIndustryEnsured = false;
  private async ensureEmployerIndustryIdsColumn() {
    if (this.employerIndustryEnsured) return;
    await this.sql`
      ALTER TABLE employer_profiles
      ADD COLUMN IF NOT EXISTS industry_ids JSONB DEFAULT '[]'::jsonb
    `;
    this.employerIndustryEnsured = true;
  }

  // ─── EMPLOYER: get full candidate detail ─────────────────────────────────────
  async getCandidateDetail(employerUserId: string, candidateUserId: string) {
    await this.ensureGenderDobColumns();
    const employer = await (this.prisma as any).employerProfile.findUnique({
      where: { userId: employerUserId },
      select: { id: true },
    });
    if (!employer) throw new NotFoundException('Employer profile not found');

    const rows = await this.sql`
      SELECT
        cp.user_id,
        cp.full_name,
        cp.avatar_url,
        cp.gender,
        cp.dob,
        cp.job_preferences,
        cp.default_cv_id,
        u.email,
        u.phone,
        r.title    AS cv_title,
        r.type     AS cv_type,
        r.file_url AS cv_file_url
      FROM candidate_profiles cp
      JOIN users u ON u.id = cp.user_id
      LEFT JOIN resumes r ON r.id = cp.default_cv_id
      WHERE cp.user_id = ${candidateUserId}
        AND cp.allow_employer_search = true
    `;

    if (rows.length === 0) throw new NotFoundException('Candidate not found');
    const r = rows[0] as any;

    return {
      userId: r.user_id,
      fullName: r.full_name,
      avatarUrl: r.avatar_url,
      gender: r.gender,
      dob: r.dob,
      phone: r.phone ? r.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : null,
      jobPreferences: r.job_preferences,
      defaultCvId: r.default_cv_id,
      cvTitle: r.cv_title,
      cvType: r.cv_type,
      cvFileUrl: r.cv_file_url,
    };
  }

  private async ensureProfileViewsTable() {
    await this.sql`
      CREATE TABLE IF NOT EXISTS employer_profile_views (
        id TEXT DEFAULT gen_random_uuid()::TEXT,
        employer_user_id TEXT NOT NULL,
        candidate_user_id TEXT NOT NULL,
        viewed_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (id),
        UNIQUE(employer_user_id, candidate_user_id)
      )
    `;
  }

  async recordProfileView(employerUserId: string, candidateUserId: string) {
    await this.ensureProfileViewsTable();
    await this.sql`
      INSERT INTO employer_profile_views (id, employer_user_id, candidate_user_id, viewed_at)
      VALUES (gen_random_uuid()::text, ${employerUserId}, ${candidateUserId}, NOW())
      ON CONFLICT (employer_user_id, candidate_user_id) DO UPDATE SET viewed_at = NOW()
    `;
    return { recorded: true };
  }

  // ─── CANDIDATE: list employers who viewed profile ────────────────────────────
  async getProfileViewers(
    candidateUserId: string,
    query: { page?: string; limit?: string },
  ) {
    await this.ensureProfileViewsTable();
    const limit = Math.min(Number(query.limit) || 10, 50);
    const page = Number(query.page) || 1;
    const offset = (page - 1) * limit;

    const rows = await this.sql`
      SELECT
        epv.viewed_at,
        ep.id           AS employer_profile_id,
        ep.company_name,
        ep.logo_url,
        ep.slug         AS employer_slug,
        ep.description
      FROM employer_profile_views epv
      JOIN employer_profiles ep ON ep.user_id = epv.employer_user_id
      WHERE epv.candidate_user_id = ${candidateUserId}
      ORDER BY epv.viewed_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countRows = await this.sql`
      SELECT COUNT(*)::int AS total
      FROM employer_profile_views
      WHERE candidate_user_id = ${candidateUserId}
    `;

    return {
      data: rows.map((r: any) => ({
        viewedAt: r.viewed_at,
        employer: {
          id: r.employer_profile_id,
          companyName: r.company_name,
          logoUrl: r.logo_url,
          slug: r.employer_slug,
          description: r.description,
        },
      })),
      meta: {
        total: countRows[0].total,
        page,
        limit,
        totalPages: Math.ceil(countRows[0].total / limit),
      },
    };
  }

  // ─── EMPLOYER: list sent requests ────────────────────────────────────────────
  async mySentRequests(
    employerUserId: string,
    query: { page?: string; limit?: string; status?: string },
  ) {
    const employer = await (this.prisma as any).employerProfile.findUnique({
      where: { userId: employerUserId },
      select: { id: true },
    });
    if (!employer) throw new NotFoundException('Employer profile not found');

    const limit = Math.min(Number(query.limit) || 10, 50);
    const page = Number(query.page) || 1;
    const offset = (page - 1) * limit;
    const status = query.status;

    const rows = status
      ? await this.sql`
          SELECT ecc.id, ecc.status, ecc.created_at, cp.full_name, cp.avatar_url, u.email
          FROM employer_candidate_connects ecc
          JOIN users u ON u.id = ecc.candidate_user_id
          LEFT JOIN candidate_profiles cp ON cp.user_id = ecc.candidate_user_id
          WHERE ecc.employer_profile_id = ${employer.id} AND ecc.status = ${status}
          ORDER BY ecc.created_at DESC LIMIT ${limit} OFFSET ${offset}
        `
      : await this.sql`
          SELECT ecc.id, ecc.status, ecc.created_at, cp.full_name, cp.avatar_url, u.email
          FROM employer_candidate_connects ecc
          JOIN users u ON u.id = ecc.candidate_user_id
          LEFT JOIN candidate_profiles cp ON cp.user_id = ecc.candidate_user_id
          WHERE ecc.employer_profile_id = ${employer.id}
          ORDER BY ecc.created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;

    const countRows = status
      ? await this.sql`
          SELECT COUNT(*)::int AS total FROM employer_candidate_connects
          WHERE employer_profile_id = ${employer.id} AND status = ${status}
        `
      : await this.sql`
          SELECT COUNT(*)::int AS total FROM employer_candidate_connects
          WHERE employer_profile_id = ${employer.id}
        `;

    return {
      data: rows.map((r: any) => ({
        id: r.id,
        status: r.status,
        createdAt: r.created_at,
        candidate: {
          fullName: r.full_name,
          avatarUrl: r.avatar_url,
          email: r.email,
        },
      })),
      meta: {
        total: countRows[0].total,
        page,
        limit,
        totalPages: Math.ceil(countRows[0].total / limit),
      },
    };
  }
}
