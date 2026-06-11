const fs = require('fs');
const path = 'd:/top cv clone/topcv-backend/src/jobs/jobs.service.ts';

// Read with explicit UTF-8
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

const ignoreLineNumbers = new Set([320, 446, 491, 572, 620, 679, 711]);
const result = [];

for (let i = 0; i < lines.length; i++) {
  const lineNum = i + 1;
  if (ignoreLineNumbers.has(lineNum)) {
    const indent = lines[i].match(/^(\s*)/)[1];
    result.push(indent + '// @ts-ignore -- locations: added in migration; remove after prisma generate');
  }
  result.push(lines[i]);
}

fs.writeFileSync(path, result.join('\n'), 'utf8');
console.log('Done. Added @ts-ignore to', ignoreLineNumbers.size, 'lines');
