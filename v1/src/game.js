/* Hushsong — game rules outside of battle: save state, hatching, delves, rewards. No DOM. */
(function (H) {
  'use strict';

  H.newState = () => ({
    v: 2, notes: 0, xp: 0, level: 1, shells: { starter: 3 }, pets: [], band: [null, null, null], gear: {}, seen: {}, dinSeen: {},
    regions: {}, delve: null, flags: {}, nextId: 1, tally: { fights: 0, delves: 0, hatched: 0 },
    settings: { sound: 1, music: 0.7, sfx: 0.8, speed: 1, autoCue: 0 },
  });

  const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];
  const shuffle = (arr, rnd) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  H.pick = pick; H.shuffle = shuffle;

  H.petById = (S, id) => S.pets.find((p) => p.id === id) || null;
  H.bandPets = (S) => S.band.map((id) => (id ? H.petById(S, id) : null));
  H.petTier = (pet) => H.FORMS[pet.form].tier;
  H.petSpecies = (pet) => H.FORMS[pet.form].sp;
  H.petFamily = (pet) => H.SPECIES[H.FORMS[pet.form].sp].family;

  /* ----- hatching ----- */
  H.shellCount = (S) => Object.values(S.shells).reduce((a, b) => a + b, 0);
  H.shellPool = (key) => (key === 'starter' ? H.STARTER_POOL : H.REGIONS[key].pool);
  H.nextShellKey = (S) => { for (const k of ['starter'].concat(H.REGION_ORDER)) if (S.shells[k] > 0) return k; return null; };
  H.hatchOptions = (S, key, rnd) => {
    const pool = H.shellPool(key);
    const owned = new Set(S.pets.map(H.petSpecies));
    const fresh = shuffle(pool.filter((s) => !owned.has(s)), rnd), rest = shuffle(pool.filter((s) => owned.has(s)), rnd);
    let opts;
    if (key === 'starter') opts = fresh.concat(rest).slice(0, 3);          // starters: never a species you already have
    else { opts = fresh.slice(0, 1).concat(shuffle(fresh.slice(1).concat(rest), rnd)).slice(0, 3); }
    return shuffle(opts, rnd).map((sp) => ({ sp, trait: pick(Object.keys(H.TRAITS), rnd) }));
  };
  H.addPet = (S, sp, trait) => {
    const pet = { id: S.nextId++, form: sp, trait, gear: [null, null], t1: false, t2: false, shows: 0 };
    S.pets.push(pet); S.seen[sp] = 1; S.tally.hatched++;
    const i = S.band.indexOf(null); if (i >= 0) S.band[i] = pet.id;
    return pet;
  };
  H.releasePet = (S, id) => {
    const pet = H.petById(S, id); if (!pet || S.pets.length <= 3) return 0;
    for (const g of pet.gear) if (g) S.gear[g] = (S.gear[g] || 0) + 1;
    S.pets = S.pets.filter((p) => p.id !== id); S.band = S.band.map((b) => (b === id ? null : b));
    const refund = 15 + (pet.t1 ? 20 : 0) + (pet.t2 ? 70 : 0); S.notes += refund; return refund;
  };

  /* ----- evolution ----- */
  // What it takes to put this pet into `formId`. Paying once per tier unlocks both branches for good.
  H.evoCheck = (S, pet, formId) => {
    const f = H.FORMS[formId]; if (!f || f.sp !== H.petSpecies(pet)) return { ok: false, why: 'Not this pet.' };
    if (formId === pet.form) return { ok: false, why: 'Current form.', current: true };
    const need = H.TIER_LEVEL[f.tier];
    if (S.level < need) return { ok: false, why: `Band level ${need} needed.`, cost: 0 };
    let cost = 0;
    if (f.tier >= 1 && !pet.t1) cost += H.TIER_COST[1];
    if (f.tier >= 2 && !pet.t2) cost += H.TIER_COST[2];
    if (S.notes < cost) return { ok: false, why: `Costs ${cost} notes.`, cost };
    return { ok: true, cost };
  };
  H.evolve = (S, pet, formId) => {
    const c = H.evoCheck(S, pet, formId); if (!c.ok) return false;
    S.notes -= c.cost; const f = H.FORMS[formId];
    if (f.tier >= 1) pet.t1 = true; if (f.tier >= 2) pet.t2 = true;
    pet.form = formId; for (const id of H.formChain(formId)) S.seen[id] = 1;
    return true;
  };

  /* ----- gear ----- */
  H.gearUnlocked = (S) => {
    const out = [];
    H.REGION_ORDER.forEach((r, i) => { if (i === 0 || (S.regions[H.REGION_ORDER[i - 1]] || {}).clears) out.push(...H.REGIONS[r].gear); });
    return out;
  };
  H.buyGear = (S, g) => { const d = H.GEAR[g]; if (S.notes < d.cost) return false; S.notes -= d.cost; S.gear[g] = (S.gear[g] || 0) + 1; return true; };
  H.equip = (S, pet, slot, g) => {
    const old = pet.gear[slot];
    if (g) { if (!(S.gear[g] > 0) || pet.gear.includes(g)) return false; S.gear[g]--; }
    if (old) S.gear[old] = (S.gear[old] || 0) + 1;
    pet.gear[slot] = g || null; return true;
  };
  H.rerollTrait = (S, pet, rnd) => { if (S.notes < 25) return false; S.notes -= 25; const o = Object.keys(H.TRAITS).filter((t) => t !== pet.trait); pet.trait = pick(o, rnd); return true; };

  /* ----- xp ----- */
  H.gainXp = (S, n) => {
    let ups = 0; S.xp += n;
    while (S.level < H.MAX_LEVEL && S.xp >= H.xpNeed(S.level)) { S.xp -= H.xpNeed(S.level); S.level++; ups++; }
    if (S.level >= H.MAX_LEVEL) S.xp = 0;
    return ups;
  };

  /* ----- delves ----- */
  const COLS = [
    [['fight', 1]],
    [['fight', 5], ['event', 3], ['shell', 1]],
    [['fight', 4], ['elite', 3], ['event', 2]],
    [['fight', 3], ['rest', 3], ['event', 3], ['shell', 1]],
    [['elite', 4], ['fight', 3], ['event', 2]],
    [['rest', 1], ['fight', 1]],
  ];
  const wpick = (tbl, rnd) => { const tot = tbl.reduce((s, t) => s + t[1], 0); let r = rnd() * tot; for (const t of tbl) { r -= t[1]; if (r <= 0) return t[0]; } return tbl[0][0]; };
  H.regionOpen = (S, r) => { const i = H.REGION_ORDER.indexOf(r); return i === 0 || !!(S.regions[H.REGION_ORDER[i - 1]] || {}).clears; };
  H.genDelve = (S, regionId, encore, rnd) => {
    const cols = []; let id = 0, shell = false, elite = false;
    for (let c = 0; c < 6; c++) {
      const n = c === 0 || c === 5 ? 2 : 2 + (rnd() < 0.55 ? 1 : 0);
      const lanes = n === 3 ? [0, 1, 2] : pick([[0, 1], [1, 2], [0, 2]], rnd);
      const col = []; const usedT = {};
      for (let i = 0; i < n; i++) {
        let type;
        if (c === 5) type = i === 0 ? 'rest' : 'fight';
        else for (let tries = 0; tries < 12; tries++) {
          type = wpick(COLS[c], rnd);
          if (type === 'shell' && shell) continue;
          if ((type === 'rest' || type === 'elite' || type === 'shell' || type === 'event') && usedT[type]) continue;
          break;
        }
        if (type === 'shell') shell = true; if (type === 'elite') elite = true; usedT[type] = 1;
        col.push({ id: id++, col: c, lane: lanes[i], type, next: [], done: false });
      }
      if (c === 5 && rnd() < 0.5) [col[0].type, col[1].type] = [col[1].type, col[0].type];
      if (c === 4 && !elite) col[0].type = 'elite';
      cols.push(col);
    }
    cols.push([{ id: id++, col: 6, lane: 1, type: 'boss', next: [], done: false }]);
    for (let c = 0; c < 6; c++) {
      const a = cols[c], b = cols[c + 1];
      for (const n of a) { let t = b.filter((m) => Math.abs(m.lane - n.lane) <= 1); if (!t.length) t = [b.reduce((x, y) => (Math.abs(y.lane - n.lane) < Math.abs(x.lane - n.lane) ? y : x))]; n.next = t.map((m) => m.id); }
      for (const m of b) if (!a.some((n) => n.next.includes(m.id))) { const n = a.reduce((x, y) => (Math.abs(y.lane - m.lane) < Math.abs(x.lane - m.lane) ? y : x)); n.next.push(m.id); }
    }
    const hp = {}; for (const p of H.bandPets(S)) if (p) hp[p.id] = 1;
    const evs = shuffle(H.EVENTS.map((e) => e.id), rnd); let ei = 0;
    for (const col of cols) for (const n of col) if (n.type === 'event') n.ev = evs[ei++ % evs.length];
    return { region: regionId, encore: !!encore, cols, at: -1, hp, ornaments: [], cueStart: false, loot: { notes: 0, xp: 0, shells: 0, gear: [] }, fights: 0, seed: Math.floor(rnd() * 1e9) };
  };
  H.regionLevels = (r, encore) => (encore ? H.REGIONS[r].encore : H.REGIONS[r].lvl);
  H.delveNode = (dv, id) => { for (const c of dv.cols) for (const n of c) if (n.id === id) return n; return null; };
  H.delveChoices = (dv) => (dv.at < 0 ? dv.cols[0].map((n) => n.id) : H.delveNode(dv, dv.at).next);
  H.nodeLevel = (dv, node) => {
    const lv = H.regionLevels(dv.region, dv.encore); const t = Math.min(1, node.col / 5);
    return Math.round(lv[0] + (lv[1] - lv[0]) * t);
  };
  const FRONTNESS = { clank: 0, racket: 1, hiss: 2, gibber: 3, whine: 4 };
  H.encounter = (dv, node, rnd) => {
    const R = H.REGIONS[dv.region], L = H.nodeLevel(dv, node);
    if (node.type === 'boss') {
      const adds = dv.region === 'fen' && !dv.encore ? [R.adds[0]] : R.adds.slice(0, 2);
      return [H.buildDinUnit(R.boss, L, false, dv.encore)].concat(adds.map((a) => H.buildDinUnit(a, Math.max(1, L - 1), false, dv.encore)));
    }
    const first = dv.region === 'fen' && !dv.encore;
    const n = first && node.col === 0 ? 2 : 3;
    let ids = []; for (let i = 0; i < n; i++) ids.push(pick(R.din, rnd));
    if (ids.filter((x) => x === 'gibber').length > 1) ids[ids.indexOf('gibber')] = R.din[0];
    if (ids.filter((x) => x === 'clank').length > 1) ids[ids.indexOf('clank')] = R.din[0];
    ids.sort((a, b) => FRONTNESS[a] - FRONTNESS[b]);
    return ids.map((d, i) => H.buildDinUnit(d, L, node.type === 'elite' && i === 0, dv.encore));
  };
  H.ornamentPerks = (dv) => dv.ornaments.map((o) => H.ORNAMENTS[o]);
  H.bandUnits = (S, dv) => {
    const pets = H.bandPets(S);
    const bonus = H.bandBonus(pets.map((p) => (p ? H.petFamily(p) : null)));
    const orn = dv ? H.ornamentPerks(dv).filter((o) => !o.team) : [];
    return pets.map((p) => { if (!p) return null; const u = H.buildPetUnit(p, S.level, [bonus].concat(orn)); if (dv) u.hpPct = dv.hp[p.id] != null ? dv.hp[p.id] : 1; if (dv && u.hpPct <= 0) return null; return u; });
  };
  H.startBattle = (S, dv, node, rnd) => {
    const enemies = H.encounter(dv, node, rnd);
    for (const e of enemies) S.dinSeen[e.form] = 1;
    const b = new H.Battle({ allies: H.bandUnits(S, dv), enemies, teamPerks: H.ornamentPerks(dv).filter((o) => o.team), cueStart: dv.cueStart, rng: rnd });
    dv.cueStart = false;
    return b;
  };
  H.ornamentChoices = (dv, rnd, n) => shuffle(Object.keys(H.ORNAMENTS).filter((o) => !dv.ornaments.includes(o)), rnd).slice(0, n || 3);
  H.gearDrop = (S, dv, rnd) => {
    const i = H.REGION_ORDER.indexOf(dv.region); let pool = [];
    for (let k = 0; k <= i; k++) pool = pool.concat(H.REGIONS[H.REGION_ORDER[k]].gear);
    if (dv.encore) pool = H.GEAR_ORDER.slice();
    return pick(pool, rnd);
  };
  // Apply the outcome of a finished battle. Returns what the reward screen shows.
  H.afterBattle = (S, dv, node, battle, rnd) => {
    const win = battle.over === 'win'; const L = H.nodeLevel(dv, node);
    const out = { win, notes: 0, xp: 0, ups: 0, gear: null, shells: 0, ornaments: null, cleared: false, firstClear: false };
    S.tally.fights++;
    for (const u of battle.units) if (u.side === 0 && u.spec.petId) { dv.hp[u.spec.petId] = u.alive ? u.hp / u.max : 0; const p = H.petById(S, u.spec.petId); if (p) p.shows++; }
    if (!win) return out;
    const k = node.type === 'boss' ? 3 : node.type === 'elite' ? 1.6 : 1;
    const enc = dv.encore ? 1.3 : 1;
    out.notes = Math.round((7 + 2.2 * L) * (node.type === 'boss' ? 2.5 : node.type === 'elite' ? 1.5 : 1) * enc);
    out.xp = Math.round((12 + 5 * L) * k * enc);
    S.notes += out.notes; out.ups = H.gainXp(S, out.xp);
    dv.loot.notes += out.notes; dv.loot.xp += out.xp; dv.fights++;
    for (const id in dv.hp) dv.hp[id] = dv.hp[id] <= 0 ? 0.25 : Math.min(1, dv.hp[id] + 0.2);
    if (node.type === 'elite' || node.type === 'boss') { out.gear = H.gearDrop(S, dv, rnd); S.gear[out.gear] = (S.gear[out.gear] || 0) + 1; dv.loot.gear.push(out.gear); }
    if (node.type === 'elite' && rnd() < 0.15) out.shells = 1;
    if (node.type === 'boss') {
      const key = dv.region + (dv.encore ? '_encore' : ''); const R = (S.regions[dv.region] = S.regions[dv.region] || { clears: 0, encore: 0 });
      out.firstClear = dv.encore ? !R.encore : !R.clears; out.cleared = true;
      if (dv.encore) R.encore++; else R.clears++;
      out.shells = out.firstClear ? 2 : 1; S.tally.delves++;
    } else out.ornaments = H.ornamentChoices(dv, rnd);
    if (out.shells) { S.shells[dv.region] = (S.shells[dv.region] || 0) + out.shells; dv.loot.shells += out.shells; }
    return out;
  };
  H.applyEventFx = (S, dv, fx, rnd) => {
    const out = {};
    if (fx.notes) { S.notes += fx.notes; dv.loot.notes += fx.notes; out.notes = fx.notes; }
    if (fx.xp) { out.ups = H.gainXp(S, fx.xp); dv.loot.xp += fx.xp; out.xp = fx.xp; }
    if (fx.heal) for (const id in dv.hp) dv.hp[id] = Math.min(1, Math.max(dv.hp[id], 0.01) + fx.heal);
    if (fx.hurt) for (const id in dv.hp) if (dv.hp[id] > 0) dv.hp[id] = Math.max(0.05, dv.hp[id] - fx.hurt);
    if (fx.cue) dv.cueStart = true;
    if (fx.gear) { out.gear = H.gearDrop(S, dv, rnd); S.gear[out.gear] = (S.gear[out.gear] || 0) + 1; dv.loot.gear.push(out.gear); }
    if (fx.ornament) out.ornaments = H.ornamentChoices(dv, rnd);
    if (fx.swap) { if (dv.ornaments.length) { out.lost = dv.ornaments.splice(Math.floor(rnd() * dv.ornaments.length), 1)[0]; } out.ornaments = H.ornamentChoices(dv, rnd); }
    return out;
  };
  H.restNode = (dv) => { for (const id in dv.hp) dv.hp[id] = Math.min(1, Math.max(dv.hp[id], 0) + 0.6); };
  H.bandDown = (dv) => Object.values(dv.hp).every((v) => v <= 0);

})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
