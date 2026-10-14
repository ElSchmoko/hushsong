// Checks that the newer effects do what their text says. node test/mech.js
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H; let fails = 0;
const ok = (c, msg) => { if (!c) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };
const pet = (form, lvl) => H.buildPetUnit({ id: 1, form, rank: 0, gear: [null, null] }, lvl || 20);
const din = (id, lvl) => H.buildDinUnit(id, lvl || 20);
const mk = (allies, enemies, seed) => new H.Battle({ allies, enemies, rng: H.rng(seed || 5) });
const use = (b, u, kind, target) => { const a = u.ab.find((x) => x.kind === kind); b.acting = u; b.useAbility(u, a, { target }); b.acting = null; };

// stun guard: a stunned unit misses one turn, then shrugs off stuns until it has acted
{ const b = mk([pet('bong')], [din('racket')]); const e = b.units[1];
  b.applySt(null, e, 'stun', 1); e.gauge = H.GMAX; b.units[0].gauge = 0; b.next(true); ok(e.stunGuard, 'stunned unit gets the guard after its skipped turn');
  ok(!b.applySt(null, e, 'stun', 1), 'guarded unit shrugs off a second stun');
  b.perform(e, e.ab[0], b.units[0]); ok(!e.stunGuard && b.applySt(null, e, 'stun', 1), 'after acting it can be stunned again'); }
// mute: only the Basic move is ready
{ const b = mk([pet('plunger')], [din('shush')]); const e = b.units[1]; e.ab.forEach((a) => (a.cd = 0));
  b.applySt(b.units[0], e, 'mute', 1); ok(!b.ready(e, e.ab[1]) && !b.ready(e, e.ab[2]) && b.ready(e, e.ab[0]), 'muted unit can only use its Basic'); ok(b.lockWhy(e, e.ab[1]) === 'mute', 'lock reason says muted'); }
// muddle: single hits land on its own side
{ const b = mk([pet('rattle')], [din('racket'), din('clank')]); const e = b.units[1], f = b.units[2]; b.applySt(b.units[0], e, 'muddle', 1);
  const hp0 = b.units[0].hp, f0 = f.hp; b.acting = e; b.useAbility(e, e.ab[0], { target: b.units[0] }); ok(b.units[0].hp === hp0 && f.hp < f0, 'muddled enemy hits its own friend'); }
{ const b = mk([pet('rattle')], [din('racket')]); const e = b.units[1]; b.applySt(b.units[0], e, 'muddle', 1); const e0 = e.hp; b.acting = e; b.useAbility(e, e.ab[0], {}); ok(e.hp < e0, 'muddled enemy alone hits itself'); }
// steal
{ const b = mk([pet('pirate')], [din('muffle')]); const p = b.units[0], e = b.units[1]; b.addShield(e, 50); b.applySt(e, e, 'regen', 3, { val: 0.5 });
  b.steal(p, e); ok(e.shield === 0 && !e.st.regen && p.shield > 0 && p.st.regen, 'steal takes Shield and good effects'); }
// flip
{ const b = mk([pet('vinyl')], [din('tacet')]); const p = b.units[0], e = b.units[1]; b.applySt(e, e, 'pup', 3); b.addShield(e, 40);
  b.flip(p, e); ok(e.st.pdown && !e.st.pup && e.shield === 0, 'flip turns Power Up into Power Down and breaks Shield'); }
{ const b = mk([pet('gospel'), pet('stomp')], [din('racket')]); const p = b.units[0], q = b.units[1]; b.applySt(null, q, 'poison', 2, { rawVal: 10 }); b.applySt(null, q, 'pdown', 2);
  b.flip(p, q); ok(q.st.regen && q.st.pup && !q.st.poison && !q.st.pdown, 'flip on the band turns Poison into Regen, Power Down into Power Up'); }
// replay
{ const b = mk([pet('jukebox')], [din('muffle')]); const p = b.units[0], e = b.units[1]; b.lastMove[1] = H.DIN.muffle.finale; use(b, p, 'finale'); ok(p.shield > 0 && p.st.regen, 'replay plays back the enemy Soak on itself'); }
{ const b = mk([pet('jukebox')], [din('racket'), din('racket')]); const p = b.units[0]; const hp = b.units.slice(1).map((u) => u.hp); use(b, p, 'finale'); ok(b.units.slice(1).every((u, i) => u.hp < hp[i]), 'replay with nothing to play back hits all enemies'); }
// extend
{ const b = mk([pet('sostenuto')], [din('racket')]); const e = b.units[1]; b.applySt(null, e, 'poison', 1, { rawVal: 3 }); use(b, b.units[0], 'finale'); ok(e.st.poison && e.st.poison.dur >= 3, 'sustain pedal adds 2 turns to bad effects'); }
// echo
{ const b = mk([pet('fugue')], [din('clank')]); const p = b.units[0]; use(b, p, 'finale'); ok(p.echoNext && p.echoNext.k === 0.8, 'fugue plays again next turn'); }
// pick
{ const b = mk([pet('caprice'), pet('stomp')], [din('racket')]); b.units[1].hp = 5; const h0 = b.units[1].hp; use(b, b.units[0], 'finale'); ok(b.units[1].hp > h0, 'whim picks a heal when a bandmate is nearly out'); }
// ready
{ const b = mk([pet('riff')], [din('clank')]); const p = b.units[0]; p.ab[1].cd = 2; b.acting = p; b.perform(p, p.ab[2], b.units[1]); ok(p.ab[1].cd === 0, 'power riff makes the Skill ready again'); }
// bosses
{ const b = mk([pet('pluck', 40)], [din('rumble', 40)]); const e = b.units[1]; const h0 = e.hp; b.hit(b.units[0], e, 9, {}, { src: b.units[0], kind: 'phrase', last: [], powMul: 1 }, false); ok(h0 - e.hp <= Math.ceil(e.max * 0.1), 'Rumble: no hit takes more than 10%'); }
{ const b = mk([pet('pluck')], [din('honk'), din('clatter')]), c = { src: null, kind: 'beat', last: [], powMul: 1 }; ok(Math.abs(b.guardK(b.units[1], c, false) - 0.6) < 1e-9, 'Honk: 40% less while a friend stands'); }
{ const b = mk([pet('pluck')], [din('shush')]); ok(Math.abs(b.guardK(b.units[1], { kind: 'beat' }, false) - 0.7) < 1e-9 && b.guardK(b.units[1], { kind: 'phrase' }, false) === 1, 'Shush: 30% less from Basic moves only'); }
{ const b = mk([pet('pluck')], [din('swarm')]); ok(Math.abs(b.guardK(b.units[1], { kind: 'phrase' }, false) - 0.7) < 1e-9 && b.guardK(b.units[1], { kind: 'phrase' }, true) === 1, 'Swarm: 30% less except from moves on all enemies'); }
{ const b = mk([pet('pluck')], [din('muffle')]); const e = b.units[1]; ok(b.guardK(e, {}, false) === 1, 'Muffle: full damage without Shield'); b.addShield(e, 10); ok(Math.abs(b.guardK(e, {}, false) - 0.7) < 1e-9, 'Muffle: 30% less with Shield'); }
{ const b = mk([pet('stomp')], [din('gale')]); const p = b.units[0], e = b.units[1]; b.addShield(p, 30); b.fire(e, 'turn'); ok(p.shield === 0, 'Gale: gusts blow away Shields'); }
// Foghorn: builds up, goes off next turn; called off by damage
{ const b = mk([pet('stomp', 30), pet('stomp', 30)], [din('foghorn', 30)]); const e = b.units[2]; b.acting = e; b.useAbility(e, e.ab[2], {}); b.endTurn(e, e.ab[2]);
  ok(e.st.charge && e.charging, 'Foghorn starts building up');
  const hp = [b.units[0].hp, b.units[1].hp]; e.gauge = H.GMAX; b.units[0].gauge = 0; b.units[1].gauge = 0; b.next(true); ok(b.units[0].hp < hp[0] && b.units[1].hp < hp[1] && !e.charging, 'Long Blast goes off on its next turn'); }
{ const b = mk([pet('pluck', 30)], [din('foghorn', 30)]); const e = b.units[1]; b.acting = e; b.useAbility(e, e.ab[2], {}); b.acting = null; b.applyDamage(e, e.max * 0.21, { kind: 'hit' }); ok(!e.charging && !e.st.charge, 'enough damage calls Long Blast off'); }
{ const b = mk([pet('pluck', 30)], [din('foghorn', 30)]); const e = b.units[1]; b.acting = e; b.useAbility(e, e.ab[2], {}); b.acting = null; b.strip(e, 1); e.gauge = H.GMAX; b.units[0].gauge = 0; const hp = b.units[0].hp; b.next(true); ok(b.units[0].hp === hp || b.ev.every((x) => x.t !== 'ability' || x.n !== 'Long Blast'), 'removing good effects calls Long Blast off'); }
// cycle of effects on Fuzz
{ const b = mk([pet('shortwave')], [din('clank')]); const p = b.units[0], e = b.units[1]; const got = []; for (let i = 0; i < 4; i++) { e.st = {}; e.hp = e.max; b.acting = p; b.useAbility(p, p.ab[0], { target: e }); got.push(Object.keys(e.st).filter((s) => s !== 'taunt')[0]); }
  ok(got.join() === 'sdown,poison,pdown,offkey', 'Fuzz adds Slow, Poison, Power Down, Off-Key in turn: ' + got.join()); }
// ringing
{ const b = mk([pet('peal')], [din('racket')]); const p = b.units[0], e = b.units[1]; b.applySt(p, p, 'ring', 2); const e0 = e.hp; b.hit(e, p, 1, {}, { src: e, kind: 'beat', last: [], powMul: 1 }, false); ok(e.hp < e0, 'Ringing hurts the attacker'); }
// every move has text and every form is described
for (const id in H.FORMS) for (const k of ['beat', 'phrase', 'finale']) { const a = H.FORMS[id][k]; if (a && !H.describe(a)) ok(false, 'no text for ' + id + ' ' + k); }
for (const id in H.DIN) for (const k of ['beat', 'phrase', 'finale']) { const a = H.DIN[id][k]; if (a && !H.describe(a)) ok(false, 'no text for ' + id + ' ' + k); }
console.log(fails ? fails + ' failed' : 'all good'); process.exit(fails ? 1 : 0);
