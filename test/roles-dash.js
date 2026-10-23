// Builds the balance report's data files from test/out/roles-report.json (current) and roles-reportP.json (with test/balance-patch.js).
// node test/roles-dash.js <outdir>
require('../src/i18n.js'); require('../src/data.js');
const fs = require('fs'), path = require('path'), H = globalThis.H, OUT = path.join(__dirname, 'out'), dir = process.argv[2];
const A = JSON.parse(fs.readFileSync(path.join(OUT, 'roles-report.json'), 'utf8')), B = JSON.parse(fs.readFileSync(path.join(OUT, 'roles-reportP.json'), 'utf8'));
const ROLE = { stray: 'Young', rhythm: 'Tank', lead: 'Attacker', harmony: 'Healer', bass: 'Trickster' };
const after = {}; for (const T of B.tiers) for (const r of T.rows) after[r.id] = r;
const mean = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length), sd = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))); };
const r1 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 10) / 10);

// the proposals: what changes and why (the before/after numbers come from the two runs)
const P = [
  ['roles', 2, 'Healer role', 'Healer role', 'Healer HP 1.04 → 1.07 and Guard 3 → 4 (every Healer form).', 'Healers trail in almost every band make-up, not only when doubled up, and have the weakest stat line of the four roles.'],
  ['bong', 0, 'bong', 'Bong', 'Big Bong: 140% + Stun → 100% + Stun, cooldown 3 → 4 turns.', 'Best Young pet by a wide margin in every fight type; a Stun every third turn on a high-HP body.'],
  ['clack', 0, 'clack', 'Clack', 'Clack-Clack: 2 × 80% → 2 × 70%.', 'Second-best Young pet.'],
  ['howl', 0, 'howl', 'Howl', 'Howl: 40% to all + Power Down → 32% to all + Power Down.', 'Third-best Young pet.'],
  ['clang', 0, 'clang', 'Clang', 'Clang (Basic) 100% → 105%; Ring 110% + 50% Shield → 130% + 80% Shield.', 'Worst Young pet. Its HP is wasted at stage 0 (no Taunt yet) and its Power is the lowest.'],
  ['oompah', 0, 'oompah', 'Oompah', 'Oom (Basic) 100% → 115%; Pah! 140% → 200%, push 40% → 50%.', 'Same tank stat line as Clang with the same problem.'],
  ['screech', 0, 'screech', 'Screech', 'Screech: 60% to all → 90% to all.', 'Lowest HP of the Young pets and falls in 93% of battles.'],
  ['peep', 0, 'peep', 'Peep', 'Tailwind: 70% → 100% (still pushes the band 25%).', 'Its Skill hits for less than its Basic.'],
  ['blare', 0, 'blare', 'Blare', 'Blast: 120% → 180%.', 'Bottom five Young pets.'],
  ['wah', 0, 'wah', 'Wah', 'Bent Note: 50% to all → 70% to all.', 'Bottom five Young pets.'],
  ['doo', 0, 'doo', 'Doo', 'Huddle: Shield 60% → 90% for the band.', 'Bottom Young pet once the others were fixed; its Skill does no damage.'],
  ['squeak', 0, 'squeak', 'Squeak', 'Squeeze: 120% → 150% (still heals 50% of it).', 'Below average in every fight type.'],
  ['chromatic', 1, 'chromatic', 'Chromatic', 'Chromatic Run: strength 1.27 → 1.12; enemy turn-bar push 20% → 15%.', 'Best stage-1 form: hits all, slows all and pushes all back, every third turn.'],
  ['quaver', 1, 'quaver', 'Quaver', 'Tremolo (Basic): Poison 2 turns → 1 turn.', 'Already at the lowest move strength (0.8): the Poison on its Basic and passive carries it.'],
  ['highland', 1, 'highland', 'Highland', 'Reedy Note (Basic): Poison 2 turns → 1 turn.', 'Same as Quaver: at the lowest move strength and still top three.'],
  ['sousa', 1, 'sousa', 'Sousa', 'Low Blow (Basic): push 30% → 20%.', 'Best stage-1 Tank, at the lowest move strength.'],
  ['jingle', 1, 'jingle', 'Jingle', 'Good Cheer: starting Shield 10% → 20% of HP; Sleigh Bells strength 1.09 → 1.3.', 'Worst stage-1 form.'],
  ['carousel', 1, 'carousel', 'Carousel', 'Twirl (Basic) heal 35% → 50%; Merry-Go-Round strength 1.28 → 1.4.', 'Bottom three at stage 1; Lifesong only helps partners that deal damage.'],
  ['upright', 1, 'upright', 'Upright', 'Slap (Basic) Shield 25% → 40%; Low End strength 1.17 → 1.4.', 'Worst stage-1 Tank, worst of all with fixed partners.'],
  ['plunger', 1, 'plunger', 'Plunger', 'Plunger Mute: strength 1.32 → 1.5, Off-Key 2 → 3 turns.', 'Worst stage-1 Trickster: lots of debuffs that the band rarely cashes in.'],
  ['opera', 2, 'opera', 'Opera', 'Glass Breaker: strength 1.3 → 1.5, and new: +150% damage when only one enemy is left.', 'Worst stage-2 form, and −25 against every boss: all of its damage is spread, which is wasted once the boss stands alone.'],
  ['plainsong', 2, 'plainsong', 'Plainsong', 'Plainsong: strength 0.9 → 1.3.', 'Bottom three at stage 2 in both checks.'],
  ['soul', 2, 'soul', 'Soul', 'Soul: strength 0.81 → 1.0.', 'Bottom five at stage 2 in both checks.'],
  ['vinyl', 2, 'vinyl', 'Vinyl', 'Backmask: also makes every enemy Off-Key for 2 turns.', 'Worst stage-2 Trickster; Flip has little to flip against most enemies, and more damage alone did not help (tried strength 1.5).'],
  ['cadence', 2, 'cadence', 'Cadence', 'Drumline: also gives itself a Shield of 15% HP.', 'Worst stage-2 Tank, 10 points behind its sibling March; it has no way to protect itself.'],
  ['jig', 2, 'jig', 'Jig', 'Stamping Jig: strength 0.84 → 1.05.', '9 points behind its sibling Roll.'],
  ['riff', 2, 'riff', 'Riff', 'Power Riff: also gives itself a Shield of 10% HP (already at the highest move strength, 1.5).', 'Falls in 75% of battles; more damage alone cannot fix it.'],
  ['boogie', 2, 'boogie', 'Boogie', 'Boogie-Woogie: strength 1.26 → 1.45.', 'Random targets spread its damage; bottom five Attackers.'],
  ['blues', 2, 'blues', 'Blues', 'The Blues: strength 0.99 → 0.75.', 'Best stage-2 form in both checks.'],
  ['tamtam', 2, 'tamtam', 'Tamtam', 'Tam-Tam: strength 1.2 → 1.0.', 'Best stage-2 Tank.'],
  ['grunge', 2, 'grunge', 'Grunge', 'Grunge finale: strength 1.12 → 1.0.', 'Top five at stage 2 in both checks.'],
  ['mistral', 2, 'mistral', 'Mistral', 'Finale strength 0.85 → 1.05.', 'Inherits Chromatic Run, so the Chromatic nerf alone drops it by 8 points.'],
  ['sirocco', 2, 'sirocco', 'Sirocco', 'Finale strength 0.8 → 0.95.', 'Inherits Chromatic Run, so the Chromatic nerf alone drops it by 9 points.'],
  ['nocturne', 2, 'nocturne', 'Nocturne', 'Nightmare: strength 1.4 → 1.5, Poison 2 → 3 turns.', 'Inherits Tremolo, so the Quaver nerf alone drops it by 5 points.'],
  ['pibroch', 2, 'pibroch', 'Pibroch', 'Finale strength 1.38 → 1.5.', 'Inherits Reedy Note, so the Highland nerf alone drops it by 8 points.'],
  ['tattoo', 2, 'tattoo', 'Tattoo', 'Finale strength 1.19 → 1.35.', 'Inherits Reedy Note, so the Highland nerf alone drops it by 3 points.'],
  ['carillon', 2, 'carillon', 'Carillon', 'Finale strength 1.5 → 1.2.', 'Inherits the Jingle buffs (Good Cheer and Sleigh Bells) and would climb 10 points with them.'],
  ['gamelan', 2, 'gamelan', 'Gamelan', 'Finale strength 1.5 → 1.2.', 'Inherits the Jingle buffs and would climb 10 points with them.'],
  ['rumba', 2, 'rumba', 'Rumba', 'Maracas: cooldown 5 → 6 turns.', 'Top five at stage 2 while already at the lowest move strength.'],
];

const forms = [], roles = [], sibs = [], spread = [], props = [], kinds = [];
for (const T of A.tiers) {
  const t = T.tier, rows = T.rows;
  for (const r of rows) {
    const b = after[r.id] || {};
    forms.push({ form: r.n, id: r.id, stage: t, role: ROLE[r.role], species: H.FORMS[r.sp].n, evolves_from: r.parent ? H.FORMS[r.parent].n : '',
      value: r.value, margin: r.err, value_after: r1(b.value), change: b.value == null ? null : r1(b.value - r.value), win_rate: r.win,
      vs_trio: r.byKind.trio, vs_boss: r.byKind.boss, vs_rivals: r.byKind.rivals, vs_loud: r.byKind.loud, fixed_partners: r.refValue,
      damage_per_turn: r.dpt, heal_shield_per_turn: r.hpt, soaked_per_turn: r.soak, survives: r.alive, partner_boost: r.boost,
      buff_turns: r.buffs, debuff_turns: r.debuffs, turn_bar_given: r.tbGive, turn_bar_taken: r.tbTake, move_strength: r.mk });
  }
  for (const ro of [...new Set(rows.map((r) => r.role))]) {
    const rs = rows.filter((r) => r.role === ro);
    roles.push({ key: `${t}-${ROLE[ro]}`, stage: t, role: ROLE[ro], forms: rs.length, value: r1(mean(rs.map((r) => r.value))), value_after: r1(mean(rs.map((r) => after[r.id].value))),
      damage_per_turn: Math.round(mean(rs.map((r) => r.dpt))), heal_shield_per_turn: Math.round(mean(rs.map((r) => r.hpt))), soaked_per_turn: Math.round(mean(rs.map((r) => r.soak))), survives: Math.round(mean(rs.map((r) => r.alive))),
      vs_trio: r1(mean(rs.map((r) => r.byKind.trio))), vs_boss: r1(mean(rs.map((r) => r.byKind.boss))), vs_rivals: r1(mean(rs.map((r) => r.byKind.rivals))), vs_loud: r1(mean(rs.map((r) => r.byKind.loud))) });
  }
  const va = rows.map((r) => r.value), vb = rows.map((r) => after[r.id].value);
  spread.push({ stage: t, forms: rows.length, battles: T.battles, level: [12, 30, 60][t], target_win: 55, spread: r1(sd(va)), spread_after: r1(sd(vb)), outside5: va.filter((v) => Math.abs(v) > 5).length, outside5_after: vb.filter((v) => Math.abs(v) > 5).length,
    best: r1(Math.max(...va)), worst: r1(Math.min(...va)), best_after: r1(Math.max(...vb)), worst_after: r1(Math.min(...vb)) });
  if (t > 0) {
    const par = {}; for (const r of rows) (par[r.parent] = par[r.parent] || []).push(r);
    for (const [p, c] of Object.entries(par)) { if (c.length < 2) continue; c.sort((x, y) => y.value - x.value); const [x, y] = c;
      sibs.push({ key: p, stage: t, evolves_from: H.FORMS[p].n, stronger: x.n, stronger_role: ROLE[x.role], weaker: y.n, weaker_role: ROLE[y.role], stronger_value: x.value, weaker_value: y.value,
        gap: r1(x.value - y.value), margin: r1(Math.hypot(x.err, y.err)), gap_after: r1(Math.abs(after[x.id].value - after[y.id].value)) }); }
  }
}
for (const [id, t, key, name, change, why] of P) {
  let v, va;
  if (id.startsWith('roles')) { const ro = id === 'roles' ? 'Healer' : 'Trickster'; const x = roles.find((r) => r.stage === t && r.role === ro); v = x.value; va = x.value_after; }
  else { const f = forms.find((r) => r.id === key); v = f.value; va = f.value_after; }
  props.push({ key: id, status: 'Proposed', stage: t, target: name, change, why, value: v, value_after: va });
}
// tried in an earlier round and dropped
{ const rd = (f) => JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')), R1 = rd('roles-reportR1.json'), R2 = rd('roles-reportR2.json');
  const rowOf = (R, id) => { for (const T of R.tiers) { const x = T.rows.find((r) => r.id === id); if (x) return x; } };
  const t2 = R1.tiers.find((T) => T.tier === 2).rows.filter((r) => r.role === 'bass');
  props.push({ key: 'trickster-tempo', status: 'Dropped', stage: 2, target: 'Trickster role', change: 'Trickster Tempo 1.05 → 1.02.', why: 'Tried against the stage-1 Trickster lead. The Poison and Chromatic fixes closed that gap on their own, and the slower Tricksters fell behind at stage 2.', value: roles.find((r) => r.stage === 2 && r.role === 'Trickster').value, value_after: r1(mean(t2.map((r) => r.value))) });
  props.push({ key: 'caprice-cd', status: 'Dropped', stage: 2, target: 'Caprice', change: 'Whim: cooldown 4 → 5 turns.', why: 'Not needed: Caprice inherits the Quaver change, which already brings it down. Both together overshot.', value: forms.find((r) => r.id === 'caprice').value, value_after: rowOf(R2, 'caprice').value });
}
// role stacking (stage 2 and 1)
const NAME = ROLE;
for (const t of [1, 2]) { const c = JSON.parse(fs.readFileSync(path.join(OUT, `roles-combo${t}.json`), 'utf8'));
  for (const [k, o] of Object.entries(c)) { const [r, other, n] = k.split('|'); kinds.push({ key: `${t}-${k}`, stage: t, role: NAME[r], partner_role: NAME[other], partners_of_that_role: +n, value: o.v, battles: o.n }); } }

const write = (n, rows) => fs.writeFileSync(path.join(dir, n + '.json'), JSON.stringify(rows));
write('forms', forms); write('roles', roles); write('siblings', sibs); write('spread', spread); write('proposals', props); write('stacking', kinds);
console.log('forms', forms.length, 'roles', roles.length, 'siblings', sibs.length, 'proposals', props.length, 'stacking', kinds.length);
console.log(JSON.stringify(spread));
