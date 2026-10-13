/* Hushsong — interface plumbing: sizing, saving, navigation, shared pieces. */
(function (H) {
  'use strict';
  const A = H.Art, Au = H.Audio;
  const UI = (H.UI = { screens: {}, cur: null, W: 180, Hh: 300, u: 2, frame: 0 });
  const SAVE_KEY = 'hushsong.save.v3';

  const el = (UI.el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; });
  UI.add = (parent, ...kids) => { for (const k of kids.flat()) if (k) parent.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); return parent; };
  UI.box = (cls, ...kids) => UI.add(el('div', cls), ...kids);
  UI.txt = (cls, html) => el('div', cls, html);
  UI.icon = (key, scale) => A.el(key, scale || 1);
  UI.sp = (key, scale, opts) => { const c = A.el(key, scale || 1, Object.assign({ anim: true }, opts || {})); c.classList.add('spr'); return c; };
  UI.key = (label, fn, cls, note) => { const b = el('button', 'key ' + (cls || ''), label); b.type = 'button'; b.addEventListener('click', (e) => { if (b.disabled) return; Au.sfx('tap', note); fn(e); }); return b; };
  UI.gearKey = (fn) => { const b = UI.key('', fn, 'soft sm'); b.appendChild(UI.icon('ic_gear')); b.setAttribute('aria-label', 'Menu'); return b; };
  UI.bgEl = (k, w, h) => { const src = A.bg(k, w, h), c = A.make(w, h); c.getContext('2d').drawImage(src, 0, 0); c.className = 'px bgc'; c.style.width = `calc(var(--u) * ${w})`; c.style.height = `calc(var(--u) * ${h})`; return c; };

  const stNames = Object.values(H.STATUS).map((s) => s.n).sort((a, b) => b.length - a.length);
  const stRe = new RegExp('\\b(' + stNames.join('|') + ')\\b', 'g');
  const stBad = new Set(Object.values(H.STATUS).filter((s) => !s.buff).map((s) => s.n));
  UI.rich = (s) => String(s).replace(stRe, (m) => `<b class="st ${stBad.has(m) ? 'bad' : ''}">${m}</b>`);
  UI.famChip = (fam) => UI.add(el('span', 'chip ' + fam), UI.icon('fam_' + fam), H.FAMILIES[fam].n);
  UI.roleChip = (role) => UI.add(el('span', 'chip'), UI.icon('role_' + role), H.ROLES[role].n);
  UI.notes = (n) => UI.add(el('span', 'purse'), UI.icon('ic_note'), String(n));
  UI.moveCard = (kind, ab, isNew) => {
    const names = { beat: 'Basic', phrase: 'Skill', finale: 'Special', passive: 'Always on' };
    const cd = kind === 'passive' ? '' : ab.cd ? ` · wait ${ab.cd}` : ' · any time';
    return el('div', 'move ' + kind + (isNew ? ' new' : ''), `<div class="hd"><b>${ab.n}</b><span class="label">${names[kind]}${cd}${isNew ? ' · new' : ''}</span></div><div class="dim small">${UI.rich(ab.fx ? H.describe(ab) : ab.d)}</div>`);
  };
  UI.formInfo = (formId, markNew) => {
    const f = H.FORMS[formId], kit = H.kitOf(formId), out = [], nw = (k) => markNew && !!f[k];
    out.push(UI.moveCard('beat', kit.beat, nw('beat')), UI.moveCard('phrase', kit.phrase, nw('phrase')));
    if (kit.finale) out.push(UI.moveCard('finale', kit.finale, nw('finale')));
    if (kit.passive) out.push(UI.moveCard('passive', kit.passive, nw('passive')));
    return out;
  };
  UI.meter = (frac) => { const m = el('div', 'meter'); const i = el('i'); i.style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + '%'; m.appendChild(i); return m; };
  UI.statSheet = (S, pet) => { const b = H.petStats(pet, S.level), kit = H.kitOf(pet.form); const tm = kit.passive && kit.passive.mod && kit.passive.mod.tempo ? kit.passive.mod.tempo : 0; return { hp: Math.round(b.hp), vol: Math.round(b.vol), poise: Math.round(b.poise), tempo: Math.round(b.tempo * (1 + tm)) }; };

  UI.resize = () => {
    const app = document.getElementById('app'), game = document.getElementById('game'), aw = app.clientWidth - 32, ah = app.clientHeight;
    let u = Math.floor(Math.min(aw / 164, ah / 286)); u = Math.max(2, Math.min(6, u));
    UI.u = u; UI.W = Math.max(164, Math.min(200, Math.floor(aw / u))); UI.Hh = Math.max(286, Math.min(360, Math.floor(ah / u)));
    game.style.setProperty('--u', u + 'px'); game.style.setProperty('--w', UI.W); game.style.setProperty('--h', UI.Hh);
    app.style.alignItems = UI.Hh * u > ah ? 'flex-start' : 'center';
  };

  UI.S = null;
  UI.load = () => {
    let S = null;
    try { const hot = window.claude && window.claude.hot && window.claude.hot.data; if (hot && hot.S) S = hot.S; } catch (e) { /* no hot data */ }
    if (!S) try { const raw = localStorage.getItem(SAVE_KEY); if (raw) S = JSON.parse(raw); } catch (e) { S = null; }
    if (!S || S.v !== 3 || !Array.isArray(S.pets)) S = H.newState();
    const d = H.newState(); for (const k in d) if (S[k] == null && d[k] != null) S[k] = d[k]; for (const k in d.settings) if (S.settings[k] == null) S.settings[k] = d.settings[k];
    S.pets = S.pets.filter((p) => H.FORMS[p.form]); S.team = S.team.map((id) => (S.pets.some((p) => p.id === id) ? id : null));
    UI.S = S; return S;
  };
  let saveT = null;
  UI.save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(UI.S)); } catch (e) { /* storage unavailable: play on without saving */ } }, 120); };
  UI.wipe = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } UI.S = H.newState(); };

  UI.go = (name, params) => {
    const scr = document.getElementById('screen'); if (UI.cur && UI.cur.leave) UI.cur.leave();
    scr.innerHTML = ''; UI.closeModal(); UI.cur = { name, params: params || {} };
    const out = UI.screens[name](scr, params || {}) || {}; UI.cur.leave = out.leave;
    A.tick(UI.frame); UI.save();
  };
  UI.redraw = () => UI.go(UI.cur.name, UI.cur.params);
  UI.modal = (...kids) => { const m = document.getElementById('modal'); m.innerHTML = ''; const s = UI.box('sheet', ...kids); m.appendChild(s); m.hidden = false; A.tick(UI.frame); return s; };
  UI.closeModal = () => { const m = document.getElementById('modal'); m.hidden = true; m.innerHTML = ''; };
  let toastT = null;
  UI.toast = (msg) => { const t = document.getElementById('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 1800); };
  UI.confirm = (title, body, yes, fn) => UI.modal(UI.txt('disp', title), UI.txt('dim', body), UI.key(yes, () => { UI.closeModal(); fn(); }, 'wide gold'), UI.key('Cancel', UI.closeModal, 'wide soft'));
  UI.topbar = (title, back, right) => { const bar = el('div', 'bar'); if (back) bar.appendChild(UI.key('‹ Back', () => { Au.sfx('back'); back(); }, 'soft sm')); bar.appendChild(el('div', 'disp', title)); UI.add(bar, right); return bar; };
  UI.music = (mode, prog) => Au.music.set(mode, mode === 'silent' ? [] : Au.layersFor(H.teamPets(UI.S)), prog);

  /* how to play, in one sheet */
  UI.help = () => {
    const loop = el('div', 'loop'); H.FAMILY_ORDER.forEach((f) => UI.add(loop, UI.famChip(f), UI.txt('dim', '›'))); loop.appendChild(UI.famChip('drum'));
    const kids = [UI.txt('disp', 'How to play'),
      UI.txt('', 'Beat a stage to unlock the next one. Every 10th stage is a <b>boss</b>, and every boss you beat leaves a new pet.'),
      UI.txt('', 'In battle, pets and enemies take turns. The yellow line over each one fills up until it is their turn. On your pet\'s turn, <b>tap an enemy</b> to hit it with the chosen move. Tap a round icon to pick a different move.'),
      UI.txt('label', 'Families'), UI.txt('dim', 'Each family is strong against the next one in this loop: it deals 30% more damage and takes 20% less.'), loop,
      UI.txt('label', 'Effects')];
    Object.keys(H.STATUS).forEach((s) => kids.push(UI.box('row', UI.icon('st_' + s), UI.txt('grow small', `<b>${H.STATUS[s].n}.</b> <span class="dim">${H.STATUS[s].d}</span>`))));
    kids.push(UI.txt('label', 'Growing'), UI.txt('dim', 'Winning earns notes and experience for the whole team. At level 4 a pet can evolve and pick a role. At level 10 it can evolve again and learn a Special move.'), UI.key('Got it', UI.closeModal, 'wide go'));
    UI.modal(...kids);
  };
  UI.settings = (extra) => {
    const S = UI.S, st = S.settings, apply = () => { Au.vol.music = st.music; Au.vol.sfx = st.sfx; Au.vol.sound = st.sound; Au.applyVol(); UI.save(); };
    const pct = (x) => Math.round(x * 100) + '%', vols = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
    const stepper = (label, key) => { const v = el('b', '', pct(st[key])); const mv = (d) => { st[key] = vols[Math.max(0, Math.min(10, vols.indexOf(st[key]) + d))]; v.textContent = pct(st[key]); apply(); }; return UI.box('row between', UI.txt('', label), UI.box('switch', UI.key('−', () => mv(-1), 'soft sm'), v, UI.key('+', () => mv(1), 'soft sm'))); };
    const snd = UI.key(st.sound ? 'Sound: on' : 'Sound: off', () => { st.sound = st.sound ? 0 : 1; snd.innerHTML = st.sound ? 'Sound: on' : 'Sound: off'; apply(); }, 'wide soft');
    UI.modal(UI.txt('disp', 'Menu'), extra || null, UI.key('How to play', () => UI.help(), 'wide soft'), snd, stepper('Music', 'music'), stepper('Effects', 'sfx'),
      extra ? null : UI.key('Start over', () => UI.confirm('Start over?', 'This erases your pets and all your progress.', 'Erase everything', () => { UI.wipe(); UI.go('title'); }), 'wide soft sm'),
      UI.key('Close', UI.closeModal, 'wide'));
  };

  UI.boot = () => {
    UI.load(); UI.resize();
    const st = UI.S.settings; Au.vol.music = st.music; Au.vol.sfx = st.sfx; Au.vol.sound = st.sound;
    let rsT = null; window.addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(() => { const was = [UI.u, UI.W, UI.Hh].join(); UI.resize(); if ([UI.u, UI.W, UI.Hh].join() === was) return; if (UI.cur && UI.cur.name !== 'battle' && document.getElementById('modal').hidden) UI.redraw(); }, 180); });
    const wake = () => { const fresh = !Au.ctx; if (Au.init()) { Au.applyVol(); if (fresh) Au.music.set(Au.music.mode, Au.music.layers, Au.music.prog); } };
    window.addEventListener('pointerdown', wake); window.addEventListener('keydown', wake);
    setInterval(() => { UI.frame ^= 1; A.tick(UI.frame); }, 520);
    document.addEventListener('visibilitychange', () => { if (Au.ctx) { if (document.hidden) Au.ctx.suspend(); else Au.ctx.resume(); } });
    try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ S: UI.S })); } catch (e) { /* not in a viewer */ }
    UI.go('title');
  };
})(window.H);
