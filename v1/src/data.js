/* Hushsong — game data: families, pets, kits, gear, traits, ornaments, the Din, regions */
(function (H) {
  'use strict';

  H.FAMILIES = {
    drum:   { n: 'Drum',   beats: 'string', col: '#f08a3c', made: 'skin and wood' },
    string: { n: 'String', beats: 'breath', col: '#74d68e', made: 'gut and wire' },
    breath: { n: 'Breath', beats: 'brass',  col: '#6cc8f0', made: 'reeds and pipes' },
    brass:  { n: 'Brass',  beats: 'voice',  col: '#f2c744', made: 'metal and bells' },
    voice:  { n: 'Voice',  beats: 'drum',   col: '#f27aa8', made: 'throat and air' },
    none:   { n: 'Silence', beats: null,    col: '#b9b4d6', made: 'nothing at all' },
  };
  H.FAMILY_ORDER = ['drum', 'string', 'breath', 'brass', 'voice'];

  H.ROLES = {
    stray:   { n: 'Stray',   d: 'A raw noise. It has not found its part yet.', hp: 1, vol: 1, poise: 0, tempo: 1 },
    rhythm:  { n: 'Rhythm',  d: 'Holds the front and soaks up hits.',          hp: 1.2, vol: 0.85, poise: 10, tempo: 0.94 },
    lead:    { n: 'Lead',    d: 'Carries the tune. Deals the damage.',         hp: 0.9, vol: 1.12, poise: 0, tempo: 1.04 },
    harmony: { n: 'Harmony', d: 'Heals and lifts the rest of the band.',       hp: 1.0, vol: 0.95, poise: 2, tempo: 1.0 },
    bass:    { n: 'Bass',    d: 'Slows and unsettles the Din.',                hp: 1.05, vol: 0.92, poise: 4, tempo: 0.98 },
  };

  H.STATUS = {
    sharp:   { n: 'Sharp',      buff: 1, d: '+25% Volume.' },
    flat:    { n: 'Flat',       buff: 0, d: '-25% Volume.' },
    rush:    { n: 'Rush',       buff: 1, d: '+30% Tempo.' },
    drag:    { n: 'Drag',       buff: 0, d: '-30% Tempo.' },
    rest:    { n: 'Rest',       buff: 0, d: 'Skips its turn.' },
    lull:    { n: 'Lull',       buff: 0, d: 'Asleep. Skips turns until hit. The waking hit deals +50%.' },
    dis:     { n: 'Dissonance', buff: 0, d: 'Takes damage at the start of each of its turns.' },
    spot:    { n: 'Spotlight',  buff: 1, d: 'Foes must aim their single hits here.' },
    refrain: { n: 'Refrain',    buff: 1, d: 'Heals at the start of each of its turns.' },
    offbeat: { n: 'Offbeat',    buff: 1, d: 'Dodges the next hit.' },
    marked:  { n: 'Marked',     buff: 0, d: 'Takes +25% damage.' },
    hearty:  { n: 'Hearty',     buff: 1, d: 'Its hits heal it for 30% of the damage dealt.' },
    damper:  { n: 'Damper',     buff: 1, d: 'A shield. Soaks damage before HP does.' },
  };

  const A = (n, cd, fx, o) => Object.assign({ n, cd, fx }, o || {});
  const D = (tgt, pow, o) => ['dmg', tgt, pow, o || {}];

  /* ---------- Pets: 8 species, 7 forms each ---------- */
  H.SPECIES = {
    thud:    { family: 'drum',   base: { hp: 150, vol: 20, poise: 30, tempo: 90 },  noise: 'thud . . . thud', animal: 'bear cub',
               lore: 'A cub with a drumskin belly. It thumps when it is happy and when it is not.' },
    clack:   { family: 'drum',   base: { hp: 110, vol: 26, poise: 26, tempo: 104 }, noise: 'clack-clack', animal: 'crab',
               lore: 'A crab whose claws are castanets. It cannot hold anything quietly.' },
    twang:   { family: 'string', base: { hp: 105, vol: 27, poise: 18, tempo: 110 }, noise: 'twaaang', animal: 'cat',
               lore: 'A cat strung with wire whiskers. Its tail is the neck of a lute.' },
    screech: { family: 'string', base: { hp: 100, vol: 26, poise: 16, tempo: 114 }, noise: 'skreee', animal: 'cricket',
               lore: 'A cricket that never learned to rub its legs, so it found a fiddle.' },
    hum:     { family: 'breath', base: { hp: 120, vol: 22, poise: 22, tempo: 100 }, noise: 'hmmmmm', animal: 'owlet',
               lore: 'An owlet shaped like an ocarina. Every breath out is a held note.' },
    squeak:  { family: 'breath', base: { hp: 122, vol: 23, poise: 24, tempo: 107 }, noise: 'squee-eak', animal: 'mouse',
               lore: 'A mouse with a squeezebox middle. It wheezes in, it squeaks out.' },
    blare:   { family: 'brass',  base: { hp: 142, vol: 23, poise: 28, tempo: 93 },  noise: 'BLAAT', animal: 'elephant calf',
               lore: 'A calf whose trunk flares into a brass bell. It has never whispered.' },
    yelp:    { family: 'voice',  base: { hp: 115, vol: 25, poise: 20, tempo: 102 }, noise: 'yip! yip!', animal: 'frog',
               lore: 'A frog in a bow tie with a throat like a lantern. It sings at the dark.' },
  };
  H.SPECIES_ORDER = ['thud', 'twang', 'hum', 'blare', 'yelp', 'clack', 'screech', 'squeak'];

  H.FORMS = {
    /* THUD — drum bear */
    thud: { sp: 'thud', tier: 0, n: 'Thud',
      beat: A('Thump', 0, [D('front', 1.0)]),
      phrase: A('Belly Bump', 3, [D('front', 1.3, { st: [['drag', 2]] })]) },
    stomp: { sp: 'thud', tier: 1, parent: 'thud', role: 'rhythm', n: 'Stomp', mood: 'loud',
      beat: A('Downbeat', 0, [D('front', 0.9), ['shield', 'self', 0.4]]),
      phrase: A('Hold the Line', 3, [['st', 'self', 'spot', 2], ['shield', 'self', 0, { pct: 0.15 }]]),
      passive: { n: 'Backbeat', d: 'When hit, 40% chance to hit back for 70%.', counter: { ch: 0.4, pow: 0.7 } } },
    march: { sp: 'thud', tier: 2, parent: 'stomp', n: 'March', mood: 'quiet',
      finale: A('Forward March', 4, [['shield', 'allies', 0, { pct: 0.12 }], ['st', 'allies', 'rush', 2]]) },
    cadence: { sp: 'thud', tier: 2, parent: 'stomp', n: 'Cadence', mood: 'loud',
      finale: A('Drumline', 4, [D('all', 0.8, { st: [['rest', 1, 0.3]] }), ['st', 'self', 'spot', 2]]) },
    patter: { sp: 'thud', tier: 1, parent: 'thud', role: 'lead', n: 'Patter', mood: 'quiet',
      beat: A('Tap-Tap', 0, [D('front', 0.55, { h: 2 })]),
      phrase: A('Flurry', 3, [D('rand', 0.45, { h: 4 })]),
      passive: { n: 'Paradiddle', d: 'Each hit it lands adds +3% Volume for the battle (up to 30%).', ramp: { on: 'hit', per: 0.03, max: 0.3 } } },
    jig: { sp: 'thud', tier: 2, parent: 'patter', n: 'Jig', mood: 'quiet',
      finale: A('Jig Step', 4, [['st', 'self', 'offbeat', 3, { val: 2 }], ['st', 'self', 'rush', 3], D('back', 1.4)]) },
    roll: { sp: 'thud', tier: 2, parent: 'patter', n: 'Roll', mood: 'loud',
      finale: A('Drumroll', 5, [D('front', 0.32, { h: 6, inc: 0.12 })]) },

    /* CLACK — castanet crab */
    clack: { sp: 'clack', tier: 0, n: 'Clack',
      beat: A('Snip', 0, [D('front', 1.0)]),
      phrase: A('Clack-Clack', 3, [D('low', 0.8, { h: 2 })]) },
    click: { sp: 'clack', tier: 1, parent: 'clack', role: 'lead', n: 'Click', mood: 'quiet',
      beat: A('Clean Click', 0, [D('low', 1.0, { crit: 0.15 })]),
      phrase: A('Castanet Snap', 3, [D('low', 1.7, { onKill: [['gauge', 'self', 1.0]] })]),
      passive: { n: 'On the Beat', d: '+20% crit chance. A crit moves it 20% along the tempo bar.', mod: { crit: 0.2 }, critGauge: 0.2 } },
    flamenco: { sp: 'clack', tier: 2, parent: 'click', n: 'Flamenco', mood: 'loud',
      finale: A('Zapateado', 4, [D('rand', 0.42, { h: 5, perCrit: 3 })]) },
    tango: { sp: 'clack', tier: 2, parent: 'click', n: 'Tango', mood: 'quiet',
      finale: A('Take the Lead', 4, [['st', 'front', 'marked', 3], D('same', 1.5, { push: 0.3 })]) },
    rattle: { sp: 'clack', tier: 1, parent: 'clack', role: 'bass', n: 'Rattle', mood: 'loud',
      beat: A('Shake', 0, [D('front', 0.8, { st: [['drag', 2, 0.35]] })]),
      phrase: A('Rattle Nerves', 3, [D('all', 0.3, { st: [['flat', 2]] })]),
      passive: { n: 'Unsettle', d: 'Its hits on ailing foes push them 15% back on the tempo bar.', debuffPush: 0.15 } },
    rumba: { sp: 'clack', tier: 2, parent: 'rattle', n: 'Rumba', mood: 'quiet',
      finale: A('Slow Burn', 4, [D('all', 0.6, { st: [['dis', 3, 1, 0.35]] })]) },
    samba: { sp: 'clack', tier: 2, parent: 'rattle', n: 'Samba', mood: 'loud',
      finale: A('Carnival', 5, [['st', 'allies', 'rush', 2], ['st', 'allies', 'sharp', 2], ['st', 'all', 'drag', 2]]) },

    /* TWANG — lute cat */
    twang: { sp: 'twang', tier: 0, n: 'Twang',
      beat: A('Twang', 0, [D('front', 1.0)]),
      phrase: A('Snapped String', 3, [D('back', 1.4)]) },
    pluck: { sp: 'twang', tier: 1, parent: 'twang', role: 'lead', n: 'Pluck', mood: 'loud',
      beat: A('Pick', 0, [D('back', 1.0)]),
      phrase: A('Pizzicato', 2, [D('back', 1.4, { fresh: 0.5 })]),
      passive: { n: 'Sharp Ear', d: 'Its hits ignore half of the target\'s Poise.', mod: { pierce: 0.5 } } },
    riff: { sp: 'twang', tier: 2, parent: 'pluck', n: 'Riff', mood: 'quiet',
      finale: A('Power Riff', 4, [D('back', 1.6, { chain: 0.6 })]) },
    shred: { sp: 'twang', tier: 2, parent: 'pluck', n: 'Shred', mood: 'loud',
      finale: A('Shred', 4, [D('low', 1.9, { exec: 1.0, onKill: [['cdr', 'self', 9]] })]) },
    strum: { sp: 'twang', tier: 1, parent: 'twang', role: 'harmony', n: 'Strum', mood: 'quiet',
      beat: A('Gentle Strum', 0, [D('front', 0.8), ['heal', 'allyLow', 0.5]]),
      phrase: A('Open Chord', 3, [['heal', 'allies', 0.9]], { need: 'hurt' }),
      passive: { n: 'Resonance', d: 'Its healing past full HP becomes Damper instead.', overheal: 1 } },
    ballad: { sp: 'twang', tier: 2, parent: 'strum', n: 'Ballad', mood: 'quiet',
      finale: A('Slow Verse', 4, [['cleanse', 'allies'], ['st', 'allies', 'refrain', 3, { val: 0.5 }]]) },
    waltz: { sp: 'twang', tier: 2, parent: 'strum', n: 'Waltz', mood: 'loud',
      finale: A('One-Two-Three', 4, [['st', 'allies', 'rush', 2], ['gauge', 'allySlow', 1.0]]) },

    /* SCREECH — fiddle cricket */
    screech: { sp: 'screech', tier: 0, n: 'Screech',
      beat: A('Scrape', 0, [D('front', 0.9, { st: [['dis', 2, 0.3]] })]),
      phrase: A('Screech', 3, [D('all', 0.6)]) },
    saw: { sp: 'screech', tier: 1, parent: 'screech', role: 'lead', n: 'Saw', mood: 'loud',
      beat: A('Sawing', 0, [D('front', 0.8, { st: [['dis', 2]] })]),
      phrase: A('Double Stop', 3, [D('front', 0.8, { h: 2, st: [['dis', 2]] })]),
      passive: { n: 'Raw Nerve', d: '+30% damage to foes suffering Dissonance.', vs: { dis: 0.3 } } },
    reel: { sp: 'screech', tier: 2, parent: 'saw', n: 'Reel', mood: 'loud',
      finale: A('Whirling Reel', 4, [D('all', 0.6, { h: 2 }), ['st', 'self', 'rush', 2]]) },
    lament: { sp: 'screech', tier: 2, parent: 'saw', n: 'Lament', mood: 'quiet',
      finale: A('Lament', 4, [D('all', 0.5), ['detonate', 'all']]) },
    quaver: { sp: 'screech', tier: 1, parent: 'screech', role: 'bass', n: 'Quaver', mood: 'quiet',
      beat: A('Tremolo', 0, [D('front', 0.8, { push: 0.12 })]),
      phrase: A('Shiver', 3, [D('front', 0.8, { st: [['rest', 1]] })]),
      passive: { n: 'Jitters', d: 'Ailments it applies last 1 turn longer.', mod: { statusDur: 1 } } },
    nocturne: { sp: 'screech', tier: 2, parent: 'quaver', n: 'Nocturne', mood: 'quiet',
      finale: A('Nightfall', 5, [['st', 'all', 'lull', 2]]) },
    caprice: { sp: 'screech', tier: 2, parent: 'quaver', n: 'Caprice', mood: 'loud',
      finale: A('Whim', 3, [['random', 3, [
        [D('rand', 1.3)],
        [['st', 'rand', 'rest', 1]],
        [['heal', 'allyLow', 1.2]],
        [['st', 'allies', 'sharp', 2]],
        [['st', 'all', 'flat', 2]],
        [['shield', 'allies', 0.6]],
      ]]], { d: 'Three things happen at random: a 130% hit, a Rest, a heal, Sharp for the band, Flat for all foes, or Damper for the band.' }) },

    /* HUM — ocarina owlet */
    hum: { sp: 'hum', tier: 0, n: 'Hum',
      beat: A('Puff', 0, [D('front', 0.9)]),
      phrase: A('Soft Hum', 3, [['heal', 'allyLow', 1.2]], { need: 'hurt' }) },
    drone: { sp: 'hum', tier: 1, parent: 'hum', role: 'bass', n: 'Drone', mood: 'loud',
      beat: A('Low Note', 0, [D('front', 0.8, { st: [['flat', 2, 0.35]] })]),
      phrase: A('Undertone', 3, [D('all', 0.5, { st: [['drag', 2]] })]),
      passive: { n: 'Pedal Tone', d: 'At the start of its turn, every foe slips 6% back on the tempo bar.', on: { turn: [['gauge', 'all', -0.06]] } } },
    dirge: { sp: 'hum', tier: 2, parent: 'drone', n: 'Dirge', mood: 'loud',
      finale: A('Dirge', 4, [D('all', 0.7, { st: [['dis', 3]], vs: { drag: 1.0 } })]) },
    chorale: { sp: 'hum', tier: 2, parent: 'drone', n: 'Chorale', mood: 'quiet',
      finale: A('Chorale', 4, [['shield', 'allies', 0.9], ['st', 'allies', 'refrain', 2, { val: 0.4 }]]) },
    whistle: { sp: 'hum', tier: 1, parent: 'hum', role: 'harmony', n: 'Whistle', mood: 'quiet',
      beat: A('Whistle', 0, [['if', 'allyHurt', [['heal', 'allyLow', 0.6]], [D('front', 0.8)]]],
        { d: 'Heals the most hurt ally for 60%. If nobody is hurt, hits the front foe for 80%.' }),
      phrase: A('Bright Tune', 3, [['heal', 'allies', 0.8], ['cleanse', 'allyLow']], { need: 'hurt' }),
      passive: { n: 'Earworm', d: 'Allies it heals move 10% along the tempo bar.', healGauge: 0.1 } },
    carol: { sp: 'hum', tier: 2, parent: 'whistle', n: 'Carol', mood: 'loud',
      finale: A('Carol', 4, [['heal', 'allies', 1.1], ['cleanse', 'allies'], ['st', 'allies', 'sharp', 2]]) },
    lullaby: { sp: 'hum', tier: 2, parent: 'whistle', n: 'Lullaby', mood: 'quiet',
      finale: A('Lullaby', 5, [['st', 'high', 'lull', 2], ['st', 'same', 'flat', 3], ['heal', 'allies', 0.6]]) },

    /* SQUEAK — squeezebox mouse */
    squeak: { sp: 'squeak', tier: 0, n: 'Squeak',
      beat: A('Nip', 0, [D('front', 1.0)]),
      phrase: A('Squeeze', 3, [D('front', 1.2, { drain: 0.5 })]) },
    wheeze: { sp: 'squeak', tier: 1, parent: 'squeak', role: 'rhythm', n: 'Wheeze', mood: 'quiet',
      beat: A('Bellows', 0, [D('front', 0.8, { drain: 0.4 })]),
      phrase: A('Deep Breath', 3, [['st', 'self', 'spot', 2], ['st', 'self', 'refrain', 2, { val: 0.6 }]]),
      passive: { n: 'Squeezebox', d: 'At the start of its turn, gains Damper worth 6% of its max HP.', on: { turn: [['shield', 'self', 0, { pct: 0.06 }]] } } },
    polka: { sp: 'squeak', tier: 2, parent: 'wheeze', n: 'Polka', mood: 'loud',
      finale: A('Oom-Pah', 4, [D('front', 1.0), ['heal', 'self', 0, { pct: 0.1 }], D('front', 1.0), ['heal', 'self', 0, { pct: 0.1 }], ['gauge', 'self', 0.3]],
        { d: 'Oom: hits the front foe for 100% and heals itself 10%. Pah: does it again. Then moves 30% along the tempo bar.' }) },
    shanty: { sp: 'squeak', tier: 2, parent: 'wheeze', n: 'Shanty', mood: 'quiet',
      finale: A('Heave-Ho', 4, [['st', 'allies', 'hearty', 3], ['st', 'allies', 'sharp', 2]]) },
    trill: { sp: 'squeak', tier: 1, parent: 'squeak', role: 'lead', n: 'Trill', mood: 'loud',
      beat: A('Trill', 0, [D('front', 0.38, { h: 3 })]),
      phrase: A('Grace Notes', 2, [D('rand', 0.7, { h: 2 }), ['gauge', 'self', 0.2]]),
      passive: { n: 'Quicksilver', d: '+15% Tempo.', mod: { tempo: 0.15 } } },
    scherzo: { sp: 'squeak', tier: 2, parent: 'trill', n: 'Scherzo', mood: 'loud',
      finale: A('Prank', 4, [D('rand', 0.5, { h: 4, randSt: 2 })]) },
    cadenza: { sp: 'squeak', tier: 2, parent: 'trill', n: 'Cadenza', mood: 'quiet',
      finale: A('Cadenza', 5, [D('low', 1.4), ['st', 'self', 'sharp', 3], ['gauge', 'self', 1.0]]) },

    /* BLARE — trumpet elephant */
    blare: { sp: 'blare', tier: 0, n: 'Blare',
      beat: A('Honk', 0, [D('front', 1.0)]),
      phrase: A('Blast', 3, [D('front', 1.2, { push: 0.25 })]) },
    bellow: { sp: 'blare', tier: 1, parent: 'blare', role: 'rhythm', n: 'Bellow', mood: 'loud',
      beat: A('Oompah', 0, [D('front', 0.9), ['st', 'allyHigh', 'sharp', 1]]),
      phrase: A('Brace', 3, [['st', 'self', 'spot', 2], ['shield', 'allies', 0.6]]),
      passive: { n: 'Wall of Sound', d: 'While it stands, its bandmates take 15% less damage.', aura: { taken: -0.15 } } },
    fanfare: { sp: 'blare', tier: 2, parent: 'bellow', n: 'Fanfare', mood: 'loud',
      finale: A('Fanfare', 4, [['st', 'allies', 'sharp', 3], ['gauge', 'others', 0.25]]) },
    anthem: { sp: 'blare', tier: 2, parent: 'bellow', n: 'Anthem', mood: 'quiet',
      finale: A('Anthem', 5, [['revive', 0.3], ['shield', 'allies', 0, { pct: 0.18 }], ['cleanse', 'allies']]) },
    toot: { sp: 'blare', tier: 1, parent: 'blare', role: 'lead', n: 'Toot', mood: 'quiet',
      beat: A('Toot', 0, [D('front', 1.0, { again: 0.25 })]),
      phrase: A('Call', 3, [D('rand', 1.2, { h: 2, distinct: 1 })]),
      passive: { n: 'Bright Brass', d: 'Opens every battle with a full tempo bar. +10% crit chance.', mod: { crit: 0.1 }, startGauge: 1 } },
    swing: { sp: 'blare', tier: 2, parent: 'toot', n: 'Swing', mood: 'quiet',
      finale: A('Swing Out', 4, [D('rand', 0.9, { h: 4, inc: 0.15 })]) },
    reveille: { sp: 'blare', tier: 2, parent: 'toot', n: 'Reveille', mood: 'loud',
      finale: A('Reveille', 4, [['cleanse', 'allies'], ['gauge', 'others', 0.4], D('all', 0.6)]) },

    /* YELP — singing frog */
    yelp: { sp: 'yelp', tier: 0, n: 'Yelp',
      beat: A('Yip', 0, [D('front', 1.0)]),
      phrase: A('Yowl', 3, [D('all', 0.5, { st: [['flat', 1]] })]) },
    croon: { sp: 'yelp', tier: 1, parent: 'yelp', role: 'harmony', n: 'Croon', mood: 'quiet',
      beat: A('Croon', 0, [D('front', 0.8, { st: [['flat', 2, 0.35]] })]),
      phrase: A('Sweet Nothing', 3, [['heal', 'allyLow', 1.3], ['shield', 'same', 0.5]], { need: 'hurt' }),
      passive: { n: 'Silver Tongue', d: 'Foes that hit it go Flat for 2 turns.', on: { hurt: [['st', 'attacker', 'flat', 2]] } } },
    serenade: { sp: 'yelp', tier: 2, parent: 'croon', n: 'Serenade', mood: 'quiet',
      finale: A('Serenade', 5, [['st', 'high', 'rest', 2], ['heal', 'allies', 0.5]]) },
    hymn: { sp: 'yelp', tier: 2, parent: 'croon', n: 'Hymn', mood: 'loud',
      finale: A('Hymn', 5, [['if', 'allyFallen', [['revive', 0.4]], [['heal', 'allies', 1.0], ['st', 'allies', 'refrain', 2, { val: 0.4 }]]]],
        { need: 'hurtOrFallen', d: 'Brings a silenced ally back at 40% HP. If nobody has fallen, heals the band for 100% and grants Refrain 2.' }) },
    shout: { sp: 'yelp', tier: 1, parent: 'yelp', role: 'lead', n: 'Shout', mood: 'loud',
      beat: A('Shout', 0, [D('front', 1.1)]),
      phrase: A('Belt It Out', 3, [D('front', 1.8, { shatter: 1 })]),
      passive: { n: 'Projection', d: 'Gains +8% Volume at the start of each of its turns (up to 40%).', ramp: { on: 'turn', per: 0.08, max: 0.4 } } },
    chant: { sp: 'yelp', tier: 2, parent: 'shout', n: 'Chant', mood: 'loud',
      finale: A('Call and Response', 4, [D('all', 0.7), ['follow', 0.6]]) },
    aria: { sp: 'yelp', tier: 2, parent: 'shout', n: 'Aria', mood: 'quiet',
      finale: A('High Note', 5, [D('front', 2.4, { shatter: 1, ifSelf: { sharp: 0.5 } })]) },
  };

  H.TIER_MUL = [1, 1.08, 1.16];
  H.TIER_COST = [0, 40, 120];
  H.TIER_LEVEL = [1, 3, 8];
  H.MAX_LEVEL = 20;
  H.xpNeed = (L) => 30 + 22 * (L - 1);

  H.childrenOf = (formId) => Object.keys(H.FORMS).filter((k) => H.FORMS[k].parent === formId);
  H.formChain = (formId) => { const c = []; let f = formId; while (f) { c.unshift(f); f = H.FORMS[f].parent; } return c; };
  H.kitOf = (formId) => {
    const kit = { beat: null, phrase: null, finale: null, passive: null, role: 'stray' };
    for (const id of H.formChain(formId)) {
      const f = H.FORMS[id];
      if (f.beat) kit.beat = f.beat; if (f.phrase) kit.phrase = f.phrase; if (f.finale) kit.finale = f.finale;
      if (f.passive) kit.passive = f.passive; if (f.role) kit.role = f.role;
    }
    return kit;
  };

  /* ---------- Traits (rolled on hatch) ---------- */
  H.TRAITS = {
    loud:    { n: 'Loud',         d: '+10% Volume.', mod: { vol: 0.1 } },
    sturdy:  { n: 'Sturdy',       d: '+14% HP.', mod: { hp: 0.14 } },
    nimble:  { n: 'Nimble',       d: '+8% Tempo.', mod: { tempo: 0.08 } },
    thick:   { n: 'Thick-skinned', d: '+14 Poise.', mod: { poise: 14 } },
    eager:   { n: 'Eager',        d: 'Starts every battle halfway along the tempo bar.', startGauge: 0.5 },
    showoff: { n: 'Show-off',     d: '+18% Volume when placed in front.', slotMod: { 0: { vol: 0.18 } } },
    shy:     { n: 'Shy',          d: '+18% Volume when placed at the back.', slotMod: { 2: { vol: 0.18 } } },
    lucky:   { n: 'Lucky',        d: '+12% crit chance.', mod: { crit: 0.12 } },
    plucky:  { n: 'Plucky',       d: 'Once per battle, heals 25% when it drops below 30% HP.', secondWind: 0.25 },
    pitch:   { n: 'Perfect Pitch', d: 'Cannot be made Flat.', immune: ['flat'] },
    steady:  { n: 'Steady',       d: 'Cannot be made to Drag.', immune: ['drag'] },
    encore:  { n: 'Encore',       d: '12% chance to move straight to the front of the tempo bar after acting.', again: 0.12 },
  };

  /* ---------- Gear (two slots per pet) ---------- */
  H.GEAR = {
    metronome: { n: 'Metronome',       d: '+12% Tempo.', cost: 50, tier: 0, mod: { tempo: 0.12 } },
    strap:     { n: 'Shoulder Strap',  d: '+18% HP.', cost: 50, tier: 0, mod: { hp: 0.18 } },
    amp:       { n: 'Little Amp',      d: '+16% Volume. -6% Tempo.', cost: 50, tier: 0, mod: { vol: 0.16, tempo: -0.06 } },
    rosin:     { n: 'Rosin Block',     d: 'Its Beat also inflicts Dissonance for 2 turns.', cost: 60, tier: 0, beatSt: ['dis', 2] },
    capo:      { n: 'Capo',            d: 'Its Phrase comes back 1 turn sooner.', cost: 70, tier: 1, mod: { cdPhrase: -1 } },
    mallet:    { n: 'Felt Mallet',     d: 'Its Beat splashes 35% onto the other foes.', cost: 70, tier: 1, beatSplash: 0.35 },
    earplugs:  { n: 'Earplugs',        d: 'Cannot be put to Rest or Lull.', cost: 60, tier: 1, immune: ['rest', 'lull'] },
    fork:      { n: 'Tuning Fork',     d: 'Cannot be made Flat. Starts every battle Sharp for 2 turns.', cost: 70, tier: 1, immune: ['flat'], on: { start: [['st', 'self', 'sharp', 2]] } },
    reed:      { n: 'Fresh Reed',      d: 'Its heals also grant Refrain for 2 turns.', cost: 80, tier: 2, healRefrain: 2 },
    pick:      { n: 'Lucky Pick',      d: '+15% crit chance. Crits deal +25% more.', cost: 80, tier: 2, mod: { crit: 0.15, critDmg: 0.25 } },
    drumkey:   { n: 'Drum Key',        d: 'Gains Damper worth 5% of max HP at the start of each turn.', cost: 80, tier: 2, on: { turn: [['shield', 'self', 0, { pct: 0.05 }]] } },
    collar:    { n: 'Bell Collar',     d: 'When hit, 25% chance to go Offbeat and dodge the next hit.', cost: 80, tier: 2, on: { hurt: [['st', 'self', 'offbeat', 3, { ch: 0.25 }]] } },
    score:     { n: 'Dog-eared Score', d: 'Its Finale is ready the moment battle starts.', cost: 100, tier: 3, finaleReady: 1 },
    string:    { n: 'Spare String',    d: 'Once per battle, survives a silencing hit at 1 HP and gains Damper.', cost: 100, tier: 3, undying: 0.2 },
    oil:       { n: 'Valve Oil',       d: 'After its Finale, moves 40% along the tempo bar.', cost: 90, tier: 3, on: { finale: [['gauge', 'self', 0.4]] } },
    baton:     { n: 'Baton Splinter',  d: 'Its turns charge your Cue twice as fast.', cost: 90, tier: 3, cueBonus: 1 },
  };
  H.GEAR_ORDER = Object.keys(H.GEAR);

  /* ---------- Ornaments (boons that last one delve) ---------- */
  H.ORNAMENTS = {
    forte:      { n: 'Forte',       d: 'The band has +15% Volume.', mod: { vol: 0.15 } },
    allegro:    { n: 'Allegro',     d: 'The band has +10% Tempo.', mod: { tempo: 0.1 } },
    sforzando:  { n: 'Sforzando',   d: 'Each pet\'s first hit of a battle deals double.', firstHit: 1.0 },
    staccato:   { n: 'Staccato',    d: 'Beats have a 25% chance to strike twice.', doubleBeat: 0.25 },
    legato:     { n: 'Legato',      d: 'The band\'s healing is 30% stronger.', mod: { heal: 0.3 } },
    fermata:    { n: 'Fermata',     d: 'Phrases come back 1 turn sooner.', mod: { cdPhrase: -1 } },
    crescendo:  { n: 'Crescendo',   d: 'Each pet gains +5% Volume every turn it takes (up to 30%).', ramp: { on: 'turn', per: 0.05, max: 0.3 } },
    pianissimo: { n: 'Pianissimo',  d: 'Each pet starts battle with Damper worth 15% of its max HP.', on: { start: [['shield', 'self', 0, { pct: 0.15 }]] } },
    dacapo:     { n: 'Da Capo',     d: 'The first pet silenced in each battle gets back up at 30% HP.', team: 1, daCapo: 0.3 },
    encore:     { n: 'Encore',      d: 'Your Cue charges 40% faster.', team: 1, cueRate: 0.4 },
    counterpt:  { n: 'Counterpoint', d: 'When a pet is hit, 25% chance a bandmate answers with its Beat at 50%.', team: 1, answer: { ch: 0.25, pow: 0.5 } },
    tutti:      { n: 'Tutti',       d: 'Hits that strike all foes deal +25%.', mod: { aoe: 0.25 } },
    coda:       { n: 'Coda',        d: 'Pets below 35% HP have +35% Tempo.', lowTempo: { below: 0.35, tempo: 0.35 } },
    vibrato:    { n: 'Vibrato',     d: 'Ailments the band applies last 1 turn longer.', mod: { statusDur: 1 } },
    downbeat:   { n: 'Downbeat',    d: 'Every pet starts battle 35% along the tempo bar.', startGaugeAdd: 0.35 },
    dolce:      { n: 'Dolce',       d: 'The band takes 12% less damage.', mod: { taken: -0.12 } },
  };

  /* ---------- Band bonuses ---------- */
  H.bandBonus = (families) => {
    const f = families.filter(Boolean);
    if (f.length < 3) return null;
    const uniq = new Set(f).size;
    if (uniq === 3) return { id: 'chord', n: 'Chord', d: 'Three different families: +12% HP for the whole band.', mod: { hp: 0.12 } };
    if (uniq === 1) return { id: 'unison', n: 'Unison', d: 'Three of one family: +18% Volume for the whole band.', mod: { vol: 0.18 } };
    return { id: 'duet', n: 'Duet', d: 'Two of one family: +7% Tempo for the whole band.', mod: { tempo: 0.07 } };
  };

  /* ---------- The Din (enemies) ---------- */
  H.DIN = {
    racket: { n: 'Racket', family: 'drum', base: { hp: 80, vol: 17, poise: 14, tempo: 95 },
      lore: 'A knot of pots and pans that has never once kept time.',
      beat: A('Bash', 0, [D('front', 1.0)]), phrase: A('Crash', 3, [D('all', 0.55)]) },
    whine: { n: 'Whine', family: 'string', base: { hp: 58, vol: 19, poise: 8, tempo: 114 },
      lore: 'One thin wire of sound, stretched until it hurts.',
      beat: A('Needle', 0, [D('back', 0.9)]), phrase: A('Shrill', 3, [D('back', 1.3, { st: [['flat', 2]] })]) },
    hiss: { n: 'Hiss', family: 'breath', base: { hp: 68, vol: 16, poise: 10, tempo: 101 },
      lore: 'Steam with nowhere to go. It leaks out sideways.',
      beat: A('Spit', 0, [D('front', 0.8, { st: [['dis', 2, 0.35]] })]), phrase: A('Scald', 4, [D('all', 0.4, { st: [['dis', 2]] })]) },
    clank: { n: 'Clank', family: 'brass', base: { hp: 104, vol: 14, poise: 34, tempo: 84 },
      lore: 'A dented can that walks. It likes being hit.',
      beat: A('Clonk', 0, [D('front', 1.0)]), phrase: A('Rust Guard', 3, [['st', 'self', 'spot', 2], ['shield', 'self', 0, { pct: 0.15 }]]) },
    gibber: { n: 'Gibber', family: 'voice', base: { hp: 72, vol: 15, poise: 12, tempo: 98 },
      lore: 'A heap of mouths, all talking, none of them listening.',
      beat: A('Babble', 0, [D('rand', 0.9)]),
      phrase: A('Jeer', 3, [['if', 'allyHurt', [['heal', 'allyLow', 1.4]], [D('high', 0.6, { st: [['flat', 2]] })]]],
        { d: 'Heals the most hurt Din for 140%. If none is hurt, hits the loudest pet for 60% and makes it Flat.' }) },

    muffle: { n: 'Muffle', family: 'breath', boss: 1, base: { hp: 310, vol: 18, poise: 22, tempo: 88 },
      lore: 'The first Mute. It lies over the fen like a wet quilt and swallows whatever is sung into it.',
      beat: A('Smother', 0, [D('front', 1.0, { st: [['flat', 1, 0.5]] })]),
      phrase: A('Blanket', 3, [D('all', 0.6, { st: [['drag', 2]] })]),
      finale: A('Soak', 5, [['shield', 'self', 0, { pct: 0.1 }], ['st', 'self', 'refrain', 3, { val: 0.5 }]]) },
    shush: { n: 'Shush', family: 'voice', boss: 1, base: { hp: 440, vol: 21, poise: 24, tempo: 100 },
      lore: 'A tall Mute with one long finger. Where it points, things stop.',
      beat: A('Shh', 0, [D('back', 1.0)]),
      phrase: A('Finger to Lips', 3, [['st', 'high', 'rest', 1], D('same', 0.8)]),
      finale: A('Silence!', 5, [D('all', 0.9), ['dispel', 'all']]) },
    static: { n: 'Static', family: 'string', boss: 1, base: { hp: 380, vol: 19, poise: 20, tempo: 106 },
      lore: 'A Mute made of snow that is not snow. It fills every gap between notes.',
      beat: A('Crackle', 0, [D('rand', 0.6, { h: 2 })]),
      phrase: A('White Noise', 3, [D('all', 0.4, { st: [['dis', 2]] })]),
      finale: A('Interference', 5, [['cdUp', 'all', 1], ['gauge', 'all', -0.25], D('all', 0.5)]) },
    tacet: { n: 'Tacet', family: 'none', boss: 1, base: { hp: 650, vol: 23, poise: 28, tempo: 96 },
      lore: 'The oldest Mute, seated where the conductor used to stand. It has been holding the same pause for a very long time.',
      beat: A('Erase', 0, [D('front', 1.2)]),
      phrase: A('Grand Pause', 4, [D('all', 0.5, { st: [['rest', 1, 0.5]] })]),
      finale: A('Fermata', 5, [['shield', 'self', 0, { pct: 0.12 }], ['st', 'self', 'sharp', 3]]),
      passive: { n: 'Shifting Key', d: 'Changes family every 2 turns. Below 40% HP it Rushes for the rest of the fight.', shift: 2, enrage: 0.4 } },
  };
  H.SWELL = { n: 'Swell', d: 'A Mute grows 4% louder every turn it takes.', ramp: { on: 'turn', per: 0.04, max: 1.0 } };
  H.ENCORE = { n: 'Encore', d: 'Back for another round: tougher and louder.', mod: { hp: 0.35, vol: 0.2 } };
  H.LOUD = { n: 'Loud', d: 'A louder, tougher Din.', mod: { hp: 0.5, vol: 0.15 }, on: { start: [['st', 'self', 'sharp', 2]] } };

  H.DIN_K = [0.13, 0.07];
  // The Din outgrow the band level for level (pets also gain from evolving and gear), but only up to level 12: past that both sides climb together.
  H.dinScale = (L) => { const x = Math.min(L - 1, 11); return { hp: (1 + 0.10 * (L - 1)) * (1 + H.DIN_K[0] * x), vol: (1 + 0.10 * (L - 1)) * (1 + H.DIN_K[1] * x) }; };
  H.petScale = (L, tier) => (1 + 0.10 * (L - 1)) * H.TIER_MUL[tier];

  /* ---------- Regions ---------- */
  H.REGIONS = {
    fen:   { n: 'The Quiet Fen', sub: 'Reeds that used to whistle.', lvl: [1, 3], encore: [13, 15], din: ['racket', 'hiss', 'gibber'], boss: 'muffle', adds: ['hiss'],
             pool: ['thud', 'twang', 'hum', 'blare', 'yelp'], gear: ['metronome', 'strap', 'amp', 'rosin'], key: 0 },
    works: { n: 'Clatterworks', sub: 'A bell foundry gone to rust.', lvl: [4, 6], encore: [15, 17], din: ['racket', 'clank', 'whine'], boss: 'shush', adds: ['whine', 'clank'],
             pool: ['clack', 'blare', 'screech', 'thud', 'yelp'], gear: ['capo', 'mallet', 'earplugs', 'fork'], key: 1 },
    ridge: { n: 'Whiteout Ridge', sub: 'Snow that hisses instead of falling.', lvl: [7, 9], encore: [16, 18], din: ['hiss', 'whine', 'gibber', 'clank'], boss: 'static', adds: ['hiss', 'gibber'],
             pool: ['squeak', 'hum', 'screech', 'clack', 'twang'], gear: ['reed', 'pick', 'drumkey', 'collar'], key: 2 },
    hall:  { n: 'The Hollow Hall', sub: 'Every seat is taken. Nobody claps.', lvl: [10, 13], encore: [18, 20], din: ['racket', 'whine', 'hiss', 'clank', 'gibber'], boss: 'tacet', adds: ['gibber', 'clank'],
             pool: ['thud', 'twang', 'hum', 'blare', 'yelp', 'clack', 'screech', 'squeak'], gear: ['score', 'string', 'oil', 'baton'], key: 3 },
  };
  H.REGION_ORDER = ['fen', 'works', 'ridge', 'hall'];
  H.STARTER_POOL = ['thud', 'twang', 'hum', 'blare', 'yelp'];
  H.ENCORE_BONUS = 8; // level bump for Encore delves

  /* ---------- Wayside events ---------- */
  H.EVENTS = [
    { id: 'bell', t: 'A cracked bell', body: 'Half a bell lies in the mud, mouth up, full of rainwater. Something in it still wants to ring.',
      opts: [{ l: 'Ring it', d: 'Gain an Ornament. The band loses 15% HP.', fx: { ornament: 1, hurt: 0.15 } }, { l: 'Tip the water out and move on', d: '+18 notes.', fx: { notes: 18 } }] },
    { id: 'stand', t: 'A music stand', body: 'It stands alone on the path with one burnt page still clipped to it. Most of the notes are gone. Not all.',
      opts: [{ l: 'Play what is left', d: 'Choose an Ornament.', fx: { ornament: 1 } }, { l: 'Take the brass clips', d: '+25 notes.', fx: { notes: 25 } }] },
    { id: 'crowd', t: 'The audience', body: 'Rows of stone listeners, all facing an empty patch of ground. They have been waiting politely.',
      opts: [{ l: 'Perform for them', d: 'Heal the band 30%. Your Cue starts the next battle charged.', fx: { heal: 0.3, cue: 1 } }, { l: 'Pass the hat anyway', d: '+15 notes.', fx: { notes: 15 } }] },
    { id: 'stray', t: 'A stray noise', body: 'Something small has been following you for an hour, repeating your footsteps a half-beat late.',
      opts: [{ l: 'Sit and listen', d: 'The band rehearses. Bonus practice.', fx: { xp: 30 } }, { l: 'Share the fire', d: 'Heal the band 25%.', fx: { heal: 0.25 } }] },
    { id: 'case', t: 'An instrument case', body: 'Velvet-lined, latched, and heavier than it looks. Whatever was in it left a dent shaped like itself.',
      opts: [{ l: 'Force the latch', d: 'Find a piece of gear. The band loses 10% HP.', fx: { gear: 1, hurt: 0.1 } }, { l: 'Leave it shut', d: '+12 notes.', fx: { notes: 12 } }] },
    { id: 'well', t: 'A whispering well', body: 'Drop a sound in and it comes back different. The band looks at you. The band wants to try it.',
      opts: [{ l: 'Sing down it', d: 'Swap one Ornament you hold for a new one.', fx: { swap: 1 } }, { l: 'Drop a coin instead', d: 'Heal the band 15%.', fx: { heal: 0.15 } }] },
  ];

  /* ---------- Ability text ---------- */
  const TGT = { front: 'the front foe', back: 'the back foe', low: 'the weakest foe', high: 'the loudest foe', rand: 'a random foe', all: 'all foes', same: 'it',
    self: 'itself', allyLow: 'the most hurt ally', allies: 'the whole band', others: 'its bandmates', allyHigh: 'the loudest ally', allySlow: 'the slowest ally', attacker: 'the attacker' };
  const pc = (x) => Math.round(x * 100) + '%';
  const stName = (s) => H.STATUS[s].n;
  function fxText(fx) {
    const k = fx[0];
    if (k === 'dmg') {
      const o = fx[3] || {}; const h = o.h || 1; let s;
      if (fx[1] === 'rand' && h > 1) s = `Hits random foes ${h} times for ${pc(fx[2])}` + (o.distinct ? ' (never the same foe twice)' : '');
      else s = `Hits ${TGT[fx[1]]} ` + (h > 1 ? `${h} times for ${pc(fx[2])}` : `for ${pc(fx[2])}`);
      const r = [];
      if (o.inc) r.push(`each hit ${pc(o.inc)} harder than the last`);
      if (o.st) for (const t of o.st) r.push((t[2] && t[2] < 1 ? pc(t[2]) + ' chance of ' : 'inflicts ') + `${stName(t[0])} ${t[1]}`);
      if (o.drain) r.push(`heals itself for ${pc(o.drain)} of the damage`);
      if (o.push) r.push(`knocks it ${pc(o.push)} back on the tempo bar`);
      if (o.fresh) r.push(`+${pc(o.fresh)} if the target is above 80% HP`);
      if (o.exec) r.push('hits harder the more HP the target is missing (up to double)');
      if (o.chain) r.push(`then jumps to every other foe for ${pc(o.chain * fx[2])}`);
      if (o.crit) r.push(`+${pc(o.crit)} crit chance`);
      if (o.shatter) r.push('ignores Damper');
      if (o.perCrit) r.push(`each crit adds a hit (up to ${o.perCrit})`);
      if (o.randSt) r.push(`each hit inflicts Flat, Drag or Dissonance for ${o.randSt} turns`);
      if (o.again) r.push(`${pc(o.again)} chance to act again at once`);
      if (o.vs) for (const s2 in o.vs) r.push(`+${pc(o.vs[s2])} against foes with ${stName(s2)}`);
      if (o.ifSelf) for (const s2 in o.ifSelf) r.push(`+${pc(o.ifSelf[s2])} while ${stName(s2)}`);
      if (o.onKill) r.push('if that silences the target, ' + o.onKill.map(fxText).join(' and ').replace(/^\w/, (c) => c.toLowerCase()).replace(/\.$/, ''));
      return s + (r.length ? '; ' + r.join('; ') : '') + '.';
    }
    if (k === 'heal') { const o = fx[3] || {}; return `Heals ${TGT[fx[1]]} for ${o.pct ? pc(o.pct) + ' of max HP' : pc(fx[2])}.`; }
    if (k === 'st') { const o = fx[4] || {}; const tg = TGT[fx[1]]; return `${o.ch ? pc(o.ch) + ' chance: ' : ''}${stName(fx[2])} ${fx[3]} on ${tg}.`; }
    if (k === 'shield') { const o = fx[3] || {}; return `Damper on ${TGT[fx[1]]} worth ${o.pct ? pc(o.pct) + (fx[1] === 'self' ? ' of its max HP' : ' of this one\'s max HP') : pc(fx[2])}.`; }
    if (k === 'gauge') { const v = fx[2]; if (v >= 1) return fx[1] === 'self' ? 'It acts again at once.' : `${cap(TGT[fx[1]])} acts next.`; return v > 0 ? `Moves ${TGT[fx[1]]} ${pc(v)} along the tempo bar.` : `Pushes ${TGT[fx[1]]} ${pc(-v)} back on the tempo bar.`; }
    if (k === 'cleanse') return `Clears ailments from ${TGT[fx[1]]}.`;
    if (k === 'dispel') return `Strips boons from ${TGT[fx[1]]}.`;
    if (k === 'revive') return `Brings a silenced ally back at ${pc(fx[1])} HP.`;
    if (k === 'follow') return `Then each bandmate answers with its Beat at ${pc(fx[1])}.`;
    if (k === 'detonate') return 'Then all Dissonance on foes goes off at once, dealing everything it had left.';
    if (k === 'cdr') return 'Its cooldowns reset.';
    if (k === 'cdUp') return `Adds ${fx[2]} turn to the cooldowns of ${TGT[fx[1]]}.`;
    return '';
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  H.describe = (ab) => ab.d || ab.fx.map(fxText).join(' ');
  H.cap = cap;

})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
