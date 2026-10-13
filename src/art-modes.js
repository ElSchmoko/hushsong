/* Hushsong — art for the Daily Gig and Solo: house-rule badges, boon badges, road stops, mystery scenes, and the Solo map's ground. Same ink and sticker style as the rest. */
(function (H) {
  'use strict';
  const A = H.Art, INK = A.INK, WHITE = '#ffffff', star = A.starPath;
  const I = (key, size, fn) => A.def(key, { size, box: 100, off: 0, sticker: false }, fn);
  const heart = 'M50 88 C18 66 10 44 18 30 C28 14 46 20 50 32 C54 20 72 14 82 30 C90 44 82 66 50 88 Z';
  // an acoustic guitar body (lower and upper bout) in local units, neck pointing up
  const body = (g, fill, ol) => { g.c(0, 16, 21 + ol, INK); g.c(0, -8, 15.5 + ol, INK); g.r(-13 - ol, -6, 26 + 2 * ol, 16, 4, INK); g.c(0, 16, 21, fill); g.c(0, -8, 15.5, fill); g.r(-13, -6, 26, 16, 4, fill); };
  const guitar = (g) => {
    g.r(-6.5, -66, 13, 50, 3, INK); g.r(-4, -64, 8, 50, 2, '#a8703a'); for (const y of [-54, -44, -34, -26]) g.r(-4, y, 8, 1.4, 0, '#e8d0a0');
    g.r(-9, -82, 18, 20, 5, INK); g.r(-6.5, -79.5, 13, 15, 3, '#5a3a26'); for (const y of [-76, -69]) { g.c(-11, y, 3.2, INK); g.c(11, y, 3.2, INK); g.c(-11, y, 1.8, '#ffc928'); g.c(11, y, 1.8, '#ffc928'); }
    body(g, '#ffb020', 3.5); g.c(0, 16, 15, '#ffc94a'); g.c(0, -2, 7.5, INK); g.c(0, -2, 5, '#5a3a26'); g.r(-9, 22, 18, 5, 2, INK); g.r(-7.5, 23, 15, 3, 1.5, '#8a5a3a');
    g.s('M-2 24 V-64 M2 24 V-64', '#fff6dc', 0.9);
  };
  const note = (g, x, y, s, col) => { g.push(x, y, s); g.s('M0 10 V-14 L16 -18 V6', INK, 9); g.s('M0 10 V-14 L16 -18 V6', col, 4); g.oc(-4, 11, 6, col, 4); g.oc(12, 7, 6, col, 4); g.pop(); };

  /* ---------- house rules (Daily Gig) ---------- */
  I('tw_mirror', 14, (g) => { g.s('M50 70 V94', INK, 18); g.s('M50 70 V94', '#c98a4a', 9); g.o('M18 40 A32 34 0 1 0 82 40 A32 34 0 1 0 18 40 Z', '#ffc928'); g.o('M28 40 A22 24 0 1 0 72 40 A22 24 0 1 0 28 40 Z', '#bfe9ff', 5); g.s('M38 30 L48 22 M38 46 L60 26', WHITE, 5); });
  I('tw_potato', 14, (g) => { g.s('M72 30 Q78 14 90 12', INK, 10); g.s('M72 30 Q78 14 90 12', '#8a5a3a', 4); g.o('M18 60 Q10 34 38 28 Q66 20 80 42 Q92 68 64 82 Q32 92 18 60 Z', '#e0a466'); g.c(38, 52, 3.4, '#a8703a'); g.c(58, 66, 3.4, '#a8703a'); g.c(66, 46, 2.8, '#a8703a'); g.c(32, 68, 2.6, '#a8703a'); g.o(star(90, 12, 11, 4.5, 6), '#ffc928', 4); });
  I('tw_key', 14, (g) => { g.push(50, 50, 1, -30); g.o('M-6 -6 H44 V6 H38 V20 H28 V6 H20 V16 H10 V6 H-6 Z', '#ffc928'); g.oc(-24, 0, 22, '#ffc928'); g.oc(-24, 0, 8, '#fff6dc', 5); g.pop(); });
  I('tw_volume', 14, (g) => { for (let i = 0; i < 7; i++) { const a = 2.356 + (i / 6) * 4.712, x = 50 + Math.cos(a) * 42, y = 54 + Math.sin(a) * 42, x2 = 50 + Math.cos(a) * 34, y2 = 54 + Math.sin(a) * 34; g.s(`M${x2} ${y2} L${x} ${y}`, INK, 8); g.s(`M${x2} ${y2} L${x} ${y}`, i > 4 ? '#ff3d5a' : '#ffc928', 4); } g.oc(50, 54, 26, '#4a3d6a'); g.s('M50 54 L64 38', WHITE, 7); });
  I('tw_backwards', 14, (g) => { g.oc(50, 50, 42, '#5aa8e0'); g.o('M50 28 L20 50 L50 72 Z', WHITE, 5); g.o('M80 28 L50 50 L80 72 Z', WHITE, 5); });
  I('tw_shared', 14, (g) => { g.s('M16 70 Q50 92 84 70', INK, 9); g.s('M16 70 Q50 92 84 70', '#ffc928', 4); for (const [x, y, sc] of [[20, 56, 0.4], [80, 56, 0.4], [50, 40, 0.5]]) { g.push(x - 50 * sc, y - 52 * sc, sc); g.o(heart, '#ff5a8a', 14); g.pop(); } });
  I('tw_chain', 14, (g) => { const link = (x, y, r, c) => { g.push(x, y, 1, r); const d = 'M-14 -9 H14 A9 9 0 0 1 14 9 H-14 A9 9 0 0 1 -14 -9 Z'; g.s(d, INK, 14); g.s(d, c, 6); g.pop(); }; link(24, 74, -40, '#c9c3da'); link(46, 52, -40, '#c9c3da'); link(66, 34, -40, '#c9c3da'); g.o(star(84, 16, 14, 6, 7), '#ff9234', 4); });
  I('tw_giant', 14, (g) => { g.push(48, 58, [1.3, 1.1], 10); g.o('M-18 6 Q-22 -20 0 -24 Q22 -26 20 2 Q18 36 0 40 Q-16 40 -18 6 Z', '#8a84b0', 5.5); for (const [x, y, r] of [[-15, -34, 6.5], [-3, -38, 6.5], [9, -36, 6], [19, -29, 5], [25, -19, 4.2]]) g.oc(x, y, r, '#8a84b0', 4.5); g.pop(); });
  I('tw_duet', 14, (g) => { g.s('M32 76 V26 L74 16 V66', INK, 14); g.s('M32 40 L74 30', INK, 14); g.s('M32 76 V26 L74 16 V66', '#ffc928', 6); g.s('M32 40 L74 30', '#ffc928', 6); g.oc(24, 78, 13, '#ff6aa0'); g.oc(66, 68, 13, '#2fd0d0'); });
  I('tw_swap', 14, (g) => { g.s('M20 42 Q50 12 80 40', INK, 15); g.s('M20 42 Q50 12 80 40', '#ffc928', 7); g.o('M90 24 L86 52 L64 40 Z', '#ffc928', 5); g.s('M80 60 Q50 90 20 62', INK, 15); g.s('M80 60 Q50 90 20 62', '#2fd0d0', 7); g.o('M10 78 L14 50 L36 62 Z', '#2fd0d0', 5); });
  I('tw_echo', 14, (g) => { for (const r of [52, 38, 24]) { const a = 0.8, d = `M${22 + r * Math.cos(-a)} ${50 + r * Math.sin(-a)} A${r} ${r} 0 0 1 ${22 + r * Math.cos(a)} ${50 + r * Math.sin(a)}`; g.s(d, INK, 12); g.s(d, r === 52 ? '#d8b0ff' : r === 38 ? '#c88af8' : '#a35ce0', 6); } g.oc(22, 50, 10, '#a35ce0'); });
  I('tw_lastcall', 14, (g) => { g.s('M28 84 L20 94 M72 84 L80 94', INK, 8); g.oc(22, 20, 11, '#ffc928'); g.oc(78, 20, 11, '#ffc928'); g.oc(50, 54, 36, WHITE); for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; g.c(50 + Math.cos(a) * 28, 54 + Math.sin(a) * 28, i % 3 ? 1.6 : 3, INK); } g.s('M50 54 V30 M50 54 L64 62', INK, 7); g.c(50, 54, 4, '#ff3d5a'); });
  I('tw_nobasics', 14, (g) => { g.s('M50 80 Q50 94 70 94', INK, 13); g.s('M50 80 Q50 94 70 94', '#5a5270', 6); g.o('M38 20 H46 V40 H38 Z', '#ffc928', 5); g.o('M54 20 H62 V40 H54 Z', '#ffc928', 5); g.o('M28 38 H72 V62 Q72 82 50 82 Q28 82 28 62 Z', '#e8ecf5'); g.o(star(82, 22, 13, 5, 5), '#ff6b5e', 4); g.o(star(18, 22, 9, 3.6, 5), '#ffc928', 4); });
  A.twistIcon = (id) => (id === 'mic' ? 'ic_mic' : 'tw_' + id);

  /* ---------- the road (Solo map) ---------- */
  I('nd_gig', 12, (g) => { g.o('M50 94 Q12 52 16 28 Q20 8 50 8 Q80 8 84 28 Q88 52 50 94 Z', '#ff6b5e'); g.s('M44 58 V30 L64 25 V50', WHITE, 6); g.c(40, 60, 6.5, WHITE); g.c(60, 52, 6.5, WHITE); });
  I('nd_loud', 12, (g) => { g.o('M16 8 H84 V92 H16 Z', '#4a3d6a'); g.oc(50, 62, 22, '#ff3d5a', 6); g.oc(50, 62, 8, INK, 4); g.oc(50, 26, 9, '#ffc928', 5); });
  I('nd_rest', 12, (g) => { g.o('M14 78 L84 62 L88 74 L18 90 Z', '#8a5a3a'); g.o('M86 78 L16 62 L12 74 L82 90 Z', '#a8703a'); g.o('M50 6 Q74 32 70 52 Q66 72 50 72 Q34 72 30 52 Q28 34 50 6 Z', '#ff9a3a'); g.p('M50 32 Q61 46 59 57 Q57 67 50 67 Q43 67 41 57 Q41 46 50 32 Z', '#ffe06a'); });
  I('nd_jam', 12, (g) => { g.push(56, 60, 0.86, 35); guitar(g); g.pop(); });
  I('nd_mystery', 12, (g) => { g.oc(50, 48, 40, '#c88af8'); g.s('M37 38 Q37 22 52 22 Q67 22 65 37 Q63 48 50 52 V60', INK, 16); g.s('M37 38 Q37 22 52 22 Q67 22 65 37 Q63 48 50 52 V60', WHITE, 8); g.oc(50, 76, 6.5, WHITE, 4); });
  I('nd_start', 12, (g) => { g.s('M28 94 V8', INK, 10); g.s('M28 94 V8', '#c98a4a', 4); g.o('M30 10 H84 L72 28 L84 46 H30 Z', '#2ecb6e'); });
  A.nodeIcon = (type) => (type === 'boss' ? 'ic_boss' : 'nd_' + type);

  /* ---------- mystery stops ---------- */
  I('ev_busker', 20, (g) => { g.o('M30 26 H70 V64 H30 Z', '#4a3d6a'); g.r(30, 52, 40, 9, 0, '#ff6b5e'); g.s('M30 52 H70 M30 61 H70', INK, 3); g.o('M10 64 H90 Q92 76 50 78 Q8 76 10 64 Z', '#4a3d6a'); g.oc(28, 88, 8, '#ffc928', 5); g.oc(46, 90, 7, '#ffc928', 5); g.oc(70, 88, 8, '#ffc928', 5); note(g, 78, 18, 0.7, '#ffc928'); });
  I('ev_shrine', 20, (g) => { g.e(50, 88, 44, 8, '#9fdcc4'); g.o('M10 88 V44 Q10 32 22 32 Q34 32 34 44 V88 Z', '#a9b7d6'); g.o('M38 88 V28 Q38 14 50 14 Q62 14 62 28 V88 Z', '#c9d4ea'); g.o('M66 88 V44 Q66 32 78 32 Q90 32 90 44 V88 Z', '#a9b7d6'); g.p(star(50, 44, 10, 4, 4), '#ffc928'); g.p(star(22, 54, 6, 2.4, 4), '#ffffff'); g.p(star(78, 54, 6, 2.4, 4), '#ffffff'); });
  I('ev_fan', 20, (g) => { g.o('M16 46 H84 V90 H16 Z', '#ff6aa0'); g.o('M10 32 H90 V48 H10 Z', '#ff8ab8'); g.r(43, 32, 14, 58, 0, '#ffc928'); g.s('M43 32 V90 M57 32 V90', INK, 4); g.o('M50 32 Q30 6 20 18 Q14 30 50 32 Z', '#ffc928', 5); g.o('M50 32 Q70 6 80 18 Q86 30 50 32 Z', '#ffc928', 5); g.oc(50, 31, 6, '#ffb000', 5); g.push(62, 52, 0.34); g.o(heart, '#ffffff', 14); g.pop(); g.s('M74 56 L66 48', INK, 3); });
  I('ev_amp', 20, (g) => { g.e(50, 92, 46, 7, '#7fd69c'); g.o('M12 24 H88 V88 H12 Z', '#8a5a3a'); g.r(20, 38, 60, 42, 5, INK); g.oc(50, 59, 15, '#5a5270', 4); g.c(50, 59, 5, '#ffc928'); for (const x of [24, 36, 48]) g.c(x, 31, 3.4, '#ffc928'); g.o(star(84, 14, 11, 4.4, 5), '#ffe06a', 4); g.s('M6 60 L2 70 M94 60 L98 70', '#ffc928', 4); });
  I('ev_crate', 20, (g) => { g.oc(52, 32, 24, INK); g.c(52, 32, 9, '#ff6b5e'); g.c(52, 32, 2.5, INK); g.o('M10 40 H90 V92 H10 Z', '#c98a4a'); g.s('M10 57 H90 M10 74 H90', INK, 4); g.s('M18 40 V92 M82 40 V92', '#a8703a', 5); });
  I('ev_crowd', 20, (g) => { g.s('M14 52 L6 30 M86 52 L94 30', INK, 8); g.oc(24, 66, 17, '#ffd9b3'); g.oc(76, 66, 17, '#ffcfe0'); g.oc(50, 54, 19, '#bdf3d2'); for (const [x, y] of [[24, 64], [50, 52], [76, 64]]) { g.c(x - 5, y - 2, 2.4, INK); g.c(x + 5, y - 2, 2.4, INK); g.s(`M${x - 5} ${y + 6} Q${x} ${y + 11} ${x + 5} ${y + 6}`, INK, 3); } g.e(50, 94, 46, 6, '#4a3d6a'); note(g, 84, 18, 0.6, '#ffc928'); });

  /* ---------- boons ---------- */
  I('bn_amp', 14, (g) => { g.o('M14 20 H86 V88 H14 Z', '#ff6b5e'); g.oc(50, 60, 21, INK, 2); g.oc(50, 60, 15, '#5a5270', 4); g.c(50, 60, 6, '#ffc928'); g.c(26, 31, 4, WHITE); g.c(39, 31, 4, WHITE); });
  I('bn_case', 14, (g) => { g.push(54, 60, 0.9, 35); g.r(-9, -76, 18, 62, 7, INK); g.r(-6, -73, 12, 58, 5, '#7a4e36'); body(g, '#6a4030', 3.5); g.c(0, 16, 14, '#8a5a3a'); g.s('M-14 -2 V28', '#c98a4a', 2); g.r(-12, 2, 6, 7, 1.5, '#ffc928'); g.r(6, 2, 6, 7, 1.5, '#ffc928'); g.s('M20 4 Q30 10 20 18', INK, 5); g.pop(); });
  I('bn_quick', 14, (g) => { g.o('M58 6 L20 54 H46 L38 94 L80 40 H54 Z', '#ffc928'); });
  I('bn_pitch', 14, (g) => { g.oc(50, 50, 42, WHITE); g.oc(50, 50, 29, '#ff6b5e', 5); g.oc(50, 50, 16, WHITE, 5); g.c(50, 50, 6, '#ff6b5e'); g.s('M74 26 L92 8', INK, 8); g.o('M88 4 L96 4 L96 12 Z', '#ffc928', 3); });
  I('bn_shell', 14, (g) => { g.o('M16 12 H84 V46 Q84 78 50 92 Q16 78 16 46 Z', '#4a8ae0'); g.s('M48.5 47.0 L48.0 46.6 L47.5 46.0 L47.3 45.2 L47.3 44.4 L47.5 43.4 L48.0 42.5 L48.8 41.6 L49.8 40.9 L51.1 40.4 L52.5 40.2 L54.1 40.3 L55.7 40.8 L57.2 41.6 L58.6 42.8 L59.8 44.4 L60.7 46.3 L61.2 48.4 L61.3 50.7 L60.9 53.1 L59.9 55.5 L58.5 57.6 L56.6 59.6 L54.2 61.2 L51.5 62.3 L48.5 62.9 L45.3 62.8 L42.1 62.1 L39.0 60.8 L36.1 58.8 L33.6 56.2 L31.6 53.1 L30.2 49.6 L29.5 45.7 L29.6 41.6 L30.5 37.6 L32.2 33.7 L34.6 30.1 L37.9 27.0 L41.7 24.5 L46.1 22.7 L50.8 21.9 L55.7 21.9 L60.7 22.9 L65.4 24.9 L69.7 27.9 L73.5 31.7 L76.5 36.3 L78.7 41.4 L79.8 47.0', INK, 9); g.s('M48.5 47.0 L48.0 46.6 L47.5 46.0 L47.3 45.2 L47.3 44.4 L47.5 43.4 L48.0 42.5 L48.8 41.6 L49.8 40.9 L51.1 40.4 L52.5 40.2 L54.1 40.3 L55.7 40.8 L57.2 41.6 L58.6 42.8 L59.8 44.4 L60.7 46.3 L61.2 48.4 L61.3 50.7 L60.9 53.1 L59.9 55.5 L58.5 57.6 L56.6 59.6 L54.2 61.2 L51.5 62.3 L48.5 62.9 L45.3 62.8 L42.1 62.1 L39.0 60.8 L36.1 58.8 L33.6 56.2 L31.6 53.1 L30.2 49.6 L29.5 45.7 L29.6 41.6 L30.5 37.6 L32.2 33.7 L34.6 30.1 L37.9 27.0 L41.7 24.5 L46.1 22.7 L50.8 21.9 L55.7 21.9 L60.7 22.9 L65.4 24.9 L69.7 27.9 L73.5 31.7 L76.5 36.3 L78.7 41.4 L79.8 47.0', WHITE, 4.5); });
  I('bn_soul', 14, (g) => { g.o(heart, '#ff5a8a'); g.s('M44 66 V38 L60 34 V58', WHITE, 6); g.c(40, 67, 6, WHITE); g.c(56, 59, 6, WHITE); });
  I('bn_sour', 14, (g) => { g.o('M10 48 Q16 18 48 16 Q80 18 86 48 Q80 80 48 82 Q16 80 10 48 Z', '#f6e04a'); g.s('M30 34 Q40 28 50 30', '#fff9c0', 5); g.o('M74 52 Q90 72 84 82 A12 12 0 0 1 64 82 Q58 72 74 52 Z', '#a35ce0', 5); });
  I('bn_wrong', 14, (g) => { g.s('M34 10 V86', INK, 15); g.s('M34 84 Q76 76 76 56 Q76 40 34 50', INK, 15); g.s('M34 10 V86', '#d0603a', 7); g.s('M34 84 Q76 76 76 56 Q76 40 34 50', '#d0603a', 7); g.o(star(80, 18, 11, 4.4, 5), '#ffc928', 4); });
  I('bn_opener', 14, (g) => { g.o('M8 8 H48 Q40 52 22 92 H8 Z', '#e0445a'); g.o('M92 8 H52 Q60 52 78 92 H92 Z', '#e0445a'); g.o('M4 4 H96 V18 Q50 30 4 18 Z', '#c8304a'); g.o(star(50, 62, 17, 7, 5), '#ffc928', 5); });
  I('bn_spiky', 14, (g) => { g.o(star(50, 50, 44, 28, 10), '#9a94b8'); g.oc(50, 50, 18, '#c9c3da', 5); });
  I('bn_hype', 14, (g) => { g.o('M12 40 H32 L78 14 V86 L32 60 H12 Z', '#ffc928'); g.s('M86 34 L96 26 M88 50 H98 M86 66 L96 74', INK, 7); g.o('M20 60 H32 L36 84 H26 Z', '#ffc928', 5); });
  I('bn_hush', 14, (g) => { g.o('M10 36 H28 L54 14 V86 L28 64 H10 Z', '#8fd4ff'); g.s('M66 36 L90 64 M90 36 L66 64', INK, 14); g.s('M66 36 L90 64 M90 36 L66 64', '#ff6b5e', 6); });
  I('bn_cresc', 14, (g) => { g.s('M10 50 L90 18 M10 50 L90 82', INK, 15); g.s('M10 50 L90 18 M10 50 L90 82', '#2ecb6e', 7); });
  I('bn_overflow', 14, (g) => { g.o('M12 52 Q20 62 12 70 Q4 62 12 52 Z', '#4a8ae0', 4); g.o('M88 46 Q96 56 88 64 Q80 56 88 46 Z', '#4a8ae0', 4); g.o('M22 30 H78 L70 90 H30 Z', '#bfe9ff'); g.o('M16 32 Q28 14 40 28 Q50 12 60 28 Q72 14 84 32 Z', '#4a8ae0', 5); g.s('M36 46 V76', WHITE, 5); });
  I('bn_lifeloop', 14, (g) => { const d = 'M80 50 A30 30 0 1 1 64 24'; g.s(d, INK, 15); g.s(d, '#ff5a8a', 7); g.o('M58 8 L80 24 L56 36 Z', '#ff5a8a', 5); g.push(50, 54, 0.42); g.o('M50 88 C18 66 10 44 18 30 C28 14 46 20 50 32 C54 20 72 14 82 30 C90 44 82 66 50 88 Z', '#ff5a8a', 14); g.pop(); });
  I('bn_click', 14, (g) => { g.o('M34 8 H66 L86 92 H14 Z', '#8a5a3a'); g.p('M40 18 H60 L74 78 H26 Z', '#fff1d0'); g.s('M50 78 L66 24', INK, 6); g.oc(61, 40, 7, '#ffc928', 4); });
  I('bn_double', 14, (g) => { g.oc(50, 50, 42, '#2fd0d0'); g.s('M28 28 L50 50 L28 72 M52 28 L74 50 L52 72', INK, 15); g.s('M28 28 L50 50 L28 72 M52 28 L74 50 L52 72', WHITE, 8); });
  I('bn_maestro', 14, (g) => { g.s('M14 86 L72 22', INK, 12); g.s('M14 86 L72 22', '#fff1d0', 5); g.oc(20, 80, 9, '#8a5a3a', 5); g.o('M76 40 Q94 64 86 76 A14 14 0 0 1 64 76 Q58 64 76 40 Z', '#a35ce0', 5); g.p(star(70, 14, 9, 3.6, 4), '#ffc928'); });
  I('bn_critfb', 14, (g) => { g.o(star(50, 50, 44, 24, 8), '#ffc928'); const d = 'M50 28 A22 22 0 1 1 28 50'; g.s(d, INK, 12); g.s(d, WHITE, 6); g.o('M20 42 L28 58 L38 44 Z', WHITE, 4); g.c(50, 50, 5, INK); });
  I('bn_glass', 14, (g) => { g.push(50, 50, 1, -28); g.o('M-36 -14 H34 Q44 -14 44 0 Q44 14 34 14 H-36 Z', '#5a5270'); g.r(30, -18, 10, 36, 3, '#4a3d6a'); g.s('M-14 -14 L-6 -2 L-16 6 L-8 14', WHITE, 4); g.pop(); g.oc(34, 70, 16, '#8a5a3a'); g.c(34, 70, 5, INK); });
  I('bn_second', 14, (g) => { g.o('M16 90 Q24 40 84 10 Q76 62 16 90 Z', WHITE); g.s('M16 90 Q44 56 80 16', INK, 4); g.s('M40 60 L30 50 M52 48 L42 36 M62 36 L56 24', '#c9c3da', 3); });
  I('bn_finish', 14, (g) => { const cols = ['#ff6b5e', '#ffc928', '#2fd0d0', '#6fd46a', '#c88af8']; for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.283, x1 = 50 + Math.cos(a) * 18, y1 = 50 + Math.sin(a) * 18, x2 = 50 + Math.cos(a) * 42, y2 = 50 + Math.sin(a) * 42; g.s(`M${x1} ${y1} L${x2} ${y2}`, INK, 9); g.s(`M${x1} ${y1} L${x2} ${y2}`, cols[i % 5], 4); } g.o(star(50, 50, 16, 7, 5), '#ffc928', 5); });
  I('bn_pedal', 14, (g) => { g.o('M14 28 H86 V90 H14 Z', '#2fd0d0'); g.oc(30, 42, 6, WHITE, 4); g.oc(50, 42, 6, WHITE, 4); g.oc(70, 42, 6, WHITE, 4); g.oc(50, 72, 10, '#c9c3da', 5); g.s('M30 14 Q50 2 70 14', INK, 9); g.s('M30 14 Q50 2 70 14', '#c88af8', 4); });
  I('bn_mosh', 14, (g) => { g.o('M50 8 Q80 46 74 66 A26 26 0 0 1 26 66 Q20 46 50 8 Z', '#4a8ae0'); g.o('M14 30 Q22 42 14 48 Q6 42 14 30 Z', '#8fd4ff', 4); g.o('M86 30 Q94 42 86 48 Q78 42 86 30 Z', '#8fd4ff', 4); g.s('M38 56 Q40 70 52 72', WHITE, 5); });
  I('bn_dive', 14, (g) => { g.o('M40 4 H60 V30 H74 L50 56 L26 30 H40 Z', '#ff6b5e'); for (const [x, c] of [[20, '#ffd9b3'], [50, '#ffcfe0'], [80, '#bdf3d2']]) { g.s(`M${x - 9} 82 L${x - 13} 66 M${x + 9} 82 L${x + 13} 66`, INK, 6); g.oc(x, 86, 10, c, 5); g.c(x - 3, 85, 1.6, INK); g.c(x + 3, 85, 1.6, INK); } });
  A.boonIcon = (id) => 'bn_' + id;

  /* ---------- the Solo map: the region seen from above. Ground first, then a few things that belong there. ---------- */
  const mc = new Map();
  // keep: places to leave clear (the stops), as [x, y] in layout units
  A.mapGround = (region, w, h, seed, keep) => {
    const k = A.k, ck = [region, w, h, seed, k].join(); if (mc.has(ck)) return mc.get(ck);
    const clear = (X, Y) => !(keep || []).some(([kx, ky]) => Math.abs(kx - X) < 17 && Math.abs(ky - Y) < 17);
    const c = A.make(w * k, h * k), x = c.getContext('2d'); x.scale(k, k); const g = new A.G(x), P = A.SCN[region] || A.SCN.camp, rnd = H.rng(seed);
    const R = (a, b) => a + rnd() * (b - a);
    const ground = { caves: '#cdbfdf', ridge: '#eef5ff', dunes: '#f6dca0', hall: '#e9c48e', tower: '#e9dcc0', works: '#efcf9e', road: '#dfe3ec' }[region] || P.g1;
    g.r(0, 0, w, h, 0, ground);
    g.al(0.55); for (let i = 0; i < w * h / 700; i++) g.e(R(0, w), R(0, h), R(10, 26), R(3, 7), i % 2 ? P.g2 : A.light(ground, 0.3), R(-15, 15)); g.al(1);
    // small props, each with an ink edge and a soft shadow, so they sit on the ground like the stickers do
    const sh = (X, Y, rx) => g.e(X + 1.5, Y + 2, rx, rx * 0.45, 'rgba(43,33,64,0.16)');
    const tree = (X, Y, s, col) => { col = col || '#5fc46a'; sh(X, Y + 4 * s, 9 * s); g.c(X, Y, 9 * s, INK); g.c(X, Y, 7.8 * s, col); g.c(X - 3 * s, Y - 3 * s, 3.4 * s, A.light(col, 0.35)); };
    const fruit = (X, Y, s) => { tree(X, Y, s, '#4fb85a'); for (const [dx, dy] of [[-3, 2], [3, -1], [1, 4]]) { g.c(X + dx * s, Y + dy * s, 1.8 * s, INK); g.c(X + dx * s, Y + dy * s, 1.3 * s, '#ff5a5a'); } };
    const pine = (X, Y, s) => { sh(X, Y + 5 * s, 8 * s); g.c(X, Y, 8.4 * s, INK); g.p(star(X, Y, 7.8 * s, 4.2 * s, 7), '#4fa88a'); g.p(star(X, Y, 4.6 * s, 2.4 * s, 7), '#6fc8a8'); g.c(X, Y, 1.4 * s, '#ffffff'); };
    const rock = (X, Y, s, c) => { sh(X, Y + 2 * s, 6 * s); g.e(X, Y, 6.4 * s, 4.8 * s, INK); g.e(X, Y - 0.5, 5.3 * s, 3.8 * s, c || '#b9b4cc'); g.e(X - 1.6 * s, Y - 1.6 * s, 2.2 * s, 1.3 * s, A.light(c || '#b9b4cc', 0.5)); };
    const pond = (X, Y, rx, ry, col) => { g.e(X, Y, rx + 1.4, ry + 1.4, INK); g.e(X, Y, rx, ry, col); g.e(X - rx * 0.3, Y - ry * 0.3, rx * 0.35, ry * 0.2, A.light(col, 0.4)); g.e(X + rx * 0.4, Y + ry * 0.2, 3, 2, '#6fcf5a'); };
    const reeds = (X, Y, s) => { for (let j = 0; j < 4; j++) { const xx = X + (j - 1.5) * 2.6 * s; g.s(`M${xx} ${Y} v${-9 * s}`, INK, 2.2); g.s(`M${xx} ${Y} v${-9 * s}`, '#4f8a3c', 1.1); g.e(xx, Y - 10 * s, 1.4 * s, 2.8 * s, '#8a5a36'); } };
    const flowers = (X, Y, s) => { const cols = ['#ff6b5e', '#ffc928', '#ff9ad8', '#ffffff']; for (let j = 0; j < 4; j++) { const xx = X + (j % 2) * 5 * s - 2.5 * s, yy = Y + Math.floor(j / 2) * 4 * s; for (let a = 0; a < 5; a++) g.c(xx + Math.cos(a * 1.257) * 1.6 * s, yy + Math.sin(a * 1.257) * 1.6 * s, 1.3 * s, cols[(j + Math.floor(X)) % 4]); g.c(xx, yy, 0.9 * s, '#fff6c8'); } };
    const cactus = (X, Y, s) => { sh(X, Y + 1, 5 * s); const d = `M${X} ${Y} V${Y - 12 * s} M${X} ${Y - 5 * s} H${X - 4 * s} V${Y - 9 * s} M${X} ${Y - 7 * s} H${X + 4 * s} V${Y - 11 * s}`; g.s(d, INK, 5 * s); g.s(d, '#5fb878', 2.8 * s); };
    const crystals = (X, Y, s) => { sh(X, Y + 1, 6 * s); for (let j = 0; j < 3; j++) { const xx = X + (j - 1) * 3.4 * s, hh = (7 + j * 2) * s, d = `M${xx - 2.2 * s} ${Y} L${xx} ${Y - hh} L${xx + 2.2 * s} ${Y} Z`; g.p(d, INK); g.s(d, INK, 1.4); g.p(d, j % 2 ? '#8ff0f0' : '#d6b0ff'); } };
    const crate = (X, Y, s) => { sh(X, Y + 4 * s, 6 * s); g.r(X - 5 * s, Y - 5 * s, 10 * s, 10 * s, 1, INK); g.r(X - 4 * s, Y - 4 * s, 8 * s, 8 * s, 0.6, '#c98a4a'); g.s(`M${X - 4 * s} ${Y - 4 * s} L${X + 4 * s} ${Y + 4 * s}`, '#8a5a3a', 1.2); };
    const barrel = (X, Y, s) => { sh(X, Y + 3 * s, 5 * s); g.c(X, Y, 5 * s, INK); g.c(X, Y, 4 * s, '#a8703a'); g.c(X, Y, 2.4 * s, '#8a5a3a'); };
    const gear = (X, Y, s, c) => { sh(X, Y + 3 * s, 7 * s); g.c(X, Y, 7.4 * s, INK); g.p(star(X, Y, 6.6 * s, 4.8 * s, 8), c || '#cbb8dc'); g.c(X, Y, 2 * s, INK); };
    const house = (X, Y, s) => { sh(X, Y + 5 * s, 9 * s); g.r(X - 8 * s, Y - 6 * s, 16 * s, 12 * s, 1.5, INK); g.r(X - 7 * s, Y - 5 * s, 14 * s, 10 * s, 1, ['#ff8a6a', '#8fd4ff', '#ffd95a'][Math.floor(rnd() * 3)]); g.r(X - 0.6 * s, Y - 5 * s, 1.2 * s, 10 * s, 0, 'rgba(43,33,64,0.35)'); };
    const chairs = (X, Y, s) => { for (let j = 0; j < 3; j++) { g.r(X - 8 * s + j * 6 * s, Y - 2 * s, 4.6 * s, 4.6 * s, 1, INK); g.r(X - 7.4 * s + j * 6 * s, Y - 1.4 * s, 3.4 * s, 3.4 * s, 0.6, '#c8304a'); } };
    const notes = (X, Y) => { g.al(0.5); g.push(X, Y, 0.45); g.s('M0 6 V-6 L7 -8 V4', INK, 3); g.c(-2.5, 6.5, 2.8, INK); g.c(4.5, 4.5, 2.8, INK); g.pop(); g.al(1); };
    const n = Math.round((w * h) / 1100);
    for (let i = 0; i < n; i++) {
      const X = R(6, w - 6), Y = R(8, h - 6); if (!clear(X, Y)) continue; const s = R(0.9, 1.3), pick = rnd();
      if (pick < 0.08) { notes(X, Y); continue; }
      if (region === 'fen') { if (pick < 0.22) pond(X, Y, R(10, 16), R(5, 8), '#8fd8e8'); else if (pick < 0.6) reeds(X, Y, s); else if (pick < 0.8) flowers(X, Y, s * 0.8); else tree(X, Y, s * 0.9, '#6fc890'); }
      else if (region === 'orchard') { if (pick < 0.65) fruit(X, Y, s); else flowers(X, Y, s * 0.8); }
      else if (region === 'ridge') { if (pick < 0.6) pine(X, Y, s); else rock(X, Y, s, '#c9d4ea'); }
      else if (region === 'dunes') { if (pick < 0.4) cactus(X, Y, s); else if (pick < 0.6) rock(X, Y, s * 0.8, '#d8b080'); else g.s(`M${X - 10} ${Y} q5 -3 10 0 t10 0`, '#e0b060', 1.6); }
      else if (region === 'caves') { if (pick < 0.55) crystals(X, Y, s); else rock(X, Y, s, '#a894c8'); }
      else if (region === 'harbor') { if (X > w * 0.8) continue; if (pick < 0.4) crate(X, Y, s); else if (pick < 0.7) barrel(X, Y, s); else rock(X, Y, s * 0.8); }
      else if (region === 'works') { if (pick < 0.35) crate(X, Y, s); else if (pick < 0.65) gear(X, Y, s, '#e09a6a'); else { g.al(0.7); g.c(X, Y, 1.4, '#ffb050'); g.al(1); } }
      else if (region === 'road') { if (pick < 0.45) house(X, Y, s); else if (pick < 0.75) tree(X, Y, s * 0.85); else rock(X, Y, s * 0.8); }
      else if (region === 'tower') { if (pick < 0.55) gear(X, Y, s); else g.r(X - 4, Y - 4, 8, 8, 0, A.light(ground, 0.25)); }
      else if (region === 'hall') { if (X > w * 0.36 && X < w * 0.64) continue; if (pick < 0.55) chairs(X, Y, s); else g.p(star(X, Y, 2.4, 1, 4), '#ffd27a'); }
      else tree(X, Y, s);
    }
    if (region === 'harbor') { g.r(w * 0.84, 0, w * 0.16, h, 0, INK); g.r(w * 0.84 + 1.4, 0, w * 0.16, h, 0, '#7fc4e4'); for (let y = 6; y < h; y += 14) g.s(`M${w * 0.88} ${y} q3 -2 6 0 t6 0`, '#ffffff', 1.2); }
    if (region === 'hall') { g.r(w * 0.42, 0, w * 0.16, h, 0, '#c8304a'); g.r(w * 0.42, 0, 1.2, h, 0, '#ffd27a'); g.r(w * 0.58 - 1.2, 0, 1.2, h, 0, '#ffd27a'); }
    // a soft vignette, so the edges read as the edge of a map
    const gr = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75); gr.addColorStop(0, 'rgba(43,33,64,0)'); gr.addColorStop(1, 'rgba(43,33,64,0.22)'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    mc.set(ck, c); return c;
  };
})(window.H);
