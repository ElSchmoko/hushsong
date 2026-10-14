const inject = (o) => {
  const H = window.H, S = H.newState(); S.flags = { intro: 1 }; S.shells = o.shells || 0; const rnd = H.rng(o.seed || 5);
  (o.pets || ['thud', 'twang', 'hum']).forEach((f) => { const p = H.addPet(S, H.FORMS[f].sp); p.form = f; p.t1 = H.FORMS[f].tier >= 1; p.t2 = H.FORMS[f].tier >= 2; p.rank = (o.ranks || {})[f] || 0; });
  S.level = o.level || 1; S.notes = o.notes || 0; S.stage = o.stage || 1; S.settings.speed = o.speed || 1; S.settings.auto = o.auto ? 1 : 0; S.echo = o.echo && typeof o.echo === 'object' ? Object.values(o.echo).reduce((x, y) => x + y, 0) : o.echo || 0; if (o.echoSeen) S.flags.echoIntro = S.flags.petEchoIntro = 1; if (o.own) S.petEcho = o.own;
  for (let i = 0; i < (o.items || 0); i++) H.rollItem(S, rnd, i % 3 === 0 ? 'boss' : i % 3 === 1 ? 'elite' : 'win');
  if (o.wear) { let k = 0; for (const p of S.pets.slice(0, 3)) for (let s = 0; s < 2 && k < o.wear; s++) if (S.items[k]) p.gear[s] = S.items[k++].id; }
  Object.assign(S, o.extra || {}); if (o.keep) S.settings.keep = 1;
  if (o.triple) { const it = S.items.find((x) => x.rar === 'c' && !H.itemOwner(S, x.id)) || S.items[S.items.length - 1]; for (let i = 0; i < 3; i++) S.items.push(Object.assign({}, it, { id: 'x' + i })); }
  if (o.legs) for (const k of o.legs) S.items.push({ id: S.nextItem++, rar: 'l', leg: k, type: H.LEGENDS[k].type });
  if (o.claim) H.RECORDS.forEach((r) => { if (H.recordState(S, r) === 'ready') S.records[r.id] = 1; });
  H.UI.S = S; H.UI.go(o.go || 'home', o.params || {});
};
const modalOpen = (p) => p.evaluate(() => !document.getElementById('modal').hidden);
module.exports.inject = inject;
const useMove = async (p, pick) => { const u = p.locator('.prow .key.go:not(:disabled)'); if (!(await u.count())) return false; if (pick != null) { const ic = p.locator('.mvi:not(.cool)'); const c = await ic.count(); if (c) await ic.nth(Math.min(c - 1, pick)).click({ timeout: 1500 }).catch(() => {}); } await p.locator('.prow .key.go').click({ timeout: 1500 }).catch(() => {}); return true; };
const fight = async (p, sleep, max, onFirst) => { for (let i = 0, k = 0; i < (max || 80) && !(await modalOpen(p)); i++) { if (await useMove(p, k % 3 === 2 ? 1 : 0)) { k++; await sleep(900); if (k === 1 && onFirst) await onFirst(); } else await sleep(350); } };
module.exports.intro = async ({ p, shot, tap, sleep }) => {
  await sleep(500); await shot('title'); await tap('Play'); await sleep(1500); await shot('intro1'); await tap('Skip'); await sleep(2600); await shot('intro2'); await tap('Open my first shell'); await sleep(250); await shot('first-shell');
  await tap('Open the shell'); await sleep(300); await shot('cracking'); await sleep(1200); await shot('starters'); await p.locator('.starter').nth(1).click(); await sleep(300); await shot('starter-picked'); await tap('I choose'); await sleep(600); await shot('first-pet'); await tap('Let\'s go'); await sleep(400); await shot('home');
  await p.locator('.mode').first().click(); await sleep(300); await shot('team');
  await p.locator('.gofoot .key.coral').click(); await sleep(2200); await shot('battle-turn');
  await p.locator('.prow .key.go:not(:disabled)').waitFor({ timeout: 8000 }); const box = await p.locator('.field canvas.full').boundingBox(); await p.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.55); await sleep(700); await shot('battle-tap-enemy'); await sleep(1500);
  await fight(p, sleep, 60);
  await shot('result'); await tap('Continue'); await sleep(300); await shot('gift-shell'); await tap('Show me'); await sleep(400); await shot('home-coach');
  await p.locator('.tab.coach').click(); await sleep(300); await shot('shells'); await tap('Open the shell'); await sleep(1300); await shot('new-pet'); await tap('Done'); await sleep(300); await shot('home-coach2');
  await p.locator('.mode').first().click(); await sleep(300); await shot('adventure2'); await p.locator('.gofoot .key.coral').click(); await sleep(2500);
  await fight(p, sleep, 80);
  await shot('result2'); await tap('Continue'); await sleep(300); await shot('gift-item'); await tap('Show me'); await sleep(400); await shot('team-coach');
  await p.locator('.lu.coach').click(); await sleep(400); await p.locator('.scroll').evaluate((e) => e.scrollTo(0, 150)); await sleep(100); await shot('pet-coach'); await p.locator('.slot.coach').click(); await sleep(300); await shot('gear-sheet'); await p.locator('#modal button.item').first().click(); await sleep(300); await shot('pet-geared'); await tap('‹ Back'); await sleep(2000); await shot('team-coach-go'); await tap('To the adventure'); await sleep(300); await shot('adventure-coach');
};
module.exports.tour = async ({ p, shot, tap, sleep }) => {
  await sleep(500);
  const wait = async () => { for (let i = 0; i < 300 && !(await modalOpen(p)); i++) await sleep(300); };
  const tab = (i) => p.locator('.tab').nth(i).click();
  await p.evaluate(inject, { level: 12, notes: 400, stage: 27, pets: ['stomp', 'pluck', 'hum', 'clang', 'howl', 'bong', 'plink'], echo: { hum: 3, thud: 6, clang: 2 }, items: 16, wear: 4, shells: 2, triple: 1 }); await sleep(400); await shot('home');
  await tab(1); await sleep(300); await shot('team');
  await p.locator('.key.swap').nth(0).click(); await sleep(250); await shot('team-pick'); await p.locator('#modal .card .cmain').nth(4).click(); await sleep(250); await shot('team-swapped');
  await tab(2); await sleep(300); await shot('pets'); await p.locator('.card .cmain').nth(1).click(); await sleep(300); await shot('pet');
  await p.locator('.evo .key').nth(1).click(); await sleep(250); await shot('evo-sheet'); await tap('Evolve ·'); await sleep(450); await shot('evolved'); await tap('Great'); await sleep(200);
  await p.locator('.scroll').evaluate((e) => e.scrollTo(0, 190)); await sleep(100); await shot('pet-mid'); await p.locator('.slot').nth(1).click(); await sleep(250); await shot('gear-sheet'); await p.locator('#modal .item').nth(1).click(); await sleep(250);
  await tap('‹ Back'); await sleep(200);
  await tab(4); await sleep(300); await shot('bag'); const mg = p.locator('.pad > .key.gold'); if (await mg.count()) { await mg.first().click(); await sleep(300); await shot('bag-merged'); await tap('Great'); }
  await p.locator('.scroll .item').nth(3).click(); await sleep(200); await shot('bag-item'); await p.locator('#modal button:has-text("Close")').click();
  await tab(3); await sleep(300); await shot('shells'); await tap('Open a shell'); await sleep(1300); await shot('shell-result'); await p.locator('.gofoot .key.go').click(); await sleep(1300); await shot('shell-result2'); await tap('Done'); await sleep(200);
  await p.evaluate(() => window.H.UI.settings()); await sleep(200); await shot('menu'); await tap('Save code'); await sleep(200); await shot('save-code');
  const code = await p.locator('textarea.code').first().inputValue(); await p.locator('textarea.code').nth(1).fill(code); await tap('Load this code'); await sleep(200); await shot('save-load'); await tap('Load it'); await sleep(400); await shot('after-load'); await tap('Continue'); await sleep(300);
  await p.evaluate(() => window.H.UI.settings()); await sleep(200); await tap('How to play'); await sleep(200); await shot('help'); await p.locator('.sheet').evaluate((e) => e.scrollTo(0, 9999)); await sleep(100); await shot('help2'); await tap('Got it'); await sleep(100);
  await p.locator('.mode.gigs').click(); await sleep(300); await shot('gigs'); await p.locator('.flyer.reh').click(); await sleep(300); await shot('rehearsal'); await p.locator('.scroll .item').first().click(); await sleep(3200); await shot('rehearsal-battle');
  await p.evaluate(() => { window.__hsSpeed = 30; const b = [...document.querySelectorAll('.phead .key')]; b[0].click(); }); await wait(); await shot('rehearsal-result'); await p.evaluate(() => { window.__hsSpeed = 0; });
  await p.locator('#modal .key').last().click(); await sleep(300);
  await p.evaluate(() => window.H.UI.go('records')); await sleep(300); await shot('records');
  await p.evaluate(inject, { level: 12, stage: 27, pets: ['stomp', 'pluck', 'hum'], go: 'battle', params: { n: 27 } }); await sleep(2600); await shot('battle');
  await p.locator('.mvi').nth(1).click(); await sleep(250); await shot('battle-skill');
  const box = await p.locator('.field canvas.full').boundingBox(); await p.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.8); await sleep(560); await shot('battle-hit');
};
module.exports.late = async ({ p, shot, tap, sleep }) => {
  await sleep(500);
  const wait = async () => { for (let i = 0; i < 300 && !(await modalOpen(p)); i++) await sleep(300); };
  const tab = (i) => p.locator('.tab').nth(i).click();
  // keep going: countdown on the result, a stop before the boss
  await p.evaluate(inject, { level: 16, stage: 28, pets: ['cadence', 'shred', 'carol'], auto: 1, keep: 1, speed: 2, claim: 1, go: 'adventure' }); await sleep(400); await shot('team-keep');
  await p.locator('.gofoot .key.blue').click(); await wait(); await sleep(150); await shot('keep-countdown'); await sleep(3400); await wait(); await sleep(150); await shot('keep-boss-stop'); await tap('To the boss'); await sleep(300); await shot('team-boss');
  // late game: gold records ready, stage sets, rival bands
  await p.evaluate(inject, { level: 60, notes: 900, stage: 124, pets: ['cadence', 'shred', 'carol', 'gamelan', 'requiem', 'anthem', 'aria', 'cadenza', 'samba', 'caprice', 'tamtam', 'glock', 'duel', 'concerto', 'zephyr', 'tattoo', 'bombard'], ranks: { cadence: 4 }, echo: { thud: 5 }, items: 30, wear: 6, extra: { stats: { solo: 1, reh: 12, perfect: 6 }, reh: { 10: 1, 20: 1 } } }); await sleep(400); await shot('home-late');
  await p.locator('.mode.rec').click(); await sleep(300); await shot('records-ready'); await p.locator('.rec:has-text("World Tour") .key').first().click(); await sleep(300); await shot('record-claimed'); await tap('Great'); await sleep(200);
  await p.locator('.set').nth(1).click(); await sleep(300); await shot('set-picked'); await p.locator('.scroll').evaluate((e) => e.scrollTo(0, 9999)); await sleep(100); await shot('records-bottom'); await tap('‹ Back'); await sleep(300); await shot('home-set');
  await p.locator('.mode.gigs').click(); await sleep(200); await p.locator('.flyer.reh').click(); await sleep(300); await shot('rehearsal-late'); await tap('‹ Back'); await sleep(200);
  await tab(2); await sleep(300); await shot('pets-full'); await p.locator('.card .cmain').nth(0).click(); await sleep(300); await shot('pet-max'); await tap('‹ Back'); await sleep(200);
  await tab(4); await sleep(300); await shot('bag-late');
  let rn = 0; for (const n of [123, 122, 121, 119, 118, 117, 116, 115, 114]) if (await p.evaluate((k) => window.H.stage(k).enemies.some((e) => e.pet), n)) { rn = n; break; }
  if (rn) { await p.evaluate((n) => window.H.UI.go('adventure', { n }), rn); await sleep(300); await shot('team-rivals'); await p.locator('.gofoot .key.coral').click(); await sleep(2800); await shot('battle-rivals'); const bx = await p.locator('.field canvas.full').boundingBox(); await p.mouse.click(bx.x + bx.width * 0.85, bx.y + bx.height * 0.3); await sleep(900); await shot('battle-rivals2'); } else console.log('no rival floor found');
  for (const [n, lv] of [[10, 4], [30, 14], [60, 28], [90, 42]]) { await p.evaluate(inject, { level: lv, stage: n, pets: ['cadence', 'shred', 'carol'], go: 'battle', params: { n }, items: 6, wear: 6 }); await sleep(3200); await shot('boss' + n); }
  await p.evaluate(inject, { level: 50, stage: 101, pets: ['cadence', 'shred', 'carol'], go: 'story', params: { region: 'hall', n: 100, shells: 1 }, shells: 1 }); await sleep(600); await shot('story100');
  for (const d of ['buzz', 'clatter', 'drip', 'rustle', 'creak', 'tick']) { const n = await p.evaluate((id) => { for (let k = 11; k < 100; k++) if (k % 10 && window.H.stage(k).enemies.some((e) => e.id === id)) return k; return 0; }, d); if (!n) { console.log('never met:', d); continue; } await p.evaluate(inject, { level: Math.ceil(n / 2), stage: n, pets: ['cadence', 'shred', 'carol'], go: 'battle', params: { n } }); await sleep(2600); await shot('din-' + d); }
  await p.evaluate(() => { window.H.UI.result({ win: false, n: 14, xp: 12, notes: 0 }); }); await sleep(200); await shot('lose');
};
// The whole story through the real interface with auto battle on.
module.exports.full = async ({ p, shot, tap, sleep }) => {
  const st = () => p.evaluate(() => { const H = window.H, S = H.UI.S; return { scr: H.UI.cur.name, modal: !document.getElementById('modal').hidden, lvl: S.level, notes: S.notes, stage: S.stage, team: H.teamPets(S).filter(Boolean).map((x) => x.form), pets: S.pets.length, shells: S.shells, items: S.items.length, price: H.shellPrice(S) }; });
  const until = +(process.env.UNTIL || 41); let guard = 0, losses = 0, battles = 0, lastStage = 0, stuck = 0, rehFail = 0, rehWins = 0, merges = 0;
  await sleep(500); await p.evaluate(() => { window.__hsSpeed = 30; }); await tap('Play'); await tap('Skip'); await sleep(300); await tap('Open my first shell');
  const clickIf = async (sel) => { const b = p.locator(sel); if (await b.count()) { await b.first().click(); return true; } return false; };
  while (guard++ < 5000) {
    const s = await st(); if (s.stage >= until && s.scr === 'adventure' && !s.modal) break; if (guard % 150 === 0) console.log('..', guard, JSON.stringify(s), 'battles', battles, 'losses', losses);
    if (s.modal) {
      const text = await p.locator('#modal').innerText();
      if (/Not this time/.test(text)) { if (/Try as often/.test(text)) rehFail++; else { losses++; stuck++; } }
      if (/Rehearsal done/.test(text)) rehWins++;
      if (/cleared|beaten/.test(text)) { battles++; if (s.stage !== lastStage) { stuck = 0; rehFail = 0; lastStage = s.stage; if ([2, 5, 11, 21, 31, 41].includes(s.stage)) console.log(`stage ${s.stage}: level ${s.lvl} notes ${s.notes} pets ${s.pets} items ${s.items} team ${s.team.join(',')} losses ${losses}`); } }
      let done = false;
      if (/Try as often/.test(text) && rehFail >= 2) { await p.locator('#modal button:has-text("Rehearsals")').click(); await sleep(90); continue; }
      for (const t of ['Continue', 'Show me', 'Open ', 'Evolve ', 'Strengthen ', 'Great', 'Claim', 'Next floor', 'To the boss', 'More rehearsals', Math.random() < 0.6 ? 'Play again' : 'Back', stuck >= 2 ? 'Change the team' : 'Try again', 'Change the team', 'Close', 'Back']) { const b = p.locator(`#modal button:has-text("${t}"):not(:disabled)`); if (await b.count()) { await b.first().click(); done = true; break; } }
      if (!done) await p.locator('#modal .key').last().click(); await sleep(90); continue;
    }
    if (s.scr === 'shells' && (await p.locator('.starter').count())) { await p.locator('.starter').nth(Math.floor(Math.random() * 3)).click(); await sleep(60); await tap('I choose'); await sleep(100); continue; }
    if (s.scr === 'shells') { if (await clickIf('.gofoot .key.go:not(:disabled)')) { await sleep(140); continue; } if (await clickIf('.gofoot .key.gold:not(:disabled)')) { await sleep(120); continue; } await p.locator('.tab').nth(0).click(); await sleep(100); continue; }
    if (s.scr === 'rehearsal') { const it = p.locator('.scroll .item.r-l'); if (rehFail < 2 && (await it.count())) { await it.last().click(); await sleep(150); continue; } await tap('‹ Back'); await sleep(100); continue; }
    if (s.scr === 'bossreward') { await clickIf('.key.gold') || await clickIf('.key.go') || await clickIf('.key.soft'); await sleep(100); continue; }
    if (s.scr === 'records') { if ((await clickIf('.rec .key')) || (await clickIf('.recm.ready'))) { await sleep(100); continue; } await tap('‹ Back'); await sleep(100); continue; }
    if (s.scr === 'pets') { const d = p.locator('.card:has(.dot) .cmain'); if (await d.count()) { await d.first().click(); await sleep(100); continue; } await p.locator('.tab').nth(0).click(); await sleep(100); continue; }
    if (s.scr === 'battle') { await p.evaluate(() => { const S = window.H.UI.S; if (!S.settings.auto) document.querySelector('.phead .key').click(); }); await sleep(200); continue; }
    if (s.scr === 'pet') { const kids = p.locator('.evo .key.gold'); const n = await kids.count(); if (n) { await kids.nth(Math.floor(Math.random() * n)).click(); await sleep(100); continue; } if (await clickIf('.pad > .key.gold:not(:disabled)')) { await sleep(80); continue; } const sl = p.locator('.slot:not(.full)'); if (await sl.count() && Math.random() < 0.8) { await sl.first().click(); await sleep(80); if (!(await clickIf('#modal button.item'))) await tap('Close'); await sleep(80); continue; } await tap('‹ Back'); continue; }
    if (s.scr === 'story') { await tap('Onwards'); await sleep(100); continue; }
    if (s.scr === 'home') { if (rehFail < 2 && (await p.locator('.mode.gigs .pip').count()) && (await p.evaluate(() => window.H.rehearsals(window.H.UI.S).some((n) => !window.H.UI.S.reh[n])))) { await p.locator('.mode.gigs').click(); await p.waitForTimeout(150); await p.locator('.flyer.reh').click(); await sleep(100); continue; } if (await p.locator('.recbtn .pip').count()) { await p.locator('.mode.rec').click(); await sleep(100); continue; } await p.locator('.mode').first().click(); await sleep(100); continue; }
    if (s.scr === 'bag') { if (await clickIf('.pad > .key.gold')) { merges++; await sleep(100); continue; } await p.locator('.tab').nth(0).click(); await sleep(100); continue; }
    if (s.scr === 'team') { if (Math.random() < 0.3) { await p.locator('.key.swap').first().click().catch(() => {}); await sleep(100); const c = p.locator('#modal .card .cmain'); const k = await c.count(); if (k) await c.nth(Math.floor(Math.random() * k)).click(); await sleep(100); } await p.locator('.gofoot .key.go').click(); await sleep(100); continue; }
    if (s.scr === 'adventure') {
      if (s.shells > 0 || s.notes >= s.price) { await p.locator('.tab').nth(3).click(); await sleep(100); continue; }
      if (await p.locator('.tab:nth-child(5) .pip').count()) { await p.locator('.tab').nth(4).click(); await sleep(100); continue; }
      if (await p.locator('.tab:nth-child(3) .pip').count()) { await p.locator('.tab').nth(2).click(); await sleep(100); continue; }
      if (rehFail < 2 && s.stage > 10 && (await p.evaluate(() => { const H = window.H, S = H.UI.S; return H.rehearsals(S).some((n) => !S.reh[n]) || H.recordsReady(S) > 0; }))) { await p.locator('.tab').nth(0).click(); await sleep(100); continue; }
      if (stuck >= 2 && s.stage > 2) { await p.locator('.foebar .key').first().click(); await sleep(50); stuck = 0; }
      else { const nx = p.locator('.foebar .key:not(:disabled)').last(); if ((await nx.count()) && (await nx.innerText()).includes('›')) { await nx.click(); await sleep(60); continue; } }
      if (Math.random() < 0.2) { const id = await p.evaluate(() => { const H = window.H, S = H.UI.S, q = H.teamPets(S).find((x) => x && x.gear.includes(null)); return q && H.spareItems(S).length ? q.id : 0; }); if (id) { await p.evaluate((i) => window.H.UI.go('pet', { id: i, back: 'adventure' }), id); await sleep(100); continue; } }
      if (Math.random() < 0.08) { await p.locator('.tstrip').click(); await sleep(100); continue; }
      await p.locator('.gofoot .key.blue').click(); await sleep(150); continue;
    }
    await sleep(100);
  }
  console.log('END', JSON.stringify(await st()), 'battles', battles, 'losses', losses, 'rehearsals', rehWins, 'merges', merges); await shot('end-team');
};
module.exports.ending = async ({ p, shot, tap, sleep }) => {
  await sleep(500); await p.evaluate(() => { window.__hsSpeed = 30; });
  await p.evaluate(inject, { level: 26, notes: 900, stage: 40, pets: ['cadence', 'shred', 'carol', 'clang', 'howl', 'blare', 'yelp'], auto: 1, go: 'battle', params: { n: 40 }, items: 8, wear: 6 });
  for (let i = 0; i < 300 && !(await modalOpen(p)); i++) await sleep(200);
  await shot('boss40'); const t = await p.locator('#modal').innerText(); console.log(t.replace(/\n+/g, ' | '));
  await p.reload(); await sleep(900); await shot('reload'); await tap('Continue'); await sleep(300); await shot('resumed');
};

// Ensembles, wild echoes and the reworked screens.
module.exports.ens = async ({ p, shot, tap, sleep }) => {
  await sleep(500);
  const wait = async () => { for (let i = 0; i < 300 && !(await modalOpen(p)); i++) await sleep(300); };
  const tab = (i) => p.locator('.tab').nth(i).click();
  await p.evaluate(inject, { level: 12, notes: 400, stage: 27, pets: ['stomp', 'pluck', 'hum', 'clang', 'howl', 'bong', 'tock', 'clack'], echo: { hum: 2 }, items: 6, wear: 4, extra: { wild: 2 }, go: 'home' }); await sleep(400); await shot('home');
  await p.locator('.mode').first().click(); await sleep(300); await shot('adventure');
  await p.locator('.tstrip').click(); await sleep(300); await shot('team-folk');
  await p.locator('.playk').first().click(); await sleep(500);
  await p.locator('.key.swap').nth(2).click(); await sleep(250); await shot('pick'); await p.locator('#modal .card .cmain').nth(5).click(); await sleep(300); await shot('team-none');
  await p.locator('.key.swap').nth(1).click(); await sleep(250); await p.locator('#modal .card .cmain').nth(6).click(); await sleep(400); await shot('team-drumline');
  await tap('All ensembles'); await sleep(300); await shot('ensembles'); await p.locator('.scroll').evaluate((e) => e.scrollTo(0, 420)); await sleep(100); await shot('ensembles2'); await p.locator('.scroll').evaluate((e) => e.scrollTo(0, 9999)); await sleep(100); await shot('ensembles3');
  await p.locator('.seg button').first().click(); await sleep(300); await shot('pets'); await p.locator('.card .cmain').nth(3).click(); await sleep(300); await shot('pet-wild'); await tap('‹ Back'); await sleep(200);
  await tab(0); await sleep(300); await p.locator('.mode').first().click(); await sleep(300); await shot('adventure-drumline');
  await p.locator('.gofoot .key.coral').click(); await sleep(1500); await shot('opening'); await sleep(4200); await shot('battle-after-opening');
  await p.evaluate(() => { window.__hsSpeed = 30; });
  await p.evaluate(inject, { level: 30, stage: 27, pets: ['cadence', 'shred', 'carol'], auto: 1, speed: 2, items: 6, wear: 6, go: 'battle', params: { n: 10, reh: 1 } }); await wait(); await sleep(150); await shot('rehearsal-won');
  await p.evaluate(inject, { level: 90, stage: 100, pets: ['cadence', 'shred', 'carol'], ranks: { cadence: 6, shred: 6, carol: 6 }, auto: 1, speed: 2, items: 6, wear: 6, go: 'battle', params: { n: 100 } }); await wait(); await sleep(150); await shot('floor100');
  await p.evaluate(() => { window.__hsSpeed = 0; window.H.UI.go('pets', { tab: 'ens' }); }); await sleep(300); await shot('ensembles-after');
  await p.evaluate(() => window.H.UI.help()); await sleep(200); await p.locator('.sheet').evaluate((e) => e.scrollTo(0, 9999)); await sleep(100); await shot('help');
};
// records by game mode, rehearsal at the player's level, enemy sheets, icon states
module.exports.v15 = async ({ p, shot, tap, sleep }) => {
  await sleep(500);
  const wait = async () => { for (let i = 0; i < 300 && !(await modalOpen(p)); i++) await sleep(300); };
  await p.evaluate(inject, { level: 31, notes: 400, stage: 57, pets: ['cadence', 'shred', 'carol', 'clang', 'howl', 'bong', 'tock', 'clack'], echo: { hum: 2 }, items: 6, wear: 4, extra: { wild: 2, reh: { 10: 1 }, stats: { reh: 1 }, ens: { folk: { n: 4, reh: 1 }, rock: { n: 2, reh: 1 }, choir: { n: 1 } }, records: { ens_rock: 1 } }, go: 'home' }); await sleep(400); await shot('home');
  await p.locator('.mode').first().click(); await sleep(300); await shot('adventure');
  await p.locator('.foerow').first().click(); await sleep(300); await shot('foe-sheet'); await tap('Close');
  await p.locator('.foebar .key').nth(1).click().catch(() => {}); await p.evaluate(() => window.H.UI.go('adventure', { n: 60 })); await sleep(300); await shot('adventure-boss'); await p.locator('.foerow').first().click(); await sleep(300); await shot('boss-sheet'); await tap('Close');
  await p.locator('.tstrip').click(); await sleep(300); await shot('team');
  await p.locator('.key.swap').nth(2).click(); await sleep(250); await shot('pick'); await p.locator('#modal .card .cmain').nth(1).click(); await sleep(300); await shot('team-none');
  await tap('All ensembles'); await sleep(300); await shot('ensembles'); await p.locator('.scroll').evaluate((e) => e.scrollTo(0, 9999)); await sleep(100); await shot('ensembles-end');
  await p.locator('.seg button').first().click(); await sleep(300); await shot('pets');
  await p.locator('.tab').nth(3).click(); await sleep(300); await shot('shells'); await p.locator('.tab').nth(4).click(); await sleep(300); await shot('bag');
  await p.evaluate(() => window.H.UI.go('rehearsal')); await sleep(300); await shot('rehearsal');
  await p.evaluate(() => window.H.UI.go('records')); await sleep(300); await shot('records'); await p.locator('.scroll').evaluate((e) => e.scrollTo(0, 520)); await sleep(100); await shot('records2');
  await p.locator('.recm.ready').first().click(); await sleep(300); await shot('record-claim'); await tap('Great'); await sleep(200); await shot('records3'); await p.locator('.scroll').evaluate((e) => e.scrollTo(0, 9999)); await sleep(100); await shot('records4');
  // win a rehearsal with an over-levelled team to see the result
  await p.evaluate(() => { const H = window.H, S = H.UI.S; S.team = S.pets.slice(0, 3).map((x) => x.id); S.pets.slice(0, 3).forEach((x) => (x.rank = 10)); window.__hsSpeed = 30; S.settings.auto = 1; H.UI.go('battle', { n: 20, reh: 1 }); }); await wait(); await sleep(200); await shot('rehearsal-result');
};

// one echo currency, boss reward screen, drop chances, legendaries, band wording
module.exports.v16 = async ({ p, shot, tap, sleep }) => {
  await sleep(500);
  const wait = async () => { for (let i = 0; i < 300 && !(await modalOpen(p)); i++) await sleep(300); };
  await p.evaluate(inject, { level: 9, notes: 120, stage: 10, pets: ['stomp', 'pluck', 'hum'], ranks: {}, go: 'adventure' }); await sleep(400); await shot('adventure-boss');
  await p.evaluate(() => { window.__hsSpeed = 30; const S = window.H.UI.S; S.pets.forEach((x) => (x.rank = 10)); S.level = 30; S.settings.auto = 1; window.H.UI.go('battle', { n: 10 }); }); await wait(); await sleep(200); await shot('boss-result');
  await p.evaluate(() => { window.__hsSpeed = 0; }); await tap('Continue'); await sleep(400); await shot('story'); await tap('Onwards'); await sleep(200); if (await p.locator('.storyscr:not(.skip)').count() === 0 && await p.locator('button:has-text("Onwards")').count()) await tap('Onwards'); await sleep(500); await shot('boss-reward');
  await tap('Open the shell'); await sleep(300); await shot('shells');
  await p.evaluate(inject, { level: 14, notes: 300, stage: 23, pets: ['stomp', 'pluck', 'hum', 'clang'], echo: 4, own: { thud: 2 }, echoSeen: 1, items: 8, wear: 3, legs: ['grand', 'phoenix'], go: 'home' }); await sleep(400); await shot('home');
  await p.locator('.mode').first().click(); await sleep(300); await shot('adventure');
  await p.evaluate(() => window.H.UI.go('adventure', { n: 12 })); await sleep(300); await shot('adventure-replay');
  await p.evaluate(() => window.H.UI.go('team', {})); await sleep(300); await shot('band');
  await p.evaluate(() => window.H.UI.go('pets', {})); await sleep(300); await shot('pets'); await p.locator('.seg button').nth(1).click(); await sleep(200); await shot('ensembles');
  await p.evaluate(() => window.H.UI.go('pet', { id: 1 })); await sleep(300); await shot('pet'); await p.locator('.scroll').evaluate((e) => e.scrollTo(0, 260)); await sleep(100); await shot('pet2');
  await p.locator('.slot').first().click(); await sleep(300); await shot('gear-sheet'); await tap('Close');
  await p.evaluate(() => window.H.UI.go('bag', {})); await sleep(300); await shot('bag');
  await p.evaluate(() => window.H.UI.go('rehearsal', {})); await sleep(300); await shot('rehearsal');
  await p.evaluate(() => window.H.UI.go('records', {})); await sleep(300); await shot('records');
  await p.evaluate(() => window.H.UI.help()); await sleep(300); await shot('help'); await p.locator('.sheet').evaluate((e) => e.scrollTo(0, 900)); await sleep(100); await shot('help2'); await p.locator('.sheet').evaluate((e) => e.scrollTo(0, 9999)); await sleep(100); await shot('help3');
  // a shell with a pet you already have, the first echo
  await p.evaluate(inject, { level: 5, stage: 8, pets: ['thud', 'twang', 'hum'], shells: 3, go: 'shells' }); await sleep(300); await p.evaluate(() => { const H = window.H; H.SPECIES_ORDER.filter((x) => !['thud', 'twang', 'hum'].includes(x)).forEach((sp) => H.addPet(H.UI.S, sp)); H.UI.go('shells', {}); }); await sleep(300); await tap('Open'); await sleep(1300); await shot('dup-echo');
};
