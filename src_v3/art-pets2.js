/* Hushsong — pets, part two: Hum, Squeak, Blare, Yelp. */
(function (H) {
  'use strict';
  const A = H.Art, R = A.ramp, acc = A.acc, I = A.int, def = A.petDef, GLOW = A.PET_GLOW;
  const OX = 24, OY = 45;
  const cream = R('#f3dfb4'), wood = R('#8a4f2c'), gold = R('#e9b93a'), steel = R('#b9b6cc'), ink = R('#3a3154'), white = R('#fff8ea');

  /* ================= HUM — owlet shaped like an ocarina ================= */
  function owl(g, b, o) {
    const fe = R(o.fe), bel = R(o.belly || '#d8eefa'), s = o.s || 1, w = o.w || 10.5, h = o.h || 11.5; g.at(OX, OY, s);
    const cy = -h - 1.5, fy = cy - h * 0.42;
    if (o.back) o.back(g, b);
    // mouthpiece spout
    if (o.spout !== false) { g.R(-w - 3, cy + 1 + b, 5, 4, fe, 1); g.R(-w - 3, cy + 1 + b, 5, 1, fe, 2); g.px(-w - 3, cy + 2 + b, A.EYE).px(-w - 3, cy + 3 + b, A.EYE); }
    // feet
    const fc = I('#f2a03a'); for (const x of [-5, 3]) { g.px(x, 0, fc).px(x + 1, 0, fc).px(x + 2, 0, fc).px(x + 1, -1, fc); }
    // tufts
    g.P([[-w + 2, fy - 3 + b], [-w + 6, fy - 5 + b], [-w + 1, fy - 9 + b]], fe, 2); g.P([[w - 6, fy - 5 + b], [w - 2, fy - 3 + b], [w - 1, fy - 9 + b]], fe, 3);
    // body
    g.E(0, cy + b, w, h, fe);
    g.E(0.5, cy + 3 + b, w - 3.5, h - 4.5, bel, { hi: false });
    // wings
    g.E(-w + 0.5, cy + 2 + b, 3, 5.5, fe, { sep: 1, hi: false }); g.E(w - 0.5, cy + 2 + b, 3, 5.5, fe, { sep: 1, hi: false });
    // finger holes glowing on the belly
    if (o.holes !== false) for (const [x, y] of [[-3, 1], [3, 1], [-3, 5], [3, 5], [0, 8]]) { g.px(x, cy + y + b, I('#2a3a6a')); g.px(x + 1, cy + y + b, GLOW.breath, 1); }
    // face discs
    g.E(-4, fy + b, 4.6, 4.6, white, { hi: false }); g.E(5, fy + b, 4.6, 4.6, white, { hi: false });
    const k = o.eye || 0; A.eye(g, -5, fy - 2 + b, k, true); A.eye(g, 4, fy - 2 + b, k, true);
    g.px(0, fy + 2 + b, fc).px(1, fy + 2 + b, fc).px(0, fy + 3 + b, I('#c8702a'));
    if (!k) A.blush(g, -9, fy + 3 + b);
    return { fe, cy, fy, w, h };
  }
  const pipe = (g, x, y, h, rp, cap) => { g.C(x, y - h, 3, h, rp); g.R(x, y - h, 3, 1, cap || gold, 3); g.px(x + 1, y - h - 1, A.EYE); };

  def('hum', (g, b) => { owl(g, b, { fe: '#6fb6e8', s: 0.9 }); });
  def('drone', (g, b) => {
    const t = owl(g, b, { fe: '#4f86d8', s: 1.06, w: 11.5, eye: 2, back: (g2, b2) => { pipe(g2, 5, -18 + b2, 17, ink); pipe(g2, 9, -17 + b2, 13, ink); pipe(g2, 13, -15 + b2, 10, ink); } });
    const tart = R('#c8405a'); g.L(-9, t.cy - 6 + b, 8, t.cy + 8 + b, tart[2], 2); g.px(-4, t.cy - 2 + b, tart[4]).px(2, t.cy + 3 + b, tart[4]);
  });
  def('dirge', (g, b) => {
    const t = owl(g, b, { fe: '#7a6fb0', s: 1.08, w: 11.5, eye: 3, belly: '#c8c0e0', back: (g2, b2) => { pipe(g2, 6, -18 + b2, 17, ink, steel); pipe(g2, 10, -17 + b2, 12, ink, steel); g2.E(0, -28 + b2, 12.5, 9.5, ink, {}); g2.P([[-12, -26 + b2], [12, -26 + b2], [14, -3], [-14, -3]], ink, 1); } });
    g.R(-7, t.fy - 7 + b, 16, 2, ink, 2); g.px(-9, t.fy + 4 + b, GLOW.breath, 1).px(10, t.fy + 4 + b, GLOW.breath, 1);
    g.px(-8, t.fy - 5 + b, ink[2]).px(9, t.fy - 5 + b, ink[2]);
  });
  def('chorale', (g, b) => {
    const t = owl(g, b, { fe: '#9fd3f5', s: 1.08, w: 11, eye: 1, back: (g2, b2) => { [[-19, 12], [-16, 16], [-13, 20], [11, 20], [14, 16], [17, 12]].forEach(([x, h]) => pipe(g2, x, -6 + b2, h, steel)); } });
    acc.halo(g, 0, t.fy - 12 + b, 4);
  });
  def('whistle', (g, b) => {
    const t = owl(g, b, { fe: '#6fd0d8', s: 0.98, w: 9, h: 11, spout: false, holes: false, back: (g2, b2) => { g2.L(-6, -6 + b2, -17, 0, steel[2], 3); g2.L(-6, -7 + b2, -17, -1, steel[4], 1); for (const i of [0, 1, 2]) g2.px(-9 - i * 3, -4 + i * 2 + b2, GLOW.breath, 1); } });
    acc.plume(g, 1, t.fy - 6 + b, '#fff2a0', 6);
  });
  def('carol', (g, b) => {
    const t = owl(g, b, { fe: '#5fc8b8', s: 1.04, w: 9.5, h: 11.5, spout: false, holes: false, back: (g2, b2) => { g2.L(-6, -6 + b2, -17, 0, gold[2], 3); g2.L(-6, -7 + b2, -17, -1, gold[4], 1); for (const i of [0, 1, 2]) g2.px(-9 - i * 3, -4 + i * 2 + b2, GLOW.brass, 1); } });
    acc.scarf(g, 0, t.cy - 4 + b, 8, '#d8403a', 6);
    const lf = R('#3f9a4a'); g.P([[-4, t.fy - 6 + b], [0, t.fy - 9 + b], [1, t.fy - 5 + b]], lf, 2); g.P([[1, t.fy - 5 + b], [3, t.fy - 9 + b], [6, t.fy - 6 + b]], lf, 3); g.px(1, t.fy - 6 + b, I('#ff4a4a'), 1);
    g.E(10, t.cy + 6 + b, 2.6, 2.6, gold, { glow: 1 }); g.px(10, t.cy + 9 + b, gold[1]);
  });
  def('lullaby', (g, b) => {
    const t = owl(g, b, { fe: '#9aa8f0', s: 1.04, w: 9.5, h: 11.5, eye: 3, spout: false, holes: false, back: (g2, b2) => { const m = I('#fff2a0'); g2.Q(14, -34 - b2, 22, -28 - b2, 15, -22 - b2, m, 2, true); g2.L(-6, -6 + b2, -17, 0, steel[2], 3); g2.L(-6, -7 + b2, -17, -1, steel[4], 1); } });
    acc.nightcap(g, 0, t.fy - 5 + b, '#6a5acd', b);
    g.px(-14, -30 - b, I('#fff2a0'), 1).px(-10, -37 + b, I('#fff2a0'), 1);
  });

  /* ================= SQUEAK — mouse with a squeezebox middle ================= */
  function mouse(g, b, o) {
    const fur = R(o.fur), s = o.s || 1, bw = o.bw || 8, bh = o.bh || 7; g.at(OX, OY, s);
    const box = R(o.box || '#c8405a'), top = -5 - bh - b * -1; // bellows stretch a pixel on the off-beat
    const hy = top - 7;
    if (o.back) o.back(g, b);
    // tail
    const pk = I('#ff9ab0'); g.Q(-6, -3, -15, -1, -16, -9, pk, 1); g.px(-16, -10, pk);
    // hips and feet
    g.E(0, -3.5, bw - 0.5, 4, fur, { hi: false }); g.px(-5, 0, pk).px(-4, 0, pk).px(4, 0, pk).px(5, 0, pk);
    // bellows
    g.R(-bw, -6, bw * 2 + 1, 1, gold, 2);
    for (let y = -7; y > top; y--) { const i = -7 - y; const inset = i % 2; g.R(-bw + inset, y, bw * 2 + 1 - inset * 2, 1, i % 2 ? cream : box, i % 2 ? 2 : 2); g.px(-bw + inset, y, (i % 2 ? cream : box)[3]); g.px(bw - inset, y, (i % 2 ? cream : box)[0]); }
    g.R(-bw, top, bw * 2 + 1, 1, gold, 3);
    if (o.keys) { for (let y = -7; y > top; y -= 1) g.px(-bw - 1, y, (y & 1) ? I('#fff8ea') : A.EYE); for (let y = -8; y > top; y -= 2) g.px(bw + 1, y, I('#fff8ea'), 1); }
    // ears
    const er = o.ear || 4.6;
    g.E(-7, hy - 6, er, er, fur, {}); g.E(8, hy - 6, er, er, fur, {}); g.E(-7, hy - 6, er - 2, er - 2, R('#ffb0c0'), { hi: false }); g.E(8, hy - 6, er - 2, er - 2, R('#ffb0c0'), { hi: false });
    // head
    g.E(0.5, hy, 8.5, 7, fur, { sep: 1 });
    const k = o.eye || 0; A.eye(g, -3, hy - 2, k, true); A.eye(g, 4, hy - 2, k, true);
    g.px(1, hy + 3, pk).px(2, hy + 3, pk).px(1, hy + 5, I('#fff8ea')).px(2, hy + 5, I('#fff8ea'));
    if (!k) A.blush(g, -6, hy + 3);
    // hands on the bellows
    g.E(-bw - 0.5, top + 3, 2, 2, fur, { hi: false, sep: 1 }); g.E(bw + 1.5, top + 3, 2, 2, fur, { hi: false, sep: 1 });
    return { fur, hy, top, bw };
  }
  const piccolo = (g, x, y, len, up) => { g.L(x, y, x + len, y - (up || 0), steel[2], 2); g.L(x, y - 1, x + len, y - 1 - (up || 0), steel[4], 1); for (let i = 3; i < len; i += 3) g.px(x + i, y - Math.round((up || 0) * i / len), GLOW.breath, 1); };

  def('squeak', (g, b) => { mouse(g, b, { fur: '#9a9cf0', s: 0.9, bw: 7, bh: 6 }); });
  def('wheeze', (g, b) => {
    mouse(g, b, { fur: '#a8a0e8', s: 1.06, bw: 11, bh: 9, box: '#6a5acd', keys: 1, eye: 1 });
  });
  def('polka', (g, b) => {
    const t = mouse(g, b, { fur: '#b8a0e0', s: 1.08, bw: 11, bh: 9, box: '#d8403a', keys: 1 });
    acc.tyrol(g, 0, t.hy - 7, '#3f8a4a', '#e8503a');
    g.L(-6, t.hy + 6, -6, t.top, I('#8a4f2c'), 1); g.L(7, t.hy + 6, 7, t.top, I('#8a4f2c'), 1);
  });
  def('shanty', (g, b) => {
    const t = mouse(g, b, { fur: '#98b0e8', s: 1.08, bw: 11, bh: 9, box: '#3b5fa8', keys: 1, eye: 1 });
    acc.sailor(g, 0, t.hy - 7);
    // anchor charm
    const c = GLOW.breath; g.px(0, -12, c, 1).px(0, -11, c, 1).px(0, -10, c, 1).px(-1, -12, c, 1).px(1, -12, c, 1).px(-2, -10, c, 1).px(2, -10, c, 1).px(-1, -9, c, 1).px(1, -9, c, 1);
  });
  def('trill', (g, b) => {
    const t = mouse(g, b, { fur: '#c59af0', s: 0.98, bw: 6, bh: 4, ear: 4 });
    piccolo(g, 3, t.hy + 5, 13, 2);
  });
  def('scherzo', (g, b) => {
    const t = mouse(g, b, { fur: '#e09ad8', s: 1.04, bw: 6.5, bh: 4, ear: 4, back: (g2, b2) => {} });
    // domino mask and a ruff
    g.R(-5, t.hy - 3, 12, 4, ink, 0); A.eye(g, -3, t.hy - 2, 0, false); A.eye(g, 4, t.hy - 2, 0, false); g.px(-3, t.hy - 2, GLOW.breath, 1).px(4, t.hy - 2, GLOW.breath, 1);
    for (let i = -8; i <= 8; i++) g.px(i, t.top - 1 + (i % 2 ? 1 : 0), i % 2 ? I('#f2c744') : I('#e8405a'));
    piccolo(g, 3, t.hy + 5, 13, 3); acc.jester(g, 0, t.hy - 7, '#6a5acd', '#f2c744');
  });
  def('cadenza', (g, b) => {
    const t = mouse(g, b, { fur: '#a8b8f8', s: 1.06, bw: 6.5, bh: 4, ear: 4, back: (g2, b2) => { acc.cape(g2, 0, -17, 7, 16, '#3a3fa8'); acc.star(g2, 14, -40 + b2, I('#fff2a0')); g2.px(-13, -34 - b2, I('#fff2a0'), 1); } });
    piccolo(g, 4, t.hy + 4, 13, 7); acc.bowtie(g, 1, t.top - 1, '#fff2a0');
  });

  /* ================= BLARE — elephant calf with a trumpet trunk ================= */
  function trunk(g, b, pts, bell, rp, mute) {
    const [x0, y0, cx, cy, x1, y1] = pts; g.Q(x0, y0 + b, cx, cy + b, x1, y1 + b, rp[1], 3); g.Q(x0, y0 - 1 + b, cx, cy - 1 + b, x1, y1 - 1 + b, rp[3], 1);
    const [bx, by, br] = bell; const side = bell[3];
    if (side) { g.P([[bx - 3, by - 1.5 + b], [bx - 3, by + 2.5 + b], [bx + 1, by + br + 1 + b], [bx + 1, by - br + b]], rp, 2); g.E(bx + 1, by + 0.5 + b, 2, br + 0.5, rp, {}); g.E(bx + 1.5, by + 0.5 + b, 1, br - 1, R('#5a3a1a'), { flat: 1 }); g.px(bx + 1, by + b, GLOW.brass, 1).px(bx + 1, by + 1 + b, GLOW.brass, 1); }
    else { g.P([[bx - 1.5, by + 4 + b], [bx + 2.5, by + 4 + b], [bx + br + 1, by + b], [bx - br, by + b]], rp, 2); g.px(bx - 1, by + 3 + b, rp[3]).px(bx - 2, by + 2 + b, rp[3]); g.E(bx + 0.5, by + b, br + 0.5, 2, rp, {}); g.E(bx + 0.5, by + b, br - 1, 1, R('#5a3a1a'), { flat: 1 }); g.px(bx, by + b, GLOW.brass, 1).px(bx + 1, by + b, GLOW.brass, 1); }
    if (mute) { g.E(bx + 0.5, by + b - 1.5, br - 0.5, 2.2, R(mute), {}); g.px(bx, by + b - 4, R(mute)[1]); }
  }
  function ele(g, b, o) {
    const sk = R(o.skin), s = o.s || 1, w = o.w || 10.5; g.at(OX, OY, s);
    const brass = R(o.brass || '#e9b93a'); const hx = 3, hy = -20;
    if (o.back) o.back(g, b);
    // tail
    g.L(-w, -9 + b, -w - 4, -5, sk[1], 1); g.px(-w - 4, -4, sk[0]).px(-w - 5, -4, sk[0]);
    // far ear
    g.E(hx - 9, hy - 1 + b, 6, 7.5, sk, {}); g.E(hx - 9.5, hy - 0.5 + b, 3.6, 5, R('#f2a0a0'), { hi: false });
    // legs
    for (const x of [-8, -3, 3, 7]) { g.C(x, -6, 4, 6, sk); g.px(x + 1, -1, cream[3]).px(x + 2, -1, cream[3]); }
    // body
    g.E(-1, -10 + b, w, 8, sk);
    if (o.mid) o.mid(g, b);
    // head
    g.E(hx, hy + b, 9, 8, sk, { sep: 1 });
    // valves on the brow
    for (const i of [0, 1, 2]) { g.px(hx - 3 + i * 3, hy - 9 + b, brass[4], 1); g.px(hx - 3 + i * 3, hy - 8 + b, steel[2]); }
    // trunk
    trunk(g, b, o.trunk || [hx + 7, hy + 2, 19, -12, 18, -25], o.bell || [18.5, -27, 4.2], brass, o.mute);
    if (o.tusk) { g.px(hx + 5, hy + 6 + b, cream[3]).px(hx + 6, hy + 7 + b, cream[4]).px(hx + 7, hy + 8 + b, cream[4]); }
    const k = o.eye || 0; A.eye(g, hx - 1, hy - 2 + b, k, true);
    if (!k) A.blush(g, hx - 3, hy + 3 + b);
    return { sk, hx, hy, brass };
  }
  def('blare', (g, b) => { ele(g, b, { skin: '#e0aa4a', s: 0.9 }); });
  def('bellow', (g, b) => {
    ele(g, b, { skin: '#d98f3a', s: 1.06, w: 12, eye: 2, tusk: 1, brass: '#f2c744', back: (g2, b2) => { const br = R('#f2c744'); g2.E(-6, -31 + b2, 9.5, 8, br, {}); g2.E(-5.5, -31 + b2, 7, 5.6, R('#5a3a1a'), { flat: 1 }); g2.E(-5.5, -31 + b2, 4, 3, R('#3a2412'), { flat: 1 }); g2.px(-6, -31 + b2, GLOW.brass, 1).px(-5, -31 + b2, GLOW.brass, 1); g2.C(-9, -24 + b2, 5, 10, br); } });
  });
  def('fanfare', (g, b) => {
    const t = ele(g, b, { skin: '#e8983a', s: 1.08, w: 11.5, tusk: 1, trunk: [10, -18, 14, -19, 18, -19], bell: [20, -20, 3.6, 1] });
    // herald's banner hanging from the horn
    const red = R('#d8403a'); g.R(11, -18 + b, 9, 10, red, 2); g.R(11, -18 + b, 9, 1, gold, 3); for (let i = 0; i < 9; i += 2) g.px(11 + i, -8 + b, gold[3]); A.note(g, 14, -16 + b, I('#fff2a0'), true);
    acc.plume(g, 2, t.hy - 8 + b, '#d8403a', 7);
  });
  def('anthem', (g, b) => {
    const t = ele(g, b, { skin: '#e8c878', s: 1.08, w: 11.5, back: (g2, b2) => { g2.L(-9, -6, -9, -38 + b2, wood[1], 1); const bl = R('#3f6fc0'); g2.P([[-8, -38 + b2], [0, -35 + b2], [-8, -31 + b2]], bl, 2); g2.px(-6, -35 + b2, I('#fff2a0'), 1); },
      mid: (g2, b2) => { const bl = R('#3f6fc0'); g2.L(-9, -15 + b2, 6, -4 + b2, bl[2], 2); g2.L(-9, -16 + b2, 6, -5 + b2, bl[3], 1); acc.star(g2, -1, -9 + b2, I('#fff2a0')); } });
    const lf = I('#5fb86a'); for (const [x, y] of [[-3, -8], [-1, -9], [1, -9], [3, -9], [5, -8], [7, -7]]) g.px(t.hx + x - 2, t.hy + y + b, lf);
  });
  def('toot', (g, b) => {
    ele(g, b, { skin: '#f0d060', s: 0.98, w: 9.5, trunk: [10, -18, 17, -16, 15, -27], bell: [15, -29, 3.6] });
  });
  def('swing', (g, b) => {
    const t = ele(g, b, { skin: '#d8c05a', s: 1.04, w: 10, eye: 1, trunk: [10, -18, 18, -15, 16, -26], bell: [16, -28, 3.8], mute: '#b8503a',
      mid: (g2, b2) => acc.bowtie(g2, 6, -12 + b2, '#6a5acd') });
    acc.fedora(g, t.hx, t.hy - 7 + b, '#5a4a9a', '#f2c744');
  });
  def('reveille', (g, b) => {
    const t = ele(g, b, { skin: '#f0a840', s: 1.04, w: 10, trunk: [10, -18, 17, -17, 21, -26], bell: [22, -28, 3.6],
      back: (g2, b2) => { const c = I('#ffd86a'); for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.15 + i * 0.14); g2.L(-2 + Math.cos(a) * 15, -22 + Math.sin(a) * 15, -2 + Math.cos(a) * 19, -22 + Math.sin(a) * 19, c, 1, true); } } });
    acc.cap(g, t.hx, t.hy - 7 + b, '#d8403a', 1); g.px(t.hx, t.hy - 9 + b, gold[4], 1);
    g.L(14, -17 + b, 12, -11 + b, I('#d8403a'), 1); g.px(12, -10 + b, I('#d8403a')).px(11, -9 + b, I('#d8403a'));
  });

  /* ================= YELP — frog in a bow tie ================= */
  function frog(g, b, o) {
    const sk = R(o.skin), sac = R(o.sac || '#ffd6e6'), s = o.s || 1, w = o.w || 10; g.at(OX, OY, s);
    const hy = -17;
    if (o.back) o.back(g, b);
    // folded legs and toes
    g.E(-8.5, -4, 4.5, 4, sk, {}); g.E(8.5, -4, 4.5, 4, sk, {});
    for (const d of [-1, 1]) { g.R(d > 0 ? 8 : -13, -1, 6, 1, sk, 1); g.px(d * 13, 0, sk[1]).px(d * 10, 0, sk[1]); }
    // body
    g.E(0, -8 + b, w - 1, 7.5, sk);
    // eye bumps
    g.E(-5.5, hy - 6 + b, 4, 4, sk, {}); g.E(5.5, hy - 6 + b, 4, 4, sk, {});
    // head
    g.E(0, hy + b, w, 6.5, sk, { sep: 1 });
    // throat sac: swells on the off-beat
    const sr = (o.sacR || 4.6) + (b ? 1 : 0);
    g.E(0.5, -6.5 + b, sr + 0.6, sr - 0.4, sac, { glow: 1 });
    // mouth
    const mo = o.mouth == null ? 1 : o.mouth;
    if (mo === 2) { g.E(0.5, hy + 1.5 + b, 6, 3.4, R('#5a1a3a'), { flat: 1 }); g.E(0.5, hy + 3 + b, 3, 1.4, R('#ff6a8a'), { flat: 2 }); }
    else if (mo === 1) { g.E(0.5, hy + 1.5 + b, 3.6, 2.2, R('#5a1a3a'), { flat: 1 }); g.px(0, hy + 2 + b, I('#ff6a8a')).px(1, hy + 2 + b, I('#ff6a8a')); }
    else { g.L(-4, hy + 2 + b, 5, hy + 2 + b, A.EYE, 1); g.px(-5, hy + 1 + b, A.EYE).px(6, hy + 1 + b, A.EYE); }
    const k = o.eye || 0;
    if (k === 1 || k === 3) { A.eye(g, -7, hy - 7 + b, k, true); A.eye(g, 5, hy - 7 + b, k, true); }
    else { g.E(-5.5, hy - 6.5 + b, 2.8, 2.8, white, { hi: false }); g.E(6, hy - 6.5 + b, 2.8, 2.8, white, { hi: false }); A.eye(g, -6, hy - 8 + b, k, false); A.eye(g, 6, hy - 8 + b, k, false); }
    if (!k) { A.blush(g, -9, hy + 1 + b); A.blush(g, 9, hy + 1 + b); }
    // arms
    if (o.arms !== false) { g.L(-6, -6 + b, -6, -1, sk[1], 2); g.L(7, -6 + b, 7, -1, sk[1], 2); }
    if (o.tie !== false) acc.bowtie(g, 0, hy + 6 + b, o.tie || '#4fd0c0');
    return { sk, hy, w };
  }
  const rings = (g, x, y, n, col) => { for (let i = 0; i < n; i++) { const r = 3 + i * 3; g.Q(x + i * 3, y - r, x + i * 3 + r * 0.7, y, x + i * 3, y + r, col, 1, true); } };

  def('yelp', (g, b) => { frog(g, b, { skin: '#f27aa8', s: 0.9 }); });
  def('croon', (g, b) => {
    const t = frog(g, b, { skin: '#e08ac0', s: 1.02, eye: 3, mouth: 0, back: (g2, b2) => {} });
    // pompadour and a microphone
    g.E(1, t.hy - 9 + b, 5.5, 3.2, ink, {}); g.px(4, t.hy - 12 + b, ink[2]).px(5, t.hy - 11 + b, ink[3]);
    acc.mic(g, 12, -16 + b); g.L(8, -7 + b, 12, -9 + b, t.sk[1], 2);
  });
  def('serenade', (g, b) => {
    const t = frog(g, b, { skin: '#c890e0', s: 1.06, eye: 1, mouth: 0, sac: '#f0d6ff', back: (g2, b2) => acc.cape(g2, 0, -16 + b2, 8, 15, '#6a3a9a') });
    g.E(1, t.hy - 9 + b, 5.5, 3.2, ink, {}); g.px(4, t.hy - 12 + b, ink[2]);
    g.L(8, -7 + b, 13, -12 + b, t.sk[1], 2); g.L(13, -12 + b, 13, -17 + b, I('#4fae6a'), 1); acc.rose(g, 13, -19 + b);
    const hc = GLOW.voice; g.px(-14, -30 - b, hc, 1).px(-12, -30 - b, hc, 1).px(-15, -29 - b, hc, 1).px(-14, -29 - b, hc, 1).px(-13, -29 - b, hc, 1).px(-12, -29 - b, hc, 1).px(-11, -29 - b, hc, 1).px(-14, -28 - b, hc, 1).px(-13, -28 - b, hc, 1).px(-12, -28 - b, hc, 1).px(-13, -27 - b, hc, 1);
  });
  def('hymn', (g, b) => {
    const t = frog(g, b, { skin: '#f28a9a', s: 1.06, eye: 1, arms: false, tie: false });
    // choir robe, stole and an open songbook
    g.P([[-8, -12 + b], [9, -12 + b], [12, -1], [-11, -1]], white, 2); g.P([[-8, -12 + b], [-4, -12 + b], [-8, -1], [-11, -1]], white, 1);
    g.L(-3, -12 + b, -5, -2, gold[2], 2); g.L(4, -12 + b, 6, -2, gold[2], 2);
    g.R(-5, -9 + b, 11, 5, R('#6a3a2a'), 2); g.R(-4, -9 + b, 4, 4, white, 3); g.R(1, -9 + b, 4, 4, white, 2); g.px(-3, -7 + b, A.EYE).px(2, -7 + b, A.EYE).px(3, -8 + b, A.EYE);
    A.note(g, -17, -33 - b, GLOW.voice, true); A.note(g, 13, -37 + b, GLOW.brass, true);
  });
  def('shout', (g, b) => {
    const t = frog(g, b, { skin: '#f0506a', s: 1.02, eye: 2, mouth: 2, back: (g2, b2) => { const sp = R('#ffb23a'); for (const [x, h] of [[-3, 5], [0, 7], [3, 5]]) g2.P([[x - 2, -28 + b2], [x + 2, -28 + b2], [x, -28 - h + b2]], sp, 2, true); } });
    rings(g, 14, -15 + b, 2, GLOW.voice);
  });
  def('chant', (g, b) => {
    const t = frog(g, b, { skin: '#f06a3a', s: 1.06, eye: 2, mouth: 2, sac: '#ffe0c0', arms: false, back: (g2, b2) => { const sp = R('#ffd24a'); for (const [x, h] of [[-4, 5], [-1, 8], [2, 8], [5, 5]]) g2.P([[x - 2, -28 + b2], [x + 2, -28 + b2], [x, -28 - h + b2]], sp, 2, true); } });
    acc.bandana(g, 0, t.hy - 4 + b, 9, '#3a3154');
    g.L(8, -8 + b, 14, -20 + b, t.sk[1], 2); g.E(14.5, -22 + b, 2.6, 2.6, t.sk, {}); g.L(-7, -6 + b, -7, -1, t.sk[1], 2);
    rings(g, -16, -15 + b, 1, GLOW.voice); rings(g, 17, -12 + b, 2, GLOW.voice);
  });
  def('aria', (g, b) => {
    const t = frog(g, b, { skin: '#d870d0', s: 1.08, mouth: 2, sac: '#ffe0f8', tie: false, back: (g2, b2) => { const br = R('#f2c744'); g2.Q(-9, -20 + b2, -14, -14 + b2, -12, -6, br[2], 2); g2.Q(10, -20 + b2, 15, -14 + b2, 13, -6, br[1], 2); } });
    acc.valkyrie(g, 0, t.hy - 9 + b);
    g.E(-4, -3 + b, 3, 2.2, gold, {}); g.E(5, -3 + b, 3, 2.2, gold, {});
    acc.star(g, 15, -36 - b, I('#fff2a0')); g.px(-15, -32 + b, I('#fff2a0'), 1);
  });
})(window.H);
