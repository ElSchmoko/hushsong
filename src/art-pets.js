/* Hushsong — the pets. Each one is an instrument first, with just enough creature in it to have a face. Drawn in a 200x200 box, feet near y=182. */
(function (H) {
  'use strict';
  const A = H.Art, INK = A.INK, CREAM = '#fff1d0', WHITE = '#ffffff', BLUSH = '#ff9aa8';
  const P = (m, x) => Object.assign({ m, d: A.dark(m, 0.26), dd: A.dark(m, 0.5), l: A.light(m, 0.5) }, x || {});
  /* ---- faces ---- */
  const eye = (g, x, y, s) => { s = s || 1; g.e(x, y, 8.5 * s, 10.5 * s, INK); g.c(x + 3 * s, y - 4 * s, 3.4 * s, WHITE); };
  const eyes = (g, x1, x2, y, s) => { eye(g, x1, y, s); eye(g, x2, y, s); };
  const blush = (g, x, y, s) => g.e(x, y, 8 * (s || 1), 4.6 * (s || 1), BLUSH);
  const smile = (g, x, y, w) => g.s(`M${x - w} ${y} Q${x} ${y + w * 1.1} ${x + w} ${y}`, INK, 4);
  const zig = (g, x, y, n, st, amp, col, w) => { let d = `M${x} ${y}`; for (let i = 1; i <= n; i++) d += ` L${x + i * st} ${y + (i % 2 ? -amp : 0)}`; g.s(d, col, w || 6); };

  /* ---- things pets wear. Drawn around their own origin, about 50 wide. ---- */
  const WEAR = {
    crown: (g, c) => { g.p('M-24 2 L-28 -24 L-13 -11 L0 -32 L13 -11 L28 -24 L24 2 Z', c || '#ffc928'); g.r(-24, -3, 48, 8, 3, A.dark(c || '#ffc928', 0.25)); g.c(0, -14, 4, '#ff4d6a'); g.c(-28, -25, 4, WHITE); g.c(28, -25, 4, WHITE); g.c(0, -33, 4, WHITE); },
    tiara: (g, c) => { g.p('M-22 2 Q-18 -14 -8 -6 Q0 -28 8 -6 Q18 -14 22 2 Z', c || '#ffd95a'); g.c(0, -10, 4.5, '#5ad0ff'); g.c(-14, -3, 3, WHITE); g.c(14, -3, 3, WHITE); },
    cap: (g, c) => { c = c || '#3f8ae0'; g.p('M-22 2 A22 22 0 0 1 22 2 Z', c); g.r(-4, -4, 40, 8, 4, A.dark(c, 0.3)); g.c(0, -21, 4, A.light(c, 0.4)); },
    beret: (g, c) => { c = c || '#e04a5a'; g.e(4, -8, 28, 13, c, -8); g.r(-18, -2, 36, 6, 3, A.dark(c, 0.3)); g.s('M2 -20 l4 -8', A.dark(c, 0.3), 4); },
    tophat: (g, c) => { c = c || '#2b2140'; g.r(-17, -40, 34, 40, 4, c); g.r(-17, -14, 34, 8, 0, '#ff4d6a'); g.r(-28, -4, 56, 9, 4.5, c); },
    fedora: (g, c) => { c = c || '#4a3a5a'; g.p('M-18 -2 Q-20 -26 -6 -24 Q0 -30 6 -24 Q20 -26 18 -2 Z', c); g.r(-18, -10, 36, 7, 0, A.dark(c, 0.4)); g.e(0, 0, 32, 7, c); },
    shako: (g, c) => { c = c || '#3f6fd8'; g.p('M-15 0 L-18 -36 H18 L15 0 Z', c); g.r(-18, -4, 40, 8, 4, INK); g.r(-18, -38, 36, 7, 3, '#ffc928'); g.c(0, -18, 6, '#ffc928'); g.e(0, -50, 7, 13, '#ff4d6a'); },
    sailor: (g) => { g.p('M-22 0 Q-26 -20 0 -22 Q26 -20 22 0 Z', WHITE); g.r(-20, -6, 40, 8, 3, '#3f6fd8'); g.c(0, -20, 4, '#3f6fd8'); },
    nightcap: (g, c) => { c = c || '#6a7ae0'; g.p('M-22 2 Q-18 -30 10 -34 Q34 -34 38 -8 Q22 -18 20 2 Z', c); g.r(-24, -3, 46, 9, 4.5, WHITE); g.c(38, -6, 7, WHITE); },
    jester: (g, c) => { c = c || '#e04a8a'; g.p('M-20 2 Q-40 -20 -30 -38 Q-12 -22 0 -6 Z', c); g.p('M20 2 Q40 -20 30 -38 Q12 -22 0 -6 Z', '#ffc928'); g.r(-20, -4, 40, 8, 4, WHITE); g.c(-30, -39, 5, '#ffc928'); g.c(30, -39, 5, c); },
    headband: (g, c) => { c = c || '#ff4d4d'; g.r(-26, -5, 52, 10, 3, c); g.p('M24 -2 L42 -12 L38 0 L44 10 Z', c); },
    mohawk: (g, c) => { c = c || '#ff5a3a'; g.p('M-16 4 Q-22 -18 -10 -30 Q-8 -16 -2 -20 Q-2 -34 8 -42 Q8 -24 14 -22 Q18 -30 24 -30 Q20 -10 18 4 Z', c); g.p('M-6 4 Q-8 -8 0 -16 Q2 -6 8 -10 Q8 0 8 4 Z', '#ffc928'); },
    halo: (g, c) => { g.s('M-20 -22 a20 7 0 1 0 40 0 a20 7 0 1 0 -40 0', c || '#ffd95a', 6); },
    horns: (g, c) => { c = c || '#fff1d0'; g.p('M-22 2 Q-34 -14 -22 -28 Q-18 -12 -8 -4 Z', c); g.p('M22 2 Q34 -14 22 -28 Q18 -12 8 -4 Z', c); },
    flower: (g, c) => { c = c || '#ff5a7a'; for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283 - 1.57; g.c(Math.cos(a) * 9, -8 + Math.sin(a) * 9, 7.5, c); } g.c(0, -8, 5.5, '#ffd95a'); },
    feather: (g, c) => { c = c || '#2fd0d0'; g.p('M-4 2 Q-30 -20 -22 -46 Q-8 -30 -2 -8 Z', '#ff5a7a'); g.p('M4 2 Q30 -20 22 -46 Q8 -30 2 -8 Z', '#ffc928'); g.p('M-7 2 Q-10 -34 0 -54 Q10 -34 7 2 Z', c); g.c(0, 0, 6, WHITE); },
    wreath: (g) => { for (let i = -2; i <= 2; i++) g.e(i * 10, -4 - (2 - Math.abs(i)) * 3, 8, 5, i % 2 ? '#2fae5a' : '#3fd070', i * 20); g.c(-5, -4, 3.5, '#ff4d4d'); g.c(5, -5, 3.5, '#ff4d4d'); },
    shades: (g, c) => { g.r(-24, -8, 21, 15, 5, c || INK); g.r(3, -8, 21, 15, 5, c || INK); g.r(-6, -5, 12, 4, 0, c || INK); g.s('M-19 -3 l7 0', '#8a84b0', 3); g.s('M8 -3 l7 0', '#8a84b0', 3); },
    bowtie: (g, c) => { c = c || '#ff4d6a'; g.p('M0 0 L-18 -10 V10 Z', c); g.p('M0 0 L18 -10 V10 Z', c); g.c(0, 0, 5.5, A.dark(c, 0.3)); },
    scarf: (g, c) => { c = c || '#ff4d4d'; g.r(-24, -7, 48, 13, 6.5, c); g.p('M10 2 L18 26 L30 22 L24 0 Z', c); g.s('M-12 -6 v11 M0 -6 v11', A.light(c, 0.5), 3); },
  };
  /* ---- things that float around evolved pets ---- */
  const note = (g, x, y, s, c) => { g.push(x, y, s); g.e(0, 0, 7, 5.5, c, -20); g.r(5, -24, 3.6, 24, 0, c); g.p('M5 -24 Q16 -22 16 -10 Q12 -16 5 -16 Z', c); g.pop(); };
  const star4 = (g, x, y, r, c) => g.p(`M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`, c);
  const bolt = (g, x, y, s, c) => { g.push(x, y, s); g.p('M4 -16 L-8 2 H0 L-4 16 L10 -4 H2 Z', c); g.pop(); };
  const heart = (g, x, y, s, c) => { g.push(x, y, s); g.p('M0 7 C-14 -4 -7 -13 0 -5 C7 -13 14 -4 0 7Z', c); g.pop(); };
  const tri = (g, a, b, c2, col) => g.p(`M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c2[0]} ${c2[1]} Z`, col);
  const AURA = {
    notes: (g, c) => { note(g, 22, 40, 1, c); note(g, 176, 30, 0.85, c); note(g, 186, 96, 0.7, c); },
    sparks: (g, c) => { star4(g, 20, 44, 12, c); star4(g, 184, 30, 9, c); star4(g, 190, 104, 7, c); star4(g, 12, 112, 6, c); },
    bolts: (g, c) => { bolt(g, 18, 60, 1, c); bolt(g, 186, 44, 0.9, c); bolt(g, 190, 120, 0.7, c); },
    moon: (g, c) => { g.p('M176 14 A22 22 0 1 0 196 48 A17 17 0 1 1 176 14 Z', c); star4(g, 22, 40, 8, c); star4(g, 150, 22, 5, c); },
    flames: (g, c) => { g.p('M6 150 Q-8 110 14 96 Q10 116 24 112 Q16 86 34 70 Q34 100 46 104 Q50 130 40 150 Z', c); g.p('M194 150 Q208 110 186 96 Q190 116 176 112 Q184 86 166 70 Q166 100 154 104 Q150 130 160 150 Z', c); },
  };

  /* ---- the ten species ---- */
  const SP = {};
  // Thud: a drum on its side, with ears, feet and a mallet tail.
  SP.thud = { pal: (m) => P(m, { rim: '#8a4420', head: CREAM, hs: '#f7d9a4', acc: '#ff4d4d' }), hat: [86, 46, 1], eyes: [67, 105, 96, 1], chin: [86, 154, 0.9],
    draw: (g, p, f) => {
      if (f.sticks === 2) { g.s('M30 30 L150 150', '#c98a4a', 8); g.s('M170 30 L50 150', '#c98a4a', 8); g.c(28, 28, 9, CREAM); g.c(172, 28, 9, CREAM); }
      g.s('M166 132 L189 86', p.rim, 8); g.c(190, 80, f.sticks ? 16 : 13, p.head); g.p('M190 67 a13 13 0 0 1 0 26 a18 13 0 0 0 0 -26z', p.hs);
      if (f.tom) { g.push(150, 46, 1, 18); g.r(-23, -12, 46, 34, 9, p.d); g.e(0, -12, 23, 9, p.rim); g.e(0, -12, 16, 5.5, p.head); g.pop(); }
      g.c(46, 54, 21, p.rim); g.c(46, 54, 12, p.head); g.c(124, 46, 21, p.rim); g.c(124, 46, 12, p.head);
      g.e(66, 174, 20, 11, p.rim); g.e(128, 174, 20, 11, p.rim);
      g.p('M86 44 H122 A61 61 0 0 1 122 166 H86 Z', p.m); g.p('M122 166 A61 61 0 0 0 122 44 A61 61 0 0 1 176 132 Q156 160 122 166Z', p.d);
      if (f.snare) { g.s('M150 56 L164 84 M168 96 L150 124 M152 136 L160 150', CREAM, 5); g.s('M146 90 H180', '#ffc928', 6); } else g.s('M146 58 L166 82 L152 105 L166 128 L146 152', CREAM, 5);
      if (f.armor) { g.s('M134 50 Q160 105 134 160', '#c9d0e2', 7); g.s('M160 66 Q178 105 160 144', '#c9d0e2', 6); }
      g.c(86, 105, 61, p.rim); g.c(86, 105, 50, p.head); g.p('M86 155 A50 50 0 0 0 136 105 A62 62 0 0 1 60 148 A50 50 0 0 0 86 155Z', p.hs);
      if (f.sash) { g.s('M46 78 L128 140', '#3f6fd8', 11); g.c(88, 110, 7, '#ffc928'); }
      eyes(g, 67, 105, 96); blush(g, 52, 112); blush(g, 120, 112); smile(g, 86, 108, 8); zig(g, 62, 136, 5, 10, 9, p.acc);
      if (f.bongo) for (const [x, y, rr] of [[154, 158, 21], [184, 166, 14]]) { g.r(x - rr, y - 5, rr * 2, 24, 8, p.d); g.e(x, y - 5, rr, rr * 0.42, p.rim); g.e(x, y - 5, rr - 5, rr * 0.42 - 2.5, p.head); }
    } };
  // Clack: a tambourine that scuttles like a crab and snaps two castanets.
  SP.clack = { pal: (m) => P(m, { wood: '#7a3f22', wl: '#a85a30', head: CREAM, hs: '#f7d9a4', gold: '#ffc928' }), hat: [100, 84, 0.8], eyes: [80, 120, 60, 0.9], chin: [100, 156, 0.8],
    draw: (g, p, f) => {
      g.s('M52 150 L26 166 M58 160 L36 180 M148 150 L174 166 M142 160 L164 180', p.d, 9);
      g.s('M60 112 Q36 104 36 84', p.m, 11); g.s('M140 112 Q164 104 164 84', p.m, 11);
      if (f.maracas) { for (const [x, r] of [[34, -20], [166, 20]]) { g.push(x, 62, 1, r); g.r(-4, 6, 8, 28, 4, p.wood); g.e(0, -6, 19, 22, p.gold); g.s('M-14 -6 Q0 2 14 -6', '#ff4d6a', 5); g.c(-5, -16, 4, WHITE); g.pop(); } }
      else for (const [x, r] of [[34, -24], [166, 24]]) { const big = f.claws; g.push(x, big ? 60 : 66, big ? 1.22 : 1, r * (big ? 1.15 : 1)); if (big) g.s('M0 20 q-9 10 -5 20 M0 20 q9 8 7 20', '#ff4d6a', 4); g.e(big ? -11 : -7, 0, 15, 21, p.wood, big ? -26 : -14); g.e(big ? 11 : 7, 0, 15, 21, p.wl, big ? 26 : 14); if (big) { g.e(-12, -3, 7, 12, p.wl, -26); g.e(12, -3, 7, 12, A.light(p.wl, 0.35), 26); } g.c(0, 18, big ? 5.5 : 4.5, '#ffc928'); g.pop(); }
      g.s('M84 100 L80 70 M116 100 L120 70', p.m, 9);
      if (f.frill) for (const x of [44, 62, 81, 100, 119, 138, 156]) g.c(x, 160 - Math.abs(x - 100) * 0.22, 11, x % 2 ? f.frill : A.dark(f.frill, 0.2));
      g.e(100, 126, 58, 44, p.d); g.e(100, 120, 58, 42, p.m); g.e(100, 116, 44, 30, p.head); g.p('M100 146 A44 30 0 0 0 144 116 A54 38 0 0 1 72 140 A44 30 0 0 0 100 146Z', p.hs);
      for (const x of [56, 78, 100, 122, 144]) { const y = 156 - Math.abs(x - 100) * 0.24; g.c(x, y, 7, p.gold); g.c(x, y, 2.6, A.dark(p.gold, 0.35)); }
      g.c(80, 60, 13, WHITE); g.c(120, 60, 13, WHITE); eyes(g, 82, 122, 61, 0.72);
      smile(g, 100, 112, 9); blush(g, 74, 118); blush(g, 126, 118);
    } };
  // Twang: a lyre whose arms end in cat ears, with a tail that curls like a tuning peg.
  SP.twang = { pal: (m) => P(m, { pan: A.light(m, 0.78), wood: '#ffc02e', wd: '#d98a12', acc: '#ff6aa0' }), hat: [100, 52, 0.85], eyes: [80, 120, 139, 1], chin: [100, 176, 0.8],
    draw: (g, p, f) => {
      g.s('M146 152 C180 154 192 122 174 106 C160 94 144 108 156 120', p.d, 11);
      if (f.pick) g.p('M146 108 L170 112 L158 134 Z', f.pick);
      g.p('M52 140 C22 112 24 62 40 22 C48 42 56 52 66 58 C56 82 62 106 82 122 Z', p.m); g.p('M148 140 C178 112 176 62 160 22 C152 42 144 52 134 58 C144 82 138 106 118 122 Z', p.m);
      g.p('M40 22 C48 42 56 52 66 58 C62 66 60 74 60 82 C46 70 38 50 40 22Z', p.l); g.p('M160 22 C152 42 144 52 134 58 C138 66 140 74 140 82 C154 70 162 50 160 22Z', p.d);
      if (f.pick) { g.p('M40 18 L56 50 L34 52 Z', f.pick); g.p('M160 18 L144 50 L166 52 Z', f.pick); }
      if (f.leaf) for (const [x, sg] of [[40, -1], [160, 1]]) { g.e(x + sg * 8, 18, 14, 7, '#3fd070', sg * 40); g.e(x - sg * 8, 14, 13, 6.5, '#2fae5a', -sg * 30); g.c(x, 20, 4.5, f.leaf); }
      g.p('M62 60 H138 C146 86 140 108 118 124 H82 C60 108 54 86 62 60Z', p.pan);
      for (const x of f.strings === 3 ? [82, 100, 118] : [76, 88, 100, 112, 124]) g.s(`M${x} 66 V120`, f.gold ? '#f0a020' : p.d, f.strings === 3 ? 4.5 : 3);
      g.r(42, 56, 116, 13, 6.5, p.wood); g.c(42, 62.5, 9, p.wd); g.c(158, 62.5, 9, p.wd);
      g.e(78, 178, 15, 8, p.d); g.e(122, 178, 15, 8, p.d);
      g.e(100, 144, 54, 37, p.m); g.p('M100 181 A54 37 0 0 0 154 144 A66 46 0 0 1 70 175 A54 37 0 0 0 100 181Z', p.d);
      eyes(g, 80, 120, 138, 0.95); g.p('M95 148 h10 l-5 6z', p.acc); g.s('M92 158 Q96 163 100 157 Q104 163 108 158', INK, 3.4);
      g.s('M52 142 L66 146 M52 154 L66 152 M148 142 L134 146 M148 154 L134 152', INK, 3); blush(g, 66, 159, 0.85); blush(g, 134, 159, 0.85);
    } };
  // Screech: a fiddle on thin legs that saws at itself with a bow.
  SP.screech = { pal: (m) => P(m, { neck: '#5a3a2a', hair: '#fff7da', stick: '#8a4a26' }), hat: [100, 20, 0.62], eyes: [86, 114, 92, 0.85], chin: [100, 114, 0.6],
    draw: (g, p, f) => {
      g.s('M70 160 L50 184 M84 168 L74 186 M130 160 L150 184 M116 168 L126 186', p.dd, 7);
      g.s('M92 26 Q78 8 62 12 M108 26 Q122 8 138 12', p.neck, 4.5); g.c(62, 12, 4.5, p.neck); g.c(138, 12, 4.5, p.neck);
      g.r(93, 30, 14, 44, 5, p.neck); g.c(100, 30, 12, p.neck); g.c(100, 30, 5, p.m); g.c(88, 44, 4.5, p.stick); g.c(112, 44, 4.5, p.stick); g.c(88, 56, 4.5, p.stick); g.c(112, 56, 4.5, p.stick);
      g.e(100, 142, 46, 38, p.m); g.e(100, 96, 37, 31, p.m); g.r(70, 100, 60, 40, 0, p.m);
      g.p('M100 180 A46 38 0 0 0 146 142 Q140 132 133 124 A56 46 0 0 1 72 172 A46 38 0 0 0 100 180Z', p.d);
      g.s('M80 126 q-6 10 0 22 M120 126 q6 10 0 22', p.dd, 4.5); g.c(80, 124, 3.4, p.dd); g.c(120, 124, 3.4, p.dd); g.c(80, 150, 3.4, p.dd); g.c(120, 150, 3.4, p.dd);
      g.r(92, 150, 16, 22, 5, p.neck); g.s('M96 74 V152 M100 74 V152 M104 74 V152', p.l, 1.8);
      if (f.wings) { g.e(40, 110, 26, 14, p.l, -30); g.e(160, 110, 26, 14, p.l, 30); }
      if (f.bow2) { g.s('M164 156 L22 84', p.stick, 6); g.s('M160 163 L20 92', p.hair, 3.5); g.c(158, 158, 7, p.stick); }
      g.s('M36 156 L178 84', p.stick, 6); g.s('M40 163 L180 92', p.hair, 3.5); g.c(42, 158, 7, p.stick);
      if (f.saw) for (let i = 0; i < 9; i++) { const t = 0.08 + i * 0.105, x = 40 + 140 * t, y = 163 - 71 * t; g.p(`M${x - 7} ${y + 3.5} L${x + 7} ${y - 3.5} L${x + 4} ${y + 12} Z`, p.hair); }
      eyes(g, 86, 114, 92, 0.85); smile(g, 100, 104, 6); blush(g, 74, 104, 0.8); blush(g, 126, 104, 0.8);
    } };
  // Hum: an ocarina with wings, a beak and big round eyes.
  SP.hum = { pal: (m) => P(m, { beak: '#ffb020', belly: A.light(m, 0.72) }), hat: [100, 64, 0.9], eyes: [78, 122, 100, 1], chin: [100, 150, 0.8],
    draw: (g, p, f) => {
      if (f.pipes) for (const [x, h] of [[132, 64], [146, 50], [160, 38]]) { g.r(x - 6, 98 - h, 12, h, 4, f.pipes === 2 ? '#d8dcea' : '#5a3a2a'); g.r(x - 8, 94 - h, 16, 8, 3, '#ffc928'); }
      g.push(160, 142, 1, 28); g.r(-8, -12, 44, 24, 10, p.d); g.r(26, -12, 10, 24, 4, p.dd); g.pop();
      g.p('M70 70 L62 42 L88 62 Z', p.m); g.p('M130 70 L138 42 L112 62 Z', p.m);
      g.e(70, 180, 13, 7, p.beak); g.e(124, 180, 13, 7, p.beak);
      g.e(100, 120, 62, 56, p.m); g.p('M100 176 A62 56 0 0 0 162 120 A76 68 0 0 1 64 166 A62 56 0 0 0 100 176Z', p.d);
      g.e(100, 142, 40, 30, p.belly); for (const [x, y] of [[80, 146], [100, 152], [120, 146]]) g.c(x, y, 6, p.dd);
      if (f.span) { g.e(24, 110, 17, 38, p.d, 36); g.e(18, 100, 9, 22, p.l, 36); g.e(176, 106, 17, 38, p.dd, -36); g.e(182, 96, 9, 22, p.l, -36); } else { g.e(40, 126, 13, 26, p.d, 14); g.e(160, 122, 12, 22, p.dd, -14); }
      g.c(78, 100, 19, WHITE); g.c(122, 100, 19, WHITE); eyes(g, 80, 120, 101, 0.95); g.p('M92 112 h16 l-8 13 z', p.beak);
      blush(g, 58, 120, 0.9); blush(g, 142, 120, 0.9);
    } };
  // Squeak: a squeezebox that crawls along like a caterpillar.
  SP.squeak = { pal: (m) => P(m, { fold: '#ff8ab8', fd: '#e05a94', key: WHITE }), hat: [52, 80, 0.78], eyes: [40, 64, 112, 0.85], chin: [52, 146, 0.7],
    draw: (g, p, f) => {
      g.s('M176 138 Q198 132 192 112 Q188 100 178 106', p.fold, 6);
      for (const x of f.arch ? [82, 160] : [86, 110, 134, 160]) g.e(x, 170, 9, 7, p.dd);
      const n = f.long ? 7 : 6, x0 = 72, w = 84 / n, top = f.wall ? 58 : 84, cap = f.wall ? 46 : 72;
      for (let i = 0; i < n; i++) { const x = x0 + i * w, c = i % 2 ? p.fd : p.fold, up = f.arch ? Math.sin((Math.PI * (i + 0.5)) / n) * 30 : 0; g.p(`M${x} ${top - up} L${x + w / 2} ${top - 10 - up} L${x + w} ${top - up} V${160 - up} L${x + w / 2} ${170 - up} L${x} ${160 - up} Z`, c); }
      g.r(152, cap, 26, 172 - cap, 8, p.m); g.p(`M165 172 h5 a8 8 0 0 0 8 -8 v-${156 - cap} a8 8 0 0 0 -8 -8 h-5 Z`, p.d);
      for (let y = cap + 22; y < 160; y += 18) g.c(162, y, 5.5, p.key);
      if (f.wall) { g.r(146, cap - 6, 38, 12, 5, '#c9d0e2'); g.r(146, 166, 38, 10, 5, '#c9d0e2'); }
      g.c(30, 80, 15, p.m); g.c(30, 80, 8, p.fold); g.c(72, 78, 15, p.m); g.c(72, 78, 8, p.fold);
      g.r(18, 82, 66, 86, 26, p.m); g.p('M52 168 h6 a26 26 0 0 0 26 -26 v-34 a50 60 0 0 1 -50 58 a26 26 0 0 0 18 2 Z', p.d);
      g.e(40, 174, 12, 7, p.dd); g.e(64, 174, 12, 7, p.dd);
      eyes(g, 40, 64, 114, 0.85); g.e(52, 128, 5, 3.6, p.fd); smile(g, 52, 134, 6); blush(g, 30, 132, 0.8); blush(g, 74, 132, 0.8);
    } };
  // Blare: a long brass horn that slithers; its valves stand up like a crest.
  const TUBE = 'M58 76 C92 76 98 44 126 50 C162 58 138 106 104 116 C60 130 66 172 108 170 C138 168 148 150 178 152';
  SP.blare = { pal: (m) => P(m, { inn: '#8a3f12', navy: INK, acc: '#2fd0d0' }), hat: [86, 50, 0.6], eyes: [80, 80, 66, 1], chin: [96, 96, 0.5],
    draw: (g, p, f) => {
      if (f.pennant) { g.p('M24 100 H58 V152 L41 138 L24 152 Z', f.pennant); g.c(41, 122, 5.5, WHITE); }
      if (f.flag) { g.s('M150 96 V150', p.dd, 5); g.p('M150 98 H196 L186 116 L196 134 H150 Z', f.flag); star4(g, 170, 116, 9, WHITE); }
      g.p('M176 144 L194 138 V166 L176 160Z', p.d);
      g.push(0, 5); g.s(TUBE, p.navy, 24); g.pop();
      for (const [x, y] of [[108.5, 18], [124.5, 20], [140.5, 26]]) { g.r(x - 5.5, y, 11, 26, 3, p.d); g.c(x, y - 1, 8, p.l); }
      g.s(TUBE, p.m, 24); g.push(0, -6); g.s(TUBE, p.l, 5); g.pop();
      g.c(76, 72, 22, p.m); g.push(66, 75, f.wide ? [1.18, 1.36] : 1); g.push(-66, -75); g.p('M66 58 L20 34 Q8 76 20 118 L66 92 Z', p.m); g.p('M66 92 L20 118 Q14 98 13 76 L66 78Z', p.d);
      g.e(20, 76, f.wide ? 13 : 10, 42, p.l); g.e(20, 76, f.wide ? 7 : 5, 31, p.inn); if (f.wide) for (const y of [46, 106]) g.c(40, y, 3.6, p.l); g.pop(); g.pop();
      eye(g, 80, 66); blush(g, 90, 82, 0.75); for (const [x, y] of [[150, 84], [78, 140], [128, 164]]) g.c(x, y, 4.5, p.acc);
    } };
  // Clang: a heavy bell with a head and feet poking out from under the rim.
  SP.clang = { pal: (m) => P(m, { skin: '#4fc878', sd: '#2f9a58' }), hat: [106, 34, 0.8], eyes: [42, 42, 132, 0.8], chin: [50, 156, 0.6],
    draw: (g, p, f) => {
      g.s('M150 156 Q176 158 182 170', p.sd, 7); g.c(184, 172, 10, p.d);
      g.e(80, 176, 16, 9, p.sd); g.e(134, 176, 16, 9, p.sd);
      g.e(44, 140, 26, 20, p.skin); g.p('M44 160 A26 20 0 0 0 68 148 A30 22 0 0 1 26 154 A26 20 0 0 0 44 160Z', p.sd);
      if (f.spikes) { tri(g, [62, 116], [38, 96], [70, 94], CREAM); tri(g, [74, 78], [56, 52], [86, 62], CREAM); tri(g, [150, 116], [174, 96], [142, 94], '#f0cf9a'); tri(g, [138, 78], [156, 52], [126, 62], '#f0cf9a'); }
      if (f.cluster) for (const [x, sg] of [[70, -1], [142, 1]]) { g.s(`M106 44 Q${106 + sg * 18} 26 ${x} 22`, p.dd, 4.5); g.p(`M${x - 11} 30 Q${x - 10} 8 ${x} 6 Q${x + 10} 8 ${x + 11} 30 Z`, p.l); g.r(x - 13, 27, 26, 6, 3, p.m); g.c(x, 35, 3.6, p.dd); }
      g.s('M106 40 a10 10 0 1 0 0.1 0', p.d, 8);
      g.p('M56 158 C62 112 68 62 106 50 C144 62 150 112 156 158 Z', p.m); g.p('M106 50 C144 62 150 112 156 158 H120 C130 118 128 74 106 50Z', p.d);
      g.s('M74 100 Q82 70 98 60', p.l, 7); g.s('M62 132 H150', p.d, 5);
      g.r(46, 150, 120, 20, 10, p.m); g.p('M106 170 h50 a10 10 0 0 0 0 -20 h-12 a40 14 0 0 1 -38 14 Z', p.d);
      if (f.jingles) for (const [x, y] of [[84, 96], [112, 110], [132, 92]]) { g.c(x, y, 9, p.l); g.s(`M${x - 5} ${y + 2} h10`, p.dd, 3); }
      if (f.band) { g.s('M68 118 H146', f.band, 7); for (const x of [80, 106, 132]) g.c(x, 118, 3.4, WHITE); }
      eye(g, 40, 134, 0.8); blush(g, 52, 148, 0.7); g.s('M24 146 Q30 150 36 147', INK, 3);
    } };
  // Yelp: a round microphone on springy frog legs.
  SP.yelp = { pal: (m) => P(m, { metal: '#5a5278', ml: '#8a84b0', belly: A.light(m, 0.7) }), hat: [100, 34, 0.75], eyes: [70, 130, 46, 0.9], chin: [100, 136, 0.85],
    draw: (g, p, f) => {
      if (f.whip) { g.s('M112 170 Q156 200 184 166 Q200 136 178 112', p.metal, 5); g.push(176, 108, 1, -30); g.r(-6, -14, 12, 18, 3, p.ml); g.r(-2.5, -24, 5, 12, 1, '#ffc928'); g.pop(); }
      else if (f.heart) { g.s('M112 170 Q146 192 170 166', p.metal, 5); g.push(176, 140, 1.9); g.s('M0 12 C-14 0 -7 -11 0 -4 C7 -11 14 0 0 12Z', '#ff4d6a', 3); g.pop(); }
      else g.s('M112 170 Q140 190 164 176 Q182 164 170 150', p.metal, 5);
      if (f.filter) { g.s('M70 160 Q22 160 30 116', p.metal, 5); g.c(32, 92, 25, p.metal); g.c(32, 92, 20, '#d9d4ec'); g.s('M18 84 H46 M14 94 H50 M20 104 H44 M26 76 V108 M38 76 V108', '#b0a8cc', 1.8); }
      if (f.burst) for (const a of [-168, -90, -12]) { const c = Math.cos((a * Math.PI) / 180), sn = Math.sin((a * Math.PI) / 180), nx = -sn, ny = c; tri(g, [100 + c * 44 + nx * 11, 86 + sn * 44 + ny * 11], [100 + c * 78, 86 + sn * 78], [100 + c * 44 - nx * 11, 86 + sn * 44 - ny * 11], '#ffd95a'); }
      g.s('M70 140 Q34 138 40 170', p.d, 13); g.s('M130 140 Q166 138 160 170', p.d, 13); g.e(40, 176, 20, 9, p.m); g.e(160, 176, 20, 9, p.m);
      g.p('M82 130 H118 L112 176 Q100 182 88 176 Z', p.metal); g.p('M100 130 H118 L112 176 Q106 180 100 180 Z', A.dark(p.metal, 0.3));
      g.c(70, 46, 19, p.m); g.c(130, 46, 19, p.m);
      g.c(100, 86, 50, p.m); g.p('M100 136 A50 50 0 0 0 150 86 A62 62 0 0 1 70 126 A50 50 0 0 0 100 136Z', p.d);
      g.s('M56 70 Q100 54 144 70 M52 96 Q100 84 148 96 M76 44 Q66 86 80 130 M124 44 Q134 86 120 130', p.l, 3);
      g.r(74, 124, 52, 13, 6.5, p.ml);
      g.c(70, 46, 12, WHITE); g.c(130, 46, 12, WHITE); eyes(g, 71, 131, 47, 0.7);
      g.e(100, 100, f.loud ? 20 : 15, f.loud ? 15 : 10, INK); g.e(100, 105, f.loud ? 11 : 8, 5, '#ff6a8a'); blush(g, 66, 96); blush(g, 134, 96);
    } };
  // Howl: a megaphone with a wolf's ears and tail, always pointed at the sky.
  SP.howl = { pal: (m) => P(m, { cone: '#fff1d0', cd: '#f0cf9a', rim: '#ff6aa0', chest: A.light(m, 0.7) }), hat: [128, 70, 0.62], eyes: [116, 116, 98, 0.8], chin: [112, 128, 0.7],
    draw: (g, p, f) => {
      g.p('M146 150 Q196 150 190 108 Q186 92 172 100 Q180 124 150 128 Z', p.d); g.p('M190 108 Q186 92 172 100 Q176 110 172 118 Q184 120 190 108Z', p.chest);
      g.e(86, 178, 15, 8, p.d); g.e(136, 178, 17, 9, p.d);
      g.e(118, 146, 42, 36, p.m); g.p('M118 182 A42 36 0 0 0 160 146 A54 44 0 0 1 90 174 A42 36 0 0 0 118 182Z', p.d);
      g.e(104, 152, 20, 24, p.chest); g.s('M92 150 V178 M110 156 V178', p.d, 9);
      if (f.mane) { tri(g, [150, 100], [180, 92], [158, 120], p.dd); tri(g, [156, 124], [184, 128], [156, 142], p.dd); tri(g, [138, 50], [168, 40], [154, 76], p.dd); g.p('M186 106 L204 92 L196 116 Z', p.d); }
      g.p('M128 62 L150 40 L152 76 Z', p.m); g.p('M146 82 L170 68 L162 100 Z', p.d);
      g.c(124, 100, 32, p.m);
      if (f.ruff) { for (const [x, y, rr] of [[86, 140, 13], [100, 132, 14], [114, 140, 13], [92, 154, 12], [108, 154, 12]]) g.c(x, y, rr, p.chest); }
      if (f.twin) { g.push(108, 110, 0.86, -36); g.push(-110, -106); g.p('M104 118 L34 78 Q28 52 54 26 L118 84 Z', p.cd); g.e(44, 52, 13, 30, p.rim, 42); g.e(45, 53, 6, 20, A.dark(p.rim, 0.45), 42); g.pop(); g.pop(); }
      g.p('M104 118 L34 78 Q28 52 54 26 L118 84 Z', p.cone); g.p('M104 118 L34 78 Q30 66 34 54 L112 100 Z', p.cd);
      g.e(44, 52, 13, 30, p.rim, 42); g.e(45, 53, 6, 20, A.dark(p.rim, 0.45), 42); g.s('M82 62 L64 96', p.rim, 6);
      g.s('M108 96 Q116 90 124 96', INK, 4.5); blush(g, 132, 108, 0.8); g.c(100, 112, 5, INK);
    } };

  /* ---- every form: colour, size, what it wears and what floats around it ---- */
  const BASE = { thud: '#ff9234', clack: '#f2603a', twang: '#35d07c', screech: '#a8d42e', hum: '#4aa8f0', squeak: '#8f8cf0', blare: '#ffc928', clang: '#f2b632', yelp: '#ff6aa0', howl: '#b48cf0' };
  // Each form: its main colour (c), the body or instrument features that set its outline (f), and now and then a second colour (pal).
  // No hats, no floating symbols: a form is told apart by its outline and its colour.
  const LOOK = {
    stomp: { c: '#d8582a', f: { sticks: 1, armor: 1 } }, march: { c: '#b03048', f: { sticks: 1, armor: 1, tom: 1 }, pal: { acc: '#ffd95a' } }, cadence: { c: '#f0a81e', f: { sticks: 2, armor: 1 }, pal: { rim: '#6a3fb0' } },
    patter: { c: '#ffbc50', f: { bongo: 1 } }, jig: { c: '#9ad03a', f: { bongo: 1 }, pal: { acc: '#2f8a4a' } }, roll: { c: '#e0406a', f: { bongo: 1, snare: 1, sticks: 2 } },
    click: { c: '#ff4a3a', f: { claws: 1 } }, flamenco: { c: '#d8284a', f: { claws: 1, frill: '#ffc928' } }, tango: { c: '#7a3a8a', f: { claws: 1 }, pal: { wood: '#2b2140', wl: '#4a3a6a' } },
    rattle: { c: '#ff9a3a', f: { maracas: 1 } }, rumba: { c: '#ffc23a', f: { maracas: 1, frill: '#ff7a3a' } }, samba: { c: '#2fc8b8', f: { maracas: 1 }, pal: { gold: '#ff6aa0' } },
    pluck: { c: '#2fb85a', f: { strings: 3, pick: '#ff6a3a' } }, riff: { c: '#1fb8c8', f: { strings: 3, pick: '#ffc928', gold: 1 } }, shred: { c: '#9ad82e', f: { strings: 3, pick: '#ff3d3d' }, aura: ['flames', '#ff8a3a'] },
    strum: { c: '#7fe6b0', f: { leaf: '#ff8ab8' } }, ballad: { c: '#5ac8e8', f: { leaf: '#ff6aa0', gold: 1 } }, waltz: { c: '#c8e86a', f: { leaf: '#ffd95a' }, pal: { wood: '#ff8ab8', wd: '#e05a94' } },
    saw: { c: '#b8d82e', f: { saw: 1 } }, reel: { c: '#5fc84a', f: { saw: 1, bow2: 1 } }, lament: { c: '#4a8aa8', f: { saw: 1 }, pal: { hair: '#c8d4ff' } },
    quaver: { c: '#d8e85a', f: { wings: 1 } }, nocturne: { c: '#3f9aa8', f: { wings: 1 }, pal: { neck: '#2b2140' } }, caprice: { c: '#f0c83a', f: { wings: 1, bow2: 1 }, pal: { stick: '#e04a8a' } },
    drone: { c: '#3a78d8', f: { pipes: 1 } }, dirge: { c: '#5a54c0', f: { pipes: 1 } }, chorale: { c: '#7ad0ff', f: { pipes: 2, span: 1 } },
    whistle: { c: '#4fd8d8', f: { span: 1 } }, carol: { c: '#2fc89a', f: { span: 1 }, pal: { beak: '#ff5a4a' } }, lullaby: { c: '#a08af0', f: { span: 1 } },
    wheeze: { c: '#5a68d8', f: { wall: 1 } }, polka: { c: '#3fa0e8', f: { long: 1, wall: 1 }, pal: { fold: '#ffd95a', fd: '#f0a020' } }, shanty: { c: '#2f5ab8', f: { long: 1, wall: 1 }, pal: { fold: '#ffffff', fd: '#ff6b5e' } },
    trill: { c: '#b090fa', f: { arch: 1 } }, scherzo: { c: '#e06ad0', f: { long: 1, arch: 1 }, pal: { fold: '#ffd95a', fd: '#2fd0d0' } }, cadenza: { c: '#7a5ae8', f: { long: 1, arch: 1 }, pal: { fold: '#c8b8ff', fd: '#9a80f4' } },
    bellow: { c: '#f09a1e', f: { wide: 1 } }, fanfare: { c: '#ff7a3a', f: { wide: 1 } }, anthem: { c: '#ffe45a', f: { wide: 1 }, pal: { acc: '#ff4d6a' } },
    toot: { c: '#ffdc5a', f: { pennant: '#ff4d6a' } }, swing: { c: '#d8a020', f: { pennant: '#5a4a8a' } }, reveille: { c: '#ff9a4a', f: { pennant: '#3f6fd8' } },
    toll: { c: '#d8901e', f: { spikes: 1 } }, knell: { c: '#8a6a4a', f: { spikes: 1 }, pal: { skin: '#8a9ae0', sd: '#5a6ab8' } }, peal: { c: '#ffd83a', f: { spikes: 1, band: '#ff6b5e' } },
    jingle: { c: '#ffcc50', f: { jingles: 1, cluster: 1 } }, carillon: { c: '#ffa8c4', f: { jingles: 1, cluster: 1 } }, gamelan: { c: '#c8a02a', f: { jingles: 1, cluster: 1, band: '#2fd0d0' }, pal: { skin: '#2fc8b8', sd: '#1f9a8a' } },
    croon: { c: '#f0508a', f: { filter: 1 } }, serenade: { c: '#d82a5a', f: { filter: 1, heart: 1 } }, hymn: { c: '#ffb4d2', f: { filter: 1, heart: 1 }, pal: { metal: '#b8a8d8', ml: '#d8d0f0' } },
    shout: { c: '#ff5a4a', f: { loud: 1, burst: 1 } }, chant: { c: '#b85ae0', f: { loud: 1, burst: 1, whip: 1 } }, aria: { c: '#ff5ad0', f: { loud: 1, burst: 1, whip: 1 }, pal: { metal: '#8a2a6a', ml: '#b84a94' } },
    growl: { c: '#8a60d8', f: { mane: 1 } }, blues: { c: '#4a6ae0', f: { mane: 1 }, pal: { rim: '#5ad0e8' } }, grunge: { c: '#5a4a6a', f: { mane: 1 }, pal: { rim: '#9be06a', cone: '#d8d0c0', cd: '#b0a890' } },
    bay: { c: '#c8a0f8', f: { twin: 1, ruff: 1 } }, round: { c: '#f09ad8', f: { twin: 1, ruff: 1 } }, requiem: { c: '#7a7ab8', f: { twin: 1, ruff: 1 }, pal: { cone: '#e0e4f8', cd: '#b8c0e0', rim: '#8a9af0' } },
  };
  A.PET = { SP, LOOK, BASE, WEAR, AURA, P, eye, eyes, blush, smile, zig, note, star4, bolt, heart, tri, CREAM, WHITE, BLUSH };
  A.petLook = (id) => { const F = H.FORMS[id], sp = SP[F.sp], L = LOOK[id] || {}; return { F, sp, L, col: L.c || BASE[F.sp] }; };
  // Called once every species has been described (see art-pets2.js).
  A.buildPets = () => {
    for (const id of Object.keys(H.FORMS)) {
      const { F, sp, L, col } = A.petLook(id), s = L.s || [0.84, 0.89, 0.94][F.tier], pal = Object.assign(sp.pal(col), L.pal || {});
      A.def(id, { size: 48 }, (g) => {
        if (L.aura) AURA[L.aura[0]](g, L.aura[1]);
        g.push(100, 184, s); g.push(-100, -184);
        sp.draw(g, pal, L.f || {});
        for (const [slot, at] of [['hat', L.hatAt || sp.hat], ['chin', sp.chin]]) if (L[slot]) { g.push(at[0], at[1], at[2], at[3] || 0); WEAR[L[slot][0]](g, L[slot][1]); g.pop(); }
        if (L.eyes) { const e = sp.eyes; g.push((e[0] + e[1]) / 2, e[2], e[0] === e[1] ? e[3] * 0.6 : Math.abs(e[1] - e[0]) / 42); WEAR[L.eyes[0]](g, L.eyes[1]); g.pop(); }
        g.pop(); g.pop();
      });
    }
  };
  A.FAMCOL = { drum: '#ff9234', string: '#35d07c', breath: '#4aa8f0', brass: '#ffc928', voice: '#ff6aa0', none: '#9a94b8' };
})(window.H);
