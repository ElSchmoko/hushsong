// How much does each pet form add to a team? Random trios against fixed floors, win rate by form.
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
// family advantage is switched off unless ADV=1: floors lean towards some families, which would skew the comparison
if (!process.env.ADV) globalThis.H.advantage = () => 0;

const H = globalThis.H, tier = +(process.argv[2] || 2), N = +(process.argv[3] || 30000);
const floors = tier === 2 ? [64, 67, 70, 76, 80, 88, 90, 94, 100] : tier === 0 ? [4, 6, 8, 10, 12, 14, 16, 18, 20] : [24, 27, 30, 36, 40, 44, 50];
const forms = Object.keys(H.FORMS).filter((k) => H.FORMS[k].tier === tier);
const rnd = H.rng(77);
const mk = (S, f) => { const p = H.addPet(S, H.FORMS[f].sp); p.form = f; p.t1 = true; p.t2 = tier === 2; return p; };
const fight = (trio, n, lvK) => { const S = H.newState(); trio.forEach((f) => mk(S, f)); S.team = S.pets.map((p) => p.id); S.level = Math.max(1, Math.round(H.stageLevel(n) * lvK)); S.stage = n; return H.autoRun(H.startStage(S, n, rnd)); };
const comp = process.argv[4] === 'comp', by = (rs) => forms.filter((f) => rs.includes(H.kitOf(f).role)), G = [by(['rhythm', 'bass']), by(['harmony']), by(['lead'])];
const pick = () => { for (;;) { if (comp) { const t = G.map((g) => g[Math.floor(rnd() * g.length)]); if (new Set(t.map((f) => H.FORMS[f].sp)).size === 3) return t; continue; } const t = [0, 1, 2].map(() => forms[Math.floor(rnd() * forms.length)]); if (new Set(t.map((f) => H.FORMS[f].sp)).size === 3) return t; } };
// find the level at which a random trio wins about half its fights
let k = 1.2; for (let it = 0; it < 7; it++) { let w = 0; const M = 1500; for (let i = 0; i < M; i++) if (fight(pick(), floors[i % floors.length], k)) w++; const r = w / M; k *= 1 + (0.5 - r) * 0.25; }
const st = {}; forms.forEach((f) => (st[f] = { n: 0, w: 0, bn: 0, bw: 0 })); let tw = 0;
const pair = {};
for (let i = 0; i < N; i++) { const t = pick(), n = floors[i % floors.length], boss = n % 10 === 0, w = fight(t, n, k); if (w) tw++; for (const f of t) { const s = st[f]; s.n++; if (w) s.w++; if (boss) { s.bn++; if (w) s.bw++; } } }
console.log(`${comp ? 'one front, one healer, one attacker; ' : 'random trios; '}tier ${tier}: ${N} fights at level factor ${k.toFixed(2)}, average win ${(100 * tw / N).toFixed(1)}%`);
const rows = forms.map((f) => ({ f, sp: H.FORMS[f].sp, role: H.kitOf(f).role, fam: H.SPECIES[H.FORMS[f].sp].family, r: st[f].w / st[f].n, rb: st[f].bw / st[f].bn, rp: (st[f].w - st[f].bw) / (st[f].n - st[f].bn), n: st[f].n })).sort((a, b) => (comp ? a.role.localeCompare(b.role) : 0) || b.r - a.r);
for (const r of rows) console.log(`${r.f.padEnd(10)} ${r.sp.padEnd(8)} ${r.role.padEnd(8)} ${r.fam.padEnd(7)} win ${(100 * r.r).toFixed(1).padStart(5)}%  plain ${(100 * r.rp).toFixed(0).padStart(3)}%  boss ${(100 * r.rb).toFixed(0).padStart(3)}%  (${r.n})`);
const agg = (key) => { const o = {}; rows.forEach((r) => { const a = (o[r[key]] = o[r[key]] || [0, 0]); a[0] += r.r; a[1]++; }); return Object.entries(o).map(([k2, a]) => [k2, a[0] / a[1]]).sort((a, b) => b[1] - a[1]).map(([k2, v]) => `${k2} ${(100 * v).toFixed(1)}`).join(' | '); };
console.log('by role:   ', agg('role')); console.log('by family: ', agg('fam')); console.log('by species:', agg('sp'));
