/* Hushsong — two more ways to play. No DOM.
   Daily Gig: one battle a day with a house rule that changes how battles work; the date picks it, so it is the same for everyone.
   Solo: a short tour with a single pet along a branching road: five gigs, stops in between, a boss at the end, and boons that stack up. */
(function (H) {
  'use strict';
  const DAY = 86400000, now = () => Date.now();

  /* ================= Daily Gig ================= */
  // k: how tough the Din are for that rule (tuned by test/modes.js so every rule is about as winnable as the others)
  H.DAILY = { unlock: 5, notes: 20, k: 1, loud: true };
  H.TWISTS = {
    mirror: { n: 'Mirror Match', d: 'The Din copy your band, move for move.', k: 1.12 },
    potato: { n: 'Hot Potato', d: 'A ticking potato passes on with every single hit. When its fuse runs out, whoever holds it loses 30% HP.', rules: { potato: { every: 5, pct: 0.3 } }, k: 1.0 },
    key: { n: 'Key Change', d: 'Every 6 turns, everyone moves one step round the family loop.', rules: { keyChange: 6 }, k: 1.0 },
    volume: { n: 'Volume Knob', d: 'Hits start at half strength and grow louder every 2 turns, up to 250%.', rules: { volume: { start: 0.5, per: 0.1, every: 2, max: 2.5 } }, k: 1.0 },
    backwards: { n: 'Backwards Tempo', d: 'Slow is fast: the lowest Speed acts most often.', rules: { backwards: true }, k: 1.0 },
    shared: { n: 'Shared Stage', d: 'Each hit is split evenly across its target\'s whole side.', rules: { share: true }, k: 1.05 },
    chain: { n: 'Chain Reaction', d: 'Whoever falls bursts: the rest of its side loses 20% of max HP.', rules: { chain: 0.2 }, k: 1.0 },
    giant: { n: 'Giant Slayer', d: 'One giant boss. Each quarter of its HP knocked off stuns it and leaves it Off-Key.', k: 1.0 },
    duet: { n: 'Duet', d: 'Only your first two pets play. Each move is joined by the other\'s Basic move at 60%.', rules: { duet: 0.6 }, k: 0.8 },
    swap: { n: 'Swapped Kits', d: 'Each pet plays with the moves of the pet beside it.', k: 1.0 },
    mic: { n: 'Pass the Mic', d: 'Only the mic holder can use Skills and Specials, always ready and faster. The mic moves on each turn.', rules: { mic: { tempo: 1.4 } }, k: 1.0 },
    echo: { n: 'Echo Chamber', d: 'Skills and Specials play again at half strength on the user\'s next turn.', rules: { echo: 0.5 }, k: 1.0 },
    lastcall: { n: 'Last Call', d: 'Win within 45 turns, counting everyone\'s.', rules: { lastCall: 45 }, k: 0.85 },
    nobasics: { n: 'No Basics', d: 'Basic moves become Feedback: a 130% hit that costs the user 8% of its max HP.', rules: { noBasics: true }, k: 1.0 },
  };
  H.TWIST_ORDER = Object.keys(H.TWISTS);
  // one venue per region
  H.VENUES = { fen: 'The Lily Pad', works: 'The Anvil Room', orchard: 'Hive Bandstand', ridge: 'Summit Lodge', road: 'The Crossroads', caves: 'The Echo Pit', dunes: 'Oasis Stage', harbor: 'Pier Nine', tower: 'The Clock Loft', hall: 'The Velvet Box' };
  const order14 = (cyc) => H.shuffle(H.TWIST_ORDER, H.rng(cyc * 977 + 5));
  // The twist for a day: every rule once in each fortnight, never the same two days running.
  H.twistOf = (day) => { const cyc = Math.floor(day / 14), o = order14(cyc); if (o[0] === order14(cyc - 1)[13]) [o[0], o[1]] = [o[1], o[0]]; return o[day - cyc * 14]; };
  H.gigOf = (day) => { const rnd = H.rng(day * 131 + 17), region = H.REGION_ORDER[Math.floor(rnd() * 10)]; return { day, twist: H.twistOf(day), region, venue: H.VENUES[region], seed: Math.floor(rnd() * 1e9) }; };
  H.dailyOpen = (S) => S.level >= H.DAILY.unlock;
  H.refreshDaily = (S, ms) => { const d = H.dayOf(ms == null ? now() : ms); if (S.daily && S.daily.day === d) return false; S.daily = { day: d, won: 0, tries: 0 }; return true; };
  H.dailyStatus = (S, ms) => { H.refreshDaily(S, ms); return Object.assign(H.gigOf(S.daily.day), { won: !!S.daily.won, tries: S.daily.tries }); };
  // the band that plays: the whole band, or its first two for a Duet
  H.dailyBand = (S, twist) => { const T = H.teamPets(S).filter(Boolean); return twist === 'duet' ? T.slice(0, 2) : T; };
  // Who plays tonight. Enemies stand at your level; the lead one is Loud.
  H.dailyStage = (S, ms) => {
    const g = H.dailyStatus(S, ms), T = H.TWISTS[g.twist], R = H.REGIONS[g.region], rnd = H.rng(g.seed), L = Math.max(1, S.level), k = H.DAILY.k * (T.k || 1);
    let enemies;
    if (g.twist === 'mirror') enemies = H.dailyBand(S, g.twist).map((p) => ({ id: p.form, lvl: L, pet: true, k }));
    else if (g.twist === 'giant') enemies = [{ id: R.boss, lvl: L, k, giant: true }];
    else { const ids = [0, 1, 2].map(() => R.din[Math.floor(rnd() * R.din.length)]).sort((a, b) => (H.DIN_FRONT[a] || 0) - (H.DIN_FRONT[b] || 0)); enemies = ids.map((id, i) => ({ id, lvl: L, k, loud: H.DAILY.loud && i === 0, hp: T.hp, vol: T.vol })); }
    return Object.assign(g, { level: L, enemies, rules: T.rules || {}, boss: g.twist === 'giant', name: g.venue });
  };
  // Swapped Kits: each pet takes the moves (and passive) of the pet to its right
  const swapKits = (specs) => {
    const live = specs.filter(Boolean); if (live.length < 2) return specs;
    const kits = live.map((s) => ({ kit: s.kit, passive: s.kit.passive || null }));
    live.forEach((s, i) => { const o = kits[(i + 1) % live.length], own = s.kit.passive; s.perks = s.perks.filter((p) => p !== own); if (o.passive) s.perks.unshift(o.passive); s.kit = o.kit; s.swapped = true; });
    return specs;
  };
  H.MIRROR = { hp: 0.9, vol: 0.85 };
  H.GIANT = { hp: 2.0, vol: 1.15, steps: [0.75, 0.5, 0.25] };
  H.dailyFoe = (e) => {
    // a mirror is your own pet at your level without its equipment or stars, a little softer
    if (e.pet) { const u = H.buildPetUnit({ form: e.id, rank: 0, gear: [] }, e.lvl), m = H.MIRROR; u.base = Object.assign({}, u.base, { hp: u.base.hp * m.hp * e.k, vol: u.base.vol * m.vol * e.k }); u.name = H.T('Mirror {pet}', { pet: H.FORMS[e.id].n }); u.mirror = true; u.role = 'din'; return u; }
    const u = H.buildDinUnit(e.id, e.lvl, e.loud, null, e.k); if (e.hp || e.vol) u.base = Object.assign({}, u.base, { hp: u.base.hp * (e.hp || 1), vol: u.base.vol * (e.vol || 1) });
    if (e.giant) { u.base = Object.assign({}, u.base, { hp: u.base.hp * H.GIANT.hp, vol: u.base.vol * H.GIANT.vol }); u.giant = H.GIANT.steps; u.name = H.T('Giant {din}', { din: H.DIN[e.id].n }); u.perks = u.perks.filter((p) => p !== H.SWELL); }
    return u;
  };
  H.startDaily = (S, rnd, ms) => {
    const st = H.dailyStage(S, ms), band = H.dailyBand(S, st.twist); S.daily.tries++;
    let allies = band.map((p) => H.buildPetUnit(p, S.level, S)); if (st.twist === 'swap') allies = swapKits(allies);
    for (const e of st.enemies) if (!e.pet) S.dinSeen[e.id] = 1;
    const ens = band.length === 3 ? H.teamEnsemble(S) : null;
    return new H.Battle({ allies, enemies: st.enemies.map(H.dailyFoe), rng: rnd, ensemble: ens ? ens.id : null, rules: st.rules });
  };
  // A win pays 50 notes the first time each day. Only Adventure gives experience.
  H.finishDaily = (S, win, battle) => {
    H.refreshDaily(S); const g = H.gigOf(S.daily.day), out = { daily: true, win, twist: g.twist, venue: g.venue, region: g.region, notes: 0, xp: 0, ups: 0, first: false };
    if (win && (!H.GATES || !S.daily.won)) { S.daily.won = 1; out.first = true; out.notes = H.DAILY.notes; S.notes += out.notes; S.stats.daily = (S.stats.daily || 0) + 1; }
    return out;
  };
  H.msToTomorrow = (ms) => { ms = ms == null ? now() : ms; return (H.dayOf(ms) + 1) * DAY + new Date(ms).getTimezoneOffset() * 60000 - ms; };

  /* ================= Solo ================= */
  // rows: what each step of the road offers. g: a gig (or a Loud gig), s: a stop (rest, jam session or mystery), b: the boss.
  H.SOLO = {
    unlock: 10, refLv: 14, gigNotes: 10, bossNotes: 10, rows: ['g', 's', 'g', 's', 'g', 's', 'g', 's', 'g', 'b'], loudCh: 0.4,
    rest: 0.4, practise: 0.1, restless: { from: 30, per: 0.06 },
    // how tough the Din are: per gig (the first to the fifth), for a Loud gig, the boss, and by how grown the pet is
    k: 0.33, ramp: 0.12, loudK: 1.15, bossK: 0.92, count: [2, 2, 2, 2, 2], tierK: [1, 1.36, 1.65], roleK: { stray: 1, rhythm: 1, lead: 1.05, harmony: 1, bass: 0.92 },
  };
  H.soloOpen = (S) => S.level >= H.SOLO.unlock;
  // Each pet's own fine-tuning on top of its growth and role, so that every pet makes about as good a soloist (fitted by test/modes.js fit)
  H.SOLO_FORM = { thud: 1, stomp: 1.04, march: 0.98, cadence: 1.03, patter: 0.82, jig: 0.86, roll: 0.98, clack: 1.1, click: 1.06, flamenco: 1.11, tango: 1.1, rattle: 0.9, rumba: 0.88, samba: 1.02, twang: 1.09, pluck: 1.14, riff: 1.12, shred: 1.14, strum: 1.3, ballad: 1.11, waltz: 1.13, screech: 0.93, saw: 1.15, reel: 1.15, lament: 1.03, quaver: 1.1, nocturne: 1.01, caprice: 1.09, hum: 1.11, drone: 1.12, dirge: 1.1, chorale: 1.03, whistle: 1.06, carol: 0.93, lullaby: 1.08, squeak: 1.06, wheeze: 1.23, polka: 1.74, shanty: 1.23, trill: 1.24, scherzo: 1.26, cadenza: 1.42, blare: 0.86, bellow: 0.68, fanfare: 0.66, anthem: 0.64, toot: 1.01, swing: 1.24, reveille: 0.95, clang: 0.96, toll: 0.75, knell: 0.85, peal: 0.66, jingle: 0.98, carillon: 0.95, gamelan: 0.84, yelp: 0.88, croon: 0.76, serenade: 0.76, hymn: 0.8, shout: 0.93, chant: 0.85, aria: 0.93, howl: 0.94, growl: 1.28, blues: 1.78, grunge: 1.58, bay: 0.9, round: 0.89, requiem: 0.97, bong: 1.1, clash: 1.12, tamtam: 1.23, thunder: 0.95, ripple: 1.03, shimmer: 0.98, quake: 0.91, tock: 1.11, marimba: 0.94, vibes: 1.07, kalimba: 1.02, chime: 1.01, celesta: 1, glock: 1.1, tink: 1.17, carousel: 0.99, gavotte: 0.98, reverie: 1.16, windup: 1.29, toccata: 1.7, ostinato: 1.19, wah: 0.84, plunger: 0.83, ska: 0.85, dixie: 0.88, cornet: 0.9, mariachi: 0.92, mambo: 1.01, thrum: 1.11, upright: 1.11, slap: 1.02, basso: 1.01, arco: 1.07, sostenuto: 0.93, fugue: 1.06, doo: 0.95, chorus: 0.94, cantata: 0.9, madrigal: 1.02, doowop: 1.02, gospel: 1.06, plainsong: 1.06, huff: 0.99, busker: 1, delta: 1.07, juke: 1.1, chromatic: 0.96, mistral: 0.89, sirocco: 0.92, jangle: 1.04, bluegrass: 1.19, picker: 1.23, duel: 1.19, folk: 1.14, jamboree: 1.1, lonesome: 1.12, plink: 0.97, ragtime: 0.95, boogie: 1.11, stride: 0.98, sonata: 1.18, concerto: 1.16, minuet: 1.33, peep: 0.89, piper: 0.95, pied: 0.91, syrinx: 0.92, fife: 0.95, piccolo: 1.08, zephyr: 0.95, skirl: 0.95, highland: 1.05, pibroch: 1.06, tattoo: 0.97, bellows: 0.92, clan: 0.92, keening: 0.99, oompah: 0.86, sousa: 0.95, helicon: 1.19, bombard: 0.88, baritone: 0.96, subsonic: 0.99, tubby: 1.08, bop: 1.03, bebop: 1.15, hardbop: 1.22, cool: 1.23, smooth: 1.3, soul: 1.19, lounge: 1.25, warble: 1.02, shellac: 0.96, vinyl: 1.01, jukebox: 0.92, diva: 0.79, opera: 0.86, cabaret: 0.87, chatter: 0.97, shortwave: 0.91, longwave: 0.86, pirate: 0.91, deejay: 0.74, mixtape: 0.83, broadcast: 0.95 };

  /* boons: picked along the road, kept for the tour. Common ones can be taken twice; rare ones once. */
  const B = (n, r, d, perk) => ({ n, r, d, perk: Object.assign({ n, d }, perk) });
  H.BOONS = {
    amp: B('Bigger Amp', 'c', '+20% Power.', { mod: { vol: 0.2 } }),
    case: B('Padded Case', 'c', '+25% HP.', { mod: { hp: 0.25 } }),
    quick: B('Quick Fingers', 'c', '+15% Speed.', { mod: { tempo: 0.15 } }),
    pitch: B('Sweet Spot', 'c', '+12% critical hit chance, and critical hits deal 25% more.', { mod: { crit: 0.12, critDmg: 0.25 } }),
    shell: B('Hard Shell', 'c', '+12 Guard. Starts each gig with a Shield of 20% of its HP.', { mod: { poise: 12 }, on: { start: [['shield', 'self', 0, { pct: 0.2 }]] } }),
    soul: B('Soul Song', 'c', 'Heals for 15% of the damage it deals.', { leech: 0.15 }),
    sour: B('Sour Notes', 'c', 'Its hits Poison for 2 turns.', { hitSt: [['poison', 2, 1, 0.25]] }),
    wrong: B('Wrong Chord', 'c', 'Its hits have a 50% chance to make the target Off-Key for 2 turns.', { hitSt: [['offkey', 2, 0.5]] }),
    opener: B('Opening Act', 'c', 'Goes first in each gig, and its first hit deals 40% more.', { startGauge: 0.99, firstStrike: 0.4 }),
    spiky: B('Spiky Riff', 'c', 'Enemies that hit it take 25% of that damage back.', { thorns: 0.25 }),
    hype: B('Hype Man', 'c', 'Starts each gig with Power Up and Speed Up for 2 turns.', { on: { start: [['st', 'self', 'pup', 2], ['st', 'self', 'sup', 2]] } }),
    hush: B('Quiet Please', 'c', 'Enemies start each gig Slow for 2 turns.', { on: { start: [['st', 'all', 'sdown', 2]] } }),
    cresc: B('Crescendo', 'c', '+4% Power every turn of a gig, up to +40%.', { ramp: { on: 'turn', per: 0.04, max: 0.4 } }),
    overflow: B('Overflow', 'r', 'Healing past full HP turns into Shield.', { overheal: true }),
    lifeloop: B('Lifesong Loop', 'r', 'Starts each gig with Lifesong for 3 turns. Each knockout adds 2.', { on: { start: [['st', 'self', 'lifesong', 3]], kill: [['st', 'self', 'lifesong', 2]] } }),
    click: B('Click Track', 'r', 'Skills and Specials rest 1 turn less (never less than 1).', { cdCut: 1 }),
    double: B('Double Time', 'r', 'Every third turn it acts again straight away.', { encore: 3 }),
    maestro: B('Venom Maestro', 'r', 'Deals 40% more damage to Poisoned targets and 30% more to Off-Key ones.', { vs: { poison: 0.4, offkey: 0.3 } }),
    critfb: B('Crit Feedback', 'r', 'Critical hits fill 35% of its turn bar.', { critGauge: 0.35 }),
    glass: B('Glass Cannon', 'r', '+45% Power, but 30% less HP.', { mod: { vol: 0.45, hp: -0.3 } }),
    second: B('Second Wind', 'r', 'Once per gig, survives a knockout on 1 HP and heals 30%.', { lastStand: true, on: { stand: [['heal', 'self', 0, { pct: 0.3 }]] } }),
    finish: B('Big Finish', 'r', 'Deals 60% more damage to enemies under 35% HP.', { execute: { below: 0.35, bonus: 0.6 } }),
    pedal: B('Echo Pedal', 'r', 'Its Skills and Specials play again at 40% on its next turn.', { echoPedal: 0.4 }),
    mosh: B('Mosh Pit', 'r', 'Single hits splash 30% onto the other enemies.', { splash: 0.3 }),
    dive: B('Stage Dive', 'r', 'Every knockout heals 20% and fills half its turn bar.', { on: { kill: [['heal', 'self', 0, { pct: 0.2 }], ['gauge', 'self', 0.5]] } }),
  };
  H.BOON_ORDER = Object.keys(H.BOONS);
  // pairs that are better together; the boon cards point them out
  H.COMBOS = [
    ['overflow', 'soul', 'every hit tops up a Shield'], ['overflow', 'lifeloop', 'every hit tops up a Shield'], ['overflow', 'dive', 'knockouts top up a Shield'],
    ['click', 'double', 'Skills come round very fast'], ['click', 'pedal', 'more echoes, more often'], ['pedal', 'sour', 'echoes poison again'], ['pedal', 'wrong', 'echoes put Off-Key back on'],
    ['sour', 'maestro', 'hits on Poisoned foes land 40% harder'], ['wrong', 'maestro', 'Off-Key foes take a lot more'], ['pitch', 'critfb', 'crits bring the next turn closer'],
    ['glass', 'second', 'big hits with a safety net'], ['glass', 'shell', 'big hits behind a Shield'], ['spiky', 'shell', 'hard to hit, painful to hit'], ['cresc', 'double', 'grows louder twice as fast'], ['finish', 'dive', 'finish them off, heal up'], ['opener', 'hype', 'a flying start'],
  ];
  H.combosOf = (id, have) => H.COMBOS.filter((c) => (c[0] === id && have.includes(c[1])) || (c[1] === id && have.includes(c[0]))).map((c) => ({ with: c[0] === id ? c[1] : c[0], d: c[2] }));
  H.activeCombos = (have) => H.COMBOS.filter((c) => have.includes(c[0]) && have.includes(c[1]));

  /* mystery stops: two choices, each a trade */
  H.EVENTS = {
    busker: { n: 'A street busker', d: 'A busker with a battered guitar offers to swap songs.', opts: [{ n: 'Swap songs', d: 'Lose 20% HP. Take a random rare boon.', fx: { hurt: 0.2, rare: 1 } }, { n: 'Clap along', d: 'Heal 10%.', fx: { heal: 0.1 } }] },
    shrine: { n: 'An old tuning shrine', d: 'A ring of humming stones. The air feels in tune.', opts: [{ n: 'Rest a while', d: 'Heal 50%.', fx: { heal: 0.5 } }, { n: 'Tune up', d: '+12% Power for this tour. Lose 10% HP.', fx: { vol: 0.12, hurt: 0.1 } }] },
    fan: { n: 'A fan with a gift', d: 'Someone in a homemade T-shirt waves you over.', opts: [{ n: 'Take the scarf', d: '+20% HP for this tour.', fx: { hp: 0.2 } }, { n: 'Take the snack', d: 'Heal 35%.', fx: { heal: 0.35 } }] },
    amp: { n: 'A humming amp', d: 'An amp sits in the grass, plugged into nothing, buzzing anyway.', opts: [{ n: 'Plug in', d: '+25% Power, but 15% less HP for this tour.', fx: { vol: 0.25, hp: -0.15 } }, { n: 'Leave it', d: 'Nothing happens.', fx: {} }] },
    crate: { n: 'A crate of old records', d: 'Dusty sleeves, some of them still sealed.', opts: [{ n: 'Dig through', d: 'Pick 1 of 3 common boons. Lose 10% HP.', fx: { hurt: 0.1, pick: 'c' } }, { n: 'Grab one blind', d: 'A random common boon.', fx: { common: 1 } }] },
    crowd: { n: 'A crowd wants a song', d: 'A little crowd has gathered and starts to chant.', opts: [{ n: 'Play for them', d: '+8% Power for this tour. Heal 15%.', fx: { vol: 0.08, heal: 0.15 } }, { n: 'Take a bow', d: 'Heal 25%.', fx: { heal: 0.25 } }] },
  };
  H.EVENT_ORDER = Object.keys(H.EVENTS);

  /* the road: ten rows of up to three lanes; each stop links to the ones ahead of it in the same or a next-door lane */
  H.soloMap = (seed) => {
    const rnd = H.rng(seed * 7 + 3), nodes = [], rows = [];
    H.SOLO.rows.forEach((kind, r) => {
      if (kind === 'b') { const b = { id: nodes.length, r, l: 1, type: 'boss', x: 0.5, dy: 0 }; nodes.push(b); rows.push([b]); return; }
      // stop rows sometimes have only two stops, so the road narrows and widens
      const lanes = kind === 's' && rnd() < 0.35 ? H.shuffle([0, 1, 2], rnd).slice(0, 2).sort() : [0, 1, 2];
      let types;
      if (kind === 'g') { types = lanes.map(() => (r > 0 && rnd() < H.SOLO.loudCh ? 'loud' : 'gig')); if (!types.includes('gig')) types[Math.floor(rnd() * types.length)] = 'gig'; }
      else { types = H.shuffle(['rest', 'jam', 'mystery'], rnd).slice(0, lanes.length); if (r === 7 && !types.includes('rest')) types[Math.floor(rnd() * types.length)] = 'rest'; }   // a chance to rest before the last gig
      rows.push(lanes.map((l, i) => { const n = { id: nodes.length, r, l, type: types[i], x: 0.18 + l * 0.32 + (rnd() - 0.5) * 0.1, dy: Math.round((rnd() - 0.5) * 10) }; nodes.push(n); return n; }));
    });
    // roads: each stop leads on to one or two of the stops ahead in the same or a next-door lane; every stop can be reached; roads never cross
    for (let r = 0; r < rows.length - 1; r++) {
      const A = rows[r], B = rows[r + 1], at = (row, l) => row.find((n) => n.l === l), link = (a, b) => { if (!a.next.includes(b.id)) a.next.push(b.id); };
      A.forEach((a) => (a.next = []));
      if (B[0].type === 'boss') { A.forEach((a) => link(a, B[0])); continue; }
      const crosses = (a, b) => { const c = at(A, b.l); return b.l !== a.l && c && c.next.some((k) => nodes[k].l === a.l); };
      for (const a of A) { const v = at(B, a.l); if (v && rnd() < 0.7) link(a, v); const d = at(B, a.l + (rnd() < 0.5 ? -1 : 1)); if (d && rnd() < 0.55 && !crosses(a, d)) link(a, d); }
      const tryLink = (a, b) => { if (!crosses(a, b)) { link(a, b); return true; } return false; };
      for (const a of A) if (!a.next.length) { const v = at(B, a.l); if (v) link(a, v); else B.filter((b) => Math.abs(b.l - a.l) === 1).some((b) => tryLink(a, b)); }
      for (const b of B) if (!A.some((a) => a.next.includes(b.id))) { const v = at(A, b.l); if (v) link(v, b); else A.filter((a) => Math.abs(a.l - b.l) === 1).some((a) => tryLink(a, b)); }
    }
    rows[rows.length - 1][0].next = [];
    return nodes;
  };
  const runOf = (S) => S.soloRun;
  H.soloNode = (run, id) => run.map[id];
  H.soloReach = (run) => (run.at == null ? run.map.filter((n) => n.r === 0) : run.map[run.at].next.map((id) => run.map[id]));
  H.soloGigsWon = (run) => run.gigs;
  H.soloPet = (S) => (S.soloRun ? H.petById(S, S.soloRun.pet) : null);
  H.refreshSolo = (S, ms) => { const d = H.dayOf(ms == null ? now() : ms), P = (S.solo = S.solo || { day: d, gigs: 0, boss: 0, best: 0, tours: 0, wins: 0 }); if (P.day === d) return false; P.day = d; P.gigs = 0; P.boss = 0; return true; };
  // what is still to be earned today: the first five gig wins and the first boss win of the day pay
  H.soloPaidLeft = (S) => { H.refreshSolo(S); if (!H.GATES) return 6; return Math.max(0, 5 - S.solo.gigs) + (S.solo.boss ? 0 : 1); };
  H.startSolo = (S, petId, rnd) => {
    const seed = 1 + Math.floor(rnd() * 1e9), r2 = H.rng(seed), region = H.REGION_ORDER[Math.floor(r2() * 10)];
    S.soloRun = { seed, pet: petId, region, map: H.soloMap(seed), at: null, done: [], hp: 1, boons: [], extra: { vol: 0, hp: 0 }, gigs: 0, pending: null, log: [] };
    H.refreshSolo(S); S.solo.tours++; return S.soloRun;
  };
  H.endSolo = (S) => { S.soloRun = null; };
  // the pet as it plays this tour: its usual self, plus boons and the tour's extras
  H.soloUnit = (S) => {
    const run = runOf(S), pet = H.petById(S, run.pet), u = H.buildPetUnit(pet, S.level, S);
    u.perks = u.perks.concat(run.boons.map((id) => H.BOONS[id].perk)); if (run.extra.vol || run.extra.hp) u.perks.push({ mod: { vol: run.extra.vol, hp: run.extra.hp } });
    return u;
  };
  H.soloMaxHp = (S) => { const b = new H.Battle({ allies: [H.soloUnit(S)], enemies: [] }); return b.units[0].max; };
  // enemies on the road scale with the pet: its level, how far it has evolved, and its role
  H.soloK = (S, pet) => { const f = H.FORMS[pet.form], role = H.kitOf(pet.form).role; return H.SOLO.k * H.SOLO.tierK[f.tier] * (H.SOLO.roleK[role] || 1) * (H.SOLO_FORM[pet.form] || 1); };
  H.soloStage = (S, node) => {
    const run = runOf(S), pet = H.petById(S, run.pet), R = H.REGIONS[run.region], L = Math.max(1, S.level), rnd = H.rng(run.seed * 13 + node.id * 101), g = run.gigs + 1;
    const k = H.soloK(S, pet) * (1 + H.SOLO.ramp * (g - 1));
    let enemies;
    if (node.type === 'boss') enemies = [{ id: R.boss, lvl: L, k: k * H.SOLO.bossK }];
    else {
      const n = H.SOLO.count[Math.min(4, g - 1)], ids = [];
      for (let i = 0; i < n; i++) ids.push(R.din[Math.floor(rnd() * R.din.length)]);
      ids.sort((a, b) => (H.DIN_FRONT[a] || 0) - (H.DIN_FRONT[b] || 0));
      enemies = ids.map((id, i) => ({ id, lvl: L, k: node.type === 'loud' ? k * H.SOLO.loudK : k, loud: node.type === 'loud' && i === 0 }));
    }
    return { n: g, region: run.region, boss: node.type === 'boss', elite: node.type === 'loud', level: L, enemies, solo: true, name: node.type === 'boss' ? 'Solo · boss' : 'Solo · gig ' + g };
  };
  // The Din's extra growth curve stands in for a whole band's gear, stars and third pet. One pet alone does not get that,
  // so on the road it is taken out again (measured from level 14, where the numbers were tuned).
  const curve = (L) => { const m = H.dinMult(L); return { hp: m, vol: 1 + (m - 1) * 0.45 }; };
  H.soloFoe = (e) => { const u = H.foeUnit(e), c = curve(e.lvl), c0 = curve(H.SOLO.refLv); u.base = Object.assign({}, u.base, { hp: (u.base.hp * c0.hp) / c.hp, vol: (u.base.vol * c0.vol) / c.vol }); return u; };
  H.startSoloBattle = (S, rnd) => {
    const run = runOf(S), node = run.map[run.at], st = H.soloStage(S, node);
    for (const e of st.enemies) S.dinSeen[e.id] = 1;
    const b = new H.Battle({ allies: [H.soloUnit(S)], enemies: st.enemies.map(H.soloFoe), rng: rnd, rules: { restless: H.SOLO.restless } });
    const u = b.units[0]; u.hp = Math.max(1, Math.round(u.max * run.hp)); return b;
  };
  // three boons to choose from. src: 'gig' (mostly common), 'loud' (rare), 'jam' (one rare among them), or a rarity
  H.boonOffer = (run, src, rnd) => {
    const can = H.BOON_ORDER.filter((id) => H.BOONS[id].r === 'c' || !run.boons.includes(id)), commons = can.filter((id) => H.BOONS[id].r === 'c'), rares = can.filter((id) => H.BOONS[id].r === 'r');
    const pick = (pool, taken) => { const p = pool.filter((x) => !taken.includes(x)); return p.length ? p[Math.floor(rnd() * p.length)] : null; };
    const out = [];
    for (let i = 0; i < 3; i++) {
      const rare = src === 'loud' || src === 'r' ? true : src === 'c' ? false : src === 'jam' ? i === 0 : rnd() < 0.22;
      const id = pick(rare ? rares : commons, out) || pick(can, out); if (id) out.push(id);
    }
    return H.shuffle(out, rnd);
  };
  // stepping onto a stop: what it asks of you next
  H.soloEnter = (S, id, rnd) => {
    const run = runOf(S), node = run.map[id]; if (!node || !H.soloReach(run).some((n) => n.id === id) || run.pending) return null;
    run.at = id; run.done.push(id);
    if (node.type === 'gig' || node.type === 'loud' || node.type === 'boss') run.pending = { type: 'battle' };
    else if (node.type === 'rest') run.pending = { type: 'rest' };
    else if (node.type === 'jam') run.pending = { type: 'boon', src: 'jam', opts: H.boonOffer(run, 'jam', rnd) };
    else { const r2 = H.rng(run.seed * 31 + id), seen = run.log.filter((x) => x.ev).map((x) => x.ev), pool = H.EVENT_ORDER.filter((e) => !seen.includes(e)); run.pending = { type: 'event', ev: pool[Math.floor(r2() * pool.length)] || 'crowd' }; }
    return run.pending;
  };
  // after a gig: HP carries on, the day's notes are paid, and a boon is offered. A loss ends the tour.
  H.finishSolo = (S, win, battle, rnd) => {
    H.refreshSolo(S); const run = runOf(S), node = run.map[run.at], P = S.solo, out = { solo: true, win, boss: node.type === 'boss', loud: node.type === 'loud', gig: run.gigs + (win && node.type !== 'boss' ? 1 : 0), notes: 0, xp: 0, ups: 0, item: null, pet: run.pet, boons: run.boons.slice(), region: run.region };
    if (!win) { out.reached = run.gigs; out.total = run.earned || 0; P.best = Math.max(P.best, run.gigs); S.soloRun = null; return out; }
    if (battle) { const u = battle.units.find((v) => v.side === 0); run.hp = u && u.alive ? Math.max(0.01, u.hp / u.max) : 0.01; }
    if (out.boss) {
      if (!H.GATES || !P.boss) { P.boss = 1; out.notes = H.SOLO.bossNotes; out.item = H.rollItem(S, rnd, 'elite'); }
      P.best = Math.max(P.best, 6); P.wins++; S.stats.soloWins = (S.stats.soloWins || 0) + 1; out.done = true; out.total = (run.earned || 0) + out.notes; S.soloRun = null;
    } else {
      run.gigs++; if (!H.GATES || P.gigs < 5) { if (P.gigs < 5) P.gigs++; out.notes = H.SOLO.gigNotes; run.earned = (run.earned || 0) + out.notes; }
      P.best = Math.max(P.best, run.gigs);
      run.pending = { type: 'boon', src: node.type === 'loud' ? 'loud' : 'gig', opts: H.boonOffer(run, node.type === 'loud' ? 'loud' : 'gig', rnd) };
    }
    S.notes += out.notes; return out;
  };
  H.soloPick = (S, id) => { const run = runOf(S); if (!run || !run.pending || run.pending.type !== 'boon') return false; if (id && run.pending.opts.includes(id)) { const f0 = H.soloMaxHp(S); run.boons.push(id); keepHp(S, f0); run.log.push({ boon: id }); } run.pending = null; return true; };
  // HP is kept as a share of max; when max changes the HP itself stays put (as far as it fits)
  const keepHp = (S, before) => { const run = runOf(S), after = H.soloMaxHp(S); run.hp = Math.max(0.01, Math.min(1, (run.hp * before) / after)); };
  H.soloRest = (S, choice) => {
    const run = runOf(S); if (!run || !run.pending || run.pending.type !== 'rest') return false;
    if (choice === 'nap') run.hp = Math.min(1, run.hp + H.SOLO.rest); else { const f0 = H.soloMaxHp(S); run.extra.vol += H.SOLO.practise; keepHp(S, f0); }
    run.log.push({ rest: choice }); run.pending = null; return true;
  };
  // a mystery's choice; returns what happened so the screen can say it (and a boon pick, if the choice leads to one)
  H.soloEvent = (S, i, rnd) => {
    const run = runOf(S); if (!run || !run.pending || run.pending.type !== 'event') return null;
    const ev = run.pending.ev, o = H.EVENTS[ev].opts[i]; if (!o) return null; const fx = o.fx, f0 = H.soloMaxHp(S), got = { ev, opt: i };
    if (fx.vol) run.extra.vol += fx.vol; if (fx.hp) run.extra.hp += fx.hp; if (fx.vol || fx.hp) keepHp(S, f0);
    if (fx.hurt) run.hp = Math.max(0.01, run.hp - fx.hurt); if (fx.heal) run.hp = Math.min(1, run.hp + fx.heal);
    run.log.push({ ev, opt: i }); run.pending = null;
    const add = (rar) => { const o2 = H.boonOffer(run, rar, rnd); if (o2[0]) { const f1 = H.soloMaxHp(S); run.boons.push(o2[0]); keepHp(S, f1); got.boon = o2[0]; } };
    if (fx.rare) add('r'); if (fx.common) add('c');
    if (fx.pick) { run.pending = { type: 'boon', src: fx.pick, opts: H.boonOffer(run, fx.pick, rnd) }; got.pick = true; }
    return got;
  };
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
