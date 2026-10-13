// Scripted playthrough with screenshots. node test/play.js <scenario> [w] [h]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
const scenario = process.argv[2] || 'intro', VW = +(process.argv[3] || 390), VH = +(process.argv[4] || 760);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, hasTouch: true });
  const p = await ctx.newPage(); let n = 0; const errs = [];
  p.on('console', (m) => { if (m.type() === 'error') { errs.push(m.text()); console.log('console.error:', m.text()); } });
  p.on('pageerror', (e) => { errs.push(e.message); console.log('PAGEERROR:', e.message, (e.stack || '').split('\n').slice(0, 3).join(' | ')); });
  const shot = async (name) => { n++; await p.screenshot({ path: path.join(__dirname, '../shots', `${scenario}-${String(n).padStart(2, '0')}-${name}.png`) }); };
  const tap = async (text, opts) => { const l = p.locator(`button:has-text("${text}")`).first(); await l.click({ timeout: 4000, ...(opts || {}) }); await p.waitForTimeout(160); };
  const has = async (text) => (await p.locator(`button:has-text("${text}")`).count()) > 0;
  const sleep = (ms) => p.waitForTimeout(ms);
  const evalS = (fn, arg) => p.evaluate(fn, arg);
  await p.goto('file://' + path.resolve(__dirname, '../dist/test.html'));
  await sleep(500);
  const waitBattle = async (max) => { for (let i = 0; i < (max || 400); i++) { if (await p.evaluate(() => !document.getElementById('modal').hidden)) return true; await sleep(250); } return false; };
  const S = require('./scenarios.js'); if (process.env.MORE) require(process.env.MORE); if (process.env.FAST) await p.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => st(f, ms > 30 ? ms / 12 : ms, ...a); });
  try { await S[scenario]({ p, shot, tap, has, sleep, evalS, waitBattle }); } catch (e) { console.log('SCENARIO ERROR:', e.message.split('\n')[0]); await shot('error'); }
  console.log('errors:', errs.length);
  await b.close();
})();
