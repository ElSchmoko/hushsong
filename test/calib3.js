require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H;
Object.assign(H.ROLES.rhythm, { hp: 1.2, vol: 0.85, poise: 10, tempo: 0.94 });
Object.assign(H.ROLES.lead, { hp: 0.9, vol: 1.12, poise: 0, tempo: 1.04 });
Object.assign(H.ROLES.harmony, { hp: 1.0, vol: 0.95, poise: 2, tempo: 1.0 });
Object.assign(H.ROLES.bass, { hp: 1.05, vol: 0.92, poise: 4, tempo: 0.98 });
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
const mk = (a, b) => (L) => { const s = 1 + 0.10 * (L - 1); return { hp: s * (1 + a * (L - 1)), vol: s * (1 + b * (L - 1)) }; };
for (const tm of [[1,1.08,1.16],[1,1.0,1.0]]) for (const p of [[0.10, 0.05], [0.14, 0.08], [0.18,0.10]]) { H.TIER_MUL = tm;
  const sc = mk(...p);
  console.log(tm.join(','), p.join(' '), '| T0@2', run(sc, 0, 2, 0), '| T0@4', run(sc, 0, 4, 0), '| T1@4', run(sc, 1, 4, 0), '| T1@7', run(sc, 1, 7, 1), '| T1@9', run(sc, 1, 9, 1), '| T2@9', run(sc, 2, 9, 1), '| T2@12', run(sc, 2, 12, 2), '| T2@15', run(sc, 2, 15, 2));
}
