/* Hushsong — rules outside of battle: the save, the team, stages, rewards. No DOM. */
(function (H) {
  'use strict';
  H.newState = () => ({ v: 3, notes: 0, xp: 0, level: 1, stage: 1, pets: [], team: [null, null, null], hatch: null, flags: {}, nextId: 1, seen: {}, dinSeen: {},
    settings: { sound: 1, music: 0.7, sfx: 0.8, speed: 1, auto: 0 } });

  const shuffle = (arr, rnd) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  H.shuffle = shuffle;
  H.petById = (S, id) => S.pets.find((p) => p.id === id) || null;
  H.teamPets = (S) => S.team.map((id) => (id ? H.petById(S, id) : null));
  H.bandPets = H.teamPets;
  H.petTier = (pet) => H.FORMS[pet.form].tier;
  H.petSpecies = (pet) => H.FORMS[pet.form].sp;
  H.petFamily = (pet) => H.SPECIES[H.FORMS[pet.form].sp].family;
  H.owned = (S, sp) => S.pets.some((p) => H.petSpecies(p) === sp);

  H.addPet = (S, sp) => { const pet = { id: S.nextId++, form: sp, t1: false, t2: false }; S.pets.push(pet); S.seen[sp] = 1; const i = S.team.indexOf(null); if (i >= 0) S.team[i] = pet.id; return pet; };
  // Three pets you do not have yet. Fewer if fewer are left.
  H.hatchOptions = (S, rnd) => shuffle(H.SPECIES_ORDER.filter((sp) => !H.owned(S, sp)), rnd).slice(0, 3);
  H.setTeam = (S, slot, petId) => { const was = S.team.indexOf(petId); if (was >= 0) S.team[was] = S.team[slot]; S.team[slot] = petId; };

  /* evolution: paying once per step unlocks both branches of that step for this pet */
  H.evoCheck = (S, pet, formId) => {
    const f = H.FORMS[formId]; if (!f || f.sp !== H.petSpecies(pet)) return { ok: false, why: 'Not this pet.' };
    if (formId === pet.form) return { ok: false, why: 'Current form', current: true };
    const need = H.TIER_LEVEL[f.tier]; if (S.level < need) return { ok: false, why: `Reach level ${need}`, cost: 0, level: need };
    let cost = 0; if (f.tier >= 1 && !pet.t1) cost += H.TIER_COST[1]; if (f.tier >= 2 && !pet.t2) cost += H.TIER_COST[2];
    if (S.notes < cost) return { ok: false, why: `Needs ${cost} notes`, cost };
    return { ok: true, cost };
  };
  H.evolve = (S, pet, formId) => { const c = H.evoCheck(S, pet, formId); if (!c.ok) return false; S.notes -= c.cost; const f = H.FORMS[formId]; if (f.tier >= 1) pet.t1 = true; if (f.tier >= 2) pet.t2 = true; pet.form = formId; for (const id of H.formChain(formId)) S.seen[id] = 1; return true; };
  // The next forms this pet could take from where it is.
  H.nextForms = (pet) => H.childrenOf(pet.form);
  H.canEvolveAny = (S) => S.pets.find((p) => H.nextForms(p).some((f) => H.evoCheck(S, p, f).ok)) || null;

  H.gainXp = (S, n) => { let ups = 0; S.xp += n; while (S.level < H.MAX_LEVEL && S.xp >= H.xpNeed(S.level)) { S.xp -= H.xpNeed(S.level); S.level++; ups++; } if (S.level >= H.MAX_LEVEL) S.xp = 0; return ups; };

  H.startStage = (S, n, rnd) => {
    const st = H.stage(n), cycle = Math.floor((n - 1) / H.STORY_STAGES);
    const extra = cycle > 0 ? { n: 'Encore', d: 'Back for another round, and stronger.', mod: { hp: 0.25 * cycle, vol: 0.12 * cycle } } : null;
    const enemies = st.enemies.map((e) => H.buildDinUnit(e.id, e.lvl, e.loud, extra));
    for (const e of st.enemies) S.dinSeen[e.id] = 1;
    return new H.Battle({ allies: H.teamPets(S).map((p) => (p ? H.buildPetUnit(p, S.level) : null)), enemies, rng: rnd });
  };
  // Apply a finished battle. Returns what the result screen shows.
  H.finishStage = (S, n, win, rnd) => {
    const st = H.stage(n), out = { win, n, notes: 0, xp: 0, ups: 0, first: false, boss: st.boss, hatch: false, bonus: 0 };
    if (!win) { out.xp = Math.round((8 + 3 * n) * 0.25); out.ups = H.gainXp(S, out.xp); return out; }
    out.first = n >= S.stage; const k = out.first ? 1 : 0.5;
    out.notes = Math.round((6 + n) * (st.boss ? 3 : st.elite ? 1.5 : 1) * k);
    out.xp = Math.round((8 + 3 * n) * (st.boss ? 2 : st.elite ? 1.3 : 1) * k);
    S.notes += out.notes; out.ups = H.gainXp(S, out.xp);
    if (out.first) {
      S.stage = n + 1;
      if (H.isShellStage(n)) { const opts = H.hatchOptions(S, rnd); if (opts.length) { S.hatch = opts; out.hatch = true; } else { out.bonus = 100; S.notes += 100; } }
    }
    return out;
  };
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
