// Screens of the new modes, step by step: FAST=1 MORE=./modes-play.js node test/play.js modes [w h]
const S = require('./scenarios.js');
S.modes = async ({ p, shot, tap, has, sleep, evalS, waitBattle }) => {
  // a save at level 12 with evolved pets: everything but Encore is open
  await evalS(() => { const H = window.H, UI = H.UI, S = H.newState(); S.flags.intro = 1; S.level = 12; S.stage = 27; S.notes = 300; for (const [sp, f] of [['thud', 'thump'], ['twang', 'pluck'], ['hum', 'hum']]) { const p = H.addPet(S, sp); if (f !== sp && H.FORMS[f]) { p.form = f; p.t1 = true; } } UI.adopt(S); UI.go('home'); });
  await sleep(300); await shot('home');
  await evalS(() => { const UI = window.H.UI; UI.S.level = 3; UI.go('home'); }); await sleep(200); await shot('home-locked');
  await evalS(() => { const UI = window.H.UI; UI.S.level = 12; UI.go('home'); }); await sleep(100);
  await p.locator('.mode.gigs').click(); await sleep(400); await shot('gigs'); await evalS(() => { const UI = window.H.UI; UI.S.level = 3; UI.S.stage = 8; UI.go('gigs'); }); await sleep(300); await shot('gigs-locked'); await evalS(() => { const UI = window.H.UI; UI.S.level = 12; UI.S.stage = 27; UI.go('gigs'); }); await sleep(200);
  await p.locator('.flyer.daily').click(); await sleep(700); await shot('daily');
  await tap('Play the gig'); await sleep(1500); await shot('daily-intro');
  await sleep(1400); await p.mouse.click(200, 300); await sleep(900); await shot('daily-battle');
  await p.evaluate(() => { const b = [...document.querySelectorAll('.key.tog')].find((x) => x.textContent === 'Auto'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); }); await waitBattle(); await sleep(300); await shot('daily-result');
  await evalS(() => window.H.UI.closeModal());
  // Solo
  await evalS(() => window.H.UI.go('solo')); await sleep(400); await shot('solo-lobby');
  await tap('Start the tour'); await sleep(3400); await shot('solo-map');
  await p.locator('.snode.can').first().click({ force: true }); await sleep(300); await shot('solo-preview');
  await tap('Play this gig'); await sleep(1400); await shot('solo-battle');
  await p.evaluate(() => { const b = [...document.querySelectorAll('.key.tog')].find((x) => x.textContent === 'Auto'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); }); await waitBattle(); await sleep(300); await shot('solo-won');
  if (await has('Pick a boon')) { await tap('Pick a boon'); await sleep(400); await shot('solo-boons'); await p.locator('.boon').first().click(); await sleep(100); await shot('solo-boon-picked'); await p.locator('.gofoot .key.go').click(); await sleep(400); await shot('solo-map2'); }
  // force each kind of stop to look at it
  // the map in every region
  for (const r of ['fen', 'orchard', 'ridge', 'caves', 'harbor', 'hall']) { await evalS((r) => { const H = window.H, UI = H.UI; if (!UI.S.soloRun) H.startSolo(UI.S, UI.S.pets[0].id, Math.random); UI.S.soloRun.region = r; UI.S.soloRun.pending = null; UI.go('solomap'); }, r); await sleep(300); await shot('map-' + r); }
  for (const t of ['rest', 'event', 'jam']) {
    await evalS((t) => { const H = window.H, UI = H.UI, run = UI.S.soloRun; if (!run) return; run.pending = t === 'rest' ? { type: 'rest' } : t === 'event' ? { type: 'event', ev: 'busker' } : { type: 'boon', src: 'jam', opts: H.boonOffer(run, 'jam', Math.random) }; UI.go('solostop'); }, t);
    await sleep(400); await shot('solo-' + t);
  }
  await evalS(() => { const H = window.H, UI = H.UI; UI.S.soloRun.pending = null; UI.S.soloRun.boons.push('overflow', 'soul', 'amp', 'amp'); UI.go('solomap'); }); await sleep(300);
  await p.locator('.sboons').click(); await sleep(300); await shot('solo-boonsheet'); await evalS(() => window.H.UI.closeModal());
  await evalS(() => { const H = window.H, UI = H.UI, out = { solo: true, win: true, done: true, boss: true, pet: UI.S.soloRun.pet, boons: UI.S.soloRun.boons.slice(), notes: 25, xp: 80, region: UI.S.soloRun.region, item: H.rollItem(UI.S, Math.random, 'elite') }; UI.go('soloend', { out }); }); await sleep(500); await shot('solo-end-won');
  await evalS(() => { const H = window.H, UI = H.UI, out = { solo: true, win: false, reached: 3, pet: UI.S.pets[0].id, boons: ['amp', 'click'], notes: 0, xp: 20, region: 'caves' }; UI.go('soloend', { out }); }); await sleep(500); await shot('solo-end-lost');
};
// every house rule mid-battle: FAST=1 MORE=./modes-play.js node test/play.js twists
S.twists = async ({ p, shot, sleep, evalS }) => {
  await evalS(() => { const H = window.H, UI = H.UI, S = H.newState(); S.flags.intro = 1; S.level = 30; S.stage = 60; for (const [sp, f] of [['thud', 'thump'], ['twang', 'pluck'], ['hum', 'hum']]) { const p = H.addPet(S, sp); if (H.FORMS[f]) { p.form = f; p.t1 = true; } } S.settings.auto = 1; S.settings.speed = 2; UI.adopt(S); });
  for (const tw of (process.env.TW ? process.env.TW.split(',') : null) || ['mirror', 'potato', 'key', 'volume', 'backwards', 'shared', 'chain', 'giant', 'duet', 'swap', 'mic', 'echo', 'lastcall', 'nobasics']) {
    await evalS((tw) => { const H = window.H; H.twistOf = () => tw; H.UI.S.daily = null; H.UI.go('battle', { daily: 1 }); }, tw);
    await sleep(900); await p.mouse.click(180, 300); await sleep(4200); await shot(tw);
  }
};
S.encshot = async ({ p, shot, sleep, evalS }) => {
  await evalS(() => { const H = window.H, UI = H.UI, S = H.newState(); S.flags.intro = 1; S.level = 30; S.stage = 60; for (const [sp, f] of [['thud', 'thump'], ['twang', 'pluck'], ['hum', 'hum']]) { const p = H.addPet(S, sp); if (H.FORMS[f]) { p.form = f; p.t1 = true; } } UI.adopt(S); UI.go('encore'); });
  await sleep(500); await shot('encore');
  await evalS(() => { const H = window.H, UI = H.UI; H.startEncoreRun(UI.S, Math.random); UI.S.encoreRun.wave = 4; UI.S.encoreRun.hp[UI.S.pets[1].id] = 0; UI.S.encoreRun.hp[UI.S.pets[0].id] = 0.4; UI.S.encore.paid = 0; UI.go('encore'); });
  await sleep(500); await shot('encore-run'); await evalS(() => window.H.UI.go('home')); await sleep(300); await shot('home30');
};
// a whole Solo tour through the screens, on auto: FAST=1 MORE=./modes-play.js node test/play.js solorun
S.solorun = async ({ p, shot, sleep, evalS, waitBattle }) => {
  await evalS(() => { const H = window.H, UI = H.UI, S = H.newState(); S.flags.intro = 1; S.level = 30; S.stage = 60; for (const [sp, f] of [['thud', 'thump'], ['twang', 'pluck'], ['hum', 'hum']]) { const p = H.addPet(S, sp); if (H.FORMS[f]) { p.form = f; p.t1 = true; } } S.settings.auto = 1; S.settings.speed = 2; UI.adopt(S); UI.go('solo'); });
  await sleep(300); await p.locator('button:has-text("Start the tour")').click(); await sleep(400);
  const click = async (sel) => { const l = p.locator(sel).first(); if (await l.count()) { await l.click({ force: true }); await sleep(250); return true; } return false; };
  for (let step = 0; step < 90; step++) {
    const scr = await evalS(() => window.H.UI.cur.name), modal = await evalS(() => !document.getElementById('modal').hidden);
    if (process.env.V) console.log(step, scr, modal, await evalS(() => JSON.stringify(window.H.UI.S.soloRun && { at: window.H.UI.S.soloRun.at, g: window.H.UI.S.soloRun.gigs, p: window.H.UI.S.soloRun.pending })));
    if (scr === 'soloend') { await sleep(400); await shot('end'); console.log('tour ended at step', step, await evalS(() => document.querySelector('.endp').innerText.replace(/\n/g, ' | '))); return; }
    if (modal) { if (!(await click('#modal .key.go, #modal .key.gold, #modal .key.coral'))) await click('#modal .key'); continue; }
    if (scr === 'solomap') { if (await p.locator('.smapin.busy').count()) { await sleep(400); continue; } await click('.snode.can'); await sleep(200); continue; }
    if (scr === 'solostop') { if (await p.locator('.boon').count()) { await click('.boon'); await click('.gofoot .key.go'); } else await click('.choice'); await sleep(300); continue; }
    if (scr === 'battle') { await waitBattle(); continue; }
    console.log('stuck on', scr); await shot('stuck'); return;
  }
  console.log('too many steps'); await shot('toolong');
};
// the new motion, caught mid-animation (no speed-up): node test/play.js motion
S.motion = async ({ p, shot, sleep, evalS }) => {
  await evalS(() => { const H = window.H, UI = H.UI, S = H.newState(); S.flags.intro = 1; S.level = 30; S.stage = 60; for (const [sp, f] of [['thud', 'thump'], ['twang', 'pluck'], ['hum', 'hum']]) { const p = H.addPet(S, sp); if (H.FORMS[f]) { p.form = f; p.t1 = true; } } UI.adopt(S); UI.go('home'); });
  await sleep(1200); await shot('home-fresh');
  await evalS(() => window.H.UI.go('solo')); await sleep(500); await shot('solo-lobby');
  await p.locator('button:has-text("Start the tour")').click(); await sleep(500); await shot('intro-a'); await sleep(1300); await shot('intro-b'); await sleep(1600); await shot('intro-c');
  await p.locator('.snode.can').first().click({ force: true }); await sleep(400); await p.locator('#modal .key.go').click(); await sleep(450); await shot('walk'); await sleep(2600); await shot('battle');
  await evalS(() => { const H = window.H, UI = H.UI, r = UI.S.soloRun; UI.go('home'); r.gigs = 2; r.pending = { type: 'boon', src: 'gig', opts: H.boonOffer(r, 'gig', Math.random) }; UI.result({ solo: true, win: true, gig: 3, notes: 15, xp: 30, loud: false }); });
  await sleep(700); await shot('gigwon'); await evalS(() => window.H.UI.closeModal());
  await evalS(() => window.H.UI.go('solostop')); await sleep(300); await shot('deal'); await sleep(600); await p.locator('.boon').first().click(); await sleep(150); await p.locator('.gofoot .key.go').click(); await sleep(300); await shot('taken'); await sleep(900); await shot('map-after');
  await evalS(() => { const H = window.H, UI = H.UI; UI.S.soloRun.pending = { type: 'rest' }; UI.S.soloRun.hp = 0.5; UI.go('solostop'); }); await sleep(1500); await shot('camp'); await p.locator('.choice').first().click(); await sleep(400); await shot('slept');
  await evalS(() => { const H = window.H, UI = H.UI, r = UI.S.soloRun; r.gigs = 5; const b = r.map.find((n) => n.type === 'boss'); r.at = b.id; r.pending = { type: 'battle' }; UI.go('battle', { solo: 1 }); }); await sleep(1300); await shot('vs');
  await evalS(() => { const H = window.H, UI = H.UI; UI.go('soloend', { out: { solo: true, win: true, done: true, pet: UI.S.pets[0].id, boons: ['amp', 'soul'], total: 100, notes: 25, xp: 90, region: 'fen' } }); }); await sleep(1500); await shot('end');
  await evalS(() => { const H = window.H; H.twistOf = () => 'giant'; H.UI.S.daily = null; H.UI.go('battle', { daily: 1 }); }); await sleep(1500); await shot('giant');
  await evalS(() => { const H = window.H; H.UI.go('home'); H.UI.result({ daily: true, win: true, first: true, twist: 'giant', venue: 'The Anvil Room', notes: 50, xp: 40 }); }); await sleep(900); await shot('dailywon');
  await evalS(() => { const H = window.H; H.UI.S.daily.won = 1; H.UI.closeModal(); H.UI.go('daily'); }); await sleep(900); await shot('poster-won');
  await evalS(() => window.H.UI.go('encore')); await sleep(300); await shot('encore-on'); await sleep(1400); await shot('encore');
};
