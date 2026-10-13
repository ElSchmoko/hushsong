/* Hushsong — the battle screen. You pick a move on each of your pets' turns; auto is optional. */
(function (H) {
  'use strict';
  const A = H.Art, Au = H.Audio, UI = H.UI, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key;
  const FCOL = { drum: '#ff9a3c', string: '#5fd07e', breath: '#5ab8f0', brass: '#f2c744', voice: '#ff7aa8', none: '#b8b4d0' };
  const OH = 19;

  // A face for the turn-order strip: crop around wherever the sprite's eyes are.
  const pcache = new Map();
  A.portrait = (sprite, border) => {
    const k = sprite + border; if (pcache.has(k)) return pcache.get(k);
    const src = A.sprite(sprite, 0), w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data;
    let sx = 0, sy = 0, n = 0, top = h, minx = w, maxx = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (d[i + 3] < 200) continue; if (y < top) top = y; minx = Math.min(minx, x); maxx = Math.max(maxx, x); if (d[i] === 28 && d[i + 1] === 20 && d[i + 2] === 51 && y < h * 0.72) { sx += x; sy += y; n++; } }
    const cx = n ? sx / n : (minx + maxx) / 2, cy = n ? sy / n : top + (h - top) * 0.3, S2 = 11;
    const x0 = Math.max(0, Math.min(w - S2, Math.round(cx - S2 / 2))), y0 = Math.max(0, Math.min(h - S2, Math.round(cy - S2 / 2 - 0.5)));
    const c = A.make(S2 + 2, S2 + 2), ctx = c.getContext('2d'); ctx.fillStyle = border; ctx.fillRect(0, 0, S2 + 2, S2 + 2); ctx.fillStyle = '#fff9ea'; ctx.fillRect(1, 1, S2, S2); ctx.drawImage(src, x0, y0, S2, S2, 1, 1, S2, S2);
    pcache.set(k, c); return c;
  };

  UI.inspect = (b, u, after) => {
    const sp = u.spec, c = UI.sp(sp.sprite, 1, { flip: u.side === 1 }); c.style.margin = u.boss ? 'calc(var(--u) * -8)' : 'calc(var(--u) * -8) calc(var(--u) * -6) calc(var(--u) * -4)'; c.style.flex = 'none';
    const kids = [box('row', c, add(el('div', 'col grow'), txt('disp', u.name), box('row wrap', UI.famChip(u.family), txt('chip', 'Lv ' + sp.lvl))))];
    kids.push(el('div', 'stats', `<div><b>${Math.max(0, Math.round(u.hp))}</b><span class="label">of ${u.max}</span></div><div><b>${Math.round(b.vol(u))}</b><span class="label">Power</span></div><div><b>${Math.round(b.poise(u))}</b><span class="label">Guard</span></div><div><b>${Math.round(b.tempo(u))}</b><span class="label">Speed</span></div>`));
    if (u.shield > 0) kids.push(box('row', UI.icon('st_shield'), txt('grow small', `<b>Shield.</b> <span class="dim">Soaks the next ${u.shield} damage.</span>`)));
    for (const s in u.st) kids.push(box('row', UI.icon('st_' + s), txt('grow small', `<b>${H.STATUS[s].n}</b> <span class="dim">${u.st[s].dur > 50 ? '' : 'for ' + u.st[s].dur + (u.st[s].dur === 1 ? ' turn. ' : ' turns. ')}${H.STATUS[s].d}</span>`)));
    u.ab.forEach((a) => kids.push(UI.moveCard(a.kind, a.def)));
    u.perks.filter((p) => p && p.n && p.d).forEach((p) => kids.push(UI.moveCard('passive', p)));
    kids.push(key('Close', () => { UI.closeModal(); if (after) after(); }, 'wide')); UI.modal(...kids);
  };

  UI.screens.battle = (root, pr) => {
    const S = UI.S, W = UI.W, rnd = Math.random, n = pr.n || S.stage, st = H.stage(n), GMAX = H.GMAX;
    if (!H.teamPets(S).some(Boolean)) return UI.go('home');
    const battle = H.startStage(S, n, rnd);
    UI.music('battle', st.region); if (st.boss) Au.sfx('boss');

    /* ----- layout: your pets down the left, enemies down the right, each with its own bars ----- */
    const FH = Math.max(168, Math.min(280, UI.Hh - 106)), HB = 14;
    const isBig = (u) => A.defs[u.spec.sprite].w > 48;
    const allies = battle.units.filter((v) => v.side === 0), foes = battle.units.filter((v) => v.side === 1), boss = foes.find(isBig);
    // where the drawn creature really is inside its 48x48 (or 80x80) cell, so bars and markers can hug it
    const bbox = (u) => { const key = u.spec.sprite; if (bbox.c[key]) return bbox.c[key]; const src = A.sprite(key, 0), w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data; let t = h, b2 = 0, l = w, r = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { if (y < t) t = y; if (y + 1 > b2) b2 = y + 1; if (x < l) l = x; if (x + 1 > r) r = x + 1; } return (bbox.c[key] = u.side ? { t, b: b2, l: w - r, r: w - l } : { t, b: b2, l, r }); };
    bbox.c = {};
    const pitch = Math.floor((FH - 6) / 3);
    const place = (u) => {
      const list = u.side ? foes : allies, k = list.indexOf(u), cnt = list.length, bb = bbox(u);
      if (u.side === 1 && boss) {
        const miniTop = FH - 4 - 44 - HB;
        if (u === boss) { const x = W - 84, gh = HB + 1 + bb.b - bb.t, hy = Math.max(3, Math.round(3 + (miniTop - 3 - gh) / 2)); return { x, y: hy + HB + 1 - bb.t, hx: x + 8, hy, bw: 68, bb }; }
        const minis = foes.filter((v) => v !== boss), j = minis.indexOf(u), x = minis.length === 1 ? W - 60 : W - 100 + j * 50, y = FH - 4 - bb.b;
        return { x, y, hx: x + 2, hy: Math.max(miniTop, y + bb.t - HB - 1), bw: 44, bb };
      }
      const r = cnt === 1 ? 1 : cnt === 2 ? k + 0.5 : k, stag = cnt === 3 && k === 1 ? 8 : 0, x = u.side ? W - 53 - stag : 5 + stag;
      const foot = Math.round(3 + (r + 1) * pitch - Math.max(2, (pitch - 60) / 2)), y = foot - bb.b, hy = Math.max(Math.round(3 + r * pitch), y + bb.t - HB - 1);
      return { x, y, hx: x + 2, hy, bw: 44, bb };
    };
    const V = battle.units.map((u) => Object.assign(place(u), { u, sz: A.defs[u.spec.sprite].w, ox: 0, oy: 0, hp: u.hp, lag: u.hp, max: u.max, shield: u.shield, gx: u.gauge, st: {}, alive: true, flash: 0, shake: 0, alpha: 1, family: u.family }));
    const floats = [], parts = [], tweens = [], shots = [], hits = [];
    let active = -1, speed = window.__hsSpeed || (S.settings.speed > 2 ? 2 : S.settings.speed || 1), auto = !!S.settings.auto, dead = false, paused = false, frame = 0, lastT = performance.now(), target = -1, waiting = null, sel = 0, shown = null, mine = false, note = '';
    const tween = (o, p, to, dur) => { for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].o === o && tweens[i].p === p) tweens.splice(i, 1); tweens.push({ o, p, from: o[p], to, t: 0, dur: Math.max(1, dur / speed) }); };
    const wait = (ms) => new Promise((res) => { const t0 = performance.now(); const tick = () => { if (dead) return; if (paused) { setTimeout(tick, 60); return; } if (performance.now() - t0 >= ms / speed) res(); else setTimeout(tick, 16); }; tick(); });
    const float = (v, text, col, big) => { const now = performance.now(), k = v.u.uid, s0 = float.last[k]; let dy = 0; if (s0 && now - s0.t < 520 / speed) dy = s0.dy + (big ? 9 : 7); float.last[k] = { t: now, dy: dy > 22 ? 0 : dy }; floats.push({ x: v.x + v.sz / 2, y: v.y + v.bb.t + 8 - float.last[k].dy, text, col, big, t: 0 }); };
    float.last = {};
    const burst = (v, col, cnt) => { for (let i = 0; i < cnt; i++) parts.push({ x: v.x + v.sz / 2, y: v.y + v.sz * 0.55, vx: (Math.random() - 0.5) * 70, vy: -Math.random() * 60 - 10, t: 0, col }); };

    /* ----- DOM ----- */
    const wrap = el('div', 'battle');
    const leave = () => UI.confirm('Leave this battle?', 'You go back to your team. Nothing is lost.', 'Leave', () => UI.go('home', { n }));
    const menu = () => { paused = true; UI.settings(key('Leave battle', leave, 'wide soft')); const m = document.getElementById('modal'); const obs = new MutationObserver(() => { if (m.hidden) { obs.disconnect(); paused = false; } }); obs.observe(m, { attributes: true }); };
    const field = A.make(W, FH); field.className = 'px full'; const fctx = field.getContext('2d');
    const fwrap = el('div', 'field'), callout = el('div', 'callout');
    const pill = el('button', 'stagepill'); pill.type = 'button'; pill.setAttribute('aria-label', 'Menu'); add(pill, el('span', '', st.boss ? 'Boss' : 'Stage ' + n), UI.icon('ic_gear')); pill.addEventListener('click', () => { Au.sfx('tap'); menu(); });
    add(fwrap, field, callout, pill);
    const panel = el('div', 'bpanel'), title = el('div', 'ptitle'), meta = el('div', 'pmeta'), desc = el('div', 'pdesc'), icons = el('div', 'picons'), hint = el('div', 'phint');
    const autoB = key('Auto', () => { auto = !auto; S.settings.auto = auto ? 1 : 0; autoB.classList.toggle('gold', auto); autoB.classList.toggle('soft', !auto); UI.save(); if (auto && waiting != null) { const w2 = waiting; waiting = null; w2(null); } }, (auto ? 'gold' : 'soft') + ' sm');
    const spd = key(speed + 'x', () => { speed = speed >= 2 ? 1 : 2; S.settings.speed = speed; spd.textContent = speed + 'x'; UI.save(); }, 'soft sm');
    const useB = key('Use', () => fire(), 'go big');
    add(panel, box('phead', title, autoB, spd), meta, desc, box('prow', icons, useB), hint);
    add(wrap, fwrap, panel); root.appendChild(wrap);
    const say = (text, cls) => { callout.textContent = text; callout.className = 'callout on ' + (cls || ''); clearTimeout(say.t); say.t = setTimeout(() => callout.classList.remove('on'), 1000 / speed); };

    /* ----- the panel: one move at a time, with the pet's moves as round icons ----- */
    const KN = { beat: 'Basic move', phrase: 'Skill', finale: 'Special' }, turns = (k) => k + (k === 1 ? ' turn' : ' turns');
    const render = () => {
      if (!shown) { title.textContent = note || 'Get ready'; meta.textContent = ''; desc.textContent = ''; icons.innerHTML = ''; useB.disabled = true; hint.textContent = ''; hint.className = 'phint'; return; }
      const u = shown.u, a = u.ab[shown.idx], fam = V[u.uid].family;
      title.innerHTML = ''; add(title, UI.icon('fam_' + (fam || 'none')), el('span', '', a ? `${u.name}'s ${a.def.n}` : `${u.name}: ${shown.name}`));
      if (a) {
        const ready = a.cd === 0;
        meta.className = 'pmeta k-' + a.kind; meta.innerHTML = `<b>${KN[a.kind]}</b>` + (mine && !ready ? ` <span class="bad">ready in ${turns(a.cd)}</span>` : a.def.cd ? ` <span>rests ${turns(a.def.cd)} after use</span>` : ' <span>always ready</span>');
        desc.innerHTML = UI.rich(H.describe(a.def));
      } else { meta.className = 'pmeta'; meta.textContent = 'Extra move'; desc.textContent = ''; }
      icons.innerHTML = '';
      u.ab.forEach((m, i) => {
        const b = el('button', 'mvi' + (i === shown.idx ? ' sel' : '') + (m.cd > 0 ? ' cool' : '') + (mine ? '' : ' off')); b.type = 'button'; b.setAttribute('aria-label', m.def.n);
        b.appendChild(UI.icon(A.moveIcon(m.def, m.kind, u.side === 0 ? fam : 'none'))); if (m.cd > 0) b.appendChild(el('span', 'cdn', String(m.cd)));
        b.addEventListener('click', () => { if (!mine || waiting == null) return; if (i === sel && m.cd === 0) return fire(); sel = i; shown = { u, idx: i }; Au.sfx('tap', i * 2); render(); });
        icons.appendChild(b);
      });
      useB.disabled = !(mine && a && a.cd === 0); useB.textContent = mine ? 'Use' : '· · ·';
      hint.className = 'phint' + (mine && tipText ? ' tipc' : '');
      hint.textContent = !mine ? (u.side === 1 ? 'Enemy turn' : auto ? 'Auto battle is on' : '') : tipText || (a && a.cd > 0 ? 'Not ready yet. Pick another move.' : a && H.needsTarget(a.def) ? 'Tap an enemy to use it, or press Use.' : 'Press Use.');
    };
    let tipText = '';
    const fire = () => { if (waiting == null || !mine) return; const u = battle.units[battle.waiting], a = u.ab[sel]; if (a.cd > 0) { UI.toast('That move is not ready yet.'); return; } Au.sfx('tap', sel * 2); mine = false; const w2 = waiting; waiting = null; w2({ ab: sel }); };

    const unitAt = (px, py) => { let best = null; for (const v of V) { if (!v.alive) continue; if (px >= v.x + 1 && px <= v.x + v.sz - 1 && py >= v.hy && py <= v.y + v.bb.b + 3) if (!best || v.y + v.sz > best.y + best.sz) best = v; } return best; };
    const look = (v) => { paused = true; UI.inspect(battle, v.u, () => { paused = false; }); };
    field.addEventListener('click', (e) => {
      const r = field.getBoundingClientRect(), v = unitAt(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * FH); if (!v || dead) return;
      if (v.u.side === 1 && waiting != null && mine) {
        const u = battle.units[battle.waiting], a = u.ab[sel];
        if (!H.needsTarget(a.def)) return look(v);
        if (!battle.validTargets(u).includes(v.u)) { UI.toast('It has to hit the one with Taunt.'); return; }
        target = v.u.uid; if (a.cd > 0) { UI.toast('That move is not ready yet.'); return; } fire(); return;
      }
      look(v);
    });

    /* ----- drawing ----- */
    const bg = A.bg(st.region, W, FH, 0.2);
    const tl = (s, x, y, col) => A.text(fctx, s, x + (String(s).length * 4 - 1) / 2, y, col);
    const tr = (s, x, y, col) => A.text(fctx, s, x - (String(s).length * 4 - 1) / 2, y, col);
    const drawUnit = (v) => {
      if (v.alpha <= 0.02) return;
      const f = v.flash > 0 ? A.sprite(v.u.spec.sprite, frame, 'flash') : A.sprite(v.u.spec.sprite, frame);
      const sx = Math.round(v.x + v.ox + (v.shake > 0 ? (Math.random() < 0.5 ? -1 : 1) : 0)), sy = Math.round(v.y + v.oy), bigS = v.sz > 48;
      const cx = Math.round(sx + (v.bb.l + v.bb.r) / 2), fy = sy + v.bb.b - 2, sw = Math.min(bigS ? 56 : 30, v.bb.r - v.bb.l - 2) & ~1;
      fctx.globalAlpha = v.alpha * 0.25; fctx.fillStyle = '#3b2d4f'; fctx.fillRect(cx - sw / 2, fy, sw, 2); fctx.fillRect(cx - sw / 2 + 3, fy + 2, sw - 6, 1);
      fctx.globalAlpha = v.alpha;
      if (active === v.u.uid && v.alive) { const rx = sw / 2 + 4; for (let i = 0; i < 28; i++) { if ((i + frame) % 2) continue; const an = (i / 28) * Math.PI * 2, x = Math.round(cx + Math.cos(an) * rx), y = Math.round(fy + 1 + Math.sin(an) * 4); fctx.fillStyle = '#3b2d4f'; fctx.fillRect(x - 1, y, 3, 2); fctx.fillStyle = '#ffc94a'; fctx.fillRect(x - 1, y - 1, 3, 2); } }
      if (v.u.side === 1) { fctx.save(); fctx.translate(sx + v.sz, sy); fctx.scale(-1, 1); fctx.drawImage(f, 0, 0); fctx.restore(); } else fctx.drawImage(f, sx, sy);
      fctx.globalAlpha = 1;
    };
    const drawBars = (v) => {
      if (!v.alive) return;
      const hx = v.hx, hy = v.hy, bx = hx + 11, bw = v.bw - 11, by = hy + 8;
      fctx.drawImage(A.sprite('fam_' + (v.family || 'none'), 0), hx, hy + 3);
      tl('LV' + v.u.spec.lvl, bx, hy + 1, '#fff9ea');
      const fr = Math.max(0, v.hp / v.max), low = fr < 0.3; tr(String(Math.max(0, Math.round(v.hp))), hx + v.bw, hy + 1, low ? '#ffb0a0' : '#c8f7b8');
      fctx.fillStyle = '#3b2d4f'; fctx.fillRect(bx - 1, by - 1, bw + 2, 7); fctx.fillStyle = '#6a5a7e'; fctx.fillRect(bx, by, bw, 3);
      if (v.lag > v.hp) { fctx.fillStyle = '#fff9ea'; fctx.fillRect(bx, by, Math.ceil(bw * Math.min(1, v.lag / v.max)), 3); }
      fctx.fillStyle = low ? '#e8503a' : '#58c868'; fctx.fillRect(bx, by, Math.ceil(bw * fr), 3); if (fr > 0) { fctx.fillStyle = low ? '#ff8a70' : '#a4eea0'; fctx.fillRect(bx, by, Math.ceil(bw * fr), 1); }
      if (v.shield > 0) { fctx.fillStyle = '#6ab0ff'; fctx.fillRect(bx, by + 2, Math.min(bw, Math.ceil((bw * v.shield) / v.max * 2)), 1); }
      fctx.fillStyle = '#5a4a6e'; fctx.fillRect(bx, by + 4, bw, 1); fctx.fillStyle = '#ffc94a'; fctx.fillRect(bx, by + 4, Math.round(bw * Math.max(0, Math.min(1, v.gx / GMAX))), 1);
      // status icons stack on the inner side of the fighter
      const sts = Object.keys(v.st); if (v.shield > 0) sts.unshift('shield');
      const ix = v.u.side === 0 ? Math.min(v.x + v.bb.r + 1, v.x + v.sz - 4) : Math.max(v.x + v.bb.l - 8, v.x - 4); sts.slice(0, 4).forEach((s, i) => fctx.drawImage(A.sprite('st_' + s, 0), ix, v.y + v.bb.t + 2 + i * 8));
      // while you choose: who is targeted, and which enemies your pet is strong or weak against
      if (waiting != null && mine && v.u.side === 1) {
        const me = battle.units[battle.waiting], adv = H.advantage(me.family, v.family);
        if (adv) fctx.drawImage(A.sprite(adv > 0 ? 'ic_up' : 'ic_down', 0), hx - 9, hy + 6);
        if (target === v.u.uid && H.needsTarget(me.ab[sel].def)) { const x0 = v.x + v.bb.l - 3, y0 = v.y + v.bb.t - 1 - (frame ? 1 : 0), x1 = v.x + v.bb.r + 2, y1 = v.y + v.bb.b + (frame ? 1 : 0), L = 6; for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { fctx.fillStyle = '#3b2d4f'; fctx.fillRect(Math.min(x, x + dx * L) - 1, y - 1, L + 2, 3); fctx.fillRect(x - 1, Math.min(y, y + dy * L) - 1, 3, L + 2); fctx.fillStyle = '#ffc94a'; fctx.fillRect(Math.min(x, x + dx * (L - 1)), y, L, 1); fctx.fillRect(x, Math.min(y, y + dy * (L - 1)), 1, L); } }
      }
    };
    // each family lands its hits in its own way: drum rings, string slashes, breath gusts, brass blasts, voice notes
    const dot = (x, y, col, s2) => { fctx.fillStyle = '#3b2d4f'; fctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, (s2 || 1) + 2, (s2 || 1) + 2); fctx.fillStyle = col; fctx.fillRect(Math.round(x), Math.round(y), s2 || 1, s2 || 1); };
    const drawHit = (q, k) => {
      const col = q.col, x = q.x, y = q.y, d = q.dir;
      if (q.fam === 'drum') { for (const [r0, lag] of [[16, 0], [10, 0.25]]) { const kk = (k - lag) / (1 - lag); if (kk <= 0) continue; const r = 3 + r0 * kk; for (let i = 0; i < 20; i++) { const an = (i / 20) * Math.PI * 2; dot(x + Math.cos(an) * r, y + Math.sin(an) * r * 0.55, i % 2 ? '#fff9ea' : col); } } }
      else if (q.fam === 'string') { for (let j = 0; j < 3; j++) { const o = (j - 1) * 6, a0 = Math.max(0, k * 1.6 - 0.3 - j * 0.12), a1 = Math.min(1, k * 1.6 - j * 0.12); for (let t = a0; t < a1; t += 0.06) dot(x - d * 12 + d * 24 * t + o, y - 12 + 24 * t - o * 0.4, t > a1 - 0.2 ? '#fff9ea' : col); } }
      else if (q.fam === 'breath') { for (let j = 0; j < 4; j++) { const yy = y - 10 + j * 7, len = 10 - (j % 2) * 4, x0 = x - d * 18 + d * 30 * k + (j % 2) * 4 * d; for (let t = 0; t < len; t += 2) dot(x0 - d * t, yy + Math.round(Math.sin((t + k * 20) / 3)), t < 3 ? '#fff9ea' : col); } }
      else if (q.fam === 'brass') { for (let j = 0; j < 3; j++) { const r = 5 + j * 5 + k * 8; if (k * 3 < j * 0.6) continue; for (let i = -4; i <= 4; i++) { const an = (i / 4) * 0.9; dot(x - d * 10 + d * Math.cos(an) * r, y + Math.sin(an) * r, j === 0 ? '#fff9ea' : col); } } }
      else if (q.fam === 'voice') { for (let j = 0; j < 3; j++) { const an = -Math.PI / 2 + (j - 1) * 0.9, r = 4 + 16 * k, nx = Math.round(x + Math.cos(an) * r), ny = Math.round(y + Math.sin(an) * r * 0.8); dot(nx, ny, col, 2); fctx.fillStyle = '#3b2d4f'; fctx.fillRect(nx + 1, ny - 6, 3, 6); fctx.fillStyle = '#fff9ea'; fctx.fillRect(nx + 2, ny - 5, 1, 5); } }
      else { const r = 4 + 10 * k; for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1], [1.3, 0], [-1.3, 0]]) { dot(x + dx * r, y + dy * r * 0.8, '#d8d4e8', 2); dot(x + dx * r * 0.55, y + dy * r * 0.45, '#8a84a6'); } }
    };
    const loop = (now) => {
      if (dead) return; const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now; frame = UI.frame;
      for (let i = tweens.length - 1; i >= 0; i--) { const t = tweens[i]; t.t += dt * 1000; const k = Math.min(1, t.t / t.dur); t.o[t.p] = t.from + (t.to - t.from) * k; if (k >= 1) tweens.splice(i, 1); }
      fctx.drawImage(bg, 0, 0);
      const ord = V.slice().sort((a, b) => a.y + a.sz - (b.y + b.sz));
      for (const v of ord) { if (v.flash > 0) v.flash -= dt * speed; if (v.shake > 0) v.shake -= dt * speed; if (v.lag > v.hp) v.lag = Math.max(v.hp, v.lag - v.max * dt * speed * 0.7); else v.lag = v.hp; drawUnit(v); }
      for (const v of ord) drawBars(v);
      for (let i = shots.length - 1; i >= 0; i--) { const q = shots[i]; q.t += dt * speed; const k = Math.min(1, q.t / q.dur); if (k >= 1) { shots.splice(i, 1); continue; } const x = Math.round(q.x0 + (q.x1 - q.x0) * k), y = Math.round(q.y0 + (q.y1 - q.y0) * k - Math.sin(k * Math.PI) * 8); fctx.fillStyle = '#3b2d4f'; fctx.fillRect(x - 2, y - 1, 5, 4); fctx.fillStyle = q.col; if (q.ally) { fctx.fillRect(x - 1, y, 3, 2); fctx.fillRect(x + 1, y - 4, 1, 4); fctx.fillRect(x + 2, y - 4, 2, 1); } else { fctx.fillRect(x - 1, y, 3, 2); } }
      for (let i = hits.length - 1; i >= 0; i--) { const q = hits[i]; q.t += dt * speed; const k = q.t / 0.26; if (k >= 1) { hits.splice(i, 1); continue; } drawHit(q, k); }
      for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.t += dt * speed; p.x += p.vx * dt * speed; p.y += p.vy * dt * speed; p.vy += 220 * dt * speed; if (p.t > 0.45) { parts.splice(i, 1); continue; } fctx.fillStyle = p.col; fctx.fillRect(Math.round(p.x), Math.round(p.y), p.t < 0.25 ? 2 : 1, p.t < 0.25 ? 2 : 1); }
      for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.t += dt; if (f.t > 1.0) { floats.splice(i, 1); continue; } const y = f.y - Math.min(1, f.t * 2.4) * 12; A.text(fctx, f.text, Math.max(16, Math.min(W - 16, f.x)), Math.max(2, y), f.col, f.big); }
      requestAnimationFrame(loop);
    };

    /* ----- your turn ----- */
    const askPlayer = (u) => new Promise((res) => {
      const vt = battle.validTargets(u); if (!vt.some((x) => x.uid === target)) { const best = vt.reduce((b, x) => { const sc = (y) => H.advantage(u.family, y.family) * 0.35 - y.hp / y.max; return sc(x) > sc(b) ? x : b; }, vt[0]); target = best ? best.uid : -1; }
      tipText = u.turns !== 1 ? '' : n === 1 ? 'Your turn! Tap the enemy to attack it.' : n === 2 ? 'Tap a round icon to read about another move.' : n === 3 ? 'Green arrow: your pet is strong against that enemy.' : n === 4 ? 'Skills need a rest after you use them.' : '';
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
            if (e.src >= 0 && e.kind === 'hit' && V[e.src].alpha > 0.5) { const a = V[e.src]; shots.push({ x0: a.x + a.sz / 2 + (a.u.side ? -8 : 8), y0: a.y + a.sz * 0.45, x1: v.x + v.sz / 2, y1: v.y + v.sz * 0.5, t: 0, dur: 0.14, col: a.u.side === 0 ? FCOL[a.family] : '#8a84a6', ally: a.u.side === 0 }); await wait(140); }
            v.hp = e.hp; v.shield = e.shield; v.flash = 0.12; v.shake = 0.18; const pz = e.kind === 'poison';
            if (e.src >= 0 && e.kind === 'hit') { const a = V[e.src]; hits.push({ x: v.x + v.sz / 2, y: v.y + v.sz * 0.55, t: 0, fam: a.u.side === 0 ? a.family : 'none', col: FCOL[a.family] || '#b8b4d0', dir: a.u.side === 0 ? 1 : -1 }); }
            float(v, e.amt === 0 && e.abs ? 'BLOCK' : String(e.amt), e.crit ? '#ffc94a' : pz ? '#d8a0ff' : e.adv > 0 ? '#a8f0a0' : e.adv < 0 ? '#c8c4d8' : '#ffffff', !(e.amt === 0 && e.abs));
            if (e.crit) float(v, 'CRITICAL', '#ffc94a'); else if (e.adv > 0 && e.kind === 'hit') float(v, 'STRONG', '#a8f0a0'); else if (e.adv < 0 && e.kind === 'hit') float(v, 'WEAK', '#c8c4d8');
            burst(v, pz ? '#b060e0' : FCOL[fam(e.src)] || '#fff', e.crit ? 9 : 5); Au.sfx(pz ? 'bad' : 'hit', { family: e.src >= 0 && V[e.src].u.side === 0 ? fam(e.src) : null, crit: e.crit, heavy: e.amt > v.max * 0.25 });
            await wait(nx && nx.t === 'dmg' ? 170 : 300); break; }
          case 'heal': { const v = V[e.tgt]; v.hp = e.hp; float(v, '+' + e.amt, '#7fe89a', true); Au.sfx('heal'); await wait(nx && nx.t === 'heal' ? 80 : 240); break; }
          case 'shield': { const v = V[e.u]; v.shield = e.shield; if (e.amt) { float(v, 'SHIELD', '#8ac0ff'); Au.sfx('shield'); await wait(nx && nx.t === 'shield' ? 60 : 200); } break; }
          case 'st': { const v = V[e.u]; v.st[e.s] = 1; const d = H.STATUS[e.s]; float(v, d.s, d.buff ? '#ffe58a' : '#ff9a9a'); Au.sfx(d.buff ? 'good' : 'bad'); await wait(nx && nx.t === 'st' ? 70 : 220); break; }
          case 'stoff': delete V[e.u].st[e.s]; break;
          case 'miss': float(V[e.tgt], 'DODGED', '#a8e6ff'); Au.sfx('miss'); await wait(260); break;
          case 'skip': { const v = V[e.u]; float(v, 'STUNNED', '#ffe58a'); idle(`${v.u.name} is stunned and misses a turn`); Au.sfx('skip'); await wait(520); break; }
          case 'fall': { const v = V[e.u]; v.alive = false; v.st = {}; tween(v, 'alpha', 0, 420); tween(v, 'oy', 6, 420); Au.sfx('fall'); if (active === e.u) active = -1; if (target === e.u) target = -1; Au.music.din(battle.alive(1).length / 3); await wait(420); break; }
          case 'revive': { const v = V[e.u]; v.alive = true; v.hp = e.hp; v.alpha = 0; v.oy = 0; tween(v, 'alpha', 1, 250); float(v, 'BACK UP', '#ffe58a'); Au.sfx('evolve'); await wait(420); break; }
          case 'note': float(V[e.u], e.txt.toUpperCase(), '#ffe58a'); await wait(220); break;
          case 'gauge': { const v = V[e.u]; if (Math.abs(e.d) >= 0.1) float(v, e.d > 0 ? 'SOONER' : 'LATER', e.d > 0 ? '#ffe58a' : '#ff9a9a'); break; }
          case 'shift': { const v = V[e.u]; v.family = e.family; float(v, 'CHANGES', FCOL[e.family]); burst(v, FCOL[e.family], 12); Au.sfx('bad'); await wait(420); break; }
          case 'sync': e.units.forEach((s, k) => { const v = V[k]; v.hp = s.hp; v.shield = s.shield; v.st = Object.fromEntries(Object.keys(s.st).map((x) => [x, 1])); v.family = s.family; tween(v, 'gx', s.gauge, 240); if (s.alive && !v.alive) { v.alive = true; v.alpha = 1; v.oy = 0; } }); break;
          case 'end': active = -1; await wait(500); break;
        }
      }
    }
    async function run() {
      idle('Get ready'); await wait(450);
      if (st.boss) { say(H.DIN[H.REGIONS[st.region].boss].n, 'foe'); await wait(900); }
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
      if (dead) return; idle(battle.over === 'win' ? 'You win!' : 'Your team is out'); await wait(200); finish();
    }
    function finish() {
      const win = battle.over === 'win'; Au.music.din(0); Au.sfx(win ? 'win' : 'lose');
      const out = H.finishStage(S, n, win, rnd); UI.save(); UI.result(out);
    }
    Au.music.din(1); requestAnimationFrame(loop); run();
    return { leave: () => { dead = true; Au.music.din(0); } };
  };

  UI.result = (out) => {
    const S = UI.S, kids = [];
    const loot = () => { const r = box('row center'); if (out.notes) r.appendChild(UI.notes('+' + out.notes)); if (out.xp) { const x = add(el('span', 'purse'), UI.icon('ic_xp'), el('span', '', '+' + out.xp)); x.style.color = 'var(--blue)'; r.appendChild(x); } return r; };
    if (out.win) {
      kids.push(txt('disp big center', out.boss ? 'Boss beaten!' : 'Stage cleared!'), loot());
      if (out.ups) kids.push(txt('center good', `<b>Level ${S.level}!</b> Your pets got stronger.`));
      kids.push(box('row', txt('small dim', 'Next level'), add(el('div', 'grow'), UI.meter(S.xp / H.xpNeed(S.level)))));
      if (out.bonus) kids.push(txt('center', `You already have every pet, so the boss dropped <b>${out.bonus} notes</b> instead.`));
      if (out.first && out.n === H.STORY_STAGES) kids.push(txt('center', 'That was the last boss. <b>The music is back.</b> The stages go on for as long as you want to keep playing.'));
      if (out.hatch) { kids.push(box('row center', UI.sp('shell', 1)), txt('center', '<b>You found a shell.</b> A new pet is inside.'), UI.key('Meet your new pet', () => UI.go('pick', {}), 'go wide big')); return UI.modal(...kids); }
      const evo = H.canEvolveAny(S);
      if (evo) kids.push(txt('center good', `<b>${H.FORMS[evo.form].n}</b> can evolve now.`), UI.key('Evolve ' + H.FORMS[evo.form].n, () => UI.go('pet', { id: evo.id, n: out.first ? S.stage : out.n }), 'gold wide'));
      kids.push(UI.key(out.first ? 'Next stage' : 'Play again', () => UI.go('battle', { n: out.first ? S.stage : out.n }), 'go wide big'), UI.key('Team', () => UI.go('home', { n: out.first ? S.stage : out.n }), 'wide soft'));
    } else {
      kids.push(txt('disp big center', 'Not this time'), txt('center dim', 'Nothing is lost. Your pets still learned a little.'), loot());
      const evo = H.canEvolveAny(S);
      kids.push(txt('small center', evo ? `Tip: <b>${H.FORMS[evo.form].n}</b> can evolve. That makes a big difference.` : S.pets.length > 3 ? 'Tip: try a different team, or replay an earlier stage to level up.' : 'Tip: replay an earlier stage to level up, then come back.'));
      if (evo) kids.push(UI.key('Evolve ' + H.FORMS[evo.form].n, () => UI.go('pet', { id: evo.id, n: out.n }), 'gold wide'));
      kids.push(UI.key('Try again', () => UI.go('battle', { n: out.n }), 'go wide big'), UI.key('Team', () => UI.go('home', { n: out.n }), 'wide soft'));
    }
    UI.modal(...kids);
  };
})(window.H);
