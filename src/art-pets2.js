/* Hushsong — ten more pets. Same rules: an instrument first, with just enough creature in it to have a face. */
(function (H) {
  'use strict';
  const A = H.Art, INK = A.INK, T = A.PET, { SP, LOOK, BASE, P, eye, eyes, blush, smile, heart, tri, CREAM, WHITE } = T;
  // Bong: a gong that carries its own frame around.
  SP.bong = { pal: (m) => P(m, { wood: '#8a4420', wl: '#b8643a', gold: '#ffc928' }), hat: [100, 26, 0.9], eyes: [82, 118, 106, 1], chin: [100, 158, 0.8],
    draw: (g, p, f) => {
      g.s('M170 150 L192 96', p.wood, 7); g.c(193, 90, f.big ? 16 : 13, CREAM); g.p('M193 77 a13 13 0 0 1 0 26 a18 13 0 0 0 0 -26z', '#f7d9a4');
      g.e(40, 180, 18, 8, p.wood); g.e(160, 180, 18, 8, p.wood);
      if (f.pagoda) { g.p('M24 30 Q10 26 8 10 Q24 18 40 22 Z', p.wl); g.p('M176 30 Q190 26 192 10 Q176 18 160 22 Z', p.wood); }
      if (f.tier) { g.r(92, 14, 16, 16, 0, p.wood); g.r(50, 4, 100, 13, 6.5, p.wl); g.p('M100 4 h44 a6.5 6.5 0 0 1 0 13 h-44 Z', p.wood); g.s('M58 17 V30 M142 17 V30', p.gold, 3.4); g.c(58, 33, 5, p.gold); g.c(142, 33, 5, p.gold); }
      g.r(32, 36, 16, 142, 6, p.wl); g.r(152, 36, 16, 142, 6, p.wood); g.r(22, 28, 156, 16, 8, p.wl); g.p('M100 28 h70 a8 8 0 0 1 0 16 h-70 Z', p.wood);
      g.s('M74 44 V62 M126 44 V62', p.gold, 4);
      g.c(100, 110, 54, p.d); g.c(100, 110, 46, p.m); g.p('M100 156 A46 46 0 0 0 146 110 A58 58 0 0 1 74 148 A46 46 0 0 0 100 156Z', p.d);
      g.c(100, 110, 20, p.l); if (f.rings) { g.s('M100 110 m-30 0 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0', p.l, 3.6); g.s('M100 110 m-39 0 a39 39 0 1 0 78 0 a39 39 0 1 0 -78 0', p.l, 2.6); }
      if (f.dent) for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283 + 0.4; g.s(`M${100 + Math.cos(a) * 27} ${110 + Math.sin(a) * 27} L${100 + Math.cos(a) * 41} ${110 + Math.sin(a) * 41}`, p.dd, 4); }
      if (f.crack) { g.s('M136 76 L122 88 L132 98 L124 108', p.dd, 4.5); g.s('M62 132 L76 142 L68 152', p.dd, 4.5); }
      if (f.mirror) { g.al(0.75); g.s('M68 92 L90 72', WHITE, 6); g.s('M82 96 L94 85', WHITE, 4); g.al(1); }
      eyes(g, 82, 118, 106); blush(g, 68, 120); blush(g, 132, 120); smile(g, 100, 118, 8);
    } };
  // Tock: a xylophone that crawls like a caterpillar.
  SP.tock = { pal: (m) => P(m, { base: '#8a4420', bars: ['#ff6b5e', '#ffb020', '#ffd95a', '#7fd67c', '#5ac8f0'] }), hat: [42, 88, 0.7], eyes: [30, 54, 118, 0.85], chin: [42, 150, 0.6],
    draw: (g, p, f) => {
      g.s('M30 94 L16 62 M54 92 L66 58', p.base, 4.5); g.c(15, 58, 8, f.gold ? '#ffc928' : CREAM); g.c(67, 54, 8, f.gold ? '#ffc928' : CREAM);
      for (const x of [74, 98, 122, 146, 170]) g.e(x, 176, 9, 7, p.dd);
      g.p('M56 150 L182 138 Q190 150 182 162 L56 172 Z', p.base);
      const n = f.long ? 6 : 5; for (let i = 0; i < n; i++) { const x = 66 + i * (112 / n), w = 112 / n - 4, h = 74 - i * (40 / n), c = f.mono ? (i % 2 ? p.m : p.l) : p.bars[i % 5]; g.r(x, 160 - h - i * 1.4, w, h, 6, c); g.r(x + w - 7, 160 - h - i * 1.4, 7, h, 4, A.dark(c, 0.2)); g.c(x + w / 2, 160 - h - i * 1.4 + 9, 3, WHITE); }
      g.c(42, 124, 34, p.m); g.p('M42 158 A34 34 0 0 0 76 124 A44 44 0 0 1 22 152 A34 34 0 0 0 42 158Z', p.d);
      eyes(g, 30, 54, 120, 0.85); blush(g, 20, 134, 0.8); blush(g, 64, 134, 0.8); smile(g, 42, 132, 7);
    } };
  // Jangle: a banjo with a very long neck.
  SP.jangle = { pal: (m) => P(m, { wood: '#8a4a26', wl: '#b8703a', head: CREAM, hs: '#f7d9a4', gold: '#ffc928' }), hat: [84, 80, 0.8], eyes: [68, 100, 128, 1], chin: [84, 176, 0.7],
    draw: (g, p, f) => {
      const neck = (x, y, sc, rot) => { g.push(x, y, sc, rot); g.r(-9, -90, 18, 94, 6, p.wl); g.r(0, -90, 9, 94, 4, p.wood); g.r(-13, -114, 26, 30, 8, p.wood);
        for (const [nx, ny] of [[-17, -106], [17, -106], [-17, -92], [17, -92]]) g.c(nx, ny, 5.5, p.gold);
        g.s('M-4 -86 V0 M0 -86 V0 M4 -86 V0', CREAM, 1.6); g.pop(); };
      if (f.twin) neck(120, 122, 0.74, 62);
      neck(118, 104, 1, f.twin ? 30 : 38);
      if (f.petals) for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283 + 0.26; g.e(84 + Math.cos(a) * 55, 130 + Math.sin(a) * 55, 16, 9, i % 2 ? f.petals : A.light(f.petals, 0.35), (a * 180) / Math.PI); }
      g.e(62, 178, 15, 8, p.d); g.e(106, 178, 15, 8, p.d);
      g.c(84, 130, 52, p.m); g.p('M84 182 A52 52 0 0 0 136 130 A64 64 0 0 1 56 174 A52 52 0 0 0 84 182Z', p.d);
      g.c(84, 130, 41, p.head); g.p('M84 171 A41 41 0 0 0 125 130 A52 52 0 0 1 62 164 A41 41 0 0 0 84 171Z', p.hs);
      for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.283; g.c(84 + Math.cos(a) * 46.5, 130 + Math.sin(a) * 46.5, 3, p.gold); }
      if (f.star) g.p(A.starPath(84, 154, 9, 4, 5), p.m);
      eyes(g, 68, 100, 126); blush(g, 54, 140); blush(g, 114, 140); smile(g, 84, 138, 8);
    } };
  // Plink: a small piano that smiles with all its keys.
  SP.plink = { pal: (m) => P(m, { key: WHITE, kd: '#e6e0f0' }), hat: [100, 52, 0.9], eyes: [78, 122, 92, 1], chin: [100, 156, 0.7],
    draw: (g, p, f) => {
      g.r(52, 150, 16, 32, 6, p.dd); g.r(132, 150, 16, 32, 6, p.dd); g.r(92, 156, 16, 22, 6, p.dd); g.e(100, 180, 12, 5, '#ffc928');
      if (f.lid) g.p('M40 62 L150 20 Q164 22 160 62 Z', p.d);
      if (f.upright) { g.r(38, 26, 124, 60, 16, p.d); g.r(46, 33, 108, 8, 4, p.l); g.r(66, 44, 68, 18, 4, CREAM); g.s('M74 50 H126 M74 56 H112', p.dd, 2.4); g.c(120, 56, 3, INK); }
      g.r(34, 58, 132, 100, 20, p.m); g.p('M120 58 h26 a20 20 0 0 1 20 20 v60 a20 20 0 0 1 -20 20 h-26 Q146 110 120 58 Z', p.d);
      g.s('M48 72 Q100 62 152 72', p.l, 5);
      g.r(44, 112, 112, 30, 8, INK); g.r(48, 116, 104, 22, 4, p.key);
      for (let i = 1; i < 8; i++) g.s(`M${48 + i * 13} 116 V138`, p.kd, 2, true); for (const i of [1, 2, 4, 5, 6]) g.r(48 + i * 13 - 4, 116, 8, 13, 2, INK);
      eyes(g, 78, 122, 92); blush(g, 60, 104); blush(g, 140, 104);
    } };
  // Peep: a chick with pan pipes for a crest.
  SP.peep = { pal: (m) => P(m, { pipe: '#f7d9a4', pd: '#d9a86a', band: '#ff6b5e', beak: '#ffb020' }), hat: [100, 26, 0.6], eyes: [84, 116, 126, 0.95], chin: [100, 166, 0.7],
    draw: (g, p, f) => {
      const n = f.lance ? 3 : f.pipes || 5, mid = (n - 1) / 2;
      if (f.lance) { g.s('M22 152 L176 54', p.pd, 11); g.s('M22 150 L176 52', p.pipe, 6); for (const t of [0.06, 0.14, 0.22, 0.8, 0.88]) g.c(22 + 154 * t, 151 - 98 * t, 2.8, A.dark(p.pd, 0.45)); g.r(166, 44, 16, 16, 4, p.band); tri(g, [176, 40], [194, 40], [184, 58], '#d8dcea'); }
      for (let i = 0; i < n; i++) {
        if (f.fan) { const len = 86 - Math.abs(i - mid) * 5; g.push(100, 106, 1, (i - mid) * (n > 5 ? 12.5 : 14)); g.r(-6.5, -len, 13, len, 5, i % 2 ? p.pd : p.pipe); g.e(0, -len + 3, 4, 2.4, A.dark(p.pd, 0.4)); if (f.fan !== 1) g.c(0, -len + 14, 4.5, f.fan); g.pop(); }
        else { const x = 100 + (i - mid) * 15, top = (f.lance ? 50 : 34) + i * 8 + (n > 5 ? -6 : 0); g.r(x - 6.5, top, 13, 100 - top, 5, i % 2 ? p.pd : p.pipe); g.e(x, top + 3, 4, 2.4, A.dark(p.pd, 0.4)); }
      }
      if (f.fan) g.s('M64 86 Q100 70 136 86', p.band, 10); else g.r(100 - n * 7.5 - 4, 78, n * 15 + 8, 11, 4, p.band);
      g.p('M150 150 L178 138 L170 158 Z', p.d);
      g.s('M86 170 V184 M114 170 V184', p.beak, 5); g.e(84, 185, 9, 4, p.beak); g.e(116, 185, 9, 4, p.beak);
      g.c(100, 132, 46, p.m); g.p('M100 178 A46 46 0 0 0 146 132 A58 58 0 0 1 72 170 A46 46 0 0 0 100 178Z', p.d); g.e(100, 150, 26, 20, p.l);
      if (f.lance) { g.e(46, 134, 12, 28, p.d, 48); g.e(156, 130, 12, 30, p.dd, -52); g.p('M150 150 L190 132 L176 162 Z', p.d); } else { g.e(54, 138, 11, 18, p.d, 18); g.e(146, 138, 11, 18, p.dd, -18); }
      eyes(g, 84, 116, 124, 0.95); g.p('M92 136 h16 l-8 11 z', p.beak); blush(g, 68, 140, 0.85); blush(g, 132, 140, 0.85);
    } };
  // Skirl: a bagpipe with a mind of its own.
  SP.skirl = { pal: (m) => P(m, { wood: '#4a3a5a', ring: CREAM, tart: A.light(m, 0.35) }), hat: [84, 84, 0.8], eyes: [72, 104, 122, 0.95], chin: [90, 166, 0.7],
    draw: (g, p, f) => {
      const DR = f.droop ? [[114, 34, 72], [136, 60, 64], [152, 86, 54]] : f.spear ? [[106, -8, 68], [126, 8, 62], [146, 24, 54]] : [[112, 8, 78], [132, 22, 66], [150, 36, 54]];
      for (const [x, r, h] of DR) { g.push(x, 96, 1, r); g.r(-6, -h, 12, h, 4, p.wood); g.r(-8, -h - 4, 16, 9, 3, p.ring); g.r(-7, -h * 0.5, 14, 6, 2, p.ring); if (f.flags) g.p(`M6 ${-h + 8} l14 5 l-14 6 z`, '#ff6b5e'); if (f.spear) g.p(`M-9 ${-h - 3} L0 ${-h - 20} L9 ${-h - 3} Z`, '#d8dcea'); g.pop(); }
      if (f.droop) for (const [x, y, rr] of [[186, 40, 8], [198, 66, 5.5], [170, 22, 5], [196, 104, 7]]) { g.c(x, y, rr, '#9be06a'); g.c(x - rr * 0.3, y - rr * 0.3, rr * 0.3, WHITE); }
      g.push(40, 120, 1, -24); g.r(-5, -4, 10, 54, 4, p.wood); g.r(-7, 44, 14, 8, 3, p.ring); g.pop();
      g.e(70, 178, 14, 8, p.dd); g.e(118, 178, 14, 8, p.dd);
      g.e(96, 132, 60, 46, p.m); g.p('M96 178 A60 46 0 0 0 156 132 A74 56 0 0 1 62 170 A60 46 0 0 0 96 178Z', p.d);
      g.s('M52 110 Q96 96 142 112 M44 140 Q96 126 152 142 M70 92 Q62 132 74 172 M104 88 Q112 132 104 176 M134 98 Q146 136 132 168', p.tart, 3.4);
      if (f.spear) { g.s('M38 150 Q96 172 154 150', '#8a4a26', 9); g.r(88, 156, 18, 14, 3, '#ffc928'); }
      eyes(g, 72, 104, 124, 0.95); blush(g, 56, 138, 0.85); blush(g, 120, 138, 0.85); g.e(88, 140, 6, 4.5, INK);
    } };
  // Oompah: a snail whose shell is a tuba.
  SP.oompah = { pal: (m) => P(m, { skin: '#9fdc7a', sd: '#6fba58', inn: '#8a3f12' }), hat: [42, 98, 0.62], eyes: [30, 54, 96, 0.8], chin: [44, 150, 0.55],
    draw: (g, p, f) => {
      g.p('M22 150 Q14 176 44 180 H176 Q194 180 186 164 Q150 158 120 160 Q80 164 66 140 Q60 118 40 118 Q22 122 22 150 Z', p.skin); g.p('M44 180 H176 Q194 180 186 164 Q150 170 100 170 Q60 172 30 164 Q30 178 44 180Z', p.sd);
      g.s('M30 120 L26 98 M52 120 L56 96', p.skin, 8);
      const bell = (x, y, sc, rot) => { g.push(x, y, sc, rot); g.p('M-16 34 L-34 -14 H34 L16 34 Z', p.m); g.p('M0 34 L0 -14 H34 L16 34 Z', p.d); g.e(0, -14, 34, 11, p.l); g.e(0, -13, 25, 6.5, p.inn); g.pop(); };
      if (f.twin) { bell(170, 72, 0.78, 50); bell(134, 44, 0.86, 4); } else if (f.wrap) bell(140, 46, 1.22, 6); else bell(150, 50, 1, 24);
      if (f.wrap) { g.c(116, 110, 66, p.dd); g.c(116, 110, 62, p.l); }
      g.c(116, 110, 56, p.d); g.c(116, 110, 50, p.m); g.p('M116 160 A50 50 0 0 0 166 110 A62 62 0 0 1 88 152 A50 50 0 0 0 116 160Z', p.d);
      g.s('M116 110 m-6 0 a6 6 0 1 1 12 4 a18 18 0 1 1 -28 -18 a32 32 0 1 1 46 40', p.l, 7);
      for (const [x, y] of [[84, 70], [100, 62], [116, 58]]) { g.r(x - 4.5, y - 14, 9, 18, 3, p.dd); g.c(x, y - 15, 6, p.l); }
      g.c(26, 94, 10, WHITE); g.c(56, 92, 10, WHITE); eyes(g, 27, 57, 95, 0.55); smile(g, 40, 146, 7); blush(g, 28, 152, 0.7);
      if (f.stripe) g.s('M70 148 Q116 172 162 146', '#ff6b5e', 6);
    } };
  // Bop: a saxophone that curls like a seahorse.
  const SAX = 'M122 48 C150 70 142 112 124 140 C108 166 72 170 62 142';
  SP.bop = { pal: (m) => P(m, { inn: '#8a3f12', tip: INK, key: CREAM }), hat: [122, 24, 0.6], eyes: [116, 116, 46, 0.9], chin: [124, 76, 0.5],
    draw: (g, p, f) => {
      if (f.spikes) { tri(g, [140, 72], [176, 70], [150, 98], p.d); tri(g, [146, 100], [180, 108], [144, 124], p.d); tri(g, [134, 130], [164, 150], [124, 150], p.d); }
      else if (f.softfin) { for (const [x, y, rr] of [[158, 92, 17], [166, 114, 14], [154, 134, 13]]) g.c(x, y, rr, p.l); }
      else { g.p('M146 84 Q172 92 162 116 Q154 104 142 104 Z', p.l); if (f.fins) g.p('M150 120 Q172 132 158 150 Q152 138 140 136 Z', p.l); }
      if (f.bubbles) for (const [x, y, rr] of [[30, 78, 10], [16, 54, 7], [42, 50, 5]]) { g.c(x, y, rr, A.light(p.m, 0.8)); g.c(x - rr * 0.3, y - rr * 0.3, rr * 0.28, WHITE); }
      g.push(0, 5); g.s(SAX, INK, 26); g.pop(); g.s(SAX, p.m, 26); g.push(-5, -3); g.s('M122 48 C150 70 142 112 124 140', p.l, 5); g.pop();
      g.push(56, 122, f.flare ? 1.36 : 1, -28); g.p('M-14 26 L-26 -18 H26 L14 26 Z', p.m); g.p('M0 26 L0 -18 H26 L14 26 Z', p.d); g.e(0, -18, 26, 9, p.l); g.e(0, -17, 18, 5, p.inn); if (f.mute) { g.c(0, -22, 13, '#ff8ab8'); g.c(-4, -26, 4, WHITE); } g.pop();
      g.s('M112 40 L84 22', p.m, 12); g.s('M88 24 L74 16', p.tip, 9);
      g.c(120, 46, 23, p.m); g.p('M120 69 A23 23 0 0 0 143 46 A30 30 0 0 1 106 64 A23 23 0 0 0 120 69Z', p.d);
      for (const [x, y] of [[138, 92], [132, 116], [116, 140], [94, 154]]) { g.c(x, y, 6.5, p.key); g.c(x, y, 2.6, p.dd); }
      eye(g, 116, 44, 0.9); blush(g, 128, 58, 0.7);
    } };
  // Warble: an old gramophone with bird feet.
  SP.warble = { pal: (m) => P(m, { wood: '#b8703a', wd: '#8a4a26', inn: A.dark(m, 0.5), gold: '#ffc928', beak: '#ffb020' }), hat: [118, 112, 0.6], eyes: [84, 120, 146, 0.9], chin: [100, 172, 0.6],
    draw: (g, p, f) => {
      g.s('M156 150 H176 V136', p.wd, 6); g.c(176, 132, 6, p.gold);
      g.s('M80 174 V186 M122 174 V186', p.beak, 5); g.e(78, 187, 9, 4, p.beak); g.e(124, 187, 9, 4, p.beak);
      g.s('M112 124 Q112 96 92 82', p.gold, 12);
      g.push(f.droop ? 58 : 72, f.droop ? 76 : 62, (f.bloom ? 1.22 : 1) * (f.bigHorn ? 1.12 : 1), f.droop ? -74 : -32); const n = 9; let d = ''; for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI, x = Math.cos(a) * 52, y = Math.sin(a) * 30; d += (i ? ` Q${Math.cos(a - Math.PI / n / 2) * 60} ${Math.sin(a - Math.PI / n / 2) * 38} ${x} ${y}` : `M${x} ${y}`); }
      g.p(d + ' L14 36 H-14 Z', p.m); g.p('M0 -30 ' + ' L52 0 L14 36 H0 Z', p.d); g.e(0, 0, 46, 13, p.l); g.e(0, 1, 34, 8, p.inn);
      if (f.bloom) { for (const x of [-30, -15, 0, 15, 30]) g.e(x, -4 - (30 - Math.abs(x)) * 0.3, 9, 13, p.l); g.c(0, 0, 8, '#ffd95a'); g.c(-13, -2, 4, '#ffd95a'); g.c(13, -2, 4, '#ffd95a'); }
      if (f.droop) { g.r(-12, 8, 24, 12, 3, CREAM); g.s('M-6 10 v8 M0 10 v8 M6 10 v8', p.wd, 2); }
      g.pop();
      g.r(52, 122, 104, 54, 12, p.wood); g.p('M116 122 h28 a12 12 0 0 1 12 12 v30 a12 12 0 0 1 -12 12 h-28 Z', p.wd); if (f.droop) { g.e(112, 120, 54, 13, INK, -9); g.e(112, 119, 18, 4.5, p.m, -9); g.s('M70 122 Q96 108 150 108', '#8a84b0', 1.8); } else { g.e(104, 124, 44, 9, INK); g.e(104, 123, 16, 3.4, p.m); }
      eyes(g, 84, 120, 148, 0.9); g.p('M95 156 h14 l-7 9 z', p.beak); blush(g, 68, 160, 0.8); blush(g, 136, 160, 0.8);
    } };
  // Chatter: a little radio that never stops talking.
  SP.chatter = { pal: (m) => P(m, { metal: '#b9c2d6', grille: A.dark(m, 0.45), gold: '#ffc928' }), hat: [100, 62, 0.8], eyes: [112, 142, 98, 0.85], chin: [100, 166, 0.7],
    draw: (g, p, f) => {
      if (f.zig) { g.s('M70 68 L56 50 L70 40 L48 20 M130 68 L146 50 L132 40 L154 18', p.metal, 5); g.c(47, 18, 7.5, '#ff6b5e'); g.c(155, 16, 7.5, '#ff6b5e'); }
      else { g.s('M70 68 L52 22 M130 68 L150 20', p.metal, 5); g.c(51, 19, 7, f.gold ? p.gold : '#ff6b5e'); g.c(151, 17, 7, f.gold ? p.gold : '#ff6b5e'); }
      if (f.phones) g.s('M30 100 Q26 38 100 38 Q174 38 170 100', INK, 8);
      g.e(68, 178, 16, 8, p.dd); g.e(132, 178, 16, 8, p.dd);
      g.r(34, 64, 132, 108, 22, p.m); g.p('M122 64 h22 a22 22 0 0 1 22 22 v64 a22 22 0 0 1 -22 22 h-22 Q146 118 122 64 Z', p.d);
      g.c(74, 120, 32, p.grille); g.c(74, 120, 26, p.dd); for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (Math.abs(x) + Math.abs(y) < 4) g.c(74 + x * 9, 120 + y * 9, 2.6, p.l);
      g.r(102, 122, 54, 14, 5, CREAM); g.s('M108 129 H150', p.dd, 2); g.r(f.tuned ? 138 : 122, 120, 4, 18, 2, '#ff3d5a');
      g.c(112, 152, 8, p.metal); g.c(142, 152, 8, p.metal); g.s('M112 152 l0 -5 M142 152 l4 -3', INK, 2.6);
      eyes(g, 112, 142, 98, 0.85); blush(g, 100, 110, 0.7); blush(g, 154, 110, 0.7);
      if (f.phones) { g.r(14, 90, 26, 48, 11, f.phones); g.r(160, 90, 26, 48, 11, A.dark(f.phones, 0.2)); g.r(20, 98, 8, 32, 4, A.light(f.phones, 0.5)); }
      if (f.waves) g.s('M22 96 Q10 118 22 140 M178 96 Q190 118 178 140', p.gold, 5);
    } };

  Object.assign(BASE, { bong: '#e8743a', tock: '#ffa64a', jangle: '#6fd04a', plink: '#2fbfa8', peep: '#5ac8f0', skirl: '#6a8af0', oompah: '#e8a81e', bop: '#ffd24a', warble: '#ff7ab0', chatter: '#c86ae0' });
  Object.assign(LOOK, {
    clash: { c: '#e04a26', f: { big: 1, pagoda: 1 } }, tamtam: { c: '#c82a3a', f: { big: 1, pagoda: 1, rings: 1, dent: 1 }, pal: { wood: '#3a2a3a', wl: '#5a4458' } }, thunder: { c: '#8a5ac8', f: { big: 1, pagoda: 1, dent: 1 } },
    ripple: { c: '#ffa04a', f: { rings: 1, tier: 1 } }, shimmer: { c: '#ffe07a', f: { rings: 1, tier: 1, mirror: 1 }, pal: { wood: '#c84a3a', wl: '#e86a4a' } }, quake: { c: '#a8643a', f: { rings: 1, big: 1, tier: 1, crack: 1 } },
    marimba: { c: '#ff8a3a', f: { long: 1 } }, vibes: { c: '#ff5a6a', f: { long: 1, gold: 1 }, pal: { bars: ['#5ac8f0', '#7ad8f8', '#a0e4ff', '#c8f0ff', '#e6f8ff'] } }, kalimba: { c: '#c87a3a', f: { long: 1 }, pal: { bars: ['#d8dcea', '#b9c2d6', '#d8dcea', '#b9c2d6', '#d8dcea'], base: '#5a3a2a' } },
    chime: { c: '#ffc04a', f: { mono: 1 } }, celesta: { c: '#fff0a0', f: { mono: 1, gold: 1 } }, glock: { c: '#ff9ac0', f: { mono: 1, long: 1, gold: 1 } },
    bluegrass: { c: '#4fc03a', f: { twin: 1 } }, picker: { c: '#b4dc2e', f: { star: 1, twin: 1 } }, duel: { c: '#2f9a6a', f: { star: 1, twin: 1 }, pal: { wood: '#3a2a3a', wl: '#5a4458' } },
    folk: { c: '#8ae070', f: { petals: '#ffd23a' } }, jamboree: { c: '#c8e04a', f: { star: 1, petals: '#ff7a3a' } }, lonesome: { c: '#4fb8a8', f: { star: 1, petals: '#8aa4f8' } },
    ragtime: { c: '#2fc7a0', f: { upright: 1 } }, boogie: { c: '#ffb84a', f: { upright: 1 } }, stride: { c: '#44b8e8', f: { upright: 1 } },
    sonata: { c: '#2a8c98', f: { lid: 1 } }, concerto: { c: '#3a4a8a', f: { lid: 1 } }, minuet: { c: '#e88ab8', f: { lid: 1 } },
    piper: { c: '#5ad8e8', f: { fan: 1 } }, pied: { c: '#3fc8a0', f: { pipes: 7, fan: '#ffc928' } }, syrinx: { c: '#a8dcff', f: { pipes: 7, fan: '#ff8ab8' }, pal: { pipe: '#ffffff', pd: '#d8e4f8' } },
    fife: { c: '#3f94f0', f: { lance: 1 } }, piccolo: { c: '#3a5ae0', f: { lance: 1 }, pal: { band: '#ffc928' } }, zephyr: { c: '#8ad8f0', f: { lance: 1 }, pal: { pipe: '#c8f0ff', pd: '#8ac8e8' } },
    highland: { c: '#5a7ae8', f: { droop: 1 } }, pibroch: { c: '#3a4ab8', f: { droop: 1 } }, tattoo: { c: '#8a4ad8', f: { droop: 1 }, pal: { wood: '#2b2140' } },
    bellows: { c: '#7aa8f8', f: { spear: 1 } }, clan: { c: '#3f8ae0', f: { spear: 1 }, pal: { tart: '#ffd95a' } }, keening: { c: '#9a8ae8', f: { spear: 1 }, pal: { wood: '#6a5a8a' } },
    sousa: { c: '#f0ac1c', f: { wrap: 1 } }, helicon: { c: '#e87a1c', f: { stripe: 1, wrap: 1 } }, bombard: { c: '#b8862a', f: { stripe: 1, wrap: 1 }, pal: { skin: '#7ac8a8', sd: '#4a9a80' } },
    baritone: { c: '#f5c63a', f: { twin: 1 } }, subsonic: { c: '#8a7a5a', f: { stripe: 1, twin: 1 }, pal: { skin: '#8a9ad8', sd: '#5a6ab0' } }, tubby: { c: '#ffe060', f: { stripe: 1, twin: 1 }, pal: { skin: '#c8f08a', sd: '#9ad060' } },
    bebop: { c: '#ffb82e', f: { flare: 1, spikes: 1 } }, hardbop: { c: '#ff7a2e', f: { flare: 1, spikes: 1 } }, cool: { c: '#5ac8e8', f: { flare: 1, spikes: 1 } },
    smooth: { c: '#ffe070', f: { softfin: 1, mute: 1 } }, soul: { c: '#ffb0a0', f: { softfin: 1, mute: 1, bubbles: 1 } }, lounge: { c: '#c8a0f0', f: { softfin: 1, mute: 1, bubbles: 1 } },
    shellac: { c: '#e85a94', f: { droop: 1 } }, vinyl: { c: '#8a3a8a', f: { bigHorn: 1, droop: 1 }, pal: { wood: '#4a3a5a', wd: '#2b2140' } }, jukebox: { c: '#ff5a5a', f: { bigHorn: 1, droop: 1 }, pal: { wood: '#ffc928', wd: '#d89a12' } },
    diva: { c: '#ff8ec4', f: { bloom: 1 } }, opera: { c: '#ff5a8a', f: { bigHorn: 1, bloom: 1 }, pal: { wood: '#8a2a4a', wd: '#5a1a34' } }, cabaret: { c: '#b85ae0', f: { bigHorn: 1, bloom: 1 } },
    shortwave: { c: '#a85ad8', f: { zig: 1 } }, longwave: { c: '#5a4ab8', f: { zig: 1 } }, pirate: { c: '#4a4a5a', f: { zig: 1 }, pal: { metal: '#ffc928' } },
    deejay: { c: '#dc80f2', f: { tuned: 1, phones: '#ff6b5e' } }, mixtape: { c: '#ff6ab0', f: { tuned: 1, phones: '#ffc928' } }, broadcast: { c: '#8ab0ff', f: { tuned: 1, gold: 1, phones: '#5ad0e8' } },
  });
  // A.buildPets() runs at the end of art-pets3.js, once every species is described.
})(window.H);
