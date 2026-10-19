/* Hushsong — Tour: the whole band on the road. No DOM.
   Five legs, each in its own region: five gigs with stops between them, then the region's boss. Every leg is much tougher than the last.
   HP carries on from gig to gig; a pet that falls sits out until a campfire, a Benefit show or the end of the leg gets it back up.
   Boons work on the whole band (a gentler version of each Solo boon). On legs 1, 3 and 5 the band picks a Headliner:
   a big change to how it plays, with a price the tour makes it pay. A band that forms an ensemble also plays its tour version.
   Uses Solo's road map, boons and mysteries (modes.js). */
(function (H) {
  'use strict';
  H.TOUR = {
    unlock: 25, legs: 5, gigs: 5, rows: ['g', 's', 'g', 's', 'g', 's', 'g', 's', 'g', 'b'], restRows: [3, 7], loudCh: 0.3, notes: 15,
    // how tough the Din are: the base, each leg, the climb within a leg (per gig), a Loud gig, the boss, a Benefit show, Battle of the Bands
    k: 0.85, legK: [1, 1.75, 3.3, 7.5, 18], ramp: 0.06, loudK: 1.25, bossK: 1.1, benefitK: 0.7, battleK: 1.3,
    rest: 0.4, revive: 0.4, practise: 0.06, bossRevive: 0.3, benefitHeal: 0.25, benefitRevive: 0.5, restless: { from: 30, per: 0.06 }, headLegs: [0, 2, 4],
  };
  H.tourOpen = (S) => S.level >= H.TOUR.unlock;

  /* Boons on tour work on the whole band, so each is a gentler version of its Solo self.
     lead: effects on the enemies at the start of a gig, carried by one pet only, so they happen once. */
  const BB = (d, perk, lead) => ({ d, perk, lead: !!lead });
  H.BAND_BOONS = {
    amp: BB('+8% Power for the band.', { mod: { vol: 0.08 } }),
    case: BB('+10% HP for the band.', { mod: { hp: 0.1 } }),
    quick: BB('+6% Speed for the band.', { mod: { tempo: 0.06 } }),
    pitch: BB('+6% critical hit chance for the band, and critical hits deal 12% more.', { mod: { crit: 0.06, critDmg: 0.12 } }),
    shell: BB('+6 Guard. Each gig starts with a Shield of 10% HP on every pet.', { mod: { poise: 6 }, on: { start: [['shield', 'self', 0, { pct: 0.1 }]] } }),
    soul: BB('The band heals for 8% of the damage it deals.', { leech: 0.08 }),
    sour: BB('The band\'s hits have a 50% chance to Poison for 2 turns.', { hitSt: [['poison', 2, 0.5, 0.2]] }),
    wrong: BB('The band\'s hits have a 25% chance to make the target Off-Key for 2 turns.', { hitSt: [['offkey', 2, 0.25]] }),
    opener: BB('The band starts each gig with its turn bars half full, and each pet\'s first hit deals 25% more.', { startGauge: 0.5, firstStrike: 0.25 }),
    spiky: BB('Enemies that hit the band take 12% of that damage back.', { thorns: 0.12 }),
    hype: BB('Each gig starts with Power Up and Speed Up on every pet for 2 turns.', { on: { start: [['st', 'allies', 'pup', 2], ['st', 'allies', 'sup', 2]] } }, true),
    hush: BB('Enemies start each gig Slow for 2 turns.', { on: { start: [['st', 'all', 'sdown', 2]] } }, true),
    cresc: BB('+2% Power for the band every turn of a gig, up to +20%.', { ramp: { on: 'turn', per: 0.02, max: 0.2 } }),
    overflow: BB('Healing past full HP turns into Shield.', { overheal: true }),
    lifeloop: BB('Each gig starts with Lifesong on every pet for 2 turns. Each knockout adds 1.', { on: { start: [['st', 'self', 'lifesong', 2]], kill: [['st', 'self', 'lifesong', 1]] } }),
    click: BB('Skills and Specials rest 1 turn less.', { cdCut: 1 }),
    double: BB('Every fourth turn, each pet acts again straight away.', { encore: 4 }),
    maestro: BB('The band deals 25% more damage to Poisoned enemies and 20% more to Off-Key ones.', { vs: { poison: 0.25, offkey: 0.2 } }),
    critfb: BB('Critical hits fill 20% of the turn bar.', { critGauge: 0.2 }),
    glass: BB('+20% Power for the band, but 12% less HP.', { mod: { vol: 0.2, hp: -0.12 } }),
    second: BB('Once per gig, each pet survives a knockout on 1 HP.', { lastStand: true }),
    finish: BB('The band deals 30% more damage to enemies under 35% HP.', { execute: { below: 0.35, bonus: 0.3 } }),
    pedal: BB('Skills and Specials play again at 20% on the next turn.', { echoPedal: 0.2 }),
    mosh: BB('Single hits splash 15% onto the other enemies.', { splash: 0.15 }),
    dive: BB('Each knockout heals that pet 10% and fills a quarter of its turn bar.', { on: { kill: [['heal', 'self', 0, { pct: 0.1 }], ['gauge', 'self', 0.25]] } }),
    tuning: BB('Each pet heals 2.5% after each of its turns.', { on: { turn: [['heal', 'self', 0, { pct: 0.025 }]] } }),
    mute: BB('The band\'s hits have a 12% chance to Mute the target for 1 turn.', { hitSt: [['mute', 1, 0.12]] }),
    dropbeat: BB('Each knockout fills half of that pet\'s turn bar.', { on: { kill: [['gauge', 'self', 0.5]] } }),
    presence: BB('+8 Guard for the band.', { mod: { poise: 8 } }),
    counter: BB('When hit, 15% chance to hit back for 50%.', { counter: { ch: 0.15, pow: 0.5 } }),
    overdrive: BB('+22% Power for the band, but each pet loses 1.5% HP after each of its turns.', { mod: { vol: 0.22 }, on: { turn: [['recoil', 0.015]] } }),
    bassdrop: BB('Each gig starts with every enemy Power Down and Slow for 2 turns.', { on: { start: [['st', 'all', 'pdown', 2], ['st', 'all', 'sdown', 2]] } }, true),
    pyro: BB('Each gig starts with every enemy Poisoned for 3 turns.', { on: { start: [['st', 'all', 'poison', 3, { val: 0.45 }]] } }, true),
    angel: BB('A bandmate that falls gets back up with 20% HP, once per gig.', { on: { allyFall: [['revive', 0.2]] } }),
  };
  H.bandBoon = (id) => H.BAND_BOONS[id] || { d: H.BOONS[id].d, perk: H.BOONS[id].perk };

  /* Headliners, on legs 1, 3 and 5: a big change for the whole band, and a price.
     cost: foeHp / foeVol (every enemy), bossHp, sleep (what a campfire night heals), restless (turns sooner), loud (more Loud gigs), noBenefit.
     blocks: boons that would do nothing next to it, so they are no longer offered. */
  const HL = (n, d, price, icon, o) => Object.assign({ n, d, price, icon, cost: {}, blocks: [] }, o);
  H.HEADLINERS = {
    wall: HL('Wall of Sound', 'Every single hit splashes 40% onto the other enemies.', 'Enemies have 20% more HP.', 'mosh', { perk: { splash: 0.4 }, cost: { foeHp: 0.2 }, blocks: ['mosh'] }),
    pyroshow: HL('Pyro Show', 'Each gig starts with every enemy Poisoned and Off-Key for 3 turns.', 'Bosses have 35% more HP.', 'pyro', { lead: { on: { start: [['st', 'all', 'poison', 3, { val: 0.6 }], ['st', 'all', 'offkey', 3]] } }, cost: { bossHp: 0.35 } }),
    doubleenc: HL('Double Encore', 'Every third turn, each pet acts again straight away.', 'A night by the campfire heals only 20%.', 'double', { perk: { encore: 3 }, cost: { sleep: 0.2 }, blocks: ['double'] }),
    unplugged: HL('Unplugged', 'The band heals for 25% of the damage it deals.', 'The band has 15% less Power.', 'soul', { perk: { leech: 0.25, mod: { vol: -0.15 } }, blocks: ['soul'] }),
    allnighter: HL('All-Nighter', 'Skills and Specials rest 1 turn less, and the band starts every gig ready to play.', 'The crowd gets restless 12 turns sooner.', 'click', { perk: { cdCut: 1, startGauge: 0.95 }, cost: { restless: 12 }, blocks: ['opener'] }),
    surf: HL('Crowd Surfing', 'Every knockout heals the whole band 12%.', 'Enemies have 15% more Power.', 'dive', { perk: { on: { kill: [['heal', 'allies', 0, { pct: 0.12 }]] } }, cost: { foeVol: 0.15 } }),
    spotlight: HL('Spotlight', '+20% critical hit chance; critical hits deal 30% more and fill 30% of the turn bar.', 'The band has 15% less HP.', 'critfb', { perk: { mod: { crit: 0.2, critDmg: 0.3, hp: -0.15 }, critGauge: 0.3 }, blocks: ['critfb'] }),
    stagefright: HL('Stage Fright', 'Enemies start each gig Slow and Power Down for 3 turns.', 'Twice as many Loud gigs on the road.', 'hush', { lead: { on: { start: [['st', 'all', 'sdown', 3], ['st', 'all', 'pdown', 3]] } }, cost: { loud: 2 } }),
    echoes: HL('Echo Chamber', 'Skills and Specials play again at 45% on the next turn.', 'No more Benefit shows on the road.', 'pedal', { perk: { echoPedal: 0.45 }, cost: { noBenefit: 1 } }),
    finale: HL('Grand Finale', 'The band deals 70% more damage to enemies under 40% HP.', 'Enemies have 10% more HP and Power.', 'finish', { perk: { execute: { below: 0.4, bonus: 0.7 } }, cost: { foeHp: 0.1, foeVol: 0.1 }, blocks: ['finish'] }),
    roadcrew: HL('Road Crew', 'Each gig starts with a Shield of 35% HP on every pet.', 'The band has 10% less Speed.', 'shell', { perk: { mod: { tempo: -0.1 }, on: { start: [['shield', 'self', 0, { pct: 0.35 }]] } } }),
  };
  H.HEAD_ORDER = Object.keys(H.HEADLINERS);
  // all the prices so far, added up
  H.tourCost = (run) => { const c = { foeHp: 0, foeVol: 0, bossHp: 0, sleep: null, restless: 0, loud: 1, noBenefit: 0 }; for (const id of run.heads) { const k = H.HEADLINERS[id].cost; for (const x in k) c[x] = x === 'sleep' ? Math.min(c.sleep == null ? 1 : c.sleep, k[x]) : x === 'loud' ? c.loud * k[x] : c[x] + k[x]; } return c; };

  /* An ensemble on tour: on top of its usual opening, a band that forms one plays its tour version (while at least two of it play). */
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
  const legMap = (run) => { const c = H.tourCost(run); return H.roadMap(run.seed + run.leg * 7919, H.TOUR.rows, Math.min(0.7, H.TOUR.loudCh * c.loud), { restRows: H.TOUR.restRows, no: c.noBenefit ? ['benefit'] : [] }); };
  H.tourRegion = (run) => run.regions[run.leg];
  H.tourPets = (S) => (S.tourRun ? S.tourRun.band.map((id) => H.petById(S, id)).filter(Boolean) : []);
  H.tourEnsemble = (S) => { const P = H.tourPets(S); return P.length === 3 ? H.ensembleOf(P.map(H.petFamily)) : null; };
  H.tourAlive = (run) => run.band.filter((id) => run.hp[id] > 0);
  H.refreshTour = (S) => { S.tour = S.tour || { tours: 0, wins: 0, best: 0 }; return S.tour; };
  // how far a run got, as one number: six steps a leg (five gigs and the boss)
  H.tourProgress = (leg, gigs) => leg * (H.TOUR.gigs + 1) + gigs;

  const headOffer = (run, rnd) => H.shuffle(H.HEAD_ORDER.filter((id) => !run.heads.includes(id)), rnd).slice(0, 3);
  const legStart = (run, rnd) => { run.map = legMap(run); run.at = null; run.done = []; run.gigs = 0; run.pending = H.TOUR.headLegs.includes(run.leg) ? { type: 'head', opts: headOffer(run, rnd) } : null; };
  H.startTour = (S, rnd) => {
    const band = H.teamPets(S).filter(Boolean).map((p) => p.id); if (!band.length) return null;
    const seed = 1 + Math.floor(rnd() * 1e9), r2 = H.rng(seed), regions = H.shuffle(H.REGION_ORDER, r2).slice(0, H.TOUR.legs);
    const run = { seed, band, regions, leg: 0, hp: {}, boons: [], heads: [], extra: { vol: 0, hp: 0, perks: [] }, log: [], earned: 0, loot: { echo: 0, shells: 0, items: [] } };
    for (const id of band) run.hp[id] = 1;
    legStart(run, rnd); S.tourRun = run; H.refreshTour(S).tours++; return run;
  };
  H.endTour = (S) => { S.tourRun = null; };

  // a pet as it plays on this tour: its usual self, then the Headliners, the boons, the road's extras and the ensemble's tour version.
  // Headliners come first, so where a boon does the same thing the Headliner's stronger value is the one that counts.
  H.tourUnit = (S, pet, ens, lead) => {
    const run = runOf(S), u = H.buildPetUnit(pet, S.level, S), add = [];
    for (const id of run.heads) { const h = H.HEADLINERS[id]; if (h.perk) add.push(Object.assign({ n: h.n, d: h.d }, h.perk)); if (h.lead && lead) add.push(Object.assign({ n: h.n, d: h.d }, h.lead)); }
    for (const id of run.boons) { const b = H.bandBoon(id); if (!b.lead || lead) add.push(Object.assign({ n: H.BOONS[id].n, d: b.d }, b.perk)); }
    add.push(...run.extra.perks); if (run.extra.vol || run.extra.hp) add.push({ mod: { vol: run.extra.vol, hp: run.extra.hp } });
    if (ens && H.ENS_TOUR[ens]) add.push(H.ENS_TOUR[ens].perk);
    u.perks = add.concat(u.perks); return u;
  };
  H.tourMaxHp = (S, id) => { const p = H.petById(S, id); if (!p) return 1; const e = H.tourEnsemble(S), b = new H.Battle({ allies: [H.tourUnit(S, p, e ? e.id : null)], enemies: [] }); return b.units[0].max; };
  // HP is kept as a share of max; when max changes, the HP itself stays put (as far as it fits)
  const keepAll = (S, fn) => { const run = runOf(S), before = {}; for (const id of run.band) before[id] = H.tourMaxHp(S, id); fn(); for (const id of run.band) if (run.hp[id] > 0) run.hp[id] = Math.max(0.01, Math.min(1, (run.hp[id] * before[id]) / H.tourMaxHp(S, id))); };
  const healAll = (run, x) => { for (const id of run.band) if (run.hp[id] > 0) run.hp[id] = Math.min(1, run.hp[id] + x); };
  const reviveAll = (run, x) => { for (const id of run.band) if (!(run.hp[id] > 0)) run.hp[id] = x; };

  // who plays a gig: the band's level, how far into the tour, and what kind of stop
  H.tourStage = (S, node) => {
    const run = runOf(S), T = H.TOUR, region = H.tourRegion(run), R = H.REGIONS[region], L = Math.max(1, S.level), rnd = H.rng(run.seed * 13 + run.leg * 977 + node.id * 101), g = run.gigs + 1, type = node.type;
    const k = T.k * T.legK[run.leg] * (1 + T.ramp * (g - 1)), din = (kk) => ({ id: R.din[Math.floor(rnd() * R.din.length)], lvl: L, k: kk });
    let enemies;
    if (type === 'boss') enemies = [{ id: R.boss, lvl: L, k: k * T.bossK }].concat(R.adds.map((a) => ({ id: a, lvl: L, k })));
    else if (type === 'battle') enemies = H.rivalBand(3, L, k * T.battleK, rnd);
    else if (type === 'benefit') enemies = [0, 1, 2].map(() => din(k * T.benefitK));
    else enemies = [0, 1, 2].map(() => din(type === 'loud' ? k * T.loudK : k)).sort((a, b) => (H.DIN_FRONT[a.id] || 0) - (H.DIN_FRONT[b.id] || 0)).map((e, i) => Object.assign(e, { loud: type === 'loud' && i === 0 }));
    return { n: g, leg: run.leg, region, boss: type === 'boss', elite: type === 'loud' || type === 'battle', kind: type, level: L, enemies, tour: true, name: type === 'boss' ? 'Tour · boss' : 'Tour · gig ' + g };
  };
  H.startTourBattle = (S, rnd) => {
    const run = runOf(S), st = H.tourStage(S, run.map[run.at]), ens = H.tourEnsemble(S), alive = H.tourAlive(run), c = H.tourCost(run), on = ens && alive.length >= 2 ? ens.id : null;
    for (const e of st.enemies) if (!e.pet) S.dinSeen[e.id] = 1;
    const lead = alive[0];
    const allies = run.band.map((id) => { const p = H.petById(S, id); return p && run.hp[id] > 0 ? H.tourUnit(S, p, on, id === lead) : null; });
    const enemies = st.enemies.map((e) => { const u = H.foeUnit(e), hp = c.foeHp + (u.boss ? c.bossHp : 0); if (hp || c.foeVol) u.perks = u.perks.concat([{ mod: { hp, vol: c.foeVol } }]); return u; });
    const b = new H.Battle({ allies, enemies, rng: rnd, ensemble: on, rules: { restless: { from: H.TOUR.restless.from - c.restless, per: H.TOUR.restless.per } } });
    for (const u of b.units) if (u.side === 0 && u.petId != null) u.hp = Math.max(1, Math.round(u.max * run.hp[u.petId]));
    return b;
  };

  // boons the band can still be offered: rares and boons that do not add up come once; a Headliner can make a boon pointless
  const offer = (run, src, rnd) => { const blocked = [].concat(...run.heads.map((id) => H.HEADLINERS[id].blocks)); return H.boonOffer(run, src, rnd, 'tour', run.boons.concat(blocked)); };
  H.tourOffer = offer;

  // stepping onto a stop: what it asks of you next
  H.tourEnter = (S, id, rnd) => {
    const run = runOf(S), node = run.map[id]; if (!node || run.pending || !H.soloReach(run).some((n) => n.id === id)) return null;
    run.at = id; run.done.push(id);
    if (H.isFight(node.type)) run.pending = { type: 'battle' };
    else if (node.type === 'rest') run.pending = { type: 'rest' };
    else if (node.type === 'jam') run.pending = { type: 'boon', src: 'jam', opts: offer(run, 'jam', rnd) };
    else { const r2 = H.rng(run.seed * 31 + run.leg * 53 + id), seen = run.log.filter((x) => x.ev && x.leg === run.leg).map((x) => x.ev), pool = H.EVENT_ORDER.filter((e) => !seen.includes(e)); run.pending = { type: 'event', ev: pool[Math.floor(r2() * pool.length)] || 'crowd' }; }
    return run.pending;
  };

  // after a fight: HP is noted, notes are paid and the stop gives what it promised. A boss pays an echo and equipment and the tour moves on.
  H.finishTour = (S, win, battle, rnd) => {
    const run = runOf(S), node = run.map[run.at], T = H.TOUR, P = H.refreshTour(S), type = node.type, boss = type === 'boss', side = type === 'benefit' || type === 'battle';
    const out = { tour: true, win, leg: run.leg, boss, loud: type === 'loud', kind: type, gig: run.gigs + (win && !boss && !side ? 1 : 0), notes: 0, echo: 0, shells: 0, item: null, legend: null, region: H.tourRegion(run), band: run.band.slice() };
    if (!win) { out.reached = { leg: run.leg, gigs: run.gigs }; P.best = Math.max(P.best, H.tourProgress(run.leg, run.gigs)); out.total = run.earned; out.loot = run.loot; S.tourRun = null; return out; }
    if (battle) for (const u of battle.units) if (u.side === 0 && u.petId != null) run.hp[u.petId] = u.alive ? Math.max(0.01, u.hp / u.max) : 0;
    if (boss) {
      out.echo = H.addEchoes(S, 1); out.item = H.rollItem(S, rnd, 'boss'); run.loot.echo += out.echo; run.loot.items.push(out.item.id);
      P.best = Math.max(P.best, H.tourProgress(run.leg + 1, 0));
      if (run.leg === T.legs - 1) {
        out.shells = 1; S.shells += 1;
        // the last boss: a Legendary while there are any left to find, otherwise more shells and echoes
        if (H.freeLegends(S).length) { out.legend = H.rollLegend(S, rnd); run.loot.items.push(out.legend.id); } else { out.shells += 2; S.shells += 2; out.echo += H.addEchoes(S, 2); run.loot.echo += 2; }
        run.loot.shells += out.shells; out.done = true; P.wins++; S.stats.tourWins = (S.stats.tourWins || 0) + 1; out.total = run.earned; out.loot = run.loot; S.tourRun = null; return out;
      }
      out.revived = run.band.filter((id) => !(run.hp[id] > 0)).length; reviveAll(run, T.bossRevive);
      run.leg++; legStart(run, rnd); out.nextLeg = run.leg; out.head = !!run.pending;
      return out;
    }
    out.notes = T.notes; run.earned += out.notes; S.notes += out.notes;
    if (type === 'benefit') { out.revived = run.band.filter((id) => !(run.hp[id] > 0)).length; reviveAll(run, T.benefitRevive); healAll(run, T.benefitHeal); out.heal = T.benefitHeal; run.pending = null; return out; }
    if (type === 'battle') { out.echo = H.addEchoes(S, 1); run.loot.echo += 1; run.pending = { type: 'boon', src: 'r', opts: offer(run, 'r', rnd) }; return out; }
    run.gigs++; P.best = Math.max(P.best, H.tourProgress(run.leg, run.gigs));
    run.pending = { type: 'boon', src: out.loud ? 'loud' : 'gig', opts: offer(run, out.loud ? 'loud' : 'gig', rnd) };
    return out;
  };
  H.tourPick = (S, id) => { const run = runOf(S); if (!run || !run.pending || run.pending.type !== 'boon') return false; if (id && run.pending.opts.includes(id)) { keepAll(S, () => run.boons.push(id)); run.log.push({ boon: id }); } run.pending = null; return true; };
  // a Headliner, then the leg's road is drawn again with its price in it
  H.tourHead = (S, id, rnd) => { const run = runOf(S); if (!run || !run.pending || run.pending.type !== 'head' || !run.pending.opts.includes(id)) return false; keepAll(S, () => run.heads.push(id)); run.log.push({ head: id }); run.pending = null; if (run.at == null) run.map = legMap(run); return true; };
  // the campfire: sleep (everyone heals, the fallen get back up) or practise (the band gets stronger)
  H.tourSleep = (run) => { const c = H.tourCost(run); return c.sleep == null ? H.TOUR.rest : c.sleep; };
  H.tourRest = (S, choice) => {
    const run = runOf(S); if (!run || !run.pending || run.pending.type !== 'rest') return false;
    if (choice === 'nap') { const x = H.tourSleep(run); reviveAll(run, Math.min(H.TOUR.revive, x)); healAll(run, x); }
    else keepAll(S, () => (run.extra.vol += H.TOUR.practise));
    run.log.push({ rest: choice }); run.pending = null; return true;
  };
  // a mystery's choice works on the whole band
  H.tourEvent = (S, i, rnd) => {
    const run = runOf(S); if (!run || !run.pending || run.pending.type !== 'event') return null;
    const ev = run.pending.ev, o = H.EVENTS[ev].opts[i]; if (!o) return null;
    run.log.push({ ev, opt: i, leg: run.leg }); run.pending = null;
    const give = (id) => { keepAll(S, () => run.boons.push(id)); return id; };
    const got = H.roadFx(o.fx, {
      boost: (vol, hp) => keepAll(S, () => { run.extra.vol += vol; run.extra.hp += hp; }),
      perk: (p) => run.extra.perks.push(p),
      revive: (x) => reviveAll(run, x),
      hurt: (x) => { for (const id of run.band) if (run.hp[id] > 0) run.hp[id] = Math.max(0.01, run.hp[id] - x); },
      heal: (x) => healAll(run, x),
      boon: (rar) => { const o2 = offer(run, rar, rnd); return o2[0] ? give(o2[0]) : null; },
      dupe: () => { const have = run.boons.filter((id) => H.BOONS[id].stack); return have.length ? give(have[Math.floor(rnd() * have.length)]) : null; },
      pick: (rar) => (run.pending = { type: 'boon', src: rar, opts: offer(run, rar, rnd) }),
    }, rnd);
    got.ev = ev; got.opt = i; if (got.boons.length) got.boon = got.boons[0];
    return got;
  };
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
