const fs = require('fs');

const schemaPath = 'd:/top cv clone/topcv-backend/prisma/schema.prisma';
const clientPath = 'd:/top cv clone/topcv-backend/node_modules/.prisma/client/index.js';

const schema = fs.readFileSync(schemaPath, 'utf8');
const client = fs.readFileSync(clientPath, 'utf8');

// Find the inlineSchema property and its value boundaries
const key = '"inlineSchema": "';
const start = client.indexOf(key);
if (start === -1) { console.error('inlineSchema not found'); process.exit(1); }

const valueStart = start + key.length;

// Find the END of the broken value: it's terminated by a bare " followed by prisma
// The value ends somewhere with }" then the old schema junk, then a final closing "
// Strategy: find the last occurrence of \n" that is NOT preceded by a backslash,
// which is the real end of the string value.
// Actually, we want to replace the entire value with our schema.
// Find the closing of the inlineSchema value - it ends with \n"
// then next char after the closing " should be , or \n or whitespace (not alphanumeric)
// Walk forward from valueStart, tracking escape sequences, to find real end.

let i = valueStart;
let end = -1;
while (i < client.length) {
  if (client[i] === '\\') {
    i += 2; // skip escaped char
  } else if (client[i] === '"') {
    // This is a closing quote - check if what follows is not a letter/digit
    const next = client[i + 1];
    if (!next || next === '\n' || next === '\r' || next === ',' || next === ' ' || next === '}') {
      end = i;
      break;
    }
    // Otherwise this was the premature close - keep scanning
    i++;
  } else {
    i++;
  }
}

if (end === -1) {
  console.error('Could not find end of inlineSchema value');
  process.exit(1);
}

console.log('Found inlineSchema value from', valueStart, 'to', end);
console.log('Current value length:', end - valueStart, 'chars');
console.log('Last 100 chars of current value:', JSON.stringify(client.slice(Math.max(valueStart, end - 100), end)));
console.log('Schema.prisma length:', schema.length);

// Escape schema for embedding in JS string
const escaped = schema
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"')
  .replace(/\n/g, '\\n')
  .replace(/\r/g, '\\r');

// Replace the old (broken) value with the new escaped schema
const fixed = client.slice(0, valueStart) + escaped + client.slice(end);

fs.writeFileSync(clientPath, fixed, 'utf8');
console.log('Fixed! New inlineSchema length:', escaped.length);
