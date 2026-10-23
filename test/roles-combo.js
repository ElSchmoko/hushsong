// How a form's win value changes with what its partners are: e.g. a Tank next to another Tank, a Healer with no other Healer.
// node test/roles-combo.js <tier> [TAG]
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const fs = require('fs'), path = require('path'), H = globalThis.H, tier = +process.argv[2], TAG = process.argv[3] || '', OUT = path.join(__dirname, 'out');
const run = {}; for (const f of fs.readdirSync(OUT)) if (f.startsWith(`roles-run${TAG}${tier}-`)) Object.assign(run, JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')));
const forms = Object.keys(H.FORMS).filter((k) => H.FORMS[k].tier === tier), KINDS = ['trio', 'boss', 'rivals', 'loud'], M = run[forms[0]].rand.wins.length;
const rnd = H.rng(1000 + tier), cs = [];
for (let i = 0; i < M; i++) {
  const kind = KINDS[i % 4]; rnd(); if (kind !== 'boss') [0, 1, 2].forEach(() => rnd()); rnd();
  const cand = []; while (cand.length < 6) cand.push(forms[Math.floor(rnd() * forms.length)]); rnd(); cs.push({ kind, cand });
}
const partners = (c, f) => { const sp = H.FORMS[f].sp, got = []; for (const g of c.cand) if (H.FORMS[g].sp !== sp && !got.some((x) => H.FORMS[x].sp === H.FORMS[g].sp)) { got.push(g); if (got.length === 2) break; } return got; };
const W = {}; for (const f of forms) W[f] = run[f].rand.wins; const ctxW = cs.map((_, c) => forms.reduce((a, f) => a + +W[f][c], 0) / forms.length);
const role = (f) => H.kitOf(f).role, NAME = { rhythm: 'Tank', lead: 'Attacker', harmony: 'Healer', bass: 'Trickster', stray: 'Young' };
const acc = {};
for (const f of forms) cs.forEach((c, i) => {
  const ps = partners(c, f).map(role), r = role(f), d = +W[f][i] - ctxW[i];
  for (const other of ['rhythm', 'harmony', 'lead', 'bass']) { const k = `${r}|${other}|${ps.filter((x) => x === other).length}`; (acc[k] = acc[k] || []).push(d); }
});
const out = {}; for (const [k, a] of Object.entries(acc)) { if (a.length < 400) continue; const m = a.reduce((x, y) => x + y, 0) / a.length; out[k] = { v: +(100 * m).toFixed(1), n: a.length }; }
fs.writeFileSync(path.join(OUT, `roles-combo${TAG}${tier}.json`), JSON.stringify(out));
for (const r of ['rhythm', 'lead', 'harmony', 'bass']) console.log(NAME[r].padEnd(9), ['rhythm', 'harmony', 'lead', 'bass'].map((o) => NAME[o] + ' ' + [0, 1, 2].map((n) => (out[`${r}|${o}|${n}`] ? out[`${r}|${o}|${n}`].v : '·')).join('/')).join('   '));
