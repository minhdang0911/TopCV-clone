const fs = require('fs');

const schema = fs.readFileSync('D:/top cv clone/topcv-backend/prisma/schema.prisma', 'utf8');
const clientPath = 'D:/top cv clone/topcv-backend/node_modules/.prisma/client/index.js';
let clientIndex = fs.readFileSync(clientPath, 'utf8');

const escapedSchema = JSON.stringify(schema).slice(1, -1);

const startMarker = '"inlineSchema": "';
const startIdx = clientIndex.indexOf(startMarker);
if (startIdx === -1) { console.error('inlineSchema not found'); process.exit(1); }

let i = startIdx + startMarker.length;
while (i < clientIndex.length) {
  const ch = clientIndex[i];
  const prev = clientIndex[i - 1];
  if (ch === '"' && prev !== '\\') break;
  i++;
}

const newClient = clientIndex.slice(0, startIdx) +
  '"inlineSchema": "' + escapedSchema + '"' +
  clientIndex.slice(i + 1);

fs.writeFileSync(clientPath, newClient);
console.log('Done. Size diff:', newClient.length - clientIndex.length);
const check = fs.readFileSync(clientPath, 'utf8');
console.log('Has coverLetterId:', check.includes('coverLetterId'));
