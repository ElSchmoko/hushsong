/* Hushsong — pixel renderer. Every sprite in the game is drawn here in code, on one pixel grid, with one light and one outline. */
(function (H) {
  'use strict';
  const A = (H.Art = H.Art || {});

  /* ----- colour ----- */
  const hex2rgb = (h) => { h = h.replace('#', ''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rgb2int = (r, g, b) => ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);
  const rgb2hsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; };
  const hsl2rgb = (h, s, l) => { h = ((h % 360) + 360) % 360 / 360; const f = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }; if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; } const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return [Math.round(f(p, q, h + 1 / 3) * 255), Math.round(f(p, q, h) * 255), Math.round(f(p, q, h - 1 / 3) * 255)]; };
  const toward = (h, target, amt) => { let d = ((target - h + 540) % 360) - 180; return h + Math.sign(d) * Math.min(Math.abs(d), amt); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // Five-tone ramp from one colour: shadows drift cool and saturated, lights drift warm.
  A.ramp = (hex) => {
    const [r, g, b] = hex2rgb(hex); const [h, s, l] = rgb2hsl(r, g, b);
    const cap = l > 0.6 ? 0.22 + 0.78 * clamp((0.95 - l) / 0.35, 0, 1) : 1;
    const mk = (dh, ds, nl) => { const c = hsl2rgb(dh, Math.min(clamp(s * ds, 0, 1), nl < l ? cap : 1), clamp(nl, 0, 1)); return rgb2int(c[0], c[1], c[2]); };
    const pale = clamp((l - 0.55) / 0.35, 0, 1); const d1s = 1.05 - 0.5 * pale, d0s = 1.1 - 0.5 * pale;
    return [mk(toward(h, 270, 30 + 20 * pale), d0s, l * (0.42 + 0.06 * pale)), mk(toward(h, 270, 14 + 14 * pale), d1s, l * (0.68 + 0.06 * pale)), rgb2int(r, g, b), mk(toward(h, 55, 10), 0.95, l + (1 - l) * 0.3), mk(toward(h, 55, 18), 0.8, l + (1 - l) * 0.62)];
  };
  A.tint = (hex, dh, ds, dl) => { const [r, g, b] = hex2rgb(hex); const [h, s, l] = rgb2hsl(r, g, b); const c = hsl2rgb(h + (dh || 0), clamp(s * (ds == null ? 1 : ds), 0, 1), clamp(l * (dl == null ? 1 : dl), 0, 1)); return '#' + rgb2int(c[0], c[1], c[2]).toString(16).padStart(6, '0'); };
  A.int = (hex) => { const c = hex2rgb(hex); return rgb2int(c[0], c[1], c[2]); };
  A.css = (n) => '#' + n.toString(16).padStart(6, '0');
  A.OUTLINE = A.int('#17102b');
  A.EYE = A.int('#1c1433');
  A.WHITE = A.int('#fff8ea');

  /* ----- grid ----- */
  class Grid {
    constructor(w, h) { this.w = w; this.h = h; this.c = new Int32Array(w * h).fill(-1); this.g = new Int32Array(w * h).fill(-1); this.ox = 0; this.oy = 0; this.sc = 1; }
    at(ox, oy, sc) { this.ox = ox; this.oy = oy; this.sc = sc || 1; return this; }
    X(x) { return this.ox + x * this.sc; } Y(y) { return this.oy + y * this.sc; }
    raw(x, y, col, glow) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; const i = y * this.w + x; this.c[i] = col; this.g[i] = glow ? col : -1; }
    get(x, y) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= this.w || y >= this.h) return -1; return this.c[y * this.w + x]; }
    // single pixel in local coordinates (not scaled in size)
    px(x, y, col, glow) { this.raw(Math.round(this.X(x)), Math.round(this.Y(y)), col, glow); return this; }
    // shaded ellipse. o: {flat:toneIndex, sep:bool, glow:bool, hi:bool(default true), lx, ly}
    E(cx, cy, rx, ry, rp, o) {
      o = o || {}; cx = this.X(cx); cy = this.Y(cy); rx *= this.sc; ry *= this.sc;
      const x0 = Math.floor(cx - rx), x1 = Math.ceil(cx + rx), y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
      const lx = o.lx == null ? 0.55 : o.lx, ly = o.ly == null ? 0.75 : o.ly; const ins = (x, y) => { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; return dx * dx + dy * dy <= 1; };
      const edge = [];
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        if (!ins(x, y)) continue;
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        let tone;
        if (o.flat != null) tone = o.flat;
        else { const v = -(dx * lx + dy * ly); tone = v > 0.52 ? 3 : v > -0.22 ? 2 : v > -0.66 ? 1 : 0; if (o.dither && ((x + y) & 1) && v > -0.34 && v <= -0.22) tone = 1; }
        if (o.sep && this.get(x, y) !== -1 && (!ins(x - 1, y) || !ins(x + 1, y) || !ins(x, y - 1) || !ins(x, y + 1))) edge.push([x, y]);
        this.raw(x, y, rp[tone], o.glow);
      }
      if (o.flat == null && o.hi !== false && rx >= 3 && ry >= 3) { const hx = Math.round(cx - rx * 0.42), hy = Math.round(cy - ry * 0.5); if (ins(hx, hy)) this.raw(hx, hy, rp[4], o.glow); if (rx >= 6 && ins(hx + 1, hy)) this.raw(hx + 1, hy, rp[4], o.glow); }
      for (const [x, y] of edge) this.raw(x, y, rp[0]);
      return this;
    }
    // flat rectangle; tone may be an index into the ramp or a raw colour when rp is null
    R(x, y, w, h, rp, tone, glow) { const X0 = Math.round(this.X(x)), Y0 = Math.round(this.Y(y)), W = Math.max(1, Math.round(w * this.sc)), Hh = Math.max(1, Math.round(h * this.sc)); const col = rp ? rp[tone == null ? 2 : tone] : tone; for (let j = 0; j < Hh; j++) for (let i = 0; i < W; i++) this.raw(X0 + i, Y0 + j, col, glow); return this; }
    // rectangle shaded left-to-right like a cylinder
    C(x, y, w, h, rp, glow) { const X0 = Math.round(this.X(x)), Y0 = Math.round(this.Y(y)), W = Math.max(1, Math.round(w * this.sc)), Hh = Math.max(1, Math.round(h * this.sc)); for (let j = 0; j < Hh; j++) for (let i = 0; i < W; i++) { const t = W <= 1 ? 0.5 : i / (W - 1); const tone = t < 0.18 ? 3 : t < 0.6 ? 2 : t < 0.85 ? 1 : 0; this.raw(X0 + i, Y0 + j, rp[tone], glow); } return this; }
    L(x0, y0, x1, y1, col, th, glow) {
      x0 = Math.round(this.X(x0)); y0 = Math.round(this.Y(y0)); x1 = Math.round(this.X(x1)); y1 = Math.round(this.Y(y1)); th = th || 1;
      const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx - dy;
      for (;;) { for (let a = 0; a < th; a++) for (let b = 0; b < th; b++) this.raw(x0 + a - ((th - 1) >> 1), y0 + b - ((th - 1) >> 1), col, glow); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 > -dy) { err -= dy; x0 += sx; } if (e2 < dx) { err += dx; y0 += sy; } }
      return this;
    }
    // filled polygon, flat tone; pts in local coords
    P(pts, rp, tone, glow) {
      const col = rp ? rp[tone == null ? 2 : tone] : tone; const p = pts.map(([x, y]) => [this.X(x), this.Y(y)]);
      let y0 = Infinity, y1 = -Infinity; for (const q of p) { y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
      for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) { const yc = y + 0.5; const xs = []; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0])); } xs.sort((m, n) => m - n); for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this.raw(x, y, col, glow); }
      return this;
    }
    // quadratic curve as a pixel line
    Q(x0, y0, cx, cy, x1, y1, col, th, glow) { let px = x0, py = y0; for (let i = 1; i <= 10; i++) { const t = i / 10, u = 1 - t; const x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1; this.L(px, py, x, y, col, th, glow); px = x; py = y; } return this; }
    // 1px dark outline around everything drawn so far
    outline(col) {
      col = col == null ? A.OUTLINE : col; const w = this.w, h = this.h, add = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (this.c[y * w + x] !== -1) continue; if (this.get(x - 1, y) !== -1 || this.get(x + 1, y) !== -1 || this.get(x, y - 1) !== -1 || this.get(x, y + 1) !== -1) add.push(y * w + x); }
      for (const i of add) this.c[i] = col; this.outlined = col; return this;
    }
    // to ImageData-like RGBA, with a soft pixel halo around glowing pixels
    rgba(flash) {
      const w = this.w, h = this.h, out = new Uint8ClampedArray(w * h * 4);
      for (let i = 0; i < w * h; i++) { const c = this.c[i]; if (c === -1) continue; const o = i * 4; if (flash) { out[o] = 255; out[o + 1] = 250; out[o + 2] = 235; out[o + 3] = 255; } else { out[o] = (c >> 16) & 255; out[o + 1] = (c >> 8) & 255; out[o + 2] = c & 255; out[o + 3] = 255; } }
      if (!flash) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const gc = this.g[y * w + x]; if (gc === -1) continue; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const d = Math.abs(dx) + Math.abs(dy); if (d !== 1) continue; const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const j = yy * w + xx; const cc = this.c[j]; if (cc !== -1 && cc !== this.outlined) continue; const o = j * 4; const a = 70; if (cc === this.outlined) { const k = 0.38; out[o] = out[o] + (((gc >> 16) & 255) - out[o]) * k; out[o + 1] = out[o + 1] + (((gc >> 8) & 255) - out[o + 1]) * k; out[o + 2] = out[o + 2] + ((gc & 255) - out[o + 2]) * k; } else if (out[o + 3] < a) { out[o] = (gc >> 16) & 255; out[o + 1] = (gc >> 8) & 255; out[o + 2] = gc & 255; out[o + 3] = a; } } }
      return out;
    }
  }
  A.Grid = Grid;

  /* ----- shared anatomy ----- */
  // Big glossy eye. kind: 0 open, 1 closed (content), 2 fierce, 3 sleepy
  A.eye = (g, x, y, kind, big) => {
    const E = A.EYE, W = A.WHITE;
    if (kind === 1) { g.px(x, y + 1, E).px(x + 1, y, E).px(x + 2, y + 1, E); return; }
    if (kind === 3) { g.px(x, y + 1, E).px(x + 1, y + 2, E).px(x + 2, y + 1, E); return; }
    const w = big ? 3 : 2, h = big ? 4 : 3;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) g.px(x + i, y + j, E);
    g.px(x, y, W); if (big) g.px(x + w - 1, y + h - 1, A.int('#6a5c9a'));
    if (kind === 2) { g.px(x - 1, y - 1, E).px(x, y - 1, E).px(x + 1, y - 1, E); if (big) g.px(x + 2, y, E); }
  };
  A.blush = (g, x, y) => { const c = A.int('#ff9aa8'); g.px(x, y, c).px(x + 1, y, c); };
  // eighth note, used as a floating motif
  A.note = (g, x, y, col) => { const glow = false; g.px(x, y + 3, col, glow).px(x + 1, y + 3, col, glow).px(x, y + 4, col, glow).px(x + 1, y + 4, col, glow); for (let j = 0; j < 4; j++) g.px(x + 2, y + j, col, glow); g.px(x + 3, y, col, glow).px(x + 3, y + 1, col, glow); };
  A.spark = (g, x, y, col) => { g.px(x, y, col, 1).px(x - 1, y, col, 1).px(x + 1, y, col, 1).px(x, y - 1, col, 1).px(x, y + 1, col, 1); };

  /* ----- accessories (shared across species so the wardrobe reads as one hand) ----- */
  const R = A.ramp;
  A.acc = {
    bowtie(g, x, y, hex) { const r = R(hex); g.P([[x - 3, y - 2], [x, y], [x - 3, y + 2]], r, 2).P([[x + 3, y - 2], [x, y], [x + 3, y + 2]], r, 1); g.px(x, y, r[3]).px(x - 3, y - 2, r[3]); },
    scarf(g, x, y, w, hex, tail) { const r = R(hex); g.R(x - w, y, w * 2 + 1, 2, r, 2); g.R(x - w, y, w * 2 + 1, 1, r, 3); if (tail) { g.R(x + tail, y + 2, 2, 4, r, 1); g.px(x + tail, y + 5, r[2]); } },
    shako(g, x, y, hex, plume) { const r = R(hex), p = R(plume), gold = R('#f2c744'); g.C(x - 3, y - 7, 7, 7, r); g.R(x - 4, y, 9, 1, r, 0); g.R(x - 3, y - 1, 7, 1, gold, 2); g.px(x, y - 4, gold[3]); g.E(x + 0.5, y - 9.5, 1.6, 2.6, p, { hi: false }); },
    fedora(g, x, y, hex, band) { const r = R(hex), b = R(band); g.R(x - 6, y, 13, 1, r, 1); g.R(x - 5, y - 1, 11, 1, r, 2); g.C(x - 3, y - 5, 7, 4, r); g.R(x - 3, y - 2, 7, 1, b, 2); g.px(x - 1, y - 5, r[0]).px(x, y - 5, r[0]); },
    nightcap(g, x, y, hex, bob) { const r = R(hex), w = R('#fff1d6'); g.P([[x - 5, y], [x + 5, y], [x + 6, y - 3], [x + 8, y - 7], [x + 2, y - 6], [x - 3, y - 4]], r, 2); g.P([[x + 2, y - 6], [x + 8, y - 7], [x + 6, y - 3]], r, 1); g.R(x - 5, y, 11, 2, w, 3); g.E(x + 9, y - 6 + (bob || 0), 1.6, 1.6, w, { hi: false, glow: 1 }); },
    jester(g, x, y, a, b) { const ra = R(a), rb = R(b), gold = R('#f2c744'); g.P([[x - 5, y], [x, y], [x - 2, y - 4], [x - 7, y - 6]], ra, 2); g.P([[x, y], [x + 5, y], [x + 7, y - 6], [x + 2, y - 4]], rb, 2); g.P([[x - 2, y], [x + 2, y], [x, y - 7]], ra, 3); g.px(x - 7, y - 7, gold[3], 1).px(x + 7, y - 7, gold[3], 1).px(x, y - 8, gold[3], 1); g.R(x - 5, y, 11, 1, gold, 2); },
    sailor(g, x, y) { const w = R('#f4efe2'), n = R('#3b5fa8'); g.R(x - 5, y, 11, 2, w, 2); g.R(x - 5, y, 11, 1, n, 2); g.E(x, y - 2, 4.2, 2.6, w, { hi: false }); },
    tyrol(g, x, y, hex, feather) { const r = R(hex), f = R(feather); g.R(x - 6, y, 13, 1, r, 1); g.P([[x - 4, y], [x + 4, y], [x + 2, y - 5], [x - 2, y - 5]], r, 2); g.R(x - 4, y - 1, 9, 1, R('#e8dcb8'), 2); g.L(x + 3, y - 1, x + 6, y - 7, f[2], 1); g.px(x + 6, y - 8, f[3]).px(x + 5, y - 5, f[3]); },
    headdress(g, x, y, cols) { const n = cols.length; cols.forEach((c, i) => { const r = R(c); const ang = -Math.PI * 0.85 + (i / (n - 1)) * Math.PI * 0.7; const ex = x + Math.cos(ang) * 9, ey = y + Math.sin(ang) * 9; g.L(x, y, ex, ey, r[2], 2); g.px(ex, ey, r[4], 1); }); g.R(x - 5, y, 11, 2, R('#f2c744'), 2); g.px(x, y, A.int('#ff5a7a'), 1); },
    valkyrie(g, x, y) { const m = R('#c9c2d6'), h = R('#fff1d6'), gold = R('#f2c744'); g.E(x, y - 1, 5.5, 3.5, m, {}); g.R(x - 5, y, 11, 1, gold, 2); g.Q(x - 5, y - 1, x - 9, y - 3, x - 8, y - 8, h[2], 2); g.Q(x + 5, y - 1, x + 9, y - 3, x + 8, y - 8, h[3], 2); },
    hood(g, x, y, rx, ry, hex) { const r = R(hex); g.E(x, y, rx, ry, r, { dither: 1 }); },
    cap(g, x, y, hex, brimDir) { const r = R(hex); g.E(x, y - 1, 5, 3.2, r, {}); g.R(x - 5, y, 10, 1, r, 1); g.R(brimDir > 0 ? x + 3 : x - 8, y, 5, 1, r, 0); },
    beret(g, x, y, hex) { const r = R(hex); g.E(x - 1, y - 2, 6, 3, r, {}); g.px(x, y - 5, r[1]); g.R(x - 4, y, 9, 1, r, 0); },
    bandana(g, x, y, w, hex) { const r = R(hex); g.R(x - w, y, w * 2 + 1, 2, r, 2); g.R(x - w, y, w * 2 + 1, 1, r, 3); g.P([[x - w, y], [x - w - 4, y - 1], [x - w - 3, y + 3]], r, 1); },
    crown(g, x, y, hex) { const r = R(hex); g.R(x - 3, y - 1, 7, 2, r, 2); g.px(x - 3, y - 2, r[3]).px(x, y - 3, r[4], 1).px(x, y - 2, r[3]).px(x + 3, y - 2, r[3]); },
    rose(g, x, y) { const r = R('#e8405a'), l = R('#4fae6a'); g.E(x, y, 1.8, 1.8, r, { hi: false }); g.px(x, y, r[4]); g.px(x - 2, y + 2, l[2]).px(x - 1, y + 2, l[1]); },
    mic(g, x, y) { const m = R('#b8b4c8'), d = R('#3a3350'); g.L(x, y, x, y + 7, d[2], 1); g.E(x + 0.5, y - 1.5, 2.2, 2.6, m, {}); g.px(x, y - 1, m[4], 1); },
    stick(g, x0, y0, x1, y1) { const w = R('#e8cfa0'); g.L(x0, y0, x1, y1, w[2], 1); g.px(x1, y1, w[4]); g.px(x1 + (x1 > x0 ? 1 : -1), y1, w[3]); },
    plume(g, x, y, hex, h) { const r = R(hex); g.Q(x, y, x + 3, y - h, x - 2, y - h - 2, r[2], 2); g.px(x - 2, y - h - 2, r[4]); },
    halo(g, x, y, w) { const c = A.int('#ffe9a0'); for (let i = -w; i <= w; i++) { g.px(x + i, y, c, 1); } g.px(x - w - 1, y + 1, c, 1).px(x + w + 1, y + 1, c, 1); for (let i = -w; i <= w; i++) g.px(x + i, y + 2, c, 1); },
    star(g, x, y, col) { g.px(x, y, col, 1).px(x - 1, y, col, 1).px(x + 1, y, col, 1).px(x, y - 1, col, 1).px(x, y + 1, col, 1); },
    cape(g, x, y, w, h, hex) { const r = R(hex); g.P([[x - w, y], [x + w, y], [x + w + 3, y + h], [x - w - 3, y + h]], r, 1); g.P([[x - w, y], [x - w + 3, y], [x - w, y + h], [x - w - 3, y + h]], r, 0); },
  };

  /* ----- canvas plumbing ----- */
  const cache = new Map();
  A.make = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  A.gridToCanvas = (g, flash) => { const c = A.make(g.w, g.h); const ctx = c.getContext('2d'); const id = ctx.createImageData(g.w, g.h); id.data.set(g.rgba(flash)); ctx.putImageData(id, 0, 0); return c; };
  // sprite(key, frame, variant) -> canvas, cached. variant: '' | 'flash' | 'sil'
  A.sprite = (key, frame, variant) => {
    const k = key + '|' + (frame || 0) + '|' + (variant || '');
    if (cache.has(k)) return cache.get(k);
    const def = A.defs[key]; if (!def) return null;
    const g = new Grid(def.w, def.h); def.draw(g, frame || 0); g.outline();
    let c;
    if (variant === 'sil') { c = A.make(def.w, def.h); const ctx = c.getContext('2d'); const id = ctx.createImageData(def.w, def.h); for (let i = 0; i < def.w * def.h; i++) if (g.c[i] !== -1) { id.data[i * 4] = 44; id.data[i * 4 + 1] = 38; id.data[i * 4 + 2] = 82; id.data[i * 4 + 3] = 255; } ctx.putImageData(id, 0, 0); }
    else c = A.gridToCanvas(g, variant === 'flash');
    cache.set(k, c); return c;
  };
  A.defs = {};
  A.def = (key, w, h, draw) => { A.defs[key] = { w, h, draw }; };
  // Put a sprite into the page at an integer scale.
  A.el = (key, scale, opts) => {
    opts = opts || {}; const src = A.sprite(key, opts.frame || 0, opts.variant); const c = A.make(src.width, src.height);
    const ctx = c.getContext('2d'); if (opts.flip) { ctx.translate(src.width, 0); ctx.scale(-1, 1); } ctx.drawImage(src, 0, 0);
    c.className = 'px ' + (opts.cls || ''); c.style.width = `calc(var(--u) * ${src.width * (scale || 1)})`; c.style.height = `calc(var(--u) * ${src.height * (scale || 1)})`;
    if (opts.anim) { c.dataset.anim = key; c.dataset.flip = opts.flip ? 1 : 0; c.dataset.variant = opts.variant || ''; }
    return c;
  };
  // Two-frame idle for every canvas that asked for it.
  A.tick = (frame) => { document.querySelectorAll('canvas[data-anim]').forEach((c) => { const src = A.sprite(c.dataset.anim, frame, c.dataset.variant); if (!src) return; const ctx = c.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); if (c.dataset.flip === '1') { ctx.translate(c.width, 0); ctx.scale(-1, 1); } ctx.drawImage(src, 0, 0); }); };

})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
