/* Hushsong Roads (preview) — the rules: the save, the band, battles on the map, pets joining, places, holdings, gear, talents, quests.
   No DOM. A fresh start of its own: it never reads or changes the main game's save. */
(function (H) {
  'use strict';
  const R = H.ROADS, W = H.RW, Rd = (H.Roads = {});
  const KEY = 'hushsong.roads.v1';

  /* ---------- the save ---------- */
  Rd.fresh = () => ({ v: 1, started: 0, pets: [], band: [null, null, null], nextId: 1, items: [], nextItem: 1, notes: 0, echo: 0, petEcho: {}, seen: {}, shells: 0, bought: 0,
    plv: 1, pxp: 0, talents: {}, quest: 0, caps: {}, builds: {}, book: {}, meets: {}, groups: {}, gen: 1, hum: {}, found: {}, pos: null, lastVenue: 'hush',
    chapel: { room: 0, cleared: 0, runs: 0 }, fight: null, flags: {}, wins: 0, boss: 0, bosses: {}, open: {} });
  Rd.load = () => {
    let S = null; try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
    if (!S || S.v !== 1) S = Rd.fresh();
    const d = Rd.fresh(); for (const k in d) if (S[k] == null) S[k] = d[k];
    // saves from before the new regions: Muffle beaten means the foundry is open
    if (S.boss && !S.bosses.marsh) { S.bosses.marsh = 1; S.open.works = 1; const i = R.QUESTS.findIndex((q) => q.id === 'done'); if (S.quest >= i) S.quest = R.QUESTS.findIndex((q) => q.id === 'east'); }
    Rd.S = S; Rd.world(); W.setOpen(S.open); return S;
  };
  let saveT = 0;
  Rd.save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(Rd.S)); } catch (e) { /* storage unavailable */ } }, 100); };
  Rd.wipe = () => { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } Rd.S = Rd.fresh(); Rd.world(); W.setOpen({}); return Rd.S; };

  /* ---------- the world: built once, then the patrols are laid out on it ---------- */
  let built = false;
  Rd.world = () => {
    if (built) return; built = true;
    W.build(); W.place(R.PLACES, R.LINKS);
    // every place you can capture: two guards on its doorstep, and patrols across its land
    Rd.GROUPS = [];
    const taken = new Set(W.POI.map((p) => p.t));
    const pick = (cands, n, seed, minGap) => { const out = []; const sorted = cands.slice().sort((a, b) => W.hash(a.q * 7 + seed, a.r * 13) - W.hash(b.q * 7 + seed, b.r * 13)); for (const t of sorted) { if (out.length >= n) break; if (taken.has(t) || out.some((o) => W.hexDist(o, t) < minGap) || Rd.GROUPS.some((g) => W.hexDist(g.home, t) < minGap)) continue; out.push(t); taken.add(t); } return out; };
    for (const P of R.PLACES.filter((p) => p.cap)) {
      const place = W.poi(P.id), land = W.list.filter((t) => W.walk(t) && t.owner === P.id);
      pick(land.filter((t) => { const d = W.hexDist(t, place.t); return d >= 2 && d <= 3; }), 2, 11, 2).forEach((t, i) => Rd.GROUPS.push({ id: P.id + '_g' + i, place: P.id, guard: 1, home: t, lv: P.lv[1] }));
      pick(land.filter((t) => W.hexDist(t, place.t) >= (P.id === 'hush' ? 3 : 4) && (P.id !== 'hush' || W.hexDist(t, place.t) <= 5)), P.id === 'hush' ? 4 : 7, 29, 2).forEach((t, i) => Rd.GROUPS.push({ id: P.id + '_p' + i, place: P.id, home: t, lv: P.lv[0] + (i % (P.lv[1] - P.lv[0] + 1)), spare: i >= (P.id === 'hush' ? 2 : 3) }));
    }
    // the two tutorial fights, on the road out of Hushwick
    const hush = W.poi('hush').t, bend = W.list.filter((t) => t.road.length && W.walk(t) && W.hexDist(t, hush) === 3 && !taken.has(t))[0] || W.near(hush.x + 4, hush.z, (t) => W.hexDist(t, hush) === 3);
    Rd.BEND = bend; taken.add(bend);
    const tut = (id, near, cfg) => { const t = W.list.filter((u) => W.walk(u) && !taken.has(u) && !u.road.length && W.hexDist(u, near) <= 2 && W.hexDist(u, near) >= 1 && W.hexDist(u, hush) <= 5 && W.hexDist(u, hush) >= 2).sort((a, b) => W.hexDist(b, hush) - W.hexDist(a, hush))[0]; taken.add(t); Rd.GROUPS.push({ id, place: 'hush', tut: 1, home: t, lv: cfg.lv, fixed: cfg }); };
    tut('tut1', bend, R.TUTORIAL.fight); tut('tut2', bend, R.TUTORIAL.friend);
  };
  Rd.group = (id) => Rd.GROUPS.find((g) => g.id === id);
  Rd.place = (id) => R.PLACES.find((p) => p.id === id);
  Rd.poiT = (id) => W.poi(id).t;
  Rd.regOpen = (reg) => !W.REG[reg].closed || !!Rd.S.open[reg];
  Rd.bossDone = (reg) => !!Rd.S.bosses[reg];
  Rd.hereReg = () => { const S = Rd.S, t = S.pos && W.at(S.pos.q, S.pos.r); return t ? t.reg : 'marsh'; };
  Rd.curReg = () => { const q = Rd.quest(); return (q && (q.all || q.boss || (q.cap && Rd.place(q.cap).reg))) || Rd.hereReg(); };

  /* What a patrol holds right now: a few Din and maybe a wild pet. It changes each time patrols come back (after a rest). */
  const groundOf = (t) => (W.nbs(t).some((n) => n.kind === 0) || t.kind === 1 ? 'shore' : t.kind === 3 ? 'woods' : t.kind === 4 ? 'hills' : 'meadow');
  Rd.foes = (g) => {
    const S = Rd.S, gen = (S.groups[g.id] && S.groups[g.id].gen) || 1;
    if (g.fixed) { const f = g.fixed; return { din: f.din.map((id) => ({ id, lvl: f.lv })), pet: f.pet ? { sp: f.pet, lvl: f.petLv } : null }; }
    const rnd = H.rng(W.hash(g.home.q * 31 + gen * 7, g.home.r * 17 + gen) * 1e9), P = Rd.place(g.place), n = g.guard ? 2 + (g.lv >= 4 ? 1 : 0) : g.lv <= 2 ? 1 + Math.floor(rnd() * 2) : 2 + Math.floor(rnd() * 2);
    const din = Array.from({ length: n }, () => ({ id: P.din[Math.floor(rnd() * P.din.length)], lvl: Math.max(1, g.lv - (rnd() < 0.4 ? 1 : 0)) }));
    const have = S.pets.length; if (have < 3 && rnd() > 0.1) din.length = Math.min(din.length, Math.max(1, have));
    return { din, pet: null };
  };
  // A patrol is out on the map unless it was beaten since the last rest. Guards stay beaten; tutorial fights only show during their quest.
  Rd.groupLive = (g) => {
    const S = Rd.S, st = S.groups[g.id];
    if (g.tut) { const q = Rd.quest(); return !(st && st.beaten) && q && (g.id === 'tut1' ? q.id === 'fight' : q.id === 'friend'); }
    if (S.quest < 3 || g.home.closed) return false;   // the first three quests: only their own fights are out
    if (g.guard && S.caps[g.place]) return false;
    if (Rd.fenced() && W.hexDist(g.home, Rd.poiT('hush')) > Rd.quest().fence) return false;
    if (g.spare && !(st && st.on)) return false;
    return !(st && st.beaten);
  };
  Rd.liveGroups = () => Rd.GROUPS.filter(Rd.groupLive);

  /* ---------- pets ---------- */
  Rd.pet = (id) => Rd.S.pets.find((p) => p.id === id) || null;
  Rd.bandPets = () => Rd.S.band.map((id) => (id ? Rd.pet(id) : null));
  Rd.species = (p) => H.FORMS[p.form].sp;
  Rd.owns = (sp) => Rd.S.pets.some((p) => Rd.species(p) === sp);
  Rd.addPet = (sp, lvl) => {
    const S = Rd.S, pet = { id: S.nextId++, form: sp, t1: false, t2: false, rank: 0, gear: [null, null], lvl: lvl || 1, xp: 0 };
    S.pets.push(pet); S.seen[sp] = 1; S.book[sp] = 3; const i = S.band.indexOf(null); if (i >= 0) S.band[i] = pet.id; return pet;
  };
  Rd.setBand = (slot, petId) => { const S = Rd.S, was = S.band.indexOf(petId); if (was >= 0) S.band[was] = S.band[slot]; S.band[slot] = petId; };
  const petLevelUp = (pet, xp) => { let ups = 0; pet.xp += xp; while (pet.lvl < R.MAX_PET && pet.xp >= R.petNeed(pet.lvl)) { pet.xp -= R.petNeed(pet.lvl); pet.lvl++; ups++; } if (pet.lvl >= R.MAX_PET) pet.xp = 0; return ups; };
  Rd.gainPlayer = (xp) => { const S = Rd.S; let ups = 0; S.pxp += xp; while (S.plv < R.MAX_PLAYER && S.pxp >= R.playerNeed(S.plv)) { S.pxp -= R.playerNeed(S.plv); S.plv++; ups++; } return ups; };

  /* ---------- holdings, buildings and talents: what they add up to ---------- */
  Rd.has = (t) => !!Rd.S.talents[t];
  Rd.capsOf = (reg) => R.PLACES.filter((p) => p.cap && p.reg === reg).map((p) => p.id);
  Rd.capCount = (reg) => Rd.capsOf(reg || Rd.curReg()).filter((id) => Rd.S.caps[id]).length;
  Rd.capTotal = (reg) => Rd.capsOf(reg || Rd.curReg()).length;
  Rd.capAll = () => R.CAPS.filter((id) => Rd.S.caps[id]).length;
  Rd.bonus = () => {
    const S = Rd.S, b = { xp: 0, hp: 0, poise: 0, tempo: 0, join: 0, notes: 0 };
    for (const id of R.CAPS) if (S.caps[id]) {
      const P = Rd.place(id); for (const k in P.bonus) b[k] += P.bonus[k];
      b.notes += P.yield; for (const bid of S.builds[id] || []) { const B = R.BUILDS[bid]; b.notes += B.notes || 0; b.xp += B.xp || 0; b.hp += B.hp || 0; }
    }
    if (Rd.has('neighbour')) b.notes = Math.round(b.notes * 1.5);
    if (Rd.has('kind')) b.join += 0.05;
    if (Rd.has('crier')) { b.poise += Rd.capAll(); b.hp += 0.02 * Rd.capAll(); }
    b.hp += 0.05 * Object.keys(S.bosses).length;   // each region's song, once its boss is gone
    return b;
  };
  Rd.buildCost = (bid) => Math.round(R.BUILDS[bid].cost * (Rd.has('hands') ? 0.75 : 1));
  Rd.build = (placeId, bid) => {
    const S = Rd.S, have = (S.builds[placeId] = S.builds[placeId] || []), c = Rd.buildCost(bid);
    if (!S.caps[placeId] || have.includes(bid) || S.notes < c) return false;
    S.notes -= c; have.push(bid); Rd.check('build'); return true;
  };
  Rd.points = () => Rd.S.plv - 1 - Object.keys(Rd.S.talents).length;
  Rd.treePoints = (tree) => tree.talents.filter((t) => Rd.has(t.id)).length;
  Rd.canTalent = (tree, t) => !Rd.has(t.id) && Rd.points() > 0 && Rd.treePoints(tree) >= (t.need || 0);
  Rd.takeTalent = (tree, t) => { if (!Rd.canTalent(tree, t)) return false; Rd.S.talents[t.id] = 1; Rd.check('talent'); return true; };

  /* ---------- join chances ---------- */
  Rd.joinChance = (sp, dinFirst) => {
    const S = Rd.S, J = R.JOIN, bandHas = Rd.bandPets().some((p) => p && Rd.species(p) === sp);
    const parts = [['Base', J.base]];
    if (dinFirst) parts.push(['Din beaten first', J.dinFirst]);
    if (bandHas) parts.push(['Same pet in your band', J.same]);
    const m = Math.min(J.meetMax, (S.meets[sp] || 0) * J.perMeet); if (m) parts.push(['Met before', m]);
    const b = Rd.bonus().join; if (b) parts.push(['Holdings and talents', b]);
    return { parts, total: Math.min(1, parts.reduce((a, p) => a + p[1], 0)) };
  };

  /* ---------- battles ---------- */
  // fight: what is about to be fought. kind: group, keeper, boss, chapel, glade.
  // A wild pet is never shown on the map: it may turn up with the Din when the fight starts.
  Rd.fightGroup = (g) => { const f = Rd.foes(g); let pet = f.pet; if (!pet && !g.guard && !g.fixed && Math.random() < R.WILD_CHANCE) { const pool = R.WILD[g.home.reg][groundOf(g.home)]; pet = { sp: pool[Math.floor(Math.random() * pool.length)], lvl: g.lv }; if (Rd.S.pets.length < 3 && f.din.length > 1) f.din.pop(); } Rd.S.fight = { kind: 'group', id: g.id, din: f.din, pet }; Rd.save(); };
  Rd.fightKeeper = (placeId) => { const P = Rd.place(placeId); Rd.S.fight = { kind: 'keeper', id: placeId, din: [{ id: P.keeper, lvl: P.lv[1], loud: 1 }, { id: P.din[0], lvl: P.lv[0] }] }; Rd.save(); };
  Rd.fightBoss = (id) => { const P = Rd.place(id || 'lily'); Rd.S.fight = { kind: 'boss', id: P.id, boss: 1, din: [{ id: P.boss, lvl: P.lv[0] }].concat(P.adds.map((a) => ({ id: a, lvl: P.lv[1] }))) }; Rd.save(); };
  Rd.fightGlade = (id) => { const P = Rd.place(id || 'glade'); Rd.S.fight = { kind: 'glade', id: P.id, din: [], pet: { sp: P.pet, lvl: P.lv, sure: !Rd.owns(P.pet) } }; Rd.save(); };
  Rd.fightRoom = (i) => { const rm = R.CHAPEL.rooms[i]; Rd.S.fight = rm.t === 'boss' ? { kind: 'chapel', room: i, boss: 1, din: [{ id: rm.boss, lvl: rm.lv }].concat(rm.adds.map((a) => ({ id: a, lvl: rm.lv - 1 }))) }
    : rm.t === 'pet' ? { kind: 'chapel', room: i, din: [], pet: { sp: rm.pet, lvl: rm.lv, sure: !Rd.owns(rm.pet) } }
      : { kind: 'chapel', room: i, din: rm.din.map((id, k) => ({ id, lvl: rm.lv, loud: rm.loud && k === 0 })) }; Rd.save(); };
  Rd.stage = () => {
    const S = Rd.S, f = S.fight, t = S.pos && W.at(S.pos.q, S.pos.r), reg = t ? t.reg : 'marsh', sing = !!(S.bosses[reg] || (t && t.owner && S.caps[t.owner]) || (f && f.kind === 'chapel' && S.chapel.cleared));
    return { region: f && f.kind === 'chapel' ? 'caves' : R.REGIONS[reg].bg, boss: !!(f && f.boss), level: f ? Math.max(...f.din.map((d) => d.lvl), f.pet ? f.pet.lvl : 1) : 1, sing };
  };
  Rd.startBattle = (rnd) => {
    const S = Rd.S, f = S.fight, b = Rd.bonus(), pets = Rd.bandPets();
    const allies = pets.map((p) => { if (!p) return null; const u = H.buildPetUnit(p, p.lvl, S); u.perks = u.perks.concat([{ mod: { hp: b.hp, poise: b.poise, tempo: b.tempo } }]); if (Rd.has('opener')) u.perks.push({ startGauge: 0.3 }); return u; });
    const enemies = f.din.map((d) => H.buildDinUnit(d.id, d.lvl, d.loud));
    if (f.pet) { const u = H.buildRivalUnit(f.pet.sp, f.pet.lvl, 0.85); u.name = H.T('Wild {pet}', { pet: H.FORMS[f.pet.sp].n }); u.wild = f.pet.sp; enemies.push(u); S.book[f.pet.sp] = Math.max(S.book[f.pet.sp] || 0, 2); }
    const live = pets.filter(Boolean), ens = live.length === 3 ? H.ensembleOf(live.map((p) => H.SPECIES[Rd.species(p)].family)) : null;
    const battle = new H.Battle({ allies, enemies, rng: rnd, ensemble: ens ? ens.id : null });
    // note who falls in which order: a wild pet is easier to win over once its Din are beaten
    battle.fallOrder = []; const emit = battle.emit.bind(battle);
    battle.emit = (e) => { emit(e); if (e.t !== 'fall') return; battle.fallOrder.push(e.u); const foes = battle.units.filter((u) => u.side === 1);
      if (foes.some((u) => u.wild && u.alive) && foes.every((u) => u.wild || !u.alive)) for (const u of foes) if (u.wild && u.alive) { u.alive = false; u.hp = 0; u.calmed = true; battle.calmed = true; emit({ t: 'fall', u: u.uid }); } };
    return battle;
  };
  // The result of a fight. Returns everything the result sheet shows.
  Rd.finishBattle = (win, battle, rnd) => {
    const S = Rd.S, f = S.fight, out = { win, kind: f.kind, room: f.room, notes: 0, pxp: 0, pets: [], item: null, wild: null, capture: null, boss: false };
    rnd = rnd || Math.random; S.fight = null;
    if (!win) { out.back = S.lastVenue; if (f.kind === 'chapel') S.chapel.room = 0; Rd.save(); return out; }
    S.wins++;
    const b = Rd.bonus(), mult = (d) => (d.loud ? 1.5 : 1) * (H.DIN[d.id] && H.DIN[d.id].boss ? 3 : 1);
    let xp = 0; for (const d of f.din) { xp += R.dinXp(d.lvl) * mult(d); out.notes += Math.round(R.dinNotes(d.lvl) * mult(d)); }
    if (f.pet) xp += R.dinXp(f.pet.lvl);
    xp = Math.round(xp * (1 + b.xp)); out.notes += b.notes; out.holdNotes = b.notes;
    const inBand = Rd.bandPets().filter(Boolean);
    for (const p of S.pets) { const g = inBand.includes(p) ? xp : Rd.has('warmup') ? Math.round(xp / 2) : 0; if (!g) continue; const ups = petLevelUp(p, g); out.pets.push({ id: p.id, xp: g, ups, band: inBand.includes(p) }); }
    S.notes += out.notes;
    out.pxp = Math.round(f.din.reduce((a, d) => a + d.lvl * 1.5 * mult(d), 0) + (f.pet ? f.pet.lvl * 1.5 : 0)); out.pups = Rd.gainPlayer(out.pxp);
    if (rnd() < R.DROP) out.item = Rd.addItem(rnd() < 0.8 ? 'c' : 'r', rnd);
    // a wild pet: maybe it joins
    if (f.pet) {
      const sp = f.pet.sp, wildU = battle && battle.units.find((u) => u.wild), din = battle ? battle.units.filter((u) => u.side === 1 && !u.wild) : [];
      const dinFirst = !!(battle && battle.calmed);
      const tutorial = f.kind === 'group' && f.id === 'tut2';
      const ch = Rd.joinChance(sp, dinFirst), sure = tutorial || f.pet.sure, joined = sure || rnd() < ch.total;
      out.wild = { sp, lvl: f.pet.lvl, chance: sure ? 1 : ch.total, parts: ch.parts, joined, sure };
      if (joined) { if (Rd.owns(sp)) { S.petEcho[sp] = (S.petEcho[sp] || 0) + 1; out.wild.dup = true; S.book[sp] = 3; } else out.wild.pet = Rd.addPet(sp, f.pet.lvl).id; S.meets[sp] = 0; }
      else S.meets[sp] = (S.meets[sp] || 0) + 1;
    }
    // what the fight was for
    if (f.kind === 'group') { const st = (S.groups[f.id] = S.groups[f.id] || { gen: S.gen }); st.beaten = 1; const g0 = Rd.group(f.id);
      if (g0 && !g0.guard && !g0.tut) { const here = S.pos && W.at(S.pos.q, S.pos.r), opts = Rd.GROUPS.filter((g) => !g.guard && !g.tut && g !== g0 && !g.home.closed && g.home.reg === g0.home.reg && !Rd.groupLive(g) && (!here || W.hexDist(g.home, here) >= 3)); const n = opts[Math.floor(rnd() * opts.length)]; if (n) S.groups[n.id] = { gen: ++S.gen, beaten: 0, on: 1 }; } }
    if (f.kind === 'keeper') { S.caps[f.id] = 1; out.capture = f.id; S.lastVenue = f.id; out.pups += Rd.gainPlayer(50); out.pxp += 50; }
    if (f.kind === 'boss') { const reg = Rd.place(f.id).reg, nx = R.REGIONS[reg].opens; S.bosses[reg] = 1; if (reg === 'marsh') S.boss = 1; if (nx) { S.open[nx] = 1; W.setOpen(S.open); out.opens = nx; } out.boss = true; out.bossReg = reg; S.shells += 1; out.shellOpen = Rd.openShell(rnd); S.echo += 3; out.echo = 3; }
    if (f.kind === 'glade') { S.found[f.id] = 1; }
    if (f.kind === 'chapel') { S.chapel.room = f.room + 1; out.chapelNext = S.chapel.room; }
    Rd.check('battle', out); Rd.save(); return out;
  };

  /* ---------- the chapel ---------- */
  Rd.chapelStart = () => { Rd.S.chapel.room = 0; Rd.save(); };
  Rd.chapelChest = (i, rnd) => {
    const S = Rd.S, rm = R.CHAPEL.rooms[i], first = !S.chapel.cleared, out = { notes: Math.round(rm.notes * (first ? 1 : 0.5) * (Rd.has('nose') ? 2 : 1)) };
    S.notes += out.notes; if (rm.item && first) out.item = Rd.addItem(rm.item, rnd || Math.random); S.chapel.room = i + 1; Rd.save(); return out;
  };
  Rd.chapelDone = () => {
    const S = Rd.S, first = !S.chapel.cleared, out = { first, echo: 0 };
    if (first) { S.chapel.cleared = 1; S.echo += R.CHAPEL.reward.echo; out.echo = R.CHAPEL.reward.echo; }
    S.chapel.runs++; S.chapel.room = 0; Rd.check('chapel'); Rd.save(); return out;
  };

  /* ---------- gear ---------- */
  Rd.addItem = (rar, rnd) => { const S = Rd.S, keys = Object.keys(H.ITEM_TYPES), it = { id: S.nextItem++, rar, type: keys[Math.floor((rnd || Math.random)() * keys.length)] }; S.items.push(it); return it; };
  Rd.itemOwner = (id) => Rd.S.pets.find((p) => p.gear.includes(id)) || null;
  Rd.upgradeCost = (it) => R.UPGRADE[it.rar] || null;
  Rd.canUpgrade = (it) => { const c = Rd.upgradeCost(it), S = Rd.S; return !!c && S.notes >= c.notes && S.echo >= (c.echo || 0) && (it.rar !== 'e' || H.freeLegends(S, it.type).length > 0); };
  Rd.upgrade = (it, rnd) => {
    if (!Rd.canUpgrade(it)) return false; const S = Rd.S, c = Rd.upgradeCost(it); S.notes -= c.notes; S.echo -= c.echo || 0;
    it.rar = c.to; if (it.rar === 'l') { const free = H.freeLegends(S, it.type); it.leg = free[Math.floor((rnd || Math.random)() * free.length)]; }
    Rd.check('upgrade'); return true;
  };
  Rd.equip = (pet, slot, id) => { for (const p of Rd.S.pets) p.gear = p.gear.map((g) => (g === id ? null : g)); pet.gear[slot] = id; };

  /* ---------- evolving: a pet needs the level and the echoes ---------- */
  Rd.evoCheck = (pet, formId) => {
    const f = H.FORMS[formId], need = R.EVO_LV[f.tier] || 99;
    if (pet.lvl < need) return { ok: false, why: H.T('Needs level {n}', { n: need }) };
    return H.evoCheck(Rd.S, pet, formId);
  };
  Rd.evolve = (pet, formId) => Rd.evoCheck(pet, formId).ok && H.evolve(Rd.S, pet, formId);

  /* ---------- shells ---------- */
  Rd.shellPrice = () => Math.round(R.SHELL_PRICE * (1 + R.SHELL_STEP * Rd.S.bought));
  Rd.buyShell = () => { const S = Rd.S, c = Rd.shellPrice(); if (S.notes < c) return null; S.notes -= c; S.bought++; S.shells++; const r = Rd.openShell(); Rd.save(); return r; };
  Rd.openShell = (rnd) => {
    const S = Rd.S; if (S.shells <= 0) return null; S.shells--;
    const sp = H.SPECIES_ORDER[Math.floor((rnd || Math.random)() * H.SPECIES_ORDER.length)];
    if (Rd.owns(sp)) { S.petEcho[sp] = (S.petEcho[sp] || 0) + H.ECHO_DUP; return { sp, dup: true }; }
    const lead = Rd.S.pets.reduce((m, p) => Math.max(m, p.lvl), 1); return { sp, pet: Rd.addPet(sp, Math.max(1, lead - 2)) };
  };
  Rd.chooseStarter = (sp) => { const S = Rd.S; if (S.pets.length) return null; S.started = 1; const p = Rd.addPet(sp, R.START_LV); S.pos = { q: Rd.poiT('hush').q, r: Rd.poiT('hush').r }; Rd.save(); return p; };

  /* ---------- the map: walking, secrets, resting ---------- */
  Rd.fenced = () => { const q = Rd.quest(); return !!(q && q.fence); };
  Rd.allowed = (t) => W.walk(t) && (!Rd.fenced() || W.hexDist(t, Rd.poiT('hush')) <= Rd.quest().fence);
  Rd.enter = (t) => {
    const S = Rd.S, out = { found: [] }; S.pos = { q: t.q, r: t.r };
    for (const u of W.nbs(t).concat([t])) S.hum[W.key(u.q, u.r)] = 1;
    const reach = Rd.has('ears') ? 4 : 2;
    for (const P of R.PLACES.filter((p) => p.secret)) { const pt = Rd.poiT(P.id); if (!S.found[P.id + '_seen'] && W.hexDist(pt, t) <= reach) { S.found[P.id + '_seen'] = 1; out.found.push(P.id); } }
    // book: wild pets the band walks past are seen
    for (const g of Rd.liveGroups()) if (W.hexDist(g.home, t) <= 3) { const f = Rd.foes(g); if (f.pet && !S.book[f.pet.sp]) S.book[f.pet.sp] = 1; }
    if (Rd.quest() && Rd.quest().id === 'walk' && W.hexDist(t, Rd.BEND) <= 1) Rd.check('walk');
    Rd.save(); return out;
  };
  Rd.takePage = (id) => { const S = Rd.S; if (S.found[id]) return null; S.found[id] = 1; S.echo += 1; S.notes += 30; const ups = Rd.gainPlayer(30); Rd.save(); return { echo: 1, notes: 30, pxp: 30, ups }; };
  Rd.rest = (placeId) => {
    const S = Rd.S; S.lastVenue = placeId; S.gen++;
    for (const g of Rd.GROUPS) if (!g.guard && !g.tut && S.groups[g.id] && S.groups[g.id].beaten) S.groups[g.id] = { gen: S.gen, beaten: 0, on: g.spare ? 0 : 1 };
    Rd.save();
  };
  Rd.guardsLeft = (placeId) => Rd.GROUPS.filter((g) => g.place === placeId && g.guard && !(Rd.S.groups[g.id] && Rd.S.groups[g.id].beaten)).length;
  Rd.bossOpen = (reg) => { reg = reg || Rd.curReg(); return Rd.capCount(reg) === Rd.capTotal(reg); };

  /* ---------- the songbook ---------- */
  Rd.bookFlag = (reg) => (reg && reg !== 'marsh' ? 'book_' + reg : 'book');
  Rd.bookDone = (reg) => R.BOOKS[reg || 'marsh'].every((sp) => Rd.S.book[sp] === 3);
  Rd.claimBook = (reg) => { const S = Rd.S, fl = Rd.bookFlag(reg); if (!Rd.bookDone(reg) || S.flags[fl]) return false; S.flags[fl] = 1; S.shells++; const r = Rd.openShell(); Rd.save(); return r; };

  /* ---------- quests ---------- */
  Rd.quest = () => R.QUESTS[Rd.S.quest] || null;
  // Something happened: does it finish the current quest? Returns the finished quest (and pays it), or null.
  Rd.done = [];
  Rd.check = (ev) => {
    const S = Rd.S, q = Rd.quest(); if (!q || q.end) return null;
    const ok = { walk: ev === 'walk', fight: S.groups.tut1 && S.groups.tut1.beaten, friend: S.groups.tut2 && S.groups.tut2.beaten, wake: S.caps.hush, talent: Object.keys(S.talents).length > 0,
      build: (S.builds.hush || []).includes('windmill'), smith: ev === 'upgrade' || S.flags.upgraded, chapel: S.chapel.cleared }[q.id] || (q.all && Rd.bossOpen(q.all)) || (q.boss && Rd.bossDone(q.boss)) || (q.cap && S.caps[q.cap]);
    if (ev === 'upgrade') S.flags.upgraded = 1;
    if (!ok) return null;
    S.quest++; S.notes += q.notes || 0; S.echo += q.echo || 0; const ups = Rd.gainPlayer(q.xp || 0);
    const next = Rd.quest(); if (next && next.gift && !S.flags['gift_' + next.id]) { S.flags['gift_' + next.id] = 1; const it = { id: S.nextItem++, rar: 'c', type: next.gift }; S.items.push(it); }
    Rd.done.push({ q, ups }); Rd.save();
    // quests can finish one after another (a talent picked early, say)
    Rd.check('');
    return q;
  };
  Rd.takeDone = () => { const d = Rd.done; Rd.done = []; return d; };
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
