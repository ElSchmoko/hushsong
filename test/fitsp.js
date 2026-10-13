// Fit the visible base HP and Power of each species (at most 10% either way) so no species is simply better. Writes test/spk.json.
require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const fs = require('fs'), H = globalThis.H, R = +(process.argv[2] || 8), N = +(process.argv[3] || 40000), rnd = H.rng(4321), K = {}, base0 = {};
for (const sp of H.SPECIES_ORDER) { K[sp] = 1; base0[sp] = Object.assign({}, H.SPECIES[sp].base); }
const apply = () => { for (const sp of H.SPECIES_ORDER) { H.SPECIES[sp].base.hp = base0[sp].hp * K[sp]; H.SPECIES[sp].base.vol = base0[sp].vol * K[sp]; } };
const run = (tier, n0) => {
  const floors = tier === 2 ? [64, 67, 70, 76, 80, 88, 90, 94, 100] : [24, 27, 30, 36, 40, 44, 50], forms = Object.keys(H.FORMS).filter((k) => H.FORMS[k].tier === tier);
  const by = (rs) => forms.filter((f) => rs.includes(H.kitOf(f).role)), G = [by(['rhythm', 'bass']), by(['harmony']), by(['lead'])];
  const fight = (trio, n, lvK) => { const S = H.newState(); trio.forEach((f) => { const p = H.addPet(S, H.FORMS[f].sp); p.form = f; p.t1 = true; p.t2 = tier === 2; }); S.team = S.pets.map((p) => p.id); S.level = Math.max(1, Math.round(H.stageLevel(n) * lvK)); S.stage = n; return H.autoRun(H.startStage(S, n, rnd)); };
  const pick = () => { for (;;) { const t = G.map((g) => g[Math.floor(rnd() * g.length)]); if (new Set(t.map((f) => H.FORMS[f].sp)).size === 3) return t; } };
  let k = tier === 2 ? 0.85 : 0.72; for (let it = 0; it < 4; it++) { let w = 0; for (let i = 0; i < 1500; i++) if (fight(pick(), floors[i % floors.length], k)) w++; k *= 1 + (0.5 - w / 1500) * 0.25; }
  const st = {}; let tw = 0; for (const sp of H.SPECIES_ORDER) st[sp] = [0, 0];
  for (let i = 0; i < n0; i++) { const t = pick(), w = fight(t, floors[i % floors.length], k); if (w) tw++; for (const f of t) { const a = st[H.FORMS[f].sp]; a[0]++; if (w) a[1]++; } }
  const out = {}; for (const sp of H.SPECIES_ORDER) out[sp] = st[sp][1] / st[sp][0] - tw / n0; return out;
};
for (let r = 0; r < R; r++) {
  apply(); const a = run(2, N), b = run(1, N * 0.6), d = {}; for (const sp of H.SPECIES_ORDER) d[sp] = a[sp] * 0.65 + b[sp] * 0.35;
  const v = Object.values(d); console.log(`round ${r}: lowest ${(100 * Math.min(...v)).toFixed(1)} highest ${(100 * Math.max(...v)).toFixed(1)}  ` + H.SPECIES_ORDER.map((sp) => sp + ' ' + K[sp].toFixed(2)).join(' '));
  if (r < R - 1) for (const sp of H.SPECIES_ORDER) K[sp] = Math.max(0.9, Math.min(1.1, K[sp] * (1 - Math.max(-0.03, Math.min(0.03, d[sp] * 0.3)))));
}
fs.writeFileSync(__dirname + '/spk.json', JSON.stringify(K));
