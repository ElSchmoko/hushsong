require('../src/data.js'); require('../src/engine.js'); require('../src/game.js'); const H = globalThis.H;
const [slope, hk, vk, xpa] = process.argv.slice(2).map(Number);
H.stageLevel = (n) => 1 + Math.round((n - 1) * slope); H.DIN_K = [hk, vk]; if (xpa) H.xpNeed = (L) => 24 + xpa * (L - 1);
process.argv[2] = 'run'; process.argv[3] = '40'; require('./sim.js');
