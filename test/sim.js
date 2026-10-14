// Headless checks: node test/sim.js [fuzz|run] [upto]
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js'); require('../src/modes.js');
const H = globalThis.H; if (process.env.RL) H.REH_LEVEL = +process.env.RL; if (process.env.RK) H.REH_GROW = +process.env.RK; if (process.env.PRICE) H.SHELL_PRICE = +process.env.PRICE; if (process.env.SLOPE) H.STAGE_SLOPE = +process.env.SLOPE; if (process.env.CURVE) H.DIN_CURVE = JSON.parse(process.env.CURVE); if (process.env.MK) { const [a, b] = process.env.MK.split(',').map(Number); H.MID_K.plain = a; H.MID_K.boss = b; } if (process.env.LK) { const [a, b, r] = process.env.LK.split(',').map(Number); H.LATE_K.plain = a; H.LATE_K.boss = b; if (r) H.LATE_K.ramp = r; } if (process.env.BK) H.BOSS_K = process.env.BK.split(',').map(Number); if (process.env.PK) H.PLAIN_K = process.env.PK.split(',').map(Number); if (process.env.SW) { H.SWELL.ramp.per = +process.env.SW.split(',')[0]; H.SWELL.ramp.max = +process.env.SW.split(',')[1]; } if (process.env.EC) H.ENEMY_COUNT = process.env.EC.split(',').map(Number); const mode = process.argv[2] || 'run';
function fuzz(n) {
  const forms = Object.keys(H.FORMS), din = Object.keys(H.DIN), rnd = H.rng(7); let errs = 0, turns = 0;
  for (let i = 0; i < n; i++) {
    const lvl = 1 + Math.floor(rnd() * 30), S = H.newState();
    const allies = [0, 1, 2].map((k) => { const pet = { id: k + 1, form: forms[Math.floor(rnd() * forms.length)], rank: Math.floor(rnd() * 4), gear: [null, null] }; for (let g = 0; g < 2; g++) if (rnd() < 0.7) pet.gear[g] = H.rollItem(S, rnd, rnd() < 0.5 ? 'boss' : 'win').id; return H.buildPetUnit(pet, lvl, S); });
    const enemies = [0, 1, 2].map((j) => H.buildDinUnit(din[Math.floor(rnd() * din.length)], lvl, j === 0 && rnd() < 0.3));
    // house rules from the Daily Gig and Solo, mixed in at random (several at once, too)
    const rules = {}; if (H.TWISTS && rnd() < 0.6) for (const id of H.TWIST_ORDER) if (rnd() < 0.25) Object.assign(rules, H.TWISTS[id].rules || {}); if (H.SOLO && rnd() < 0.2) rules.restless = H.SOLO.restless;
    if (rnd() < 0.15) for (const e of enemies) e.giant = [0.75, 0.5, 0.25];
    try { const b = new H.Battle({ allies, enemies, rng: rnd, rules, ensemble: rnd() < 0.6 ? H.ENSEMBLES[Math.floor(rnd() * H.ENSEMBLES.length)].id : null });
      let g = 0; while (!b.over && g++ < 3000) { const r = b.next(rnd() < 0.5); if (r.wait != null) { const u = b.units[r.wait]; const ready = u.ab.map((a, k) => k).filter((k) => u.ab[k].cd === 0); const vt = b.validTargets(u); b.order(7); b.act(ready[Math.floor(rnd() * ready.length)], vt.length ? vt[Math.floor(rnd() * vt.length)].uid : null); } }
      turns += b.turn; for (const u of b.units) if (!isFinite(u.hp) || !isFinite(u.gauge)) throw new Error('NaN ' + u.name);
      if (!b.over) throw new Error('no end');
    } catch (e) { errs++; if (errs < 5) console.log('ERR', e.stack.split('\n').slice(0, 4).join('\n')); }
  }
  console.log(`fuzz: ${n} battles, ${errs} errors, avg turns ${(turns / n).toFixed(1)}`);
}
// An ordinary player on auto: opens every shell, buys shells with notes, evolves whatever it can, fields its three most grown pets with its best gear.
// After two losses in a row it replays earlier floors until it gains a level, then tries again.
function campaign(seed, upto) {
  const rnd = H.rng(seed), S = H.newState(); EC.plain = 0; EC.own = 0; let battles = 0, losses = 0, streak = 0, grind = 0; const marks = {};
  const power = (p) => H.petTier(p) * 10 + (p.rank || 0);
  const tidy = () => {
    for (const r of H.RECORDS) if (H.recordState(S, r) === 'ready') H.claimRecord(S, r.id);
    while (S.shells > 0) H.openShell(S, rnd);
    while (S.notes >= H.shellPrice(S)) { H.buyShell(S); H.openShell(S, rnd); }
    const top = S.pets.slice().sort((a, b) => power(b) - power(a)).slice(0, 7); let best = top.slice(0, 3), bs = -1;
    if (!NOENS) for (let i = 0; i < top.length; i++) for (let j = i + 1; j < top.length; j++) for (let k = j + 1; k < top.length; k++) { const t = [top[i], top[j], top[k]], sc = power(t[0]) + power(t[1]) + power(t[2]) + (H.ensembleOf(t.map(H.petFamily)) ? ENSW : 0); if (sc > bs) { bs = sc; best = t; } }
    S.team = [0, 1, 2].map((i) => (best[i] ? best[i].id : null));
    // echoes go to the band, whoever has grown least first
    for (let go = true; go;) { go = false; const order = best.slice().sort((a, b) => H.petTier(a) - H.petTier(b) || (a.rank || 0) - (b.rank || 0)); for (const pet of order) { const cost = H.nextForms(pet).length ? H.evoCheck(S, pet, H.nextForms(pet)[0]).cost : H.rankCost(pet.rank || 0); if (pet !== order[0] && H.ownEchoes(S, pet) < cost) continue; const kids = H.nextForms(pet).filter((f) => H.evoCheck(S, pet, f).ok); if (kids.length) { H.evolve(S, pet, kids[Math.floor(rnd() * kids.length)]); go = true; break; } if (!H.nextForms(pet).length && H.rankUp(S, pet)) { go = true; break; } } }   // plain echoes go to whoever has grown least; own echoes are always spent
    for (const p of S.pets) p.gear = [null, null]; let mg; while ((mg = H.mergeGroups(S)).length) H.mergeItems(S, mg[0][0], rnd);
    const items = S.items.slice().sort((a, b) => H.itemRank(b) - H.itemRank(a)); const used = new Set(); for (let slot = 0; slot < 2; slot++) for (const p of best) { const it = items.find((x) => !used.has(x.id)); if (it) { used.add(it.id); p.gear[slot] = it.id; } }
  };
  let lvAt = 0;
  while (S.stage <= upto && battles < upto * 12) {
    tidy();
    let n = S.stage; if (streak >= 2) { if (!grind) { grind = 1; lvAt = S.level; } if (S.level > lvAt) { grind = 0; streak = 0; } else n = Math.max(1, S.stage - 2 - Math.floor(rnd() * 3)); }
    const b = H.startStage(S, n, rnd); const win = H.autoRun(b); battles++;
    const out = H.finishStage(S, n, win, rnd);
    if (win && out.first && n % 10 === 0) for (const rn of H.rehearsals(S)) if (!S.reh[rn]) for (let t = 0; t < 2 && !S.reh[rn]; t++) { tidy(); const rb = H.startStage(S, rn, rnd, true), rw = H.autoRun(rb); H.finishRehearsal(S, rn, rw, rnd); battles++; const g = (global.RT = global.RT || {}), kk = n + ':' + (n - rn); g[kk] = g[kk] || [0, 0]; g[kk][0]++; if (rw) g[kk][1]++; }
    if (win && out.first) { streak = 0; grind = 0; const band = n; if (MARKS.includes(n)) marks[band] = { battles, losses, lvl: S.level, flv: H.stageLevel(n), pets: S.pets.length, opened: S.opened, items: S.items.length, plain: EC.plain, own: EC.own, legs: S.items.filter((x) => x.rar === 'l').length, tiers: H.teamPets(S).filter(Boolean).map((p) => H.petTier(p) + (p.rank ? '*' + p.rank : '')).join(' ') }; }
    else if (!win) { losses++; if (n === S.stage) { streak++; if (n > 10) { const k = (n % 10 === 0 ? H.stage(n).enemies[0].id + '@' + n : n % 10 === 5 ? 'loud' : 'plain') + (n % 10 === 0 ? '' : n <= 40 ? '<=40' : n <= 100 ? '<=100' : '>100'); IDX[k] = (IDX[k] || 0) + 1; } } }
  }
  return { S, battles, losses, marks };
}
// count where echoes come from
const EC = { plain: 0, own: 0 }; { const a = H.addEchoes, o = H.openShell; H.addEchoes = (S, n) => { EC.plain += n; return a(S, n); }; H.openShell = (...x) => { const r = o(...x); if (r && !r.isNew) EC.own += r.echo; return r; }; }
const IDX = {}, NOENS = !!process.env.NOENS, ENSW = +(process.env.ENSW || 8);
const MARKS = [2000, 1500, 5, 10, 20, 30, 40, 60, 80, 100, 150, 200, 300, 400, 600, 800, 1000];
if (mode === 'over') {
  // Over-levelling: play a normal campaign to a floor, then fight the next ten floors at the band's level plus an offset.
  const F = +(process.argv[3] || 100), N = +(process.argv[4] || 6), offs = [-10, -5, 0, 5, 10, 20, 40], res = offs.map(() => [0, 0]); let lvSum = 0, flv = 0;
  for (let s = 0; s < N; s++) { const r = campaign(300 + s, F); lvSum += r.S.level; const base = r.S.level;
    offs.forEach((d, i) => { for (const n of process.env.BOSS ? [Math.ceil((F + 1) / 10) * 10] : Array.from({ length: 10 }, (_, k) => F + 1 + k)) for (let t = 0; t < (process.env.BOSS ? 30 : 4); t++) { const S2 = JSON.parse(JSON.stringify(r.S)); S2.level = Math.max(1, base + d); const w = H.autoRun(H.startStage(S2, n, H.rng(n * 31 + t + s * 7))); res[i][0]++; if (w) res[i][1]++; } }); }
  flv = H.stageLevel(F + 5);
  console.log(`floor ${F}: band level after a normal run ${(lvSum / N).toFixed(0)}, foes on the next floors about Lv ${flv}`);
  offs.forEach((d, i) => console.log(`  level ${d >= 0 ? '+' : ''}${d}: wins ${Math.round((100 * res[i][1]) / res[i][0])}%`));
  const xp = (n) => (8 + 3 * n) * 0.5; console.log('  replaying floor', F - 5, 'gives', xp(F - 5), 'xp; next level needs', H.xpNeed(Math.round(lvSum / N)));
} else if (mode === 'tune') {
  // Nudge the enemy curve until every stretch of floors costs an auto-playing team about the same number of losses.
  const bands = process.env.TARGETS ? JSON.parse(process.env.TARGETS) : [[10, 0.1], [20, 0.2], [40, 0.25], [100, 0.25], [200, 0.25], [400, 0.25], [1000, 0.25]], N = +(process.argv[4] || 8), upto = +(process.env.UPTO || 1000);
  for (let it = 0; it < +(process.argv[3] || 8); it++) {
    const sum = bands.map(() => 0);
    for (let s = 0; s < N; s++) { const r = campaign(500 + s + it * 31, upto); let pl = 0; bands.forEach(([f], i) => { const m = r.marks[f]; if (m) { sum[i] += m.losses - pl; pl = m.losses; } else sum[i] = NaN; }); }
    let pf = 0; const rates = bands.map(([f], i) => { const r = sum[i] / N / (f - pf); pf = f; return r; });
    console.log('iter', it, 'rates', rates.map((x) => x.toFixed(2)).join(' '), 'curve', JSON.stringify(H.DIN_CURVE.map((c) => [c[0], +c[1].toFixed(2)])));
    bands.forEach(([f, target], i) => { if (!(rates[i] >= 0) || target < 0) return; const c = H.DIN_CURVE[i + 1], err = target - rates[i]; c[1] = Math.max(1.05, c[1] * (1 + Math.max(-0.12, Math.min(0.12, err * 0.5)))); });
    for (let i = 1; i < H.DIN_CURVE.length; i++) H.DIN_CURVE[i][1] = Math.max(H.DIN_CURVE[i][1], H.DIN_CURVE[i - 1][1]);   // never let enemies get relatively weaker
  }
  console.log(JSON.stringify(H.DIN_CURVE.map((c) => [c[0], +c[1].toFixed(2)])));
} else if (mode === 'fuzz') fuzz(4000);
else {
  const upto = +(process.argv[3] || 40), N = +(process.argv[4] || 30); const agg = {};
  for (let s = 0; s < N; s++) { const r = campaign(100 + s, upto); for (const k in r.marks) { const a = (agg[k] = agg[k] || { battles: 0, losses: 0, lvl: 0, pets: 0, opened: 0, items: 0, n: 0, tiers: [], flv: 0 }); const m = r.marks[k]; a.battles += m.battles; a.losses += m.losses; a.lvl += m.lvl; a.pets += m.pets; a.opened += m.opened; a.items += m.items; a.plain = (a.plain || 0) + m.plain; a.own = (a.own || 0) + m.own; a.legs = (a.legs || 0) + m.legs; a.flv = m.flv; a.n++; a.tiers.push(m.tiers); } }
  let pb = 0, pl = 0, pk = 0;
  for (const k in agg) { const a = agg[k], B = a.battles / a.n, L = a.losses / a.n; console.log(`floor ${String(k).padStart(4)}: ${a.n}/${N}  battles ${B.toFixed(0)} (${((B - pb) / (k - pk)).toFixed(2)}/floor)  losses ${L.toFixed(1)} (${((L - pl) / (k - pk)).toFixed(2)}/floor)  Lv ${(a.lvl / a.n).toFixed(0)} vs foes ${a.flv}  pets ${(a.pets / a.n).toFixed(1)} shells ${(a.opened / a.n).toFixed(0)} items ${(a.items / a.n).toFixed(0)} leg ${((a.legs || 0) / a.n).toFixed(1)} echoes own ${(a.own / a.n).toFixed(0)} plain ${(a.plain / a.n).toFixed(0)}  | ${a.tiers.slice(0, 3).join(' | ')}`); pb = B; pl = L; pk = +k; }
}

if (mode === 'run') console.log('losses on new floors past 10:', JSON.stringify(IDX));

process.on('exit', () => { if (global.RT) { const o = {}; for (const k in global.RT) { const [n, d] = k.split(':').map(Number), b = (n <= 30 ? 'early' : n <= 100 ? 'mid' : 'late') + (d <= 10 ? ' fresh' : ' older'); o[b] = o[b] || [0, 0]; o[b][0] += global.RT[k][0]; o[b][1] += global.RT[k][1]; } console.log('rehearsal tries/wins:', JSON.stringify(o), 'floor 10 fresh:', JSON.stringify(global.RT['10:0'] || global.RT['20:10'])); } });
