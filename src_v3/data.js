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
    rhythm:  { n: 'Tank',    d: 'Tough. Protects the team.',             hp: 1.2, vol: 0.85, poise: 10, tempo: 0.94 },
    lead:    { n: 'Attacker', d: 'Deals the most damage.',               hp: 0.9, vol: 1.12, poise: 0, tempo: 1.04 },
    harmony: { n: 'Healer',  d: 'Heals and strengthens the team.',       hp: 1.0, vol: 0.95, poise: 2, tempo: 1.0 },
    bass:    { n: 'Trickster', d: 'Slows and weakens enemies.',          hp: 1.05, vol: 0.92, poise: 4, tempo: 0.98 },
  };

  // Effects that sit on a unit for a few turns.
  H.STATUS = {
    pup:    { n: 'Power Up',   s: 'POWER UP',  buff: 1, d: 'Deals 25% more damage.' },
    pdown:  { n: 'Power Down', s: 'WEAKER',    buff: 0, d: 'Deals 25% less damage.' },
    sup:    { n: 'Speed Up',   s: 'FASTER',    buff: 1, d: 'Turns come 30% sooner.' },
    sdown:  { n: 'Slow',       s: 'SLOW',      buff: 0, d: 'Turns come 30% later.' },
    stun:   { n: 'Stun',       s: 'STUNNED',   buff: 0, d: 'Misses its turn.' },
    poison: { n: 'Poison',     s: 'POISON',    buff: 0, d: 'Loses HP at the start of each turn.' },
    regen:  { n: 'Regen',      s: 'REGEN',     buff: 1, d: 'Gains HP at the start of each turn.' },
    taunt:  { n: 'Taunt',      s: 'TAUNT',     buff: 1, d: 'Enemies must aim their single hits at it.' },
    dodge:  { n: 'Dodge',      s: 'DODGE',     buff: 1, d: 'The next hit misses.' },
    shield: { n: 'Shield',     s: 'SHIELD',    buff: 1, d: 'Soaks damage before HP does.' },
  };

  const A = (n, cd, fx, o) => Object.assign({ n, cd, fx }, o || {});
  const D = (tgt, pow, o) => ['dmg', tgt, pow, o || {}];

  H.SPECIES = {
    thud:    { family: 'drum',   base: { hp: 150, vol: 20, poise: 30, tempo: 90 },  animal: 'bear cub', lore: 'A cub with a drum for a belly. Slow, sturdy and hard to knock over.' },
    clack:   { family: 'drum',   base: { hp: 110, vol: 26, poise: 26, tempo: 104 }, animal: 'crab', lore: 'A crab with castanets for claws. Quick, snappy hits.' },
    twang:   { family: 'string', base: { hp: 105, vol: 27, poise: 18, tempo: 110 }, animal: 'cat', lore: 'A cat strung like a lute. Hits hard but is easy to hurt.' },
    screech: { family: 'string', base: { hp: 100, vol: 26, poise: 16, tempo: 114 }, animal: 'cricket', lore: 'A cricket with a fiddle. Fast, and its scraping poisons enemies.' },
    hum:     { family: 'breath', base: { hp: 120, vol: 22, poise: 22, tempo: 100 }, animal: 'owlet', lore: 'An owlet shaped like an ocarina. It can heal its friends.' },
    squeak:  { family: 'breath', base: { hp: 122, vol: 23, poise: 24, tempo: 107 }, animal: 'mouse', lore: 'A mouse with a squeezebox middle. It heals itself as it bites.' },
    blare:   { family: 'brass',  base: { hp: 142, vol: 23, poise: 28, tempo: 93 },  animal: 'elephant calf', lore: 'A calf with a trumpet trunk. Its blasts knock enemies back in the queue.' },
    clang:   { family: 'brass',  base: { hp: 160, vol: 19, poise: 36, tempo: 82 },  animal: 'turtle', lore: 'A turtle that carries a bell on its back. Very tough, very slow.' },
    yelp:    { family: 'voice',  base: { hp: 115, vol: 25, poise: 20, tempo: 102 }, animal: 'frog', lore: 'A frog in a bow tie. Its singing hits every enemy at once.' },
    howl:    { family: 'voice',  base: { hp: 128, vol: 24, poise: 22, tempo: 98 },  animal: 'wolf pup', lore: 'A wolf pup that sings at the moon. Its howl makes enemies weaker.' },
  };
  H.SPECIES_ORDER = ['thud', 'twang', 'hum', 'blare', 'yelp', 'clack', 'screech', 'squeak', 'clang', 'howl'];
  H.STARTERS = ['thud', 'twang', 'hum'];

  H.FORMS = {
    /* THUD */
    thud: { sp: 'thud', tier: 0, n: 'Thud',
      beat: A('Thump', 0, [D('one', 1.0)]),
      phrase: A('Belly Bump', 3, [D('one', 1.3, { st: [['sdown', 2]] })]) },
    stomp: { sp: 'thud', tier: 1, parent: 'thud', role: 'rhythm', n: 'Stomp',
      beat: A('Downbeat', 0, [D('one', 0.9), ['shield', 'self', 0.4]]),
      phrase: A('Hold the Line', 3, [['st', 'self', 'taunt', 2], ['shield', 'self', 0, { pct: 0.15 }]]),
      passive: { n: 'Hit Back', d: 'When hit, 40% chance to hit the attacker back for 70%.', counter: { ch: 0.4, pow: 0.7 } } },
    march: { sp: 'thud', tier: 2, parent: 'stomp', n: 'March',
      finale: A('Forward March', 4, [['shield', 'allies', 0, { pct: 0.12 }], ['st', 'allies', 'sup', 2]]) },
    cadence: { sp: 'thud', tier: 2, parent: 'stomp', n: 'Cadence',
      finale: A('Drumline', 4, [D('all', 0.8, { st: [['stun', 1, 0.3]] }), ['st', 'self', 'taunt', 2]]) },
    patter: { sp: 'thud', tier: 1, parent: 'thud', role: 'lead', n: 'Patter',
      beat: A('Tap-Tap', 0, [D('one', 0.55, { h: 2 })]),
      phrase: A('Flurry', 3, [D('rand', 0.45, { h: 4 })]),
      passive: { n: 'Warm Up', d: 'Every hit it lands adds 3% Power for this battle (up to 30%).', ramp: { on: 'hit', per: 0.03, max: 0.3 } } },
    jig: { sp: 'thud', tier: 2, parent: 'patter', n: 'Jig',
      finale: A('Jig Step', 4, [['st', 'self', 'dodge', 3, { val: 2 }], ['st', 'self', 'sup', 3], D('one', 1.4)],
        { d: 'Dodges the next 2 hits and speeds up for 3 turns, then hits one enemy for 140%.' }) },
    roll: { sp: 'thud', tier: 2, parent: 'patter', n: 'Roll',
      finale: A('Drumroll', 5, [D('one', 0.32, { h: 6, inc: 0.12 })]) },

    /* CLACK */
    clack: { sp: 'clack', tier: 0, n: 'Clack',
      beat: A('Snip', 0, [D('one', 1.0)]),
      phrase: A('Clack-Clack', 3, [D('one', 0.8, { h: 2 })]) },
    click: { sp: 'clack', tier: 1, parent: 'clack', role: 'lead', n: 'Click',
      beat: A('Clean Click', 0, [D('one', 1.0, { crit: 0.15 })]),
      phrase: A('Castanet Snap', 3, [D('one', 1.7, { onKill: [['gauge', 'self', 1.0]] })]),
      passive: { n: 'On the Beat', d: '+20% critical hit chance. A critical hit brings its next turn sooner.', mod: { crit: 0.2 }, critGauge: 0.2 } },
    flamenco: { sp: 'clack', tier: 2, parent: 'click', n: 'Flamenco',
      finale: A('Zapateado', 4, [D('rand', 0.42, { h: 5, perCrit: 3 })]) },
    tango: { sp: 'clack', tier: 2, parent: 'click', n: 'Tango',
      finale: A('Take the Lead', 4, [D('one', 1.6, { st: [['pdown', 2]], push: 0.3 })]) },
    rattle: { sp: 'clack', tier: 1, parent: 'clack', role: 'bass', n: 'Rattle',
      beat: A('Shake', 0, [D('one', 0.8, { st: [['sdown', 2, 0.35]] })]),
      phrase: A('Rattle Nerves', 3, [D('all', 0.3, { st: [['pdown', 2]] })]),
      passive: { n: 'Unsettle', d: 'Its hits push enemies that are slowed, weakened, poisoned or stunned further back in the turn order.', debuffPush: 0.15 } },
    rumba: { sp: 'clack', tier: 2, parent: 'rattle', n: 'Rumba',
      finale: A('Slow Burn', 4, [D('all', 0.6, { st: [['poison', 3]] })]) },
    samba: { sp: 'clack', tier: 2, parent: 'rattle', n: 'Samba',
      finale: A('Carnival', 5, [['st', 'allies', 'sup', 2], ['st', 'allies', 'pup', 2], ['st', 'all', 'sdown', 2]]) },

    /* TWANG */
    twang: { sp: 'twang', tier: 0, n: 'Twang',
      beat: A('Twang', 0, [D('one', 1.0)]),
      phrase: A('Snapped String', 3, [D('one', 1.4)]) },
    pluck: { sp: 'twang', tier: 1, parent: 'twang', role: 'lead', n: 'Pluck',
      beat: A('Pick', 0, [D('one', 1.0)]),
      phrase: A('Pizzicato', 2, [D('one', 1.4, { fresh: 0.5 })]),
      passive: { n: 'Sharp Ear', d: 'Its hits ignore half of the enemy\'s Guard.', mod: { pierce: 0.5 } } },
    riff: { sp: 'twang', tier: 2, parent: 'pluck', n: 'Riff',
      finale: A('Power Riff', 4, [D('one', 1.6, { chain: 0.6 })]) },
    shred: { sp: 'twang', tier: 2, parent: 'pluck', n: 'Shred',
      finale: A('Shred', 4, [D('one', 1.9, { exec: 1.0, onKill: [['cdr', 'self', 9]] })]) },
    strum: { sp: 'twang', tier: 1, parent: 'twang', role: 'harmony', n: 'Strum',
      beat: A('Gentle Strum', 0, [D('one', 0.8), ['heal', 'ally', 0.5]]),
      phrase: A('Open Chord', 3, [['heal', 'allies', 0.9]], { need: 'hurt' }),
      passive: { n: 'Overflow', d: 'Healing above full HP turns into Shield.', overheal: 1 } },
    ballad: { sp: 'twang', tier: 2, parent: 'strum', n: 'Ballad',
      finale: A('Slow Verse', 4, [['cleanse', 'allies'], ['st', 'allies', 'regen', 3, { val: 0.5 }]]) },
    waltz: { sp: 'twang', tier: 2, parent: 'strum', n: 'Waltz',
      finale: A('One-Two-Three', 4, [['st', 'allies', 'sup', 2], ['gauge', 'slow', 1.0]]) },

    /* SCREECH */
    screech: { sp: 'screech', tier: 0, n: 'Screech',
      beat: A('Scrape', 0, [D('one', 0.9, { st: [['poison', 2, 0.3]] })]),
      phrase: A('Screech', 3, [D('all', 0.6)]) },
    saw: { sp: 'screech', tier: 1, parent: 'screech', role: 'lead', n: 'Saw',
      beat: A('Sawing', 0, [D('one', 0.8, { st: [['poison', 2]] })]),
      phrase: A('Double Stop', 3, [D('one', 0.8, { h: 2, st: [['poison', 2]] })]),
      passive: { n: 'Raw Nerve', d: 'Deals 30% more damage to poisoned enemies.', vs: { poison: 0.3 } } },
    reel: { sp: 'screech', tier: 2, parent: 'saw', n: 'Reel',
      finale: A('Whirling Reel', 4, [D('all', 0.6, { h: 2 }), ['st', 'self', 'sup', 2]]) },
    lament: { sp: 'screech', tier: 2, parent: 'saw', n: 'Lament',
      finale: A('Lament', 4, [D('all', 0.5), ['detonate', 'all']]) },
    quaver: { sp: 'screech', tier: 1, parent: 'screech', role: 'bass', n: 'Quaver',
      beat: A('Tremolo', 0, [D('one', 0.8, { push: 0.12 })]),
      phrase: A('Shiver', 3, [D('one', 0.8, { st: [['stun', 1]] })]),
      passive: { n: 'Jitters', d: 'Slow, Stun, Poison and Power Down from this pet last 1 turn longer.', mod: { statusDur: 1 } } },
    nocturne: { sp: 'screech', tier: 2, parent: 'quaver', n: 'Nocturne',
      finale: A('Nightfall', 5, [D('all', 0.5, { st: [['stun', 1, 0.6]] })]) },
    caprice: { sp: 'screech', tier: 2, parent: 'quaver', n: 'Caprice',
      finale: A('Whim', 3, [['random', 3, [
        [D('rand', 1.3)], [['st', 'rand', 'stun', 1]], [['heal', 'ally', 1.2]], [['st', 'allies', 'pup', 2]], [['st', 'all', 'pdown', 2]], [['shield', 'allies', 0.6]],
      ]]], { d: 'Three random things happen: a 130% hit, a Stun, a heal, Power Up for the team, Power Down for all enemies, or a Shield for the team.' }) },

    /* HUM */
    hum: { sp: 'hum', tier: 0, n: 'Hum',
      beat: A('Puff', 0, [D('one', 0.9)]),
      phrase: A('Soft Hum', 3, [['heal', 'ally', 1.2]], { need: 'hurt' }) },
    drone: { sp: 'hum', tier: 1, parent: 'hum', role: 'bass', n: 'Drone',
      beat: A('Low Note', 0, [D('one', 0.8, { st: [['pdown', 2, 0.35]] })]),
      phrase: A('Undertone', 3, [D('all', 0.5, { st: [['sdown', 2]] })]),
      passive: { n: 'Drag', d: 'At the start of its turn, every enemy slips a little back in the turn order.', on: { turn: [['gauge', 'all', -0.06]] } } },
    dirge: { sp: 'hum', tier: 2, parent: 'drone', n: 'Dirge',
      finale: A('Dirge', 4, [D('all', 0.7, { st: [['poison', 3]], vs: { sdown: 1.0 } })]) },
    chorale: { sp: 'hum', tier: 2, parent: 'drone', n: 'Chorale',
      finale: A('Chorale', 4, [['shield', 'allies', 0.9], ['st', 'allies', 'regen', 2, { val: 0.4 }]]) },
    whistle: { sp: 'hum', tier: 1, parent: 'hum', role: 'harmony', n: 'Whistle',
      beat: A('Whistle', 0, [D('one', 0.6), ['heal', 'ally', 0.6]]),
      phrase: A('Bright Tune', 3, [['heal', 'allies', 0.8], ['cleanse', 'ally']], { need: 'hurt' }),
      passive: { n: 'Pick-me-up', d: 'Teammates it heals get their next turn sooner.', healGauge: 0.1 } },
    carol: { sp: 'hum', tier: 2, parent: 'whistle', n: 'Carol',
      finale: A('Carol', 4, [['heal', 'allies', 1.1], ['cleanse', 'allies'], ['st', 'allies', 'pup', 2]]) },
    lullaby: { sp: 'hum', tier: 2, parent: 'whistle', n: 'Lullaby',
      finale: A('Lullaby', 5, [['st', 'one', 'stun', 2], ['st', 'same', 'pdown', 3], ['heal', 'allies', 0.6]]) },

    /* SQUEAK */
    squeak: { sp: 'squeak', tier: 0, n: 'Squeak',
      beat: A('Nip', 0, [D('one', 1.0)]),
      phrase: A('Squeeze', 3, [D('one', 1.2, { drain: 0.5 })]) },
    wheeze: { sp: 'squeak', tier: 1, parent: 'squeak', role: 'rhythm', n: 'Wheeze',
      beat: A('Bellows', 0, [D('one', 0.8, { drain: 0.4 })]),
      phrase: A('Deep Breath', 3, [['st', 'self', 'taunt', 2], ['st', 'self', 'regen', 2, { val: 0.6 }]]),
      passive: { n: 'Puff Up', d: 'Gains a small Shield at the start of every turn.', on: { turn: [['shield', 'self', 0, { pct: 0.06 }]] } } },
    polka: { sp: 'squeak', tier: 2, parent: 'wheeze', n: 'Polka',
      finale: A('Oom-Pah', 4, [D('one', 1.0), ['heal', 'self', 0, { pct: 0.1 }], D('same', 1.0), ['heal', 'self', 0, { pct: 0.1 }], ['gauge', 'self', 0.3]],
        { d: 'Hits one enemy twice for 100% and heals itself 10% each time. Its next turn comes sooner.' }) },
    shanty: { sp: 'squeak', tier: 2, parent: 'wheeze', n: 'Shanty',
      finale: A('Heave-Ho', 4, [['st', 'allies', 'regen', 3, { val: 0.5 }], ['st', 'allies', 'pup', 2]]) },
    trill: { sp: 'squeak', tier: 1, parent: 'squeak', role: 'lead', n: 'Trill',
      beat: A('Trill', 0, [D('one', 0.38, { h: 3 })]),
      phrase: A('Grace Notes', 2, [D('rand', 0.7, { h: 2 }), ['gauge', 'self', 0.2]]),
      passive: { n: 'Quick', d: '+15% Speed.', mod: { tempo: 0.15 } } },
    scherzo: { sp: 'squeak', tier: 2, parent: 'trill', n: 'Scherzo',
      finale: A('Prank', 4, [D('rand', 0.5, { h: 4, randSt: 2 })]) },
    cadenza: { sp: 'squeak', tier: 2, parent: 'trill', n: 'Cadenza',
      finale: A('Cadenza', 5, [D('one', 1.4), ['st', 'self', 'pup', 3], ['gauge', 'self', 1.0]]) },

    /* BLARE */
    blare: { sp: 'blare', tier: 0, n: 'Blare',
      beat: A('Honk', 0, [D('one', 1.0)]),
      phrase: A('Blast', 3, [D('one', 1.2, { push: 0.25 })]) },
    bellow: { sp: 'blare', tier: 1, parent: 'blare', role: 'rhythm', n: 'Bellow',
      beat: A('Oompah', 0, [D('one', 0.9), ['st', 'strong', 'pup', 1]]),
      phrase: A('Brace', 3, [['st', 'self', 'taunt', 2], ['shield', 'allies', 0.6]]),
      passive: { n: 'Wall of Sound', d: 'While it is standing, its teammates take 15% less damage.', aura: { taken: -0.15 } } },
    fanfare: { sp: 'blare', tier: 2, parent: 'bellow', n: 'Fanfare',
      finale: A('Fanfare', 4, [['st', 'allies', 'pup', 3], ['gauge', 'others', 0.25]]) },
    anthem: { sp: 'blare', tier: 2, parent: 'bellow', n: 'Anthem',
      finale: A('Anthem', 5, [['revive', 0.3], ['shield', 'allies', 0, { pct: 0.18 }], ['cleanse', 'allies']]) },
    toot: { sp: 'blare', tier: 1, parent: 'blare', role: 'lead', n: 'Toot',
      beat: A('Toot', 0, [D('one', 1.0, { again: 0.25 })]),
      phrase: A('Call', 3, [D('rand', 1.2, { h: 2, distinct: 1 })]),
      passive: { n: 'Bright Brass', d: 'Always takes the first turn of a battle. +10% critical hit chance.', mod: { crit: 0.1 }, startGauge: 1 } },
    swing: { sp: 'blare', tier: 2, parent: 'toot', n: 'Swing',
      finale: A('Swing Out', 4, [D('rand', 0.9, { h: 4, inc: 0.15 })]) },
    reveille: { sp: 'blare', tier: 2, parent: 'toot', n: 'Reveille',
      finale: A('Reveille', 4, [['cleanse', 'allies'], ['gauge', 'others', 0.4], D('all', 0.6)]) },

    /* CLANG */
    clang: { sp: 'clang', tier: 0, n: 'Clang',
      beat: A('Bonk', 0, [D('one', 1.0)]),
      phrase: A('Ring', 3, [D('one', 1.1, { st: [['stun', 1, 0.5]] })]) },
    toll: { sp: 'clang', tier: 1, parent: 'clang', role: 'rhythm', n: 'Toll',
      beat: A('Dong', 0, [D('one', 0.9), ['shield', 'self', 0.3]]),
      phrase: A('Curfew', 3, [['st', 'self', 'taunt', 2], ['st', 'all', 'pdown', 2]]),
      passive: { n: 'Ringing Shell', d: 'Enemies that hit it have a 40% chance to be slowed for 2 turns.', on: { hurt: [['st', 'attacker', 'sdown', 2, { ch: 0.4 }]] } } },
    knell: { sp: 'clang', tier: 2, parent: 'toll', n: 'Knell',
      finale: A('Final Bell', 5, [D('one', 2.0, { exec: 1.5 })]) },
    peal: { sp: 'clang', tier: 2, parent: 'toll', n: 'Peal',
      finale: A('Full Peal', 4, [['shield', 'allies', 0, { pct: 0.15 }], ['st', 'all', 'sdown', 2]]) },
    jingle: { sp: 'clang', tier: 1, parent: 'clang', role: 'harmony', n: 'Jingle',
      beat: A('Jingle', 0, [D('one', 0.8), ['st', 'strong', 'sup', 1]]),
      phrase: A('Sleigh Bells', 3, [['heal', 'allies', 0.6], ['st', 'allies', 'pup', 2]]),
      passive: { n: 'Good Cheer', d: 'The whole team starts each battle with a Shield.', on: { start: [['shield', 'allies', 0, { pct: 0.1 }]] } } },
    carillon: { sp: 'clang', tier: 2, parent: 'jingle', n: 'Carillon',
      finale: A('Carillon', 4, [['st', 'allies', 'regen', 3, { val: 0.5 }], ['st', 'allies', 'dodge', 3]]) },
    gamelan: { sp: 'clang', tier: 2, parent: 'jingle', n: 'Gamelan',
      finale: A('Gamelan', 4, [['st', 'self', 'pup', 2], ['follow', 0.9]]) },

    /* YELP */
    yelp: { sp: 'yelp', tier: 0, n: 'Yelp',
      beat: A('Yip', 0, [D('one', 1.0)]),
      phrase: A('Yowl', 3, [D('all', 0.5, { st: [['pdown', 1]] })]) },
    croon: { sp: 'yelp', tier: 1, parent: 'yelp', role: 'harmony', n: 'Croon',
      beat: A('Croon', 0, [D('one', 0.8, { st: [['pdown', 2, 0.35]] })]),
      phrase: A('Sweet Nothing', 3, [['heal', 'ally', 1.3], ['shield', 'same', 0.5]], { need: 'hurt' }),
      passive: { n: 'Silver Tongue', d: 'Enemies that hit it are weakened for 2 turns.', on: { hurt: [['st', 'attacker', 'pdown', 2]] } } },
    serenade: { sp: 'yelp', tier: 2, parent: 'croon', n: 'Serenade',
      finale: A('Serenade', 5, [['st', 'one', 'stun', 2], ['heal', 'allies', 0.5]]) },
    hymn: { sp: 'yelp', tier: 2, parent: 'croon', n: 'Hymn',
      finale: A('Hymn', 5, [['if', 'allyFallen', [['revive', 0.4]], [['heal', 'allies', 1.0], ['st', 'allies', 'regen', 2, { val: 0.4 }]]]],
        { need: 'hurtOrFallen', d: 'Brings a fallen teammate back at 40% HP. If nobody has fallen, heals the team for 100% and gives Regen for 2 turns.' }) },
    shout: { sp: 'yelp', tier: 1, parent: 'yelp', role: 'lead', n: 'Shout',
      beat: A('Shout', 0, [D('one', 1.1)]),
      phrase: A('Belt It Out', 3, [D('one', 1.8, { shatter: 1 })]),
      passive: { n: 'Getting Louder', d: 'Gains 8% Power every turn (up to 40%).', ramp: { on: 'turn', per: 0.08, max: 0.4 } } },
    chant: { sp: 'yelp', tier: 2, parent: 'shout', n: 'Chant',
      finale: A('Call and Response', 4, [D('all', 0.7), ['follow', 0.6]]) },
    aria: { sp: 'yelp', tier: 2, parent: 'shout', n: 'Aria',
      finale: A('High Note', 5, [D('one', 2.4, { shatter: 1, ifSelf: { pup: 0.5 } })]) },

    /* HOWL */
    howl: { sp: 'howl', tier: 0, n: 'Howl',
      beat: A('Bark', 0, [D('one', 1.0)]),
      phrase: A('Howl', 3, [D('all', 0.4, { st: [['pdown', 2]] })]) },
    growl: { sp: 'howl', tier: 1, parent: 'howl', role: 'bass', n: 'Growl',
      beat: A('Snarl', 0, [D('one', 0.85, { st: [['stun', 1, 0.2]] })]),
      phrase: A('Low Growl', 3, [D('one', 1.2, { st: [['sdown', 2], ['pdown', 2]] })]),
      passive: { n: 'Menace', d: 'Deals 25% more damage to weakened enemies.', vs: { pdown: 0.25 } } },
    blues: { sp: 'howl', tier: 2, parent: 'growl', n: 'Blues',
      finale: A('The Blues', 4, [D('all', 0.7, { drain: 0.5 })]) },
    grunge: { sp: 'howl', tier: 2, parent: 'growl', n: 'Grunge',
      finale: A('Distortion', 4, [D('one', 1.5), ['spread']], { d: 'Hits one enemy for 150%, then copies its Slow, Poison, Stun and Power Down onto every other enemy.' }) },
    bay: { sp: 'howl', tier: 1, parent: 'howl', role: 'rhythm', n: 'Bay',
      beat: A('Guard Bark', 0, [D('one', 0.9), ['shield', 'ally', 0.3]]),
      phrase: A('Pack Call', 3, [['st', 'self', 'taunt', 2], ['st', 'others', 'sup', 2]]),
      passive: { n: 'Pack Leader', d: 'When a teammate is hit, 30% chance to bite the attacker for 60%.', guard: { ch: 0.3, pow: 0.6 } } },
    round: { sp: 'howl', tier: 2, parent: 'bay', n: 'Round',
      finale: A('Sing in Rounds', 4, [['st', 'allies', 'regen', 2, { val: 0.5 }], ['gauge', 'others', 0.3]]) },
    requiem: { sp: 'howl', tier: 2, parent: 'bay', n: 'Requiem',
      finale: A('Requiem', 5, [D('one', 1.5, { perFallen: 0.5 }), ['revive', 0.3]]) },
  };

  H.TIER_MUL = [1, 1.08, 1.16];
  H.TIER_COST = [0, 50, 160];
  H.TIER_LEVEL = [1, 4, 10];
  H.MAX_LEVEL = 50;
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

    muffle: { n: 'Muffle', family: 'breath', boss: 1, base: { hp: 300, vol: 18, poise: 22, tempo: 88 },
      beat: A('Smother', 0, [D('one', 1.0, { st: [['pdown', 1, 0.5]] })]),
      phrase: A('Blanket', 3, [D('all', 0.6, { st: [['sdown', 2]] })]),
      finale: A('Soak', 5, [['shield', 'self', 0, { pct: 0.1 }], ['st', 'self', 'regen', 3, { val: 0.5 }]]) },
    shush: { n: 'Shush', family: 'voice', boss: 1, base: { hp: 420, vol: 21, poise: 24, tempo: 100 },
      beat: A('Shh', 0, [D('one', 1.0)]),
      phrase: A('Finger to Lips', 3, [D('one', 0.8, { st: [['stun', 1]] })]),
      finale: A('Silence!', 5, [D('all', 0.9), ['dispel', 'all']]) },
    static: { n: 'Static', family: 'string', boss: 1, base: { hp: 380, vol: 19, poise: 20, tempo: 106 },
      beat: A('Crackle', 0, [D('rand', 0.6, { h: 2 })]),
      phrase: A('White Noise', 3, [D('all', 0.4, { st: [['poison', 2]] })]),
      finale: A('Interference', 5, [D('all', 0.5), ['gauge', 'all', -0.25]]) },
    tacet: { n: 'Tacet', family: 'none', boss: 1, base: { hp: 620, vol: 23, poise: 28, tempo: 96 },
      beat: A('Erase', 0, [D('one', 1.2)]),
      phrase: A('Grand Pause', 4, [D('all', 0.5, { st: [['stun', 1, 0.5]] })]),
      finale: A('Fermata', 5, [['shield', 'self', 0, { pct: 0.12 }], ['st', 'self', 'pup', 3]]),
      passive: { n: 'Shifting Key', d: 'Changes family every 2 turns. Speeds up when below 40% HP.', shift: 2, enrage: 0.4 } },
  };
  H.SWELL = { n: 'Getting Louder', d: 'A boss grows 4% stronger every turn it takes.', ramp: { on: 'turn', per: 0.04, max: 1.0 } };
  H.LOUD = { n: 'Loud', d: 'A bigger, tougher enemy.', mod: { hp: 0.5, vol: 0.15 } };

  H.DIN_K = [0.10, 0.05];
  // Enemies outgrow pets level for level (pets also gain from evolving), up to a point; after that both climb together.
  H.dinScale = (L) => { const x = Math.min(L - 1, 13); return { hp: (1 + 0.10 * (L - 1)) * (1 + H.DIN_K[0] * x), vol: (1 + 0.10 * (L - 1)) * (1 + H.DIN_K[1] * x) }; };
  H.petScale = (L, tier) => (1 + 0.10 * (L - 1)) * H.TIER_MUL[tier];

  /* ---------- stages ---------- */
  H.REGIONS = {
    fen:   { n: 'Reed Marsh',     din: ['racket', 'hiss', 'gibber'], boss: 'muffle', adds: ['hiss', 'racket'] },
    works: { n: 'Bell Foundry',   din: ['racket', 'clank', 'whine'], boss: 'shush', adds: ['whine', 'clank'] },
    ridge: { n: 'Snowy Ridge',    din: ['hiss', 'whine', 'gibber', 'clank'], boss: 'static', adds: ['hiss', 'gibber'] },
    hall:  { n: 'Concert Hall',   din: ['racket', 'whine', 'hiss', 'clank', 'gibber'], boss: 'tacet', adds: ['gibber', 'clank'] },
  };
  H.REGION_ORDER = ['fen', 'works', 'ridge', 'hall'];
  H.STORY_STAGES = 40;
  H.stageLevel = (n) => 1 + Math.round((n - 1) * 0.36);
  H.isShellStage = (n) => n === 2 || n === 4 || n % 10 === 0;
  const FRONT = { clank: 0, racket: 1, hiss: 2, gibber: 3, whine: 4 };
  H.stage = (n) => {
    const idx = ((n - 1) % 10) + 1, region = H.REGION_ORDER[Math.floor((n - 1) / 10) % 4], R = H.REGIONS[region], rnd = H.rng(n * 7919 + 13);
    const boss = idx === 10, elite = idx === 5, L = H.stageLevel(n);
    let list;
    if (boss) list = [{ id: R.boss, lvl: L }].concat((n === 10 ? R.adds.slice(0, 1) : R.adds).map((a) => ({ id: a, lvl: Math.max(1, L - 1) })));
    else {
      const count = n === 1 ? 1 : n <= 4 ? 2 : 3; const ids = [];
      for (let i = 0; i < count; i++) ids.push(R.din[Math.floor(rnd() * R.din.length)]);
      for (const one of ['gibber', 'clank']) if (ids.filter((x) => x === one).length > 1) ids[ids.indexOf(one)] = R.din[0];
      ids.sort((a, b) => FRONT[a] - FRONT[b]);
      list = ids.map((id, i) => ({ id, lvl: L, loud: elite && i === 0 }));
    }
    return { n, idx, region, boss, elite, level: L, enemies: list, name: boss ? 'Boss: ' + H.DIN[R.boss].n : elite ? 'Loud enemy' : 'Stage ' + n };
  };

  /* ---------- move text, in plain words ---------- */
  const TGT = { one: 'one enemy', rand: 'a random enemy', all: 'all enemies', same: 'it', self: 'itself', ally: 'the most hurt teammate', allies: 'the whole team', others: 'its teammates', strong: 'the strongest teammate', slow: 'the slowest teammate', attacker: 'the attacker' };
  const pc = (x) => Math.round(x * 100) + '%';
  const turns = (n) => n + (n === 1 ? ' turn' : ' turns');
  const stDo = { pup: 'Power Up', pdown: 'Power Down', sup: 'Speed Up', sdown: 'Slow', stun: 'Stun', poison: 'Poison', regen: 'Regen', taunt: 'Taunt', dodge: 'Dodge' };
  function fxText(fx) {
    const k = fx[0];
    if (k === 'dmg') {
      const o = fx[3] || {}, h = o.h || 1; let s;
      if (fx[1] === 'rand' && h > 1) s = `Hits random enemies ${h} times for ${pc(fx[2])} each` + (o.distinct ? ' (two different enemies)' : '');
      else s = `Hits ${TGT[fx[1]]} ` + (h > 1 ? `${h} times for ${pc(fx[2])} each` : `for ${pc(fx[2])}`);
      const r = [];
      if (o.inc) r.push(`each hit is ${pc(o.inc)} stronger than the last`);
      if (o.st) for (const t of o.st) r.push((t[2] && t[2] < 1 ? pc(t[2]) + ' chance of ' : '') + `${stDo[t[0]]} for ${turns(t[1])}`);
      if (o.drain) r.push(`heals itself for ${pc(o.drain)} of the damage`);
      if (o.push) r.push('pushes it back in the turn order');
      if (o.fresh) r.push(`${pc(o.fresh)} stronger if the enemy is above 80% HP`);
      if (o.exec) r.push('much stronger against badly hurt enemies');
      if (o.chain) r.push(`then hits every other enemy for ${pc(o.chain * fx[2])}`);
      if (o.crit) r.push(`+${pc(o.crit)} critical hit chance`);
      if (o.shatter) r.push('goes straight through Shield');
      if (o.perCrit) r.push(`every critical hit adds one more hit (up to ${o.perCrit})`);
      if (o.randSt) r.push(`every hit adds Slow, Poison or Power Down for ${turns(o.randSt)}`);
      if (o.again) r.push(`${pc(o.again)} chance to take another turn right away`);
      if (o.perFallen) r.push(`${pc(o.perFallen)} stronger for each fallen teammate`);
      if (o.vs) for (const s2 in o.vs) r.push(`${pc(o.vs[s2])} stronger against enemies with ${stDo[s2]}`);
      if (o.ifSelf) for (const s2 in o.ifSelf) r.push(`${pc(o.ifSelf[s2])} stronger while it has ${stDo[s2]}`);
      if (o.onKill) r.push(o.onKill[0][0] === 'cdr' ? 'if that defeats the enemy, all its moves are ready again' : 'if that defeats the enemy, it takes another turn right away');
      return s + (r.length ? '. ' + H.cap(r.join('. ')) : '') + '.';
    }
    if (k === 'heal') { const o = fx[3] || {}; return `Heals ${TGT[fx[1]]} for ${o.pct ? pc(o.pct) + ' of max HP' : pc(fx[2])}.`; }
    if (k === 'st') { const o = fx[4] || {}; return `${o.ch ? pc(o.ch) + ' chance: ' : ''}${stDo[fx[2]]} on ${TGT[fx[1]]} for ${turns(fx[3])}.`; }
    if (k === 'shield') return `Shield for ${TGT[fx[1]]}.`;
    if (k === 'gauge') { const v = fx[2]; if (v >= 1) return fx[1] === 'self' ? 'Takes another turn right away.' : `${H.cap(TGT[fx[1]])} takes the next turn.`; return v > 0 ? `${H.cap(TGT[fx[1]])} ${fx[1] === 'self' ? 'gets its' : 'get their'} next turn sooner.` : `Pushes ${TGT[fx[1]]} back in the turn order.`; }
    if (k === 'cleanse') return `Removes Slow, Poison, Stun and Power Down from ${TGT[fx[1]]}.`;
    if (k === 'dispel') return 'Removes Power Up, Speed Up, Regen and Shield from all enemies.';
    if (k === 'revive') return `Brings a fallen teammate back at ${pc(fx[1])} HP.`;
    if (k === 'follow') return `Every teammate joins in with its basic attack at ${pc(fx[1])}.`;
    if (k === 'detonate') return 'Then all Poison on enemies deals its remaining damage at once.';
    return '';
  }
  H.cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  H.describe = (ab) => ab.d || ab.fx.map(fxText).filter(Boolean).join(' ');
  // Does the player have to pick an enemy for this move?
  H.needsTarget = (ab) => { const scan = (list) => list.some((fx) => (fx[0] === 'dmg' || fx[0] === 'st') && fx[1] === 'one' ? true : fx[0] === 'if' ? scan(fx[2]) || scan(fx[3]) : false); return scan(ab.fx); };

})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
