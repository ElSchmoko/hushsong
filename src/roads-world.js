/* Hushsong Roads (preview) — the world: terrain, regions, rivers and roads, on a hex map. No DOM.
   Reed Marsh is the region you can play; the others sit at the edges, still silent and closed. */
(function (H) {
  const W = (H.RW = {});
  'use strict';
  // ---------- noise ----------
  const hash = (x, y) => { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const sm = (t) => t * t * (3 - 2 * t), sat = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  }
  const fbm = (x, y) => vnoise(x, y) * 0.55 + vnoise(x * 2.1 + 5.2, y * 2.1 + 1.3) * 0.28 + vnoise(x * 4.3 + 9.1, y * 4.3 + 7.7) * 0.17;
  Object.assign(W, { hash, sm, sat, vnoise, fbm });

  // ---------- hexes (pointy top, circumradius 1) ----------
  const SQ3 = Math.sqrt(3), RAD = 35;
  const hexToXZ = (q, r) => [SQ3 * (q + r / 2), 1.5 * r];
  function xzToHex(x, z) {
    const q = (SQ3 / 3) * x - z / 3, r = (2 / 3) * z;
    let rx = Math.round(q), rz = Math.round(r); const ry = Math.round(-q - r);
    const dx = Math.abs(rx - q), dz = Math.abs(rz - r), dy = Math.abs(ry - (-q - r));
    if (dx > dy && dx > dz) rx = -ry - rz; else if (dy <= dz) rz = -rx - ry;
    return [rx, rz];
  }
  const key = (q, r) => q + ',' + r;
  const NB = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const hexDist = (a, b) => (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - b.q - b.r)) / 2;
  Object.assign(W, { SQ3, RAD, hexToXZ, xzToHex, key, NB, hexDist });

  // ---------- regions ----------
  W.REG = {
    marsh: { n: 'Reed Marsh', at: [-1, 3], spread: 260, bias: -0.035, amp: 0.85, music: [0, 4, 7, 11],
      pal: { water: '#5ccfe0', shore: '#ead58c', low: '#9ede6a', forest: '#5cc472', hill: '#b6d66a', mount: '#a3a08a', wall: '#7c6c4c', tree: '#3fae62', tree2: '#7fd86a', grass: '#6fc456', rock: '#b8b4a0' } },
    works: { n: 'Bell Foundry', at: [36, -12], spread: 150, bias: 0.0, amp: 1.0, music: [0, 3, 7, 10], closed: true,
      pal: { water: '#62bfe0', shore: '#f5dc9c', low: '#ffd06e', forest: '#f0a24e', hill: '#f2b05a', mount: '#b0786a', wall: '#9a5a40', tree: '#e0783e', tree2: '#ffb050', grass: '#e8b24e', rock: '#c49a86' } },
    ridge: { n: 'Snowy Ridge', at: [-13, -37], spread: 150, bias: 0.11, amp: 1.25, music: [0, 5, 7, 12], closed: true,
      pal: { water: '#7ad4f0', shore: '#e4ecdc', low: '#bdeccd', forest: '#7fd0ae', hill: '#a6cfc0', mount: '#9aa6cc', wall: '#6e7898', tree: '#3d9a86', tree2: '#5cbca0', grass: '#8fd4ae', rock: '#b4bcd8' } },
    dunes: { n: 'Windy Dunes', at: [22, 34], spread: 150, bias: 0.035, amp: 0.55, music: [0, 2, 7, 9], closed: true,
      pal: { water: '#4fd6d0', shore: '#fbe6a8', low: '#f7d488', forest: '#e6c070', hill: '#f2b874', mount: '#e08a5a', wall: '#b0603e', tree: '#4fb36a', tree2: '#8fd07a', grass: '#d8b860', rock: '#d89a6e' } },
  };
  W.REG_ORDER = ['marsh', 'works', 'ridge', 'dunes'];
  W.KIND = [
    { n: 'Water', d: 'Too deep to wade.' },
    { n: 'Shore', d: 'Soft ground by the water.' },
    { n: 'Meadow', d: 'Easy walking.' },
    { n: 'Woods', d: 'Easy walking, under the trees.' },
    { n: 'Hills', d: 'Rolling ground. A good lookout.' },
    { n: 'Mountains', d: 'Too steep to cross.' },
  ];
  W.KIND_DUNES = [{ n: 'Oasis' }, { n: 'Sand' }, { n: 'Dunes' }, { n: 'Scrub' }, { n: 'Red rocks' }, { n: 'Mesa', d: 'Sheer cliffs. No way up.' }];
  const SEA = 0.445, T = [SEA, 0.47, 0.545, 0.6, 0.655];
  W.SEA = SEA; W.T = T;

  function regionW(x, z) {
    const out = {}; let sum = 0;
    for (const id of W.REG_ORDER) {
      const [ax, az] = W.REG[id].at, d = Math.hypot(x - ax, z - az) + (vnoise(x * 0.18 + 3, z * 0.18 + 8) - 0.5) * 7;
      const w = Math.exp(-(d * d) / W.REG[id].spread); out[id] = w; sum += w;
    }
    for (const id in out) out[id] /= sum || 1;
    return out;
  }
  W.regionW = regionW;
  W.regionAt = (x, z) => { const w = regionW(x, z); let best = 'marsh'; for (const id in w) if (w[id] > w[best]) best = id; return best; };
  // elevation: noise scaled per region, a region bias, and an island edge that sinks into the sea
  const E2 = (x, z) => {
    const w = regionW(x, z); let bias = 0, amp = 0;
    for (const id in w) { bias += w[id] * W.REG[id].bias; amp += w[id] * W.REG[id].amp; }
    const rr = Math.hypot(x, z * 1.05) / (RAD * 1.5) + (vnoise(x * 0.12 + 7, z * 0.12 + 2) - 0.5) * 0.18;
    const edge = sm(sat((rr - 0.76) / 0.24));
    const n = fbm(x * 0.085 + 31, z * 0.085 + 17) + (vnoise(x * 0.04, z * 0.04) - 0.5) * 0.25 - 0.5;
    return { e: 0.53 + n * amp + bias - edge * 0.45, w };
  };
  W.E = (x, z) => E2(x, z).e;
  W.kindE = (e) => (e < T[0] ? 0 : e < T[1] ? 1 : e < T[2] ? 2 : e < T[3] ? 3 : e < T[4] ? 4 : 5);

  // ---------- 3D height ----------
  const ridge = (x, z) => { const r = 1 - Math.abs(fbm(x * 0.21 + 11.3, z * 0.21 + 3.7) * 2 - 1); return r * r * r; };
  W.H = (x, z) => {
    const { e, w } = E2(x, z);
    let h = Math.max(0.02, 0.2 + (e - SEA) * 2.4);
    // gentle swell everywhere on land, rolling hills where the ground rises
    const land = sm(sat((e - T[0]) / 0.05));
    h += land * (vnoise(x * 0.55 + 3, z * 0.55 + 9) - 0.5) * 0.12;
    const hilly = sm(sat((e - 0.535) / 0.09)) * (1 - sm(sat((e - (T[4] + 0.01)) / 0.03)));
    const bumps = vnoise(x * 0.75 + 13, z * 0.75 + 41), b2 = vnoise(x * 1.6 + 2, z * 1.6 + 5);
    h += hilly * (bumps * bumps * 1.2 + b2 * 0.2) * (1 - w.dunes * 0.6);
    // mountains: connected ranges
    const m = sm(sat((e - (T[3] + 0.015)) / 0.07));
    if (m > 0) { const r = ridge(x, z); h += m * (0.12 + 1.55 * r) * (1 - w.dunes * 0.55) + m * m * 0.4 * r * (1 - w.dunes); }
    // desert: long dune ridges on the sand, flat-topped mesas where the rock rises
    if (w.dunes > 0.05) {
      const dir = (x * 0.8 + z * 0.6 + (vnoise(x * 0.25, z * 0.25) - 0.5) * 2.5) / 2.6, f = dir - Math.floor(dir), dune = f < 0.72 ? sm(f / 0.72) : sm((1 - f) / 0.28);
      h += sm(sat((w.dunes - 0.25) / 0.4)) * land * (1 - hilly * 0.5) * (dune * (0.22 + vnoise(x * 0.3 + 4, z * 0.3) * 0.22) + Math.sin(dir * 26 + z) * 0.012);
      if (m > 0) { const step = 0.55, q = Math.floor(h / step) * step + sm(sat(((h % step) / step - 0.82) / 0.18)) * step; h += w.dunes * sm(sat(m * 3)) * (q - h); }
    }
    h += (vnoise(x * 1.7 + 5, z * 1.7 + 1) - 0.5) * 0.04 * (1 + m);
    // rivers cut a bed through the land
    if (W.riverD) { const d = W.riverD(x, z); if (d < 0.6) h -= (1 - sm(sat((d - 0.08) / 0.5))) * Math.min(0.22, h * 0.5); }
    return h;
  };
  W.STEP = [0, 0.1, 0.2, 0.28, 0.48, 0.7];

  // ---------- build the world ----------
  W.build = () => {
    const tiles = new Map(), list = [];
    for (let q = -RAD; q <= RAD; q++) for (let r = Math.max(-RAD, -q - RAD); r <= Math.min(RAD, -q + RAD); r++) {
      const [x, z] = hexToXZ(q, r), e = W.E(x, z), kind = W.kindE(e);
      const t = { q, r, x, z, e, kind, reg: W.regionAt(x, z), song: 0, songT: 0, road: [], river: [], rseg: [], seed: hash(q * 13 + 7, r * 29 + 3) };
      tiles.set(key(q, r), t); list.push(t);
    }
    W.tiles = tiles; W.list = list;
    W.at = (q, r) => tiles.get(key(q, r));
    W.walk = (t) => !!t && t.kind >= 1 && t.kind <= 4;
    const nbs = (t) => NB.map(([a, b]) => W.at(t.q + a, t.r + b)).filter(Boolean);

    // rivers: from high ground, always downhill, until they reach water
    const used = new Set();
    const sources = list.filter((t) => t.kind === 4 && t.reg !== 'dunes' && nbs(t).some((n) => n.kind === 5)).sort((a, b) => hash(a.q * 7, a.r * 3) - hash(b.q * 7, b.r * 3));
    W.rivers = [];
    for (const s of sources) {
      if (W.rivers.length >= 5) break;
      if (W.rivers.some((rv) => rv.some((t) => hexDist(t, s) < 5))) continue;
      const path = [s]; let cur = s, ok = false;
      for (let i = 0; i < 40; i++) {
        const next = nbs(cur).filter((n) => n.kind !== 5 && !path.includes(n)).sort((a, b) => a.e - b.e)[0];
        if (!next || next.e > cur.e + 0.01) break;
        path.push(next); cur = next;
        if (next.kind === 0 || used.has(next)) { ok = true; break; }
      }
      if (!ok || path.length < 6) continue;
      W.rivers.push(path);
      for (let i = 0; i < path.length - 1; i++) { path[i].river.push(path[i + 1]); path[i + 1].river.push(path[i]); used.add(path[i]); }
    }
    // each tile keeps the river segments near it, so height lookups stay cheap
    for (const t of list) for (const n of t.river) {
      if (key(t.q, t.r) > key(n.q, n.r)) continue;
      const seg = [t.x, t.z, n.x, n.z];
      for (const u of [t, n, ...nbs(t), ...nbs(n)]) if (!u.rseg.includes(seg)) u.rseg.push(seg);
    }
    W.riverD = (x, z) => {
      const t = W.at(...xzToHex(x, z)); if (!t || !t.rseg.length) return 9;
      let d = 9;
      for (const [ax, az, bx, bz] of t.rseg) { const vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz, k = sat(((x - ax) * vx + (z - az) * vz) / l2); d = Math.min(d, Math.hypot(x - ax - vx * k, z - az - vz * k)); }
      return d;
    };

    for (const t of list) t.closed = !!W.REG[t.reg].closed;
    W.walk = (t) => !!t && t.kind >= 1 && t.kind <= 4 && !t.closed;
    W.near = (x, z, ok) => { let best = null, bd = 1e9; for (const t of list) if (W.walk(t) && !t.river.length && !t.poi && (!ok || ok(t))) { const d = Math.hypot(t.x - x, t.z - z); if (d < bd) { bd = d; best = t; } } return best; };
    W.nbs = nbs;
  };
  // Places go where they fit: each spec names a spot and what kind of ground it wants. Roads then join them up.
  W.place = (specs, links) => {
    W.POI = [];
    // places and roads are laid out over closed land too: it opens later
    for (const t of W.list) t.closed = false;
    for (const s of specs) { const fit = W.FIT[s.fit], reg = s.reg || 'marsh', t = W.near(s.at[0], s.at[1], (u) => u.reg === reg && (!fit || fit(u))); if (!t) continue; const p = Object.assign({}, s, { t, q: t.q, r: t.r }); t.poi = p; W.POI.push(p); }
    W.poi = (id) => W.POI.find((p) => p.id === id);
    const roadCost = (t) => (t.kind === 4 ? 3 : t.kind === 3 ? 1.6 : 1) + (t.river.length ? 4 : 0);
    const link = (a, b) => { const p = W.path(a, b, roadCost); if (!p) return false; let prev = a; for (const t of p) { if (!prev.road.includes(t)) { prev.road.push(t); t.road.push(prev); } prev = t; } return true; };
    W.roadsOk = links.map(([a, b]) => link(W.poi(a).t, W.poi(b).t));
    // every tile belongs to the nearest place you can capture: that is its patch of land
    const owners = W.POI.filter((p) => p.cap);
    for (const t of W.list) { let best = null, bd = 1e9; for (const p of owners) { if (p.t.reg !== t.reg) continue; const d = Math.hypot(t.x - p.t.x, t.z - p.t.z); if (d < bd) { bd = d; best = p; } } t.owner = best ? best.id : null; }
  };
  // which closed regions are open now (the game opens them one boss at a time)
  W.setOpen = (open) => { for (const t of W.list) t.closed = !!W.REG[t.reg].closed && !open[t.reg]; };
  const byNb = (f) => (t) => W.nbs(t).some(f);
  W.FIT = {
    flat: (t) => t.kind >= 2 && t.kind <= 3,
    meadow: (t) => t.kind === 2,
    woods: (t) => t.kind === 3,
    hills: (t) => t.kind === 4,
    shore: (t) => t.kind <= 2 && byNb((n) => n.kind === 0)(t),
    river: (t) => t.kind >= 2 && t.kind <= 3 && byNb((n) => n.river.length > 0)(t),
    peak: (t) => t.kind === 4 && byNb((n) => n.kind === 5)(t),
  };

  // ---------- paths ----------
  W.path = (a, b, cost, ok) => {
    if (!a || !b || !W.walk(b) || (ok && !ok(b))) return null;
    cost = cost || (() => 1);
    const open = [[0, a]], g = new Map([[a, 0]]), from = new Map();
    let n = 0;
    while (open.length && n++ < 9000) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
      const cur = open.splice(bi, 1)[0][1];
      if (cur === b) { const out = []; let c = b; while (c !== a) { out.push(c); c = from.get(c); } return out.reverse(); }
      for (const [dq, dr] of NB) {
        const nb = W.at(cur.q + dq, cur.r + dr); if (!W.walk(nb) || (ok && !ok(nb))) continue;
        const ng = g.get(cur) + cost(nb) * (nb.road.length ? 0.7 : 1);
        if (ng < (g.has(nb) ? g.get(nb) : Infinity)) { g.set(nb, ng); from.set(nb, cur); open.push([ng + hexDist(nb, b), nb]); }
      }
    }
    return null;
  };
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
