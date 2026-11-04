// Battle of the Bands, headless: node test/pvp.js [battles]
// Random bands of random forms, stars and equipment fight each other through band copies, the way two players' bands meet:
// no crashes, every fight ends by turn 60, both sides' ensembles work, the same token rolls the same dice (here on Auto),
// and the match flow (open, finish, pay) adds up.
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js'); require('../src/modes.js'); require('../src/pvp.js');
const H = globalThis.H, N = +process.argv[2] || 4000, rnd = H.rng(11), forms = Object.keys(H.FORMS);
const pick = (a) => a[Math.floor(rnd() * a.length)];
// a save with one random band, locked in
const player = (tier) => {
  const S = H.newState(); S.level = 15 + Math.floor(rnd() * 200);
  for (let k = 0; k < 3; k++) {
    const list = forms.filter((f) => tier == null || H.FORMS[f].tier === tier), f = pick(list), pet = H.addPet(S, H.FORMS[f].sp); pet.form = f; pet.rank = Math.floor(rnd() * 11);
    for (let g = 0; g < 2; g++) if (rnd() < 0.8) { const it = H.rollItem(S, rnd, rnd() < 0.3 ? 'boss' : 'win'); pet.gear[g] = it.id; }
  }
  S.team = S.pets.slice(0, 3).map((p) => p.id); H.lockPvpBand(S); return S;
};
let errs = 0, time = 0, wins = 0, turns = 0, ensA = 0, ensB = 0, maxTurn = 0; const hist = {};
for (let i = 0; i < N; i++) {
  try {
    const A = player(rnd() < 0.5 ? null : 2), B = player(rnd() < 0.5 ? null : 2);
    const res = { token: 't' + i + '-' + Math.floor(rnd() * 1e9), rival: { name: 'B', level: B.level, applause: 900 + Math.floor(rnd() * 400), band: JSON.parse(JSON.stringify(H.bandCopy(B))) } };
    H.openPvpMatch(A, res);
    const b = H.startPvp(A); if (b.ensemble) ensA++; if (b.foeEnsemble) ensB++;
    H.autoRun(b);
    if (!b.over) throw new Error('no end');
    for (const u of b.units) if (!isFinite(u.hp) || !isFinite(u.gauge)) throw new Error('NaN ' + u.name);
    if (b.turn > H.PVP.finish) throw new Error('past the finish: ' + b.turn);
    // the same token plays the same fight
    if (i % 50 === 0) { A.pvp.cur = A.pvp.cur || null; const again = H.startPvp(Object.assign({}, A, { pvp: Object.assign({}, A.pvp, { cur: A.pvp.cur }) })); H.autoRun(again); if (again.over !== b.over || again.turn !== b.turn) throw new Error('not the same fight twice'); }
    const timed = b.ev.some((e) => e.t === 'end' && e.why === 'time');
    if (timed) time++; if (b.over === 'win') wins++; turns += b.turn; maxTurn = Math.max(maxTurn, b.turn);
    const k = Math.min(60, Math.floor(b.turn / 10) * 10); hist[k] = (hist[k] || 0) + 1;
    const notes = A.notes, out = H.finishPvp(A, b.over === 'win', b);
    if (A.notes - notes !== (out.win ? H.PVP.win : H.PVP.loss)) throw new Error('pay');
    if (!A.pvp.unsent || A.pvp.cur) throw new Error('state');
  } catch (e) { errs++; if (errs < 5) console.log('ERR', e.stack.split('\n').slice(0, 4).join('\n')); }
}
console.log(`pvp: ${N} matches, ${errs} errors · attacker wins ${(wins / N * 100).toFixed(1)}% · avg turns ${(turns / N).toFixed(1)}, max ${maxTurn} · ended by time ${(time / N * 100).toFixed(1)}% · ensembles ${ensA} / ${ensB}`);
console.log('turns:', Object.keys(hist).sort((a, b) => a - b).map((k) => `${k}+: ${hist[k]}`).join('  '));

// a day of five: the fifth pays a shell, the sixth is not on offer
{
  const S = player(); let shells = S.shells;
  for (let m = 0; m < 5; m++) { H.openPvpMatch(S, { token: 'd' + m, rival: { name: 'X', level: 30, applause: 1000, band: H.bandCopy(player()) } }); H.finishPvp(S, m % 2 === 0, null); }
  console.log(`day: shells +${S.shells - shells} (want 1), left ${H.pvpLeft(S)} (want 0), notes ${S.notes} (want ${3 * H.PVP.win + 2 * H.PVP.loss}), applause ${S.pvp.applause}`);
  H.refreshPvp(S, Date.now() + 86400000); console.log(`next day: left ${H.pvpLeft(S)} (want 5)`);
}
// a copy with things this version does not know is cut down, not broken
{
  const c = H.cleanCopy([{ f: 'nope', r: 3, g: [] }, { f: forms[0], r: 99, g: [{ t: 'nope', r: 'l' }, { t: Object.keys(H.ITEM_TYPES)[0], r: 'l', l: 'nope' }] }, null, 'x']);
  console.log('clean copy:', JSON.stringify(c));
}
