// Balance by pet: how each form compares with every other form of its stage, in output and in winning.
//   node test/roles.js cal <tier>                       find enemy strength per fight type for ~55% wins (writes test/out/roles-k<tier>.json)
//   node test/roles.js run <tier> <shard> <shards>      play every form of the stage (a share of them) through the same battles
//   node test/roles.js ref <tier>                       the same, next to fixed reference partners
// Fair play: no gear, no stars, no ensembles, family advantage off; the same battles (enemies, dice, partners, slot) for every form.
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const fs = require('fs'), path = require('path'), H = globalThis.H;
H.advantage = () => 0;
// PATCH=file.js: a module (H) => {...} that changes forms before the run (proposed balance changes); TAG names its output files
const TAG = process.env.TAG || ''; if (process.env.PATCH) require(path.resolve(process.env.PATCH))(H);
const [mode, tierS, a3, a4] = process.argv.slice(2), tier = +tierS;
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const LV = [12, 30, 60][tier], M = +(process.env.M || 2400), TARGET = 0.55, KINDS = ['trio', 'boss', 'rivals', 'loud'];
const forms = Object.keys(H.FORMS).filter((k) => H.FORMS[k].tier === tier);

// the battles everyone plays: fight type, region, enemies, dice, candidate partners, the tested form's slot
const contexts = (n, seed) => {
  const rnd = H.rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const kind = KINDS[i % KINDS.length], region = H.REGION_ORDER[Math.floor(rnd() * 10)], R = H.REGIONS[region];
    let foes;
    if (kind === 'boss') foes = [{ id: R.boss, boss: 1 }].concat(R.adds.map((a) => ({ id: a })));
    else if (kind === 'rivals') foes = [0, 1, 2].map(() => ({ id: forms[Math.floor(rnd() * forms.length)], pet: 1 }));
    else foes = [0, 1, 2].map((j) => ({ id: R.din[Math.floor(rnd() * R.din.length)], loud: kind === 'loud' && j === 0 }));
    const cand = []; while (cand.length < 6) cand.push(forms[Math.floor(rnd() * forms.length)]);
    out.push({ kind, region, foes, seed: 1 + Math.floor(rnd() * 1e9), cand, slot: Math.floor(rnd() * 3) });
  }
  return out;
};
// the two partners for a form in a context: the first candidates of other species (and of different species from each other)
const partners = (c, f) => { const sp = H.FORMS[f].sp, got = []; for (const g of c.cand) if (H.FORMS[g].sp !== sp && !got.some((x) => H.FORMS[x].sp === H.FORMS[g].sp)) { got.push(g); if (got.length === 2) break; } return got; };
const unitFor = (f, S) => { const p = H.addPet(S, H.FORMS[f].sp); p.form = f; p.t1 = tier >= 1; p.t2 = tier === 2; return p; };
const play = (c, f, K, partnersOverride) => {
  const S = H.newState(); S.level = LV; const ps = partnersOverride || partners(c, f), band = ps.slice(); band.splice(c.slot, 0, f);
  const pets = band.map((g) => unitFor(g, S)), k = K[c.kind];
  const enemies = c.foes.map((e) => (e.pet ? H.buildRivalUnit(e.id, LV, k) : H.buildDinUnit(e.id, LV, !!e.loud, null, e.boss ? k * 0.9 : k)));
  const b = new H.Battle({ allies: pets.map((p) => H.buildPetUnit(p, LV, S)), enemies, rng: H.rng(c.seed) });
  const win = H.autoRun(b), mine = b.units.filter((u) => u.side === 0), me = mine[c.slot], others = mine.filter((u) => u !== me);
  return { win, me, others, turns: b.turn };
};

if (mode === 'cal') {
  // per fight type, bisect enemy strength until random bands win about 55%
  const K = {}, cs = contexts(1600, 9000 + tier), rnd = H.rng(77 + tier), picks = cs.map(() => forms[Math.floor(rnd() * forms.length)]);
  for (const kd of KINDS) {
    let lo = 0.1, hi = 6; const mine = cs.map((c, i) => [c, picks[i]]).filter(([c]) => c.kind === kd);
    for (let it = 0; it < 12; it++) { const k = Math.sqrt(lo * hi), KK = { [kd]: k }; let w = 0; for (const [c, f] of mine) if (play(c, f, KK).win) w++; const r = w / mine.length; if (r > TARGET) lo = k; else hi = k; console.error('cal', kd, k.toFixed(3), Math.round(r * 100) + '%'); }
    K[kd] = Math.sqrt(lo * hi);
  }
  fs.writeFileSync(path.join(OUT, `roles-k${tier}.json`), JSON.stringify(K)); console.log(JSON.stringify(K));
}

const stat0 = () => ({ dealt: 0, heal: 0, shield: 0, taken: 0, blocked: 0, turns: 0, alive: 0, kos: 0, buffs: 0, selfBuffs: 0, debuffs: 0, tbGive: 0, tbTake: 0 });
const add = (s, me) => { const t = me.stat; s.dealt += t.dealt; s.heal += t.heal; s.shield += t.shield; s.taken += t.taken; s.blocked += t.blocked; s.turns += me.turns; s.alive += me.alive ? 1 : 0; s.kos += t.kos; s.buffs += t.buffs; s.selfBuffs += t.selfBuffs; s.debuffs += t.debuffs; s.tbGive += t.tbGive; s.tbTake += t.tbTake; };
const out = (o) => o.stat.dealt + o.stat.heal + o.stat.shield;

if (mode === 'run' || mode === 'ref') {
  const K = JSON.parse(fs.readFileSync(path.join(OUT, `roles-k${tier}.json`), 'utf8'));
  const shard = +(a3 || 0), shards = +(a4 || 1);
  const cs = contexts(mode === 'ref' ? Math.round(M / 3) : M, 1000 + tier), mine = forms.filter((_, i) => i % shards === shard), res = {};
  // reference partners: given on the command line as pairs "a,b;c,d"
  const refs = mode === 'ref' ? (process.env.REFS || '').split(';').filter(Boolean).map((x) => x.split(',')) : [null];
  for (const f of mine) {
    res[f] = {};
    refs.forEach((pair, ri) => {
      const key = pair ? 'ref' + ri : 'rand', s = stat0(), wins = [], pOut = [], byKind = {};
      for (const c of cs) {
        const use = pair && pair.some((g) => H.FORMS[g].sp === H.FORMS[f].sp) ? null : pair;   // never two of one species
        const r = play(c, f, K, use);
        add(s, r.me); wins.push(r.win ? 1 : 0); byKind[c.kind] = (byKind[c.kind] || 0) + (r.win ? 1 : 0);
        const pt = r.others.reduce((a, o) => a + o.turns, 0); pOut.push(Math.round(r.others.reduce((a, o) => a + out(o), 0) / Math.max(1, pt)));
      }
      res[f][key] = { s, wins: wins.join(''), pOut, byKind };
    });
    process.stderr.write('.');
  }
  fs.writeFileSync(path.join(OUT, `roles-${mode}${TAG}${tier}-${shard}.json`), JSON.stringify(res)); console.error('\ndone', mode, tier, shard);
}
