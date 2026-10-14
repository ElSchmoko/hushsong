/* Hushsong — game data: families, pets and their moves, enemies, stages. */
(function (H) {
  'use strict';

  H.FAMILIES = {
    drum:   { n: 'Drum',   beats: 'string', col: '#e8752a' },
    string: { n: 'String', beats: 'breath', col: '#3fae62' },
    breath: { n: 'Breath', beats: 'brass',  col: '#2f9bd8' },
    brass:  { n: 'Brass',  beats: 'voice',  col: '#d9a012' },
    voice:  { n: 'Voice',  beats: 'drum',   col: '#e0558c' },
    none:   { n: 'Silence', beats: null,    col: '#8a84a6' },
  };
  H.FAMILY_ORDER = ['drum', 'string', 'breath', 'brass', 'voice'];

  H.ROLES = {
    stray:   { n: 'Young',   d: 'Has not picked a role yet.',            hp: 1, vol: 1, poise: 0, tempo: 1 },
    rhythm:  { n: 'Tank',    d: 'Tough. Protects the band.',             hp: 1.2, vol: 0.85, poise: 10, tempo: 0.94 },
    lead:    { n: 'Attacker', d: 'Deals the most damage.',               hp: 0.9, vol: 1.12, poise: 0, tempo: 1.04 },
    harmony: { n: 'Healer',  d: 'Heals and strengthens the band.',       hp: 1.04, vol: 0.97, poise: 3, tempo: 1.0 },
    bass:    { n: 'Support', d: 'Slows and weakens enemies.',          hp: 1.1, vol: 1.0, poise: 5, tempo: 1.0 },
  };

  // Effects that sit on a unit for a few turns.
  H.STATUS = {
    pup:    { n: 'Power Up',   s: 'POWER UP',  buff: 1, d: 'Deals 25% more damage.' },
    pdown:  { n: 'Power Down', s: 'WEAKER',    buff: 0, d: 'Deals 25% less damage.' },
    sup:    { n: 'Speed Up',   s: 'FASTER',    buff: 1, d: 'Turns come 30% sooner.' },
    sdown:  { n: 'Slow',       s: 'SLOW',      buff: 0, d: 'Turns come 30% later.' },
    stun:   { n: 'Stun',       s: 'STUNNED',   buff: 0, d: 'Misses its next turn.' },
    poison: { n: 'Poison',     s: 'POISON',    buff: 0, d: 'Loses HP at the start of each turn, about 30% of the poisoner\'s Power. More Poison adds up, to 3 times that. Ignores Guard.' },
    regen:  { n: 'Regen',      s: 'REGEN',     buff: 1, d: 'Gains HP at the start of each turn.' },
    taunt:  { n: 'Taunt',      s: 'TAUNT',     buff: 1, d: 'Enemies must aim their single hits at it.' },
    dodge:  { n: 'Dodge',      s: 'DODGE',     buff: 1, d: 'The next hit misses.' },
    shield: { n: 'Shield',     s: 'SHIELD',    buff: 1, d: 'Soaks damage before HP does.' },
    lifesong: { n: 'Lifesong', s: 'LIFESONG',  buff: 1, d: 'Heals for 30% of the damage it deals.' },
    offkey: { n: 'Off-Key',    s: 'OFF-KEY',   buff: 0, d: 'Takes 25% more damage from hits.' },
  };

  const A = (n, cd, fx, o) => Object.assign({ n, cd, fx }, o || {});
  const D = (tgt, pow, o) => ['dmg', tgt, pow, o || {}];
  // what every Basic move turns into when a Daily Gig unplugs them
  H.FEEDBACK = A('Feedback', 0, [D('one', 1.3), ['recoil', 0.08]], { d: 'Hits one enemy for 130%. Costs the user 8% of its max HP.' });

  H.SPECIES = {
    thud:    { family: 'drum',   base: { hp: 150, vol: 20, poise: 30, tempo: 90 },  animal: 'drum', lore: 'A round drum with ears, feet and a mallet for a tail. Sturdy, and its heavy beat slows enemies down.' },
    clack:   { family: 'drum',   base: { hp: 112, vol: 26.5, poise: 26, tempo: 104 }, animal: 'tambourine', lore: 'A tambourine that scuttles sideways and snaps two castanets. Quick, snappy double hits.' },
    twang:   { family: 'string', base: { hp: 106, vol: 27.3, poise: 18, tempo: 110 }, animal: 'lyre', lore: 'A lyre with a cat\'s ears and tail. Its notes land hard, but it is easy to hurt.' },
    screech: { family: 'string', base: { hp: 98, vol: 25.4, poise: 16, tempo: 114 }, animal: 'fiddle', lore: 'A fiddle on thin legs that saws at itself with a bow. Fast, and its scraping poisons enemies.' },
    hum:     { family: 'breath', base: { hp: 118, vol: 21.5, poise: 22, tempo: 100 }, animal: 'ocarina', lore: 'An ocarina with wings and a beak. Whatever it plays, it heals its friends.' },
    squeak:  { family: 'breath', base: { hp: 112, vol: 21.2, poise: 24, tempo: 107 }, animal: 'squeezebox', lore: 'A squeezebox that crawls like a caterpillar. It heals itself as it bites.' },
    blare:   { family: 'brass',  base: { hp: 128, vol: 20.7, poise: 28, tempo: 93 },  animal: 'horn', lore: 'A long brass horn that slithers. Its blasts rouse the band to hit harder.' },
    clang:   { family: 'brass',  base: { hp: 166, vol: 19.7, poise: 36, tempo: 82 },  animal: 'bell', lore: 'A heavy bell with a head and feet poking out. Very tough, and its ringing shields its friends.' },
    yelp:    { family: 'voice',  base: { hp: 113, vol: 24.5, poise: 20, tempo: 102 }, animal: 'microphone', lore: 'A round microphone on springy frog legs. Its singing hits every enemy at once.' },
    howl:    { family: 'voice',  base: { hp: 133, vol: 24.9, poise: 22, tempo: 98 },  animal: 'megaphone', lore: 'A megaphone with a wolf\'s ears and tail. Its howl makes enemies weaker.' },
  };
  Object.assign(H.SPECIES, {
    bong:    { family: 'drum',   base: { hp: 145, vol: 24.9, poise: 26, tempo: 86 },  animal: 'gong', lore: 'A gong that carries its own frame around. Slow, but one good bong stuns.' },
    tock:    { family: 'drum',   base: { hp: 104, vol: 23.3, poise: 20, tempo: 108 }, animal: 'xylophone', lore: 'A xylophone that crawls like a caterpillar. Many small hits that keep getting stronger.' },
    jangle:  { family: 'string', base: { hp: 108, vol: 26.1, poise: 18, tempo: 112 }, animal: 'banjo', lore: 'A banjo with a very long neck. Fast, lucky, and fond of critical hits.' },
    plink:   { family: 'string', base: { hp: 125, vol: 23.9, poise: 24, tempo: 98 },  animal: 'piano', lore: 'A small piano that smiles with all its keys. Its chords splash onto every enemy.' },
    peep:    { family: 'breath', base: { hp: 112, vol: 24.7, poise: 16, tempo: 116 }, animal: 'pan pipes', lore: 'A chick with pan pipes for a crest. The fastest pet, and it hurries its friends along.' },
    skirl:   { family: 'breath', base: { hp: 140, vol: 22.8, poise: 24, tempo: 94 },  animal: 'bagpipe', lore: 'A bagpipe with a mind of its own. Its sour notes poison and weaken.' },
    oompah:  { family: 'brass',  base: { hp: 169, vol: 19.9, poise: 34, tempo: 80 },  animal: 'tuba', lore: 'A snail whose shell is a tuba. The toughest pet there is, and it shoves enemies down the queue.' },
    bop:     { family: 'brass',  base: { hp: 112, vol: 24.6, poise: 20, tempo: 104 }, animal: 'saxophone', lore: 'A saxophone that curls like a seahorse. Smooth and quick, it is back for another solo in no time.' },
    warble:  { family: 'voice',  base: { hp: 128, vol: 24.6, poise: 22, tempo: 100 }, animal: 'gramophone', lore: 'An old gramophone with bird feet. Its crackly songs wear every enemy down.' },
    chatter: { family: 'voice',  base: { hp: 119, vol: 25.5, poise: 20, tempo: 106 }, animal: 'radio', lore: 'A little radio that never stops talking. It muddles enemies and cheers the band on.' },
    tink:    { family: 'drum',   base: { hp: 116, vol: 21.8, poise: 22, tempo: 102 }, animal: 'music box', lore: 'A music box that waddles about on its wind-up key. Its tune mends bandmates, and teaches their hits to mend them too.' },
    wah:     { family: 'brass',  base: { hp: 122, vol: 22.6, poise: 24, tempo: 100 }, animal: 'trumpet mute', lore: 'A rubber trumpet mute on a wobbly handle. Its sour wah-wah knocks enemies off key, so every hit on them lands harder.' },
    thrum:   { family: 'string', base: { hp: 138, vol: 22.5, poise: 28, tempo: 92 }, animal: 'double bass', lore: 'A double bass that walks on its spike. Its low notes hold the line and slow everything around it down.' },
    doo:     { family: 'voice',  base: { hp: 128, vol: 22, poise: 24, tempo: 98 }, animal: 'songbook', lore: 'A little songbook whose pages sing in harmony. It shields the band with its covers and shakes off whatever is weighing them down.' },
    huff:    { family: 'breath', base: { hp: 108, vol: 24.4, poise: 18, tempo: 110 }, animal: 'harmonica', lore: 'A harmonica that huffs in and puffs out. It finishes off whatever is flagging, and blows away whatever is propping enemies up.' },
  });
  H.SPECIES_ORDER = ['thud', 'twang', 'hum', 'blare', 'yelp', 'clack', 'screech', 'squeak', 'clang', 'howl', 'bong', 'jangle', 'peep', 'oompah', 'warble', 'tock', 'plink', 'skirl', 'bop', 'chatter', 'tink', 'wah', 'thrum', 'doo', 'huff'];
  H.STARTERS = ['thud', 'twang', 'hum'];

  /* Every pet keeps one signature through both of its paths. Moves do what they say every time: no chances, at most two effects, short durations. */
  H.FORMS = {
    /* THUD: sturdy, and its heavy beat slows enemies */
    thud: { sp: 'thud', tier: 0, n: 'Thud',
      beat: A('Thump', 0, [D('one', 1.1)]),
      phrase: A('Belly Bump', 3, [D('one', 1.5, { st: [['sdown', 2]] })]) },
    stomp: { sp: 'thud', tier: 1, parent: 'thud', role: 'rhythm', n: 'Stomp',
      beat: A('Downbeat', 0, [D('one', 0.9), ['shield', 'self', 0.4]]),
      phrase: A('Hold the Line', 3, [['st', 'self', 'taunt', 2], ['shield', 'self', 0, { pct: 0.15 }]]),
      passive: { n: 'Hit Back', d: 'When hit, it hits the attacker back for 25%.', counter: { ch: 1, pow: 0.25 } } },
    march: { sp: 'thud', tier: 2, parent: 'stomp', n: 'March',
      finale: A('Forward March', 4, [['shield', 'allies', 0, { pct: 0.12 }], ['st', 'allies', 'sup', 2]]) },
    cadence: { sp: 'thud', tier: 2, parent: 'stomp', n: 'Cadence',
      finale: A('Drumline', 4, [D('all', 0.8, { st: [['sdown', 1]] })]) },
    patter: { sp: 'thud', tier: 1, parent: 'thud', role: 'lead', n: 'Patter',
      beat: A('Tap-Tap', 0, [D('one', 0.55, { h: 2 })]),
      phrase: A('Flurry', 3, [D('rand', 0.45, { h: 4, st: [['sdown', 1]] })]),
      passive: { n: 'Warm Up', d: 'Every hit it lands adds 3% Power for this battle (up to 30%).', ramp: { on: 'hit', per: 0.03, max: 0.3 } } },
    jig: { sp: 'thud', tier: 2, parent: 'patter', n: 'Jig',
      finale: A('Stamping Jig', 4, [D('all', 0.8, { st: [['sdown', 2]] }), ['shield', 'self', 0, { pct: 0.12 }]]) },
    roll: { sp: 'thud', tier: 2, parent: 'patter', n: 'Roll',
      finale: A('Drumroll', 5, [D('one', 0.38, { h: 6, inc: 0.12, st: [['sdown', 1]] })]) },

    /* CLACK: quick, snappy double hits */
    clack: { sp: 'clack', tier: 0, n: 'Clack',
      beat: A('Snip', 0, [D('one', 1.0)]),
      phrase: A('Clack-Clack', 3, [D('one', 0.8, { h: 2 })]) },
    click: { sp: 'clack', tier: 1, parent: 'clack', role: 'lead', n: 'Click',
      beat: A('Click-Click', 0, [D('one', 0.5, { h: 2 })]),
      phrase: A('Castanet Snap', 3, [D('one', 0.85, { h: 2, onKill: [['gauge', 'self', 1.0]] })]),
      passive: { n: 'On the Beat', d: '+20% critical hit chance.', mod: { crit: 0.2 } } },
    flamenco: { sp: 'clack', tier: 2, parent: 'click', n: 'Flamenco',
      finale: A('Zapateado', 4, [D('rand', 0.45, { h: 6 })]) },
    tango: { sp: 'clack', tier: 2, parent: 'click', n: 'Tango',
      finale: A('Take the Lead', 4, [D('one', 1.0, { h: 2, st: [['pdown', 1]] })]) },
    rattle: { sp: 'clack', tier: 1, parent: 'clack', role: 'bass', n: 'Rattle',
      beat: A('Shake', 0, [D('one', 0.4, { h: 2 })]),
      phrase: A('Rattle Nerves', 3, [D('all', 0.25, { h: 2, st: [['pdown', 1]] })]),
      passive: { n: 'Unsettle', d: 'Its hits push enemies that have a bad effect back in the turn order.', debuffPush: 0.1 } },
    rumba: { sp: 'clack', tier: 2, parent: 'rattle', n: 'Rumba',
      finale: A('Slow Burn', 4, [D('all', 0.35, { h: 2, st: [['poison', 1]] })]) },
    samba: { sp: 'clack', tier: 2, parent: 'rattle', n: 'Samba',
      finale: A('Carnival', 5, [D('rand', 0.35, { h: 4 }), ['st', 'allies', 'sup', 2]]) },

    /* TWANG: its notes land hard, but it is easy to hurt */
    twang: { sp: 'twang', tier: 0, n: 'Twang',
      beat: A('Twang', 0, [D('one', 1.1)]),
      phrase: A('Snapped String', 3, [D('one', 1.6)]) },
    pluck: { sp: 'twang', tier: 1, parent: 'twang', role: 'lead', n: 'Pluck',
      beat: A('Pick', 0, [D('one', 1.15)]),
      phrase: A('Pizzicato', 2, [D('one', 1.4, { fresh: 0.5 })]),
      passive: { n: 'Sharp Ear', d: 'Its hits ignore half of the enemy\'s Guard.', mod: { pierce: 0.5 } } },
    riff: { sp: 'twang', tier: 2, parent: 'pluck', n: 'Riff',
      finale: A('Power Riff', 4, [D('one', 1.6, { chain: 0.6 })]) },
    shred: { sp: 'twang', tier: 2, parent: 'pluck', n: 'Shred',
      finale: A('Shred', 4, [D('one', 1.9, { exec: 1.0, onKill: [['cdr', 'self', 9]] })]) },
    strum: { sp: 'twang', tier: 1, parent: 'twang', role: 'harmony', n: 'Strum',
      beat: A('Gentle Strum', 0, [D('one', 0.8), ['heal', 'ally', 0.4]]),
      phrase: A('Open Chord', 3, [['heal', 'allies', 0.9]], { need: 'hurt' }),
      passive: { n: 'Overflow', d: 'Healing above full HP turns into Shield.', overheal: 1 } },
    ballad: { sp: 'twang', tier: 2, parent: 'strum', n: 'Ballad',
      finale: A('Slow Verse', 4, [['cleanse', 'allies'], ['st', 'allies', 'regen', 2, { val: 0.25 }]]) },
    waltz: { sp: 'twang', tier: 2, parent: 'strum', n: 'Waltz',
      finale: A('One-Two-Three', 4, [D('one', 0.7, { h: 3 }), ['gauge', 'slow', 0.5]]) },

    /* SCREECH: fast, and its scraping poisons */
    screech: { sp: 'screech', tier: 0, n: 'Screech',
      beat: A('Scrape', 0, [D('one', 0.9, { st: [['poison', 1]] })]),
      phrase: A('Screech', 3, [D('all', 0.6)]) },
    saw: { sp: 'screech', tier: 1, parent: 'screech', role: 'lead', n: 'Saw',
      beat: A('Sawing', 0, [D('one', 0.8, { st: [['poison', 2]] })]),
      phrase: A('Double Stop', 3, [D('one', 0.8, { h: 2, st: [['poison', 2]] })]),
      passive: { n: 'Raw Nerve', d: 'Deals 30% more damage to poisoned enemies.', vs: { poison: 0.3 } } },
    reel: { sp: 'screech', tier: 2, parent: 'saw', n: 'Reel',
      finale: A('Whirling Reel', 4, [D('all', 0.45, { h: 2, st: [['poison', 1]] })]) },
    lament: { sp: 'screech', tier: 2, parent: 'saw', n: 'Lament',
      finale: A('Lament', 4, [D('all', 0.5), ['detonate', 'all']]) },
    quaver: { sp: 'screech', tier: 1, parent: 'screech', role: 'bass', n: 'Quaver',
      beat: A('Tremolo', 0, [D('one', 1.0, { st: [['poison', 2]] })]),
      phrase: A('Shiver', 4, [D('all', 0.4, { st: [['poison', 1], ['offkey', 1]] })]),
      passive: { n: 'Jitters', d: 'Every enemy starts the battle with Poison for 2 turns.', on: { start: [['st', 'all', 'poison', 2]] } } },
    nocturne: { sp: 'screech', tier: 2, parent: 'quaver', n: 'Nocturne',
      finale: A('Nightfall', 5, [D('all', 0.5, { st: [['poison', 2], ['pdown', 1]] })]) },
    caprice: { sp: 'screech', tier: 2, parent: 'quaver', n: 'Caprice',
      finale: A('Whim', 4, [['random', 2, [
        [D('rand', 1.1)], [['st', 'all', 'poison', 2]], [['heal', 'ally', 0.9]], [['st', 'allies', 'pup', 2]], [['st', 'all', 'pdown', 2]], [['shield', 'allies', 0.5]],
      ]]], { d: 'Two random things happen: a 110% hit, Poison on all enemies, a heal, Power Up for the band, Power Down for all enemies, or a Shield for the band.' }) },

    /* HUM: it heals its friends */
    hum: { sp: 'hum', tier: 0, n: 'Hum',
      beat: A('Puff', 0, [D('one', 1.0)]),
      phrase: A('Soft Hum', 3, [['heal', 'ally', 1.4]], { need: 'hurt' }) },
    drone: { sp: 'hum', tier: 1, parent: 'hum', role: 'bass', n: 'Drone',
      beat: A('Low Note', 0, [D('one', 0.8), ['heal', 'ally', 0.3]]),
      phrase: A('Undertone', 3, [D('all', 0.5, { st: [['sdown', 1]] })]),
      passive: { n: 'Drag', d: 'At the start of its turn, every enemy slips a little back in the turn order.', on: { turn: [['gauge', 'all', -0.06]] } } },
    dirge: { sp: 'hum', tier: 2, parent: 'drone', n: 'Dirge',
      finale: A('Dirge', 4, [D('all', 0.7, { st: [['poison', 2]] }), ['st', 'allies', 'regen', 2, { val: 0.3 }]]) },
    chorale: { sp: 'hum', tier: 2, parent: 'drone', n: 'Chorale',
      finale: A('Chorale', 4, [['shield', 'allies', 0.7], ['st', 'allies', 'regen', 2, { val: 0.3 }]]) },
    whistle: { sp: 'hum', tier: 1, parent: 'hum', role: 'harmony', n: 'Whistle',
      beat: A('Whistle', 0, [D('one', 0.6), ['heal', 'ally', 0.6]]),
      phrase: A('Bright Tune', 3, [['heal', 'allies', 0.8], ['cleanse', 'ally']], { need: 'hurt' }),
      passive: { n: 'Pick-me-up', d: 'Bandmates it heals get their next turn sooner.', healGauge: 0.1 } },
    carol: { sp: 'hum', tier: 2, parent: 'whistle', n: 'Carol',
      finale: A('Carol', 4, [['heal', 'allies', 1.1], ['st', 'allies', 'pup', 2]]) },
    lullaby: { sp: 'hum', tier: 2, parent: 'whistle', n: 'Lullaby',
      finale: A('Lullaby', 5, [['st', 'one', 'stun', 1], ['heal', 'allies', 0.6]]) },

    /* SQUEAK: it heals itself as it bites */
    squeak: { sp: 'squeak', tier: 0, n: 'Squeak',
      beat: A('Nip', 0, [D('one', 1.0)]),
      phrase: A('Squeeze', 3, [D('one', 1.2, { drain: 0.5 })]) },
    wheeze: { sp: 'squeak', tier: 1, parent: 'squeak', role: 'rhythm', n: 'Wheeze',
      beat: A('Bellows', 0, [D('one', 0.8, { drain: 0.4 })]),
      phrase: A('Deep Breath', 3, [['st', 'self', 'taunt', 2], ['st', 'self', 'regen', 2, { val: 0.6 }]]),
      passive: { n: 'Puff Up', d: 'Gains a small Shield at the start of every turn.', on: { turn: [['shield', 'self', 0, { pct: 0.06 }]] } } },
    polka: { sp: 'squeak', tier: 2, parent: 'wheeze', n: 'Polka',
      finale: A('Oom-Pah', 4, [D('one', 1.0, { h: 2, drain: 0.4 }), ['gauge', 'self', 0.3]]) },
    shanty: { sp: 'squeak', tier: 2, parent: 'wheeze', n: 'Shanty',
      finale: A('Heave-Ho', 4, [['st', 'allies', 'regen', 3, { val: 0.5 }], ['st', 'allies', 'pup', 2]]) },
    trill: { sp: 'squeak', tier: 1, parent: 'squeak', role: 'lead', n: 'Trill',
      beat: A('Trill', 0, [D('one', 0.38, { h: 3, drain: 0.2 })]),
      phrase: A('Grace Notes', 2, [D('rand', 0.7, { h: 2 }), ['gauge', 'self', 0.2]]),
      passive: { n: 'Da Capo', d: 'Every third turn, it takes another turn right away.', encore: 3 } },
    scherzo: { sp: 'squeak', tier: 2, parent: 'trill', n: 'Scherzo',
      finale: A('Prank', 4, [D('rand', 0.45, { h: 4, drain: 0.3, randSt: 1 })]) },
    cadenza: { sp: 'squeak', tier: 2, parent: 'trill', n: 'Cadenza',
      finale: A('Cadenza', 5, [D('one', 1.4, { drain: 0.4 }), ['gauge', 'self', 1.0]]) },

    /* BLARE: its blasts rouse the band to hit harder */
    blare: { sp: 'blare', tier: 0, n: 'Blare',
      beat: A('Honk', 0, [D('one', 1.0)]),
      phrase: A('Blast', 3, [D('one', 1.2), ['st', 'strong', 'pup', 2]]) },
    bellow: { sp: 'blare', tier: 1, parent: 'blare', role: 'rhythm', n: 'Bellow',
      beat: A('Rally', 0, [D('one', 0.9), ['st', 'strong', 'pup', 1]]),
      phrase: A('Brace', 3, [['st', 'self', 'taunt', 2], ['shield', 'allies', 0.6]]),
      passive: { n: 'Wall of Sound', d: 'While it is standing, its bandmates take 15% less damage.', aura: { taken: -0.15 } } },
    fanfare: { sp: 'blare', tier: 2, parent: 'bellow', n: 'Fanfare',
      finale: A('Fanfare', 4, [['st', 'allies', 'pup', 3], ['shield', 'allies', 0.6]]) },
    anthem: { sp: 'blare', tier: 2, parent: 'bellow', n: 'Anthem',
      finale: A('Anthem', 5, [['revive', 0.5], ['st', 'allies', 'pup', 3]]) },
    toot: { sp: 'blare', tier: 1, parent: 'blare', role: 'lead', n: 'Toot',
      beat: A('Toot', 0, [D('one', 1.0)]),
      phrase: A('Call', 3, [D('rand', 1.1, { h: 2, distinct: 1 }), ['st', 'self', 'pup', 2]]),
      passive: { n: 'Bright Brass', d: 'Always takes the first turn of a battle.', startGauge: 1 } },
    swing: { sp: 'blare', tier: 2, parent: 'toot', n: 'Swing',
      finale: A('Swing Out', 4, [D('rand', 0.75, { h: 4, inc: 0.15 })]) },
    reveille: { sp: 'blare', tier: 2, parent: 'toot', n: 'Reveille',
      finale: A('Reveille', 4, [D('all', 0.6), ['st', 'allies', 'pup', 2]]) },

    /* CLANG: very tough, and its ringing shields its friends */
    clang: { sp: 'clang', tier: 0, n: 'Clang',
      beat: A('Clang', 0, [D('one', 1.0)]),
      phrase: A('Ring', 3, [D('one', 1.1), ['shield', 'ally', 0.5]]) },
    toll: { sp: 'clang', tier: 1, parent: 'clang', role: 'rhythm', n: 'Toll',
      beat: A('Dong', 0, [D('one', 0.9), ['shield', 'self', 0.3]]),
      phrase: A('Curfew', 3, [['st', 'self', 'taunt', 2], ['st', 'all', 'pdown', 2]]),
      passive: { n: 'Ringing Shell', d: 'Enemies that hit it take 30% of that damage back.', thorns: 0.3 } },
    knell: { sp: 'clang', tier: 2, parent: 'toll', n: 'Knell',
      finale: A('Final Bell', 5, [D('one', 2.0, { exec: 1.0 }), ['shield', 'self', 0, { pct: 0.1 }]]) },
    peal: { sp: 'clang', tier: 2, parent: 'toll', n: 'Peal',
      finale: A('Full Peal', 4, [['shield', 'allies', 0, { pct: 0.12 }], ['st', 'all', 'pdown', 1]]) },
    jingle: { sp: 'clang', tier: 1, parent: 'clang', role: 'harmony', n: 'Jingle',
      beat: A('Jingle', 0, [D('one', 0.8), ['shield', 'ally', 0.4]]),
      phrase: A('Sleigh Bells', 3, [['heal', 'allies', 0.6], ['st', 'allies', 'pup', 2]]),
      passive: { n: 'Good Cheer', d: 'The whole band starts each battle with a Shield.', on: { start: [['shield', 'allies', 0, { pct: 0.1 }]] } } },
    carillon: { sp: 'clang', tier: 2, parent: 'jingle', n: 'Carillon',
      finale: A('Carillon', 4, [['shield', 'allies', 0.6], ['st', 'allies', 'regen', 3, { val: 0.5 }]]) },
    gamelan: { sp: 'clang', tier: 2, parent: 'jingle', n: 'Gamelan',
      finale: A('Gamelan', 4, [['shield', 'allies', 0.6], ['st', 'allies', 'lifesong', 2], ['follow', 1.0]]) },

    /* YELP: its singing hits every enemy at once */
    yelp: { sp: 'yelp', tier: 0, n: 'Yelp',
      beat: A('Yip', 0, [D('one', 1.0)]),
      phrase: A('Yowl', 3, [D('all', 0.5, { st: [['pdown', 1]] })]) },
    croon: { sp: 'yelp', tier: 1, parent: 'yelp', role: 'harmony', n: 'Croon',
      beat: A('Croon', 0, [D('all', 0.4)]),
      phrase: A('Sweet Nothing', 3, [['heal', 'allies', 0.8]], { need: 'hurt' }),
      passive: { n: 'Silver Tongue', d: 'Enemies that hit it get Power Down for 1 turn.', on: { hurt: [['st', 'attacker', 'pdown', 1]] } } },
    serenade: { sp: 'yelp', tier: 2, parent: 'croon', n: 'Serenade',
      finale: A('Serenade', 5, [['st', 'all', 'pdown', 2], ['heal', 'allies', 0.5], ['st', 'allies', 'lifesong', 2]]) },
    hymn: { sp: 'yelp', tier: 2, parent: 'croon', n: 'Hymn',
      finale: A('Hymn', 5, [['if', 'allyFallen', [['revive', 0.4]], [['heal', 'allies', 0.8], ['st', 'allies', 'regen', 2, { val: 0.3 }]]]],
        { need: 'hurtOrFallen', d: 'Brings a fallen bandmate back at 40% HP. If nobody has fallen, heals the band for 80% and gives Regen for 2 turns.' }) },
    shout: { sp: 'yelp', tier: 1, parent: 'yelp', role: 'lead', n: 'Shout',
      beat: A('Shout', 0, [D('one', 1.1)]),
      phrase: A('Belt It Out', 3, [D('all', 0.9, { shatter: 1, st: [['offkey', 1]] })]),
      passive: { n: 'Getting Louder', d: 'Gains 8% Power every turn (up to 40%).', ramp: { on: 'turn', per: 0.08, max: 0.4 } } },
    chant: { sp: 'yelp', tier: 2, parent: 'shout', n: 'Chant',
      finale: A('Call and Response', 4, [D('all', 0.7, { st: [['offkey', 2]] }), ['follow', 0.6]]) },
    aria: { sp: 'yelp', tier: 2, parent: 'shout', n: 'Aria',
      finale: A('High Note', 5, [D('one', 2.2, { chain: 0.3, shatter: 1, st: [['offkey', 2]] })]) },

    /* HOWL: its howl makes enemies weaker */
    howl: { sp: 'howl', tier: 0, n: 'Howl',
      beat: A('Bark', 0, [D('one', 1.0)]),
      phrase: A('Howl', 3, [D('all', 0.4, { st: [['pdown', 2]] })]) },
    growl: { sp: 'howl', tier: 1, parent: 'howl', role: 'bass', n: 'Growl',
      beat: A('Snarl', 0, [D('one', 0.85, { st: [['pdown', 1]] })]),
      phrase: A('Low Growl', 3, [D('one', 1.2, { st: [['pdown', 2]] })]),
      passive: { n: 'Blood in the Water', d: 'Heals itself for 25% of all the damage it deals.', leech: 0.25 } },
    blues: { sp: 'howl', tier: 2, parent: 'growl', n: 'Blues',
      finale: A('The Blues', 4, [D('all', 0.9, { st: [['pdown', 1]], drain: 0.5 }), ['st', 'allies', 'lifesong', 2]]) },
    grunge: { sp: 'howl', tier: 2, parent: 'growl', n: 'Grunge',
      finale: A('Distortion', 4, [D('one', 2.0), ['st', 'all', 'pdown', 2]]) },
    bay: { sp: 'howl', tier: 1, parent: 'howl', role: 'rhythm', n: 'Bay',
      beat: A('Guard Bark', 0, [D('one', 0.9), ['shield', 'ally', 0.3]]),
      phrase: A('Pack Call', 3, [['st', 'self', 'taunt', 2], ['st', 'all', 'pdown', 1]]),
      passive: { n: 'Pack Leader', d: 'When a bandmate is hit, it bites the attacker for 15%.', guard: { ch: 1, pow: 0.15 } } },
    round: { sp: 'howl', tier: 2, parent: 'bay', n: 'Round',
      finale: A('Sing in Rounds', 4, [['shield', 'allies', 0, { pct: 0.1 }], ['st', 'all', 'pdown', 2]]) },
    requiem: { sp: 'howl', tier: 2, parent: 'bay', n: 'Requiem',
      finale: A('Requiem', 5, [D('one', 2.8, { st: [['pdown', 2]] }), ['revive', 0.4]]) },
  };

  Object.assign(H.FORMS, {
    /* BONG: slow, but one good bong stuns */
    bong: { sp: 'bong', tier: 0, n: 'Bong',
      beat: A('Bonk', 0, [D('one', 1.05)]),
      phrase: A('Big Bong', 4, [D('one', 1.4, { st: [['stun', 1]] })]) },
    clash: { sp: 'bong', tier: 1, parent: 'bong', role: 'rhythm', n: 'Clash',
      beat: A('Strike', 0, [D('one', 0.9), ['shield', 'self', 0.4]]),
      phrase: A('Gong Wall', 5, [D('one', 1.0, { st: [['stun', 1]] }), ['st', 'self', 'taunt', 2]]),
      passive: { n: 'Heavy Frame', d: 'Takes 15% less damage.', mod: { taken: -0.15 } } },
    tamtam: { sp: 'bong', tier: 2, parent: 'clash', n: 'Tamtam',
      finale: A('Tam-Tam', 4, [D('one', 2.0, { shatter: 1 }), ['shield', 'self', 0, { pct: 0.12 }]]) },
    thunder: { sp: 'bong', tier: 2, parent: 'clash', n: 'Thunder',
      finale: A('Rolling Thunder', 4, [D('all', 0.8, { st: [['pdown', 1]] })]) },
    ripple: { sp: 'bong', tier: 1, parent: 'bong', role: 'bass', n: 'Ripple',
      beat: A('Reverb', 0, [D('one', 0.85, { st: [['pdown', 1]] })]),
      phrase: A('Ripple', 6, [D('all', 0.5), ['st', 'rand', 'stun', 1]]),
      passive: { n: 'Aftershock', d: 'At the start of its turn, a random enemy takes a small hit.', on: { turn: [D('rand', 0.25)] } } },
    shimmer: { sp: 'bong', tier: 2, parent: 'ripple', n: 'Shimmer',
      finale: A('Shimmer', 4, [['st', 'all', 'pdown', 2], ['shield', 'allies', 0.6]]) },
    quake: { sp: 'bong', tier: 2, parent: 'ripple', n: 'Quake',
      finale: A('Quake', 6, [D('all', 0.9, { st: [['stun', 1]] })]) },
    /* TOCK: many small hits that build up */
    tock: { sp: 'tock', tier: 0, n: 'Tock',
      beat: A('Tap', 0, [D('one', 0.5, { h: 2 })]),
      phrase: A('Scale', 3, [D('one', 0.4, { h: 4, inc: 0.15 })]) },
    marimba: { sp: 'tock', tier: 1, parent: 'tock', role: 'lead', n: 'Marimba',
      beat: A('Mallet Roll', 0, [D('one', 0.36, { h: 3 })]),
      phrase: A('Glissando', 3, [D('rand', 0.4, { h: 5, inc: 0.1, st: [['offkey', 1]] })]),
      passive: { n: 'Showy', d: '+10% critical hit chance, and its critical hits deal double damage.', mod: { crit: 0.1, critDmg: 0.5 } } },
    vibes: { sp: 'tock', tier: 2, parent: 'marimba', n: 'Vibes',
      finale: A('Vibrato', 4, [D('one', 0.5, { h: 5, crit: 0.2, st: [['offkey', 2]] })]) },
    kalimba: { sp: 'tock', tier: 2, parent: 'marimba', n: 'Kalimba',
      finale: A('Thumb Roll', 4, [D('rand', 0.4, { h: 6, inc: 0.1, st: [['offkey', 2]] })]) },
    chime: { sp: 'tock', tier: 1, parent: 'tock', role: 'harmony', n: 'Chime',
      beat: A('Ding', 0, [D('one', 0.3, { h: 2 }), ['shield', 'ally', 0.25]]),
      phrase: A('Wind Chimes', 3, [['shield', 'allies', 0.7], ['cleanse', 'ally']]),
      passive: { n: 'Clear Tone', d: 'At the start of its turn, the most hurt bandmate gains a small Shield.', on: { turn: [['shield', 'ally', 0, { pct: 0.04 }]] } } },
    celesta: { sp: 'tock', tier: 2, parent: 'chime', n: 'Celesta',
      finale: A('Starlight', 4, [D('rand', 0.3, { h: 4 }), ['shield', 'allies', 0, { pct: 0.14 }]]) },
    glock: { sp: 'tock', tier: 2, parent: 'chime', n: 'Glock',
      finale: A('Bell Tree', 5, [D('rand', 0.25, { h: 5, inc: 0.1 }), ['heal', 'allies', 0.6]]) },
    /* TINK: a music box. Heals, and gives Lifesong: the band heals itself with every hit it lands */
    tink: { sp: 'tink', tier: 0, n: 'Tink',
      beat: A('Ting', 0, [D('one', 0.95)]),
      phrase: A('Wind-Up', 3, [['heal', 'ally', 1.15], ['st', 'same', 'lifesong', 2]]) },
    carousel: { sp: 'tink', tier: 1, parent: 'tink', role: 'harmony', n: 'Carousel',
      beat: A('Twirl', 0, [D('one', 0.7), ['heal', 'ally', 0.35]]),
      phrase: A('Merry-Go-Round', 3, [['heal', 'allies', 0.55], ['st', 'allies', 'lifesong', 2]]),
      passive: { n: 'Keepsake', d: 'The whole band starts every battle with Lifesong for 2 turns.', on: { start: [['st', 'allies', 'lifesong', 2]] } } },
    gavotte: { sp: 'tink', tier: 2, parent: 'carousel', n: 'Gavotte',
      finale: A('Gavotte', 4, [['heal', 'allies', 0.7], ['st', 'allies', 'lifesong', 3], ['gauge', 'others', 0.2]]) },
    reverie: { sp: 'tink', tier: 2, parent: 'carousel', n: 'Reverie',
      finale: A('Daydream', 4, [['heal', 'ally', 1.8], ['shield', 'same', 0.6], ['st', 'same', 'lifesong', 3]]) },
    windup: { sp: 'tink', tier: 1, parent: 'tink', role: 'rhythm', n: 'Windup',
      beat: A('Crank', 0, [D('one', 1.0), ['shield', 'self', 0.4]]),
      phrase: A('Overwind', 3, [['st', 'self', 'taunt', 2], ['st', 'self', 'lifesong', 3], ['shield', 'self', 0.5]]),
      passive: { n: 'Mainspring', d: 'Heals 4% of its HP at the start of each turn.', on: { turn: [['heal', 'self', 0, { pct: 0.04 }]] } } },
    toccata: { sp: 'tink', tier: 2, parent: 'windup', n: 'Toccata',
      finale: A('Toccata', 4, [D('one', 0.6, { h: 4, inc: 0.1, drain: 0.5 })]) },
    ostinato: { sp: 'tink', tier: 2, parent: 'windup', n: 'Ostinato',
      finale: A('Ostinato', 4, [D('all', 0.5), ['shield', 'allies', 0.6], ['st', 'allies', 'lifesong', 2]]) },
    /* WAH: a trumpet mute. Puts enemies Off-Key, so every hit on them lands 25% harder */
    wah: { sp: 'wah', tier: 0, n: 'Wah',
      beat: A('Wah', 0, [D('one', 0.95)]),
      phrase: A('Bent Note', 3, [D('all', 0.5, { st: [['offkey', 2]] })]) },
    plunger: { sp: 'wah', tier: 1, parent: 'wah', role: 'bass', n: 'Plunger',
      beat: A('Doo-Wah', 0, [D('one', 0.9, { st: [['offkey', 1]] })]),
      phrase: A('Sour Chord', 3, [D('all', 0.35, { st: [['offkey', 2], ['sdown', 1]] })]),
      passive: { n: 'Wah Pedal', d: 'At the start of its turn, a random enemy goes Off-Key for 1 turn.', on: { turn: [['st', 'rand', 'offkey', 1]] } } },
    ska: { sp: 'wah', tier: 2, parent: 'plunger', n: 'Ska',
      finale: A('Skank', 4, [D('all', 0.4, { h: 2, st: [['offkey', 2]] }), ['gauge', 'others', 0.25]]) },
    dixie: { sp: 'wah', tier: 2, parent: 'plunger', n: 'Dixie',
      finale: A('Tailgate', 4, [D('all', 0.5), ['st', 'all', 'offkey', 3], ['st', 'all', 'pdown', 2]]) },
    cornet: { sp: 'wah', tier: 1, parent: 'wah', role: 'lead', n: 'Cornet',
      beat: A('Bugle Call', 0, [D('one', 1.1)]),
      phrase: A('Smear', 3, [D('one', 1.5, { st: [['offkey', 2]] })]),
      passive: { n: 'Bell Up', d: 'Deals 30% more damage to Off-Key enemies.', vs: { offkey: 0.3 } } },
    mariachi: { sp: 'wah', tier: 2, parent: 'cornet', n: 'Mariachi',
      finale: A('Grito', 4, [['st', 'all', 'offkey', 2], D('all', 1.0, { vs: { offkey: 0.5 } })]) },
    mambo: { sp: 'wah', tier: 2, parent: 'cornet', n: 'Mambo',
      finale: A('Mambo', 4, [D('one', 0.8, { h: 3, inc: 0.1, st: [['offkey', 2]] }), ['gauge', 'self', 0.3]]) },
    /* THRUM: a double bass. Slows, shields, and its bowed branch hunts bosses with Off-Key */
    thrum: { sp: 'thrum', tier: 0, n: 'Thrum',
      beat: A('Thrum', 0, [D('one', 0.95), ['shield', 'self', 0.2]]),
      phrase: A('Walking Line', 3, [D('all', 0.4, { st: [['sdown', 1]] }), ['shield', 'allies', 0.25]]) },
    upright: { sp: 'thrum', tier: 1, parent: 'thrum', role: 'rhythm', n: 'Upright',
      beat: A('Slap', 0, [D('one', 0.9), ['shield', 'self', 0.25]]),
      phrase: A('Low End', 3, [['st', 'self', 'taunt', 2], ['shield', 'allies', 0.5]]),
      passive: { n: 'Sympathetic Strings', d: 'Enemies that hit it are slowed for 1 turn.', on: { hurt: [['st', 'attacker', 'sdown', 1]] } } },
    slap: { sp: 'thrum', tier: 2, parent: 'upright', n: 'Slap',
      finale: A('Slap Back', 4, [D('all', 0.9, { push: 0.3 }), ['shield', 'self', 0, { pct: 0.15 }]]) },
    basso: { sp: 'thrum', tier: 2, parent: 'upright', n: 'Basso',
      finale: A('Basso Continuo', 4, [['shield', 'allies', 0.7], ['st', 'allies', 'regen', 3]]) },
    arco: { sp: 'thrum', tier: 1, parent: 'thrum', role: 'bass', n: 'Arco',
      beat: A('Bow', 0, [D('one', 0.95, { st: [['offkey', 1]] })]),
      phrase: A('Long Bow', 3, [D('one', 1.2, { st: [['offkey', 3], ['sdown', 2]] })]),
      passive: { n: 'Deep Resonance', d: 'Its Slow, Power Down and Off-Key last 1 turn longer.', mod: { statusDur: 1 } } },
    sostenuto: { sp: 'thrum', tier: 2, parent: 'arco', n: 'Sostenuto',
      finale: A('Sostenuto', 4, [D('all', 0.4), ['st', 'all', 'offkey', 2], ['st', 'all', 'sdown', 2]]) },
    fugue: { sp: 'thrum', tier: 2, parent: 'arco', n: 'Fugue',
      finale: A('Fugue', 4, [D('one', 1.4, { st: [['offkey', 2]] }), ['follow', 0.6]]) },
    /* DOO: a little choir. Shields and cleanses; its Tank shares Lifesong, its Healer keeps the band singing */
    doo: { sp: 'doo', tier: 0, n: 'Doo',
      beat: A('Doo', 0, [D('one', 1.0)]),
      phrase: A('Huddle', 3, [['shield', 'allies', 0.6], ['cleanse', 'ally']]) },
    chorus: { sp: 'doo', tier: 1, parent: 'doo', role: 'rhythm', n: 'Chorus',
      beat: A('Ooh', 0, [D('one', 0.9), ['shield', 'self', 0.4]]),
      phrase: A('Close Harmony', 3, [['st', 'self', 'taunt', 2], ['st', 'allies', 'lifesong', 2]]),
      passive: { n: 'Safety in Numbers', d: 'While it is standing, its bandmates get +10 Guard.', aura: { poise: 10 } } },
    cantata: { sp: 'doo', tier: 2, parent: 'chorus', n: 'Cantata',
      finale: A('Cantata', 4, [['heal', 'allies', 0.6], ['shield', 'allies', 0.4], ['st', 'allies', 'lifesong', 2]]) },
    madrigal: { sp: 'doo', tier: 2, parent: 'chorus', n: 'Madrigal',
      finale: A('Madrigal', 4, [D('all', 0.8), ['st', 'all', 'pdown', 2], ['shield', 'self', 0, { pct: 0.15 }]]) },
    doowop: { sp: 'doo', tier: 1, parent: 'doo', role: 'harmony', n: 'Doowop',
      beat: A('Shoo-Bop', 0, [D('one', 0.7), ['heal', 'ally', 0.45]]),
      phrase: A('Backing Vocals', 3, [['heal', 'allies', 0.7], ['cleanse', 'allies']]),
      passive: { n: 'Keep Singing', d: 'When a bandmate falls, the rest of the band heals 20% of their HP.', on: { allyFall: [['heal', 'allies', 0, { pct: 0.2 }]] } } },
    gospel: { sp: 'doo', tier: 2, parent: 'doowop', n: 'Gospel',
      finale: A('Gospel', 4, [['heal', 'allies', 0.9], ['st', 'allies', 'pup', 2], ['cleanse', 'allies']]) },
    plainsong: { sp: 'doo', tier: 2, parent: 'doowop', n: 'Plainsong',
      finale: A('Plainsong', 4, [['heal', 'allies', 0.6], ['st', 'allies', 'regen', 3], ['st', 'all', 'sdown', 1]]) },
    /* HUFF: a harmonica. Finishes off hurt enemies, and blows away what props them up */
    huff: { sp: 'huff', tier: 0, n: 'Huff',
      beat: A('Huff', 0, [D('one', 1.0)]),
      phrase: A('Draw Bend', 3, [D('one', 1.35, { exec: 0.6 })]) },
    busker: { sp: 'huff', tier: 1, parent: 'huff', role: 'lead', n: 'Busker',
      beat: A('Riff Off', 0, [D('one', 1.05, { exec: 0.3 })]),
      phrase: A('Pass the Hat', 3, [D('one', 1.5, { exec: 0.8, onKill: [['gauge', 'self', 1.0]] })]),
      passive: { n: 'Tip Jar', d: 'Each enemy it defeats heals the band for 10% of their HP.', on: { kill: [['heal', 'allies', 0, { pct: 0.1 }]] } } },
    delta: { sp: 'huff', tier: 2, parent: 'busker', n: 'Delta',
      finale: A('Crossroads', 4, [D('one', 2.2, { exec: 1.0 })]) },
    juke: { sp: 'huff', tier: 2, parent: 'busker', n: 'Juke',
      finale: A('Juke Joint', 4, [D('rand', 0.5, { h: 5, exec: 0.5 })]) },
    chromatic: { sp: 'huff', tier: 1, parent: 'huff', role: 'bass', n: 'Chromatic',
      beat: A('Slide', 0, [D('one', 0.95), ['dispel', 'same']]),
      phrase: A('Chromatic Run', 3, [D('all', 0.45, { st: [['sdown', 1]] }), ['gauge', 'all', -0.2]]),
      passive: { n: 'Gust', d: 'At the start of its turn, a random enemy loses its good effects and Shield.', on: { turn: [['dispel', 'rand']] } } },
    mistral: { sp: 'huff', tier: 2, parent: 'chromatic', n: 'Mistral',
      finale: A('Mistral', 4, [['dispel', 'all'], D('all', 0.8, { st: [['sdown', 1]] })]) },
    sirocco: { sp: 'huff', tier: 2, parent: 'chromatic', n: 'Sirocco',
      finale: A('Sirocco', 4, [['dispel', 'all'], D('all', 0.6, { st: [['poison', 2]] })]) },
    /* JANGLE: fast, lucky, fond of critical hits */
    jangle: { sp: 'jangle', tier: 0, n: 'Jangle',
      beat: A('Twiddle', 0, [D('one', 1.0, { crit: 0.1 })]),
      phrase: A('Hoedown', 3, [D('one', 0.7, { h: 2, crit: 0.2 })]) },
    bluegrass: { sp: 'jangle', tier: 1, parent: 'jangle', role: 'lead', n: 'Bluegrass',
      beat: A('Hot Lick', 0, [D('one', 1.05, { crit: 0.15 })]),
      phrase: A('Breakdown', 3, [D('one', 1.4, { again: 0.35 })]),
      passive: { n: 'Opening Number', d: 'Its first hit in every battle deals triple damage.', firstStrike: 2 } },
    picker: { sp: 'jangle', tier: 2, parent: 'bluegrass', n: 'Picker',
      finale: A('Fast Fingers', 4, [D('one', 0.55, { h: 4, crit: 0.25 })]) },
    duel: { sp: 'jangle', tier: 2, parent: 'bluegrass', n: 'Duel',
      finale: A('Showdown', 4, [D('one', 1.8, { crit: 0.25, onKill: [['gauge', 'self', 1.0]] })]) },
    folk: { sp: 'jangle', tier: 1, parent: 'jangle', role: 'harmony', n: 'Folk',
      beat: A('Strum Along', 0, [D('one', 0.7), ['st', 'strong', 'pup', 1]]),
      phrase: A('Campfire', 3, [['heal', 'allies', 0.7], ['st', 'allies', 'regen', 2, { val: 0.3 }]], { need: 'hurt' }),
      passive: { n: 'Lucky Charm', d: 'Its bandmates get +10% critical hit chance.', aura: { crit: 0.1 } } },
    jamboree: { sp: 'jangle', tier: 2, parent: 'folk', n: 'Jamboree',
      finale: A('Jamboree', 4, [['st', 'allies', 'pup', 2], ['st', 'allies', 'lifesong', 2], ['gauge', 'others', 0.3]]) },
    lonesome: { sp: 'jangle', tier: 2, parent: 'folk', n: 'Lonesome',
      finale: A('High Lonesome', 5, [['heal', 'allies', 0.8], ['st', 'all', 'pdown', 1]]) },
    /* PLINK: its chords splash onto every enemy */
    plink: { sp: 'plink', tier: 0, n: 'Plink',
      beat: A('Key Tap', 0, [D('one', 1.0)]),
      phrase: A('Chord', 3, [D('one', 1.1, { chain: 0.5 })]) },
    ragtime: { sp: 'plink', tier: 1, parent: 'plink', role: 'lead', n: 'Ragtime',
      beat: A('Left-Right', 0, [D('one', 0.75, { chain: 0.4 })]),
      phrase: A('Rag', 3, [D('rand', 0.6, { h: 3 })]),
      passive: { n: 'Offbeat', d: 'Every hit it takes brings its next turn sooner.', on: { hurt: [['gauge', 'self', 0.1]] } } },
    boogie: { sp: 'plink', tier: 2, parent: 'ragtime', n: 'Boogie',
      finale: A('Boogie-Woogie', 4, [D('rand', 0.5, { h: 5, inc: 0.12 })]) },
    stride: { sp: 'plink', tier: 2, parent: 'ragtime', n: 'Stride',
      finale: A('Big Stride', 4, [D('one', 1.2, { h: 2, chain: 0.4 })]) },
    sonata: { sp: 'plink', tier: 1, parent: 'plink', role: 'rhythm', n: 'Sonata',
      beat: A('Low C', 0, [D('one', 0.85), ['shield', 'self', 0.4]]),
      phrase: A('Fortissimo', 3, [D('all', 0.45), ['st', 'self', 'taunt', 2]]),
      passive: { n: 'Last Movement', d: 'Below half HP it deals 30% more damage and takes 30% less.', lowHp: { below: 0.5, vol: 0.3, taken: 0.3 } } },
    concerto: { sp: 'plink', tier: 2, parent: 'sonata', n: 'Concerto',
      finale: A('Grand Finale', 5, [['shield', 'allies', 0, { pct: 0.12 }], D('all', 0.55)]) },
    minuet: { sp: 'plink', tier: 2, parent: 'sonata', n: 'Minuet',
      finale: A('Minuet', 4, [['heal', 'self', 0, { pct: 0.25 }], D('all', 0.5)]) },
    /* PEEP: the fastest pet, and it hurries its friends along */
    peep: { sp: 'peep', tier: 0, n: 'Peep',
      beat: A('Peck', 0, [D('one', 0.95)]),
      phrase: A('Tailwind', 3, [D('one', 0.7), ['gauge', 'others', 0.25]]) },
    piper: { sp: 'peep', tier: 1, parent: 'peep', role: 'harmony', n: 'Piper',
      beat: A('Tootle', 0, [D('one', 0.6), ['gauge', 'slow', 0.12]]),
      phrase: A('March Tune', 3, [['st', 'allies', 'sup', 2], ['heal', 'allies', 0.7]]),
      passive: { n: 'Lead the Way', d: 'At the start of its turn, the slowest bandmate moves up in the turn order.', on: { turn: [['gauge', 'slow', 0.1]] } } },
    pied: { sp: 'peep', tier: 2, parent: 'piper', n: 'Pied',
      finale: A('Follow Me', 4, [['heal', 'allies', 0.8], ['gauge', 'others', 1.0]], { d: 'Heals the whole band for 80%. Both bandmates take their turns right away.' }) },
    syrinx: { sp: 'peep', tier: 2, parent: 'piper', n: 'Syrinx',
      finale: A('Windsong', 5, [['st', 'allies', 'dodge', 2, { val: 1 }], ['gauge', 'others', 0.2]], { d: 'Everyone dodges the next hit. Its bandmates get their next turn sooner.' }) },
    fife: { sp: 'peep', tier: 1, parent: 'peep', role: 'lead', n: 'Fife',
      beat: A('Shrill', 0, [D('one', 1.0), ['gauge', 'slow', 0.12]]),
      phrase: A('Piercing Note', 2, [D('one', 1.3, { shatter: 1 })]),
      passive: { n: 'Finisher', d: 'Deals 50% more damage to enemies below half HP.', execute: { below: 0.5, bonus: 0.5 } } },
    piccolo: { sp: 'peep', tier: 2, parent: 'fife', n: 'Piccolo',
      finale: A('High C', 4, [D('one', 2.4), ['gauge', 'others', 0.25]]) },
    zephyr: { sp: 'peep', tier: 2, parent: 'fife', n: 'Zephyr',
      finale: A('Zephyr', 4, [D('all', 0.95), ['gauge', 'self', 1.0]], { d: 'Hits all enemies for 95%, then takes another turn right away.' }) },
    /* SKIRL: its sour notes poison and weaken */
    skirl: { sp: 'skirl', tier: 0, n: 'Skirl',
      beat: A('Squawk', 0, [D('one', 0.9, { st: [['poison', 1]] })]),
      phrase: A('Skirl', 3, [D('all', 0.45, { st: [['pdown', 1]] })]) },
    highland: { sp: 'skirl', tier: 1, parent: 'skirl', role: 'bass', n: 'Highland',
      beat: A('Reedy Note', 0, [D('one', 0.8, { st: [['poison', 2]] })]),
      phrase: A('Wail', 3, [D('all', 0.5, { st: [['poison', 3]] })]),
      passive: { n: 'Sour Note', d: 'Enemies that hit it are poisoned for 1 turn.', on: { hurt: [['st', 'attacker', 'poison', 1]] } } },
    pibroch: { sp: 'skirl', tier: 2, parent: 'highland', n: 'Pibroch',
      finale: A('Pibroch', 4, [D('all', 0.95, { vs: { poison: 0.6 } })]) },
    tattoo: { sp: 'skirl', tier: 2, parent: 'highland', n: 'Tattoo',
      finale: A('Tattoo', 5, [['st', 'all', 'poison', 3], ['st', 'all', 'pdown', 2]]) },
    bellows: { sp: 'skirl', tier: 1, parent: 'skirl', role: 'rhythm', n: 'Bellows',
      beat: A('Big Breath', 0, [D('one', 0.8, { st: [['poison', 2]] })]),
      phrase: A('Bag of Wind', 3, [['st', 'self', 'taunt', 2], ['shield', 'self', 0, { pct: 0.15 }]]),
      passive: { n: 'Full of Air', d: 'Once per battle, a hit that would knock it out leaves it on 1 HP instead.', lastStand: 1 } },
    clan: { sp: 'skirl', tier: 2, parent: 'bellows', n: 'Clan',
      finale: A('Gathering', 4, [['shield', 'allies', 0, { pct: 0.12 }], ['st', 'all', 'poison', 3]]) },
    keening: { sp: 'skirl', tier: 2, parent: 'bellows', n: 'Keening',
      finale: A('Keening', 5, [D('all', 0.7, { st: [['pdown', 2]] })]) },
    /* OOMPAH: the toughest pet there is, and it shoves enemies down the queue */
    oompah: { sp: 'oompah', tier: 0, n: 'Oompah',
      beat: A('Oom', 0, [D('one', 1.0)]),
      phrase: A('Pah!', 4, [D('one', 1.4, { push: 0.5 })]) },
    sousa: { sp: 'oompah', tier: 1, parent: 'oompah', role: 'rhythm', n: 'Sousa',
      beat: A('Low Blow', 0, [D('one', 0.9, { push: 0.3 }), ['shield', 'self', 0.4]]),
      phrase: A('Brass Wall', 3, [['st', 'self', 'taunt', 2], ['shield', 'allies', 0.5]]),
      passive: { n: 'Last One Standing', d: 'When a bandmate falls, it heals 30% of its HP and gains Power Up for 3 turns.', on: { allyFall: [['heal', 'self', 0, { pct: 0.3 }], ['st', 'self', 'pup', 3]] } } },
    helicon: { sp: 'oompah', tier: 2, parent: 'sousa', n: 'Helicon',
      finale: A('Dig In', 4, [['shield', 'self', 0, { pct: 0.25 }], ['st', 'self', 'regen', 3], ['gauge', 'all', -0.6]]) },
    bombard: { sp: 'oompah', tier: 2, parent: 'sousa', n: 'Bombard',
      finale: A('Bombardon', 4, [D('all', 0.8, { push: 0.5 })]) },
    baritone: { sp: 'oompah', tier: 1, parent: 'oompah', role: 'bass', n: 'Baritone',
      beat: A('Blat', 0, [D('one', 1.0, { push: 0.3 })]),
      phrase: A('Bass Drop', 3, [D('one', 0.9), ['gauge', 'all', -0.4]]),
      passive: { n: 'Heavy Air', d: 'Every enemy starts the battle further back in the turn order.', on: { start: [['gauge', 'all', -0.4]] } } },
    subsonic: { sp: 'oompah', tier: 2, parent: 'baritone', n: 'Subsonic',
      finale: A('Subsonic', 5, [D('all', 1.1, { push: 0.6 })]) },
    tubby: { sp: 'oompah', tier: 2, parent: 'baritone', n: 'Tubby',
      finale: A('Belly Laugh', 4, [['heal', 'allies', 0.8], ['gauge', 'all', -0.6]]) },
    /* BOP: smooth and quick, back for another solo in no time */
    bop: { sp: 'bop', tier: 0, n: 'Bop',
      beat: A('Doot', 0, [D('one', 1.0)]),
      phrase: A('Smooth Run', 3, [D('one', 1.3), ['gauge', 'self', 0.3]]) },
    bebop: { sp: 'bop', tier: 1, parent: 'bop', role: 'lead', n: 'Bebop',
      beat: A('Bip-Bap', 0, [D('one', 0.55, { h: 2 })]),
      phrase: A('Solo', 3, [['st', 'self', 'pup', 2], D('one', 1.3)]),
      passive: { n: 'Riding High', d: 'When it knocks out an enemy, it takes another turn right away.', on: { kill: [['gauge', 'self', 1.0]] } } },
    hardbop: { sp: 'bop', tier: 2, parent: 'bebop', n: 'Hardbop',
      finale: A('Sheets of Sound', 4, [D('one', 0.45, { h: 5, inc: 0.15 }), ['gauge', 'self', 0.3]]) },
    cool: { sp: 'bop', tier: 2, parent: 'bebop', n: 'Cool',
      finale: A('Take Five', 4, [D('one', 1.8, { ifSelf: { pup: 0.5 } }), ['gauge', 'self', 0.5]]) },
    smooth: { sp: 'bop', tier: 1, parent: 'bop', role: 'harmony', n: 'Smooth',
      beat: A('Mellow', 0, [D('one', 0.65), ['heal', 'ally', 0.5]]),
      phrase: A('Slow Jam', 3, [['heal', 'allies', 0.7], ['gauge', 'self', 0.3]], { need: 'hurt' }),
      passive: { n: 'Easy Listening', d: 'Its heals are 20% stronger.', mod: { heal: 0.2 } } },
    soul: { sp: 'bop', tier: 2, parent: 'smooth', n: 'Soul',
      finale: A('Soul', 4, [['heal', 'allies', 0.85], ['gauge', 'others', 0.2]]) },
    lounge: { sp: 'bop', tier: 2, parent: 'smooth', n: 'Lounge',
      finale: A('Nightcap', 5, [['heal', 'allies', 0.5], ['gauge', 'self', 1.0]]) },
    /* WARBLE: its crackly songs wear every enemy down */
    warble: { sp: 'warble', tier: 0, n: 'Warble',
      beat: A('Chirrup', 0, [D('one', 0.95)]),
      phrase: A('Old Record', 3, [D('all', 0.5), ['st', 'allies', 'regen', 2, { val: 0.25 }]]) },
    shellac: { sp: 'warble', tier: 1, parent: 'warble', role: 'bass', n: 'Shellac',
      beat: A('Scratch', 0, [D('all', 0.42, { st: [['pdown', 1]] })]),
      phrase: A('Skip', 3, [D('one', 0.9, { push: 0.2 })]),
      passive: { n: 'Scratched Record', d: 'It cannot be slowed or stunned.', immune: ['sdown', 'stun'] } },
    vinyl: { sp: 'warble', tier: 2, parent: 'shellac', n: 'Vinyl',
      finale: A('Warp', 4, [D('all', 0.85, { st: [['offkey', 2], ['pdown', 1]] })]) },
    jukebox: { sp: 'warble', tier: 2, parent: 'shellac', n: 'Jukebox',
      finale: A('Crowd Pleaser', 4, [D('all', 0.6), ['st', 'allies', 'pup', 3]]) },
    diva: { sp: 'warble', tier: 1, parent: 'warble', role: 'lead', n: 'Diva',
      beat: A('Top Note', 0, [D('one', 1.1)]),
      phrase: A('Vibrato Run', 3, [D('all', 0.6, { crit: 0.15 })]),
      passive: { n: 'Spotlight', d: 'Its single hits also splash onto every other enemy for 30%.', splash: 0.3 } },
    opera: { sp: 'warble', tier: 2, parent: 'diva', n: 'Opera',
      finale: A('Glass Breaker', 4, [D('all', 1.15, { shatter: 1 })]) },
    cabaret: { sp: 'warble', tier: 2, parent: 'diva', n: 'Cabaret',
      finale: A('Showstopper', 5, [['st', 'all', 'pdown', 2], D('one', 2.0)]) },
    /* CHATTER: it muddles enemies and cheers the band on */
    chatter: { sp: 'chatter', tier: 0, n: 'Chatter',
      beat: A('Blip', 0, [D('one', 0.95)]),
      phrase: A('Breaking News', 3, [D('one', 1.0, { st: [['pdown', 1], ['sdown', 1]] })]) },
    shortwave: { sp: 'chatter', tier: 1, parent: 'chatter', role: 'bass', n: 'Shortwave',
      beat: A('Fuzz', 0, [D('one', 0.8, { randSt: 1 })]),
      phrase: A('Jam Signal', 3, [D('all', 0.4, { st: [['pdown', 1], ['sdown', 1]] })]),
      passive: { n: 'Bad Reception', d: 'At the start of its turn, a random enemy is slowed for 1 turn.', on: { turn: [['st', 'rand', 'sdown', 1]] } } },
    longwave: { sp: 'chatter', tier: 2, parent: 'shortwave', n: 'Longwave',
      finale: A('Dead Air', 5, [['dispel', 'all'], ['st', 'all', 'pdown', 2]]) },
    pirate: { sp: 'chatter', tier: 2, parent: 'shortwave', n: 'Pirate',
      finale: A('Pirate Radio', 4, [D('all', 0.65, { randSt: 2 })]) },
    deejay: { sp: 'chatter', tier: 1, parent: 'chatter', role: 'harmony', n: 'Deejay',
      beat: A('Shout-out', 0, [D('one', 0.6), ['st', 'strong', 'pup', 1]]),
      phrase: A('Top Forty', 3, [['heal', 'allies', 0.7], ['st', 'allies', 'sup', 2]], { need: 'hurt' }),
      passive: { n: 'Hype', d: 'The band starts every battle with Power Up.', on: { start: [['st', 'allies', 'pup', 2]] } } },
    mixtape: { sp: 'chatter', tier: 2, parent: 'deejay', n: 'Mixtape',
      finale: A('Mixtape', 4, [['heal', 'allies', 0.6], ['st', 'allies', 'lifesong', 2], ['follow', 0.8]]) },
    broadcast: { sp: 'chatter', tier: 2, parent: 'deejay', n: 'Broadcast',
      finale: A('Broadcast', 5, [['heal', 'allies', 0.5], ['st', 'allies', 'pup', 3], ['st', 'allies', 'regen', 3, { val: 0.3 }]]) },
  });

  H.TIER_MUL = [1, 1.08, 1.16];
  // Evolving costs echoes: the pet's own (a shell that holds a pet you already have gives 1) and plain echoes, which fit any pet.
  H.ECHO_COST = [0, 3, 6];
  H.ECHO_DUP = 1;
  H.SHELL_PRICE = 150;
  H.RANK_COST = 3; H.RANK_MAX = 10; H.RANK_STEP = 0.03;
  H.rankCost = () => H.RANK_COST;   // every star costs the same

  /* ---------- equipment ---------- */
  // Selling pays what the piece is worth in merges: three of a kind make one of the next rarity.
  H.RARITY = {
    c: { n: 'Common', k: 1, sell: 5, col: '#9aa3b5' }, r: { n: 'Rare', k: 1.6, sell: 15, col: '#3f9be0' },
    e: { n: 'Epic', k: 2.4, sell: 45, col: '#a35ce0' }, l: { n: 'Legendary', k: 2.8, sell: 135, col: '#ffb020' },
  };
  H.RARITY_ORDER = ['c', 'r', 'e', 'l'];
  // stats: [what it changes, amount at Common, flat?]. Words for each stat are in STAT_TEXT.
  H.ITEM_TYPES = {
    sticks: { n: 'Drumsticks', stats: [['vol', 0.05]] },
    mallet: { n: 'Felt Mallet', stats: [['hp', 0.07]] },
    mute: { n: 'Mute', stats: [['poise', 4, 1]] },
    metro: { n: 'Metronome', stats: [['tempo', 0.035]] },
    fork: { n: 'Tuning Fork', stats: [['crit', 0.04]] },
    plectrum: { n: 'Plectrum', stats: [['vol', 0.03], ['crit', 0.025]] },
    strap: { n: 'Shoulder Strap', stats: [['hp', 0.045], ['poise', 2, 1]] },
    oil: { n: 'Valve Oil', stats: [['tempo', 0.02], ['vol', 0.03]] },
    stylus: { n: 'Stylus', stats: [['pierce', 0.08]] },
    plugs: { n: 'Earplugs', stats: [['taken', -0.04]] },
    reed: { n: 'Reed', stats: [['heal', 0.1]] },
    sheet: { n: 'Sheet Music', stats: [['xp', 0.05]] },
  };
  const ST = { vol: '+{v} Power', hp: '+{v} HP', poise: '+{v} Guard', tempo: '+{v} Speed', crit: '+{v} critical hit chance', pierce: 'Ignores {v} of enemy Guard', taken: 'Takes {v} less damage', heal: 'Its heals are {v} stronger', xp: '+{v} experience for the band' };
  H.STAT_TEXT = {}; for (const k in ST) H.STAT_TEXT[k] = (v) => H.T(ST[k], { v });
  // Legendary pieces: one of each in the whole game, each with an effect of its own. They are found, never merged.
  H.LEGENDS = {
    baton: { n: 'Golden Baton', type: 'sticks', pd: 'Gains 5% Power every turn (up to 30%).', p: { ramp: { on: 'turn', per: 0.05, max: 0.3 } } },
    needle: { n: 'Diamond Sticks', type: 'sticks', pd: 'Its critical hits deal 2.5 times the damage instead of 1.5.', p: { mod: { critDmg: 1 } } },
    first: { n: 'First Chair', type: 'metro', pd: 'Always takes the first turn of a battle.', p: { startGauge: 1 } },
    grand: { n: 'Grand Metronome', type: 'metro', pd: 'Every fifth turn it takes, it acts again right away.', p: { encore: 5 } },
    trap: { n: 'Tempo Trap', type: 'metro', pd: 'Hitting an enemy that has a bad effect pushes its turn back.', p: { debuffPush: 0.2 } },
    echo: { n: 'Reverb Chamber', type: 'mallet', pd: 'Gains a small Shield at the start of every turn.', p: { on: { turn: [['shield', 'self', 0, { pct: 0.04 }]] } } },
    vinyl: { n: 'Old Vinyl', type: 'mallet', pd: 'The whole band starts each battle with a small Shield.', p: { on: { start: [['shield', 'allies', 0, { pct: 0.06 }]] } } },
    phoenix: { n: 'Phoenix Mallet', type: 'mallet', pd: 'When a bandmate falls, it heals the band for 20% of their HP.', p: { on: { allyFall: [['heal', 'allies', 0, { pct: 0.2 }]] } } },
    pitch: { n: 'Perfect Pitch', type: 'fork', pd: 'A critical hit moves its next turn halfway closer.', p: { critGauge: 0.5 } },
    ring: { n: 'Ringing Fork', type: 'fork', pd: 'Its hits on one enemy also hit the others for 40%.', p: { splash: 0.4 } },
    feedback: { n: 'Feedback Loop', type: 'mute', pd: 'When hit, 30% chance to hit the attacker back for 60%.', p: { counter: { ch: 0.3, pow: 0.6 } } },
    curtain: { n: 'Velvet Curtain', type: 'mute', pd: 'While it is standing, its bandmates take 15% less damage.', p: { aura: { taken: -0.15 } } },
    lucky: { n: 'Lucky Plectrum', type: 'plectrum', pd: 'Its first hit in every battle deals double damage.', p: { firstStrike: 1 } },
    chord: { n: 'Last Chord', type: 'plectrum', pd: 'Below 40% HP, it has 40% more Power.', p: { lowHp: { below: 0.4, vol: 0.4 } } },
    rose: { n: 'Encore Rose', type: 'strap', pd: '+15% HP. Once per battle, a hit that would knock it out leaves it on 1 HP.', p: { lastStand: 1, mod: { hp: 0.15 } } },
    case: { n: 'Iron Case', type: 'strap', pd: 'Cannot be stunned or slowed.', p: { immune: ['stun', 'sdown'] } },
    quick: { n: 'Quicksilver', type: 'oil', pd: 'Every hit it takes brings its next turn sooner.', p: { on: { hurt: [['gauge', 'self', 0.06]] } } },
    pedal: { n: 'Crescendo Pedal', type: 'oil', pd: 'Gains 5% Power with every hit it lands (up to 30%).', p: { ramp: { on: 'hit', per: 0.05, max: 0.3 } } },
    laser: { n: 'Laser Stylus', type: 'stylus', pd: 'Deals 50% more damage to enemies below half HP.', p: { execute: { below: 0.5, bonus: 0.5 } } },
    venom: { n: 'Venom Stylus', type: 'stylus', pd: 'Deals 50% more damage for each bad effect on its target.', p: { vs: { sdown: 0.5, pdown: 0.5, poison: 0.5 } } },
    hush: { n: 'Spiked Plugs', type: 'plugs', pd: 'Enemies that hit it take 40% of that damage back.', p: { thorns: 0.4 } },
    gate: { n: 'Noise Gate', type: 'plugs', pd: 'Starts each battle with a Shield of 25% of its HP.', p: { on: { start: [['shield', 'self', 0, { pct: 0.25 }]] } } },
    golden: { n: 'Golden Reed', type: 'reed', pd: 'At the start of its turn, heals the most hurt bandmate for 3% of their HP. Healing above full HP turns into Shield.', p: { overheal: 1, on: { turn: [['heal', 'ally', 0, { pct: 0.03 }]] } } },
    siren: { n: 'Siren Reed', type: 'reed', pd: 'Heals itself for 20% of the damage it deals.', p: { leech: 0.2 } },
    score: { n: 'Lost Score', type: 'sheet', pd: '+15% Power. When it knocks out an enemy, it takes another turn right away.', p: { mod: { vol: 0.15 }, on: { kill: [['gauge', 'self', 1]] } } },
    opus: { n: 'Magnum Opus', type: 'sheet', pd: 'The band starts each battle with Power Up for 3 turns.', p: { on: { start: [['st', 'allies', 'pup', 3]] } } },
  };
  H.itemName = (it) => (it.leg ? H.LEGENDS[it.leg].n : H.ITEM_TYPES[it.type].n);
  H.itemMods = (it) => { const k = H.RARITY[it.rar].k, m = {}; for (const [st, v, flat] of H.ITEM_TYPES[it.type].stats) m[st] = flat ? Math.round(v * k) : Math.round(v * k * 1000) / 1000; return m; };
  H.itemStatText = (it) => { const m = H.itemMods(it); return H.T.list(H.ITEM_TYPES[it.type].stats.map(([st, , flat]) => H.STAT_TEXT[st](flat ? Math.abs(m[st]) : Math.round(Math.abs(m[st]) * 100) + '%'))); };
  H.itemStat = (it) => ({ text: H.itemStatText(it) });
  H.itemText = (it) => H.T('{stats}.', { stats: H.itemStatText(it) }) + (it.leg ? H.T.sep() + H.LEGENDS[it.leg].pd : '');
  H.itemPerk = (it) => { const leg = it.leg ? H.LEGENDS[it.leg].p : {}; return Object.assign({}, leg, { n: H.itemName(it), d: H.itemText(it), mod: Object.assign(H.itemMods(it), leg.mod || {}) }); };
  H.MAX_LEVEL = 99999;
  H.xpNeed = (L) => 24 + 16 * (L - 1);

  H.childrenOf = (formId) => Object.keys(H.FORMS).filter((k) => H.FORMS[k].parent === formId);
  H.formChain = (formId) => { const c = []; let f = formId; while (f) { c.unshift(f); f = H.FORMS[f].parent; } return c; };
  H.kitOf = (formId) => {
    const kit = { beat: null, phrase: null, finale: null, passive: null, role: 'stray' };
    for (const id of H.formChain(formId)) { const f = H.FORMS[id]; if (f.beat) kit.beat = f.beat; if (f.phrase) kit.phrase = f.phrase; if (f.finale) kit.finale = f.finale; if (f.passive) kit.passive = f.passive; if (f.role) kit.role = f.role; }
    return kit;
  };

  /* ---------- enemies ---------- */
  H.DIN = {
    racket: { n: 'Racket', family: 'drum', base: { hp: 80, vol: 17, poise: 14, tempo: 95 },
      beat: A('Bash', 0, [D('one', 1.0)]), phrase: A('Crash', 3, [D('all', 0.55)]) },
    whine: { n: 'Whine', family: 'string', base: { hp: 58, vol: 19, poise: 8, tempo: 114 },
      beat: A('Needle', 0, [D('one', 0.9)]), phrase: A('Shrill', 3, [D('one', 1.3, { st: [['pdown', 2]] })]) },
    hiss: { n: 'Hiss', family: 'breath', base: { hp: 68, vol: 16, poise: 10, tempo: 101 },
      beat: A('Spit', 0, [D('one', 0.8, { st: [['poison', 2, 0.35]] })]), phrase: A('Scald', 4, [D('all', 0.4, { st: [['poison', 2]] })]) },
    clank: { n: 'Clank', family: 'brass', base: { hp: 104, vol: 14, poise: 34, tempo: 84 },
      beat: A('Clonk', 0, [D('one', 1.0)]), phrase: A('Rust Guard', 3, [['st', 'self', 'taunt', 2], ['shield', 'self', 0, { pct: 0.15 }]]) },
    gibber: { n: 'Gibber', family: 'voice', base: { hp: 72, vol: 15, poise: 12, tempo: 98 },
      beat: A('Babble', 0, [D('rand', 0.9)]),
      phrase: A('Jeer', 3, [['if', 'allyHurt', [['heal', 'ally', 1.4]], [D('one', 0.6, { st: [['pdown', 2]] })]]],
        { d: 'Heals its most hurt friend for 140%. If none is hurt, hits one enemy for 60% and weakens it.' }) },

    muffle: { n: 'Muffle', family: 'breath', boss: 1, base: { hp: 350, vol: 19, poise: 22, tempo: 88 },
      beat: A('Smother', 0, [D('one', 1.0, { st: [['pdown', 1, 0.5]] })]),
      phrase: A('Blanket', 3, [D('all', 0.6, { st: [['sdown', 2]] })]),
      finale: A('Soak', 5, [['shield', 'self', 0, { pct: 0.1 }], ['st', 'self', 'regen', 3, { val: 0.5 }]]) },
    shush: { n: 'Shush', family: 'voice', boss: 1, base: { hp: 400, vol: 20, poise: 24, tempo: 100 },
      beat: A('Shh', 0, [D('one', 1.0)]),
      phrase: A('Finger to Lips', 3, [D('one', 0.8, { st: [['stun', 1]] })]),
      finale: A('Silence!', 5, [D('all', 0.9), ['dispel', 'all']]) },
    static: { n: 'Static', family: 'string', boss: 1, base: { hp: 340, vol: 19, poise: 20, tempo: 106 },
      beat: A('Crackle', 0, [D('rand', 0.6, { h: 2 })]),
      phrase: A('White Noise', 3, [D('all', 0.4, { st: [['poison', 2]] })]),
      finale: A('Interference', 5, [D('all', 0.5), ['gauge', 'all', -0.15]]) },
    tacet: { n: 'Tacet', family: 'none', boss: 1, base: { hp: 430, vol: 20, poise: 26, tempo: 96 },
      beat: A('Erase', 0, [D('one', 1.2)]),
      phrase: A('Grand Pause', 4, [D('all', 0.5, { st: [['stun', 1, 0.5]] })]),
      finale: A('Fermata', 5, [['shield', 'self', 0, { pct: 0.12 }], ['st', 'self', 'pup', 3]]),
      passive: { n: 'Shifting Key', d: 'Changes family every 2 turns. Speeds up when below 40% HP.', shift: 2, enrage: 0.4 } },
  };
  Object.assign(H.DIN, {
    swarm: { n: 'Swarm', family: 'string', boss: 1, base: { hp: 300, vol: 18, poise: 18, tempo: 108 },
      beat: A('Sting', 0, [D('rand', 0.33, { h: 3 })]),
      phrase: A('Buzz Cloud', 3, [D('all', 0.4, { st: [['poison', 2]] })]),
      finale: A('Scatter', 5, [['st', 'self', 'dodge', 3, { val: 2 }], ['st', 'self', 'sup', 2]], { d: 'Dodges the next 2 hits and speeds up for 2 turns.' }) },
    honk: { n: 'Honk', family: 'brass', boss: 1, base: { hp: 350, vol: 18, poise: 26, tempo: 94 },
      beat: A('Beep', 0, [D('one', 1.0, { push: 0.15 })]),
      phrase: A('Traffic Jam', 3, [D('all', 0.5, { st: [['sdown', 2]] })]),
      finale: A('Road Rage', 5, [['st', 'self', 'pup', 2], D('all', 0.5)]) },
    rumble: { n: 'Rumble', family: 'drum', boss: 1, base: { hp: 480, vol: 20, poise: 30, tempo: 84 },
      beat: A('Boulder', 0, [D('one', 1.15)]),
      phrase: A('Cave-in', 4, [D('all', 0.6, { st: [['stun', 1, 0.25]] })]),
      finale: A('Bedrock', 5, [['shield', 'self', 0, { pct: 0.14 }], ['st', 'self', 'regen', 3, { val: 0.4 }]]) },
    gale: { n: 'Gale', family: 'breath', boss: 1, base: { hp: 400, vol: 20, poise: 20, tempo: 106 },
      beat: A('Gust', 0, [D('one', 0.9, { push: 0.2 })]),
      phrase: A('Sandstorm', 3, [D('all', 0.5, { st: [['pdown', 2]] })]),
      finale: A('Eye of the Storm', 5, [['gauge', 'all', -0.15], ['st', 'self', 'sup', 3]]) },
    foghorn: { n: 'Foghorn', family: 'brass', boss: 1, base: { hp: 420, vol: 20, poise: 26, tempo: 90 },
      beat: A('Blast', 0, [D('one', 1.1)]),
      phrase: A('Fog Bank', 3, [D('all', 0.4, { st: [['pdown', 2], ['sdown', 2, 0.5]] })]),
      finale: A('Long Blast', 5, [D('all', 0.95)]) },
    alarm: { n: 'Alarm', family: 'voice', boss: 1, base: { hp: 390, vol: 20, poise: 22, tempo: 102 },
      beat: A('Tick Tock', 0, [D('rand', 0.55, { h: 2 })]),
      phrase: A('Snooze', 3, [D('one', 0.8, { st: [['stun', 1]] })]),
      finale: A('Wake Up!', 5, [D('all', 0.75), ['gauge', 'self', 0.5]], { d: 'Hits all enemies for 75%, then gets its next turn sooner.' }) },
  });
  Object.assign(H.DIN, {
    buzz: { n: 'Buzz', family: 'string', base: { hp: 54, vol: 18, poise: 8, tempo: 118 },
      beat: A('Zip', 0, [D('one', 0.5, { h: 2 })]), phrase: A('Dive', 3, [D('one', 1.0), ['st', 'self', 'dodge', 2, { val: 1 }]], { d: 'Hits one enemy for 100% and dodges the next hit.' }) },
    clatter: { n: 'Clatter', family: 'drum', base: { hp: 74, vol: 17, poise: 14, tempo: 100 },
      beat: A('Rattle', 0, [D('rand', 0.5, { h: 2 })]), phrase: A('Spill', 3, [D('all', 0.5)]) },
    drip: { n: 'Drip', family: 'breath', base: { hp: 70, vol: 16, poise: 12, tempo: 92 },
      beat: A('Plip', 0, [D('one', 0.9, { st: [['sdown', 2, 0.4]] })]), phrase: A('Puddle', 4, [D('all', 0.3, { st: [['sdown', 2]] })]) },
    rustle: { n: 'Rustle', family: 'breath', base: { hp: 60, vol: 18, poise: 10, tempo: 108 },
      beat: A('Flap', 0, [D('one', 0.95, { push: 0.1 })]), phrase: A('Whirl', 3, [['st', 'self', 'dodge', 2, { val: 1 }], ['st', 'self', 'sup', 2]], { d: 'Dodges the next hit and speeds up for 2 turns.' }) },
    creak: { n: 'Creak', family: 'brass', base: { hp: 96, vol: 16, poise: 22, tempo: 84 },
      beat: A('Groan', 0, [D('one', 1.0, { st: [['pdown', 2, 0.4]] })]), phrase: A('Brace', 4, [['st', 'self', 'taunt', 2], ['shield', 'self', 0, { pct: 0.15 }]]) },
    tick: { n: 'Tick', family: 'voice', base: { hp: 62, vol: 18, poise: 12, tempo: 104 },
      beat: A('Tick', 0, [D('one', 0.9)]), phrase: A('Wind Up', 3, [['st', 'self', 'sup', 3], ['st', 'self', 'pup', 2]]) },
  });
  // one more for each of the ten regions
  Object.assign(H.DIN, {
    croak: { n: 'Croak', family: 'voice', base: { hp: 78, vol: 17, poise: 14, tempo: 92 },
      beat: A('Ribbit', 0, [D('one', 0.9)]), phrase: A('Belch', 3, [D('one', 1.2, { push: 0.15 })]) },
    bash: { n: 'Bash', family: 'drum', base: { hp: 84, vol: 17, poise: 20, tempo: 80 },
      beat: A('Pound', 0, [D('one', 1.1)]), phrase: A('Anvil Drop', 4, [D('one', 1.5, { st: [['stun', 1, 0.3]] })]) },
    peck: { n: 'Peck', family: 'drum', base: { hp: 56, vol: 18, poise: 8, tempo: 114 },
      beat: A('Tap Tap', 0, [D('one', 0.34, { h: 3 })]), phrase: A('Drill', 3, [D('one', 1.2, { shatter: 1 })]) },
    crackle: { n: 'Crackle', family: 'string', base: { hp: 60, vol: 19, poise: 8, tempo: 110 },
      beat: A('Zap', 0, [D('rand', 0.9)]), phrase: A('Arc', 3, [D('one', 1.0, { chain: 0.5 })]) },
    beep: { n: 'Beep', family: 'brass', base: { hp: 70, vol: 17, poise: 18, tempo: 104 },
      beat: A('Toot', 0, [D('one', 0.9, { push: 0.1 })]), phrase: A('Tailgate', 3, [['st', 'self', 'sup', 2], D('one', 1.0)]) },
    squeal: { n: 'Squeal', family: 'voice', base: { hp: 58, vol: 18, poise: 8, tempo: 112 },
      beat: A('Screech', 0, [D('one', 0.9, { st: [['pdown', 2, 0.4]] })]), phrase: A('Swoop', 3, [D('one', 1.1, { drain: 0.5 })]) },
    whoosh: { n: 'Whoosh', family: 'breath', base: { hp: 66, vol: 17, poise: 10, tempo: 106 },
      beat: A('Grit', 0, [D('rand', 0.5, { h: 2 })]), phrase: A('Blow Back', 4, [D('all', 0.4), ['gauge', 'all', -0.12]]) },
    squawk: { n: 'Squawk', family: 'voice', base: { hp: 68, vol: 18, poise: 12, tempo: 102 },
      beat: A('Nip', 0, [D('one', 1.0)]), phrase: A('Uproar', 3, [D('all', 0.45, { st: [['pdown', 2, 0.5]] })]) },
    cuckoo: { n: 'Cuckoo', family: 'breath', base: { hp: 64, vol: 18, poise: 12, tempo: 100 },
      beat: A('Cuckoo', 0, [D('one', 0.95)]), phrase: A('Pop Out', 3, [D('one', 1.3), ['st', 'self', 'dodge', 2, { val: 1 }]], { d: 'Hits one enemy for 130% and dodges the next hit.' }) },
    ringtone: { n: 'Ringtone', family: 'string', base: { hp: 62, vol: 18, poise: 10, tempo: 108 },
      beat: A('Ring', 0, [D('one', 0.9)]), phrase: A('Ring Ring Ring', 3, [D('rand', 0.5, { h: 3, st: [['offkey', 2, 0.4]] })]) },
  });
  H.SWELL = { n: 'Getting Louder', d: 'A boss grows 2% stronger every turn it takes.', ramp: { on: 'turn', per: 0.02, max: 0.5 } };
  H.LOUD = { n: 'Loud', d: 'A bigger, tougher enemy. Every fifth floor has one.', mod: { hp: 0.5, vol: 0.15 } };

  // Enemies gain 10% per level like pets do, times a slow extra curve that stands in for everything else a team gains over time
  // (a third pet, evolving, stars, equipment), so that floor 2000 pushes back about as hard as floor 20. Tuned by simulation: [enemy level, HP multiplier].
  H.DIN_CURVE = [[1, 1], [5, 1.35], [9, 1.52], [18, 2.05], [45, 2.4], [89, 3.3], [177, 4.05], [440, 5.2]];
  H.BOSS_K = [0.8, 1.0]; H.PLAIN_K = [1.08, 1.04];
  // the first two adventure bosses are a little softer (HP and Power); rehearsals use the full boss
  H.EARLY_BOSS_K = { 10: 0.9, 20: 0.88 };
  // From floor 21 the band has evolved pets, so enemies get tougher (HP and Power), bosses more so.
  // The extra grows over `ramp` floors and then holds: +8% for every enemy, +15% for bosses.
  H.LATE_K = { from: 20, ramp: 3, plain: 0.08, boss: 0.15 };
  // Floors 21-40 get an extra push on top: that is where first evolutions make the band jump in power.
  // It comes in with the ramp above and fades out again over floors 41-50.
  H.MID_K = { to: 40, fade: 10, plain: 0.1, boss: 0.1 };
  // the finale boss on every 100th floor is already the toughest wall, so it keeps its strength
  H.lateK = (n, boss) => {
    const L = H.LATE_K, M = H.MID_K, t = Math.max(0, Math.min(1, (n - L.from) / L.ramp)), m = t * Math.max(0, Math.min(1, 1 - (n - M.to) / M.fade));
    return boss && n % 100 === 0 ? 1 : 1 + t * (boss ? L.boss : L.plain) + m * (boss ? M.boss : M.plain);
  };
  H.dinMult = (L) => { const C = H.DIN_CURVE, x = Math.log(L); let i = 0; while (i < C.length - 2 && L > C[i + 1][0]) i++; const x0 = Math.log(C[i][0]), x1 = Math.log(C[i + 1][0]); return Math.max(1, C[i][1] + ((C[i + 1][1] - C[i][1]) * (x - x0)) / (x1 - x0)); };
  H.dinScale = (L) => { const lin = 1 + 0.10 * (L - 1), m = H.dinMult(L); return { hp: lin * m, vol: lin * (1 + (m - 1) * 0.45) }; };
  H.petScale = (L, tier) => (1 + 0.10 * (L - 1)) * H.TIER_MUL[tier];

  /* ---------- stages ---------- */
  // Ten regions, ten floors each; after floor 100 they come round again. `prog` picks the music.
  H.REGIONS = {
    fen:     { n: 'Reed Marsh',     din: ['racket', 'hiss', 'gibber', 'croak'], boss: 'muffle', adds: ['hiss', 'croak'], prog: 'fen' },
    works:   { n: 'Bell Foundry',   din: ['racket', 'clank', 'whine', 'bash'], boss: 'shush', adds: ['whine', 'bash'], prog: 'works' },
    orchard: { n: 'Buzzing Orchard', din: ['buzz', 'whine', 'gibber', 'peck'], boss: 'swarm', adds: ['buzz', 'peck'], prog: 'fen' },
    ridge:   { n: 'Snowy Ridge',    din: ['hiss', 'rustle', 'crackle', 'clank'], boss: 'static', adds: ['crackle', 'gibber'], prog: 'ridge' },
    road:    { n: 'Rattle Road',    din: ['clatter', 'racket', 'beep', 'bash'], boss: 'honk', adds: ['clatter', 'beep'], prog: 'works' },
    caves:   { n: 'Drip Caves',     din: ['drip', 'gibber', 'squeal', 'croak'], boss: 'rumble', adds: ['drip', 'squeal'], prog: 'ridge' },
    dunes:   { n: 'Windy Dunes',    din: ['rustle', 'whine', 'whoosh', 'crackle'], boss: 'gale', adds: ['rustle', 'whoosh'], prog: 'fen' },
    harbor:  { n: 'Tin Harbor',     din: ['creak', 'clatter', 'squawk', 'beep'], boss: 'foghorn', adds: ['creak', 'squawk'], prog: 'works' },
    tower:   { n: 'Ticking Tower',  din: ['tick', 'clank', 'cuckoo', 'peck'], boss: 'alarm', adds: ['tick', 'cuckoo'], prog: 'hall' },
    hall:    { n: 'Concert Hall',   din: ['ringtone', 'tick', 'squawk', 'gibber', 'creak', 'cuckoo', 'squeal'], boss: 'tacet', adds: ['ringtone', 'clank'], prog: 'hall' },
  };
  H.REGION_ORDER = ['fen', 'works', 'orchard', 'ridge', 'road', 'caves', 'dunes', 'harbor', 'tower', 'hall'];
  // What changes once a region's boss is gone: the story, one screen per boss, up to floor 100.
  H.STORY = {
    fen: ['The marsh can hear itself', 'Muffle sat on every sound here. With it gone, the reeds rustle again and the frogs are trying out a tune.'],
    works: ['The bells ring again', 'Shush kept the foundry silent for years. This morning the first bell rang, and nobody told it to stop.'],
    orchard: ['A hum, not a buzz', 'The Swarm has scattered. The bees are back at work, and their hum has a melody in it now.'],
    ridge: ['The crackle is gone', 'Without Static the mountain air is clear. You can hear the snow fall, and someone far off is yodelling.'],
    road: ['Halfway there', 'Honk has run out of horn. A busker has set up at the crossroads. Half the world sings now. The other half is still noise.'],
    caves: ['The caves sing back', 'Rumble is rubble. Sing one note into the dark now and the caves give you a whole chord in return.'],
    dunes: ['The wind learned to whistle', 'Gale blew itself out. What is left of it drifts over the dunes, whistling something almost like a song.'],
    harbor: ['Shanties on the pier', 'Foghorn has gone quiet at last. The sailors are back on the pier, and they brought every verse they know.'],
    tower: ['Time to breathe', 'Alarm has rung for the last time. One place is still silent: the Concert Hall, where the Din\'s conductor waits.'],
    hall: ['The music is back', 'Tacet\'s baton is broken and the hall is full. The Din will keep creeping in from the edges, so the floors go on. But the world has a song to answer with now.'],
  };
  H.songCount = (S) => Math.min(10, Math.floor((S.stage - 1) / 10));
  H.STAGE_SLOPE = 0.44;
  H.stageLevel = (n) => 1 + Math.round((n - 1) * H.STAGE_SLOPE);
  // Shells: one for the very first floor (a welcome gift), then one from every boss, the first time it falls.
  H.shellsFor = (n) => (n === 1 || n % 10 === 0 ? 1 : 0);
  H.isShellStage = (n) => H.shellsFor(n) > 0;
  H.NOTES = 14;   // per new floor, the same on every floor; a Loud enemy pays 1.5x and a boss 3x. Replays pay none.
  H.ENEMY_COUNT = [1, 2, 2, 2, 2, 2, 2, 2, 2];   // the first ten floors are for a team of two; three enemies from then on
  const FRONT = { clank: 0, creak: 0, bash: 0, racket: 1, clatter: 1, croak: 1, beep: 1, hiss: 2, drip: 2, whoosh: 2, squawk: 2, gibber: 3, tick: 3, cuckoo: 3, ringtone: 3, whine: 4, rustle: 4, buzz: 4, peck: 4, crackle: 4, squeal: 4 };
  H.DIN_FRONT = FRONT;
  // Past floor 100 the music is back, and so are other bands: some enemies are evolved pets.
  H.RIVAL_FROM = 100; H.RIVAL_CHANCE = 0.3;
  const rivalForm = (n, rnd) => { const tier = n > 200 ? 2 : 1, list = Object.keys(H.FORMS).filter((k) => H.FORMS[k].tier === tier); return list[Math.floor(rnd() * list.length)]; };
  H.stage = (n) => {
    const idx = ((n - 1) % 10) + 1, region = H.REGION_ORDER[Math.floor((n - 1) / 10) % H.REGION_ORDER.length], R = H.REGIONS[region], rnd = H.rng(n * 7919 + 13);
    const boss = idx === 10, elite = idx === 5, L = H.stageLevel(n);
    let list;
    if (boss) list = [{ id: R.boss, lvl: L, k: H.EARLY_BOSS_K[n] }].concat((n === 10 ? [] : R.adds).map((a) => ({ id: a, lvl: Math.max(1, L - 1) })));
    else {
      const count = H.ENEMY_COUNT[n - 1] || 3; const ids = [];
      for (let i = 0; i < count; i++) ids.push(R.din[Math.floor(rnd() * R.din.length)]);
      for (const one of ['gibber', 'clank']) if (ids.filter((x) => x === one).length > 1) ids[ids.indexOf(one)] = R.din[0];
      ids.sort((a, b) => FRONT[a] - FRONT[b]);
      list = ids.map((id, i) => ({ id, lvl: L, loud: elite && i === 0 }));
    }
    list = list.map((e) => Object.assign({}, e, { k: (e.k || 1) * H.lateK(n, !!(H.DIN[e.id] && H.DIN[e.id].boss)) }));
    if (n > H.RIVAL_FROM) list = list.map((e) => (!H.DIN[e.id].boss && !e.loud && rnd() < H.RIVAL_CHANCE ? { id: rivalForm(n, rnd), lvl: e.lvl, pet: true, k: e.k } : e));
    return { n, idx, region, boss, elite, level: L, enemies: list, name: boss ? 'Boss: ' + H.DIN[R.boss].n : elite ? 'Loud floor' : 'Floor ' + n };
  };

  /* ---------- move text, in plain words ---------- */
  // Move text is written from the move's effects, one sentence per part, so it always matches what the move does.
  // Each sentence is a whole template with its target in it, so every language can order the words its own way.
  const T = (s, v) => H.T(s, v);
  const TGT = { one: 'one enemy', rand: 'a random enemy', all: 'all enemies', same: 'it', self: 'itself', ally: 'the most hurt bandmate', allies: 'the whole band', others: 'its bandmates', strong: 'the strongest bandmate', slow: 'the slowest bandmate', attacker: 'the attacker' };
  const pc = (x) => Math.round(x * 100) + '%';
  const turns = (n) => T('{n} turns', { n });
  const stDo = { pup: 'Power Up', pdown: 'Power Down', sup: 'Speed Up', sdown: 'Slow', stun: 'Stun', poison: 'Poison', regen: 'Regen', taunt: 'Taunt', dodge: 'Dodge', lifesong: 'Lifesong', offkey: 'Off-Key' };
  const stN = (k) => T(stDo[k]);
  function fxText(fx) {
    const k = fx[0], tg = fx[1];
    if (k === 'dmg') {
      const o = fx[3] || {}, h = o.h || 1, p = pc(fx[2]); let s;
      if (tg === 'rand' && h > 1) s = T(o.distinct ? 'Hits random enemies {n} times for {p} each (two different enemies).' : 'Hits random enemies {n} times for {p} each.', { n: h, p });
      else if (h > 1) s = T(`Hits ${TGT[tg]} {n} times for {p} each.`, { n: h, p });
      else s = T(`Hits ${TGT[tg]} for {p}.`, { p });
      const r = [s], them = tg === 'one' || tg === 'rand' ? 'it' : 'them';
      if (o.inc) r.push(T('Each hit is {p} stronger than the last.', { p: pc(o.inc) }));
      if (o.st) for (const t of o.st) r.push(t[2] && t[2] < 1 ? T('{c} chance of {st} for {t}.', { c: pc(t[2]), st: stN(t[0]), t: turns(t[1]) }) : T('{st} for {t}.', { st: stN(t[0]), t: turns(t[1]) }));
      if (o.drain) r.push(T('Heals itself for {p} of the damage.', { p: pc(o.drain) }));
      if (o.push) r.push(T(them === 'it' ? 'Pushes it back in the turn order.' : 'Pushes them back in the turn order.'));
      if (o.fresh) r.push(T('{p} stronger if the enemy is above 80% HP.', { p: pc(o.fresh) }));
      if (o.exec) r.push(T('Up to {p} stronger the more hurt the enemy is.', { p: pc(o.exec) }));
      if (o.chain) r.push(T('Then hits every other enemy for {p}.', { p: pc(o.chain * fx[2]) }));
      if (o.crit) r.push(T('+{p} critical hit chance.', { p: pc(o.crit) }));
      if (o.shatter) r.push(T('Goes straight through Shield.'));
      if (o.perCrit) r.push(T('Every critical hit adds one more hit (up to {n}).', { n: o.perCrit }));
      if (o.randSt) r.push(o.randCh ? T('Each hit has a {c} chance to add Slow, Poison, Power Down or Off-Key for {t}.', { c: pc(o.randCh), t: turns(o.randSt) }) : T('Every hit adds Slow, Poison, Power Down or Off-Key for {t}.', { t: turns(o.randSt) }));
      if (o.again) r.push(T('{p} chance to take another turn right away.', { p: pc(o.again) }));
      if (o.perFallen) r.push(T('{p} stronger for each fallen bandmate.', { p: pc(o.perFallen) }));
      if (o.perLow) r.push(T('{p} stronger for each bandmate that has fallen or is below half HP.', { p: pc(o.perLow) }));
      if (o.vs) for (const s2 in o.vs) r.push(T('{p} stronger against enemies with {st}.', { p: pc(o.vs[s2]), st: stN(s2) }));
      if (o.ifSelf) for (const s2 in o.ifSelf) r.push(T('{p} stronger while it has {st}.', { p: pc(o.ifSelf[s2]), st: stN(s2) }));
      if (o.onKill) r.push(T(o.onKill[0][0] === 'cdr' ? 'If that defeats the enemy, all its moves are ready again.' : 'If that defeats the enemy, it takes another turn right away.'));
      return r.join(H.T.sep());
    }
    if (k === 'heal') { const o = fx[3] || {}; return o.pct ? T(`Heals ${TGT[tg]} for {p} of max HP.`, { p: pc(o.pct) }) : T(`Heals ${TGT[tg]} for {p}.`, { p: pc(fx[2]) }); }
    if (k === 'st') { const o = fx[4] || {}, base = T(`{st} on ${TGT[tg]} for {t}.`, { st: stN(fx[2]), t: turns(fx[3]) }); return o.ch ? T('{c} chance: {fx}', { c: pc(o.ch), fx: base }) : base; }
    if (k === 'shield') return T(`Shield for ${TGT[tg]}.`);
    if (k === 'gauge') { const v = fx[2]; if (tg === 'self' && v < 1) return T('Its next turn comes sooner.'); if (v >= 1) return tg === 'self' ? T('Takes another turn right away.') : T(`${H.cap(TGT[tg])} ${['allies', 'others', 'all'].includes(tg) ? 'take' : 'takes'} the next turn.`); return v > 0 ? T(`${H.cap(TGT[tg])} ${['allies', 'others', 'all'].includes(tg) ? 'get their' : 'gets its'} next turn sooner.`) : T(`Pushes ${TGT[tg]} back in the turn order.`); }
    if (k === 'cleanse') return T(`Removes all bad effects from ${TGT[tg]}.`);
    if (k === 'dispel') return T(`Removes all good effects and Shield from ${TGT[tg]}.`);
    if (k === 'revive') return T('Brings a fallen bandmate back at {p} HP.', { p: pc(fx[1]) });
    if (k === 'follow') return T('Every bandmate joins in with its basic attack at {p}.', { p: pc(fx[1]) });
    if (k === 'detonate') return T('Then all Poison on enemies deals its remaining damage at once.');
    if (k === 'recoil') return T('Costs the user {p} of its max HP.', { p: pc(fx[1]) });
    return '';
  }
  H.cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  H.describe = (ab) => ab.d || ab.fx.map(fxText).filter(Boolean).join(H.T.sep());
  // Does the player have to pick an enemy for this move?
  H.needsTarget = (ab) => { const scan = (list) => list.some((fx) => (fx[0] === 'dmg' || fx[0] === 'st') && fx[1] === 'one' ? true : fx[0] === 'if' ? scan(fx[2]) || scan(fx[3]) : false); return scan(ab.fx); };

  /* ---------- ensembles: three pets of three different families, or three of one family, form a band with its own opening and a boon ---------- */
  H.ENS_K = { slow: 1, crits: 8, tail: 0.09, cres: 0.05, cresMax: 0.25, harmony: 0.5, speed: 3, weak: 4, shield: 0.15, confetti: 2, ward: 2, regen: 3, regenVal: 0.4, stun: 1, stunN: 2, hymn: 0.2 };
  const EK = H.ENS_K, pct = (x) => Math.round(x * 100) + '%', T2 = (s, v) => H.T(s, v), tn = (n) => H.T('{n} turns', { n });
  H.ENSEMBLES = [
    { id: 'drumline', n: 'Drumline', fam: ['drum', 'drum', 'drum'], d: () => T2('Your whole band acts before any enemy, and all enemies are slowed for {t}.', { t: tn(EK.slow) }) },
    { id: 'stringtrio', n: 'String Trio', fam: ['string', 'string', 'string'], d: () => T2('Your band\'s first {n} hits are critical hits.', { n: EK.crits }) },
    { id: 'windtrio', n: 'Wind Trio', fam: ['breath', 'breath', 'breath'], d: () => T2('Tailwind: your band takes its turns {p} sooner for the whole battle.', { p: pct(EK.tail) }) },
    { id: 'brassband', n: 'Brass Band', fam: ['brass', 'brass', 'brass'], d: () => T2('Crescendo: your band gains {p} Power every turn, up to {max}.', { p: pct(EK.cres), max: pct(EK.cresMax) }) },
    { id: 'choir', n: 'Choir', fam: ['voice', 'voice', 'voice'], d: () => T2('Harmony: whenever one pet is healed, the other two heal for half as much.') },
    { id: 'folk', n: 'Folk Band', fam: ['drum', 'string', 'breath'], d: () => T2('Speed Up on your band for {t}.', { t: tn(EK.speed) }) },
    { id: 'ragtime', n: 'Ragtime Band', fam: ['drum', 'string', 'brass'], d: () => T2('Power Down on all enemies for {t}.', { t: tn(EK.weak) }) },
    { id: 'rock', n: 'Rock Band', fam: ['drum', 'string', 'voice'], d: () => T2('Encore: the first Special each pet uses is ready again right away. A pet without a Special does this with its Skill.') },
    { id: 'marching', n: 'Marching Band', fam: ['drum', 'breath', 'brass'], d: () => T2('Shield for your band, worth {p} of each pet\'s HP.', { p: pct(EK.shield) }) },
    { id: 'carnival', n: 'Carnival', fam: ['drum', 'breath', 'voice'], d: () => T2('Confetti: every enemy starts with one random effect (Slow, Poison or Power Down) for {t}.', { t: tn(EK.confetti) }) },
    { id: 'swing', n: 'Swing Band', fam: ['drum', 'brass', 'voice'], d: () => T2('Your fastest pet takes two turns in a row at the start.') },
    { id: 'chamber', n: 'Chamber Orchestra', fam: ['string', 'breath', 'brass'], d: () => T2('Each pet shrugs off the first {n} times it would get Slow, Stun, Poison or Power Down.', { n: EK.ward }) },
    { id: 'serenade', n: 'Serenade', fam: ['string', 'breath', 'voice'], d: () => T2('Regen on your band for {t}.', { t: tn(EK.regen) }) },
    { id: 'opera', n: 'Opera', fam: ['string', 'brass', 'voice'], d: () => T2('High note: the {n} enemies with the most HP are stunned for {t}.', { n: EK.stunN, t: tn(EK.stun) }) },
    { id: 'hymn', n: 'Hymn', fam: ['breath', 'brass', 'voice'], d: () => T2('The first pet to fall gets back up at {p} HP.', { p: pct(EK.hymn) }) },
  ];
  const famKey = (fams) => fams.slice().sort((a, b) => H.FAMILY_ORDER.indexOf(a) - H.FAMILY_ORDER.indexOf(b)).join('+');
  const ENS_BY = {}; for (const e of H.ENSEMBLES) ENS_BY[famKey(e.fam)] = e;
  H.ENS = {}; for (const e of H.ENSEMBLES) H.ENS[e.id] = e;
  // The ensemble three families make, or null (two of one family and one of another make none).
  H.ensembleOf = (fams) => (fams.length === 3 && ENS_BY[famKey(fams)]) || null;

  /* Move strength per form. A form's own move (its Skill at the first evolution, its Special at the second) has its numbers scaled by these
     and rounded, so the move text always states exactly what happens. Fitted by test/fit.js to keep the roster level. */
  H.MOVE_K = {anthem:  1.6,  aria:  1.6,  ballad:  0.58,  baritone:  1.6,  bay:  0.55,  bebop:  1.6,  bellow:  1.29,  bellows:  1.54,  bluegrass:  1.4,  blues:  1.6,  bombard:  1.23,  boogie:  1.15,  broadcast:  1.0,  cabaret:  1.3,  cadence:  1.6,  cadenza:  1.6,  caprice:  0.58,  carillon:  1.2,  carol:  0.8,  celesta:  1.05,  chant:  1.6,  chime:  0.91,  chorale:  0.84,  clan:  0.59,  clash:  0.61,  click:  1.16,  concerto:  0.8,  cool:  1.6,  croon:  1.2,  deejay:  0.55,  dirge:  1.15,  diva:  0.55,  drone:  1.6,  duel:  1.0,  fanfare:  1.3,  fife:  1.36,  flamenco:  1.3,  folk:  1.17,  gamelan:  1.13,  glock:  1.36,  growl:  1.05,  grunge:  1.6,  hardbop:  1.35,  helicon:  1.0,  highland:  0.72,  hymn:  0.83,  jamboree:  0.55,  jig:  0.67,  jingle:  0.71,  jukebox:  1.6,  kalimba:  1.4,  keening:  1.3,  knell:  0.81,  lament:  0.8,  lonesome:  0.95,  longwave:  1.6,  lounge:  0.87,  lullaby:  1.25,  march:  0.55,  marimba:  0.72,  minuet:  0.85,  mixtape:  1.11,  nocturne:  1.2,  opera:  1.6,  patter:  0.69,  peal:  0.55,  pibroch:  1.42,  piccolo:  1.6,  picker:  0.75,  pied:  0.56,  piper:  1.6,  pirate:  1.6,  pluck:  1.6,  polka:  1.6,  quake:  0.55,  quaver:  1.51,  ragtime:  1.6,  rattle:  0.85,  reel:  0.85,  requiem:  1.6,  reveille:  1.6,  riff:  0.55,  ripple:  0.91,  roll:  1.49,  round:  1.38,  rumba:  0.78,  samba:  1.6,  saw:  1.59,  scherzo:  0.83,  serenade:  1.6,  shanty:  0.65,  shellac:  1.6,  shimmer:  1.3,  shortwave:  0.55,  shout:  1.0,  shred:  0.85,  smooth:  0.76,  sonata:  1.6,  soul:  1.01,  sousa:  0.97,  stomp:  0.55,  stride:  1.05,  strum:  0.88,  subsonic:  1.6,  swing:  1.57,  syrinx:  0.55,  tamtam:  1.2,  tango:  1.58,  tattoo:  1.6,  thunder:  1.1,  toll:  0.7,  toot:  1.22,  trill:  0.55,  tubby:  1.9,  vibes:  1.59,  vinyl:  1.6,  waltz:  0.57,  wheeze:  1.6,  whistle:  1.05,  zephyr:  1.58, cornet:  1.2, plunger:  1.3, toccata:  1.25, ska:  1.75, dixie:  1.6, mariachi:  1.0, mambo:  1.15, windup:  1.4, gavotte:  1.65, upright:  0.45, slap:  0.6, basso:  0.45, madrigal:  0.8, arco:  1.3, fugue:  1.5, sostenuto:  1.15, doowop:  1.35, gospel:  1.3, plainsong:  1.25, busker:  1.2, delta:  1.6, juke:  1.6, chromatic:  1.3};
  const rnd5 = (x) => (x >= 0.6 ? Math.round(x * 20) / 20 : Math.round(x * 50) / 50);
  const scaleFx = (list, k) => list.map((fx) => {
    const f = fx.slice();
    if (f[0] === 'dmg' || f[0] === 'heal') f[2] = rnd5(f[2] * k);
    else if (f[0] === 'shield') { if (f[2]) f[2] = rnd5(f[2] * k); if (f[3] && f[3].pct) f[3] = Object.assign({}, f[3], { pct: Math.round(f[3].pct * k * 100) / 100 }); }
    else if (f[0] === 'if') { f[2] = scaleFx(f[2], k); f[3] = scaleFx(f[3], k); }
    else if (f[0] === 'random') f[2] = f[2].map((l) => scaleFx(l, k));
    return f;
  });
  H.applyMoveK = () => { for (const id in H.FORMS) { const F = H.FORMS[id], ab = F.tier === 1 ? F.phrase : F.tier === 2 ? F.finale : null; if (!ab) continue; if (!ab.fx0) ab.fx0 = ab.fx; const k = H.MOVE_K[id] || 1; ab.fx = k === 1 || ab.d ? ab.fx0 : scaleFx(ab.fx0, k); } };
  H.applyMoveK();

})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
