// Renders every new icon on one page: node test/iconsheet.js
const { chromium } = require('/opt/npm-tools/node_modules/playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }); const p = await b.newPage({ viewport: { width: 760, height: 900 }, deviceScaleFactor: 1.5 });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../dist/test.html')); await p.waitForTimeout(600);
  await p.evaluate(() => {
    const H = window.H, A = H.Art; document.body.innerHTML = ''; document.body.style.background = '#fff6dc'; const wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;padding:10px;font:11px sans-serif';
    const keys = Object.keys(A.defs).filter((k) => /^(tw_|nd_|ev_|bn_)/.test(k)).concat(['ic_mic', 'ic_boss']);
    for (const k of keys) { const d = document.createElement('div'); d.style.cssText = 'width:84px;text-align:center'; const c = A.el(k, 3.2 / (A.defs[k].size / 14), {}); c.style.width = c.style.height = '64px'; d.appendChild(c); d.appendChild(document.createElement('br')); d.appendChild(document.createTextNode(k)); wrap.appendChild(d); }
    const g = A.mapGround('fen', 180, 120, 3); g.style.width = '360px'; wrap.appendChild(g);
    for (const r of ['orchard', 'ridge', 'caves', 'dunes', 'harbor', 'hall', 'works', 'tower', 'road']) { const m = A.mapGround(r, 90, 60, 3); m.style.width = '180px'; wrap.appendChild(m); }
    document.body.appendChild(wrap);
  });
  await p.waitForTimeout(200); await p.screenshot({ path: path.join(__dirname, '../shots/iconsheet.png'), fullPage: true }); await b.close();
})();
