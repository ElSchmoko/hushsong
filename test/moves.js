// A rough, static worth for every move, in "one 100% hit" units, so Skills and Specials can be compared.
// node test/moves.js            -> every second-evolution form: Skill worth, Special worth, ratio (flags Specials under 1.3x)
// node test/moves.js all        -> also lists every Skill of the first evolutions
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H;
if (!process.env.NOK && require('fs').existsSync(__dirname + '/movek.json')) { Object.assign(H.MOVE_K, JSON.parse(require('fs').readFileSync(__dirname + '/movek.json', 'utf8'))); H.applyMoveK(); }
const NT = { one: 1, rand: 1, all: 2.4, same: 1, self: 1, ally: 1, allies: 2.6, others: 1.8, strong: 1, slow: 1, big: 1, attacker: 1 };
const HPV = 5.5;   // a pet's max HP in units of its Power
const ST = { pdown: 0.22, sdown: 0.17, offkey: 0.2, poison: 0.3, stun: 1.0, mute: 0.45, muddle: 0.6, pup: 0.25, sup: 0.22, regen: 0.4, lifesong: 0.15, dodge: 0.9, taunt: 0.35, ring: 0.18, charge: 0 };
const stV = (k, dur, n, val) => { if (k === 'stun' || k === 'mute' || k === 'muddle' || k === 'dodge') return ST[k] * n * (k === 'dodge' ? val || 1 : 1); if (k === 'taunt') return ST.taunt * dur; if (k === 'poison' || k === 'regen') return (val || (k === 'poison' ? 0.3 : 0.4)) * dur * n * (k === 'regen' ? 0.7 : 1); return ST[k] * Math.min(dur, 3) * n; };
const fxV = (list) => {
  let v = 0;
  for (const fx of list) {
    const k = fx[0], n = NT[fx[1]] || 1;
    if (k === 'dmg') {
      const o = fx[3] || {}, h = o.h || 1; let ramp = 0; for (let i = 0; i < h; i++) ramp += 1 + (o.inc || 0) * i;
      let d = fx[2] * ramp * n; const b = 1 + (o.exec || 0) * 0.4 + (o.fresh || 0) * 0.3 + (o.crit || 0) * 0.5 + (o.critSure ? 0.45 : 0) + (o.perBad || 0) * 1.5 + (o.perCrit ? 0.25 : 0);
      if (o.vs) for (const s in o.vs) d *= 1 + o.vs[s] * 0.6;
      if (o.ifSelf) for (const s in o.ifSelf) d *= 1 + o.ifSelf[s] * 0.5;
      d *= b; if (o.shatter) d *= 1.1; if (o.chain) d += fx[2] * o.chain * 1.6;
      v += d; if (o.drain) v += fx[2] * ramp * n * o.drain * 0.6; if (o.push) v += o.push * n * 1.0;
      if (o.st) for (const s of o.st) v += stV(s[0], s[1], fx[1] === 'all' ? 2.4 : 1, s[3]) * (s[2] != null ? s[2] : 1);
      if (o.randSt) v += 0.2 * o.randSt * h * (fx[1] === 'all' ? 2.4 : 1);
      if (o.onKill) v += 0.35;
    } else if (k === 'heal') { const o = fx[3] || {}; v += (o.pct ? o.pct * HPV : fx[2]) * n * (n > 1 ? 0.6 : 0.85); }
    else if (k === 'shield') { const o = fx[3] || {}; v += (o.pct ? o.pct * HPV : fx[2]) * n * 0.7; }
    else if (k === 'st') v += stV(fx[2], fx[3], n, (fx[4] || {}).val);
    else if (k === 'gauge') v += Math.abs(fx[2]) * n * 1.0;
    else if (k === 'cleanse') v += 0.3 * n;
    else if (k === 'dispel') v += 0.45 * n;
    else if (k === 'steal') v += 0.9 * n;
    else if (k === 'flip') v += 0.6 * n;
    else if (k === 'extend') v += 0.25 * fx[2] * n;
    else if (k === 'revive') v += 1.2 + fx[1] * 2;
    else if (k === 'follow') v += 2 * fx[1] * (fx[2] ? 1.6 : 1);
    else if (k === 'detonate') v += 1.3;
    else if (k === 'spread') v += 1.1;
    else if (k === 'cdr') v += 0.5;
    else if (k === 'ready') v += 0.9;
    else if (k === 'echo') v += 1.4 * fx[1] / 0.7 * 0.7;
    else if (k === 'replay') v += 2.6 * fx[1];
    else if (k === 'pick') { const vals = fx[2].map(fxV).sort((a, b) => b - a); v += vals.slice(0, fx[1]).reduce((a, b) => a + b, 0) * 0.9; }
    else if (k === 'if') v += (fxV(fx[2]) + fxV(fx[3])) / 2;
    else if (k === 'random') v += fx[2].map(fxV).reduce((a, b) => a + b, 0) / fx[2].length * fx[1];
  }
  return v;
};
H.moveWorth = (ab) => fxV(ab.fx);
const rows = [];
for (const id in H.FORMS) {
  const f = H.FORMS[id]; if (f.tier !== 2) continue; const kit = H.kitOf(id), sk = fxV(kit.phrase.fx), sp = fxV(kit.finale.fx);
  rows.push({ id, role: kit.role, sk, sp, r: sp / sk, skn: kit.phrase.n, spn: kit.finale.n, cd: kit.finale.cd, skcd: kit.phrase.cd });
}
rows.sort((a, b) => a.r - b.r);
for (const r of rows) console.log(`${r.r < 1.3 ? '!!' : '  '} ${r.id.padEnd(10)} ${r.role.padEnd(8)} skill ${r.skn.padEnd(16)} ${r.sk.toFixed(2).padStart(5)} (cd ${r.skcd})   special ${r.spn.padEnd(18)} ${r.sp.toFixed(2).padStart(5)} (cd ${r.cd})   x${r.r.toFixed(2)}`);
const by = {}; for (const r of rows) (by[r.role] = by[r.role] || []).push(r.sp); for (const k in by) console.log(k, 'special avg', (by[k].reduce((a, b) => a + b, 0) / by[k].length).toFixed(2));
