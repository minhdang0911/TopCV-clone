import { Injectable, ForbiddenException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { neon } from '@neondatabase/serverless';

@Injectable()
export class ChatService implements OnModuleInit {
  private sql = neon(process.env.DATABASE_URL!);

  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  async onModuleInit() {
    // Use TEXT (not UUID) because Prisma uses cuid/string IDs, not native PG uuid type
    try {
      await this.sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id TEXT`;
      console.log('[Chat] reply_to_id column ready');
    } catch (e) {
      console.error('[Chat] ALTER TABLE messages reply_to_id:', (e as any)?.message);
    }
    try {
      await this.sql`
        CREATE TABLE IF NOT EXISTS message_reactions (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          message_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          emoji VARCHAR(10) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(message_id, user_id, emoji)
        )
      `;
      console.log('[Chat] message_reactions table ready');
    } catch (e) {
      console.error('[Chat] CREATE TABLE message_reactions:', (e as any)?.message);
    }
  }

  async findOrCreate(candidateUserId: string, employerProfileId: string) {
    const application = await (this.prisma as any).application.findFirst({
      where: { candidateId: candidateUserId, job: { employerId: employerProfileId } },
    });
    if (!application) throw new ForbiddenException('Bạn chưa ứng tuyển vào công ty này');

    const existing = await (this.prisma as any).conversation.findUnique({
      where: { candidateId_employerProfileId: { candidateId: candidateUserId, employerProfileId } },
    });
    if (existing) return { data: existing };

    const conv = await (this.prisma as any).conversation.create({
      data: { candidateId: candidateUserId, employerProfileId },
    });
    return { data: conv };
  }

  async listConversations(userId: string, role: string) {
    let where: any;
    if (role === 'CANDIDATE') {
      where = { candidateId: userId };
    } else {
      const profile = await (this.prisma as any).employerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!profile) return { data: [] };
      where = { employerProfileId: profile.id };
    }

    const convs = await (this.prisma as any).conversation.findMany({
      where,
      orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        candidate: {
          select: { id: true, candidateProfile: { select: { fullName: true, avatarUrl: true } } },
        },
        employerProfile: { select: { id: true, companyName: true, logoUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, senderId: true, createdAt: true, isRead: true, type: true },
        },
      },
    });

    const withUnread = await Promise.all(
      convs.map(async (c: any) => {
        const unread = await (this.prisma as any).message.count({
          where: { conversationId: c.id, senderId: { not: userId }, isRead: false },
        });
        return { ...c, unreadCount: unread };
      }),
    );
    return { data: withUnread };
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 30) {
    await this.assertMember(conversationId, userId);
    const skip = (page - 1) * limit;
    const total = await (this.prisma as any).message.count({ where: { conversationId } });
    const items = await (this.prisma as any).message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      skip: Math.max(0, total - skip - limit),
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            role: true,
            candidateProfile: { select: { fullName: true, avatarUrl: true } },
            employerProfile: { select: { companyName: true, logoUrl: true } },
          },
        },
      },
    });

    if (!items.length) return { data: [], total };

    const ids: string[] = items.map((m: any) => m.id);

    // Fetch reply-to data via raw SQL (graceful fallback if column not yet migrated)
    const replyMap: Record<string, any> = {};
    try {
      const replyRows = await this.sql`
        SELECT m.id AS msg_id,
          r.id AS reply_id, r.content AS reply_content, r.sender_id AS reply_sender_id,
          cp.full_name AS reply_name, ep.company_name AS reply_company
        FROM messages m
        JOIN messages r ON r.id = m.reply_to_id
        LEFT JOIN candidate_profiles cp ON cp.user_id = r.sender_id
        LEFT JOIN employer_profiles ep ON ep.user_id = r.sender_id
        WHERE m.id = ANY(${ids})
      `;
      for (const row of replyRows) {
        replyMap[row.msg_id] = {
          id: row.reply_id,
          content: row.reply_content,
          senderId: row.reply_sender_id,
          senderName: row.reply_name || row.reply_company || '',
        };
      }
    } catch {}

    // Fetch reactions grouped by emoji (graceful fallback if table not yet created)
    const reactMap: Record<string, any[]> = {};
    try {
      const reactRows = await this.sql`
        SELECT message_id, emoji, user_id FROM message_reactions WHERE message_id = ANY(${ids})
      `;
      const reactMapRaw: Record<string, Record<string, string[]>> = {};
      for (const row of reactRows) {
        const mid = row.message_id;
        if (!reactMapRaw[mid]) reactMapRaw[mid] = {};
        if (!reactMapRaw[mid][row.emoji]) reactMapRaw[mid][row.emoji] = [];
        reactMapRaw[mid][row.emoji].push(row.user_id);
      }
      for (const [mid, byEmoji] of Object.entries(reactMapRaw)) {
        reactMap[mid] = Object.entries(byEmoji).map(([emoji, userIds]) => ({
          emoji,
          count: userIds.length,
          userIds,
        }));
      }
    } catch {}

    return {
      data: items.map((m: any) => ({
        ...m,
        replyTo: replyMap[m.id] || null,
        reactions: reactMap[m.id] || [],
      })),
      total,
    };
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type = 'text',
    replyToId?: string,
  ) {
    const conv = await this.assertMember(conversationId, senderId);

    const message = await (this.prisma as any).message.create({
      data: { conversationId, senderId, content, type },
      include: {
        sender: {
          select: {
            id: true,
            role: true,
            candidateProfile: { select: { fullName: true, avatarUrl: true } },
            employerProfile: { select: { companyName: true, logoUrl: true } },
          },
        },
      },
    });

    let replyTo: any = null;
    if (replyToId) {
      await this.sql`UPDATE messages SET reply_to_id = ${replyToId} WHERE id = ${message.id}`;
      const rows = await this.sql`
        SELECT r.id, r.content, r.sender_id,
          cp.full_name, ep.company_name
        FROM messages r
        LEFT JOIN candidate_profiles cp ON cp.user_id = r.sender_id
        LEFT JOIN employer_profiles ep ON ep.user_id = r.sender_id
        WHERE r.id = ${replyToId}
      `;
      if (rows[0]) {
        replyTo = {
          id: rows[0].id,
          content: rows[0].content,
          senderId: rows[0].sender_id,
          senderName: rows[0].full_name || rows[0].company_name || '',
        };
      }
    }

    await (this.prisma as any).conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: message.createdAt },
    });

    const enriched = { ...message, replyTo, reactions: [] };
    const receiverId =
      conv.candidateId === senderId ? conv.employerProfile.user.id : conv.candidateId;
    this.gateway.emitToUser(receiverId, 'chat_message', { conversationId, message: enriched });

    return { data: enriched };
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    const rows = await this.sql`SELECT conversation_id FROM messages WHERE id = ${messageId}`;
    if (!rows[0]) throw new NotFoundException('Message not found');
    await this.assertMember(rows[0].conversation_id, userId);

    await this.sql`
      INSERT INTO message_reactions (message_id, user_id, emoji)
      VALUES (${messageId}, ${userId}, ${emoji})
      ON CONFLICT (message_id, user_id, emoji) DO NOTHING
    `;

    const reactions = await this.getGroupedReactions(messageId);
    this.broadcastReaction(rows[0].conversation_id, messageId, reactions);
    return { reactions };
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    const rows = await this.sql`SELECT conversation_id FROM messages WHERE id = ${messageId}`;
    if (!rows[0]) throw new NotFoundException('Message not found');
    await this.assertMember(rows[0].conversation_id, userId);

    await this.sql`
      DELETE FROM message_reactions
      WHERE message_id = ${messageId} AND user_id = ${userId} AND emoji = ${emoji}
    `;

    const reactions = await this.getGroupedReactions(messageId);
    this.broadcastReaction(rows[0].conversation_id, messageId, reactions);
    return { reactions };
  }

  private async getGroupedReactions(messageId: string) {
    const rows = await this.sql`
      SELECT emoji, user_id FROM message_reactions WHERE message_id = ${messageId}
    `;
    const map: Record<string, string[]> = {};
    for (const r of rows) {
      if (!map[r.emoji]) map[r.emoji] = [];
      map[r.emoji].push(r.user_id);
    }
    return Object.entries(map).map(([emoji, userIds]) => ({ emoji, count: userIds.length, userIds }));
  }

  private broadcastReaction(conversationId: string, messageId: string, reactions: any[]) {
    (this.prisma as any).conversation
      .findUnique({
        where: { id: conversationId },
        include: { employerProfile: { select: { user: { select: { id: true } } } } },
      })
      .then((conv: any) => {
        if (!conv) return;
        const payload = { conversationId, messageId, reactions };
        this.gateway.emitToUser(conv.candidateId, 'message_reaction', payload);
        this.gateway.emitToUser(conv.employerProfile.user.id, 'message_reaction', payload);
      })
      .catch(() => {});
  }

  async markRead(conversationId: string, userId: string) {
    await this.assertMember(conversationId, userId);
    await (this.prisma as any).message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });
    return { ok: true };
  }

  async unreadCount(userId: string, role: string) {
    let convWhere: any;
    if (role === 'CANDIDATE') {
      convWhere = { candidateId: userId };
    } else {
      const profile = await (this.prisma as any).employerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!profile) return { count: 0 };
      convWhere = { employerProfileId: profile.id };
    }
    const convIds = await (this.prisma as any).conversation.findMany({
      where: convWhere,
      select: { id: true },
    });
    const ids = convIds.map((c: any) => c.id);
    if (!ids.length) return { count: 0 };
    const count = await (this.prisma as any).message.count({
      where: { conversationId: { in: ids }, senderId: { not: userId }, isRead: false },
    });
    return { count };
  }

  private async assertMember(conversationId: string, userId: string) {
    const conv = await (this.prisma as any).conversation.findUnique({
      where: { id: conversationId },
      include: {
        employerProfile: {
          select: {
            id: true,
            userId: true,
            companyName: true,
            logoUrl: true,
            user: { select: { id: true } },
          },
        },
      },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    const isCandidate = conv.candidateId === userId;
    const isEmployer = conv.employerProfile.user.id === userId;
    if (!isCandidate && !isEmployer) throw new ForbiddenException('Không có quyền truy cập');
    return conv;
  }
}
