// Run once: node create-notifications-table.cjs
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(100) NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      url TEXT,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      data JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_notif_user_read ON notifications(user_id, is_read)`;
  console.log('notifications table created');
}

main().catch(console.error);
