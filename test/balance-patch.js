// Proposed balance changes, applied on top of the current data for a test run:
//   PATCH=test/balance-patch.js TAG=P node test/roles.js run <tier> <shard> <shards>
// Each line is one proposal. Own moves of evolved forms are scaled by MOVE_K, so their unscaled numbers live in fx0.
module.exports = (H) => {
  const F = H.FORMS, D = (to, x, o) => ['dmg', to, x, o || {}];
  const set = (id, slot, fx, cd) => { const ab = F[id][slot]; if (ab.fx0) ab.fx0 = fx; else ab.fx = fx; if (cd) ab.cd = cd; };
  const mk = (id, k) => (H.MOVE_K[id] = k);

  // roles: Healers get a little tougher
  Object.assign(H.ROLES.harmony, { hp: 1.07, poise: 4 });

  // stage 0 (Young pets: these moves are only used before the first evolution)
  set('bong', 'phrase', [D('one', 1.0, { st: [['stun', 1]] })], 4);
  set('clack', 'phrase', [D('one', 0.7, { h: 2 })]);
  set('howl', 'phrase', [D('all', 0.32, { st: [['pdown', 2]] })]);
  set('clang', 'beat', [D('one', 1.05)]); set('clang', 'phrase', [D('one', 1.3), ['shield', 'ally', 0.8]]);
  set('oompah', 'beat', [D('one', 1.15)]); set('oompah', 'phrase', [D('one', 2.0, { push: 0.5 })]);
  set('screech', 'phrase', [D('all', 0.9)]);
  set('doo', 'phrase', [['shield', 'allies', 0.9], ['cleanse', 'ally']]);
  set('peep', 'phrase', [D('one', 1.0), ['gauge', 'others', 0.25]]);
  set('blare', 'phrase', [D('one', 1.8), ['st', 'strong', 'pup', 2]]);
  set('wah', 'phrase', [D('all', 0.7, { st: [['offkey', 2]] })]);
  set('squeak', 'phrase', [D('one', 1.5, { drain: 0.5 })]);

  // stage 1
  mk('chromatic', 1.12); set('chromatic', 'phrase', [D('all', 0.45, { st: [['sdown', 1]] }), ['gauge', 'all', -0.15]]);
  set('quaver', 'beat', [D('one', 0.9, { st: [['poison', 1]] })]);
  set('highland', 'beat', [D('one', 0.8, { st: [['poison', 1]] })]);
  set('sousa', 'beat', [D('one', 0.9, { push: 0.2 }), ['shield', 'self', 0.4]]);
  F.jingle.passive.on.start = [['shield', 'allies', 0, { pct: 0.2 }]]; mk('jingle', 1.3);
  set('carousel', 'beat', [D('one', 0.7), ['heal', 'ally', 0.5]]); mk('carousel', 1.4);
  set('upright', 'beat', [D('one', 0.9), ['shield', 'self', 0.4]]); mk('upright', 1.4);
  mk('plunger', 1.5); set('plunger', 'phrase', [D('one', 1.1, { st: [['mute', 1], ['offkey', 3]] })]);

  // stage 2: children of changed stage-1 forms inherit those changes, so some are evened out here
  mk('mistral', 1.05); mk('sirocco', 0.95);                 // Chromatic line
  mk('nocturne', 1.5); F.nocturne.finale.fx0 = [['st', 'all', 'poison', 3], F.nocturne.finale.fx0[1]];   // Quaver line
  mk('pibroch', 1.5); mk('tattoo', 1.35);                   // Highland line
  mk('carillon', 1.2); mk('gamelan', 1.2);                  // Jingle line
  set('opera', 'finale', [D('all', 1.4, { shatter: 1, lone: 1.5 })]); mk('opera', 1.5);   // new: +150% when it is the last enemy standing
  mk('plainsong', 1.3); mk('soul', 1.0);
  set('vinyl', 'finale', [D('all', 0.65), ['flip', 'all'], ['st', 'all', 'offkey', 2]]);
  set('cadence', 'finale', [D('all', 0.75, { st: [['sdown', 1]] }), ['gauge', 'others', 0.25], ['shield', 'self', 0, { pct: 0.15 }]]);
  mk('jig', 1.05);
  set('riff', 'finale', [D('one', 2.3), ['st', 'self', 'pup', 2], ['ready', 'phrase'], ['shield', 'self', 0, { pct: 0.1 }]]);
  mk('boogie', 1.45);
  mk('blues', 0.75); mk('tamtam', 1.0); mk('grunge', 1.0);
  F.rumba.finale.cd = 6;

  H.applyMoveK();
};
