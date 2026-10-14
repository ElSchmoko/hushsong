// Fit a small per-form factor (HP and Power) so that every form adds about the same to a team.
// node test/fit.js <tier> <rounds> <fights> [in.json] -> writes test/movek.json
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
// family advantage is switched off unless ADV=1: floors lean towards some families, which would skew the comparison
if (!process.env.ADV) globalThis.H.advantage = () => 0;
const fs = require('fs'), H = globalThis.H, tier = +process.argv[2], R = +(process.argv[3] || 8), N = +(process.argv[4] || 40000), file = __dirname + '/movek.json';
if (fs.existsSync(file)) Object.assign(H.MOVE_K, JSON.parse(fs.readFileSync(file, 'utf8')));
H.applyMoveK();
const floors = tier === 2 ? [64, 67, 70, 76, 80, 88, 90, 94, 100] : [24, 27, 30, 36, 40, 44, 50];
const forms = Object.keys(H.FORMS).filter((k) => H.FORMS[k].tier === tier), rnd = H.rng(1234);
const by = (rs) => forms.filter((f) => rs.includes(H.kitOf(f).role)), G = [by(['rhythm']), by(['harmony']), by(['lead', 'bass'])];
// Tricksters were asked to come out a little ahead
const TARGET = { bass: +(process.env.BASSUP || 0.02) };
const fight = (trio, n, lvK) => { const S = H.newState(); trio.forEach((f) => { const p = H.addPet(S, H.FORMS[f].sp); p.form = f; p.t1 = true; p.t2 = tier === 2; }); S.team = S.pets.map((p) => p.id); S.level = Math.max(1, Math.round(H.stageLevel(n) * lvK)); S.stage = n; return H.autoRun(H.startStage(S, n, rnd)); };
const pick = (i) => { for (;;) { const t = i % 2 === 1 ? [0, 1, 2].map(() => forms[Math.floor(rnd() * forms.length)]) : G.map((g) => g[Math.floor(rnd() * g.length)]); if (new Set(t.map((f) => H.FORMS[f].sp)).size === 3) return t; } };
let k = tier === 2 ? 0.85 : 0.72;
for (let r = 0; r < R; r++) {
  for (let it = 0; it < 4; it++) { let w = 0; const M = 1500; for (let i = 0; i < M; i++) if (fight(pick(i), floors[i % floors.length], k)) w++; k *= 1 + (0.5 - w / M) * 0.25; }
  const st = {}; forms.forEach((f) => (st[f] = [0, 0])); let tw = 0;
  for (let i = 0; i < N; i++) { const t = pick(i), w = fight(t, floors[i % floors.length], k); if (w) tw++; for (const f of t) { st[f][0]++; if (w) st[f][1]++; } }
  const avg = tw / N, rates = forms.map((f) => st[f][1] / st[f][0]), lo = Math.min(...rates), hi = Math.max(...rates), sd = Math.sqrt(rates.reduce((a, x) => a + (x - avg) ** 2, 0) / rates.length);
  if (r === R - 1) console.log(forms.map((f, i) => [f, rates[i]]).sort((a, b) => b[1] - a[1]).map(([f, x]) => f + ' ' + (100 * x).toFixed(0)).join('  '));
  console.log(`round ${r}: avg ${(100 * avg).toFixed(1)}  lowest ${(100 * lo).toFixed(1)} (${forms[rates.indexOf(lo)]})  highest ${(100 * hi).toFixed(1)} (${forms[rates.indexOf(hi)]})  spread ${(100 * sd).toFixed(1)}`);
  if (r === R - 1) break;
  forms.forEach((f, i) => { const cur = H.MOVE_K[f] || 1, want = avg + (TARGET[H.kitOf(f).role] || 0); H.MOVE_K[f] = Math.max(+(process.env.KLO || 0.8), Math.min(+(process.env.KHI || 1.25), cur * (1 + Math.max(-0.1, Math.min(0.1, (want - rates[i]) * 0.8))))); });
  forms.forEach((f) => (H.MOVE_K[f] = +H.MOVE_K[f].toFixed(3))); H.applyMoveK();
}
fs.writeFileSync(file, JSON.stringify(H.MOVE_K));
const rows = forms.map((f) => [f, H.MOVE_K[f] || 1]).sort((a, b) => a[1] - b[1]); console.log(rows.map(([f, k]) => f + ' ' + k.toFixed(2)).join('  '));
