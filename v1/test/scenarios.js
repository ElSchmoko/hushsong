module.exports = {
  async intro({ p, shot, tap, has, sleep, waitBattle }) {
    await shot('title');
    await tap('Listen'); await shot('intro1');
    await tap('Go on'); await tap('Go on'); await shot('intro3');
    await tap('Pick one up'); await sleep(300); await shot('shells');
    await p.locator('.shellb').nth(1).click(); await sleep(700); await shot('heard');
    await tap('Hatch this one'); await sleep(400); await shot('hatching'); await sleep(1100); await shot('hatched');
    await tap('Take it outside'); await sleep(900); await shot('tutorial-start');
    await sleep(2500); await shot('tutorial-mid');
    await p.evaluate(() => window.H.UI.S.settings.speed = 3);
    for (let i = 0; i < 40; i++) { if (await p.evaluate(() => !document.getElementById('modal').hidden)) break; const r = await p.locator('.ucard.ready').count(); if (r) { await p.locator('.ucard.ready').first().click(); await sleep(300); await shot('cue'); } await sleep(500); }
    await shot('tutorial-end');
    await tap('Back to the shells'); await sleep(300);
    await p.locator('.shellb').nth(0).click(); await sleep(200); await tap('Hatch this one'); await sleep(1500); await shot('hatched2'); await tap('Next shell'); await sleep(300);
    await p.locator('.shellb').nth(2).click(); await sleep(200); await tap('Hatch this one'); await sleep(1500); await tap('Onward'); await sleep(500);
    await shot('camp');
  },
};
const inject = (opts) => {
  const H = window.H, S = H.newState(); S.flags = { intro: 1, tut: 1 }; S.shells = opts.shells || {};
  (opts.pets || ['thud', 'twang', 'hum']).forEach((f) => { const sp = H.FORMS[f].sp; const p = H.addPet(S, sp, opts.trait || 'loud'); p.form = f; p.t1 = H.FORMS[f].tier >= 1; p.t2 = H.FORMS[f].tier >= 2; for (const id of H.formChain(f)) S.seen[id] = 1; });
  S.level = opts.level || 1; S.notes = opts.notes == null ? 0 : opts.notes; S.gear = opts.gear || {}; S.regions = opts.regions || {}; S.settings.speed = opts.speed || 3; S.settings.autoCue = opts.autoCue ? 1 : 0;
  H.UI.S = S; H.UI.go(opts.go || 'camp');
};
module.exports.tour = async ({ p, shot, tap, has, sleep, waitBattle }) => {
  await p.evaluate(inject, { level: 4, notes: 320, gear: { metronome: 1, rosin: 1 }, shells: { fen: 2 } }); await sleep(300); await shot('camp');
  await tap('Band'); await sleep(200); await shot('band');
  await p.locator('.slot').nth(0).click(); await sleep(150); await shot('band-sel'); await p.locator('.slot').nth(2).click(); await sleep(150);
  await p.locator('.pet').nth(0).click(); await sleep(250); await shot('pet-kit');
  await tap('Evolve'); await sleep(200); await shot('pet-evo');
  await p.locator('.nodeb').nth(1).click(); await sleep(200); await shot('pet-evo-pick'); await p.locator('.scroll').evaluate((e) => e.scrollTo(0, 9999)); await sleep(100); await shot('pet-evo-pick2');
  await tap('Evolve ·'); await sleep(500); await shot('evolved'); await tap('Good'); await sleep(200);
  await p.locator('.nodeb').nth(3).click(); await sleep(200); await p.locator('.scroll').evaluate((e) => e.scrollTo(0, 9999)); await shot('pet-evo-t2');
  await p.locator('.tabs button').nth(2).click(); await sleep(200); await shot('pet-gear');
  await p.locator('.gslot').nth(0).click(); await sleep(200); await shot('gear-pick'); await p.locator('#modal .gslot').nth(0).click(); await sleep(200); await shot('gear-on');
  await tap('‹'); await sleep(150); await tap('‹'); await sleep(150);
  await tap('Luthier'); await sleep(200); await shot('luthier'); await tap('‹');
  await tap('Songbook'); await sleep(200); await shot('songbook'); await p.locator('.tabs button').nth(1).click(); await sleep(150); await shot('songbook-din'); await p.locator('.tabs button').nth(2).click(); await sleep(150); await shot('songbook-terms'); await tap('‹');
  await tap('Shells'); await sleep(200); await shot('shells'); await tap('‹');
  await tap('Set out'); await sleep(250); await shot('map');
  await p.locator('.card').nth(0).click(); await sleep(250); await shot('region');
  await tap('Set out'); await sleep(300); await shot('delve');
  await p.locator('.score button').first().click(); await sleep(1200); await shot('battle1'); await sleep(1500); await shot('battle2'); await sleep(1500); await shot('battle3');
  await waitBattle(); await shot('reward');
  if (await has('Onward')) { await tap('Onward'); await sleep(250); await shot('ornament'); }
  const ch = p.locator('#modal .choice'); if (await ch.count()) { await ch.first().click(); await sleep(300); }
  await shot('delve2');
};
module.exports.delve = async ({ p, shot, tap, has, sleep, waitBattle }) => {
  await p.evaluate(inject, { level: 5, notes: 100, pets: ['stomp', 'pluck', 'whistle'], autoCue: 1 }); await sleep(200);
  await p.evaluate(() => { const H = window.H, S = H.UI.S; S.delve = H.genDelve(S, 'fen', false, Math.random); H.UI.go('delve'); }); await sleep(300);
  for (let step = 0; step < 9; step++) {
    const btn = p.locator('.score button'); if (!(await btn.count())) break;
    await btn.last().click(); await sleep(600);
    const inBattle = await p.evaluate(() => window.H.UI.cur.name === 'battle');
    if (inBattle) { await sleep(900); await shot('b' + step); await waitBattle(); }
    await shot('m' + step);
    for (let k = 0; k < 4; k++) { const mod = await p.evaluate(() => !document.getElementById('modal').hidden); if (!mod) break; const c = p.locator('#modal .choice'); if (await c.count()) { await c.first().click(); } else { const kb = p.locator('#modal .key').last(); await kb.click(); } await sleep(350); if (k === 0) await shot('n' + step); }
    if (await p.evaluate(() => window.H.UI.cur.name === 'camp')) break;
  }
  await shot('end');
};
module.exports.misc = async ({ p, shot, tap, has, sleep, waitBattle }) => {
  await p.evaluate(inject, { level: 9, notes: 500, pets: ['cadence', 'shred', 'carol', 'blare', 'yelp', 'clack'], speed: 1, gear: { capo: 1, score: 1 }, regions: { fen: { clears: 1, encore: 0 }, works: { clears: 1, encore: 0 } } }); await sleep(200);
  await shot('camp');
  await p.evaluate(() => { const H = window.H, S = H.UI.S; S.delve = H.genDelve(S, 'ridge', false, Math.random); S.delve.ornaments = ['forte', 'encore']; S.delve.cols[0][0].type = 'elite'; H.UI.go('delve'); }); await sleep(300); await shot('delve');
  await p.locator('.score button').first().click(); await sleep(2500); await shot('battle');
  // inspect an enemy
  const box = await p.locator('.field canvas').boundingBox(); await p.mouse.click(box.x + box.width * 0.66, box.y + box.height * 0.5); await sleep(300); await shot('inspect'); await tap('Back to the fight');
  for (let i = 0; i < 60; i++) { if (await p.locator('.ucard.ready').count()) break; await sleep(300); }
  await shot('cue-ready'); if (await p.locator('.ucard.ready').count()) { await p.locator('.ucard.ready').nth(1).click(); await sleep(700); await shot('solo'); }
  await p.locator('.ucard').nth(0).click(); await sleep(300); await shot('inspect-ally'); await tap('Back to the fight');
  await p.evaluate(() => (window.H.UI.S.settings.speed = 3)); await p.locator('.ctl .key').last().click(); await p.locator('.ctl .key').last().click(); await p.locator('.ctl .key').nth(0).click();
  await waitBattle(); await shot('reward');
  // settings + event + defeat + ending
  await p.evaluate(() => window.H.UI.settings()); await sleep(200); await shot('settings');
  await p.evaluate(() => { const H = window.H, S = H.UI.S; const dv = S.delve; H.UI.closeModal(); const n = dv.cols[1][0]; n.type = 'event'; n.ev = 'bell'; dv.pending = null; dv.at = dv.cols[0][0].id; dv.cols[0][0].next = [n.id]; H.UI.go('delve'); }); await sleep(250);
  await p.locator('.score button').first().click(); await sleep(250); await shot('event');
  await p.evaluate(() => { const H = window.H; H.UI.rewards({ win: false }, H.UI.S.delve, {}); }); await sleep(200); await shot('defeat');
  await p.evaluate(() => { window.H.UI.ending(); }); await sleep(200); await shot('ending');
  await p.evaluate(() => { window.H.UI.go('songbook'); }); await sleep(200); await p.locator('.cell').nth(1).click(); await sleep(250); await shot('form');
  await p.evaluate(() => { window.H.UI.go('map'); }); await sleep(200); await shot('map');
  await p.evaluate(() => { window.H.UI.go('title'); }); await sleep(200); await shot('title');
};
module.exports.sizes = async ({ p, shot, tap, has, sleep, waitBattle }) => {
  await shot('title');
  await p.evaluate(inject, { level: 9, notes: 500, pets: ['cadence', 'shred', 'carol', 'blare'], speed: 2, autoCue: 1, regions: { fen: { clears: 1 }, works: { clears: 1 } } }); await sleep(250); await shot('camp');
  await p.evaluate(() => window.H.UI.go('pet', { id: 1 })); await sleep(200); await shot('pet');
  await p.evaluate(() => window.H.UI.go('pet', { id: 1, tab: 'evo' })); await sleep(200); await shot('evo');
  await p.evaluate(() => window.H.UI.go('band')); await sleep(200); await shot('band');
  await p.evaluate(() => window.H.UI.go('map')); await sleep(200); await shot('map');
  await p.evaluate(() => { const H = window.H, S = H.UI.S; S.delve = H.genDelve(S, 'ridge', false, Math.random); H.UI.go('delve'); }); await sleep(300); await shot('delve');
  await p.locator('.score button').first().click(); await sleep(3000); await shot('battle');
  await p.evaluate(() => { const H = window.H, S = H.UI.S; S.delve.pending = S.delve.cols[6][0].id; H.UI.go('battle'); }); await sleep(3500); await shot('boss');
};
module.exports.persist = async ({ p, shot, tap, has, sleep, waitBattle }) => {
  await p.evaluate(inject, { level: 13, notes: 77, pets: ['cadence', 'shred', 'carol', 'aria'], speed: 3, autoCue: 1, gear: { capo: 2 }, regions: { fen: { clears: 1 }, works: { clears: 1 }, ridge: { clears: 1 }, hall: { clears: 1 } } }); await sleep(400);
  await p.evaluate(() => window.H.UI.go('map')); await sleep(200); await p.locator('.card').nth(0).click(); await sleep(200); await shot('region-encore'); await tap('Encore'); await sleep(300); await shot('encore-delve');
  await p.locator('.score button').first().click(); await sleep(1500); await shot('encore-battle'); await sleep(600);
  await p.reload(); await sleep(600); await shot('reloaded-title');
  const st = await p.evaluate(() => { const S = window.H.UI.S; return { lvl: S.level, notes: S.notes, pets: S.pets.length, delve: !!S.delve, pending: S.delve && S.delve.pending }; }); console.log('after reload', JSON.stringify(st));
  await tap('Carry on'); await sleep(400); await shot('resume');
  await p.locator('.score button').first().click(); await sleep(800); await waitBattle(); await shot('encore-reward');
};
// A whole playthrough through the real interface, as a patient but ordinary player.
module.exports.full = async ({ p, shot, tap, has, sleep }) => {
  const st = () => p.evaluate(() => { const H = window.H, S = H.UI.S; return { scr: H.UI.cur.name, modal: !document.getElementById('modal').hidden, lvl: S.level, notes: S.notes, pets: S.pets.map((x) => x.form), band: S.band, shells: H.shellCount(S), delve: !!S.delve, regions: Object.keys(S.regions).filter((r) => S.regions[r].clears), fights: S.tally.fights }; });
  const fast = () => p.evaluate(() => { window.H.UI.S.settings.speed = 24; window.H.UI.S.settings.autoCue = 1; });
  await tap('Listen'); await tap('Go on'); await tap('Go on'); await tap('Pick one up'); await sleep(200);
  let delves = 0, guard = 0, lastShot = '';
  const modalClick = async () => {
    const c = p.locator('#modal .choice'); if (await c.count()) { await c.first().click(); return; }
    for (const t of ['Onward', 'Back to camp', 'Good', 'Back to the shells', 'Take a bow', 'Listen', 'Close', 'Done']) { const b = p.locator(`#modal button:has-text("${t}")`); if (await b.count()) { await b.first().click(); return; } }
    await p.locator('#modal .key').last().click();
  };
  while (guard++ < 1500) {
    const s = await st();
    if (s.regions.length >= 4 && s.scr === 'camp' && !s.modal) break;
    if (s.modal) { if (guard % 1 === 0 && lastShot !== 'm' + s.fights && (await p.locator('#modal :text("song comes back")').count())) { await sleep(2700); await shot('clear-' + s.regions.length); lastShot = 'm' + s.fights; } await modalClick(); await sleep(120); continue; }
    if (s.scr === 'shells') {
      if (await p.locator('.shellb').count()) { await p.locator('.shellb').nth(Math.floor(Math.random() * 3)).click(); await sleep(60); await tap('Hatch this one'); await sleep(1300); const k = p.locator('.pad .key').last(); await k.click(); await sleep(150); }
      else { await p.locator('.key').last().click(); await sleep(100); }
      continue;
    }
    if (s.scr === 'battle') { await fast(); await sleep(250); continue; }
    if (s.scr === 'delve') { const b = p.locator('.score button'); const n = await b.count(); if (!n) { console.log('NO CHOICES in delve'); await shot('stuck'); break; } await b.nth(Math.floor(Math.random() * n)).click(); await sleep(150); continue; }
    if (s.scr === 'camp') {
      // fill the stage, evolve what we can, hatch shells, then set out
      const todo = await p.evaluate(() => { const H = window.H, S = H.UI.S; const evo = S.pets.filter((x) => S.band.includes(x.id)).map((x) => { const kids = H.childrenOf(x.form).filter((f) => H.evoCheck(S, x, f).ok); return kids.length ? { id: x.id, to: kids[Math.floor(Math.random() * kids.length)] } : null; }).filter(Boolean)[0]; return { evo, empty: S.band.includes(null) && S.pets.length > S.band.filter(Boolean).length }; });
      if (todo.evo) { await p.evaluate((e) => window.H.UI.go('pet', { id: e.id, tab: 'evo', pick: e.to, from: 'camp' }), todo.evo); await sleep(150); const b = p.locator('.sheet .key.gold'); if (await b.count()) { await b.click(); await sleep(250); if (lastShot !== 'evo' + todo.evo.to) { await shot('evo-' + todo.evo.to); lastShot = 'evo' + todo.evo.to; } await modalClick(); await sleep(100); } await tap('‹'); continue; }
      if (s.shells > 0 && s.pets.length < 18) { await tap('Shells'); continue; }
      delves++; console.log(`delve ${delves}: lvl ${s.lvl} notes ${s.notes} band ${s.pets.slice(0, 3).join(',')} roster ${s.pets.length} cleared ${s.regions.join(',')}`);
      if (delves > 22) break;
      await p.locator('.key.gold.wide').click(); await sleep(150);
      const open = await p.locator('.card:not(.locked)').count(); await p.locator('.card:not(.locked)').nth(open - 1).click(); await sleep(150); await p.locator('#modal .key.gold').click(); await sleep(200); continue;
    }
    await sleep(150);
  }
  const s = await st(); console.log('END', JSON.stringify(s), 'delves', delves); await shot('final-camp');
  await p.evaluate(() => window.H.UI.go('songbook')); await sleep(200); await shot('final-songbook');
  await p.evaluate(() => window.H.UI.go('band')); await sleep(200); await shot('final-band');
};
