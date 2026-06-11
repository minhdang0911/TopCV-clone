const fs = require('fs');
const path = 'd:/top cv clone/topcv-backend/src/jobs/jobs.service.ts';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Fix line 30: the corrupted combining diacritics regex
// Original: /[̀-ͯ]/g  (U+0300 to U+036F)
// Replace with ASCII-safe unicode escape version
const l30 = "      .replace(/[\\u0300-\\u036f]/g, '')";
// Fix line 31: the corrupted đ/Đ characters
// Original: /đ/g, /Đ/g  (U+0111, U+0110)
const l31 = "      .replace(/\\u0111/g, 'd').replace(/\\u0110/g, 'd')";

// Check current state
console.log('Current line 30:', JSON.stringify(lines[29]));
console.log('Current line 31:', JSON.stringify(lines[30]));

// Replace lines (0-indexed)
lines[29] = l30 + '\r';
lines[30] = l31 + '\r';

console.log('Fixed line 30:', JSON.stringify(lines[29]));
console.log('Fixed line 31:', JSON.stringify(lines[30]));

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('File fixed successfully');
