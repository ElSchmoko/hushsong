const { chromium } = require('/opt/npm-tools/node_modules/playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage(); p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../dist/test.html')); await p.waitForTimeout(300);
  const res = await p.evaluate(async () => {
    const Au = window.H.Audio, out = {};
    for (const f of ['drum', 'string', 'breath', 'brass', 'voice']) for (const l of [1, 2, 3]) out[f + l] = await Au.renderTest([{ family: f, level: l }], 'fen', 9.5);
    out.full3 = await Au.renderTest(['drum', 'string', 'breath'].map((f) => ({ family: f, level: 3 })), 'works', 9);
    out.full5 = await Au.renderTest(['drum', 'string', 'breath', 'brass', 'voice'].map((f) => ({ family: f, level: 3 })), 'hall', 9);
    for (const s of ['tap', 'heal', 'shield', 'good', 'bad', 'miss', 'fall', 'cue', 'win', 'lose', 'coin', 'level', 'evolve', 'crack', 'step', 'boss', 'skip', 'back']) out['sfx_' + s] = await Au.renderTest([], 'fen', 1.6, s);
    for (const f of ['drum', 'string', 'breath', 'brass', 'voice', null]) out['hit_' + f] = await Au.renderTest([], 'fen', 1, 'hit', { family: f, crit: true });
    for (const n of ['thud', 'clack', 'twang', 'screech', 'hum', 'squeak', 'blare', 'yelp']) out['noise_' + n] = await Au.renderTest([], 'fen', 1.2, 'noise', n);
    // live context smoke test
    Au.init(); Au.music.set('battle', [{ family: 'drum', level: 3 }, { family: 'voice', level: 2 }], 'fen'); await new Promise((r) => setTimeout(r, 1200)); out.live = { state: Au.ctx.state, step: Au.music.step };
    return out;
  });
  for (const k in res) console.log(k.padEnd(14), JSON.stringify(res[k]));
  await b.close();
})();
