import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { PrismaService } from '../prisma/prisma.service';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

@Injectable()
export class CvScoringService {
  private groq: Groq;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.groq = new Groq({ apiKey: this.config.getOrThrow<string>('GROQ_API_KEY') });
  }

  private isVip(user: { plan: string; planExpiresAt: Date | null }): boolean {
    if (user.plan === 'FREE') return false;
    if (!user.planExpiresAt) return false;
    return new Date() < new Date(user.planExpiresAt);
  }

  private buildCvText(content: any): string {
    const sections: string[] = [];

    if (content.personalInfo) {
      const p = content.personalInfo;
      sections.push(
        `**Thông tin cá nhân:** ${p.fullName || ''}, ${p.jobTitle || p.title || ''}\n**Liên hệ:** ${p.email || ''} | ${p.phone || ''}\n**Mục tiêu:** ${p.summary || p.objective || ''}`,
      );
    }

    if (content.objective && !content.personalInfo?.summary) {
      sections.push(`**Mục tiêu nghề nghiệp:** ${content.objective}`);
    }

    if (content.experiences?.length) {
      const exp = content.experiences
        .map(
          (e: any) =>
            `- ${e.position || ''} tại ${e.company || ''} (${e.startDate || ''} - ${e.isCurrent ? 'Hiện tại' : e.endDate || ''}): ${e.description || ''}`,
        )
        .join('\n');
      sections.push(`**Kinh nghiệm làm việc:**\n${exp}`);
    }

    if (content.education?.length || content.educations?.length) {
      const edus = content.education || content.educations;
      const edu = edus
        .map(
          (e: any) =>
            `- ${e.degree || ''} tại ${e.school || ''} (${e.startDate || ''} - ${e.endDate || ''})${e.gpa ? ` GPA: ${e.gpa}` : ''}`,
        )
        .join('\n');
      sections.push(`**Học vấn:**\n${edu}`);
    }

    if (content.skills?.length) {
      const skills = content.skills.map((s: any) => (typeof s === 'string' ? s : s.name || '')).join(', ');
      sections.push(`**Kỹ năng:** ${skills}`);
    }

    if (content.certifications?.length || content.certificates?.length) {
      const certs = (content.certifications || content.certificates)
        .map((c: any) => `${c.name || ''}${c.issuer ? ` - ${c.issuer}` : ''}${c.year ? ` (${c.year})` : ''}`)
        .join(', ');
      sections.push(`**Chứng chỉ:** ${certs}`);
    }

    if (content.projects?.length) {
      const proj = content.projects.map((p: any) => `- ${p.name || ''}: ${p.description || ''}`).join('\n');
      sections.push(`**Dự án:**\n${proj}`);
    }

    if (content.languages?.length) {
      const langs = content.languages.map((l: any) => `${l.name || ''} (${l.level || ''})`).join(', ');
      sections.push(`**Ngoại ngữ:** ${langs}`);
    }

    return sections.join('\n\n') || 'CV trống, không có nội dung.';
  }

  private async extractTextFromFile(file: { buffer: Buffer; mimetype: string }): Promise<string> {
    const mime = file.mimetype;
    let text = '';

    if (mime === 'application/pdf') {
      const parsed = await pdfParse(file.buffer);
      text = parsed.text?.trim() || '';
    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      text = result.value?.trim() || '';
    } else {
      throw new BadRequestException('Chỉ hỗ trợ file PDF hoặc DOCX');
    }

    if (!text || text.length < 50) {
      throw new BadRequestException('Không thể đọc nội dung file. Vui lòng thử file khác.');
    }

    return text;
  }

  // Shared JSON skeleton used in both prompts so the model returns one consistent format
  private jsonSkeleton(mode: 'general' | 'jd'): string {
    const scoreLabel = mode === 'jd' ? 'điểm phù hợp với JD' : 'điểm tổng quát';
    const gradeValues =
      mode === 'jd'
        ? 'Rất phù hợp|Phù hợp tốt|Phù hợp khá|Chưa phù hợp'
        : 'Xuất sắc|Khá tốt|Cần cải thiện|Cần chú ý';
    const highlightNote =
      mode === 'jd' ? 'điểm mạnh của CV so với JD' : 'điểm mạnh của CV';
    const improvNote =
      mode === 'jd' ? 'kỹ năng/kinh nghiệm thiếu so với JD' : 'điểm cần cải thiện';
    const skillNote =
      mode === 'jd'
        ? 'liệt kê TẤT CẢ kỹ năng kỹ thuật từ JD và CV; required=true nếu JD yêu cầu, inCV=true nếu CV có'
        : 'liệt kê kỹ năng kỹ thuật trong CV và kỹ năng phổ biến liên quan còn thiếu';
    const softSkillNote =
      mode === 'jd'
        ? 'liệt kê kỹ năng mềm từ JD; required=true, inCV=true nếu CV có đề cập'
        : 'liệt kê kỹ năng mềm trong CV';

    return `{
  "totalScore": <số nguyên 0-100, ${scoreLabel}>,
  "grade": "<${gradeValues}>",
  "summary": "<2-3 câu nhận xét tổng quan bằng tiếng Việt>",
  "totalIssues": <tổng số vấn đề>,
  "highlights": ["<${highlightNote} 1>", "<2>", "<3>"],
  "improvements": ["<${improvNote} 1>", "<2>", "<3>"],
  "sections": {
    "content": {
      "score": <0-100>,
      "label": "Nội dung",
      "issueCount": <số>,
      "checks": [
        {"label": "Kết quả đo lường được", "pass": <bool>, "description": "<mô tả>", "issues": ["<câu thiếu số liệu nếu có>"]},
        {"label": "Chính tả & Ngữ pháp", "pass": <bool>, "description": "<mô tả>", "issues": []}
      ]
    },
    "skills": {
      "score": <0-100>,
      "label": "Kỹ năng",
      "issueCount": <số thiếu>,
      "hardSkills": [{"name": "<tên>", "inCV": <bool>, "required": <bool>}],
      "softSkills": [{"name": "<tên>", "inCV": <bool>, "required": <bool>}]
    },
    "format": {
      "score": <0-100>,
      "label": "Định dạng",
      "issueCount": <số>,
      "checks": [
        {"label": "Định dạng ngày tháng", "pass": <bool>, "note": "<ghi chú>"},
        {"label": "Độ dài CV", "pass": <bool>, "note": "<ghi chú>"},
        {"label": "Điểm đầu dòng", "pass": <bool>, "note": "<ghi chú>"}
      ]
    },
    "requiredSections": {
      "score": <0-100>,
      "label": "Các mục",
      "issueCount": <số mục thiếu>,
      "items": [
        {"label": "Tên", "present": <bool>, "value": "<tên đầy đủ nếu có, null nếu không>"},
        {"label": "Chức danh", "present": <bool>, "value": "<chức danh nếu có>"},
        {"label": "Điện thoại", "present": <bool>, "value": "<số nếu có>"},
        {"label": "Email", "present": <bool>, "value": "<email nếu có>"},
        {"label": "Portfolio/Website", "present": <bool>, "value": "<link nếu có>"},
        {"label": "Tóm tắt", "present": <bool>, "value": null},
        {"label": "Kinh nghiệm", "present": <bool>, "value": "<tên công ty đầu tiên>"},
        {"label": "Học vấn", "present": <bool>, "value": "<tên trường>"},
        {"label": "Kỹ năng chuyên môn", "present": <bool>, "value": "<3-4 kỹ năng đầu>"},
        {"label": "Kỹ năng mềm", "present": <bool>, "value": "<nếu có>"}
      ]
    },
    "style": {
      "score": <0-100>,
      "label": "Phong cách",
      "issueCount": <số>,
      "tone": {"pass": <bool>, "note": "<ghi chú>"},
      "buzzwords": {"pass": <bool>, "found": ["<từ sáo rỗng nếu có>"]}
    }
  }
}

Lưu ý skills:
- hardSkills: ${skillNote}
- softSkills: ${softSkillNote}`;
  }

  private buildGeneralPrompt(cvText: string): string {
    return `Bạn là chuyên gia HR 10 năm kinh nghiệm tuyển dụng tại Việt Nam. Đánh giá CV sau. Trả về CHÍNH XÁC JSON bên dưới, KHÔNG thêm text nào khác ngoài JSON.

CV CẦN ĐÁNH GIÁ:
${cvText}

Trả về JSON (điền giá trị thực, không thay đổi key):
${this.jsonSkeleton('general')}`;
  }

  private buildJdMatchPrompt(cvText: string, jdText: string): string {
    return `Bạn là chuyên gia HR 10 năm kinh nghiệm tuyển dụng tại Việt Nam. So sánh CV ứng viên với mô tả công việc. Trả về CHÍNH XÁC JSON bên dưới, KHÔNG thêm text nào khác ngoài JSON.

MÔ TẢ CÔNG VIỆC (JD):
${jdText}

CV ỨNG VIÊN:
${cvText}

Trả về JSON (điền giá trị thực, không thay đổi key):
${this.jsonSkeleton('jd')}`;
  }

  private async callGroq(prompt: string): Promise<any> {
    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    const raw = (completion.choices[0]?.message?.content ?? '').trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI trả về kết quả không hợp lệ');
    return JSON.parse(jsonMatch[0]);
  }

  private formatResult(scored: any, vip: boolean, mode: 'general' | 'jd', jobTitle?: string) {
    const base: any = {
      mode,
      isVip: vip,
      totalScore: scored.totalScore,
      grade: scored.grade,
      summary: scored.summary,
      totalIssues: scored.totalIssues,
      highlights: scored.highlights || [],
      improvements: scored.improvements || [],
    };

    if (mode === 'jd') base.jobTitle = jobTitle || '';

    if (!vip) {
      const stripped: Record<string, any> = {};
      if (scored.sections) {
        for (const [key, sec] of Object.entries(scored.sections as Record<string, any>)) {
          stripped[key] = { score: sec.score, label: sec.label, issueCount: sec.issueCount };
        }
      }
      return { data: { ...base, sections: stripped } };
    }

    return { data: { ...base, sections: scored.sections } };
  }

  async score(resumeId: string, userId: string) {
    const [resume, user] = await Promise.all([
      this.prisma.resume.findUnique({ where: { id: resumeId } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, plan: true, planExpiresAt: true } }),
    ]);

    if (!resume) throw new NotFoundException('Không tìm thấy CV');
    if (resume.userId !== userId) throw new ForbiddenException('CV không thuộc về bạn');
    if (!user) throw new NotFoundException();

    const vip = this.isVip(user);
    const cvText = this.buildCvText(resume.content as any);
    const scored = await this.callGroq(this.buildGeneralPrompt(cvText));
    return this.formatResult(scored, vip, 'general');
  }

  async scoreFromFile(file: { buffer: Buffer; mimetype: string }, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, plan: true, planExpiresAt: true },
    });
    if (!user) throw new NotFoundException();

    const cvText = await this.extractTextFromFile(file);
    const vip = this.isVip(user);
    const scored = await this.callGroq(this.buildGeneralPrompt(cvText));
    return this.formatResult(scored, vip, 'general');
  }

  async matchJd(resumeId: string, jobId: string, userId: string) {
    const [resume, job, user] = await Promise.all([
      this.prisma.resume.findUnique({ where: { id: resumeId } }),
      this.prisma.job.findUnique({ where: { id: jobId }, select: { id: true, title: true, description: true } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, plan: true, planExpiresAt: true } }),
    ]);

    if (!resume) throw new NotFoundException('Không tìm thấy CV');
    if (resume.userId !== userId) throw new ForbiddenException('CV không thuộc về bạn');
    if (!job) throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    if (!user) throw new NotFoundException();

    const vip = this.isVip(user);
    const cvText = this.buildCvText(resume.content as any);
    const jdText = `Vị trí: ${job.title}\n\n${job.description}`;
    const scored = await this.callGroq(this.buildJdMatchPrompt(cvText, jdText));
    return this.formatResult(scored, vip, 'jd', job.title);
  }

  async matchJdFromFile(file: { buffer: Buffer; mimetype: string }, jobId: string, userId: string) {
    const [job, user] = await Promise.all([
      this.prisma.job.findUnique({ where: { id: jobId }, select: { id: true, title: true, description: true } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, plan: true, planExpiresAt: true } }),
    ]);

    if (!job) throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    if (!user) throw new NotFoundException();

    const cvText = await this.extractTextFromFile(file);
    const vip = this.isVip(user);
    const jdText = `Vị trí: ${job.title}\n\n${job.description}`;
    const scored = await this.callGroq(this.buildJdMatchPrompt(cvText, jdText));
    return this.formatResult(scored, vip, 'jd', job.title);
  }
}
