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
  H.buildPetUnit = (pet, level) => {
    const form = H.FORMS[pet.form], sp = H.SPECIES[form.sp], kit = H.kitOf(pet.form);
    return { name: form.n, form: pet.form, sprite: pet.form, family: sp.family, role: kit.role, lvl: level, base: H.petStats(pet, level), perks: kit.passive ? [kit.passive] : [], kit, petId: pet.id };
  };
  H.buildDinUnit = (id, level, loud, extra) => {
    const d = H.DIN[id], sc = H.dinScale(level), perks = [];
    if (d.passive) perks.push(d.passive); if (d.boss) perks.push(H.SWELL); if (loud) perks.push(H.LOUD); if (extra) perks.push(extra);
    return { name: (loud ? 'Loud ' : '') + d.n, form: id, sprite: id, family: d.family, role: d.boss ? 'boss' : 'din', lvl: level, boss: !!d.boss, loud: !!loud,
      base: { hp: d.base.hp * sc.hp, vol: d.base.vol * sc.vol, poise: d.base.poise, tempo: d.base.tempo }, perks, kit: { beat: d.beat, phrase: d.phrase, finale: d.finale } };
  };

  class Battle {
    constructor(o) {
      this.rnd = o.rng || Math.random; this.units = []; this.over = null; this.turn = 0; this.ev = []; this.acting = null; this.waiting = null;
      o.allies.forEach((s, i) => s && this._add(s, 0, i)); o.enemies.forEach((s, i) => s && this._add(s, 1, i));
      for (const u of this.units) {
        u.max = Math.round(u.base.hp * (1 + this.mod(u, 'hp'))); u.hp = u.max;
        let g = this.rnd() * 0.12; for (const p of u.perks) if (p.startGauge) g = Math.max(g, p.startGauge);
        u.gauge = Math.min(GMAX - 1, g * GMAX);
        if (u.shift) u.family = H.FAMILY_ORDER[Math.floor(this.rnd() * 5)];
      }
      this.acting = '__start__'; for (const u of this.units) this.fire(u, 'start'); this.acting = null;
      this.startEvents = this.ev; this.ev = [];
    }
    _add(spec, side, slot) {
      const ab = [];
      if (spec.kit.beat) ab.push({ kind: 'beat', def: spec.kit.beat, cd: 0 });
      if (spec.kit.phrase) ab.push({ kind: 'phrase', def: spec.kit.phrase, cd: 0 });
      if (spec.kit.finale) ab.push({ kind: 'finale', def: spec.kit.finale, cd: 2 });
      const u = { uid: this.units.length, side, slot, spec, name: spec.name, family: spec.family, base: spec.base, perks: spec.perks.slice(), ab, hp: 1, max: 1, shield: 0, gauge: 0, st: {}, ramp: {}, once: {}, alive: true, turns: 0, boss: !!spec.boss, ccGuard: 0 };
      const sh = spec.perks.find((p) => p.shift); if (sh) { u.shift = sh.shift; u.enrageAt = sh.enrage; }
      this.units.push(u);
    }
    emit(e) { this.ev.push(e); }
    alive(side) { return this.units.filter((u) => u.side === side && u.alive); }
    mod(u, k) { let s = 0; for (const p of u.perks) if (p.mod && p.mod[k]) s += p.mod[k]; for (const v of this.units) if (v !== u && v.alive && v.side === u.side) for (const p of v.perks) if (p.aura && p.aura[k]) s += p.aura[k]; return s; }
    rampTotal(u) { let s = 0; for (const k in u.ramp) s += u.ramp[k]; return s; }
    bump(u, on) { u.perks.forEach((p, i) => { if (p.ramp && p.ramp.on === on) u.ramp[i] = Math.min(p.ramp.max, (u.ramp[i] || 0) + p.ramp.per); }); }
    vol(u) { return u.base.vol * (1 + this.mod(u, 'vol') + this.rampTotal(u)) * (u.st.pup ? 1.25 : 1) * (u.st.pdown ? 0.75 : 1); }
    tempo(u) { return Math.max(20, u.base.tempo * (1 + this.mod(u, 'tempo')) * (u.st.sup ? 1.3 : 1) * (u.st.sdown ? 0.7 : 1)); }
    poise(u) { return Math.max(0, u.base.poise + this.mod(u, 'poise')); }
    has(u, flag) { for (const p of u.perks) if (p[flag]) return p[flag]; return null; }

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
      let actor = null, bt = Infinity;
      for (const u of this.units) if (u.alive) { const t = (GMAX - u.gauge) / this.tempo(u); if (t < bt - 1e-9) { bt = t; actor = u; } }
      for (const u of this.units) if (u.alive) u.gauge = Math.min(GMAX, u.gauge + this.tempo(u) * bt);
      actor.gauge = 0; this.turn++; actor.turns++; this.acting = actor;
      this.emit({ t: 'turn', u: actor.uid });
      if (actor.ccGuard > 0) actor.ccGuard--;
      if (actor.shift && actor.turns > 1 && (actor.turns - 1) % actor.shift === 0) { const i = H.FAMILY_ORDER.indexOf(actor.family); actor.family = H.FAMILY_ORDER[(i + 1 + Math.floor(this.rnd() * 3)) % 5]; this.emit({ t: 'shift', u: actor.uid, family: actor.family }); }
      if (actor.st.poison) this.applyDamage(actor, actor.st.poison.val, { kind: 'poison' });
      if (actor.alive && actor.st.regen) this.heal(null, actor, actor.st.regen.val);
      if (actor.alive) { this.bump(actor, 'turn'); this.fire(actor, 'turn'); }
      if (!actor.alive || this.over) { this.acting = null; this.checkOver(); this.emit(this.sync()); return { events: this.ev, wait: null }; }
      if (actor.st.stun) { this.emit({ t: 'skip', u: actor.uid }); this.endTurn(actor, null); this.emit(this.sync()); return { events: this.ev, wait: null }; }
      if (actor.side === 0 && !auto) { this.waiting = actor.uid; this.emit(this.sync()); return { events: this.ev, wait: actor.uid }; }
      const pick = this.autoPick(actor); this.perform(actor, pick.ab, pick.target);
      this.emit(this.sync()); return { events: this.ev, wait: null };
    }
    // The player's order for the waiting pet.
    act(abIndex, targetUid) {
      const u = this.units[this.waiting]; if (!u) return null;
      const a = u.ab[abIndex]; if (!a || a.cd > 0) return null;
      this.ev = []; this.waiting = null; this.acting = u;
      this.perform(u, a, targetUid == null ? null : this.units[targetUid]);
      this.emit(this.sync()); return { events: this.ev, wait: null };
    }
    autoAct() { const u = this.units[this.waiting]; if (!u) return null; const p = this.autoPick(u); return this.act(u.ab.indexOf(p.ab), p.target ? p.target.uid : null); }
    perform(u, a, target) {
      this.useAbility(u, a, { target });
      this.endTurn(u, a);
      if (!this.over && this.turn > 500) { this.over = 'lose'; this.emit({ t: 'end', win: false }); }
    }
    endTurn(u, used) {
      if (u.alive) {
        for (const a of u.ab) { if (a === used) a.cd = a.def.cd; else if (a.cd > 0) a.cd--; }
        if (u.cdReset) { u.ab.forEach((a) => (a.cd = 0)); u.cdReset = false; }
        for (const k of Object.keys(u.st)) { const s = u.st[k]; if (s.fresh) s.fresh = false; else if (--s.dur <= 0) { delete u.st[k]; this.emit({ t: 'stoff', u: u.uid, s: k }); } }
      }
      this.acting = null; this.checkOver();
    }
    // enemies a single hit from this unit may land on
    validTargets(u) { const foes = this.alive(1 - u.side); const t = foes.filter((x) => x.st.taunt); return t.length ? t : foes; }
    autoPick(u) {
      let ab = u.ab[0];
      for (const kind of ['finale', 'phrase']) { const a = u.ab.find((x) => x.kind === kind); if (a && a.cd === 0 && this.usable(u, a.def)) { ab = a; break; } }
      let target = null; const vt = this.validTargets(u);
      if (vt.length) {
        if (u.side === 1) target = vt[Math.floor(this.rnd() * vt.length)];
        else target = vt.reduce((b, x) => { const sc = (x2) => H.advantage(u.family, x2.family) * 0.35 - x2.hp / x2.max; return sc(x) > sc(b) ? x : b; }, vt[0]);
      }
      return { ab, target };
    }
    usable(u, def) {
      if (!def.need) return true;
      const pals = this.units.filter((v) => v.side === u.side), hurt = pals.some((v) => v.alive && v.hp / v.max < 0.8), fallen = pals.some((v) => !v.alive && !v.revived);
      return def.need === 'hurt' ? hurt : def.need === 'fallen' ? fallen : hurt || fallen;
    }
    checkOver() { if (this.over) return; const a = this.alive(0).length, b = this.alive(1).length; if (!b) { this.over = 'win'; this.emit({ t: 'end', win: true }); } else if (!a) { this.over = 'lose'; this.emit({ t: 'end', win: false }); } }
    sideDead(side) { return !this.units.some((u) => u.side === side && u.alive); }
    sync() { return { t: 'sync', units: this.units.map((u) => ({ hp: u.hp, max: u.max, shield: u.shield, gauge: u.gauge, alive: u.alive, family: u.family, st: Object.fromEntries(Object.entries(u.st).map(([k, v]) => [k, v.dur])), cds: u.ab.map((a) => a.cd) })) }; }

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
        else if (k === 'spread') { const from = c.last[0]; if (from && from.alive) for (const t of this.alive(1 - c.src.side)) if (t !== from) for (const s of ['sdown', 'poison', 'stun', 'pdown']) if (from.st[s]) this.applySt(null, t, s, from.st[s].dur, { rawVal: from.st[s].val }); }
        else if (k === 'cdr') c.src.cdReset = true;
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
      const crit = this.rnd() < 0.05 + this.mod(src, 'crit') + (o.crit || 0); if (crit) m *= 1.5;
      let b = 0;
      if (o.fresh && tgt.hp / tgt.max > 0.8) b += o.fresh;
      if (o.exec) b += o.exec * (1 - tgt.hp / tgt.max);
      if (o.perFallen) b += o.perFallen * this.units.filter((v) => v.side === src.side && !v.alive).length;
      if (o.vs) for (const s in o.vs) if (tgt.st[s]) b += o.vs[s];
      if (o.ifSelf) for (const s in o.ifSelf) if (src.st[s]) b += o.ifSelf[s];
      for (const p of src.perks) if (p.vs) for (const s in p.vs) if (tgt.st[s]) b += p.vs[s];
      m *= (1 + b) * Math.max(0.2, 1 + this.mod(tgt, 'taken')) * (0.95 + this.rnd() * 0.1);
      m = Math.max(1, Math.round(m));
      let abs = 0; if (tgt.shield > 0 && !o.shatter) { abs = Math.min(tgt.shield, m); tgt.shield -= abs; }
      const dealt = m - abs;
      this.applyDamage(tgt, dealt, { src, abs, crit, adv, kind: 'hit' });
      if (tgt.alive) {
        if (o.st) for (const s of o.st) this.applySt(src, tgt, s[0], s[1], { ch: s[2], val: s[3] });
        if (o.randSt) this.applySt(src, tgt, ['pdown', 'sdown', 'poison'][Math.floor(this.rnd() * 3)], o.randSt, {});
        if (o.push) this.pushGauge(tgt, -o.push);
        const dp = this.has(src, 'debuffPush'); if (dp && Object.keys(tgt.st).some((s) => !H.STATUS[s].buff)) this.pushGauge(tgt, -dp, true);
      }
      if (src.alive) {
        if (o.drain && dealt > 0) this.heal(src, src, dealt * o.drain, true);
        this.bump(src, 'hit');
        if (crit) { const cg = this.has(src, 'critGauge'); if (cg) src.gauge = Math.min(GMAX, src.gauge + cg * GMAX); }
      }
      if (!c.reactive && src.alive) {
        if (tgt.alive) { this.fire(tgt, 'hurt', { attacker: src }); const ct = this.has(tgt, 'counter'); if (ct && src.alive && tgt.alive && this.rnd() < ct.ch) this.react(tgt, src, ct.pow, 'Hit Back'); }
        for (const g of this.alive(tgt.side)) if (g !== tgt && src.alive) { const gd = this.has(g, 'guard'); if (gd && this.rnd() < gd.ch) this.react(g, src, gd.pow, 'Pack Leader'); }
      }
      if (!tgt.alive && o.onKill && src.alive) this.runFx(o.onKill, c);
      return { crit, dealt, dead: !tgt.alive };
    }
    react(u, at, pow, name) { this.emit({ t: 'ability', u: u.uid, n: name, kind: 'counter', follow: true, tgt: at.uid }); this.hit(u, at, pow, {}, { src: u, kind: 'counter', powMul: 1, last: [], reactive: true }, false); }
    applyDamage(tgt, amt, info) {
      if (!tgt.alive) return; amt = Math.max(0, Math.round(amt));
      if (info.kind === 'poison' && tgt.shield > 0) { const a = Math.min(tgt.shield, amt); tgt.shield -= a; info.abs = a; amt -= a; }
      tgt.hp = Math.max(0, tgt.hp - amt);
      this.emit({ t: 'dmg', src: info.src ? info.src.uid : -1, tgt: tgt.uid, amt, abs: info.abs || 0, crit: !!info.crit, adv: info.adv || 0, kind: info.kind, hp: tgt.hp, shield: tgt.shield });
      if (tgt.hp <= 0) { tgt.alive = false; tgt.st = {}; tgt.gauge = 0; tgt.shield = 0; this.emit({ t: 'fall', u: tgt.uid }); if (this.sideDead(0) || this.sideDead(1)) this.checkOver(); return; }
      if (tgt.enrageAt && !tgt.once.enrage && tgt.hp / tgt.max < tgt.enrageAt) { tgt.once.enrage = true; tgt.st.sup = { dur: 99, fresh: false }; this.emit({ t: 'st', u: tgt.uid, s: 'sup', dur: 99 }); this.emit({ t: 'note', u: tgt.uid, txt: 'Faster!' }); }
    }
    revive(u, pct) { u.alive = true; u.revived = true; u.hp = Math.max(1, Math.round(u.max * pct)); u.gauge = 0; u.st = {}; this.emit({ t: 'revive', u: u.uid, hp: u.hp }); }
    heal(src, tgt, amt, quiet) {
      if (!tgt.alive) return; amt = Math.round(amt); if (amt <= 0) return;
      const before = tgt.hp; tgt.hp = Math.min(tgt.max, tgt.hp + amt); const got = tgt.hp - before, over = amt - got;
      if (got > 0) this.emit({ t: 'heal', tgt: tgt.uid, amt: got, hp: tgt.hp });
      if (src && over > 0 && this.has(src, 'overheal')) this.addShield(tgt, over);
      if (src && src !== tgt && !quiet) { const hg = this.has(src, 'healGauge'); if (hg) tgt.gauge = Math.min(GMAX, tgt.gauge + hg * GMAX); }
    }
    addShield(t, amt) { if (!t.alive) return; amt = Math.round(amt); if (amt <= 0) return; t.shield = Math.min(Math.round(t.max * 0.6), t.shield + amt); this.emit({ t: 'shield', u: t.uid, shield: t.shield, amt }); }
    pushGauge(t, frac, quiet) { if (!t.alive) return; if (frac < 0 && t.boss) frac *= 0.5; t.gauge = Math.max(0, Math.min(GMAX, t.gauge + frac * GMAX)); if (!quiet) this.emit({ t: 'gauge', u: t.uid, d: frac }); }
    strip(t, buffs) { for (const k of Object.keys(t.st)) if (!!H.STATUS[k].buff === !!buffs && t.st[k].dur < 90) { delete t.st[k]; this.emit({ t: 'stoff', u: t.uid, s: k }); } }
    applySt(src, tgt, s, dur, o) {
      o = o || {}; if (!tgt.alive) return false; if (o.ch != null && this.rnd() >= o.ch) return false;
      const def = H.STATUS[s];
      if (!def.buff) {
        if (tgt.boss && s === 'stun') { if (tgt.ccGuard > 0) { this.emit({ t: 'note', u: tgt.uid, txt: 'Resisted' }); return false; } dur = 1; tgt.ccGuard = 3; }
        else if (src) dur += this.mod(src, 'statusDur');
      }
      const cur = tgt.st[s]; let val = o.val;
      if (s === 'poison') { val = o.rawVal != null ? o.rawVal : Math.max(1, Math.round((o.val || 0.3) * (src ? this.vol(src) : 10))); if (cur) val = Math.min(cur.val + val, val * 3); }
      else if (s === 'regen') { val = Math.max(1, Math.round((o.val || 0.4) * (src ? this.vol(src) : 10))); if (cur) val = Math.max(cur.val, val); }
      else if (s === 'dodge') val = Math.max(o.val || 1, cur ? cur.val : 0);
      tgt.st[s] = { dur: Math.max(dur, cur ? cur.dur : 0), val, fresh: tgt === this.acting };
      this.emit({ t: 'st', u: tgt.uid, s, dur: tgt.st[s].dur }); return true;
    }
  }
  H.Battle = Battle;
  // Play a whole battle on auto (used by the balance sims).
  H.autoRun = (b) => { let n = 0; while (!b.over && n++ < 3000) b.next(true); return b.over === 'win'; };

})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
