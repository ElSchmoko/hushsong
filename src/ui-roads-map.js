/* Hushsong Roads (preview) — the 3D map. One continuous toon landscape cut into hexes, with ink contours, rivers, woods, grass,
   cloud shadows, low mist and drifting motes. Land grows out of the mist as it comes on screen.
   One map for the whole session: the screen lends it a box to draw in and takes it back when it leaves.
   three.js is loaded the first time the map is needed (lib/three.min.js next to the game, else from a CDN). */
(function (H) {
  'use strict';
  const M = (H.RoadsMap = { ready: false });
  const W = H.RW, A = H.Art;
  const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  M.load = (done, fail) => {
    if (window.THREE) { if (!M.ready) build(); return done(); }
    const add = (src, next) => { const s = document.createElement('script'); s.src = src; s.onload = () => { build(); done(); }; s.onerror = next; document.head.appendChild(s); };
    add('lib/three.min.js', () => add(CDN, fail));
  };

  /* ---------- colour: a silent tile is greyed, a singing one in full colour ---------- */
  const HUSH = [201, 195, 216];
  const rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const greyOf = (c) => { const l = c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15; return [0, 1, 2].map((i) => l * 0.62 + HUSH[i] * 0.38); };
  M.greyOf = greyOf;
  const greyCache = new Map();
  M.sprite = (key, grey, px) => {
    const src = A.sprite(key, '', px); if (!grey) return src;
    const ck = key + '|' + px; if (greyCache.has(ck)) return greyCache.get(ck);
    const c = A.make(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0);
    const im = x.getImageData(0, 0, c.width, c.height), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const g = greyOf([d[i], d[i + 1], d[i + 2]]); d[i] = g[0]; d[i + 1] = g[1]; d[i + 2] = g[2]; }
    x.putImageData(im, 0, 0); greyCache.set(ck, c); return c;
  };

  let T, renderer, scene, sprScene, camera, sun, mist, landMat, waterMat, riverMat, tileGroup, edgeMat, edgeScene, edgeCam, depthRT, depthOnly, uT, uMist, P, motes, moteGeo, moteMat, mPos, mSeed, shadowGeo, shadowMat;
  const SEA_Y = 0.1, DEPTH = 2.6, INK = 0x2b2140;

  /* ---------- the band on the map ---------- */
  const G = (M.G = { zoom: 1, follow: true, cam: { x: 0, z: 0 }, fx: [], dots: [], now: 0, band: null, onStep: null, onArrive: null, onTap: null, sprites: () => [], marker: null });
  const lerp = (a, b, t) => a + (b - a) * t;
  M.placeBand = (t) => {
    G.band = { from: t, to: null, prog: 0, path: [], x: t.x, z: t.z, trail: [], face: 1, intent: null };
    for (let i = 0; i < 60; i++) G.band.trail.push({ x: t.x - i * 0.04, z: t.z, face: 1 });
    G.cam.x = t.x; G.cam.z = t.z;
  };
  M.here = () => (G.band ? G.band.to || G.band.from : null);
  M.travel = (path, intent) => { const b = G.band; b.path = path.slice(); b.intent = intent || null; G.dots = path.slice(); G.follow = true; };
  M.stop = () => { if (G.band) { G.band.path = []; G.dots = []; } };
  M.moving = () => !!(G.band && (G.band.to || G.band.path.length));
  M.speed = 2.4;

  /* ---------- tile songs: shown colour follows the save, and a capture sends a ripple out ---------- */
  M.songOf = () => 0;   // set by the screen: what colour a tile should have now (0..1)
  M.ripple = (from, ids) => { for (const t of W.list) if (ids(t)) t.delay = G.now + 0.4 + Math.hypot(t.x - from.x, t.z - from.z) * 0.07; };
  M.puff = (x, z, n, col) => { for (let i = 0; i < (n || 8); i++) { const a = Math.random() * 6.28, sp = 0.6 + Math.random(); G.fx.push({ k: 'puff', x, z, y: 0.4, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp * 0.6, vy: 0.6 + Math.random(), life: 0, max: 0.6 + Math.random() * 0.3, col: col || '#ffffff' }); } };
  M.notes = (x, z, n) => { for (let i = 0; i < (n || 5); i++) G.fx.push({ k: 'note', x: x + (Math.random() - 0.5) * 1.2, z: z + (Math.random() - 0.5) * 0.6, y: 0.6, vx: (Math.random() - 0.5) * 0.4, vz: 0, vy: 0.9 + Math.random() * 0.5, life: -i * 0.15, max: 1.6, col: ['#ff6aa0', '#2ecb6e', '#4aa8f0', '#ffc928', '#ff9234'][i % 5] }); };

  /* ---------- building the scene, once ---------- */
  function build() {
    if (M.ready) return; M.ready = true; T = window.THREE;
    renderer = new T.WebGLRenderer({ antialias: true }); renderer.autoClear = false;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
    M.canvas = renderer.domElement; M.canvas.className = 'rd-canvas';
    scene = new T.Scene(); sprScene = new T.Scene(); mist = new T.Color('#f2eef8');
    scene.background = mist; scene.fog = new T.Fog(mist, 16, 30);
    camera = new T.PerspectiveCamera(36, 1, 0.5, 140);
    scene.add(new T.HemisphereLight(0xffffff, 0xc4bce0, 0.62));
    sun = new T.DirectionalLight(0xfff3e0, 0.52);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03;
    scene.add(sun); scene.add(sun.target);
    const grad = new T.DataTexture(new Uint8Array([168, 168, 168, 255, 220, 220, 220, 255, 255, 255, 255, 255]), 3, 1, T.RGBAFormat);
    grad.minFilter = grad.magFilter = T.NearestFilter; grad.needsUpdate = true;
    uT = { value: 0 }; uMist = { value: mist.clone() };
    const NOISE = 'float hn(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hn(i), hn(i + vec2(1.0, 0.0)), f.x), mix(hn(i + vec2(0.0, 1.0)), hn(i + vec2(1.0, 1.0)), f.x), f.y); }';
    const make = (grid, opt) => {
      const mat = new T.MeshToonMaterial({ vertexColors: true, gradientMap: grad });
      mat.onBeforeCompile = (sh) => {
        sh.uniforms.uT = uT; sh.uniforms.uMist = uMist;
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform float uT;' + (opt.sway ? '\nattribute float sway;' : ''))
          .replace('#include <begin_vertex>', '#include <begin_vertex>\n' +
            (opt.sway ? '{ vec4 w0 = modelMatrix * vec4(transformed, 1.0); transformed.x += sin(uT * 1.7 + w0.x * 0.8 + w0.z * 0.5) * 0.028 * sway; transformed.z += cos(uT * 1.3 + w0.z * 0.7) * 0.018 * sway; }' : '') +
            (opt.wave ? '{ vec4 w = modelMatrix * vec4(transformed, 1.0); transformed.y += sin(w.x * 1.1 + uT * 1.3) * 0.02 + sin(w.z * 1.4 - uT * 1.1 + w.x * 0.4) * 0.015; }' : ''))
          .replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform float uT; uniform vec3 uMist;\nfloat hexd(vec2 p){ p = abs(p); return max(p.x, dot(p, vec2(0.5, 0.8660254))); }\n' + NOISE)
          .replace('#include <color_fragment>', `#include <color_fragment>
            { vec2 r = vec2(1.7320508, 3.0), h = r * 0.5; vec2 a = mod(vWP.xz, r) - h, b = mod(vWP.xz - h, r) - h; vec2 g = dot(a, a) < dot(b, b) ? a : b;
              float e = 1.0 - smoothstep(0.0, 0.035, abs(hexd(g) - 0.8660254)); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.17, 0.13, 0.25), e * ${grid}); }
            { float c = vn(vWP.xz * 0.07 + uT * vec2(0.05, 0.02)) * 0.65 + vn(vWP.xz * 0.17 - uT * vec2(0.03, 0.04)) * 0.35; diffuseColor.rgb *= 1.0 - smoothstep(0.52, 0.7, c) * 0.12; }` +
            (opt.wave ? '\n{ float n = sin(vWP.x * 3.1 + uT * 1.7) * sin(vWP.z * 2.3 - uT * 1.3); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), smoothstep(0.82, 0.95, n) * 0.45); }' : ''))
          .replace('#include <fog_fragment>', `{ float mh = 1.0 - smoothstep(0.05, 0.32, vWP.y), mn = vn(vWP.xz * 0.11 + vec2(uT * 0.05, uT * 0.01)) * 0.7 + vn(vWP.xz * 0.31 - uT * 0.04) * 0.3;
              gl_FragColor.rgb = mix(gl_FragColor.rgb, uMist, mh * 0.32 * smoothstep(0.45, 0.85, mn)); }
            #include <fog_fragment>`);
      };
      return mat;
    };
    landMat = make(0.1, { sway: true }); waterMat = make(0.05, { wave: true }); riverMat = make(0, { wave: true });
    tileGroup = new T.Group(); scene.add(tileGroup);
    // low-poly pieces, built once
    const M4 = new T.Matrix4(), Qn = new T.Quaternion(), Eu = new T.Euler(), Vs = new T.Vector3(), Vp = new T.Vector3();
    const flat = (geo) => { const g = geo.index ? geo.toNonIndexed() : geo; g.computeVertexNormals(); return g; };
    const merge = (parts) => {
      const pos = [], nor = [];
      for (const [geo, x, y, z, rx, ry, rz, s, sy] of parts) { const g = flat(geo.clone()); Eu.set(rx || 0, ry || 0, rz || 0); Qn.setFromEuler(Eu); M4.compose(Vp.set(x || 0, y || 0, z || 0), Qn, Vs.set(s || 1, (s || 1) * (sy || 1), s || 1)); g.applyMatrix4(M4); pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); }
      const out = new T.BufferGeometry(); out.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); return out;
    };
    P = {
      trunk: merge([[new T.CylinderGeometry(0.035, 0.05, 0.32, 5), 0, 0.16, 0]]),
      blob: merge([[new T.IcosahedronGeometry(0.25, 0), 0, 0.5, 0], [new T.IcosahedronGeometry(0.17, 0), 0.13, 0.62, 0.06]]),
      pine: merge([[new T.ConeGeometry(0.23, 0.46, 7), 0, 0.36, 0], [new T.ConeGeometry(0.18, 0.4, 7), 0, 0.58, 0], [new T.ConeGeometry(0.12, 0.3, 7), 0, 0.78, 0]]),
      snowtip: merge([[new T.ConeGeometry(0.075, 0.13, 7), 0, 0.9, 0]]),
      bush: merge([[new T.IcosahedronGeometry(0.14, 0), 0, 0.08, 0, 0, 0, 0, 1, 0.7], [new T.IcosahedronGeometry(0.1, 0), 0.1, 0.06, 0.04, 0, 0, 0, 1, 0.7]]),
      cactus: merge([[new T.CylinderGeometry(0.055, 0.065, 0.5, 6), 0, 0.25, 0], [new T.CylinderGeometry(0.035, 0.035, 0.18, 5), 0.12, 0.36, 0], [new T.CylinderGeometry(0.035, 0.035, 0.1, 5), 0.075, 0.27, 0, 0, 0, Math.PI / 2]]),
      rock: merge([[new T.DodecahedronGeometry(0.12, 0), 0, 0.05, 0, 0.3, 0.6, 0, 1, 0.65]]),
      tuft: merge([[new T.ConeGeometry(0.02, 0.16, 3), 0, 0.08, 0, 0, 0, 0.25], [new T.ConeGeometry(0.02, 0.2, 3), 0.04, 0.1, 0.02, 0.1, 0, -0.1], [new T.ConeGeometry(0.02, 0.14, 3), -0.03, 0.07, 0.03, -0.2, 0, -0.3]]),
      flower: merge([[new T.IcosahedronGeometry(0.035, 0), 0, 0.12, 0], [new T.IcosahedronGeometry(0.03, 0), 0.07, 0.09, 0.04]]),
      reed: merge([[new T.ConeGeometry(0.02, 0.36, 3), 0, 0.18, 0], [new T.ConeGeometry(0.02, 0.3, 3), 0.06, 0.15, 0.03, 0, 0, -0.15], [new T.ConeGeometry(0.02, 0.32, 3), -0.05, 0.16, -0.02, 0, 0, 0.15]]),
      cat: merge([[new T.CylinderGeometry(0.03, 0.03, 0.08, 5), 0, 0.37, 0], [new T.CylinderGeometry(0.028, 0.028, 0.07, 5), 0.085, 0.31, 0.03]]),
      lily: merge([[new T.CylinderGeometry(0.11, 0.11, 0.015, 8), 0, 0, 0]]),
      plank: merge([[new T.BoxGeometry(0.34, 0.05, 0.86), 0, 0, 0], [new T.BoxGeometry(0.03, 0.12, 0.86), 0.16, 0.08, 0], [new T.BoxGeometry(0.03, 0.12, 0.86), -0.16, 0.08, 0]]),
    };
    // drifting motes
    const MOTES = 150; mPos = new Float32Array(MOTES * 3); mSeed = Array.from({ length: MOTES }, () => [Math.random(), Math.random(), Math.random()]);
    moteGeo = new T.BufferGeometry(); moteGeo.setAttribute('position', new T.BufferAttribute(mPos, 3));
    const dc = A.make(32, 32), dx = dc.getContext('2d'), dg = dx.createRadialGradient(16, 16, 0, 16, 16, 16); dg.addColorStop(0, 'rgba(255,255,255,1)'); dg.addColorStop(0.5, 'rgba(255,255,255,.6)'); dg.addColorStop(1, 'rgba(255,255,255,0)'); dx.fillStyle = dg; dx.fillRect(0, 0, 32, 32);
    moteMat = new T.PointsMaterial({ size: 0.11, map: new T.CanvasTexture(dc), transparent: true, depthWrite: false, opacity: 0.75, color: 0xfff6c0 });
    motes = new T.Points(moteGeo, moteMat); motes.layers.set(1); motes.frustumCulled = false; scene.add(motes);
    // ink contours
    depthRT = new T.WebGLRenderTarget(1, 1); depthRT.depthTexture = new T.DepthTexture(1, 1); depthRT.depthTexture.type = T.UnsignedIntType;
    depthOnly = new T.MeshBasicMaterial({ colorWrite: false });
    edgeMat = new T.ShaderMaterial({
      transparent: true, depthTest: false, depthWrite: false,
      uniforms: { tDepth: { value: depthRT.depthTexture }, px: { value: new T.Vector2() }, cNear: { value: camera.near }, cFar: { value: camera.far }, ink: { value: new T.Color(INK) }, fogNear: { value: 16 }, fogFar: { value: 30 }, thr: { value: 0.0065 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `#include <packing>
        uniform sampler2D tDepth; uniform vec2 px; uniform float cNear, cFar, fogNear, fogFar, thr; uniform vec3 ink; varying vec2 vUv;
        float iz(vec2 uv){ return -1.0 / perspectiveDepthToViewZ(texture2D(tDepth, uv).x, cNear, cFar); }
        void main(){
          float c = iz(vUv), l = iz(vUv - vec2(px.x, 0.0)), r = iz(vUv + vec2(px.x, 0.0)), d = iz(vUv - vec2(0.0, px.y)), u = iz(vUv + vec2(0.0, px.y));
          float lap = max(abs(l + r - 2.0 * c), abs(d + u - 2.0 * c)) / c;
          gl_FragColor = vec4(ink, smoothstep(thr, thr * 2.0, lap) * (1.0 - smoothstep(fogNear, fogFar, 1.0 / c)) * 0.8);
        }`,
    });
    edgeScene = new T.Scene(); edgeCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1); edgeScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), edgeMat));
    shadowGeo = new T.CircleGeometry(0.5, 20).rotateX(-Math.PI / 2); shadowMat = new T.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.18, depthWrite: false });
    camera.layers.enable(1);
    bindInput(M.canvas);
  }

  /* ---------- a tile: land, small plants and water, each its own mesh ---------- */
  const CORN = [0, 1, 2, 3, 4, 5].map((k) => [Math.cos(Math.PI / 6 + (k * Math.PI) / 3), Math.sin(Math.PI / 6 + (k * Math.PI) / 3)]);
  const KEY = ['water', 'shore', 'low', 'forest', 'hill', 'mount'];
  const segD = (px, pz, bx, bz) => { const l2 = bx * bx + bz * bz, k = Math.max(0, Math.min(1, (px * bx + pz * bz) / l2)); return Math.hypot(px - bx * k, pz - bz * k); };
  const rnd = (t, i) => W.hash(t.q * 41 + i * 7, t.r * 23 - i * 3);
  const mixHex = (a, b, k) => { const x = rgb(a), y = rgb(b); return [0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * k); };
  function vcol(t, y, ny, wx, wz) {
    const pal = W.REG[t.reg].pal, snow = t.reg === 'ridge' ? 1.5 : t.reg === 'dunes' ? 9 : 1.95;
    if (y > snow + (W.vnoise(wx * 3, wz * 3) - 0.5) * 0.25 && ny > 0.3) return rgb('#ffffff');
    if (ny < 0.62 || y > 0.95) return rgb(y > 0.55 ? pal.mount : pal.wall);
    if (y < 0.16) return rgb(pal.shore);
    const base = pal[KEY[Math.min(4, t.kind)]], n = W.vnoise(wx * 0.9 + 7, wz * 0.9 + 3), n2 = W.vnoise(wx * 2.6, wz * 2.6);
    const c = mixHex(base, pal.grass, t.kind <= 3 ? Math.max(0, n - 0.45) * 1.2 : 0), k = 0.94 + n2 * 0.1;
    return c.map((v) => v * k);
  }
  class Bucket {
    constructor() { this.pos = []; this.nor = []; this.col = []; this.sw = []; }
    tri(a, b, c, rgbOf, outward) {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const mx = (a[0] + b[0] + c[0]) / 3, mz = (a[2] + b[2] + c[2]) / 3;
      if (outward ? nx * mx + nz * mz < 0 : ny < 0) { [b, c] = [c, b]; nx = -nx; ny = -ny; nz = -nz; }
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      const c0 = typeof rgbOf === 'function' ? rgbOf((a[1] + b[1] + c[1]) / 3, ny, mx, mz) : rgbOf, lit = 0.8 + 0.2 * Math.max(0, nx * -0.55 + ny * 0.75 + nz * 0.36);
      for (const p of [a, b, c]) { this.pos.push(p[0], p[1], p[2]); this.nor.push(nx, ny, nz); this.col.push(c0[0] * lit, c0[1] * lit, c0[2] * lit); this.sw.push(0); }
    }
    put(geo, x, y, z, s, ry, c3, sway, sy) {
      const p = geo.attributes.position.array, n = geo.attributes.normal.array, c = Math.cos(ry || 0), sn = Math.sin(ry || 0), h = s * (sy || 1);
      for (let i = 0; i < p.length; i += 3) {
        const lx = p[i] * s, ly = p[i + 1] * h, lz = p[i + 2] * s;
        this.pos.push(x + lx * c - lz * sn, y + ly, z + lx * sn + lz * c); this.nor.push(n[i] * c - n[i + 2] * sn, n[i + 1], n[i] * sn + n[i + 2] * c);
        this.col.push(c3[0], c3[1], c3[2]); this.sw.push(sway ? Math.max(0, p[i + 1]) * sway : 0);
      }
    }
    mesh(mat, t) {
      if (!this.pos.length) return null;
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(this.nor, 3));
      g.setAttribute('color', new T.Float32BufferAttribute(new Float32Array(this.col.length), 3)); g.setAttribute('sway', new T.Float32BufferAttribute(this.sw, 1));
      g.computeBoundingSphere();
      const grey = new Float32Array(this.col.length);
      for (let i = 0; i < this.col.length; i += 3) { const gg = greyOf([this.col[i], this.col[i + 1], this.col[i + 2]]); grey[i] = gg[0]; grey[i + 1] = gg[1]; grey[i + 2] = gg[2]; }
      const m = new T.Mesh(g, mat); m.userData = { t, base: new Float32Array(this.col), grey }; return m;
    }
  }
  function buildTile(t) {
    const water = t.kind === 0, N = water ? 3 : t.kind >= 4 ? 7 : 5, pal = W.REG[t.reg].pal, reg = t.reg;
    const land = new Bucket(), det = new Bucket(), wat = new Bucket();
    const Y = (x, z) => (water ? SEA_Y : Math.max(SEA_Y + 0.02, W.H(t.x + x, t.z + z)));
    const top = water ? rgb(pal.water) : (y, ny, x, z) => vcol(t, y, ny, t.x + x, t.z + z);
    const side = rgb(water ? pal.water : pal.wall), dest = water ? wat : land;
    for (let k = 0; k < 6; k++) {
      const B = CORN[k], C = CORN[(k + 1) % 6], Pt = [];
      for (let i = 0; i <= N; i++) { Pt.push([]); for (let j = 0; j <= N - i; j++) { const x = (B[0] * i) / N + (C[0] * j) / N, z = (B[1] * i) / N + (C[1] * j) / N; Pt[i].push([x, Y(x, z), z]); } }
      for (let i = 0; i < N; i++) for (let j = 0; j < N - i; j++) { dest.tri(Pt[i][j], Pt[i + 1][j], Pt[i][j + 1], top); if (i + j < N - 1) dest.tri(Pt[i + 1][j], Pt[i + 1][j + 1], Pt[i][j + 1], top); }
      for (let s = 0; s < N; s++) { const a = Pt[N - s][s], b = Pt[N - s - 1][s + 1], dep = water ? SEA_Y - 0.12 : -DEPTH; dest.tri(a, b, [b[0], dep, b[2]], side, true); dest.tri(a, [b[0], dep, b[2]], [a[0], dep, a[2]], side, true); }
    }
    const clear = (x, z, r) => { if (t.poi && Math.hypot(x, z) < 0.6) return false; for (const n of t.road) if (segD(x, z, (n.x - t.x) / 2, (n.z - t.z) / 2) < r) return false; return W.riverD(t.x + x, t.z + z) > r + 0.12; };
    const spots = (n, seed, rad) => { const out = []; for (let i = 0; i < n * 3 && out.length < n; i++) { const a = rnd(t, seed + i) * 6.283, r = Math.sqrt(rnd(t, seed + 50 + i)) * (rad || 0.8), x = Math.cos(a) * r, z = Math.sin(a) * r; if (clear(x, z, 0.2)) out.push([x, z, rnd(t, seed + 90 + i)]); } return out; };
    const shade = (hex, k) => rgb(hex).map((v) => v * (0.9 + k * 0.2));
    if (!water) {
      const nTree = t.kind === 3 ? (reg === 'dunes' ? 3 : 9) : t.kind === 2 ? (rnd(t, 2) > 0.72 ? 1 : 0) : t.kind === 4 ? (rnd(t, 2) > 0.45 ? 2 : 0) : 0;
      for (const [x, z, k] of spots(nTree, 10, 0.82)) {
        const y0 = Y(x, z); if (y0 > 1.15) continue;
        const s = 0.7 + k * 0.55, ry = k * 6.28;
        if (reg === 'ridge') { land.put(P.trunk, x, y0, z, s, ry, rgb('#7a5236'), 0.3); land.put(P.pine, x, y0, z, s, ry, shade(pal.tree, k), 0.9); land.put(P.snowtip, x, y0, z, s, ry, rgb('#ffffff'), 0.9); }
        else if (reg === 'dunes') { if (k > 0.5) land.put(P.cactus, x, y0, z, s * 0.9, ry, shade('#4fae6a', k), 0); else det.put(P.bush, x, y0, z, s * 1.2, ry, shade('#b8b060', k), 0.6); }
        else { const autumn = ['#e0783e', '#ffb050', '#e8503a', '#ffd060', '#c4a040'], c = reg === 'works' ? autumn[Math.floor(k * 4.99)] : k > 0.5 ? pal.tree : pal.tree2; land.put(P.trunk, x, y0, z, s, ry, rgb('#7a5236'), 0.3); land.put(P.blob, x, y0, z, s * (reg === 'marsh' && k > 0.7 ? 1.2 : 1), ry, shade(c, k), 0.8, reg === 'marsh' && k > 0.7 ? 0.8 : 1); }
      }
      if (t.kind === 3 && reg !== 'dunes') for (const [x, z, k] of spots(4, 200, 0.85)) det.put(P.bush, x, Y(x, z), z, 0.8 + k * 0.5, k * 6, shade(pal.tree2, k * 0.6), 0.5);
      const nTuft = t.kind === 2 ? 8 : t.kind === 4 ? 5 : t.kind === 1 ? 3 : t.kind === 3 ? 2 : 0;
      for (const [x, z, k] of spots(nTuft, 300, 0.9)) det.put(P.tuft, x, Y(x, z), z, 0.9 + k * 0.6, k * 6.28, shade(reg === 'dunes' ? '#c8a858' : pal.grass, k * 0.5 - 0.15), 1.6);
      if (t.kind === 2 && reg !== 'dunes') { const fl = ['#ff6aa0', '#ffffff', '#ffc928', '#b48cff']; for (const [x, z, k] of spots(3, 400, 0.85)) det.put(P.flower, x, Y(x, z), z, 1, k * 6, rgb(fl[Math.floor(k * 3.99)]), 1.2); }
      const nRock = t.kind === 4 ? 3 : t.kind === 5 ? 2 : reg === 'dunes' ? 2 : rnd(t, 5) > 0.7 ? 1 : 0;
      for (const [x, z, k] of spots(nRock, 500, 0.8)) land.put(P.rock, x, Y(x, z), z, 0.7 + k * 1.1, k * 6, shade(pal.rock, k), 0);
      if (reg === 'marsh' && t.kind <= 2) for (const [x, z, k] of spots(3, 600, 0.85)) { const y0 = Y(x, z); det.put(P.reed, x, y0, z, 0.9 + k * 0.4, k * 6, shade('#4f9a4a', k), 1.4); det.put(P.cat, x, y0, z, 0.9 + k * 0.4, k * 6, rgb('#8a5a3a'), 1.4); }
      for (const n of t.road) {
        const ex = (n.x - t.x) / 2, ez = (n.z - t.z) / 2, L = Math.hypot(ex, ez), px = -ez / L, pz = ex / L, S = 6;
        for (const [w, lift, hex] of [[0.17, 0.03, '#c9a467'], [0.11, 0.045, '#f8e6b8']]) {
          const c3 = rgb(hex), pt = (k, sd) => { const x = (ex * k) / S - (ex / L) * (k === 0 ? w : 0) + px * w * sd, z = (ez * k) / S - (ez / L) * (k === 0 ? w : 0) + pz * w * sd; return [x, Y(x, z) + lift, z]; };
          for (let k = 0; k < S; k++) { const a = pt(k, -1), b = pt(k, 1), c = pt(k + 1, 1), d = pt(k + 1, -1); land.tri(a, b, c, c3); land.tri(a, c, d, c3); }
        }
      }
      if (t.river.length) {
        const wc = rgb(pal.water).map((v) => Math.min(255, v * 1.05)), WY = (x, z) => Y(x, z) + 0.075;
        for (const n of t.river) {
          const ex = (n.x - t.x) / 2, ez = (n.z - t.z) / 2, L = Math.hypot(ex, ez), px = -ez / L, pz = ex / L, S = 6, w = 0.2;
          const pt = (k, sd) => { const x = (ex * k) / S + px * w * sd, z = (ez * k) / S + pz * w * sd; return [x, WY(x, z), z]; };
          for (let k = 0; k < S; k++) { const a = pt(k, -1), b = pt(k, 1), c = pt(k + 1, 1), d = pt(k + 1, -1); wat.tri(a, b, c, wc); wat.tri(a, c, d, wc); }
        }
        const ring = Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * 6.283, x = Math.cos(a) * 0.2, z = Math.sin(a) * 0.2; return [x, WY(x, z), z]; });
        for (let i = 0; i < 8; i++) wat.tri([0, WY(0, 0), 0], ring[i], ring[i + 1], wc);
        if (t.road.length) { const n = t.road[0], ang = Math.atan2(n.x - t.x, n.z - t.z); land.put(P.plank, 0, Y(0, 0) + 0.2, 0, 1, ang, rgb('#a8724a'), 0); }
      }
    } else if (reg === 'marsh') for (const [x, z, k] of spots(3, 800, 0.8)) det.put(P.lily, x, SEA_Y + 0.03, z, 0.8 + k * 0.6, k * 6, shade('#5cc472', k), 0);
    const grp = new T.Group(); grp.position.set(t.x, 0, t.z); grp.userData.t = t;
    const lm = land.mesh(landMat, t), dm = det.mesh(landMat, t), wm = wat.mesh(t.river.length && !water ? riverMat : waterMat, t);
    if (lm) { lm.castShadow = true; lm.receiveShadow = true; grp.add(lm); }
    if (dm) { dm.receiveShadow = true; dm.layers.set(1); grp.add(dm); }
    if (wm) { wm.receiveShadow = true; grp.add(wm); }
    grp.userData.parts = grp.children.slice(); grp.userData.song = -1;
    recolour(grp, t.song || 0);
    return grp;
  }
  function recolour(grp, song) {
    const k = 0.3 + 0.7 * song;
    for (const m of grp.userData.parts) { const c = m.geometry.attributes.color.array, b = m.userData.base, g = m.userData.grey; for (let i = 0; i < c.length; i++) c[i] = (g[i] + (b[i] - g[i]) * k) / 255; m.geometry.attributes.color.needsUpdate = true; }
    grp.userData.song = song;
  }

  /* ---------- sprites: Hushsong's own sticker art, facing the camera ---------- */
  const texCache = new Map();
  const tex = (key, grey) => { const ck = key + (grey ? '|g' : ''); if (texCache.has(ck)) return texCache.get(ck); const tx = new T.CanvasTexture(M.sprite(key, grey, 256)); tx.anisotropy = 4; texCache.set(ck, tx); return tx; };
  const fxTex = new Map();
  const fxT = (k, col) => {
    const ck = k + col; if (fxTex.has(ck)) return fxTex.get(ck);
    const c = A.make(64, 64), x = c.getContext('2d'); x.lineWidth = 6; x.strokeStyle = '#2b2140'; x.fillStyle = col;
    if (k === 'note') { x.beginPath(); x.ellipse(24, 46, 12, 9, -0.4, 0, 6.29); x.fill(); x.stroke(); x.beginPath(); x.moveTo(35, 44); x.lineTo(35, 10); x.lineTo(50, 20); x.stroke(); }
    else { x.beginPath(); x.arc(32, 32, 22, 0, 6.29); x.fill(); x.stroke(); }
    const t = new T.CanvasTexture(c); fxTex.set(ck, t); return t;
  };
  const pool = [], shadows = [];
  const sprite = (i) => {
    if (!pool[i]) { const s = new T.Sprite(new T.SpriteMaterial({ transparent: true, depthWrite: false, fog: false })); s.center.set(0.5, 0.15); sprScene.add(s); pool[i] = s; }
    const s = pool[i]; s.visible = true; s.userData = {}; s.renderOrder = 0; s.material.depthTest = true; return s;
  };
  const shadow = (i) => { if (!shadows[i]) { const m = new T.Mesh(shadowGeo, shadowMat); m.layers.set(1); scene.add(m); shadows[i] = m; } shadows[i].visible = true; return shadows[i]; };

  /* ---------- attach to a screen, and the loop ---------- */
  let box = null, Wd = 1, Ht = 1, raf = 0, last = 0, first = true;
  M.attach = (el) => {
    box = el; el.appendChild(M.canvas); first = true;
    for (const t of W.list) { t.b3 = null; if (t.song == null) t.song = M.songOf(t); }
    tileGroup.clear(); resize(); last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  };
  M.detach = () => { cancelAnimationFrame(raf); raf = 0; if (M.canvas && M.canvas.parentNode) M.canvas.parentNode.removeChild(M.canvas); box = null; };
  const resize = () => {
    if (!box) return; const r = box.getBoundingClientRect(); Wd = Math.max(1, r.width); Ht = Math.max(1, r.height); const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr); renderer.setSize(Wd, Ht, false); camera.aspect = Wd / Ht; camera.updateProjectionMatrix();
    depthRT.setSize(Math.round(Wd * dpr), Math.round(Ht * dpr)); edgeMat.uniforms.px.value.set(1 / (Wd * dpr), 1 / (Ht * dpr));
  };
  window.addEventListener('resize', () => setTimeout(resize, 50));

  const PITCH = 0.94, look = { x: 0, z: 0 };
  let D = 15;
  const placeCamera = () => {
    const s2 = Math.max(22, Math.min(Wd, Ht * 0.78) / 11.5) * G.zoom, span = Wd / s2;
    D = Math.max(8, Math.min(34, (span * 0.95) / (2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect)));
    look.x = G.cam.x; look.z = G.cam.z;
    camera.position.set(G.cam.x, 0.3 + D * Math.sin(PITCH), G.cam.z + D * Math.cos(PITCH)); camera.lookAt(G.cam.x, 0.3, G.cam.z); camera.updateMatrixWorld();
    scene.fog.near = D * 0.95; scene.fog.far = D * 1.6; edgeMat.uniforms.fogNear.value = scene.fog.near; edgeMat.uniforms.fogFar.value = scene.fog.far;
    sun.position.set(G.cam.x - 11, 11, G.cam.z + 6); sun.target.position.set(G.cam.x, 0, G.cam.z - D * 0.2); sun.target.updateMatrixWorld();
    const sc = sun.shadow.camera, b = D * 0.9; if (sc.right !== b) { sc.left = -b; sc.right = b; sc.top = b; sc.bottom = -b; sc.near = 1; sc.far = 60; sc.updateProjectionMatrix(); }
  };
  // land grows out of the mist: a smooth rise, never more than a few new tiles built in one frame
  const RISE = 0.85, ease = (x) => 1 - Math.pow(1 - x, 3);
  const popOf = (t) => (t && t.b3 != null ? W.sat((G.now - t.b3) / RISE) : 0);
  const riseOf = (t) => -(1 - ease(popOf(t))) * 1.4;
  M.popOf = popOf;
  const groundY = (x, z) => { const t = W.at(...W.xzToHex(x, z)); return !t || t.kind === 0 ? SEA_Y : Math.max(SEA_Y + 0.02, W.H(x, z)); };
  M.groundY = groundY;
  let v3 = null, lastCam = null;

  function tick(dt) {
    G.now += dt; uT.value += dt;
    const b = G.band;
    if (b) {
      let rem = dt * M.speed;
      while (rem > 0) {
        if (!b.to) { if (!b.path.length) break; b.to = b.path.shift(); b.prog = 0; G.dots = b.path.slice(); }
        const len = Math.hypot(b.to.x - b.from.x, b.to.z - b.from.z) || 1, step = Math.min(rem, (1 - b.prog) * len);
        b.prog += step / len; rem -= step;
        if (b.prog >= 0.999) { b.from = b.to; b.to = null; b.prog = 0; const stop = G.onStep && G.onStep(b.from); if (stop) { b.path = []; G.dots = []; break; } if (!b.path.length) { G.dots = []; const it = b.intent; b.intent = null; if (G.onArrive) G.onArrive(b.from, it); break; } }
      }
      const f = b.from, t = b.to || b.from, nx = lerp(f.x, t.x, b.prog), nz = lerp(f.z, t.z, b.prog);
      if (Math.abs(nx - b.x) > 0.001) b.face = nx > b.x ? 1 : -1;
      b.x = nx; b.z = nz;
      const tr = b.trail[0]; if (Math.hypot(tr.x - b.x, tr.z - b.z) > 0.04) b.trail.unshift({ x: b.x, z: b.z, face: b.face }); if (b.trail.length > 80) b.trail.pop();
      if (G.follow) { const k = 1 - Math.exp(-dt * 4); G.cam.x += (b.x - G.cam.x) * k; G.cam.z += (b.z - G.cam.z) * k; }
    }
    for (const t of W.list) { const target = M.songOf(t); if (t.song == null) t.song = target; if (t.song < target && G.now >= (t.delay || 0)) t.song = Math.min(target, t.song + dt * 1.6); else if (t.song > target) t.song = target; }
    for (const p of G.fx) { p.life += dt; if (p.life < 0) continue; p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt; p.vy -= (p.k === 'puff' ? 1.2 : 0) * dt; }
    G.fx = G.fx.filter((p) => p.life < p.max);
  }
  M.at = (dist) => { const b = G.band; let acc = 0; for (let i = 1; i < b.trail.length; i++) { const p = b.trail[i - 1], q = b.trail[i], l = Math.hypot(p.x - q.x, p.z - q.z); if (acc + l >= dist) { const k = (dist - acc) / l; return { x: lerp(p.x, q.x, k), z: lerp(p.z, q.z, k), face: p.face || 1 }; } acc += l; } return b.trail[b.trail.length - 1]; };

  function render() {
    if (!v3) { v3 = new T.Vector3(); lastCam = new T.Vector3(1e9, 0, 0); }
    placeCamera();
    const now = G.now, R = D * 1.9; let rising = false, builds = 0;
    const want = [];
    for (const t of W.list) {
      if (Math.abs(t.x - G.cam.x) > R || Math.abs(t.z - G.cam.z) > R) { if (t.m3 && t.m3.parent) tileGroup.remove(t.m3); t.b3 = null; continue; }
      v3.set(t.x, t.kind ? Math.min(1.2, W.STEP[t.kind] * 2) : SEA_Y, t.z).project(camera);
      const on = v3.z < 1 && v3.x > -1.15 && v3.x < 1.15 && v3.y > -1.28 && v3.y < 1.15;
      if (on) {
        t.off = 0;
        if (!t.m3) { want.push([Math.hypot(v3.x, v3.y), t]); continue; }
        if (!t.m3.parent) tileGroup.add(t.m3);
        if (t.b3 == null) t.b3 = now + (first ? Math.hypot(v3.x, v3.y) * 0.5 : W.hash(t.q, t.r) * 0.18);
      } else if (t.m3 && t.m3.parent) { t.off = (t.off || 0) + 1 / 60; if (t.off > 1.2) { tileGroup.remove(t.m3); t.b3 = null; } }
      if (t.m3 && t.m3.parent) {
        const p = popOf(t); if (p < 1) rising = true;
        const e = ease(p); t.m3.position.y = riseOf(t); t.m3.scale.y = 0.35 + 0.65 * e; t.m3.visible = p > 0;
        if (Math.abs(t.m3.userData.song - t.song) > 0.02 || (t.m3.userData.song !== t.song && t.song === M.songOf(t))) recolour(t.m3, t.song);
      }
    }
    // build the nearest missing tiles first, a few per frame, so the frame rate stays smooth
    want.sort((a, b) => a[0] - b[0]);
    for (const [, t] of want) { if (builds >= (first ? 400 : 5)) break; t.m3 = buildTile(t); builds++; }
    if (want.length > builds) rising = true;
    first = false;
    // motes
    const here = M.here(), reg = here ? here.reg : 'marsh';
    for (let i = 0; i < mPos.length / 3; i++) { const s = mSeed[i], span = R * 0.7; mPos[i * 3] = G.cam.x + (((s[0] * span + now * 0.08 * (0.6 + s[2]) + Math.sin(now * 0.7 + i) * 0.1) % span) + span) % span - span / 2; mPos[i * 3 + 1] = ((((s[1] * 2.6 + now * 0.15 * (0.5 + s[2])) % 2.6) + 2.6) % 2.6) + 0.15; mPos[i * 3 + 2] = G.cam.z + ((((s[2] * span + Math.cos(now * 0.5 + i) * 0.2) % span) + span) % span - span / 2) * 0.8; }
    moteGeo.attributes.position.needsUpdate = true; moteMat.color.set(reg === 'marsh' ? '#fff6c0' : '#ffffff');
    // sprites
    let si = 0, sh = 0;
    for (const sp of G.sprites()) {
      const tt = sp.tile || W.at(...W.xzToHex(sp.x, sp.z)), a = popOf(tt) * (sp.alpha == null ? 1 : sp.alpha);
      if (a <= 0.02) continue;
      const y = groundY(sp.x, sp.z) + riseOf(tt), w = sp.size * 1.5 * (sp.scale || 1);
      const put = (grey, op, nudge) => { const s = sprite(si++); s.material.map = tex(sp.key, grey); s.material.opacity = op; s.position.set(sp.x, y + (sp.hop || 0), sp.z + nudge); s.scale.set(sp.flip ? -w : w, w, 1); s.userData.sp = sp; };
      if (sp.band) { put(false, a * 0.35, 0); pool[si - 1].material.depthTest = false; pool[si - 1].renderOrder = -1; }
      if (sp.song != null) { put(true, a, 0); if (sp.song > 0.01) put(false, a * sp.song, 0.01); } else put(!!sp.grey, a, 0);
      if (!sp.noShadow) { const m = shadow(sh++); m.position.set(sp.x, y + 0.02, sp.z); m.scale.set(w * 0.62, 1, w * 0.3); }
    }
    for (const t of G.dots) { if (popOf(t) < 1) continue; const s = sprite(si++); s.material.map = fxT('dot', '#ffffff'); s.material.opacity = 1; const r = 0.2 + Math.sin(now * 6 - t.x) * 0.03; s.position.set(t.x, groundY(t.x, t.z) + 0.12, t.z); s.scale.set(r, r, 1); }
    for (const p of G.fx) { if (p.life < 0) continue; const k = p.life / p.max, s = sprite(si++); s.material.map = fxT(p.k, p.col); s.material.opacity = 1 - k * k; s.position.set(p.x, groundY(p.x, p.z) + p.y, p.z); const r = p.k === 'puff' ? 0.25 + k * 0.35 : 0.4; s.scale.set(r, r, 1); }
    for (let i = 0; i < pool.length; i++) { if (i >= si) pool[i].visible = false; else pool[i].center.set(0.5, pool[i].userData.sp ? 0.15 : 0.5); }
    for (let i = sh; i < shadows.length; i++) shadows[i].visible = false;
    // shadows are redrawn only when the view or the land has moved
    if (rising || lastCam.distanceToSquared(camera.position) > 0.01) { renderer.shadowMap.needsUpdate = true; lastCam.copy(camera.position); }
    renderer.setRenderTarget(depthRT); renderer.setClearColor(mist, 1); renderer.clear();
    camera.layers.set(0); scene.overrideMaterial = depthOnly; renderer.render(scene, camera); scene.overrideMaterial = null; camera.layers.enableAll();
    renderer.setRenderTarget(null); renderer.clear();
    renderer.render(scene, camera); renderer.render(edgeScene, edgeCam); renderer.render(sprScene, camera);
  }
  function loop(ms) {
    if (!box) return; const dt = Math.min(0.05, (ms - last) / 1000); last = ms;
    if (!box.isConnected) { M.detach(); return; }
    const r = box.getBoundingClientRect(); if (Math.abs(r.width - Wd) > 1 || Math.abs(r.height - Ht) > 1) resize();
    tick(dt); render(); if (M.onFrame) M.onFrame(dt);
    raf = requestAnimationFrame(loop);
  }

  /* ---------- picking, projection, input ---------- */
  let ray = null, ndc = null, plane = null, hitP = null;
  const aim = (px, py) => { if (!ray) { ray = new T.Raycaster(); ray.layers.enableAll(); ndc = new T.Vector2(); plane = new T.Plane(new T.Vector3(0, 1, 0), -0.3); hitP = new T.Vector3(); } ray.camera = camera; ndc.set((px / Wd) * 2 - 1, -(py / Ht) * 2 + 1); ray.setFromCamera(ndc, camera); };
  const local = (e) => { const r = M.canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  M.ground = (px, py) => { aim(px, py); return ray.ray.intersectPlane(plane, hitP) ? [hitP.x, hitP.z] : null; };
  M.pick = (px, py) => {
    aim(px, py);
    const sps = pool.filter((s) => s.visible && s.userData.sp && s.userData.sp.pick);
    const hs = ray.intersectObjects(sps, false);
    if (hs.length) return { s: hs[0].object.userData.sp, t: null };
    const ht = ray.intersectObjects(tileGroup.children, true);
    if (ht.length) return { t: W.at(...W.xzToHex(ht[0].point.x, ht[0].point.z)) || null, s: null };
    return { t: null, s: null };
  };
  // where a tile shows on screen, in pixels of the map box (null if behind the camera)
  M.project = (t, hgt) => { if (!v3) return null; const p = popOf(t); if (p <= 0) return null; v3.set(t.x, groundY(t.x, t.z) + riseOf(t) + (hgt || 0), t.z).project(camera); if (v3.z > 1) return null; return { x: (v3.x * 0.5 + 0.5) * Wd, y: (-v3.y * 0.5 + 0.5) * Ht, a: Math.min(1, p * 2) }; };
  function bindInput(el) {
    const pts = new Map(); let down = null, pinch = 0;
    el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); const p = local(e); pts.set(e.pointerId, p); if (pts.size === 1) down = { x: p[0], y: p[1], t: performance.now(), moved: false, last: p }; else { if (down) down.moved = true; pinch = 0; } });
    el.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return; const p = local(e); pts.set(e.pointerId, p);
      if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) G.zoom = Math.max(0.6, Math.min(1.8, G.zoom * (d / pinch))); pinch = d; return; }
      if (!down) return;
      if (!down.moved && Math.hypot(p[0] - down.x, p[1] - down.y) > 8) { down.moved = true; G.follow = false; }
      if (down.moved) { const g0 = M.ground(down.last[0], down.last[1]), g1 = M.ground(p[0], p[1]); if (g0 && g1) { G.cam.x += g0[0] - g1[0]; G.cam.z += g0[1] - g1[1]; } down.last = p; }
    });
    const up = (e) => { pts.delete(e.pointerId); if (down && !down.moved && pts.size === 0 && performance.now() - down.t < 500 && G.onTap) { const p = local(e), hit = M.pick(p[0], p[1]); G.onTap(hit.t, hit.s); } if (pts.size === 0) down = null; pinch = 0; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', (e) => { pts.delete(e.pointerId); down = null; pinch = 0; });
    el.addEventListener('wheel', (e) => { e.preventDefault(); G.zoom = Math.max(0.6, Math.min(1.8, G.zoom * Math.exp(-e.deltaY * 0.0012))); }, { passive: false });
  }
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
