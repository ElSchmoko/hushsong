// What is each ensemble's boon worth? The same random teams of the right families, with the boon and without it.
require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H, tier = +(process.argv[2] || 2), N = +(process.argv[3] || 3000), rnd = H.rng(99);
if (process.env.K) Object.assign(H.ENS_K, JSON.parse(process.env.K));
const floors = tier === 2 ? [64, 67, 70, 76, 80, 88, 90, 94, 100] : tier === 1 ? [24, 27, 30, 36, 40, 44, 50] : [11, 13, 15, 17, 19, 20];
const forms = Object.keys(H.FORMS).filter((k) => H.FORMS[k].tier === tier), byFam = {}; for (const f of forms) (byFam[H.SPECIES[H.FORMS[f].sp].family] = byFam[H.SPECIES[H.FORMS[f].sp].family] || []).push(f);
const teamFor = (fams) => { for (;;) { const t = fams.map((f) => byFam[f][Math.floor(rnd() * byFam[f].length)]); if (new Set(t.map((f) => H.FORMS[f].sp)).size === 3) return t; } };
const fight = (trio, n, lvK, ens, seed) => { const S = H.newState(); trio.forEach((f) => { const p = H.addPet(S, H.FORMS[f].sp); p.form = f; p.t1 = tier >= 1; p.t2 = tier === 2; }); S.team = S.pets.map((p) => p.id); S.level = Math.max(1, Math.round(H.stageLevel(n) * lvK)); S.stage = n;
  const st = H.stage(n), r = H.rng(seed); return H.autoRun(new H.Battle({ allies: H.teamPets(S).map((p) => H.buildPetUnit(p, S.level, S)), enemies: st.enemies.map((e) => (e.pet ? H.buildRivalUnit(e.id, e.lvl) : H.buildDinUnit(e.id, e.lvl, e.loud))), rng: r, ensemble: ens })); };
let k = tier === 2 ? 0.85 : tier === 1 ? 0.72 : 0.6; const any = () => teamFor(H.ENSEMBLES[Math.floor(rnd() * 15)].fam);
for (let it = 0; it < 6; it++) { let w = 0; const M = 1500; for (let i = 0; i < M; i++) if (fight(any(), floors[i % floors.length], k, null, 1 + i)) w++; k *= 1 + (0.5 - w / M) * 0.25; }
console.log(`tier ${tier}, level factor ${k.toFixed(2)}, ${N} fights per ensemble`);
let s0 = 0, s1 = 0;
for (const e of H.ENSEMBLES) { let off = 0, on = 0, ob = 0, nb = 0, bn = 0; for (let i = 0; i < N; i++) { const t = teamFor(e.fam), n = floors[i % floors.length], seed = 1000 + i * 7, a = fight(t, n, k, null, seed), b = fight(t, n, k, e.id, seed); if (a) off++; if (b) on++; if (n % 10 === 0) { bn++; if (a) ob++; if (b) nb++; } }
  s0 += off; s1 += on; console.log(`${e.n.padEnd(18)} without ${(100 * off / N).toFixed(1).padStart(5)}%  with ${(100 * on / N).toFixed(1).padStart(5)}%  gain ${(100 * (on - off) / N).toFixed(1).padStart(5)}   (bosses ${(100 * ob / bn).toFixed(0)}% -> ${(100 * nb / bn).toFixed(0)}%)`); }
console.log(`all: without ${(100 * s0 / N / 15).toFixed(1)}%  with ${(100 * s1 / N / 15).toFixed(1)}%`);
