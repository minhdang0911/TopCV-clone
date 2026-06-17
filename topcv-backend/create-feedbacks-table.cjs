// Run once: node create-feedbacks-table.cjs
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      topic VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      reply_text TEXT,
      replied_at TIMESTAMPTZ,
      replied_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_feedbacks_user ON feedbacks(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks(created_at DESC)`;
  console.log('feedbacks table created');
}

main().catch(console.error);
