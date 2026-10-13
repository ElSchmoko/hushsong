/* Hushsong — icons, the shell, equipment, move tokens, lettering on the battlefield and the backdrops. */
(function (H) {
  'use strict';
  const A = H.Art, INK = A.INK, WHITE = '#ffffff', FC = A.FAMCOL;
  const I = (key, size, fn) => A.def(key, { size, box: 100, off: 0, sticker: false }, fn);
  const star = (cx, cy, R, r, n) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * 6.2832 - 1.5708, q = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * q).toFixed(1) + ' ' + (cy + Math.sin(a) * q).toFixed(1); } return d + 'Z'; };
  A.starPath = star;

  /* families */
  I('fam_drum', 10, (g) => { g.o('M14 34 V68 A36 14 0 0 0 86 68 V34 Z', FC.drum); g.o('M14 34 A36 14 0 0 1 86 34 A36 14 0 0 1 14 34 Z', '#fff1d0'); g.s('M30 52 L42 78 L54 56 L66 78 L76 52', WHITE, 5); });
  I('fam_string', 10, (g) => { g.o('M22 10 Q4 70 50 92 Q96 70 78 10 L62 18 Q72 58 50 70 Q28 58 38 18 Z', FC.string); g.s('M40 30 V62 M50 26 V68 M60 30 V62', INK, 4); g.o('M20 18 H80 V30 H20 Z', '#ffc928', 6); });
  I('fam_breath', 10, (g) => { g.o('M12 14 H32 V88 H12 Z', FC.breath); g.o('M40 14 H60 V72 H40 Z', A.light(FC.breath, 0.3)); g.o('M68 14 H88 V56 H68 Z', FC.breath); g.o('M8 30 H92 V44 H8 Z', '#fff1d0', 6); });
  I('fam_brass', 10, (g) => { g.o('M8 40 H42 L88 12 V88 L42 60 H8 Z', FC.brass); g.s('M80 26 V74', '#fff0a0', 6); });
  I('fam_voice', 10, (g) => { g.oc(50, 50, 40, FC.voice); g.p('M26 44 Q50 34 74 44 Q70 78 50 78 Q30 78 26 44 Z', INK); g.e(50, 68, 13, 8, '#ff9aa8'); g.r(38, 42, 24, 9, 3, WHITE); });
  I('fam_none', 10, (g) => { g.oc(50, 50, 38, FC.none); g.s('M26 74 L74 26', WHITE, 10); });
  /* roles */
  I('role_rhythm', 9, (g) => { g.o('M14 12 H86 V50 Q86 80 50 94 Q14 80 14 50 Z', '#5a8ae8'); g.s('M50 26 V74', WHITE, 8); });
  I('role_lead', 9, (g) => { g.o('M70 6 L94 6 L94 30 L44 80 L20 56 Z', '#e8ecf5'); g.o('M10 60 L40 90 L28 96 L4 72 Z', '#ffb020'); g.s('M12 88 L28 72', INK, 7); });
  I('role_harmony', 9, (g) => { g.o('M50 90 Q4 56 12 30 Q22 6 50 28 Q78 6 88 30 Q96 56 50 90 Z', '#ff5a8a'); g.c(32, 36, 7, WHITE); });
  I('role_bass', 9, (g) => { g.oc(50, 50, 40, '#a35ce0'); g.s('M50 50 m-4 0 a8 8 0 1 1 8 8 a18 18 0 1 1 -18 -18 a24 24 0 0 1 24 -8', WHITE, 7); });
  I('role_stray', 9, (g) => { g.o('M50 92 Q14 92 18 56 Q24 10 50 8 Q76 10 82 56 Q86 92 50 92 Z', '#fff1d0'); g.s('M26 52 L38 42 L50 52 L62 42 L74 52', '#ffb020', 6); });
  /* effects: a coloured token with a white sign */
  const TOK = (key, col, fn) => I('st_' + key, 8, (g) => { g.oc(50, 50, 42, col, 9); fn(g); });
  TOK('pup', '#ff4d4d', (g) => g.p('M50 16 L80 50 H62 V82 H38 V50 H20 Z', WHITE));
  TOK('pdown', '#6a7ab8', (g) => g.p('M50 84 L80 50 H62 V18 H38 V50 H20 Z', WHITE));
  TOK('sup', '#ffb020', (g) => g.s('M26 30 L46 50 L26 70 M52 30 L72 50 L52 70', WHITE, 11));
  TOK('sdown', '#7a84a0', (g) => g.s('M74 30 L54 50 L74 70 M48 30 L28 50 L48 70', WHITE, 11));
  TOK('stun', '#ffc928', (g) => g.p(star(50, 52, 32, 14, 5), WHITE));
  TOK('poison', '#a35ce0', (g) => { g.p('M50 14 Q78 50 72 64 A24 24 0 0 1 28 64 Q22 50 50 14 Z', WHITE); });
  TOK('regen', '#2ecb6e', (g) => g.p('M40 20 H60 V40 H80 V60 H60 V80 H40 V60 H20 V40 H40 Z', WHITE));
  TOK('taunt', '#ff6a3a', (g) => { g.s('M50 26 a24 24 0 1 0 0.1 0', WHITE, 9); g.c(50, 50, 8, WHITE); });
  TOK('dodge', '#2fd0d0', (g) => g.s('M22 36 H62 M36 52 H78 M22 68 H56', WHITE, 9));
  TOK('shield', '#4a8ae0', (g) => g.p('M24 22 H76 V52 Q76 72 50 84 Q24 72 24 52 Z', WHITE));
  TOK('lifesong', '#ff5a8a', (g) => g.p('M50 80 C22 62 18 38 32 30 C42 24 50 32 50 40 C50 32 58 24 68 30 C82 38 78 62 50 80 Z', WHITE));
  TOK('offkey', '#d0603a', (g) => { g.s('M38 18 V78', WHITE, 9); g.s('M38 76 Q64 70 64 56 Q64 44 38 50', WHITE, 9); });
  /* small signs */
  I('ic_note', 10, (g) => { g.s('M36 72 V20 L78 12 V60', INK, 16); g.s('M36 72 V20 L78 12 V60', '#ffb020', 8); g.oc(26, 74, 14, '#ffb020'); g.oc(68, 62, 14, '#ffb020'); });
  // experience: an arrow up, so it never looks like a pet's stars
  I('ic_xp', 10, (g) => { g.o('M14 14 H86 V86 H14 Z', '#4a8ae0', 6); g.p('M50 22 L76 52 H60 V78 H40 V52 H24 Z', WHITE); });
  I('ic_star', 8, (g) => g.o(star(50, 54, 44, 20, 5), '#ffc928', 8));
  I('ic_staroff', 8, (g) => g.o(star(50, 54, 44, 20, 5), '#e6e0f0', 8));
  // an echo: a sound that rings on, fading as it goes
  I('ic_echo', 8.5, (g) => { g.push(11.6, 10, 0.8); const arc = (r) => `M${(20 + r * Math.cos(0.85)).toFixed(1)} ${(50 - r * Math.sin(0.85)).toFixed(1)} A${r} ${r} 0 0 1 ${(20 + r * Math.cos(0.85)).toFixed(1)} ${(50 + r * Math.sin(0.85)).toFixed(1)}`; [[28, '#18b4c8'], [46, '#5fd8e2'], [64, '#b4f0f2']].forEach(([r, c]) => { g.s(arc(r), INK, 20); g.s(arc(r), c, 11); }); g.oc(20, 50, 15, '#18b4c8', 6); g.pop(); });   // drawn at 80% so the outer wave stays inside the box
  I('ic_lock', 9, (g) => { g.s('M32 46 V32 a18 18 0 0 1 36 0 V46', INK, 16); g.s('M32 46 V32 a18 18 0 0 1 36 0 V46', '#c9c3da', 7); g.o('M18 44 H82 V90 H18 Z', '#9a94b8'); g.c(50, 66, 8, INK); });
  I('ic_gear', 10, (g) => { g.push(50, 50); for (let i = 0; i < 8; i++) { g.push(0, 0, 1, i * 45); g.r(-11, -46, 22, 26, 5, INK); g.pop(); } g.c(0, 0, 34, INK); for (let i = 0; i < 8; i++) { g.push(0, 0, 1, i * 45); g.r(-6, -41, 12, 16, 3, '#9aa3b5'); g.pop(); } g.c(0, 0, 28, '#9aa3b5'); g.c(0, 0, 12, INK); g.pop(); });
  I('ic_check', 9, (g) => { g.s('M18 54 L40 76 L82 26', INK, 24); g.s('M18 54 L40 76 L82 26', '#2ecb6e', 13); });
  I('ic_bigcheck', 11, (g) => g.s('M18 54 L40 76 L82 26', INK, 17));
  I('ic_boss', 10, (g) => { g.o('M14 30 L8 6 L32 22 Q50 14 68 22 L92 6 L86 30 Q96 52 84 70 L74 92 H26 L16 70 Q4 52 14 30 Z', '#ff3d5a'); g.c(34, 50, 9, WHITE); g.c(66, 50, 9, WHITE); g.s('M40 76 H60', INK, 6); });
  I('ic_up', 8, (g) => g.o('M50 12 L92 82 H8 Z', '#2ecb6e', 9));
  I('ic_down', 8, (g) => g.o('M50 88 L92 18 H8 Z', '#9a94b8', 9));
  I('ic_info', 8, (g) => { g.oc(50, 50, 42, WHITE, 9); g.c(50, 28, 8, INK); g.r(42, 42, 16, 38, 5, INK); });
  I('ic_bang', 8, (g) => { g.oc(50, 50, 42, '#ff3d5a', 9); g.r(42, 18, 16, 40, 6, WHITE); g.c(50, 74, 9, WHITE); });
  I('ic_plus', 10, (g) => { g.s('M50 16 V84 M16 50 H84', INK, 26); g.s('M50 16 V84 M16 50 H84', '#2ecb6e', 13); });
  I('ic_home', 14, (g) => { g.o('M8 50 L50 12 L92 50 V56 H82 V90 H18 V56 H8 Z', '#ff6b5e', 6); g.o('M40 60 H60 V90 H40 Z', '#fff1d0', 6); });
  I('ic_team', 14, (g) => { g.oc(28, 60, 18, FC.string, 6); g.oc(72, 60, 18, FC.breath, 6); g.oc(50, 44, 24, FC.drum, 6); g.c(42, 42, 4.5, INK); g.c(58, 42, 4.5, INK); g.s('M43 52 Q50 58 57 52', INK, 4); });
  I('ic_bag', 14, (g) => { g.s('M34 30 V22 a16 16 0 0 1 32 0 V30', INK, 15); g.s('M34 30 V22 a16 16 0 0 1 32 0 V30', '#c98a4a', 6); g.o('M16 34 Q16 26 26 26 H74 Q84 26 84 34 V80 Q84 92 72 92 H28 Q16 92 16 80 Z', '#ffb46a', 6); g.o('M30 56 H70 V76 H30 Z', '#ff8a3a', 6); g.s('M16 44 H84', INK, 5); });
  I('ic_sword', 14, (g) => { g.push(50, 50, 1, 45); g.o('M-7 -44 L0 -52 L7 -44 V14 H-7 Z', '#e8ecf5', 6); g.o('M-22 14 H22 V24 H-22 Z', '#ffc928', 6); g.o('M-6 24 H6 V44 H-6 Z', '#8a4420', 6); g.pop(); g.push(50, 50, 1, -45); g.o('M-7 -44 L0 -52 L7 -44 V14 H-7 Z', '#e8ecf5', 6); g.o('M-22 14 H22 V24 H-22 Z', '#ffc928', 6); g.o('M-6 24 H6 V44 H-6 Z', '#8a4420', 6); g.pop(); });
  // a gold record in its frame, and the empty frame it waits for
  I('ic_record', 14, (g) => { g.o('M8 8 H92 V92 H8 Z', '#6b4a8c', 6); g.o('M16 16 H84 V84 H16 Z', '#2b2140', 0); g.oc(50, 50, 30, '#ffc928', 5); g.s('M50 50 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0', '#d99a12', 3); g.oc(50, 50, 10, '#ff6b5e', 4); g.c(50, 50, 3, INK); g.s('M30 36 Q36 26 48 24', WHITE, 4); });
  I('ic_recordoff', 14, (g) => { g.o('M8 8 H92 V92 H8 Z', '#d9d2ea', 6); g.o('M16 16 H84 V84 H16 Z', '#f4f1fa', 0); g.oc(50, 50, 30, '#e6e0f0', 5); g.s('M50 50 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0', '#c9c3da', 3); g.oc(50, 50, 10, '#d9d2ea', 4); g.c(50, 50, 3, INK); });
  // the three side modes: a gig ticket (Daily Gig), a lone spotlight (Solo) and a microphone (Encore)
  I('ic_ticket', 14, (g) => { g.push(50, 50, 1, -12); g.o('M-42 -24 H42 V-8 A9 9 0 0 0 42 8 V24 H-42 V8 A9 9 0 0 0 -42 -8 Z', '#ff9a8a', 6); for (let y = -18; y <= 18; y += 9) g.c(18, y, 2.6, INK); g.p(star(-12, 0, 15, 6, 5), '#ffd95a'); g.s(star(-12, 0, 15, 6, 5), INK, 4); g.pop(); });
  I('ic_solo', 14, (g) => { g.p('M42 6 H58 L88 88 H12 Z', '#fff3a8'); g.s('M42 6 L12 88 M58 6 L88 88', INK, 4); g.o('M30 80 Q50 70 70 80 Q50 92 30 80 Z', '#ffd95a', 5); g.p(star(50, 52, 16, 6.5, 5), '#ffc928'); g.s(star(50, 52, 16, 6.5, 5), INK, 4); });
  I('ic_mic', 14, (g) => { g.push(50, 50, 1, 18); g.o('M-6 10 H6 L4 44 H-4 Z', '#6b4a8c', 6); g.o('M-15 2 H15 V12 H-15 Z', '#ffc928', 6); g.o('M-15 -26 Q0 -48 15 -26 V2 H-15 Z', '#d9dde8', 6); g.s('M-15 -18 H15 M-15 -8 H15 M0 -40 V2', '#8a90a8', 3); g.pop(); g.p(star(80, 22, 12, 5, 4), '#ffd95a'); g.s(star(80, 22, 12, 5, 4), INK, 3.5); });
  I('ic_baton', 14, (g) => { g.push(50, 50, 1, 40); g.o('M-4 -46 H4 V26 H-4 Z', '#fff1d0', 6); g.o('M-9 24 Q0 16 9 24 V44 Q0 52 -9 44 Z', '#8a4420', 6); g.pop(); g.p(star(22, 24, 13, 5, 4), '#ffd95a'); g.s(star(22, 24, 13, 5, 4), INK, 4); });
  I('ic_pets', 14, (g) => { g.oc(26, 30, 14, '#8a4420', 6); g.oc(74, 30, 14, '#8a4420', 6); g.oc(50, 56, 36, FC.drum, 6); g.c(50, 58, 26, '#fff1d0'); g.c(40, 54, 4.5, INK); g.c(60, 54, 4.5, INK); g.s('M43 66 Q50 72 57 66', INK, 4); });
  I('ic_play', 9, (g) => g.o('M24 14 L84 50 L24 86 Z', '#2b2140', 4));
  I('ic_keep', 9, (g) => { g.o('M10 16 L46 50 L10 84 Z', '#2ecb6e', 7); g.o('M52 16 L88 50 L52 84 Z', '#2ecb6e', 7); });
  const shell = (g) => { g.p('M40 152 C6 122 26 46 100 38 C172 38 198 112 160 154 C130 184 70 180 40 152Z', '#fff1d0'); g.p('M160 154 C130 184 70 180 40 152 C80 168 150 150 172 96 C182 118 176 138 160 154Z', '#f7d9a4');
    g.s('M152 118 C152 78 90 68 80 108 C74 140 122 150 126 120 C128 104 106 100 102 114', '#ff8ab8', 10); g.e(56, 142, 27, 18, '#e05a94', -32); g.e(52, 140, 15, 9, '#8a2a5a', -32);
    for (const [x, y] of [[64, 56], [100, 40], [138, 50], [166, 78]]) g.c(x, y, 7, '#ff8ab8'); g.p(A.starPath(176, 34, 13, 4, 4), '#ffd95a'); };
  A.def('shell', { size: 48 }, shell);
  I('ic_shell', 12, (g) => { g.o('M20 76 C2 60 12 22 50 18 C88 18 98 56 80 78 C64 92 34 90 20 76Z', '#fff1d0', 6); g.s('M74 58 C74 38 44 34 40 54 C38 68 60 72 62 58', '#ff6aa0', 7); g.e(28, 70, 12, 8, '#e05a94', -32); });
  /* equipment */
  const GEAR = {
    sticks: (g, c) => { g.push(50, 50, 1, 35); g.o('M-6 -44 H6 V34 H-6 Z', c, 6); g.oc(0, -42, 9, '#fff1d0', 6); g.pop(); g.push(50, 50, 1, -35); g.o('M-6 -44 H6 V34 H-6 Z', c, 6); g.oc(0, -42, 9, '#fff1d0', 6); g.pop(); },
    mallet: (g, c) => { g.push(50, 54, 1, 35); g.o('M-5 -20 H5 V42 H-5 Z', '#c98a4a', 6); g.oc(0, -30, 22, c, 6); g.c(-7, -37, 6, WHITE); g.pop(); },
    mute: (g, c) => { g.o('M38 12 H62 L84 78 Q50 96 16 78 Z', c, 6); g.o('M38 12 H62 L64 24 H36 Z', '#c98a4a', 6); g.s('M30 60 Q50 70 70 60', WHITE, 5); },
    metro: (g, c) => { g.o('M38 8 H62 L82 92 H18 Z', c, 6); g.s('M50 78 L64 26', INK, 6); g.oc(60, 40, 8, '#fff1d0', 5); g.o('M18 76 H82 V92 H18 Z', A.dark(c, 0.3), 6); },
    fork: (g, c) => { g.s('M34 10 V44 a16 16 0 0 0 32 0 V10', INK, 20); g.s('M34 10 V44 a16 16 0 0 0 32 0 V10', c, 9); g.s('M50 60 V90', INK, 20); g.s('M50 62 V88', c, 9); g.oc(50, 90, 8, c, 6); },
  };
  Object.assign(GEAR, {
    plectrum: (g, c) => { g.o('M50 90 Q14 44 22 24 Q50 4 78 24 Q86 44 50 90 Z', c, 6); g.c(40, 34, 7, WHITE); },
    strap: (g, c) => { g.push(50, 50, 1, -35); g.o('M-12 -46 H12 V46 H-12 Z', c, 6); g.o('M-17 -12 H17 V12 H-17 Z', '#ffc928', 6); g.r(-8, -5, 16, 10, 2, INK); g.pop(); },
    oil: (g, c) => { g.o('M40 8 H60 V26 H40 Z', '#5a6072', 6); g.o('M30 26 H70 Q80 26 80 38 V80 Q80 92 68 92 H32 Q20 92 20 80 V38 Q20 26 30 26 Z', c, 6); g.o('M30 46 H70 V72 H30 Z', '#fff1d0', 5); g.p('M50 50 Q60 62 50 68 Q40 62 50 50 Z', '#ffb020'); },
    stylus: (g, c) => { g.push(50, 50, 1, 40); g.o('M-7 -46 H7 V20 H-7 Z', c, 6); g.o('M-13 16 H13 V32 H-13 Z', '#5a6072', 6); g.o('M-4 32 H4 L0 48 Z', '#e8ecf5', 5); g.pop(); },
    plugs: (g, c) => { g.s('M30 40 Q50 4 70 40', INK, 9); g.s('M30 40 Q50 4 70 40', '#5ab8f0', 4); g.o('M16 46 H44 L38 88 H22 Z', c, 6); g.o('M56 46 H84 L78 88 H62 Z', c, 6); g.s('M22 60 H38 M62 60 H78', WHITE, 4); },
    reed: (g, c) => { g.push(50, 50, 1, 20); g.o('M-14 44 V-20 Q-14 -46 0 -46 Q14 -46 14 -20 V44 Z', c, 6); g.o('M-14 18 H14 V44 H-14 Z', '#8a4a26', 6); g.s('M0 -34 V10', WHITE, 4); g.pop(); },
    sheet: (g, c) => { g.o('M20 8 H66 L82 24 V92 H20 Z', c, 6); g.o('M66 8 V24 H82 Z', '#d9d2ea', 5); g.s('M30 40 H72 M30 52 H72 M30 64 H72', '#9a94b8', 3); g.c(42, 68, 6, INK); g.s('M47 68 V44', INK, 4); g.c(62, 58, 6, INK); g.s('M67 58 V36', INK, 4); },
  });
  const GCOL = { sticks: '#c98a4a', mallet: '#ff6a5a', mute: '#d8433a', metro: '#8a5a3a', fork: '#b9c2d6', plectrum: '#35d07c', strap: '#8a5a3a', oil: '#5ab8f0', stylus: '#ff6aa0', plugs: '#ff9234', reed: '#f7d9a4', sheet: '#ffffff' };
  for (const t in GEAR) { I('item_' + t, 16, (g) => GEAR[t](g, GCOL[t])); I('item_' + t + '_l', 16, (g) => { GEAR[t](g, '#ffc928'); g.p(star(82, 20, 15, 5, 4), WHITE); g.s(star(82, 20, 15, 5, 4), INK, 4); }); }
  A.itemIcon = (it) => 'item_' + it.type + (it.leg ? '_l' : '');

  /* move tokens: what the move does, on a disc in the pet's family colour */
  const SIGN = {
    strike: (g) => { g.s('M28 72 L72 28', WHITE, 12); g.p('M50 22 H78 V50 Z', WHITE); },
    smash: (g) => g.p(star(50, 50, 34, 14, 8), WHITE),
    multi: (g) => g.s('M24 60 L48 30 M40 72 L64 42 M56 78 L80 48', WHITE, 9),
    burst: (g) => { g.s('M50 18 V82 M18 50 H82 M28 28 L72 72 M72 28 L28 72', WHITE, 8); g.c(50, 50, 10, WHITE); },
    scatter: (g) => { for (const [x, y, r] of [[32, 34, 9], [64, 30, 7], [50, 54, 10], [30, 68, 7], [70, 66, 9]]) g.c(x, y, r, WHITE); },
    heal: (g) => g.p('M40 22 H60 V40 H78 V60 H60 V78 H40 V60 H22 V40 H40 Z', WHITE),
    shield: (g) => g.p('M26 24 H74 V52 Q74 72 50 82 Q26 72 26 52 Z', WHITE),
    up: (g) => g.s('M28 48 L50 26 L72 48 M28 74 L50 52 L72 74', WHITE, 10),
    down: (g) => g.s('M28 26 L50 48 L72 26 M28 52 L50 74 L72 52', WHITE, 10),
    stun: (g) => g.p(star(50, 52, 32, 14, 5), WHITE),
    taunt: (g) => { g.s('M50 24 a26 26 0 1 0 0.1 0', WHITE, 9); g.c(50, 50, 9, WHITE); },
    fast: (g) => g.s('M26 30 L46 50 L26 70 M52 30 L72 50 L52 70', WHITE, 10),
    note: (g) => { g.s('M42 68 V28 L70 22 V60', WHITE, 8); g.c(34, 68, 10, WHITE); g.c(62, 60, 10, WHITE); },
  };
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
    if (!A.defs[key]) I(key, 26, (g) => {
      const c = FC[family] || FC.none;
      if (kind === 'finale') { g.p(star(50, 50, 49, 41, 12), INK); g.p(star(50, 50, 45, 38, 12), '#ffc928'); }
      g.oc(50, 50, kind === 'finale' ? 34 : 42, kind === 'beat' ? c : A.dark(c, 0.12), 6); if (kind === 'phrase') g.s('M50 14 a36 36 0 1 0 0.1 0', WHITE, 3.5);
      g.push(50, 50, kind === 'finale' ? 0.7 : 0.8); g.push(-50, -50); g.al(0.25); g.push(3, 4); SIGN[shape]({ s: (d, col, w) => g.s(d, INK, w), p: (d) => g.p(d, INK), c: (x, y, r) => g.c(x, y, r, INK) }); g.pop(); g.al(1); SIGN[shape](g); g.pop(); g.pop();
    });
    return key;
  };

  /* lettering drawn straight onto the battlefield */
  A.text = (ctx, str, cx, y, col, big) => {
    ctx.save(); ctx.font = `800 ${big ? 13 : 6.6}px 'Baloo 2', sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.lineJoin = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = big ? 3.2 : 2; ctx.strokeText(str, cx, y); ctx.fillStyle = col; ctx.fillText(str, cx, y); const w = ctx.measureText(str).width; ctx.restore(); return w;
  };

  /* backdrops: big quiet shapes, so the stickers on top stay the loudest thing on screen */
  const bgc = new Map();
  const SCN = {
    camp: { sky: '#bfe9ff', sun: '#fff3a8', far: '#a5e3c0', mid: '#7fd69c', g1: '#c8ee9a', g2: '#b4e486' },
    fen: { sky: '#c8f0e6', sun: '#fff6c8', far: '#9fdcc4', mid: '#79cfae', g1: '#bfe8a0', g2: '#a8dc8a', water: '#8fd8e8' },
    works: { sky: '#ffe2bd', sun: '#fff3c8', far: '#f4b890', mid: '#e89a70', g1: '#f6d8a8', g2: '#ecc890' },
    ridge: { sky: '#cfe6ff', sun: '#ffffff', far: '#a8c8ee', mid: '#eef5ff', g1: '#d8e9fb', g2: '#c4dbf4' },
    hall: { sky: '#ffe9c8', sun: '#fff6dc', far: '#f2c890', mid: '#e8b070', g1: '#f0c48a', g2: '#e4b276' },
    orchard: { sky: '#d6f2ff', sun: '#fff3a8', far: '#b6e6a8', mid: '#8fd67c', g1: '#d2f0a0', g2: '#bce488' },
    road: { sky: '#d9e6f5', sun: '#fff6dc', far: '#b9c6dc', mid: '#a3b2cc', g1: '#dfe3ec', g2: '#cdd3e0' },
    caves: { sky: '#d9cdea', sun: '#efe6fa', far: '#bcaad8', mid: '#a894c8', g1: '#d8cbe6', g2: '#c6b6da' },
    dunes: { sky: '#ffe8bf', sun: '#fff8dc', far: '#f7cf8c', mid: '#f0bd70', g1: '#fbe0a6', g2: '#f3d08c' },
    harbor: { sky: '#d2eefa', sun: '#fff6dc', far: '#a8d8ee', mid: '#8fc8e4', g1: '#ecd6ae', g2: '#dfc698', water: '#7fc4e4' },
    night: { sky: '#3a427e', sun: '#fff6c8', far: '#4f5f9a', mid: '#3f6f80', g1: '#5f9f86', g2: '#4f8c74', cloud: '#5a64a0', stars: 1 },
    dusk: { sky: '#ffc9a0', sun: '#fff0b0', far: '#f08a7a', mid: '#c86a80', g1: '#f6bc8e', g2: '#eaa67a', cloud: '#ffe3c8' },
    gold: { sky: '#fff0b8', sun: '#ffffff', far: '#f2c040', mid: '#e0a020', g1: '#ffd870', g2: '#f2c050' },
    aurora: { sky: '#2f4a7a', sun: '#eaf6ff', far: '#5a7ab0', mid: '#eef5ff', g1: '#dcecfb', g2: '#c6dcf4', cloud: '#4a6aa0', stars: 1 },
    spot: { sky: '#5a3f8a', sun: '#fff6dc', far: '#4a3274', mid: '#3a2660', g1: '#e8b070', g2: '#d99c5c' },
    neon: { sky: '#2c2366', sun: '#ff9ad8', far: '#5a2f9a', mid: '#3a6aa8', g1: '#7fe0d8', g2: '#5fc8c0', cloud: '#4a3a8a', stars: 1 },
    tower: { sky: '#f3e6cf', sun: '#fff6dc', far: '#e3cfa8', mid: '#d4bb8c', g1: '#e9dcc0', g2: '#dccdaa' },
  };
  A.SCN = SCN;
  A.bg = (key, w, h, hf) => {
    const k = A.k, ck = [key, w, h, hf || '', k].join(); if (bgc.has(ck)) return bgc.get(ck);
    const c = A.make(w * k, h * k), x = c.getContext('2d'); x.scale(k, k); const g = new A.G(x), p = SCN[key] || SCN.camp, hz = Math.round(h * (hf || 0.4)), rnd = H.rng(key.length * 131 + 7);
    const hill = (y, amp, n, seed) => { let d = `M0 ${h} V${y}`; for (let i = 0; i < n; i++) { const x0 = (w / n) * i, x1 = (w / n) * (i + 1), a = amp * (0.5 + ((Math.sin(seed + i * 2.3) + 1) / 2) * 0.8); d += ` Q${(x0 + x1) / 2} ${y - a * 2} ${x1} ${y}`; } return d + ` V${h}Z`; };
    const CW = p.cloud || WHITE, cloud = (cx, cy, s) => { g.push(cx, cy, s); g.c(0, 0, 9, CW); g.c(-11, 3, 7, CW); g.c(11, 3, 7.5, CW); g.r(-19, 3, 39, 7, 3.5, CW); g.pop(); };
    g.r(0, 0, w, h, 0, p.sky);
    const indoors = key === 'hall' || key === 'caves' || key === 'tower' || key === 'gold' || key === 'spot';
    if (p.stars) for (let i = 0; i < 26; i++) g.c(rnd() * w, rnd() * hz * 0.9, 0.5 + rnd() * 0.7, '#fff6c8');
    if (key === 'aurora') { g.s(`M0 ${hz * 0.5} Q${w * 0.3} ${hz * 0.1} ${w * 0.55} ${hz * 0.45} T${w} ${hz * 0.3}`, '#6fe8b0', hz * 0.16); g.s(`M0 ${hz * 0.66} Q${w * 0.35} ${hz * 0.3} ${w * 0.6} ${hz * 0.62} T${w} ${hz * 0.5}`, '#c88af8', hz * 0.08); }
    if (key === 'spot') { g.al(0.28); g.p(`M${w * 0.2} 0 L${w * 0.02} ${hz + 20} H${w * 0.5} Z`, '#fff6dc'); g.p(`M${w * 0.8} 0 L${w * 0.5} ${hz + 20} H${w * 0.98} Z`, '#fff6dc'); g.al(1); g.r(0, hz - 4, w, 8, 0, p.far); }
    if (key === 'gold') { for (let i = 0; i < 6; i++) g.r((w / 6) * i + 2, 0, w / 6 - 4, hz, 0, i % 2 ? '#ffe9a0' : '#fff0b8'); g.c(w * 0.5, hz * 0.3, Math.min(20, hz * 0.3), p.sun); g.r(0, hz - 6, w, 8, 0, p.far); }
    if (key === 'caves') { for (let i = 0; i < 9; i++) { const X = (w / 8) * i + (i % 2) * 5 - 6, hh = hz * (0.35 + ((i * 37) % 50) / 100); g.p(`M${X - 9} 0 H${X + 9} L${X} ${hh}Z`, i % 2 ? p.far : p.mid); } g.c(w * 0.3, hz * 0.8, 3, '#8fe6ff'); g.c(w * 0.72, hz * 0.6, 2.4, '#8fe6ff'); }
    else if (key === 'tower') { const gear = (cx, cy, r, c) => { g.c(cx, cy, r, c); for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; g.c(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.22, c); } g.c(cx, cy, r * 0.45, p.sky); }; gear(w * 0.22, hz * 0.5, Math.min(22, hz * 0.4), p.far); gear(w * 0.72, hz * 0.4, Math.min(30, hz * 0.5), p.mid); gear(w * 0.5, hz * 0.85, Math.min(12, hz * 0.22), p.far); g.r(0, hz - 4, w, 6, 0, p.mid); }
    else if (key === 'hall') { for (let i = 0; i < 6; i++) g.r((w / 6) * i + 2, 0, w / 6 - 4, hz, 0, i % 2 ? '#ffdfb0' : '#ffe9c8'); g.c(w * 0.5, hz * 0.3, Math.min(20, hz * 0.3), p.sun); g.r(0, hz - 6, w, 8, 0, p.far); }
    else if (!indoors) { g.c(w * 0.78, Math.max(14, hz * 0.42), Math.min(18, hz * 0.34), p.sun); cloud(w * 0.2, Math.max(12, hz * 0.34), 1); cloud(w * 0.55, Math.max(18, hz * 0.6), 0.7); }
    if (key === 'ridge') { for (const [fx, s] of [[0.18, 1], [0.5, 1.3], [0.84, 0.9]]) { const mx = w * fx, mh = 34 * s; g.p(`M${mx - mh * 1.1} ${hz + 6} L${mx} ${hz - mh} L${mx + mh * 1.1} ${hz + 6}Z`, p.far); g.p(`M${mx - mh * 0.36} ${hz - mh * 0.66} L${mx} ${hz - mh} L${mx + mh * 0.36} ${hz - mh * 0.66} L${mx + mh * 0.14} ${hz - mh * 0.56} L${mx} ${hz - mh * 0.7} L${mx - mh * 0.16} ${hz - mh * 0.54}Z`, WHITE); } }
    else if (key === 'works') { for (const [fx, ww, hh] of [[0.08, 12, 40], [0.24, 9, 28], [0.9, 13, 44], [0.72, 9, 30]]) { const X = w * fx; g.r(X, hz - hh, ww, hh + 8, 0, p.mid); g.r(X - 1.5, hz - hh, ww + 3, 4, 1, p.far); } g.s(`M0 ${Math.max(10, hz * 0.3)} H${w}`, '#c8845a', 1.6); for (const fx of [0.36, 0.5, 0.64]) { const X = w * fx, Y = Math.max(10, hz * 0.3); g.s(`M${X} ${Y} v5`, '#c8845a', 1.4); g.p(`M${X - 5} ${Y + 14} Q${X - 4} ${Y + 5} ${X} ${Y + 5} Q${X + 4} ${Y + 5} ${X + 5} ${Y + 14}Z`, '#ffc928'); } }
    else if (key === 'road') { for (const [fx, ww, hh] of [[0.02, 22, 44], [0.2, 16, 30], [0.36, 20, 52], [0.58, 18, 36], [0.74, 24, 48], [0.92, 18, 34]]) { const X = w * fx; g.r(X, hz - hh + 8, ww, hh, 1.5, fx * 10 % 2 < 1 ? p.far : p.mid); for (let yy = hz - hh + 13; yy < hz + 2; yy += 8) for (let xx = X + 3; xx < X + ww - 3; xx += 6) g.r(xx, yy, 2.6, 3.6, 0.5, '#f4f7fc'); } }
    else if (key === 'orchard') { g.p(hill(hz, 7, 4, 1), p.far); for (const fx of [0.08, 0.3, 0.52, 0.76, 0.95]) { const X = w * fx, Y = hz + 4; g.r(X - 1.6, Y - 14, 3.2, 16, 1, '#a8703a'); g.c(X, Y - 20, 11, '#5fc46a'); g.c(X - 7, Y - 15, 7, '#4fb85a'); g.c(X + 7, Y - 15, 7, '#6fd07a'); g.c(X - 3, Y - 22, 1.8, '#ff5a5a'); g.c(X + 5, Y - 18, 1.8, '#ff5a5a'); g.c(X + 1, Y - 13, 1.8, '#ff5a5a'); } }
    else if (key === 'dunes') { g.p(hill(hz, 14, 3, 2), p.far); for (const fx of [0.1, 0.9]) { const X = w * fx, Y = hz + 8; g.r(X - 2.4, Y - 20, 4.8, 22, 2.4, '#5fb878'); g.s(`M${X - 2} ${Y - 8} h-5 v-6 M${X + 2} ${Y - 12} h5 v-5`, '#5fb878', 3.4); } }
    else if (key === 'harbor') { const X = w * 0.14; g.p(`M${X - 5} ${hz + 6} L${X - 3.4} ${hz - 26} H${X + 3.4} L${X + 5} ${hz + 6}Z`, '#f4f7fc'); g.r(X - 4.2, hz - 14, 8.4, 5, 0, '#ff6b5e'); g.r(X - 4.6, hz - 32, 9.2, 7, 2, '#ffd95a'); g.p(`M${X - 5} ${hz - 32} L${X} ${hz - 39} L${X + 5} ${hz - 32}Z`, '#ff6b5e'); for (const fx of [0.5, 0.8]) { const B = w * fx; g.p(`M${B - 10} ${hz + 3} H${B + 10} L${B + 6} ${hz + 8} H${B - 6}Z`, '#ff8a5a'); g.s(`M${B} ${hz + 3} V${hz - 14}`, '#8a5a3a', 1.4); g.p(`M${B + 1} ${hz - 13} L${B + 9} ${hz - 1} H${B + 1}Z`, '#ffffff'); } }
    else if (!indoors) { g.p(hill(hz, 9, 4, 1), p.far); }
    g.p(hill(hz + 7, 5, 6, 4), p.mid);
    if (p.water) { g.r(0, hz + 4, w, 9, 0, p.water); for (let i = 0; i < 7; i++) g.r(rnd() * w, hz + 6 + rnd() * 5, 6 + rnd() * 8, 1.2, 0.6, WHITE); }
    g.r(0, hz + (p.water ? 13 : 7), w, h, 0, p.g1);
    if (key === 'road') { g.r(0, hz + 22, w, Math.max(14, (h - hz) * 0.3), 0, '#b9c0d0'); for (let xx = 4; xx < w; xx += 22) g.r(xx, hz + 22 + Math.max(14, (h - hz) * 0.3) / 2 - 1, 11, 2, 1, '#f4f7fc'); }
    if (key === 'harbor') for (let y = hz + 20; y < h; y += 13) g.r(0, y, w, 1.3, 0, p.g2);
    if (key === 'tower') for (let y = hz + 12, r = 0; y < h; y += 14, r++) for (let xx = (r % 2) * 14; xx < w; xx += 28) g.r(xx, y, 14, 14, 0, p.g2);
    if (key === 'gold' || key === 'spot') { for (let y = hz + 14; y < h; y += 16) g.r(0, y, w, 1.4, 0, p.g2); const cc = key === 'gold' ? '#8a5ad0' : '#e0445a'; g.p(`M0 0 H${w * 0.14} Q${w * 0.1} ${hz * 0.7} ${w * 0.05} ${hz + 10} H0Z`, cc); g.p(`M${w} 0 H${w * 0.86} Q${w * 0.9} ${hz * 0.7} ${w * 0.95} ${hz + 10} H${w}Z`, cc); g.r(0, 0, w, 7, 0, A.dark(cc, 0.25)); }
    else if (key === 'hall') { for (let y = hz + 14; y < h; y += 16) g.r(0, y, w, 1.4, 0, p.g2); g.p(`M0 0 H${w * 0.14} Q${w * 0.1} ${hz * 0.7} ${w * 0.05} ${hz + 10} H0Z`, '#e0445a'); g.p(`M${w} 0 H${w * 0.86} Q${w * 0.9} ${hz * 0.7} ${w * 0.95} ${hz + 10} H${w}Z`, '#e0445a'); g.r(0, 0, w, 7, 0, '#c8304a'); }
    else if (key !== 'road' && key !== 'harbor' && key !== 'tower') for (let i = 0; i < 9; i++) { const X = (w * ((i * 37) % 100)) / 100, Y = hz + 24 + (((i * 53) % 100) / 100) * Math.max(4, h - hz - 34); g.e(X, Y, 12 + (i % 3) * 6, 2.4 + (i % 2), p.g2); }
    if (key === 'fen') for (const fx of [0.05, 0.1, 0.92, 0.97]) { const X = w * fx; g.r(X, hz - 16, 1.8, 30, 0.9, '#4fb878'); g.r(X - 1.6, hz - 22, 5, 11, 2.5, '#8a5a3a'); }
    if (key === 'ridge') for (const fx of [0.06, 0.94]) { const X = w * fx; g.p(`M${X - 8} ${hz + 12} L${X} ${hz - 14} L${X + 8} ${hz + 12}Z`, '#5fb89a'); g.p(`M${X - 6} ${hz} L${X} ${hz - 22} L${X + 6} ${hz}Z`, '#6fc8a8'); }
    if (key === 'camp') { const Y = Math.max(6, hz * 0.16); g.s(`M0 ${Y} Q${w / 2} ${Y + 12} ${w} ${Y}`, '#8a84b0', 1); for (let i = 1; i < 9; i++) { const X = (w / 9) * i, yy = Y + 12 * (1 - Math.pow((X - w / 2) / (w / 2), 2)) * 0.95; g.p(`M${X - 4} ${yy} H${X + 4} L${X} ${yy + 8}Z`, ['#ff6b5e', '#ffc928', '#4aa8f0', '#35d07c', '#ff6aa0'][i % 5]); } }
    bgc.set(ck, c); return c;
  };

  /* A region before and after its music comes back. A hushed region looks as it always does ('hush' is the plain backdrop);
     'sing' warms it with sunshine, a few faint notes and a touch that fits the region. 'grey' drains the colour (the intro only). */
  const bgm = new Map();
  const ACCENT = { fen: 'flowers', works: 'embers', orchard: 'petals', ridge: 'glints', road: 'flowers', caves: 'crystals', dunes: 'flowers', harbor: 'glints', tower: 'embers', hall: 'confetti', camp: 'flowers' };
  A.bgMode = (key, w, h, hf, mode) => {
    const base = A.bg(key, w, h, hf); if (!mode || mode === 'hush') return base;
    const k = A.k, ck = [key, w, h, hf || '', k, mode].join(); if (bgm.has(ck)) return bgm.get(ck);
    const c = A.make(base.width, base.height), x = c.getContext('2d'); x.drawImage(base, 0, 0);
    const hz = Math.round(h * (hf || 0.4)), rnd = H.rng(key.length * 977 + w), g = (() => { x.save(); x.scale(k, k); return new A.G(x); })();
    if (mode === 'grey') {
      const im = x.getImageData(0, 0, c.width, c.height), d = im.data;
      for (let i = 0; i < d.length; i += 4) { const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; d[i] = l * 0.8 + d[i] * 0.2 - 10; d[i + 1] = l * 0.8 + d[i + 1] * 0.2 - 12; d[i + 2] = l * 0.8 + d[i + 2] * 0.2 + 4; }
      x.putImageData(im, 0, 0);
      g.al(0.35); g.r(0, hz - 14, w, 22, 0, '#d8d4e4'); g.al(0.5);
      for (let i = 0; i < 7; i++) { const X = rnd() * w, Y = 6 + rnd() * (hz - 14), L = 14 + rnd() * 22; let dd = `M${X} ${Y}`; for (let j = 1; j <= 5; j++) dd += ` L${X + (L / 5) * j} ${Y + (j % 2 ? -3 : 3)}`; g.s(dd, '#6e6886', 1.3); }
      for (let i = 0; i < 26; i++) g.r(rnd() * w, rnd() * h, 1.2 + rnd() * 2.5, 0.7, 0.3, i % 2 ? '#5e5876' : '#ffffff');
      g.al(1); x.restore(); bgm.set(ck, c); return c;
    }
    // sunshine: a warm wash, a glow from the top corner and a few soft rays
    const sx = w * 0.82, sy = -h * 0.04;
    x.globalCompositeOperation = 'soft-light'; g.al(0.45); g.r(0, 0, w, h, 0, '#ffd27a'); g.al(1);
    x.globalCompositeOperation = 'screen';
    const gr = x.createRadialGradient(sx, sy, 0, sx, sy, w * 0.95); gr.addColorStop(0, 'rgba(255,238,170,0.55)'); gr.addColorStop(0.45, 'rgba(255,226,150,0.18)'); gr.addColorStop(1, 'rgba(255,226,150,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) { const a0 = 1.75 + i * 0.32, a1 = a0 + 0.07, L = h * 1.3; g.al(0.13); g.p(`M${sx} ${sy} L${sx + Math.cos(a0) * L} ${sy + Math.sin(a0) * L} L${sx + Math.cos(a1) * L} ${sy + Math.sin(a1) * L}Z`, '#fff4cc'); }
    g.al(1); x.globalCompositeOperation = 'source-over';
    // a few faint notes in the sky
    const cols = ['#ff6b5e', '#ffc928', '#2fd0d0', '#6fd46a', '#c88af8'];
    const note = (nx, ny, sc, col) => { g.push(nx, ny, sc); g.s('M0 6 V-6 L7 -8 V4', '#3b3355', 3.2); g.s('M0 6 V-6 L7 -8 V4', col, 1.5); g.c(-2.5, 6.5, 3, '#3b3355'); g.c(-2.5, 6.5, 2, col); g.c(4.5, 4.5, 3, '#3b3355'); g.c(4.5, 4.5, 2, col); g.pop(); };
    const nn = Math.max(2, Math.round(w / 80)); g.al(0.5); for (let i = 0; i < nn; i++) note(w * ((i + 0.5) / nn) + (rnd() - 0.5) * 24, hz * (0.3 + rnd() * 0.45), 0.42 + rnd() * 0.15, cols[(i * 2 + 1) % cols.length]); g.al(1);
    // the region's own touch
    const ac = ACCENT[key] || 'glints', gy = () => hz + 14 + rnd() * Math.max(6, h - hz - 22), sky = () => 6 + rnd() * hz * 0.8;
    for (let i = 0; i < 10; i++) {
      const X = rnd() * w, col = cols[i % cols.length];
      if (ac === 'flowers') { const Y = gy(); for (let a = 0; a < 5; a++) g.c(X + Math.cos(a * 1.257) * 1.6, Y + Math.sin(a * 1.257) * 1.6, 1.3, col); g.c(X, Y, 1, '#fff6c8'); }
      else if (ac === 'petals') { g.al(0.85); g.e(X, i % 2 ? sky() : gy(), 1.8, 1, i % 3 ? '#ffc4d8' : '#ffffff', rnd() * 180); g.al(1); }
      else if (ac === 'embers') { const Y = sky() + hz * 0.15; g.al(0.35); g.c(X, Y, 3, '#ffd27a'); g.al(0.9); g.c(X, Y, 1.1, '#fff2b0'); g.al(1); }
      else if (ac === 'crystals') { const Y = gy(); g.al(0.9); g.p(`M${X} ${Y - 4} L${X + 1.6} ${Y} L${X} ${Y + 1} L${X - 1.6} ${Y}Z`, i % 2 ? '#8ff0f0' : '#d6b0ff'); g.al(1); }
      else if (ac === 'confetti') { g.al(0.85); g.push(X, sky() + hz * 0.1, 1, rnd() * 180); g.r(-1.2, -0.6, 2.4, 1.2, 0.2, col); g.pop(); g.al(1); }
      else if (i < 7) { g.al(0.75); g.p(A.starPath(X, i % 2 ? sky() : gy(), 2.6, 0.8, 4), '#ffffff'); g.al(1); }
    }
    x.restore(); bgm.set(ck, c); return c;
  };

  /* A region as a round badge for the map strip: its sky, its ground and its landmark. Drawn on a 30 x 30 grid. */
  const BADGE = {
    fen:     ['#cdeefa', '#8fd0b0'], works: ['#ffe2c4', '#e8c49a'], orchard: ['#d8f4ff', '#8fd667'], ridge: ['#dfe8ff', '#ffffff'], road: ['#fff0d0', '#d8cdb8'],
    caves:   ['#d9cfe8', '#b8a894'], dunes: ['#ffe9b8', '#f4d890'], harbor: ['#bfe8ff', '#7cc6e0'], tower: ['#e8dcff', '#cbb8dc'], hall: ['#fff0c8', '#f2dca8'],
  };
  const bdc = new Map();
  A.regionBadge = (r, size) => {
    const k = A.k, ck = [r, size, k].join(); if (bdc.has(ck)) return bdc.get(ck);
    const c = A.make(size * k, size * k), x = c.getContext('2d'); x.scale((size * k) / 30, (size * k) / 30); const g = new A.G(x), INK = A.INK, L = 1.2;
    const O = (d, fill) => g.o(d, fill, L), OC = (cx, cy, rr, fill) => g.oc(cx, cy, rr, fill, L), [sky, ground] = BADGE[r] || BADGE.fen;
    x.save(); x.beginPath(); x.arc(15, 15, 14, 0, 6.2832); x.clip();
    g.r(0, 0, 30, 30, 0, sky); g.e(15, 31, 22, 11, ground);
    const tree = (X, Y, sc) => { g.push(X, Y, sc); g.r(-0.8, -2, 1.6, 3, 0.3, '#8a5a36'); OC(0, -5.5, 4.2, '#4fae4a'); g.c(-1.3, -6.8, 1.3, '#7fd468'); g.c(1.6, -4.4, 0.8, '#ff6b5e'); g.pop(); };
    const D = {
      fen: () => { g.e(12, 23, 8, 3, INK); g.e(12, 23, 7, 2.3, '#5fb8de'); g.al(0.6); g.e(10, 22.4, 2.4, 0.7, '#ffffff'); g.al(1); [17, 20, 23, 6].forEach((X, j) => { g.s(`M${X} 24 V${13 + (j % 2) * 2}`, '#4f8a3c', 1.1); g.e(X, 12.5 + (j % 2) * 2, 1.2, 2.6, '#8a5a36'); }); g.e(13, 23, 1.6, 0.8, '#6fcf5a'); },
      works: () => { O('M5 24 V15 H21 V24Z', '#e09a6a'); O('M4 15 L13 9 L22 15Z', '#b65c3c'); O('M18 13 V5 H21.5 V13Z', '#8a6a60'); g.al(0.75); g.c(21, 3, 1.6, '#ffffff'); g.al(1); O('M10 24 Q10 17.5 13 17.5 Q16 17.5 16 24Z', '#ffc928'); g.c(13, 24.4, 1, INK); },
      orchard: () => { tree(9, 23, 1); tree(21, 22, 1.05); tree(15, 25, 1.3); },
      ridge: () => { O('M1 26 L11 8 L21 26Z', '#a9b7d6'); g.p('M11 8 L7.6 14.2 L10 13.2 L12 14.8 L14.2 13.4Z', '#ffffff'); O('M12 26 L21 12 L30 26Z', '#94a4c8'); g.p('M21 12 L18.7 15.6 L20.8 14.8 L23 15.8Z', '#ffffff'); },
      road: () => { g.s('M-2 27 Q10 18 16 22 T32 16', '#9a8f80', 6); g.s('M-2 27 Q10 18 16 22 T32 16', '#e9dcc0', 4.2); g.r(14.2, 7, 1.6, 15, 0.4, '#8a5a36'); O('M8 7 H19 L21.5 9 L19 11 H8Z', '#f6e3a8'); O('M21 13 H11 L8.5 15 L11 17 H21Z', '#f6e3a8'); },
      caves: () => { O('M-1 27 Q2 9 15 7 Q28 9 31 27Z', '#9a8a7a'); g.p('M9 27 Q9 15 15 15 Q21 15 21 27Z', INK); g.p('M12.5 15.2 L13.6 18.6 L14.6 15.1Z', '#d8cfc4'); g.p('M16 15.3 L16.9 17.6 L17.8 15.5Z', '#d8cfc4'); g.e(15, 26, 3, 0.9, '#7cc6e0'); },
      dunes: () => { O('M-1 27 Q8 14 16 23 Q23 12 31 27Z', '#f2cf7a'); g.al(0.5); g.p('M16 23 Q23 12 31 27 Q24 20 16 23Z', '#ffe8a8'); g.al(1); g.push(9, 22, 1); g.s('M0 0 V-9 M0 -4.5 H-2.8 V-7 M0 -3 H2.8 V-5.5', INK, 3); g.s('M0 0 V-9 M0 -4.5 H-2.8 V-7 M0 -3 H2.8 V-5.5', '#5fbf4a', 1.7); g.pop(); g.c(24, 6, 3, '#ffd84a'); },
      harbor: () => { O('M15 25 L16.2 7 H20.8 L22 25Z', '#ffffff'); g.p('M15.6 19 H21.5 L21.8 22.5 H15.3Z M16.1 12 H21 L21.2 15.4 H15.9Z', '#ff6b5e'); OC(18.5, 5.5, 2.6, '#ffe58a'); O('M2 22 H12 L10 26 H4Z', '#ff6b5e'); O('M7 21 V12 L12 20Z', '#ffffff'); },
      tower: () => { O('M10.5 27 V8 H19.5 V27Z', '#c8a8d8'); O('M9 8 L15 1 L21 8Z', '#8a6ab0'); OC(15, 13.5, 3.4, '#ffffff'); g.s('M15 13.5 V11 M15 13.5 H17', INK, 0.9); g.r(13.2, 21, 3.6, 6, 1.6, '#6a4a8a'); },
      hall: () => { g.e(15, 12, 7.5, 6.5, '#ffd27a'); g.s('M7.5 12 A7.5 6.5 0 0 1 22.5 12', INK, L); O('M3 26 V23 H27 V26Z', '#e8dcc8'); [5, 9.5, 14, 18.5, 23].forEach((X) => O(`M${X} 23 V14 H${X + 2} V23Z`, '#ffffff')); O('M3 14 L15 8.5 L27 14Z', '#f6e3a8'); g.s('M15 6 V1', INK, 0.9); g.p('M15 1 L19.5 2.4 L15 3.8Z', '#ff6b5e'); },
    };
    (D[r] || D.fen)();
    x.restore(); g.s('M29 15 A14 14 0 1 1 1 15 A14 14 0 1 1 29 15Z', INK, 1.6);
    bdc.set(ck, c); return c;
  };
})(window.H);
