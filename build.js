// Bundles src/ into one self-contained page: dist/hushsong.html (published) and dist/test.html (same page inside the publish skeleton, for local runs).
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
// language packs and the extra letters each language needs (tools/i18n.js, tools/fonts.js)
execSync('node tools/i18n.js pack && (node tools/fonts.js || echo fonts: kept)', { cwd: __dirname, stdio: 'inherit' });
const opt = (f) => (fs.existsSync(path.join(__dirname, f)) ? fs.readFileSync(path.join(__dirname, f), 'utf8') : '');
const rd = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');
const b64 = (f) => fs.readFileSync(path.join(__dirname, 'node_modules/@fontsource', f)).toString('base64');
const fonts = [
  ['Baloo 2', 700, 'baloo-2/files/baloo-2-latin-700-normal.woff2'],
  ['Baloo 2', 800, 'baloo-2/files/baloo-2-latin-800-normal.woff2'],
  ['Nunito', 700, 'nunito/files/nunito-latin-700-normal.woff2'],
  ['Nunito', 800, 'nunito/files/nunito-latin-800-normal.woff2'],
].map(([fam, w, f]) => `@font-face{font-family:'${fam}';font-weight:${w};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${b64(f)}) format('woff2')}`).join('\n');
const js = ['i18n', 'data', 'engine', 'game', 'modes', 'net', 'art-core', 'art-pets', 'art-pets2', 'art-pets3', 'art-din', 'art-ui', 'art-modes', 'songs', 'themes', 'audio', 'ui-core', 'ui-screens', 'ui-modes', 'ui-ranks', 'ui-battle'].map((n) => `/* ---- ${n}.js ---- */\n` + rd(`src/${n}.js`) + (n === 'i18n' ? '\n' + opt('build/lang.js') + opt('i18n/fonts.js') : '')).join('\n');
const page = `<title>Hushsong</title>
<style>
${fonts}
${rd('src/style.css')}
</style>
<div id="app"><div id="game"><div id="screen"></div><div id="modal" hidden></div><div id="toast" hidden></div></div></div>
<script>
window.H = {};
${js}
(function () { const start = () => window.H.UI.boot(); const hot = window.claude && window.claude.hot; if (hot && hot.ready) hot.ready(start); else start(); })();
</script>
`;
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist/hushsong.html'), page);
fs.writeFileSync(path.join(__dirname, 'dist/test.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${page}</body></html>`);
console.log('built', (page.length / 1024).toFixed(0) + ' KB');
