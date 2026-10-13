/* Hushsong — icons, pixel font, props and region backdrops. */
(function (H) {
  'use strict';
  const A = H.Art, R = A.ramp, I = A.int;

  /* ----- ASCII-mapped icons (1px padding so the outline fits) ----- */
  const ascii = (key, rows, pal) => {
    const w = Math.max(...rows.map((r) => r.length)), h = rows.length;
    A.def(key, w + 2, h + 2, (g) => rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.' && ch !== ' ') { const c = pal[ch]; g.raw(x + 1, y + 1, typeof c === 'number' ? c : I(c)); } })));
  };
  // families
  ascii('fam_drum', ['.wwwwwww.', 'wcccccccw', 'wcccccccw', '.wwwwwww.', '.oyoyoyo.', '.yoyoyoy.', '.oyoyoyo.', '.wwwwwww.', '..w...w..'], { w: '#8a4f2c', c: '#f3dfb4', o: '#f08a3c', y: '#ffc27a' });
  ascii('fam_string', ['G.......G', 'G.l.l.l.G', 'G.l.l.l.G', 'G.l.l.l.G', 'gGl.l.lGg', '.gGGGGGg.', '...gGg...', '..gGGGg..', '.gGGGGGg.'], { G: '#74d68e', g: '#3f9a5a', l: '#d8ffe0' });
  ascii('fam_breath', ['Bb.Bb.Bb.', 'Bb.Bb.Bb.', 'Bb.Bb.Bb.', 'Bb.Bb.Bb.', 'wwwwwwww.', 'Bb.Bb.Bb.', 'Bb.Bb....', 'Bb.Bb....', 'Bb.......'], { B: '#a8e6ff', b: '#4f9ad0', w: '#f3dfb4' });
  ascii('fam_brass', ['.......yY', '.....yyYY', 'yyyyyyYWY', 'YYYYYYWWY', 'yyyyyyYWY', '.d.d.yyYY', '.d.d...yY', '.........'], { y: '#c8962a', Y: '#f2c744', W: '#fff2b0', d: '#b9b6cc' });
  ascii('fam_voice', ['.ppppppp.', 'pPPPPPPPp', 'pwdwdwdwp', 'pdddddddp', 'pddrrrddp', 'pdrrrrrdp', '.pPPPPPp.', '..ppppp..'], { p: '#c8507a', P: '#f27aa8', d: '#4a1830', r: '#ff8aa0', w: '#fff8ea' });
  ascii('fam_none', ['.........', '..sssss..', '..sssss..', 'SSSSSSSSS', '.........', '....s....', '...sss...', '....s....'], { s: '#b9b4d6', S: '#8a84b0' });
  // roles
  ascii('role_rhythm', ['.sssss.', 'sSSSSSs', 'sSSwSSs', 'sSSwSSs', 'sSSSSSs', '.sSSSs.', '..sSs..', '...s...'], { s: '#6a84c0', S: '#9ab4f0', w: '#fff8ea' });
  ascii('role_lead', ['...y...', '...y...', '..yYy..', 'yyYWYyy', '.yYWYy.', '..yYy..', '.yy.yy.', 'yy...yy'], { y: '#e0a020', Y: '#ffd24a', W: '#fff8ea' });
  ascii('role_harmony', ['.gg.gg.', 'gGGgGGg', 'gGWGGGg', 'gGGGGGg', '.gGGGg.', '..gGg..', '...g...'], { g: '#3f9a5a', G: '#7fe09a', W: '#fff8ea' });
  ascii('role_bass', ['..ppp..', '..p.p..', '..ppp..', '...p...', 'p..p..p', 'pp.p.pp', '.ppppp.', '..ppp..'], { p: '#a890e0' });
  ascii('role_stray', ['.......', '..sss..', '.s...s.', '....s..', '...s...', '.......', '...s...'], { s: '#b9b4d6' });
  // statuses (7x7)
  const up = '#ffd24a', dn = '#ff6a7a', cc = '#b8a0ff', gd = '#7fe09a';
  ascii('st_sharp', ['..x.x..', '..x.xxx', 'xxxxx..', '..x.x..', '..xxxxx', 'xxx.x..', '..x.x..'], { x: up });
  ascii('st_flat', ['.x.....', '.x.....', '.x.....', '.xxxx..', '.x...x.', '.x..x..', '.xxx...'], { x: dn });
  ascii('st_rush', ['x..x...', '.x..x..', '..x..x.', '...x..x', '..x..x.', '.x..x..', 'x..x...'], { x: up });
  ascii('st_drag', ['...x..x', '..x..x.', '.x..x..', 'x..x...', '.x..x..', '..x..x.', '...x..x'], { x: dn });
  ascii('st_rest', ['..x....', '...x...', '..xx...', '.xx....', '..xx...', '...x.x.', '....x..'], { x: cc });
  ascii('st_lull', ['...xxx.', '..xx...', '.xx....', '.xx....', '.xx....', '..xx..x', '...xxx.'], { x: cc });
  ascii('st_dis', ['x......', 'xx...x.', '.xx.xx.', '..xxx..', '.xx.xx.', '.x...xx', '......x'], { x: dn });
  ascii('st_spot', ['...x...', '...x...', '.xxxxx.', 'xxxxxxx', '.xxxxx.', '..x.x..', '.x...x.'], { x: up });
  ascii('st_refrain', ['.......', '..xxx..', '..xxx..', 'xxxxxxx', 'xxxxxxx', '..xxx..', '..xxx..'], { x: gd });
  ascii('st_offbeat', ['.xx....', 'x..x...', '...x.xx', '..x.x..', '.x..x.x', '.....x.', '....x..'], { x: '#a8e6ff' });
  ascii('st_marked', ['...x...', '.xxxxx.', '.x...x.', 'xx.x.xx', '.x...x.', '.xxxxx.', '...x...'], { x: dn });
  ascii('st_hearty', ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'], { x: '#ff8aa0' });
  ascii('st_damper', ['xxxxxxx', 'xwwxxxx', 'xwxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'], { x: '#9ab4f0', w: '#fff8ea' });
  // currency and small marks
  ascii('ic_note', ['...xxx', '...x.x', '...x..', '...x..', '.xxx..', 'xxxx..', '.xx...'], { x: '#ffe58a' });
  ascii('ic_xp', ['...x...', '..xxx..', 'xxxxxxx', '.xxxxx.', '.xx.xx.', 'xx...xx'], { x: '#a8e6ff' });
  ascii('ic_lock', ['..xxx..', '.x...x.', '.x...x.', 'xxxxxxx', 'xxx.xxx', 'xxx.xxx', 'xxxxxxx'], { x: '#8a84b0' });
  ascii('ic_orn', ['x.....x.x', 'xxx.xx.x.', 'x.x.x....', 'x.x.x....', '.xx.x....'], { x: '#ffe58a' });
  ascii('ic_gear', ['..x.x..', '.xxxxx.', 'xx...xx', '.x...x.', 'xx...xx', '.xxxxx.', '..x.x..'], { x: '#efe6d0' });
  ascii('ic_cue', ['.......xx', '......xx.', '.....xx..', '....xx...', '...xx....', '.wxx.....', 'www......', '.w.......'], { x: '#fff8ea', w: '#e9b93a' });

  /* ----- map node icons (15x15 drawn) ----- */
  const node = (key, fn) => A.def(key, 15, 15, (g) => { g.at(7, 7, 1); fn(g); });
  node('node_fight', (g) => { const t = R('#8f93b0'); g.E(0, 0.5, 4.6, 4.2, t, {}); for (const [x, y] of [[-5, -4], [5, -4], [-6, 1], [6, 2], [0, -6]]) g.px(x, y, t[3]); g.px(-2, -1, A.WHITE).px(2, -1, A.WHITE).px(-2, 0, I('#ff5a6a')).px(2, 0, I('#ff5a6a')); g.L(-2, 3, 2, 3, A.EYE, 1); });
  node('node_elite', (g) => { const t = R('#d85a5a'); g.E(0, 1, 4.8, 4.4, t, {}); g.P([[-5, -1], [-3, -3], [-6, -6]], t, 3); g.P([[5, -1], [3, -3], [6, -6]], t, 3); g.px(-2, 0, A.WHITE).px(2, 0, A.WHITE).px(-2, 1, A.EYE).px(2, 1, A.EYE); g.L(-2, 4, 2, 4, A.EYE, 1); g.px(0, -6, I('#ffd24a'), 1); });
  node('node_event', (g) => { const p = R('#a890e0'); g.E(0, -1, 5.4, 4.6, p, {}); g.P([[-3, 2], [0, 2], [-4, 6]], p, 1); const w = A.WHITE; g.px(-1, -4, w).px(0, -4, w).px(1, -3, w).px(0, -2, w).px(0, -1, w).px(0, 1, w); });
  node('node_rest', (g) => { const w = R('#8a4f2c'), f = R('#ff9a3a'); g.L(-5, 5, 4, 3, w[1], 2); g.L(5, 5, -4, 3, w[2], 2); g.P([[-3, 3], [3, 3], [1, -2], [2, -5], [-1, -3], [-2, -6]], f, 2, true); g.px(0, 1, I('#fff2a0'), 1).px(0, 0, I('#fff2a0'), 1).px(-1, 1, I('#fff2a0'), 1); });
  node('node_shell', (g) => { const s = R('#f3dfb4'), p = R('#f27aa8'); g.E(0, 1, 5, 4.4, s, {}); g.E(-2, -3, 2.6, 2.4, s, { sep: 1 }); g.px(-3, -5, s[3]); g.E(2, 2, 2.4, 2, p, { flat: 2, glow: 1 }); g.px(-2, 1, s[1]).px(-1, 3, s[1]).px(0, -1, s[1]); });
  node('node_boss', (g) => { const m = R('#f0ecf8'); g.E(0, 0, 6, 6, m, {}); g.Q(-4, 1, 0, -6, 4, 1, A.EYE, 1); g.px(0, 1, A.EYE).px(-1, 1, A.EYE).px(0, 2, A.EYE).px(-1, 2, A.EYE); g.px(-1, 1, I('#ffb23a'), 1); });

  /* ----- gear (16x16 drawn) ----- */
  const gear = (key, fn) => A.def('gear_' + key, 18, 18, (g) => { g.at(9, 9, 1); fn(g); });
  const wood = R('#a8643a'), gold = R('#e9b93a'), steel = R('#b9b6cc'), ink = R('#3a3154'), cream = R('#f3dfb4');
  gear('metronome', (g) => { g.P([[-5, 7], [5, 7], [2, -7], [-2, -7]], wood, 2); g.P([[2, 7], [5, 7], [2, -7], [1, -7]], wood, 1); g.R(-5, 6, 11, 2, wood, 0); g.L(0, 5, 3, -5, steel[4], 1); g.px(2, -2, gold[3], 1).px(3, -2, gold[3], 1); });
  gear('strap', (g) => { const l = R('#b0623a'); g.Q(-6, -6, -8, 4, 0, 7, l[2], 3); g.Q(0, 7, 8, 4, 6, -6, l[1], 3); g.R(-2, 5, 5, 4, gold, 2); g.R(-1, 6, 3, 2, ink, 1); });
  gear('amp', (g) => { g.R(-6, -6, 13, 13, ink, 2); g.R(-6, -6, 13, 2, ink, 3); g.E(0.5, 1.5, 4, 4, steel, {}); g.E(0.5, 1.5, 1.6, 1.6, ink, { flat: 0 }); g.px(-4, -5, I('#ff5a6a'), 1).px(-2, -5, gold[3]).px(0, -5, gold[3]); });
  gear('rosin', (g) => { const a = R('#e8a030'); g.R(-6, 1, 13, 5, R('#8a3a4a'), 2); g.R(-4, -5, 9, 8, a, 2); g.R(-4, -5, 9, 2, a, 3); g.R(3, -5, 2, 8, a, 1); g.px(-3, -4, a[4], 1).px(-2, -4, a[4], 1); });
  gear('capo', (g) => { g.R(-6, -5, 12, 3, ink, 2); g.R(-6, -5, 12, 1, ink, 3); g.R(4, -5, 3, 11, ink, 1); g.R(-6, 0, 9, 2, steel, 2); g.L(-4, 2, 3, 6, steel[1], 2); g.px(-6, -2, gold[3], 1); });
  gear('mallet', (g) => { g.L(-6, 7, 2, -1, wood[2], 2); g.E(3.5, -3.5, 4, 4, R('#e8e2f0'), {}); });
  gear('earplugs', (g) => { const f = R('#ff9a5a'); g.E(-3, 0, 2.6, 4.4, f, {}); g.E(4, 1, 2.6, 4.4, f, {}); g.Q(-3, -4, 0, -9, 4, -3, I('#a8e6ff'), 1); });
  gear('fork', (g) => { g.R(-3, -7, 2, 9, steel, 2); g.R(2, -7, 2, 9, steel, 3); g.R(-3, 1, 7, 2, steel, 1); g.R(0, 3, 2, 5, steel, 1); g.px(-5, -6, I('#a8e6ff'), 1).px(5, -6, I('#a8e6ff'), 1).px(-5, -3, I('#a8e6ff'), 1).px(5, -3, I('#a8e6ff'), 1); });
  gear('reed', (g) => { const r = R('#e0c890'); g.P([[-3, 7], [3, 7], [2, -7], [-2, -7]], r, 2); g.P([[1, 7], [3, 7], [2, -7], [1, -7]], r, 1); g.R(-3, 2, 7, 2, R('#d8403a'), 2); g.px(-1, -6, r[4]); });
  gear('pick', (g) => { const p = R('#3fb8b0'); g.P([[-6, -5], [6, -5], [0, 8]], p, 2); g.P([[2, -5], [6, -5], [0, 8]], p, 1); g.R(-6, -6, 13, 2, p, 3); g.px(-1, -1, gold[4], 1).px(0, -2, gold[4], 1).px(1, -1, gold[4], 1).px(0, 0, gold[4], 1); });
  gear('drumkey', (g) => { g.R(-6, -6, 13, 3, steel, 2); g.R(-6, -6, 13, 1, steel, 4); g.R(-1, -3, 3, 9, steel, 1); g.R(-2, 5, 5, 3, steel, 0); g.px(0, 6, A.EYE); });
  gear('collar', (g) => { const l = R('#d8403a'); g.E(0, -1, 7, 5, l, { hi: false }); g.E(0, -1, 4.6, 2.8, ink, { flat: 0 }); g.E(0, 5, 2.6, 2.6, gold, { glow: 1 }); g.px(0, 7, A.EYE); });
  gear('score', (g) => { g.R(-5, -7, 11, 15, cream, 2); g.R(4, -7, 2, 15, cream, 1); g.P([[2, -7], [6, -7], [6, -3]], ink, 0); g.P([[2, -7], [2, -3], [6, -3]], cream, 1); for (const y of [-2, 1, 4]) g.R(-3, y, 7, 1, ink, 2); g.px(-2, 0, A.EYE).px(1, 3, A.EYE).px(2, 3, A.EYE); });
  gear('string', (g) => { g.E(0, 0, 6.5, 6.5, steel, { flat: 2 }); g.E(0, 0, 4.6, 4.6, ink, { flat: 0 }); g.E(0, 0, 3, 3, steel, { flat: 3 }); g.E(0, 0, 1.4, 1.4, ink, { flat: 0 }); g.L(5, 3, 8, 7, steel[4], 1); g.px(-4, -5, I('#a8f5b8'), 1); });
  gear('oil', (g) => { const b = R('#5ab0d8'); g.R(-3, -2, 7, 9, b, 2); g.R(2, -2, 2, 9, b, 1); g.R(-3, -2, 2, 9, b, 3); g.R(-1, -5, 3, 3, steel, 2); g.R(-2, -7, 5, 2, R('#d8403a'), 2); g.R(-2, 1, 5, 3, cream, 2); });
  gear('baton', (g) => { g.L(-7, 6, 0, -1, cream[2], 1); g.E(-6.5, 6.5, 2.2, 2.2, wood, {}); g.L(2, -3, 4, -5, cream[3], 1); g.px(5, -7, gold[4], 1).px(1, -1, I('#ffd24a'), 1).px(3, 0, I('#ffd24a'), 1); });

  /* ----- props ----- */
  const shellCols = { starter: ['#f3dfb4', '#f27aa8'], fen: ['#8fd0c0', '#a8f5b8'], works: ['#e0a070', '#ffb066'], ridge: ['#d8e4f8', '#a8e6ff'], hall: ['#b8a0e8', '#ffa6cc'] };
  for (const k in shellCols) A.def('shell_' + k, 34, 34, (g, f) => {
    g.at(17, 30, 1); const s = R(shellCols[k][0]), p = R(shellCols[k][1]), b = f ? 1 : 0;
    g.E(1, -11 + b, 12.5, 10.5, s, {}); g.E(-7, -20 + b, 6.5, 5.5, s, { sep: 1 }); g.E(-11, -25 + b, 3.4, 3, s, { sep: 1 }); g.px(-13, -28 + b, s[3]);
    // spiral ribs
    for (const [x0, y0, cx, cy, x1, y1] of [[-8, -14, -2, -22, 8, -18], [-10, -8, 0, -17, 12, -12], [-9, -3, 2, -10, 13, -6]]) g.Q(x0, y0 + b, cx, cy + b, x1, y1 + b, s[1], 1);
    // the mouth of the shell, where the sound lives
    g.E(4, -7 + b, 5.5, 4.2, p, { glow: 1 }); g.E(5, -6.5 + b, 3, 2, R('#3a2040'), { flat: 1 });
  });
  A.def('fire', 20, 20, (g, f) => {
    g.at(10, 18, 1); const w = R('#7a4326'), fl = R('#ff9a3a'), y = R('#ffe27a');
    g.L(-7, -1, 5, -4, w[1], 3); g.L(7, -1, -5, -4, w[2], 3);
    if (f) { g.P([[-5, -4], [5, -4], [3, -9], [4, -14], [0, -10], [-3, -15], [-4, -8]], fl, 2, true); g.P([[-2, -4], [3, -4], [1, -9], [-1, -7]], y, 3, true); }
    else { g.P([[-5, -4], [5, -4], [4, -10], [1, -16], [-1, -11], [-4, -13], [-3, -8]], fl, 2, true); g.P([[-3, -4], [2, -4], [1, -10], [-1, -8]], y, 3, true); }
  });
  A.def('wagon', 76, 56, (g, f) => {
    g.at(38, 53, 1); const wd = R('#9a5a34'), wd2 = R('#7a4326'), can = R('#e8dcc0'), gd = R('#e9b93a');
    // canvas top
    g.E(0, -30, 27, 16, can, {}); g.R(-27, -30, 55, 14, can, 2); g.R(18, -30, 9, 14, can, 1); g.R(-27, -30, 4, 14, can, 3);
    for (const x of [-14, 0, 14]) g.L(x, -44, x, -17, can[1], 1);
    // patched cloth and a painted note
    g.R(-11, -27, 6, 5, R('#c85a5a'), 2); A.note(g, -3, -40, I('#3a3154'));
    // body
    g.R(-29, -17, 59, 12, wd, 2); g.R(-29, -17, 59, 2, wd, 3); g.R(-29, -7, 59, 2, wd, 0); for (let x = -22; x < 28; x += 9) g.L(x, -15, x, -7, wd[1], 1);
    // window, lit from inside
    g.R(6, -15, 9, 7, wd2, 1); g.R(7, -14, 7, 5, null, I(f ? '#ffd27a' : '#ffbe5a'), true); g.L(10, -14, 10, -10, wd2[0], 1);
    // door step and shaft
    g.R(-36, -8, 8, 2, wd2, 2); g.L(29, -8, 37, -3, wd2[1], 2);
    // wheels
    for (const x of [-17, 17]) { g.E(x, -5, 7.5, 7.5, wd2, { flat: 1 }); g.E(x, -5, 5.5, 5.5, R('#221d42'), { flat: 2 }); g.L(x - 5, -5, x + 5, -5, wd2[2], 1); g.L(x, -10, x, 0, wd2[2], 1); g.L(x - 3, -8, x + 3, -2, wd2[1], 1); g.L(x + 3, -8, x - 3, -2, wd2[1], 1); g.E(x, -5, 1.6, 1.6, gd, {}); }
    // lantern on a hook
    g.L(-29, -30, -34, -32, wd2[1], 1); g.L(-34, -32, -34, -28, wd2[1], 1); g.R(-36, -28, 5, 6, gd, 1); g.R(-35, -27, 3, 4, null, I('#fff2a0'), true);
    // bunting
    const cols = ['#f08a3c', '#74d68e', '#6cc8f0', '#f2c744', '#f27aa8']; cols.forEach((c, i) => { const x = -24 + i * 11; g.P([[x, -17], [x + 6, -17], [x + 3, -12]], R(c), 2); });
  });

  /* ----- pixel fonts for in-battle numbers and callouts ----- */
  const F5 = { 0: '01110100011001110101110011000101110', 1: '00100011000010000100001000010001110', 2: '01110100010000100010001000100011111', 3: '11110000010000101110000010000111110', 4: '00010001100101010010111110001000010', 5: '11111100001111000001000011000101110', 6: '00110010001000011110100011000101110', 7: '11111000010001000100010000100001000', 8: '01110100011000101110100011000101110', 9: '01110100011000101111000010001001100', '+': '00000001000010011111001000010000000', '-': '00000000000000011111000000000000000' };
  const F3 = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101111011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010', Z: '111001010100111', '!': '010010010000010', ' ': '000000000000000', '-': '000000111000000', '+': '000010111010000', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110' };
  // draw text with a 1px dark outline; returns width
  A.text = (ctx, str, x, y, col, big) => {
    const F = big ? F5 : F3, gw = big ? 5 : 3, gh = big ? 7 : 5; str = String(str).toUpperCase();
    const w = str.length * (gw + 1) - 1; x = Math.round(x - w / 2); y = Math.round(y);
    for (let pass = 0; pass < 2; pass++) {
      ctx.fillStyle = pass ? col : '#17102b';
      [...str].forEach((ch, i) => { const gl = F[ch]; if (!gl) return; for (let j = 0; j < gh; j++) for (let k = 0; k < gw; k++) if (gl[j * gw + k] === '1') { const px = x + i * (gw + 1) + k, py = y + j; if (pass) ctx.fillRect(px, py, 1, 1); else ctx.fillRect(px - 1, py - 1, 3, 3); } });
    }
    return w;
  };

  /* ----- region backdrops ----- */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bgCache = new Map();
  A.bg = (key, w, h, muted) => {
    const k = key + w + 'x' + h + (muted ? 'm' : ''); if (bgCache.has(k)) return bgCache.get(k);
    const c = A.make(w, h), ctx = c.getContext('2d'); const rnd = H.rng(key.length * 97 + 5);
    // "muted" drains the colour out: the region before its song comes back
    const col = (hex) => muted ? A.tint(hex, 0, 0.3, 0.86) : hex;
    const rect = (x, y, ww, hh, hex) => { ctx.fillStyle = col(hex); ctx.fillRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh)); };
    const px = (x, y, hex) => rect(x, y, 1, 1, hex);
    const grad = (y0, y1, cols) => { for (let y = y0; y < y1; y++) { const t = ((y - y0) / Math.max(1, y1 - y0)) * (cols.length - 1); const i = Math.min(cols.length - 2, Math.floor(t)), f = t - i; for (let x = 0; x < w; x++) { ctx.fillStyle = col(f * 16 > BAYER[(y & 3) * 4 + (x & 3)] + 0.5 ? cols[i + 1] : cols[i]); ctx.fillRect(x, y, 1, 1); } } };
    const disc = (cx, cy, r, hex) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) px(cx + x, cy + y, hex); };
    const hills = (base, amp, step, hex, seed) => { const r2 = H.rng(seed); let y = base; for (let x = 0; x < w; x++) { if (x % step === 0) y = base - r2() * amp; const yy = Math.round(y + Math.sin(x / (step * 0.8)) * amp * 0.3); rect(x, yy, 1, h - yy, hex); } };
    const hz = Math.round(h * 0.37);
    if (key === 'fen') {
      grad(0, hz, ['#0d1626', '#132a3a', '#1c4450', '#2a6068']);
      for (let i = 0; i < 26; i++) px(rnd() * w, rnd() * hz * 0.7, '#9ad0d0');
      disc(Math.round(w * 0.76), 17, 9, '#d8f0e0'); disc(Math.round(w * 0.76) + 3, 15, 8, '#132a3a');
      hills(hz - 4, 9, 9, '#102a2c', 4); hills(hz, 4, 5, '#0c2022', 9);
      grad(hz, hz + 10, ['#1a4a50', '#143a40']); for (let i = 0; i < 16; i++) rect(rnd() * w, hz + 2 + rnd() * 7, 3 + rnd() * 6, 1, '#3a8088');
      grad(hz + 10, h, ['#1c3a2a', '#16301f', '#10261a']);
      for (let i = 0; i < 60; i++) { const x = rnd() * w, y = hz + 12 + rnd() * (h - hz - 12); px(x, y, '#2a5a38'); if (rnd() < 0.4) px(x + 1, y - 1, '#3a7a48'); }
      for (let i = 0; i < 5; i++) { const x = rnd() * w, y = hz + 16 + rnd() * (h - hz - 22); rect(x, y, 7, 2, '#17454a'); rect(x + 1, y, 4, 1, '#2a7078'); }
      // cattails at the edges
      for (const side of [0, 1]) for (let i = 0; i < 7; i++) { const x = side ? w - 3 - rnd() * 26 : 2 + rnd() * 26, y = hz + 4 + rnd() * 20, hh = 18 + rnd() * 18; rect(x, y - hh, 1, hh, '#2a5a38'); rect(x - 1, y - hh - 5, 3, 6, '#7a4a2a'); px(x, y - hh - 7, '#2a5a38'); }
    } else if (key === 'works') {
      grad(0, hz, ['#150c14', '#2a1418', '#4a2018', '#7a3418']);
      for (let i = 0; i < 20; i++) px(rnd() * w, rnd() * hz, '#ff9a4a');
      // chimneys and a gantry hung with bells that no longer ring
      for (const [x, ww, hh] of [[8, 9, 34], [24, 6, 24], [w - 22, 10, 38], [w - 40, 7, 26], [w / 2 - 20, 8, 20]]) { rect(x, hz - hh, ww, hh, '#1a0f14'); rect(x - 1, hz - hh, ww + 2, 2, '#2a1820'); rect(x + 1, hz - hh + 4, 1, hh - 4, '#2a1820'); }
      rect(0, 12, w, 2, '#1a0f14'); for (let x = 6; x < w; x += 14) { rect(x, 14, 1, 3, '#1a0f14'); }
      for (const x of [w * 0.3, w * 0.5, w * 0.68]) { rect(x, 14, 1, 6, '#1a0f14'); rect(x - 3, 20, 7, 6, '#3a2420'); rect(x - 4, 26, 9, 2, '#3a2420'); px(x - 2, 21, '#6a4430'); px(x, 28, '#1a0f14'); }
      rect(0, hz - 1, w, 2, '#ff7a2a'); for (let x = 0; x < w; x += 5) px(x + (rnd() * 3 | 0), hz - 2, '#ffd27a');
      grad(hz + 1, h, ['#3a2a30', '#2e2228', '#241a20']);
      for (let y = hz + 9; y < h; y += 13) rect(0, y, w, 1, '#1a1218'); for (let y = hz + 1, r = 0; y < h; y += 13, r++) for (let x = (r % 2) * 16; x < w; x += 32) { rect(x, y, 1, 13, '#1a1218'); px(x + 3, y + 3, '#5a4850'); px(x + 28, y + 3, '#5a4850'); }
      for (let i = 0; i < 8; i++) { const x = rnd() * w, y = hz + 6 + rnd() * (h - hz - 10); rect(x, y, 5, 1, '#6a3a20'); rect(x + 1, y + 1, 3, 1, '#4a2a18'); }
    } else if (key === 'ridge') {
      grad(0, hz, ['#161c2c', '#27314a', '#48587a', '#7888a8']);
      const r2 = H.rng(12); let y = hz - 18; for (let x = 0; x < w; x++) { y += (r2() - 0.5) * 7; y = Math.max(hz - 34, Math.min(hz - 6, y)); rect(x, y, 1, hz - y, '#39456a'); rect(x, y, 1, 3, '#c8d4f0'); }
      hills(hz - 2, 6, 7, '#5a6890', 3);
      // pylons with slack wire
      const py = [w * 0.16, w * 0.52, w * 0.86]; py.forEach((x) => { rect(x, hz - 30, 1, 30, '#1a2034'); rect(x - 4, hz - 28, 9, 1, '#1a2034'); rect(x - 3, hz - 22, 7, 1, '#1a2034'); });
      for (let i = 0; i + 1 < py.length; i++) for (let t = 0; t <= 1; t += 0.02) px(py[i] + (py[i + 1] - py[i]) * t, hz - 28 + Math.sin(t * Math.PI) * 9, '#1a2034');
      grad(hz, h, ['#aab6d4', '#909cc0', '#7a86ac']);
      for (let i = 0; i < 26; i++) { const x = rnd() * w, yy = hz + 4 + rnd() * (h - hz - 6); rect(x, yy, 6 + rnd() * 10, 1, '#c8d4f0'); }
      for (let i = 0; i < 10; i++) { const x = rnd() * w, yy = hz + 6 + rnd() * (h - hz - 8); rect(x, yy, 4, 1, '#5a6890'); }
      // the snow that is not snow
      for (let i = 0; i < w * h / 34; i++) px(rnd() * w, rnd() * h, rnd() < 0.5 ? '#f4f6ff' : '#b8c0dc');
    } else if (key === 'hall') {
      grad(0, hz, ['#0f0a1c', '#1a1230', '#261a44']);
      // tall windows with cold light
      for (const x of [w * 0.2, w * 0.5, w * 0.8]) { rect(x - 6, 6, 13, hz - 12, '#3a3470'); rect(x - 5, 4, 11, 2, '#3a3470'); rect(x - 3, 2, 7, 2, '#3a3470'); rect(x, 2, 1, hz - 8, '#1a1230'); rect(x - 6, 20, 13, 1, '#1a1230'); for (let i = 0; i < 12; i++) px(x - 5 + rnd() * 11, 6 + rnd() * (hz - 14), '#8a84d0'); }
      // pillars
      for (const x of [w * 0.35, w * 0.65]) { rect(x - 3, 0, 7, hz, '#1a1230'); rect(x - 2, 0, 1, hz, '#2e2452'); rect(x - 4, hz - 4, 9, 4, '#1a1230'); }
      // rows of seats, every one taken
      for (let r = 0; r < 2; r++) for (let x = (r * 5) - 2; x < w; x += 10) { const y = hz - 9 + r * 5; rect(x, y, 8, 6, r ? '#2a1c3a' : '#1f1530'); disc(x + 4, y - 2, 2, r ? '#3a2a4e' : '#2a1e40'); }
      // floorboards
      grad(hz + 2, h, ['#4a3038', '#3e2830', '#322028']);
      for (let y = hz + 2, r = 0; y < h; y += 9, r++) { rect(0, y, w, 1, '#241820'); for (let x = (r % 2) * 20 + 6; x < w; x += 40) rect(x, y, 1, 9, '#241820'); }
      for (let i = 0; i < 30; i++) px(rnd() * w, hz + 3 + rnd() * (h - hz - 4), '#5a3c44');
      // curtains
      for (const side of [0, 1]) for (let i = 0; i < 4; i++) { const x = side ? w - 5 - i * 5 : i * 5; const hh = hz + 14 - i * 9; rect(x, 0, 5, hh, i % 2 ? '#7a1c30' : '#9a2a3c'); rect(x + (side ? 0 : 4), 0, 1, hh, '#4a1020'); rect(x, hh, 5, 2, '#c8962a'); }
      rect(0, 0, w, 5, '#7a1c30'); for (let x = 0; x < w; x += 8) { rect(x, 5, 8, 2, '#9a2a3c'); rect(x + 3, 7, 2, 2, '#c8962a'); }
    } else if (key === 'camp') {
      grad(0, hz + 14, ['#0b0919', '#12102a', '#1c1840', '#2a2458']);
      for (let i = 0; i < 70; i++) { const x = rnd() * w, y = rnd() * (hz + 8); px(x, y, rnd() < 0.2 ? '#fff2c0' : '#8a84c0'); }
      for (let x = 0; x < w; x++) { const y = 16 + Math.sin(x / 19) * 5 + Math.sin(x / 7) * 2; if ((x + Math.round(y)) % 2 === 0) { px(x, y, '#3f6a8a'); px(x, y + 2, '#4a4a9a'); } px(x, y + 1, '#5a8aa0'); }
      hills(hz + 6, 12, 13, '#141230', 21); hills(hz + 12, 6, 8, '#100e26', 5);
      grad(hz + 16, h, ['#1a2a2a', '#152222', '#101a1c']);
      for (let i = 0; i < 90; i++) { const x = rnd() * w, y = hz + 18 + rnd() * (h - hz - 18); px(x, y, '#2a4a3a'); if (rnd() < 0.3) px(x, y - 1, '#3a6a4a'); }
    } else { grad(0, h, ['#0d0b1a', '#16132b']); }
    bgCache.set(k, c); return c;
  };
  // Warm pool of firelight (dithered), drawn over a backdrop
  A.glowPool = (ctx, cx, cy, r, hex, strength) => { ctx.fillStyle = hex; for (let y = -r; y <= r; y++) for (let x = -r * 2; x <= r * 2; x++) { const d = Math.sqrt((x / 2) * (x / 2) + y * y) / r; if (d > 1) continue; if ((1 - d) * 16 * strength > BAYER[((cy + y) & 3) * 4 + ((cx + x) & 3)] + 0.5) ctx.fillRect(cx + x, cy + y, 1, 1); } };

})(window.H);
