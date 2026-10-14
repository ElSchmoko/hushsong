// Every screen in one language, for overflow and missing words: HSLANG=de FAST=1 MORE=./lang-play.js node test/play.js lang
// Moves through the game by calling the screens directly, so it works whatever the buttons say.
const S = require('./scenarios.js');
S.lang = async ({ p, shot, sleep, evalS, waitBattle }) => {
  const lang = process.env.HSLANG || 'en';
  const setLang = () => evalS(async (c) => { const H = window.H; const got = await H.loadLang(c); H.UI.S.settings.lang = got; return got; }, lang);
  const go = async (name, params, wait) => { await evalS(([n, pr]) => window.H.UI.go(n, pr || {}), [name, params]); await sleep(wait || 350); };
  const modal = (fn, arg) => evalS(fn, arg).then(() => sleep(300));
  const close = () => evalS(() => window.H.UI.closeModal());
  const state = (o) => evalS((o) => {
    const H = window.H, UI = H.UI, S = H.newState(); S.flags.intro = 1; S.flags.seenSolo = 1; S.level = o.level; S.stage = o.stage; S.notes = 900; S.shells = o.shells || 0; S.echo = 6;
    for (const f of o.pets) { const p = H.addPet(S, H.FORMS[f].sp); p.form = f; p.t1 = H.FORMS[f].tier >= 1; p.t2 = H.FORMS[f].tier >= 2; p.rank = 3; }
    const rnd = H.rng(7); for (let i = 0; i < 12; i++) H.rollItem(S, rnd, i % 3 === 0 ? 'boss' : 'win'); S.items.push({ id: S.nextItem++, rar: 'l', leg: Object.keys(H.LEGENDS)[3], type: H.LEGENDS[Object.keys(H.LEGENDS)[3]].type });
    let k = 0; for (const p of S.pets.slice(0, 3)) for (let s = 0; s < 2; s++) if (S.items[k]) p.gear[s] = S.items[k++].id;
    S.settings.lang = UI.S.settings.lang; UI.adopt ? UI.adopt(S) : (UI.S = S); UI.S = S;
  }, o);
  // a first run: title, the language list, the film
  await evalS(() => { const H = window.H; H.UI.S = H.newState(); }); await setLang(); await go('title', null, 500); await shot('title');
  await evalS(() => window.H.UI.langPicker()); await sleep(300); await shot('languages'); await close();
  await go('intro', null, 500); for (let i = 0; i < 4; i++) { await shot('intro' + i); await p.mouse.click(195, 400); await sleep(700); }
  await go('shells', null, 400); await shot('shells-first');
  // mid game, every mode open
  await state({ level: 34, stage: 62, shells: 3, pets: ['cadence', 'shred', 'carol', 'gamelan', 'requiem', 'aria', 'samba', 'tamtam'] });
  await go('home', null, 500); await shot('home');
  await modal(() => window.H.UI.settings()); await shot('menu'); await close();
  await modal(() => window.H.UI.help()); await shot('help'); await evalS(() => { const s = document.querySelector('#modal .scroll, #modal .mbody, #modal'); s.scrollTop = 99999; document.querySelectorAll('#modal *').forEach((e) => { if (e.scrollHeight > e.clientHeight + 4) e.scrollTop = 99999; }); }); await sleep(150); await shot('help-end'); await close();
  await go('gigs'); await shot('gigs');
  await go('adventure'); await shot('adventure');
  await evalS(() => { const r = document.querySelector('.foerow'); if (r) r.click(); }); await sleep(300); await shot('foe-sheet'); await close();
  await go('team'); await shot('team');
  await go('team', { tab: 'ens' }); await shot('team-ens');
  await go('pets'); await shot('pets');
  await go('pets', { tab: 'ens' }); await shot('pets-ens');
  await evalS(() => { const H = window.H; H.UI.go('pet', { id: H.UI.S.pets[0].id }); }); await sleep(350); await shot('pet');
  await evalS(() => { document.querySelectorAll('.scroll').forEach((e) => (e.scrollTop = 99999)); }); await sleep(150); await shot('pet-end');
  await evalS(() => { const H = window.H; const p = H.UI.S.pets.find((x) => H.FORMS[x.form].tier === 0) || H.UI.S.pets[1]; H.UI.go('pet', { id: p.id }); }); await sleep(350); await shot('pet-young');
  await go('shells'); await shot('shells');
  await go('bag'); await shot('bag');
  await evalS(() => { const b = document.querySelector('.scroll .item'); if (b) b.click(); }); await sleep(300); await shot('item-sheet'); await close();
  await go('records'); await shot('records');
  await go('rehearsal'); await shot('rehearsal');
  await go('encore'); await shot('encore');
  await go('daily', null, 500); await shot('daily');
  await go('solo', null, 400); await shot('solo-pick');
  await evalS(() => { const H = window.H, S = H.UI.S; H.startSolo(S, S.pets[0].id, H.rng(3)); S.soloRun.boons = Object.keys(H.BOONS).slice(0, 4); }); await go('solomap', null, 1200); await shot('solo-map');
  await evalS(() => { const n = document.querySelector('.snode.can'); if (n) n.click(); }); await sleep(500); await shot('solo-stop-preview'); await close();
  await evalS(() => { const H = window.H, run = H.UI.S.soloRun; run.pending = { type: 'boon', src: 'gig', opts: H.boonOffer(run, 'gig', H.rng(2)) }; run.gigs = 1; }); await go('solostop', null, 500); await shot('solo-boon');
  await evalS(() => { window.H.UI.S.soloRun.pending = { type: 'rest' }; }); await go('solostop', null, 500); await shot('solo-rest');
  await evalS(() => { window.H.UI.S.soloRun.pending = { type: 'event', ev: 'busker' }; }); await go('solostop', null, 500); await shot('solo-event');
  await evalS(() => { window.H.UI.S.soloRun.pending = null; }); await go('solo', null, 400); await shot('solo-run');
  // battle: the field, a move card, a pause
  await evalS(() => { window.H.UI.S.settings.auto = 0; }); await go('battle', { n: 61 }, 3500); await p.mouse.click(195, 400); await sleep(2500); await shot('battle');
  await evalS(() => { const b = document.querySelector('.mvi:nth-child(2)'); if (b) b.click(); }); await sleep(300); await shot('battle-move2');
  await evalS(() => { const b = document.querySelector('.mvi:nth-child(3)'); if (b) b.click(); }); await sleep(300); await shot('battle-move3');
  await evalS(() => { window.H.UI.S.settings.auto = 1; }); await waitBattle(); await sleep(300); await shot('battle-result');
  await evalS(() => window.H.UI.result({ win: false, n: 61, xp: 12, notes: 0 })); await sleep(300); await shot('lose');
  await go('story', { region: 'tower', n: 90 }, 700); await shot('story');
  await go('home', null, 300); await evalS(() => window.H.UI.saveCode && window.H.UI.saveCode()); await sleep(300); await shot('save-code'); await close();
};
