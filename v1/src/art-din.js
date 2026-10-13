/* Hushsong — the Din (tuneless noise: jagged, cold, scrap-built) and the Mutes (bosses: smooth, pale, quiet). Drawn facing right; battle flips them. */
(function (H) {
  'use strict';
  const A = H.Art, R = A.ramp, I = A.int;
  const tin = R('#8f93b0'), rust = R('#a8603a'), bone = R('#e8e2f0'), dark = R('#3a3154'), sick = R('#b8c070'), EYE = A.EYE, RED = I('#ff5a6a'), W = A.WHITE;
  const din = (key, fn) => A.def(key, 48, 48, (g, f) => { g.at(24, 45, 1); fn(g, f ? 1 : 0); });
  const mute = (key, fn) => A.def(key, 80, 80, (g, f) => { g.at(40, 76, 1); fn(g, f ? 1 : 0); });
  // hollow, unfriendly eye
  const eyeD = (g, x, y, w) => { w = w || 3; for (let j = 0; j < 3; j++) for (let i = 0; i < w; i++) g.px(x + i, y + j, W); g.px(x + w - 2, y + 1, RED, 1); g.px(x, y - 1, EYE).px(x + 1, y - 1, EYE).px(x + w - 1, y, EYE); };
  const jag = (g, x, y, n, d, col) => { for (let i = 0; i < n; i++) { g.L(x + i * 3 * d, y + (i % 2 ? -2 : 1), x + (i + 1) * 3 * d, y + (i % 2 ? 1 : -2), col, 1); } };

  din('racket', (g, b) => {
    // arms: a ladle and a fork
    g.L(-9, -12 + b, -16, -24 - b, tin[1], 2); g.E(-17, -26 - b, 3, 2.6, tin, {});
    g.L(10, -12 + b, 17, -22 + b, tin[1], 2); for (const i of [-1, 1, 3]) g.L(16 + i, -23 + b, 17 + i, -28 + b, tin[3], 1);
    // feet
    g.R(-7, -3, 4, 3, dark, 2).R(4, -3, 4, 3, dark, 2);
    // pot body
    g.C(-10, -18 + b, 21, 16, tin); g.R(-10, -18 + b, 21, 2, tin, 3); g.R(-11, -4 + b, 23, 2, tin, 0);
    g.px(-6, -8 + b, tin[0]).px(-5, -7 + b, tin[0]).px(6, -13 + b, tin[0]).px(7, -12 + b, tin[0]); // dents
    g.R(-13, -13 + b, 3, 2, dark, 2).R(11, -13 + b, 3, 2, dark, 2);
    // lid, askew
    g.P([[-9, -20 + b], [11, -23 + b], [11, -21 + b], [-9, -18 + b]], rust, 2); g.E(2, -24 + b, 2, 1.6, rust, {});
    eyeD(g, -6, -14 + b); eyeD(g, 3, -14 + b);
    for (let i = -4; i <= 5; i++) g.px(i, -7 + b + (i % 2 ? 1 : 0), EYE);
    jag(g, -22, -34, 3, 1, I('#cfd2e8')); jag(g, 13, -36, 3, 1, I('#cfd2e8'));
  });

  din('whine', (g, b) => {
    // thin wings
    g.E(-6, -22 + b, 7, 3, R('#d8dcf0'), { hi: false }); g.E(-5, -16 - b, 6, 2.5, R('#c0c4e0'), { hi: false });
    // dangling legs
    for (const x of [-4, 0, 4]) g.L(x, -9 + b, x - 2, 0, sick[0], 1);
    // body: one stretched wire of a creature
    g.E(0, -15 + b, 5, 8, sick, {}); for (const y of [-11, -14, -17]) g.L(-3, y + b, 3, y + b, sick[1], 1);
    g.E(3, -24 + b, 5, 4.5, sick, { sep: 1 });
    // the needle
    g.L(7, -23 + b, 20, -19 + b, bone[3], 1); g.px(21, -19 + b, W, 1);
    eyeD(g, 2, -26 + b, 4);
    // vibrating wire
    for (let i = 0; i < 9; i++) g.px(-12 + i * 3, -32 + (i % 2 ? 2 : 0) + (b && i % 2 ? -1 : 0), I('#f0f4a0'), 1);
  });

  din('hiss', (g, b) => {
    const pipe = R('#5a9a98');
    // coils
    g.E(-2, -4, 12, 4.5, pipe, {}); g.E(1, -10 + b, 9, 4, pipe, { sep: 1 }); g.E(-1, -15 + b, 6, 3.5, pipe, { sep: 1 });
    for (const x of [-9, -3, 4, 9]) g.px(x, -4, pipe[0]);
    // neck and kettle head
    g.C(-2, -26 + b, 5, 10, pipe); g.E(1, -28 + b, 6.5, 5.5, tin, { sep: 1 });
    g.P([[6, -29 + b], [14, -33 + b], [14, -31 + b], [7, -26 + b]], tin, 1); g.px(15, -33 + b, tin[3]);
    g.E(1, -34 + b, 2.2, 1.6, rust, {});
    eyeD(g, -3, -30 + b); eyeD(g, 2, -30 + b);
    // steam
    const st = R('#e8f4f4'); g.E(18, -37 - b, 3, 2.6, st, { hi: false }); g.E(21, -41 + b, 2.2, 2, st, { hi: false }); g.px(17, -34, st[2]).px(23, -44 - b, st[3]);
    // forked tongue
    g.px(8, -25 + b, RED).px(9, -25 + b, RED).px(10, -26 + b, RED).px(10, -24 + b, RED);
  });

  din('clank', (g, b) => {
    // little legs
    for (const x of [-9, -4, 3, 8]) { g.R(x, -4, 3, 4, dark, 2); g.px(x, 0, dark[0]).px(x + 2, 0, dark[0]); }
    // can body
    g.C(-12, -22 + b, 25, 19, rust); g.R(-12, -22 + b, 25, 2, tin, 3); g.R(-12, -5 + b, 25, 2, tin, 1);
    for (const y of [-17, -9]) g.R(-12, y + b, 25, 1, rust, 0);
    for (const x of [-9, -3, 3, 9]) g.px(x, -20 + b, tin[4]).px(x, -4 + b, tin[2]);
    g.px(5, -13 + b, rust[0]).px(6, -12 + b, rust[0]).px(7, -13 + b, rust[0]).px(-7, -8 + b, rust[3]);
    // bucket helm with an eye slit
    g.C(-8, -32 + b, 17, 11, tin); g.R(-9, -22 + b, 19, 1, tin, 0); g.R(-6, -28 + b, 13, 3, dark, 0);
    g.px(-4, -27 + b, RED, 1).px(3, -27 + b, RED, 1);
    g.Q(-8, -31 + b, 0, -40 + b, 9, -31 + b, tin[1], 1);
    // arms: bent nails
    g.L(-12, -14 + b, -18, -10 - b, tin[1], 2); g.L(13, -14 + b, 19, -18 + b, tin[1], 2); g.px(20, -19 + b, tin[4]);
  });

  din('gibber', (g, b) => {
    const blob = R('#8a6aa8');
    g.E(0, -11 + b, 14, 11, blob, {}); g.E(-8, -4, 6, 4, blob, { hi: false }); g.E(8, -4, 6.5, 4, blob, { hi: false }); g.E(3, -22 + b, 7, 5, blob, { sep: 1 });
    const mouth = (x, y, w, h, open) => { g.E(x, y, w, open ? h : Math.max(1, h - 1.2), R('#2a1430'), { flat: 1 }); for (let i = -Math.floor(w) + 1; i < w; i += 2) g.px(x + i, y - (open ? h : h - 1.2) + 1, W); if (open) g.px(x, y + 1, RED); };
    mouth(-5, -12 + b, 4.5, 3.4, !b); mouth(6, -8 + b, 4, 3, b); mouth(4, -21 + b, 3.4, 2.4, !b); mouth(-9, -4, 3, 2, b);
    for (const [x, y] of [[-2, -19], [9, -16], [-11, -9], [0, -4]]) { g.px(x, y + b, W); g.px(x + 1, y + b, EYE); }
    // spat-out fragments of words
    const c = I('#d8c0f0'); g.px(15, -24 - b, c, 1).px(17, -27, c).px(-16, -20 + b, c).px(-18, -24, c, 1).px(13, -30 + b, c);
  });

  /* ---------- the Mutes ---------- */
  mute('muffle', (g, b) => {
    const q = R('#b8a8c0'), q2 = R('#d8ccd8'), moss = R('#6a8a6a');
    // a sagging mound of quilt
    g.E(0, -16 + b, 34, 17, q, {}); g.E(-6, -32 + b, 24, 16, q, { sep: 1 }); g.E(4, -46 + b, 15, 11, q2, { sep: 1 });
    g.E(-24, -6, 12, 6, q, { hi: false }); g.E(22, -6, 14, 6, q, { hi: false });
    // quilting: stitched diamonds
    for (let y = -40; y < -4; y += 8) for (let x = -28; x < 30; x += 8) { const xx = x + ((y / 8) & 1 ? 4 : 0); if (g.get(40 + xx, 76 + y + b) !== -1 && g.get(40 + xx, 76 + y + b + 3) !== -1) { g.px(xx, y + b, q[0]); g.px(xx - 1, y + 1 + b, q[1]).px(xx + 1, y + 1 + b, q[1]); } }
    // heavy-lidded eyes
    for (const x of [-4, 9]) { g.E(x, -47 + b, 4, 3, R('#2a2238'), { flat: 1 }); g.R(x - 4, -50 + b, 9, 2, q2, 1); g.px(x, -46 + b, I('#ffe9a0'), 1).px(x + 1, -46 + b, I('#ffe9a0'), 1); }
    // a stitched-shut mouth
    for (let i = -3; i <= 9; i += 2) { g.px(i, -39 + b, EYE); g.px(i, -40 + b, q[0]); }
    // moss and reeds stuck in it
    g.E(-22, -30 + b, 5, 3, moss, {}); g.E(20, -22 + b, 6, 3, moss, {}); g.E(-10, -52 + b, 4, 2.4, moss, {});
    g.L(26, -24 + b, 30, -40, moss[1], 1); g.L(28, -24 + b, 34, -36, moss[1], 1); g.px(30, -41, rust[2]).px(30, -42, rust[2]).px(34, -37, rust[2]);
    // swallowed notes sinking in
    A.note(g, -30, -44 - b, I('#8a84b0')); A.note(g, 26, -54 + b, I('#8a84b0'));
  });

  mute('shush', (g, b) => {
    const cl = R('#2e2a5a'), cl2 = R('#48408a'), mask = R('#e8e2f0');
    // tall cloak
    g.P([[-12, -58 + b], [10, -58 + b], [22, -2], [-24, -2]], cl, 2); g.P([[-12, -58 + b], [-4, -58 + b], [-14, -2], [-24, -2]], cl, 1); g.P([[4, -58 + b], [10, -58 + b], [22, -2], [12, -2]], cl, 3);
    for (let x = -22; x < 22; x += 5) g.P([[x, -3], [x + 5, -3], [x + 2.5, 2]], cl, 1);
    // hood
    g.E(-1, -58 + b, 14, 13, cl2, {}); g.E(0, -55 + b, 10, 10, R('#17102b'), { flat: 2 });
    // pale mask, no mouth
    g.E(1, -55 + b, 7, 8.5, mask, {});
    g.R(-3, -58 + b, 3, 2, R('#17102b'), 2); g.R(3, -58 + b, 3, 2, R('#17102b'), 2); g.px(4, -57 + b, I('#a8e6ff'), 1);
    // one long arm, finger to the mask
    g.Q(14, -40 + b, 24, -32 + b, 12, -44 + b, cl2[1], 3);
    g.L(12, -44 + b, 3, -50 + b, mask[1], 2); g.L(3, -50 + b, 2, -56 + b, mask[2], 1); g.px(2, -57 + b, mask[4]);
    // hush marks
    const c = I('#a8a0e0'); g.L(-22, -62 - b, -26, -66 - b, c, 1); g.L(-24, -56, -30, -57, c, 1); g.L(22, -66 + b, 26, -70 + b, c, 1); g.L(24, -58, 30, -60, c, 1);
  });

  mute('static', (g, b) => {
    const rnd = H.rng(b ? 77 : 31); const tones = [I('#f4f4ff'), I('#c8c8e0'), I('#8a88b0'), I('#4a4870'), I('#2a2848')];
    const blobs = [[0, -30, 26, 20], [-16, -18, 16, 12], [18, -20, 15, 12], [-4, -46, 15, 10], [10, -10, 14, 8]];
    const ins = (x, y) => blobs.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1);
    for (let y = -60; y < 0; y++) for (let x = -36; x < 36; x++) { if (!ins(x, y)) { if (ins(x + (rnd() < 0.5 ? 2 : -2), y) && rnd() < 0.25) g.px(x, y, tones[2]); continue; } const v = rnd(); const lit = (-(x * 0.5 + (y + 30) * 0.8) / 30 + 1) / 2; const k = v * 0.7 + (1 - lit) * 0.5; g.px(x, y, tones[Math.min(4, Math.floor(k * 5))]); }
    // scanline tear
    for (let x = -30; x < 30; x++) if (ins(x, -24)) g.px(x + 3, -24 + b * 2, tones[0]);
    // hollow eyes and a flat line of a mouth
    for (const x of [-9, 6]) { g.R(x, -38, 6, 7, null, I('#17102b')); g.px(x + 2, -35, I('#a8f5b8'), 1).px(x + 3, -35, I('#a8f5b8'), 1).px(x + 2, -34, I('#a8f5b8'), 1).px(x + 3, -34, I('#a8f5b8'), 1); }
    g.R(-6, -26, 14, 1, null, I('#17102b')); for (let i = -5; i < 8; i += 3) g.px(i, -27 - (i % 2 ? 1 : 0), I('#17102b'));
    // arcs of interference
    const c = I('#f4f4ff'); g.L(-34, -44, -30, -40, c, 1, true); g.L(-30, -40, -35, -37, c, 1, true); g.L(32, -48, 28, -44, c, 1, true); g.L(28, -44, 34, -41, c, 1, true);
  });

  mute('tacet', (g, b) => {
    const robe = R('#201a3a'), trim = R('#8a7ad0'), mask = R('#f0ecf8');
    // floating rests
    const c = I('#b9b4d6'); for (const [x, y] of [[-32, -40], [30, -34]]) { g.R(x, y + (x < 0 ? b : -b), 6, 3, null, c); g.R(x - 1, y + 3 + (x < 0 ? b : -b), 8, 1, null, c); }
    // throne back
    g.P([[-22, -2], [-18, -54], [18, -54], [22, -2]], R('#2a2448'), 1); g.R(-18, -56, 37, 3, trim, 1); for (const x of [-18, 17]) g.E(x, -58, 3, 3, trim, {});
    // seated robe
    g.P([[-14, -40 + b], [14, -40 + b], [26, -2], [-26, -2]], robe, 2); g.P([[-14, -40 + b], [-6, -40 + b], [-16, -2], [-26, -2]], robe, 1); g.P([[6, -40 + b], [14, -40 + b], [26, -2], [16, -2]], robe, 3);
    g.L(0, -38 + b, 0, -3, trim[1], 1); for (let y = -34; y < -4; y += 6) g.px(0, y + b, trim[4], 1);
    g.R(-27, -3, 54, 3, trim, 1);
    // the mask is a fermata: an arc over one eye
    g.E(0, -50 + b, 12, 12, mask, {});
    g.Q(-8, -50 + b, 0, -64 + b, 8, -50 + b, I('#17102b'), 2);
    g.E(0, -49 + b, 2.6, 2.6, R('#17102b'), { flat: 2 }); g.px(0, -49 + b, I('#ffe9a0'), 1).px(-1, -49 + b, I('#ffe9a0'), 1);
    g.L(-5, -42 + b, 5, -42 + b, I('#17102b'), 1);
    // crown of organ pipes
    for (const [x, h] of [[-9, 6], [-5, 9], [-1, 12], [3, 9], [7, 6]]) { g.C(x, -62 - h + b, 3, h, R('#b9b6cc')); g.px(x + 1, -62 - h + b, EYE); }
    // baton, held still
    g.L(16, -24 + b, 30, -46 + b, mask[2], 1); g.px(31, -47 + b, I('#ffe9a0'), 1); g.E(15, -23 + b, 3, 3, mask, {});
    g.E(-15, -23 + b, 3, 3, mask, {});
  });

  H.DIN_SIZE = { muffle: 80, shush: 80, static: 80, tacet: 80 };
})(window.H);
