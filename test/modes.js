// Balance for the Daily Gig and Solo. node test/modes.js daily [N] | solo [N] | roles [N]
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js'); require('../src/modes.js');
const H = globalThis.H, mode = process.argv[2] || 'daily', N = +(process.argv[3] || 30);
if (process.env.SK) Object.assign(H.SOLO, JSON.parse(process.env.SK));
if (process.env.TK) { const o = JSON.parse(process.env.TK); for (const k in o) H.TWISTS[k].k = o[k]; }
const formsOf = (tier) => Object.keys(H.FORMS).filter((f) => H.FORMS[f].tier === tier);
// a typical save at a level: three pets of that growth, some equipment
const save = (L, tier, rank, items, rnd, forms) => {
  const S = H.newState(); S.level = L; S.stage = Math.max(1, Math.round((L - 1) / H.STAGE_SLOPE) + 1);
  for (let i = 0; i < 3; i++) { const pool = formsOf(tier % 1 ? (rnd() < tier % 1 ? Math.ceil(tier) : Math.floor(tier)) : tier), f = forms ? forms[i] : pool[Math.floor(rnd() * pool.length)], p = H.addPet(S, H.FORMS[f].sp); p.form = f; p.rank = rank; S.team[i] = p.id; }
  for (let i = 0; i < items; i++) { const it = H.rollItem(S, rnd, 'win'); const p = S.pets[i % 3]; const slot = p.gear.indexOf(null); if (slot >= 0) p.gear[slot] = it.id; }
  return S;
};
const PROF = [[8, 0, 0, 2, 'Lv 8, young'], [16, 0.5, 0, 3, 'Lv 16, some evolved'], [25, 1, 0, 4, 'Lv 25, evolved'], [45, 2, 0, 5, 'Lv 45, fully evolved'], [70, 2, 3, 6, 'Lv 70, stars']];

if (mode === 'daily') {
  const rnd = H.rng(5), day0 = H.dayOf(Date.now()), only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const rows = [];
  for (const tw of ['plain'].concat(H.TWIST_ORDER)) {
    if (only && !only.includes(tw)) continue;
    const res = [];
    for (const [L, tier, rank, items] of PROF) {
      let w = 0, turns = 0;
      for (let i = 0; i < N; i++) {
        const S = save(L, tier, rank, items, rnd); let day = day0; if (tw !== 'plain') while (H.twistOf(day) !== tw) day++; else day = day0 + i;
        const ms = day * 86400000 + 43200000 + new Date().getTimezoneOffset() * 60000;
        let b; if (tw === 'plain') { const st = H.dailyStage(S, ms); b = new H.Battle({ allies: H.teamPets(S).map((p) => H.buildPetUnit(p, S.level, S)), enemies: st.enemies.map(H.dailyFoe), rng: rnd, ensemble: H.teamEnsemble(S) ? H.teamEnsemble(S).id : null }); }
        else { // vary the venue and lineup across runs while keeping the rule
          const st0 = H.gigOf; H.gigOf = (d) => Object.assign(st0(d), { seed: i * 7919 + d, region: H.REGION_ORDER[(i + d) % 10] }); b = H.startDaily(S, rnd, ms); H.gigOf = st0; }
        if (H.autoRun(b)) w++; turns += b.turn;
      }
      res.push(Math.round((100 * w) / N) + '%' + (process.env.T ? '/' + Math.round(turns / N) : ''));
    }
    rows.push(tw.padEnd(10) + res.map((x) => x.padStart(9)).join(''));
  }
  console.log('twist     ' + PROF.map((p) => ('Lv' + p[0] + 't' + p[1]).padStart(9)).join('')); console.log(rows.join('\n'));
}

// One tour on auto: random road, boons picked at random (combos preferred a little), rests when hurt.
const tour = (S, petId, rnd, trace) => {
  H.startSolo(S, petId, rnd); const run = S.soloRun; let g = 0;
  while (S.soloRun && g++ < 40) {
    const r = S.soloRun;
    if (!r.pending) { const opts = H.soloReach(r); const pick = opts.slice().sort((a, b) => score(r, b) - score(r, a))[0]; H.soloEnter(S, pick.id, rnd); continue; }
    const p = r.pending;
    if (p.type === 'battle') { const b = H.startSoloBattle(S, rnd), win = H.autoRun(b); if (trace) trace.push([r.map[r.at].type, r.gigs, win, b.turn, Math.round(r.hp * 100)]); const out = H.finishSolo(S, win, b, rnd); if (!win || out.done) return { gigs: out.done ? 6 : out.reached, done: !!out.done }; }
    else if (p.type === 'boon') { const pick = p.opts.slice().sort((a, b) => H.combosOf(b, r.boons).length - H.combosOf(a, r.boons).length + (rnd() - 0.5))[0]; H.soloPick(S, pick); }
    else if (p.type === 'rest') H.soloRest(S, r.hp < 0.65 ? 'nap' : 'practise');
    else if (p.type === 'event') H.soloEvent(S, r.hp > 0.55 ? 0 : 1, rnd);
  }
  return { gigs: run.gigs, done: false };
};
// the road: prefer rest when hurt, otherwise anything (a little random)
const score = (r, n) => (n.type === 'rest' ? (r.hp < 0.6 ? 3 : 0.5) : n.type === 'loud' ? (r.hp > 0.7 ? 1.2 : 0.2) : n.type === 'jam' ? 1.5 : 1) + Math.random() * 0.8;

if (mode === 'solo' || mode === 'roles') {
  const rnd = H.rng(9), byTier = {}, byRole = {}, reach = [0, 0, 0, 0, 0, 0, 0], perForm = [];
  const LV = { 0: +(process.env.L0 || 14), 1: +(process.env.L1 || 28), 2: +(process.env.L2 || 50) };
  const forms = Object.keys(H.FORMS).filter((f) => !process.env.TIER || H.FORMS[f].tier === +process.env.TIER);
  for (const f of forms) {
    const tier = H.FORMS[f].tier, role = H.kitOf(f).role, L = LV[tier]; let done = 0;
    for (let i = 0; i < N; i++) {
      const S = save(L, tier, tier === 2 ? 1 : 0, 2 + tier * 2, rnd, [f, f, f]); const t = tour(S, S.pets[0].id, rnd);
      reach[Math.min(6, t.gigs)]++; if (t.done) done++;
      (byTier[tier] = byTier[tier] || [0, 0]); byTier[tier][0]++; byTier[tier][1] += t.done ? 1 : 0;
      const rk = tier + ':' + role; (byRole[rk] = byRole[rk] || [0, 0]); byRole[rk][0]++; byRole[rk][1] += t.done ? 1 : 0;
    }
    perForm.push([f, tier, role, done / N]);
  }
  const tot = reach.reduce((a, b) => a + b, 0), cum = (k) => Math.round((100 * reach.slice(k).reduce((a, b) => a + b, 0)) / tot);
  console.log('reach gig 1..5, boss win:', [1, 2, 3, 4, 5, 6].map((k) => cum(k) + '%').join(' '));
  for (const t in byTier) console.log('tier', t, 'tours won', Math.round((100 * byTier[t][1]) / byTier[t][0]) + '%');
  console.log(Object.keys(byRole).sort().map((k) => k + ' ' + Math.round((100 * byRole[k][1]) / byRole[k][0]) + '%').join('  '));
  if (mode === 'roles') { perForm.sort((a, b) => a[3] - b[3]); console.log('hardest', perForm.slice(0, 8).map((x) => x[0] + ' ' + Math.round(x[3] * 100)).join(', ')); console.log('easiest', perForm.slice(-8).map((x) => x[0] + ' ' + Math.round(x[3] * 100)).join(', ')); }
}
if (mode === 'trace') {
  const rnd = H.rng(+(process.env.SEED || 3)), f = process.env.F || 'thud', tier = H.FORMS[f].tier, S = save(+(process.env.L || 14), tier, 0, 2, rnd, [f, f, f]), tr = [];
  const t = tour(S, S.pets[0].id, rnd, tr); console.log(f, t, tr.map((x) => x.join(':')).join('  '));
}
if (mode === 'forms') {
  // every form's tour win rate, lowest first
  const rnd = H.rng(9), LV = { 0: 14, 1: 28, 2: 50 }, out = [];
  for (const f of Object.keys(H.FORMS)) { const tier = H.FORMS[f].tier; let done = 0; for (let i = 0; i < N; i++) { const S = save(LV[tier], tier, tier === 2 ? 1 : 0, 2 + tier * 2, rnd, [f, f, f]); if (tour(S, S.pets[0].id, rnd).done) done++; } out.push([f, tier, H.kitOf(f).role, Math.round((100 * done) / N)]); }
  out.sort((a, b) => a[3] - b[3]); const hist = {}; for (const x of out) { const b = Math.floor(x[3] / 10) * 10; hist[b] = (hist[b] || 0) + 1; }
  console.log('histogram', JSON.stringify(hist)); console.log(out.slice(0, 25).map((x) => x.join(':')).join('  '));
  if (process.env.JSON) require('fs').writeFileSync(process.env.JSON, JSON.stringify(out));
}
if (mode === 'fit') {
  // fit each form's own factor so every pet has about the same chance of finishing a tour on auto
  if (process.env.IN) H.SOLO_FORM = JSON.parse(require('fs').readFileSync(process.env.IN, 'utf8'));
  const target = +(process.env.TARGET || 0.45), IT = +(process.env.IT || 3), LV = { 0: 14, 1: 28, 2: 50 }, F = Object.assign({}, H.SOLO_FORM || {}), lg = (p) => Math.log(p / (1 - p));
  H.SOLO_FORM = F;
  for (let it = 0; it < IT; it++) {
    const rnd = H.rng(100 + it); let dev = 0;
    for (const f of Object.keys(H.FORMS)) {
      const tier = H.FORMS[f].tier; let done = 0;
      for (let i = 0; i < N; i++) { const S = save(LV[tier], tier, tier === 2 ? 1 : 0, 2 + tier * 2, rnd, [f, f, f]); if (tour(S, S.pets[0].id, rnd).done) done++; }
      const wr = Math.max(0.04, Math.min(0.96, done / N)); dev += Math.abs(wr - target);
      F[f] = Math.max(0.5, Math.min(1.8, (F[f] || 1) * Math.exp((0.8 * (lg(wr) - lg(target))) / 8.5)));
    }
    console.log('iteration', it, 'mean |deviation|', (dev / Object.keys(H.FORMS).length).toFixed(3));
  }
  const out = {}; for (const f of Object.keys(H.FORMS)) out[f] = Math.round(F[f] * 100) / 100;
  require('fs').writeFileSync(process.env.OUT || '/tmp/soloform.json', JSON.stringify(out));
}
