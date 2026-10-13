// Renders assets/icon/icon.html into the app's icon PNGs under assets/icon/out/. node tools/icons.js
// Rounded icons ("any") keep transparent corners; full-bleed ones are for Android masks and iOS, which round them itself.
const path = require('path'), fs = require('fs');
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const OUT = path.join(__dirname, '../assets/icon/out');
const JOBS = [
  ['icon-512.png', 512, 1], ['icon-192.png', 192, 1],
  ['icon-maskable-512.png', 512, 0], ['icon-maskable-192.png', 192, 0],
  ['apple-touch-icon.png', 180, 0], ['favicon-64.png', 64, 1], ['favicon-32.png', 32, 1],
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  for (const [name, px, round] of JOBS) {
    const p = await b.newPage({ viewport: { width: 360, height: 360 }, deviceScaleFactor: px / 360 });
    await p.goto('file://' + path.join(__dirname, '../assets/icon/icon.html') + (round ? '?round=1' : ''));
    await p.waitForLoadState('load'); await p.waitForTimeout(100);
    await p.locator('#icon').screenshot({ path: path.join(OUT, name), omitBackground: true });
    await p.close(); console.log('icon', name, px);
  }
  await b.close();
})();
