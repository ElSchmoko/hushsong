// Headless balance sims: node test/sim.js [fuzz|campaign|forms]
require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H;
const mode = process.argv[2] || 'campaign';

function fuzz(n) {
  const forms = Object.keys(H.FORMS); const rnd = H.rng(7); let errs = 0, turns = 0;
  for (let i = 0; i < n; i++) {
    const mk = () => ({ id: 1, form: H.pick(forms, rnd), trait: H.pick(Object.keys(H.TRAITS), rnd), gear: [H.pick(H.GEAR_ORDER, rnd), H.pick(H.GEAR_ORDER, rnd)] });
    const lvl = 1 + Math.floor(rnd() * 20);
    const orn = H.shuffle(Object.keys(H.ORNAMENTS), rnd).slice(0, 4).map((o) => H.ORNAMENTS[o]);
    const allies = [0, 1, 2].map(() => H.buildPetUnit(mk(), lvl, orn.filter((o) => !o.team)));
    const din = Object.keys(H.DIN);
    const enemies = [0, 1, 2].map((j) => H.buildDinUnit(H.pick(din, rnd), lvl, j === 0 && rnd() < 0.3));
    try { const b = new H.Battle({ allies, enemies, teamPerks: orn.filter((o) => o.team), rng: rnd }); H.autoRun(b, true); turns += b.turn;
      for (const u of b.units) if (!isFinite(u.hp) || !isFinite(u.gauge)) throw new Error('NaN in ' + u.name);
    } catch (e) { errs++; if (errs < 5) console.log('ERR', e.stack.split('\n').slice(0, 4).join('\n')); }
  }
  console.log(`fuzz: ${n} battles, ${errs} errors, avg turns ${(turns / n).toFixed(1)}`);
}

// Each final form on a fixed support band vs. a standard on-level encounter: who over/under-performs?
function forms() {
  const rnd = H.rng(11);
  const finals = Object.keys(H.FORMS).filter((f) => H.FORMS[f].tier === 2);
  const rows = [];
  for (const tier of [0, 1, 2]) {
    const list = Object.keys(H.FORMS).filter((f) => H.FORMS[f].tier === tier);
    const lvl = [2, 6, 12][tier];
    for (const f of list) {
      let wins = 0, hpLeft = 0, turns = 0; const N = 300;
      for (let i = 0; i < N; i++) {
        const mates = H.shuffle(list.filter((x) => x !== f), rnd).slice(0, 2);
        const allies = [f, mates[0], mates[1]].map((x, k) => H.buildPetUnit({ id: k + 1, form: x, gear: [] }, lvl, []));
        // order: rhythm first
        allies.sort((a, b) => (a.role === 'rhythm' ? -1 : 0) - (b.role === 'rhythm' ? -1 : 0));
        const din = ['racket', 'hiss', 'gibber', 'clank', 'whine'];
        const enemies = [0, 1, 2].map((j) => H.buildDinUnit(H.pick(din, rnd), lvl + 1, j === 0));
        const b = new H.Battle({ allies, enemies, rng: rnd }); const w = H.autoRun(b, true);
        wins += w ? 1 : 0; turns += b.turn; if (w) hpLeft += b.alive(0).reduce((s, u) => s + u.hp / u.max, 0) / 3;
      }
      rows.push([f, tier, (wins / N * 100).toFixed(0) + '%', (hpLeft / Math.max(1, wins) * 100).toFixed(0) + '%', (turns / N).toFixed(0)]);
    }
  }
  for (const r of rows) console.log(r[0].padEnd(10), 'T' + r[1], 'win', r[2].padStart(4), 'hpLeft', r[3].padStart(4), 'turns', r[4]);
}

// A plain player: fixed species plan, buys evolutions when it can, equips what drops, takes random paths.
function campaign(plan, seed, verbose) {
  const rnd = H.rng(seed); const S = H.newState();
  plan.forEach((p) => H.addPet(S, p[0], null));
  const log = []; let delves = 0;
  const upgrade = () => {
    S.pets.forEach((pet, i) => {
      const p = plan[i]; if (!p) return;
      for (const target of [p[2], p[1]]) { if (pet.form !== target && H.FORMS[target].tier > H.petTier(pet) && H.evoCheck(S, pet, target).ok) { H.evolve(S, pet, target); break; } }
    });
    // equip anything loose
    for (const pet of S.pets) for (let s = 0; s < 2; s++) if (!pet.gear[s]) { const g = Object.keys(S.gear).find((x) => S.gear[x] > 0 && !pet.gear.includes(x)); if (g) H.equip(S, pet, s, g); }
    // spend spare notes on gear once evolutions are bought
    const allEvo = S.pets.every((p) => H.petTier(p) >= (S.level >= 8 ? 2 : S.level >= 3 ? 1 : 0));
    if (allEvo) for (const g of H.shuffle(H.gearUnlocked(S), rnd)) { if (S.notes >= H.GEAR[g].cost + (S.level < 8 ? 120 : 0) && S.pets.some((p) => p.gear.includes(null) && !p.gear.includes(g))) { H.buyGear(S, g); const pet = S.pets.find((p) => p.gear.includes(null) && !p.gear.includes(g)); H.equip(S, pet, pet.gear.indexOf(null), g); } }
  };
  const stats = {};
  for (let guard = 0; guard < 60; guard++) {
    const region = H.REGION_ORDER.find((r) => !(S.regions[r] || {}).clears); if (!region) break;
    upgrade();
    const dv = H.genDelve(S, region, false, rnd); delves++;
    const st = (stats[region] = stats[region] || { tries: 0, wins: 0, lvl: [] }); st.tries++; st.lvl.push(S.level);
    let alive = true;
    while (alive) {
      const ch = H.delveChoices(dv); if (!ch.length) break;
      const nodes = ch.map((id) => H.delveNode(dv, id)); const hpv = Object.values(dv.hp); const avg = hpv.reduce((a, b) => a + b, 0) / hpv.length;
      let pool = nodes; const rest = nodes.filter((n) => n.type === 'rest'); if (avg < 0.65 && rest.length) pool = rest; else if (avg < 0.55) { const soft = nodes.filter((n) => n.type !== 'elite'); if (soft.length) pool = soft; }
      const node = H.pick(pool, rnd); dv.at = node.id;
      if (node.type === 'fight' || node.type === 'elite' || node.type === 'boss') {
        const b = H.startBattle(S, dv, node, rnd); H.autoRun(b, true);
        const out = H.afterBattle(S, dv, node, b, rnd);
        if (!out.win) { alive = false; if (verbose) log.push(`  lost at ${region} col ${node.col} (${node.type}) lvl ${S.level}`); break; }
        if (out.ornaments) dv.ornaments.push(out.ornaments[0]);
        if (node.type === 'boss') { st.wins++; break; }
      } else if (node.type === 'rest') H.restNode(dv);
      else if (node.type === 'event') { const ev = H.EVENTS.find((e) => e.id === node.ev); const o = H.applyEventFx(S, dv, ev.opts[0].fx, rnd); if (o.ornaments) dv.ornaments.push(o.ornaments[0]); }
      else if (node.type === 'shell') S.shells[region] = (S.shells[region] || 0) + 1;
    }
    if (verbose) log.push(`delve ${delves} ${region}: ${(S.regions[region] || {}).clears ? 'CLEAR' : 'fail'} lvl ${S.level} notes ${S.notes} forms ${S.pets.map((p) => p.form).join(',')}`);
  }
  return { S, delves, stats, log, done: H.REGION_ORDER.every((r) => (S.regions[r] || {}).clears) };
}

if (mode === 'fuzz') fuzz(4000);
else if (mode === 'forms') forms();
else {
  const plans = {
    classic: [['thud', 'stomp', 'cadence'], ['twang', 'pluck', 'shred'], ['hum', 'whistle', 'carol']],
    glass: [['yelp', 'shout', 'aria'], ['twang', 'pluck', 'riff'], ['blare', 'toot', 'swing']],
    control: [['blare', 'bellow', 'anthem'], ['hum', 'drone', 'dirge'], ['yelp', 'croon', 'serenade']],
    mixed: [['thud', 'patter', 'roll'], ['yelp', 'croon', 'hymn'], ['blare', 'bellow', 'fanfare']],
    noheal: [['thud', 'stomp', 'march'], ['yelp', 'shout', 'chant'], ['twang', 'pluck', 'shred']],
  };
  for (const name in plans) {
    const agg = {}; let done = 0, delves = 0; const N = 40;
    for (let s = 0; s < N; s++) {
      const r = campaign(plans[name], 1000 + s, false); done += r.done ? 1 : 0; delves += r.delves;
      for (const k in r.stats) { const a = (agg[k] = agg[k] || { tries: 0, wins: 0, lvl: 0, n: 0, first: 0 }); a.tries += r.stats[k].tries; a.wins += r.stats[k].wins; a.lvl += r.stats[k].lvl[0]; a.n++; a.first += r.stats[k].tries === 1 && r.stats[k].wins ? 1 : 0; }
    }
    console.log(`\n${name}: finished ${done}/${N}, avg delves ${(delves / N).toFixed(1)}`);
    for (const k of H.REGION_ORDER) if (agg[k]) console.log(`  ${k.padEnd(6)} arrive lvl ${(agg[k].lvl / agg[k].n).toFixed(1)}  tries/clear ${(agg[k].tries / Math.max(1, agg[k].wins)).toFixed(2)}  first-try ${(agg[k].first / agg[k].n * 100).toFixed(0)}%`);
  }
  if (process.argv[3]) console.log(campaign(plans[process.argv[3]], 5, true).log.join('\n'));
}
