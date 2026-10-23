// Reads test/out/roles-run<tier>-*.json (and roles-ref<tier>-*.json) and works out each form's numbers:
//   win value (how much the form lifts its band's win rate, against the stage's average, on the same battles) with a margin of error,
//   output per turn (damage, healing + Shields, damage soaked), staying alive, support (buffs, debuffs, turn bar), and how much it lifts its partners.
// node test/roles-report.js [refpairs]   -> test/out/roles-report.json
//   refpairs: prints the reference partners to use for `node test/roles.js ref` (the median form of each role)
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const fs = require('fs'), path = require('path'), H = globalThis.H; if (process.env.PATCH) require(path.resolve(process.env.PATCH))(H);
const OUT = path.join(__dirname, 'out');
const load = (pre) => { const r = {}; for (const f of fs.readdirSync(OUT)) if (f.startsWith(pre)) Object.assign(r, JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'))); return r; };
const TAG = process.env.TAG || '';
const KINDS = ['trio', 'boss', 'rivals', 'loud'];
const mean = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) * (y - m), 0) / Math.max(1, a.length - 1)); };

const tierReport = (tier) => {
  const run = load(`roles-run${TAG}${tier}-`), ref = load(`roles-ref${TAG}${tier}-`), ids = Object.keys(run); if (!ids.length) return null;
  const M = run[ids[0]].rand.wins.length, W = {}; for (const f of ids) W[f] = run[f].rand.wins.split('').map(Number);
  const ctxW = Array.from({ length: M }, (_, c) => mean(ids.map((f) => W[f][c])));
  const ctxP = Array.from({ length: M }, (_, c) => mean(ids.map((f) => run[f].rand.pOut[c])));
  const kindOf = (c) => KINDS[c % KINDS.length];
  const rows = ids.map((f) => {
    const F = H.FORMS[f], r = run[f].rand, s = r.s, d = W[f].map((w, c) => w - ctxW[c]), t = Math.max(1, s.turns);
    const byKind = {}; for (const kd of KINDS) { const dk = d.filter((_, c) => kindOf(c) === kd); byKind[kd] = +(100 * mean(dk)).toFixed(1); }
    const boost = mean(r.pOut.map((p, c) => (ctxP[c] ? p / ctxP[c] - 1 : 0)));
    const refs = ref[f] ? Object.keys(ref[f]).map((k) => { const w = ref[f][k].wins.split('').map(Number); return w; }) : [];
    return {
      id: f, n: F.n, sp: F.sp, parent: F.parent || null, tier, role: H.kitOf(f).role, fam: H.SPECIES[F.sp].family,
      win: +(100 * mean(W[f])).toFixed(1), value: +(100 * mean(d)).toFixed(1), err: +((100 * 1.96 * sd(d)) / Math.sqrt(M)).toFixed(1), byKind,
      dpt: Math.round(s.dealt / t), hpt: Math.round((s.heal + s.shield) / t), heal: Math.round(s.heal / t), shield: Math.round(s.shield / t), soak: Math.round((s.taken + s.blocked) / t),
      alive: +((100 * s.alive) / M).toFixed(0), turns: +(s.turns / M).toFixed(1), kos: +(s.kos / M).toFixed(2),
      buffs: +(s.buffs / t).toFixed(2), selfBuffs: +(s.selfBuffs / t).toFixed(2), debuffs: +(s.debuffs / t).toFixed(2), tbGive: +((100 * s.tbGive) / t).toFixed(1), tbTake: +((100 * s.tbTake) / t).toFixed(1),
      boost: +(100 * boost).toFixed(1), mk: H.MOVE_K[f] || 1, refWins: refs,
    };
  });
  // the reference check: win rate next to each fixed pair, against that pair's average
  const nRef = rows[0].refWins.length;
  for (let k = 0; k < nRef; k++) { const L = rows[0].refWins[k].length, avg = Array.from({ length: L }, (_, c) => mean(rows.map((r) => (r.refWins[k] ? r.refWins[k][c] : 0)))); for (const r of rows) r['ref' + k] = r.refWins[k] ? +(100 * mean(r.refWins[k].map((w, c) => w - avg[c]))).toFixed(1) : null; }
  for (const r of rows) { if (nRef) r.refValue = +mean([...Array(nRef).keys()].map((k) => r['ref' + k])).toFixed(1); delete r.refWins; }
  return { tier, battles: M, rows };
};

const report = { made: new Date().toISOString(), tiers: [0, 1, 2].map(tierReport).filter(Boolean) };
if (process.argv[2] === 'refpairs') {
  // the median form by win value in each role: partners for the reference check
  for (const T of report.tiers) {
    const med = (role) => { const rs = T.rows.filter((r) => r.role === role).sort((a, b) => a.value - b.value); return rs.length ? rs[Math.floor(rs.length / 2)].id : null; };
    const pairs = T.tier === 0 ? [[med('stray'), T.rows.filter((r) => r.role === 'stray').sort((a, b) => a.value - b.value)[Math.floor(T.rows.length / 2) + 1].id]] : [[med('bass'), med('harmony')], [med('lead'), med('rhythm')]];
    console.log(T.tier + ' ' + pairs.map((p) => p.join(',')).join(';'));
  }
} else {
  fs.writeFileSync(path.join(OUT, `roles-report${TAG}.json`), JSON.stringify(report));
  for (const T of report.tiers) {
    console.log(`\n== stage ${T.tier}: ${T.rows.length} forms × ${T.battles} battles`);
    const top = T.rows.slice().sort((a, b) => b.value - a.value);
    console.log('best  ', top.slice(0, 5).map((r) => `${r.n}(${r.role}) ${r.value > 0 ? '+' : ''}${r.value}±${r.err}`).join(', '));
    console.log('worst ', top.slice(-5).map((r) => `${r.n}(${r.role}) ${r.value}±${r.err}`).join(', '));
  }
}
