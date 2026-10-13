// How dangerous is each plain Din? A few typical teams fight three of the same kind at the same level. node test/dinpow.js [level] [N]
require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H, L = +(process.argv[2] || 14), N = +(process.argv[3] || 300), rnd = H.rng(11);
const forms = Object.keys(H.FORMS).filter((f) => H.FORMS[f].tier === (L >= 30 ? 2 : L >= 10 ? 1 : 0));
const res = {};
for (const id of Object.keys(H.DIN)) { const d = H.DIN[id]; if (d.boss) continue; let w = 0;
  for (let i = 0; i < N; i++) { const S = H.newState(); const allies = [0, 1, 2].map((k) => H.buildPetUnit({ id: k + 1, form: forms[Math.floor(rnd() * forms.length)], rank: 0, gear: [null, null] }, L, S));
    const b = new H.Battle({ allies, enemies: [0, 1, 2].map(() => H.buildDinUnit(id, L, false)), rng: rnd }); if (H.autoRun(b)) w++; }
  res[id] = Math.round((w / N) * 100); }
console.log('Lv', L, Object.entries(res).sort((a, b) => a[1] - b[1]).map(([k, v]) => k + ' ' + v).join('  '));
