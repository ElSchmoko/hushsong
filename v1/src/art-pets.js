/* Hushsong — pets, part one: Thud, Clack, Twang, Screech. 48x48, feet at the bottom, facing right. */
(function (H) {
  'use strict';
  const A = H.Art, R = A.ramp, acc = A.acc, I = A.int;
  const SZ = 48, OX = 24, OY = 45;
  const GLOW = (A.PET_GLOW = { drum: I('#ffb066'), string: I('#a8f5b8'), breath: I('#a8e6ff'), brass: I('#ffe58a'), voice: I('#ffa6cc') });
  const cream = R('#f3dfb4'), wood = R('#8a4f2c'), gold = R('#e9b93a'), steel = R('#b9b6cc'), ink = R('#3a3154'), ebony = R('#4a3040');
  A.petDef = (key, fn) => A.def(key, SZ, SZ, (g, f) => { g.at(OX, OY, 1); fn(g, f ? 1 : 0); });
  const def = A.petDef;
  const zig = (g, x, y, n, col, glow) => { for (let i = 0; i < n; i++) g.px(x + i, y + (i % 2 ? -1 : 0), col, glow); };
  A.zig = zig;

  /* ================= THUD — bear cub with a drum belly ================= */
  function thudBody(g, b, o) {
    const fur = R(o.fur), s = o.s || 1, w = o.w || 11, hgt = o.h || 10.5, hy = -(hgt * 2 + 2);
    g.at(OX, OY, s);
    if (o.back) o.back(g, b);
    g.E(-6.5, hy - 5.5 + b, 3, 3, fur).E(6.5, hy - 5.5 + b, 3, 3, fur);
    g.px(-6.5, hy - 5.5 + b, cream[1]).px(6.5, hy - 5.5 + b, cream[1]);
    const fw = o.feet || 4;
    g.E(-5.5, -1.6, fw, 2.6, fur, { hi: false }).E(o.kick ? 8 : 5.5, o.kick ? -4 : -1.6, fw, 2.6, fur, { hi: false });
    g.E(0, -hgt - 1 + b, w, hgt, fur);
    g.E(0.5, hy + 0.5 + b, 9, 7.5, fur, { sep: 1 });
    g.E(2.5, hy + 3 + b, 4, 2.8, cream, { hi: false });
    g.px(3, hy + 2 + b, A.EYE).px(4, hy + 2 + b, A.EYE).px(3, hy + 4 + b, wood[0]);
    A.eye(g, -3, hy - 1 + b, o.eye || 0, true); A.eye(g, 5, hy - 1 + b, o.eye || 0, true);
    if (!o.eye) A.blush(g, -5, hy + 3 + b);
    return { fur, hy, s, w, hgt };
  }
  function drumHead(g, x, y, r, mark) {
    g.E(x, y, r + 1.3, r + 1.3, wood, { flat: 1 }); g.E(x, y, r, r, cream, {});
    if (mark !== false) { const c = I('#e06a1e'); const n = Math.max(3, Math.floor(r * 1.3)); for (let i = 0; i < n; i++) g.px(Math.round(x - n / 2 + i + 0.5), Math.round(y + (i % 4 === 1 ? -1 : i % 4 === 3 ? 1 : 0)), c, 1); }
  }
  const arms = (g, b, fur, w, y, up) => { g.E(-w, y + b - (up ? 4 : 0), 3, 4, fur, { sep: 1, hi: false }).E(w, y + b - (up ? 4 : 0), 3, 4, fur, { sep: 1, hi: false }); };
  const flames = (g, b, y, list, hex) => { const fl = R(hex); for (const [x, h] of list) g.P([[x - 2, y + b], [x + 2.5, y + b], [x, y - h + b]], fl, Math.abs(x) % 2 ? 3 : 2, true); };

  def('thud', (g, b) => {
    const t = thudBody(g, b, { fur: '#c47c46', s: 0.92, back: (g2, b2) => acc.stick(g2, -8, -8 + b2, -15, -16 + b2) });
    arms(g, b, t.fur, 10.5, -11); drumHead(g, 1, -10 + b, 6);
  });
  def('stomp', (g, b) => {
    const t = thudBody(g, b, { fur: '#b5653a', s: 1.08, w: 12.5, feet: 5.5, eye: 2 });
    drumHead(g, 1, -11 + b, 7.5); arms(g, b, t.fur, 12, -12);
    for (const [x, y] of [[-7, -16], [-8, -9], [9, -16], [10, -9], [1, -20], [1, -2]]) g.px(x, y + b, gold[3]);
    // a bass-drum mallet over the shoulder
    g.L(12, -10 + b, 15, -27 + b, wood[1], 1); g.E(15.5, -29 + b, 3, 3, cream, {});
  });
  def('march', (g, b) => {
    const t = thudBody(g, b, { fur: '#b08462', s: 1.1, w: 12, feet: 5, back: (g2, b2) => { g2.L(13, -4 + b2, 13, -30 + b2, gold[2], 1); g2.E(13, -31 + b2, 2, 2, gold, { glow: 1 }); } });
    arms(g, b, t.fur, 11.5, -12); drumHead(g, 1, -11 + b, 7);
    const blue = R('#3f6fc0'); g.L(-9, -19 + b, 9, -4 + b, blue[2], 2); g.L(-9, -20 + b, 9, -5 + b, blue[3], 1);
    acc.shako(g, 0, t.hy - 6 + b, '#3f6fc0', '#f4efe2');
    g.R(-12, -19 + b, 4, 2, gold, 2).R(9, -19 + b, 4, 2, gold, 2);
  });
  def('cadence', (g, b) => {
    const t = thudBody(g, b, { fur: '#d0602f', s: 1.1, w: 12.5, feet: 5.5, eye: 2, back: (g2, b2) => flames(g2, b2, -29, [[-7, 6], [-3, 9], [1, 10], [5, 8], [8, 5]], '#ffb23a') });
    drumHead(g, 1, -11 + b, 7.5);
    arms(g, b, t.fur, 12.5, -13, true); acc.stick(g, -13, -20 + b, -17, -31 + b); acc.stick(g, 13, -20 + b, 17, -31 + b);
    for (const [x, y] of [[-7, -16], [9, -16], [1, -20], [1, -2]]) g.px(x, y + b, gold[4], 1);
  });
  def('patter', (g, b) => {
    const t = thudBody(g, b, { fur: '#d9a05e', s: 0.98, w: 9.5 });
    // twin bongos on a strap
    for (const x of [-5, 5]) { g.C(x - 4, -10 + b, 8, 7, wood); g.E(x, -10 + b, 4.4, 2.4, cream, { hi: false }); g.px(x - 1, -10 + b, I('#e06a1e'), 1).px(x + 1, -10 + b, I('#e06a1e'), 1); }
    g.R(-1, -8 + b, 2, 2, gold, 2);
    arms(g, b, t.fur, 10, -14); acc.scarf(g, 0, -17 + b, 6, '#3fa59a', -7);
  });
  def('jig', (g, b) => {
    const t = thudBody(g, b, { fur: '#cfa468', s: 1.02, w: 9.5, kick: 1, back: (g2, b2) => { const sc = R('#3fa26a'); g2.Q(-4, -18 + b2, -12, -20 + b2, -17, -14 - b2, sc[2], 2); g2.px(-17, -14 - b2, sc[3]); } });
    drumHead(g, -8, -9 + b, 5);
    arms(g, b, t.fur, 9.5, -13); acc.stick(g, 9, -12 + b, 3, -7 + b);
    acc.scarf(g, 0, -17 + b, 6, '#3fa26a'); acc.beret(g, 1, t.hy - 6 + b, '#3fa26a');
  });
  def('roll', (g, b) => {
    const t = thudBody(g, b, { fur: '#e08a3a', s: 1.04, w: 10, eye: 2, back: (g2, b2) => flames(g2, b2, -29, [[-3, 6], [1, 8], [5, 6]], '#ffd24a') });
    const red = R('#d8453a'); g.C(-7, -12 + b, 15, 8, red); g.E(0.5, -12 + b, 7.5, 2.4, cream, { hi: false }); g.R(-7, -5 + b, 15, 1, gold, 2);
    for (let i = 0; i < 7; i++) g.px(-6 + i * 2, -8 + b + (i % 2), gold[4], 1);
    arms(g, b, t.fur, 10.5, -14);
    acc.stick(g, -10, -15 + b, -3, -12 + b); acc.stick(g, 11, -15 + b, 4, -12 + b);
    g.px(-5, -15 + b, GLOW.drum, 1).px(-1, -16 + b, GLOW.drum, 1).px(3, -16 + b, GLOW.drum, 1).px(7, -15 + b, GLOW.drum, 1);
    acc.bandana(g, 0, t.hy - 4 + b, 8, '#d8453a');
  });

  /* ================= CLACK — crab with castanet claws ================= */
  // claw kinds: 'cast' (castanet), 'sharp', 'maraca'
  function claw(g, x, y, kind, hex, open, flip) {
    const r = R(hex), d = flip ? -1 : 1;
    if (kind === 'maraca') { g.L(x, y + 5, x, y + 1, wood[2], 2); g.E(x + 0.5, y - 2, 4.2, 4.6, r, {}); g.px(x - 1, y - 3, r[4], 1).px(x + 2, y - 1, r[0]).px(x, y, r[0]).px(x + 1, y - 4, r[0]); return; }
    const rx = kind === 'sharp' ? 5.5 : 5, ry = 3;
    // two shell halves with a glowing gap between them
    g.E(x, y - open, rx, ry, r, {}); g.E(x, y + 2 + open, rx - 0.6, ry - 0.5, r, { hi: false });
    for (let i = -3; i <= 3; i++) g.px(x + i, y + 1, GLOW.drum, 1);
    g.px(x - d * 5, y + 1, I('#d8453a')).px(x - d * 4, y + 1, I('#d8453a'));
    if (kind === 'sharp') { g.px(x + d * 6, y - open, r[3]).px(x + d * 7, y - open - 1, r[4]).px(x + d * 6, y + 2 + open, r[2]); }
  }
  function crab(g, b, o) {
    const sh = R(o.shell), s = o.s || 1, w = o.w || 12; g.at(OX, OY, s);
    if (o.back) o.back(g, b);
    // legs
    for (const d of [-1, 1]) for (let i = 0; i < 3; i++) { const x = d * (w - 5 + i * 3); g.L(x, -5 + b, x + d * 2, -1, sh[1], 2); g.px(x + d * 2, 0, sh[0]); }
    // arms to claws
    const lc = o.lc || [-15, -15], rc = o.rc || [15, -21];
    g.L(-w + 2, -10 + b, lc[0] + 2, lc[1] + 4 + b, sh[1], 2); g.L(w - 2, -10 + b, rc[0] - 2, rc[1] + 4 + b, sh[1], 2);
    // eye stalks
    g.L(-4, -15 + b, -5, -21 + b, sh[1], 2); g.L(5, -15 + b, 6, -21 + b, sh[1], 2);
    // shell
    g.E(0, -9 + b, w, 7.5, sh, {});
    g.E(0.5, -6 + b, w - 4, 3.2, R(o.belly || '#f6c9a4'), { hi: false });
    g.px(-1, -8 + b, A.EYE).px(0, -7 + b, A.EYE).px(1, -7 + b, A.EYE).px(2, -8 + b, A.EYE);
    if (o.spots !== false) g.px(-7, -13 + b, sh[1]).px(7, -13 + b, sh[1]).px(-4, -15 + b, sh[3]);
    // eyes on stalks
    for (const x of [-5.5, 6]) { g.E(x, -23 + b, 3, 3, R('#fff8ea'), { hi: false }); const ex = Math.round(x); if (o.eye === 1) { g.px(ex - 1, -23 + b, A.EYE).px(ex, -24 + b, A.EYE).px(ex + 1, -23 + b, A.EYE); } else { g.px(ex, -24 + b, A.EYE).px(ex + 1, -24 + b, A.EYE).px(ex, -23 + b, A.EYE).px(ex + 1, -23 + b, A.EYE); if (o.eye === 2) { g.px(ex - 1, -26 + b, A.EYE).px(ex, -26 + b, A.EYE).px(ex + 1, -25 + b, A.EYE); } } }
    A.blush(g, -8, -8 + b);
    claw(g, lc[0], lc[1] + b, o.claw || 'cast', o.cl || '#4a3040', b ? 0 : 1, true);
    claw(g, rc[0], rc[1] + b, o.claw || 'cast', o.cl || '#4a3040', b ? 1 : 0, false);
    return sh;
  }
  const ruffle = (g, x, y, w, cols, b) => { cols.forEach((c, j) => { const r = R(c); for (let i = -w - j; i <= w + j; i++) { const yy = y + j * 2 + ((i + j) % 3 === 0 ? 1 : 0); g.px(x + i, yy + b, r[(i + j) % 2 ? 2 : 3]); g.px(x + i, yy + 1 + b, r[1]); } }); };

  def('clack', (g, b) => { crab(g, b, { shell: '#e2604a', s: 0.9 }); });
  def('click', (g, b) => {
    crab(g, b, { shell: '#cf4862', w: 10.5, claw: 'sharp', cl: '#3a2a44', rc: [15, -24], lc: [-15, -13] });
    acc.bowtie(g, 0, -13 + b, '#2a2238');
  });
  def('flamenco', (g, b) => {
    crab(g, b, { shell: '#e8483a', w: 11, claw: 'sharp', cl: '#3a2030', rc: [15, -26], lc: [-15, -25], eye: 2,
      back: (g2, b2) => ruffle(g2, 0, -6, 11, ['#ff8a3a', '#e8304a', '#ffb23a'], b2) });
    ruffle(g, 0, -5, 9, ['#e8304a', '#ffb23a'], b);
    acc.rose(g, -1, -17 + b);
  });
  def('tango', (g, b) => {
    crab(g, b, { shell: '#9a3a5e', w: 10.5, claw: 'sharp', cl: '#2a2238', rc: [17, -14], lc: [-14, -20], belly: '#e9c0c8', eye: 1 });
    acc.rose(g, 4, -6 + b);
    g.R(-7, -27 + b, 15, 1, ink, 1); g.R(-5, -30 + b, 11, 3, ink, 2); g.R(-5, -28 + b, 11, 1, R('#e8405a'), 2); g.px(-4, -30 + b, ink[3]);
  });
  def('rattle', (g, b) => {
    crab(g, b, { shell: '#ee7a3a', w: 12, claw: 'maraca', cl: '#f2c744', rc: [15, -23], lc: [-15, -17] });
    for (let i = -6; i <= 6; i += 3) g.px(i, -3 + b + (Math.abs(i) > 3 ? -1 : 0), [I('#6cc8f0'), I('#f2c744'), I('#74d68e')][Math.abs(i / 3) % 3], 1);
  });
  def('rumba', (g, b) => {
    crab(g, b, { shell: '#b8508a', w: 11.5, claw: 'maraca', cl: '#3fb8b0', rc: [15, -21], lc: [-15, -19], belly: '#f0c8d8', eye: 1,
      back: (g2, b2) => { ruffle(g2, -13, -14, 3, ['#3fb8b0', '#6ad8d0', '#3fb8b0'], b2); ruffle(g2, 13, -16, 3, ['#3fb8b0', '#6ad8d0', '#3fb8b0'], b2); } });
    g.px(-3, -3 + b, GLOW.drum, 1).px(0, -2 + b, GLOW.drum, 1).px(3, -3 + b, GLOW.drum, 1);
  });
  def('samba', (g, b) => {
    crab(g, b, { shell: '#f08a2a', w: 12, claw: 'maraca', cl: '#e8405a', rc: [16, -22], lc: [-16, -22], eye: 2,
      back: (g2, b2) => acc.headdress(g2, 0, -22 + b2, ['#e8405a', '#f2c744', '#74d68e', '#6cc8f0', '#f2c744', '#e8405a']) });
    g.R(-8, -3 + b, 17, 1, gold, 3); for (let i = -6; i <= 6; i += 4) g.px(i, -3 + b, I('#fff2b0'), 1);
  });

  /* ================= TWANG — cat strung like a lute ================= */
  function cat(g, b, o) {
    const fur = R(o.fur), s = o.s || 1, w = o.w || 8.5; g.at(OX, OY, s);
    const hy = -22;
    if (o.back) o.back(g, b);
    // tail: the neck of an instrument
    if (o.tail !== false) {
      const tw = R(o.neck || '#8a4f2c');
      g.Q(-7, -4, -17, -5, -15, -20 + b, tw[1], 3); g.Q(-7, -5, -16, -6, -14, -20 + b, tw[2], 1);
      g.R(-17, -26 + b, 4, 6, tw, 2); g.px(-18, -25 + b, gold[3]).px(-18, -22 + b, gold[3]).px(-13, -24 + b, gold[3]);
      g.Q(-7, -6, -15, -7, -15, -20 + b, GLOW.string, 1, true);
    }
    // haunches + paws
    g.E(-5, -3, 4.5, 3.5, fur, { hi: false });
    g.E(0.5, -10 + b, w, 9.5, fur);
    g.E(-3, -1.6, 3, 2, fur, { hi: false, sep: 1 }).E(4.5, -1.6, 3, 2, fur, { hi: false, sep: 1 });
    // ears
    const inn = I('#ffb0b8');
    g.P([[-8, hy - 3 + b], [-2, hy - 5 + b], [-7, hy - 12 + b]], fur, 2); g.P([[3, hy - 5 + b], [9.5, hy - 3 + b], [8.5, hy - 12 + b]], fur, 3);
    g.px(-6, hy - 7 + b, inn).px(-6, hy - 8 + b, inn).px(7, hy - 7 + b, inn).px(7, hy - 8 + b, inn);
    // head
    g.E(1, hy + b, 9.5, 7.5, fur, { sep: 1 });
    // sound hole and strings on the chest
    if (o.hole !== false) { g.E(1, -9 + b, 3.4, 3.4, gold, { flat: 1 }); g.E(1, -9 + b, 2.4, 2.4, ink, { flat: 0 }); for (const x of [0, 2]) g.L(x, -14 + b, x, -4 + b, I('#c8ffd8'), 1); g.px(1, -9 + b, GLOW.string, 1); }
    // face
    const k = o.eye || 0; A.eye(g, -3, hy - 2 + b, k, true); A.eye(g, 5, hy - 2 + b, k, true);
    g.px(3, hy + 2 + b, inn).px(2, hy + 3 + b, A.EYE).px(4, hy + 3 + b, A.EYE);
    if (!k) A.blush(g, -6, hy + 2 + b);
    // wire whiskers
    const wc = I('#e8f4ff'); g.L(-9, hy + 1 + b, -12, hy + b, wc, 1); g.L(-9, hy + 3 + b, -12, hy + 4 + b, wc, 1); g.L(11, hy + 1 + b, 13, hy + b, wc, 1); g.L(11, hy + 3 + b, 13, hy + 4 + b, wc, 1);
    return { fur, hy };
  }
  const lyre = (g, x, y, b, big) => { const h = big ? 13 : 10; g.Q(x - 4, y + b, x - 7, y - h / 2 + b, x - 4, y - h + b, gold[2], 2); g.Q(x + 4, y + b, x + 7, y - h / 2 + b, x + 4, y - h + b, gold[1], 2); g.R(x - 4, y - h + b, 9, 1, gold, 3); g.R(x - 3, y + b, 7, 2, gold, 1); for (const i of [-2, 0, 2]) g.L(x + i, y - h + 1 + b, x + i, y - 1 + b, GLOW.string, 1, true); };
  const bolt = (g, x, y, col) => { g.L(x, y, x - 2, y + 4, col, 1, true); g.L(x - 2, y + 4, x + 1, y + 4, col, 1, true); g.L(x + 1, y + 4, x - 1, y + 9, col, 1, true); };

  def('twang', (g, b) => { cat(g, b, { fur: '#5fc49a', s: 0.9 }); });
  def('pluck', (g, b) => {
    const t = cat(g, b, { fur: '#8fd05a', s: 1.0, w: 8, neck: '#a85a2c' });
    acc.bandana(g, 1, t.hy - 6 + b, 8, '#e8503a'); g.P([[9, -9 + b], [12, -8 + b], [10, -5 + b]], gold, 3, true);
  });
  def('riff', (g, b) => {
    const t = cat(g, b, { fur: '#3fb8b0', s: 1.06, w: 8.5, neck: '#2a2238', back: (g2, b2) => bolt(g2, -20, -18 + b2, I('#fff2a0')) });
    // shades and a collar
    g.R(-5, t.hy - 2 + b, 13, 3, ink, 0); g.px(-4, t.hy - 2 + b, I('#9aa0d8')).px(4, t.hy - 2 + b, I('#9aa0d8')); g.px(1, t.hy - 2 + b, t.fur[2]).px(1, t.hy + b, t.fur[2]);
    g.P([[-7, -16 + b], [-1, -15 + b], [-6, -11 + b]], ink, 1); g.P([[9, -16 + b], [3, -15 + b], [8, -11 + b]], ink, 2);
  });
  def('shred', (g, b) => {
    const t = cat(g, b, { fur: '#b6d93c', s: 1.06, w: 8.5, eye: 2, neck: '#c8302a', back: (g2, b2) => { flames(g2, b2, -27, [[-1, 9], [2, 11], [5, 8]], '#ff5a3a'); g2.P([[-22, -30 + b2], [-17, -24 + b2], [-12, -31 + b2], [-15, -22 + b2], [-19, -22 + b2]], R('#c8302a'), 2); } });
    bolt(g, 14, -14 + b, I('#fff2a0')); g.R(-6, -15 + b, 15, 2, ink, 1); for (let i = -5; i <= 7; i += 3) g.px(i, -15 + b, steel[4]);
  });
  def('strum', (g, b) => {
    const t = cat(g, b, { fur: '#8fe0c0', s: 1.0, w: 9.5, eye: 1, tail: false, back: (g2, b2) => lyre(g2, -12, -8, b2) });
    g.E(1, -15 + b, 6, 2.5, R('#f4fff6'), { hi: false });
  });
  def('ballad', (g, b) => {
    const t = cat(g, b, { fur: '#9fd8d8', s: 1.06, w: 9.5, eye: 1, tail: false, back: (g2, b2) => lyre(g2, -13, -8, b2, true) });
    acc.scarf(g, 1, -15 + b, 7, '#a890e0', 5); A.note(g, 13, -36 - b, GLOW.string, true);
  });
  def('waltz', (g, b) => {
    const t = cat(g, b, { fur: '#b8e89a', s: 1.06, w: 9, tail: false, back: (g2, b2) => { lyre(g2, -12, -8, b2); g2.P([[-4, -6], [-9, 0], [-5, 0]], ink, 1); g2.P([[5, -6], [10, 0], [6, 0]], ink, 2); } });
    acc.bowtie(g, 1, -14 + b, '#e8405a');
    g.R(-3, t.hy - 13 + b, 9, 6, ink, 1); g.R(-5, t.hy - 7 + b, 13, 1, ink, 0); g.R(-3, t.hy - 9 + b, 9, 1, R('#e8405a'), 2); g.px(-2, t.hy - 13 + b, ink[3]);
  });

  /* ================= SCREECH — cricket with a fiddle ================= */
  function cricket(g, b, o) {
    const sk = R(o.skin), s = o.s || 1; g.at(OX, OY, s);
    const hy = -21;
    if (o.back) o.back(g, b);
    // wings shaped like a violin body
    if (o.wings !== false) { const wr = R(o.wing || '#9a5a2c'); g.E(-5, -9 + b, 6, 5.5, wr, {}); g.E(-4, -17 + b, 5, 4.5, wr, {}); g.px(-7, -10 + b, wr[0]).px(-7, -9 + b, wr[0]).px(-6, -11 + b, wr[0]); }
    // jumping legs
    for (const d of [-1, 1]) { g.L(d * 4, -5, d * 11, -13, sk[1], 3); g.L(d * 11, -13, d * 10, -1, sk[1], 2); g.R(d > 0 ? 9 : -12, -1, 4, 1, sk, 0); g.px(d * 11, -13, sk[3]); }
    // abdomen
    g.E(0.5, -8 + b, 6.2, 7.5, sk, {});
    for (const y of [-5, -8, -11]) g.L(-4, y + b, 5, y + b, sk[1], 1);
    // antennae
    const an = o.ant || 0, ac = sk[0];
    if (an === 0) { g.Q(-2, hy - 5 + b, -5, hy - 14 + b, -11, hy - 13, ac, 1); g.Q(3, hy - 5 + b, 2, hy - 15 + b, -3, hy - 17, ac, 1); g.px(-11, hy - 13, GLOW.string, 1).px(-3, hy - 17, GLOW.string, 1); }
    else if (an === 1) { g.Q(-2, hy - 5 + b, -9, hy - 9 + b, -12, hy - 1, ac, 1); g.Q(3, hy - 5 + b, 11, hy - 9 + b, 13, hy - 1, ac, 1); }
    else { let x = -2, y = hy - 5 + b; for (let i = 0; i < 5; i++) { g.L(x, y, x - 2 + (i % 2) * 3, y - 2, ac, 1); x += -2 + (i % 2) * 3; y -= 2; } g.px(x, y, GLOW.string, 1); x = 3; y = hy - 5 + b; for (let i = 0; i < 5; i++) { g.L(x, y, x + 2 - (i % 2) * 3, y - 2, ac, 1); x += 2 - (i % 2) * 3; y -= 2; } g.px(x, y, GLOW.string, 1); }
    // head
    g.E(1, hy + b, 7.5, 6.5, sk, { sep: 1 });
    const k = o.eye || 0; A.eye(g, -3, hy - 2 + b, k, true); A.eye(g, 4, hy - 2 + b, k, true);
    g.px(1, hy + 4 + b, A.EYE).px(2, hy + 4 + b, A.EYE); if (!k) A.blush(g, -5, hy + 3 + b);
    // fiddle tucked under the chin, bow across it
    if (o.fiddle !== false) {
      const fr = R(o.fid || '#b8642c'); g.E(8, -12 + b, 3.6, 2.8, fr, {}); g.E(11.5, -14.5 + b, 2.6, 2.2, fr, { hi: false }); g.L(13, -16 + b, 17, -20 + b, ebony[1], 1); g.px(18, -21 + b, gold[3]);
      g.L(9, -12 + b, 16, -19 + b, GLOW.string, 1, true);
      const bw = o.bow || I('#f4efe2'); g.L(4, -7 + b - b, 18, -15 - b, bw, 1, o.bowGlow); g.L(3, -8 + b, 5, -6 + b, sk[1], 2);
    }
    return { sk, hy };
  }
  def('screech', (g, b) => { cricket(g, b, { skin: '#a8cf4a', s: 0.9 }); });
  def('saw', (g, b) => {
    cricket(g, b, { skin: '#cfc23a', s: 1.02, eye: 2, fid: '#8a2c2c', bow: I('#ff8a4a'), bowGlow: true });
    for (let i = 0; i < 6; i++) g.px(6 + i * 2, -9 - i - b, I('#ffd24a'), 1);
  });
  def('reel', (g, b) => {
    const t = cricket(g, b, { skin: '#8fd04a', s: 1.06, wing: '#b8642c', back: (g2, b2) => { g2.Q(-18, -10, -22, -22, -12, -30 + b2, GLOW.string, 1, true); g2.Q(18, -6, 23, -18, 15, -28 + b2, GLOW.string, 1, true); } });
    acc.cap(g, 1, t.hy - 5 + b, '#3f8a4a', 1); g.L(-2, t.hy - 8 + b, -6, t.hy - 13 + b, I('#e8503a'), 1); acc.scarf(g, 1, -15 + b, 5, '#e8b03a', -5);
  });
  def('lament', (g, b) => {
    const t = cricket(g, b, { skin: '#7fa0c9', s: 1.06, ant: 1, eye: 3, wing: '#3a3154', fid: '#5a4a7a', back: (g2, b2) => { g2.P([[-8, -24 + b2], [10, -24 + b2], [13, -6], [-12, -6]], ink, 1); g2.E(1, -23 + b2, 10, 9, ink, {}); } });
    g.R(-6, t.hy - 7 + b, 14, 2, ink, 2); g.px(-7, t.hy - 5 + b, ink[2]).px(8, t.hy - 5 + b, ink[2]); g.px(6, t.hy + 3 + b, GLOW.breath, 1).px(6, t.hy + 5 + b, GLOW.breath, 1);
  });
  def('quaver', (g, b) => {
    cricket(g, b, { skin: '#5fc7a8', s: 1.0, ant: 2, wings: false, back: (g2, b2) => { const wr = R('#c8f0e0'); g2.E(-11, -15 + b2, 7, 4, wr, { hi: false }); g2.E(12, -15 + b2, 7, 4, wr, { hi: false }); g2.px(-13, -15 + b2, GLOW.string, 1).px(14, -15 + b2, GLOW.string, 1); } });
  });
  def('nocturne', (g, b) => {
    const t = cricket(g, b, { skin: '#6a6fd0', s: 1.06, ant: 1, eye: 3, wings: false, fid: '#3a3154', back: (g2, b2) => { const wr = R('#2e2a5a'); g2.E(-11, -15 + b2, 8.5, 6.5, wr, {}); g2.E(12, -15 + b2, 8.5, 6.5, wr, {}); g2.E(-9, -6 + b2, 5, 4, wr, { hi: false }); g2.E(10, -6 + b2, 5, 4, wr, { hi: false }); acc.star(g2, -12, -15 + b2, I('#fff2a0')); g2.px(13, -17 + b2, I('#fff2a0'), 1).px(12, -16 + b2, I('#fff2a0'), 1).px(12, -15 + b2, I('#fff2a0'), 1).px(13, -14 + b2, I('#fff2a0'), 1); } });
  });
  def('caprice', (g, b) => {
    const t = cricket(g, b, { skin: '#d8d04a', s: 1.06, ant: 2, wings: false, fid: '#c8302a', back: (g2, b2) => { for (const d of [-1, 1]) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g2.P([[d * (7 + i * 4), -19 + j * 4 + b2], [d * (9 + i * 4), -21 + j * 4 + b2], [d * (11 + i * 4), -19 + j * 4 + b2], [d * (9 + i * 4), -17 + j * 4 + b2]], R((i + j) % 2 ? '#e8405a' : '#f2c744'), 2); } });
    acc.jester(g, 1, t.hy - 5 + b, '#e8405a', '#6a5acd');
  });
})(window.H);
