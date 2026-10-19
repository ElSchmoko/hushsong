// Balance for Tour. node test/tour.js [N] [profile index]  ·  TK='{"k":1.1}' overrides H.TOUR
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js'); require('../src/modes.js'); require('../src/tour.js');
const H = globalThis.H, N = +(process.argv[2] || 40), only = process.argv[3];
if (process.env.TK) Object.assign(H.TOUR, JSON.parse(process.env.TK));
const formsOf = (tier) => Object.keys(H.FORMS).filter((f) => H.FORMS[f].tier === tier);
// a band at a level: three pets of a growth tier with stars, each wearing two pieces of a rarity
const save = (L, tier, rank, rar, rnd) => {
  const S = H.newState(); S.level = L; S.stage = Math.max(1, Math.round((L - 1) / H.STAGE_SLOPE) + 1);
  const pool = formsOf(tier);
  for (let i = 0; i < 3; i++) { const f = pool[Math.floor(rnd() * pool.length)], p = H.addPet(S, H.FORMS[f].sp); p.form = f; p.rank = rank; S.team[i] = p.id; }
  for (const p of S.pets) for (let s = 0; s < 2; s++) { const it = rar === 'l' ? H.rollLegend(S, rnd) : { id: S.nextItem++, rar, type: Object.keys(H.ITEM_TYPES)[Math.floor(rnd() * Object.keys(H.ITEM_TYPES).length)] }; if (rar !== 'l') S.items.push(it); p.gear[s] = it.id; }
  return S;
};
const PROF = [[25, 1, 3, 'r', 'Lv 25, evolved once, 3 stars, rare gear'], [45, 2, 8, 'e', 'Lv 45, fully evolved, 8 stars, epic gear'], [70, 2, 10, 'l', 'Lv 70, fully evolved, 10 stars, legendary gear']];
const avgHp = (r) => H.tourAlive(r).reduce((a, id) => a + r.hp[id], 0) / r.band.length;
// the road: rest or a Benefit show when hurt, Loud gigs and Battles when healthy
const score = (r, n) => { const hp = avgHp(r), down = H.tourAlive(r).length < r.band.length, hurt = hp < 0.55 || down;
  return ({ rest: hurt ? 4 : 0.4, benefit: hurt ? 3.5 : 0.6, battle: hp > 0.75 && !down ? 1.8 : 0.1, loud: hp > 0.7 ? 1.3 : 0.2, jam: 1.5, mystery: 1.3, gig: 1, boss: 1 }[n.type] || 1) + Math.random() * 0.8; };
const play = (S, rnd, log) => {
  H.startTour(S, rnd); let steps = 0;
  while (S.tourRun && steps++ < 300) {
    const r = S.tourRun, p = r.pending;
    if (!p) { const opts = H.soloReach(r); H.tourEnter(S, opts.slice().sort((a, b) => score(r, b) - score(r, a))[0].id, rnd); continue; }
    if (p.type === 'battle') { const b = H.startTourBattle(S, rnd), win = H.autoRun(b); if (log) { log.turns += b.turn; log.fights++; log.kinds[r.map[r.at].type] = (log.kinds[r.map[r.at].type] || 0) + 1; } const out = H.finishTour(S, win, b, rnd); if (!win) return { leg: out.reached.leg, gigs: out.reached.gigs, done: false }; if (out.done) return { leg: 5, gigs: 0, done: true }; }
    else if (p.type === 'head') H.tourHead(S, p.opts[Math.floor(rnd() * p.opts.length)], rnd);
    else if (p.type === 'boon') H.tourPick(S, p.opts.slice().sort((a, b) => H.combosOf(b, r.boons).length - H.combosOf(a, r.boons).length + (rnd() - 0.5))[0]);
    else if (p.type === 'rest') H.tourRest(S, H.tourAlive(r).length < r.band.length || avgHp(r) < 0.7 ? 'nap' : 'practise');
    else if (p.type === 'event') H.tourEvent(S, avgHp(r) > 0.6 ? 0 : 1, rnd);
  }
  return { leg: S.tourRun ? S.tourRun.leg : 0, gigs: 0, done: false, stuck: true };
};
const rnd = H.rng(+(process.env.SEED || 11)), t0 = Date.now();
PROF.forEach(([L, tier, rank, rar, name], pi) => {
  if (only != null && +only !== pi) return;
  const reachLeg = [0, 0, 0, 0, 0, 0], log = { turns: 0, fights: 0, kinds: {} }; let done = 0, stuck = 0, prog = 0;
  for (let i = 0; i < N; i++) { const S = save(L, tier, rank, rar, rnd), o = play(S, rnd, log); for (let l = 0; l <= o.leg; l++) reachLeg[l]++; if (o.done) done++; if (o.stuck) stuck++; prog += H.tourProgress(o.leg, o.gigs); }
  console.log(name + ': reach leg 1..5 ' + reachLeg.slice(0, 5).map((x) => Math.round((100 * x) / N) + '%').join(' ') + ' · full tour ' + Math.round((100 * done) / N) + '% · avg ' + (prog / N).toFixed(1) + ' of 30 · ' + Math.round(log.turns / Math.max(1, log.fights)) + ' turns/fight · ' + (log.fights / N).toFixed(1) + ' fights/tour' + (stuck ? ' · STUCK ' + stuck : '') + (process.env.K ? ' ' + JSON.stringify(log.kinds) : ''));
});
console.log((Date.now() - t0) / 1000 + 's');
