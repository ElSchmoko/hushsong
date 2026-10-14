// Every piece of player-facing text in Hushsong, as one Markdown list: node tools/copy.js > copy.md
// Screen text is listed by hand (it lives in the UI code); everything that comes from game data is read from the data itself.
// {curly} marks a value filled in by the game.
require('../src/data.js'); require('../src/engine.js'); require('../src/game.js'); require('../src/modes.js');
const H = globalThis.H, out = [], h = (n, t) => out.push('', '#'.repeat(n) + ' ' + t), li = (...xs) => xs.forEach((x) => out.push('- ' + x)), p = (x) => out.push('', x);
const kv = (k, v) => `**${k}**: ${v}`;

h(1, 'Hushsong: all in-game text');
p('Every line of text the game shows, grouped by where it appears. {Curly} words are filled in by the game; [square] notes say when a line shows.');

h(2, 'Title and intro');
li('Hushsong', 'Collect musical pets. Bring the music back.', 'Play / Continue / Menu', 'Skip · Tap to continue · Open my first shell');
li(kv('Once, everything sang', 'Every hill, harbour and hall had its own tune, and musical pets played them all day long.'),
  kv('Then came the Din', 'Noisy creatures that cannot stand a tune. They crashed in and drowned every song in clatter.'),
  kv('The world went quiet', 'The colour drained away. The pets hid in their shells, and no one has heard a song since.'),
  kv('But one shell still hums', 'Open it, gather a band, and win the music back, floor by floor.'));

h(2, 'Home');
li('Lv {n} · {xp} / {need} XP · Top level', '{Region} · Floor {n} / Boss floor {n} · {n} of 10 regions sing',
  'Adventure · Foes Lv {n} / Boss · Foes Lv {n}', 'Rehearsal · {n} open / Boss replays', 'Daily Gig · {house rule} / Won today', 'Solo · Gig {n} of 5 next / Rewards today / Play for fun',
  'Encore · Wave {n} next / Best this week: {n} / Endless waves', '[locked] Unlocks at Level {n} · Unlocks after floor 10', '[locked, tapped] {Mode} unlocks at level {n}. · Rehearsal unlocks after the boss on floor 10.',
  'Tabs: Home · Band · Pets · Shells · Bag');
li('[first steps] Start your adventure here · Fight the foes above · Ready? Head out · Open your shell here · Tap your pet · Put your equipment on here · Done! Head back and battle on.');

h(2, 'Adventure');
li('Your band / No ensemble · {ensemble boon} · Band', '{Region} · Floor {n} / Loud {n} / Boss {n} · Cleared · Foes Lv {n}', 'Rival {pet} · Loud {Din}', 'You hit it harder · It hits you harder',
  'Foes are {n} levels above you', 'Keep going: on / off', 'Auto battle · Battle');
li('Map: The way to floor 100 / The world, encore {n} · Floors {a}–{b} · sings again / hushed by {boss} · Here');

h(2, 'Band');
li('Swap · free spot', 'Your ensemble · No ensemble', 'Fill all three spots. It takes **3 different families**, or **3 of the same**.', 'Possible: {ensembles} +{n}', 'All ensembles · To the adventure',
  'Who stands here? · Leave this spot empty · Close');

h(2, 'Pets');
li('Pets {n}/{total} · Ensembles {n}/{total}', '? ? ? [not found yet]', '3 different families, or 3 of the same.', 'In use · Pets missing · Played · Not played yet');
h(3, 'Pet page');
li('Not evolved · Evolved once · Fully evolved', 'HP · Power · Guard · Speed · Crit', 'Evolve into · {n} / {need} echoes · New Special', 'Pick one. Swapping later is free.', 'Echoes come from shells, bosses, rehearsals and records.',
  'Stars {n} / 10 · Add a star · +3% HP and Power', 'This pet is as strong as it gets.', 'Equipment · Empty slot · Moves', 'Change path · Free, as often as you like.', 'Evolve · {cost} · {have} / {cost} echoes · Back · Great',
  'Equipment sheet: Take it off · Swap for · In your bag · Nothing else in your bag. · Your bag is empty.');
li('Move cards: Basic · Skill · Special · Always on · wait {n} · any time · new');

h(2, 'Shells');
li('{n} shells to open · No shells right now', 'Your first pet is inside. **Tap the shell.**', 'A **random pet**. One you already have becomes an **echo**.', 'Bosses leave shells. Notes buy more.',
  'Open the shell / Open a shell · Buy a shell · {price}', 'Three pets were inside! · Pick one. The others turn up later. · Pick one / I choose {pet}', 'New pet! · Another {pet} (your {form}) · +{n} {pet} echo(es)',
  'Evolve {pet} / Add a star to {pet} · Open another ({n} left) · Done / Let\'s go');
li('First echo: You found an echo! · Plain echoes help any pet evolve. Spend them on a pet\'s page.', 'First own echo: You found {pet} echoes! · They help {pet} evolve, and later buy stars.');

h(2, 'Bag');
li('Nothing here yet · Battles sometimes drop equipment.', '3 spare pieces of one kind merge into a better one.', 'Merge 3 {item} → {rarity} · Merged! · Great', '{Pet} is wearing this. / Nobody is wearing this.',
  'Take it off {pet} · Go to {pet} · Merge 3 → {rarity} · Merge: {n} / 3 spare · Sell · {price}');

h(2, 'Battle');
li('Floor {n} / Loud {n} / Boss {n} / Rehearsal {n} / Wave {n} / Solo · gig {n} / Solo · boss / {house rule} [stage pill]', 'Auto · 1x / 2x · Use · · · ·', 'Get ready · Enemy turn · Auto battle is on · Your ensemble · Tap to skip',
  'Basic move · Skill · Special · always ready · rests {n} turns after use · ready in {n} turns · needs the mic', 'Tap an enemy to use it, or press Use. · Press Use. · Not ready yet. Pick another move. · Only the pet with the mic can use this.',
  'That move is not ready yet. · It has to hit the one with Taunt. · Press and hold to see its stats and moves.', 'You win! · Your band is out');
li('First battles: Your turn! Tap the enemy to attack it. · Tap a round icon to pick another move. · Green arrow: your pet is strong against that enemy. · The yellow line shows whose turn is coming.');
li('Pop-ups: Critical! · Strong · Weak · Block · Dodged · Stunned · Shield · Sooner · Later · Back up! · Again! · Encore! · Hangs on! · Faster! · Changes! · Shrugs it off · Staggered! · Echo! · Chain! · Boom! · Lights out! · Hot potato! · Mic! · Key change! · The crowd is restless! · Restless!',
  '{Pet} is stunned and misses a turn');
li('Look at a fighter: Lv {n} · {hp} of {max} · **Shield.** Soaks the next {n} damage. · {pets} is/are strong against it. · It is strong against {pets}. · Close');
li('Boss entrance: Boss · floor {n} / Rehearsal / Encore · wave {n} / Solo tour · the last stop / Daily Gig · {rule} · {Boss} · {Region} · Tap to skip');
li('Menu: Leave battle · Leave this battle? Nothing is lost. · Leave this wave? Your run ends here. Rewards stay yours. · Leave this gig? Your tour ends here. Notes stay yours. · Leave the gig? Try again any time. · Leave / End the tour');

h(2, 'Results');
li('Floor cleared! / Boss beaten!', 'Level up · {n} [badge] · +{n} levels!', 'Next level', 'Replays pay no notes.', 'You found {item}', 'A boss is next. Check your band first.', 'Continue · Open the shell · To the boss · Next floor · Play again · Back · Next floor in {n} · Stop here', 'A record is ready',
  'Not this time · Nothing is lost. · Try again · Change the band', 'New on Home: {modes}');
li('Tips: Tip: {pet} can grow. · Tip: you have a shell to open. · Tip: there is equipment in your bag that nobody is wearing. · Tip: a rehearsal win pays an echo. · Tip: your pets could form an ensemble. · Tip: try a different band, or replay an earlier floor to level up. · Tip: replay an earlier floor to level up, then come back.');
li('Gifts: You found a shell! · A pet is inside. Open it in **Shells**. · You found equipment! · Each pet wears two pieces. Put them on from its page. · Show me');
li('Boss story: {Region} · floor {n} · Onwards · Boss reward / Finale reward · +{n} shell(s) · +{n} echo(es) · Legendary · Open the shell · Later');

h(3, 'Story after each boss');
for (const r of H.REGION_ORDER) li(kv(H.STORY[r][0], H.STORY[r][1]));

h(2, 'Rehearsal');
li('Opens after the boss on floor 10.', 'Beaten bosses return at **your level**.', 'All won this week · Resets tomorrow / in {n} days', 'Rehearsal done! · More rehearsals · Home · Rehearsals · Not this time · Nothing is lost.');

h(2, 'Daily Gig');
li('Tonight · {date} · {venue} · {region} · House rule · {rule} · On stage · Lv {n} · Admit one · Paid today · Won tonight [stamp]', 'Your band / Your first two pets · Retry as often as you like / New gig in {time} · Band',
  'Play the gig / Play it again', 'Gig won! / Another great show! · Encore! / Again! [stamp] · New gig in {time} / Paid already today', 'Lights out! / Not this time · The lights went out before the Din did. / Retry as often as you like.',
  'Home · Back to the poster · Try again · Change the band');
h(3, 'House rules');
for (const k of H.TWIST_ORDER) li(kv(H.TWISTS[k].n, H.TWISTS[k].d));
li(kv(H.FEEDBACK.n, H.FEEDBACK.d) + ' [No Basics]', 'Mirror {pet} · Giant {boss}');
h(3, 'Venues');
li(H.REGION_ORDER.map((r) => H.VENUES[r]).join(' · '));

h(2, 'Solo');
li('Solo Tour · One pet · five gigs · one boss', 'Today [pay row] · The first 5 gig wins and the first boss win each day pay. New pay in {time}. / All paid today. Tours still count for fun and experience.',
  'Pick your soloist · The road scales to your soloist. · Start the tour with {pet}', 'On tour · {region} · {n} of 5 gigs won · {n} boons · Back on the road · Give up the tour · Give up the tour? Notes stay yours. · Give up');
li('Header: {pet} · Lv {n} · Gig {n} of 5 / Boss next · No boons yet · Combo', 'Map: {Region} tour · ‹ Home · {Boss}\'s stage · Your tour starts here. Pick a road. / Pick the next stop. Tap one to see it. · Not on your road. Glowing stops are next.',
  'Tour card: Solo tour · {Region} · 5 gigs, then {boss}', 'Stops: Gig · Loud gig · Campfire · Jam session · Mystery · Boss · Start',
  'Stop preview: A small stage. · A rowdy crowd and tougher Din. · The last stop of the tour. · Sleep, or practise. · Play along for a boon. · Something is going on here. · On stage · Lv {n} · Win · Boon / Rare boon · Play this gig / Face the boss / Go there · Not yet',
  'The road [legend]: Two Din. Win for a boon. · Tougher Din. Win for a rare boon. · Heal 40%, or practise for +10% Power. · Pick a boon. · A choice, good or risky. · The end of the tour. · HP carries on from gig to gig. The crowd gets restless if a gig drags on: every hit lands harder. · Got it');
li('Boons: Gig won! / The crowd goes wild / Jam session / Dig through the crate · Pick a boon / Pick a rare boon · Common · Rare · Combo with {boon}: {effect} · Pick one / Take {boon} · Skip · Skip this boon? This stop gives no other.',
  'Boon list: Boons on this tour · Combos · Win gigs and jam to collect boons. They last the tour. · From the road: {+n% Power, +n% HP}',
  'Campfire · A quiet night on the road · Sleep · HP {a} → {b} · Practise · +10% Power for this tour · +{n} HP / +10% Power [after]', 'Mystery · You got · Onwards · {choice}: {effect}. [toast]',
  'After a gig: Gig won! / Loud gig won! · Encore! / Rowdy! [stamp] · HP {n}% · Pick a boon / Pick a rare boon', 'Battle: The crowd is restless: every hit lands harder each turn.',
  'End: Tour complete! / Tour over · {pet} beat all five gigs and the boss. / {n} of 5 gigs won. · And the boss dropped · Home · Another tour / Try another tour');
h(3, 'Boons');
for (const k of H.BOON_ORDER) li(kv(H.BOONS[k].n, H.BOONS[k].d) + (H.BOONS[k].r === 'r' ? ' (rare)' : ''));
h(3, 'Combos');
for (const c of H.COMBOS) li(`${H.BOONS[c[0]].n} + ${H.BOONS[c[1]].n}: ${c[2]}`);
h(3, 'Mysteries');
for (const k of H.EVENT_ORDER) { const e = H.EVENTS[k]; li(kv(e.n, e.d)); e.opts.forEach((o) => out.push('  - ' + kv(o.n, o.d))); }

h(2, 'Encore');
li('Encore [neon sign]', 'Endless waves, each a little tougher. HP carries over, and a quarter comes back after each wave.', 'This week · Wave {n} · Best this week {n} · all time {n} · resets tomorrow / in {n} days', '{n}% / Out',
  'Start Encore · Change the band · Play wave {n} · End this run · End this run? Rewards stay yours. · End run', 'Wave {n} cleared! · Weekly reward: wave {n} · Next reward: wave {n} / All rewards won this week · Wave {n} · Stop here',
  'Encore over · You cleared {n} waves. Best: {n}. · Back to Encore · Home');

h(2, 'Records');
li('Records · Home stage set · Current floor · Adventure · Rehearsal · Encore · Collection · {n} / {total} · Claim · Set: {name} · New stage set: {name} · Great', 'Win a rehearsal with each ensemble · Win a rehearsal with the {ensemble}.');
for (const r of H.RECORDS.filter((r) => !r.ens)) li(kv(r.n, r.d));
li('Stage sets: ' + Object.values(H.SETS).join(' · '));

h(2, 'Menu, help and saves');
li('Menu · How to play · Sound: on / off · Music · Effects · Save code · Close · Start over', 'Erase this game? · All {n} pets, your way to floor {n}, and every note, shell and echo are gone for good. A save code made first can bring them back. · Erase everything · Cancel',
  'Save code · Your game saves itself on this device. This code is a copy to keep, or to carry on elsewhere. · Copy my code · Copied. Keep it somewhere safe. · Select the text and copy it by hand. · Load a code · Paste a save code here · Load this code · That is not a Hushsong save code. · Load this save? · It holds {n} pets on floor {n}. It replaces the game on this device. · Load it',
  'A new version of Hushsong is ready. It starts next time you open the game. [Android]');
h(3, 'How to play');
li('Win floors to go further. Every 10th floor is a **boss**. Shells hold random pets.',
  'Pets and enemies act when their yellow bar fills. **Tap an enemy** to use the chosen move on it, tap a round icon to switch moves, and **press and hold** anyone to see their stats. While you aim, the blinking part of a health bar is what the move will take.',
  kv('Stats', 'HP: Damage it can take before it falls. · Power: How hard its moves hit, heal and shield. · Guard: Cuts the damage it takes. 50 Guard takes a third off. · Speed: How often it gets a turn. · Crit: Chance that a hit deals 50% more. Every pet starts at 5%.'),
  kv('Families', 'Each beats the next in the loop: 30% more damage dealt, 20% less taken.'), kv('Effects', 'The number on an effect is the turns it has left.'),
  kv('Echoes and stars', 'Pets evolve twice with echoes, then add stars: up to 10, each +3% HP and Power. A shell with a pet you have gives an echo only that pet can use. Plain echoes, shown at the top, fit any pet.'),
  kv('Notes and experience', 'New floors pay notes, which buy shells. Every battle gives experience, less on floors far below your level.'),
  kv('Ensembles', 'Three pets of three families, or all of one, form an ensemble: an opening tune and a boon for the band.'),
  kv('Rehearsal', 'Beaten bosses of floors 10 to 100 return at your level. Each pays an echo once a week, resetting on Monday.'),
  kv('Equipment', 'Each pet wears two pieces. Wins may drop more: the Adventure screen shows the chance. 3 spare pieces of a kind merge into the next rarity, up to Epic.'),
  kv('Daily Gig', 'From level 5: one battle a day with a house rule that changes how battles work, the same for everyone. The first win each day pays; retry freely.'),
  kv('Solo', 'From level 10: one pet tours a branching road of five gigs, stops and a boss. Boons last the tour, and some work together. The first wins each day pay.'),
  kv('Encore', 'From level 20: endless waves, each a little tougher. HP carries over and fallen pets sit out. Milestone waves pay once a week.'),
  kv('Records', 'Hard goals that pay shells, echoes and Home backdrops.'), 'Got it');

h(2, 'Families, roles, effects');
li(H.FAMILY_ORDER.map((f) => H.FAMILIES[f].n).join(' · ') + ' · Silence (enemies only)');
for (const k in H.ROLES) li(kv(H.ROLES[k].n, H.ROLES[k].d));
for (const k in H.STATUS) li(kv(H.STATUS[k].n, H.STATUS[k].d));
li(kv(H.SWELL.n, H.SWELL.d), kv(H.LOUD.n, H.LOUD.d));

h(2, 'Ensembles');
for (const e of H.ENSEMBLES) li(kv(e.n, e.d()));

h(2, 'Equipment');
li('Rarities: ' + H.RARITY_ORDER.map((r) => H.RARITY[r].n).join(' · '));
li('Kinds: ' + Object.values(H.ITEM_TYPES).map((t) => t.n).join(' · '));
li('Stat lines: +{n} Power · +{n} HP · +{n} Guard · +{n} Speed · +{n} critical hit chance · Ignores {n} of enemy Guard · Takes {n} less damage · Its heals are {n} stronger · +{n} experience for the band');
h(3, 'Legendaries');
for (const k in H.LEGENDS) li(kv(H.LEGENDS[k].n, H.LEGENDS[k].pd));

h(2, 'Regions and the Din');
li(H.REGION_ORDER.map((r) => H.REGIONS[r].n).join(' · '));
li('Din: ' + Object.keys(H.DIN).filter((k) => !H.DIN[k].boss).map((k) => H.DIN[k].n).join(' · '));
li('Bosses: ' + Object.keys(H.DIN).filter((k) => H.DIN[k].boss).map((k) => H.DIN[k].n).join(' · '));

h(2, 'Pets');
for (const sp of H.SPECIES_ORDER) li(kv(H.FORMS[sp].n, H.SPECIES[sp].lore));

h(2, 'Moves');
p('Move text is written by the game from each move\'s effects, so it always matches what the move does.');
const kn = { beat: 'Basic', phrase: 'Skill', finale: 'Special', passive: 'Always on' };
for (const sp of H.SPECIES_ORDER) {
  h(3, H.FORMS[sp].n);
  for (const id of Object.keys(H.FORMS).filter((k) => H.FORMS[k].sp === sp)) {
    const f = H.FORMS[id], kit = H.kitOf(id), own = ['beat', 'phrase', 'finale', 'passive'].filter((k) => f[k]);
    li(`**${f.n}** (${H.ROLES[kit.role].n}): ` + own.map((k) => `${kn[k]} *${f[k].n}*: ${k === 'passive' ? f[k].d : H.describe(f[k])}`).join(' · '));
  }
}
h(3, 'The Din\'s moves');
for (const k of Object.keys(H.DIN)) { const d = H.DIN[k]; li(`**${d.n}**: ` + ['beat', 'phrase', 'finale'].filter((x) => d[x]).map((x) => `*${d[x].n}*: ${H.describe(d[x])}`).concat(d.passive ? [`*${d.passive.n}*: ${d.passive.d}`] : []).join(' · ')); }

console.log(out.join('\n').trim());
