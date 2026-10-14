// Screens for the balance update: new effects in battle, a boss mechanic, the Trickster role, own-echo pips, the Epic merge, a clean reward screen.
// FAST=1 MORE=./balance-play.js node test/play.js newmech
const S = require('./scenarios.js');
S.newmech = async ({ p, shot, tap, sleep, evalS }) => {
  // a band of Tricksters against Foghorn, on auto
  await evalS(S.inject, { pets: ['dixie', 'jukebox', 'rumba', 'march', 'ballad'], level: 45, stage: 81, auto: true, go: 'battle', params: { n: 80 } });
  for (let i = 0; i < 6; i++) { await sleep(1300); await shot('battle-' + i); }
  // the boss's own mechanic, as the sheet shows it
  await evalS(() => { const H = window.H; H.UI.closeModal && H.UI.closeModal(); H.UI.go('home'); H.UI.foeSheet({ id: 'foghorn', lvl: 36 }, H.teamPets(H.UI.S)); }); await sleep(400); await shot('foghorn-sheet');
  await evalS(() => { const H = window.H; H.UI.closeModal(); H.UI.foeSheet({ id: 'rumble', lvl: 27 }, H.teamPets(H.UI.S)); }); await sleep(300); await shot('rumble-sheet');
  // a Trickster's page
  await evalS(() => { const H = window.H; H.UI.closeModal(); const pet = H.UI.S.pets.find((x) => x.form === 'jukebox'); H.UI.go('pet', { id: pet.id, back: 'pets' }); }); await sleep(400); await shot('jukebox'); await p.mouse.wheel(0, 900); await sleep(300); await shot('jukebox-moves');
  // own echoes light the "!" on that pet only
  await evalS(() => { const H = window.H, S = H.UI.S; S.echo = 20; S.pets.push(Object.assign({}, S.pets[0], { id: 99, form: 'rattle', t1: true, t2: false, gear: [null, null] })); S.petEcho = { clack: 6 }; H.UI.go('pets'); }); await sleep(400); await shot('pets-pips');
  // three Epics merge into a Legendary
  await evalS(() => { const H = window.H, S = H.UI.S; for (let i = 0; i < 3; i++) S.items.push({ id: S.nextItem++, rar: 'e', type: 'fork' }); H.UI.go('bag'); }); await sleep(400); await shot('bag-merge');
  await p.locator('button:has-text("Legendary")').first().click({ timeout: 3000 }).catch(() => {}); await sleep(500); await shot('merged');
  // a floor won: no prompt to evolve on the reward screen
  await evalS(() => { const H = window.H; H.UI.closeModal(); H.UI.go('home'); H.UI.result({ win: true, n: 81, first: true, xp: 120, notes: 14, boss: false }); }); await sleep(500); await shot('reward');
};
S.newfight = async ({ sleep, shot, evalS }) => {
  await evalS(S.inject, { pets: ['dixie', 'rumba', 'pirate'], level: 40, stage: 81, auto: true, speed: 2, go: 'battle', params: { n: 76 } });
  for (let i = 0; i < 10; i++) { await sleep(2600); await shot('fight-' + i); }
};
