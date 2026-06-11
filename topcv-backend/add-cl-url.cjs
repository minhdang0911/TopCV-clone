// Run once: node add-cl-url.cjs
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS cover_letter_file_url TEXT`;
  console.log('cover_letter_file_url column added to applications');
}

main().catch(console.error);
