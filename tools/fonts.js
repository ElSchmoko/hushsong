// The extra letters each language needs, cut from the font files down to exactly the letters its words use → i18n/fonts.js (kept in git, so a build needs no Python)
//   node tools/fonts.js        (build.js runs it; it only redoes the work when a language's letters change)
// Russian brings Cyrillic Nunito (Baloo 2 has none, so headings fall back to Nunito's heavy weight); Turkish brings ğ ş İ.
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..'), I18N = path.join(root, 'i18n'), FS = path.join(root, 'node_modules/@fontsource');
const words = (code) => {
  let t = '';
  for (const f of fs.readdirSync(I18N).filter((f) => f.startsWith(code + '.') && f.endsWith('.txt'))) for (const line of fs.readFileSync(path.join(I18N, f), 'utf8').split('\n')) {
    const m = line.match(/^[0-9a-z]{7}\t(.*)$/); if (!m) continue; let v = m[1]; if (v.startsWith('{"')) v = Object.values(JSON.parse(v)).join(' ');
    t += v.replace(/<[^>]+>/g, '').replace(/\{\w+\}/g, '');
  }
  return [...new Set(t)].sort().join('');
};
const only = (s, re) => [...s].filter((c) => re.test(c)).join('');
const CJK = /[⺀-鿿가-힯　-〿＀-￯ᄀ-ᇿ㄰-㆏]/;
const jobs = {
  tr: [['Baloo 2', 800, `${FS}/baloo-2/files/baloo-2-latin-ext-800-normal.woff2`], ['Baloo 2', 700, `${FS}/baloo-2/files/baloo-2-latin-ext-700-normal.woff2`],
    ['Nunito', 800, `${FS}/nunito/files/nunito-latin-ext-800-normal.woff2`], ['Nunito', 700, `${FS}/nunito/files/nunito-latin-ext-700-normal.woff2`]].map((f) => [...f, only(words('tr'), /[^\u0000-ÿ]/)]),
  ru: [['Nunito', 800, `${FS}/nunito/files/nunito-cyrillic-800-normal.woff2`], ['Nunito', 700, `${FS}/nunito/files/nunito-cyrillic-700-normal.woff2`]].map((f) => [...f, only(words('ru'), /[Ѐ-ӿ]/)]),
};
// Japanese, Chinese and Korean: a rounded display font cut to their letters costs 80–130 KB each even so, so it is not
// carried in the file. Online, the game asks Google Fonts for exactly those letters (H.webFont); offline, headings use
// the device's own font. Set HS_CJK=1 to carry them anyway (about 450 KB).
if (process.env.HS_CJK) Object.assign(jobs, {
  ja: [['HS CJK', '100 900', `${FS}/m-plus-rounded-1c/files/m-plus-rounded-1c-*-800-normal.woff2`, only(words('ja'), CJK)]],
  zh: [['HS CJK', '100 900', `${FS}/zcool-kuaile/files/zcool-kuaile-*-400-normal.woff2`, only(words('zh'), CJK)]],
  ko: [['HS CJK', '100 900', `${FS}/jua/files/jua-*-400-normal.woff2`, only(words('ko'), CJK)]],
});
const out = path.join(root, 'i18n/fonts.js'), stamp = path.join(root, 'i18n/fonts.hash');
const hash = crypto.createHash('sha1').update(JSON.stringify(jobs) + fs.readFileSync(path.join(__dirname, 'fonts.py'))).digest('hex');
if (fs.existsSync(out) && fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf8') === hash) { console.log('fonts: unchanged'); process.exit(0); }
fs.mkdirSync(path.dirname(out), { recursive: true });
const tmpIn = path.join(root, 'build/fonts-jobs.json'), tmpOut = path.join(root, 'build/fonts-out.json');
fs.writeFileSync(tmpIn, JSON.stringify(jobs));
execFileSync('python3', [path.join(__dirname, 'fonts.py'), tmpIn, tmpOut], { stdio: 'inherit' });
const res = JSON.parse(fs.readFileSync(tmpOut, 'utf8'));
fs.writeFileSync(out, `H.FONTS = ${JSON.stringify(res)};\n`); fs.writeFileSync(stamp, hash);
let total = 0; for (const c in res) for (const f of res[c]) total += f[2].length;
console.log(`fonts: ${(total / 1024).toFixed(0)} KB embedded`);
