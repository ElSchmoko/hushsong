/* Hushsong — battle engine. No DOM. Turn-based: next() runs up to the next decision; act() carries one out. */
(function (H) {
  'use strict';
  const GMAX = 1000;
  H.GMAX = GMAX;
  H.rng = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  H.advantage = (a, b) => { const fa = H.FAMILIES[a], fb = H.FAMILIES[b]; if (fa && fa.beats === b) return 1; if (fb && fb.beats === a) return -1; return 0; };

  H.petStats = (pet, level) => {
    const form = H.FORMS[pet.form], sp = H.SPECIES[form.sp], kit = H.kitOf(pet.form), role = H.ROLES[kit.role], sc = H.petScale(level, form.tier);
    return { hp: sp.base.hp * role.hp * sc, vol: sp.base.vol * role.vol * sc, poise: sp.base.poise + role.poise, tempo: sp.base.tempo * role.tempo };
  };
  // S is optional: with it, the pet's equipment and star rank count too.
  H.petPerks = (pet, S) => {
    const kit = H.kitOf(pet.form), perks = kit.passive ? [kit.passive] : [];
    if (pet.rank) perks.push({ mod: { hp: pet.rank * H.RANK_STEP, vol: pet.rank * H.RANK_STEP } });
    if (S && pet.gear) for (const id of pet.gear) { const it = id && S.items.find((x) => x.id === id); if (it) perks.push(H.itemPerk(it)); }
    return perks;
  };
  H.buildPetUnit = (pet, level, S) => {
    const form = H.FORMS[pet.form], sp = H.SPECIES[form.sp], kit = H.kitOf(pet.form);
    return { name: form.n, form: pet.form, sprite: pet.form, family: sp.family, role: kit.role, lvl: level, base: H.petStats(pet, level), perks: H.petPerks(pet, S), kit, petId: pet.id };
  };
  // After floor 100 other bands turn up: evolved pets on the enemy side, cut down to enemy size.
  H.buildRivalUnit = (form, level, k) => {
    const f = H.FORMS[form], sp = H.SPECIES[f.sp], kit = H.kitOf(form), role = H.ROLES[kit.role], sc = H.dinScale(level); k = k || 1;
    return { name: 'Rival ' + f.n, form, sprite: form, family: sp.family, role: 'din', lvl: level, rival: true,
      base: { hp: sp.base.hp * role.hp * 0.6 * sc.hp * k * H.PLAIN_K[0], vol: sp.base.vol * role.vol * 0.72 * sc.vol * k * H.PLAIN_K[1], poise: Math.max(4, sp.base.poise + role.poise - 8), tempo: sp.base.tempo * role.tempo * 0.95 }, perks: kit.passive ? [kit.passive] : [], kit };
  };
  H.buildDinUnit = (id, level, loud, extra, k) => {
    const d = H.DIN[id], sc = H.dinScale(level), perks = []; k = k || 1;
    if (d.passive) perks.push(d.passive); if (d.boss) perks.push(H.SWELL); if (loud) perks.push(H.LOUD); if (extra) perks.push(extra);
    return { name: (loud ? 'Loud ' : '') + d.n, form: id, sprite: id, family: d.family, role: d.boss ? 'boss' : 'din', lvl: level, boss: !!d.boss, loud: !!loud,
      base: { hp: d.base.hp * sc.hp * k * (d.boss ? H.BOSS_K[0] : H.PLAIN_K[0]), vol: d.base.vol * sc.vol * k * (d.boss ? H.BOSS_K[1] : H.PLAIN_K[1]), poise: d.base.poise, tempo: d.base.tempo }, perks, kit: { beat: d.beat, phrase: d.phrase, finale: d.finale } };
  };

  class Battle {
    constructor(o) {
      this.rnd = o.rng || Math.random; this.units = []; this.over = null; this.turn = 0; this.ev = []; this.acting = null; this.waiting = null; this.rules = o.rules || {};
      o.allies.forEach((s, i) => s && this._add(s, 0, i)); o.enemies.forEach((s, i) => s && this._add(s, 1, i));
      for (const u of this.units) {
        u.max = Math.round(u.base.hp * (1 + this.mod(u, 'hp'))); u.hp = u.max;
        let g = this.rnd() * 0.12; for (const p of u.perks) if (p.startGauge) g = Math.max(g, p.startGauge);
        u.gauge = Math.min(GMAX - 1, g * GMAX);
        if (u.shift) u.family = H.FAMILY_ORDER[Math.floor(this.rnd() * 5)];
      }
      this.acting = '__start__'; this.ensemble = null; if (o.ensemble && H.ENS[o.ensemble]) this.openWith(o.ensemble); for (const u of this.units) this.fire(u, 'start'); this.setupRules(); this.acting = null;
      this.startEvents = this.ev; this.ev = [];
    }
    // The team's ensemble plays its opening: one boon, set before anyone moves.
    openWith(id) {
      const K = H.ENS_K, mine = this.alive(0), foes = this.alive(1), avgVol = mine.reduce((a, u) => a + this.vol(u), 0) / Math.max(1, mine.length);
      this.ensemble = id; this.emit({ t: 'ensemble', id });
      if (id === 'drumline') { mine.slice().sort((a, b) => this.tempo(b) - this.tempo(a)).forEach((u, i) => (u.gauge = GMAX - 1 - i)); for (const e of foes) { e.gauge = Math.min(e.gauge, GMAX * 0.12); this.applySt(null, e, 'sdown', K.slow); } }
      else if (id === 'stringtrio') this.ensCrits = K.crits;
      else if (id === 'windtrio') for (const u of mine) u.tail = 1 + K.tail;
      else if (id === 'brassband') for (const u of mine) u.perks.push({ ramp: { on: 'turn', per: K.cres, max: K.cresMax } });
      else if (id === 'choir') this.ensHarmony = K.harmony;
      else if (id === 'folk') for (const u of mine) this.applySt(null, u, 'sup', K.speed);
      else if (id === 'ragtime') for (const e of foes) this.applySt(null, e, 'pdown', K.weak);
      else if (id === 'rock') for (const u of mine) u.rockEncore = u.ab.some((a) => a.kind === 'finale') ? 'finale' : 'phrase';
      else if (id === 'marching') for (const u of mine) this.addShield(u, u.max * K.shield);
      else if (id === 'carnival') for (const e of foes) { const s = ['sdown', 'poison', 'pdown'][Math.floor(this.rnd() * 3)]; this.applySt(null, e, s, K.confetti, { rawVal: Math.max(1, Math.round(avgVol * 0.3)) }); }
      else if (id === 'swing') { const u = mine.reduce((b, x) => (this.tempo(x) > this.tempo(b) ? x : b), mine[0]); if (u) { u.gauge = GMAX - 1; u.bonusTurn = 1; } }
      else if (id === 'chamber') for (const u of mine) u.ward = K.ward;
      else if (id === 'serenade') for (const u of mine) this.applySt(null, u, 'regen', K.regen, { rawVal: Math.max(1, Math.round(avgVol * K.regenVal)) });
      else if (id === 'opera') for (const e of foes.slice().sort((a, b) => b.hp - a.hp).slice(0, K.stunN)) this.applySt(null, e, 'stun', K.stun);
      else if (id === 'hymn') this.ensRevive = K.hymn;
    }
    _add(spec, side, slot) {
      const ab = [], nb = this.rules.noBasics;
      if (spec.kit.beat) ab.push({ kind: 'beat', def: nb ? H.FEEDBACK : spec.kit.beat, cd: 0 });
      if (spec.kit.phrase) ab.push({ kind: 'phrase', def: spec.kit.phrase, cd: 0 });
      if (spec.kit.finale) ab.push({ kind: 'finale', def: spec.kit.finale, cd: 2 });
      const u = { uid: this.units.length, side, slot, spec, name: spec.name, family: spec.family, base: spec.base, perks: spec.perks.slice(), ab, hp: 1, max: 1, shield: 0, gauge: 0, st: {}, ramp: {}, once: {}, alive: true, turns: 0, boss: !!spec.boss, ccGuard: 0, giant: spec.giant || null };
      const sh = spec.perks.find((p) => p.shift); if (sh) { u.shift = sh.shift; u.enrageAt = sh.enrage; }
      this.units.push(u);
    }
    emit(e) { this.ev.push(e); }
    alive(side) { return this.units.filter((u) => u.side === side && u.alive); }
    mod(u, k) { let s = 0; for (const p of u.perks) if (p.mod && p.mod[k]) s += p.mod[k]; for (const v of this.units) if (v !== u && v.alive && v.side === u.side) for (const p of v.perks) if (p.aura && p.aura[k]) s += p.aura[k]; return s; }
    rampTotal(u) { let s = 0; for (const k in u.ramp) s += u.ramp[k]; return s; }
    bump(u, on) { u.perks.forEach((p, i) => { if (p.ramp && p.ramp.on === on) u.ramp[i] = Math.min(p.ramp.max, (u.ramp[i] || 0) + p.ramp.per); }); }
    low(u) { const lh = this.has(u, 'lowHp'); return lh && u.hp / u.max < lh.below ? lh : null; }
    vol(u) { const lh = this.low(u); return u.base.vol * (1 + this.mod(u, 'vol') + this.rampTotal(u) + (lh ? lh.vol : 0)) * (u.st.pup ? 1.25 : 1) * (u.st.pdown ? 0.75 : 1); }
    tempo(u) { const t = Math.max(20, u.base.tempo * (1 + this.mod(u, 'tempo')) * (u.tail || 1) * (u.st.sup ? 1.3 : 1) * (u.st.sdown ? 0.7 : 1)) * (this.mic && this.micHolder(u) ? this.rules.mic.tempo : 1); return this.rules.backwards ? Math.max(20, 10000 / t) : t; }
    poise(u) { return Math.max(0, u.base.poise + this.mod(u, 'poise')); }
    has(u, flag) { for (const p of u.perks) if (p[flag]) return p[flag]; return null; }
    sum(u, flag) { let s = 0; for (const p of u.perks) if (p[flag]) s += p[flag]; return s; }

    /* ----- house rules: the Daily Gig's twists and the Solo crowd. All of them are visible on the field. ----- */
    setupRules() {
      const R = this.rules;
      if (R.potato) { const foes = this.alive(1); if (foes.length) this.potato = { uid: foes[Math.floor(this.rnd() * foes.length)].uid, left: R.potato.every }; }
      if (R.mic) this.mic = [0, 1].map((side) => { const a = this.alive(side).sort((x, y) => x.slot - y.slot)[0]; return a ? a.uid : -1; });
    }
    // all damage from hits is scaled by the volume knob and, late in a long fight, by a restless crowd
    dmgMul() {
      const R = this.rules; let m = 1;
      if (R.volume) m *= Math.min(R.volume.max, R.volume.start + R.volume.per * Math.floor(this.turn / R.volume.every));
      if (R.restless && this.turn > R.restless.from) m *= 1 + R.restless.per * (this.turn - R.restless.from);
      return m;
    }
    micHolder(u) { return !!this.mic && this.mic[u.side] === u.uid; }
    // a move that is there but may not be used now: under Pass the Mic only the holder plays Skills and Specials
    locked(u, a) { return !!this.mic && a.kind !== 'beat' && !this.micHolder(u); }
    ready(u, a) { return a.cd === 0 && !this.locked(u, a); }
    echoK(u) { return this.rules.echo || this.sum(u, 'echoPedal'); }
    passMic(side) {
      if (!this.mic) return; const list = this.units.filter((v) => v.side === side).sort((x, y) => x.slot - y.slot), cur = list.findIndex((v) => v.uid === this.mic[side]);
      for (let i = 1; i <= list.length; i++) { const v = list[(cur + i + list.length) % list.length]; if (v.alive) { if (v.uid !== this.mic[side]) { this.mic[side] = v.uid; this.emit({ t: 'mark', u: v.uid, m: 'mic' }); } return; } }
      this.mic[side] = -1;
    }
    // what the field shows for the rules in play
    twState() { const R = this.rules; return { potato: this.potato ? Object.assign({}, this.potato) : null, mic: this.mic ? this.mic.slice() : null, vol: R.volume ? this.dmgMul() : 0, left: R.lastCall ? Math.max(0, R.lastCall - this.turn) : null, key: R.keyChange ? R.keyChange - (this.turn % R.keyChange) : null, restless: !!R.restless && this.turn > R.restless.from }; }
    // at the start of every turn: the potato's fuse, the key change
    tickRules() {
      const R = this.rules;
      if (R.keyChange && this.turn > 1 && (this.turn - 1) % R.keyChange === 0) { for (const u of this.alive(0).concat(this.alive(1))) u.family = H.FAMILY_ORDER[(H.FAMILY_ORDER.indexOf(u.family) + 1) % 5]; this.emit({ t: 'keychange', fams: this.units.map((u) => u.family) }); }
      if (this.potato && --this.potato.left <= 0) {
        const h = this.units[this.potato.uid], side = h ? h.side : 1; this.emit({ t: 'note', u: this.potato.uid, txt: 'Boom!' });
        if (h && h.alive) this.applyDamage(h, h.max * R.potato.pct, { kind: 'burst' });
        const other = this.alive(1 - side); if (!this.over && other.length) { this.potato = { uid: other[Math.floor(this.rnd() * other.length)].uid, left: R.potato.every }; this.emit({ t: 'mark', u: this.potato.uid, m: 'potato' }); }
      }
    }

    /* ----- turn order ----- */
    // Who acts in what order from here, assuming nothing changes.
    order(n) {
      const g = this.units.map((u) => u.gauge), out = [];
      if (this.waiting != null) out.push(this.waiting);
      while (out.length < n) {
        let best = -1, bt = Infinity;
        this.units.forEach((u, i) => { if (!u.alive) return; const t = (GMAX - g[i]) / this.tempo(u); if (t < bt - 1e-9) { bt = t; best = i; } });
        if (best < 0) break;
        this.units.forEach((u, i) => { if (u.alive) g[i] += this.tempo(u) * bt; }); g[best] = 0; out.push(best);
      }
      return out;
    }
    // Run until a pet needs an order (returns wait: uid) or one enemy has acted or the battle ends.
    next(auto) {
      if (this.over || this.waiting != null) return { events: [], wait: this.waiting };
      this.ev = [];
      if (this.rules.lastCall && this.turn >= this.rules.lastCall) { this.over = 'lose'; this.emit({ t: 'note', u: this.alive(0)[0] ? this.alive(0)[0].uid : 0, txt: 'Lights out!' }); this.emit({ t: 'end', win: false, why: 'time' }); return { events: this.ev, wait: null }; }
      let actor = null, bt = Infinity;
      for (const u of this.units) if (u.alive) { const t = (GMAX - u.gauge) / this.tempo(u); if (t < bt - 1e-9) { bt = t; actor = u; } }
      for (const u of this.units) if (u.alive) u.gauge = Math.min(GMAX, u.gauge + this.tempo(u) * bt);
      actor.gauge = 0; this.turn++; actor.turns++; this.acting = actor;
      this.emit({ t: 'turn', u: actor.uid });
      this.tickRules(); if (this.over) { this.acting = null; this.emit(this.sync()); return { events: this.ev, wait: null }; }
      if (actor.shift && actor.turns > 1 && (actor.turns - 1) % actor.shift === 0) { const i = H.FAMILY_ORDER.indexOf(actor.family); actor.family = H.FAMILY_ORDER[(i + 1 + Math.floor(this.rnd() * 3)) % 5]; this.emit({ t: 'shift', u: actor.uid, family: actor.family }); }
      if (actor.st.poison) this.applyDamage(actor, actor.st.poison.val, { kind: 'poison' });
      if (actor.alive && actor.st.regen) this.heal(null, actor, actor.st.regen.val);
      if (actor.alive) { this.bump(actor, 'turn'); this.fire(actor, 'turn'); }
      if (!actor.alive || this.over) { this.acting = null; this.checkOver(); this.emit(this.sync()); return { events: this.ev, wait: null }; }
      if (actor.st.stun) { this.emit({ t: 'skip', u: actor.uid }); this.endTurn(actor, null); this.emit(this.sync()); return { events: this.ev, wait: null }; }
      // the mic: everything is ready for whoever holds it
      if (this.mic && this.micHolder(actor)) actor.ab.forEach((a) => (a.cd = 0));
      // last turn's Skill or Special plays again, softer
      if (actor.echoNext) { const e = actor.echoNext; actor.echoNext = null; this.emit({ t: 'note', u: actor.uid, txt: 'Echo!' }); this.useAbility(actor, { kind: e.kind, def: e.def }, { powMul: e.k, reactive: true, target: e.target && e.target.alive ? e.target : null }); this.checkOver(); if (this.over || !actor.alive) { this.acting = null; this.emit(this.sync()); return { events: this.ev, wait: null }; } }
      if (actor.side === 0 && !auto) { this.waiting = actor.uid; this.emit(this.sync()); return { events: this.ev, wait: actor.uid }; }
      const pick = this.autoPick(actor); this.perform(actor, pick.ab, pick.target);
      this.emit(this.sync()); return { events: this.ev, wait: null };
    }
    // The player's order for the waiting pet.
    act(abIndex, targetUid) {
      const u = this.units[this.waiting]; if (!u) return null;
      const a = u.ab[abIndex]; if (!a || !this.ready(u, a)) return null;
      this.ev = []; this.waiting = null; this.acting = u;
      // no enemy picked: the move goes where it does the most good
      this.perform(u, a, targetUid == null ? (H.needsTarget(a.def) ? this.bestTarget(u, a.def) : null) : this.units[targetUid]);
      this.emit(this.sync()); return { events: this.ev, wait: null };
    }
    autoAct() { const u = this.units[this.waiting]; if (!u) return null; const p = this.autoPick(u); return this.act(u.ab.indexOf(p.ab), p.target ? p.target.uid : null); }
    perform(u, a, target) {
      this.useAbility(u, a, { target });
      const ek = a.kind !== 'beat' && u.alive ? this.echoK(u) : 0; if (ek) u.echoNext = { def: a.def, kind: a.kind, target, k: ek };
      // Duet: the partner joins in with its Basic move
      if (this.rules.duet && u.side === 0 && !this.over) { const p = this.alive(0).find((x) => x !== u); if (p && p.ab[0]) { const t = target && target.alive && target.side !== p.side ? target : this.bestTarget(p, p.ab[0].def); this.useAbility(p, p.ab[0], { powMul: this.rules.duet, reactive: true, target: t }); } }
      this.endTurn(u, a);
      if (!this.over && this.turn > 500) { this.over = 'lose'; this.emit({ t: 'end', win: false }); }
    }
    endTurn(u, used) {
      if (u.alive) {
        const cut = this.sum(u, 'cdCut'); for (const a of u.ab) { if (a === used) a.cd = a.def.cd ? Math.max(1, a.def.cd - cut) : 0; else if (a.cd > 0) a.cd--; }
        if (u.cdReset) { u.ab.forEach((a) => (a.cd = 0)); u.cdReset = false; }
        if (used && u.rockEncore === used.kind) { used.cd = 0; u.rockEncore = null; this.emit({ t: 'note', u: u.uid, txt: 'Encore!' }); }
        if (u.bonusTurn && !this.over) { u.bonusTurn = 0; u.gauge = GMAX; this.emit({ t: 'note', u: u.uid, txt: 'Again!' }); }
        const en = this.has(u, 'encore'); if (en && used && u.turns % en === 0 && !this.over) { u.gauge = GMAX; this.emit({ t: 'note', u: u.uid, txt: 'Encore!' }); }
        for (const k of Object.keys(u.st)) { const s = u.st[k]; if (s.fresh) s.fresh = false; else if (--s.dur <= 0) { delete u.st[k]; this.emit({ t: 'stoff', u: u.uid, s: k }); } }
      }
      if (this.mic && this.micHolder(u) && used) this.passMic(u.side);
      this.acting = null; this.checkOver();
    }
    // enemies a single hit from this unit may land on
    validTargets(u) { const foes = this.alive(1 - u.side); const t = foes.filter((x) => x.st.taunt); return t.length ? t : foes; }
    /* ----- choosing a move: auto battle and enemies think the same way ----- */
    // Every ready move is valued by what it would do right now, and a single-target move is tried on every enemy it may hit.
    // Values are in "share of a unit": 0.3 means about a third of a unit's HP removed, healed or shielded.
    // That makes it finish off weakened enemies, heal or shield hurt friends, and skip buffs and debuffs that are already up.
    autoPick(u) {
      let best = null;
      for (const a of u.ab) {
        if (!this.ready(u, a) || !this.usable(u, a.def)) continue;
        const cands = H.needsTarget(a.def) ? this.validTargets(u) : [null];
        for (const t of cands) { const sc = this.aiValue(u, a.def, t) * (0.96 + this.rnd() * 0.08) + (a.kind === 'beat' ? 0 : 0.01); if (!best || sc > best.sc) best = { ab: a, target: t, sc }; }
      }
      if (!best) { const vt = this.validTargets(u); return { ab: u.ab[0], target: vt[0] || null }; }
      if (!best.target) { const vt = this.validTargets(u); best.target = vt.length ? vt.reduce((b, x) => (this.aiValue(u, u.ab[0].def, x) > this.aiValue(u, u.ab[0].def, b) ? x : b), vt[0]) : null; }
      return best;
    }
    // the best enemy for a move the player fired without picking one
    bestTarget(u, def) { const vt = this.validTargets(u); return vt.length ? vt.reduce((b, x) => (this.aiValue(u, def, x) > this.aiValue(u, def, b) ? x : b), vt[0]) : null; }
    // expected damage of one hit, without dice
    // x (preview only): { fs: the first-hit bonus still waits, sure: an ensemble crit is due } plus the per-fallen and per-hurt bonuses
    expHit(src, tgt, pow, o, x) {
      if (tgt.st.dodge) return 0;
      let m = pow * this.vol(src); const adv = H.advantage(src.family, tgt.family); m *= adv > 0 ? 1.3 : adv < 0 ? 0.8 : 1;
      m *= 100 / (100 + this.poise(tgt) * (1 - Math.min(1, this.mod(src, 'pierce'))));
      m *= x && x.sure ? 1.5 + this.mod(src, 'critDmg') : 1 + Math.min(1, 0.05 + this.mod(src, 'crit') + (o.crit || 0)) * (0.5 + this.mod(src, 'critDmg'));
      let b = 0; const ex = this.has(src, 'execute');
      if (x) { if (x.fs) b += this.has(src, 'firstStrike') || 0; if (o.perFallen) b += o.perFallen * this.units.filter((v) => v.side === src.side && !v.alive).length; if (o.perLow) b += o.perLow * this.units.filter((v) => v.side === src.side && v !== src && (!v.alive || v.hp / v.max < 0.5)).length; } if (ex && tgt.hp / tgt.max < ex.below) b += ex.bonus;
      if (o.fresh && tgt.hp / tgt.max > 0.8) b += o.fresh; if (o.exec) b += o.exec * (1 - tgt.hp / tgt.max);
      if (o.vs) for (const k in o.vs) if (tgt.st[k]) b += o.vs[k]; if (o.ifSelf) for (const k in o.ifSelf) if (src.st[k]) b += o.ifSelf[k];
      for (const p of src.perks) if (p.vs) for (const k in p.vs) if (tgt.st[k]) b += p.vs[k];
      const lt = this.low(tgt); return m * (1 + b) * Math.max(0.2, 1 + this.mod(tgt, 'taken') - (lt ? lt.taken || 0 : 0)) * (tgt.st.offkey ? 1.25 : 1) * this.dmgMul();
    }
    aiValue(u, def, chosen) {
      const foes = this.alive(1 - u.side), pals = this.alive(u.side); if (!foes.length) return 0;
      const mv = foes.reduce((s, x) => s + this.vol(x), 0) / foes.length, wt = (t) => Math.max(0.6, Math.min(1.6, this.vol(t) / mv));
      const need = (t) => 1 - t.hp / t.max;
      // damage to one enemy: the share of it removed, worth more the weaker it already is, and a kill is worth extra
      const dmgV = (t, E, o) => { if (E <= 0) return 0; const life = t.hp + (o && o.shatter ? 0 : t.shield); let v = (Math.min(E, life) / t.max) * (1 + 0.8 * (1 - life / t.max)); if (E >= life) v += 0.5 + (o && o.onKill ? 0.3 : 0); return v * wt(t); };
      const healV = (t, amt) => { const eff = Math.min(amt, t.max - t.hp); return (eff / t.max) * (1 + 1.2 * need(t)); };
      const shieldV = (t, amt) => { const eff = Math.max(0, Math.min(amt, t.max * 0.6 - t.shield)); return (eff / t.max) * (0.45 + 0.9 * need(t)); };
      const stV = (t, k, dur, val) => {
        const cur = t.st[k], im = this.has(t, 'immune'); if (im && im.includes(k)) return 0;
        const left = cur ? cur.dur : 0; if (left >= dur) return 0; const f = (dur - left) / dur, foe = t.side !== u.side;
        if (foe) switch (k) {
          case 'stun': return t.st.stun ? 0 : 0.45 * wt(t);
          case 'pdown': return 0.07 * dur * f * wt(t);
          case 'sdown': return 0.06 * dur * f * wt(t);
          case 'offkey': return 0.08 * dur * f * wt(t);
          case 'poison': return Math.min(0.5, ((val || 0.3) * this.vol(u) * dur) / t.max) * (cur ? 0.6 : 1);
          default: return 0;
        }
        switch (k) {
          case 'pup': return 0.06 * dur * f * (this.vol(t) / Math.max(1, this.vol(u)));
          case 'sup': return 0.05 * dur * f;
          case 'regen': return Math.min(0.6, ((val || 0.4) * this.vol(u) * dur) / t.max) * (0.25 + need(t));
          case 'dodge': return 0.15 * (val || 1);
          case 'lifesong': return 0.05 * dur * f * Math.min(1.5, this.vol(t) / Math.max(1, this.vol(u))) * (0.4 + need(t));
          case 'taunt': { if (t.hp / t.max < 0.35) return 0.02; const others = pals.filter((x) => x !== t); return 0.08 + 0.5 * Math.max(0, ...others.map(need)); }
          default: return 0.05 * f;
        }
      };
      const ally = () => (pals.length ? pals.reduce((b, x) => (x.hp / x.max < b.hp / b.max ? x : b), pals[0]) : null);
      const groupOf = (t) => this.groupFor(u, t, chosen, foes, pals, ally);
      const fxV = (list) => {
        let v = 0;
        for (const fx of list || []) {
          const k = fx[0];
          if (k === 'dmg') {
            const o = fx[3] || {}, hits = o.h || 1; let ramp = 0; for (let i = 0; i < hits; i++) ramp += 1 + (o.inc || 0) * i;
            let ts, share = 1; if (fx[1] === 'rand') { ts = o.distinct ? foes : this.validTargets(u); share = 1 / Math.max(1, ts.length); } else ts = groupOf(fx[1]);
            for (const t of ts) {
              const E = this.expHit(u, t, fx[2], o) * ramp * share; v += dmgV(t, E, o);
              const dies = E >= t.hp + t.shield;
              if (!dies) { if (o.st) for (const s2 of o.st) v += stV(t, s2[0], s2[1], s2[3]) * (s2[2] != null ? s2[2] : 1) * share; if (o.randSt) v += 0.05 * o.randSt * share; if (o.push) v += o.push * 0.3 * wt(t) * share; }
              if (o.drain) v += healV(u, E * o.drain) * 0.8;
            }
            if (o.chain) for (const f of foes) if (!ts.includes(f)) v += dmgV(f, this.expHit(u, f, fx[2] * o.chain, {}), {});
            if (o.again) v += 0.4 * o.again;
            const sp = this.has(u, 'splash'); if (sp && fx[1] !== 'all') for (const f of foes) if (!ts.includes(f)) v += dmgV(f, this.expHit(u, f, fx[2] * sp, {}) * hits * share, {}) * 0.8;
          } else if (k === 'heal') { const o = fx[3] || {}; for (const t of groupOf(fx[1])) v += healV(t, o.pct ? t.max * o.pct : fx[2] * this.vol(u) * (1 + this.mod(u, 'heal'))); }
          else if (k === 'shield') { const o = fx[3] || {}; for (const t of groupOf(fx[1])) v += shieldV(t, o.pct ? u.max * o.pct : fx[2] * this.vol(u)); }
          else if (k === 'st') { const o = fx[4] || {}; for (const t of groupOf(fx[1])) v += stV(t, fx[2], fx[3], o.val) * (o.ch != null ? o.ch : 1); }
          else if (k === 'gauge') { for (const t of groupOf(fx[1])) v += t.side === u.side ? Math.max(0, fx[2]) * 0.3 : Math.max(0, -fx[2]) * 0.3 * wt(t); }
          else if (k === 'cleanse') { for (const t of groupOf(fx[1])) for (const s2 in t.st) if (!H.STATUS[s2].buff) v += s2 === 'stun' ? 0.4 : 0.1 * t.st[s2].dur; }
          else if (k === 'dispel') { for (const t of groupOf(fx[1])) { for (const s2 in t.st) if (H.STATUS[s2].buff && t.st[s2].dur < 90) v += 0.08 * t.st[s2].dur; v += t.shield / t.max; } }
          else if (k === 'revive') { if (this.units.some((x) => x.side === u.side && !x.alive && !x.revived)) v += 1 + fx[1]; }
          else if (k === 'if') { const all = this.units.filter((x) => x.side === u.side); const ok = fx[1] === 'allyHurt' ? all.some((x) => x.alive && x.hp / x.max < 0.85) : all.some((x) => !x.alive && !x.revived); v += fxV(ok ? fx[2] : fx[3]); }
          else if (k === 'random') { const vals = fx[2].map(fxV); v += (vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length)) * fx[1]; }
          else if (k === 'follow') v += pals.filter((x) => x !== u).length * fx[1] * 0.3;
          else if (k === 'detonate') { for (const t of groupOf(fx[1])) if (t.st.poison) v += dmgV(t, t.st.poison.val * t.st.poison.dur, { shatter: true }); }
          else if (k === 'spread') v += 0.15;
          else if (k === 'cdr') v += 0.25;
          else if (k === 'recoil') v -= fx[1] * 1.6 * (0.5 + (1 - u.hp / u.max));
        }
        return v;
      };
      return fxV(def.fx);
    }
    // who a move's part lands on, as the AI and the aiming preview see it (no dice)
    groupFor(u, t, chosen, foes, pals, ally) {
      foes = foes || this.alive(1 - u.side); pals = pals || this.alive(u.side);
      switch (t) {
        case 'one': return chosen ? [chosen] : this.validTargets(u).slice(0, 1);
        case 'all': return foes; case 'self': return [u]; case 'allies': return pals; case 'others': return pals.filter((x) => x !== u);
        case 'ally': { const a = ally ? ally() : pals.length ? pals.reduce((b, x) => (x.hp / x.max < b.hp / b.max ? x : b), pals[0]) : null; return a ? [a] : []; }
        case 'strong': { const o = pals.filter((x) => x !== u), p = o.length ? o : pals; return p.length ? [p.reduce((b, x) => (this.vol(x) > this.vol(b) ? x : b), p[0])] : []; }
        case 'slow': { const o = pals.filter((x) => x !== u); return o.length ? [o.reduce((b, x) => (x.gauge < b.gauge ? x : b), o[0])] : []; }
        case 'same': return chosen ? [chosen] : [];
      }
      return [];
    }
    // What a move is expected to do to each unit's HP, without dice: { uid: { dmg, heal } }. Used to preview a move while aiming.
    preview(u, def, chosen, mul) {
      mul = mul || 1;
      const out = {}, put = (t, k, v) => { if (v > 0) (out[t.uid] = out[t.uid] || { dmg: 0, heal: 0 })[k] += v; };
      const foes = this.alive(1 - u.side), pals = this.alive(u.side), song = u.st.lifesong ? 0.3 : 0;
      let first = !u.once.first, sure = u.side === 0 ? this.ensCrits || 0 : 0;
      // effects the move puts on before its later hits (Off-Key) are lent for the sum, then taken back
      const lent = [], lend = (t, s) => { if (!t.st[s]) { t.st[s] = { dur: 1 }; lent.push([t, s]); } };
      const walk = (list) => {
        for (const fx of list || []) {
          const k = fx[0];
          if (k === 'dmg') {
            const o = fx[3] || {}, hits = o.h || 1, sp = fx[1] !== 'all' && this.has(u, 'splash');
            let ts, share = 1; if (fx[1] === 'rand') { ts = o.distinct ? foes : this.validTargets(u); share = 1 / Math.max(1, ts.length); } else ts = this.groupFor(u, fx[1], chosen, foes, pals);
            let dealt = 0; const hitE = (t, pw, oo) => { const E = this.expHit(u, t, pw * mul, oo, { fs: first, sure: sure > 0 }) * share; first = false; if (sure > 0) sure--; put(t, 'dmg', E); dealt += E; };
            for (let i = 0; i < hits; i++) for (const t of ts) { hitE(t, fx[2] * (1 + (o.inc || 0) * i), o); if (sp) for (const f of foes) if (!ts.includes(f)) hitE(f, fx[2] * (1 + (o.inc || 0) * i) * sp, {}); }
            if (o.chain) for (const f of foes) if (!ts.includes(f)) hitE(f, fx[2] * o.chain, {});
            put(u, 'heal', dealt * ((o.drain || 0) + song + (this.has(u, 'leech') || 0)));
            if (o.st) for (const s2 of o.st) if (s2[0] === 'offkey' && (s2[2] == null || s2[2] >= 1)) for (const t of ts) lend(t, 'offkey');
          }
          else if (k === 'st') { if (fx[2] === 'offkey' && !(fx[4] && fx[4].ch < 1)) for (const t of this.groupFor(u, fx[1], chosen, foes, pals)) lend(t, 'offkey'); }
          else if (k === 'follow') { for (const p of pals) if (p !== u && p.ab[0]) { const sub = this.preview(p, p.ab[0].def, chosen, fx[1]); for (const id in sub) { const t = this.units[id]; put(t, 'dmg', sub[id].dmg); put(t, 'heal', sub[id].heal); } } } else if (k === 'heal') { const o = fx[3] || {}; for (const t of this.groupFor(u, fx[1], chosen, foes, pals)) put(t, 'heal', o.pct ? t.max * o.pct : fx[2] * mul * this.vol(u) * (1 + this.mod(u, 'heal'))); }
          else if (k === 'if') { const all = this.units.filter((x) => x.side === u.side); const ok = fx[1] === 'allyHurt' ? all.some((x) => x.alive && x.hp / x.max < 0.85) : all.some((x) => !x.alive && !x.revived); walk(ok ? fx[2] : fx[3]); }
          else if (k === 'detonate') { for (const t of this.groupFor(u, fx[1], chosen, foes, pals)) if (t.st.poison) put(t, 'dmg', t.st.poison.val * t.st.poison.dur); }
        }
      };
      try { walk(def.fx); } finally { for (const [t, s] of lent) delete t.st[s]; }
      return out;
    }
    usable(u, def) {
      if (!def.need) return true;
      const pals = this.units.filter((v) => v.side === u.side), hurt = pals.some((v) => v.alive && v.hp / v.max < 0.8), fallen = pals.some((v) => !v.alive && !v.revived);
      return def.need === 'hurt' ? hurt : def.need === 'fallen' ? fallen : hurt || fallen;
    }
    checkOver() { if (this.over) return; const a = this.alive(0).length, b = this.alive(1).length; if (!b) { this.over = 'win'; this.emit({ t: 'end', win: true }); } else if (!a) { this.over = 'lose'; this.emit({ t: 'end', win: false }); } }
    sideDead(side) { return !this.units.some((u) => u.side === side && u.alive); }
    sync() { return { t: 'sync', units: this.units.map((u) => ({ hp: u.hp, max: u.max, shield: u.shield, gauge: u.gauge, alive: u.alive, family: u.family, st: Object.fromEntries(Object.entries(u.st).map(([k, v]) => [k, v.dur])), cds: u.ab.map((a) => a.cd), lock: u.ab.map((a) => (this.locked(u, a) ? 1 : 0)) })), tw: this.twState() }; }

    /* ----- moves ----- */
    useAbility(u, a, ctx) {
      this.emit({ t: 'ability', u: u.uid, n: a.def.n, kind: a.kind, follow: !!ctx.reactive, tgt: ctx.target ? ctx.target.uid : -1 });
      const c = { src: u, kind: a.kind, powMul: ctx.powMul || 1, last: [], reactive: !!ctx.reactive, chosen: ctx.target && ctx.target.alive ? ctx.target : null };
      this.runFx(a.def.fx, c);
    }
    fire(u, name, extra) { for (const p of u.perks) if (p.on && p.on[name]) this.runFx(p.on[name], Object.assign({ src: u, kind: 'perk', powMul: 1, last: [], reactive: true }, extra || {})); }
    targets(c, t, used) {
      const src = c.src, foes = this.alive(1 - src.side), pals = this.alive(src.side);
      const minBy = (arr, f) => arr.reduce((b, x) => (f(x) < f(b) ? x : b), arr[0]);
      switch (t) {
        case 'one': { const vt = this.validTargets(src); if (!vt.length) return []; if (c.chosen && c.chosen.alive && vt.includes(c.chosen)) return [c.chosen]; const p = vt[Math.floor(this.rnd() * vt.length)]; c.chosen = p; return [p]; }
        case 'rand': { let pool = this.validTargets(src); if (!pool.length) return []; if (used) { const fr = foes.filter((x) => !used.has(x)); if (fr.length) pool = fr; } else pool = foes; return [pool[Math.floor(this.rnd() * pool.length)]]; }
        case 'all': return foes;
        case 'same': return c.last.filter((x) => x.alive);
        case 'self': return src.alive ? [src] : [];
        case 'allies': return pals;
        case 'others': return pals.filter((x) => x !== src);
        case 'ally': return pals.length ? [minBy(pals, (x) => x.hp / x.max)] : [];
        case 'strong': { const o = pals.filter((x) => x !== src), p = o.length ? o : pals; return p.length ? [minBy(p, (x) => -this.vol(x))] : []; }
        case 'slow': { const o = pals.filter((x) => x !== src); return o.length ? [minBy(o, (x) => x.gauge)] : []; }
        case 'attacker': return c.attacker && c.attacker.alive ? [c.attacker] : [];
      }
      return [];
    }
    runFx(list, c) {
      for (const fx of list) {
        if (this.over) return; const k = fx[0];
        if (k === 'dmg') this.fxDmg(fx, c);
        else if (k === 'heal') { const o = fx[3] || {}, ts = this.targets(c, fx[1]); for (const t of ts) this.heal(c.src, t, o.pct ? t.max * o.pct : fx[2] * this.vol(c.src) * c.powMul); c.last = ts; }
        else if (k === 'st') { const o = fx[4] || {}, ts = this.targets(c, fx[1]); for (const t of ts) this.applySt(c.src, t, fx[2], fx[3], o); if (fx[1] !== 'same') c.last = ts; }
        else if (k === 'shield') { const o = fx[3] || {}; for (const t of this.targets(c, fx[1])) this.addShield(t, o.pct ? c.src.max * o.pct : fx[2] * this.vol(c.src) * c.powMul); }
        else if (k === 'gauge') { for (const t of this.targets(c, fx[1])) this.pushGauge(t, fx[2]); }
        else if (k === 'cleanse') { for (const t of this.targets(c, fx[1])) this.strip(t, 0); }
        else if (k === 'dispel') { for (const t of this.targets(c, fx[1])) { this.strip(t, 1); if (t.shield) { t.shield = 0; this.emit({ t: 'shield', u: t.uid, shield: 0 }); } } }
        else if (k === 'revive') { const d = this.units.find((v) => v.side === c.src.side && !v.alive && !v.revived); if (d) this.revive(d, fx[1]); }
        else if (k === 'if') { const pals = this.units.filter((v) => v.side === c.src.side); const ok = fx[1] === 'allyHurt' ? pals.some((v) => v.alive && v.hp / v.max < 0.85) : pals.some((v) => !v.alive && !v.revived); this.runFx(ok ? fx[2] : fx[3], c); }
        else if (k === 'follow') { for (const p of this.alive(c.src.side)) if (p !== c.src && !this.over) this.useAbility(p, p.ab[0], { powMul: fx[1], reactive: true, target: c.chosen }); }
        else if (k === 'random') { const opts = fx[2].slice(); for (let i = 0; i < fx[1] && opts.length; i++) { const j = Math.floor(this.rnd() * opts.length); this.runFx(opts.splice(j, 1)[0], c); } }
        else if (k === 'detonate') { for (const t of this.targets(c, fx[1])) if (t.st.poison) { const d = t.st.poison.val * t.st.poison.dur; delete t.st.poison; this.emit({ t: 'stoff', u: t.uid, s: 'poison' }); this.applyDamage(t, d, { kind: 'poison', src: c.src }); } }
        else if (k === 'spread') { const from = c.last[0]; if (from && from.alive) for (const t of this.alive(1 - c.src.side)) if (t !== from) for (const s of ['sdown', 'poison', 'stun', 'pdown', 'offkey']) if (from.st[s]) this.applySt(null, t, s, from.st[s].dur, { rawVal: from.st[s].val }); }
        else if (k === 'cdr') c.src.cdReset = true;
        else if (k === 'recoil') { if (c.src.alive) this.applyDamage(c.src, c.src.max * fx[1], { kind: 'burst' }); }
      }
    }
    fxDmg(fx, c) {
      const tg = fx[1], pow = fx[2], o = fx[3] || {}, hits = o.h || 1; let extra = 0; const used = o.distinct ? new Set() : null; let main = [];
      for (let i = 0; i < hits + extra; i++) {
        if (this.over || !c.src.alive) break;
        const ts = this.targets(c, tg, used); if (!ts.length) break;
        for (const t of ts) { const r = this.hit(c.src, t, pow * c.powMul * (1 + (o.inc || 0) * i), o, c, tg === 'all'); if (r && r.crit && o.perCrit && extra < o.perCrit) extra++; if (used) used.add(t); }
        main = ts; c.last = ts;
      }
      if (o.chain && main.length && !this.over) for (const f of this.alive(1 - c.src.side)) if (!main.includes(f)) this.hit(c.src, f, pow * o.chain * c.powMul, {}, c, false);
      if (o.again && c.src.alive && !c.reactive && this.rnd() < o.again) { c.src.gauge = GMAX; this.emit({ t: 'note', u: c.src.uid, txt: 'Again!' }); }
    }
    hit(src, tgt, pow, o, c, aoe) {
      if (!tgt.alive || !src.alive) return null;
      if (tgt.st.dodge) { const s = tgt.st.dodge; s.val = (s.val || 1) - 1; if (s.val <= 0) { delete tgt.st.dodge; this.emit({ t: 'stoff', u: tgt.uid, s: 'dodge' }); } this.emit({ t: 'miss', src: src.uid, tgt: tgt.uid }); return { miss: true }; }
      let m = pow * this.vol(src); const adv = H.advantage(src.family, tgt.family);
      m *= adv > 0 ? 1.3 : adv < 0 ? 0.8 : 1;
      m *= 100 / (100 + this.poise(tgt) * (1 - Math.min(1, this.mod(src, 'pierce'))));
      let crit = this.rnd() < 0.05 + this.mod(src, 'crit') + (o.crit || 0); if (src.side === 0 && this.ensCrits > 0) { this.ensCrits--; crit = true; } if (crit) m *= 1.5 + this.mod(src, 'critDmg');
      let b = 0;
      const fs = this.has(src, 'firstStrike'); if (fs && !src.once.first) { src.once.first = true; b += fs; }
      const ex = this.has(src, 'execute'); if (ex && tgt.hp / tgt.max < ex.below) b += ex.bonus;
      const lt = this.low(tgt);
      if (o.fresh && tgt.hp / tgt.max > 0.8) b += o.fresh;
      if (o.exec) b += o.exec * (1 - tgt.hp / tgt.max);
      if (o.perFallen) b += o.perFallen * this.units.filter((v) => v.side === src.side && !v.alive).length;
      if (o.perLow) b += o.perLow * this.units.filter((v) => v.side === src.side && v !== src && (!v.alive || v.hp / v.max < 0.5)).length;
      if (o.vs) for (const s in o.vs) if (tgt.st[s]) b += o.vs[s];
      if (o.ifSelf) for (const s in o.ifSelf) if (src.st[s]) b += o.ifSelf[s];
      for (const p of src.perks) if (p.vs) for (const s in p.vs) if (tgt.st[s]) b += p.vs[s];
      m *= (1 + b) * Math.max(0.2, 1 + this.mod(tgt, 'taken') - (lt ? lt.taken || 0 : 0)) * (tgt.st.offkey ? 1.25 : 1) * this.dmgMul() * (0.95 + this.rnd() * 0.1);
      m = Math.max(1, Math.round(m));
      let abs = 0; if (tgt.shield > 0 && !o.shatter) { abs = Math.min(tgt.shield, m); tgt.shield -= abs; }
      const dealt = m - abs;
      this.applyDamage(tgt, dealt, { src, abs, crit, adv, kind: 'hit' });
      if (tgt.alive) {
        if (o.st) for (const s of o.st) this.applySt(src, tgt, s[0], s[1], { ch: s[2], val: s[3] });
        if (!c.reactive) for (const p of src.perks) if (p.hitSt) for (const s of p.hitSt) this.applySt(src, tgt, s[0], s[1], { ch: s[2], val: s[3] });
        if (o.randSt && (o.randCh == null || this.rnd() < o.randCh)) this.applySt(src, tgt, ['pdown', 'sdown', 'poison', 'offkey'][Math.floor(this.rnd() * 4)], o.randSt, {});
        if (o.push) this.pushGauge(tgt, -o.push);
        const dp = this.has(src, 'debuffPush'); if (dp && Object.keys(tgt.st).some((s) => !H.STATUS[s].buff)) this.pushGauge(tgt, -dp, true);
      }
      if (src.alive) {
        if (o.drain && dealt > 0) this.heal(src, src, dealt * o.drain, true);
        const le = this.has(src, 'leech'); if (le && dealt > 0) this.heal(src, src, dealt * le, true);
        if (src.st.lifesong && dealt > 0) this.heal(src, src, dealt * 0.3, true);
        this.bump(src, 'hit');
        if (crit) { const cg = this.has(src, 'critGauge'); if (cg) src.gauge = Math.min(GMAX, src.gauge + cg * GMAX); }
      }
      if (!c.reactive && src.alive) {
        const th = this.has(tgt, 'thorns'); if (th && dealt > 0) this.applyDamage(src, Math.max(1, dealt * th), { src: tgt, kind: 'thorn' });
        if (tgt.alive && src.alive) { this.fire(tgt, 'hurt', { attacker: src }); const ct = this.has(tgt, 'counter'); if (ct && src.alive && tgt.alive && this.rnd() < ct.ch) this.react(tgt, src, ct.pow, 'Hit Back'); }
        for (const g of this.alive(tgt.side)) if (g !== tgt && src.alive) { const gd = this.has(g, 'guard'); if (gd && this.rnd() < gd.ch) this.react(g, src, gd.pow, 'Pack Leader'); }
      }
      // Hot Potato: whoever holds it passes it on with a single hit
      if (this.potato && this.potato.uid === src.uid && !aoe && !c.reactive && tgt.side !== src.side && tgt.alive) { this.potato.uid = tgt.uid; this.emit({ t: 'mark', u: tgt.uid, m: 'potato' }); }
      if (!tgt.alive && o.onKill && src.alive) this.runFx(o.onKill, c);
      if (!tgt.alive && src.alive && !c.reactive) this.fire(src, 'kill');
      if (!aoe && !c.reactive && src.alive && !this.over) { const sp = this.has(src, 'splash'); if (sp) for (const f of this.alive(1 - src.side)) if (f !== tgt) this.hit(src, f, pow * sp, {}, Object.assign({}, c, { reactive: true }), true); }
      return { crit, dealt, dead: !tgt.alive };
    }
    react(u, at, pow, name) { this.emit({ t: 'ability', u: u.uid, n: name, kind: 'counter', follow: true, tgt: at.uid }); this.hit(u, at, pow, {}, { src: u, kind: 'counter', powMul: 1, last: [], reactive: true }, false); }
    applyDamage(tgt, amt, info) {
      if (!tgt.alive) return; amt = Math.max(0, Math.round(amt));
      // Shared Stage: a hit is split evenly over the whole side
      if (this.rules.share && info.kind === 'hit' && !info.split) { const side = this.alive(tgt.side); if (side.length > 1) { for (const v of side) this.applyDamage(v, amt / side.length, Object.assign({}, info, { split: true, abs: v === tgt ? info.abs : 0 })); return; } }
      if (info.kind === 'poison' && tgt.shield > 0) { const a = Math.min(tgt.shield, amt); tgt.shield -= a; info.abs = a; amt -= a; }
      let stood = false; if (amt >= tgt.hp && tgt.hp > 1 && !tgt.once.stand && this.has(tgt, 'lastStand')) { tgt.once.stand = true; stood = true; amt = tgt.hp - 1; this.emit({ t: 'note', u: tgt.uid, txt: 'Hangs on!' }); }
      const was = tgt.hp / tgt.max; tgt.hp = Math.max(0, tgt.hp - amt);
      this.emit({ t: 'dmg', src: info.src ? info.src.uid : -1, tgt: tgt.uid, amt, abs: info.abs || 0, crit: !!info.crit, adv: info.adv || 0, kind: info.kind, hp: tgt.hp, shield: tgt.shield });
      if (stood) this.fire(tgt, 'stand');
      if (tgt.hp <= 0) {
        tgt.alive = false; tgt.st = {}; tgt.gauge = 0; tgt.shield = 0; this.emit({ t: 'fall', u: tgt.uid });
        if (tgt.side === 0 && this.ensRevive) { const p = this.ensRevive; this.ensRevive = 0; this.revive(tgt, p); return; }
        if (this.potato && this.potato.uid === tgt.uid) { const same = this.alive(tgt.side), pool = same.length ? same : this.alive(1 - tgt.side); if (pool.length) { this.potato.uid = pool[Math.floor(this.rnd() * pool.length)].uid; this.emit({ t: 'mark', u: this.potato.uid, m: 'potato' }); } }
        if (this.mic && this.mic[tgt.side] === tgt.uid) this.passMic(tgt.side);
        if (this.sideDead(0) || this.sideDead(1)) { this.checkOver(); return; }
        // Chain Reaction: the fallen bursts and hits its own side
        if (this.rules.chain) { this.emit({ t: 'note', u: tgt.uid, txt: 'Chain!' }); for (const v of this.alive(tgt.side)) this.applyDamage(v, tgt.max * this.rules.chain, { kind: 'burst' }); if (this.over) return; }
        for (const g of this.alive(tgt.side)) this.fire(g, 'allyFall'); return;
      }
      // a giant staggers each time it loses another quarter of its HP
      if (tgt.giant) for (const step of tgt.giant) if (was > step && tgt.hp / tgt.max <= step) { this.emit({ t: 'note', u: tgt.uid, txt: 'Staggered!' }); this.applySt(null, tgt, 'stun', 1, { force: true }); this.applySt(null, tgt, 'offkey', 2, { force: true }); }
      if (tgt.enrageAt && !tgt.once.enrage && tgt.hp / tgt.max < tgt.enrageAt) { tgt.once.enrage = true; tgt.st.sup = { dur: 99, fresh: false }; this.emit({ t: 'st', u: tgt.uid, s: 'sup', dur: 99 }); this.emit({ t: 'note', u: tgt.uid, txt: 'Faster!' }); }
    }
    revive(u, pct) { u.alive = true; u.revived = true; u.hp = Math.max(1, Math.round(u.max * pct)); u.gauge = 0; u.st = {}; this.emit({ t: 'revive', u: u.uid, hp: u.hp }); }
    heal(src, tgt, amt, quiet, echo) {
      if (!tgt.alive) return; if (src) amt *= 1 + this.mod(src, 'heal'); amt = Math.round(amt); if (amt <= 0) return;
      const before = tgt.hp; tgt.hp = Math.min(tgt.max, tgt.hp + amt); const got = tgt.hp - before, over = amt - got;
      if (got > 0) this.emit({ t: 'heal', tgt: tgt.uid, amt: got, hp: tgt.hp });
      if (got > 0 && !echo && tgt.side === 0 && this.ensHarmony) for (const p of this.alive(0)) if (p !== tgt) this.heal(null, p, got * this.ensHarmony, true, true);
      if (src && over > 0 && this.has(src, 'overheal')) this.addShield(tgt, over);
      if (src && src !== tgt && !quiet) { const hg = this.has(src, 'healGauge'); if (hg) tgt.gauge = Math.min(GMAX, tgt.gauge + hg * GMAX); }
    }
    addShield(t, amt) { if (!t.alive) return; amt = Math.round(amt); if (amt <= 0) return; t.shield = Math.min(Math.round(t.max * 0.6), t.shield + amt); this.emit({ t: 'shield', u: t.uid, shield: t.shield, amt }); }
    pushGauge(t, frac, quiet) { if (!t.alive) return; t.gauge = Math.max(0, Math.min(GMAX, t.gauge + frac * GMAX)); if (!quiet) this.emit({ t: 'gauge', u: t.uid, d: frac }); }
    strip(t, buffs) { for (const k of Object.keys(t.st)) if (!!H.STATUS[k].buff === !!buffs && t.st[k].dur < 90) { delete t.st[k]; this.emit({ t: 'stoff', u: t.uid, s: k }); } }
    applySt(src, tgt, s, dur, o) {
      o = o || {}; if (!tgt.alive) return false; if (o.ch != null && this.rnd() >= o.ch) return false;
      const def = H.STATUS[s];
      const im = !o.force && this.has(tgt, 'immune'); if (im && im.includes(s)) { this.emit({ t: 'note', u: tgt.uid, txt: 'Shrugs it off' }); return false; }
      if (!def.buff && tgt.ward && !o.force) { tgt.ward--; this.emit({ t: 'note', u: tgt.uid, txt: 'Shrugs it off' }); return false; }
      if (!def.buff) {
        if (src && (s === 'sdown' || s === 'pdown' || s === 'offkey')) dur += this.mod(src, 'statusDur');
      }
      const cur = tgt.st[s]; let val = o.val;
      if (s === 'poison') { val = o.rawVal != null ? o.rawVal : Math.max(1, Math.round((o.val || 0.3) * (src ? this.vol(src) : 10))); if (cur) val = Math.min(cur.val + val, val * 3); }
      else if (s === 'regen') { val = o.rawVal != null ? o.rawVal : Math.max(1, Math.round((o.val || 0.4) * (src ? this.vol(src) : 10))); if (cur) val = Math.max(cur.val, val); }
      else if (s === 'dodge') val = Math.max(o.val || 1, cur ? cur.val : 0);
      tgt.st[s] = { dur: Math.max(dur, cur ? cur.dur : 0), val, fresh: tgt === this.acting };
      this.emit({ t: 'st', u: tgt.uid, s, dur: tgt.st[s].dur }); return true;
    }
  }
  H.Battle = Battle;
  // Play a whole battle on auto (used by the balance sims).
  H.autoRun = (b) => { let n = 0; while (!b.over && n++ < 3000) b.next(true); return b.over === 'win'; };

})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
