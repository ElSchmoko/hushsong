/* Hushsong — rules outside of battle: the save, the team, shells, echoes, equipment, stages, rewards. No DOM. */
(function (H) {
  'use strict';
  H.newState = () => ({ v: 4, notes: 0, xp: 0, level: 1, stage: 1, pets: [], team: [null, null, null], shells: 1, opened: 0, bought: 0, echo: 0, petEcho: {}, items: [], flags: {}, reh: {}, records: {}, stats: {}, homeBg: null, ens: {}, nextId: 1, nextItem: 1, seen: {}, dinSeen: {},
    settings: { sound: 1, music: 0.7, sfx: 0.8, speed: 1, auto: 0 } });
  // Older saves keep their pets, level and progress.
  H.migrate = (S) => {
    // Two kinds of echo: a pet's own (from shells that hold it again) and plain echoes for any pet (once called 'wild').
    if (S.echo && typeof S.echo === 'object') { S.petEcho = S.echo; S.echo = 0; }
    if (S.wild != null) { S.echo = (+S.echo || 0) + S.wild; delete S.wild; }
    if (!S.petEcho) S.petEcho = {};
    if (S.v >= 4) return S;
    const N = H.newState(); for (const k of ['notes', 'xp', 'level', 'stage', 'pets', 'team', 'flags', 'nextId', 'seen', 'dinSeen', 'settings']) if (S[k] != null) N[k] = S[k];
    N.pets.forEach((p) => { p.rank = 0; p.gear = [null, null]; }); N.shells = S.hatch ? 1 : 0; return N;
  };

  const shuffle = (arr, rnd) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  H.shuffle = shuffle;
  H.petById = (S, id) => S.pets.find((p) => p.id === id) || null;
  // Up to floor 100 a region stays hushed until its boss is beaten. After that, and on every floor past 100, it sings.
  H.floorHushed = (S, n) => n <= 100 && S.stage <= Math.ceil(n / 10) * 10;
  H.teamPets = (S) => S.team.map((id) => (id ? H.petById(S, id) : null));
  H.petTier = (pet) => H.FORMS[pet.form].tier;
  H.petSpecies = (pet) => H.FORMS[pet.form].sp;
  H.petFamily = (pet) => H.SPECIES[H.FORMS[pet.form].sp].family;
  H.owned = (S, sp) => S.pets.some((p) => H.petSpecies(p) === sp);
  // A pet's own echoes come from shells that hold it again and only help that pet. Plain echoes help any pet.
  H.ownEchoes = (S, pet) => (S.petEcho || {})[H.petSpecies(pet)] || 0;
  H.echoes = (S, pet) => (S.echo || 0) + (pet ? H.ownEchoes(S, pet) : 0);   // what this pet can spend: its own plus the plain ones
  H.addEchoes = (S, n) => { S.echo = (S.echo || 0) + n; return n; };
  // Paying a cost takes the pet's own echoes first, then plain ones.
  const pay = (S, pet, cost) => { const sp = H.petSpecies(pet), own = Math.min(cost, H.ownEchoes(S, pet)); S.petEcho[sp] = H.ownEchoes(S, pet) - own; S.echo -= cost - own; };

  // The ensemble the current team forms, if it does.
  H.teamEnsemble = (S) => { const T = H.teamPets(S).filter(Boolean); return T.length === 3 ? H.ensembleOf(T.map(H.petFamily)) : null; };
  // Ensembles the player could form right now from the pets they own.
  H.possibleEnsembles = (S) => { const cnt = {}; for (const p of S.pets) { const f = H.petFamily(p); cnt[f] = (cnt[f] || 0) + 1; } return H.ENSEMBLES.filter((e) => { const need = {}; e.fam.forEach((f) => (need[f] = (need[f] || 0) + 1)); return Object.keys(need).every((f) => (cnt[f] || 0) >= need[f]); }); };
  const noteEnsemble = (S) => { const e = H.teamEnsemble(S); if (!e) return null; const r = (S.ens[e.id] = S.ens[e.id] || { n: 0 }); r.n++; return e; };
  H.ECHO_EVERY = 100; H.ECHO_FLOORS = 2; H.ECHO_REH = 1; H.ECHO_BOSS = 1;   // plain echoes: 1 for every boss floor, 2 more for every 100th floor, 1 for each rehearsal boss's first defeat
  H.addPet = (S, sp) => { const pet = { id: S.nextId++, form: sp, t1: false, t2: false, rank: 0, gear: [null, null] }; S.pets.push(pet); S.seen[sp] = 1; const i = S.team.indexOf(null); if (i >= 0) S.team[i] = pet.id; return pet; };
  H.setTeam = (S, slot, petId) => { const was = S.team.indexOf(petId); if (was >= 0) S.team[was] = S.team[slot]; S.team[slot] = petId; };

  /* shells: a random pet. One you already have turns into echoes of that pet. */
  H.shellPool = (S) => {
    if (!S.pets.length) return H.STARTERS.map((sp) => [sp, 1]);
    const missing = H.SPECIES_ORDER.filter((sp) => !H.owned(S, sp));
    if (S.pets.length < 3 && missing.length) return missing.map((sp) => [sp, 1]);      // your first three shells are always new pets
    return H.SPECIES_ORDER.map((sp) => [sp, 1]);   // after that every pet is equally likely, owned or not
  };
  // The very first shell lets you pick one of the three starters (pass its name as `pick`).
  H.openShell = (S, rnd, pick) => {
    if (S.shells <= 0) return null; S.shells--; S.opened++;
    const pool = H.shellPool(S), total = pool.reduce((a, x) => a + x[1], 0); let r = rnd() * total, sp = pool[0][0];
    for (const [k, w] of pool) { if (r < w) { sp = k; break; } r -= w; }
    if (pick && !S.pets.length && H.STARTERS.includes(pick)) sp = pick;
    if (H.owned(S, sp)) { S.petEcho[sp] = (S.petEcho[sp] || 0) + H.ECHO_DUP; return { sp, isNew: false, echo: H.ECHO_DUP, pet: S.pets.find((p) => H.petSpecies(p) === sp) }; }
    return { sp, isNew: true, echo: 0, pet: H.addPet(S, sp) };
  };
  H.shellPrice = () => H.SHELL_PRICE;
  H.buyShell = (S) => { const c = H.shellPrice(S); if (S.notes < c) return false; S.notes -= c; S.bought++; S.shells++; return true; };

  /* evolution: paid in echoes, once per step; both branches of a paid step stay open for that pet */
  H.evoCheck = (S, pet, formId) => {
    const f = H.FORMS[formId]; if (!f || f.sp !== H.petSpecies(pet)) return { ok: false, why: 'Not this pet.' };
    if (formId === pet.form) return { ok: false, why: 'Current form', current: true };
    let cost = 0; if (f.tier >= 1 && !pet.t1) cost += H.ECHO_COST[1]; if (f.tier >= 2 && !pet.t2) cost += H.ECHO_COST[2];
    const have = H.echoes(S, pet); if (have < cost) return { ok: false, why: `Needs ${cost} echoes`, cost, have };
    return { ok: true, cost, have };
  };
  H.evolve = (S, pet, formId) => { const c = H.evoCheck(S, pet, formId); if (!c.ok) return false; pay(S, pet, c.cost); const f = H.FORMS[formId]; if (f.tier >= 1) pet.t1 = true; if (f.tier >= 2) pet.t2 = true; pet.form = formId; for (const id of H.formChain(formId)) S.seen[id] = 1; return true; };
  H.nextForms = (pet) => H.childrenOf(pet.form);
  // Once a pet is fully evolved, spare echoes buy stars: +3% HP and Power each.
  H.rankCheck = (S, pet) => pet.t2 && H.petTier(pet) === 2 && (pet.rank || 0) < H.RANK_MAX && H.echoes(S, pet) >= H.rankCost(pet.rank || 0);
  H.rankUp = (S, pet) => { if (!H.rankCheck(S, pet)) return false; pay(S, pet, H.rankCost(pet.rank || 0)); pet.rank = (pet.rank || 0) + 1; return true; };
  H.canGrow = (S, pet) => H.nextForms(pet).some((f) => H.evoCheck(S, pet, f).ok) || H.rankCheck(S, pet);
  // With one pot of echoes nearly every pet could grow, so the game points at the band: the pet in it that has grown least.
  H.canEvolveAny = (S) => H.teamPets(S).filter((p) => p && H.canGrow(S, p)).sort((a, b) => H.petTier(a) - H.petTier(b) || (a.rank || 0) - (b.rank || 0))[0] || null;

  /* equipment */
  const ODDS = { win: [60, 28, 10, 2], elite: [30, 40, 22, 8], boss: [0, 45, 35, 20], gift: [0, 100, 0, 0] };
  // Each Legendary exists once. When you hold them all, a Legendary roll gives an Epic instead.
  H.freeLegends = (S, type) => Object.keys(H.LEGENDS).filter((k) => (!type || H.LEGENDS[k].type === type) && !S.items.some((x) => x.leg === k));
  H.rollItem = (S, rnd, src) => {
    const odds = ODDS[src] || ODDS.win; let r = rnd() * 100, rar = 'c'; for (let i = 0; i < 4; i++) { if (r < odds[i]) { rar = H.RARITY_ORDER[i]; break; } r -= odds[i]; }
    const free = H.freeLegends(S); if (rar === 'l' && !free.length) rar = 'e';
    const it = { id: S.nextItem++, rar };
    if (rar === 'l') { it.leg = free[Math.floor(rnd() * free.length)]; it.type = H.LEGENDS[it.leg].type; }
    else if (src === 'gift') it.type = 'sticks'; else { const keys = Object.keys(H.ITEM_TYPES); it.type = keys[Math.floor(rnd() * keys.length)]; }
    S.items.push(it); return it;
  };
  // A Legendary for certain (an Epic when every Legendary is already yours).
  H.rollLegend = (S, rnd) => { const free = H.freeLegends(S); const it = { id: S.nextItem++, rar: free.length ? 'l' : 'e' }; if (free.length) { it.leg = free[Math.floor(rnd() * free.length)]; it.type = H.LEGENDS[it.leg].type; } else { const keys = Object.keys(H.ITEM_TYPES); it.type = keys[Math.floor(rnd() * keys.length)]; } S.items.push(it); return it; };
  // Experience works like drops: full on floors at or above your level, less the further below you a floor is (never below a tenth).
  H.xpFactor = (S, n) => { const gap = S.level - H.stageLevel(n), span = 5 + 0.3 * S.level; return Math.max(0.1, Math.min(1, 1 - gap / span)); };
  H.xpFor = (S, n) => { const st = H.stage(n), first = n >= S.stage; return Math.round((8 + 3 * n) * (st.boss ? 2 : st.elite ? 1.3 : 1) * (first ? 1 : 0.5) * H.xpFactor(S, n) * teamXp(S)); };
  // The chance a won battle drops a piece: full on floors at or above your level, less the further below you a floor is. Bosses drop twice as often.
  H.ITEM_BASE = 0.16;
  H.dropChance = (S, n) => { const gap = S.level - H.stageLevel(n), span = 5 + 0.3 * S.level; return H.ITEM_BASE * (H.stage(n).boss ? 2 : 1) * Math.max(0, Math.min(1, 1 - gap / span)); };
  H.itemById = (S, id) => S.items.find((x) => x.id === id) || null;
  H.itemOwner = (S, id) => S.pets.find((p) => p.gear && p.gear.includes(id)) || null;
  H.equip = (S, pet, slot, id) => { for (const p of S.pets) if (p.gear) p.gear = p.gear.map((g) => (g === id ? null : g)); if (!pet.gear) pet.gear = [null, null]; pet.gear[slot] = id; };
  H.unequip = (S, pet, slot) => { if (pet.gear) pet.gear[slot] = null; };
  // Three spare pieces of the same kind and rarity make one of the next rarity, up to Epic. Legendaries are only found.
  H.mergeGroups = (S) => { const g = {}; for (const it of H.spareItems(S)) if (it.rar === 'c' || it.rar === 'r') (g[it.type + '|' + it.rar] = g[it.type + '|' + it.rar] || []).push(it); return Object.values(g).filter((x) => x.length >= 3); };
  H.canMerge = (S, it) => (it.rar === 'c' || it.rar === 'r') && !H.itemOwner(S, it.id) && H.spareItems(S).filter((x) => x.type === it.type && x.rar === it.rar).length >= 3;
  H.mergeItems = (S, it, rnd) => {
    if (!H.canMerge(S, it)) return null;
    const same = H.spareItems(S).filter((x) => x.type === it.type && x.rar === it.rar && x.id !== it.id).slice(0, 2).concat([it]), ids = same.map((x) => x.id);
    S.items = S.items.filter((x) => !ids.includes(x.id));
    const out = { id: S.nextItem++, type: it.type, rar: H.RARITY_ORDER[H.RARITY_ORDER.indexOf(it.rar) + 1] };
    S.items.push(out); S.stats.merges = (S.stats.merges || 0) + 1; return out;
  };
  H.sellItem = (S, id) => { const it = H.itemById(S, id); if (!it || H.itemOwner(S, id)) return 0; S.items = S.items.filter((x) => x.id !== id); const v = H.RARITY[it.rar].sell; S.notes += v; return v; };
  H.itemRank = (it) => H.RARITY_ORDER.indexOf(it.rar);
  H.spareItems = (S) => S.items.filter((it) => !H.itemOwner(S, it.id)).sort((a, b) => H.itemRank(b) - H.itemRank(a) || a.type.localeCompare(b.type));
  // Stats as the pet page shows them, with equipment and stars counted.
  H.petSheet = (S, pet) => {
    const b = H.petStats(pet, S.level), m = { hp: 0, vol: 0, tempo: 0, poise: 0, crit: 0 };   // what the stat boxes show
    for (const p of H.petPerks(pet, S)) if (p.mod) for (const k in m) if (p.mod[k]) m[k] += p.mod[k];
    return { hp: Math.round(b.hp * (1 + m.hp)), vol: Math.round(b.vol * (1 + m.vol)), poise: Math.round(b.poise + m.poise), tempo: Math.round(b.tempo * (1 + m.tempo)), crit: Math.round((0.05 + m.crit) * 100) };
  };

  H.gainXp = (S, n) => { let ups = 0; S.xp += n; while (S.level < H.MAX_LEVEL && S.xp >= H.xpNeed(S.level)) { S.xp -= H.xpNeed(S.level); S.level++; ups++; } if (S.level >= H.MAX_LEVEL) S.xp = 0; return ups; };

  const foeUnit = (e) => (e.pet ? H.buildRivalUnit(e.id, e.lvl) : H.buildDinUnit(e.id, e.lvl, e.loud));
  // A rehearsal replays a boss you have beaten at your own level. Its two helpers stand one level lower, as on the boss floors.
  H.foeUnit = foeUnit;
  H.rehearsalStage = (S, n) => { const st = H.stage(n), R = H.REGIONS[st.region], L = Math.max(1, S.level); return Object.assign({}, st, { level: L, reh: true, enemies: [{ id: R.boss, lvl: L }].concat(R.adds.map((a) => ({ id: a, lvl: Math.max(1, L - 1) }))) }); };
  H.rehearsals = (S) => { const out = []; for (let n = 10; n < S.stage; n += 10) out.push(n); return out; };
  H.startStage = (S, n, rnd, reh) => {
    const st = reh ? H.rehearsalStage(S, n) : H.stage(n), enemies = st.enemies.map(foeUnit);
    for (const e of st.enemies) if (!e.pet) S.dinSeen[e.id] = 1;
    const ens = H.teamEnsemble(S);
    return new H.Battle({ allies: H.teamPets(S).map((p) => (p ? H.buildPetUnit(p, S.level, S) : null)), enemies, rng: rnd, ensemble: ens ? ens.id : null });
  };
  const teamXp = (S) => { let m = 0; for (const p of H.teamPets(S)) if (p) for (const id of p.gear) { const it = id && H.itemById(S, id); if (it) m += H.itemMods(it).xp || 0; } return 1 + m; };
  // Apply a finished battle. Returns what the result screen shows. `battle` is optional (the simulator leaves it out).
  H.finishStage = (S, n, win, rnd, battle) => {
    const drop = H.dropChance(S, n), xk = H.xpFactor(S, n), st = H.stage(n), out = { win, n, notes: 0, xp: 0, ups: 0, first: false, boss: st.boss, region: st.region, shells: 0, item: null, gift: false, giftShell: false, story: false, echo: 0 };
    if (!win) { out.xp = Math.round((8 + 3 * n) * 0.25 * xk * teamXp(S)); out.ups = H.gainXp(S, out.xp); return out; }
    out.first = n >= S.stage; const k = out.first ? 1 : 0.5;
    out.notes = out.first ? Math.round(H.NOTES * (st.boss ? 3 : st.elite ? 1.5 : 1)) : 0;
    out.xp = Math.round((8 + 3 * n) * (st.boss ? 2 : st.elite ? 1.3 : 1) * k * xk * teamXp(S));
    S.notes += out.notes; out.ups = H.gainXp(S, out.xp);
    if (out.first) {
      S.stage = n + 1;
      if (n === 1) { if (!S.flags.gift1) { S.flags.gift1 = 1; out.shells = 1; out.giftShell = true; } } else out.shells = H.shellsFor(n);
      S.shells += out.shells; out.story = st.boss && n <= 100;
      if (n % H.ECHO_EVERY === 0) out.echo += H.addEchoes(S, H.ECHO_FLOORS);
      if (st.boss) { const e = H.addEchoes(S, H.ECHO_BOSS); if (n <= 100) out.bossEcho = e + (n % H.ECHO_EVERY === 0 ? out.echo : 0); else out.echo += e; }   // every boss pays an echo; up to floor 100 it is shown on its own screen after the story
      // the end of the story: one Legendary, once
      if (n === 100 && !S.flags.leg100) { S.flags.leg100 = 1; out.legend = H.rollLegend(S, rnd); }
    }
    noteEnsemble(S);
    if (st.boss) H.noteBossWin(S, n, battle);
    // the second floor hands over one piece of equipment, once; after that every win has a small chance
    if (out.first && n === 2 && !S.flags.gift2) { S.flags.gift2 = 1; out.item = H.rollItem(S, rnd, 'gift'); out.gift = true; }
    else if (rnd() < drop) out.item = H.rollItem(S, rnd, st.boss ? 'boss' : st.elite ? 'elite' : 'win');
    return out;
  };
  // Rehearsal echoes come back every week: each boss pays one echo per week, and they all reset on Monday (local time).
  const DAY = 86400000;
  H.dayOf = (ms) => { const d = new Date(ms); return Math.floor((ms - d.getTimezoneOffset() * 60000) / DAY); };
  H.weekOf = (ms) => Math.floor((H.dayOf(ms) + 3) / 7);              // day 0 (1 Jan 1970) was a Thursday, so weeks start on Monday
  H.daysToReset = (ms) => 7 - ((H.dayOf(ms) + 3) % 7);               // 1 = tomorrow, 7 = a full week
  H.refreshRehearsals = (S, ms) => { const w = H.weekOf(ms == null ? Date.now() : ms); if (S.rehWeek === w) return false; S.rehWeek = w; S.reh = {}; return true; };
  // A win against a rehearsal boss pays an echo once a week. Winning with an ensemble is noted for its record.
  H.finishRehearsal = (S, n, win, rnd, battle) => {
    H.refreshRehearsals(S);
    const out = { win, n, reh: true, boss: true, region: H.stage(n).region, notes: 0, xp: 0, ups: 0, first: false, echo: 0, ens: null };
    out.xp = Math.round((8 + 3 * S.stage) * (win ? 0.5 : 0.2) * teamXp(S)); out.ups = H.gainXp(S, out.xp);
    if (win && !S.reh[n]) { S.reh[n] = 1; out.first = true; S.stats.reh = (S.stats.reh || 0) + 1; out.echo = H.addEchoes(S, H.ECHO_REH); }
    if (win) { H.noteBossWin(S, n, battle); const e = noteEnsemble(S); if (e && !S.ens[e.id].reh) { S.ens[e.id].reh = 1; out.ens = e.id; } }
    return out;
  };

  /* records: hard goals for the long run. Each pays out once, in shells, echoes and stage sets for the home screen. */
  H.noteBossWin = (S, n, battle) => {
    const T = H.teamPets(S).filter(Boolean), st = S.stats, fams = new Set(T.map(H.petFamily));
    if (n >= 30 && T.length === 1) st.solo = 1;
    if (n >= 50 && T.every((p) => !p.gear.some(Boolean))) st.unplugged = 1;
    if (n >= 30 && T.length === 3 && fams.size === 1) st.section = 1;
    if (n >= 50 && battle && battle.units.filter((u) => u.side === 0).every((u) => u.alive && !u.revived)) st.perfect = (st.perfect || 0) + 1;
  };
  const maxed = (S) => S.pets.filter((p) => H.petTier(p) === 2);
  H.RECORDS = [
    // early milestones on the way to floor 100
    { id: 'lv10', cat: 'adv', n: 'Warming Up', d: 'Reach level 10.', prog: (S) => [S.level, 10], echo: 1 },
    { id: 'half', cat: 'adv', n: 'Halfway There', d: 'Clear floor 50.', prog: (S) => [S.stage - 1, 50], shells: 1 },
    { id: 'lv30', cat: 'adv', n: 'Rising Star', d: 'Reach level 30.', prog: (S) => [S.level, 30], shells: 1 },
    { id: 'evo1', cat: 'col', n: 'First Encore', d: 'Evolve a pet for the first time.', prog: (S) => [S.pets.some((p) => H.petTier(p) > 0) ? 1 : 0, 1], echo: 1 },
    { id: 'dressed', cat: 'col', n: 'Dressed Up', d: 'Give all three pets in your band two pieces of equipment each.', prog: (S) => [H.teamPets(S).filter(Boolean).reduce((a, p) => a + p.gear.filter(Boolean).length, 0), 6], echo: 1 },
    { id: 'ten', cat: 'col', n: 'Growing Band', d: 'Find 10 different pets.', prog: (S) => [new Set(S.pets.map(H.petSpecies)).size, 10], echo: 1 },
    { id: 'tour1', cat: 'adv', n: 'World Tour', d: 'Clear floor 100.', prog: (S) => [S.stage - 1, 100], shells: 1, bg: 'night' },
    { id: 'tour2', cat: 'adv', n: 'Second Leg', d: 'Clear floor 200.', prog: (S) => [S.stage - 1, 200], shells: 2 },
    { id: 'tour3', cat: 'adv', n: 'Long Player', d: 'Clear floor 300.', prog: (S) => [S.stage - 1, 300], shells: 2, bg: 'dusk' },
    { id: 'tour5', cat: 'adv', n: 'Endless Encore', d: 'Clear floor 500.', prog: (S) => [S.stage - 1, 500], shells: 3, bg: 'gold' },
    { id: 'all', cat: 'col', n: 'Full Orchestra', d: 'Find every pet.', prog: (S) => [new Set(S.pets.map(H.petSpecies)).size, H.SPECIES_ORDER.length], shells: 2, bg: 'aurora' },
    { id: 'trio', cat: 'col', n: 'Headliners', d: 'Fully evolve three pets.', prog: (S) => [maxed(S).length, 3], shells: 1 },
    { id: 'five', cat: 'col', n: 'Five-Part Harmony', d: 'Fully evolve a pet from each of the five families.', prog: (S) => [new Set(maxed(S).map(H.petFamily)).size, 5], shells: 2 },
    { id: 'star', cat: 'col', n: 'Virtuoso', d: 'Give one pet all 10 stars. Stars cost echoes, once a pet is fully evolved.', prog: (S) => [Math.max(0, ...S.pets.map((p) => p.rank || 0)), 10], shells: 3 },
    { id: 'solo', cat: 'adv', n: 'Solo Act', d: 'Beat a boss on floor 30 or higher with a single pet.', prog: (S) => [S.stats.solo ? 1 : 0, 1], shells: 2 },
    { id: 'unplugged', cat: 'adv', n: 'Unplugged', d: 'Beat a boss on floor 50 or higher with no equipment in your band.', prog: (S) => [S.stats.unplugged ? 1 : 0, 1], shells: 1 },
    { id: 'section', cat: 'adv', n: 'Section Rehearsal', d: 'Beat a boss on floor 30 or higher with three pets of the same family.', prog: (S) => [S.stats.section ? 1 : 0, 1], shells: 1 },
    { id: 'perfect', cat: 'adv', n: 'Note Perfect', d: 'Beat 10 bosses on floor 50 or higher without a pet falling.', prog: (S) => [S.stats.perfect || 0, 10], shells: 2 },
    { id: 'reh', cat: 'reh', n: 'Dress Rehearsal', d: 'Win 10 rehearsals.', prog: (S) => [S.stats.reh || 0, 10], shells: 1, bg: 'spot' },
    { id: 'gold', cat: 'col', n: 'Gold Collection', d: 'Own 3 Legendary pieces of equipment.', prog: (S) => [S.items.filter((it) => it.rar === 'l').length, 3], shells: 1 },
    { id: 'songbook', cat: 'reh', n: 'Complete Songbook', d: 'Win a rehearsal with each of the 15 ensembles.', prog: (S) => [H.ENSEMBLES.filter((e) => S.ens[e.id] && S.ens[e.id].reh).length, H.ENSEMBLES.length], shells: 3 },
    { id: 'shells', cat: 'col', n: 'Shell Shock', d: 'Open 100 shells.', prog: (S) => [S.opened, 100], shells: 2 },
  ];
  // one record per ensemble: win a rehearsal with it. These pay an echo each.
  for (const e of H.ENSEMBLES) H.RECORDS.push({ id: 'ens_' + e.id, cat: 'reh', ens: e.id, n: e.n, d: 'Win a rehearsal with the ' + e.n + '.', prog: (S) => [S.ens[e.id] && S.ens[e.id].reh ? 1 : 0, 1], echo: 1 });
  H.RECORD_CATS = [['adv', 'Adventure'], ['reh', 'Rehearsal'], ['col', 'Collection']];
  H.SETS = { night: 'Night Concert', dusk: 'Sunset Stage', gold: 'Golden Hall', aurora: 'Northern Lights', spot: 'Spotlight' };
  H.recordState = (S, r) => { const [a, b] = r.prog(S); return S.records[r.id] ? 'claimed' : a >= b ? 'ready' : 'open'; };
  H.recordsReady = (S) => H.RECORDS.filter((r) => H.recordState(S, r) === 'ready').length;
  H.claimRecord = (S, id) => { const r = H.RECORDS.find((x) => x.id === id); if (!r || H.recordState(S, r) !== 'ready') return null; S.records[id] = 1; S.shells += r.shells || 0; H.addEchoes(S, r.echo || 0); return r; };
  H.ownedSets = (S) => H.RECORDS.filter((r) => r.bg && S.records[r.id]).map((r) => r.bg);
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
