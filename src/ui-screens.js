/* Hushsong — screens outside of battle: title, intro, story, home, adventure, team, pets and ensembles, shells, pet page, bag, rehearsal, gold records. */
(function (H) {
  'use strict';
  const tr = (s, v) => H.T(s, v);
  const A = H.Art, Au = H.Audio, UI = H.UI, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key;
  const rnd = Math.random;
  const tierName = [H.T.k('Not evolved'), H.T.k('Evolved once'), H.T.k('Fully evolved')];
  const roleOf = (f) => H.kitOf(f).role || 'stray';
  const regionOf = (n) => H.stage(n).region;
    const baseName = (pet) => H.FORMS[H.petSpecies(pet)].n;   // echoes are always named after the pet's first form
  const homeSet = (S) => (S.homeBg && H.ownedSets(S).includes(S.homeBg) ? S.homeBg : regionOf(S.stage));
  // where the band stands now: hushed until that region's boss is beaten
  const hereMode = (S) => (H.floorHushed(S, S.stage) ? 'hush' : 'sing');
  // drifting notes over a region that sings, grey static over one that is hushed
  const ambience = (mode, n) => { const a = el('div', 'air'); if (mode === 'hush') return a; for (let i = 0; i < (n || 6); i++) { const c = mode === 'hush' ? el('i') : UI.icon('ic_note', 0.8 + (i % 3) * 0.25); c.style.left = 6 + i * (88 / (n || 6)) + '%'; c.style.animationDelay = -i * 0.9 + 's'; a.appendChild(c); } return a; };

  // Where to go when nothing else is asked for.
  UI.next = () => { const S = UI.S; if (!S.flags.intro) return UI.go('intro'); if (!S.pets.length) return UI.go('shells', { first: true }); UI.go('home'); };
  // Level, progress to the next level, notes, menu. Shared by the main screens.
  const statusBar = () => { const S = UI.S, bar = el('div', 'bar'); const lv = txt('disp', tr('Lv {level}', { level: S.level })); lv.style.flex = 'none'; const top = S.level >= H.MAX_LEVEL; add(bar, lv, add(el('div', 'grow xpbox'), UI.meter(top ? 1 : S.xp / H.xpNeed(S.level)), el('div', 'xpcap', top ? tr('Top level') : tr('{xp} / {level} XP', { xp: UI.fmt(S.xp), level: UI.fmt(H.xpNeed(S.level)) }))), ...UI.wallet(), UI.gearKey(() => UI.settings())); return bar; };
  // How much of the world sings again: one region per boss, ten in all.
  const songChip = (S) => add(el('span', 'chip'), UI.icon('ic_note', 0.8), tr('{n} of 10 regions sing', { n: H.songCount(S) }));
  // One pet as a card. Used in the collection and when choosing who stands where.
  const petCard = (S, p, onTap) => {
    const on = S.team.includes(p.id), fam = H.petFamily(p), c = el('div', 'card ' + fam + (on ? ' on' : ''));
    const main = el('button', 'cmain'); main.type = 'button'; main.setAttribute('aria-label', (on ? tr('{pet}, in band', { pet: H.FORMS[p.form].n }) : H.FORMS[p.form].n)); main.addEventListener('click', () => onTap(p));
    add(main, UI.sp(p.form, 1, { anim: false }), add(el('div', 'cnm'), UI.icon('fam_' + fam, 0.8), el('span', '', H.FORMS[p.form].n)));
    if (on) main.appendChild(add(el('div', 'ccheck'), UI.icon('ic_bigcheck')));
    if (H.ownGrow(S, p)) main.appendChild(add(el('span', 'dot'), UI.icon('ic_bang', 1.2)));   // its own echoes pay the next step
    c.appendChild(main); return c;
  };

  const famChips = (fams) => { const r = el('div', 'row wrap'); r.style.gap = 'calc(var(--u) * 1.5)'; fams.forEach((f) => r.appendChild(UI.famChip(f))); return r; };
  const playKey = (e) => { const b = key('', () => { Au.init(); Au.ensemble(e.id); }, 'sm soft playk'); add(b, UI.icon('ic_play', 0.9)); b.setAttribute('aria-label', tr('Play the opening of the {n}', { n: e.n })); return b; };

  /* ================= story: one screen after each boss, up to floor 100 ================= */
  UI.screens.story = (root, pr) => {
    const S = UI.S, R = H.REGIONS[pr.region], st = H.STORY[pr.region], done = H.songCount(S); UI.music('camp', pr.region);
    const fin = pr.n === 100, w = el('div', 'title storyscr heal' + (fin ? ' fin' : ''));
    // the hushed region below, the singing one above it, revealed in a growing circle from the band
    const hush = UI.bgEl(pr.region, UI.W, UI.Hh, 0.52, 'hush'), sing = UI.bgEl(pr.region, UI.W, UI.Hh, 0.52, 'sing'); sing.classList.add('healed');
    add(w, hush, sing);
    // the finale: the curtain rises on the hushed hall, every region's colour sweeps across it, then the hall sings
    const cues = [];
    if (fin) {
      const sweep = el('div', 'sweep'), W10 = UI.W / 10;
      for (let i = 0; i < 10; i++) {
        const s = el('div', 'slice'), c = UI.bgEl(regionOf(i * 10 + 1), UI.W, UI.Hh, 0.52, 'sing'); c.style.left = `calc(var(--u) * ${-i * W10})`;
        s.style.width = `calc(var(--u) * ${W10})`; s.style.left = `calc(var(--u) * ${i * W10})`; s.style.animationDelay = 1.9 + i * 0.28 + 's';
        const nt = UI.icon('ic_note', 1.1); nt.style.animationDelay = 2.3 + i * 0.28 + 's'; add(s, c, nt); sweep.appendChild(s);
      }
      add(w, sweep, add(el('div', 'curtain'), el('div', 'drape'), el('div', 'drape r'), el('div', 'valance')));
      cues.push([350, 'curtain']); for (let i = 0; i < 10; i++) cues.push([2000 + i * 280, 'chime', i]); cues.push([5300, 'evolve'], [6200, 'win']);
    } else cues.push([500, 'cue'], [1300, 'win']);
    add(w, el('div', 'healring'), el('div', 'healring two'));
    const air = el('div', 'air late'); for (let i = 0; i < 9; i++) { const n = UI.icon('ic_note', 1 + (i % 3) * 0.3); n.style.left = 4 + i * 11 + '%'; n.style.animationDelay = -i * 0.45 + 's'; air.appendChild(n); }
    const pips = el('div', 'pips'); for (let i = 0; i < 10; i++) { const c = UI.icon('ic_note', 1.1); if (i >= done) c.classList.add('mute'); else if (i === done - 1) c.classList.add('fresh'); pips.appendChild(c); }
    const par = el('div', 'parade'); const team = H.teamPets(S).filter(Boolean); team.forEach((p, i) => par.appendChild(UI.sp(p.form, team.length === 1 || i === 1 ? 1.5 : 1.2)));
    add(w, air, add(el('div', 'late col center'), txt('chip', tr('{region} · floor {n}', { region: R.n, n: pr.n })), el('div', 'logo small', st[0])), par,
      add(el('div', 'panel col late2'), txt('center', st[1]), pips),
      key(tr('Onwards'), () => (pr.shells || pr.echo ? UI.go('bossreward', pr) : UI.go('home')), 'go wide big late2'));
    root.appendChild(w);
    if (window.__hsSpeed) { w.classList.add('now'); return; }
    // a tap before the words are up skips to the end instead of pressing a button nobody can see yet
    const timers = cues.map(([ms, s, a]) => setTimeout(() => Au.sfx(s, a), ms)), t0 = performance.now(), dur = fin ? 7400 : 3500;
    w.addEventListener('click', (e) => { if (w.classList.contains('skip') || performance.now() - t0 > dur) return; e.stopPropagation(); e.preventDefault(); w.classList.add('skip'); timers.forEach(clearTimeout); }, true);
  };

  /* ================= the boss reward: after a region's story, its shell and an echo (and on floor 100 a Legendary) ================= */
  UI.screens.bossreward = (root, pr) => {
    const S = UI.S, R = H.REGIONS[pr.region]; UI.music('camp', pr.region); Au.sfx('evolve');
    const w = el('div', 'title storyscr'); w.appendChild(UI.bgEl(pr.region, UI.W, UI.Hh, 0.52)); w.appendChild(el('div', 'rays'));
    const card = (art, label) => add(el('div', 'rewcard'), art, txt('disp', label)), leg = pr.legend && H.itemById(S, pr.legend), fin = pr.n === 100;
    if (fin) w.classList.add('finale');
    add(w, txt('chip', tr('{region} · floor {n}', { region: R.n, n: pr.n })), el('div', 'logo small', fin ? tr('Finale reward') : tr('Boss reward')),
      add(el('div', 'rewrow'), pr.shells ? card(UI.sp('shell', fin ? 1.2 : 1.5), tr('+{n} shells', { n: pr.shells })) : null, pr.echo ? card(UI.icon('ic_echo', fin ? 3.8 : 4.6), tr('+{n} echoes', { n: pr.echo })) : null, leg ? card(UI.icon(A.itemIcon(leg), 3.4), tr('Legendary')) : null),
      leg ? UI.itemRow(leg) : null,
      pr.echo ? UI.echoIntro() : null,
      pr.shells ? key(tr('Open the shell'), () => UI.go('shells', {}), 'gold wide big') : null, key(pr.shells ? tr('Later') : tr('Onwards'), () => UI.go('home'), pr.shells ? 'soft wide' : 'go wide big'));
    root.appendChild(w);
  };

  /* ================= title ================= */
  UI.screens.title = (root) => {
    const S = UI.S; UI.music('silent');
    const t = el('div', 'title'); add(t, UI.bgEl('camp', UI.W, UI.Hh, 0.5), ambience('sing', 7));
    const show = S.pets.length ? H.teamPets(S).filter(Boolean).map((p) => p.form) : ['thud', 'twang', 'hum'];
    const par = el('div', 'parade'); show.forEach((f, i) => par.appendChild(UI.sp(f, i === 1 || show.length === 1 ? 1.5 : 1.2)));
    add(t, el('div', 'logo', tr('Hushsong')), txt('tag', tr('Collect musical pets. Bring the music back.')), par);
    t.appendChild(key(S.pets.length ? tr('Continue') : tr('Play'), () => UI.next(), 'go wide big'));
    if (S.pets.length) t.appendChild(key(tr('Menu'), () => UI.settings(), 'wide soft sm'));
    t.appendChild(add(el('div', 'langat'), UI.langKey()));
    root.appendChild(t);
  };

  /* ================= intro: a short film in four scenes. Each waits for a tap, so there is time to read; Skip jumps to the end. ================= */
  UI.screens.intro = (root) => {
    const S = UI.S; let scene = -1, timer = null, done = false, since = 0;
    const w = el('div', 'cine s0'), sing = UI.bgEl('camp', UI.W, UI.Hh, 0.5, 'sing'), hush = UI.bgEl('camp', UI.W, UI.Hh, 0.5, 'grey'); hush.classList.add('hushbg');
    const glow = UI.bgEl('camp', UI.W, UI.Hh, 0.5, 'sing'); glow.classList.add('glowbg');
    const notes = el('div', 'air cnotes'); for (let i = 0; i < 9; i++) { const n = UI.icon('ic_note', 1 + (i % 3) * 0.35); n.style.left = 4 + i * 11 + '%'; n.style.animationDelay = -i * 0.5 + 's'; notes.appendChild(n); }
    const pets = el('div', 'cpets'); ['thud', 'twang', 'hum', 'blare', 'yelp'].forEach((f, i) => { const c = el('div', 'cpet'); c.style.setProperty('--i', i); add(c, UI.sp(f, i === 2 ? 1.35 : 1.1), UI.sp('shell', 0.7, { anim: false })); pets.appendChild(c); });
    const din = el('div', 'cdin'); ['racket', 'gibber', 'whine', 'clank'].forEach((d, i) => { const c = el('div', 'cd'); c.style.setProperty('--i', i); c.appendChild(UI.sp(d, i % 2 ? 1 : 1.2, { flip: true })); din.appendChild(c); });
    const noise = A.make(UI.W, UI.Hh); noise.className = 'cnoise'; noise.style.width = `calc(var(--u) * ${UI.W})`; noise.style.height = `calc(var(--u) * ${UI.Hh})`;
    const hero = el('div', 'chero'); add(hero, el('div', 'cring'), UI.sp('shell', 1.9));
    const cap = el('div', 'ccap'), h = el('div', 'disp big'), p = el('div', ''), go = key(tr('Open my first shell'), () => finish(), 'go wide big'), more = el('div', 'ctap'); add(cap, h, p, more, go);
    const skip = key(tr('Skip'), () => show(3), 'soft sm cskip');
    add(w, sing, hush, glow, notes, pets, din, noise, hero, cap, skip); root.appendChild(w);
    const lines = [
      [H.T.k('Once, everything sang'), H.T.k('Every hill, harbour and hall had its own tune, and musical pets played them all day long.')],
      [H.T.k('Then came the Din'), H.T.k('Noisy creatures that cannot stand a tune. They crashed in and drowned every song in clatter.')],
      [H.T.k('The world went quiet'), H.T.k('The colour drained away. The pets hid in their shells, and no one has heard a song since.')],
      [H.T.k('But one shell still hums'), H.T.k('Open it, gather a band, and win the music back, floor by floor.')],
    ];
    // static for the Din: redrawn while it is on screen
    const nx = noise.getContext('2d'); let raf = 0; const fizz = () => { if (done) return; nx.clearRect(0, 0, noise.width, noise.height); for (let i = 0; i < 90; i++) { nx.fillStyle = i % 3 ? 'rgba(60,52,90,0.55)' : 'rgba(255,255,255,0.7)'; nx.fillRect(Math.random() * noise.width, Math.random() * noise.height, 1 + Math.random() * 7, 1); } raf = requestAnimationFrame(fizz); };
    const show = (i) => {
      if (done || i === scene || i > 3) return; scene = i; clearTimeout(timer); w.className = 'cine s' + i + (window.__hsSpeed ? ' now' : ''); h.textContent = tr(lines[i][0]); p.textContent = tr(lines[i][1]);
      if (i === 0) { UI.music('camp', 'fen'); Au.music.set('camp', [{ family: 'drum', level: 3 }, { family: 'string', level: 3 }, { family: 'breath', level: 3 }, { family: 'voice', level: 2 }], 'camp', 'camp'); }
      if (i === 1) { Au.music.set('silent', [], 'camp'); Au.music.din(1); Au.sfx('boss'); cancelAnimationFrame(raf); fizz(); }
      if (i === 2) { Au.music.din(0.25); }
      if (i === 3) { Au.music.din(0); cancelAnimationFrame(raf); Au.sfx('cue'); }
      // no clock: the next scene waits for a tap; a hint appears once this one has settled
      since = performance.now(); more.textContent = i < 3 ? tr('Tap to continue') : ''; more.classList.remove('on'); void more.offsetWidth; if (i < 3) more.classList.add('on');
    };
    const finish = () => { if (done) return; done = true; clearTimeout(timer); cancelAnimationFrame(raf); Au.music.din(0); S.flags.intro = 1; UI.go('shells', { first: true }); };
    w.addEventListener('click', (e) => { if (e.target.closest('button')) return; Au.init(); if (scene === 3 && e.target.closest('.chero')) return finish(); if (scene < 3 && performance.now() - since > (window.__hsSpeed ? 0 : 450)) show(scene + 1); });
    show(0);
    return { leave: () => { done = true; clearTimeout(timer); cancelAnimationFrame(raf); Au.music.din(0); } };
  };

  /* ================= home: the way into every game mode ================= */
  UI.screens.home = (root) => {
    const S = UI.S, st = H.stage(S.stage), R = H.REGIONS[st.region]; UI.music('camp', st.region);
    root.appendChild(statusBar());
    const hh = Math.max(100, UI.Hh - 144), hero = el('div', 'hero'); const set = homeSet(S), mode = H.SETS[set] ? null : hereMode(S); add(hero, UI.bgEl(set, UI.W, hh + 14, 0.46, mode), ambience(mode === 'hush' ? 'hush' : 'sing', 5));
    add(hero, add(el('div', 'zone'), txt('chip', R.n), txt('disp', tr(st.boss ? 'Boss floor {n}' : 'Floor {n}', { n: S.stage })), songChip(S)));
    const trio = el('button', 'trio'); trio.type = 'button'; trio.setAttribute('aria-label', tr('Your band')); const big = hh > 200 ? 1.75 : hh > 150 ? 1.5 : 1.25;
    const team = H.teamPets(S).filter(Boolean); team.forEach((p, i) => trio.appendChild(UI.sp(p.form, team.length === 1 || i === 1 ? big : big * 0.74)));
    trio.addEventListener('click', () => { Au.sfx('tap'); UI.go('team', {}); }); hero.appendChild(trio);
    const rk = el('button', 'rankb'); rk.type = 'button'; add(rk, UI.icon('ic_trophy', 1.1), el('span', '', tr('Ranks'))); rk.addEventListener('click', () => { Au.sfx('tap'); UI.go('ranks', {}); }); hero.appendChild(rk);
    root.appendChild(hero);
    const modes = el('div', 'modes');
    const adv = UI.coach(el('button', 'mode'), S.flags.coach === 'go', tr('Start your adventure here')); adv.type = 'button'; add(adv, UI.icon('ic_sword', 1.7), add(el('div', 'grow'), txt('disp', tr('Adventure')), txt('sub', tr(st.boss ? 'Boss · Foes Lv {n}' : 'Foes Lv {n}', { n: st.level }))));
    adv.addEventListener('click', () => { Au.sfx('tap', 4); UI.go('adventure', {}); }); modes.appendChild(adv);
    const small = (cls, icon, name, sub, go, pip) => { const b = el('button', 'mode side ' + cls); b.type = 'button'; add(b, add(el('span', 'micon'), UI.icon(icon, 1.25)), add(el('div', 'grow'), txt('disp', name), txt('sub', sub))); if (pip) b.appendChild(el('span', 'pip', String(pip))); b.addEventListener('click', () => { Au.sfx('tap'); if (typeof go === 'function') go(); else UI.go(go, {}); }); return b; };
    // the side modes live on the Gig Board; its button names the most pressing thing there
    const G = gigNews(S), ready = H.recordsReady(S), done = H.RECORDS.filter((r) => S.records[r.id]).length;
    add(modes, box('mrow', small('gigs' + (G.fresh ? ' fresh' : ''), 'ic_ticket', tr('Gigs'), G.line, 'gigs', G.pips || (G.fresh ? '!' : 0)),
      small('rec', 'ic_record', tr('Records'), ready ? tr('{ready} ready', { ready }) : tr('{done} of {length}', { done, length: H.RECORDS.length }), 'records', ready)));
    root.appendChild(modes); root.appendChild(UI.nav('home'));
  };

  // what the Gig Board has going on: a line for the Home button, and how many things want a look
  const gigNews = (S) => {
    if (H.refreshRehearsals(S)) UI.save(); H.refreshEncore(S);
    const reh = S.stage > 10 ? H.rehearsals(S).filter((n) => !S.reh[n]).length : 0, day = H.dailyOpen(S) && !H.dailyStatus(S).won, solo = H.soloOpen(S) && H.soloPaidLeft(S) > 0;
    const fresh = (H.dailyOpen(S) && !S.flags.seenDaily) || (H.soloOpen(S) && !S.flags.seenSolo) || (H.encoreOpen(S) && !S.flags.seenEnc);
    const line = day ? tr('Daily Gig ready') : S.soloRun ? tr('Solo tour on the road') : S.encoreRun ? tr('Encore wave {n} next', { n: S.encoreRun.wave }) : reh ? tr('{n} rehearsals open', { n: reh }) : solo ? tr('Solo pays today') : S.stage <= 10 && !H.dailyOpen(S) ? tr('First gig at level {n}', { n: H.DAILY.unlock }) : tr('All played today');
    return { line, pips: (day ? 1 : 0) + reh, fresh };
  };

  /* ================= the Gig Board: every side mode as a poster pinned to a board ================= */
  UI.screens.gigs = (root) => {
    const S = UI.S; UI.music('camp', regionOf(S.stage)); if (H.refreshRehearsals(S)) UI.save(); H.refreshEncore(S);
    root.appendChild(UI.topbar(tr('Gigs'), () => UI.go('home'), UI.wallet()));
    const board = el('div', 'board scroll'), grid = el('div', 'flyers');
    const pin = (cls, open, lockText, build, go, pip, tilt) => {
      const f = el('button', 'flyer ' + cls + (open ? '' : ' wrapped')); f.type = 'button'; f.style.setProperty('--tilt', tilt + 'deg');
      f.appendChild(el('i', 'tack'));
      if (open) { build(f); if (pip) f.appendChild(el('span', 'pip', String(pip))); f.addEventListener('click', () => { Au.sfx('tap'); UI.go(go, {}); }); }
      else { build(f); f.appendChild(add(el('div', 'wrap'), el('i', 'string'), el('b', '', lockText))); f.setAttribute('aria-label', lockText); f.addEventListener('click', () => { Au.sfx('tap'); UI.toast(lockText + '.'); }); }
      grid.appendChild(f); return f;
    };
    // Daily Gig: today's poster, biggest, at the top
    const D = H.dailyOpen(S) ? H.dailyStatus(S) : H.gigOf(H.dayOf(Date.now())), T = H.TWISTS[D.twist];
    pin('daily', H.dailyOpen(S), tr('Unlocks at Level {unlock}', { unlock: H.DAILY.unlock }), (f) => add(f, txt('fkick', tr('Daily Gig')), add(el('div', 'frow'), UI.icon(A.twistIcon(D.twist), 2.2), add(el('div', 'grow'), el('b', 'ftitle', T.n), txt('fsub', D.venue))),
      H.dailyOpen(S) && D.won ? UI.stamp(tr('Won today'), 'green still') : null), 'daily', D.won ? 0 : '!', -1.5);
    // Solo: a spotlight flyer with today's pay
    const P = (H.refreshSolo(S), S.solo), pays = [0, 1, 2, 3, 4].map((i) => i < P.gigs).concat([!!P.boss]);
    pin('solo', H.soloOpen(S), tr('Unlocks at Level {unlock}', { unlock: H.SOLO.unlock }), (f) => add(f, el('i', 'spot'), txt('fkick', tr('Solo')), UI.icon('ic_solo', 2), el('b', 'ftitle', S.soloRun ? tr('Gig {n} of 5', { n: Math.min(5, S.soloRun.gigs + 1) }) : tr('Solo Tour')),
      add(el('div', 'dots'), ...pays.map((g, i) => el('i', (g ? 'got' : '') + (i === 5 ? ' boss' : ''))))), 'solo', S.flags.seenSolo ? 0 : '!', 2);
    // Encore: neon on dark
    const E = S.encore;
    pin('enc', H.encoreOpen(S), tr('Unlocks at Level {unlock}', { unlock: H.ENCORE.unlock }), (f) => add(f, txt('fkick', tr('Encore')), el('b', 'neonw', tr('Encore')), UI.icon('ic_mic', 1.6), txt('fsub', S.encoreRun ? tr('Wave {wave} next', { wave: S.encoreRun.wave }) : tr('Best this week: {weekBest}', { weekBest: E.weekBest }))), 'encore', S.flags.seenEnc ? 0 : '!', -2);
    // Rehearsal: sheet music
    const open = S.stage > 10 ? H.rehearsals(S).filter((n) => !S.reh[n]).length : 0, days = H.daysToReset(Date.now());
    pin('reh', S.stage > 10, tr('Unlocks after floor 10'), (f) => add(f, el('i', 'staff'), add(el('div', 'frow'), UI.icon('ic_baton', 1.9), add(el('div', 'grow'), txt('fkick', tr('Rehearsal')), el('b', 'ftitle', open ? tr('{n} bosses open', { n: open }) : tr('All played')), txt('fsub', tr('Resets in {n} days', { n: days }))))), 'rehearsal', open, 1);
    board.appendChild(grid); root.appendChild(board); root.appendChild(UI.nav('home'));
  };

  /* ================= adventure: the next floor, who is waiting on it, and the battle buttons ================= */
  UI.screens.adventure = (root, pr) => {
    const S = UI.S; let n = Math.min(pr.n || S.stage, S.stage);
    const draw = () => {
      root.innerHTML = '';
      const st = H.stage(n), R = H.REGIONS[st.region], ens = H.teamEnsemble(S); UI.music('camp', st.region);
      root.appendChild(statusBar());
      const strip = el('button', 'tstrip'); strip.type = 'button'; strip.setAttribute('aria-label', tr('Change your band'));
      const faces = el('div', 'tfaces'); H.teamPets(S).filter(Boolean).forEach((p) => faces.appendChild(UI.sp(p.form, 0.5, { anim: false })));
      const few = H.teamPets(S).filter(Boolean).length < 3;
      add(strip, faces, add(el('div', 'grow'), el('b', '', ens ? ens.n : few ? tr('Your band') : tr('No ensemble')), ens ? el('div', 'small dim', ens.d()) : null), el('span', 'chip', tr('Band')));
      strip.addEventListener('click', () => { Au.sfx('tap'); UI.go('team', { n }); }); root.appendChild(strip);
      const fb = el('div', 'foebar'), prev = key('‹', () => { n--; draw(); }, 'soft sm'), nextB = key('›', () => { n++; draw(); }, 'soft sm'); prev.disabled = n <= 1; nextB.disabled = n >= S.stage; prev.setAttribute('aria-label', tr('Earlier floor')); nextB.setAttribute('aria-label', tr('Later floor'));
      const gapL = st.level - S.level, sh = n >= S.stage ? H.shellsFor(n) : 0, ech = n >= S.stage ? (n % H.ECHO_EVERY === 0 ? H.ECHO_FLOORS : 0) + (st.boss ? H.ECHO_BOSS : 0) : 0, drop = Math.round(H.dropChance(S, n) * 100), gift = n === 2 && !S.flags.gift2;
      add(fb, add(el('div', 'col'), txt('label', R.n), box('row', prev, txt('disp', tr(st.boss ? 'Boss {n}' : st.elite ? 'Loud {n}' : 'Floor {n}', { n })), nextB)), add(el('div', 'frew'), txt('small ' + (gapL >= 2 ? 'bad' : 'dim'), tr(n < S.stage ? 'Cleared · Foes Lv {n}' : 'Foes Lv {n}', { n: st.level })), box('row', UI.purse('ic_xp', '+' + UI.fmt(H.xpFor(S, n)), tr('Experience')), sh ? UI.purse('ic_shell', '+' + sh, tr('Shells')) : null, ech ? UI.purse('ic_echo', '+' + ech, tr('Echoes')) : null, gift ? UI.purse('ic_bag', '+1', tr('Equipment')) : n === 100 && !S.flags.leg100 ? txt('chip legend', tr('+1 Legendary')) : drop > 0 ? UI.purse('ic_bag', drop + '%', tr('Chance of equipment')) : null)));
      // the floor section: which floor, what it pays, and where it lies on the way to floor 100
      root.appendChild(add(el('div', 'floorsec'), fb, worldMap(S, n)));
      const body = el('div', 'scroll'), pad = el('div', 'pad foelist'); pad.style.gap = 'calc(var(--u) * 3.5)';
      const team = H.teamPets(S).filter(Boolean), mine = team.map(H.petFamily), adv = {};
      st.enemies.forEach((e) => {
        const d = e.pet ? null : H.DIN[e.id], fam = e.pet ? H.SPECIES[H.FORMS[e.id].sp].family : d.family, name = e.pet ? tr('Rival {pet}', { pet: H.FORMS[e.id].n }) : e.loud ? tr('Loud {din}', { din: d.n }) : d.n;
        const good = mine.some((f) => H.advantage(f, fam) > 0), bad = mine.some((f) => H.advantage(fam, f) > 0);
        const row = el('button', 'foerow'); row.type = 'button'; row.setAttribute('aria-label', tr(good ? '{name}, level {lvl}, your band is strong against it. Show its moves' : bad ? '{name}, level {lvl}, strong against your band. Show its moves' : '{name}, level {lvl}. Show its moves', { name, lvl: e.lvl })); row.addEventListener('click', () => { Au.sfx('tap'); UI.foeSheet(e, team); }); add(row, UI.sp(e.id, d && d.boss ? 0.5 : 0.62, { flip: true, anim: false }), add(el('div', 'grow'), el('b', '', name), el('div', 'small dim', tr(d && d.boss ? 'Lv {n} · boss' : 'Lv {n}', { n: e.lvl }))), UI.famChip(fam), good ? UI.icon('ic_up') : bad ? UI.icon('ic_down') : el('span', 'gap'));
        pad.appendChild(row); if (good) adv.up = 1; else if (bad) adv.down = 1;
      });
      // the arrows explain themselves under the list, only when one is showing
      if (adv.up || adv.down) pad.appendChild(add(el('div', 'advkey'), adv.up ? add(el('span'), UI.icon('ic_up'), tr('You hit it harder')) : null, adv.down ? add(el('span'), UI.icon('ic_down'), tr('It hits you harder')) : null));
      body.appendChild(pad); root.appendChild(body);
      const foot = el('div', 'gofoot'), ready = H.teamPets(S).some(Boolean);
      if (gapL >= 2 && n >= S.stage) foot.appendChild(txt('warn', tr('Foes are {n} levels above you', { n: gapL })));
      const keep = key('', () => { S.settings.keep = S.settings.keep ? 0 : 1; UI.save(); draw(); }, 'sm wide ' + (S.settings.keep ? 'gold' : 'soft')); add(keep, UI.icon('ic_keep'), tr(S.settings.keep ? 'Keep going: on' : 'Keep going: off')); keep.setAttribute('aria-pressed', S.settings.keep ? 'true' : 'false');
      const a = key(tr('Auto battle'), () => { S.settings.auto = 1; UI.go('battle', { n }); }, 'blue grow'), b = UI.coach(key(tr('Battle'), () => { S.settings.auto = 0; UI.go('battle', { n }); }, 'coral grow big'), S.flags.coach === 'go', tr('Fight the foes above')); a.disabled = b.disabled = !ready; a.style.flex = '0.8'; b.style.minHeight = 'calc(var(--u) * 28)';
      add(foot, S.stage > 5 || S.settings.keep ? keep : null, box('row', a, b)); root.appendChild(foot); root.appendChild(UI.nav(''));
    };
    draw();
  };

  // The ten regions on the way to floor 100 as a strip of round badges, each with its landmark. A green ring and a note
  // mark a region that sings again, a grey cloud one still hushed; the band leader hops above the region in view.
  const worldMap = (S, n) => {
    const m = el('button', 'wmap'); m.type = 'button'; const lap = Math.floor((n - 1) / 100), here = Math.floor(((n - 1) % 100) / 10);
    m.setAttribute('aria-label', tr('Map: {n}, floor {n2}. Show all regions', { n: H.REGIONS[H.REGION_ORDER[here]].n, n2: n }));
    m.appendChild(el('div', 'wpath'));
    const lead = H.teamPets(S).filter(Boolean)[0];
    H.REGION_ORDER.forEach((r, i) => {
      const bossN = lap * 100 + (i + 1) * 10, sings = lap > 0 || S.stage > bossN, node = el('div', 'wnode' + (sings ? ' sings' : ' hushed') + (i === here ? ' here' : '') + (i % 2 ? ' low' : ''));
      const b = A.regionBadge(r, 15), c = A.make(b.width, b.height); c.getContext('2d').drawImage(b, 0, 0); c.className = 'wbadge'; node.appendChild(c);
      node.appendChild(sings ? add(el('span', 'wmark'), UI.icon('ic_note', 0.55)) : el('span', 'wcloud'));
      if (i === here) node.appendChild(add(el('span', 'wme'), UI.sp(lead ? lead.form : 'shell', 0.32, { anim: false })));
      m.appendChild(node);
    });
    m.addEventListener('click', () => { Au.sfx('tap'); mapSheet(S, n); });
    return m;
  };
  const mapSheet = (S, n) => {
    const lap = Math.floor((n - 1) / 100), kids = [txt('disp', lap ? tr('The world, encore {n}', { n: lap + 1 }) : tr('The way to floor 100'))];
    H.REGION_ORDER.forEach((r, i) => {
      const R = H.REGIONS[r], bossN = lap * 100 + (i + 1) * 10, sings = lap > 0 || S.stage > bossN, here = Math.floor(((n - 1) % 100) / 10) === i;
      const row = el('div', 'maprow' + (here ? ' here' : '') + (sings ? '' : ' hushed'));
      add(row, (() => { const b = A.regionBadge(r, 22), c = A.make(b.width, b.height); c.getContext('2d').drawImage(b, 0, 0); c.className = 'wbadge big'; return c; })(), add(el('div', 'grow col'), el('b', '', R.n), el('div', 'small dim', tr(sings ? 'Floors {a}–{b} · sings again' : 'Floors {a}–{b} · hushed by {din}', { a: bossN - 9, b: bossN, din: H.DIN[R.boss].n }))), UI.sp(R.boss, 0.36, { anim: false, flip: true, variant: sings ? '' : '' }), here ? txt('chip tag-on', tr('Here')) : null);
      kids.push(row);
    });
    kids.push(key(tr('Close'), UI.closeModal, 'wide')); UI.modal(...kids);
  };

  /* ================= team: who stands where, and the ensemble they form ================= */
  UI.screens.team = (root, pr) => {
    const S = UI.S, W = UI.W;
    const draw = () => {
      root.innerHTML = '';
      const region = regionOf(S.stage), ens = H.teamEnsemble(S); UI.music('camp', region);
      root.appendChild(statusBar());
      const lh = Math.max(96, Math.min(140, UI.Hh - 236)), lu = el('div', 'lineup'); lu.style.height = `calc(var(--u) * ${lh})`; lu.appendChild(UI.bgEl(region, W, lh, 0.38, hereMode(S)));
      const row = el('div', 'lurow');
      H.teamPets(S).forEach((p, slot) => {
        const cell = el('div', 'lucell');
        if (!p) { const b = el('button', 'lu empty'); b.type = 'button'; b.innerHTML = `<b>+</b><span>${tr('free spot')}</span>`; b.addEventListener('click', () => { Au.sfx('tap'); pick(slot); }); cell.appendChild(b); row.appendChild(cell); return; }
        const b = UI.coach(el('button', 'lu'), S.flags.coach === 'gear' && !row.querySelector('.coach'), tr('Tap your pet')); b.type = 'button'; b.setAttribute('aria-label', tr('About {n}', { n: H.FORMS[p.form].n })); b.addEventListener('click', () => { Au.sfx('noise', H.petSpecies(p)); UI.go('pet', { id: p.id, n: pr.n, back: 'team' }); });
        add(b, UI.sp(p.form, lh > 112 ? 1.25 : 1.05), add(el('div', 'lunm'), UI.icon('fam_' + H.petFamily(p)), el('span', '', H.FORMS[p.form].n)));
        if (H.ownGrow(S, p)) b.appendChild(add(el('span', 'dot'), UI.icon('ic_bang', 1.3)));
        add(cell, b, key(tr('Swap'), () => pick(slot), 'sm soft swap')); row.appendChild(cell);
      });
      lu.appendChild(row); root.appendChild(lu);
      const body = el('div', 'scroll'), pad = el('div', 'pad');
      const full = H.teamPets(S).filter(Boolean).length === 3, panel = el('div', 'ensp' + (ens ? ' on' : ''));
      if (ens) {
        add(panel, box('row between', txt('label', tr('Your ensemble')), playKey(ens)), txt('disp big', ens.n), famChips(ens.fam), txt('', ens.d()));
      } else {
        const can = H.possibleEnsembles(S);
        add(panel, txt('label', tr('Your ensemble')), txt('disp', tr('No ensemble')), txt('small', (full ? '' : tr('Fill all three spots.') + H.T.sep()) + tr('It takes <b>3 different families</b>, or <b>3 of the same</b>.')));
        if (can.length) panel.appendChild(txt('small dim', tr('Possible: <b>{list}</b>', { list: H.T.list(can.slice(0, 3).map((e) => e.n)) }) + (can.length > 3 ? ` +${can.length - 3}` : '')));
      }
      panel.appendChild(key(tr('All ensembles'), () => UI.go('pets', { tab: 'ens' }), 'wide soft sm'));
      pad.appendChild(panel); body.appendChild(pad); root.appendChild(body);
      const foot = el('div', 'gofoot'); foot.appendChild(UI.coach(key(tr('To the adventure'), () => UI.go('adventure', { n: pr.n }), 'go wide big'), S.flags.coach === 'go', tr('Ready? Head out'))); root.appendChild(foot);
      root.appendChild(UI.nav('team'));
    };
    // choose who stands in one spot
    const pick = (slot) => {
      const cur = S.team[slot], grid = el('div', 'cards');
      S.pets.slice().sort((x, y) => (S.team.includes(y.id) ? 1 : 0) - (S.team.includes(x.id) ? 1 : 0)).forEach((p) => grid.appendChild(petCard(S, p, (q) => { const was = H.teamEnsemble(S); H.setTeam(S, slot, q.id); Au.sfx('noise', H.petSpecies(q)); UI.save(); UI.closeModal(); draw(); const now = H.teamEnsemble(S); if (now && (!was || was.id !== now.id)) { UI.toast(now.n + '!'); Au.ensemble(now.id); } })));
      const kids = [txt('disp', tr('Who stands here?')), grid];
      if (cur && S.team.filter(Boolean).length > 1) kids.push(key(tr('Leave this spot empty'), () => { S.team[slot] = null; UI.save(); UI.closeModal(); draw(); }, 'wide soft sm'));
      kids.push(key(tr('Close'), UI.closeModal, 'wide')); UI.modal(...kids);
    };
    draw();
  };

  /* ================= pets: everything you have found, and every ensemble they can form ================= */
  UI.screens.pets = (root, pr) => {
    const S = UI.S; let tab = pr.tab === 'ens' ? 'ens' : 'pets'; UI.music('camp', regionOf(S.stage));
    const draw = () => {
      root.innerHTML = '';
      const found = new Set(S.pets.map(H.petSpecies)).size, played = H.ENSEMBLES.filter((e) => S.ens[e.id]).length;
      const bar = el('div', 'bar'); add(bar, txt('disp', tr('Pets')), ...UI.wallet()); root.appendChild(bar);
      const seg = el('div', 'seg'); for (const [id, name] of [['pets', `${tr('Pets')} <span>${found}/${H.SPECIES_ORDER.length}</span>`], ['ens', `${tr('Ensembles')} <span>${played}/${H.ENSEMBLES.length}</span>`]]) { const b = el('button', id === tab ? 'on' : '', name); b.type = 'button'; b.setAttribute('aria-pressed', id === tab ? 'true' : 'false'); b.addEventListener('click', () => { if (tab === id) return; tab = id; UI.cur.params.tab = id; Au.sfx('tap'); draw(); }); seg.appendChild(b); } root.appendChild(seg);
      const body = el('div', 'scroll'), pad = el('div', 'pad'); pad.style.paddingTop = 'calc(var(--u) * 3)';
      if (tab === 'pets') {
        const grid = el('div', 'cards');
        S.pets.slice().sort((a, b) => (S.team.includes(b.id) ? 1 : 0) - (S.team.includes(a.id) ? 1 : 0) || H.petTier(b) - H.petTier(a)).forEach((p) => grid.appendChild(petCard(S, p, (q) => { Au.sfx('noise', H.petSpecies(q)); UI.go('pet', { id: q.id, back: 'pets' }); })));
        H.SPECIES_ORDER.filter((sp) => !H.owned(S, sp)).forEach((sp) => { const c = el('div', 'card locked'); add(c, add(el('div', 'cmain'), UI.sp(sp, 1, { variant: 'sil', anim: false }), el('div', 'cnm', '? ? ?'))); grid.appendChild(c); });
        pad.appendChild(grid);
      } else {
        const cur = H.teamEnsemble(S), can = new Set(H.possibleEnsembles(S).map((e) => e.id));
        pad.appendChild(txt('small dim center', tr('3 different families, or 3 of the same.')));
        const order = (e) => (cur && cur.id === e.id ? 0 : S.ens[e.id] ? 1 : can.has(e.id) ? 2 : 3);
        H.ENSEMBLES.slice().sort((a, b) => order(a) - order(b)).forEach((e) => {
          // a tick: in use. A note: played before. A lock: you do not have the pets for it yet.
          const rec = S.ens[e.id], inUse = cur && cur.id === e.id, lock = !can.has(e.id), state = tr(inUse ? 'In use' : lock ? 'Pets missing' : rec ? 'Played' : 'Not played yet');
          const row = el('div', 'ensrow' + (inUse ? ' on' : lock ? ' no' : ' can')); row.setAttribute('aria-label', e.n + ': ' + state);
          const mark = inUse ? UI.icon('ic_check', 1) : lock ? UI.icon('ic_lock', 1) : rec ? UI.icon('ic_note', 0.9) : null;
          add(row, add(el('div', 'grow col'), box('row between', add(el('div', 'row'), mark, el('b', 'rn', e.n)), playKey(e)), famChips(e.fam), el('div', 'small', e.d())));
          pad.appendChild(row);
        });
      }
      body.appendChild(pad); add(root, body, UI.nav('pets'));
    };
    draw();
  };

  /* ================= shells: every shell is a random pet ================= */
  UI.screens.shells = (root, pr) => {
    const S = UI.S; let busy = false, navEl = null; UI.music(S.pets.length ? 'camp' : 'silent', regionOf(S.stage)); const wasCoach = S.flags.coach === 'shell'; if (wasCoach) delete S.flags.coach;
    const bar = el('div', 'bar'), boxEl = el('div', 'shellbox'), foot = el('div', 'gofoot');
    const coll = () => { const c = el('div', 'coll'); H.SPECIES_ORDER.forEach((sp) => { const p = S.pets.find((q) => H.petSpecies(q) === sp); c.appendChild(UI.sp(p ? p.form : sp, 1, { anim: false, variant: p ? '' : 'sil' })); }); return c; };
    const fresh = () => { bar.innerHTML = ''; add(bar, txt('disp', tr('Shells')), ...UI.wallet()); if (navEl) { const n2 = UI.nav('shells'); navEl.replaceWith(n2); navEl = n2; } };
    const idle = () => {
      fresh(); boxEl.innerHTML = ''; foot.innerHTML = '';
      // an unopened shell wiggles now and then, and tapping it opens it
      let sh = UI.sp('shell', 2, { anim: false }); if (!S.shells) sh.style.opacity = '0.45';
      else { const t = el('button', 'shelltap'); t.type = 'button'; t.setAttribute('aria-label', tr('Open the shell')); t.appendChild(sh); t.addEventListener('click', crack); sh = t; }
      add(boxEl, sh, txt('disp big', S.shells ? tr('{n} shells to open', { n: S.shells }) : tr('No shells right now')),
        txt('', pr.first ? tr('Your first pet is inside. <b>Tap the shell.</b>') : tr('A <b>random pet</b>. One you already have becomes an <b>echo</b>.')), pr.first ? null : coll(),
        pr.first || S.shells ? null : txt('small dim', tr('Bosses leave shells. Notes buy more.')));
      const open = key(S.shells > 1 ? tr('Open a shell') : tr('Open the shell'), crack, 'go big wide'); open.disabled = !S.shells; foot.appendChild(open);
      if (!pr.first) { const price = H.shellPrice(S), buy = key('', () => { if (H.buyShell(S)) { Au.sfx('coin'); UI.save(); idle(); } }, 'gold wide'); add(buy, tr('Buy a shell') + ' · ', UI.icon('ic_note'), String(price)); buy.disabled = S.notes < price; foot.appendChild(buy); }
    };
    const crack = () => {
      if (busy || !S.shells) return; busy = true; boxEl.innerHTML = ''; foot.innerHTML = ''; boxEl.appendChild(el('div', 'rays'));
      const sh = UI.sp('shell', 2, { anim: false }); sh.classList.add('wob'); add(boxEl, sh, txt('disp big', '. . .')); Au.sfx('crack');
      setTimeout(() => { if (UI.cur.name !== 'shells') return; Au.sfx('crack'); }, 380);
      setTimeout(() => { if (UI.cur.name !== 'shells') return; busy = false; if (!S.pets.length) choose(); else show(H.openShell(S, rnd)); }, window.__hsSpeed ? 30 : 820);
    };
    // The very first shell: three pets look out, and you take one.
    const choose = () => {
      boxEl.innerHTML = ''; foot.innerHTML = ''; boxEl.appendChild(el('div', 'rays')); Au.sfx('evolve'); let pick = null;
      const go = key(tr('Pick one'), () => { if (pick) show(H.openShell(S, rnd, pick)); }, 'go big wide'); go.disabled = true;
      const row = el('div', 'starters'), info = txt('', ''); info.style.minHeight = 'calc(var(--u) * 28)';
      H.STARTERS.forEach((sp) => {
        const b = el('button', 'starter ' + H.SPECIES[sp].family); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
        add(b, UI.sp(sp, 1.25), txt('disp', H.FORMS[sp].n), UI.famChip(H.SPECIES[sp].family));
        b.addEventListener('click', () => { pick = sp; Au.sfx('noise', sp); row.querySelectorAll('.starter').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); info.innerHTML = H.SPECIES[sp].lore; go.disabled = false; go.textContent = tr('I choose {n}', { n: H.FORMS[sp].n }); });
        row.appendChild(b);
      });
      add(boxEl, txt('disp big', tr('Three pets were inside!')), txt('', tr('Pick one. The others turn up later.')), row, info); foot.appendChild(go);
    };
    const show = (r) => {
      UI.save(); fresh(); boxEl.innerHTML = ''; foot.innerHTML = ''; boxEl.appendChild(el('div', 'rays'));
      const pet = r.pet, f = H.FORMS[pet.form], sp = H.SPECIES[r.sp], base = baseName(pet), c = UI.sp(pet.form, 2.1); c.classList.add('reveal'); boxEl.appendChild(c);
      if (r.isNew) { Au.sfx('evolve'); setTimeout(() => Au.sfx('noise', r.sp), 500); add(boxEl, txt('chip', tr('New pet!')), txt('disp big', f.n), box('row center', UI.famChip(sp.family)), txt('', sp.lore)); }
      else {
        Au.sfx('good');
        add(boxEl, txt('chip', f.n === base ? tr('Another {base}', { base }) : tr('Another {base} (your {n})', { base, n: f.n })), add(el('div', 'row center disp big'), UI.icon('ic_echo', 1.4), el('span', '', tr('+{n} {pet} echoes', { n: r.echo, pet: base }))), UI.echoIntro(pet));
      }
      // only when this shell's own echo is what lets the pet grow, so a new pet never points at someone else
      if (S.shells) foot.appendChild(key(tr('Open another ({n} left)', { n: S.shells }), crack, 'go big wide'));
      foot.appendChild(key(pr.first ? tr('Let\'s go') : tr('Done'), () => { if (pr.first || (wasCoach && !S.shells)) { S.flags.coach = 'go'; UI.go('home'); } else idle(); }, S.shells ? 'soft wide' : 'go big wide'));
    };
    add(root, bar, boxEl, foot); if (!pr.first) { navEl = UI.nav('shells'); root.appendChild(navEl); }
    idle();
  };

  /* ================= one pet: what it is, what it can become, what it carries ================= */
  UI.screens.pet = (root, pr) => {
    const S = UI.S, pet = H.petById(S, pr.id); if (!pet) return UI.go('pets');
    const back = () => UI.go(pr.back || 'pets', { n: pr.n });
    const body = el('div', 'scroll'); let openGear = !!pr.gear;
    const draw = () => {
      root.innerHTML = ''; body.innerHTML = '';
      const f = H.FORMS[pet.form], sp = H.SPECIES[f.sp], kit = H.kitOf(pet.form), st = UI.statSheet(S, pet), pad = el('div', 'pad'), have = H.echoes(S, pet), own = H.ownEchoes(S, pet), base = baseName(pet);
      root.appendChild(UI.topbar(f.n, back, UI.wallet()));
      const stage = el('div', 'pstage'); add(stage, UI.bgEl(regionOf(S.stage), UI.W - 10, 92, 0.5, hereMode(S)), UI.sp(pet.form, 1.9)); stage.addEventListener('click', () => Au.sfx('noise', f.sp));
      add(pad, stage, box('row center wrap', UI.famChip(sp.family), UI.roleChip(kit.role), txt('chip', tr(tierName[f.tier])), UI.stars(pet.rank)), txt('small dim center', sp.lore),
        el('div', 'stats five', UI.statsHTML([[UI.fmt(st.hp), H.T.k('HP')], [UI.fmt(st.vol), H.T.k('Power')], [st.poise, H.T.k('Guard')], [st.tempo, H.T.k('Speed')], [st.crit + '%', H.T.k('Crit')]])));
      const echoLine = (need) => add(el('div', 'row small'), UI.icon('ic_echo', 0.8), el('b', '', tr('{have} / {need} echoes', { have: Math.min(have, need), need })));
      const kids = H.nextForms(pet);
      if (kids.length) {
        const need = H.evoCheck(S, pet, kids[0]).cost, m = UI.meter2(own / need, (S.echo || 0) / need); m.classList.add('echo');
        add(pad, box('row between', txt('label', tr('Evolve into')), echoLine(need)), m);
        const row = el('div', 'evo');
        kids.forEach((k) => { const kf = H.FORMS[k], b = key('', () => evoSheet(k), have >= need ? 'gold' : ''); add(b, UI.sp(k, 1.1, { anim: false }), el('div', '', kf.n), el('span', '', f.tier === 0 ? H.ROLES[kf.role].n : tr('New Special'))); row.appendChild(b); });
        add(pad, row, txt('small dim center', have >= need ? tr('Pick one. Swapping later is free.') : tr('Echoes come from shells, bosses, rehearsals and records.')));
      } else {
        const rc = H.rankCost(pet.rank || 0), m = UI.meter2(own / rc, (S.echo || 0) / rc); m.classList.add('gold');
        const maxed = (pet.rank || 0) >= H.RANK_MAX; add(pad, box('row between', txt('label', tr('Stars {n} / {max}', { n: pet.rank || 0, max: H.RANK_MAX })), maxed ? null : echoLine(rc)), maxed ? null : m);
        const b = key('', () => { if (H.rankUp(S, pet)) { Au.sfx('level'); UI.save(); draw(); } }, 'gold wide'); add(b, UI.icon('ic_star'), tr('Add a star · +3% HP and Power')); b.disabled = !H.rankCheck(S, pet);
        add(pad, (pet.rank || 0) >= H.RANK_MAX ? txt('center good', tr('This pet is as strong as it gets.')) : b);
      }
      const gear = el('div', 'gear');
      [0, 1].forEach((slot) => {
        const it = pet.gear[slot] && H.itemById(S, pet.gear[slot]), b = UI.coach(el('button', 'slot' + (it ? ' full r-' + it.rar : '')), !it && S.flags.coach === 'gear' && !gear.querySelector('.coach'), tr('Put your equipment on here')); b.type = 'button';
        if (it) add(b, UI.icon(A.itemIcon(it), 1.1), el('div', 'grow', `<b>${H.itemName(it)}</b>${H.itemStatText(it)}`)); else add(b, UI.icon('ic_plus'), el('div', 'grow', tr('Empty slot')));
        b.addEventListener('click', () => { Au.sfx('tap'); gearSheet(slot); }); gear.appendChild(b);
      });
      add(pad, txt('label', tr('Equipment')), gear, txt('label', tr('Moves')), ...UI.formInfo(pet.form));
      const others = Object.keys(H.FORMS).filter((k) => H.FORMS[k].sp === f.sp && k !== pet.form && H.FORMS[k].tier > 0 && (H.FORMS[k].tier === 1 ? pet.t1 : pet.t2));
      if (others.length) pad.appendChild(key(tr('Change path'), pathSheet, 'wide soft sm'));
      body.appendChild(pad); root.appendChild(body);
    };
    // the old form glows white and swells, then the new one bursts out
    const evoMoment = (from, to) => {
      const kf = H.FORMS[to], kk = H.kitOf(to), stage = el('div', 'evostage'), a = UI.sp(from, 2.4, { anim: false }), b = UI.sp(to, 2.4); a.classList.add('evo-out'); b.classList.add('evo-in'); add(stage, el('div', 'rays'), a, b);
      const s = UI.modal(stage, txt('disp big center evo-txt', kf.n), txt('center evo-txt', H.ROLES[kk.role].d), key(tr('Great'), UI.closeModal, 'go wide big evo-txt')); s.classList.add('evosheet');
      if (!window.__hsSpeed) setTimeout(() => Au.sfx('level'), 1250);
    };
    const evoSheet = (k) => {
      const kf = H.FORMS[k], c = H.evoCheck(S, pet, k), kk = H.kitOf(k), old = pet.form, b = key('', () => { if (!H.evolve(S, pet, k)) return; UI.save(); Au.sfx('evolve'); UI.music('camp', regionOf(S.stage)); UI.closeModal(); draw(); body.scrollTop = 0; evoMoment(old, k); }, 'gold wide big');
      add(b, tr('Evolve') + ' · ', UI.icon('ic_echo'), String(c.cost || 0)); b.disabled = !c.ok;
      UI.modal(box('row', UI.sp(k, 1.3), add(el('div', 'col grow'), txt('disp', kf.n), box('row wrap', UI.roleChip(kk.role)), txt('small dim', H.ROLES[kk.role].d))), ...UI.formInfo(k, true),
        c.ok ? null : txt('center bad small', tr('{have} / {n} echoes', { have: c.have || 0, n: c.cost })), b, key(tr('Back'), UI.closeModal, 'wide soft'));
    };
    const pathSheet = () => {
      const f = H.FORMS[pet.form], opts = Object.keys(H.FORMS).filter((k) => H.FORMS[k].sp === f.sp && k !== pet.form && H.FORMS[k].tier > 0 && (H.FORMS[k].tier === 1 ? pet.t1 : pet.t2));
      const kids = [txt('disp', tr('Change path')), txt('dim small', tr('Free, as often as you like.'))];
      opts.forEach((k) => { const b = key('', () => { pet.form = k; S.seen[k] = 1; UI.save(); Au.sfx('good'); UI.closeModal(); draw(); }, 'wide'); add(b, UI.sp(k, 0.6, { anim: false }), `${H.FORMS[k].n} · ${H.ROLES[roleOf(k)].n}`); kids.push(b); });
      kids.push(key(tr('Back'), UI.closeModal, 'wide soft')); UI.modal(...kids);
    };
    const gearSheet = (slot) => {
      const taught = S.flags.coach === 'gear'; if (taught) { delete S.flags.coach; draw(); }
      const cur = pet.gear[slot] && H.itemById(S, pet.gear[slot]), spare = H.spareItems(S), kids = [txt('disp', tr('Equipment'))];
      if (cur) kids.push(UI.itemRow(cur), key(tr('Take it off'), () => { H.unequip(S, pet, slot); UI.save(); UI.closeModal(); draw(); }, 'wide soft sm'));
      if (spare.length) { kids.push(txt('label', cur ? tr('Swap for') : tr('In your bag'))); spare.forEach((it) => { const b = UI.itemRow(it, 'button'); b.addEventListener('click', () => { H.equip(S, pet, slot, it.id); Au.sfx('good'); if (taught) S.flags.coach = 'go'; UI.save(); UI.closeModal(); draw(); if (taught) UI.toast(tr('Done! Head back and battle on.')); }); kids.push(b); }); }
      else kids.push(txt('dim center', cur ? tr('Nothing else in your bag.') : tr('Your bag is empty.')));
      // pieces other pets wear can move over from here; the wearer's slot is left empty
      const worn = S.items.filter((it) => { const o = H.itemOwner(S, it.id); return o && o !== pet; }).sort((a, b) => H.itemRank(b) - H.itemRank(a));
      if (worn.length) { kids.push(txt('label', tr('Worn by other pets'))); worn.forEach((it) => { const o = H.itemOwner(S, it.id), b = UI.itemRow(it, 'button', UI.sp(o.form, 0.5, { anim: false })); b.addEventListener('click', () => { H.equip(S, pet, slot, it.id); Au.sfx('good'); UI.save(); UI.closeModal(); draw(); UI.toast(tr('Taken from {n}.', { n: H.FORMS[o.form].n })); }); kids.push(b); }); }
      kids.push(key(tr('Close'), UI.closeModal, 'wide')); UI.modal(...kids);
    };
    draw(); if (openGear) { openGear = false; gearSheet(pet.gear[0] ? 1 : 0); }
  };

  /* ================= bag: all equipment. Wear it, merge it or sell it. ================= */
  UI.screens.bag = (root) => {
    const S = UI.S; UI.music('camp', regionOf(S.stage));
    const draw = () => {
      root.innerHTML = ''; const bar = el('div', 'bar'); add(bar, txt('disp', tr('Bag')), ...UI.wallet()); root.appendChild(bar);
      const body = el('div', 'scroll'), pad = el('div', 'pad'); pad.style.paddingTop = '0';
      const items = S.items.slice().sort((a, b) => H.itemRank(b) - H.itemRank(a) || a.type.localeCompare(b.type));
      if (!items.length) add(pad, box('row center', UI.icon('ic_bag', 3)), txt('disp center', tr('Nothing here yet')), txt('dim center', tr('Battles sometimes drop equipment.')));
      else {
        if (!H.mergeGroups(S).length) pad.appendChild(txt('small dim center', tr('3 spare pieces of one kind merge into a better one.')));
        H.mergeGroups(S).slice(0, 3).forEach((g) => { const it = g[0], nx = H.RARITY[H.RARITY_ORDER[H.RARITY_ORDER.indexOf(it.rar) + 1]].n, b = key('', () => merge(it), 'gold wide sm'); add(b, UI.icon(A.itemIcon(it), 0.7), tr('Merge 3 {item} → {rarity}', { item: H.itemName(it), rarity: nx })); pad.appendChild(b); });
        items.forEach((it) => { const who = H.itemOwner(S, it.id), b = UI.itemRow(it, 'button', who ? UI.sp(who.form, 0.5, { anim: false }) : null); b.addEventListener('click', () => { Au.sfx('tap'); sheet(it); }); pad.appendChild(b); });
      }
      body.appendChild(pad); add(root, body, UI.nav('bag'));
    };
    const merge = (it) => { const out = H.mergeItems(S, it, rnd); if (!out) return; Au.sfx('evolve'); UI.save(); draw(); UI.modal(txt('disp big center', tr('Merged!')), UI.itemRow(out), key(tr('Great'), UI.closeModal, 'go wide big')); };
    const sheet = (it) => {
      const who = H.itemOwner(S, it.id), kids = [UI.itemRow(it), who ? txt('center', tr('<b>{n}</b> is wearing this.', { n: H.FORMS[who.form].n })) : txt('center dim', tr('Nobody is wearing this.'))];
      // take it off right here, without a trip to the pet's page; the sheet then shows the piece as spare
      if (who) kids.push(key(tr('Take it off {n}', { n: H.FORMS[who.form].n }), () => { H.unequip(S, who, who.gear.indexOf(it.id)); Au.sfx('back'); UI.save(); draw(); sheet(it); }, 'wide gold'), key(tr('Give to another pet'), () => wearer(it), 'wide soft'), key(tr('Go to {n}', { n: H.FORMS[who.form].n }), () => UI.go('pet', { id: who.id, back: 'bag' }), 'wide soft'));
      else {
        kids.push(key(tr('Equip on a pet'), () => wearer(it), 'wide go'));
        if (H.canMerge(S, it)) { const m = key(tr('Merge 3 → {n}', { n: H.RARITY[H.RARITY_ORDER[H.RARITY_ORDER.indexOf(it.rar) + 1]].n }), () => { UI.closeModal(); merge(it); }, 'gold wide'); kids.push(m); }
        else if (it.rar === 'e' && !H.freeLegends(S, it.type).length) kids.push(txt('small dim center', tr('Every Legendary of this kind is yours.')));
        else if (it.rar !== 'l') kids.push(txt('small dim center', tr('Merge: {length} / 3 spare', { length: H.spareItems(S).filter((x) => x.type === it.type && x.rar === it.rar).length })));
        const doSell = () => { H.sellItem(S, it.id); Au.sfx('coin'); UI.save(); UI.closeModal(); draw(); };
        // a Legendary is never sold by a slip of the finger
        const sell = key('', () => (it.rar === 'l' ? UI.confirm(tr('Sell this Legendary?'), tr('{item} is rare and hard to find again.', { item: H.itemName(it) }), tr('Sell'), doSell, 'coral') : doSell()), 'wide soft'); add(sell, tr('Sell') + ' · ', UI.icon('ic_note'), String(H.RARITY[it.rar].sell)); kids.push(sell);
      }
      kids.push(key(tr('Close'), UI.closeModal, 'wide')); UI.modal(...kids);
    };
    // who should wear a piece: the band first, then everyone else; a pet with both slots full picks which piece goes back to the bag
    const wearer = (it) => {
      const band = H.teamPets(S).filter(Boolean), rest = S.pets.filter((p) => !band.includes(p)).sort((a, b) => H.petTier(b) - H.petTier(a) || (b.rank || 0) - (a.rank || 0));
      const put = (p, slot) => { const from = H.itemOwner(S, it.id); H.equip(S, p, slot, it.id); Au.sfx('good'); UI.save(); UI.closeModal(); draw(); UI.toast(from && from !== p ? tr('{n} wears it now. Taken from {m}.', { n: H.FORMS[p.form].n, m: H.FORMS[from.form].n }) : tr('{n} wears it now.', { n: H.FORMS[p.form].n })); };
      const row = (p) => {
        const b = el('button', 'item'); b.type = 'button'; add(b, UI.sp(p.form, 0.55, { anim: false }), el('div', 'grow', `<b>${H.FORMS[p.form].n}</b>`));
        const icons = box('row'); p.gear.forEach((id) => { const g = id && H.itemById(S, id); icons.appendChild(g ? UI.icon(A.itemIcon(g), 0.9) : UI.icon('ic_plus', 0.7)); }); b.appendChild(icons);
        if (p.gear.includes(it.id)) b.disabled = true;
        b.addEventListener('click', () => {
          Au.sfx('tap'); const free = p.gear.indexOf(null); if (free >= 0) return put(p, free);
          const kids = [txt('disp', tr('Which piece should it replace?')), txt('small dim', tr('The piece you pick goes back to your bag.'))];
          p.gear.forEach((id, slot) => { const g = H.itemById(S, id), r = UI.itemRow(g, 'button'); r.addEventListener('click', () => put(p, slot)); kids.push(r); });
          kids.push(key(tr('Back'), () => wearer(it), 'wide soft')); UI.modal(...kids);
        });
        return b;
      };
      const kids = [txt('disp', tr('Who should wear it?')), UI.itemRow(it)];
      if (band.length) kids.push(txt('label', tr('Band')), ...band.map(row));
      if (rest.length) kids.push(txt('label', tr('Pets')), ...rest.map(row));
      kids.push(key(tr('Back'), () => sheet(it), 'wide soft')); UI.modal(...kids);
    };
    draw();
  };

  /* ================= rehearsal: a beaten boss again, at your own level, for an echo ================= */
  UI.screens.rehearsal = (root) => {
    const S = UI.S; UI.music('camp', regionOf(S.stage)); if (H.refreshRehearsals(S)) UI.save();
    root.appendChild(UI.topbar(tr('Rehearsal'), () => UI.go('gigs'), UI.wallet()));
    const body = el('div', 'scroll'), pad = el('div', 'pad'); pad.style.paddingTop = '0';
    const list = H.rehearsals(S).reverse();
    if (!list.length) add(pad, box('row center', UI.icon('ic_baton', 3)), txt('dim center', tr('Opens after the boss on floor 10.')));
    else {
      const left = list.filter((m) => !S.reh[m]).length, days = H.daysToReset(Date.now());
      pad.appendChild(txt('small center', tr('Beaten bosses return at <b>your level</b>.')));
      pad.appendChild(txt('small dim center', (left ? '' : tr('All won this week') + ' · ') + tr('Resets in {n} days', { n: days })));
    }
    list.sort((a, b) => (S.reh[a] ? 1 : 0) - (S.reh[b] ? 1 : 0)).forEach((n) => {
      const st = H.stage(n), R = H.REGIONS[st.region], d = H.DIN[R.boss], done = !!S.reh[n], b = el('button', 'item ' + (done ? 'r-c' : 'r-l')); b.type = 'button'; b.setAttribute('aria-label', tr(done ? '{din}, {region}, won this week' : '{din}, {region}, reward 1 echo', { din: d.n, region: R.n }));
      add(b, UI.sp(R.boss, 0.42, { flip: true, anim: false }), el('div', 'grow', `<div class="rar">${R.n}</div><b>${d.n}</b>`), done ? UI.icon('ic_check', 1.3) : UI.purse('ic_echo', '+' + H.ECHO_REH));
      b.addEventListener('click', () => { Au.sfx('tap'); S.settings.auto = 0; UI.go('battle', { n, reh: 1 }); }); pad.appendChild(b);
    });
    body.appendChild(pad); root.appendChild(body);
  };

  /* ================= encore: endless waves, the same band all the way, weekly milestone rewards ================= */
  UI.screens.encore = (root) => {
    const S = UI.S; UI.music('camp', regionOf(S.stage)); if (H.refreshEncore(S)) UI.save(); S.flags.seenEnc = 1;
    const E = S.encore, run = S.encoreRun, M = H.ENCORE.miles;
    root.appendChild(UI.topbar(tr('Encore'), () => UI.go('gigs'), UI.wallet()));
    const body = el('div', 'scroll'), pad = el('div', 'pad'), foot = el('div', 'gofoot'); pad.style.paddingTop = 'calc(var(--u) * 4)';
    if (!H.encoreOpen(S)) {
      add(pad, box('row center', UI.icon('ic_lock', 3)), txt('dim center', tr('Encore opens at level {unlock}.', { unlock: H.ENCORE.unlock })));
      body.appendChild(pad); root.append(body); return;
    }
    // a neon-lit stage with the band on it, waiting for the crowd to call them back
    const hh = Math.max(100, Math.min(130, UI.Hh - 240)) + (run ? 8 : 0), hero = el('div', 'enchero'); hero.style.height = `calc(var(--u) * ${hh})`;
    // the band on stage; in a run, each pet's HP under it
    const stage = el('div', 'encstage'); H.encoreTeam(S).forEach((p) => { if (!p) return; const hp = run ? run.hp[p.id] || 0 : 1, c = el('div', 'encpet' + (hp > 0 ? '' : ' down')); add(c, UI.sp(p.form, 0.9, { anim: hp > 0 }), run ? UI.meter(hp) : null, run ? el('b', '', hp > 0 ? Math.round(hp * 100) + '%' : tr('Out')) : null); stage.appendChild(c); });
    add(hero, UI.bgEl('neon', UI.W, hh, 0.62), el('div', 'neonsign' + (window.__hsSpeed ? '' : ' poweron'), tr('Encore')), stage); root.appendChild(hero);
    pad.appendChild(txt('small center', tr('Endless waves, each a little tougher. HP carries over, and a quarter comes back after each wave.')));
    // this week's milestones
    const days = H.daysToReset(Date.now()), miles = UI.track(M.map(([m, r], i) => ({ k: m, icon: r.echo ? 'ic_echo' : 'ic_shell', n: '+' + (r.echo || r.shells), got: E.paid > i, label: tr('Wave {n}', { n: m }) })), 'neon');
    add(pad, add(el('div', 'payline'), txt('label', tr('This week')), miles), txt('small dim center', tr('Best this week <b>{week}</b> · all time <b>{best}</b>', { week: E.weekBest, best: E.best }) + ' · ' + tr('resets in {n} days', { n: days })));
    const rk = key('', () => UI.go('ranks', { tab: 'encore_week', from: 'encore' }), 'soft sm rankk'); add(rk, UI.icon('ic_trophy', 0.9), el('span', '', tr('See the ranks'))); pad.appendChild(rk);
    if (run) {
      foot.appendChild(key(tr('Play wave {wave}', { wave: run.wave }), () => UI.go('battle', { enc: 1 }), 'go wide big'));
      foot.appendChild(key(tr('End this run'), () => UI.confirm(tr('End this run?'), tr('Rewards stay yours.'), tr('End run'), () => { H.endEncore(S); UI.save(); UI.go('encore'); }), 'wide soft'));
    } else {
      const ready = H.teamPets(S).some(Boolean), start = key(tr('Start Encore'), () => { H.startEncoreRun(S, Math.random); UI.save(); UI.go('battle', { enc: 1 }); }, 'go wide big'); start.disabled = !ready;
      foot.appendChild(start); foot.appendChild(key(tr('Change the band'), () => UI.go('team', {}), 'wide soft'));
    }
    body.appendChild(pad); add(root, body, foot);
  };

  /* ================= records: hard goals by game mode, paid in shells, echoes and stage sets ================= */
  UI.screens.records = (root) => {
    const S = UI.S; UI.music('camp', regionOf(S.stage));
    const order = { ready: 0, open: 1, claimed: 2 };
    const claim = (r) => { const got = H.claimRecord(S, r.id); if (!got) return; Au.sfx('win'); UI.save(); draw(); UI.modal(box('row center spinin', UI.icon('ic_record', 4)), txt('disp big center', got.n), txt('center', got.d), box('loot', got.shells ? UI.purse('ic_shell', '+' + got.shells) : null, got.echo ? UI.purse('ic_echo', '+' + got.echo) : null, got.echo ? UI.echoIntro() : null, got.bg ? txt('chip', tr('New stage set: {set}', { set: H.SETS[got.bg] })) : null), key(tr('Great'), UI.closeModal, 'go wide big')); };
    const reward = (r) => { const rew = el('div', 'row small rew'); if (r.shells) rew.appendChild(UI.purse('ic_shell', '+' + r.shells, tr('Shells'))); if (r.echo) rew.appendChild(UI.purse('ic_echo', '+' + r.echo, tr('Echoes'))); if (r.bg) rew.appendChild(add(el('span', 'chip'), tr('Set: {set}', { set: H.SETS[r.bg] }))); return rew; };
    const draw = () => {
      const keep = root.querySelector('.scroll'), top = keep ? keep.scrollTop : 0;
      root.innerHTML = ''; root.appendChild(UI.topbar(tr('Records'), () => UI.go('home'), UI.wallet()));
      const body = el('div', 'scroll'), pad = el('div', 'pad'); pad.style.paddingTop = '0';
      const sets = H.ownedSets(S);
      if (sets.length) {
        const row = el('div', 'sets'), opt = (k, name, bg) => { const b = el('button', 'set' + ((S.homeBg || null) === k ? ' on' : '')); b.type = 'button'; add(b, UI.bgEl(bg, 54, 34, 0.5), el('span', '', name)); b.addEventListener('click', () => { S.homeBg = k; Au.sfx('good'); UI.save(); draw(); }); return b; };
        row.appendChild(opt(null, tr('Current floor'), regionOf(S.stage))); sets.forEach((k) => row.appendChild(opt(k, H.SETS[k], k)));
        add(pad, txt('label', tr('Home stage set')), row);
      }
      for (const [cat, name] of H.RECORD_CATS) {
        const list = H.RECORDS.filter((r) => r.cat === cat), done = list.filter((r) => S.records[r.id]).length;
        pad.appendChild(box('row between cathd', txt('disp', tr(name)), txt('chip', done + ' / ' + list.length)));
        const mini = el('div', 'minis');
        list.slice().sort((a, b) => order[H.recordState(S, a)] - order[H.recordState(S, b)]).forEach((r) => {
          const state = H.recordState(S, r), [a, b] = r.prog(S);
          if (r.ens) {   // one small tile per ensemble: win a rehearsal with it
            const c = el(state === 'ready' ? 'button' : 'div', 'recm ' + state); c.setAttribute('aria-label', r.d + H.T.sep() + tr(state === 'claimed' ? 'Done.' : state === 'ready' ? 'Claim 1 echo.' : 'Reward: 1 echo.'));
            const fams = el('div', 'row fams'); H.ENS[r.ens].fam.forEach((f) => fams.appendChild(UI.icon('fam_' + f, 0.85)));
            add(c, add(el('div', 'grow col'), el('b', '', r.n), fams), state === 'claimed' ? UI.icon('ic_check', 1.1) : state === 'ready' ? el('span', 'chip tag-on', tr('Claim')) : UI.purse('ic_echo', '+' + r.echo));
            if (state === 'ready') { c.type = 'button'; c.addEventListener('click', () => claim(r)); }
            mini.appendChild(c); return;
          }
          const c = el('div', 'rec ' + state), m = UI.meter(Math.min(1, a / b)); m.classList.add('gold');
          add(c, UI.icon(state === 'open' ? 'ic_recordoff' : 'ic_record', 1.5), add(el('div', 'grow col'), el('b', 'rn', r.n), el('div', 'small', r.d), state === 'claimed' || b === 1 ? null : box('row', add(el('div', 'grow'), m), txt('small dim', `${UI.fmt(Math.min(a, b))} / ${UI.fmt(b)}`)), state === 'claimed' ? null : reward(r)));
          if (state === 'ready') c.appendChild(key(tr('Claim'), () => claim(r), 'go sm')); else if (state === 'claimed') c.appendChild(UI.icon('ic_check', 1.2));
          pad.appendChild(c);
        });
        if (mini.children.length) { add(pad, txt('label', tr('Win a rehearsal with each ensemble')), mini); }
      }
      body.appendChild(pad); root.appendChild(body); body.scrollTop = top;
    };
    draw();
  };
})(window.H);
