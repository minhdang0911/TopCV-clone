// node db-query.cjs
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  const tables = await sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;
  console.log('\n=== Tables ===');
  tables.forEach(t => console.log(' -', t.tablename));

  const apps = await sql`SELECT id, job_id, candidate_id, status, cv_file_url, cover_letter_file_url, created_at FROM applications ORDER BY created_at DESC LIMIT 5`;
  console.log('\n=== Recent Applications ===');
  console.table(apps);

  const notifs = await sql`SELECT id, user_id, type, title, is_read, created_at FROM notifications ORDER BY created_at DESC LIMIT 10`;
  console.log('\n=== Recent Notifications ===');
  console.table(notifs);
}

main().catch(console.error);
