// Tier list data: random bands of three forms from one stage, auto battles, family advantage off.
// node test/tier.js <tier 0|1|2> <fights> > out.json
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H; H.advantage = () => 0;
const tier = +(process.argv[2] || 2), N = +(process.argv[3] || 40000), TARGET = +(process.env.TARGET || 0.6);
const floors = tier === 2 ? [64, 67, 70, 76, 80, 88, 90, 94, 100] : tier === 0 ? [4, 6, 8, 10, 12, 14, 16, 18, 20] : [24, 27, 30, 36, 40, 44, 50];
const forms = Object.keys(H.FORMS).filter((k) => H.FORMS[k].tier === tier), rnd = H.rng(2026 + tier);
const fight = (trio, n, lvK) => { const S = H.newState(); trio.forEach((f) => { const p = H.addPet(S, H.FORMS[f].sp); p.form = f; p.t1 = tier >= 1; p.t2 = tier === 2; }); S.team = S.pets.map((p) => p.id); S.level = Math.max(1, Math.round(H.stageLevel(n) * lvK)); S.stage = n; return H.autoRun(H.startStage(S, n, rnd)); };
const pick = () => { for (;;) { const t = [0, 1, 2].map(() => forms[Math.floor(rnd() * forms.length)]); if (new Set(t.map((f) => H.FORMS[f].sp)).size === 3) return t; } };
let k = tier === 2 ? 0.85 : tier === 1 ? 0.75 : 0.9;
for (let it = 0; it < 6; it++) { let w = 0; const M = 1500; for (let i = 0; i < M; i++) if (fight(pick(), floors[i % floors.length], k)) w++; k *= 1 + (TARGET - w / M) * 0.3; }
const st = {}; forms.forEach((f) => (st[f] = { n: 0, w: 0, bn: 0, bw: 0 })); let tw = 0;
for (let i = 0; i < N; i++) { const t = pick(), n = floors[i % floors.length], boss = n % 10 === 0, w = fight(t, n, k); if (w) tw++; for (const f of t) { const s = st[f]; s.n++; if (w) s.w++; if (boss) { s.bn++; if (w) s.bw++; } } }
const out = { tier, fights: N, k, avg: tw / N, floors, forms: forms.map((f) => ({ id: f, n: H.FORMS[f].n, sp: H.FORMS[f].sp, role: H.kitOf(f).role, fam: H.SPECIES[H.FORMS[f].sp].family, win: st[f].w / st[f].n, boss: st[f].bw / st[f].bn, games: st[f].n })) };
process.stdout.write(JSON.stringify(out));
