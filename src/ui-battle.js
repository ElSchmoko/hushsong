/* Hushsong — the battle screen. You pick a move on each of your pets' turns; auto is optional. */
(function (H) {
  'use strict';
  const A = H.Art, Au = H.Audio, UI = H.UI, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key;
  const FCOL = A.FAMCOL, INK = A.INK;

  // An enemy seen before the battle: the same sheet, built from a battle that is never played.
  UI.foeSheet = (e, team) => {
    const b = new H.Battle({ allies: [], enemies: [H.foeUnit(e)] }), u = b.units[0], names = (l) => l.map((p) => H.FORMS[p.form].n).join(', ');
    const good = team.filter((p) => H.advantage(H.petFamily(p), u.family) > 0), bad = team.filter((p) => H.advantage(u.family, H.petFamily(p)) > 0), notes = [];
    if (good.length) notes.push(box('row', UI.icon('ic_up'), txt('grow small', `<b>${names(good)}</b> <span class="dim">${good.length > 1 ? 'are' : 'is'} strong against it.</span>`)));
    if (bad.length) notes.push(box('row', UI.icon('ic_down'), txt('grow small', `<span class="dim">It is strong against</span> <b>${names(bad)}</b><span class="dim">.</span>`)));
    UI.inspect(b, u, null, notes);
  };
  UI.inspect = (b, u, after, notes) => {
    const sp = u.spec, c = UI.sp(sp.sprite, u.boss ? 0.8 : 1.1, { flip: u.side === 1 }); c.style.margin = 'calc(var(--u) * -4)';
    const kids = [box('row', c, add(el('div', 'col grow'), txt('disp', u.name), box('row wrap', UI.famChip(u.family), txt('chip', 'Lv ' + sp.lvl))))];
    kids.push(el('div', 'stats five', `<div><b>${Math.max(0, Math.round(u.hp))}</b><span class="label">of ${u.max}</span></div><div><b>${Math.round(b.vol(u))}</b><span class="label">Power</span></div><div><b>${Math.round(b.poise(u))}</b><span class="label">Guard</span></div><div><b>${Math.round(b.tempo(u))}</b><span class="label">Speed</span></div><div><b>${Math.round(Math.min(1, 0.05 + b.mod(u, 'crit')) * 100)}%</b><span class="label">Crit</span></div>`));
    if (notes) kids.push(...notes);
    if (u.shield > 0) kids.push(box('row', UI.icon('st_shield'), txt('grow small', `<b>Shield.</b> <span class="dim">Soaks the next ${u.shield} damage.</span>`)));
    for (const s in u.st) kids.push(box('row', UI.icon('st_' + s), txt('grow small', `<b>${H.STATUS[s].n}</b> <span class="dim">${u.st[s].dur > 50 ? '' : 'for ' + u.st[s].dur + (u.st[s].dur === 1 ? ' turn. ' : ' turns. ')}${H.STATUS[s].d}</span>`)));
    u.ab.forEach((a) => kids.push(UI.moveCard(a.kind, a.def)));
    u.perks.filter((p) => p && p.n && p.d).forEach((p) => kids.push(UI.moveCard('passive', p)));
    kids.push(key('Close', () => { UI.closeModal(); if (after) after(); }, 'wide')); UI.modal(...kids);
  };

  UI.screens.battle = (root, pr) => {
    const S = UI.S, W = UI.W, rnd = Math.random, GMAX = H.GMAX;
    // which kind of battle: an Encore wave, a Daily Gig, a Solo gig, a rehearsal, or a floor
    const srun = S.soloRun, solo = !!pr.solo && !!srun && !!srun.pending && srun.pending.type === 'battle', daily = !!pr.daily && H.dailyOpen(S), enc = !!pr.enc && !!S.encoreRun;
    if (pr.solo && !solo) return UI.go(srun ? 'solomap' : 'solo');
    const n = enc ? S.encoreRun.wave : solo ? srun.gigs + 1 : daily ? 0 : pr.n || S.stage, reh = !!pr.reh;
    const st = enc ? H.encoreStage(S, n) : solo ? H.soloStage(S, srun.map[srun.at]) : daily ? H.dailyStage(S) : reh ? H.rehearsalStage(S, n) : H.stage(n);
    if (pr.enc && !enc) return UI.go('encore');
    if (!solo && !H.teamPets(S).some(Boolean)) return UI.go('home');
    if (S.flags.coach === 'go') delete S.flags.coach;
    const battle = enc ? H.startEncore(S, rnd) : solo ? H.startSoloBattle(S, rnd) : daily ? H.startDaily(S, rnd) : H.startStage(S, n, rnd, reh), twist = daily ? H.TWISTS[st.twist] : null;
    if (daily) UI.save();
    // with an ensemble, the battle theme waits and comes in on the opening's last beat
    UI.music(st.boss ? 'boss' : 'battle', st.region, !!battle.ensemble && !window.__hsSpeed); if (st.boss) Au.sfx('boss');

    /* ----- layout: your pets down the left, enemies down the right, each with its own bars ----- */
    const k = A.k, FH = Math.max(190, Math.min(300, UI.Hh - 118)), HB = 15;
    const isBig = (u) => A.defs[u.spec.sprite].w > 48;
    const allies = battle.units.filter((v) => v.side === 0), foes = battle.units.filter((v) => v.side === 1), boss = foes.find(isBig);
    // where the drawn creature really is inside its cell, so bars and markers can hug it
    // fighters are drawn bigger when the field has room; a boss's helpers stay small
    const BS = FH >= 250 ? 1.3 : FH >= 215 ? 1.15 : 1;
    const scaleOf = (u) => (isBig(u) ? (BS > 1.2 ? 1.12 : 1) : u.side === 1 && boss ? 1 : BS), sizeOf = (u) => A.defs[u.spec.sprite].size * scaleOf(u);
    const bbox = (u) => { const b0 = A.bbox(u.spec.sprite), f = scaleOf(u), w = sizeOf(u), bb = { t: b0.t * f, b: b0.b * f, l: b0.l * f, r: b0.r * f }; return u.side ? { t: bb.t, b: bb.b, l: w - bb.r, r: w - bb.l } : bb; };
    const pitch = Math.floor((FH - 6) / 3);
    const place = (u) => {
      const list = u.side ? foes : allies, k = list.indexOf(u), cnt = list.length, bb = bbox(u), sz = sizeOf(u);
      if (u.side === 1 && boss) {
        const miniTop = FH - 4 - 46 - HB;
        if (u === boss) { const x = W - sz - 3, gh = HB + 1 + bb.b - bb.t, hy = Math.max(3, Math.round(3 + (miniTop - 3 - gh) / 2)); return { x, y: hy + HB + 1 - bb.t, hx: x + sz / 2 - 36, hy, bw: 72, bb }; }
        const minis = foes.filter((v) => v !== boss), j = minis.indexOf(u), x = minis.length === 1 ? W - 62 : W - 102 + j * 50, y = FH - 4 - bb.b;
        return { x, y, hx: x + 1, hy: Math.max(miniTop, y + bb.t - HB - 1), bw: 46, bb };
      }
      const r = cnt === 1 ? 1 : cnt === 2 ? k + 0.5 : k, stag = cnt === 3 && k === 1 ? 9 : 0, x = u.side ? W - sz - 5 - stag : 5 + stag;
      const foot = Math.round(3 + (r + 1) * pitch - Math.max(2, (pitch - 60) / 2)), y = foot - bb.b, hy = Math.max(Math.round(3 + r * pitch), y + bb.t - HB - 1);
      return { x, y, hx: x + sz / 2 - 26, hy, bw: 52, bb };
    };
    const V = battle.units.map((u) => Object.assign(place(u), { u, sz: sizeOf(u), ph: Math.random() * 6, ox: 0, oy: 0, hp: u.hp, lag: u.hp, max: u.max, shield: u.shield, gx: u.gauge, st: {}, alive: true, flash: 0, shake: 0, alpha: 1, family: u.family }));
    const floats = [], parts = [], tweens = [], shots = [], hits = []; let preview = null, previewKey = '';
    let active = -1, speed = window.__hsSpeed || (S.settings.speed > 2 ? 2 : S.settings.speed || 1), auto = !!S.settings.auto, dead = false, paused = false, clock = 0, lastT = performance.now(), target = -1, waiting = null, sel = 0, shown = null, mine = false, note = '';
    const tween = (o, p, to, dur) => { for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].o === o && tweens[i].p === p) tweens.splice(i, 1); tweens.push({ o, p, from: o[p], to, t: 0, dur: Math.max(1, dur / speed) }); };
    const wait = (ms) => new Promise((res) => { const t0 = performance.now(); const tick = () => { if (dead) return; if (paused) { setTimeout(tick, 60); return; } if (performance.now() - t0 >= ms / speed) res(); else setTimeout(tick, 16); }; tick(); });
    const float = (v, text, col, big) => { const now = performance.now(), k = v.u.uid, s0 = float.last[k]; let dy = 0; if (s0 && now - s0.t < 520 / speed) dy = s0.dy + (big ? 9 : 7); float.last[k] = { t: now, dy: dy > 22 ? 0 : dy }; floats.push({ x: v.x + v.sz / 2, y: v.y + v.bb.t + 10 - float.last[k].dy, text, col, big, t: 0 }); };
    float.last = {};
    const burst = (v, col, cnt) => { for (let i = 0; i < cnt; i++) parts.push({ x: v.x + v.sz / 2, y: v.y + v.sz * 0.55, vx: (Math.random() - 0.5) * 70, vy: -Math.random() * 60 - 10, t: 0, col }); };

    /* ----- DOM ----- */
    const wrap = el('div', 'battle');
    const leave = () => (enc ? UI.confirm('Leave this wave?', 'Your Encore run ends here. Rewards you have reached stay yours.', 'Leave', () => { H.endEncore(S); UI.save(); UI.go('encore'); })
      : solo ? UI.confirm('Leave this gig?', 'Your tour ends here. Notes you have won stay yours.', 'End the tour', () => { dead = true; const out = H.finishSolo(S, false, null, rnd); UI.save(); UI.go('soloend', { out }); })
      : daily ? UI.confirm('Leave the gig?', 'You can try again as often as you like.', 'Leave', () => UI.go('daily'))
      : UI.confirm('Leave this battle?', 'You go back to your band. Nothing is lost.', 'Leave', () => (reh ? UI.go('rehearsal') : UI.go('adventure', { n }))));
    const menu = () => { paused = true; UI.settings(key('Leave battle', leave, 'wide soft')); const m = document.getElementById('modal'); const obs = new MutationObserver(() => { if (m.hidden) { obs.disconnect(); paused = false; } }); obs.observe(m, { attributes: true }); };
    const field = A.make(W * k, FH * k); field.className = 'full'; const fctx = field.getContext('2d'); fctx.scale((W * k) / W, field.height / FH);
    const fwrap = el('div', 'field'), callout = el('div', 'callout');
    const pill = el('button', 'stagepill'); pill.type = 'button'; pill.setAttribute('aria-label', 'Menu'); add(pill, el('span', '', enc ? 'Wave ' + n : solo ? (st.boss ? 'Solo · boss' : 'Solo · gig ' + n) : daily ? twist.n : reh ? 'Rehearsal ' + n : st.boss ? 'Boss ' + n : st.elite ? 'Loud ' + n : 'Floor ' + n), UI.icon('ic_gear')); pill.addEventListener('click', () => { Au.sfx('tap'); menu(); });
    add(fwrap, field, callout, pill);
    // the house rule in play, with what it is doing right now; a tap says it again
    let tw = battle.twState(); const rule = el('button', 'rulechip'); rule.type = 'button';
    const ruleText = () => { if (twist) { const r = st.twist; return r === 'potato' && tw.potato ? String(tw.potato.left) : r === 'volume' ? Math.round(tw.vol * 100) + '%' : r === 'lastcall' ? tw.left + ' left' : r === 'key' ? 'in ' + tw.key : ''; } return tw.restless ? 'Restless!' : ''; };
    const drawRule = () => { if (!twist && !tw.restless) { rule.hidden = true; return; } rule.hidden = false; rule.innerHTML = ''; add(rule, UI.icon(twist ? A.twistIcon(st.twist) : 'ev_crowd', twist ? 0.78 : 0.55), el('span', '', ruleText())); rule.classList.toggle('hot', (st.twist === 'lastcall' && tw.left <= 8) || (st.twist === 'potato' && tw.potato && tw.potato.left <= 2) || (!twist && tw.restless)); };
    rule.setAttribute('aria-label', twist ? 'House rule: ' + twist.n : 'The crowd'); rule.addEventListener('click', () => { Au.sfx('tap'); UI.toast(twist ? twist.n + ': ' + twist.d : 'The crowd is restless: every hit lands harder each turn.'); });
    drawRule(); fwrap.appendChild(rule);
    const panel = el('div', 'bpanel'), title = el('div', 'ptitle'), meta = el('div', 'pmeta'), desc = el('div', 'pdesc'), icons = el('div', 'picons'), hint = el('div', 'phint');
    // Auto and speed are switches: latched down and gold while on
    const autoB = key('Auto', () => { auto = !auto; S.settings.auto = auto ? 1 : 0; autoB.setAttribute('aria-pressed', String(auto)); UI.save(); if (auto && waiting != null) { const w2 = waiting; waiting = null; w2(null); } }, 'tog sm');
    const spd = key(speed + 'x', () => { speed = speed >= 2 ? 1 : 2; S.settings.speed = speed; spd.textContent = speed + 'x'; spd.setAttribute('aria-pressed', String(speed > 1)); UI.save(); }, 'tog sm');
    autoB.setAttribute('aria-pressed', String(auto)); spd.setAttribute('aria-pressed', String(speed > 1)); spd.setAttribute('aria-label', 'Speed');
    const useB = key('Use', () => fire(), 'go big');
    add(panel, box('phead', title, autoB, spd), meta, desc, box('prow', icons, useB), hint);
    add(wrap, fwrap, panel); root.appendChild(wrap);
    const say = (text, cls) => { callout.textContent = text; callout.className = 'callout on ' + (cls || ''); clearTimeout(say.t); say.t = setTimeout(() => callout.classList.remove('on'), 1000 / speed); };

    /* ----- the panel: one move at a time, with the pet's moves as round icons ----- */
    const KN = { beat: 'Basic move', phrase: 'Skill', finale: 'Special' }, turns = (k) => k + (k === 1 ? ' turn' : ' turns');
    const render = () => {
      if (!shown) { title.textContent = note || 'Get ready'; meta.textContent = ''; desc.textContent = ''; icons.innerHTML = ''; useB.disabled = true; hint.textContent = ''; hint.className = 'phint'; return; }
      const u = shown.u, a = u.ab[shown.idx], fam = V[u.uid].family;
      title.innerHTML = ''; add(title, UI.icon('fam_' + (fam || 'none')), el('span', '', a ? (a.def.n === u.name ? a.def.n : `${u.name} · ${a.def.n}`) : `${u.name}: ${shown.name}`));
      if (a) {
        const ready = a.cd === 0, lockd = battle.locked(u, a);
        meta.className = 'pmeta k-' + a.kind; meta.innerHTML = `<b>${KN[a.kind]}</b>` + (mine && lockd ? ' <span class="bad">needs the mic</span>' : mine && !ready ? ` <span class="bad">ready in ${turns(a.cd)}</span>` : a.def.cd ? ` <span>rests ${turns(a.def.cd)} after use</span>` : ' <span>always ready</span>');
        desc.innerHTML = UI.rich(H.describe(a.def));
      } else { meta.className = 'pmeta'; meta.textContent = 'Extra move'; desc.textContent = ''; }
      icons.innerHTML = '';
      u.ab.forEach((m, i) => {
        const lk = battle.locked(u, m), b = el('button', 'mvi' + (i === shown.idx ? ' sel' : '') + (m.cd > 0 || lk ? ' cool' : '') + (mine ? '' : ' off')); b.type = 'button'; b.setAttribute('aria-label', m.def.n + (lk ? ', needs the mic' : ''));
        b.appendChild(UI.icon(A.moveIcon(m.def, m.kind, u.side === 0 ? fam : 'none'), 1.08)); if (lk) b.appendChild(add(el('span', 'cdn lk'), UI.icon('ic_lock', 0.85))); else if (m.cd > 0) b.appendChild(el('span', 'cdn', String(m.cd)));
        b.addEventListener('click', () => { if (!mine || waiting == null) return; if (i === sel && battle.ready(u, m)) return fire(); sel = i; shown = { u, idx: i }; Au.sfx('tap', i * 2); render(); });
        icons.appendChild(b);
      });
      useB.disabled = !(mine && a && battle.ready(u, a)); useB.textContent = mine ? 'Use' : '· · ·';
      hint.className = 'phint' + (mine && tipText ? ' tipc' : '');
      hint.textContent = !mine ? (u.side === 1 ? 'Enemy turn' : auto ? 'Auto battle is on' : '') : tipText || (a && battle.locked(u, a) ? 'Only the pet with the mic can use this.' : a && a.cd > 0 ? 'Not ready yet. Pick another move.' : a && H.needsTarget(a.def) ? 'Tap an enemy to use it, or press Use.' : 'Press Use.');
    };
    let tipText = '';
    const fire = () => { if (waiting == null || !mine) return; const u = battle.units[battle.waiting], a = u.ab[sel]; if (!battle.ready(u, a)) { UI.toast(battle.locked(u, a) ? 'Only the pet with the mic can use that.' : 'That move is not ready yet.'); return; } Au.sfx('tap', sel * 2); mine = false; const w2 = waiting; waiting = null; w2({ ab: sel }); };

    const unitAt = (px, py) => { let best = null; for (const v of V) { if (!v.alive) continue; if (px >= v.x + 1 && px <= v.x + v.sz - 1 && py >= v.hy && py <= v.y + v.bb.b + 3) if (!best || v.y + v.sz > best.y + best.sz) best = v; } return best; };
    let opening = false, skipOpening = false; fwrap.addEventListener('click', () => { if (opening) skipOpening = true; }, true); panel.addEventListener('click', () => { if (opening) skipOpening = true; }, true);
    const look = (v) => { if (opening) return; paused = true; UI.inspect(battle, v.u, () => { paused = false; }); };
    // press and hold any pet or enemy to see its stats and moves (a tap only aims; the tap that ends a hold does nothing)
    const atPoint = (cx, cy) => { const r = field.getBoundingClientRect(); return unitAt(((cx - r.left) / r.width) * W, ((cy - r.top) / r.height) * FH); };
    let holdT = 0, held = false, hx = 0, hy = 0;
    field.addEventListener('pointerdown', (e) => { held = false; hx = e.clientX; hy = e.clientY; clearTimeout(holdT); holdT = setTimeout(() => { const v = atPoint(hx, hy); if (v && !dead && !opening) { held = true; Au.sfx('tap'); if (navigator.vibrate) navigator.vibrate(15); look(v); } }, 420); });
    field.addEventListener('pointermove', (e) => { if (Math.abs(e.clientX - hx) + Math.abs(e.clientY - hy) > 10) clearTimeout(holdT); });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) field.addEventListener(ev, () => clearTimeout(holdT));
    field.addEventListener('contextmenu', (e) => e.preventDefault());
    field.addEventListener('click', (e) => {
      if (held) { held = false; return; }
      const v = atPoint(e.clientX, e.clientY); if (!v || dead) return;
      if (v.u.side === 1 && waiting != null && mine) {
        const u = battle.units[battle.waiting], a = u.ab[sel];
        if (H.needsTarget(a.def)) {
          if (!battle.validTargets(u).includes(v.u)) { UI.toast('It has to hit the one with Taunt.'); return; }
          target = v.u.uid; if (!battle.ready(u, a)) { UI.toast(battle.locked(u, a) ? 'Only the pet with the mic can use that.' : 'That move is not ready yet.'); return; } fire(); return;
        }
      }
      // a tap is only for aiming; the first stray tap of a battle says how to look closer
      if (!hintHold) { hintHold = true; UI.toast('Press and hold to see its stats and moves.'); }
    });
    let hintHold = false;

    /* ----- drawing (all in layout units; the canvas is scaled up to the screen's real pixels) ----- */
    const singing = enc || reh || daily || solo || !H.floorHushed(S, n), bg = A.bgMode(st.region, W, FH, 0.2, singing ? 'sing' : 'hush');
    // where the region sings again, a few faint notes drift up through the sky behind the fight
    const NCOL = ['#ffc928', '#ff9a8a', '#7fe0d8', '#b8e88a', '#d8b0ff'], drift = singing ? [0, 1, 2, 3, 4].map((i) => ({ x: 14 + i * ((W - 28) / 4) + (rnd() - 0.5) * 16, ph: i / 5 + rnd() * 0.1, sp: 0.07 + rnd() * 0.03, c: NCOL[i] })) : [];
    const driftNotes = () => { for (const d of drift) { const t = (clock * d.sp + d.ph) % 1, y = FH * (0.42 - t * 0.38), x = d.x + Math.sin((clock + d.ph * 9) * 1.3) * 4; fctx.globalAlpha = Math.sin(t * Math.PI) * 0.45; fctx.save(); fctx.translate(x, y); fctx.scale(0.5, 0.5); fctx.lineCap = 'round'; fctx.strokeStyle = d.c; fctx.lineWidth = 2; fctx.beginPath(); fctx.moveTo(0, 6); fctx.lineTo(0, -6); fctx.lineTo(7, -8); fctx.lineTo(7, 4); fctx.stroke(); fctx.fillStyle = d.c; fctx.beginPath(); fctx.arc(-2.5, 6.5, 2.6, 0, 6.2832); fctx.moveTo(7.1, 4.5); fctx.arc(4.5, 4.5, 2.6, 0, 6.2832); fctx.fill(); fctx.restore(); } fctx.globalAlpha = 1; };
    const label = (str, x, y, col, align, size) => { fctx.font = `800 ${size || 7.2}px 'Baloo 2', sans-serif`; fctx.textAlign = align || 'left'; fctx.textBaseline = 'top'; fctx.lineJoin = 'round'; fctx.strokeStyle = INK; fctx.lineWidth = 1.8; fctx.strokeText(str, x, y); fctx.fillStyle = col; fctx.fillText(str, x, y); };
    const rr = (x, y, w, h, r, col) => { fctx.fillStyle = col; fctx.beginPath(); fctx.moveTo(x + r, y); fctx.arcTo(x + w, y, x + w, y + h, r); fctx.arcTo(x + w, y + h, x, y + h, r); fctx.arcTo(x, y + h, x, y, r); fctx.arcTo(x, y, x + w, y, r); fctx.closePath(); fctx.fill(); };
    const drawUnit = (v) => {
      if (v.alpha <= 0.02) return;
      const img = A.sprite(v.u.spec.sprite, v.u.spec.mirror ? (v.flash > 0 ? 'mirrorflash' : 'mirror') : v.flash > 0 ? 'flash' : '', v.sz * k);
      const sx = v.x + v.ox + (v.shake > 0 ? (Math.random() < 0.5 ? -1 : 1) : 0), sy = v.y + v.oy, cx = sx + (v.bb.l + v.bb.r) / 2, fy = sy + v.bb.b - 1.5, sw = Math.min(v.sz > 48 ? 60 : 34, v.bb.r - v.bb.l);
      fctx.globalAlpha = v.alpha * 0.2; fctx.fillStyle = INK; fctx.beginPath(); fctx.ellipse(cx, fy, sw / 2, 3.2, 0, 0, 6.2832); fctx.fill();
      fctx.globalAlpha = v.alpha;
      if (active === v.u.uid && v.alive) { fctx.save(); fctx.lineWidth = 2.2; fctx.strokeStyle = INK; fctx.setLineDash([4, 3]); fctx.lineDashOffset = -clock * 8; fctx.beginPath(); fctx.ellipse(cx, fy + 0.6, sw / 2 + 5, 5.4, 0, 0, 6.2832); fctx.stroke(); fctx.strokeStyle = '#ffc928'; fctx.lineWidth = 1.2; fctx.stroke(); fctx.restore(); }
      const br = v.alive ? Math.sin(clock * 2.6 + v.ph) * 0.018 : 0;   // a slow breath, from the feet up
      fctx.save(); fctx.translate(sx + v.sz / 2, sy + v.bb.b); fctx.scale((v.u.side === 1 ? -1 : 1) * (1 + br), 1 - br); fctx.drawImage(img, -v.sz / 2, -v.bb.b, v.sz, v.sz); fctx.restore();
      fctx.globalAlpha = 1;
    };
    const drawBars = (v) => {
      if (!v.alive) return;
      const hx = v.hx, hy = v.hy, bw = v.bw, by = hy + 8.6;
      A.draw(fctx, 'fam_' + (v.family || 'none'), hx, hy - 0.6, '', 0.8);
      label('Lv ' + v.u.spec.lvl, hx + 9.5, hy - 0.8, '#ffffff');
      const fr = Math.max(0, v.hp / v.max), low = fr < 0.3; label(UI.fmt(Math.max(0, Math.round(v.hp))), hx + bw, hy - 0.8, low ? '#ffb8ae' : '#ffffff', 'right');
      rr(hx - 1, by - 1, bw + 2, 6.4, 3.2, INK); rr(hx, by, bw, 4.4, 2.2, '#ffffff');
      fctx.save(); fctx.beginPath(); fctx.rect(hx, by, bw, 4.4); fctx.clip();
      if (v.lag > v.hp) rr(hx - 3, by, bw * Math.min(1, v.lag / v.max) + 3, 4.4, 2.2, '#ffd95a');
      if (fr > 0) rr(hx - 3, by, bw * fr + 3, 4.4, 2.2, low ? '#ff3d5a' : '#2ecb6e');
      // while you aim: the part of the bar the chosen move is expected to take (blinking white) or give back (blinking green)
      const pv = preview && preview[v.u.uid];
      if (pv) {
        const loss = Math.min(Math.max(0, v.hp), Math.max(0, pv.dmg - v.shield)), gain = Math.min(v.max - Math.max(0, v.hp), pv.heal), pa = 0.5 + 0.4 * Math.sin(clock * 7);
        fctx.globalAlpha = pa;
        if (loss > 0.5) { fctx.fillStyle = '#ffffff'; fctx.fillRect(hx + (bw * (v.hp - loss)) / v.max, by, (bw * loss) / v.max, 4.4); }
        if (gain > 0.5) { fctx.globalAlpha = pa * 0.75; fctx.fillStyle = '#2ecb6e'; fctx.fillRect(hx + bw * fr, by, (bw * gain) / v.max, 4.4); }
        fctx.globalAlpha = 1;
      }
      if (v.shield > 0) { fctx.fillStyle = '#4a8ae0'; fctx.fillRect(hx, by + 3, Math.min(bw, (bw * v.shield) / v.max * 2), 1.4); }
      fctx.restore();
      rr(hx + 1, by + 6.2, bw - 2, 2.6, 1.3, INK); const gw = (bw - 3.2) * Math.max(0, Math.min(1, v.gx / GMAX)); if (gw > 0.6) rr(hx + 1.6, by + 6.8, gw, 1.4, 0.7, '#ffc928');
      // effect tokens stack on the inner side of the fighter
      // each token carries the turns it has left; a long-lasting one (a boss's rage) shows none
      const sts = Object.keys(v.st); if (v.shield > 0) sts.unshift('shield');
      const ix = v.u.side === 0 ? Math.min(v.x + v.bb.r - 1, v.x + v.sz - 7) : Math.max(v.x + v.bb.l - 9.6, v.x - 4);
      sts.slice(0, 4).forEach((s, i) => {
        const y = v.y + v.bb.t + 2 + i * 11; A.draw(fctx, 'st_' + s, ix, y, '', 1.2);
        const d = s === 'shield' ? 0 : v.st[s]; if (!(d > 0 && d < 50)) return;
        const bx = ix + 9.4, by2 = y + 9; fctx.fillStyle = INK; fctx.beginPath(); fctx.arc(bx, by2, 3.3, 0, 6.2832); fctx.fill();
        fctx.font = "800 5.6px 'Baloo 2', sans-serif"; fctx.textAlign = 'center'; fctx.textBaseline = 'middle'; fctx.fillStyle = '#ffffff'; fctx.fillText(String(d), bx, by2 + 0.4);
      });
      // house-rule tokens on the one who has them: the potato with its fuse, the mic
      const pot = tw.potato && tw.potato.uid === v.u.uid, mic = tw.mic && tw.mic[v.u.side] === v.u.uid;
      if (pot || mic) { const mx = v.u.side === 0 ? hx + bw + 1 : hx - 15, my = hy + 9 + Math.sin(clock * 5) * 1.2; A.draw(fctx, pot ? 'tw_potato' : 'ic_mic', mx, my, '', pot ? 0.95 : 0.85); if (pot) { const bx = mx + 12, by2 = my + 11; fctx.fillStyle = tw.potato.left <= 2 ? '#ff3d5a' : INK; fctx.beginPath(); fctx.arc(bx, by2, 4, 0, 6.2832); fctx.fill(); fctx.font = "800 6px 'Baloo 2', sans-serif"; fctx.textAlign = 'center'; fctx.textBaseline = 'middle'; fctx.fillStyle = '#ffffff'; fctx.fillText(String(tw.potato.left), bx, by2 + 0.4); } }
      // while you choose: who is targeted, and which enemies your pet is strong or weak against
      if (waiting != null && mine && v.u.side === 1) {
        const me = battle.units[battle.waiting], adv = H.advantage(me.family, v.family);
        if (adv) A.draw(fctx, adv > 0 ? 'ic_up' : 'ic_down', hx - 9, hy + 6);
        if (target === v.u.uid && H.needsTarget(me.ab[sel].def)) { const pu = Math.sin(clock * 6) * 1.2, x0 = v.x + v.bb.l - 3 - pu, y0 = v.y + v.bb.t - 2 - pu, x1 = v.x + v.bb.r + 3 + pu, y1 = v.y + v.bb.b + 1 + pu, L = 7; fctx.lineCap = 'round'; fctx.lineJoin = 'round';
          for (const [col, lw] of [[INK, 4.4], ['#ff6b5e', 2.2]]) { fctx.strokeStyle = col; fctx.lineWidth = lw; fctx.beginPath(); for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { fctx.moveTo(x + dx * L, y); fctx.lineTo(x, y); fctx.lineTo(x, y + dy * L); } fctx.stroke(); } }
      }
    };
    // each family lands its hits in its own way: drum rings, string slashes, breath gusts, brass blasts, voice notes
    const dot = (x, y, col, s2) => { const r = (s2 || 1) * 1.3; fctx.fillStyle = INK; fctx.beginPath(); fctx.arc(x, y, r + 0.9, 0, 6.2832); fctx.fill(); fctx.fillStyle = col; fctx.beginPath(); fctx.arc(x, y, r, 0, 6.2832); fctx.fill(); };
    const drawHit = (q, kk0) => {
      const col = q.col, x = q.x, y = q.y, d = q.dir, k = kk0;
      if (q.fam === 'drum') { for (const [r0, lag] of [[16, 0], [10, 0.25]]) { const kk = (k - lag) / (1 - lag); if (kk <= 0) continue; const r = 3 + r0 * kk; for (let i = 0; i < 20; i++) { const an = (i / 20) * Math.PI * 2; dot(x + Math.cos(an) * r, y + Math.sin(an) * r * 0.55, i % 2 ? '#ffffff' : col); } } }
      else if (q.fam === 'string') { for (let j = 0; j < 3; j++) { const o = (j - 1) * 6, a0 = Math.max(0, k * 1.6 - 0.3 - j * 0.12), a1 = Math.min(1, k * 1.6 - j * 0.12); for (let t = a0; t < a1; t += 0.06) dot(x - d * 12 + d * 24 * t + o, y - 12 + 24 * t - o * 0.4, t > a1 - 0.2 ? '#ffffff' : col); } }
      else if (q.fam === 'breath') { for (let j = 0; j < 4; j++) { const yy = y - 10 + j * 7, len = 10 - (j % 2) * 4, x0 = x - d * 18 + d * 30 * k + (j % 2) * 4 * d; for (let t = 0; t < len; t += 2) dot(x0 - d * t, yy + Math.sin((t + k * 20) / 3), t < 3 ? '#ffffff' : col); } }
      else if (q.fam === 'brass') { for (let j = 0; j < 3; j++) { const r = 5 + j * 5 + k * 8; if (k * 3 < j * 0.6) continue; for (let i = -4; i <= 4; i++) { const an = (i / 4) * 0.9; dot(x - d * 10 + d * Math.cos(an) * r, y + Math.sin(an) * r, j === 0 ? '#ffffff' : col); } } }
      else if (q.fam === 'voice') { for (let j = 0; j < 3; j++) { const an = -Math.PI / 2 + (j - 1) * 0.9, r = 4 + 16 * k, nx = x + Math.cos(an) * r, ny = y + Math.sin(an) * r * 0.8; fctx.strokeStyle = INK; fctx.lineWidth = 3; fctx.lineCap = 'round'; fctx.beginPath(); fctx.moveTo(nx + 2, ny); fctx.lineTo(nx + 2, ny - 7); fctx.stroke(); fctx.strokeStyle = col; fctx.lineWidth = 1.4; fctx.stroke(); dot(nx, ny, col, 1.6); } }
      else { const r = 4 + 10 * k; for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1], [1.3, 0], [-1.3, 0]]) { dot(x + dx * r, y + dy * r * 0.8, '#e6e0f0', 1.6); dot(x + dx * r * 0.55, y + dy * r * 0.45, '#9a94b8'); } }
    };
    const loop = (now) => {
      if (dead) return; const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now; clock += dt;
      for (let i = tweens.length - 1; i >= 0; i--) { const t = tweens[i]; t.t += dt * 1000; const kk = Math.min(1, t.t / t.dur); t.o[t.p] = t.from + (t.to - t.from) * kk; if (kk >= 1) tweens.splice(i, 1); }
      fctx.drawImage(bg, 0, 0, W, FH); driftNotes();
      const ord = V.slice().sort((a, b) => a.y + a.bb.b - (b.y + b.bb.b));
      for (const v of ord) { if (v.flash > 0) v.flash -= dt * speed; if (v.shake > 0) v.shake -= dt * speed; if (v.lag > v.hp) v.lag = Math.max(v.hp, v.lag - v.max * dt * speed * 0.7); else v.lag = v.hp; drawUnit(v); }
      // what the move being aimed would do, worked out once per move and target
      if (waiting != null && mine && !opening) { const u = battle.units[battle.waiting], a = u && u.ab[sel], pk = battle.waiting + '|' + battle.turn + '|' + sel + '|' + target; if (a && a.cd === 0) { if (pk !== previewKey) { previewKey = pk; preview = battle.preview(u, a.def, target >= 0 ? battle.units[target] : null); } } else { preview = null; previewKey = ''; } } else { preview = null; previewKey = ''; }
      for (const v of ord) drawBars(v);
      for (let i = shots.length - 1; i >= 0; i--) { const q = shots[i]; q.t += dt * speed; const kk = Math.min(1, q.t / q.dur); if (kk >= 1) { shots.splice(i, 1); continue; } dot(q.x0 + (q.x1 - q.x0) * kk, q.y0 + (q.y1 - q.y0) * kk - Math.sin(kk * Math.PI) * 8, q.col, 2.2); }
      for (let i = hits.length - 1; i >= 0; i--) { const q = hits[i]; q.t += dt * speed; const kk = q.t / 0.26; if (kk >= 1) { hits.splice(i, 1); continue; } drawHit(q, kk); }
      for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.t += dt * speed; p.x += p.vx * dt * speed; p.y += p.vy * dt * speed; p.vy += 220 * dt * speed; if (p.t > 0.45) { parts.splice(i, 1); continue; } fctx.fillStyle = p.col; fctx.beginPath(); fctx.arc(p.x, p.y, p.t < 0.25 ? 1.3 : 0.8, 0, 6.2832); fctx.fill(); }
      for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.t += dt; if (f.t > 1.0) { floats.splice(i, 1); continue; } const y = f.y - Math.min(1, f.t * 2.4) * 12; fctx.globalAlpha = f.t > 0.8 ? (1 - f.t) * 5 : 1; A.text(fctx, f.text, Math.max(18, Math.min(W - 18, f.x)), Math.max(2, y - (f.big ? 6 : 0)), f.col, f.big); fctx.globalAlpha = 1; }
      requestAnimationFrame(loop);
    };

    /* ----- your turn ----- */
    const askPlayer = (u) => new Promise((res) => {
      const vt = battle.validTargets(u); if (!vt.some((x) => x.uid === target)) { const best = vt.reduce((b, x) => { const sc = (y) => H.advantage(u.family, y.family) * 0.35 - y.hp / y.max; return sc(x) > sc(b) ? x : b; }, vt[0]); target = best ? best.uid : -1; }
      tipText = ''; if (!daily && !solo && !enc && !reh && n <= 4 && !S.flags['tip' + n]) { S.flags['tip' + n] = 1; tipText = ['Your turn! Tap the enemy to attack it.', 'Tap a round icon to pick another move.', 'Green arrow: your pet is strong against that enemy.', 'The yellow line shows whose turn is coming.'][n - 1]; }
      sel = 0; shown = { u, idx: 0 }; mine = true; waiting = res; render();
    });
    const idle = (text) => { mine = false; if (text != null) { shown = null; note = text; } render(); };

    /* ----- playing events back ----- */
    const fam = (uid) => (uid >= 0 ? V[uid].family : 'none');
    async function play(evs) {
      for (let i = 0; i < evs.length; i++) {
        if (dead) return; const e = evs[i], nx = evs[i + 1];
        switch (e.t) {
          case 'turn': active = e.u; V[e.u].gx = GMAX; await wait(V[e.u].u.side === 1 ? 260 : 120); break;
          case 'ability': { const v = V[e.u]; if (!e.follow || e.kind !== 'beat') { const idx = v.u.ab.findIndex((a) => a.def.n === e.n); mine = false; shown = { u: v.u, idx, name: e.n }; render(); } const dir = v.u.side === 0 ? 1 : -1; tween(v, 'ox', dir * (e.kind === 'beat' ? 8 : 12), 100); setTimeout(() => tween(v, 'ox', 0, 150), 130 / speed); await wait(e.follow ? 180 : v.u.side === 1 ? 520 : 380); break; }
          case 'dmg': { const v = V[e.tgt];
            if (e.src >= 0 && e.kind === 'hit' && V[e.src].alpha > 0.5) { const a = V[e.src]; shots.push({ x0: a.x + a.sz / 2 + (a.u.side ? -8 : 8), y0: a.y + a.sz * 0.45, x1: v.x + v.sz / 2, y1: v.y + v.sz * 0.5, t: 0, dur: 0.14, col: a.u.side === 0 ? FCOL[a.family] : '#9a94b8', ally: a.u.side === 0 }); await wait(140); }
            v.hp = e.hp; v.shield = e.shield; v.flash = 0.12; v.shake = 0.18; const pz = e.kind === 'poison';
            if (e.src >= 0 && e.kind === 'hit') { const a = V[e.src]; hits.push({ x: v.x + v.sz / 2, y: v.y + v.sz * 0.55, t: 0, fam: a.u.side === 0 ? a.family : 'none', col: FCOL[a.family] || '#b8b4d0', dir: a.u.side === 0 ? 1 : -1 }); }
            float(v, e.amt === 0 && e.abs ? 'Block' : String(e.amt), e.crit ? '#ffc928' : pz ? '#d8a0ff' : e.adv > 0 ? '#b8ffb0' : e.adv < 0 ? '#d9d2ea' : '#ffffff', !(e.amt === 0 && e.abs));
            if (e.crit) float(v, 'Critical!', '#ffc928'); else if (e.adv > 0 && e.kind === 'hit') float(v, 'Strong', '#b8ffb0'); else if (e.adv < 0 && e.kind === 'hit') float(v, 'Weak', '#d9d2ea');
            burst(v, pz ? '#b060e0' : FCOL[fam(e.src)] || '#fff', e.crit ? 9 : 5); Au.sfx(pz ? 'bad' : 'hit', { family: e.src >= 0 && V[e.src].u.side === 0 ? fam(e.src) : null, crit: e.crit, heavy: e.amt > v.max * 0.25 });
            await wait(nx && nx.t === 'dmg' ? 170 : 300); break; }
          case 'heal': { const v = V[e.tgt]; v.hp = e.hp; float(v, '+' + e.amt, '#7fe89a', true); Au.sfx('heal'); await wait(nx && nx.t === 'heal' ? 80 : 240); break; }
          case 'shield': { const v = V[e.u]; v.shield = e.shield; if (e.amt) { float(v, 'Shield', '#a8d0ff'); Au.sfx('shield'); await wait(nx && nx.t === 'shield' ? 60 : 200); } break; }
          case 'st': { const v = V[e.u]; v.st[e.s] = e.dur || 1; const d = H.STATUS[e.s]; float(v, H.STATUS[e.s].n, d.buff ? '#ffe58a' : '#ff9a9a'); Au.sfx(d.buff ? 'good' : 'bad'); await wait(nx && nx.t === 'st' ? 70 : 220); break; }
          case 'stoff': delete V[e.u].st[e.s]; break;
          case 'miss': float(V[e.tgt], 'Dodged', '#a8e6ff'); Au.sfx('miss'); await wait(260); break;
          case 'skip': { const v = V[e.u]; float(v, 'Stunned', '#ffe58a'); idle(`${v.u.name} is stunned and misses a turn`); Au.sfx('skip'); await wait(520); break; }
          case 'fall': { const v = V[e.u]; v.alive = false; v.st = {}; tween(v, 'alpha', 0, 420); tween(v, 'oy', 6, 420); Au.sfx('fall'); if (active === e.u) active = -1; if (target === e.u) target = -1; Au.music.din(battle.alive(1).length / 3); await wait(420); break; }
          case 'revive': { const v = V[e.u]; v.alive = true; v.hp = e.hp; v.alpha = 0; v.oy = 0; tween(v, 'alpha', 1, 250); float(v, 'Back up!', '#ffe58a'); Au.sfx('evolve'); await wait(420); break; }
          case 'note': float(V[e.u], e.txt, '#ffe58a'); await wait(220); break;
          case 'gauge': { const v = V[e.u]; if (Math.abs(e.d) >= 0.1) float(v, e.d > 0 ? 'Sooner' : 'Later', e.d > 0 ? '#ffe58a' : '#ff9a9a'); break; }
          case 'shift': { const v = V[e.u]; v.family = e.family; float(v, 'Changes!', FCOL[e.family]); burst(v, FCOL[e.family], 12); Au.sfx('bad'); await wait(420); break; }
          case 'sync': e.units.forEach((s, k) => { const v = V[k]; v.hp = s.hp; v.shield = s.shield; v.st = Object.assign({}, s.st); v.family = s.family; tween(v, 'gx', s.gauge, 240); if (s.alive && !v.alive) { v.alive = true; v.alpha = 1; v.oy = 0; } }); if (e.tw) { const was = tw.restless; tw = e.tw; drawRule(); if (!was && tw.restless) say('The crowd is restless!', 'foe'); } break;
          case 'keychange': { e.fams.forEach((f, k) => { const v = V[k]; if (v.alive && v.family !== f) { v.family = f; burst(v, FCOL[f], 6); } }); say('Key change!', 'ens'); Au.sfx('cue'); for (const v of V) if (v.alive) float(v, H.FAMILIES[v.family].n, FCOL[v.family]); await wait(700); break; }
          case 'mark': { const v = V[e.u]; if (e.m === 'potato') { tw.potato = Object.assign({}, tw.potato || { left: 0 }, { uid: e.u }); float(v, 'Hot potato!', '#ffb050'); Au.sfx('tap', 6); } else { if (tw.mic) tw.mic[v.u.side] = e.u; float(v, 'Mic!', '#ffe58a'); } await wait(180); break; }
          case 'ensemble': break;
          case 'end': active = -1; await wait(500); break;
        }
      }
    }
    // the boss's entrance: the field dims, a banner names it, and it stamps down; a tap skips it
    // the boss's entrance is a screen of its own: the region dims, the boss stamps down under its name, then the battle opens
    let bossOv = null;
    if (st.boss && boss && !window.__hsSpeed) {
      const name = boss.name, mode = !enc && !reh && !daily && !solo && H.floorHushed(S, n) ? 'hush' : 'sing';
      bossOv = el('div', 'bossin full' + (speed >= 2 ? ' fast' : ''));
      add(bossOv, UI.bgEl(st.region, W, UI.Hh, 0.5, mode), el('div', 'bosstint'), el('div', 'bossray'), add(el('div', 'bossspr'), UI.sp(boss.spec.sprite, 1.7, { anim: false, flip: true }), el('div', 'bossdust')),
        add(el('div', 'bossban'), el('div', 'bosskick', enc ? 'Encore · wave ' + n : solo ? 'Solo tour · the last stop' : daily ? 'Daily Gig · ' + twist.n : reh ? 'Rehearsal' : 'Boss · floor ' + n), el('div', 'bossnm', name), el('div', 'bossrg', H.REGIONS[st.region].n)), el('div', 'bossskip', 'Tap to skip'));
      bossOv.addEventListener('click', () => { skipOpening = true; });
      wrap.appendChild(bossOv);
    }
    // the Daily Gig's house rule gets its own entrance: the poster's badge stamps down with the rule under it
    let twistOv = null;
    if (twist && !st.boss && !window.__hsSpeed) {
      twistOv = el('div', 'bossin twistin full' + (speed >= 2 ? ' fast' : ''));
      add(twistOv, UI.bgEl(st.region, W, UI.Hh, 0.5, 'sing'), el('div', 'bosstint night'), el('div', 'bossray'), add(el('div', 'twbadge'), UI.icon(A.twistIcon(st.twist), 4.2)),
        add(el('div', 'bossban'), el('div', 'bosskick', 'Daily Gig · ' + st.venue), el('div', 'bossnm', twist.n), el('div', 'twrule', twist.d)), el('div', 'bossskip', 'Tap to start'));
      twistOv.addEventListener('click', () => { skipOpening = true; }); wrap.appendChild(twistOv);
    }
    async function twistIn() {
      if (!twistOv) return; opening = true; skipOpening = false; const t0 = performance.now(); let stamped = false;
      while (!dead && !skipOpening && performance.now() - t0 < 4200 / (speed >= 2 ? 1.5 : 1)) { if (!stamped && performance.now() - t0 >= 450) { stamped = true; Au.sfx('stamp'); twistOv.classList.add('quake'); } await new Promise((res) => setTimeout(res, 30)); }
      opening = false; if (dead) return; twistOv.classList.add('out'); await new Promise((res) => setTimeout(res, 380)); twistOv.remove(); twistOv = null;
    }
    async function bossIn() {
      if (!bossOv) { if (st.boss) { say(boss ? boss.name : H.DIN[H.REGIONS[st.region].boss].n, 'foe'); await wait(900); } return; }
      opening = true; skipOpening = false;
      const T = (ms) => ms / (speed >= 2 ? 1.6 : 1), t0 = performance.now(); let stamped = false;
      while (!dead && !skipOpening && performance.now() - t0 < T(2500)) {
        if (!stamped && performance.now() - t0 >= T(620)) { stamped = true; Au.sfx('stamp'); bossOv.classList.add('quake'); }
        await new Promise((res) => setTimeout(res, 30));
      }
      opening = false; if (dead) return;
      bossOv.classList.add('out'); await new Promise((res) => setTimeout(res, 380)); bossOv.remove(); bossOv = null;
    }
    async function run() {
      if (st.boss) await bossIn(); else await twistIn();
      if (dead) return; idle(twist ? twist.n : 'Get ready'); await wait(450);
      // the team's ensemble plays its opening; a tap skips it
      const ens = battle.ensemble && H.ENS[battle.ensemble];
      if (ens && !window.__hsSpeed) {
        const secs = Au.ensemble(ens.id, speed >= 2 ? 1.6 : 1, true); opening = true; skipOpening = false;
        callout.textContent = ens.n; callout.className = 'callout on ens'; shown = null; note = ens.d(); title.textContent = ens.n; meta.textContent = 'Your ensemble'; desc.textContent = ens.d(); hint.textContent = 'Tap to skip';
        const t0 = performance.now(); while (!dead && !skipOpening && performance.now() - t0 < secs * 1000) await new Promise((res) => setTimeout(res, 60));
        opening = false; callout.classList.remove('on'); if (skipOpening) Au.stopEnsemble(); if (dead) return; idle(ens.n);
      }
      await play(battle.startEvents || []);
      while (!battle.over && !dead) {
        const r = battle.next(auto); await play(r.events);
        if (r.wait != null && !battle.over) {
          const u = battle.units[r.wait]; let res;
          if (auto) res = null; else res = await askPlayer(u);
          if (dead) return; mine = false; render();
          const out = res ? battle.act(res.ab, target >= 0 ? target : null) : battle.autoAct();
          if (out) await play(out.events);
        }
      }
      if (dead) return; idle(battle.over === 'win' ? 'You win!' : 'Your band is out'); await wait(200); finish();
    }
    function finish() {
      const win = battle.over === 'win'; Au.music.din(0); Au.sfx(win ? 'win' : 'lose');
      const out = enc ? H.finishEncore(S, win, battle) : solo ? H.finishSolo(S, win, battle, rnd) : daily ? H.finishDaily(S, win, battle) : reh ? H.finishRehearsal(S, n, win, rnd, battle) : H.finishStage(S, n, win, rnd, battle);
      if (daily && !win) out.why = battle.ev.some((e) => e.t === 'end' && e.why === 'time') ? 'time' : null;
      UI.save(); UI.result(out);
    }
    Au.music.din(1); requestAnimationFrame(loop); run();
    return { leave: () => { dead = true; Au.music.din(0); Au.stopEnsemble(); } };
  };

  // Encore: after a won wave, go on or stop; after a lost one, the run is over
  UI.encoreResult = (out) => {
    const S = UI.S, kids = [], loot = box('loot');
    if (out.xp) loot.appendChild(UI.purse('ic_xp', '+' + out.xp)); if (out.echo) loot.appendChild(UI.purse('ic_echo', '+' + out.echo + (out.echo === 1 ? ' echo' : ' echoes'))); if (out.shells) loot.appendChild(UI.purse('ic_shell', '+' + out.shells));
    if (out.win) {
      kids.push(txt('disp big center', `Wave ${out.wave} cleared!`));
      if (out.paid.length) kids.push(txt('chip center', 'Weekly reward: wave ' + out.paid.join(', ')));
      kids.push(loot); if (out.echo) { const ei = UI.echoIntro(); if (ei) kids.push(ei); }
      if (out.ups) kids.push(txt('center good', `<b>Level up!</b> Your pets got stronger.`), UI.unlockNote(out.ups));
      const next = H.ENCORE.miles.find(([m]) => m > out.wave && S.encore.weekBest < m);
      kids.push(txt('small dim center', next ? `Next weekly reward at wave ${next[0]}.` : 'All weekly rewards won. Go for a new best!'));
      kids.push(UI.key(`Wave ${out.wave + 1}`, () => UI.go('battle', { enc: 1 }), 'go wide big'));
      kids.push(UI.key('Stop here', () => UI.confirm('End this run?', 'Rewards you have reached stay yours.', 'End run', () => { H.endEncore(S); UI.save(); UI.go('encore'); }), 'wide soft'));
    } else {
      kids.push(txt('disp big center', 'Encore over'), txt('center', `You cleared <b>${out.reached}</b> ${out.reached === 1 ? 'wave' : 'waves'}. Best: <b>${out.best}</b>.`), loot);
      kids.push(UI.key('Back to Encore', () => UI.go('encore'), 'go wide big'), UI.key('Home', () => UI.go('home'), 'wide soft'));
    }
    UI.save(); UI.modal(...kids);
  };
  UI.result = (out) => {
    if (out.encore) return UI.encoreResult(out);
    if (out.daily) return UI.dailyResult(out);
    if (out.solo) return UI.soloResult(out);
    const S = UI.S, kids = [], nx = out.first ? S.stage : out.n;
    const loot = () => { const r = box('loot'); if (out.notes) r.appendChild(UI.purse('ic_note', '+' + out.notes)); if (out.xp) r.appendChild(UI.purse('ic_xp', '+' + out.xp)); if (out.shells && !out.giftShell) r.appendChild(UI.purse('ic_shell', '+' + out.shells)); if (out.echo && !out.story) r.appendChild(UI.purse('ic_echo', '+' + out.echo + (out.echo === 1 ? ' echo' : ' echoes'))); return r; };
    const evo = H.canEvolveAny(S), evoKey = () => UI.key((H.nextForms(evo).length ? 'Evolve ' : 'Add a star to ') + H.FORMS[evo.form].n, () => UI.go('pet', { id: evo.id, n: nx, back: out.reh ? 'rehearsal' : 'team' }), 'gold wide');
    const levelUp = () => {
      if (out.ups) {
        const lv = el('div', 'lvup' + (window.__hsSpeed ? ' now' : '')), band = el('div', 'lvband'), team = H.teamPets(S).filter(Boolean);
        team.forEach((p, i) => { const c = UI.sp(p.form, team.length === 1 || i === 1 ? 1.05 : 0.9, { anim: false }); c.style.setProperty('--d', i * 0.09 + 's'); band.appendChild(c); });
        add(lv, el('div', 'rays'), band, add(el('div', 'lvbadge'), el('small', '', 'Level up'), el('b', '', String(S.level))));
        for (let i = 0; i < 14; i++) { const s = el('i', 'spark'), a = (i / 14) * 6.283; s.style.left = '50%'; s.style.top = '34%'; s.style.setProperty('--x', Math.cos(a) * (60 + (i % 3) * 22) + '%'); s.style.setProperty('--y', Math.sin(a) * (110 + (i % 2) * 40) + '%'); s.style.animationDelay = 0.15 + (i % 4) * 0.05 + 's'; lv.appendChild(s); }
        kids.push(lv, txt('center good', out.ups > 1 ? `<b>+${out.ups} levels!</b> Your pets got stronger.` : 'Your pets got stronger.'));
        const un = UI.unlockNote(out.ups); if (un) kids.push(un);
        if (!window.__hsSpeed) setTimeout(() => Au.sfx('level'), 850);
      }
      kids.push(box('row', txt('small dim', 'Next level'), add(el('div', 'grow'), UI.meter(S.xp / H.xpNeed(S.level))))); };
    const gold = () => { if (!H.recordsReady(S)) return false; const b = UI.key('', () => UI.go('records'), 'gold wide'); add(b, UI.icon('ic_record'), 'A record is ready'); kids.push(b); return true; };
    if (out.reh) {
      // a rehearsal: an echo the first time, practice after that
      if (out.win) {
        kids.push(txt('disp big center', 'Rehearsal done!'), loot());
        levelUp(); gold(); if (evo) kids.push(evoKey());
        kids.push(UI.key('More rehearsals', () => UI.go('rehearsal'), 'go wide big'), UI.key('Home', () => UI.go('home'), 'wide soft'));
      } else {
        kids.push(txt('disp big center', 'Not this time'), txt('center dim', 'Nothing is lost. Try as often as you like.'), loot());
        kids.push(UI.key('Try again', () => UI.go('battle', { n: out.n, reh: 1 }), 'go wide big'), UI.key('Rehearsals', () => UI.go('rehearsal'), 'wide soft'));
      }
      UI.modal(...kids); return;
    }
    if (out.win) {
      kids.push(txt('disp big center', out.boss ? 'Boss beaten!' : 'Floor cleared!'), loot());
      levelUp();
      if (!out.first) kids.push(txt('small dim center', 'Replay: no notes.'));
      if (out.item && !out.gift) kids.push(txt('label center', 'You found'), UI.itemRow(out.item));
      // some wins lead somewhere first: the story after a boss, or the first shell and first piece of equipment
      if (out.story) kids.push(UI.key('Continue', () => UI.go('story', { region: out.region, n: out.n, shells: out.shells, echo: out.bossEcho || 0, legend: out.legend ? out.legend.id : 0 }), 'go wide big'));
      else if (out.giftShell) kids.push(UI.key('Continue', () => UI.gift('shell'), 'go wide big'));
      else if (out.gift) kids.push(UI.key('Continue', () => UI.gift('item', out.item), 'go wide big'));
      else {
        const rec = gold(), bossNext = out.first && H.stage(nx).boss;
        if (out.shells) kids.push(UI.key('Open the shell', () => UI.go('shells', {}), 'gold wide big')); else if (evo) kids.push(evoKey());
        // a boss is never walked into by accident: the way there leads past the team screen
        const go = bossNext ? UI.key('To the boss', () => UI.go('adventure', { n: nx }), 'coral wide big') : UI.key(out.first ? 'Next floor' : 'Play again', () => UI.go('battle', { n: nx }), (out.shells ? '' : 'big ') + 'go wide');
        kids.push(go); if (!bossNext) kids.push(UI.key('Back', () => UI.go('adventure', { n: nx }), 'wide soft'));
        if (bossNext) kids.splice(kids.indexOf(go), 0, txt('small center', '<b>A boss is next.</b> Check your band first.'));
        // keep going: the next floor starts by itself, unless something here needs a look
        if (S.settings.keep && out.first && !bossNext && !out.shells && !out.echo && !rec) {
          let left = window.__hsSpeed ? 1 : 3; const label = () => { go.textContent = `Next floor in ${left}`; }; label();
          const stop = UI.key('Stop here', () => { clearInterval(UI.chainT); go.textContent = 'Next floor'; stop.remove(); }, 'wide soft sm'); kids.push(stop);
          clearInterval(UI.chainT); UI.chainT = setInterval(() => { if (--left <= 0) { clearInterval(UI.chainT); UI.go('battle', { n: nx }); } else label(); }, window.__hsSpeed ? 120 : 900);
        }
      }
    } else {
      kids.push(txt('disp big center', 'Not this time'), txt('center dim', 'Nothing is lost.'), loot());
      const spare = H.spareItems(S).length && S.pets.some((p) => p.gear.includes(null)), reh = H.rehearsals(S).some((n) => !S.reh[n]);
      kids.push(txt('small center', evo ? `Tip: <b>${H.FORMS[evo.form].n}</b> can grow.` : S.shells ? 'Tip: you have a shell to open.' : spare ? 'Tip: there is equipment in your bag that nobody is wearing.' : reh ? 'Tip: a rehearsal win pays an echo.' : !H.teamEnsemble(S) && H.possibleEnsembles(S).length ? 'Tip: your pets could form an ensemble.' : S.pets.length > 3 ? 'Tip: try a different band, or replay an earlier floor to level up.' : 'Tip: replay an earlier floor to level up, then come back.'));
      if (evo) kids.push(evoKey()); else if (S.shells) kids.push(UI.key('Open the shell', () => UI.go('shells', {}), 'gold wide'));
      kids.push(UI.key('Try again', () => UI.go('battle', { n: out.n }), 'go wide big'), UI.key('Change the band', () => UI.go('team', { n: out.n }), 'wide soft'));
    }
    UI.modal(...kids);
  };
  // The first shell and the first piece of equipment each get their own moment, then a pointer to where they are used.
  UI.gift = (kind, item) => {
    const S = UI.S; H.Audio.sfx('evolve');
    if (kind === 'shell') UI.modal(box('row center', UI.sp('shell', 2)), txt('disp big center', 'You found a shell!'), txt('center', 'A pet is waiting inside. Shells are opened in the <b>Shells</b> menu.'),
      UI.key('Show me', () => { S.flags.coach = 'shell'; UI.go('home'); }, 'go wide big'));
    else UI.modal(box('row center', UI.icon(A.itemIcon(item), 3.4)), txt('disp big center', 'You found equipment!'), UI.itemRow(item), txt('center', 'Every pet can wear two pieces. You put them on from the pet\'s own page.'),
      UI.key('Show me', () => { S.flags.coach = 'gear'; UI.go('team', {}); }, 'go wide big'));
  };
})(window.H);
