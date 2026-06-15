import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';

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
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    email: string;
    passwordHash?: string;
    role: Role;
    phone?: string;
    provider?: string;
    isVerified?: boolean;
  }) {
    return this.prisma.user.create({ data });
  }

  async updateVerified(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });
  }

  async updatePassword(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async createProfile(userId: string, fullName: string, role: Role) {
    if (role === Role.CANDIDATE) {
      return this.prisma.candidateProfile.create({
        data: { userId, fullName },
      });
    }
    if (role === Role.EMPLOYER) {
      return this.prisma.employerProfile.create({
        data: { userId, companyName: fullName },
      });
    }
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        isActive: true,
        twoFactorEnabled: true,
        provider: true,
        createdAt: true,
        candidateProfile: true,
        employerProfile: true,
      },
    });
  }

  // ─── PERSONAL INFO ───────────────────────────────────
  async updatePersonalInfo(
    userId: string,
    data: { fullName?: string; phone?: string; gender?: string; dob?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    if (data.phone !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { phone: data.phone },
      });
    }

    if (user.role === Role.CANDIDATE) {
      const profileUpdate: Record<string, any> = {};
      if (data.fullName) profileUpdate.fullName = data.fullName;
      if (data.gender !== undefined) profileUpdate.gender = data.gender || null;
      if (data.dob !== undefined) profileUpdate.dob = data.dob ? new Date(data.dob) : null;

      if (Object.keys(profileUpdate).length > 0) {
        await this.prisma.candidateProfile.update({
          where: { userId },
          data: profileUpdate,
        });
      }
    }

    return { message: 'Cập nhật thông tin thành công' };
  }

  // ─── CANDIDATE PROFILE ───────────────────────────────
  async updateCandidateProfile(
    userId: string,
    data: {
      avatarUrl?: string;
      isLookingForJob?: boolean;
      allowEmployerSearch?: boolean;
      defaultCvId?: string | null;
    },
  ) {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
    );

    return (this.prisma.candidateProfile as any).upsert({
      where: { userId },
      update: cleanData,
      create: {
        userId,
        fullName: '',
        ...cleanData,
      },
    });
  }

  async getCandidateProfile(userId: string) {
    return this.prisma.candidateProfile.findUnique({ where: { userId } });
  }

  // ─── EMPLOYER PROFILE ────────────────────────────────
  async updateEmployerProfile(
    userId: string,
    data: {
      companyName?: string;
      companySize?: string;
      industryId?: number;
      industryIds?: number[];
      website?: string;
      address?: string;
      logoUrl?: string;
      description?: string;
      taxCode?: string;
    },
  ) {
    const { industryIds, ...rest } = data;
    const cleanData: Record<string, any> = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => v !== undefined),
    );

    if (cleanData.industryId !== undefined) {
      cleanData.industryId = Number(cleanData.industryId);
    }

    if (industryIds !== undefined) {
      cleanData.industryIds = Array.isArray(industryIds)
        ? industryIds.map(Number)
        : [];
    }

    const existing = await this.prisma.employerProfile.findUnique({
      where: { userId },
    });

    const result = await this.prisma.employerProfile.upsert({
      where: { userId },
      update: cleanData,
      create: {
        userId,
        companyName: String(cleanData.companyName ?? existing?.companyName ?? ''),
        ...cleanData,
      },
    });

    if (!result.slug) {
      const slug = toSlug(result.companyName) + '-' + result.id.slice(0, 8);
      await this.prisma.employerProfile
        .update({ where: { id: result.id }, data: { slug } })
        .catch(() => {});
      result.slug = slug;
    }

    return result;
  }

  async getEmployerProfile(userId: string) {
    return this.prisma.employerProfile.findUnique({ where: { userId } });
  }

  // ─── JOB PREFERENCES ─────────────────────────────────
  async updateJobPreferences(userId: string, jobPreferences: any) {
    return this.prisma.candidateProfile.upsert({
      where: { userId },
      update: { jobPreferences },
      create: { userId, fullName: '', jobPreferences },
    });
  }

  // ─── PASSWORD ────────────────────────────────────────
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');
    if (!user.passwordHash)
      throw new BadRequestException('Tài khoản này dùng đăng nhập social');

    const isMatch = await argon2.verify(user.passwordHash, oldPassword);
    if (!isMatch) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    const passwordHash = await argon2.hash(newPassword);
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async saveFcmToken(userId: string, token: string) {
    await (this.prisma as any).user.update({
      where: { id: userId },
      data: { fcmToken: token },
    });
    return { message: 'ok' };
  }

  async getFcmToken(userId: string): Promise<string | null> {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });
    return user?.fcmToken ?? null;
  }
}
