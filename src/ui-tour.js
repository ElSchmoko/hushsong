/* Hushsong — Tour screens: the lobby, the road (shared with Solo), the stops (Headliner, boons, campfire, mysteries), results and the end. */
(function (H) {
  'use strict';
  const tr = (s, v) => H.T(s, v);
  const A = H.Art, Au = H.Audio, UI = H.UI, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key;
  const rnd = Math.random, T = () => H.TOUR;

  const legLine = (run) => tr('Leg {leg} of {legs}', { leg: run.leg + 1, legs: T().legs });
  const gigLine = (run) => (run.gigs >= T().gigs ? tr('Boss next') : tr('Gig {n} of {gigs}', { n: run.gigs + 1, gigs: T().gigs }));
  const faces = (pets, s) => { const f = el('div', 'tfaces'); pets.forEach((p) => f.appendChild(UI.sp(p.form, s || 0.5, { anim: false }))); return f; };
  const bandCard = (id, have, tag) => UI.boonCard(id, have, tag, H.bandBoon(id).d);

  /* ----- the run's header: each pet's HP, the leg, the Headliners, boons and lasting effects ----- */
  const hud = (S) => {
    const run = S.tourRun, h = el('div', 'shud thud'), band = el('div', 'tband');
    for (const id of run.band) {
      const p = H.petById(S, id); if (!p) continue; const hp = run.hp[id] || 0, m = UI.meter(hp); m.classList.add('hpm'); if (hp < 0.3) m.classList.add('low');
      band.appendChild(add(el('div', 'tmem' + (hp > 0 ? '' : ' down')), add(el('div', 'sface ' + H.petFamily(p)), UI.sp(p.form, 0.5, { anim: false })), hp > 0 ? m : el('span', 'tout', tr('Out'))));
    }
    const bn = el('button', 'sboons'); bn.type = 'button'; bn.setAttribute('aria-label', tr('Headliners and boons. Show them'));
    run.heads.forEach((id) => bn.appendChild(add(el('span', 'hlb'), UI.icon('hl_' + id, 0.8))));
    if (!run.boons.length) bn.appendChild(txt('small dim', tr('No boons yet'))); else run.boons.slice(-5).forEach((id) => bn.appendChild(add(el('span', 'bchip r-' + H.BOONS[id].r), UI.icon(A.boonIcon(id), 0.62))));
    if (run.boons.length > 5) bn.appendChild(el('span', 'small', '+' + (run.boons.length - 5))); if (H.activeCombos(run.boons).length) bn.appendChild(el('span', 'combo', tr('Combo')));
    bn.addEventListener('click', () => { Au.sfx('tap'); sheet(S); });
    add(h, add(el('div', 'grow col'), box('row between', el('b', '', H.REGIONS[H.tourRegion(run)].n), txt('chip gigc', legLine(run) + ' · ' + gigLine(run))), band, bn, UI.extraChips(run.extra)));
    return h;
  };
  // everything the band carries: Headliners and their prices, the ensemble's tour version, the boons, the road's extras
  const sheet = (S) => {
    const run = S.tourRun, kids = [txt('disp', tr('On this tour'))], ens = H.tourEnsemble(S);
    if (run.heads.length) kids.push(txt('label', tr('Headliners')), ...run.heads.map((id) => headCard(id)));
    if (ens && H.ENS_TOUR[ens.id]) kids.push(txt('label', tr('Ensemble on tour')), add(el('div', 'boon ens'), add(el('div', 'bart'), UI.icon('ic_note', 1.6)), add(el('div', 'grow col'), el('b', 'bname', ens.n + ' · ' + H.ENS_TOUR[ens.id].n), txt('small', H.ENS_TOUR[ens.id].d), txt('small dim', tr('While at least two of the band play.')))));
    kids.push(txt('label', tr('Boons for the whole band')));
    const cs = H.activeCombos(run.boons); if (cs.length) kids.push(...cs.map((c) => add(el('div', 'bcombo big'), UI.icon(A.boonIcon(c[0]), 0.7), UI.icon(A.boonIcon(c[1]), 0.7), el('span', '', `<b>${H.BOONS[c[0]].n} + ${H.BOONS[c[1]].n}</b>: ${c[2]}`))));
    if (!run.boons.length) kids.push(txt('small dim center', tr('Win gigs and jam to collect boons. They last the tour.')));
    const cnt = {}; run.boons.forEach((b) => (cnt[b] = (cnt[b] || 0) + 1));
    Object.keys(cnt).forEach((b) => { const c = bandCard(b, run.boons); if (cnt[b] > 1) c.querySelector('.bname').textContent += ' ×' + cnt[b]; kids.push(c); });
    const xc = UI.extraChips(run.extra); if (xc) kids.push(txt('label', tr('From the road')), xc);
    kids.push(key(tr('Close'), UI.closeModal, 'wide')); UI.modal(...kids);
  };
  const headCard = (id, tag) => { const h = H.HEADLINERS[id], c = el(tag || 'div', 'boon hlc'); if (tag === 'button') c.type = 'button'; add(c, add(el('div', 'bart'), UI.icon('hl_' + id, 1.9)), add(el('div', 'grow col'), box('row between', el('b', 'bname', h.n), txt('rar', tr('Headliner'))), txt('small', h.d), add(el('div', 'hlprice'), UI.icon('ic_bang', 0.55), el('span', '', tr('Price: {p}', { p: h.price }))))); return c; };

  /* ================= the lobby ================= */
  UI.screens.tour = (root) => {
    const S = UI.S, run = S.tourRun, P = H.refreshTour(S); S.flags.seenTour = 1; UI.music('camp', 'hall');
    root.appendChild(UI.topbar(tr('Tour'), () => UI.go('gigs'), UI.wallet()));
    const hh = Math.max(84, Math.min(118, UI.Hh - 260)), hero = el('div', 'solohero tourhero'); hero.style.height = `calc(var(--u) * ${hh})`;
    add(hero, UI.bgEl('neon', UI.W, hh, 0.62), el('div', 'cone l'), el('div', 'cone r'), add(el('div', 'stitle'), el('div', 'logo small', tr('World Tour')), txt('tag', tr('Your band · five legs · five bosses'))));
    root.appendChild(hero);
    const body = el('div', 'scroll'), pad = el('div', 'pad'), foot = el('div', 'gofoot');
    if (!H.tourOpen(S)) { add(pad, box('row center', UI.icon('ic_lock', 3)), txt('dim center', tr('The Tour opens at level {unlock}.', { unlock: T().unlock }))); body.appendChild(pad); root.append(body); return; }
    const pays = el('div', 'tpays'); add(pays, txt('label', tr('Pays')), box('row wrap', add(el('span', 'chip'), UI.icon('ic_note', 0.7), tr('{n} a gig', { n: T().notes })), add(el('span', 'chip'), UI.icon('ic_boss', 0.7), tr('Each boss: echo + gear')), add(el('span', 'chip legend'), UI.icon('ic_star', 0.7), tr('Last boss: echo, shell, Legendary'))));
    pad.appendChild(pays);
    if (run) {
      const card = el('div', 'tourcard'), pets = H.tourPets(S);
      add(card, faces(pets, 0.62), add(el('div', 'grow col'), txt('label', tr('On tour · {n}', { n: H.REGIONS[H.tourRegion(run)].n })), el('b', 'disp', legLine(run)), txt('small dim', gigLine(run) + ' · ' + tr('{n} boons', { n: run.boons.length }))));
      pad.appendChild(card); body.appendChild(pad); root.appendChild(body);
      add(foot, key(tr('Back on the road'), () => UI.go(run.pending && run.pending.type !== 'battle' ? 'tourstop' : 'tourmap'), 'go wide big'), key(tr('Give up the tour'), () => UI.confirm(tr('Give up the tour?'), tr('Notes and loot stay yours.'), tr('Give up'), () => { H.endTour(S); UI.save(); UI.go('tour'); }), 'wide soft'));
      root.appendChild(foot); return;
    }
    const band = H.teamPets(S).filter(Boolean), ens = H.teamEnsemble(S);
    const bc = add(el('div', 'tourcard'), faces(band, 0.62), add(el('div', 'grow col'), txt('label', tr('Your band')), ens ? el('b', '', ens.n) : null, ens && H.ENS_TOUR[ens.id] ? txt('small', tr('On tour: <b>{n}</b>. {d}', { n: H.ENS_TOUR[ens.id].n, d: H.ENS_TOUR[ens.id].d })) : txt('small dim', tr('Three pets that form an ensemble also play its tour version.'))));
    add(pad, bc, txt('small dim center', tr('Each leg is five gigs and a boss. HP carries on; a pet that falls sits out until a campfire or a Benefit show. Boons work on the whole band. Legs 1, 3 and 5 start with a Headliner: a big change, with a price.')));
    if (P.best) pad.appendChild(txt('small center', tr('Best: leg <b>{leg}</b>, gig <b>{gig}</b>', { leg: Math.min(T().legs, Math.floor(P.best / (T().gigs + 1)) + 1), gig: P.best % (T().gigs + 1) }) + (P.wins ? ' · ' + tr('{n} tours finished', { n: P.wins }) : '')));
    body.appendChild(pad); root.appendChild(body);
    const start = key(tr('Start the tour'), () => { H.startTour(S, rnd); UI.save(); UI.go('tourstop', { fresh: 1 }); }, 'go wide big'); start.disabled = !band.length;
    add(foot, start, key(tr('Change the band'), () => UI.go('team', {}), 'wide soft')); root.appendChild(foot);
  };

  /* ================= the road ================= */
  UI.roadOf.tour = (S) => { const run = S.tourRun; if (!run || !H.tourPets(S).length) return null; const region = H.tourRegion(run), boss = H.DIN[H.REGIONS[region].boss].n, last = run.leg === T().legs - 1; return {
    run, region, rows: T().rows.length, mapScreen: 'tourmap', stopScreen: 'tourstop', lobby: 'tour', battle: { tour: 1 }, token: H.tourPets(S)[0].form,
    title: H.REGIONS[region].n + ' · ' + legLine(run), introKick: tr('World Tour · leg {n}', { n: run.leg + 1 }), introLine: tr('{gigs} gigs, then {n}', { gigs: T().gigs, n: boss }),
    giveUpNote: tr('Notes and loot stay yours.'), giveUp: () => H.endTour(S), hud: () => hud(S),
    reach: () => H.soloReach(run), enter: (id) => H.tourEnter(S, id, rnd), stage: (n) => H.tourStage(S, n),
    bossLine: last ? H.T.k('The last stop of the tour.') : H.T.k('The end of this leg.'), bossLegend: H.T.k('The end of the leg. The fallen get back up.'),
    gigLine: H.T.k('Three Din. Win for a boon.'), restLine: H.T.k('Everyone heals and the fallen get back up, or practise for +6% Power.'), benefitLine: H.T.k('Easier Din. Win: the fallen get back up and everyone heals 25%.'),
    prize: (n) => {
      if (n.type === 'boss') return [UI.purse('ic_echo', '+1', tr('Echoes')), UI.purse('ic_bag', '+1', tr('Equipment')), last ? UI.purse('ic_shell', '+1', tr('Shells')) : null, last ? txt('chip legend', tr('+1 Legendary')) : null];
      if (n.type === 'benefit') return [add(el('span', 'chip'), UI.icon('st_lifesong', 0.6), tr('Revive + heal')), UI.purse('ic_note', '+' + T().notes, tr('Notes'))];
      if (n.type === 'battle') return [add(el('span', 'chip boonchip rare'), UI.icon('bn_amp', 0.55), tr('Rare boon')), UI.purse('ic_echo', '+1', tr('Echoes')), UI.purse('ic_note', '+' + T().notes, tr('Notes'))];
      return [add(el('span', 'chip boonchip' + (n.type === 'loud' ? ' rare' : '')), UI.icon('bn_amp', 0.55), tr(n.type === 'loud' ? 'Rare boon' : 'Boon')), UI.purse('ic_note', '+' + T().notes, tr('Notes'))];
    },
  }; };
  UI.screens.tourmap = (root, pr) => { const S = UI.S, M = S.tourRun && UI.roadOf.tour(S); if (!M) { if (S.tourRun) H.endTour(S); return UI.go('tour'); } return UI.roadScreen(root, pr, M); };

  /* ================= a stop: the Headliner, a boon, the campfire, a mystery ================= */
  UI.screens.tourstop = (root) => {
    const S = UI.S, run = S.tourRun; if (!run) return UI.go('tour'); const p = run.pending; if (!p) return UI.go('tourmap'); if (p.type === 'battle') return UI.go('battle', { tour: 1 });
    const pets = H.tourPets(S), region = H.tourRegion(run); UI.music('camp', region);
    root.appendChild(hud(S));
    const sh = Math.max(92, Math.min(130, UI.Hh - 300)), scene = el('div', 'sscene'); scene.style.height = `calc(var(--u) * ${sh})`; scene.appendChild(UI.bgEl(region, UI.W, sh, 0.55, 'sing'));
    const body = el('div', 'scroll'), pad = el('div', 'pad'), foot = el('div', 'gofoot');
    const done = (fresh) => { UI.save(); UI.go(S.tourRun && S.tourRun.pending ? 'tourstop' : 'tourmap', fresh ? { fresh: 1 } : {}); };
    const bandArt = (s) => add(el('div', 'tbandart'), ...pets.map((q) => { const c = UI.sp(q.form, s || 0.9); if (!(run.hp[q.id] > 0)) c.classList.add('slump'); return c; }));
    const pickCards = (cards, onTake, label) => {
      let chosen = null, chosenEl = null; const take = key(tr('Pick one'), () => { if (!chosen || take.dataset.busy) return; take.dataset.busy = 1; onTake(chosen); Au.sfx('evolve'); chosenEl.classList.add('taken'); pad.querySelectorAll('.boon').forEach((x) => { if (x !== chosenEl) x.classList.add('gone'); }); }, 'go wide big'); take.disabled = true;
      cards.forEach(([id, c], i) => { c.classList.add('dealt'); c.style.animationDelay = 0.12 + i * 0.12 + 's'; c.addEventListener('click', () => { chosen = id; chosenEl = c; Au.sfx('good'); pad.querySelectorAll('.boon').forEach((x) => x.classList.toggle('on', x === c)); take.disabled = false; take.textContent = label(id); }); pad.appendChild(c); });
      return take;
    };
    if (p.type === 'head') {
      add(scene, el('div', 'rays'), add(el('div', 'sart'), bandArt(0.85)), add(el('div', 'sbanner'), el('b', '', tr('Leg {n}: {region}', { n: run.leg + 1, region: H.REGIONS[region].n })), el('span', '', tr('Pick a Headliner'))));
      pad.appendChild(txt('small dim center', tr('It changes how the band plays for the rest of the tour, and the road makes you pay for it.')));
      foot.appendChild(pickCards(p.opts.map((id) => [id, headCard(id, 'button')]), (id) => { H.tourHead(S, id, rnd); setTimeout(() => done(true), window.__hsSpeed ? 0 : 650); }, (id) => tr('Headline with {n}', { n: H.HEADLINERS[id].n })));
    } else if (p.type === 'boon') {
      const title = tr(p.src === 'jam' ? 'Jam session' : p.src === 'loud' ? 'The crowd goes wild' : p.src === 'r' ? 'The rival band bows out' : p.src === 'c' ? 'A find on the road' : 'Gig won!');
      add(scene, el('div', 'rays'), add(el('div', 'sart'), bandArt(0.8), p.src === 'jam' ? UI.icon('nd_jam', 2) : UI.icon('ic_note', 1.8)), add(el('div', 'sbanner'), el('b', '', title), el('span', '', p.src === 'loud' || p.src === 'r' ? tr('Pick a rare boon') : tr('Pick a boon'))));
      const take = pickCards(p.opts.map((id) => [id, bandCard(id, run.boons, 'button')]), (id) => { H.tourPick(S, id); setTimeout(() => done(), window.__hsSpeed ? 0 : 650); }, (id) => tr('Take {n}', { n: H.BOONS[id].n }));
      add(foot, take, key(tr('Skip'), () => UI.confirm(tr('Skip this boon?'), tr('This stop gives no other.'), tr('Skip'), () => { H.tourPick(S, null); done(); }), 'wide soft sm'));
    } else if (p.type === 'rest') {
      const embers = el('div', 'embers'); for (let i = 0; i < 7; i++) { const e = el('i'); e.style.left = 44 + Math.random() * 12 + '%'; e.style.animationDelay = -i * 0.4 + 's'; embers.appendChild(e); }
      add(scene, el('div', 'night'), embers, add(el('div', 'sart camp'), bandArt(0.8), add(el('div', 'fire'), UI.icon('nd_rest', 2.2))), add(el('div', 'sbanner'), el('b', '', tr('Campfire')), el('span', '', tr('A quiet night on the road'))));
      const after = (cls, text) => { scene.classList.add(cls); scene.appendChild(add(el('div', 'restfx'), el('b', '', text))); pad.querySelectorAll('.choice').forEach((b) => (b.disabled = true)); setTimeout(done, window.__hsSpeed ? 0 : 900); };
      const fallen = run.band.filter((id) => !(run.hp[id] > 0)).length, sleep = H.tourSleep(run);
      const opt = (icon, name, d, fn) => { const b = el('button', 'choice'); b.type = 'button'; add(b, UI.icon(icon, 1.6), add(el('div', 'grow col'), el('b', '', name), txt('small', d))); b.addEventListener('click', fn); return b; };
      add(pad, opt('st_regen', tr('Sleep'), tr('Everyone heals {p}%.', { p: Math.round(sleep * 100) }) + (fallen ? ' ' + tr('The fallen get back up with {p}% HP.', { p: Math.round(Math.min(T().revive, sleep) * 100) }) : ''), () => { H.tourRest(S, 'nap'); UI.save(); Au.sfx('heal'); after('slept', fallen ? tr('Back on their feet') : tr('Rested')); }),
        opt('st_pup', tr('Practise'), tr('+{n}% Power for the band for this tour.', { n: Math.round(T().practise * 100) }) + (fallen ? ' ' + tr('The fallen stay down.') : ''), () => { H.tourRest(S, 'practise'); UI.save(); Au.sfx('level'); after('practised', tr('{p} Power', { p: `+${Math.round(T().practise * 100)}%` })); }));
    } else if (p.type === 'event') {
      const E = H.EVENTS[p.ev];
      add(scene, add(el('div', 'sart'), add(el('div', 'evart'), UI.icon('ev_' + p.ev, 2.2)), bandArt(0.75)), add(el('div', 'sbanner'), el('b', '', E.n), el('span', '', tr('Mystery'))));
      add(pad, txt('center', E.d), txt('small dim center', tr('On tour it works on the whole band.')));
      E.opts.forEach((o, i) => { const b = el('button', 'choice'); b.type = 'button'; add(b, add(el('div', 'grow col'), el('b', '', o.n), txt('small', o.d))); b.addEventListener('click', () => {
        if (pad.dataset.busy) return; pad.dataset.busy = 1; const from = run.band.map((id) => run.hp[id] || 0);
        const got = H.tourEvent(S, i, rnd); UI.save(); const r2 = S.tourRun;
        UI.roadResult({ scene, title: o.n, fx: o.fx, got, bars: pets.map((q, j) => ({ form: q.form, from: from[j], to: r2.hp[q.id] || 0 })), card: (id) => bandCard(id, r2.boons), done }); }); pad.appendChild(b); });
    }
    root.appendChild(scene); body.appendChild(pad); root.appendChild(body); if (foot.children.length) root.appendChild(foot);
  };

  /* ================= after a Tour fight ================= */
  const legTrack = (won, fresh) => { const t = el('div', 'tourtrack'); for (let i = 0; i < T().gigs; i++) t.appendChild(add(el('span', 'tp' + (i < won ? ' got' : '') + (i === fresh ? ' fresh' : '')), i < won ? UI.icon('ic_check', 0.6) : el('b', '', String(i + 1)))); t.appendChild(add(el('span', 'tp boss'), UI.icon('ic_boss', 0.62))); return t; };
  const hpLine = (S) => { const r = S.tourRun; return r ? r.band.map((id) => (r.hp[id] > 0 ? Math.round(r.hp[id] * 100) + '%' : tr('Out'))).join(' · ') : ''; };
  UI.tourResult = (out) => {
    const S = UI.S;
    if (!out.win || out.done) return UI.go('tourend', { out });
    if (out.kind === 'benefit' || out.kind === 'battle') return UI.sideResult(out, hpLine(S), () => UI.go(S.tourRun && S.tourRun.pending ? 'tourstop' : 'tourmap'));
    const kids = [], loot = box('loot');
    if (out.notes) loot.appendChild(UI.purse('ic_note', '+' + out.notes)); if (out.echo) loot.appendChild(UI.purse('ic_echo', tr('+{n} echoes', { n: out.echo })));
    if (out.boss) {
      const next = S.tourRun ? H.REGIONS[H.tourRegion(S.tourRun)].n : '';
      kids.push(add(el('div', 'wonhead'), txt('disp center', tr('Leg {n} complete!', { n: out.leg + 1 })), UI.stamp(tr('Sold out!'))), loot, out.item ? txt('label center', tr('The boss dropped')) : null, out.item ? UI.itemRow(H.itemById(S, out.item.id) || out.item) : null, out.revived ? txt('center small good', tr('The fallen get back up for the next leg.')) : null);
      UI.confetti(60); Au.sfx('coin');
      kids.push(UI.key(tr('On to {region}', { region: next }), () => UI.go(out.head ? 'tourstop' : 'tourmap', { fresh: 1 }), 'gold wide big'));
    } else {
      kids.push(add(el('div', 'wonhead'), txt('disp big center', out.loud ? tr('Loud gig won!') : tr('Gig won!')), UI.stamp(out.loud ? tr('Rowdy!') : tr('Encore!'))), legTrack(out.gig, out.gig - 1), txt('center dim small', tr('HP {n}', { n: hpLine(S) })), loot);
      const down = S.tourRun ? S.tourRun.band.filter((id) => !(S.tourRun.hp[id] > 0)).length : 0; if (down) kids.push(txt('center small bad', tr('{n} of the band sit out until a campfire or a Benefit show.', { n: down })));
      UI.confetti(out.loud ? 40 : 26); Au.sfx('coin');
      kids.push(UI.key(out.loud ? tr('Pick a rare boon') : tr('Pick a boon'), () => UI.go('tourstop'), 'gold wide big'));
    }
    UI.modal(...kids);
  };
  UI.screens.tourend = (root, pr) => {
    const S = UI.S, out = pr.out || {}, won = !!out.done, pets = (out.band || []).map((id) => H.petById(S, id)).filter(Boolean); UI.music('camp', won ? 'hall' : out.region || 'fen'); Au.sfx(won ? 'win' : 'lose');
    const w = el('div', 'title soloend' + (won ? ' won' : ''));
    add(w, UI.bgEl(won ? 'neon' : out.region || 'fen', UI.W, UI.Hh, 0.5, won ? null : 'hush'), won ? el('div', 'rays') : null);
    const L = out.loot || { echo: 0, shells: 0, items: [] }, loot = box('loot');
    if (out.total) loot.appendChild(UI.purse('ic_note', '+' + out.total, tr('Notes this tour'))); if (L.echo) loot.appendChild(UI.purse('ic_echo', tr('+{n} echoes', { n: L.echo }))); if (L.shells) loot.appendChild(UI.purse('ic_shell', '+' + L.shells));
    const items = (L.items || []).map((id) => H.itemById(S, id)).filter(Boolean);
    if (won) UI.confetti(80, true);
    const band = add(el('div', 'tbandart big'), ...pets.map((p) => { const c = UI.sp(p.form, won ? 1.3 : 1.05, { anim: false }); c.classList.add(won ? 'cheer' : 'slump'); return c; }));
    add(w, add(el('div', 'logo small dropin'), tr(won ? 'World Tour complete!' : 'Tour over')), band,
      add(el('div', 'panel col center endp risein'), txt('center', won ? tr('Five legs, five bosses. The whole world sang along.') : tr('Out on leg <b>{leg}</b>, after <b>{gigs}</b> gigs of {n}.', { leg: (out.reached ? out.reached.leg : 0) + 1, gigs: out.reached ? out.reached.gigs : 0, n: T().gigs })), loot,
        items.length ? txt('label center', tr('Loot from the bosses')) : null, ...items.map((it) => UI.itemRow(it))),
      key(won ? tr('Home') : tr('Try another tour'), () => (won ? UI.go('home') : UI.go('tour')), 'go wide big'), key(won ? tr('Another tour') : tr('Home'), () => (won ? UI.go('tour') : UI.go('home')), 'wide soft'));
    root.appendChild(w);
  };
})(window.H);
