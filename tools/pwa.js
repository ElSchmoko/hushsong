// Builds the installable web app into docs/ (served by GitHub Pages): node build.js && node tools/pwa.js
// docs/index.html is the same game as the Claude artifact, wrapped with an app manifest, icons and an offline cache.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.join(__dirname, '..'), out = path.join(root, 'docs'), icons = path.join(root, 'assets/icon/out');
const page = fs.readFileSync(path.join(root, 'dist/hushsong.html'), 'utf8').replace('<title>Hushsong</title>\n', '');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
fs.mkdirSync(path.join(out, 'icons'), { recursive: true });
const pngs = fs.readdirSync(icons).filter((f) => f.endsWith('.png'));

const INK = '#2b2140', CORAL = '#ff6b5e';
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Hushsong</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="A cosy creature battler where a band of music pets wakes a hushed world.">
<meta name="theme-color" content="${INK}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Hushsong">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="64x64" href="icons/favicon-64.png">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>
html { background: ${INK}; color-scheme: light; height: 100%; overscroll-behavior: none; }
body { margin: 0; height: 100%; overscroll-behavior: none; font: 14px system-ui; }
[hidden] { display: none !important; }
/* the game keeps clear of the notch and the home indicator; the strips around it stay ink */
#app { top: env(safe-area-inset-top, 0px) !important; bottom: env(safe-area-inset-bottom, 0px) !important; left: env(safe-area-inset-left, 0px) !important; right: env(safe-area-inset-right, 0px) !important; }
</style>
</head>
<body>
${page}
<script>
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
</script>
</body>
</html>
`;
const version = crypto.createHash('sha1').update(html).digest('hex').slice(0, 10);

const manifest = {
  name: 'Hushsong', short_name: 'Hushsong', id: './', start_url: './', scope: './',
  description: 'A cosy creature battler where a band of music pets wakes a hushed world.',
  display: 'standalone', orientation: 'portrait', background_color: CORAL, theme_color: INK,
  categories: ['games'],
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};

// The whole game is one page, so the cache is small: the page, the manifest and the icons.
// Opening the app online fetches the newest page first (so updates arrive on the next launch); offline it plays from the cache.
const files = ['./', 'index.html', 'manifest.webmanifest', ...pngs.map((f) => 'icons/' + f)];
const sw = `// Hushsong offline cache, version ${version}
const CACHE = 'hushsong-${version}', FILES = ${JSON.stringify(files)};
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { if (res.ok && (res.headers.get('content-type') || '').includes('text/html')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('index.html', copy)); } return res; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
`;

fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'sw.js'), sw);
fs.writeFileSync(path.join(out, '.nojekyll'), '');
for (const f of pngs) fs.copyFileSync(path.join(icons, f), path.join(out, 'icons', f));
// the Android app, when built (tools/apk.sh), is offered for download from the same site
const apk = path.join(root, 'build/android/hushsong.apk'); if (fs.existsSync(apk)) fs.copyFileSync(apk, path.join(out, 'hushsong.apk'));
console.log('pwa', version, 'v' + pkg.version, (html.length / 1024).toFixed(0) + ' KB', files.length + ' cached files');
