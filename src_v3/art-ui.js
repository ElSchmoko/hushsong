/* Hushsong — icons, pixel font, props and daytime backdrops. */
(function (H) {
  'use strict';
  const A = H.Art, R = A.ramp, I = A.int;
  const ascii = (key, rows, pal) => { const w = Math.max(...rows.map((r) => r.length)), h = rows.length; A.def(key, w + 2, h + 2, (g) => rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.' && ch !== ' ') g.raw(x + 1, y + 1, I(pal[ch])); }))); };

  // families
  ascii('fam_drum', ['.wwwwwww.', 'wcccccccw', 'wcccccccw', '.wwwwwww.', '.oyoyoyo.', '.yoyoyoy.', '.oyoyoyo.', '.wwwwwww.', '..w...w..'], { w: '#8a4f2c', c: '#f3dfb4', o: '#f08a3c', y: '#ffc27a' });
  ascii('fam_string', ['G.......G', 'G.l.l.l.G', 'G.l.l.l.G', 'G.l.l.l.G', 'gGl.l.lGg', '.gGGGGGg.', '...gGg...', '..gGGGg..', '.gGGGGGg.'], { G: '#74d68e', g: '#3f9a5a', l: '#d8ffe0' });
  ascii('fam_breath', ['Bb.Bb.Bb.', 'Bb.Bb.Bb.', 'Bb.Bb.Bb.', 'Bb.Bb.Bb.', 'wwwwwwww.', 'Bb.Bb.Bb.', 'Bb.Bb....', 'Bb.Bb....', 'Bb.......'], { B: '#a8e6ff', b: '#4f9ad0', w: '#f3dfb4' });
  ascii('fam_brass', ['.......yY', '.....yyYY', 'yyyyyyYWY', 'YYYYYYWWY', 'yyyyyyYWY', '.d.d.yyYY', '.d.d...yY', '.........'], { y: '#c8962a', Y: '#f2c744', W: '#fff2b0', d: '#b9b6cc' });
  ascii('fam_voice', ['.ppppppp.', 'pPPPPPPPp', 'pwdwdwdwp', 'pdddddddp', 'pddrrrddp', 'pdrrrrrdp', '.pPPPPPp.', '..ppppp..'], { p: '#c8507a', P: '#f27aa8', d: '#4a1830', r: '#ff8aa0', w: '#fff8ea' });
  ascii('fam_none', ['.........', '..sssss..', '..sssss..', 'SSSSSSSSS', '.........', '....s....', '...sss...', '....s....'], { s: '#b9b4d6', S: '#8a84b0' });
  // roles
  ascii('role_rhythm', ['.sssss.', 'sSSSSSs', 'sSSwSSs', 'sSSwSSs', 'sSSSSSs', '.sSSSs.', '..sSs..', '...s...'], { s: '#4a74c0', S: '#8ab4f0', w: '#fff8ea' });
  ascii('role_lead', ['......x', '.....xX', '....xX.', 'y..xX..', '.yxX...', '..yy...', '.y..y..', 'y......'], { x: '#8a8aa0', X: '#e8e8f4', y: '#c8862a' });
  ascii('role_harmony', ['.gg.gg.', 'gGGgGGg', 'gGWGGGg', 'gGGGGGg', '.gGGGg.', '..gGg..', '...g...'], { g: '#d8456a', G: '#ff8aa8', W: '#fff8ea' });
  ascii('role_bass', ['..ppp..', '.pPPPp.', 'pPwPwPp', 'pPPPPPp', 'pPpPpPp', 'p.p.p.p'], { p: '#7a5ac0', P: '#b8a0f0', w: '#2a1a4a' });
  ascii('role_stray', ['..sss..', '.s...s.', '....s..', '...s...', '.......', '...s...'], { s: '#8a84a6' });
  // statuses (7x7): arrows for power and speed, plain shapes for the rest
  ascii('st_pup', ['...x...', '..xxx..', '.xxxxx.', 'xxxxxxx', '..xxx..', '..xxx..', '..xxx..'], { x: '#f0503a' });
  ascii('st_pdown', ['..xxx..', '..xxx..', '..xxx..', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'], { x: '#6a7ab8' });
  ascii('st_sup', ['x..x...', '.x..x..', '..x..x.', '...x..x', '..x..x.', '.x..x..', 'x..x...'], { x: '#f0a020' });
  ascii('st_sdown', ['...x..x', '..x..x.', '.x..x..', 'x..x...', '.x..x..', '..x..x.', '...x..x'], { x: '#6a7ab8' });
  ascii('st_stun', ['x..x..x', '.x.x.x.', '..xxx..', 'xxxxxxx', '..xxx..', '.x.x.x.', 'x..x..x'], { x: '#f0c020' });
  ascii('st_poison', ['...x...', '..xxx..', '..xxx..', '.xxxxx.', '.xwxxx.', '.xxxxx.', '..xxx..'], { x: '#9a4ad0', w: '#e8c8ff' });
  ascii('st_regen', ['..xxx..', '..xxx..', 'xxxxxxx', 'xxxxxxx', 'xxxxxxx', '..xxx..', '..xxx..'], { x: '#3fb85a' });
  ascii('st_taunt', ['..xxx..', '.x...x.', 'x..x..x', 'x.xxx.x', 'x..x..x', '.x...x.', '..xxx..'], { x: '#e0503a' });
  ascii('st_dodge', ['.xx....', 'x..x...', '...x.xx', '..x.x..', '.x..x.x', '.....x.', '....x..'], { x: '#2fa0d8' });
  ascii('st_shield', ['xxxxxxx', 'xwwxxxx', 'xwxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'], { x: '#4a8ae0', w: '#e8f4ff' });
  // small marks
  ascii('ic_note', ['...xxx', '...x.x', '...x..', '...x..', '.xxx..', 'xxxx..', '.xx...'], { x: '#f2b020' });
  ascii('ic_xp', ['...x...', '..xxx..', 'xxxxxxx', '.xxxxx.', '.xx.xx.', 'xx...xx'], { x: '#3aa0e0' });
  ascii('ic_lock', ['..xxx..', '.x...x.', '.x...x.', 'xxxxxxx', 'xxx.xxx', 'xxx.xxx', 'xxxxxxx'], { x: '#a89a84' });
  ascii('ic_gear', ['..x.x..', '.xxxxx.', 'xx...xx', '.x...x.', 'xx...xx', '.xxxxx.', '..x.x..'], { x: '#5a4a6a' });
  ascii('ic_check', ['......x', '.....xx', 'x...xx.', 'xx.xx..', '.xxx...', '..x....'], { x: '#3fb85a' });
  ascii('ic_boss', ['x..x..x', 'x.xxx.x', 'xxxxxxx', 'xwxxxwx', 'xxxxxxx', '.xxxxx.'], { x: '#c8302a', w: '#fff8ea' });
  ascii('ic_up', ['...x...', '..xxx..', '.xxxxx.', 'xxxxxxx'], { x: '#3fb85a' });
  ascii('ic_down', ['xxxxxxx', '.xxxxx.', '..xxx..', '...x...'], { x: '#8a84a6' });

  ascii('ic_info', ['.xxx.', 'x.x.x', 'xxxxx', 'xx.xx', 'xx.xx', '.xxx.'], { x: '#7d6d8a' });
  ascii('ic_bang', ['.xxx.', 'xx.xx', 'xx.xx', 'xxxxx', 'xx.xx', '.xxx.'], { x: '#f4705e' });
  ascii('ic_bigcheck', ['.........xx', '........xxx', '.......xxx.', 'xx....xxx..', 'xxx..xxx...', '.xxxxxx....', '..xxxx.....', '...xx......'], { x: '#ffffff' });

  /* ----- round move icons: a glyph for what the move does, on a disc in the pet's family colour ----- */
  const GLYPH = {
    strike: ['........xx.', '.......xxx.', '......xxx..', '.....xxx...', '....xxx....', '...xxx.....', '.xxxx......', '.xxx.......', 'xx.x.......', 'x..........'],
    multi: ['..x...x...x', '.x...x...x.', 'x...x...x..', '...........', '..x...x...x', '.x...x...x.', 'x...x...x..', '...........', '..x...x...x', '.x...x...x.', 'x...x...x..'],
    burst: ['.....x.....', '.x...x...x.', '..x..x..x..', '...x.x.x...', '....xxx....', 'xxxxxxxxxxx', '....xxx....', '...x.x.x...', '..x..x..x..', '.x...x...x.', '.....x.....'],
    scatter: ['.xx.....xx.', '.xx.....xx.', '.....xx....', '.....xx....', '..xx.......', '..xx....xx.', '........xx.', '....xx.....', '....xx.....'],
    heal: ['....xxx....', '....xxx....', '....xxx....', '.xxxxxxxxx.', '.xxxxxxxxx.', '.xxxxxxxxx.', '....xxx....', '....xxx....', '....xxx....'],
    shield: ['.xxxxxxxxx.', '.xxxxxxxxx.', '.xx.xxxxxx.', '.xx.xxxxxx.', '.xxxxxxxxx.', '..xxxxxxx..', '...xxxxx...', '....xxx....', '.....x.....'],
    up: ['.....x.....', '....xxx....', '...xxxxx...', '..xxx.xxx..', '.xxx...xxx.', '.....x.....', '....xxx....', '...xxxxx...', '..xxx.xxx..', '.xxx...xxx.'],
    down: ['.xxx...xxx.', '..xxx.xxx..', '...xxxxx...', '....xxx....', '.....x.....', '.xxx...xxx.', '..xxx.xxx..', '...xxxxx...', '....xxx....', '.....x.....'],
    stun: ['.....x.....', '.....x.....', '....xxx....', 'xxxxxxxxxxx', '.xxxxxxxxx.', '..xxxxxxx..', '..xxxxxxx..', '.xxxx.xxxx.', '.xx.....xx.', 'x.........x'],
    taunt: ['...xxxxx...', '..x.....x..', '.x..xxx..x.', 'x..x...x..x', 'x.x..x..x.x', 'x.x.xxx.x.x', 'x.x..x..x.x', 'x..x...x..x', '.x..xxx..x.', '..x.....x..', '...xxxxx...'],
    fast: ['x...x...x..', '.x...x...x.', '..x...x...x', '...x...x...', '..x...x...x', '.x...x...x.', 'x...x...x..'],
    smash: ['.....x.....', '.....x.....', '....xxx....', '...xxxxx...', 'xxxxxxxxxxx', '.xxxxxxxxx.', '...xxxxx...', '..xxxxxxx..', '..xxx.xxx..', '.xx.....xx.', '.x.......x.'],
    note: ['....xxxxxx.', '....xxxxxx.', '....x....x.', '....x....x.', '....x....x.', '.xxxx..xxx.', 'xxxxx.xxxx.', '.xxx...xx..'],
  };
  const FAMHEX = { drum: '#f08a3c', string: '#4fc070', breath: '#3fa8e8', brass: '#e9b020', voice: '#f0609a', none: '#9a94b8' };
  A.moveShape = (ab) => {
    let fx = ab.fx[0]; if (fx[0] === 'if') fx = fx[2][0]; if (fx[0] === 'random') return 'note';
    if (fx[0] === 'dmg') { const o = fx[3] || {}; return fx[1] === 'all' ? 'burst' : fx[1] === 'rand' ? 'scatter' : (o.h || 1) > 1 ? 'multi' : 'strike'; }
    if (fx[0] === 'heal' || fx[0] === 'revive' || fx[0] === 'cleanse') return 'heal';
    if (fx[0] === 'shield') return 'shield';
    if (fx[0] === 'gauge') return 'fast';
    if (fx[0] === 'st') { const s = fx[2]; return s === 'taunt' ? 'taunt' : s === 'stun' ? 'stun' : s === 'regen' ? 'heal' : s === 'dodge' ? 'fast' : H.STATUS[s].buff ? 'up' : 'down'; }
    return 'note';
  };
  A.moveIcon = (ab, kind, family) => {
    let shape = A.moveShape(ab); if (shape === 'strike' && kind !== 'beat') shape = 'smash'; const key = `mv_${shape}_${family}_${kind}`;
    if (!A.defs[key]) A.def(key, 28, 28, (g) => {
      g.at(14, 14, 1); const r = R(FAMHEX[family] || FAMHEX.none);
      if (kind === 'finale') g.E(0, 0, 13, 13, R('#ffc94a'), { flat: 2 }); else if (kind === 'phrase') g.E(0, 0, 13, 13, R('#ffffff'), { flat: 2 });
      g.E(0, 0, kind === 'beat' ? 12 : 11, kind === 'beat' ? 12 : 11, r, { hi: false });
      const rows = GLYPH[shape], h = rows.length, w = 11, ox = -Math.floor(w / 2), oy = -Math.floor(h / 2);
      rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'x') g.px(ox + x + 1, oy + y + 1, r[0]); }));
      rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'x') g.px(ox + x, oy + y, A.WHITE); }));
    });
    return key;
  };

  /* ----- props ----- */
  A.def('shell', 34, 34, (g, f) => {
    g.at(17, 30, 1); const s = R('#f3dfb4'), p = R('#ff8ab0'), b = f ? 1 : 0;
    g.E(1, -11 + b, 12.5, 10.5, s, {}); g.E(-7, -20 + b, 6.5, 5.5, s, { sep: 1 }); g.E(-11, -25 + b, 3.4, 3, s, { sep: 1 }); g.px(-13, -28 + b, s[3]);
    for (const [x0, y0, cx, cy, x1, y1] of [[-8, -14, -2, -22, 8, -18], [-10, -8, 0, -17, 12, -12], [-9, -3, 2, -10, 13, -6]]) g.Q(x0, y0 + b, cx, cy + b, x1, y1 + b, s[1], 1);
    g.E(4, -7 + b, 5.5, 4.2, p, { glow: 1 }); g.E(5, -6.5 + b, 3, 2, R('#5a2040'), { flat: 1 });
  });
  A.def('wagon', 76, 56, (g, f) => {
    g.at(38, 53, 1); const wd = R('#b0703c'), wd2 = R('#8a5030'), can = R('#fff4dc'), gd = R('#e9b93a');
    g.E(0, -30, 27, 16, can, {}); g.R(-27, -30, 55, 14, can, 2); g.R(18, -30, 9, 14, can, 1); g.R(-27, -30, 4, 14, can, 3);
    for (const x of [-14, 0, 14]) g.L(x, -44, x, -17, can[1], 1);
    g.R(-11, -27, 6, 5, R('#f0705a'), 2); A.note(g, -3, -40, I('#3a3154'));
    g.R(-29, -17, 59, 12, wd, 2); g.R(-29, -17, 59, 2, wd, 3); g.R(-29, -7, 59, 2, wd, 0); for (let x = -22; x < 28; x += 9) g.L(x, -15, x, -7, wd[1], 1);
    g.R(6, -15, 9, 7, wd2, 1); g.R(7, -14, 7, 5, null, I('#bfe6f5')); g.L(10, -14, 10, -10, wd2[0], 1);
    g.R(-36, -8, 8, 2, wd2, 2); g.L(29, -8, 37, -3, wd2[1], 2);
    for (const x of [-17, 17]) { g.E(x, -5, 7.5, 7.5, wd2, { flat: 1 }); g.E(x, -5, 5.5, 5.5, R('#f3dfb4'), { flat: 1 }); g.L(x - 5, -5, x + 5, -5, wd2[2], 1); g.L(x, -10, x, 0, wd2[2], 1); g.L(x - 3, -8, x + 3, -2, wd2[1], 1); g.L(x + 3, -8, x - 3, -2, wd2[1], 1); g.E(x, -5, 1.6, 1.6, gd, {}); }
    const cols = ['#f08a3c', '#74d68e', '#6cc8f0', '#f2c744', '#f27aa8']; cols.forEach((c, i) => { const x = -24 + i * 11; g.P([[x, -17], [x + 6, -17], [x + 3, -12]], R(c), 2); });
  });

  /* ----- pixel fonts for numbers and callouts drawn on the battlefield ----- */
  const F5 = { 0: '01110100011001110101110011000101110', 1: '00100011000010000100001000010001110', 2: '01110100010000100010001000100011111', 3: '11110000010000101110000010000111110', 4: '00010001100101010010111110001000010', 5: '11111100001111000001000011000101110', 6: '00110010001000011110100011000101110', 7: '11111000010001000100010000100001000', 8: '01110100011000101110100011000101110', 9: '01110100011000101111000010001001100', '+': '00000001000010011111001000010000000', '-': '00000000000000011111000000000000000' };
  const F3 = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101111011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010', Z: '111001010100111', '!': '010010010000010', ' ': '000000000000000', '-': '000000111000000', '+': '000010111010000', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110' };
  A.text = (ctx, str, x, y, col, big) => {
    const F = big ? F5 : F3, gw = big ? 5 : 3, gh = big ? 7 : 5; str = String(str).toUpperCase();
    const w = str.length * (gw + 1) - 1; x = Math.round(x - w / 2); y = Math.round(y);
    for (let pass = 0; pass < 2; pass++) { ctx.fillStyle = pass ? col : '#2a1f3a'; [...str].forEach((ch, i) => { const gl = F[ch]; if (!gl) return; for (let j = 0; j < gh; j++) for (let k = 0; k < gw; k++) if (gl[j * gw + k] === '1') { const px = x + i * (gw + 1) + k, py = y + j; if (pass) ctx.fillRect(px, py, 1, 1); else ctx.fillRect(px - 1, py - 1, 3, 3); } }); }
    return w;
  };

  /* ----- daytime backdrops ----- */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bgCache = new Map();
  A.bg = (key, w, h, hf) => {
    const k = key + w + 'x' + h + (hf || ''); if (bgCache.has(k)) return bgCache.get(k);
    const c = A.make(w, h), ctx = c.getContext('2d'), rnd = H.rng(key.length * 97 + 5);
    const rect = (x, y, ww, hh, hex) => { ctx.fillStyle = hex; ctx.fillRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh)); };
    const px = (x, y, hex) => rect(x, y, 1, 1, hex);
    const grad = (y0, y1, cols) => { for (let y = y0; y < y1; y++) { const t = ((y - y0) / Math.max(1, y1 - y0)) * (cols.length - 1); const i = Math.min(cols.length - 2, Math.floor(t)), f = t - i; for (let x = 0; x < w; x++) { ctx.fillStyle = f * 16 > BAYER[(y & 3) * 4 + (x & 3)] + 0.5 ? cols[i + 1] : cols[i]; ctx.fillRect(x, y, 1, 1); } } };
    const disc = (cx, cy, r, hex) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) px(cx + x, cy + y, hex); };
    const hills = (base, amp, step, hex, seed) => { const r2 = H.rng(seed); let y = base; for (let x = 0; x < w; x++) { if (x % step === 0) y = base - r2() * amp; const yy = Math.round(y + Math.sin(x / (step * 0.8)) * amp * 0.3); rect(x, yy, 1, h - yy, hex); } };
    const cloud = (cx, cy, s, hex, sh) => { for (const [dx, dy, r] of [[0, 0, 5], [-6, 2, 4], [6, 2, 4], [-11, 3, 2], [11, 3, 3]]) disc(Math.round(cx + dx * s), Math.round(cy + dy * s), Math.round(r * s), hex); rect(cx - 13 * s, cy + 4 * s, 27 * s, 2, sh); };
    const hz = Math.round(h * (hf || 0.37));
    if (key === 'camp') {
      grad(0, hz + 4, ['#8fd3f0', '#b4e4f6', '#d8f2fa']);
      disc(Math.round(w * 0.8), 14, 8, '#fff6c8'); disc(Math.round(w * 0.8), 14, 6, '#ffe98a');
      cloud(w * 0.22, 14, 1, '#ffffff', '#e2f2fa'); cloud(w * 0.58, 24, 0.8, '#ffffff', '#e2f2fa');
      hills(hz, 12, 13, '#9fd8a4', 21); hills(hz + 6, 6, 8, '#86cc8c', 5);
      grad(hz + 10, h, ['#8fd47c', '#7fca70', '#72c066']);
      for (let i = 0; i < 80; i++) { const x = rnd() * w, y = hz + 12 + rnd() * (h - hz - 12); px(x, y, '#5fae58'); if (rnd() < 0.3) px(x, y - 1, '#a8e090'); }
      for (let i = 0; i < 14; i++) { const x = rnd() * w, y = hz + 14 + rnd() * (h - hz - 16), col = ['#ffffff', '#ffd24a', '#ff8ab0'][i % 3]; px(x, y, col); px(x + 1, y + 1, '#4a9a50'); }
    } else if (key === 'fen') {
      grad(0, hz, ['#a8dcd8', '#c4ecdc', '#e2f6e4']);
      cloud(w * 0.3, 12, 0.9, '#f4fffa', '#d4f0e4'); disc(Math.round(w * 0.76), 15, 7, '#fff8d8');
      hills(hz - 4, 9, 9, '#8cc8a4', 4); hills(hz, 4, 5, '#74b890', 9);
      grad(hz, hz + 11, ['#8ad0dc', '#a4e0e4']); for (let i = 0; i < 16; i++) rect(rnd() * w, hz + 2 + rnd() * 8, 3 + rnd() * 6, 1, '#d8f6f6');
      grad(hz + 11, h, ['#8ccc78', '#7cc06c', '#6eb462']);
      for (let i = 0; i < 60; i++) { const x = rnd() * w, y = hz + 13 + rnd() * (h - hz - 13); px(x, y, '#56a054'); if (rnd() < 0.4) px(x + 1, y - 1, '#a4e08c'); }
      for (let i = 0; i < 5; i++) { const x = rnd() * w, y = hz + 18 + rnd() * (h - hz - 24); rect(x, y, 8, 2, '#8ad0dc'); rect(x + 1, y, 5, 1, '#d8f6f6'); }
      for (const side of [0, 1]) for (let i = 0; i < 7; i++) { const x = side ? w - 3 - rnd() * 26 : 2 + rnd() * 26, y = hz + 5 + rnd() * 20, hh = 18 + rnd() * 18; rect(x, y - hh, 1, hh, '#4a9a58'); rect(x - 1, y - hh - 5, 3, 6, '#a8683a'); px(x, y - hh - 7, '#4a9a58'); }
    } else if (key === 'works') {
      grad(0, hz, ['#ffd8a8', '#ffe4bc', '#fff0d4']);
      cloud(w * 0.5, 9, 0.8, '#fff8ec', '#ffe4c4');
      for (const [x, ww, hh] of [[8, 9, 34], [24, 6, 24], [w - 22, 10, 38], [w - 40, 7, 26]]) { rect(x, hz - hh, ww, hh, '#d88a64'); rect(x - 1, hz - hh, ww + 2, 2, '#b8684a'); rect(x + 1, hz - hh + 4, 1, hh - 4, '#f0a880'); for (let y = hz - hh + 6; y < hz; y += 5) rect(x, y, ww, 1, '#c87858'); }
      rect(0, 14, w, 2, '#a8643a'); for (let x = 6; x < w; x += 14) rect(x, 16, 1, 2, '#a8643a');
      for (const x of [w * 0.32, w * 0.5, w * 0.68]) { const X = Math.round(x); rect(X, 16, 1, 5, '#a8643a'); rect(X - 3, 21, 7, 6, '#f2c744'); rect(X - 4, 27, 9, 2, '#d9a012'); rect(X - 2, 22, 2, 3, '#fff2b0'); px(X, 29, '#8a5a1a'); }
      grad(hz, h, ['#f0c898', '#e8bc8a', '#e0b07c']);
      for (let y = hz + 8; y < h; y += 13) rect(0, y, w, 1, '#c89868'); for (let y = hz, r = 0; y < h; y += 13, r++) for (let x = (r % 2) * 16; x < w; x += 32) rect(x, y, 1, 13, '#c89868');
      for (let i = 0; i < 26; i++) px(rnd() * w, hz + 3 + rnd() * (h - hz - 4), '#f8dcb4');
    } else if (key === 'ridge') {
      grad(0, hz, ['#a8d0f0', '#c8e2f8', '#e8f2fc']);
      const r2 = H.rng(12); let y = hz - 18; for (let x = 0; x < w; x++) { y += (r2() - 0.5) * 7; y = Math.max(hz - 34, Math.min(hz - 6, y)); rect(x, y, 1, hz - y, '#a8b4e0'); rect(x, y, 1, 4, '#ffffff'); }
      hills(hz - 2, 6, 7, '#c4d0f0', 3);
      for (let i = 0; i < 7; i++) { const x = Math.round(8 + rnd() * (w - 16)), by = hz + 2; for (let j = 0; j < 4; j++) rect(x - j, by - 12 + j * 3, j * 2 + 1, 3, j % 2 ? '#4a9a7a' : '#5aaa88'); rect(x, by, 1, 3, '#8a5a3a'); rect(x - 1, by - 12, 3, 1, '#ffffff'); }
      grad(hz + 2, h, ['#f4f8ff', '#e8f0fc', '#dce8f8']);
      for (let i = 0; i < 26; i++) { const x = rnd() * w, yy = hz + 6 + rnd() * (h - hz - 8); rect(x, yy, 6 + rnd() * 10, 1, '#c8d8f0'); }
      for (let i = 0; i < w * h / 60; i++) px(rnd() * w, rnd() * h, '#ffffff');
    } else if (key === 'hall') {
      grad(0, hz, ['#f4e2c4', '#f8ead0']);
      for (const x of [w * 0.2, w * 0.5, w * 0.8]) { const X = Math.round(x); rect(X - 6, 8, 13, hz - 14, '#bfe6f5'); rect(X - 5, 6, 11, 2, '#bfe6f5'); rect(X - 3, 4, 7, 2, '#bfe6f5'); rect(X, 4, 1, hz - 10, '#e0c8a0'); rect(X - 6, 22, 13, 1, '#e0c8a0'); rect(X - 4, 10, 2, 8, '#ffffff'); }
      for (const x of [w * 0.35, w * 0.65]) { const X = Math.round(x); rect(X - 3, 0, 7, hz, '#e8d0a8'); rect(X - 2, 0, 1, hz, '#fff4dc'); rect(X - 4, hz - 4, 9, 4, '#d8b888'); }
      for (let r = 0; r < 2; r++) for (let x = (r * 5) - 2; x < w; x += 10) { const yy = hz - 9 + r * 5; rect(x, yy, 8, 6, r ? '#c8504a' : '#b84440'); }
      grad(hz + 2, h, ['#e8b878', '#e0ac6c', '#d8a060']);
      for (let yy = hz + 2, r = 0; yy < h; yy += 9, r++) { rect(0, yy, w, 1, '#c08848'); for (let x = (r % 2) * 20 + 6; x < w; x += 40) rect(x, yy, 1, 9, '#c08848'); }
      for (const side of [0, 1]) for (let i = 0; i < 3; i++) { const x = side ? w - 5 - i * 5 : i * 5, hh = hz + 12 - i * 10; rect(x, 0, 5, hh, i % 2 ? '#d8504a' : '#e8605a'); rect(x + (side ? 0 : 4), 0, 1, hh, '#b03a3a'); rect(x, hh, 5, 2, '#f2c744'); }
      rect(0, 0, w, 4, '#d8504a'); for (let x = 0; x < w; x += 8) { rect(x, 4, 8, 2, '#e8605a'); rect(x + 3, 6, 2, 2, '#f2c744'); }
    }
    bgCache.set(k, c); return c;
  };
})(window.H);
