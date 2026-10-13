/* Hushsong — the battle screen: plays the engine's events back on a pixel stage. */
(function (H) {
  'use strict';
  const A = H.Art, Au = H.Audio, UI = H.UI, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key;
  const SH = 31;
  const FCOL = { drum: '#ffb066', string: '#a8f5b8', breath: '#a8e6ff', brass: '#ffe58a', voice: '#ffa6cc', none: '#d8d4f0' };

  // A face for the tempo bar: crop around wherever the sprite's eyes are.
  const pcache = new Map();
  A.portrait = (sprite, border) => {
    const k = sprite + border; if (pcache.has(k)) return pcache.get(k);
    const src = A.sprite(sprite, 0), w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data;
    let sx = 0, sy = 0, n = 0, top = h, minx = w, maxx = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (d[i + 3] < 200) continue; if (y < top) top = y; minx = Math.min(minx, x); maxx = Math.max(maxx, x); if (d[i] === 28 && d[i + 1] === 20 && d[i + 2] === 51 && y < h * 0.72) { sx += x; sy += y; n++; } }
    let cx = n ? sx / n : (minx + maxx) / 2, cy = n ? sy / n : top + (h - top) * 0.3;
    const S2 = 11, x0 = Math.max(0, Math.min(w - S2, Math.round(cx - S2 / 2))), y0 = Math.max(0, Math.min(h - S2, Math.round(cy - S2 / 2 - 0.5)));
    const c = A.make(S2 + 2, S2 + 2), ctx = c.getContext('2d'); ctx.fillStyle = border; ctx.fillRect(0, 0, S2 + 2, S2 + 2); ctx.fillStyle = '#131029'; ctx.fillRect(1, 1, S2, S2); ctx.drawImage(src, x0, y0, S2, S2, 1, 1, S2, S2);
    pcache.set(k, c); return c;
  };

  UI.inspect = (b, u, after) => {
    const sp = u.spec, d = sp.petId ? null : H.DIN[sp.form];
    const kids = [box('row', (() => { const c = UI.sp(sp.sprite, 1, { flip: u.side === 1 }); if (u.boss) c.style.margin = 'calc(var(--u) * -6)'; else c.style.margin = 'calc(var(--u) * -8) calc(var(--u) * -6) calc(var(--u) * -4)'; return c; })(), add(el('div', 'col grow'), txt('disp', u.name), box('row wrap', UI.famChip(u.family), txt('chip', 'Lv ' + sp.lvl), sp.petId ? UI.roleChip(sp.role) : txt('chip', u.boss ? 'Mute' : 'Din'))))];
    kids.push(el('div', 'stats', `<div><b>${Math.max(0, Math.round(u.hp))}</b><span class="label">of ${u.max}</span></div><div><b>${Math.round(b.vol(u))}</b><span class="label">Volume</span></div><div><b>${Math.round(b.poise(u))}</b><span class="label">Poise</span></div><div><b>${Math.round(b.tempo(u))}</b><span class="label">Tempo</span></div>`));
    if (u.shield > 0) kids.push(box('row', UI.icon('st_damper'), txt('grow', `${UI.rich('Damper')} <span class="dim">soaks the next ${u.shield} damage.</span>`)));
    for (const s in u.st) kids.push(box('row', UI.icon('st_' + s), txt('grow', `${UI.rich(H.STATUS[s].n)} <span class="dim">${u.st[s].dur > 50 ? '' : u.st[s].dur + (u.st[s].dur === 1 ? ' turn. ' : ' turns. ')}${H.STATUS[s].d}</span>`)));
    u.ab.forEach((a) => { const c = UI.abilityCard(a.kind, a.def); if (a.kind !== 'beat') c.querySelector('.label').textContent += a.cd > 0 ? ` · in ${a.cd}` : ' · ready'; kids.push(c); });
    const perks = u.perks.filter((p) => p && p.n && p.d && !H.ORNAMENTS[Object.keys(H.ORNAMENTS).find((k) => H.ORNAMENTS[k] === p)]);
    perks.forEach((p) => kids.push(UI.abilityCard('passive', p)));
    if (d && d.lore) kids.push(txt('dim small', d.lore));
    kids.push(key('Back to the fight', () => { UI.closeModal(); if (after) after(); }, 'wide'));
    UI.modal(...kids);
  };

  UI.screens.battle = (root, pr) => {
    const S = UI.S, W = UI.W, cx = Math.round(W / 2), rnd = Math.random;
    const FH = Math.max(140, Math.min(216, UI.Hh - 126)), hz = Math.round(FH * 0.37), y1 = Math.max(2, hz - 44), y2 = Math.min(FH - 64, y1 + 86), y0 = Math.round((y1 + y2) / 2);
    let battle, dv = null, node = null, bgKey = 'camp', muted = false, title = 'First notes';
    if (pr.tutorial) {
      const pet = S.pets[0]; const foe = H.buildDinUnit('racket', 1, false); foe.base.hp *= 0.75; foe.base.vol *= 0.7;
      battle = new H.Battle({ allies: [H.buildPetUnit(pet, 1, [])], enemies: [foe], rng: rnd }); battle.cue = 45; S.dinSeen.racket = 1;
    } else {
      dv = S.delve; if (!dv || dv.pending == null) return UI.go(dv ? 'delve' : 'camp');
      node = H.delveNode(dv, dv.pending); battle = H.startBattle(S, dv, node, rnd); bgKey = dv.region; muted = !(S.regions[dv.region] || {}).clears;
      title = node.type === 'boss' ? H.DIN[H.REGIONS[dv.region].boss].n : node.type === 'elite' ? 'Loud Din' : 'The Din';
    }
    const boss = node && node.type === 'boss';
    UI.music(pr.tutorial ? 'battle' : boss ? 'boss' : 'battle', pr.tutorial ? 'camp' : dv.region);
    if (boss) Au.sfx('boss');

    /* ----- view state ----- */
    const pos = (u) => { const big = A.defs[u.spec.sprite].w > 48; if (u.side === 0) return [[cx - 52, y0], [Math.max(0, cx - 74), y1], [Math.max(0, cx - 88), y2]][u.slot]; if (big) return [cx + 2, y0 - 16]; const hasBig = battle.units.some((v) => v.side === 1 && A.defs[v.spec.sprite].w > 48); if (hasBig) return [[cx + 6, y0], [Math.min(W - 48, cx + 38), Math.max(0, y1 - 6)], [Math.min(W - 48, cx + 38), y2 + 2]][u.slot]; return [[cx + 4, y0], [Math.min(W - 48, cx + 26), y1], [Math.min(W - 48, cx + 40), y2]][u.slot]; };
    const V = battle.units.map((u) => { const [x, y] = pos(u); const sz = A.defs[u.spec.sprite].w; return { u, x, y, sz, ox: 0, oy: 0, hp: u.hp, max: u.max, shield: u.shield, st: Object.assign({}, Object.fromEntries(Object.keys(u.st).map((k) => [k, 1]))), alive: u.alive, flash: 0, shake: 0, alpha: 1, family: u.family, gx: u.gauge, cds: u.ab.map((a) => a.cd) }; });
    const floats = [], parts = [], tweens = [], shots = [];
    let active = -1, cueShown = battle.cue, speed = S.settings.speed || 1, autoCue = !!S.settings.autoCue, pendingCue = null, paused = false, dead = false, frame = 0, lastT = performance.now();
    const tween = (o, p, to, dur) => tweens.push({ o, p, from: o[p], to, t: 0, dur: Math.max(1, dur / speed) });
    const wait = (ms) => new Promise((res) => { const t0 = performance.now(); const tick = () => { if (dead) return; if (paused) { setTimeout(tick, 60); return; } if (performance.now() - t0 >= ms / speed) res(); else setTimeout(tick, 16); }; tick(); });
    const float = (v, text, col, big) => { const now = performance.now(); const k = v.u ? v.u.uid : -1; const st = float.last[k]; let dy = 0; if (st && now - st.t < 420 / speed) dy = st.dy + (big ? 9 : 7); float.last[k] = { t: now, dy: dy > 22 ? 0 : dy }; floats.push({ x: v.x + v.sz / 2 + (big ? Math.random() * 8 - 4 : 0), y: v.y + (v.sz > 48 ? 24 : 12) - (float.last[k].dy), text, col, big, t: 0 }); };
    float.last = {};
    const burst = (v, col, n) => { for (let i = 0; i < n; i++) parts.push({ x: v.x + v.sz / 2, y: v.y + v.sz * 0.55, vx: (Math.random() - 0.5) * 70, vy: -Math.random() * 60 - 10, t: 0, col }); };

    /* ----- DOM ----- */
    const wrap = el('div', 'battle');
    add(wrap, UI.topbar(title, null, [txt('badge', dv ? `Bar ${node.col + 1} of 7` : 'Prologue'), UI.gearKey(() => { paused = true; UI.settings(); const m = document.getElementById('modal'); const obs = new MutationObserver(() => { if (m.hidden) { obs.disconnect(); paused = false; speed = S.settings.speed; spd.textContent = speed + 'x'; } }); obs.observe(m, { attributes: true }); })]));
    const staff = A.make(W, SH); staff.className = 'px'; const sctx = staff.getContext('2d');
    const field = A.make(W, FH); field.className = 'px'; const fctx = field.getContext('2d');
    const fwrap = el('div', 'field'); const callout = el('div', 'callout'); const hint = el('div', 'hint'); hint.hidden = true; add(fwrap, field, callout, hint);
    const cards = el('div', 'cards');
    const cardEls = V.filter((v) => v.u.side === 0).map((v) => {
      const c = UI.btn('ucard', () => tapUnit(v)); const nm = txt('nm', v.u.name), hp = txt('small dim', ''), pips = el('div', 'pips'), hm = UI.meter('hp', 1);
      const pp = v.u.ab.map((a) => { if (a.kind === 'beat') return null; const p = el('div', 'pip ' + (a.kind === 'finale' ? 'fin' : ''), `<span>${a.def.n}</span><i></i>`); pips.appendChild(p); return p; });
      add(c, el('div', 'solo', 'SOLO'), box('row between', nm, hp), hm, pips); cards.appendChild(c); return { v, c, hp, pp, hm };
    });
    const cueM = UI.meter('cue', 0), cueI = cueM.firstChild; cueI.style.transition = 'width 0.2s steps(5)';
    const spd = key(speed + 'x', () => { speed = speed >= 3 ? 1 : speed + 1; S.settings.speed = speed; spd.textContent = speed + 'x'; UI.save(); }, 'black sm');
    const auto = key(autoCue ? 'Cue: auto' : 'Cue: by hand', () => { autoCue = !autoCue; S.settings.autoCue = autoCue ? 1 : 0; auto.textContent = autoCue ? 'Cue: auto' : 'Cue: by hand'; syncCards(); UI.save(); }, 'black sm');
    const cueL = el('div', 'label', '<span>Cue</span><span></span>'); const cueBox = box('cuebox', cueL, cueM);
    const ctl = box('ctl', UI.icon('ic_cue', 1), cueBox, auto, spd);
    const logEl = el('div', 'blog'); const logLines = [];
    const log = (html) => { logLines.unshift(html); if (logLines.length > 4) logLines.pop(); logEl.innerHTML = logLines.map((l, i) => `<div style="opacity:${[1, 0.6, 0.38, 0.22][i]}">${l}</div>`).join(''); };
    add(wrap, staff, fwrap, cards, ctl, logEl); root.appendChild(wrap);
    const say = (text, cls) => { callout.textContent = text; callout.className = 'callout on ' + (cls || ''); clearTimeout(say.t); say.t = setTimeout(() => callout.classList.remove('on'), 900 / speed); };
    const tip = (text) => { if (!text) { hint.hidden = true; return; } hint.textContent = text; hint.hidden = false; };

    const unitAt = (px, py) => { let best = null; for (const v of V) { if (!v.alive) continue; if (px >= v.x + 4 && px <= v.x + v.sz - 4 && py >= v.y + 4 && py <= v.y + v.sz + 8) if (!best || v.y + v.sz > best.y + best.sz) best = v; } return best; };
    field.addEventListener('click', (e) => { const r = field.getBoundingClientRect(); const v = unitAt(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * FH); if (v) tapUnit(v); });
    function tapUnit(v) {
      if (dead) return;
      if (v.u.side === 0 && v.u.alive && battle.canCue() && pendingCue == null) { pendingCue = v.u.uid; Au.sfx('cue'); syncCards(); cueL.lastChild.textContent = v.u.name + ' is up'; tip(''); return; }
      paused = true; UI.inspect(battle, v.u, () => { paused = false; });
    }

    /* ----- drawing ----- */
    const bg = A.bg(bgKey, W, FH, muted);
    const drawStaff = () => {
      sctx.fillStyle = '#0b0919'; sctx.fillRect(0, 0, W, SH);
      sctx.fillStyle = '#2a2450'; for (const y of [5, 10, 15, 20, 25]) sctx.fillRect(3, y, W - 6, 1);
      const bx = W - 9; sctx.fillStyle = '#9b93c4'; sctx.fillRect(bx, 4, 1, 23); sctx.fillRect(bx + 2, 4, 2, 23); sctx.fillStyle = '#f2c744'; sctx.fillRect(bx - 3, 11, 2, 2); sctx.fillRect(bx - 3, 18, 2, 2);
      const order = V.filter((v) => v.alive).sort((a, b) => a.gx - b.gx);
      for (const v of order) { const p = A.portrait(v.u.spec.sprite, v.u.side === 0 ? FCOL[v.family] || '#fff' : '#ff6a7a'); const x = Math.round(3 + (v.gx / H.GMAX) * (bx - 3 - 13 - 3)); const y = v.u.side === 0 ? 1 : 17; sctx.drawImage(p, x, y + (active === v.u.uid ? (v.u.side === 0 ? 1 : -1) : 0)); }
    };
    const drawUnit = (v) => {
      if (v.alpha <= 0.02) return;
      const key2 = v.u.spec.sprite, f = v.flash > 0 ? A.sprite(key2, frame, 'flash') : A.sprite(key2, frame);
      const sx = Math.round(v.x + v.ox + (v.shake > 0 ? (Math.random() < 0.5 ? -1 : 1) : 0)), sy = Math.round(v.y + v.oy);
      fctx.globalAlpha = v.alpha;
      // contact shadow
      fctx.fillStyle = 'rgba(8,6,20,0.45)'; const sw = v.sz > 48 ? 52 : 26; fctx.fillRect(Math.round(sx + v.sz / 2 - sw / 2), sy + v.sz - (v.sz > 48 ? 5 : 4), sw, 2); fctx.fillRect(Math.round(sx + v.sz / 2 - sw / 2 + 3), sy + v.sz - (v.sz > 48 ? 3 : 2), sw - 6, 1);
      if (v.u.side === 1) { fctx.save(); fctx.translate(sx + v.sz, sy); fctx.scale(-1, 1); fctx.drawImage(f, 0, 0); fctx.restore(); } else fctx.drawImage(f, sx, sy);
      fctx.globalAlpha = 1;
    };
    const drawBars = (v) => {
      if (!v.alive) return;
      const bw = v.sz > 48 ? 40 : 22, bx = Math.round(v.x + v.sz / 2 - bw / 2 + 5), by = Math.min(FH - 14, v.y + v.sz + 1);
      fctx.drawImage(A.sprite('fam_' + (v.family || 'none'), 0), bx - 13, by - 4);
      fctx.fillStyle = '#17102b'; fctx.fillRect(bx - 1, by - 1, bw + 2, 5); fctx.fillStyle = '#3a1830'; fctx.fillRect(bx, by, bw, 3);
      const fr = Math.max(0, v.hp / v.max); fctx.fillStyle = fr < 0.3 ? '#ff6a7a' : v.u.side === 0 ? '#7fe09a' : '#f0a04a'; fctx.fillRect(bx, by, Math.ceil(bw * fr), 3); fctx.fillStyle = 'rgba(255,255,255,0.35)'; fctx.fillRect(bx, by, Math.ceil(bw * fr), 1);
      if (v.shield > 0) { fctx.fillStyle = '#9ab4f0'; fctx.fillRect(bx, by + 3, Math.min(bw, Math.ceil(bw * v.shield / v.max * 2)), 1); fctx.fillRect(bx - 1, by - 1, 1, 5); fctx.fillRect(bx + bw, by - 1, 1, 5); }
      const sts = Object.keys(v.st); let ix = bx - 1; if (v.shield > 0) sts.unshift('damper');
      sts.slice(0, 4).forEach((s) => { fctx.drawImage(A.sprite('st_' + s, 0), ix, by + 4); ix += 8; });
      if (active === v.u.uid) { fctx.fillStyle = '#f2c744'; const ax = Math.round(v.x + v.sz / 2), ay = v.y + (v.sz > 48 ? 2 : 4) + (frame ? 1 : 0); fctx.fillRect(ax - 2, ay, 5, 1); fctx.fillRect(ax - 1, ay + 1, 3, 1); fctx.fillRect(ax, ay + 2, 1, 1); }
    };
    const loop = (now) => {
      if (dead) return; const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now; frame = UI.frame;
      for (let i = tweens.length - 1; i >= 0; i--) { const t = tweens[i]; t.t += dt * 1000; const k = Math.min(1, t.t / t.dur); t.o[t.p] = t.from + (t.to - t.from) * k; if (k >= 1) tweens.splice(i, 1); }
      fctx.drawImage(bg, 0, 0);
      const ord = V.slice().sort((a, b) => a.y + a.sz - (b.y + b.sz));
      for (const v of ord) { if (v.flash > 0) v.flash -= dt * speed; if (v.shake > 0) v.shake -= dt * speed; drawUnit(v); }
      for (const v of ord) drawBars(v);
      if (battle.canCue() && pendingCue == null && !autoCue) for (const v of V) if (v.u.side === 0 && v.alive) { const ax = Math.round(v.x + v.sz / 2), ay = v.y - 2 + (frame ? 2 : 0); A.text(fctx, 'SOLO', ax, Math.max(1, ay), '#f2c744'); }
      for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.t += dt * speed; p.x += p.vx * dt * speed; p.y += p.vy * dt * speed; p.vy += 220 * dt * speed; if (p.t > 0.45) { parts.splice(i, 1); continue; } fctx.fillStyle = p.col; fctx.fillRect(Math.round(p.x), Math.round(p.y), p.t < 0.25 ? 2 : 1, p.t < 0.25 ? 2 : 1); }
      for (let i = shots.length - 1; i >= 0; i--) { const q = shots[i]; q.t += dt * speed; const k = Math.min(1, q.t / q.dur); if (k >= 1) { shots.splice(i, 1); continue; } const x = Math.round(q.x0 + (q.x1 - q.x0) * k), y = Math.round(q.y0 + (q.y1 - q.y0) * k - Math.sin(k * Math.PI) * 8); fctx.fillStyle = '#17102b'; fctx.fillRect(x - 2, y - 1, 5, 4); fctx.fillStyle = q.col; if (q.ally) { fctx.fillRect(x - 1, y, 3, 2); fctx.fillRect(x + 1, y - 4, 1, 4); fctx.fillRect(x + 2, y - 4, 2, 1); } else { fctx.fillRect(x - 1, y, 1, 1); fctx.fillRect(x, y + 1, 1, 1); fctx.fillRect(x + 1, y - 1, 1, 1); fctx.fillRect(x + 2, y + 1, 1, 1); } }
      for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.t += dt * Math.min(2, speed); if (f.t > 0.85) { floats.splice(i, 1); continue; } const y = f.y - Math.min(1, f.t * 2.2) * 12; A.text(fctx, f.text, Math.max(12, Math.min(W - 12, f.x)), y, f.col, f.big); }
      drawStaff(); requestAnimationFrame(loop);
    };
    const syncCards = () => {
      for (const c of cardEls) { const u = c.v.u; c.hp.textContent = c.v.alive ? `${Math.max(0, Math.round(c.v.hp))}` : 'out'; const fr = c.v.alive ? Math.max(0, c.v.hp / c.v.max) : 0; c.hm.firstChild.style.width = Math.round(fr * 100) + '%'; c.hm.classList.toggle('low', fr < 0.3); c.c.classList.toggle('down', !c.v.alive); c.c.classList.toggle('ready', c.v.alive && battle.canCue() && pendingCue == null && !autoCue); u.ab.forEach((a, i) => { const p = c.pp[i]; if (!p) return; const cd = c.v.cds[i] || 0; p.classList.toggle('rdy', cd === 0 && c.v.alive); p.lastChild.textContent = cd > 0 ? cd : ''; }); }
      cueI.style.width = Math.round(battle.cue) + '%'; const full = battle.canCue(); cueBox.classList.toggle('full', full); cueL.lastChild.textContent = full && pendingCue == null ? (autoCue ? 'ready' : 'ready: tap a pet') : '';
      Au.music.din(battle.alive(1).length / 3);
    };

    /* ----- playback ----- */
    const fam = (uid) => (uid >= 0 ? V[uid].family : 'none');
    async function play(evs) {
      for (let i = 0; i < evs.length; i++) {
        if (dead) return; const e = evs[i], nx = evs[i + 1];
        switch (e.t) {
          case 'adv': { let far = 0; V.forEach((v, k) => { far = Math.max(far, Math.abs(e.gauges[k] - v.gx)); tween(v, 'gx', e.gauges[k], 200); }); await wait(far > 60 ? 210 : 60); break; }
          case 'turn': active = e.u; break;
          case 'ability': { const v = V[e.u]; if (!e.follow || e.kind !== 'beat') say(e.n, e.cue ? 'solo' : v.u.side === 1 ? 'foe' : ''); log(`<b class="${v.u.side ? 'bad' : ''}">${v.u.name}</b> ${e.cue ? 'solos' : e.kind === 'counter' ? 'answers' : 'plays'} ${e.n}`); const dir = v.u.side === 0 ? 1 : -1; tween(v, 'ox', dir * (e.kind === 'beat' ? 7 : 11), 90); setTimeout(() => tween(v, 'ox', 0, 140), 110 / speed); if (e.cue) { burst(v, '#f2c744', 14); await wait(260); } await wait(e.follow ? 120 : e.kind === 'beat' ? 170 : 300); break; }
          case 'dmg': { const v = V[e.tgt];
            if (e.src >= 0 && e.kind === 'hit' && V[e.src].alpha > 0.5) { const a = V[e.src]; shots.push({ x0: a.x + a.sz / 2 + (a.u.side ? -8 : 8), y0: a.y + a.sz * 0.45, x1: v.x + v.sz / 2, y1: v.y + v.sz * 0.5, t: 0, dur: 0.1, col: a.u.side === 0 ? FCOL[a.family] : '#c8c4e0', ally: a.u.side === 0 }); await wait(95); }
            v.hp = e.hp; v.shield = e.shield; v.flash = 0.11; v.shake = 0.16; const dis = e.kind === 'dis';
            float(v, e.amt === 0 && e.abs ? 'BLOCK' : String(e.amt), e.crit ? '#ffd24a' : dis ? '#d8a0ff' : e.adv > 0 ? '#ffb066' : e.adv < 0 ? '#b9b4d6' : '#fff8ea', !(e.amt === 0 && e.abs));
            if (e.crit) float(v, 'CRIT!', '#ffd24a'); if (e.saved) float(v, 'HOLDS ON', '#a8e6ff');
            burst(v, dis ? '#d8a0ff' : FCOL[fam(e.src)] || '#fff', e.crit ? 9 : 5); Au.sfx(dis ? 'bad' : 'hit', { family: e.src >= 0 && V[e.src].u.side === 0 ? fam(e.src) : null, crit: e.crit, heavy: e.amt > v.max * 0.25 });
            await wait(nx && nx.t === 'dmg' ? 95 : 170); break; }
          case 'heal': { const v = V[e.tgt]; v.hp = e.hp; if (e.amt > 0) { float(v, '+' + e.amt, '#7fe09a', true); Au.sfx('heal'); await wait(nx && nx.t === 'heal' ? 50 : 130); } break; }
          case 'shield': { const v = V[e.u]; v.shield = e.shield; if (e.amt) { float(v, '+' + e.amt, '#9ab4f0', true); Au.sfx('shield'); await wait(nx && nx.t === 'shield' ? 40 : 110); } break; }
          case 'st': { const v = V[e.u]; v.st[e.s] = 1; const d = H.STATUS[e.s]; float(v, d.n.toUpperCase(), d.buff ? '#ffe58a' : (e.s === 'rest' || e.s === 'lull') ? '#c8b0ff' : '#ff8a9a'); Au.sfx(d.buff ? 'good' : 'bad'); await wait(nx && nx.t === 'st' ? 45 : 120); break; }
          case 'stoff': delete V[e.u].st[e.s]; break;
          case 'miss': float(V[e.tgt], 'MISS', '#a8e6ff'); Au.sfx('miss'); tween(V[e.tgt], 'ox', V[e.tgt].u.side === 0 ? -6 : 6, 70); setTimeout(() => tween(V[e.tgt], 'ox', 0, 120), 90 / speed); await wait(150); break;
          case 'skip': float(V[e.u], e.s === 'rest' ? 'RESTS' : 'ASLEEP', '#c8b0ff'); Au.sfx('skip'); await wait(300); break;
          case 'fall': { const v = V[e.u]; log(`<b class="${v.u.side ? 'bad' : ''}">${v.u.name}</b> falls silent`); v.alive = false; v.st = {}; tween(v, 'alpha', 0, 380); tween(v, 'oy', 6, 380); Au.sfx('fall'); if (active === e.u) active = -1; syncCards(); await wait(330); break; }
          case 'revive': { const v = V[e.u]; v.alive = true; v.hp = e.hp; v.alpha = 0; v.oy = 0; tween(v, 'alpha', 1, 250); float(v, 'ENCORE', '#ffe58a'); Au.sfx('evolve'); await wait(320); break; }
          case 'note': float(V[e.u], e.txt.toUpperCase(), '#ffe58a'); await wait(150); break;
          case 'gauge': { const v = V[e.u]; if (Math.abs(e.d) >= 0.1) float(v, e.d > 0 ? 'QUICK' : 'SLOWED', e.d > 0 ? '#ffe58a' : '#ff8a9a'); break; }
          case 'shift': { const v = V[e.u]; v.family = e.family; float(v, 'KEY CHANGE', FCOL[e.family]); burst(v, FCOL[e.family], 12); Au.sfx('bad'); await wait(320); break; }
          case 'sync': e.units.forEach((s, k) => { const v = V[k]; v.hp = s.hp; v.shield = s.shield; v.st = Object.fromEntries(Object.keys(s.st).map((x) => [x, 1])); v.cds = s.cds; v.family = s.family; if (s.alive && !v.alive) { v.alive = true; v.alpha = 1; v.oy = 0; } if (Math.abs(v.gx - s.gauge) > 1) tween(v, 'gx', s.gauge, 150); }); syncCards(); break;
          case 'end': active = -1; await wait(450); break;
        }
      }
    }
    async function run() {
      syncCards(); await wait(350);
      if (boss) { const d = H.DIN[H.REGIONS[dv.region].boss]; say(d.n, 'solo'); log(`<b class="bad">${d.n}</b> rises. ${d.lore}`); await wait(900); }
      if (pr.tutorial) tip('Faces run along the bar at the top. Whoever reaches the line plays next.');
      await play(battle.startEvents || []);
      let turns = 0;
      while (!battle.over && !dead) {
        if (battle.canCue()) {
          if (pendingCue != null) { const r = battle.doCue(pendingCue); pendingCue = null; if (r) await play(r.events); continue; }
          if (autoCue) { const pals = battle.alive(0); const pick = pals.reduce((a, b) => (battle.vol(b) > battle.vol(a) ? b : a)); Au.sfx('cue'); const r = battle.doCue(pick.uid); if (r) await play(r.events); continue; }
          if (pr.tutorial) tip('The baton is full. Tap your pet to cue a solo: its best move, right now.');
        }
        const r = battle.step(); if (!r) break; await play(r.events); turns++;
        if (pr.tutorial && turns === 3 && !battle.canCue()) tip('Each family drowns out another. Check the Songbook when you are back at camp.');
      }
      if (dead) return; tip(''); await wait(250); finish();
    }
    function finish() {
      const win = battle.over === 'win'; Au.music.din(0); Au.sfx(win ? 'win' : 'lose');
      if (pr.tutorial) {
        S.flags.tut = 1; S.notes += 10; UI.save();
        UI.modal(txt('disp center', win ? 'That was a beat.' : 'A rough first show.'), txt('dim center', win ? 'The Din did not like it. Good. Two more shells are still humming by the wagon. A band needs three.' : 'Never mind. Nobody keeps time alone. Two more shells are still humming by the wagon.'), box('row center', UI.notes('+10')), key('Back to the shells', () => UI.next(), 'gold wide'));
        return;
      }
      const out = H.afterBattle(S, dv, node, battle, rnd);
      node.done = true; dv.at = node.id; dv.pending = null; UI.save();
      UI.rewards(out, dv, node);
    }
    requestAnimationFrame(loop); run();
    return { leave: () => { dead = true; Au.music.din(0); } };
  };
})(window.H);
