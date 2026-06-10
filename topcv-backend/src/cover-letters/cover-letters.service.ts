import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PLAN_LIMITS } from '../common/plan-limits';

const DEFAULT_CONTENT = {
  avatarUrl: null,
  fullName: 'NGUYỄN VĂN A',
  jobTitle: 'Nhân Viên Kinh Doanh',
  phone: 'Số điện thoại',
  email: 'Địa chỉ email',
  address: 'Địa chỉ của bạn',
  recipientName: '[Tên]',
  department: '[Vị trí / Phòng ban]',
  company: '[Tên Công Ty]',
  companyAddress: '[Địa chỉ công ty]',
  position: '[Vị trí công việc]',
  body: 'Thông qua ..., tôi được biết Quý Công ty đang cần tuyển vị trí [Tên vị trí công việc]. Tôi mong muốn được thử sức mình trong môi trường làm việc hết sức năng động của Quý Công ty. Với trình độ và kinh nghiệm hiện có, tôi tự tin có thể đảm nhiệm tốt vai trò này tại công ty [Tên công ty].\n\nNhư đã đề cập trong hồ sơ đính kèm, tôi có nhiều kinh nghiệm làm việc với các công ty ... ở vị trí .... Vị trí này đã cho tôi... [bạn viết ra những kinh nghiệm nổi trội phù hợp với vị trí ứng tuyển] với thành tích [bạn nêu thành tích tốt nhất bạn có được]. Ngoài ra, tôi còn có kinh nghiệm về ... trong suốt thời gian làm việc với công ty .... Là một trong nhiều sinh viên tốt nghiệp hàng đầu của trường Đại Học ..., tôi hoàn toàn tự tin với vốn kiến thức về lĩnh vực ... của mình.\n\nThêm vào đó, tôi có một năm kinh nghiệm làm việc cho một công ty kinh doanh ... ở vị trí ... sau khi tốt nghiệp. Tôi tin rằng đó là những nền tảng quý báu có thể giúp tôi hiểu rõ và đáp ứng tốt nhu cầu khách hàng của Quý Công ty.\n\nCảm ơn ông/bà đã dành thời gian quý báu để xem xét thư xin việc này. Tôi rất mong ông/bà có thể sắp xếp một cuộc phỏng vấn trực tiếp gần đây nhất để tôi có thể trình bày rõ hơn về bản thân cũng như tìm hiểu thêm các yêu cầu chi tiết cho vị trí [Tên vị trí công việc] của [Tên công ty].\n\nTrân trọng. Xin cảm ơn!',
};

@Injectable()
export class CoverLettersService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const items = await this.prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return { data: items };
  }

  private async getUserPlan(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { plan: true, planExpiresAt: true } });
    if (!user) return 'FREE';
    if (user.plan !== 'FREE' && user.planExpiresAt && user.planExpiresAt < new Date()) {
      await this.prisma.user.update({ where: { id: userId }, data: { plan: 'FREE', planExpiresAt: null } });
      return 'FREE';
    }
    return user.plan ?? 'FREE';
  }

  async create(userId: string, body: any) {
    const plan = await this.getUserPlan(userId);
    const limit = PLAN_LIMITS[plan]?.cl ?? 6;
    const count = await this.prisma.coverLetter.count({ where: { userId } });
    if (count >= limit) {
      throw new ForbiddenException(`Bạn đã đạt giới hạn ${limit} Cover Letter. Nâng cấp tài khoản để tạo thêm.`);
    }

    const cl = await this.prisma.coverLetter.create({
      data: {
        userId,
        title: body.title ?? 'Cover Letter chưa đặt tên',
        templateId: body.templateId ?? 'tinh-te-1',
        color: body.color ?? '#1e3a5f',
        font: body.font ?? 'Muli',
        fontSize: body.fontSize ?? 'medium',
        lineSpacing: body.lineSpacing ?? 1.5,
        content: body.content ?? DEFAULT_CONTENT,
      },
    });
    return { data: cl };
  }

  async findOne(id: string) {
    const cl = await this.prisma.coverLetter.findUnique({ where: { id } });
    if (!cl) throw new NotFoundException('Cover letter không tồn tại');
    return { data: cl };
  }

  async update(userId: string, id: string, body: any) {
    const cl = await this.prisma.coverLetter.findUnique({ where: { id } });
    if (!cl) throw new NotFoundException('Cover letter không tồn tại');
    if (cl.userId !== userId) throw new ForbiddenException('Không có quyền');

    const updated = await this.prisma.coverLetter.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.templateId !== undefined && { templateId: body.templateId }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.font !== undefined && { font: body.font }),
        ...(body.fontSize !== undefined && { fontSize: body.fontSize }),
        ...(body.lineSpacing !== undefined && { lineSpacing: body.lineSpacing }),
        ...(body.content !== undefined && { content: body.content }),
      },
    });
    return { data: updated };
  }

  async remove(userId: string, id: string) {
    const cl = await this.prisma.coverLetter.findUnique({ where: { id } });
    if (!cl) throw new NotFoundException('Cover letter không tồn tại');
    if (cl.userId !== userId) throw new ForbiddenException('Không có quyền');
    await this.prisma.coverLetter.delete({ where: { id } });
    return { message: 'Đã xóa cover letter' };
  }
}
