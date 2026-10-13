require('../src/data.js'); require('../src/engine.js'); require('../src/game.js'); const H = globalThis.H;
// boss fight win rates at given level for bands of final forms, fresh HP, 3 random ornaments
const bands = { glass: ['aria', 'riff', 'swing'], classic: ['cadence', 'shred', 'carol'], control: ['anthem', 'dirge', 'serenade'], mixed: ['roll', 'hymn', 'fanfare'], noheal: ['march', 'chant', 'shred'] };
const t1 = { glass: ['shout', 'pluck', 'toot'], classic: ['stomp', 'pluck', 'whistle'], control: ['bellow', 'drone', 'croon'], mixed: ['patter', 'croon', 'bellow'], noheal: ['stomp', 'shout', 'pluck'] };
const t0 = { glass: ['yelp', 'twang', 'blare'], classic: ['thud', 'twang', 'hum'], control: ['blare', 'hum', 'yelp'], mixed: ['thud', 'yelp', 'blare'], noheal: ['thud', 'yelp', 'twang'] };
function run(region, forms, lvl, hp, gear, enc) {
  const rnd = H.rng(9); let w = 0; const N = 400;
  for (let i = 0; i < N; i++) {
    const S = H.newState(); forms.forEach((f) => { const p = H.addPet(S, H.FORMS[f].sp, null); p.form = f; for (let g = 0; g < gear; g++) p.gear[g] = H.pick(H.GEAR_ORDER, rnd); if (p.gear[0] === p.gear[1]) p.gear[1] = null; }); S.level = lvl;
    const dv = H.genDelve(S, region, enc, rnd); dv.ornaments = H.shuffle(Object.keys(H.ORNAMENTS), rnd).slice(0, 3); for (const k in dv.hp) dv.hp[k] = hp;
    const b = H.startBattle(S, dv, dv.cols[6][0], rnd); if (H.autoRun(b, true)) w++;
  }
  return (w / N * 100).toFixed(0).padStart(3) + '%';
}
for (const k in bands) console.log(k.padEnd(8), 'fen T0@3:', run('fen', t0[k], 3, 0.8, 0), '| works T1@6:', run('works', t1[k], 6, 0.8, 1), '| ridge T1@8:', run('ridge', t1[k], 8, 0.8, 1), 'T2@9:', run('ridge', bands[k], 9, 0.8, 1), '| hall T2@11:', run('hall', bands[k], 11, 0.8, 2), 'T2@13:', run('hall', bands[k], 13, 0.8, 2), '| encore fen T2@13:', run('fen', bands[k], 13, 0.8, 2, true), 'T2@15:', run('fen', bands[k], 15, 0.8, 2, true), 'ridge@17:', run('ridge', bands[k], 17, 0.8, 2, true), 'hall T2@20:', run('hall', bands[k], 20, 0.8, 2, true));
console.log('glass vs hall boss by level:', [12, 14, 16, 18, 20].map((l) => l + ':' + run('hall', bands.glass, l, 0.8, 2)).join('  '));
console.log('all-lead2 (roll,shred,scherzo):', [12, 14, 16].map((l) => l + ':' + run('hall', ['roll', 'shred', 'scherzo'], l, 0.8, 2)).join('  '));
console.log('all-harmony (carol,ballad,hymn):', [12, 14, 16].map((l) => l + ':' + run('hall', ['carol', 'ballad', 'hymn'], l, 0.8, 2)).join('  '));
console.log('all-bass (dirge,samba,nocturne):', [12, 14, 16].map((l) => l + ':' + run('hall', ['dirge', 'samba', 'nocturne'], l, 0.8, 2)).join('  '));
console.log('all-rhythm (march,polka,anthem):', [12, 14, 16].map((l) => l + ':' + run('hall', ['march', 'polka', 'anthem'], l, 0.8, 2)).join('  '));
