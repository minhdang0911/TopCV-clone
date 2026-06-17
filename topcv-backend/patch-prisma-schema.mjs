import { readFileSync, writeFileSync } from 'fs';

const indexPath = 'node_modules/.prisma/client/index.js';
let src = readFileSync(indexPath, 'utf8');

// Read the full schema.prisma and prepare it for inlineSchema
// The inlineSchema strips the datasource url line
let schema = readFileSync('prisma/schema.prisma', 'utf8');
// Remove the url line from datasource block
schema = schema.replace(/\n\s+url\s+=\s+env\("[^"]+"\)/g, '');

// Find the inlineSchema value in the config
const schemaMarker = '"inlineSchema": "';
const schemaStart = src.indexOf(schemaMarker);
if (schemaStart === -1) throw new Error('inlineSchema marker not found');

const valStart = schemaStart + schemaMarker.length;

// Find end of the JSON string value (first unescaped quote)
let i = valStart;
while (i < src.length) {
  if (src[i] === '\\') { i += 2; continue; }
  if (src[i] === '"') break;
  i++;
}
const valEnd = i;

// Check if schema already has Conversation model
const existingSchema = src.slice(valStart, valEnd).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
if (existingSchema.includes('model Conversation')) {
  console.log('inlineSchema already has Conversation model — skipping');
  process.exit(0);
}

// Encode the new schema as a JSON string value
// Must escape: \ → \\, " → \", newlines → \n, \r → \r, \t → \t
const encoded = schema
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"')
  .replace(/\n/g, '\\n')
  .replace(/\r/g, '\\r')
  .replace(/\t/g, '\\t');

src = src.slice(0, valStart) + encoded + src.slice(valEnd);

writeFileSync(indexPath, src, 'utf8');
console.log('Done — inlineSchema updated in node_modules/.prisma/client/index.js');

// Verify
const patched = readFileSync(indexPath, 'utf8');
if (patched.includes('model Conversation') || patched.includes('Conversation')) {
  console.log('Verification: Conversation found in inlineSchema');
} else {
  console.log('WARNING: Conversation NOT found in inlineSchema');
}
