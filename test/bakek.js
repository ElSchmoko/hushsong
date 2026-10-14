// Writes the fitted move strengths (test/movek.json) into src/data.js. node test/bakek.js
const fs = require('fs'), path = require('path'), file = path.join(__dirname, '../src/data.js');
const k = JSON.parse(fs.readFileSync(path.join(__dirname, 'movek.json'), 'utf8')), keys = Object.keys(k).filter((f) => Math.abs(k[f] - 1) >= 0.005).sort();
const body = keys.map((f) => `${f}: ${(Math.round(k[f] * 100) / 100).toString()}`).join(', ');
let s = fs.readFileSync(file, 'utf8'); const re = /  H\.MOVE_K = \{[^}]*\};/;
if (!re.test(s)) throw new Error('MOVE_K not found');
s = s.replace(re, `  H.MOVE_K = { ${body} };`); fs.writeFileSync(file, s);
console.log('baked', keys.length, 'forms');
