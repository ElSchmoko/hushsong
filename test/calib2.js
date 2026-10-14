require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H;
function run(sc, tier, lvl, gear) {
  H.dinScale = sc;
  const rnd = H.rng(3); const list = Object.keys(H.FORMS).filter((f) => H.FORMS[f].tier === tier);
  let wins = 0, hp = 0, turns = 0; const N = 1200;
  for (let i = 0; i < N; i++) {
    const fs = H.shuffle(list, rnd).slice(0, 3);
    const allies = fs.map((x, k) => H.buildPetUnit({ id: k + 1, form: x, gear: gear ? [H.pick(H.GEAR_ORDER, rnd), gear > 1 ? H.pick(H.GEAR_ORDER, rnd) : null] : [] }, lvl, []));
    allies.sort((p, q) => (p.role === 'rhythm' ? -1 : 0) - (q.role === 'rhythm' ? -1 : 0));
    const din = ['racket', 'hiss', 'gibber', 'clank', 'whine'];
    const enemies = [0, 1, 2].map(() => H.buildDinUnit(H.pick(din, rnd), lvl, false));
    const b2 = new H.Battle({ allies, enemies, rng: rnd }); const w = H.autoRun(b2, true);
    wins += w ? 1 : 0; turns += b2.turn; hp += b2.units.filter(u=>u.side===0).reduce((s, u) => s + u.hp / u.max, 0) / 3;
  }
  return `${(wins / N * 100).toFixed(0).padStart(3)}%/${(hp / N * 100).toFixed(0).padStart(2)}%/${(turns / N).toFixed(0)}`;
}
const mk = (h1, v1, h2, v2) => (L) => { const s = 1 + 0.10 * (L - 1); const t = L >= 9 ? [h2, v2] : L >= 4 ? [h1, v1] : [1, 1]; return { hp: s * (1 + 0.04 * (L - 1)) * t[0], vol: s * (1 + 0.015 * (L - 1)) * t[1] }; };
for (const tm of [[1,1.12,1.25],[1,1.05,1.10]]) for (const p of [[1.6, 1.5, 2.4, 2.0], [1.8, 1.6, 2.8, 2.2], [2.0, 1.7, 3.2, 2.4]]) { H.TIER_MUL = tm;
  const sc = mk(...p);
  console.log(tm.join(","), p.join(' '), '| T0@2', run(sc, 0, 2, 0), '| T0@4', run(sc, 0, 4, 0), '| T1@4', run(sc, 1, 4, 0), '| T1@7', run(sc, 1, 7, 1), '| T1@9', run(sc, 1, 9, 1), '| T2@9', run(sc, 2, 9, 1), '| T2@12', run(sc, 2, 12, 2), '| T2@15', run(sc, 2, 15, 2));
}
