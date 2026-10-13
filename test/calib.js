require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H;
function run(a, b, tier, lvl, dl, gear) {
  H.dinScale = (L) => ({ hp: (1 + 0.10 * (L - 1)) * (1 + a * (L - 1)), vol: (1 + 0.10 * (L - 1)) * (1 + b * (L - 1)) });
  const rnd = H.rng(3); const list = Object.keys(H.FORMS).filter((f) => H.FORMS[f].tier === tier);
  let wins = 0, hp = 0, turns = 0; const N = 1500;
  for (let i = 0; i < N; i++) {
    const fs = H.shuffle(list, rnd).slice(0, 3);
    const allies = fs.map((x, k) => H.buildPetUnit({ id: k + 1, form: x, gear: gear ? [H.pick(H.GEAR_ORDER, rnd), gear > 1 ? H.pick(H.GEAR_ORDER, rnd) : null] : [] }, lvl, []));
    allies.sort((p, q) => (p.role === 'rhythm' ? -1 : 0) - (q.role === 'rhythm' ? -1 : 0));
    const din = ['racket', 'hiss', 'gibber', 'clank', 'whine'];
    const enemies = [0, 1, 2].map(() => H.buildDinUnit(H.pick(din, rnd), lvl + dl, false));
    const b2 = new H.Battle({ allies, enemies, rng: rnd }); const w = H.autoRun(b2, true);
    wins += w ? 1 : 0; turns += b2.turn; hp += b2.units.filter(u=>u.side===0).reduce((s, u) => s + u.hp / u.max, 0) / 3;
  }
  return `win ${(wins / N * 100).toFixed(0).padStart(3)}% hp ${(hp / N * 100).toFixed(0).padStart(3)}% t ${(turns / N).toFixed(0)}`;
}
for (const [a, b] of [[0.06, 0.02], [0.10, 0.05], [0.12, 0.07], [0.14, 0.08], [0.16, 0.10]]) {
  console.log(`hpK ${a} volK ${b} | T0@2 ${run(a, b, 0, 2, 0, 0)} | T1@5 ${run(a, b, 1, 5, 0, 1)} | T1@8 ${run(a, b, 1, 8, 0, 1)} | T2@10 ${run(a, b, 2, 10, 0, 2)} | T2@14 ${run(a, b, 2, 14, 0, 2)}`);
}
