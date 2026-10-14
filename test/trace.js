require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js'); const H = globalThis.H;
const [region, lvl, ...forms] = process.argv.slice(2); const rnd = H.rng(5);
const S = H.newState(); forms.forEach((f) => { const p = H.addPet(S, H.FORMS[f].sp, null); p.form = f; }); S.level = +lvl;
const dv = H.genDelve(S, region, false, rnd); const b = H.startBattle(S, dv, dv.cols[6][0], rnd);
console.log(b.units.map((u) => `${u.name} hp${u.max} vol${Math.round(b.vol(u))} poise${b.poise(u)} tempo${Math.round(b.tempo(u))}`).join('\n'));
const dealt = {}; let n = 0;
while (!b.over && n++ < 600) { if (b.canCue()) { const pals = b.alive(0); b.doCue(pals[0].uid); for (const e of b.ev) if (e.t === 'dmg' && e.src >= 0) dealt[b.units[e.src].name] = (dealt[b.units[e.src].name] || 0) + e.amt; } const r = b.step(); for (const e of r.events) { if (e.t === 'dmg' && e.src >= 0) dealt[b.units[e.src].name] = (dealt[b.units[e.src].name] || 0) + e.amt; if (e.t === 'fall') console.log(`turn ${b.turn}: ${b.units[e.u].name} falls`); } }
console.log(b.over, 'turns', b.turn, JSON.stringify(dealt), b.units.map((u) => u.name + ':' + Math.round(u.hp)).join(' '));
