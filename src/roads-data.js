/* Hushsong Roads (preview) — what is in Reed Marsh: places, Din, wild pets, quests, talents, buildings, the chapel and the story. No DOM.
   Plain data only; the rules that use it live in roads.js. */
(function (H) {
  'use strict';
  const R = (H.ROADS = {});

  // the four starters, one per class
  R.STARTERS = [['thud', 'rhythm'], ['twang', 'lead'], ['hum', 'harmony'], ['howl', 'bass']];
  R.START_LV = 3;

  /* ---------- places: where they go on the map, and what they are ---------- */
  // fit: what ground the place wants (roads-world.js). cap: a place you capture. lv: how strong its Din are.
  R.PLACES = [
    { id: 'hush', at: [-14, 13], fit: 'meadow', cap: 1, n: 'Hushwick', kind: 'Village', venue: 'The Tin Cup', art: 'rd_hush', lv: [1, 3], din: ['racket', 'hiss'], keeper: 'racket', yield: 2, bonus: { xp: 0.03 }, smith: 1,
      story: ['Hushwick wakes up', 'The Tin Cup\'s door swings open and somebody inside starts to whistle. It is out of tune. Nobody minds.'] },
    { id: 'mill', at: [4, 16], fit: 'river', cap: 1, n: 'Old Mill', kind: 'Mill', venue: 'The Wheelhouse', art: 'rd_mill', lv: [3, 5], din: ['clatter', 'croak', 'racket'], keeper: 'clatter', yield: 3, bonus: { tempo: 0.02 },
      story: ['The wheel turns', 'The millwheel creaks round for the first time in years. Creak, splash, creak, splash. It is almost a waltz.'] },
    { id: 'frog', at: [-20, 2], fit: 'shore', cap: 1, n: 'Frogmore', kind: 'Pond hamlet', venue: 'The Lily Bench', art: 'rd_frog', lv: [4, 6], din: ['croak', 'drip', 'hiss'], keeper: 'croak', yield: 2, bonus: { join: 0.03 },
      story: ['The frogs remember', 'One frog croaks. Another answers, a third higher. By evening the whole pond is singing in rounds.'] },
    { id: 'lantern', at: [0, -9], fit: 'hills', cap: 1, n: 'Lantern Hill', kind: 'Watch hill', venue: 'The Lamp Room', art: 'rd_lantern', lv: [5, 7], din: ['rustle', 'crackle', 'gibber'], keeper: 'gibber', yield: 2, bonus: { poise: 2 },
      story: ['A light on the hill', 'The old lantern flickers on. From up here you can see every road in the marsh, and every one of them hums.'] },
    { id: 'reed', at: [14, 3], fit: 'flat', cap: 1, n: 'Reedwick', kind: 'Town', venue: 'The Reed Organ', art: 'rd_reed', lv: [6, 8], din: ['gibber', 'whine', 'buzz'], keeper: 'whine', yield: 3, bonus: { hp: 0.03 }, merchant: 1,
      story: ['Market day', 'Reedwick opens its stalls again. A merchant with a shell under his coat waves you over. He says it is very rare. He says that a lot.'] },
    { id: 'lily', at: [-2, 5], fit: 'shore', n: 'The Lily Pad', kind: 'Boss stage', art: 'rd_lily', boss: 'muffle', adds: ['hiss', 'croak'], lv: [11, 10], stage: 1 },
    { id: 'chapel', at: [-6, 24], fit: 'peak', n: 'Drowned Chapel', kind: 'Dungeon', art: 'rd_chapel', dungeon: 1 },
    { id: 'page1', at: [-24, 10], fit: 'woods', n: 'A torn page', kind: 'Secret', art: 'rd_page', secret: 'page', song: 'Three Drums' },
    { id: 'page2', at: [10, -12], fit: 'flat', n: 'A torn page', kind: 'Secret', art: 'rd_page', secret: 'page', song: 'Brass Parade' },
    { id: 'page3', at: [18, 18], fit: 'flat', n: 'A torn page', kind: 'Secret', art: 'rd_page', secret: 'page', song: 'Marsh Waltz' },
    { id: 'glade', at: [-8, -14], fit: 'woods', n: 'A quiet glade', kind: 'Secret', art: 'rd_glade', secret: 'pet', pet: 'jangle', lv: 7 },
  ];
  R.LINKS = [['hush', 'lily'], ['lily', 'mill'], ['lily', 'frog'], ['lily', 'lantern'], ['lily', 'reed'], ['hush', 'chapel'], ['mill', 'reed']];
  R.CAPS = R.PLACES.filter((p) => p.cap).map((p) => p.id);

  /* ---------- wild pets: which ground they like ---------- */
  // Each patrol may hold a wild pet, taken from the pets of the ground it stands on.
  R.WILD = { shore: ['yelp'], meadow: ['peep', 'clack'], woods: ['squeak', 'tock'], hills: ['plink'] };
  R.SONGBOOK = ['peep', 'clack', 'yelp', 'squeak', 'tock', 'plink', 'doo', 'jangle'];   // the pets that live in Reed Marsh
  R.WILD_CHANCE = 0.45;
  // join chance, in parts of 1: shown on screen before and after every fight
  R.JOIN = { base: 0.15, dinFirst: 0.15, same: 0.2, perMeet: 0.05, meetMax: 0.25 };

  /* ---------- growing ---------- */
  R.petNeed = (lv) => 50 + 30 * lv;
  R.playerNeed = (lv) => 80 + 60 * lv;
  R.MAX_PET = 30; R.MAX_PLAYER = 20;
  R.EVO_LV = [0, 10, 25];   // pet level a pet needs before each evolution (and the echoes it costs, as in Hushsong)
  R.dinXp = (lv) => 6 + 3 * lv;
  R.dinNotes = (lv) => 3 + 2 * lv;

  /* ---------- gear: upgraded at the smith in Hushwick ---------- */
  R.UPGRADE = { c: { to: 'r', notes: 40 }, r: { to: 'e', notes: 160 }, e: { to: 'l', notes: 600, echo: 3 } };
  R.DROP = 0.08;
  R.SHELL_PRICE = 900; R.SHELL_STEP = 0.5;

  /* ---------- buildings: one tap each, three per captured place ---------- */
  R.BUILDS = {
    windmill: { n: 'Windmill', d: '+3 notes for every battle you win.', cost: 60, art: 'rd_windmill', notes: 3 },
    bandstand: { n: 'Bandstand', d: '+3% XP for every pet, every battle.', cost: 100, art: 'rd_bandstand', xp: 0.03 },
    herbs: { n: 'Herb Garden', d: '+3% HP for the band.', cost: 150, art: 'rd_herbs', hp: 0.03 },
  };
  R.BUILD_ORDER = ['windmill', 'bandstand', 'herbs'];

  /* ---------- talents: three trees, one point per player level ---------- */
  R.TREES = [
    { id: 'lead', n: 'Bandleader', d: 'Battles and pets', talents: [
      { id: 'warmup', n: 'Warm-Up', d: 'Pets outside the band get half the XP of every battle.' },
      { id: 'kind', n: 'Kind Words', d: '+5% join chance for wild pets.' },
      { id: 'opener', n: 'Opening Act', d: 'Your band\'s first turns come sooner.', need: 2 } ] },
    { id: 'way', n: 'Wayfarer', d: 'The map', talents: [
      { id: 'feet', n: 'Light Feet', d: 'The band walks 30% faster.' },
      { id: 'ears', n: 'Keen Ears', d: 'Secrets show up from twice as far away.' },
      { id: 'nose', n: 'Treasure Nose', d: 'Chests in dungeons hold twice the notes.', need: 2 } ] },
    { id: 'patron', n: 'Patron', d: 'Holdings', talents: [
      { id: 'neighbour', n: 'Good Neighbour', d: 'Holdings pay 50% more notes.' },
      { id: 'hands', n: 'Spare Hands', d: 'Buildings cost 25% less.' },
      { id: 'crier', n: 'Town Crier', d: '+1 Guard and +2% HP for the band for every place you hold.', need: 2 } ] },
  ];

  /* ---------- the Drowned Chapel: a side-scrolling run ---------- */
  // rooms in order. fight: Din in the way. chest: a reward. pet: a wild pet alone. boss: the end.
  R.CHAPEL = {
    n: 'Drowned Chapel', lv: 5,
    rooms: [
      { t: 'fight', din: ['drip', 'squeal'], lv: 5 },
      { t: 'chest', notes: 40 },
      { t: 'fight', din: ['squeal', 'gibber', 'drip'], lv: 5 },
      { t: 'pet', pet: 'doo', lv: 6 },
      { t: 'fight', din: ['drip', 'drip'], lv: 6, loud: 1 },
      { t: 'chest', notes: 60, item: 'r' },
      { t: 'boss', boss: 'rumble', adds: ['drip'], lv: 7 },
    ],
    reward: { echo: 2 },
  };

  /* ---------- quests: the first hours, one thing at a time ---------- */
  // goal: what the tracker says. fence: how far from Hushwick the band may go (tiles), until the quest is done.
  R.QUESTS = [
    { id: 'walk', n: 'First steps', goal: 'Walk to the bend in the road', fence: 5, xp: 30, notes: 20,
      talk: 'Walk with me to the bend in the road. Tap the land and your band goes there.' },
    { id: 'fight', n: 'Something in the reeds', goal: 'Beat the Din by the road', fence: 5, xp: 40, notes: 20,
      talk: 'See that Racket? Din eat songs. Go and give it one it cannot swallow.' },
    { id: 'friend', n: 'A friend in the noise', goal: 'Win the fight with the wild pet', fence: 5, xp: 40, notes: 20,
      talk: 'That grey little thing with the Din is a pet, stuck under the noise. Win, and it may join you. This one will.' },
    { id: 'wake', n: 'Wake Hushwick', goal: 'Clear the Din around Hushwick, then beat its keeper', fence: 5, xp: 100, notes: 40, echo: 1,
      talk: 'Hushwick has two Din groups on its doorstep and a Loud one sitting on the well. Clear the doorstep first.' },
    { id: 'talent', n: 'A little wiser', goal: 'Pick your first talent', xp: 0, notes: 20,
      talk: 'You grew a little on the way. Every level gives you a talent point. Spend it on something you like.' },
    { id: 'build', n: 'Something to build', goal: 'Build a windmill in Hushwick', xp: 40, notes: 0,
      talk: 'Places you free pay you a little after every battle you win. Build them up and they pay more.' },
    { id: 'smith', n: 'The smith', goal: 'Upgrade a piece of gear at The Tin Cup', xp: 40, notes: 0, gift: 'sticks',
      talk: 'Take these old drumsticks. The smith at The Tin Cup can make them better, for a few notes.' },
    { id: 'chapel', n: 'The Drowned Chapel', goal: 'Reach the end of the Drowned Chapel', xp: 120, notes: 60,
      talk: 'South of here the old chapel sank into the marsh. Something still sings down there. Go and look.' },
    { id: 'marsh', n: 'Free Reed Marsh', goal: 'Capture every place', xp: 200, notes: 100,
      talk: 'Four more places to wake. When all five sing, The Lily Pad opens. Muffle waits there.' },
    { id: 'boss', n: 'The Lily Pad', goal: 'Beat Muffle at The Lily Pad', xp: 300, notes: 200,
      talk: 'This is it. Muffle sat on this marsh for years. Bring your best three.' },
    { id: 'done', n: 'Reed Marsh sings', goal: 'The road to Bell Foundry opens in a later preview', end: 1,
      talk: 'Listen to that. Reed Marsh sings again. Bell Foundry is next, when the road opens.' },
  ];
  R.TUTORIAL = {
    fight: { din: ['racket'], lv: 1 },
    friend: { din: ['hiss'], lv: 1, pet: 'peep', petLv: 1 },
  };

  /* ---------- story scenes: what the story screen plays ---------- */
  // bg: a Hushsong backdrop; mode: grey (no music), hush, sing. Each beat: who is on stage, and the line under it.
  R.TILLY = { n: 'Tilly', sprite: 'warble' };
  R.SCENES = {
    prologue: [
      { bg: 'fen', mode: 'grey', cast: [['racket', 0.22, 'drift'], ['hiss', 0.78, 'drift']], line: 'The world went quiet. The Din came, and they ate every song in Reed Marsh.' },
      { bg: 'fen', mode: 'grey', cast: [['warble', 0.5, 'walk']], who: 'Tilly', line: 'Oh! A traveller. Nobody has come down this road in years. I am Tilly. I used to play the dances here.' },
      { bg: 'fen', mode: 'grey', cast: [['warble', 0.3, 'idle'], ['shell', 0.66, 'hum']], who: 'Tilly', line: 'I kept this shell all that time. Listen. It still hums. I think it has been waiting for you.' },
      { bg: 'fen', mode: 'grey', cast: [['shell', 0.5, 'crack']], line: 'The shell cracks. Something inside is ready to sing.', pick: 1 },
      { bg: 'fen', mode: 'hush', cast: [['warble', 0.26, 'hop'], ['$starter', 0.66, 'pop']], who: 'Tilly', line: 'There it is, a song! Hushwick needs waking, and now you have a band. A band of one, for now.' },
    ],
    capture: [
      { bg: 'fen', mode: 'hush', cast: [['$band', 0.5, 'hop']], line: '$story0', ripple: 1 },
      { bg: 'fen', mode: 'sing', cast: [['$band', 0.5, 'hop']], line: '$story1' },
    ],
    chapel: [
      { bg: 'caves', mode: 'hush', cast: [['doo', 0.5, 'hum']], line: 'Deep in the chapel, a little songbook kept singing all alone. It flutters over to your band.' },
      { bg: 'caves', mode: 'sing', cast: [['$band', 0.5, 'hop']], line: 'The chapel bells ring under the water. Up above, the whole marsh hears them.' },
    ],
    bossopen: [
      { bg: 'fen', mode: 'hush', cast: [['muffle', 0.5, 'drift']], line: 'Every place in Reed Marsh sings. Out on the lake, The Lily Pad shakes off its fog. Muffle is waiting.' },
    ],
    finale: [
      { bg: 'fen', mode: 'sing', cast: [['$band', 0.5, 'hop']], line: 'Muffle is gone. The reeds rustle, the frogs sing in rounds, and the mill keeps time.', ripple: 1 },
      { bg: 'fen', mode: 'sing', cast: [['warble', 0.3, 'hop'], ['$lead', 0.68, 'hop']], who: 'Tilly', line: 'You did it. Reed Marsh sings again. The road to Bell Foundry is still full of noise, but it will not be for long.' },
    ],
  };
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
