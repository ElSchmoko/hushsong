/* Hushsong — interface plumbing: sizing, saving, navigation, shared components. */
(function (H) {
  'use strict';
  const A = H.Art, Au = H.Audio;
  const UI = (H.UI = { screens: {}, cur: null, W: 180, Hh: 300, u: 2, frame: 0 });
  const SAVE_KEY = 'hushsong.save.v2';

  /* ----- tiny DOM helpers ----- */
  const el = (UI.el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; });
  UI.add = (parent, ...kids) => { for (const k of kids.flat()) if (k) parent.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); return parent; };
  UI.box = (cls, ...kids) => UI.add(el('div', cls), ...kids);
  UI.txt = (cls, html) => el('div', cls, html);
  UI.icon = (key, scale) => A.el(key, scale || 1);
  UI.sp = (key, scale, opts) => { const c = A.el(key, scale || 1, Object.assign({ anim: true }, opts || {})); c.classList.add('spr'); return c; };
  UI.petRow = (keys, seenFn) => { const r = el('div', 'petrow'); keys.forEach((k) => { const cell = el('div'); cell.appendChild(UI.sp(k, 1, { variant: !seenFn || seenFn(k) ? '' : 'sil', anim: false })); r.appendChild(cell); }); return r; };
  // a piano key button
  UI.key = (label, fn, cls, note) => { const b = el('button', 'key ' + (cls || ''), label); b.type = 'button'; b.addEventListener('click', (e) => { if (b.disabled) return; Au.sfx('tap', note); fn(e); }); return b; };
  UI.gearKey = (fn) => { const b = UI.key('', fn, 'black sm'); b.appendChild(UI.icon('ic_gear')); b.setAttribute('aria-label', 'Settings'); return b; };
  UI.btn = (cls, fn, ...kids) => { const b = UI.add(el('button', cls), ...kids); b.type = 'button'; b.addEventListener('click', (e) => fn(e)); return b; };

  /* ----- text ----- */
  const ST_CLS = { sharp: '', rush: '', spot: '', refrain: 'good', hearty: 'good', offbeat: 'good', damper: 'good', flat: 'bad', drag: 'bad', dis: 'bad', marked: 'bad', rest: 'cc', lull: 'cc' };
  const stRe = new RegExp('\\b(' + Object.values(H.STATUS).map((s) => s.n).join('|') + ')\\b', 'g');
  const stByName = Object.fromEntries(Object.entries(H.STATUS).map(([k, v]) => [v.n, k]));
  UI.rich = (s) => String(s).replace(stRe, (m) => `<b class="st ${ST_CLS[stByName[m]] || ''}">${m}</b>`);
  UI.famChip = (fam) => UI.add(el('span', 'chip ' + fam), UI.icon('fam_' + fam), H.FAMILIES[fam].n);
  UI.roleChip = (role) => UI.add(el('span', 'chip'), UI.icon('role_' + role), H.ROLES[role].n);
  UI.notes = (n) => UI.add(el('span', 'purse'), UI.icon('ic_note'), String(n));
  UI.abilityCard = (kind, ab, extra) => {
    const names = { beat: 'Beat', phrase: 'Phrase', finale: 'Finale', passive: 'Always on', trait: 'Trait', gear: 'Gear' };
    const cd = ab.cd ? `every ${ab.cd + 1} turns` : kind === 'beat' ? 'every turn' : '';
    return el('div', 'ability ' + kind + (extra && extra.isNew ? ' new' : ''), `<div class="hd"><b>${ab.n}</b><span class="label">${names[kind]}${cd ? ' · ' + cd : ''}${extra && extra.isNew ? ' · new' : ''}</span></div><div class="dim">${UI.rich(ab.fx ? H.describe(ab) : ab.d)}</div>`);
  };
  UI.meter = (cls, frac) => { const m = el('div', 'meter ' + cls); const i = el('i'); i.style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + '%'; m.appendChild(i); return m; };

  // effective stats as the pet sheet shows them
  UI.statSheet = (S, pet) => {
    const b = H.petStats(pet, S.level), kit = H.kitOf(pet.form); const perks = [kit.passive, H.TRAITS[pet.trait]].concat((pet.gear || []).map((g) => H.GEAR[g])).filter(Boolean);
    const m = (k) => perks.reduce((s, p) => s + ((p.mod && p.mod[k]) || 0), 0);
    return { hp: Math.round(b.hp * (1 + m('hp'))), vol: Math.round(b.vol * (1 + m('vol'))), poise: Math.round(b.poise + m('poise')), tempo: Math.round(b.tempo * (1 + m('tempo'))) };
  };

  /* ----- sizing: pick the largest whole-number pixel scale that fits ----- */
  UI.resize = () => {
    const app = document.getElementById('app'), game = document.getElementById('game');
    const aw = app.clientWidth - 32, ah = app.clientHeight;
    let u = Math.floor(Math.min(aw / 164, ah / 264)); u = Math.max(2, Math.min(6, u));
    UI.u = u; UI.W = Math.max(164, Math.min(200, Math.floor(aw / u))); UI.Hh = Math.max(264, Math.min(356, Math.floor(ah / u)));
    game.style.setProperty('--u', u + 'px'); game.style.setProperty('--w', UI.W); game.style.setProperty('--h', UI.Hh);
    document.getElementById('app').style.alignItems = UI.Hh * u > ah ? 'flex-start' : 'center';
  };

  /* ----- save ----- */
  UI.S = null;
  UI.load = () => {
    let S = null;
    try { const hot = window.claude && window.claude.hot && window.claude.hot.data; if (hot && hot.S) S = hot.S; } catch (e) { /* no hot data */ }
    if (!S) try { const raw = localStorage.getItem(SAVE_KEY); if (raw) S = JSON.parse(raw); } catch (e) { S = null; }
    if (!S || S.v !== 2 || !Array.isArray(S.pets)) S = H.newState();
    const d = H.newState(); for (const k in d) if (S[k] == null) S[k] = d[k]; for (const k in d.settings) if (S.settings[k] == null) S.settings[k] = d.settings[k];
    // drop anything a newer build no longer knows about
    S.pets = S.pets.filter((p) => H.FORMS[p.form]); S.band = S.band.map((id) => (S.pets.some((p) => p.id === id) ? id : null));
    UI.S = S; return S;
  };
  let saveT = null;
  UI.save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(UI.S)); } catch (e) { /* storage unavailable: play on without saving */ } }, 150); };
  UI.wipe = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } UI.S = H.newState(); };
  UI.hasSave = () => UI.S && (UI.S.pets.length > 0 || UI.S.flags.intro);

  /* ----- navigation ----- */
  UI.go = (name, params) => {
    const scr = document.getElementById('screen');
    if (UI.cur && UI.cur.leave) UI.cur.leave();
    scr.innerHTML = ''; UI.closeModal();
    UI.cur = { name, params: params || {} };
    const out = UI.screens[name](scr, params || {}) || {};
    UI.cur.leave = out.leave; UI.cur.refresh = out.refresh;
    A.tick(UI.frame); UI.save();
  };
  UI.redraw = () => UI.go(UI.cur.name, UI.cur.params);
  UI.modal = (...kids) => { const m = document.getElementById('modal'); m.innerHTML = ''; const s = UI.box('sheet', ...kids); m.appendChild(s); m.hidden = false; A.tick(UI.frame); return s; };
  UI.closeModal = () => { const m = document.getElementById('modal'); m.hidden = true; m.innerHTML = ''; };
  let toastT = null;
  UI.toast = (msg) => { const t = document.getElementById('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 1800); };
  UI.confirm = (title, body, yes, fn) => UI.modal(UI.txt('disp', title), UI.txt('dim', body), UI.box('row', UI.key('Never mind', UI.closeModal, 'black grow'), UI.key(yes, () => { UI.closeModal(); fn(); }, 'grow')));
  UI.topbar = (title, back, right) => {
    const bar = el('div', 'bar');
    if (back) bar.appendChild(UI.key('‹', () => { Au.sfx('back'); back(); }, 'black sm'));
    bar.appendChild(el('div', 'disp', title));
    if (right !== false) UI.add(bar, right || [UI.notes(UI.S.notes), UI.txt('badge', 'Lv ' + UI.S.level)]);
    return bar;
  };

  /* ----- music follows the band ----- */
  UI.music = (mode, prog) => { const S = UI.S; Au.music.set(mode, mode === 'silent' ? [] : Au.layersFor(H.bandPets(S)), prog); };

  /* ----- settings ----- */
  UI.settings = () => {
    const S = UI.S, st = S.settings;
    const stepper = (label, key, vals, fmt) => { const v = el('b', '', fmt(st[key])); return UI.box('row between', UI.txt('', label), UI.box('switch', UI.key('−', () => { const i = Math.max(0, vals.indexOf(st[key]) - 1); st[key] = vals[i]; v.textContent = fmt(st[key]); apply(); }, 'black sm'), v, UI.key('+', () => { const i = Math.min(vals.length - 1, vals.indexOf(st[key]) + 1); st[key] = vals[i]; v.textContent = fmt(st[key]); apply(); }, 'black sm'))); };
    const apply = () => { Au.vol.music = st.music; Au.vol.sfx = st.sfx; Au.vol.sound = st.sound; Au.applyVol(); UI.save(); };
    const pct = (x) => Math.round(x * 100) + '%';
    const vols = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
    const snd = UI.key(st.sound ? 'Sound is on' : 'Sound is off', () => { st.sound = st.sound ? 0 : 1; snd.innerHTML = st.sound ? 'Sound is on' : 'Sound is off'; apply(); }, 'wide black');
    UI.modal(UI.txt('disp', 'Settings'), snd, stepper('Music', 'music', vols, pct), stepper('Effects', 'sfx', vols, pct), stepper('Battle speed', 'speed', [1, 2, 3], (x) => x + 'x'),
      UI.txt('dim small', 'Progress saves in this browser as you play.'),
      UI.key('Start over', () => UI.confirm('Start over?', 'This erases the band, the shells and every song you brought back.', 'Erase it all', () => { UI.wipe(); UI.go('title'); }), 'wide black sm'),
      UI.key('Done', UI.closeModal, 'wide'));
  };

  /* ----- boot ----- */
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
