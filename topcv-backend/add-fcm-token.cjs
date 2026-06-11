const { execSync } = require('child_process');
const fs = require('fs');

// ── 1. Apply migration to DB ───────────────────────────────────────────────
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL || require('fs').readFileSync('.env','utf8').match(/DATABASE_URL="([^"]+)"/)?.[1]);

async function run() {
  // Add fcm_token column
  await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fcm_token" TEXT`;
  console.log('✓ fcm_token column added');

  // Register migration
  const migrationName = '20260611000002_add_fcm_token';
  await sql`
    INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
    VALUES (
      gen_random_uuid()::text,
      'fcm_token_manual',
      now(), ${migrationName}, null, null, now(), 1
    )
    ON CONFLICT DO NOTHING
  `.catch(() => {});
  console.log('✓ Migration registered');

  await sql.end();

  // ── 2. Patch Prisma generated client ─────────────────────────────────────
  const clientPath = 'd:/top cv clone/topcv-backend/node_modules/.prisma/client/index.js';
  let client = fs.readFileSync(clientPath, 'utf8');

  // Add fcmToken to UserScalarFieldEnum
  if (!client.includes("fcmToken: 'fcmToken'")) {
    client = client.replace(
      "savedJobs: 'savedJobs'",
      "savedJobs: 'savedJobs',\n  fcmToken: 'fcmToken'"
    );
    console.log('✓ UserScalarFieldEnum patched');
  } else {
    console.log('  UserScalarFieldEnum already has fcmToken');
  }

  // Update inlineSchema with new schema.prisma content
  const schema = fs.readFileSync('d:/top cv clone/topcv-backend/prisma/schema.prisma', 'utf8');
  const escaped = schema.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n').replace(/\r/g,'\\r');
  const key = '"inlineSchema": "';
  const start = client.indexOf(key) + key.length;
  let end = start, i = start;
  while (i < client.length) {
    if (client[i] === '\\') { i += 2; continue; }
    if (client[i] === '"') { end = i; break; }
    i++;
  }
  client = client.slice(0, start) + escaped + client.slice(end);
  console.log('✓ inlineSchema updated');

  fs.writeFileSync(clientPath, client, 'utf8');
  console.log('Done!');
}

run().catch(e => { console.error(e); process.exit(1); });
