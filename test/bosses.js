// Win rate of a typical band on each boss floor, and on the plain floor before it. node test/bosses.js [N] [from] [to] [levelK]
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H, N = +(process.argv[2] || 150), from = +(process.argv[3] || 20), to = +(process.argv[4] || 200), lk = +(process.argv[5] || 1.15);
const rnd = H.rng(99), byTier = (t) => Object.keys(H.FORMS).filter((f) => H.FORMS[f].tier === t);
const fight = (n) => { const S = H.newState(), tier = n <= 40 ? 1 : 2, pool = byTier(tier); const sps = new Set(); while (S.pets.length < 3) { const f = pool[Math.floor(rnd() * pool.length)]; if (sps.has(H.FORMS[f].sp)) continue; sps.add(H.FORMS[f].sp); const p = H.addPet(S, H.FORMS[f].sp); p.form = f; p.t1 = true; p.t2 = tier === 2; p.rank = n > 100 ? Math.min(10, Math.floor((n - 100) / 20)) : 0; }
  S.team = S.pets.map((p) => p.id); S.level = Math.round(H.stageLevel(n) * lk); S.stage = n; return H.autoRun(H.startStage(S, n, rnd)); };
const rate = (n) => { let w = 0; for (let i = 0; i < N; i++) if (fight(n)) w++; return Math.round((100 * w) / N); };
const out = []; for (let n = from; n <= to; n += 10) out.push(`${n} ${H.DIN[H.REGIONS[H.stage(n).region].boss].n.padEnd(8)} boss ${String(rate(n)).padStart(3)}%  plain ${String(rate(n - 3)).padStart(3)}%`);
console.log(out.join('\n'));
