import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedSearchesService {
  private tableEnsured = false;

  constructor(private prisma: PrismaService) {}

  // ─── Ensure table exists (lazy init) ────────────────────────────────────────
  private async ensureTable() {
    if (this.tableEnsured) return;
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS saved_searches (
        id          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
        user_id     TEXT        NOT NULL,
        name        TEXT        NOT NULL,
        filters     JSONB       NOT NULL DEFAULT '{}'::jsonb,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (id),
        CONSTRAINT saved_searches_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await this.prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id)
    `);
    this.tableEnsured = true;
  }

  // ─── CREATE ─────────────────────────────────────────────────────────────────
  async create(userId: string, name: string, filters: Record<string, any>) {
    await this.ensureTable();

    if (!name?.trim()) throw new BadRequestException('Tên tìm kiếm không được để trống');

    // Limit 20 saved searches per user
    const countRows = await this.prisma.$queryRawUnsafe<{ count: string }[]>(
      `SELECT COUNT(*)::text AS count FROM saved_searches WHERE user_id = $1`,
      userId,
    );
    if (parseInt(countRows[0]?.count ?? '0') >= 20) {
      throw new BadRequestException('Bạn đã lưu tối đa 20 tìm kiếm. Hãy xoá bớt để lưu thêm.');
    }

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO saved_searches (user_id, name, filters)
       VALUES ($1, $2, $3::jsonb)
       RETURNING id, user_id, name, filters, created_at`,
      userId,
      name.trim(),
      JSON.stringify(filters),
    );

    return { data: this.mapRow(rows[0]) };
  }

  // ─── LIST ───────────────────────────────────────────────────────────────────
  async findAll(userId: string) {
    await this.ensureTable();

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, user_id, name, filters, created_at
       FROM saved_searches
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      userId,
    );

    return { data: rows.map(this.mapRow) };
  }

  // ─── DELETE ─────────────────────────────────────────────────────────────────
  async remove(userId: string, id: string) {
    await this.ensureTable();

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `DELETE FROM saved_searches WHERE id = $1 AND user_id = $2 RETURNING id`,
      id,
      userId,
    );

    if (!rows.length) throw new NotFoundException('Không tìm thấy tìm kiếm đã lưu');
    return { message: 'Đã xoá tìm kiếm đã lưu' };
  }

  // ─── Helper ─────────────────────────────────────────────────────────────────
  private mapRow(r: any) {
    return {
      id: r.id,
      userId: r.user_id,
      name: r.name,
      filters: typeof r.filters === 'string' ? JSON.parse(r.filters) : r.filters,
      createdAt: r.created_at,
    };
  }
}
