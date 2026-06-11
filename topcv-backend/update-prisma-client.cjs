const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
const clientIndexPath = path.join(__dirname, 'node_modules/.prisma/client/index.js');

const schema = fs.readFileSync(schemaPath, 'utf8');
const clientIndex = fs.readFileSync(clientIndexPath, 'utf8');

// Escape for JSON string
const escapedSchema = schema
  .replace(/\/g, '\\')
  .replace(/"/g, '\\"')
  .replace(/\n/g, '\n')
  .replace(/\r/g, '\r')
  .replace(/\t/g, '\t');

// Find and replace the inlineSchema value
const oldMatch = clientIndex.match(/"inlineSchema":\s*"(.*?)(?<!\)",/s);
if (!oldMatch) {
  console.error('Could not find inlineSchema in index.js');
  process.exit(1);
}

const newClient = clientIndex.replace(
  /"inlineSchema":\s*".*?(?<!\)",/s,
  `"inlineSchema": "${escapedSchema}",`
);

fs.writeFileSync(clientIndexPath, newClient);
console.log('✓ Updated inlineSchema in .prisma/client/index.js');

// Verify
const updated = fs.readFileSync(clientIndexPath, 'utf8');
if (updated.includes('coverLetterId') || updated.includes('cover_letter_id')) {
  console.log('✓ Verified: coverLetterId found in updated client');
} else {
  console.log('? Note: coverLetterId not visible in escaped form (may be in schema text)');
}
