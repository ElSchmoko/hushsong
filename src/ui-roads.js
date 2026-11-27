/* Hushsong Roads (preview) — the map screen: the 3D map with the quest tracker, the card at the bottom, venues, results and pets joining. */
(function (H) {
  'use strict';
  const UI = H.UI, A = H.Art, Au = H.Audio, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key, tr = (s, v) => H.T(s, v);
  const R = H.ROADS, Rd = H.Roads, W = H.RW, M = H.RoadsMap;
  const RU = (UI.Roads = {});
  const qIndex = (id) => R.QUESTS.findIndex((q) => q.id === id);
  const placeName = (P) => tr(P.n);
  const petName = (sp) => H.FORMS[sp].n;

  /* ---------- what the map shows ---------- */
  const songOf = (t) => { const S = Rd.S, bd = S.bosses[t.reg]; if (t.closed || !t.kind && !t.owner) return bd && !t.closed ? 1 : 0; if (bd) return 1; if (t.owner && S.caps[t.owner]) return 1; return S.hum[W.key(t.q, t.r)] ? 0.5 : 0; };
  const target = () => {
    const S = Rd.S, q = Rd.quest(); if (!q) return null;
    if (q.id === 'walk') return Rd.BEND;
    if (q.id === 'fight') return Rd.group('tut1').home;
    if (q.id === 'friend') return Rd.group('tut2').home;
    if (q.id === 'wake') { const g = Rd.GROUPS.find((x) => x.place === 'hush' && x.guard && Rd.groupLive(x)); return g ? g.home : Rd.poiT('hush'); }
    if (q.id === 'build' || q.id === 'smith') return Rd.poiT('hush');
    if (q.id === 'chapel') return Rd.poiT('chapel');
    if (q.cap) return Rd.poiT(q.cap);
    if (q.boss) return Rd.poiT(R.REGIONS[q.boss].stage);
    if (q.all) { const here = M.here(); const left = Rd.capsOf(q.all).filter((id) => !S.caps[id]).map((id) => Rd.poiT(id)); return left.sort((a, b) => W.hexDist(a, here) - W.hexDist(b, here))[0] || null; }
    return null;
  };
  const sprites = () => {
    const S = Rd.S, G = M.G, out = [], now = G.now, b = G.band;
    if (b) {
      const moving = !!b.to;
      Rd.bandPets().filter(Boolean).reverse().map((p, i, arr) => [p.form, (arr.length - 1 - i) * 0.56, 1]).forEach(([k, dist, size], i) => {
        const p = dist ? M.at(dist) : { x: b.x, z: b.z, face: b.face };
        out.push({ key: k, x: p.x, z: p.z, size, hop: moving && k !== 'rd_wagon' ? Math.abs(Math.sin(now * 9 + i * 1.3)) * 0.12 : 0, flip: (p.face || 1) < 0 && k === 'rd_wagon', band: true });
      });
    }
    for (const g of Rd.liveGroups()) {
      const f = Rd.foes(g), t = g.home, hop = Math.abs(Math.sin(now * 3 + t.q)) * 0.05;
      out.push({ key: f.din[0].id, x: t.x, z: t.z, size: g.guard ? 1.15 : 1.05, hop, pick: { group: g }, flip: true });
    }
    for (const P of R.PLACES) {
      const t = Rd.poiT(P.id);
      if (P.cap || P.stage || P.dungeon) out.push({ key: P.art, x: t.x, z: t.z - 0.4, tile: t, size: P.stage ? 2.4 : 2.2, song: P.dungeon ? (S.chapel.cleared ? 1 : 0) : t.song, pick: { place: P } });
      if (P.cap && !S.caps[P.id] && S.quest >= qIndex('wake')) out.push({ key: P.keeper, x: t.x + 1.05, z: t.z + 0.1, tile: t, size: 1.15, hop: Math.abs(Math.sin(now * 2)) * 0.04, pick: { place: P }, flip: true });
      if (P.stage && Rd.bossOpen(P.reg) && !Rd.bossDone(P.reg)) out.push({ key: P.boss, x: t.x + 1.1, z: t.z + 0.15, tile: t, size: 1.3, hop: Math.abs(Math.sin(now * 1.5)) * 0.05, pick: { place: P }, flip: true });
      if (P.cap && S.caps[P.id]) (S.builds[P.id] || []).forEach((bid, i) => { const o = [[-1.15, 0.35], [1.15, 0.45], [0.1, 1.0]][i]; out.push({ key: R.BUILDS[bid].art, x: t.x + o[0], z: t.z + o[1], tile: t, size: 0.9, song: t.song }); });
      if (P.secret && S.found[P.id + '_seen'] && !S.found[P.id]) {
        if (P.secret === 'page') out.push({ key: 'rd_page', x: t.x, z: t.z, tile: t, size: 0.65, hop: 0.15 + Math.sin(now * 3) * 0.06, pick: { place: P } });
        else { out.push({ key: 'rd_glade', x: t.x, z: t.z - 0.2, tile: t, size: 1.3, pick: { place: P } }); out.push({ key: P.pet, x: t.x + 0.55, z: t.z + 0.2, tile: t, size: 0.8, grey: true, hop: Math.abs(Math.sin(now * 2.2)) * 0.06, pick: { place: P } }); }
      }
    }
    const ht = Rd.poiT('hush'); out.push({ key: R.TILLY.sprite, x: ht.x - 1.0, z: ht.z + 0.55, tile: ht, size: 0.85, hop: Math.abs(Math.sin(now * 1.4)) * 0.03, pick: { tilly: 1 } });
    const tg = target(); if (tg) out.push({ key: 'rd_mark', x: tg.x, z: tg.z, tile: tg, size: 0.62, hop: 1.5 + Math.sin(now * 3) * 0.12, noShadow: true });
    return out;
  };

  /* ---------- the screen ---------- */
  let card = null, labels = [], tracker = null, chipEls = null, regionLabels = [];
  UI.screens.roads = (root, pr) => {
    if (!Rd.S) Rd.load();
    const S = Rd.S;
    if (!S.started || !S.pets.length) return UI.go('roadsstory', { scene: 'prologue' });
    root.classList.add('rd-root');
    if (!M.ready) {
      add(root, box('rd-wait', UI.sp('rd_wagon', 1.6), txt('disp', tr('Raising the map…'))));
      M.load(() => { if (UI.cur && UI.cur.name === 'roads') UI.go('roads', pr); }, () => { root.innerHTML = ''; add(root, box('rd-wait', txt('disp', tr('The map needs the internet the first time.')), key(tr('‹ Home'), () => UI.go('home'), 'soft'))); });
      return {};
    }
    UI.music('camp', R.REGIONS[Rd.hereReg()].bg);
    const mapBox = el('div', 'rd-map'), labelBox = el('div', 'rd-labels'); add(root, mapBox, labelBox);
    // top: home, player level, purses
    const top = el('div', 'rd-top'); chipEls = {};
    const home = key(tr('‹ Home'), () => { Au.sfx('back'); UI.go('home'); }, 'soft sm backk');
    const lv = el('button', 'rd-lv'); lv.type = 'button'; chipEls.lv = lv; lv.addEventListener('click', () => { Au.sfx('tap'); RU.talents(); });
    chipEls.notes = UI.purse('ic_note', S.notes, tr('Notes')); chipEls.echo = UI.purse('ic_echo', S.echo, tr('Echoes'));
    add(top, home, lv, el('span', 'grow'), chipEls.notes, chipEls.echo); root.appendChild(top);
    tracker = el('button', 'rd-quest'); tracker.type = 'button'; tracker.addEventListener('click', () => { const t = target(); if (t) { M.G.cam.x = t.x; M.G.cam.z = t.z; M.G.follow = false; Au.sfx('tap'); } }); root.appendChild(tracker);
    // bottom: the card and the dock
    card = el('div', 'rd-card'); const bottom = el('div', 'rd-bottom'); root.appendChild(bottom); bottom.appendChild(card);
    const ctr = el('button', 'rd-centre'); ctr.type = 'button'; ctr.setAttribute('aria-label', tr('Back to the band')); ctr.appendChild(UI.icon('ic_home', 1)); ctr.addEventListener('click', () => { Au.sfx('tap'); M.G.follow = true; M.G.zoom = Math.max(M.G.zoom, 0.8); }); root.appendChild(ctr);
    const dock = el('div', 'rd-dock'), dk = (icon, label, fn, pip) => { const b = el('button', 'rd-dk'); b.type = 'button'; add(b, UI.icon(icon, 1.05), el('span', '', label)); if (pip) b.appendChild(el('span', 'pip', String(pip))); b.addEventListener('click', () => { Au.sfx('tap'); fn(); }); return b; };
    add(dock, dk('ic_team', tr('Band'), () => UI.go('roadsband', {})), dk('ic_star', tr('Talents'), () => RU.talents(), Rd.points() || 0), dk('ic_record', tr('Songbook'), () => RU.book(), Rd.bookDone() && !S.flags.book ? '!' : 0));
    bottom.appendChild(dock);
    regionLabels = W.REG_ORDER.map((id) => { const R0 = W.REG[id], l = el('div', 'rd-reg' + (R0.closed ? ' closed' : '')); labelBox.appendChild(l); const t = W.list.filter((u) => u.reg === id && u.kind).sort((a, b) => Math.hypot(a.x - R0.at[0], a.z - R0.at[1]) - Math.hypot(b.x - R0.at[0], b.z - R0.at[1]))[0]; return { id, l, t }; });
    // place names over the map
    labels = R.PLACES.filter((P) => P.cap || P.stage || P.dungeon).map((P) => { const l = el('div', 'rd-lab' + (P.dungeon ? ' dun' : P.stage ? ' boss' : '')); l.textContent = placeName(P); labelBox.appendChild(l); return { P, l }; });

    M.songOf = songOf; M.G.sprites = sprites; M.speed = Rd.has('feet') ? 3.1 : 2.4;
    const here = S.pos ? W.at(S.pos.q, S.pos.r) : Rd.poiT('hush');
    if (!M.G.band || M.here() !== here) M.placeBand(here);
    M.G.onTap = onTap; M.G.onStep = onStep; M.G.onArrive = onArrive; M.onFrame = frame;
    M.attach(mapBox);
    refresh(); idle();
    // after a battle: the result, then whatever it set going
    if (pr.res) setTimeout(() => RU.result(pr.res), 60); else setTimeout(nextUp, 300);
    return { leave: () => { M.detach(); M.onFrame = null; } };
  };
  const refresh = () => {
    const S = Rd.S; if (!chipEls) return;
    chipEls.lv.innerHTML = ''; add(chipEls.lv, el('b', '', tr('Lv {n}', { n: S.plv })), UI.meter(S.plv >= R.MAX_PLAYER ? 1 : S.pxp / R.playerNeed(S.plv))); if (Rd.points()) chipEls.lv.appendChild(el('span', 'pip', String(Rd.points())));
    chipEls.notes.querySelector('.pn').textContent = UI.fmt(S.notes); chipEls.echo.querySelector('.pn').textContent = UI.fmt(S.echo);
    const q = Rd.quest(); tracker.innerHTML = '';
    if (q) { let goal = tr(q.goal); if (q.all) goal += ' · ' + Rd.capCount(q.all) + '/' + Rd.capTotal(q.all); if (q.id === 'wake') goal += ' · ' + (2 - Rd.guardsLeft('hush')) + '/2'; add(tracker, UI.icon('ic_bang', 0.8), add(el('div', 'grow'), el('b', '', tr(q.n)), el('span', '', goal))); }
    tracker.hidden = !q;
  };
  RU.refresh = refresh;
  const frame = () => {
    const far = M.G.zoom < 0.55;
    for (const { id, l, t } of regionLabels) { const p = far && t && M.project(t, 1); if (!p) { l.style.opacity = 0; continue; } l.style.opacity = p.a; l.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%)`; const R0 = W.REG[id], land = W.list.filter((u) => u.reg === id && u.kind && !u.closed);
      const shut = !Rd.regOpen(id); l.classList.toggle('closed', shut);
      l.innerHTML = `<b>${tr(R0.n)}</b><span>${shut ? (R.REGIONS[id] ? tr('Closed · beat the boss before it') : tr('Closed · later preview')) : tr('{n}/{m} places · {s} sings', { n: Rd.capCount(id), m: Rd.capTotal(id), s: Math.round((land.reduce((a, u) => a + (u.song || 0), 0) / Math.max(1, land.length)) * 100) + '%' })}</span>`; }
    for (const { P, l } of labels) {
      const p = !far && M.project(Rd.poiT(P.id), P.stage ? 2.7 : 2.4);
      if (!p) { l.style.opacity = 0; continue; }
      l.style.opacity = p.a * W.sat((p.y - 60) / 30); l.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-100%)`;
      l.classList.toggle('open', !!(Rd.S.caps[P.id] || (P.stage && Rd.bossDone(P.reg))));
    }
  };

  /* ---------- the card at the bottom ---------- */
  const setCard = (title, sub, hint, acts) => {
    if (!card) return; card.innerHTML = '';
    add(card, el('div', 'rd-ct', title), sub ? el('div', 'rd-cs', sub) : null, hint ? el('div', 'rd-ch', hint) : null);
    if (acts && acts.length) card.appendChild(add(el('div', 'rd-ca'), ...acts.map(([label, fn, cls]) => key(label, fn, cls || 'go'))));
  };
  RU.setCard = setCard;
  const kindName = (t) => tr((t.reg === 'dunes' ? W.KIND_DUNES : W.KIND)[t.kind].n);
  const quietName = (t) => (t.song > 0.9 ? tr('singing') : t.song > 0.3 ? tr('humming') : tr('silent'));
  const areaName = (t) => (t.owner ? tr('{place} lands', { place: placeName(Rd.place(t.owner)) }) : tr(W.REG[t.reg].n));
  const idle = () => { const t = M.here(); if (!t) return; setCard(tr('Your band'), areaName(t) + ' · ' + kindName(t).toLowerCase() + ' · ' + quietName(t), tr('Tap the land to travel. Drag to look around, pinch to zoom.')); };
  RU.idle = idle;

  /* ---------- moving and tapping ---------- */
  const go = (t, intent) => {
    const here = M.here(), path = t === here ? [] : W.path(here, t, null, Rd.allowed);
    if (!path) { UI.toast(tr('No way through from here.')); return false; }
    if (!path.length) { onArrive(here, intent); return true; }
    M.travel(path, intent); return true;
  };
  const nextTo = (t) => { const here = M.here(); if (W.hexDist(here, t) <= 1) return here; let best = null, bl = 1e9; for (const n of W.nbs(t)) { if (!Rd.allowed(n)) continue; const p = W.path(here, n, null, Rd.allowed); if (p && p.length < bl) { bl = p.length; best = n; } } return best; };
  const onTap = (t, s) => {
    if (s && s.pick) { if (s.pick.group) return tapGroup(s.pick.group); if (s.pick.place) return tapPlace(s.pick.place); if (s.pick.tilly) return RU.talk(); }
    if (!t) return;
    const g = Rd.liveGroups().find((x) => x.home === t); if (g) return tapGroup(g);
    if (t.poi && (t.poi.cap || t.poi.stage || t.poi.dungeon || (t.poi.secret && Rd.S.found[t.poi.id + '_seen'] && !Rd.S.found[t.poi.id]))) return tapPlace(Rd.place(t.poi.id));
    if (!Rd.allowed(t)) {
      if (t.closed) return closedCard(t);
      if (W.walk(t)) return setCard(tr('Not yet'), areaName(t), tr('Tilly wants you near Hushwick until it is awake.'));
      return setCard(kindName(t), areaName(t) + ' · ' + quietName(t), tr((t.reg === 'dunes' ? W.KIND_DUNES : W.KIND)[t.kind].d || W.KIND[t.kind].d));
    }
    if (go(t, null)) setCard(tr('On the road'), areaName(t) + ' · ' + kindName(t).toLowerCase(), tr('Tap the land to travel.'));
  };
  const tapGroup = (g) => {
    const here = M.here();
    if (W.hexDist(here, g.home) <= 1 && !M.moving()) return fightCard(g);
    const n = nextTo(g.home); if (!n) return UI.toast(tr('No way through from here.'));
    const f = Rd.foes(g); setCard(dinNames(f), tr('Din · level {n}', { n: g.lv }), tr('On the way…')); go(n, { group: g });
  };
  const closedCard = (t) => { const prev = Object.keys(R.REGIONS).find((k) => R.REGIONS[k].opens === t.reg);
    return setCard(tr(W.REG[t.reg].n), tr('Closed · thick noise'), prev ? tr('This land is still deep in noise. It thins once {reg} sings and its boss is beaten.', { reg: tr(W.REG[prev].n) }) : tr('This land is still deep in noise. Its road opens in a later preview.')); };
  const tapPlace = (P) => { if (Rd.poiT(P.id).closed) return closedCard(Rd.poiT(P.id));
    const t = Rd.poiT(P.id);
    if (P.secret && !Rd.allowed(t)) return setCard(tr(P.n), tr('Secret'), tr('Not yet.'));
    if (M.here() === t && !M.moving()) return onArrive(t, { place: P });
    setCard(placeName(P), tr(P.kind), tr('On the way…')); go(t, { place: P });
  };
  const dinNames = (f) => H.T.list(f.din.map((d) => H.DIN[d.id].n).concat(f.pet ? [tr('Wild {pet}', { pet: petName(f.pet.sp) })] : []));
  const onStep = (t) => {
    const out = Rd.enter(t); refresh();
    for (const id of out.found) { const P = Rd.place(id); UI.toast(P.secret === 'page' ? tr('Something glints nearby.') : tr('You hear a quiet tune nearby.')); Au.sfx('star'); }
    const P = t.poi && Rd.place(t.poi.id);
    if (P && P.secret === 'page' && Rd.S.found[P.id + '_seen'] && !Rd.S.found[P.id]) { takePage(P); return true; }
    // Din next to the road stop the band
    const intent = M.G.band.intent, near = Rd.liveGroups().find((g) => W.hexDist(g.home, t) <= 1);
    if (near && !(intent && intent.group === near && M.G.band.path.length)) { M.G.band.intent = null; fightCard(near, !(intent && intent.group === near)); return true; }
    if (Rd.done.length) { setTimeout(nextUp, 200); return true; }
    return false;
  };
  const onArrive = (t, intent) => {
    if (intent && intent.group) { if (Rd.groupLive(intent.group)) fightCard(intent.group); else idle(); return; }
    if (intent && intent.place) return placeCard(intent.place);
    idle();
  };

  /* ---------- fights ---------- */
  const toBattle = () => { UI.flashOut(() => UI.go('battle', { roads: 1 })); };
  UI.flashOut = (fn) => { const f = el('div', 'rd-flash'); document.getElementById('game').appendChild(f); Au.sfx('boss'); setTimeout(() => { fn(); setTimeout(() => f.remove(), 260); }, 260); };
  const bandReady = () => { if (Rd.bandPets().some(Boolean)) return true; UI.toast(tr('Put a pet in your band first.')); return false; };
  const fightCard = (g, ambush) => {
    const f = Rd.foes(g), hint = g.guard ? tr('It guards {place}.', { place: placeName(Rd.place(g.place)) }) : tr('Din eat songs. Sometimes a wild pet is stuck with them: beat the Din first and it stops fighting.');
    setCard(dinNames(f), (ambush ? tr('They block the road') + ' · ' : '') + tr('level {n}', { n: g.lv }), hint, [[tr('Fight'), () => { if (!bandReady()) return; Rd.fightGroup(g); toBattle(); }, 'coral']]);
  };
  const placeCard = (P) => {
    const S = Rd.S, t = Rd.poiT(P.id);
    if (P.cap) {
      if (S.caps[P.id]) return setCard(tr(P.venue), placeName(P) + ' · ' + tr('yours'), tr('Rest, build, and see what is on offer.'), [[tr('Enter'), () => RU.venue(P), 'gold']]);
      if (S.quest < qIndex('wake')) return setCard(placeName(P), tr(P.kind) + ' · ' + tr('silent'), tr('Tilly is waiting by the well.'), [[tr('Talk to Tilly'), () => RU.talk(), 'go']]);
      const left = Rd.guardsLeft(P.id);
      if (left) return setCard(placeName(P), tr(P.kind) + ' · ' + tr('silent'), tr('{n} Din groups guard the way in. Beat them first.', { n: left }));
      const kd = H.DIN[P.keeper];
      return setCard(tr('Loud {din}', { din: kd.n }), tr('Keeper of {place} · level {n}', { place: placeName(P), n: P.lv[1] }), tr('Win, and {place} is yours.', { place: placeName(P) }), [[tr('Fight'), () => { if (!bandReady()) return; Rd.fightKeeper(P.id); toBattle(); }, 'coral']]);
    }
    if (P.stage) {
      if (Rd.bossDone(P.reg)) return setCard(placeName(P), tr('Boss stage · singing'), tr(P.doneD));
      if (!Rd.bossOpen(P.reg)) return setCard(placeName(P), tr('Boss stage · closed'), tr('A wall of fog. It lifts when every place in {reg} is yours ({n}/{m}).', { reg: tr(W.REG[P.reg].n), n: Rd.capCount(P.reg), m: Rd.capTotal(P.reg) }));
      return setCard(H.DIN[P.boss].n, tr('Boss · level {n}', { n: P.lv[0] }), tr(P.bossD), [[tr('Fight'), () => { if (!bandReady()) return; Rd.fightBoss(P.id); toBattle(); }, 'coral']]);
    }
    if (P.dungeon) {
      if (S.quest < qIndex('wake') + 1) return setCard(placeName(P), tr('Dungeon · closed'), tr('Water fills the doorway. Come back once Hushwick is awake.'));
      return setCard(placeName(P), tr('Dungeon') + (S.chapel.cleared ? ' · ' + tr('cleared') : ''), tr('A side-scrolling run: Din in the dark, a chest or two, and something that still sings at the end.'), [[tr('Go in'), () => { if (!bandReady()) return; UI.flashOut(() => UI.go('roadschapel', {})); }, 'gold']]);
    }
    if (P.secret === 'pet') {
      if (S.found[P.id]) return setCard(tr(P.n), tr('Secret · found'), tr('Just a stump and some flowers now.'));
      return setCard(tr('Wild {pet}', { pet: petName(P.pet) }), tr('Secret · level {n}', { n: P.lv }), tr('A {pet} plays alone in the glade, all grey. Win it over.', { pet: petName(P.pet) }), [[tr('Fight'), () => { if (!bandReady()) return; Rd.fightGlade(P.id); toBattle(); }, 'coral']]);
    }
    if (P.secret === 'page') return takePage(P);
    return idle();
  };
  const takePage = (P) => {
    const r = Rd.takePage(P.id); if (!r) return idle(); refresh(); Au.sfx('win');
    const t = Rd.poiT(P.id); M.notes(t.x, t.z, 6);
    UI.modal(UI.sp('rd_page', 1.6), txt('disp', tr('A lost page')), txt('dim', tr('A torn page of "{song}". The rest of it is somewhere out there.', { song: tr(P.song) })),
      box('row wrap center', UI.notes(r.notes), UI.echoes(r.echo), el('span', 'chip', tr('+{n} XP', { n: r.pxp }))), key(tr('Nice'), () => { UI.closeModal(); idle(); nextUp(); }, 'go wide'));
  };

  /* ---------- after a battle ---------- */
  RU.result = (out, done) => {
    const S = Rd.S, kids = [];
    if (!out.win) {
      kids.push(txt('disp big', tr('Your band is out')), txt('dim', tr('They limp back to {venue}. Nothing is lost. Level up a little and try again.', { venue: tr(Rd.place(out.back).venue || Rd.place(out.back).n) })));
      kids.push(key(tr('OK'), () => { UI.closeModal(); idle(); }, 'go wide big'));
      const t = Rd.poiT(out.back); Rd.S.pos = { q: t.q, r: t.r }; M.placeBand(t); Rd.save();
      return UI.modal(...kids);
    }
    kids.push(txt('disp big', out.boss ? tr('Muffle is gone!') : out.capture ? tr('{place} is yours!', { place: placeName(Rd.place(out.capture)) }) : tr('You win!')));
    const rew = box('row wrap center', UI.notes(out.notes), el('span', 'chip', tr('+{n} XP', { n: out.pxp })));
    if (out.echo) rew.appendChild(UI.echoes(out.echo));
    kids.push(rew);
    if (out.holdNotes) kids.push(txt('small dim center', tr('{n} of those notes came from your holdings.', { n: out.holdNotes })));
    if (out.pups) kids.push(box('rd-lvup row', UI.icon('ic_star', 0.9), txt('small', tr('<b>Player level {n}!</b> A talent point to spend.', { n: S.plv }))));
    const pets = el('div', 'rd-pxp'); for (const r of out.pets.filter((x) => x.band)) { const p = Rd.pet(r.id); if (!p) continue; pets.appendChild(add(el('div', 'rd-pxr'), UI.sp(p.form, 0.5, { anim: false }), add(el('div', 'grow'), el('b', '', H.FORMS[p.form].n + ' · ' + tr('Lv {n}', { n: p.lvl })), UI.meter(p.xp / R.petNeed(p.lvl))), r.ups ? el('span', 'chip up', tr('Level up!')) : el('span', 'dim small', '+' + r.xp))); }
    kids.push(pets);
    if (out.item) kids.push(UI.itemRow(out.item));
    if (out.shellOpen) kids.push(box('rd-lvup row', UI.sp(out.shellOpen.sp, 0.6, { anim: false }), txt('small', out.shellOpen.dup ? tr('<b>A shell!</b> {pet} again: +1 echo for it.', { pet: petName(out.shellOpen.sp) }) : tr('<b>A shell!</b> {pet} joins your band.', { pet: petName(out.shellOpen.sp) }))));
    const after = () => {
      UI.closeModal(); refresh();
      if (done) return done();
      if (out.capture) return capture(out.capture);
      if (out.boss) return UI.go('roadsstory', { scene: out.bossReg === 'marsh' ? 'finale' : 'finale_' + out.bossReg });
      idle(); nextUp();
    };
    if (out.wild) {
      kids.push(key(tr('Continue'), () => joinScene(out.wild, after), 'go wide big'));
    } else kids.push(key(tr('Continue'), after, 'go wide big'));
    UI.modal(...kids);
    UI.cur.modalBack = () => { const k = document.querySelector('#modal .key.go'); if (k) k.click(); };
  };
  // a wild pet makes up its mind: grey, then the chance rolls, then colour (or it slips away)
  const joinScene = (w, after) => {
    const sp = el('div', 'rd-join'), img = UI.sp(w.sp, 1.8), grey = UI.sp(w.sp, 1.8); grey.classList.add('rd-greyp'); { const gx = grey.getContext('2d'); gx.clearRect(0, 0, grey.width, grey.height); gx.drawImage(M.sprite(w.sp, true, grey.width), 0, 0); } add(sp, img, grey);
    const lines = el('div', 'rd-odds'); for (const [label, v] of w.sure ? [[w.sure && w.parts ? 'First meeting' : 'First meeting', 1]] : w.parts) lines.appendChild(box('row', el('span', 'grow', tr(label)), el('b', '', '+' + Math.round(v * 100) + '%')));
    const tot = txt('disp center', tr('{p} chance', { p: Math.round(w.chance * 100) + '%' }));
    const verdict = txt('disp big center rd-verdict', '');
    const btn = key(tr('Continue'), () => after(), 'go wide big'); btn.style.visibility = 'hidden';
    UI.modal(txt('disp center', tr('Wild {pet}', { pet: petName(w.sp) })), sp, lines, tot, verdict, btn);
    setTimeout(() => {
      if (w.joined) { sp.classList.add('ok'); Au.sfx('win'); verdict.innerHTML = w.dup ? tr('It sings along! +1 echo for {pet}.', { pet: petName(w.sp) }) : tr('{pet} joins your band!', { pet: petName(w.sp) }); UI.confetti(30); }
      else { sp.classList.add('no'); Au.sfx('lose'); verdict.innerHTML = tr('It slipped away. Next time it will trust you a little more.'); }
      btn.style.visibility = 'visible';
    }, 1500);
  };
  // a capture: the colour ripples out from the place, then its story
  const capture = (id) => {
    const t = Rd.poiT(id); M.G.follow = false; M.G.cam.x = t.x; M.G.cam.z = t.z;
    M.ripple(t, (u) => u.owner === id); M.notes(t.x, t.z, 10); M.puff(t.x + 1, t.z, 10, '#d9d2ea'); Au.sfx('win'); setCard(placeName(Rd.place(id)), tr('Waking up…'), '');
    setTimeout(() => UI.go('roadsstory', { scene: 'capture', place: id }), 2600);
  };

  /* ---------- quests: finished ones are paid and the next one is told ---------- */
  const nextUp = () => {
    if (!UI.cur || UI.cur.name !== 'roads' || !document.getElementById('modal').hidden) return;
    const done = Rd.takeDone(); refresh();
    if (done.length) {
      const d = done[0]; Rd.done = done.slice(1);
      Au.sfx('win');
      const rew = box('row wrap center'); if (d.q.notes) rew.appendChild(UI.notes(d.q.notes)); if (d.q.echo) rew.appendChild(UI.echoes(d.q.echo)); if (d.q.xp) rew.appendChild(el('span', 'chip', tr('+{n} XP', { n: d.q.xp })));
      return UI.modal(txt('label center', tr('Quest done')), txt('disp big center', tr(d.q.n)), rew, d.ups ? txt('small center', tr('<b>Player level {n}!</b> A talent point to spend.', { n: Rd.S.plv })) : null,
        key(tr('Continue'), () => { UI.closeModal(); nextUp(); }, 'go wide big'));
    }
    const q = Rd.quest(); if (q && !Rd.S.flags['talk_' + q.id]) RU.talk();
    const bf = q && q.all && (q.all === 'marsh' ? 'bossopen' : 'bossopen_' + q.all);
    if (bf && Rd.bossOpen(q.all) && !Rd.S.flags[bf]) { Rd.S.flags[bf] = 1; Rd.save(); return UI.go('roadsstory', { scene: bf }); }
  };
  RU.nextUp = nextUp;
  RU.talk = () => {
    const q = Rd.quest(); if (!q) return; Rd.S.flags['talk_' + q.id] = 1; Rd.save();
    const extra = q.gift && Rd.S.flags['gift_' + q.id] ? UI.itemRow(Rd.S.items.find((x) => x.type === q.gift) || Rd.S.items[0]) : null;
    UI.modal(add(el('div', 'rd-talk'), UI.sp(R.TILLY.sprite, 1.3), add(el('div', 'grow'), el('b', '', tr(R.TILLY.n)), el('div', '', tr(q.talk)))), extra,
      add(el('div', 'rd-qnext'), UI.icon('ic_bang', 0.8), add(el('div', 'grow'), el('b', '', tr(q.n)), el('span', '', tr(q.goal)))),
      key(q.id === 'talent' ? tr('Pick a talent') : tr('On my way'), () => { UI.closeModal(); if (q.id === 'talent') RU.talents(); }, 'go wide big'));
  };

  /* ---------- venue: rest, build, the smith, the merchant ---------- */
  RU.venue = (P) => {
    const S = Rd.S, kids = [txt('label', placeName(P)), txt('disp big', tr(P.venue))];
    const bonusText = { xp: (v) => tr('+{p} XP per battle', { p: Math.round(v * 100) + '%' }), tempo: (v) => tr('+{p} Speed', { p: Math.round(v * 100) + '%' }), join: (v) => tr('+{p} join chance', { p: Math.round(v * 100) + '%' }), poise: (v) => tr('+{n} Guard', { n: v }), hp: (v) => tr('+{p} HP', { p: Math.round(v * 100) + '%' }) };
    const bk = Object.keys(P.bonus)[0];
    kids.push(box('rd-hold', UI.icon('ic_note', 0.9), txt('small grow', tr('Pays <b>{n} notes</b> after every battle you win. Gives the band <b>{b}</b>.', { n: P.yield, b: bonusText[bk](P.bonus[bk]) }))));
    kids.push(key(tr('Rest here'), () => { Rd.rest(P.id); UI.closeModal(); UI.toast(tr('Rested. The Din creep back onto the roads.')); Au.sfx('heal'); refresh(); }, 'soft wide'));
    kids.push(txt('label', tr('Build')));
    for (const bid of R.BUILD_ORDER) {
      const B = R.BUILDS[bid], have = (S.builds[P.id] || []).includes(bid), c = Rd.buildCost(bid);
      const b = key(have ? tr('Built') : String(c), () => { if (Rd.build(P.id, bid)) { Au.sfx('buy'); UI.closeModal(); RU.venue(P); refresh(); nextLater(); } }, have ? 'soft sm' : 'gold sm'); b.disabled = have || S.notes < c; if (!have) b.prepend(UI.icon('ic_note', 0.7));
      kids.push(box('rd-brow row', UI.sp(B.art, 0.5, { anim: false }), add(el('div', 'grow'), el('b', '', tr(B.n)), el('div', 'small dim', tr(B.d))), b));
    }
    if (P.smith) { kids.push(txt('label', tr('The smith'))); kids.push(key(tr('Upgrade gear'), () => { UI.closeModal(); RU.smith(); }, 'blue wide')); }
    if (P.merchant) { kids.push(txt('label', tr('Shell merchant'))); const c = Rd.shellPrice(), b = key(tr('Buy a shell'), () => { const r = Rd.buyShell(); if (r) { Au.sfx('buy'); UI.closeModal(); refresh(); RU.reveal(r); } }, 'gold wide'); b.appendChild(UI.purse('ic_note', c)); b.disabled = S.notes < c; kids.push(b, txt('small dim', tr('"Very rare," he says. The price goes up each time.'))); }
    kids.push(key(tr('Close'), () => { UI.closeModal(); nextUp(); }, 'soft wide'));
    UI.modal(...kids);
  };
  const nextLater = () => setTimeout(() => { if (document.getElementById('modal').hidden) nextUp(); }, 400);
  RU.smith = () => {
    const S = Rd.S, kids = [txt('disp big', tr('The smith')), txt('dim small', tr('Better gear for notes. The last step to Legendary needs echoes too.'))];
    if (!S.items.length) kids.push(txt('dim', tr('You have no gear yet. Din sometimes drop some.')));
    for (const it of S.items.slice().sort((a, b) => H.RARITY_ORDER.indexOf(b.rar) - H.RARITY_ORDER.indexOf(a.rar))) {
      const c = Rd.upgradeCost(it), b = c ? key('', () => { if (Rd.upgrade(it)) { Au.sfx('stamp'); RU.smith(); refresh(); nextLater(); } }, 'gold sm') : el('span', 'chip', tr('Best'));
      if (c) { b.appendChild(UI.purse('ic_note', c.notes)); if (c.echo) b.appendChild(UI.purse('ic_echo', c.echo)); b.disabled = !Rd.canUpgrade(it); }
      const owner = Rd.itemOwner(it.id); kids.push(add(UI.itemRow(it, 'div', owner ? UI.sp(owner.form, 0.36, { anim: false }) : null), b));
    }
    kids.push(key(tr('Close'), () => { UI.closeModal(); nextUp(); }, 'soft wide'));
    UI.modal(...kids);
  };
  // a shell opens the moment you get it
  RU.reveal = (r) => { Au.sfx('win'); UI.confetti(30); UI.modal(UI.sp(r.sp, 1.8), txt('disp center', r.dup ? tr('{pet} again', { pet: petName(r.sp) }) : tr('{pet} joins your band!', { pet: petName(r.sp) })), txt('dim center', r.dup ? tr('It turns into an echo for {pet}.', { pet: petName(r.sp) }) : tr('Find it in your band.')), key(tr('Nice'), UI.closeModal, 'go wide')); };
  RU.shells = () => {
    const S = Rd.S;
    if (!S.shells) return UI.modal(UI.sp('shell', 1.4), txt('disp', tr('No shells')), txt('dim', tr('Shells are rare. Bosses, some quests, the Songbook and one merchant in Reedwick have them.')), key(tr('Close'), UI.closeModal, 'soft wide'));
    UI.modal(UI.sp('shell', 1.6), txt('disp', tr('{n} shells', { n: S.shells })), txt('dim', tr('Any pet at all could be inside.')), key(tr('Open one'), () => {
      const r = Rd.openShell(); refresh(); UI.closeModal(); Au.sfx('win'); UI.confetti(30);
      UI.modal(UI.sp(r.sp, 1.8), txt('disp center', r.dup ? tr('{pet} again', { pet: petName(r.sp) }) : tr('{pet} joins your band!', { pet: petName(r.sp) })), txt('dim center', r.dup ? tr('It turns into an echo for {pet}.', { pet: petName(r.sp) }) : tr('Find it in your band.')), key(tr('Nice'), () => { UI.closeModal(); if (Rd.S.shells) RU.shells(); }, 'go wide'));
    }, 'gold wide big'), key(tr('Close'), UI.closeModal, 'soft wide'));
  };

  /* ---------- talents ---------- */
  RU.talents = () => {
    const pts = Rd.points(), kids = [txt('disp big', tr('Talents')), txt('dim small', pts ? tr('<b>{n} points</b> to spend. One more every player level.', { n: pts }) : tr('One point every player level.'))];
    for (const tree of R.TREES) {
      const col = add(el('div', 'rd-tree'), add(el('div', 'rd-th'), el('b', '', tr(tree.n)), el('span', 'dim small', tr(tree.d))));
      for (const t of tree.talents) {
        const has = Rd.has(t.id), can = Rd.canTalent(tree, t), b = el('button', 'rd-tal' + (has ? ' has' : can ? ' can' : '')); b.type = 'button';
        add(b, UI.icon(has ? 'ic_check' : can ? 'ic_plus' : 'ic_lock', 0.75), add(el('div', 'grow'), el('b', '', tr(t.n)), el('div', 'small', tr(t.d)), t.need && !has ? el('div', 'small dim', tr('Needs {n} talents in this tree', { n: t.need })) : null));
        b.disabled = !can; b.addEventListener('click', () => { if (Rd.takeTalent(tree, t)) { Au.sfx('stamp'); M.speed = Rd.has('feet') ? 3.1 : 2.4; RU.talents(); refresh(); nextLater(); } });
        col.appendChild(b);
      }
      kids.push(col);
    }
    kids.push(txt('small dim center', tr('More talents in each tree come with later previews.')));
    kids.push(key(tr('Close'), () => { UI.closeModal(); nextUp(); }, 'soft wide'));
    UI.modal(...kids);
  };

  /* ---------- the songbook ---------- */
  RU.book = () => {
    const S = Rd.S, kids = [txt('disp big', tr('Songbook')), txt('dim small', tr('The pets of each region. Find them all for a shell.'))];
    for (const reg of Object.keys(R.BOOKS)) {
      if (!Rd.regOpen(reg)) continue;
      const list = R.BOOKS[reg], grid = el('div', 'rd-book'), n = list.filter((sp) => S.book[sp] === 3).length;
      for (const sp of list) {
        const st = S.book[sp] || 0, c = el('div', 'rd-bk s' + st);
        add(c, UI.sp(sp, 0.7, { anim: false, variant: st === 0 ? 'sil' : '' }), el('b', '', st ? petName(sp) : '???'), el('span', 'small', [tr('Not seen'), tr('Seen'), tr('Met'), tr('In your band')][st]));
        grid.appendChild(c);
      }
      kids.push(txt('label', tr(W.REG[reg].n) + ' · ' + n + '/' + list.length), grid);
      if (Rd.bookDone(reg) && !S.flags[Rd.bookFlag(reg)]) kids.push(key(tr('Claim a shell'), () => { const r = Rd.claimBook(reg); refresh(); UI.closeModal(); if (r) RU.reveal(r); }, 'gold wide big'));
    }
    kids.push(key(tr('Close'), UI.closeModal, 'soft wide'));
    UI.modal(...kids);
  };
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
