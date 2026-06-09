import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_CONTENT = {
  personalInfo: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    linkedin: '',
    github: '',
    avatarUrl: null,
  },
  objective: '',
  experiences: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
  activities: [],
};

@Injectable()
export class ResumesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, type = 'resume') {
    return this.prisma.resume.findMany({
      where: { userId, type },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        template: true,
        color: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new NotFoundException('Không tìm thấy CV');
    if (resume.userId !== userId) throw new ForbiddenException('Không có quyền truy cập');
    return resume;
  }

  async create(
    userId: string,
    data: {
      type?: string;
      title?: string;
      template?: string;
      color?: string;
      fontSize?: string;
      lineSpacing?: number;
      content?: any;
    },
  ) {
    return this.prisma.resume.create({
      data: {
        userId,
        type: data.type ?? 'resume',
        title: data.title ?? (data.type === 'cover-letter' ? 'Cover Letter chưa đặt tên' : 'CV chưa đặt tên'),
        template: data.template ?? 'tieu-chuan',
        color: data.color ?? '#00b14f',
        fontSize: data.fontSize ?? 'medium',
        lineSpacing: data.lineSpacing ?? 1.5,
        content: data.content ?? DEFAULT_CONTENT,
      },
    });
  }

  async update(userId: string, id: string, data: any) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new NotFoundException('Không tìm thấy CV');
    if (resume.userId !== userId) throw new ForbiddenException('Không có quyền truy cập');

    const { type, userId: _uid, id: _id, createdAt, ...allowed } = data;

    return this.prisma.resume.update({
      where: { id },
      data: allowed,
    });
  }

  async remove(userId: string, id: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new NotFoundException('Không tìm thấy CV');
    if (resume.userId !== userId) throw new ForbiddenException('Không có quyền truy cập');
    await this.prisma.resume.delete({ where: { id } });
    return { message: 'Đã xóa thành công' };
  }
}
