/* Hushsong — Tour: the whole band on the road. No DOM.
   Five legs, each in its own region: ten gigs with stops between them, then the region's boss. Every leg is much tougher than the last.
   HP carries on from gig to gig; a pet that falls sits out until a campfire (or a medic) gets it back up.
   Boons go to one pet each. At the start of every leg the band picks a Headliner, an effect for the whole band.
   A band that forms an ensemble also plays its ensemble's tour version.
   Uses Solo's road map, boons and mysteries (modes.js). */
(function (H) {
  'use strict';
  const rows = []; for (let i = 0; i < 10; i++) rows.push('g', 's'); rows.push('b');
  H.TOUR = {
    unlock: 25, legs: 5, gigs: 10, rows, loudCh: 0.3, notes: 10,
    // how tough the Din are: the base, each leg, the climb within a leg (per gig), a Loud gig, the boss
    k: 1.25, legK: [1, 2.2, 4.4, 9, 20], ramp: 0.04,   // tuned by test/tour.js: a maxed, geared band finishes about 1 tour in 6 loudK: 1.25, bossK: 1.1,
    rest: 0.4, revive: 0.4, practise: 0.08, restless: { from: 30, per: 0.06 },
  };
  H.tourOpen = (S) => S.level >= H.TOUR.unlock;

  /* Headliners: one per leg, for the whole band. `icon` borrows a boon's badge. */
  const HL = (n, d, icon, perk) => ({ n, d, icon, perk: Object.assign({ n, d }, perk) });
  H.HEADLINERS = {
    wall: HL('Wall of Sound', 'Single hits splash 35% onto the other enemies.', 'mosh', { splash: 0.35 }),
    doubleenc: HL('Double Encore', 'Every third turn, each pet acts again straight away.', 'double', { encore: 3 }),
    distortion: HL('Distortion', '+40% Power for the band, but 25% less HP.', 'glass', { mod: { vol: 0.4, hp: -0.25 } }),
    unplugged: HL('Unplugged', 'The band heals for 20% of the damage it deals.', 'soul', { leech: 0.2 }),
    arena: HL('Arena Rock', '+5% Power every turn of a gig, up to +50%.', 'cresc', { ramp: { on: 'turn', per: 0.05, max: 0.5 } }),
    rhythm: HL('Tight Rhythm Section', 'Skills and Specials rest 1 turn less.', 'click', { cdCut: 1 }),
    surf: HL('Crowd Surfing', 'Every knockout heals the whole band 10%.', 'dive', { on: { kill: [['heal', 'allies', 0, { pct: 0.1 }]] } }),
    roadcrew: HL('Road Crew', 'Each gig starts with a Shield of 30% HP on every pet.', 'shell', { on: { start: [['shield', 'self', 0, { pct: 0.3 }]] } }),
    lastsong: HL('Last Song', 'Once per gig, each pet survives a knockout on 1 HP.', 'second', { lastStand: true }),
    spotlight: HL('Spotlight', '+15% critical hit chance, and critical hits fill 30% of the turn bar.', 'critfb', { mod: { crit: 0.15 }, critGauge: 0.3 }),
    echoes: HL('Echo Chamber', 'Skills and Specials play again at 40% on the next turn.', 'pedal', { echoPedal: 0.4 }),
    stagefright: HL('Stage Fright', 'Enemies start each gig Slow and Power Down for 3 turns.', 'hush', { on: { start: [['st', 'all', 'sdown', 3], ['st', 'all', 'pdown', 3]] } }),
    finale: HL('Grand Finale', 'The band deals 60% more damage to enemies under 40% HP.', 'finish', { execute: { below: 0.4, bonus: 0.6 } }),
    pyroshow: HL('Pyro Show', 'Hits Poison for 2 turns, and Poisoned enemies take 30% more.', 'pyro', { hitSt: [['poison', 2, 1, 0.25]], vs: { poison: 0.3 } }),
  };
  H.HEAD_ORDER = Object.keys(H.HEADLINERS);

  /* An ensemble on tour: on top of its usual opening, a band that forms one plays its tour version. */
  const ET = (n, d, perk) => ({ n, d, perk: Object.assign({ n, d }, perk) });
  H.ENS_TOUR = {
    drumline: ET('Thunder Roll', '+12% Speed for the band.', { mod: { tempo: 0.12 } }),
    stringtrio: ET('Virtuoso', '+10% critical hit chance, and critical hits deal 25% more.', { mod: { crit: 0.1, critDmg: 0.25 } }),
    windtrio: ET('Second Breath', 'Each pet heals 4% after each of its turns.', { on: { turn: [['heal', 'self', 0, { pct: 0.04 }]] } }),
    brassband: ET('Fanfare', '+12% Power for the band.', { mod: { vol: 0.12 } }),
    choir: ET('Hallelujah', 'Each gig starts with Lifesong on every pet for 2 turns.', { on: { start: [['st', 'self', 'lifesong', 2]] } }),
    folk: ET('Campfire Songs', '+15% HP for the band.', { mod: { hp: 0.15 } }),
    ragtime: ET('Syncopation', 'Hits have a 25% chance to Slow for 1 turn.', { hitSt: [['sdown', 1, 0.25]] }),
    rock: ET('Stadium Rock', '+15% Power for the band.', { mod: { vol: 0.15 } }),
    marching: ET('Formation', '+12 Guard for the band.', { mod: { poise: 12 } }),
    carnival: ET('Street Party', 'Hits have a 20% chance to Poison for 2 turns.', { hitSt: [['poison', 2, 0.2, 0.25]] }),
    swing: ET('Big Band', 'Each knockout fills 30% of the turn bar.', { on: { kill: [['gauge', 'self', 0.3]] } }),
    chamber: ET('Recital', 'Each gig starts with a Shield of 15% HP on every pet.', { on: { start: [['shield', 'self', 0, { pct: 0.15 }]] } }),
    serenade: ET('Moonlight', 'The band heals for 10% of the damage it deals.', { leech: 0.1 }),
    opera: ET('Aria', 'The band deals 30% more damage to enemies under 40% HP.', { execute: { below: 0.4, bonus: 0.3 } }),
    hymn: ET('Amazing Grace', 'Once per gig, each pet survives a knockout on 1 HP.', { lastStand: true }),
  };

  const runOf = (S) => S.tourRun;
  const legMap = (seed, leg) => H.roadMap(seed + leg * 7919, H.TOUR.rows, H.TOUR.loudCh);
  H.tourRegion = (run) => run.regions[run.leg];
  H.tourPets = (S) => (S.tourRun ? S.tourRun.band.map((id) => H.petById(S, id)).filter(Boolean) : []);
  H.tourEnsemble = (S) => { const P = H.tourPets(S); return P.length === 3 ? H.ensembleOf(P.map(H.petFamily)) : null; };
  H.tourBoons = (run) => [].concat(...run.band.map((id) => run.kit[id] || []));
  H.tourAlive = (run) => run.band.filter((id) => run.hp[id] > 0);
  H.refreshTour = (S) => { S.tour = S.tour || { tours: 0, wins: 0, best: 0 }; return S.tour; };
  // how far a run got, as one number: 11 steps a leg (ten gigs and the boss)
  H.tourProgress = (leg, gigs) => leg * (H.TOUR.gigs + 1) + gigs;

  const headOffer = (run, rnd) => H.shuffle(H.HEAD_ORDER.filter((id) => !run.heads.includes(id)), rnd).slice(0, 3);
  H.startTour = (S, rnd) => {
    const band = H.teamPets(S).filter(Boolean).map((p) => p.id); if (!band.length) return null;
    const seed = 1 + Math.floor(rnd() * 1e9), r2 = H.rng(seed), regions = H.shuffle(H.REGION_ORDER, r2).slice(0, H.TOUR.legs);
    const run = { seed, band, regions, leg: 0, map: legMap(seed, 0), at: null, done: [], hp: {}, kit: {}, heads: [], extra: { vol: 0, hp: 0, perks: [] }, gigs: 0, pending: null, log: [], earned: 0, loot: { echo: 0, shells: 0, items: [] } };
    for (const id of band) { run.hp[id] = 1; run.kit[id] = []; }
    run.pending = { type: 'head', opts: headOffer(run, rnd) };
    S.tourRun = run; H.refreshTour(S).tours++; return run;
  };
  H.endTour = (S) => { S.tourRun = null; };

  // a pet as it plays on this tour: its usual self, its boons, the Headliners, the road's extras and the ensemble's tour version
  H.tourUnit = (S, pet, ens) => {
    const run = runOf(S), u = H.buildPetUnit(pet, S.level, S);
    u.perks = u.perks.concat((run.kit[pet.id] || []).map((id) => H.BOONS[id].perk), run.heads.map((id) => H.HEADLINERS[id].perk), run.extra.perks);
    if (run.extra.vol || run.extra.hp) u.perks.push({ mod: { vol: run.extra.vol, hp: run.extra.hp } });
    if (ens && H.ENS_TOUR[ens]) u.perks.push(H.ENS_TOUR[ens].perk);
    return u;
  };
  H.tourMaxHp = (S, id) => { const p = H.petById(S, id); if (!p) return 1; const b = new H.Battle({ allies: [H.tourUnit(S, p, H.tourEnsemble(S))], enemies: [] }); return b.units[0].max; };
  // HP is kept as a share of max; when max changes, the HP itself stays put (as far as it fits)
  const keepHp = (S, id, fn) => { const run = runOf(S), before = H.tourMaxHp(S, id); fn(); if (run.hp[id] > 0) { const after = H.tourMaxHp(S, id); run.hp[id] = Math.max(0.01, Math.min(1, (run.hp[id] * before) / after)); } };
  const keepAll = (S, fn) => { const run = runOf(S), before = {}; for (const id of run.band) before[id] = H.tourMaxHp(S, id); fn(); for (const id of run.band) if (run.hp[id] > 0) run.hp[id] = Math.max(0.01, Math.min(1, (run.hp[id] * before[id]) / H.tourMaxHp(S, id))); };

  // who plays a gig: the band's level, how far into the tour, and what kind of stop
  H.tourStage = (S, node) => {
    const run = runOf(S), T = H.TOUR, region = H.tourRegion(run), R = H.REGIONS[region], L = Math.max(1, S.level), rnd = H.rng(run.seed * 13 + run.leg * 977 + node.id * 101), g = run.gigs + 1;
    const k = T.k * T.legK[run.leg] * (1 + T.ramp * (g - 1)), boss = node.type === 'boss', loud = node.type === 'loud';
    let enemies;
    if (boss) enemies = [{ id: R.boss, lvl: L, k: k * T.bossK }].concat(R.adds.map((a) => ({ id: a, lvl: L, k })));
    else enemies = [0, 1, 2].map(() => ({ id: R.din[Math.floor(rnd() * R.din.length)], lvl: L, k: loud ? k * T.loudK : k })).sort((a, b) => (H.DIN_FRONT[a.id] || 0) - (H.DIN_FRONT[b.id] || 0)).map((e, i) => Object.assign(e, { loud: loud && i === 0 }));
    return { n: g, leg: run.leg, region, boss, elite: loud, level: L, enemies, tour: true, name: boss ? 'Tour · boss' : 'Tour · gig ' + g };
  };
  H.startTourBattle = (S, rnd) => {
    const run = runOf(S), st = H.tourStage(S, run.map[run.at]), ens = H.tourEnsemble(S), all = H.tourAlive(run).length === run.band.length;
    for (const e of st.enemies) S.dinSeen[e.id] = 1;
    const allies = run.band.map((id) => { const p = H.petById(S, id); return p && run.hp[id] > 0 ? H.tourUnit(S, p, ens && all ? ens.id : null) : null; });
    const b = new H.Battle({ allies, enemies: st.enemies.map(H.foeUnit), rng: rnd, ensemble: ens && all ? ens.id : null, rules: { restless: H.TOUR.restless } });
    for (const u of b.units) if (u.side === 0 && u.petId != null) u.hp = Math.max(1, Math.round(u.max * run.hp[u.petId]));
    return b;
  };

  // stepping onto a stop: what it asks of you next
  H.tourEnter = (S, id, rnd) => {
    const run = runOf(S), node = run.map[id]; if (!node || run.pending || !H.soloReach(run).some((n) => n.id === id)) return null;
    run.at = id; run.done.push(id);
    if (node.type === 'gig' || node.type === 'loud' || node.type === 'boss') run.pending = { type: 'battle' };
    else if (node.type === 'rest') run.pending = { type: 'rest' };
    else if (node.type === 'jam') run.pending = { type: 'boon', src: 'jam', opts: offer(run, 'jam', rnd) };
    else { const r2 = H.rng(run.seed * 31 + run.leg * 53 + id), seen = run.log.filter((x) => x.ev && x.leg === run.leg).map((x) => x.ev), pool = H.EVENT_ORDER.filter((e) => !seen.includes(e)); run.pending = { type: 'event', ev: pool[Math.floor(r2() * pool.length)] || 'crowd' }; }
    return run.pending;
  };
  // a rare boon comes once per pet: it is off the list only once every pet has it
  const offer = (run, src, rnd) => H.boonOffer(run, src, rnd, 'tour', H.BOON_ORDER.filter((id) => run.band.every((p) => (run.kit[p] || []).includes(id))));

  // after a gig: HP is noted, notes are paid, a boon is offered. A boss pays an echo and equipment, and the tour moves on to the next leg.
  H.finishTour = (S, win, battle, rnd) => {
    const run = runOf(S), node = run.map[run.at], T = H.TOUR, P = H.refreshTour(S), boss = node.type === 'boss';
    const out = { tour: true, win, leg: run.leg, boss, loud: node.type === 'loud', gig: run.gigs + (win && !boss ? 1 : 0), notes: 0, echo: 0, shells: 0, item: null, legend: null, region: H.tourRegion(run), band: run.band.slice() };
    if (!win) { out.reached = { leg: run.leg, gigs: run.gigs }; P.best = Math.max(P.best, H.tourProgress(run.leg, run.gigs)); out.total = run.earned; out.loot = run.loot; S.tourRun = null; return out; }
    if (battle) for (const u of battle.units) if (u.side === 0 && u.petId != null) run.hp[u.petId] = u.alive ? Math.max(0.01, u.hp / u.max) : 0;
    if (boss) {
      out.echo = H.addEchoes(S, 1); out.item = H.rollItem(S, rnd, 'boss'); run.loot.echo += out.echo; run.loot.items.push(out.item.id);
      P.best = Math.max(P.best, H.tourProgress(run.leg + 1, 0));
      if (run.leg === T.legs - 1) {
        out.shells = 1; S.shells += 1; run.loot.shells += 1; out.legend = H.rollLegend(S, rnd); run.loot.items.push(out.legend.id);
        out.done = true; P.wins++; S.stats.tourWins = (S.stats.tourWins || 0) + 1; out.total = run.earned; out.loot = run.loot; S.tourRun = null; return out;
      }
      run.leg++; run.map = legMap(run.seed, run.leg); run.at = null; run.done = []; run.gigs = 0; out.nextLeg = run.leg;
      run.pending = { type: 'head', opts: headOffer(run, rnd) };
    } else {
      run.gigs++; out.notes = T.notes; run.earned += out.notes; S.notes += out.notes;
      P.best = Math.max(P.best, H.tourProgress(run.leg, run.gigs));
      run.pending = { type: 'boon', src: out.loud ? 'loud' : 'gig', opts: offer(run, out.loud ? 'loud' : 'gig', rnd) };
    }
    return out;
  };
  // a boon goes to one pet
  H.tourPick = (S, id, petId) => {
    const run = runOf(S); if (!run || !run.pending || run.pending.type !== 'boon') return false;
    if (id && run.pending.opts.includes(id) && run.band.includes(petId)) { keepHp(S, petId, () => run.kit[petId].push(id)); run.log.push({ boon: id, pet: petId }); }
    run.pending = null; return true;
  };
  H.tourHead = (S, id) => { const run = runOf(S); if (!run || !run.pending || run.pending.type !== 'head' || !run.pending.opts.includes(id)) return false; keepAll(S, () => run.heads.push(id)); run.log.push({ head: id }); run.pending = null; return true; };
  // the campfire: sleep (everyone heals, the fallen get back up) or practise (the band gets stronger)
  H.tourRest = (S, choice) => {
    const run = runOf(S); if (!run || !run.pending || run.pending.type !== 'rest') return false;
    if (choice === 'nap') for (const id of run.band) run.hp[id] = run.hp[id] > 0 ? Math.min(1, run.hp[id] + H.TOUR.rest) : H.TOUR.revive;
    else keepAll(S, () => (run.extra.vol += H.TOUR.practise));
    run.log.push({ rest: choice }); run.pending = null; return true;
  };
  // the pet a random boon goes to: the one with the fewest, standing ones first
  H.tourNeediest = (run) => run.band.slice().sort((a, b) => (run.hp[b] > 0) - (run.hp[a] > 0) || run.kit[a].length - run.kit[b].length)[0];
  // a mystery's choice works on the whole band; boons it gives go to the pet with the fewest
  H.tourEvent = (S, i, rnd) => {
    const run = runOf(S); if (!run || !run.pending || run.pending.type !== 'event') return null;
    const ev = run.pending.ev, o = H.EVENTS[ev].opts[i]; if (!o) return null;
    run.log.push({ ev, opt: i, leg: run.leg }); run.pending = null;
    const gave = [], give = (id) => { const p = H.tourNeediest(run); keepHp(S, p, () => run.kit[p].push(id)); gave.push(p); return id; };
    const got = H.roadFx(o.fx, {
      boost: (vol, hp) => keepAll(S, () => { run.extra.vol += vol; run.extra.hp += hp; }),
      perk: (p) => run.extra.perks.push(p),
      revive: (x) => { for (const id of run.band) if (!(run.hp[id] > 0)) run.hp[id] = x; },
      hurt: (x) => { for (const id of run.band) if (run.hp[id] > 0) run.hp[id] = Math.max(0.01, run.hp[id] - x); },
      heal: (x) => { for (const id of run.band) if (run.hp[id] > 0) run.hp[id] = Math.min(1, run.hp[id] + x); },
      boon: (rar) => { const o2 = offer(run, rar, rnd); return o2[0] ? give(o2[0]) : null; },
      dupe: () => { const have = H.tourBoons(run).filter((id) => H.BOONS[id].r === 'c'); return have.length ? give(have[Math.floor(rnd() * have.length)]) : null; },
      pick: (rar) => (run.pending = { type: 'boon', src: rar, opts: offer(run, rar, rnd) }),
    }, rnd);
    got.ev = ev; got.opt = i; got.to = gave; if (got.boons.length) got.boon = got.boons[0];
    return got;
  };
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
