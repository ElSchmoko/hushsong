/* Hushsong Roads (preview) — the story player, the band screen and the side-scrolling Drowned Chapel. */
(function (H) {
  'use strict';
  const UI = H.UI, A = H.Art, Au = H.Audio, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key, tr = (s, v) => H.T(s, v);
  const R = H.ROADS, Rd = H.Roads, RU = UI.Roads;

  /* ---------- the story player: a backdrop, a cast that moves, and a line under it ---------- */
  UI.screens.roadsstory = (root, pr) => {
    if (!Rd.S) Rd.load();
    const scene = R.SCENES[pr.scene] || R.SCENES.prologue, P = pr.place ? Rd.place(pr.place) : null;
    root.classList.add('rd-story'); UI.music(pr.scene === 'prologue' ? 'silent' : 'camp', pr.scene === 'chapel' ? 'caves' : 'fen');
    const stage = el('div', 'rd-stage'), cast = el('div', 'rd-cast'), panel = el('div', 'rd-line'), who = el('div', 'rd-who'), line = el('div', 'rd-say'), next = key(tr('Next'), () => go(i + 1), 'go wide');
    add(panel, who, line, next); add(root, stage, cast, panel);
    const skip = key(tr('Skip'), () => finish(), 'soft sm rd-skip'); if (pr.scene !== 'prologue' || Rd.S.pets.length) root.appendChild(skip);
    let i = -1, bgKey = '', typer = 0;
    const expand = (k) => { const band = Rd.bandPets().filter(Boolean).map((p) => p.form); return k === '$band' ? (band.length ? band : ['hum']) : k === '$starter' || k === '$lead' ? [band[0] || 'hum'] : [k]; };
    const say = (s) => { clearInterval(typer); line.textContent = ''; let k = 0; typer = setInterval(() => { k += 2; line.textContent = s.slice(0, k); if (k >= s.length) clearInterval(typer); }, window.__hsSpeed ? 1 : 22); };
    const go = (k) => {
      if (k >= scene.length) return finish();
      i = k; const b0 = scene[k], b = b0.bg === '$reg' ? Object.assign({}, b0, { bg: R.REGIONS[P ? P.reg : 'marsh'].bg }) : b0;
      // the backdrop: a new one fades in over the old (a ripple of colour when the music comes back)
      const bk = b.bg + '|' + b.mode;
      if (bk !== bgKey) { if (!bgKey && b.ripple) { const g0 = UI.bgEl(b.bg, UI.W, UI.Hh, 0.5, 'grey'); g0.classList.add('rd-bg'); stage.appendChild(g0); } const c = UI.bgEl(b.bg, UI.W, UI.Hh, 0.5, b.mode); c.classList.add('rd-bg'); if (b.ripple || (bgKey && b.mode !== 'grey')) c.classList.add('ripple'); stage.appendChild(c); bgKey = bk; const old = stage.querySelectorAll('.rd-bg'); if (old.length > 3) old[0].remove(); }
      cast.innerHTML = '';
      for (const [k0, x, act] of b.cast) {
        const keys = expand(k0);
        keys.forEach((kk, j) => { const big = kk === 'shell' ? 1.5 : H.DIN[kk] && H.DIN[kk].boss ? 1.6 : 1.5, s = UI.sp(kk, big, { anim: false }), wrap = add(el('div', 'rd-actor act-' + act), s); wrap.style.left = (x + (j - (keys.length - 1) / 2) * 0.24) * 100 + '%'; wrap.style.animationDelay = j * 0.12 + 's'; cast.appendChild(wrap); });
      }
      if (b.ripple) { Au.sfx('level'); UI.confetti(24); }
      if (b.cast.some((c) => c[2] === 'crack')) setTimeout(() => Au.sfx('crack'), 500);
      who.textContent = b.who ? tr(b.who) : ''; who.hidden = !b.who;
      let s = b.line; if (P && s === '$story0') s = P.story[0]; if (P && s === '$story1') s = P.story[1];
      line.classList.toggle('head', !!P && b.line === '$story0');
      say(tr(s));
      next.hidden = !!b.pick; if (b.pick) setTimeout(picker, 1400);
    };
    const finish = () => { clearInterval(typer); if (pr.scene === 'prologue' && !Rd.S.pets.length) return picker(); UI.go('roads', {}); };
    // choosing a starter: four cards, one per class
    const picker = () => {
      let sel = null; const grid = el('div', 'rd-pick'), ok = key(tr('Choose'), () => { if (!sel) return; Rd.chooseStarter(sel); UI.closeModal(); Au.sfx('evolve'); go(i + 1); }, 'go wide big'); ok.disabled = true;
      for (const [sp, role] of R.STARTERS) {
        const c = el('button', 'rd-pc'); c.type = 'button';
        add(c, UI.sp(sp, 1, { anim: false }), el('b', '', H.FORMS[sp].n), UI.roleChip(role), el('div', 'small dim', H.SPECIES[sp].lore.split('. ')[0] + '.'));
        c.addEventListener('click', () => { sel = sp; grid.querySelectorAll('.rd-pc').forEach((x) => x.classList.toggle('on', x === c)); ok.disabled = false; ok.textContent = tr('Choose {pet}', { pet: H.FORMS[sp].n }); Au.sfx('tap'); });
        grid.appendChild(c);
      }
      UI.modal(txt('disp center', tr('Who is in the shell?')), txt('dim small center', tr('One pet for each class. The rest you will meet on the road.')), grid, ok);
      UI.cur.modalBack = () => {};
    };
    go(0);
    return { leave: () => clearInterval(typer) };
  };

  /* ---------- the band: three in the band, everyone else waiting ---------- */
  UI.screens.roadsband = (root) => {
    if (!Rd.S) Rd.load(); const S = Rd.S;
    root.appendChild(UI.topbar(tr('Your band'), () => UI.go('roads', {})));
    const sc = el('div', 'scroll pad'); root.appendChild(sc);
    const slots = el('div', 'rd-slots');
    S.band.forEach((id, k) => {
      const p = id && Rd.pet(id), b = el('button', 'rd-slot'); b.type = 'button';
      if (p) add(b, UI.sp(p.form, 1.1), el('b', '', H.FORMS[p.form].n), el('span', 'small', tr('Lv {n}', { n: p.lvl }))); else add(b, UI.icon('ic_plus', 1.2), el('span', 'small dim', tr('Empty')));
      b.addEventListener('click', () => { Au.sfx('tap'); p ? petSheet(p) : pickFor(k); }); slots.appendChild(b);
    });
    add(sc, txt('label', tr('In the band')), slots, txt('label', tr('All pets ({n})', { n: S.pets.length })));
    const list = el('div', 'rd-plist');
    for (const p of S.pets.slice().sort((a, b) => b.lvl - a.lvl)) {
      const b = el('button', 'rd-prow' + (S.band.includes(p.id) ? ' inb' : '')); b.type = 'button';
      add(b, UI.sp(p.form, 0.6, { anim: false }), add(el('div', 'grow'), el('b', '', H.FORMS[p.form].n), box('row', UI.famChip(H.SPECIES[Rd.species(p)].family), el('span', 'small', tr('Lv {n}', { n: p.lvl })))), UI.meter(p.xp / R.petNeed(p.lvl)));
      b.addEventListener('click', () => { Au.sfx('tap'); petSheet(p); }); list.appendChild(b);
    }
    sc.appendChild(list);
    if (Rd.has('warmup')) sc.appendChild(txt('small dim center', tr('Warm-Up: pets outside the band get half the XP.'))); else sc.appendChild(txt('small dim center', tr('Only pets in the band get XP from battles.')));
    const pickFor = (k) => {
      const kids = [txt('disp', tr('Who goes in?'))];
      for (const p of S.pets.filter((x) => !S.band.includes(x.id))) { const b = el('button', 'rd-prow'); b.type = 'button'; add(b, UI.sp(p.form, 0.6, { anim: false }), add(el('div', 'grow'), el('b', '', H.FORMS[p.form].n), el('span', 'small', tr('Lv {n}', { n: p.lvl })))); b.addEventListener('click', () => { Rd.setBand(k, p.id); Rd.save(); UI.closeModal(); UI.redraw(); }); kids.push(b); }
      if (kids.length === 1) kids.push(txt('dim', tr('Everyone is already in the band.')));
      kids.push(key(tr('Close'), UI.closeModal, 'soft wide')); UI.modal(...kids);
    };
    const petSheet = (p) => {
      const kit = H.kitOf(p.form), st = H.petStats(p, p.lvl), m = { hp: 0, vol: 0, poise: 0, tempo: 0 }; for (const pk of H.petPerks(p, S)) if (pk.mod) for (const k in m) if (pk.mod[k]) m[k] += pk.mod[k];
      const kids = [add(el('div', 'rd-phead'), UI.sp(p.form, 1.3), add(el('div', 'grow col'), txt('disp', H.FORMS[p.form].n), box('row wrap', UI.famChip(H.SPECIES[Rd.species(p)].family), UI.roleChip(kit.role), el('span', 'chip', tr('Lv {n}', { n: p.lvl }))), UI.meter(p.xp / R.petNeed(p.lvl))))];
      kids.push(el('div', 'stats', UI.statsHTML([[Math.round(st.hp * (1 + m.hp)), H.T.k('HP')], [Math.round(st.vol * (1 + m.vol)), H.T.k('Power')], [Math.round(st.poise + m.poise), H.T.k('Guard')], [Math.round(st.tempo * (1 + m.tempo)), H.T.k('Speed')]])));
      for (const [kind, ab] of [['beat', kit.beat], ['phrase', kit.phrase], ['finale', kit.finale]]) if (ab) kids.push(UI.moveCard(kind, ab));
      if (kit.passive) kids.push(UI.moveCard('passive', kit.passive));
      kids.push(txt('label', tr('Gear')));
      [0, 1].forEach((slot) => {
        const id = p.gear[slot], it = id && S.items.find((x) => x.id === id), b = el('button', 'rd-gslot'); b.type = 'button';
        if (it) b.appendChild(UI.itemRow(it)); else add(b, UI.icon('ic_plus', 0.9), el('span', 'dim', tr('Empty slot')));
        b.addEventListener('click', () => gearFor(p, slot)); kids.push(b);
      });
      const ch = H.childrenOf(p.form);
      if (ch.length) { kids.push(txt('label', tr('Evolve'))); for (const f of ch) { const c = Rd.evoCheck(p, f), b = key('', () => { if (Rd.evolve(p, f)) { Au.sfx('evolve'); UI.confetti(30); Rd.save(); UI.closeModal(); UI.redraw(); } }, c.ok ? 'gold wide' : 'soft wide'); add(b, UI.sp(f, 0.5, { anim: false }), el('span', 'grow', H.FORMS[f].n + ' · ' + H.ROLES[H.kitOf(f).role].n), el('span', 'small', c.ok ? tr('{n} echoes', { n: c.cost }) : c.why || '')); b.disabled = !c.ok; kids.push(b); } }
      const inBand = S.band.indexOf(p.id);
      if (inBand < 0) kids.push(box('row', ...[0, 1, 2].map((k) => key(tr('Slot {n}', { n: k + 1 }), () => { Rd.setBand(k, p.id); Rd.save(); UI.closeModal(); UI.redraw(); }, 'go grow'))));
      else if (S.band.filter(Boolean).length > 1) kids.push(key(tr('Take out of the band'), () => { S.band[inBand] = null; Rd.save(); UI.closeModal(); UI.redraw(); }, 'soft wide'));
      kids.push(key(tr('Close'), UI.closeModal, 'soft wide')); UI.modal(...kids);
    };
    const gearFor = (p, slot) => {
      const kids = [txt('disp', tr('Gear for {pet}', { pet: H.FORMS[p.form].n }))];
      if (p.gear[slot]) kids.push(key(tr('Take it off'), () => { p.gear[slot] = null; Rd.save(); UI.closeModal(); petSheet(p); }, 'soft wide'));
      const spare = S.items.filter((it) => !Rd.itemOwner(it.id));
      for (const it of spare) { const b = UI.itemRow(it, 'button'); b.addEventListener('click', () => { Rd.equip(p, slot, it.id); Rd.save(); UI.closeModal(); petSheet(p); }); kids.push(b); }
      if (!spare.length) kids.push(txt('dim', tr('No spare gear. Din sometimes drop some, and chests hold more.')));
      kids.push(key(tr('Back'), () => { UI.closeModal(); petSheet(p); }, 'soft wide')); UI.modal(...kids);
    };
    return {};
  };

  /* ---------- the Drowned Chapel: a side-scrolling run ---------- */
  const ROOM = 150, LEAD = 70;   // layout units between rooms, and how far before a room the band stops
  UI.screens.roadschapel = (root, pr) => {
    if (!Rd.S) Rd.load(); const S = Rd.S, C = R.CHAPEL;
    root.classList.add('rd-chapel'); UI.music('camp', 'caves');
    const cv = el('canvas', 'rd-ccv'), hud = el('div', 'rd-top'), info = el('div', 'rd-card');
    add(hud, key(tr('‹ Leave'), () => UI.confirm(tr('Leave the chapel?'), tr('You start from the door next time.'), tr('Leave'), () => { Rd.chapelStart(); UI.go('roads', {}); }), 'soft sm backk'), el('div', 'disp grow', tr(C.n)));
    const dots = el('div', 'rd-rooms'); C.rooms.forEach((rm, k) => dots.appendChild(el('i', k < S.chapel.room ? 'done' : '')));
    add(root, cv, hud, dots, info);
    const x = cv.getContext('2d'); let Wu = UI.W, Hu = UI.Hh, k = 1;
    const fit = () => { const r = root.getBoundingClientRect(); k = Math.min(3, window.devicePixelRatio || 1) * (r.width / Wu); cv.width = Math.round(Wu * k); cv.height = Math.round(Hu * k); };
    fit();
    let room = S.chapel.room, bandX = room * ROOM - LEAD - 40, goal = room * ROOM - LEAD, t0 = performance.now(), raf = 0, waiting = false, shown = -1, opened = {};
    const floorY = Hu * 0.72;
    const spr = (key0, X, Y, size, flip, grey) => { const c = grey ? H.RoadsMap.sprite(key0, true, Math.round(size * k * 1.2)) : A.sprite(key0, '', Math.round(size * k * 1.2)); x.save(); x.translate(X, Y); if (flip) x.scale(-1, 1); x.drawImage(c, -size / 2, -size * 0.85, size, size); x.restore(); };
    const draw = (now) => {
      const cam = bandX - Wu * 0.3; x.setTransform(k, 0, 0, k, 0, 0);
      // stone, far to near, each layer moving at its own speed
      const g = x.createLinearGradient(0, 0, 0, Hu); g.addColorStop(0, '#2b2a48'); g.addColorStop(0.7, '#3d3e66'); g.addColorStop(1, '#262540'); x.fillStyle = g; x.fillRect(0, 0, Wu, Hu);
      const par = (f) => -cam * f;
      const top = Math.max(60, floorY - Hu * 0.62), ah = floorY - 30 - top;
      // the vaulted ceiling and the far wall with its coloured windows
      x.fillStyle = '#25243f'; for (let i = -1; i < 7; i++) { const X = ((i * 90 + par(0.2)) % 630 + 630) % 630 - 90; x.beginPath(); x.moveTo(X, 0); x.quadraticCurveTo(X + 45, top * 0.9, X + 90, 0); x.lineTo(X + 90, 0); x.fill(); }
      for (let i = -1; i < 8; i++) { const X = ((i * 70 + par(0.3)) % 560 + 560) % 560 - 70; x.fillStyle = '#34345a'; x.beginPath(); x.moveTo(X, floorY - 30); x.lineTo(X, top + 40); x.quadraticCurveTo(X + 30, top, X + 60, top + 40); x.lineTo(X + 60, floorY - 30); x.fill();
        x.fillStyle = (i % 3) ? '#5a72b8' : '#b86aa0'; x.globalAlpha = 0.35 + 0.1 * Math.sin(now / 900 + i); x.beginPath(); x.moveTo(X + 14, floorY - 30 - ah * 0.3); x.lineTo(X + 14, top + 52); x.quadraticCurveTo(X + 30, top + 26, X + 46, top + 52); x.lineTo(X + 46, floorY - 30 - ah * 0.3); x.fill(); x.globalAlpha = 1;
        x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 1; x.beginPath(); x.moveTo(X + 30, top + 30); x.lineTo(X + 30, floorY - 30 - ah * 0.3); x.stroke(); }
      // light falling through the windows
      x.fillStyle = 'rgba(180,200,255,.06)'; for (let i = 0; i < 4; i++) { const X = ((i * 140 + par(0.3) + 20) % 560 + 560) % 560 - 70; x.beginPath(); x.moveTo(X, top + 40); x.lineTo(X + 40, top + 40); x.lineTo(X + 90, floorY + 20); x.lineTo(X + 20, floorY + 20); x.fill(); }
      for (let i = -1; i < 6; i++) { const X = ((i * 110 + par(0.65)) % 660 + 660) % 660 - 110; x.fillStyle = '#4a4a78'; x.fillRect(X, 0, 22, floorY); x.fillStyle = '#5a5a8a'; x.fillRect(X - 4, top - 6, 30, 10); x.fillRect(X - 4, floorY - 12, 30, 12); x.strokeStyle = '#2b2140'; x.lineWidth = 1.2; x.strokeRect(X, -2, 22, floorY + 2);
        x.strokeStyle = '#7a7aa8'; x.beginPath(); for (let y = 8; y < top - 10; y += 7) { x.moveTo(X + 11, y); x.lineTo(X + 11 + (y % 14 ? 2 : -2), y + 6); } x.stroke(); }
      x.fillStyle = '#5c5a7a'; x.fillRect(0, floorY, Wu, Hu - floorY); x.fillStyle = '#4a7aa8'; x.globalAlpha = 0.55; x.fillRect(0, floorY + 8, Wu, Hu - floorY); x.globalAlpha = 1;
      x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1; for (let i = 0; i < 9; i++) { const X = ((i * 47 + par(1) + now / 40) % 420 + 420) % 420 - 30; x.beginPath(); x.moveTo(X, floorY + 18 + (i % 3) * 9); x.lineTo(X + 14, floorY + 18 + (i % 3) * 9); x.stroke(); }
      x.strokeStyle = '#2b2140'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, floorY); x.lineTo(Wu, floorY); x.stroke();
      // the rooms ahead: Din, chests, a pet, the boss
      C.rooms.forEach((rm, i) => {
        if (i < room) return; const X = i * ROOM - cam, done = i < room; if (X < -60 || X > Wu + 60 || done) return;
        if (rm.t === 'fight') rm.din.forEach((d, j) => spr(d, X + j * 26, floorY + 4 + (j % 2) * 6, 44, true));
        if (rm.t === 'chest') spr(opened[i] ? 'nd_rest' : 'ev_crate', X, floorY + 4, 36);
        if (rm.t === 'pet') spr(rm.pet, X, floorY + 2, 42, true, true);
        if (rm.t === 'boss') { spr(rm.boss, X + 10, floorY + 6, 80, true); rm.adds.forEach((d, j) => spr(d, X - 34 - j * 24, floorY + 4, 40, true)); }
      });
      // candles that flicker in the foreground
      for (let i = -1; i < 5; i++) { const X = ((i * 130 + par(1.25)) % 650 + 650) % 650 - 60, fl = 3 + Math.sin(now / 120 + i * 3) * 1.2; x.fillStyle = '#e8e0c8'; x.fillRect(X, floorY + 26, 5, 16); x.fillStyle = '#ffc928'; x.beginPath(); x.ellipse(X + 2.5, floorY + 24 - fl / 2, 2.4, fl, 0, 0, 6.29); x.fill(); x.fillStyle = 'rgba(255,201,40,.12)'; x.beginPath(); x.arc(X + 2.5, floorY + 22, 18, 0, 6.29); x.fill(); }
      // the band, walking right
      const walking = bandX < goal - 0.5; const band = Rd.bandPets().filter(Boolean);
      band.forEach((p, j) => spr(p.form, bandX - cam - j * 30, floorY + 4 - (walking ? Math.abs(Math.sin(now / 90 + j)) * 4 : 0), 44, false));
    };
    const loop = (now) => {
      const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
      if (bandX < goal) bandX = Math.min(goal, bandX + dt * 70); else if (!waiting) arrive();
      draw(now); raf = requestAnimationFrame(loop);
    };
    const setInfo = (title, hint, acts) => { info.innerHTML = ''; add(info, el('div', 'rd-ct', title), hint ? el('div', 'rd-ch', hint) : null); if (acts) info.appendChild(add(el('div', 'rd-ca'), ...acts.map(([l, f, c]) => key(l, f, c || 'go')))); };
    const fight = () => { Rd.fightRoom(room); UI.flashOut(() => UI.go('battle', { roads: 1 })); };
    const advance = () => { room++; S.chapel.room = room; Rd.save(); dots.querySelectorAll('i').forEach((d, j) => d.classList.toggle('done', j < room)); goal = room * ROOM - LEAD; waiting = false; if (room >= C.rooms.length) goal = room * ROOM; };
    const arrive = () => {
      waiting = true; if (shown === room) return; shown = room;
      if (room >= C.rooms.length) { const out = Rd.chapelDone(); if (out.first) return UI.go('roadsstory', { scene: 'chapel' }); UI.toast(tr('Out into the daylight.')); return UI.go('roads', {}); }
      const rm = C.rooms[room];
      if (rm.t === 'fight') setInfo(H.T.list(rm.din.map((d) => H.DIN[d].n)), tr('Din in the dark, level {n}.', { n: rm.lv }), [[tr('Fight'), fight, 'coral']]);
      if (rm.t === 'chest') setInfo(tr('An old chest'), tr('It is wet, but it opens.'), [[tr('Open'), () => { const r = Rd.chapelChest(room); opened[room] = 1; Au.sfx('coin'); UI.modal(UI.sp('ev_crate', 1.3), txt('disp center', tr('Inside')), box('row wrap center', UI.notes(r.notes)), r.item ? UI.itemRow(r.item) : null, key(tr('Take it'), () => { UI.closeModal(); room = S.chapel.room - 1; advance(); }, 'go wide')); }, 'gold']]);
      if (rm.t === 'pet') setInfo(tr('Wild {pet}', { pet: H.FORMS[rm.pet].n }), Rd.owns(rm.pet) ? tr('Another {pet}, singing to itself.', { pet: H.FORMS[rm.pet].n }) : tr('A little songbook sings to itself, all grey. Win it over and it comes along.'), [[tr('Fight'), fight, 'coral']]);
      if (rm.t === 'boss') setInfo(H.DIN[rm.boss].n, tr('The noise at the bottom of the chapel. Level {n}.', { n: rm.lv }), [[tr('Fight'), fight, 'coral']]);
    };
    // back from a battle: the result first, then onwards
    if (pr.res) { const out = pr.res; room = S.chapel.room; bandX = (room - 1) * ROOM - LEAD; goal = bandX; waiting = true; shown = room - 1; setTimeout(() => RU.result(out, () => { UI.closeModal(); goal = room * ROOM - LEAD; waiting = false; shown = -1; if (room >= C.rooms.length) goal = room * ROOM; }), 60); }
    else setInfo(tr(C.n), tr('The band wades in.'));
    raf = requestAnimationFrame(loop);
    const onR = () => fit(); window.addEventListener('resize', onR);
    return { leave: () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onR); } };
  };

  /* ---------- the door into the preview ---------- */
  UI.screens.roadsintro = (root) => {
    if (!Rd.S) Rd.load(); const S = Rd.S; UI.music('camp', 'fen');
    root.classList.add('rd-intro');
    const bg = UI.bgEl('fen', UI.W, UI.Hh, 0.5, 'hush'); bg.classList.add('rd-bg'); root.appendChild(bg);
    const col = el('div', 'rd-introc');
    add(col, el('span', 'tag', tr('Preview')), txt('rd-title', tr('Hushsong Roads')),
      txt('rd-blurb', tr('Take a band across Reed Marsh on a 3D map. Befriend wild pets, free five places from the Din, and face Muffle.')),
      txt('small rd-blurb dim', tr('A fresh start with its own save. Your pets and items stay safe in the main game.')));
    const band = el('div', 'parade'); for (const sp of S.pets.length ? Rd.bandPets().filter(Boolean).map((p) => p.form) : ['thud', 'twang', 'hum', 'howl']) band.appendChild(UI.sp(sp, 1.1)); col.appendChild(band);
    col.appendChild(key(S.started && S.pets.length ? tr('Continue') : tr('Begin'), () => { Au.sfx('tap', 4); UI.go(S.started && S.pets.length ? 'roads' : 'roadsstory', { scene: 'prologue' }); }, 'go wide big'));
    if (S.started) col.appendChild(key(tr('Start over'), () => UI.confirm(tr('Start over?'), tr('Your preview progress goes. The main game is not touched.'), tr('Start over'), () => { Rd.wipe(); H.RoadsMap.G.band = null; for (const t of H.RW.list) { t.song = null; } UI.redraw(); }, 'coral'), 'soft wide'));
    col.appendChild(key(tr('‹ Home'), () => UI.go('home'), 'soft wide backk'));
    root.appendChild(col);
    return {};
  };
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
