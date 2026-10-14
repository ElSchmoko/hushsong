/* Hushsong — screens for the Daily Gig (tonight's poster, the result) and Solo (pick a soloist, the road map, stops, the end of a tour). */
(function (H) {
  'use strict';
  const A = H.Art, Au = H.Audio, UI = H.UI, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key;
  const rnd = Math.random;
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const at = (x, y) => `left: calc(var(--u) * ${x}); top: calc(var(--u) * ${y});`;
  const countdown = (ms) => { const m = Math.max(1, Math.round(ms / 60000)), h = Math.floor(m / 60); return h ? `${h} h ${m % 60} min` : `${m} min`; };
  const dateLine = () => { try { return new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); } catch (e) { return 'Today'; } };
  // a string of party lights across the top of a scene
  const lights = (n) => { const l = el('div', 'lights'); const cols = ['#ff6b5e', '#ffc928', '#7fe0d8', '#b8e88a', '#d8b0ff']; for (let i = 0; i < n; i++) { const b = el('i'); b.style.left = (i + 0.5) * (100 / n) + '%'; b.style.top = 'calc(var(--u) * ' + (5 + 7 * Math.sin((i / (n - 1)) * Math.PI)).toFixed(1) + ')'; b.style.background = cols[i % 5]; b.style.animationDelay = -i * 0.37 + 's'; l.appendChild(b); } return l; };
  // the faces of a band, small, in a row
  const faces = (pets, s) => { const f = el('div', 'tfaces'); pets.forEach((p) => f.appendChild(UI.sp(p.form, s || 0.5, { anim: false }))); return f; };

  /* ================= Daily Gig: tonight's poster ================= */
  UI.screens.daily = (root) => {
    const S = UI.S; if (!H.dailyOpen(S)) return UI.go('home');
    if (H.refreshDaily(S)) UI.save(); S.flags.seenDaily = 1;
    const st = H.dailyStage(S), T = H.TWISTS[st.twist], R = H.REGIONS[st.region], won = S.daily.won; UI.music('camp', st.region);
    root.appendChild(UI.topbar('Daily Gig', () => UI.go('gigs'), UI.wallet()));
    const sh = UI.Hh - 30 - 86, scene = el('div', 'gigscene');
    add(scene, UI.bgEl(st.region, UI.W, sh, 0.55, 'sing'), el('div', 'nightwash'), el('div', 'beam l'), el('div', 'beam r'), lights(9));
    const poster = el('div', 'poster' + (won ? ' won' : ''));
    const line = el('div', 'plineup'); st.enemies.forEach((e) => line.appendChild(UI.sp(e.id, e.giant ? 0.62 : e.pet ? 0.62 : 0.56, { flip: true, anim: false, variant: e.pet ? 'mirror' : '' })));
    const stub = el('div', 'pstub'); add(stub, el('b', '', 'Admit one'), won ? add(el('span', 'paid'), UI.icon('ic_check', 0.8), 'Paid today') : UI.purse('ic_note', '+' + H.DAILY.notes, 'Notes for tonight\'s win'));
    add(poster, el('i', 'ptape l'), el('i', 'ptape r'), txt('pkick', 'Tonight · ' + dateLine()), txt('pvenue', st.venue), txt('pregion', R.n),
      add(el('div', 'ptw'), UI.icon(A.twistIcon(st.twist), 2.4), add(el('div', 'grow'), txt('label', 'House rule'), txt('ptwn', T.n))), txt('prule', T.d),
      add(el('div', 'pline'), txt('label', 'On stage · Lv ' + st.level), line), stub);
    if (won) poster.appendChild(UI.stamp('Won tonight', 'green still'));
    scene.appendChild(poster); root.appendChild(scene);
    const foot = el('div', 'gofoot'), band = H.dailyBand(S, st.twist);
    const strip = el('button', 'tstrip'); strip.type = 'button'; strip.setAttribute('aria-label', 'Change your band');
    add(strip, faces(band), add(el('div', 'grow'), el('b', '', st.twist === 'duet' ? 'Your first two pets' : 'Your band'), el('div', 'small dim', won ? `New gig in ${countdown(H.msToTomorrow())}` : 'Retry as often as you like')), el('span', 'chip', 'Band'));
    strip.addEventListener('click', () => { Au.sfx('tap'); UI.go('team', {}); });
    const play = key(won ? 'Play it again' : 'Play the gig', () => UI.go('battle', { daily: 1 }), (won ? 'blue' : 'go') + ' wide big'); play.disabled = !band.length;
    add(foot, strip, play); root.appendChild(foot);
  };

  UI.dailyResult = (out) => {
    const S = UI.S, T = H.TWISTS[out.twist], kids = [], loot = box('loot');
    if (out.notes) loot.appendChild(UI.purse('ic_note', '+' + out.notes)); if (out.xp) loot.appendChild(UI.purse('ic_xp', '+' + out.xp));
    const ticket = add(el('div', 'ticket' + (out.win ? '' : ' lost')), UI.icon(A.twistIcon(out.twist), 2), add(el('div', 'grow'), txt('label', out.venue), el('b', '', T.n)));
    if (out.win) {
      ticket.appendChild(UI.stamp(out.first ? 'Encore!' : 'Again!')); UI.confetti(out.first ? 46 : 20);
      kids.push(txt('disp big center', out.first ? 'Gig won!' : 'Another great show!'), ticket, loot);
      kids.push(txt('small dim center', out.first ? `New gig in ${countdown(H.msToTomorrow())}` : 'Paid already today'));
    } else {
      kids.push(txt('disp big center', out.why === 'time' ? 'Lights out!' : 'Not this time'), ticket, txt('center dim', out.why === 'time' ? 'The lights went out before the Din did.' : 'Retry as often as you like.'), loot);
    }
    if (out.ups) kids.push(txt('center good', `<b>Level up!</b>`), UI.unlockNote(out.ups));
    kids.push(UI.key(out.win ? 'Home' : 'Try again', () => (out.win ? UI.go('home') : UI.go('battle', { daily: 1 })), 'go wide big'), UI.key(out.win ? 'Back to the poster' : 'Change the band', () => (out.win ? UI.go('daily') : UI.go('team', {})), 'wide soft'));
    if (out.win) Au.sfx('coin');
    UI.modal(...kids);
  };

  /* ================= Solo: pick a soloist, or carry on the tour ================= */
  UI.screens.solo = (root, pr) => {
    const S = UI.S; if (!H.soloOpen(S)) return UI.go('home');
    if (H.refreshSolo(S)) UI.save(); S.flags.seenSolo = 1; UI.music('camp', 'hall');
    const P = S.solo, run = S.soloRun;
    root.appendChild(UI.topbar('Solo', () => UI.go('gigs'), UI.wallet()));
    const hh = Math.max(84, Math.min(118, UI.Hh - 260)), hero = el('div', 'solohero'); hero.style.height = `calc(var(--u) * ${hh})`;
    add(hero, UI.bgEl('spot', UI.W, hh, 0.62), el('div', 'cone l'), el('div', 'cone r'), add(el('div', 'stitle'), el('div', 'logo small', 'Solo Tour'), txt('tag', 'One pet · five gigs · one boss')));
    root.appendChild(hero);
    const body = el('div', 'scroll'), pad = el('div', 'pad'), foot = el('div', 'gofoot');
    // what today still pays: the first five gig wins and the first boss win
    const steps = [0, 1, 2, 3, 4].map((i) => ({ icon: 'ic_note', n: H.SOLO.gigNotes, got: i < P.gigs, label: 'Gig ' + (i + 1) })).concat([{ icon: 'ic_boss', n: H.SOLO.bossNotes + ' + gear', got: !!P.boss, wide: true, label: 'Boss' }]);
    const pay = add(el('button', 'payline'), txt('label', 'Today'), UI.track(steps)); pay.type = 'button';
    pay.addEventListener('click', () => { Au.sfx('tap'); UI.toast(H.soloPaidLeft(S) ? `The first 5 gig wins and the first boss win each day pay. New pay in ${countdown(H.msToTomorrow())}.` : 'All paid today. Tours still count for fun and experience.'); });
    pad.appendChild(pay);
    if (run) {
      const pet = H.petById(S, run.pet), card = el('div', 'tourcard'); if (!pet) { H.endSolo(S); return UI.go('solo'); }
      add(card, UI.sp(pet.form, 1.1), add(el('div', 'grow col'), txt('label', 'On tour · ' + H.REGIONS[run.region].n), el('b', 'disp', H.FORMS[pet.form].n), add(el('div', 'row'), UI.meter(run.hp), txt('small', Math.round(run.hp * 100) + '%')), txt('small dim', `${run.gigs} of 5 gigs won · ${plural(run.boons.length, 'boon')}`)));
      pad.appendChild(card); body.appendChild(pad); root.appendChild(body);
      add(foot, key('Back on the road', () => UI.go(run.pending && run.pending.type !== 'battle' ? 'solostop' : 'solomap'), 'go wide big'), key('Give up the tour', () => UI.confirm('Give up the tour?', 'Notes stay yours.', 'Give up', () => { H.endSolo(S); UI.save(); UI.go('solo'); }), 'wide soft'));
      root.appendChild(foot); return;
    }
    // choose who goes: every pet you own, the band first
    let pick = pr.pet && H.petById(S, pr.pet) ? pr.pet : (H.teamPets(S).filter(Boolean)[0] || S.pets[0] || {}).id;
    const info = el('div', 'soloinfo'), grid = el('div', 'cards'), start = key('', () => { if (!pick) return; H.startSolo(S, pick, rnd); UI.save(); UI.go('solomap', { fresh: 1 }); }, 'go wide big');
    const sel = () => {
      grid.querySelectorAll('.card').forEach((c) => c.classList.toggle('on', +c.dataset.id === pick));
      const p = H.petById(S, pick); info.innerHTML = ''; if (!p) return; const kit = H.kitOf(p.form);
      add(info, box('row', UI.famChip(H.petFamily(p)), UI.roleChip(kit.role), UI.stars(p.rank)), txt('small dim', 'The road scales to your soloist.'));
      start.textContent = 'Start the tour with ' + H.FORMS[p.form].n;
    };
    S.pets.slice().sort((a, b) => (S.team.includes(b.id) ? 1 : 0) - (S.team.includes(a.id) ? 1 : 0) || H.petTier(b) - H.petTier(a)).forEach((p) => {
      const c = el('div', 'card ' + H.petFamily(p)); c.dataset.id = p.id; const m = el('button', 'cmain'); m.type = 'button'; m.setAttribute('aria-label', H.FORMS[p.form].n);
      add(m, UI.sp(p.form, 1, { anim: false }), add(el('div', 'cnm'), UI.icon('fam_' + H.petFamily(p), 0.8), el('span', '', H.FORMS[p.form].n))); m.addEventListener('click', () => { pick = p.id; Au.sfx('noise', H.petSpecies(p)); sel(); }); c.appendChild(m); grid.appendChild(c);
    });
    add(pad, txt('label', 'Pick your soloist'), info, grid); body.appendChild(pad); root.appendChild(body);
    foot.appendChild(start); root.appendChild(foot); sel();
  };

  // the tour so far: five gig pips and the boss; `fresh` marks the one just won
  const tourTrack = (won, fresh) => { const t = el('div', 'tourtrack'); for (let i = 0; i < 5; i++) t.appendChild(add(el('span', 'tp' + (i < won ? ' got' : '') + (i === fresh ? ' fresh' : '')), i < won ? UI.icon('ic_check', 0.6) : el('b', '', String(i + 1)))); t.appendChild(add(el('span', 'tp boss'), UI.icon('ic_boss', 0.62))); return t; };
  /* ----- the run's header: the soloist, its HP, its boons, how far along it is ----- */
  const hud = (S, onBoons) => {
    const run = S.soloRun, pet = H.petById(S, run.pet), max = H.soloMaxHp(S), hp = Math.max(1, Math.round(max * run.hp)), h = el('div', 'shud');
    const face = add(el('div', 'sface ' + H.petFamily(pet)), UI.sp(pet.form, 0.62, { anim: false })), hpm = UI.meter(run.hp); hpm.classList.add('hpm'); if (run.hp < 0.3) hpm.classList.add('low');
    const bn = el('button', 'sboons'); bn.type = 'button'; bn.setAttribute('aria-label', plural(run.boons.length, 'boon') + '. Show them');
    if (!run.boons.length) bn.appendChild(txt('small dim', 'No boons yet')); else run.boons.slice(-6).forEach((id) => bn.appendChild(add(el('span', 'bchip r-' + H.BOONS[id].r), UI.icon(A.boonIcon(id), 0.62))));
    if (run.boons.length > 6) bn.appendChild(el('span', 'small', '+' + (run.boons.length - 6))); if (H.activeCombos(run.boons).length) bn.appendChild(el('span', 'combo', 'Combo'));
    bn.addEventListener('click', () => { Au.sfx('tap'); (onBoons || boonSheet)(S); });
    add(h, face, add(el('div', 'grow col'), box('row between', el('b', '', H.FORMS[pet.form].n + ' · Lv ' + S.level), txt('chip gigc', run.gigs >= 5 ? 'Boss next' : `Gig ${run.gigs + 1} of 5`)), add(el('div', 'row hprow'), UI.icon('st_regen', 0.7), hpm, txt('small hpn', `${UI.fmt(hp)} / ${UI.fmt(max)}`)), bn));
    return h;
  };
  const boonCard = (id, have, tag) => {
    const b = H.BOONS[id], combos = H.combosOf(id, have.filter((x) => x !== id)), c = el(tag || 'div', 'boon r-' + b.r); if (tag === 'button') c.type = 'button';
    add(c, add(el('div', 'bart'), UI.icon(A.boonIcon(id), 1.9)), add(el('div', 'grow col'), box('row between', el('b', 'bname', b.n), txt('rar', b.r === 'r' ? 'Rare' : 'Common')), txt('small', b.d), ...combos.map((x) => add(el('div', 'bcombo'), UI.icon(A.boonIcon(x.with), 0.55), el('span', '', `Combo with ${H.BOONS[x.with].n}: ${x.d}`)))));
    return c;
  };
  const boonSheet = (S) => {
    const run = S.soloRun, kids = [txt('disp', 'Boons on this tour')], cs = H.activeCombos(run.boons);
    if (cs.length) kids.push(txt('label', 'Combos'), ...cs.map((c) => add(el('div', 'bcombo big'), UI.icon(A.boonIcon(c[0]), 0.7), UI.icon(A.boonIcon(c[1]), 0.7), el('span', '', `<b>${H.BOONS[c[0]].n} + ${H.BOONS[c[1]].n}</b>: ${c[2]}`))));
    if (!run.boons.length) kids.push(txt('dim center', 'Win gigs and jam to collect boons. They last the tour.'));
    const cnt = {}; run.boons.forEach((id) => (cnt[id] = (cnt[id] || 0) + 1));
    Object.keys(cnt).forEach((id) => { const c = boonCard(id, run.boons); if (cnt[id] > 1) c.querySelector('.bname').textContent += ' ×' + cnt[id]; kids.push(c); });
    if (run.extra.vol || run.extra.hp) kids.push(txt('small dim center', 'From the road: ' + [run.extra.vol ? `${run.extra.vol > 0 ? '+' : ''}${Math.round(run.extra.vol * 100)}% Power` : '', run.extra.hp ? `${run.extra.hp > 0 ? '+' : ''}${Math.round(run.extra.hp * 100)}% HP` : ''].filter(Boolean).join(', ')));
    kids.push(key('Close', UI.closeModal, 'wide')); UI.modal(...kids);
  };
  UI.soloBoonSheet = boonSheet;

  /* ================= the road: a map of the region, the soloist walking it stop by stop ================= */
  const NODE = { gig: 'Gig', loud: 'Loud gig', rest: 'Campfire', jam: 'Jam session', mystery: 'Mystery', boss: 'Boss', start: 'Start' };
  const GAP = 44, TOP = 42, BOT = 34;
  UI.screens.solomap = (root, pr) => {
    const S = UI.S, run = S.soloRun; if (!run) return UI.go('solo');
    if (run.pending) return run.pending.type === 'battle' ? UI.go('battle', { solo: 1 }) : UI.go('solostop');
    const pet = H.petById(S, run.pet); if (!pet) { H.endSolo(S); return UI.go('solo'); }
    UI.music('camp', run.region);
    const bar = el('div', 'bar'); add(bar, UI.key('‹ Gigs', () => { Au.sfx('back'); UI.go('gigs'); }, 'soft sm'), el('div', 'disp', H.REGIONS[run.region].n + ' tour'), UI.gearKey(() => UI.settings(key('Give up the tour', () => UI.confirm('Give up the tour?', 'Notes stay yours.', 'Give up', () => { H.endSolo(S); UI.save(); UI.go('solo'); }), 'wide soft'))));
    root.appendChild(bar); root.appendChild(hud(S));
    const W = UI.W, rows = H.SOLO.rows.length, MH = TOP + (rows - 1) * GAP + GAP + BOT, yOf = (r) => MH - BOT - GAP - r * GAP, xOf = (n) => 14 + n.x * (W - 28);
    const pos = (n) => (n ? { x: xOf(n), y: yOf(n.r) + (n.dy || 0) } : { x: W / 2, y: MH - BOT + 4 });
    const scroller = el('div', 'smap'), inner = el('div', 'smapin'); inner.style.height = `calc(var(--u) * ${MH})`;
    // the ground, then the roads between stops: travelled ones in gold, the rest as sandy tracks
    const gnd = A.mapGround(run.region, W, MH, run.seed % 997, [null].concat(run.map).map((n) => { const p = pos(n); return [p.x, p.y]; })), cv = A.make(gnd.width, gnd.height), x = cv.getContext('2d'); x.drawImage(gnd, 0, 0); x.scale(A.k, A.k); cv.className = 'bgc'; cv.style.width = `calc(var(--u) * ${W})`; cv.style.height = `calc(var(--u) * ${MH})`;
    const path = [null].concat(run.done.map((id) => run.map[id])), walked = new Set(); for (let i = 1; i < path.length; i++) walked.add((path[i - 1] ? path[i - 1].id : 's') + '>' + path[i].id);
    const bend = (a, b) => { const p = pos(a), q = pos(b); return { p, q, m: { x: (p.x + q.x) / 2 + (p.y % 7 - 3), y: (p.y + q.y) / 2 } }; };
    const along = (c, t) => ({ x: (1 - t) * (1 - t) * c.p.x + 2 * (1 - t) * t * c.m.x + t * t * c.q.x, y: (1 - t) * (1 - t) * c.p.y + 2 * (1 - t) * t * c.m.y + t * t * c.q.y });
    const road = (a, b, on) => { const { p, q, m } = bend(a, b), mx = m.x, my = m.y; const d = new Path2D(`M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}`); x.lineCap = 'round'; x.strokeStyle = A.INK; x.lineWidth = on ? 6.4 : 5; x.stroke(d); x.strokeStyle = on ? '#ffc928' : '#efe2c2'; x.lineWidth = on ? 4 : 3; x.stroke(d); if (!on) { x.setLineDash([1.5, 4]); x.strokeStyle = 'rgba(138,90,58,0.45)'; x.lineWidth = 1.2; x.stroke(d); x.setLineDash([]); } };
    const firsts = run.map.filter((n) => n.r === 0);
    for (const n of run.map) for (const id of n.next) if (!walked.has(n.id + '>' + id)) road(n, run.map[id], false);
    for (const n of firsts) if (!walked.has('s>' + n.id)) road(null, n, false);
    for (let i = 1; i < path.length; i++) road(path[i - 1], path[i], true);
    inner.appendChild(cv);
    const trail = A.make(gnd.width, gnd.height), tx = trail.getContext('2d'); tx.scale(A.k, A.k); trail.className = 'bgc trail'; trail.style.width = cv.style.width; trail.style.height = cv.style.height; inner.appendChild(trail);
    for (let i = 0; i < 3; i++) { const c = el('div', 'cloudsh'); c.style.top = `calc(var(--u) * ${40 + i * (MH / 3)})`; c.style.animationDelay = -i * 11 + 's'; c.style.animationDuration = 34 + i * 6 + 's'; inner.appendChild(c); }
    // the region's name on a ribbon at the top, by the boss
    inner.appendChild(add(el('div', 'sribbon'), el('span', '', H.DIN[H.REGIONS[run.region].boss].n + '\'s stage')));
    const reach = new Set(H.soloReach(run).map((n) => n.id)), here = run.at == null ? null : run.map[run.at];
    const stop = (n, type) => {
      const p = pos(n), big = type === 'boss', sz = big ? 34 : type === 'start' ? 20 : 25, can = n && reach.has(n.id), done = n && run.done.includes(n.id);
      const b = el('button', 'snode t-' + type + (can ? ' can' : '') + (done ? ' done' : '') + (n === here ? ' here' : '')); b.type = 'button'; b.style.cssText = at(p.x - sz / 2, p.y - sz / 2) + `width: calc(var(--u) * ${sz}); height: calc(var(--u) * ${sz});`;
      b.appendChild(big ? UI.sp(H.REGIONS[run.region].boss, 0.5, { flip: true, anim: true }) : UI.icon(type === 'start' ? 'nd_start' : A.nodeIcon(type), type === 'start' ? 1.1 : 1.45));
      if (done && n !== here) b.appendChild(add(el('span', 'ndone'), UI.icon('ic_check', 0.5)));
      if (can) { b.classList.add('appear'); b.style.animationDelay = (intro ? 2.3 : 0.15) + [...reach].indexOf(n.id) * 0.1 + 's, 0s'; }
      b.setAttribute('aria-label', NODE[type] + (can ? ', you can go here' : done ? ', visited' : ''));
      if (can) { const lb = add(el('div', 'slabel'), NODE[type]); lb.style.cssText = at(p.x - 24, p.y + sz / 2 + 1); inner.appendChild(lb); }
      b.addEventListener('click', () => { if (!n || walking) return; if (can) preview(n); else if (!done) { Au.sfx('tap'); UI.toast('Not on your road. Glowing stops are next.'); } });
      inner.appendChild(b); return b;
    };
    const intro = !!pr.fresh && !window.__hsSpeed;
    stop(null, 'start'); for (const n of run.map) stop(n, n.type);
    // the soloist stands where it got to
    const tok = el('div', 'stoken'), tp = pos(here); tok.appendChild(UI.sp(pet.form, 0.42, { anim: false })); tok.style.cssText = at(tp.x - 10, tp.y - 22); inner.appendChild(tok);
    scroller.appendChild(inner); root.appendChild(scroller);
    const foot = el('div', 'shint'); add(foot, el('span', '', run.at == null ? 'Your tour starts here. Pick a road.' : 'Pick the next stop. Tap one to see it.'), key('?', legend, 'soft sm')); root.appendChild(foot);
    const target = () => Math.max(0, tp.y * UI.u - scroller.clientHeight * 0.68);
    // a new tour: the view starts at the boss and sweeps down the road to the start, under a title card; then the soloist drops in
    if (intro) {
      const card = add(el('div', 'tourcard2'), txt('label', 'Solo tour'), el('b', '', H.REGIONS[run.region].n), txt('small', `5 gigs, then ${H.DIN[H.REGIONS[run.region].boss].n}`));
      root.appendChild(card); tok.style.opacity = '0'; inner.classList.add('busy');
      let skip = false, t0 = 0; const end = () => { skip = true; scroller.scrollTop = target(); card.classList.add('out'); setTimeout(() => card.remove(), 500); tok.style.opacity = ''; tok.classList.add('dropin'); Au.sfx('stamp'); inner.classList.remove('busy'); };
      root.addEventListener('pointerdown', () => { if (!skip) end(); }, { once: true, capture: true });
      requestAnimationFrame(() => { scroller.scrollTop = 0; Au.sfx('cue'); const from = 0, to = target(); const step = (now) => { if (skip) return; if (!t0) t0 = now; const k = Math.min(1, (now - t0 - 700) / 1700); if (k > 0) scroller.scrollTop = from + (to - from) * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2); if (k >= 1) end(); else requestAnimationFrame(step); }; requestAnimationFrame(step); });
    } else requestAnimationFrame(() => { scroller.scrollTop = target(); });
    // a look at a stop before going: who plays there, what it gives
    function preview(n) {
      Au.sfx('tap'); const kids = [], bat = n.type === 'gig' || n.type === 'loud' || n.type === 'boss';
      kids.push(box('row', add(el('div', 'nbadge t-' + n.type), n.type === 'boss' ? UI.sp(H.REGIONS[run.region].boss, 0.6, { flip: true, anim: false }) : UI.icon(A.nodeIcon(n.type), 2)), add(el('div', 'grow col'), txt('disp', n.type === 'boss' ? H.DIN[H.REGIONS[run.region].boss].n : NODE[n.type]), txt('small dim', {
        gig: 'A small stage.', loud: 'A rowdy crowd and tougher Din.', boss: 'The last stop of the tour.', rest: 'Sleep, or practise.', jam: 'Play along for a boon.', mystery: 'Something is going on here.' }[n.type]))));
      if (bat) {
        const stg = H.soloStage(S, n), line = el('div', 'plineup'); stg.enemies.forEach((e) => line.appendChild(UI.sp(e.id, H.DIN[e.id].boss ? 0.62 : 0.52, { flip: true, anim: false })));
        const P = S.solo, notes = n.type === 'boss' ? (P.boss ? 0 : H.SOLO.bossNotes) : P.gigs < 5 ? H.SOLO.gigNotes : 0, prize = n.type === 'boss' ? null : add(el('span', 'chip boonchip' + (n.type === 'loud' ? ' rare' : '')), UI.icon('bn_amp', 0.55), n.type === 'loud' ? 'Rare boon' : 'Boon');
        kids.push(add(el('div', 'plinebox'), txt('label', 'On stage · Lv ' + stg.level), line), add(el('div', 'row winrow'), txt('label', 'Win'), prize, notes ? UI.purse('ic_note', '+' + notes, 'Notes') : null, n.type === 'boss' && !P.boss ? UI.purse('ic_bag', '+1', 'Equipment') : null));
      }
      kids.push(key(bat ? (n.type === 'boss' ? 'Face the boss' : 'Play this gig') : 'Go there', () => { UI.closeModal(); walk(n); }, (n.type === 'boss' ? 'coral' : 'go') + ' wide big'), key('Not yet', UI.closeModal, 'wide soft'));
      UI.modal(...kids);
    }
    let walking = false;
    function walk(n) {
      if (walking) return; walking = true; inner.classList.add('busy');
      const c = bend(here, n), dur = window.__hsSpeed ? 40 : 900, s0 = scroller.scrollTop; let t0 = 0, lastPuff = 0, last = c.p; tok.classList.add('walk'); tok.style.transition = 'none';
      const arrive = () => { if (UI.cur.name !== 'solomap') return; Au.sfx('tap', 5); const got = H.soloEnter(S, n.id, rnd); UI.save(); if (!got) return UI.go('solomap'); setTimeout(() => UI.go(got.type === 'battle' ? 'battle' : 'solostop', { solo: 1 }), window.__hsSpeed ? 0 : 220); };
      const step = (now) => {
        if (UI.cur.name !== 'solomap') return; if (!t0) t0 = now; const k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, q = along(c, e);
        tok.style.left = `calc(var(--u) * ${q.x - 10})`; tok.style.top = `calc(var(--u) * ${q.y - 22})`;
        tx.lineCap = 'round'; tx.strokeStyle = A.INK; tx.lineWidth = 6.4; tx.beginPath(); tx.moveTo(last.x, last.y); tx.lineTo(q.x, q.y); tx.stroke(); tx.strokeStyle = '#ffc928'; tx.lineWidth = 4; tx.stroke(); last = q;
        if (now - lastPuff > 110) { lastPuff = now; const pf = el('i', 'puff'); pf.style.cssText = at(q.x - 3, q.y - 2); inner.appendChild(pf); setTimeout(() => pf.remove(), 600); Au.sfx('tap', 1); }
        scroller.scrollTop = s0 + (Math.max(0, q.y * UI.u - scroller.clientHeight * 0.6) - s0) * e;
        if (k < 1) requestAnimationFrame(step); else { tok.classList.remove('walk'); tok.classList.add('land'); arrive(); }
      };
      if (window.__hsSpeed) { arrive(); return; } requestAnimationFrame(step);
    }
    function legend() { UI.modal(txt('disp', 'The road'), ...['gig', 'loud', 'rest', 'jam', 'mystery', 'boss'].map((t) => box('row', add(el('div', 'nbadge sm t-' + t), UI.icon(A.nodeIcon(t), 1.2)), txt('grow small', `<b>${NODE[t]}.</b> <span class="dim">${{ gig: 'Two Din. Win for a boon.', loud: 'Tougher Din. Win for a rare boon.', rest: 'Heal 40%, or practise for +10% Power.', jam: 'Pick a boon.', mystery: 'A choice, good or risky.', boss: 'The end of the tour.' }[t]}</span>`))),
      txt('small dim', 'HP carries on from gig to gig. The crowd gets restless if a gig drags on: every hit lands harder.'), key('Got it', UI.closeModal, 'wide go')); }
  };

  /* ================= a stop on the road: boons, the campfire, a mystery ================= */
  UI.screens.solostop = (root) => {
    const S = UI.S, run = S.soloRun; if (!run) return UI.go('solo'); const p = run.pending; if (!p) return UI.go('solomap'); if (p.type === 'battle') return UI.go('battle', { solo: 1 });
    const pet = H.petById(S, run.pet); UI.music('camp', run.region);
    root.appendChild(hud(S));
    const sh = Math.max(92, Math.min(130, UI.Hh - 290)), scene = el('div', 'sscene'); scene.style.height = `calc(var(--u) * ${sh})`; scene.appendChild(UI.bgEl(run.region, UI.W, sh, 0.55, 'sing'));
    const body = el('div', 'scroll'), pad = el('div', 'pad'), foot = el('div', 'gofoot');
    const done = () => { UI.save(); UI.go(S.soloRun && S.soloRun.pending ? 'solostop' : 'solomap'); };
    if (p.type === 'boon') {
      const title = p.src === 'jam' ? 'Jam session' : p.src === 'loud' ? 'The crowd goes wild' : p.src === 'c' ? 'Dig through the crate' : 'Gig won!';
      add(scene, el('div', 'rays'), add(el('div', 'sart'), UI.sp(pet.form, 1.2), p.src === 'jam' ? UI.icon('nd_jam', 2.2) : UI.icon('ic_note', 2)), add(el('div', 'sbanner'), el('b', '', title), el('span', '', p.src === 'loud' || p.src === 'r' ? 'Pick a rare boon' : 'Pick a boon')));
      let chosen = null, chosenEl = null; const take = key('Pick one', () => { if (!chosen || take.dataset.busy) return; take.dataset.busy = 1; H.soloPick(S, chosen); Au.sfx('evolve'); UI.save();
        // the card glows and flies up into the boons on the header
        chosenEl.classList.add('taken'); pad.querySelectorAll('.boon').forEach((x) => { if (x !== chosenEl) x.classList.add('gone'); }); setTimeout(done, window.__hsSpeed ? 0 : 650); }, 'go wide big'); take.disabled = true;
      p.opts.forEach((id, i) => { const c = boonCard(id, run.boons, 'button'); c.classList.add('dealt'); c.style.animationDelay = 0.12 + i * 0.12 + 's'; c.addEventListener('click', () => { chosen = id; chosenEl = c; Au.sfx('good'); pad.querySelectorAll('.boon').forEach((x) => x.classList.toggle('on', x === c)); take.disabled = false; take.textContent = 'Take ' + H.BOONS[id].n; }); pad.appendChild(c); });
      add(foot, take, key('Skip', () => UI.confirm('Skip this boon?', 'This stop gives no other.', 'Skip', () => { H.soloPick(S, null); done(); }), 'wide soft sm'));
    } else if (p.type === 'rest') {
      const embers = el('div', 'embers'); for (let i = 0; i < 7; i++) { const e = el('i'); e.style.left = 44 + Math.random() * 12 + '%'; e.style.animationDelay = -i * 0.4 + 's'; embers.appendChild(e); }
      const zzz = el('div', 'zzz'); ['z', 'z', 'Z'].forEach((t, i) => { const z = el('i', '', t); z.style.animationDelay = i * 0.7 + 's'; zzz.appendChild(z); });
      const petEl = UI.sp(pet.form, 1.1); add(scene, el('div', 'night'), embers, add(el('div', 'sart camp'), add(el('div', 'restpet'), petEl, zzz), add(el('div', 'fire'), UI.icon('nd_rest', 2.4))), add(el('div', 'sbanner'), el('b', '', 'Campfire'), el('span', '', 'A quiet night on the road')));
      const after = (cls, text) => { scene.classList.add(cls); scene.appendChild(add(el('div', 'restfx'), el('b', '', text))); pad.querySelectorAll('.choice').forEach((b) => (b.disabled = true)); setTimeout(done, window.__hsSpeed ? 0 : 900); };
      const max = H.soloMaxHp(S), now = Math.round(max * run.hp), heal = Math.min(max, Math.round(max * (run.hp + H.SOLO.rest)));
      const opt = (icon, name, d, fn) => { const b = el('button', 'choice'); b.type = 'button'; add(b, UI.icon(icon, 1.6), add(el('div', 'grow col'), el('b', '', name), txt('small', d))); b.addEventListener('click', fn); return b; };
      add(pad, opt('st_regen', 'Sleep', `HP ${UI.fmt(now)} → ${UI.fmt(heal)}`, () => { H.soloRest(S, 'nap'); UI.save(); Au.sfx('heal'); after('slept', '+' + UI.fmt(heal - now) + ' HP'); }),
        opt('st_pup', 'Practise', `+${Math.round(H.SOLO.practise * 100)}% Power for this tour`, () => { H.soloRest(S, 'practise'); UI.save(); Au.sfx('level'); after('practised', `+${Math.round(H.SOLO.practise * 100)}% Power`); }));
    } else if (p.type === 'event') {
      const E = H.EVENTS[p.ev];
      add(scene, add(el('div', 'sart'), add(el('div', 'evart'), UI.icon('ev_' + p.ev, 2.3)), UI.sp(pet.form, 1)), add(el('div', 'sbanner'), el('b', '', E.n), el('span', '', 'Mystery')));
      pad.appendChild(txt('center', E.d));
      E.opts.forEach((o, i) => { const b = el('button', 'choice'); b.type = 'button'; add(b, add(el('div', 'grow col'), el('b', '', o.n), txt('small', o.d))); b.addEventListener('click', () => {
        const got = H.soloEvent(S, i, rnd); Au.sfx('good'); UI.save();
        if (got && got.boon) { UI.modal(txt('label center', 'You got'), boonCard(got.boon, S.soloRun.boons), key('Onwards', () => { UI.closeModal(); done(); }, 'go wide big')); return; }
        UI.toast(o.n + ': ' + o.d.replace(/\.$/, '') + '.'); done(); }); pad.appendChild(b); });
    }
    root.appendChild(scene); body.appendChild(pad); root.appendChild(body); if (foot.children.length) root.appendChild(foot);
  };

  /* ================= after a Solo gig ================= */
  UI.soloResult = (out) => {
    const S = UI.S;
    if (!out.win || out.done) return UI.go('soloend', { out });
    const kids = [], loot = box('loot'); if (out.notes) loot.appendChild(UI.purse('ic_note', '+' + out.notes)); if (out.xp) loot.appendChild(UI.purse('ic_xp', '+' + out.xp));
    kids.push(add(el('div', 'wonhead'), txt('disp big center', out.loud ? 'Loud gig won!' : 'Gig won!'), UI.stamp(out.loud ? 'Rowdy!' : 'Encore!')), tourTrack(out.gig, out.gig - 1), txt('center dim small', `HP ${Math.round(S.soloRun.hp * 100)}%`), loot);
    UI.confetti(out.loud ? 44 : 30); Au.sfx('coin');
    if (out.ups) kids.push(txt('center good', '<b>Level up!</b>'), UI.unlockNote(out.ups));
    kids.push(UI.key(out.loud ? 'Pick a rare boon' : 'Pick a boon', () => UI.go('solostop'), 'gold wide big'));
    UI.modal(...kids);
  };
  UI.screens.soloend = (root, pr) => {
    const S = UI.S, out = pr.out || {}, pet = H.petById(S, out.pet) || H.teamPets(S).filter(Boolean)[0], won = !!out.done; UI.music('camp', won ? 'hall' : out.region || 'fen'); Au.sfx(won ? 'win' : 'lose');
    const w = el('div', 'title soloend' + (won ? ' won' : ''));
    add(w, UI.bgEl(won ? 'spot' : out.region || 'fen', UI.W, UI.Hh, 0.5, won ? null : 'hush'), won ? el('div', 'rays') : null);
    const it = out.item && H.itemById(S, out.item.id), boons = el('div', 'boonrow'); (out.boons || []).forEach((id) => boons.appendChild(add(el('span', 'bchip r-' + H.BOONS[id].r), UI.icon(A.boonIcon(id), 0.8))));
    const loot = box('loot'), tot = out.total != null ? out.total : out.notes; if (tot) loot.appendChild(UI.purse('ic_note', '+' + tot, 'Notes this tour')); if (out.xp) loot.appendChild(UI.purse('ic_xp', '+' + out.xp));
    if (won) UI.confetti(70, true);
    const hero = pet ? UI.sp(pet.form, won ? 2 : 1.5, { anim: false }) : null; if (hero) hero.classList.add(won ? 'cheer' : 'slump');
    add(w, add(el('div', 'logo small dropin'), won ? 'Tour complete!' : 'Tour over'), hero,
      add(el('div', 'panel col center endp risein'), txt('center', won ? `<b>${pet ? H.FORMS[pet.form].n : 'Your soloist'}</b> beat all five gigs and the boss.` : `<b>${out.reached || 0} of 5</b> gigs won.`), (out.boons || []).length ? boons : null, loot, it ? txt('label center', 'And the boss dropped') : null, it ? UI.itemRow(it) : null, out.ups ? txt('center good', '<b>Level up!</b>') : null),
      key(won ? 'Home' : 'Try another tour', () => (won ? UI.go('home') : UI.go('solo', { pet: out.pet })), 'go wide big'), key(won ? 'Another tour' : 'Home', () => (won ? UI.go('solo', { pet: out.pet }) : UI.go('home')), 'wide soft'));
    root.appendChild(w);
  };
})(window.H);
