/* Hushsong Roads (preview) — map pieces in the sticker-ink style: the places of Reed Marsh, buildings, the wagon, a torn page. */
(function (H) {
  'use strict';
  const A = H.Art, INK = A.INK, D = (key, size, fn) => A.def(key, { size }, fn);
  const roof = (g, x, y, w, h, col) => g.o(`M${x - 6} ${y} L${x + w / 2} ${y - h} L${x + w + 6} ${y} Z`, col, 6);
  const win = (g, x, y, lit) => g.o(`M${x} ${y} h14 v12 h-14 z`, lit ? '#ffe9a8' : '#5a5270', 4);

  // Hushwick: a cottage and The Tin Cup, with a tin mug on its sign
  D('rd_hush', 52, (g) => {
    g.o('M6 184 V122 H70 V184 Z', '#f6d48a', 6); roof(g, 6, 124, 64, 42, '#e8b04a'); g.o('M28 184 V154 H48 V184', '#7a4a6a', 5); win(g, 14, 134, 1);
    g.o('M82 186 V104 H192 V186 Z', '#f2a65a', 6); roof(g, 82, 106, 110, 56, '#c4644a'); g.o('M120 186 V146 Q137 132 154 146 V186 Z', '#7a3e2a', 5);
    win(g, 92, 120, 1); win(g, 166, 120, 1);
    g.s('M168 96 V58', INK, 6); g.s('M168 66 H194', INK, 6); g.o('M174 72 h16 v22 q0 8 -8 8 q-8 0 -8 -8 z', '#c9d2e0', 5);
  });
  // Old Mill: a wooden mill with a big wheel in the water
  D('rd_mill', 52, (g) => {
    g.o('M40 186 V96 H150 V186 Z', '#d89a62', 6); roof(g, 40, 98, 110, 50, '#9a5a40'); g.o('M80 186 V150 H108 V186', '#5a3a2a', 5); win(g, 56, 116, 1); win(g, 118, 116, 0);
    g.oc(160, 150, 34, '#a8724a', 6); g.oc(160, 150, 12, '#7a5236', 5);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; g.s(`M${160 + Math.cos(a) * 12} ${150 + Math.sin(a) * 12} L${160 + Math.cos(a) * 34} ${150 + Math.sin(a) * 34}`, INK, 5); }
    g.o('M110 192 Q156 176 198 192 Z', '#5ccfe0', 5);
  });
  // Frogmore: round reed huts on a pond, lily pads around
  D('rd_frog', 50, (g) => {
    g.o('M4 178 Q100 150 204 178 Q206 196 100 198 Q2 196 4 178 Z', '#5ccfe0', 6);
    for (const [x, w, c] of [[30, 64, '#e8c47a'], [108, 78, '#f2d28a']]) { g.o(`M${x} 176 V128 Q${x + w / 2} 96 ${x + w} 128 V176 Z`, c, 6); g.o(`M${x - 6} 132 Q${x + w / 2} 60 ${x + w + 6} 132 Q${x + w / 2} 112 ${x - 6} 132 Z`, '#9ab84a', 6); g.o(`M${x + w / 2 - 10} 176 V152 Q${x + w / 2} 142 ${x + w / 2 + 10} 152 V176`, '#5a3a2a', 4); }
    g.e(178, 178, 18, 7, '#5cc472'); g.e(16, 186, 12, 5, '#5cc472'); g.c(182, 170, 5, '#ff8fb8');
  });
  // Lantern Hill: a stone tower with a big lantern on top
  D('rd_lantern', 52, (g) => {
    g.o('M10 194 Q100 120 196 194 Z', '#b6d66a', 6);
    g.o('M78 172 V82 H128 V172 Z', '#c4beb0', 6); g.s('M78 112 H128 M78 142 H128', INK, 4); g.o('M94 172 V148 Q103 138 112 148 V172', '#5a3a2a', 4);
    g.o('M70 84 H136 V72 H70 Z', '#8a8476', 5); g.o('M84 72 V40 H122 V72 Z', '#ffe9a8', 6); g.s('M96 40 V72 M110 40 V72', INK, 3); g.o('M78 42 L103 16 L128 42 Z', '#c4644a', 6);
    g.c(103, 56, 8, '#ffc928');
  });
  // Reedwick: stilt huts and a reed organ hall
  D('rd_reed', 54, (g) => {
    g.r(14, 112, 8, 52, 3, '#8a5a3a').r(52, 112, 8, 52, 3, '#8a5a3a');
    g.o('M8 116 h60 v-34 h-60 z', '#f6d48a', 6).o('M0 88 L38 52 L76 88 Z', '#e8b04a', 6);
    g.o('M84 186 V110 H196 V186 Z', '#a8d878', 6);
    for (const [x, h] of [[98, 50], [118, 74], [138, 92], [158, 74], [178, 50]]) g.o(`M${x - 8} 112 V${112 - h} Q${x} ${102 - h} ${x + 8} ${112 - h} V112 Z`, '#8fc85a', 5);
    g.o('M118 186 V150 Q140 130 162 150 V186 Z', '#5a3a2a', 5); g.s('M84 128 H196', INK, 4);
  });
  // The Lily Pad: a great pink flower stage on a lily pad
  D('rd_lily', 64, (g) => {
    g.o('M2 170 Q100 136 198 170 Q200 196 100 198 Q0 196 2 170 Z', '#5cc472', 6); g.s('M100 150 L106 190', INK, 4);
    g.o('M40 166 Q100 150 160 166 V176 Q100 166 40 176 Z', '#ffcfe0', 5);
    for (const [cx, rot] of [[60, -0.5], [140, 0.5], [100, 0]]) g.push(cx, 150, 1, rot * 30).o('M0 0 Q-26 -50 0 -96 Q26 -50 0 0 Z', '#ff8fb8', 6).pop();
    g.push(100, 152, 1, 0).o('M0 0 Q-16 -40 0 -76 Q16 -40 0 0 Z', '#ffb4d2', 5).pop();
    g.c(100, 134, 10, '#ffc928');
  });
  // Drowned Chapel: a stone chapel half sunk in water, its bell still in the tower
  D('rd_chapel', 54, (g) => {
    g.o('M40 182 V104 H150 V182 Z', '#a8b0c8', 6); g.o('M30 106 L95 56 L160 106 Z', '#7a8098', 6);
    g.o('M130 108 V40 H168 V108 Z', '#a8b0c8', 6); g.o('M124 42 L149 8 L174 42 Z', '#7a8098', 6); g.o('M140 82 V62 Q149 52 158 62 V82 Z', '#2b2140', 4); g.c(149, 72, 6, '#ffc928');
    g.o('M78 182 V140 Q95 118 112 140 V182 Z', '#2b2140', 5); g.o('M54 124 Q62 112 70 124 V140 H54 Z', '#8fd4ff', 4);
    g.o('M0 168 Q100 150 200 168 V196 H0 Z', '#5ccfe0', 6); g.s('M24 178 h24 M120 182 h30', '#ffffff', 4);
  });
  // A quiet glade: a ring of flowers around a stump, with a glint
  D('rd_glade', 40, (g) => {
    g.o('M30 170 Q100 140 170 170 Q170 190 100 192 Q30 190 30 170 Z', '#8ed46a', 6);
    g.o('M84 168 V140 H116 V168 Z', '#a8724a', 5); g.e(100, 140, 16, 6, '#e8c47a');
    for (const [x, y, c] of [[48, 170, '#ff6aa0'], [70, 158, '#ffc928'], [130, 158, '#b48cff'], [152, 170, '#ffffff'], [100, 184, '#ff6aa0']]) g.oc(x, y, 8, c, 4);
    g.o('M100 70 l8 22 l22 8 l-22 8 l-8 22 l-8 -22 l-22 -8 l22 -8 z', '#ffc928', 4);
  });
  // buildings next to a captured place
  D('rd_windmill', 30, (g) => {
    g.o('M70 190 L84 90 H116 L130 190 Z', '#f6e3b4', 6); g.o('M84 92 L100 70 L116 92 Z', '#c4644a', 5);
    for (let i = 0; i < 4; i++) g.push(100, 84, 1, i * 90 + 20).o('M-6 0 L-10 -70 H10 L6 0 Z', '#ffffff', 5).pop();
    g.oc(100, 84, 7, '#8a5a3a', 4);
  });
  D('rd_bandstand', 30, (g) => {
    g.o('M30 180 H170 V164 H30 Z', '#c4644a', 6); for (const x of [44, 100, 156]) g.r(x - 4, 96, 8, 70, 2, '#f6e3b4');
    g.o('M20 100 Q100 40 180 100 Z', '#ff6b5e', 6); g.s('M44 100 V166 M100 100 V166 M156 100 V166', INK, 3); g.c(100, 56, 6, '#ffc928');
  });
  D('rd_herbs', 26, (g) => {
    g.o('M30 186 H170 V150 H30 Z', '#a8724a', 6);
    for (const [x, c] of [[56, '#5cc472'], [100, '#8ed46a'], [144, '#5cc472']]) { g.o(`M${x} 150 Q${x - 22} 110 ${x} 90 Q${x + 22} 110 ${x} 150 Z`, c, 5); g.c(x, 104, 6, x === 100 ? '#ff6aa0' : '#ffc928'); }
  });
  // the band's wagon
  D('rd_wagon', 40, (g) => {
    g.o('M24 150 V118 H176 V150 Z', '#c47a3c', 6);
    g.o('M30 120 Q30 40 100 40 Q170 40 170 120 Z', '#fff6dc', 6);
    for (const x of [62, 100, 138]) g.s(`M${x} 44 Q${x + (x - 100) * 0.2} 80 ${x} 120`, '#ff6b5e', 9);
    g.s('M176 136 L206 150', INK, 6);
    for (const x of [58, 142]) { g.oc(x, 160, 24, '#8a5a3a', 6); g.c(x, 160, 7, INK); }
    g.o('M84 40 v-14 h32 v14 z', '#ff9234', 5);
  });
  // a torn page of a song, with a glint
  D('rd_page', 28, (g) => {
    g.o('M40 40 L160 30 L170 150 L120 162 L130 140 L96 168 L50 170 Z', '#fff6dc', 6);
    for (const y of [70, 88, 106, 124]) g.s(`M56 ${y + 4} L156 ${y - 4}`, '#b8b0cc', 4);
    g.c(84, 92, 9, INK).s('M92 92 V58', INK, 5).c(124, 84, 9, INK).s('M132 84 V52', INK, 5).s('M92 58 L132 50', INK, 7);
    g.o('M168 16 l7 18 l18 7 l-18 7 l-7 18 l-7 -18 l-18 -7 l18 -7 z', '#ffc928', 4);
  });
  // where the quest points: a gold marker
  D('rd_mark', 22, (g) => {
    g.o('M100 190 Q40 110 40 80 A60 60 0 1 1 160 80 Q160 110 100 190 Z', '#ffc928', 7); g.oc(100, 80, 24, '#ffffff', 6);
  });
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
