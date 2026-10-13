// node test/shot.js <url-or-file> <out.png> [width] [height] [fullPage]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async () => {
  const [url, out, w, h, full] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: +(w || 1200), height: +(h || 800) } });
  p.on('console', (m) => { if (m.type() === 'error') console.log('console.error:', m.text()); });
  p.on('pageerror', (e) => console.log('pageerror:', e.message));
  await p.goto(url.startsWith('http') || url.startsWith('file') ? url : 'file://' + require('path').resolve(url));
  await p.waitForTimeout(400);
  await p.screenshot({ path: out, fullPage: full !== '0' });
  await b.close();
})();
