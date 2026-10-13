/* Hushsong — two more pets: a healer and a support for the early game. Same rules: an instrument first, with just enough
   creature in it to have a face, and forms told apart by outline and colour. */
(function (H) {
  'use strict';
  const A = H.Art, INK = A.INK, T = A.PET, { SP, LOOK, BASE, P, eyes, blush, smile, CREAM, WHITE } = T;

  // Tink: a music box that waddles on its wind-up key. The Carousel line grows a striped canopy, the Windup line a heavier box.
  SP.tink = { pal: (m) => P(m, { gold: '#ffc928', gd: '#e0a010', metal: '#c8cce0', md: '#8a90b0' }), hat: [100, 70, 0.8], eyes: [80, 120, 128, 1], chin: [100, 156, 0.7],
    draw: (g, p, f) => {
      g.push(100, 184, 1.12); g.push(-100, -184);   // drawn a touch larger to sit level with the other pets
      const top = f.tall ? 84 : 98, ch = f.tall ? 72 : 82, w = f.armor ? 132 : 120, x0 = 100 - w / 2;
      // the wind-up key on its right side
      const key = (x, y, sc) => { g.push(x, y, sc); g.r(0, -6, 22, 12, 5, p.gold); g.c(30, -14, 12, p.gold); g.c(30, 14, 12, p.gold); g.c(30, -14, 5, p.gd); g.c(30, 14, 5, p.gd); g.r(22, -8, 10, 16, 4, p.gd); g.pop(); };
      key(x0 + w - 12, top + 40, f.armor ? 1.08 : 0.95);
      if (f.gears) { g.c(38, top + 46, 22, p.metal); for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; g.c(38 + Math.cos(a) * 22, top + 46 + Math.sin(a) * 22, 6, p.metal); } g.c(38, top + 46, 8, p.md); }
      g.e(72, 184, 16, 8, p.dd); g.e(128, 184, 16, 8, p.dd);
      if (f.scallop) for (let i = 0; i < 7; i++) g.c(x0 + 10 + i * ((w - 20) / 6), 182, 11, i % 2 ? p.l : p.d);
      // the box
      g.r(x0, top, w, 180 - top, 16, p.m); g.p(`M100 ${top} H${x0 + w - 16} Q${x0 + w} ${top} ${x0 + w} ${top + 16} V164 Q${x0 + w} 180 ${x0 + w - 16} 180 H100 Z`, p.d);
      g.r(x0, top + 12, w, 9, 0, p.l); g.r(x0, 160, w, 8, 0, p.dd);
      if (f.armor) for (const [cx, cy] of [[x0 + 4, top + 4], [x0 + w - 22, top + 4], [x0 + 4, 158], [x0 + w - 22, 158]]) g.r(cx, cy, 18, 18, 5, p.metal);
      if (f.stack) { g.r(56, top - 40, 88, 42, 12, p.m); g.r(100, top - 40, 44, 42, 12, p.d); g.r(56, top - 14, 88, 7, 0, p.l); g.c(100, top - 40, 9, p.gold); }
      else if (f.canopy) {
        g.r(96, top - 54, 8, 56, 3, p.gold);
        g.p(`M${x0 - 6} ${top - 44} L100 ${top - ch} L${x0 + w + 6} ${top - 44} Z`, p.l);
        for (let i = 0; i < 4; i++) g.p(`M100 ${top - ch} L${x0 - 6 + i * ((w + 12) / 4)} ${top - 44} L${x0 - 6 + (i + 0.5) * ((w + 12) / 4)} ${top - 44} Z`, p.d);
        for (let i = 0; i < 9; i++) g.c(x0 - 2 + i * ((w + 8) / 8), top - 42, 7, i % 2 ? p.m : p.l);
        g.c(100, top - ch - 2, 7, p.gold);
      } else {
        // an open lid and the comb that plays the tune
        g.p(`M${x0 + 4} ${top} L${x0 + 18} ${top - 50} L${x0 + w + 6} ${top - 38} L${x0 + w - 6} ${top} Z`, p.d);
        g.p(`M${x0 + 12} ${top - 4} L${x0 + 22} ${top - 42} L${x0 + w - 2} ${top - 32} L${x0 + w - 12} ${top - 4} Z`, p.l);
        g.r(x0 + 16, top - 12, w - 32, 10, 5, p.gold);
        for (let i = 0; i < 8; i++) g.r(x0 + 22 + i * ((w - 44) / 7) - 2.5, top - 22, 5, 12, 2, CREAM);
      }
      eyes(g, 80, 120, top + 42); blush(g, 66, top + 56); blush(g, 134, top + 56); smile(g, 100, top + 54, 8);
      g.pop(); g.pop();
    } };

  // Wah: a rubber trumpet mute on a wobbly handle. The Plunger line widens its rim; the Cornet line grows a horn bell.
  SP.wah = { pal: (m) => P(m, { wood: '#a86a3a', wl: '#d8955a', gold: '#ffc928', gd: '#d89a12' }), hat: [100, 74, 0.8], eyes: [82, 118, 124, 1], chin: [100, 160, 0.7],
    draw: (g, p, f) => {
      g.push(100, 184, 1.08); g.push(-100, -184);
      const bell = (sx, sc) => { g.push(100 + sx * 54, 120, sc); g.push(0, 0, [sx, 1]); g.r(-6, -6, 30, 12, 5, p.gold); g.p('M20 -10 L50 -30 Q56 0 50 30 L20 10 Z', p.gold); g.p('M20 -10 L50 -30 Q46 0 50 30 L20 10 Z', p.gd); g.e(51, 0, 6, 30, A.dark('#ffc928', 0.35)); g.pop(); g.pop(); };
      if (f.bell) bell(1, f.bell);
      if (f.twin) bell(-1, f.bell * 0.85);
      // the handle and its knob
      g.s(f.long ? 'M104 76 Q118 46 144 28' : 'M102 76 L124 36', p.wood, 9); g.c(f.long ? 146 : 126, f.long ? 26 : 32, 10, p.wl);
      g.e(72, 184, 15, 8, p.dd); g.e(128, 184, 15, 8, p.dd);
      // the rubber dome
      g.p('M32 174 Q30 78 100 72 Q170 78 168 174 Z', p.m); g.p('M100 72 Q170 78 168 174 H100 Z', p.d);
      if (f.stripes) { g.al(0.9); for (const y of [104, 128]) g.p(`M${40 - (y - 104) * 0.12} ${y} Q100 ${y - 6} ${160 + (y - 104) * 0.12} ${y} V${y + 9} Q100 ${y + 3} ${40 - (y - 104) * 0.12} ${y + 9} Z`, p.l); g.al(1); }
      const rw = f.flare ? 92 : 76;
      g.r(100 - rw, 166, rw * 2, 16, 8, p.dd);
      if (f.check) for (let i = 0; i < Math.floor(rw / 8); i++) g.r(100 - rw + 4 + i * 16, 168, 8, 12, 1.5, i % 2 ? INK : WHITE);
      eyes(g, 82, 118, 120); blush(g, 66, 136); blush(g, 134, 136);
      g.e(100, 146, 9, 11, INK); g.e(100, 150, 5, 5, '#ff6b7a');
      g.pop(); g.pop();
    } };

  // Thrum: a double bass that walks on its spike. The Upright line is broader; the Arco line carries its bow.
  SP.thrum = { pal: (m) => P(m, { wood: '#6a3a22', wl: '#9a5a32', str: '#f4ead0', gold: '#ffc928' }), hat: [100, 40, 0.7], eyes: [84, 116, 92, 0.95], chin: [100, 118, 0.6],
    draw: (g, p, f) => {
      g.push(100, 184, 1.1); g.push(-100, -184);
      const W = f.wide ? 1.16 : 1;
      if (f.bow) { g.s('M26 52 Q18 110 40 168', p.wood, 5); g.s('M30 56 Q24 110 42 162', p.str, 2.2); g.r(32, 154, 14, 18, 4, p.wl); }
      // the neck and its scroll
      g.r(93, 14, 14, 70, 5, p.wood); g.c(100, 16, f.scroll ? 14 : 11, p.wl); g.c(100, 16, f.scroll ? 7 : 5, p.wood);
      g.s('M90 22 h-8 M110 22 h8 M90 34 h-8 M110 34 h8', p.wood, 5);
      // the body: two rounded bouts and a waist
      g.push(100, 120, [W, 1]); g.p('M-38 -40 Q-52 -42 -50 -20 Q-48 -4 -36 0 Q-58 6 -58 32 Q-58 60 0 62 Q58 60 58 32 Q58 6 36 0 Q48 -4 50 -20 Q52 -42 38 -40 Q20 -50 0 -50 Q-20 -50 -38 -40 Z', p.m);
      g.p('M0 -50 Q20 -50 38 -40 Q52 -42 50 -20 Q48 -4 36 0 Q58 6 58 32 Q58 60 0 62 Z', p.d);
      g.s('M-20 10 q-6 12 0 26 M20 10 q6 12 0 26', INK, 3.4); g.c(-20, 8, 2.6, INK); g.c(20, 8, 2.6, INK);
      g.r(-14, 30, 28, 8, 3, p.wood); g.pop();
      g.s(f.slap ? 'M94 70 V150 M98 70 V150 M102 70 V150 M106 70 V150' : 'M95 70 V150 M100 70 V150 M105 70 V150', f.slap ? p.gold : p.str, f.slap ? 2 : 1.6);
      g.s('M100 182 V194', '#8a90b0', 5); g.e(78, 184, 13, 7, p.dd); g.e(122, 184, 13, 7, p.dd);
      eyes(g, 84, 116, 92, 0.9); blush(g, 72, 104, 0.8); blush(g, 128, 104, 0.8); smile(g, 100, 102, 7);
      g.pop(); g.pop();
    } };

  // Doo: a little songbook whose pages sing in harmony. The Chorus line is a thick hardcover (ribbon for Cantata, a clasp
  // for Madrigal); the Doowop line opens up and sings from its spread pages (fanned for Gospel, rolled like a scroll for Plainsong).
  SP.doo = { pal: (m) => P(m, { page: '#fffaf0', pd: '#efe2c8', staff: '#c8b8a0', gold: '#ffc928', metal: '#d8dcea', rib: '#ff5a6a' }), hat: [100, 50, 0.7], eyes: [84, 116, 108, 1], chin: [100, 140, 0.6],
    draw: (g, p, f) => {
      g.push(100, 184, f.open ? 1.14 : 1.24); g.push(-100, -184);
      const staves = (x, y, w, n) => { for (let i = 0; i < n; i++) g.s(`M${x} ${y + i * 7} H${x + w}`, p.staff, 1.6); };
      g.e(76, 184, 15, 8, p.dd); g.e(124, 184, 15, 8, p.dd);
      if (f.open) {
        // the open book: two page wings over the cover, the face across the spread
        if (f.fan) for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45; g.push(100, 112, 1, (a * 180) / Math.PI); g.p('M-14 0 Q-16 -64 0 -80 Q16 -64 14 0 Z', i % 2 ? p.page : p.pd); g.pop(); }
        g.p('M20 92 Q60 78 100 96 Q140 78 180 92 L176 168 Q140 156 100 172 Q60 156 24 168 Z', p.d);
        g.p('M28 88 Q64 72 100 92 L100 164 Q64 148 32 160 Z', p.page); g.p('M172 88 Q136 72 100 92 L100 164 Q136 148 168 160 Z', p.pd);
        if (f.scroll) { g.r(16, 80, 18, 90, 9, p.page); g.r(166, 80, 18, 90, 9, p.pd); g.s('M25 86 V164 M175 86 V164', p.staff, 2); }
        staves(40, 100, 44, 3); staves(116, 100, 44, 3);
        g.s('M100 92 V166', p.dd, 3);
        eyes(g, 70, 130, 124, 0.95); blush(g, 56, 138, 0.8); blush(g, 144, 138, 0.8);
        g.e(100, 142, 8, 10, INK); g.e(100, 146, 4.5, 4.5, '#ff6b7a');
      } else {
        // the closed book, standing up: cover, spine and the edge of its pages
        const w = f.thick ? 118 : 100, x0 = 100 - w / 2 - 6, top = f.thick ? 60 : 70;
        g.r(x0 + w - 4, top + 6, f.thick ? 22 : 16, 174 - top - 10, 6, p.page);
        for (let i = 0; i < 6; i++) g.s(`M${x0 + w} ${top + 18 + i * 18} H${x0 + w + (f.thick ? 18 : 12)}`, p.pd, 1.6);
        g.r(x0, top, w, 176 - top, 12, p.m); g.r(x0, top, 18, 176 - top, 10, p.d);
        g.r(x0 + 30, top + 18, w - 46, 30, 8, p.l); staves(x0 + 36, top + 26, w - 58, 3);
        if (f.thick) for (const [cx, cy] of [[x0 + w - 16, top - 2], [x0 + w - 16, 162]]) g.p(`M${cx} ${cy} h18 v18 Z`, p.metal);
        if (f.clasp) { g.r(x0 + w - 10, top + 80, 30, 18, 6, p.gold); g.c(x0 + w + 16, top + 89, 6, p.metal); }
        if (f.ribbon) g.p(`M${x0 + w - 30} 168 v22 l6 -6 l6 6 v-22 Z`, p.rib);
        const cx = x0 + 18 + (w - 18) / 2;
        eyes(g, cx - 16, cx + 16, top + 70, 0.95); blush(g, cx - 30, top + 84, 0.8); blush(g, cx + 30, top + 84, 0.8);
        g.e(cx, top + 92, 8, 10, INK); g.e(cx, top + 96, 4.5, 4.5, '#ff6b7a');
      }
      g.pop(); g.pop();
    } };

  // Huff: a harmonica on little feet. The Busker line grows longer (Delta bends it, Juke doubles it); the Chromatic line has a slide button.
  SP.huff = { pal: (m) => P(m, { metal: '#d8dcea', md: '#a0a8c4', comb: '#2b2140', gold: '#ffc928' }), hat: [100, 92, 0.7], eyes: [84, 116, 126, 0.95], chin: [100, 150, 0.6],
    draw: (g, p, f) => {
      g.push(100, 184, 1.3); g.push(-100, -184);
      const L = f.long ? 146 : 124, x0 = 100 - L / 2;
      const harp = (y, sc) => {
        g.push(100, y, sc); g.push(-100, -y);
        g.r(x0, y - 30, L, 60, 12, p.metal); g.r(100, y - 30, L / 2, 60, 12, p.md); g.r(x0 + 4, y - 26, L - 8, 18, 8, p.m);
        g.r(x0 + 2, y - 4, L - 4, 18, 4, p.comb); for (let i = 0; i < 9; i++) g.r(x0 + 10 + i * ((L - 26) / 8), y, 8, 10, 2, p.l);
        g.r(x0 + 4, y + 16, L - 8, 12, 6, p.d);
        if (f.flare) { g.p(`M${x0} ${y - 30} L${x0 - 12} ${y - 40} L${x0 + L + 12} ${y - 40} L${x0 + L} ${y - 30}Z`, p.m); }
        if (f.slider) { g.r(x0 + L - 4, y - 8, 20, 16, 6, p.gold); g.c(x0 + L + 18, y, 9, p.gold); }
        g.pop(); g.pop();
      };
      if (f.double) harp(100, 0.86);
      g.e(72, 182, 15, 8, p.dd); g.e(128, 182, 15, 8, p.dd); g.s('M72 176 V160 M128 176 V160', p.dd, 7);
      if (f.bent) { g.push(100, 140, 1, -10); g.push(-100, -140); }
      harp(140, 1);
      if (f.bent) { g.pop(); g.pop(); }
      eyes(g, 84, 116, 122, 0.9); blush(g, 70, 132, 0.8); blush(g, 130, 132, 0.8); smile(g, 100, 130, 7);
      g.pop(); g.pop();
    } };

  Object.assign(BASE, { tink: '#ff9ac0', wah: '#d8503a', thrum: '#c8783a', doo: '#7a6ae0', huff: '#4aa8f0' });
  Object.assign(LOOK, {
    carousel: { c: '#ff7ab0', f: { canopy: 1 } }, gavotte: { c: '#ffb0d4', f: { canopy: 1, scallop: 1 }, pal: { gold: '#5ad0e8', gd: '#2fa8c8' } }, reverie: { c: '#a88af0', f: { canopy: 1, tall: 1 }, pal: { gold: '#fff0a0', gd: '#e8d070' } },
    windup: { c: '#e88a5a', f: { armor: 1 } }, toccata: { c: '#c8603a', f: { armor: 1, gears: 1 } }, ostinato: { c: '#8a6ac8', f: { armor: 1, stack: 1 } },
    plunger: { c: '#c8402a', f: { flare: 1, long: 1 } }, ska: { c: '#3a3a4a', f: { flare: 1, long: 1, check: 1 }, pal: { wood: '#ff5a5a', wl: '#ff8a8a' } }, dixie: { c: '#2f8a6a', f: { flare: 1, long: 1, stripes: 1 } },
    upright: { c: '#b05a2a', f: { wide: 1 } }, slap: { c: '#e04a3a', f: { wide: 1, slap: 1 } }, basso: { c: '#6a3a8a', f: { wide: 1, scroll: 1 } },
    arco: { c: '#d8903a', f: { bow: 1 } }, sostenuto: { c: '#3a6ac8', f: { bow: 1, scroll: 1 } }, fugue: { c: '#2f8a7a', f: { bow: 1, slap: 1 } },
    chorus: { c: '#5a7ae8', f: { thick: 1 } }, cantata: { c: '#e8b02a', f: { thick: 1, ribbon: 1 } }, madrigal: { c: '#c83a5a', f: { thick: 1, clasp: 1 } },
    doowop: { c: '#ff6ab0', f: { open: 1 } }, gospel: { c: '#8a3ac8', f: { open: 1, fan: 1 } }, plainsong: { c: '#8a8070', f: { open: 1, scroll: 1 } },
    busker: { c: '#ff8a3a', f: { long: 1 } }, delta: { c: '#3a5ab8', f: { long: 1, bent: 1 } }, juke: { c: '#e83a6a', f: { long: 1, double: 1 } },
    chromatic: { c: '#2fc8b8', f: { slider: 1 } }, mistral: { c: '#a8d8ff', f: { slider: 1, flare: 1 } }, sirocco: { c: '#f0a030', f: { slider: 1, flare: 1, double: 1 } },
    cornet: { c: '#e8704a', f: { bell: 0.8 } }, mariachi: { c: '#a8203a', f: { bell: 1.0 }, pal: { gold: '#ffd84a' } }, mambo: { c: '#ff8a2a', f: { bell: 0.85, twin: 1 } },
  });
  A.buildPets();
})(window.H);
