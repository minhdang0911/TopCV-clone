import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class MeetingsService {
  private readonly appId: string;
  private readonly keyId: string;
  private readonly privateKey: string;

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private config: ConfigService,
  ) {
    this.appId = this.config.getOrThrow<string>('JAAS_APP_ID');
    this.keyId = this.config.getOrThrow<string>('JAAS_KEY_ID');
    this.privateKey = this.config
      .getOrThrow<string>('JAAS_PRIVATE_KEY')
      .replace(/\\n/g, '\n');
  }

  private generateRoomCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const seg = (n: number) =>
      Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${seg(3)}-${seg(4)}-${seg(3)}`;
  }

  private async validateAccess(
    meeting: { hostEmployerId: string; candidateId: string },
    userId: string,
    role: string,
  ) {
    if (role === 'EMPLOYER') {
      const employer = await this.prisma.employerProfile.findUnique({ where: { userId } });
      if (!employer || employer.id !== meeting.hostEmployerId) {
        throw new ForbiddenException('Bạn không có quyền vào phòng họp này');
      }
    } else if (role === 'CANDIDATE') {
      if (meeting.candidateId !== userId) {
        throw new ForbiddenException('Bạn không được mời vào phòng họp này');
      }
    } else {
      throw new ForbiddenException();
    }
  }

  private generateJaasToken(opts: {
    userId: string;
    name: string;
    email: string;
    roomCode: string;
    moderator: boolean;
  }): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: 'chat',
      iat: now,
      exp: now + 7200,
      nbf: now - 10,
      aud: 'jitsi',
      sub: this.appId,
      room: `topcv-${opts.roomCode}`,
      context: {
        features: {
          livestreaming: false,
          recording: false,
          transcription: false,
          'outbound-call': false,
        },
        user: {
          id: opts.userId,
          name: opts.name,
          email: opts.email,
          moderator: String(opts.moderator),
          avatar: '',
        },
      },
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      header: { alg: 'RS256', kid: this.keyId },
    });
  }

  async create(
    userId: string,
    dto: { applicationId?: string; candidateId: string; title?: string; scheduledAt?: string },
  ) {
    const employer = await this.prisma.employerProfile.findUnique({ where: { userId } });
    if (!employer) throw new ForbiddenException('Không tìm thấy hồ sơ nhà tuyển dụng');

    let roomCode = '';
    let exists = true;
    while (exists) {
      roomCode = this.generateRoomCode();
      const found = await this.prisma.meeting.findUnique({ where: { roomCode } });
      exists = !!found;
    }

    const meeting = await this.prisma.meeting.create({
      data: {
        id: require('crypto').randomUUID(),
        roomCode,
        dailyRoomName: roomCode,
        applicationId: dto.applicationId || null,
        hostEmployerId: employer.id,
        candidateId: dto.candidateId,
        title: dto.title || null,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      },
    });

    this.notifications
      .create(dto.candidateId, {
        type: 'MEETING_INVITE',
        title: `${employer.companyName} mời bạn tham gia cuộc họp video`,
        body: dto.title || 'Nhấn để tham gia cuộc họp',
        url: `/meet/${roomCode}`,
      })
      .catch(() => {});

    return { data: { ...meeting, meetingUrl: `/meet/${roomCode}` } };
  }

  async findByCode(code: string, userId: string, role: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { roomCode: code },
      include: {
        hostEmployer: { select: { companyName: true, logoUrl: true, userId: true } },
        candidate: {
          select: {
            id: true,
            email: true,
            candidateProfile: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });
    if (!meeting) throw new NotFoundException('Phòng họp không tồn tại');
    await this.validateAccess(meeting, userId, role);
    return { data: meeting };
  }

  async getToken(code: string, userId: string, role: string, userName: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { roomCode: code } });
    if (!meeting) throw new NotFoundException('Phòng họp không tồn tại');
    await this.validateAccess(meeting, userId, role);

    const isModerator = role === 'EMPLOYER';
    const userRecord = await this.prisma.user.findUnique({ where: { id: userId } });

    const token = this.generateJaasToken({
      userId,
      name: userName,
      email: userRecord?.email || '',
      roomCode: code,
      moderator: isModerator,
    });

    const meetingUrl = `https://8x8.vc/${this.appId}/topcv-${code}`;
    return { data: { token, meetingUrl } };
  }

  async endMeeting(code: string, userId: string) {
    const employer = await this.prisma.employerProfile.findUnique({ where: { userId } });
    if (!employer) throw new ForbiddenException();

    const meeting = await this.prisma.meeting.findUnique({ where: { roomCode: code } });
    if (!meeting) throw new NotFoundException();
    if (meeting.hostEmployerId !== employer.id) throw new ForbiddenException();

    await this.prisma.meeting.update({
      where: { roomCode: code },
      data: { status: 'ended' },
    });

    return { data: { success: true } };
  }
}
