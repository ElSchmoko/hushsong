/* Hushsong — Battle of the Bands screens: the stage (your locked band, today's matches, Applause), the rival's card,
   the result, and the one-time news card on Home. The rules live in src/pvp.js, the online part in src/net.js. */
(function (H) {
  'use strict';
  const tr = (s, v) => H.T(s, v);
  const Au = H.Audio, UI = H.UI, Net = H.Net, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key;
  const P = H.PVP;
  const countdown = (ms) => { const m = Math.max(1, Math.round(ms / 60000)), h = Math.floor(m / 60); return h ? tr('{h} h {m} min', { h, m: m % 60 }) : tr('{m} min', { m }); };
  // a band in a row of faces; flip turns them to face left (the rival's side)
  const faces = (forms, s, flip) => { const f = el('div', 'tfaces'); forms.forEach((form) => f.appendChild(UI.sp(form, s || 0.5, { anim: false, flip: !!flip }))); return f; };
  // another player's name: always text, never markup
  const nameEl = (cls, name) => { const b = el('b', cls, ''); b.textContent = name; return b; };
  // what a day of matches pays: four of notes, the fifth with a shell
  const payTrack = (S) => UI.track(Array.from({ length: P.perDay }, (_, i) => ({ icon: i === P.perDay - 1 ? 'ic_shell' : 'ic_note', k: i + 1, got: i < S.pvp.played, label: tr('Match {n}', { n: i + 1 }) })));

  // a name is needed before the first match: the band shows on the Bands board under it
  const askName = (then) => {
    const S = UI.S, msg = txt('small bad center'), inp = el('input', 'namein');
    inp.type = 'text'; inp.maxLength = Net.NAME_MAX; inp.autocomplete = 'off'; inp.spellcheck = false; inp.placeholder = tr('Your name'); inp.setAttribute('aria-label', tr('Your name'));
    const go = key(tr('Join the boards'), async () => {
      if (go.disabled) return; go.disabled = true; msg.textContent = '';
      const r = await Net.setName(S, inp.value, UI.save); go.disabled = false;
      if (r) { msg.textContent = r === 'name' ? tr('Pick a name of 1 to 16 letters.') : tr('Could not reach the boards. Check your connection and try again.'); return; }
      Au.sfx('good'); UI.save(); UI.closeModal(); then();
    }, 'wide go');
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go.click(); } });
    UI.modal(txt('disp', tr('Put your name up')), txt('small dim', tr('Your band plays other players under this name, and it shows on the boards.')), inp, msg, go, key(tr('Cancel'), UI.closeModal, 'wide soft'));
    setTimeout(() => inp.focus(), 50);
  };

  // the rival's card: who, what they bring, and one way on. No way back: the match is already on.
  UI.pvpRival = () => {
    const S = UI.S, cur = S.pvp.cur; if (!cur) return;
    const R = cur.rival, ens = H.copyEnsemble(R.band), mine = H.pvpBand(S);
    const card = add(el('div', 'rivalcard'), txt('label', tr('Your rival')), nameEl('rvname', R.name), box('row rvmeta', UI.purse('ic_trophy', R.applause, tr('Applause')), txt('small', tr('Lv {level}', { level: R.level }))),
      faces(R.band.map((c) => c.f), 0.66, true), txt('small dim', ens ? ens.n : tr('No ensemble')));
    UI.modal(txt('label center', tr('Match {n} of {perDay}', { n: cur.n, perDay: P.perDay })), card, el('div', 'vsmini', tr('VS')),
      add(el('div', 'rivalcard mine'), faces(mine.map((p) => p.form), 0.5), txt('small dim', H.pvpEnsemble(S) ? H.pvpEnsemble(S).n : tr('No ensemble'))),
      txt('center chip', tr('Both bands play at level {n}', { n: H.pvpLevel(S) })),
      key(tr('Start the match'), () => { UI.closeModal(); UI.go('battle', { pvp: 1 }); }, 'go wide big'));
    UI.cur.modalBack = () => { UI.closeModal(); };
  };

  // find a rival: the match counts as soon as one comes back
  const findRival = async (btn, draw) => {
    const S = UI.S; if (btn.disabled) return;
    if (!Net.named(S)) return askName(() => findRival(btn, draw));
    btn.disabled = true; const was = btn.textContent; btn.textContent = tr('Tuning in…');
    const r = await Net.match(S, UI.save); btn.disabled = false; btn.textContent = was;
    if (r === 'offline') return UI.toast(tr('Could not reach the stage. Check your connection and try again.'));
    if (r === 'none') return UI.toast(tr('No bands on stage yet. Try again later.'));
    if (r === 'limit') return UI.toast(tr('That is all for today.'));
    H.openPvpMatch(S, r); UI.save(); Au.sfx('stamp'); draw(); UI.pvpRival();
  };

  UI.screens.bands = (root) => {
    const S = UI.S; if (!H.pvpOpen(S)) return UI.go('gigs');
    H.refreshPvp(S); S.flags.seenPvp = 1; S.flags.newsBands = 1; UI.save(); UI.music('camp', 'hall');
    if (H.Net) H.Net.sendPvp(S, UI.save);
    const draw = () => {
      root.innerHTML = '';
      root.appendChild(UI.topbar(tr('Battle of the Bands'), () => UI.go('gigs'), UI.wallet()));
      const hh = Math.max(84, Math.min(118, UI.Hh - 270)), hero = el('div', 'solohero bandshero'); hero.style.height = `calc(var(--u) * ${hh})`;
      add(hero, UI.bgEl('hall', UI.W, hh, 0.62, 'sing'), el('div', 'cone l'), el('div', 'cone r'), add(el('div', 'stitle'), el('div', 'logo small', tr('Battle of the Bands')), txt('tag', tr('Your band against another player\'s'))));
      root.appendChild(hero);
      const body = el('div', 'scroll'), pad = el('div', 'pad'), foot = el('div', 'gofoot');
      // today's five matches and what they pay
      const left = H.pvpLeft(S), pay = add(el('button', 'payline'), txt('label', tr('Today')), payTrack(S)); pay.type = 'button';
      pay.addEventListener('click', () => { Au.sfx('tap'); UI.toast(tr('{perDay} matches a day. A win pays {win} notes, a loss {loss}. The fifth match also pays a shell.', { perDay: P.perDay, win: P.win, loss: P.loss })); });
      pad.appendChild(pay);
      // your stage band and your Applause
      const band = H.pvpBand(S), ens = H.pvpEnsemble(S), team = H.teamPets(S).filter(Boolean);
      const card = add(el('div', 'tourcard stagecard'), add(el('div', 'grow col'), txt('label', tr('Your stage band')),
        band.length === 3 ? faces(band.map((p) => p.form), 0.62) : txt('dim', tr('No band locked in yet')), band.length === 3 ? txt('small dim', ens ? ens.n : tr('No ensemble')) : null),
        add(el('div', 'col applbox'), UI.icon('ic_trophy', 1.3), el('b', 'disp', UI.fmt(S.pvp.applause)), txt('small dim', tr('Applause'))));
      pad.appendChild(card);
      // lock in: the band from the Band screen becomes the stage band
      if (team.length === 3 && !H.pvpSameAsTeam(S) && !S.pvp.cur) {
        const lk = add(el('button', 'tstrip lockin'), faces(team.map((p) => p.form), 0.5), add(el('div', 'grow'), el('b', '', band.length === 3 ? tr('Lock in your current band') : tr('Lock in this band')), el('div', 'small dim', tr('Other players fight it, and it fights for you.'))), el('span', 'chip', tr('Lock in')));
        lk.type = 'button'; lk.addEventListener('click', () => { if (H.lockPvpBand(S)) { Au.sfx('stamp'); UI.save(); draw(); } }); pad.appendChild(lk);
      } else if (team.length < 3 && band.length < 3) pad.appendChild(txt('small dim center', tr('Put three pets in your band to lock it in.')));
      pad.appendChild(key(tr('Change your band'), () => UI.go('team', { back: 'bands' }), 'wide soft sm'));
      pad.appendChild(txt('small dim center', tr('Fights play out on their own. Both bands play at the lower of the two levels.')));
      body.appendChild(pad); root.appendChild(body);
      // the big button: the waiting match, a new one, or tomorrow
      let go;
      if (S.pvp.cur) go = key(tr('Your match is waiting'), () => UI.pvpRival(), 'go wide big');
      else if (left > 0) { go = key(tr('Find a rival'), () => findRival(go, draw), 'go wide big'); go.disabled = band.length !== 3; }
      else { go = key(tr('New matches in {msToTomorrow}', { msToTomorrow: countdown(H.msToTomorrow()) }), () => {}, 'wide soft'); go.disabled = true; }
      add(foot, go, key(tr('Bands board'), () => UI.go('ranks', { tab: 'bands', from: 'bands' }), 'wide soft'));
      root.appendChild(foot);
    };
    draw();
  };

  UI.pvpResult = (out) => {
    const S = UI.S, kids = [], loot = box('loot'), R = out.rival;
    loot.appendChild(UI.purse('ic_note', '+' + out.notes)); if (out.shells) loot.appendChild(UI.purse('ic_shell', '+' + out.shells));
    const ticket = add(el('div', 'ticket' + (out.win ? '' : ' lost')), faces(R.band.map((c) => c.f), 0.42, true), add(el('div', 'grow'), txt('label', tr('Rival')), nameEl('', R.name)));
    if (out.win) { ticket.appendChild(UI.stamp(tr('Won!'))); UI.confetti(out.shells ? 50 : 30); }
    const appl = add(el('div', 'applline'), UI.icon('ic_trophy', 0.9), el('b', '', UI.fmt(out.applause)), el('span', out.delta >= 0 ? 'good' : 'bad', (out.delta >= 0 ? '+' : '') + out.delta), txt('small dim', tr('Applause')));
    kids.push(txt('disp big center', out.win ? tr('Your band wins!') : out.why === 'time' ? tr('Lights out!') : tr('Not this time')));
    if (out.why === 'time') kids.push(txt('center dim', out.win ? tr('Time ran out, and your band had more HP left.') : tr('Time ran out, and the rival had more HP left.')));
    kids.push(ticket, loot, appl);
    if (out.shells) kids.push(txt('center good', tr('<b>All {n} matches played today:</b> a shell for you!', { n: P.perDay })));
    const left = H.pvpLeft(S);
    kids.push(txt('small dim center', left ? tr('{n} matches left today', { n: left }) : tr('New matches in {msToTomorrow}', { msToTomorrow: countdown(H.msToTomorrow()) })));
    kids.push(key(tr('Back to the stage'), () => { UI.closeModal(); UI.go('bands'); }, 'go wide big'), key(tr('Home'), () => { UI.closeModal(); UI.go('home'); }, 'wide soft'));
    Au.sfx('coin'); UI.modal(...kids);
  };

  // Home, once: a new mode is in the game
  UI.bandsNews = () => {
    const S = UI.S; S.flags.newsBands = 1; UI.save();
    const open = H.pvpOpen(S), art = add(el('div', 'newsart'), el('div', 'rays'), UI.icon('nd_battle', 3.6));
    const pays = box('loot', UI.purse('ic_note', '+' + P.win, tr('Notes for a win')), txt('small dim', tr('a win')), UI.purse('ic_note', '+' + P.loss, tr('Notes for a loss')), txt('small dim', tr('a loss')), UI.purse('ic_shell', '+1', tr('Shells')), txt('small dim', tr('5 a day')));
    UI.modal(txt('label center newskick', tr('New in Gigs')), art, el('div', 'logo small newslogo', tr('Battle of the Bands')),
      txt('center', tr('Lock in your band and take on other players\' bands. Climb the new Bands board on Applause.')), pays,
      open ? key(tr('Take the stage'), () => { UI.closeModal(); UI.go('bands'); }, 'go wide big') : txt('center chip', tr('Unlocks at Level {unlock}', { unlock: P.unlock })),
      key(open ? tr('Later') : tr('Got it'), UI.closeModal, 'wide soft'));
    Au.sfx('win'); UI.confetti(40);
  };
})(window.H);
