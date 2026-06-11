const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_GMogFK3zIX9c@ep-noisy-art-aov8369j-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function migrate() {
  try {
    // Check cover_letters table structure
    const cols = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'cover_letters'
    `;
    console.log('cover_letters columns:', JSON.stringify(cols));

    // Add column without FK first
    await sql`
      ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS cover_letter_id TEXT
    `;
    console.log('✓ Migration done: cover_letter_id column added (TEXT, no FK)');
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

migrate();
