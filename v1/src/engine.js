/* Hushsong — battle engine. No DOM. Emits events the interface plays back. */
(function (H) {
  'use strict';
  const GMAX = 1000;
  H.GMAX = GMAX;

  H.rng = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  H.advantage = (a, b) => {
    const fa = H.FAMILIES[a], fb = H.FAMILIES[b];
    if (fa && fa.beats === b) return 1;
    if (fb && fb.beats === a) return -1;
    return 0;
  };

  /* ----- unit specs ----- */
  H.petStats = (pet, level) => {
    const form = H.FORMS[pet.form], sp = H.SPECIES[form.sp], kit = H.kitOf(pet.form), role = H.ROLES[kit.role];
    const sc = H.petScale(level, form.tier);
    return { hp: sp.base.hp * role.hp * sc, vol: sp.base.vol * role.vol * sc, poise: sp.base.poise + role.poise, tempo: sp.base.tempo * role.tempo };
  };
  H.buildPetUnit = (pet, level, extraPerks) => {
    const form = H.FORMS[pet.form], sp = H.SPECIES[form.sp], kit = H.kitOf(pet.form);
    const perks = [];
    if (kit.passive) perks.push(kit.passive);
    if (pet.trait && H.TRAITS[pet.trait]) perks.push(H.TRAITS[pet.trait]);
    for (const g of pet.gear || []) if (g && H.GEAR[g]) perks.push(H.GEAR[g]);
    for (const p of extraPerks || []) if (p) perks.push(p);
    return { name: form.n, form: pet.form, sprite: pet.form, family: sp.family, role: kit.role, lvl: level, base: H.petStats(pet, level), perks, kit, petId: pet.id, hpPct: pet.hpPct };
  };
  H.buildDinUnit = (id, level, loud, encore) => {
    const d = H.DIN[id], sc = H.dinScale(level);
    const perks = [];
    if (d.passive) perks.push(d.passive);
    if (d.boss) perks.push(H.SWELL);
    if (loud) perks.push(H.LOUD);
    if (encore) perks.push(H.ENCORE);
    return { name: (loud ? 'Loud ' : '') + d.n, form: id, sprite: id, family: d.family, role: d.boss ? 'mute' : 'din', lvl: level, boss: !!d.boss, loud: !!loud,
      base: { hp: d.base.hp * sc.hp, vol: d.base.vol * sc.vol, poise: d.base.poise, tempo: d.base.tempo }, perks, kit: { beat: d.beat, phrase: d.phrase, finale: d.finale } };
  };

  /* ----- battle ----- */
  class Battle {
    constructor(o) {
      this.rnd = o.rng || Math.random;
      this.units = [];
      this.teamPerks = (o.teamPerks || []).filter(Boolean);
      this.cue = o.cueStart ? 100 : 0;
      this.cueRate = 1 + this.teamPerks.reduce((s, p) => s + (p.cueRate || 0), 0);
      this.over = null; this.turn = 0; this.ev = []; this.acting = null; this.usedDaCapo = false;
      o.allies.forEach((s, i) => s && this._add(s, 0, i));
      o.enemies.forEach((s, i) => s && this._add(s, 1, i));
      for (const u of this.units) {
        u.max = Math.round(u.base.hp * (1 + this.mod(u, 'hp')));
        u.hp = u.spec.hpPct != null ? Math.max(1, Math.round(u.max * u.spec.hpPct)) : u.max;
        let g = this.rnd() * 0.12;
        for (const p of u.perks) { if (p.startGauge) g = Math.max(g, p.startGauge); if (p.startGaugeAdd) g += p.startGaugeAdd; if (p.finaleReady) u.ab.forEach((a) => { if (a.kind === 'finale') a.cd = 0; }); }
        u.gauge = Math.min(GMAX - 1, g * GMAX);
        if (u.shift) u.family = H.FAMILY_ORDER[Math.floor(this.rnd() * 5)];
      }
      this.acting = '__start__';
      for (const u of this.units) this.fire(u, 'start');
      this.acting = null;
      this.startEvents = this.ev; this.ev = [];
    }
    _add(spec, side, slot) {
      const ab = [];
      if (spec.kit.beat) ab.push({ kind: 'beat', def: spec.kit.beat, cd: 0 });
      if (spec.kit.phrase) ab.push({ kind: 'phrase', def: spec.kit.phrase, cd: 0 });
      if (spec.kit.finale) ab.push({ kind: 'finale', def: spec.kit.finale, cd: 2 });
      const u = { uid: this.units.length, side, slot, spec, name: spec.name, family: spec.family, base: spec.base, perks: spec.perks.slice(), ab,
        hp: 1, max: 1, shield: 0, gauge: 0, st: {}, ramp: {}, once: {}, alive: true, turns: 0, boss: !!spec.boss, ccGuard: 0, hitOnce: false };
      const sh = spec.perks.find((p) => p.shift); if (sh) { u.shift = sh.shift; u.enrageAt = sh.enrage; }
      this.units.push(u);
    }
    emit(e) { this.ev.push(e); }
    alive(side) { return this.units.filter((u) => u.side === side && u.alive); }
    mod(u, k) {
      let s = 0;
      for (const p of u.perks) { if (p.mod && p.mod[k]) s += p.mod[k]; if (p.slotMod && p.slotMod[u.slot] && p.slotMod[u.slot][k]) s += p.slotMod[u.slot][k]; }
      for (const v of this.units) if (v !== u && v.alive && v.side === u.side) for (const p of v.perks) if (p.aura && p.aura[k]) s += p.aura[k];
      return s;
    }
    rampTotal(u) { let s = 0; for (const k in u.ramp) s += u.ramp[k]; return s; }
    bump(u, on) { u.perks.forEach((p, i) => { if (p.ramp && p.ramp.on === on) u.ramp[i] = Math.min(p.ramp.max, (u.ramp[i] || 0) + p.ramp.per); }); }
    vol(u) { return u.base.vol * (1 + this.mod(u, 'vol') + this.rampTotal(u)) * (u.st.sharp ? 1.25 : 1) * (u.st.flat ? 0.75 : 1); }
    tempo(u) {
      let m = 1 + this.mod(u, 'tempo');
      for (const p of u.perks) if (p.lowTempo && u.hp / u.max < p.lowTempo.below) m += p.lowTempo.tempo;
      return Math.max(20, u.base.tempo * m * (u.st.rush ? 1.3 : 1) * (u.st.drag ? 0.7 : 1));
    }
    poise(u) { return Math.max(0, u.base.poise + this.mod(u, 'poise')); }
    has(u, flag) { for (const p of u.perks) if (p[flag]) return p[flag]; return null; }

    /* --- turn order --- */
    step() {
      if (this.over) return null;
      this.ev = [];
      let actor = null, bt = Infinity;
      for (const u of this.units) if (u.alive) { const t = (GMAX - u.gauge) / this.tempo(u); if (t < bt - 1e-9) { bt = t; actor = u; } }
      for (const u of this.units) if (u.alive) u.gauge = Math.min(GMAX, u.gauge + this.tempo(u) * bt);
      actor.gauge = GMAX;
      this.emit({ t: 'adv', actor: actor.uid, gauges: this.units.map((u) => u.gauge) });
      actor.gauge = 0;
      this.takeTurn(actor);
      if (!this.over && this.turn > 400) { this.over = 'lose'; this.emit({ t: 'end', win: false, stall: true }); }
      this.emit(this.sync());
      return { actor: actor.uid, events: this.ev };
    }
    sync() {
      return { t: 'sync', cue: this.cue, units: this.units.map((u) => ({ hp: u.hp, max: u.max, shield: u.shield, gauge: u.gauge, alive: u.alive, family: u.family,
        st: Object.fromEntries(Object.entries(u.st).map(([k, v]) => [k, v.dur])), cds: u.ab.map((a) => a.cd) })) };
    }
    takeTurn(u) {
      this.turn++; u.turns++; this.acting = u;
      this.emit({ t: 'turn', u: u.uid });
      if (u.ccGuard > 0) u.ccGuard--;
      if (u.shift && u.turns > 1 && (u.turns - 1) % u.shift === 0) {
        const i = H.FAMILY_ORDER.indexOf(u.family); u.family = H.FAMILY_ORDER[(i + 1 + Math.floor(this.rnd() * 3)) % 5];
        this.emit({ t: 'shift', u: u.uid, family: u.family });
      }
      if (u.st.dis) this.applyDamage(u, u.st.dis.val, { kind: 'dis' });
      if (u.alive && u.st.refrain) this.heal(null, u, u.st.refrain.val);
      if (u.alive) { this.bump(u, 'turn'); this.fire(u, 'turn'); }
      let used = null;
      if (u.alive && !this.over) {
        if (u.st.rest || u.st.lull) this.emit({ t: 'skip', u: u.uid, s: u.st.rest ? 'rest' : 'lull' });
        else { used = this.choose(u); this.useAbility(u, used, {}); }
      }
      if (u.alive) {
        for (const a of u.ab) { if (a === used) a.cd = Math.max(0, a.def.cd + (a.kind === 'phrase' ? this.mod(u, 'cdPhrase') : 0)); else if (a.cd > 0) a.cd--; }
        if (u.cdReset) { u.ab.forEach((a) => (a.cd = 0)); u.cdReset = false; }
        for (const k of Object.keys(u.st)) { const s = u.st[k]; if (s.fresh) s.fresh = false; else if (--s.dur <= 0) { delete u.st[k]; this.emit({ t: 'stoff', u: u.uid, s: k }); } }
        if (used && !this.over) {
          const ag = this.has(u, 'again'); if (ag && this.rnd() < ag) { u.gauge = GMAX; this.emit({ t: 'note', u: u.uid, txt: 'Encore!' }); }
          if (u.side === 0) this.cue = Math.min(100, this.cue + 11 * this.cueRate * (this.has(u, 'cueBonus') ? 2 : 1));
        }
      }
      this.acting = null;
      this.checkOver();
    }
    choose(u) {
      for (const kind of ['finale', 'phrase']) { const a = u.ab.find((x) => x.kind === kind); if (a && a.cd === 0 && this.usable(u, a.def)) return a; }
      return u.ab[0];
    }
    usable(u, def) {
      if (!def.need) return true;
      const pals = this.units.filter((v) => v.side === u.side);
      const hurt = pals.some((v) => v.alive && v.hp / v.max < 0.8), fallen = pals.some((v) => !v.alive && !v.revived);
      if (def.need === 'hurt') return hurt;
      if (def.need === 'fallen') return fallen;
      return hurt || fallen;
    }
    canCue() { return this.cue >= 100 && !this.over; }
    doCue(uid) {
      const u = this.units[uid]; if (!u || !u.alive || u.side !== 0 || !this.canCue()) return null;
      this.ev = []; this.cue = 0; const prev = this.acting; this.acting = u;
      const a = u.ab.find((x) => x.kind === 'finale') || u.ab.find((x) => x.kind === 'phrase') || u.ab[0];
      this.useAbility(u, a, { powMul: 1.3, isCue: true });
      this.acting = prev; this.checkOver(); this.emit(this.sync());
      return { actor: uid, events: this.ev };
    }
    checkOver() {
      if (this.over) return;
      const a = this.alive(0).length, b = this.alive(1).length;
      if (!b) { this.over = 'win'; this.emit({ t: 'end', win: true }); } else if (!a) { this.over = 'lose'; this.emit({ t: 'end', win: false }); }
    }
    sideDead(side) { return !this.units.some((u) => u.side === side && u.alive); }

    /* --- abilities --- */
    useAbility(u, a, ctx) {
      this.emit({ t: 'ability', u: u.uid, n: a.def.n, kind: a.kind, cue: !!ctx.isCue, follow: !!ctx.reactive });
      const c = { src: u, kind: a.kind, powMul: ctx.powMul || 1, last: [], reactive: !!ctx.reactive, splashed: false };
      this.runFx(a.def.fx, c);
      if (a.kind === 'beat' && !ctx.reactive && u.alive && !this.sideDead(1 - u.side)) {
        const db = this.has(u, 'doubleBeat'); if (db && this.rnd() < db) { this.emit({ t: 'note', u: u.uid, txt: 'Staccato!' }); c.splashed = false; this.runFx(a.def.fx, c); }
      }
      if (a.kind === 'finale' && u.alive) this.fire(u, 'finale');
    }
    fire(u, name, extra) {
      for (const p of u.perks) if (p.on && p.on[name]) this.runFx(p.on[name], Object.assign({ src: u, kind: 'perk', powMul: 1, last: [], reactive: true }, extra || {}));
    }
    targets(c, t, used) {
      const src = c.src, foes = this.alive(1 - src.side), pals = this.alive(src.side);
      const one = (arr, f) => { if (!arr.length) return []; let pool = arr; const sp = arr.filter((x) => x.st.spot); if (sp.length && arr === foes) pool = sp; if (used) { const fr = pool.filter((x) => !used.has(x)); if (fr.length) pool = fr; } return [f(pool)]; };
      const minBy = (arr, f) => arr.reduce((b, x) => (f(x) < f(b) ? x : b), arr[0]);
      switch (t) {
        case 'front': return one(foes, (p) => minBy(p, (x) => x.slot));
        case 'back': return one(foes, (p) => minBy(p, (x) => -x.slot));
        case 'low': return one(foes, (p) => minBy(p, (x) => x.hp / x.max));
        case 'high': return one(foes, (p) => minBy(p, (x) => -this.vol(x)));
        case 'rand': return one(foes, (p) => p[Math.floor(this.rnd() * p.length)]);
        case 'all': return foes;
        case 'same': { const l = c.last.filter((x) => x.alive); return l; }
        case 'self': return src.alive ? [src] : [];
        case 'allies': return pals;
        case 'others': return pals.filter((x) => x !== src);
        case 'allyLow': return pals.length ? [minBy(pals, (x) => x.hp / x.max)] : [];
        case 'allyHigh': { const o = pals.filter((x) => x !== src); const p = o.length ? o : pals; return p.length ? [minBy(p, (x) => -this.vol(x))] : []; }
        case 'allySlow': { const o = pals.filter((x) => x !== src); return o.length ? [minBy(o, (x) => x.gauge)] : []; }
        case 'attacker': return c.attacker && c.attacker.alive ? [c.attacker] : [];
      }
      return [];
    }
    runFx(list, c) {
      for (const fx of list) {
        if (this.over) return;
        const k = fx[0];
        if (k === 'dmg') this.fxDmg(fx, c);
        else if (k === 'heal') { const o = fx[3] || {}; const ts = this.targets(c, fx[1]); for (const t of ts) this.heal(c.src, t, o.pct ? t.max * o.pct : fx[2] * this.vol(c.src) * c.powMul); c.last = ts; }
        else if (k === 'st') { const o = fx[4] || {}; const ts = this.targets(c, fx[1]); for (const t of ts) this.applySt(c.src, t, fx[2], fx[3], o); if (fx[1] !== 'same') c.last = ts; }
        else if (k === 'shield') { const o = fx[3] || {}; for (const t of this.targets(c, fx[1])) this.addShield(t, o.pct ? c.src.max * o.pct : fx[2] * this.vol(c.src) * c.powMul); }
        else if (k === 'gauge') { for (const t of this.targets(c, fx[1])) this.pushGauge(t, fx[2]); }
        else if (k === 'cleanse') { for (const t of this.targets(c, fx[1])) this.strip(t, 0); }
        else if (k === 'dispel') { for (const t of this.targets(c, fx[1])) { this.strip(t, 1); if (t.shield) { t.shield = 0; this.emit({ t: 'shield', u: t.uid, shield: 0 }); } } }
        else if (k === 'revive') { const d = this.units.find((v) => v.side === c.src.side && !v.alive && !v.revived); if (d) this.revive(d, fx[1]); }
        else if (k === 'if') { const pals = this.units.filter((v) => v.side === c.src.side); const ok = fx[1] === 'allyHurt' ? pals.some((v) => v.alive && v.hp / v.max < 0.85) : pals.some((v) => !v.alive && !v.revived); this.runFx(ok ? fx[2] : fx[3], c); }
        else if (k === 'follow') { for (const p of this.alive(c.src.side)) if (p !== c.src && !this.over) this.useAbility(p, p.ab[0], { powMul: fx[1], reactive: true }); }
        else if (k === 'random') { const opts = fx[2].slice(); for (let i = 0; i < fx[1] && opts.length; i++) { const j = Math.floor(this.rnd() * opts.length); this.runFx(opts.splice(j, 1)[0], c); } }
        else if (k === 'detonate') { for (const t of this.targets(c, fx[1])) if (t.st.dis) { const d = t.st.dis.val * t.st.dis.dur; delete t.st.dis; this.emit({ t: 'stoff', u: t.uid, s: 'dis' }); this.applyDamage(t, d, { kind: 'dis', src: c.src }); } }
        else if (k === 'cdr') c.src.cdReset = true;
        else if (k === 'cdUp') { for (const t of this.targets(c, fx[1])) t.ab.forEach((a) => { if (a.kind !== 'beat') a.cd += fx[2]; }); }
      }
    }
    fxDmg(fx, c) {
      const tg = fx[1], pow = fx[2], o = fx[3] || {}; const hits = o.h || 1; let extra = 0; const used = o.distinct ? new Set() : null;
      let main = [];
      for (let i = 0; i < hits + extra; i++) {
        if (this.over || !c.src.alive) break;
        const ts = this.targets(c, tg, used); if (!ts.length) break;
        for (const t of ts) {
          const r = this.hit(c.src, t, pow * c.powMul * (1 + (o.inc || 0) * i), o, c, tg === 'all');
          if (r && r.crit && o.perCrit && extra < o.perCrit) extra++;
          if (used) used.add(t);
        }
        main = ts; c.last = ts;
      }
      if (o.chain && main.length && !this.over) for (const f of this.alive(1 - c.src.side)) if (!main.includes(f)) this.hit(c.src, f, pow * o.chain * c.powMul, {}, c, false);
      if (c.kind === 'beat' && !c.splashed && tg !== 'all' && main.length && !this.over) {
        const sp = this.has(c.src, 'beatSplash');
        if (sp) { c.splashed = true; for (const f of this.alive(1 - c.src.side)) if (!main.includes(f)) this.hit(c.src, f, pow * sp * c.powMul, {}, Object.assign({}, c, { kind: 'splash' }), false); }
      }
      if (o.again && c.src.alive && !c.reactive && this.rnd() < o.again) { c.src.gauge = GMAX; this.emit({ t: 'note', u: c.src.uid, txt: 'Again!' }); }
    }
    hit(src, tgt, pow, o, c, aoe) {
      if (!tgt.alive || !src.alive) return null;
      if (tgt.st.offbeat) { const s = tgt.st.offbeat; s.val = (s.val || 1) - 1; if (s.val <= 0) { delete tgt.st.offbeat; this.emit({ t: 'stoff', u: tgt.uid, s: 'offbeat' }); } this.emit({ t: 'miss', src: src.uid, tgt: tgt.uid }); return { miss: true }; }
      let m = pow * this.vol(src);
      const adv = H.advantage(src.family, tgt.family);
      m *= adv > 0 ? 1.3 : adv < 0 ? 0.8 : 1;
      m *= 100 / (100 + this.poise(tgt) * (1 - Math.min(1, this.mod(src, 'pierce'))));
      const crit = this.rnd() < 0.05 + this.mod(src, 'crit') + (o.crit || 0);
      if (crit) m *= 1.5 + this.mod(src, 'critDmg');
      let b = 0;
      if (o.fresh && tgt.hp / tgt.max > 0.8) b += o.fresh;
      if (o.exec) b += o.exec * (1 - tgt.hp / tgt.max);
      if (o.vs) for (const s in o.vs) if (tgt.st[s]) b += o.vs[s];
      if (o.ifSelf) for (const s in o.ifSelf) if (src.st[s]) b += o.ifSelf[s];
      for (const p of src.perks) { if (p.vs) for (const s in p.vs) if (tgt.st[s]) b += p.vs[s]; if (p.firstHit && !src.hitOnce) b += p.firstHit; }
      src.hitOnce = true;
      if (aoe) b += this.mod(src, 'aoe');
      m *= 1 + b;
      let tk = 1 + this.mod(tgt, 'taken');
      if (tgt.st.marked) tk += 0.25;
      if (tgt.st.lull) { tk += 0.5; delete tgt.st.lull; this.emit({ t: 'stoff', u: tgt.uid, s: 'lull' }); }
      m *= Math.max(0.2, tk) * (0.95 + this.rnd() * 0.1);
      m = Math.max(1, Math.round(m));
      let abs = 0;
      if (tgt.shield > 0 && !o.shatter) { abs = Math.min(tgt.shield, m); tgt.shield -= abs; }
      const dealt = m - abs;
      this.applyDamage(tgt, dealt, { src, abs, crit, adv, kind: 'hit' });
      if (tgt.alive) {
        if (o.st) for (const s of o.st) this.applySt(src, tgt, s[0], s[1], { ch: s[2], val: s[3] });
        if (o.randSt) this.applySt(src, tgt, ['flat', 'drag', 'dis'][Math.floor(this.rnd() * 3)], o.randSt, {});
        if (c.kind === 'beat') { const bs = this.has(src, 'beatSt'); if (bs) this.applySt(src, tgt, bs[0], bs[1], {}); }
        if (o.push) this.pushGauge(tgt, -o.push);
        const dp = this.has(src, 'debuffPush'); if (dp && Object.keys(tgt.st).some((s) => !H.STATUS[s].buff)) this.pushGauge(tgt, -dp, true);
      }
      if (src.alive) {
        const ls = (o.drain || 0) + (src.st.hearty ? 0.3 : 0);
        if (ls && dealt > 0) this.heal(src, src, dealt * ls, true);
        this.bump(src, 'hit');
        if (crit) { const cg = this.has(src, 'critGauge'); if (cg) src.gauge = Math.min(GMAX, src.gauge + cg * GMAX); }
      }
      if (tgt.alive && !c.reactive) {
        this.fire(tgt, 'hurt', { attacker: src });
        const ct = this.has(tgt, 'counter');
        if (ct && src.alive && tgt.alive && this.rnd() < ct.ch) { this.emit({ t: 'ability', u: tgt.uid, n: 'Backbeat', kind: 'counter', follow: true }); this.hit(tgt, src, ct.pow, {}, { src: tgt, kind: 'counter', powMul: 1, last: [], reactive: true }, false); }
        if (tgt.side === 0 && tgt.alive) for (const p of this.teamPerks) if (p.answer && this.rnd() < p.answer.ch) {
          const pals = this.alive(0).filter((x) => x !== tgt); if (pals.length && !this.over) { const a = pals[Math.floor(this.rnd() * pals.length)]; this.useAbility(a, a.ab[0], { powMul: p.answer.pow, reactive: true }); }
        }
      }
      if (!tgt.alive && o.onKill && src.alive) this.runFx(o.onKill, c);
      return { crit, dealt, dead: !tgt.alive };
    }
    applyDamage(tgt, amt, info) {
      if (!tgt.alive) return;
      amt = Math.max(0, Math.round(amt));
      if (info.kind === 'dis' && tgt.shield > 0) { const a = Math.min(tgt.shield, amt); tgt.shield -= a; info.abs = a; amt -= a; }
      tgt.hp -= amt;
      let saved = false;
      if (tgt.hp <= 0) {
        const ud = this.has(tgt, 'undying');
        if (ud && !tgt.once.undying) { tgt.once.undying = true; tgt.hp = 1; tgt.shield = Math.round(tgt.max * ud); saved = true; } else tgt.hp = 0;
      }
      this.emit({ t: 'dmg', src: info.src ? info.src.uid : -1, tgt: tgt.uid, amt, abs: info.abs || 0, crit: !!info.crit, adv: info.adv || 0, kind: info.kind, hp: tgt.hp, shield: tgt.shield, saved });
      if (tgt.hp <= 0) { this.fall(tgt, info.src); return; }
      const sw = this.has(tgt, 'secondWind');
      if (sw && !tgt.once.sw && tgt.hp / tgt.max < 0.3) { tgt.once.sw = true; this.emit({ t: 'note', u: tgt.uid, txt: 'Plucky!' }); this.heal(null, tgt, tgt.max * sw); }
      if (tgt.enrageAt && !tgt.once.enrage && tgt.hp / tgt.max < tgt.enrageAt) { tgt.once.enrage = true; tgt.st.rush = { dur: 99, fresh: false }; this.emit({ t: 'st', u: tgt.uid, s: 'rush', dur: 99 }); this.emit({ t: 'note', u: tgt.uid, txt: 'Accelerando!' }); }
    }
    fall(u, killer) {
      u.alive = false; u.st = {}; u.gauge = 0; u.shield = 0;
      this.emit({ t: 'fall', u: u.uid });
      if (u.side === 0 && !this.usedDaCapo) { const dc = this.teamPerks.find((p) => p.daCapo); if (dc) { this.usedDaCapo = true; this.emit({ t: 'note', u: u.uid, txt: 'Da Capo!' }); this.revive(u, dc.daCapo, true); return; } }
      if (killer && killer.alive) this.fire(killer, 'kill');
      if (this.sideDead(0) || this.sideDead(1)) this.checkOver();
    }
    revive(u, pct, free) {
      u.alive = true; if (!free) u.revived = true; u.hp = Math.max(1, Math.round(u.max * pct)); u.gauge = 0; u.st = {};
      this.emit({ t: 'revive', u: u.uid, hp: u.hp });
    }
    heal(src, tgt, amt, quiet) {
      if (!tgt.alive) return;
      if (src) amt *= 1 + this.mod(src, 'heal');
      amt = Math.round(amt); if (amt <= 0) return;
      const before = tgt.hp; tgt.hp = Math.min(tgt.max, tgt.hp + amt);
      const got = tgt.hp - before, over = amt - got;
      if (got > 0 || !quiet) this.emit({ t: 'heal', tgt: tgt.uid, amt: got, hp: tgt.hp });
      if (src && over > 0 && this.has(src, 'overheal')) this.addShield(tgt, over);
      if (src && src !== tgt && !quiet) {
        const hg = this.has(src, 'healGauge'); if (hg) tgt.gauge = Math.min(GMAX, tgt.gauge + hg * GMAX);
        const hr = this.has(src, 'healRefrain'); if (hr) this.applySt(src, tgt, 'refrain', hr, { val: 0.3 });
      }
    }
    addShield(t, amt) {
      if (!t.alive) return; amt = Math.round(amt); if (amt <= 0) return;
      t.shield = Math.min(Math.round(t.max * 0.6), t.shield + amt);
      this.emit({ t: 'shield', u: t.uid, shield: t.shield, amt });
    }
    pushGauge(t, frac, quiet) {
      if (!t.alive) return;
      if (frac < 0 && t.boss) frac *= 0.5;
      t.gauge = Math.max(0, Math.min(GMAX, t.gauge + frac * GMAX));
      if (!quiet) this.emit({ t: 'gauge', u: t.uid, d: frac });
    }
    strip(t, buffs) {
      for (const k of Object.keys(t.st)) if (!!H.STATUS[k].buff === !!buffs && t.st[k].dur < 90) { delete t.st[k]; this.emit({ t: 'stoff', u: t.uid, s: k }); }
    }
    applySt(src, tgt, s, dur, o) {
      o = o || {};
      if (!tgt.alive) return false;
      if (o.ch != null && this.rnd() >= o.ch) return false;
      const def = H.STATUS[s];
      if (!def.buff) {
        if (tgt.perks.some((p) => p.immune && p.immune.includes(s))) { this.emit({ t: 'note', u: tgt.uid, txt: 'Immune' }); return false; }
        if (tgt.boss && (s === 'rest' || s === 'lull')) { if (tgt.ccGuard > 0) { this.emit({ t: 'note', u: tgt.uid, txt: 'Resisted' }); return false; } dur = 1; tgt.ccGuard = 3; }
        else if (src) dur += this.mod(src, 'statusDur');
      }
      const cur = tgt.st[s]; let val = o.val;
      if (s === 'dis') { val = Math.max(1, Math.round((o.val || 0.3) * (src ? this.vol(src) : 10))); if (cur) val = Math.min(cur.val + val, Math.round(val * 3)); }
      else if (s === 'refrain') { val = Math.max(1, Math.round((o.val || 0.4) * (src ? this.vol(src) : 10))); if (cur) val = Math.max(cur.val, val); }
      else if (s === 'offbeat') val = Math.max(o.val || 1, cur ? cur.val : 0);
      tgt.st[s] = { dur: Math.max(dur, cur ? cur.dur : 0), val, fresh: tgt === this.acting };
      this.emit({ t: 'st', u: tgt.uid, s, dur: tgt.st[s].dur });
      return true;
    }
  }
  H.Battle = Battle;

  /* quick headless run, used by the balance sims and the "skip" button */
  H.autoRun = (b, autoCue) => {
    let n = 0;
    while (!b.over && n++ < 2000) {
      if (autoCue && b.canCue()) { const pals = b.alive(0); if (pals.length) b.doCue(pals.reduce((x, y) => (b.vol(y) > b.vol(x) ? y : x)).uid); }
      if (!b.over) b.step();
    }
    return b.over === 'win';
  };

})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
