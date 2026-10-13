// What each Legendary piece adds: a fully evolved band, one pet wearing it, against a boss floor. node test/legs.js [N] [lvl]
require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H, N = +(process.argv[2] || 400), L = +(process.argv[3] || 60), rnd = H.rng(3);
const forms = Object.keys(H.FORMS).filter((f) => H.FORMS[f].tier === 2), st = H.stage(130);
const run = (make) => { let w = 0; for (let i = 0; i < N; i++) { const S = H.newState(); const pets = [0, 1, 2].map((k) => ({ id: k + 1, form: forms[Math.floor(rnd() * forms.length)], rank: 0, t1: true, t2: true, gear: [null, null] })); const it = make(S); if (it) { S.items.push(it); pets[Math.floor(rnd() * 3)].gear[0] = it.id; }
  const b = new H.Battle({ allies: pets.map((p) => H.buildPetUnit(p, L, S)), enemies: st.enemies.map((e) => H.foeUnit(Object.assign({}, e, { lvl: Math.round(L * (+process.env.FK || 0.8)) }))), rng: rnd }); if (H.autoRun(b)) w++; } return w / N; };
const base = run(() => null), out = [];
for (const k of Object.keys(H.LEGENDS)) { const t = H.LEGENDS[k].type; const ep = run(() => ({ id: 99, rar: 'e', type: t })), lg = run(() => ({ id: 99, rar: 'l', type: t, leg: k })); out.push([k, Math.round((ep - base) * 100), Math.round((lg - base) * 100)]); }
console.log('no gear', Math.round(base * 100) + '%  (epic of that kind / this legendary, points over no gear)');
out.sort((a, b) => b[2] - a[2]).forEach(([k, e, l]) => console.log(k.padEnd(9), String(e).padStart(4), String(l).padStart(4)));
