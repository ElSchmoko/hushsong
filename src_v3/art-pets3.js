/* Hushsong — pets, part three: Clang the bell turtle and Howl the wolf pup. */
(function (H) {
  'use strict';
  const A = H.Art, R = A.ramp, acc = A.acc, I = A.int, def = A.petDef, GLOW = A.PET_GLOW;
  const OX = 24, OY = 45;
  const cream = R('#f3dfb4'), wood = R('#8a4f2c'), gold = R('#e9b93a'), steel = R('#b9b6cc'), ink = R('#3a3154'), white = R('#fff8ea');

  /* ================= CLANG — turtle with a bell on its back ================= */
  function turtle(g, b, o) {
    const sk = R(o.skin || '#7fc46a'), bell = R(o.bell), s = o.s || 1; g.at(OX, OY, s);
    if (o.back) o.back(g, b);
    // tail and far legs
    g.px(-15, -4, sk[1]).px(-16, -3, sk[1]);
    g.E(-6, -2, 3.2, 3, sk, { hi: false, flat: 1 }); g.E(5, -2, 3.2, 3, sk, { hi: false, flat: 1 });
    // neck and head
    g.E(10, -9 + b, 5, 3.5, sk, { hi: false }); g.E(14.5, -13 + b, 6, 5.5, sk, {});
    // the bell
    if (o.gong) { g.E(-1, -14 + b, 13.5, 11, bell, {}); g.E(-1, -14 + b, 9, 7, bell, { flat: 1 }); g.E(-1, -14 + b, 7.6, 5.8, bell, {}); g.E(-1, -14 + b, 3, 2.6, R('#fff2b0'), { glow: 1 }); }
    else {
      g.E(-1, -13 + b, 13, 11, bell, {});
      g.R(-11, -17 + b, 21, 1, bell, 1);
      if (o.crown !== false) { g.E(-1, -25.5 + b, 2.6, 2.4, bell, { hi: false }); g.px(-1, -26 + b, A.EYE); }
    }
    // belly and near legs cover the bottom of the dome
    g.R(-15, -7 + b, 29, 3, bell, 1); g.R(-15, -7 + b, 29, 1, bell, 3); g.px(-16, -6 + b, bell[1]).px(14, -6 + b, bell[1]);
    g.E(-1, -3, 11.5, 3, R(A.tint(o.skin || '#7fc46a', 12, 0.7, 1.25)), { hi: false });
    g.E(-9, -1.6, 3.6, 2.8, sk, { hi: false }); g.E(8, -1.6, 3.6, 2.8, sk, { hi: false });
    // clapper peeking out
    g.px(-1, -4 + b, gold[1]).px(0, -4 + b, gold[1]).px(-1, -3 + b, gold[3]).px(0, -3 + b, gold[0]);
    // face
    const k = o.eye || 0; A.eye(g, 15, -15 + b, k, true); g.px(17, -10 + b, A.EYE).px(18, -11 + b, A.EYE); if (!k) A.blush(g, 12, -10 + b);
    if (o.front) o.front(g, b);
    return { sk, bell };
  }
  const ring = (g, x, y, col) => { g.px(x - 2, y, col, 1).px(x + 2, y, col, 1).px(x - 3, y - 2, col, 1).px(x + 3, y - 2, col, 1); };
  const smallBell = (g, x, y, hex, r) => { const bl = R(hex); g.E(x, y, r, r, bl, {}); g.R(x - r - 0.5, y + r - 1, r * 2 + 2, 1, bl, 1); g.px(x, y + r, A.EYE); };

  def('clang', (g, b) => { turtle(g, b, { bell: '#e0a93a', s: 0.9 }); });
  def('toll', (g, b) => {
    turtle(g, b, { bell: '#b9783a', s: 1.08, eye: 2, skin: '#6fb05a', crown: false, front: (g2, b2) => { g2.R(-10, -27 + b2, 19, 3, wood, 2); g2.R(-10, -27 + b2, 19, 1, wood, 3); g2.R(-2, -24 + b2, 3, 2, wood, 1); g2.px(-9, -26 + b2, steel[4]).px(7, -26 + b2, steel[4]); } });
  });
  def('knell', (g, b) => {
    turtle(g, b, { bell: '#5a5670', s: 1.1, eye: 3, skin: '#8aa890', front: (g2, b2) => { const rb = R('#7a3a9a'); g2.P([[-1, -26 + b2], [-7, -30 + b2], [-6, -24 + b2]], rb, 2); g2.P([[-1, -26 + b2], [5, -30 + b2], [4, -24 + b2]], rb, 1); g2.L(-3, -22 + b2, -5, -9 + b2, GLOW.voice, 1, true); g2.px(-6, -8 + b2, GLOW.voice, 1); } });
  });
  def('peal', (g, b) => {
    turtle(g, b, { bell: '#f2c744', s: 1.08, back: (g2, b2) => { smallBell(g2, -14, -24 + b2, '#f2c744', 3.4); smallBell(g2, 8, -29 - b2, '#ffd86a', 3); },
      front: (g2, b2) => { ring(g2, -1, -30 + b2, GLOW.brass); A.note(g2, 17, -32 - b2, I('#fff2a0')); } });
  });
  def('jingle', (g, b) => {
    turtle(g, b, { bell: '#c8503a', s: 1.0, skin: '#8fd07a', crown: false, front: (g2, b2) => { g2.Q(-13, -12 + b2, -1, -26 + b2, 11, -12 + b2, cream[2], 2); for (const [x, y] of [[-9, -17], [-1, -22], [7, -17]]) { g2.E(x, y + b2, 2.8, 2.8, gold, { glow: 1 }); g2.px(x, y + 1 + b2, A.EYE); } } });
  });
  def('carillon', (g, b) => {
    turtle(g, b, { bell: '#e9c95a', s: 1.08, eye: 1, skin: '#8fd07a', crown: false, front: (g2, b2) => { g2.R(-13, -29 + b2, 25, 2, wood, 2); g2.R(-13, -29 + b2, 2, 8, wood, 1); g2.R(10, -29 + b2, 2, 8, wood, 1); [[-8, 3.2], [-2, 2.8], [3, 2.4], [7, 2]].forEach(([x, r]) => smallBell(g2, x, -24 + b2, '#ffd86a', r)); acc.star(g2, 17, -33 - b2, I('#fff2a0')); } });
  });
  def('gamelan', (g, b) => {
    turtle(g, b, { bell: '#d9a012', s: 1.08, gong: 1, skin: '#7fc46a', back: (g2, b2) => { const rd = R('#c8302a'); g2.C(-17, -30 + b2, 3, 24, rd); g2.C(13, -30 + b2, 3, 24, rd); g2.R(-18, -31 + b2, 35, 3, rd, 2); g2.R(-18, -31 + b2, 35, 1, gold, 3); g2.P([[-20, -31 + b2], [-17, -31 + b2], [-19, -35 + b2]], gold, 2); g2.P([[14, -31 + b2], [17, -31 + b2], [18, -35 + b2]], gold, 2); } });
  });

  /* ================= HOWL — wolf pup that sings at the moon ================= */
  function wolf(g, b, o) {
    const fur = R(o.fur), ch = R(o.chest || '#fff0e0'), s = o.s || 1; g.at(OX, OY, s);
    const up = o.snout !== 'fwd';
    if (o.back) o.back(g, b);
    // tail
    g.E(-12, -7, 5.5, 4, fur, {}); g.E(-15, -9, 2.6, 2.4, ch, { hi: false });
    // haunch and body
    g.E(-5, -5, 7, 5.2, fur, { hi: false });
    g.E(0, -12 + b, 7.5, 9, fur, {});
    g.E(3, -11 + b, 4, 6, ch, { hi: false });
    // front legs
    g.C(-1, -7, 3, 7, fur); g.C(4, -7, 3, 7, fur); g.px(-1, 0, ch[1]).px(0, 0, ch[2]).px(1, 0, ch[2]).px(4, 0, ch[1]).px(5, 0, ch[2]).px(6, 0, ch[2]);
    if (o.mid) o.mid(g, b);
    // ears
    const hy = up ? -23 : -21;
    g.P([[-4, hy - 3 + b], [1, hy - 5 + b], [-3, hy - 11 + b]], fur, 2); g.P([[3, hy - 5 + b], [8, hy - 4 + b], [7, hy - 11 + b]], fur, 3); g.px(-2, hy - 7 + b, I('#ffb0c0')).px(6, hy - 7 + b, I('#ffb0c0'));
    // head and snout
    g.E(3, hy + b, 7.5, 6.5, fur, { sep: 1 });
    if (up) { g.P([[6, hy - 4 + b], [14, hy - 10 + b], [16, hy - 7 + b], [10, hy + 2 + b]], fur, 3); g.P([[9, hy - 1 + b], [15, hy - 7 + b], [16, hy - 6 + b], [11, hy + 2 + b]], ch, 2); g.px(15, hy - 10 + b, A.EYE).px(16, hy - 9 + b, A.EYE); g.px(12, hy - 1 + b, I('#5a1a3a')).px(13, hy - 2 + b, I('#5a1a3a')).px(12, hy - 2 + b, I('#ff6a8a')); }
    else { g.E(10, hy + 2 + b, 5, 3.4, fur, { sep: 1 }); g.E(11, hy + 3.5 + b, 3.6, 1.8, ch, { hi: false }); g.px(14, hy + b, A.EYE).px(15, hy + 1 + b, A.EYE); g.L(8, hy + 4 + b, 13, hy + 4 + b, A.EYE, 1); if (o.teeth) g.px(9, hy + 5 + b, A.WHITE).px(11, hy + 5 + b, A.WHITE); }
    const k = o.eye == null ? 1 : o.eye; A.eye(g, 2, hy - 2 + b, k, true); if (k < 2) A.blush(g, 0, hy + 3 + b);
    if (o.front) o.front(g, b);
    return { fur, hy };
  }
  const arcs = (g, x, y, col) => { g.Q(x, y - 3, x + 3, y, x, y + 3, col, 1, true); g.Q(x + 4, y - 5, x + 8, y, x + 4, y + 5, col, 1, true); };

  def('howl', (g, b) => { wolf(g, b, { fur: '#c08ad8', s: 0.9, front: (g2, b2) => A.note(g2, 17, -40 - b2, GLOW.voice) }); });
  def('growl', (g, b) => {
    wolf(g, b, { fur: '#8a5aa8', s: 1.04, snout: 'fwd', eye: 2, teeth: 1, front: (g2, b2) => { g2.R(-3, -16 + b2, 12, 2, ink, 1); for (let i = -2; i <= 8; i += 3) g2.px(i, -16 + b2, steel[4]); arcs(g2, 14, -18 + b2, GLOW.voice); } });
  });
  def('blues', (g, b) => {
    const t = wolf(g, b, { fur: '#6a8ad8', s: 1.08, snout: 'fwd', eye: 3, chest: '#e8f0ff', front: (g2, b2) => { g2.R(9, -19 + b2, 8, 3, steel, 2); g2.R(9, -19 + b2, 8, 1, steel, 4); for (let i = 10; i < 17; i += 2) g2.px(i, -17 + b2, A.EYE); A.note(g2, 18, -29 - b2, GLOW.breath); } });
    acc.fedora(g, 3, t.hy - 6 + b, '#2e3a7a', '#f2c744');
  });
  def('grunge', (g, b) => {
    wolf(g, b, { fur: '#c07a8a', s: 1.08, snout: 'fwd', eye: 2, teeth: 1, back: (g2, b2) => { const sp = R('#5a3a4a'); for (const [x, h] of [[-2, 6], [1, 9], [4, 7], [7, 5]]) g2.P([[x - 2, -27 + b2], [x + 2, -27 + b2], [x - 1, -27 - h + b2]], sp, 2); },
      front: (g2, b2) => { const rd = R('#c8302a'); g2.R(-4, -17 + b2, 13, 3, rd, 2); for (let i = -4; i < 9; i += 2) g2.px(i, -16 + b2, A.EYE); g2.R(6, -14 + b2, 3, 6, rd, 1); g2.px(7, -11 + b2, A.EYE); arcs(g2, 14, -18 + b2, I('#ffb066')); } });
  });
  def('bay', (g, b) => {
    wolf(g, b, { fur: '#d890b8', s: 1.04, eye: 0, front: (g2, b2) => { const bl = R('#3f6fc0'); g2.R(-3, -17 + b2, 12, 2, bl, 2); g2.E(3, -13 + b2, 2.2, 2.2, gold, { glow: 1 }); A.note(g2, 18, -42 - b2, GLOW.voice); } });
  });
  def('round', (g, b) => {
    wolf(g, b, { fur: '#e0a0c8', s: 1.08, eye: 1, front: (g2, b2) => { for (let i = -5; i <= 10; i++) g2.px(i, -17 + b2 + (i % 2 ? 1 : 0), A.WHITE).px(i, -16 + b2 + (i % 2 ? 1 : 0), white[1]); const c = GLOW.voice; g2.Q(-19, -30, -15, -36, -11, -30, c, 1, true); g2.Q(-19, -30, -15, -24, -11, -30, c, 1, true); g2.Q(15, -44, 19, -49, 23, -44, c, 1, true); g2.Q(15, -44, 19, -39, 23, -44, c, 1, true); } });
  });
  def('requiem', (g, b) => {
    wolf(g, b, { fur: '#8a80b0', s: 1.08, eye: 3, chest: '#e8e2f0', back: (g2, b2) => acc.cape(g2, -2, -19 + b2, 7, 18, '#2e2a5a'),
      front: (g2, b2) => { g2.R(-13, -14, 2, 9, white, 2); g2.px(-13, -16 - b2, I('#ffd86a'), 1).px(-12, -17 - b2, I('#fff2a0'), 1).px(-13, -15, I('#ff9a3a'), 1); g2.R(-3, -17 + b2, 12, 2, ink, 1); } });
  });
})(window.H);
