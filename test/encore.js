// How far typical bands get in Encore. node test/encore.js [runs]
require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H; if (process.env.EP) { const [g, st, h, bk, gp] = process.env.EP.split(',').map(Number); Object.assign(H.ENCORE, { gap: g, step: st, heal: h, bossK: bk }, gp != null && !isNaN(gp) ? { gapPct: gp } : {}); }
const N = +(process.argv[2] || 40), rnd = H.rng(11);
const forms = (tier) => Object.keys(H.FORMS).filter((f) => H.FORMS[f].tier === tier);
const band = (L, tier, rank, items) => {
  const S = H.newState(); S.level = L; S.stage = Math.max(1, Math.round((L - 1) / H.STAGE_SLOPE) + 1); const pool = forms(tier);
  for (let i = 0; i < 3; i++) { const p = H.addPet(S, H.FORMS[pool[Math.floor(rnd() * pool.length)]].sp); p.form = pool[Math.floor(rnd() * pool.length)]; p.rank = rank; S.team[i] = p.id; }
  for (let i = 0; i < items; i++) { const it = H.rollItem(S, rnd, 'elite'); const p = S.pets[i % 3]; const slot = p.gear.indexOf(null); if (slot >= 0) p.gear[slot] = it.id; }
  return S;
};
for (const [L, tier, rank, items, label] of [[20, 1, 0, 3, 'Lv 20, first evolutions'], [30, 1, 1, 4, 'Lv 30, first evolutions'], [45, 2, 0, 5, 'Lv 45, fully evolved'], [60, 2, 2, 6, 'Lv 60, evolved + stars'], [90, 2, 4, 6, 'Lv 90']]) {
  const waves = [];
  for (let r = 0; r < N; r++) {
    const S = band(L, tier, rank, items); H.startEncoreRun(S, rnd); let g = 0;
    while (S.encoreRun && g++ < 60) { const b = H.startEncore(S, rnd); const win = H.autoRun(b); const out = H.finishEncore(S, win, b); if (!win) waves.push(out.reached); }
  }
  waves.sort((a, b) => a - b); const at = (q) => waves[Math.floor(q * (waves.length - 1))], pct = (m) => Math.round((100 * waves.filter((w) => w >= m).length) / waves.length);
  console.log(label.padEnd(26), 'median', at(0.5), ' p10', at(0.1), ' p90', at(0.9), '  reach 5/10/15/20:', [5, 10, 15, 20].map(pct).join('% / ') + '%');
}
