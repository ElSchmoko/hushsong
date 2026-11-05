// Battle of the Bands, step by step with screenshots: MORE=./pvp-play.js node test/play.js bands [w h]
// The online calls are answered here (no real players are made): a rival band comes back, results are taken.
const S = require('./scenarios.js');
S.bands = async ({ p, shot, tap, sleep, evalS, waitBattle }) => {
  // a save from before the mode: level 30, a few evolved pets, a name on the boards
  await evalS(() => {
    const H = window.H, UI = H.UI, S = H.newState(); delete S.flags.newsBands; S.flags.intro = 1; S.level = 30; S.stage = 61; S.notes = 120;
    for (const [sp, f] of [['thud', 'stomp'], ['twang', 'pluck'], ['hum', 'drone'], ['squeak', 'squeak']]) { const p = H.addPet(S, sp); if (H.FORMS[f]) p.form = f; }
    S.net = { id: '00000000-0000-4000-8000-000000000001', secret: 'x'.repeat(40), name: 'B', dirty: 0 };
    UI.adopt(S);
    // the server, played here
    const rival = { name: 'Lofi Owls', level: 44, applause: 1110, band: [{ f: 'shred', r: 4, g: [{ t: Object.keys(H.ITEM_TYPES)[0], r: 'e', l: null }] }, { f: 'chorale', r: 2, g: [] }, { f: 'toll', r: 6, g: [] }] };
    window.__calls = [];
    const answer = async (fn, args) => { window.__calls.push(fn); await new Promise((r) => setTimeout(r, 200));
      if (fn === 'hs_pvp_match') return { applause: UI.S.pvp.applause, token: 'tok-' + window.__calls.length, rival };
      if (fn === 'hs_pvp_result') return { applause: UI.S.pvp.applause };
      if (fn === 'hs_board') return { top: [{ rank: 1, name: 'Lofi Owls', band: ['shred', 'chorale', 'toll'], level: 44, v: 1110 }, { rank: 2, name: 'B', band: ['stomp', 'pluck', 'drone'], level: 30, v: 1016, me: true }, { rank: 3, name: 'Kazoo Kid', band: ['squeak', 'hum', 'thud'], level: 18, v: 962 }], me: { rank: 2, v: 1016 } };
      return { ok: true }; };
    const real = window.fetch; window.fetch = async (url, o) => { const m = /\/rpc\/(\w+)/.exec(String(url)); if (!m) return real(url, o); const body = await answer(m[1], JSON.parse(o.body || '{}')); return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } }); };
    UI.go('home');
  });
  await sleep(1400); await shot('news');
  await tap('Take the stage'); await sleep(500); await shot('stage-empty');
  await p.locator('.tstrip.lockin').click(); await sleep(400); await shot('stage-locked');
  await p.locator('.payline').click(); await sleep(300); await shot('pay-toast');
  await tap('Find a rival'); await sleep(900); await shot('rival');
  await tap('Start the match'); await sleep(1300); await shot('faceoff');
  // the player steers their own band: wait for one of its turns, play a move by hand
  await sleep(3600); await p.mouse.click(200, 300);
  for (let i = 0; i < 80 && !(await evalS(() => { const u = document.querySelector('.bpanel .key.go'); return u && !u.disabled; })); i++) await sleep(250);
  await shot('battle-your-turn'); await tap('Use'); await sleep(1200); await shot('battle-after-move');
  // then the rest on Auto
  await evalS(() => { for (const t of ['Auto', '1x']) { const b = [...document.querySelectorAll('.key.tog')].find((x) => x.textContent === t); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); } });
  await waitBattle(); await sleep(600); await shot('result');
  await tap('Back to the stage'); await sleep(500); await shot('stage-after');
  console.log('calls:', JSON.stringify(await evalS(() => window.__calls)), 'pvp:', JSON.stringify(await evalS(() => { const P = window.H.UI.S.pvp; return { played: P.played, applause: P.applause, unsent: P.unsent, cur: !!P.cur }; })));
  // the fifth match pays a shell
  await evalS(() => { const S = window.H.UI.S; S.pvp.played = 4; window.H.UI.go('bands'); }); await sleep(300);
  await tap('Find a rival'); await sleep(700); await tap('Start the match'); await sleep(300);
  await evalS(() => { window.__hsSpeed = 8; }); await waitBattle(); await sleep(500); await shot('result-fifth');
  await evalS(() => { window.__hsSpeed = 0; window.H.UI.closeModal(); window.H.UI.go('bands'); }); await sleep(400); await shot('stage-done');
  // free play after the five: no call to the stage, no rewards, nothing changes
  const was = await evalS(() => { const S = window.H.UI.S; window.__calls.length = 0; return JSON.stringify([S.notes, S.shells, S.pvp.applause, S.pvp.played, S.stats.pvpWins || 0]); });
  await tap('Play for fun'); await sleep(700); await shot('free-rival'); await tap('Start the match'); await sleep(300);
  await evalS(() => { window.__hsSpeed = 8; }); await waitBattle(); await sleep(500); await shot('free-result');
  await tap('Play another'); await sleep(900); await shot('free-again'); await tap('Start the match'); await sleep(300); await waitBattle(); await sleep(400);
  await evalS(() => { window.__hsSpeed = 0; });
  const now = await evalS(() => { const S = window.H.UI.S; return JSON.stringify([S.notes, S.shells, S.pvp.applause, S.pvp.played, S.stats.pvpWins || 0]); });
  console.log('free play unchanged:', was === now, was, now, 'calls:', JSON.stringify(await evalS(() => window.__calls)));
  await evalS(() => { window.H.UI.closeModal(); window.H.UI.go('bands'); }); await sleep(300);
  await evalS(() => window.H.UI.go('gigs')); await sleep(500); await shot('gigboard');
  await evalS(() => window.H.UI.go('ranks', { tab: 'bands' })); await sleep(700); await shot('ranks-bands');
  await evalS(() => window.H.UI.go('ranks', { tab: 'encore' })); await sleep(700); await shot('ranks-encore');
  await evalS(() => { window.H.UI.go('records'); }); await sleep(400); await evalS(() => { const t = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Bands'); if (t) t.click(); const sc = document.querySelector('.scroll'); const h = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent.trim() === 'Bands'); if (h) h.scrollIntoView(); }); await sleep(300); await shot('records');
  // leaving a match counts as a loss
  await evalS(() => { const S = window.H.UI.S; S.pvp.played = 1; window.H.UI.go('bands'); }); await sleep(300);
  await tap('Find a rival'); await sleep(700); await tap('Start the match'); await sleep(900);
  await evalS(() => window.H.UI.cur.back()); await sleep(300); await shot('leave-confirm'); await tap('Leave'); await sleep(600); await shot('leave-result');
  // German
  await evalS(() => { window.H.UI.closeModal(); window.H.setLang && window.H.setLang('de'); window.H.UI.go('bands'); }); await sleep(500); await shot('stage-de');
  // a save below level 15 sees when it opens
  await evalS(() => { const H = window.H, S = H.UI.S; S.level = 9; delete S.flags.newsBands; H.UI.go('home'); }); await sleep(1300); await shot('news-locked');
};
