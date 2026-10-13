/* Hushsong — interface plumbing: sizing, saving, navigation, shared pieces. */
(function (H) {
  'use strict';
  const A = H.Art, Au = H.Audio;
  const UI = (H.UI = { screens: {}, cur: null, W: 180, Hh: 300, u: 2, frame: 0 });
  const SAVE_KEY = 'hushsong.save.v4', OLD_KEY = 'hushsong.save.v3';

  const el = (UI.el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; });
  UI.add = (parent, ...kids) => { for (const k of kids.flat()) if (k) parent.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); return parent; };
  UI.box = (cls, ...kids) => UI.add(el('div', cls), ...kids);
  UI.txt = (cls, html) => el('div', cls, html);
  UI.icon = (key, scale) => A.el(key, scale || 1);
  UI.sp = (key, scale, opts) => { const c = A.el(key, scale || 1, Object.assign({ anim: true }, opts || {})); c.classList.add('spr'); return c; };
  UI.key = (label, fn, cls, note) => { const b = el('button', 'key ' + (cls || ''), label); b.type = 'button'; b.addEventListener('click', (e) => { if (b.disabled) return; Au.sfx('tap', note); fn(e); }); return b; };
  // An onboarding pointer: a pulsing ring, a bouncing arrow and a short label saying what to do there.
  UI.coach = (b, on, text) => {
    if (!on) return b; b.classList.add('coach'); const t = el('span', 'coachtip', text); b.appendChild(t);
    // keep the label on screen when the thing it points at sits near an edge
    requestAnimationFrame(() => { const g = document.getElementById('game'); if (!g || !t.isConnected) return; const G = g.getBoundingClientRect(), R = t.getBoundingClientRect(), pad = UI.u * 4;
      const dx = R.left < G.left + pad ? G.left + pad - R.left : R.right > G.right - pad ? G.right - pad - R.right : 0; if (dx) t.style.marginLeft = dx + 'px'; });
    return b;
  };
  UI.gearKey = (fn) => { const b = UI.key('', fn, 'sm menuk'); b.appendChild(UI.icon('ic_gear')); b.setAttribute('aria-label', 'Menu'); return b; };
  UI.bgEl = (k, w, h, hf, mode) => { const src = A.bgMode(k, w, h, hf, mode), c = A.make(src.width, src.height); c.getContext('2d').drawImage(src, 0, 0); c.className = 'bgc'; c.style.width = `calc(var(--u) * ${w})`; c.style.height = `calc(var(--u) * ${h})`; return c; };

  const stNames = Object.values(H.STATUS).map((s) => s.n).sort((a, b) => b.length - a.length);
  const stRe = new RegExp('\\b(' + stNames.join('|') + ')\\b', 'g');
  const stBad = new Set(Object.values(H.STATUS).filter((s) => !s.buff).map((s) => s.n));
  UI.rich = (s) => String(s).replace(stRe, (m) => `<b class="st ${stBad.has(m) ? 'bad' : ''}">${m}</b>`);
  UI.famChip = (fam) => UI.add(el('span', 'chip ' + fam), UI.icon('fam_' + fam), H.FAMILIES[fam].n);
  UI.roleChip = (role) => UI.add(el('span', 'chip'), UI.icon('role_' + role), H.ROLES[role].n);
  UI.fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + 'k' : String(n));
  UI.purse = (icon, n, label) => { const p = UI.add(el('span', 'purse'), UI.icon(icon), el('span', 'pn', typeof n === 'number' ? UI.fmt(n) : String(n))); if (label) p.setAttribute('aria-label', label + ': ' + n); return p; };
  UI.notes = (n) => UI.purse('ic_note', n, 'Notes');
  UI.echoes = (n) => UI.purse('ic_echo', n, 'Echoes');
  // the two currencies, shown at the top of every menu
  UI.wallet = () => [UI.notes(UI.S.notes), UI.echoes(UI.S.echo || 0)];
  // The first time echoes turn up, a few words on what they are for.
  // The first time each kind of echo turns up, a few words on what it is for. pet: whose echoes they are (from a shell).
  UI.echoIntro = (pet) => {
    const S = UI.S, k = pet ? 'petEchoIntro' : 'echoIntro'; if (S.flags[k]) return null; S.flags[k] = 1; const n = pet && H.FORMS[H.petSpecies(pet)].n;
    return UI.add(el('div', 'echointro'), UI.icon('ic_echo', 1.4), UI.add(el('div', 'grow'), el('b', '', pet ? `You found ${n} echoes!` : 'You found an echo!'),
      el('div', 'small', pet ? `They help ${n} evolve. A fully evolved pet turns its echoes into stars.` : 'Plain echoes help any pet evolve, on top of its own echoes. Spend them on a pet\'s page.'))); };
  // after a level up: the modes that just opened
  UI.unlockNote = (ups) => { const S = UI.S, from = S.level - (ups || 0), got = [[H.DAILY.unlock, 'Daily Gig'], [H.SOLO.unlock, 'Solo'], [H.ENCORE.unlock, 'Encore']].filter(([lv]) => from < lv && S.level >= lv); return got.length ? UI.add(el('div', 'unlocked'), UI.icon('ic_bang', 0.9), el('span', '', `<b>New on Home:</b> ${got.map((x) => x[1]).join(' and ')}`)) : null; };
  UI.stars = (rank) => (rank ? UI.add(el('span', 'chip'), UI.icon('ic_star'), String(rank)) : null);
  // an equipment row: icon, name, rarity, what it does
  UI.itemRow = (it, tag, right) => { const b = el(tag || 'div', 'item r-' + it.rar); if (tag === 'button') b.type = 'button'; UI.add(b, UI.icon(A.itemIcon(it), 1.25), el('div', 'grow', `<div class="rar">${H.RARITY[it.rar].n}</div><b>${H.itemName(it)}</b><div>${H.itemText(it)}</div>`)); if (right) { right.classList.add('who'); b.appendChild(right); } return b; };
  // the tab bar under the main screens
  UI.nav = (cur) => {
    const S = UI.S, n = el('div', 'nav');
    for (const [id, icon, name, pip] of [['home', 'ic_home', 'Home', H.recordsReady(S) ? '!' : 0], ['team', 'ic_team', 'Band', 0], ['pets', 'ic_pets', 'Pets', H.canEvolveAny(S) ? '!' : 0], ['shells', 'ic_shell', 'Shells', S.shells], ['bag', 'ic_bag', 'Bag', H.mergeGroups(S).length ? '!' : 0]]) {
      const b = el('button', 'tab' + (id === cur ? ' on' : '')); b.type = 'button'; if (id === cur) b.setAttribute('aria-current', 'page'); UI.add(b, UI.icon(icon, icon === 'ic_shell' ? 1.16 : 1), el('span', '', name)); if (pip) b.appendChild(el('span', 'pip', String(pip))); UI.coach(b, id === 'shells' && S.flags.coach === 'shell' && cur !== 'shells', 'Open your shell here');
      b.addEventListener('click', () => { if (id === cur) return; Au.sfx('tap'); UI.go(id, {}); }); n.appendChild(b);
    }
    return n;
  };
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
  UI.meter2 = (a, b) => { const m = UI.meter(a); const j = el('i', 'more'); j.style.left = Math.round(Math.min(1, a) * 100) + '%'; j.style.width = Math.round(Math.max(0, Math.min(1, a + b) - Math.min(1, a)) * 100) + '%'; m.appendChild(j); return m; };
  UI.meter = (frac) => { const m = el('div', 'meter'); const i = el('i'); i.style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + '%'; m.appendChild(i); return m; };
  UI.statSheet = (S, pet) => { const b = H.petSheet(S, pet); return { hp: b.hp, vol: b.vol, poise: b.poise, tempo: b.tempo, crit: b.crit }; };

  // One layout unit is --u CSS pixels. Phones fill the screen; wider windows get a framed card.
  UI.resize = () => {
    const app = document.getElementById('app'), game = document.getElementById('game'), framed = app.clientWidth > 520;
    const aw = framed ? Math.min(app.clientWidth - 40, 470) : app.clientWidth, ah = framed ? app.clientHeight - 40 : app.clientHeight;
    let u = aw / 190, W = 190; if (ah / u < 320) { u = ah / 320; W = Math.min(204, Math.floor(aw / u)); }
    u = Math.max(1.2, Math.round(u * 1000) / 1000);
    UI.u = u; UI.W = W; UI.Hh = Math.max(320, Math.min(framed ? 400 : 440, Math.floor(ah / u)));
    A.k = u * Math.min(3, Math.max(1, window.devicePixelRatio || 1));
    app.classList.toggle('framed', framed);
    game.style.setProperty('--u', u + 'px'); game.style.setProperty('--w', UI.W); game.style.setProperty('--h', UI.Hh);
  };

  UI.S = null;
  UI.load = () => {
    let S = null;
    try { const hot = window.claude && window.claude.hot && window.claude.hot.data; if (hot && hot.S) S = hot.S; } catch (e) { /* no hot data */ }
    if (!S) try { const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(OLD_KEY); if (raw) S = JSON.parse(raw); } catch (e) { S = null; }
    if (!S || !Array.isArray(S.pets) || !(S.v >= 3)) S = H.newState();
    return UI.adopt(S);
  };
  // make any saved game fit this version
  UI.adopt = (S) => {
    S = H.migrate(S);
    const d = H.newState(); for (const k in d) if (S[k] == null && d[k] != null) S[k] = d[k]; for (const k in d.settings) if (S.settings[k] == null) S.settings[k] = d.settings[k];
    S.pets = S.pets.filter((p) => H.FORMS[p.form]); S.pets.forEach((p) => { if (!p.gear) p.gear = [null, null]; p.gear = p.gear.map((id) => (id && S.items.some((x) => x.id === id) ? id : null)); if (!p.rank) p.rank = 0; }); S.team = S.team.map((id) => (S.pets.some((p) => p.id === id) ? id : null));
    if (!S.flags.ensrec) { S.flags.ensrec = 1; for (const e of H.ENSEMBLES) if (S.ens[e.id] && S.ens[e.id].reh) S.records['ens_' + e.id] = 1; }   // older saves were already paid for these
    if (!S.flags.wild100) { S.flags.wild100 = 1; S.echo += H.ECHO_FLOORS * Math.floor((S.stage - 1) / H.ECHO_EVERY); }   // older saves get the echoes for the hundreds they already cleared
    if (!S.flags.bossEcho) { S.flags.bossEcho = 1; S.echo += H.ECHO_BOSS * Math.min(10, Math.floor((S.stage - 1) / 10)); if (S.echo > 0) S.flags.echoIntro = 1; }
    if (!S.flags.bossEcho2) { S.flags.bossEcho2 = 1; S.echo += H.ECHO_BOSS * Math.max(0, Math.floor((S.stage - 1) / 10) - 10); }   // bosses past floor 100 pay an echo too now
    if (Object.values(S.petEcho || {}).some((x) => x > 0)) S.flags.petEchoIntro = 1;
    if (!S.flags.leg100 && S.stage > 100) { S.flags.leg100 = 1; H.rollLegend(S, Math.random); }   // the floor-100 Legendary for saves already past it   // and for the region bosses up to floor 100
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
  UI.closeModal = () => { clearInterval(UI.chainT); const m = document.getElementById('modal'); m.hidden = true; m.innerHTML = ''; };
  let toastT = null;
  UI.toast = (msg) => { const t = document.getElementById('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 1800); };
  UI.confirm = (title, body, yes, fn, cls) => UI.modal(UI.txt('disp', title), UI.txt('dim', body), UI.key(yes, () => { UI.closeModal(); fn(); }, 'wide ' + (cls || 'gold')), UI.key('Cancel', UI.closeModal, 'wide soft'));
  UI.topbar = (title, back, right) => { const bar = el('div', 'bar'); if (back) bar.appendChild(UI.key('‹ Back', () => { Au.sfx('back'); back(); }, 'soft sm')); bar.appendChild(el('div', 'disp', title)); UI.add(bar, right); return bar; };
  UI.music = (mode, prog, hold) => Au.music.set(mode, mode === 'silent' ? [] : Au.layersFor(H.teamPets(UI.S)), (H.REGIONS[prog] && H.REGIONS[prog].prog) || prog, prog, hold);

  /* how to play, in one sheet */
  UI.help = () => {
    const loop = el('div', 'loop'); H.FAMILY_ORDER.forEach((f) => UI.add(loop, UI.famChip(f), UI.txt('dim', '›'))); loop.appendChild(UI.famChip('drum'));
    const sec = (t, ...lines) => [UI.txt('label', t), ...lines.map((l) => UI.txt('dim', l))];
    const kids = [UI.txt('disp', 'How to play'),
      UI.txt('', 'Win floors to go further. Every 10th floor is a <b>boss</b>: the first win there gives a shell and an echo. Shells hold random pets.'),
      UI.txt('', 'Pets and enemies act when their yellow bar fills. <b>Tap an enemy</b> to use the chosen move on it, tap a round icon to switch moves, and <b>press and hold</b> anyone to see their stats. While you aim, the blinking part of a health bar is what the move will take.'),
      UI.txt('label', 'Stats')];
    [['HP', 'Damage it can take before it falls.'], ['Power', 'How hard its moves hit, heal and shield.'], ['Guard', 'Cuts the damage it takes. 50 Guard takes a third off.'], ['Speed', 'How often it gets a turn.'], ['Crit', 'Chance that a hit deals 50% more. Every pet starts at 5%.']]
      .forEach(([n, d]) => kids.push(UI.box('row', UI.txt('stat-n', `<b>${n}</b>`), UI.txt('grow small dim', d))));
    kids.push(UI.txt('label', 'Families'), UI.txt('dim', 'Each beats the next in the loop: 30% more damage dealt, 20% less taken.'), loop, UI.txt('label', 'Effects'), UI.txt('dim', 'The number on an effect is the turns it has left.'));
    Object.keys(H.STATUS).forEach((s) => kids.push(UI.box('row', UI.icon('st_' + s), UI.txt('grow small', `<b>${H.STATUS[s].n}.</b> <span class="dim">${H.STATUS[s].d}</span>`))));
    kids.push(
      ...sec('Echoes and stars', 'Pets evolve twice with echoes, then add stars: up to 10, each +3% HP and Power. A shell with a pet you have gives an echo only that pet can use. Plain echoes, shown at the top, fit any pet.'),
      ...sec('Notes and experience', 'New floors pay notes, which buy shells. Every battle gives experience, less on floors far below your level.'),
      ...sec('Ensembles', 'Three pets of three families, or all of one, form an ensemble: an opening tune and a boon for the band.'),
      ...sec('Rehearsal', 'The bosses of floors 10 to 100 return at your level once beaten. Each pays an echo once a week; they all come back on Monday.'),
      ...sec('Equipment', 'Each pet wears two pieces. Wins may drop more: the Adventure screen shows the chance. 3 spare pieces of a kind merge into the next rarity, up to Epic.'),
      ...sec('Daily Gig', `From level ${H.DAILY.unlock}: one battle a day at your level, with a house rule that changes how battles work. The rule is the same for everyone that day. The first win pays ${H.DAILY.notes} notes; try as often as you like.`),
      ...sec('Solo', `From level ${H.SOLO.unlock}: one pet goes on tour. Pick roads on a map: five gigs, stops to rest, jam or take a chance, and a boss at the end. Boons collected on the way last the whole tour and some work together. Each day the first five gig wins pay ${H.SOLO.gigNotes} notes and the first boss win ${H.SOLO.bossNotes} notes and a piece of equipment.`),
      ...sec('Encore', `From level ${H.ENCORE.unlock}: endless waves near your level, a little tougher each time. HP carries over and fallen pets sit out. Waves 5, 10, 15 and 20 pay echoes and a shell, once a week.`),
      ...sec('Records', 'Hard goals that pay shells, echoes and Home backdrops.'),
      UI.key('Got it', UI.closeModal, 'wide go'));
    UI.modal(...kids);
  };
  UI.settings = (extra) => {
    const S = UI.S, st = S.settings, apply = () => { Au.vol.music = st.music; Au.vol.sfx = st.sfx; Au.vol.sound = st.sound; Au.applyVol(); UI.save(); };
    const pct = (x) => Math.round(x * 100) + '%', vols = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
    const stepper = (label, key) => { const v = el('b', '', pct(st[key])); const mv = (d) => { st[key] = vols[Math.max(0, Math.min(10, vols.indexOf(st[key]) + d))]; v.textContent = pct(st[key]); apply(); }; return UI.box('row between', UI.txt('', label), UI.box('switch', UI.key('−', () => mv(-1), 'soft sm'), v, UI.key('+', () => mv(1), 'soft sm'))); };
    const snd = UI.key(st.sound ? 'Sound: on' : 'Sound: off', () => { st.sound = st.sound ? 0 : 1; snd.innerHTML = st.sound ? 'Sound: on' : 'Sound: off'; apply(); }, 'wide soft');
    UI.modal(UI.txt('disp', 'Menu'), extra || null, UI.key('How to play', () => UI.help(), 'wide soft'), snd, stepper('Music', 'music'), stepper('Effects', 'sfx'),
      extra ? null : UI.key('Save code', () => UI.saveCode(), 'wide soft'),
      UI.key('Close', UI.closeModal, 'wide'),
      // the one key that loses things sits apart, in red, and its question names what goes
      extra ? null : UI.box('dangerzone', UI.key('Start over', () => UI.confirm('Erase this game?', `All ${S.pets.length} ${S.pets.length === 1 ? 'pet' : 'pets'}, your way to floor ${S.stage}, and every note, shell and echo are gone for good. A save code made first can bring them back.`, 'Erase everything', () => { UI.wipe(); UI.go('title'); }, 'danger'), 'wide danger sm')));
  };

  /* a save you can carry: the whole game as one line of text */
  const PRE = 'HUSH1.';
  UI.encode = (S) => PRE + btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  UI.decode = (code) => { try { const t = String(code).replace(/\s+/g, ''); if (!t.startsWith(PRE)) return null; const S = JSON.parse(decodeURIComponent(escape(atob(t.slice(PRE.length))))); return S && Array.isArray(S.pets) && S.pets.length && S.v >= 3 ? S : null; } catch (e) { return null; } };
  UI.saveCode = () => {
    const out = el('textarea', 'code'); out.readOnly = true; out.value = UI.encode(UI.S); out.setAttribute('aria-label', 'Your save code'); out.addEventListener('focus', () => out.select());
    const inp = el('textarea', 'code'); inp.placeholder = 'Paste a save code here'; inp.setAttribute('aria-label', 'Save code to load');
    const copy = UI.key('Copy my code', () => { const done = () => UI.toast('Copied. Keep it somewhere safe.'); out.focus(); out.select(); try { navigator.clipboard.writeText(out.value).then(done, () => { try { document.execCommand('copy'); done(); } catch (e) { UI.toast('Select the text and copy it by hand.'); } }); } catch (e) { try { document.execCommand('copy'); done(); } catch (e2) { UI.toast('Select the text and copy it by hand.'); } } }, 'wide gold');
    const load = UI.key('Load this code', () => { const S = UI.decode(inp.value); if (!S) { UI.toast('That is not a Hushsong save code.'); return; } UI.confirm('Load this save?', `It holds ${S.pets.length} pets on floor ${S.stage}. It replaces the game on this device.`, 'Load it', () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* no storage */ } try { const hot = window.claude && window.claude.hot; if (hot && hot.data) hot.data.S = null; } catch (e) { /* no hot data */ } UI.adopt(S); UI.go('title'); }); }, 'wide soft');
    UI.modal(UI.txt('disp', 'Save code'), UI.txt('dim small', 'Your game is saved on this device by itself. This code is a copy you can keep, or use to carry on with on another device.'), out, copy, UI.txt('label', 'Load a code'), inp, load, UI.key('Close', UI.closeModal, 'wide'));
  };

  UI.boot = () => {
    UI.load(); UI.resize();
    const st = UI.S.settings; Au.vol.music = st.music; Au.vol.sfx = st.sfx; Au.vol.sound = st.sound;
    let rsT = null; window.addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(() => { const was = [UI.u, UI.W, UI.Hh, A.k].join(); UI.resize(); if ([UI.u, UI.W, UI.Hh, A.k].join() === was) return; if (UI.cur && UI.cur.name !== 'battle' && document.getElementById('modal').hidden) UI.redraw(); }, 180); });
    const wake = () => { const fresh = !Au.ctx; if (Au.init()) { Au.applyVol(); if (fresh) Au.music.set(Au.music.mode, Au.music.layers, Au.music.prog); } };
    window.addEventListener('pointerdown', wake); window.addEventListener('keydown', wake);
    setInterval(() => { UI.frame ^= 1; A.tick(UI.frame); }, 520);
    document.addEventListener('visibilitychange', () => { if (Au.ctx) { if (document.hidden) Au.ctx.suspend(); else Au.ctx.resume(); } });
    try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ S: UI.S })); } catch (e) { /* not in a viewer */ }
    const start = () => UI.go('title'); let begun = false; const once = () => { if (!begun) { begun = true; start(); } };
    try { Promise.all([document.fonts.load("800 20px 'Baloo 2'"), document.fonts.load("700 14px 'Nunito'")]).then(once, once); setTimeout(once, 1200); } catch (e) { once(); }
  };
})(window.H);
