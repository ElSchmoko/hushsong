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

    // Bell Foundry: the second region, east of Reedwick. Opens once Muffle is beaten.
    { id: 'w_cinder', reg: 'works', at: [24, -5], fit: 'flat', cap: 1, n: 'Cinderford', kind: 'Town', venue: 'The Bellows', art: 'rd_reed', lv: [12, 14], din: ['clank', 'racket', 'bash'], keeper: 'clank', yield: 4, bonus: { xp: 0.03 }, smith: 1,
      story: ['The bellows breathe', 'The big bellows in the square wheeze, then puff, then puff in time. Somebody starts hammering along.'] },
    { id: 'w_kiln', reg: 'works', at: [35, -2], fit: 'hills', cap: 1, n: 'Kiln Rise', kind: 'Watch hill', venue: 'The Warm Step', art: 'rd_lantern', lv: [13, 15], din: ['beep', 'tick', 'clank'], keeper: 'tick', yield: 3, bonus: { poise: 3 },
      story: ['The kilns glow', 'One by one the kilns on the rise light up. Each one rings a little as it warms, like a glass tapped with a spoon.'] },
    { id: 'w_bell', reg: 'works', at: [41, -15], fit: 'flat', cap: 1, n: 'Bellwright', kind: 'Workshop town', venue: 'The Clapper', art: 'rd_mill', lv: [14, 16], din: ['bash', 'whine', 'clatter'], keeper: 'bash', yield: 4, bonus: { tempo: 0.02 }, merchant: 1,
      story: ['Every bell at once', 'Hundreds of half-made bells hang in the workshops. A breeze goes through, and all of them answer.'] },
    { id: 'w_ash', reg: 'works', at: [30, -26], fit: 'woods', cap: 1, n: 'Ashwood', kind: 'Hamlet', venue: 'The Soot Owl', art: 'rd_frog', lv: [15, 17], din: ['clatter', 'creak', 'tick'], keeper: 'creak', yield: 3, bonus: { join: 0.03 },
      story: ['Birds in the ash', 'The grey trees shake off their soot. Underneath, the leaves are green, and full of birds that had forgotten how to sing.'] },
    { id: 'w_forge', reg: 'works', at: [21, -18], fit: 'hills', cap: 1, n: 'Old Forge', kind: 'Forge', venue: 'The Anvil Arms', art: 'rd_hush', lv: [16, 18], din: ['racket', 'beep', 'bash'], keeper: 'beep', yield: 3, bonus: { hp: 0.03 },
      story: ['Hammer and tongs', 'The old smith picks up her hammer for the first time in years. Clang, clang-clang. It sounds a lot like a drum solo.'] },
    { id: 'w_anvil', reg: 'works', at: [33, -14], fit: 'flat', n: 'The Great Anvil', kind: 'Boss stage', art: 'rd_bandstand', boss: 'shush', adds: ['whine', 'bash'], lv: [20, 18], stage: 1,
      bossD: 'Shush keeps the whole foundry quiet with one finger to its lips. Bring your best three.', doneD: 'Shush is gone. The smiths use the anvil as a stage now.' },
    { id: 'w_page', reg: 'works', at: [44, -4], fit: 'flat', n: 'A torn page', kind: 'Secret', art: 'rd_page', secret: 'page', song: 'Anvil Chorus' },
    { id: 'w_glade', reg: 'works', at: [27, -34], fit: 'woods', n: 'A cold furnace', kind: 'Secret', art: 'rd_glade', secret: 'pet', pet: 'thrum', lv: 16 },

    // Windy Dunes: the third region, south of the Old Mill. Opens once Shush is beaten.
    { id: 'd_well', reg: 'dunes', at: [13, 24], fit: 'shore', cap: 1, n: 'Palm Well', kind: 'Oasis town', venue: 'The Cool Cup', art: 'rd_frog', lv: [19, 21], din: ['rustle', 'whoosh', 'squawk'], keeper: 'squawk', yield: 4, bonus: { hp: 0.03 }, smith: 1,
      story: ['Water music', 'The well fills up. A bucket drops, splash, and the palms start swaying like they are at a dance.'] },
    { id: 'd_tents', reg: 'dunes', at: [26, 25], fit: 'flat', cap: 1, n: 'Tent Market', kind: 'Market', venue: 'The Striped Tent', art: 'rd_reed', lv: [20, 22], din: ['whine', 'peck', 'rustle'], keeper: 'peck', yield: 4, bonus: { xp: 0.03 }, merchant: 1,
      story: ['The tents go up', 'Canvas snaps open in the wind. Traders call out prices, and every one of them sings it.'] },
    { id: 'd_mesa', reg: 'dunes', at: [34, 36], fit: 'hills', cap: 1, n: 'Red Mesa', kind: 'Watch hill', venue: 'The Echo Ledge', art: 'rd_lantern', lv: [21, 23], din: ['crackle', 'whoosh', 'squeal'], keeper: 'crackle', yield: 3, bonus: { poise: 3 },
      story: ['Echoes', 'Shout from the top of the mesa and the cliffs shout back, three times, in harmony.'] },
    { id: 'd_pipe', reg: 'dunes', at: [7, 35], fit: 'flat', cap: 1, n: 'Windpipe', kind: 'Hamlet', venue: 'The Whistle', art: 'rd_mill', lv: [22, 24], din: ['whoosh', 'squawk', 'crackle'], keeper: 'whoosh', yield: 3, bonus: { tempo: 0.02 },
      story: ['The wind finds a tune', 'Wind blows through the old clay pipes on the roofs. For years it only moaned. Today it plays a lullaby.'] },
    { id: 'd_stair', reg: 'dunes', at: [20, 41], fit: 'flat', cap: 1, n: 'Sunken Stair', kind: 'Ruin', venue: 'The Low Step', art: 'rd_hush', lv: [23, 25], din: ['squeal', 'peck', 'rustle'], keeper: 'squeal', yield: 3, bonus: { join: 0.03 },
      story: ['Steps out of the sand', 'The wind clears the sand off an old stair. Each step rings a different note as you climb it.'] },
    { id: 'd_stage', reg: 'dunes', at: [22, 33], fit: 'flat', n: 'The Sand Stage', kind: 'Boss stage', art: 'rd_bandstand', boss: 'gale', adds: ['rustle', 'whoosh'], lv: [27, 25], stage: 1,
      bossD: 'Gale blows every song in the dunes away before it can finish. Bring your best three.', doneD: 'Gale has blown itself out. The wind just carries the tunes now.' },
    { id: 'd_page', reg: 'dunes', at: [37, 21], fit: 'flat', n: 'A torn page', kind: 'Secret', art: 'rd_page', secret: 'page', song: 'Desert Song' },
    { id: 'd_glade', reg: 'dunes', at: [2, 27], fit: 'woods', n: 'A shady hollow', kind: 'Secret', art: 'rd_glade', secret: 'pet', pet: 'huff', lv: 23 },
  ];
  for (const p of R.PLACES) p.reg = p.reg || 'marsh';
  R.PLACES.find((p) => p.id === 'lily').bossD = 'Muffle has sat on this marsh for years. Bring your best three.';
  R.PLACES.find((p) => p.id === 'lily').doneD = 'Muffle is gone. The frogs have taken the stage.';
  // the regions in order: each boss opens the next one
  R.REGIONS = { marsh: { stage: 'lily', opens: 'works', bg: 'fen' }, works: { stage: 'w_anvil', opens: 'dunes', bg: 'works' }, dunes: { stage: 'd_stage', bg: 'dunes' } };
  R.LINKS = [['hush', 'lily'], ['lily', 'mill'], ['lily', 'frog'], ['lily', 'lantern'], ['lily', 'reed'], ['hush', 'chapel'], ['mill', 'reed'],
    ['reed', 'w_cinder'], ['w_cinder', 'w_anvil'], ['w_anvil', 'w_kiln'], ['w_anvil', 'w_bell'], ['w_anvil', 'w_ash'], ['w_cinder', 'w_forge'], ['w_forge', 'w_ash'],
    ['mill', 'd_well'], ['d_well', 'd_stage'], ['d_stage', 'd_tents'], ['d_stage', 'd_stair'], ['d_tents', 'd_mesa'], ['d_stair', 'd_pipe'], ['d_well', 'd_pipe']];
  R.CAPS = R.PLACES.filter((p) => p.cap).map((p) => p.id);

  /* ---------- wild pets: which ground they like ---------- */
  // Each patrol may hold a wild pet, taken from the pets of the ground it stands on.
  R.WILD = {
    marsh: { shore: ['yelp'], meadow: ['peep', 'clack'], woods: ['squeak', 'tock'], hills: ['plink'] },
    works: { shore: ['wah'], meadow: ['clang', 'tink'], woods: ['bong', 'oompah'], hills: ['blare'] },
    dunes: { shore: ['chatter'], meadow: ['skirl', 'bop'], woods: ['screech'], hills: ['warble'] },
  };
  // the pets that live in each region: find them all for a shell
  R.BOOKS = { marsh: ['peep', 'clack', 'yelp', 'squeak', 'tock', 'plink', 'doo', 'jangle'], works: ['clang', 'tink', 'bong', 'oompah', 'blare', 'wah', 'thrum'], dunes: ['skirl', 'bop', 'chatter', 'screech', 'warble', 'huff'] };
  R.SONGBOOK = R.BOOKS.marsh;
  R.WILD_CHANCE = 0.45;
  // join chance, in parts of 1: shown on screen before and after every fight
  R.JOIN = { base: 0.15, dinFirst: 0.15, same: 0.2, perMeet: 0.05, meetMax: 0.25 };

  /* ---------- growing ---------- */
  R.petNeed = (lv) => 50 + 30 * lv;
  R.playerNeed = (lv) => 120 + 100 * lv;
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
    { id: 'marsh', all: 'marsh', n: 'Free Reed Marsh', goal: 'Capture every place', xp: 200, notes: 100,
      talk: 'Four more places to wake. When all five sing, The Lily Pad opens. Muffle waits there.' },
    { id: 'boss', boss: 'marsh', n: 'The Lily Pad', goal: 'Beat Muffle at The Lily Pad', xp: 300, notes: 200,
      talk: 'This is it. Muffle sat on this marsh for years. Bring your best three.' },
    { id: 'east', cap: 'w_cinder', n: 'The road east', goal: 'Follow the road past Reedwick and wake Cinderford', xp: 150, notes: 80,
      talk: 'Hear that clanging to the east? The road to Bell Foundry is open. The Din there are tougher, so take your time on the way.' },
    { id: 'works', all: 'works', n: 'Free Bell Foundry', goal: 'Capture every place in Bell Foundry', xp: 300, notes: 150,
      talk: 'Five places in the foundry. Wake them all and The Great Anvil opens. Keep an ear out for new pets in the ash woods.' },
    { id: 'boss2', boss: 'works', n: 'The Great Anvil', goal: 'Beat Shush at The Great Anvil', xp: 400, notes: 300,
      talk: 'Shush is up on the anvil. It hates noise more than anything. Let us be very, very loud.' },
    { id: 'south', cap: 'd_well', n: 'The road south', goal: 'Follow the road past the Old Mill and wake Palm Well', xp: 200, notes: 100,
      talk: 'The wind turned. South of the mill, the road to Windy Dunes is clear. Bring water.' },
    { id: 'dunes', all: 'dunes', n: 'Free Windy Dunes', goal: 'Capture every place in Windy Dunes', xp: 400, notes: 200,
      talk: 'Five places hide in the sand. Wake them all and The Sand Stage rises.' },
    { id: 'boss3', boss: 'dunes', n: 'The Sand Stage', goal: 'Beat Gale at The Sand Stage', xp: 500, notes: 400,
      talk: 'Gale is the loudest thing we have met. Hold on to your hats.' },
    { id: 'done', n: 'Three regions sing', goal: 'More roads open in a later preview', end: 1,
      talk: 'Marsh, foundry and dunes, all singing. The Snowy Ridge is still deep in noise. That road opens in a later preview.' },
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
      { bg: '$reg', mode: 'hush', cast: [['$band', 0.5, 'hop']], line: '$story0', ripple: 1 },
      { bg: '$reg', mode: 'sing', cast: [['$band', 0.5, 'hop']], line: '$story1' },
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
      { bg: 'fen', mode: 'sing', cast: [['warble', 0.3, 'hop'], ['$lead', 0.68, 'hop']], who: 'Tilly', line: 'You did it. Reed Marsh sings again. Listen, east of Reedwick. The noise on the road to Bell Foundry is thinning.' },
    ],
    bossopen_works: [
      { bg: 'works', mode: 'hush', cast: [['shush', 0.5, 'drift']], line: 'Every place in Bell Foundry rings. On The Great Anvil, Shush raises one finger to its lips.' },
    ],
    finale_works: [
      { bg: 'works', mode: 'sing', cast: [['$band', 0.5, 'hop']], line: 'Shush is gone. Every bell in the foundry rings at once, and nobody tells them to stop.', ripple: 1 },
      { bg: 'works', mode: 'sing', cast: [['warble', 0.3, 'hop'], ['$lead', 0.68, 'hop']], who: 'Tilly', line: 'Feel that warm wind from the south? The road past the Old Mill is open. Windy Dunes is next.' },
    ],
    bossopen_dunes: [
      { bg: 'dunes', mode: 'hush', cast: [['gale', 0.5, 'drift']], line: 'Every place in Windy Dunes sings. The sand slides away from The Sand Stage. Gale howls on top of it.' },
    ],
    finale_dunes: [
      { bg: 'dunes', mode: 'sing', cast: [['$band', 0.5, 'hop']], line: 'Gale blows itself out. The wind goes on, softer now, and it carries every song across the sand.', ripple: 1 },
      { bg: 'dunes', mode: 'sing', cast: [['warble', 0.3, 'hop'], ['$lead', 0.68, 'hop']], who: 'Tilly', line: 'Three regions singing! The Snowy Ridge is still lost in noise. That road opens in a later preview.' },
    ],
  };
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
