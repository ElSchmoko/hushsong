/* Hushsong — art engine. Everything is drawn in code as flat vector shapes, then given a dark ink outline and a white sticker edge. */
(function (H) {
  'use strict';
  const A = (H.Art = { defs: {}, INK: '#2b2140', k: 2 });
  const cache = new Map();
  A.flush = () => cache.clear();
  A.make = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  A.mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  A.dark = (c, t) => A.mix(c, '#3a1f4a', t == null ? 0.28 : t);
  A.light = (c, t) => A.mix(c, '#ffffff', t == null ? 0.45 : t);

  // A tiny drawing surface: SVG path strings, circles, ellipses, rounded boxes, and nested transforms.
  class G {
    constructor(x) { this.x = x; }
    p(d, fill) { this.x.fillStyle = fill; this.x.fill(new Path2D(d)); return this; }
    s(d, col, w, butt) { const x = this.x; x.strokeStyle = col; x.lineWidth = w; x.lineCap = butt ? 'butt' : 'round'; x.lineJoin = 'round'; x.stroke(new Path2D(d)); return this; }
    c(cx, cy, r, fill) { const x = this.x; x.fillStyle = fill; x.beginPath(); x.arc(cx, cy, r, 0, 6.2832); x.fill(); return this; }
    e(cx, cy, rx, ry, fill, rot) { const x = this.x; x.fillStyle = fill; x.beginPath(); x.ellipse(cx, cy, rx, ry, ((rot || 0) * Math.PI) / 180, 0, 6.2832); x.fill(); return this; }
    r(X, Y, w, h, rad, fill) { const x = this.x, r = Math.min(rad, w / 2, h / 2); x.fillStyle = fill; x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); x.fill(); return this; }
    push(tx, ty, s, rot) { const x = this.x; x.save(); x.translate(tx || 0, ty || 0); if (rot) x.rotate((rot * Math.PI) / 180); if (s != null) { if (s.length) x.scale(s[0], s[1]); else x.scale(s, s); } return this; }
    pop() { this.x.restore(); return this; }
    al(a) { this.x.globalAlpha = a; return this; }
    // filled shape with its own ink line, for icons that do not get the sticker treatment
    o(d, fill, w) { this.p(d, fill); return this.s(d, A.INK, w || 7); }
    oc(cx, cy, r, fill, w) { this.c(cx, cy, r, fill); const x = this.x; x.strokeStyle = A.INK; x.lineWidth = w || 7; x.beginPath(); x.arc(cx, cy, r, 0, 6.2832); x.stroke(); return this; }
  }
  A.G = G;
  // size: how many layout units wide it is on screen. box/off: the design space it is drawn in.
  A.def = (key, o, fn) => { A.defs[key] = Object.assign({ size: 48, box: 240, off: 20, sticker: true, ol: 5, edge: 6.5 }, o, { fn }); A.defs[key].w = A.defs[key].size; };

  const tint = (src, col) => { const c = A.make(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return c; };
  // outlines are stamped around a circle; big sprites get more stamps so the edge stays smooth
  const ring = (src, R, n) => { n = Math.max(n, Math.ceil(R * 4)); const c = A.make(src.width, src.height), x = c.getContext('2d'); for (let i = 0; i < n; i++) { const a = (i / n) * 6.2832; x.drawImage(src, Math.cos(a) * R, Math.sin(a) * R); } if (R > 3) for (let i = 0; i < n; i++) { const a = ((i + 0.5) / n) * 6.2832; x.drawImage(src, Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.55); } x.drawImage(src, 0, 0); return c; };
  // variant: '' normal, 'flash' lit white (a hit), 'sil' flat silhouette (a pet you have not found)
  A.sprite = (key, variant, px) => {
    const d = A.defs[key]; if (!d) throw new Error('no art: ' + key);
    px = Math.max(4, Math.round(px || d.size * A.k)); variant = variant || '';
    const ck = key + '|' + variant + '|' + px; if (cache.has(ck)) return cache.get(ck);
    const raw = A.make(px, px), rx = raw.getContext('2d'), sc = px / d.box; rx.scale(sc, sc); rx.translate(d.off, d.off); d.fn(new G(rx));
    let out = raw;
    if (variant === 'sil') out = tint(raw, '#cdc6dd');
    else if (d.sticker) {
      const ink = ring(tint(raw, A.INK), d.ol * sc, 20), white = ring(tint(ink, '#ffffff'), d.edge * sc, 24);
      out = A.make(px, px); const x = out.getContext('2d');
      x.globalAlpha = 0.22; x.drawImage(tint(white, A.INK), 0, 4.5 * sc); x.globalAlpha = 1;
      x.drawImage(white, 0, 0); x.drawImage(ink, 0, 0); x.drawImage(raw, 0, 0);
      if (variant === 'flash') { x.globalAlpha = 0.8; x.drawImage(tint(raw, '#ffffff'), 0, 0); x.globalAlpha = 1; }
      // a mirror copy (Daily Gig): a cool tint and two glassy streaks
      if (variant === 'mirror' || variant === 'mirrorflash') {
        x.globalAlpha = 0.42; x.drawImage(tint(raw, '#8fc8ff'), 0, 0); x.globalAlpha = 1;
        const sh = tint(raw, '#ffffff'), sx = sh.getContext('2d'), gr = sx.createLinearGradient(0, 0, sh.width, sh.height); sx.globalCompositeOperation = 'destination-in';
        [[0.3, 0], [0.4, 0.8], [0.48, 0], [0.54, 0.55], [0.6, 0]].forEach(([o, a]) => gr.addColorStop(o, `rgba(255,255,255,${a})`)); sx.fillStyle = gr; sx.fillRect(0, 0, sh.width, sh.height); x.drawImage(sh, 0, 0);
        if (variant === 'mirrorflash') { x.globalAlpha = 0.8; x.drawImage(tint(raw, '#ffffff'), 0, 0); x.globalAlpha = 1; }
      }
    }
    cache.set(ck, out); return out;
  };
  // Draw a sprite into a canvas that is already scaled to layout units.
  A.draw = (ctx, key, x, y, variant, scale) => { const d = A.defs[key], u = d.size * (scale || 1); ctx.drawImage(A.sprite(key, variant, u * A.k), x, y, u, u); };
  // A sprite as a page element, sized in layout units.
  A.el = (key, scale, o) => {
    o = o || {}; const d = A.defs[key], units = d.size * (scale || 1), px = Math.round(units * A.k), c = A.make(px, px), x = c.getContext('2d');
    if (o.flip) { x.translate(px, 0); x.scale(-1, 1); }
    x.drawImage(A.sprite(key, o.variant, px), 0, 0);
    c.style.width = c.style.height = `calc(var(--u) * ${units})`; c.className = 'art' + (o.anim ? ' bob' : ''); c.setAttribute('aria-hidden', 'true'); return c;
  };
  A.tick = () => {};
  // Where the creature really sits inside its cell (in layout units), so bars and markers can hug it.
  const bbc = {};
  A.bbox = (key) => {
    if (bbc[key]) return bbc[key]; const d = A.defs[key], n = 96, src = A.sprite(key, '', n), dt = src.getContext('2d').getImageData(0, 0, n, n).data; let t = n, b = 0, l = n, r = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (dt[(y * n + x) * 4 + 3] > 120) { if (y < t) t = y; if (y + 1 > b) b = y + 1; if (x < l) l = x; if (x + 1 > r) r = x + 1; }
    const f = d.size / n; return (bbc[key] = { t: t * f, b: b * f, l: l * f, r: r * f });
  };
})(window.H);
