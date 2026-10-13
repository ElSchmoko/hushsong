require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const H = globalThis.H; const [a,b] = process.argv.slice(2).map(Number); H.DIN_K = [a,b];
process.argv[2] = 'campaign'; const v = process.argv[4]; process.argv[3] = v; 
require('./sim.js');
