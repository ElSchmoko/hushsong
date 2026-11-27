// Headless playthrough of the Roads preview: node test/roads.js [runs]
// An ordinary player on auto follows the quests, grinds patrols when a fight is too hard, and reports how it went.
const store = {}; globalThis.localStorage = { getItem: (k) => store[k] || null, setItem: (k, v) => (store[k] = v), removeItem: (k) => delete store[k] };
for (const f of ['i18n', 'data', 'engine', 'game', 'roads-data', 'roads-world', 'roads']) require('../src/' + f + '.js');
const H = globalThis.H, R = H.ROADS, Rd = H.Roads, W = H.RW;

function play(seed, starter) {
  const rnd = H.rng(seed); Rd.wipe(); Rd.load(); const S = Rd.S;
  Rd.chooseStarter(starter);
  let battles = 0, losses = 0; const log = [];
  const fight = () => {
    const b = Rd.startBattle(rnd); let g = 0;
    while (!b.over && g++ < 4000) { const r = b.next(true); if (r && r.wait != null) b.autoAct(); }
    const out = Rd.finishBattle(b.over === 'win', b, rnd); battles++; if (!out.win) losses++; return out;
  };
  const tidy = () => {
    S.pets.sort((a, b) => b.lvl - a.lvl); S.band = [0, 1, 2].map((i) => (S.pets[i] ? S.pets[i].id : null));
    const items = S.items.slice().sort((a, b) => H.RARITY_ORDER.indexOf(b.rar) - H.RARITY_ORDER.indexOf(a.rar)); for (const p of S.pets) p.gear = [null, null];
    let k = 0; for (let slot = 0; slot < 2; slot++) for (const id of S.band) { const p = Rd.pet(id); if (p && items[k]) p.gear[slot] = items[k++].id; }
    for (const p of S.pets) for (const f of H.childrenOf(p.form)) if (Rd.evolve(p, f)) break;
    while (Rd.points() > 0) { const opts = []; for (const tr of R.TREES) for (const t of tr.talents) if (Rd.canTalent(tr, t)) opts.push([tr, t]); if (!opts.length) break; Rd.takeTalent(...opts[0]); }
    for (const P of R.PLACES) if (S.caps[P.id]) for (const b of R.BUILD_ORDER) if (S.notes >= Rd.buildCost(b) + 50) Rd.build(P.id, b);
    for (const it of S.items) if (it.rar === 'c' && S.notes > 200) Rd.upgrade(it, rnd);
    while (S.shells) Rd.openShell(rnd);
  };
  // fight patrols near unlocked land until the band is strong enough
  const grind = (n) => { for (let i = 0; i < n; i++) { const live = Rd.liveGroups().filter((g) => !g.guard && !g.tut && Rd.allowed(g.home)).sort((a, b) => a.lv - b.lv); if (!live.length) { Rd.rest(S.lastVenue); continue; } Rd.fightGroup(live[Math.min(live.length - 1, Math.floor(rnd() * 3))]); fight(); tidy(); } Rd.rest(S.lastVenue); };
  const tryHard = (setup, label) => { for (let tries = 0; tries < 30; tries++) { setup(); const out = fight(); tidy(); if (out.win) return out; grind(4); } throw new Error('stuck at ' + label); };
  const mark = (what) => log.push(`${what}: battles ${battles}, lost ${losses}, player Lv ${S.plv}, band ${Rd.bandPets().filter(Boolean).map((p) => H.FORMS[p.form].n + ' ' + p.lvl).join(', ')}, pets ${S.pets.length}, notes ${S.notes}, echo ${S.echo}`);
  Rd.enter(Rd.BEND); mark('walk');
  tryHard(() => Rd.fightGroup(Rd.group('tut1')), 'tut1'); mark('fight');
  tryHard(() => Rd.fightGroup(Rd.group('tut2')), 'tut2'); mark('friend'); tidy();
  for (const g of Rd.GROUPS.filter((g) => g.place === 'hush' && g.guard)) tryHard(() => Rd.fightGroup(g), g.id);
  tryHard(() => Rd.fightKeeper('hush'), 'keeper hush'); mark('wake'); tidy();
  if (Rd.quest().id === 'build') { while (S.notes < Rd.buildCost('windmill')) grind(1); Rd.build('hush', 'windmill'); }
  if (Rd.quest().id === 'smith') { while (S.notes < 40) grind(1); Rd.upgrade(S.items[0], rnd); }
  mark('smith (quest ' + Rd.quest().id + ')');
  for (let i = 0; i < R.CHAPEL.rooms.length; i++) { const rm = R.CHAPEL.rooms[i]; if (rm.t === 'chest') Rd.chapelChest(i, rnd); else tryHard(() => Rd.fightRoom(i), 'chapel ' + i); }
  Rd.chapelDone(); mark('chapel'); tidy();
  for (const id of ['mill', 'frog', 'lantern', 'reed']) { for (const g of Rd.GROUPS.filter((g) => g.place === id && g.guard)) tryHard(() => Rd.fightGroup(g), g.id); tryHard(() => Rd.fightKeeper(id), 'keeper ' + id); mark('capture ' + id); grind(3); }
  tryHard(() => Rd.fightGlade(), 'glade');
  tryHard(() => Rd.fightBoss(), 'boss'); mark('boss (quest ' + (Rd.quest() && Rd.quest().id) + ')');
  return { log, battles, losses, book: R.SONGBOOK.filter((sp) => S.book[sp] === 3).length };
}
const runs = +process.argv[2] || 4;
for (let i = 0; i < runs; i++) { const st = R.STARTERS[i % 4][0]; try { const r = play(100 + i, st); console.log(`\n== ${st}: ${r.battles} battles, ${r.losses} lost, songbook ${r.book}/${R.SONGBOOK.length}`); r.log.forEach((l) => console.log('  ' + l)); } catch (e) { console.log(`\n== ${st}: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); } }
if (process.env.DBG) { Rd.wipe(); Rd.load(); Rd.chooseStarter('twang'); Rd.S.quest = 3; console.log('allowed patrols in wake', Rd.liveGroups().filter((g) => !g.guard && !g.tut && Rd.allowed(g.home)).map((g) => g.id + ' lv' + g.lv)); }
