import { Injectable } from '@nestjs/common';
import { neon } from '@neondatabase/serverless';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private sql = neon(process.env.DATABASE_URL!);

  constructor(private gateway: NotificationsGateway) {}

  private map(row: any) {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      body: row.body,
      url: row.url,
      isRead: row.is_read,
      data: row.data,
      createdAt: row.created_at,
    };
  }

  async create(userId: string, payload: {
    type: string;
    title: string;
    body: string;
    url?: string;
    data?: Record<string, unknown>;
  }) {
    const rows = await this.sql`
      INSERT INTO notifications (id, user_id, type, title, body, url, data)
      VALUES (
        gen_random_uuid(),
        ${userId},
        ${payload.type},
        ${payload.title},
        ${payload.body},
        ${payload.url ?? null},
        ${payload.data ? JSON.stringify(payload.data) : null}
      )
      RETURNING *
    `;
    const notif = this.map(rows[0]);
    this.gateway.emitToUser(userId, 'notification', notif);
    return notif;
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows, countRows] = await Promise.all([
      this.sql`
        SELECT * FROM notifications WHERE user_id = ${userId}
        ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `,
      this.sql`SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = ${userId}`,
    ]);
    return { data: rows.map(this.map), total: countRows[0].count };
  }

  async getUnreadCount(userId: string) {
    const rows = await this.sql`
      SELECT COUNT(*)::int AS count FROM notifications
      WHERE user_id = ${userId} AND is_read = false
    `;
    return { count: rows[0].count };
  }

  async markRead(userId: string, id: string) {
    await this.sql`
      UPDATE notifications SET is_read = true
      WHERE id = ${id}::uuid AND user_id = ${userId}
    `;
    return { ok: true };
  }

  async markAllRead(userId: string) {
    await this.sql`
      UPDATE notifications SET is_read = true
      WHERE user_id = ${userId} AND is_read = false
    `;
    return { ok: true };
  }

  async deleteOne(userId: string, id: string) {
    await this.sql`
      DELETE FROM notifications WHERE id = ${id}::uuid AND user_id = ${userId}
    `;
    return { ok: true };
  }

  async deleteAll(userId: string) {
    await this.sql`DELETE FROM notifications WHERE user_id = ${userId}`;
    return { ok: true };
  }
}
