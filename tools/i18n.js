// Hushsong languages.
//   node tools/i18n.js keys    every English line the game can show → i18n/keys.json (key → where it is used)
//   node tools/i18n.js check   per language: missing keys, stale keys, broken {values} or <tags>
//   node tools/i18n.js pack    language packs (gzip, base64) → build/lang.js, read by build.js
// Keys come from two places: the code (tr('…'), H.T('…'), H.T.k('…') with a written-out string) and the game data,
// which is put through H.T while the data is translated and its moves are described.
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const acorn = require('acorn'), walk = require('acorn-walk');
const root = path.join(__dirname, '..'), I18N = path.join(root, 'i18n');
const LANGS = ['es', 'fr', 'de', 'it', 'pt', 'tr', 'ru', 'ja', 'zh', 'ko'];

function collect() {
  const keys = new Map(), add = (k, where) => { if (typeof k !== 'string' || !/[A-Za-z]/.test(k)) return; if (!keys.has(k)) keys.set(k, new Set()); keys.get(k).add(where); };
  const dynamic = [];
  // 1. the code
  for (const f of fs.readdirSync(path.join(root, 'src')).filter((f) => f.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(root, 'src', f), 'utf8'), ast = acorn.parse(src, { ecmaVersion: 2022, locations: true });
    const lits = (n, out) => {
      if (!n) return out;
      if (n.type === 'Literal' && typeof n.value === 'string') out.push(n.value);
      else if (n.type === 'TemplateLiteral' && !n.expressions.length) out.push(n.quasis[0].value.cooked);
      else if (n.type === 'ConditionalExpression') { lits(n.consequent, out); lits(n.alternate, out); }
      else if (n.type === 'LogicalExpression') { lits(n.left, out); lits(n.right, out); }
      else out.push(null);
      return out;
    };
    walk.full(ast, (n) => {
      if (n.type !== 'CallExpression' || !n.arguments.length) return;
      const c = src.slice(n.callee.start, n.callee.end);
      if (c !== 'tr' && c !== 'H.T' && c !== 'H.T.k' && c !== 'T' && c !== 'T2') return;
      if (c === 'T' && f !== 'data.js') return;
      for (const s of lits(n.arguments[0], [])) if (s == null) dynamic.push(`${f}:${n.loc.start.line}`); else add(s, f.replace('.js', ''));
    });
  }
  // 2. the game data, as the game puts it through H.T
  require(path.join(root, 'src/i18n.js')); for (const m of ['data', 'engine', 'game', 'modes']) require(path.join(root, `src/${m}.js`));
  const H = globalThis.H; let where = 'data'; H.T.rec = (s) => add(s, where);
  H.localizeData();
  where = 'moves';
  const abs = []; for (const k in H.FORMS) for (const s of ['beat', 'phrase', 'finale', 'passive']) if (H.FORMS[k][s]) abs.push(H.FORMS[k][s]);
  for (const k in H.DIN) for (const s of ['beat', 'phrase', 'finale', 'passive']) if (H.DIN[k][s]) abs.push(H.DIN[k][s]);
  abs.push(H.SWELL, H.LOUD, H.FEEDBACK); if (H.BOONS) for (const k in H.BOONS) abs.push(H.BOONS[k].perk);
  for (const a of abs) if (a && (a.fx || a.d)) { const d = a.d; a.d = null; if (a.fx) H.describe(a); a.d = d; }
  where = 'items';
  for (const t in H.ITEM_TYPES) for (const r of H.RARITY_ORDER) { const it = { type: t, rar: r, id: 'x' }; try { H.itemText(it); } catch (e) {} }
  for (const k in H.LEGENDS) { const L = H.LEGENDS[k]; try { H.itemText({ type: L.type, rar: 'l', leg: k, id: 'x' }); } catch (e) {} }
  for (const k in H.STAT_TEXT) H.STAT_TEXT[k](5);
  where = 'ensembles'; for (const e of H.ENSEMBLES) e.d();
  H.T.rec = null;
  return { keys, dynamic, H };
}

const placeholders = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(' ');
const tags = (s) => (String(s).match(/<\/?[a-z]+[^>]*>/g) || []).map((t) => t.replace(/\s.*>/, '>')).sort().join(' ');
const forms = (v) => (typeof v === 'object' && v ? Object.values(v) : [v]);
// a key's short id: stable while its English stays the same
const id = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36).padStart(7, '0'); };
const ORDER = ['data', 'moves', 'items', 'ensembles', 'engine', 'game', 'modes', 'ui-core', 'ui-screens', 'ui-modes', 'ui-battle'];
const rank = (w) => Math.min(...w.split(' ').map((x) => (ORDER.indexOf(x) + 1) || 99));
// a language file: one line per key, "id<TAB>text"; a text with plural forms is written as JSON {"one": …, "other": …}
function load(code) {
  const o = {}, files = fs.existsSync(I18N) ? fs.readdirSync(I18N).filter((f) => f === code + '.txt' || (f.startsWith(code + '.') && f.endsWith('.txt'))).sort() : [];
  for (const line of files.map((f) => fs.readFileSync(path.join(I18N, f), 'utf8')).join('\n').split('\n')) { const m = line.match(/^([0-9a-z]{7})\t(.*)$/); if (!m) continue; let v = m[2]; if (v.startsWith('{"')) v = JSON.parse(v); o[m[1]] = v; }
  return o;
}
const english = () => { const o = {}; for (const line of fs.readFileSync(path.join(I18N, 'en.txt'), 'utf8').split('\n')) { const m = line.match(/^([0-9a-z]{7})\t([^\t]*)\t/); if (m) o[m[1]] = m[2].replace(/\\n/g, '\n'); } return o; };

const cmd = process.argv[2] || 'check';
if (cmd === 'keys') {
  const { keys, dynamic, H } = collect(), EN = H.T_EN;
  const list = [...keys].map(([k, w]) => [k, [...w].join(' ')]).sort((a, b) => rank(a[1]) - rank(b[1]));
  const seen = new Map(); for (const [k] of list) { const i = id(k); if (seen.has(i) && seen.get(i) !== k) throw new Error('id clash: ' + k); seen.set(i, k); }
  fs.mkdirSync(I18N, { recursive: true });
  // en.txt: id, English, where it is used, and (for keys with plural forms) the English forms
  fs.writeFileSync(path.join(I18N, 'en.txt'), '# id\tEnglish\twhere\tEnglish plural forms\n' + list.map(([k, w]) => `${id(k)}\t${k.replace(/\n/g, '\\n')}\t${w}\t${EN[k] ? JSON.stringify(EN[k]) : ''}`).join('\n') + '\n');
  console.log(list.length, 'keys,', list.reduce((n, [k]) => n + k.length, 0), 'chars');
  const dyn = dynamic.filter((d) => !/^(data|i18n)\.js|:4$/.test(d)); if (dyn.length) console.log('calls with a worked-out key (check each is covered):\n  ' + dyn.join('\n  '));
} else if (cmd === 'check') {
  const en = english(), n = Object.keys(en).length;
  for (const code of process.argv[3] ? [process.argv[3]] : LANGS) {
    const d = load(code), miss = Object.keys(en).filter((k) => d[k] == null || d[k] === ''), stale = Object.keys(d).filter((k) => !(k in en)), bad = [];
    for (const k in d) if (k in en) for (const v of forms(d[k])) {
      const lost = placeholders(en[k]).split(' ').filter((p) => p && !(p === '{n}' && typeof d[k] === 'object') && !placeholders(v).includes(p));
      const extra = placeholders(v).split(' ').filter((p) => p && !placeholders(en[k]).includes(p));
      if (lost.length || extra.length) bad.push(`${k} ${JSON.stringify(en[k])} → ${JSON.stringify(v)} (${lost.length ? 'lost ' + lost.join(',') : ''}${extra.length ? ' unknown ' + extra.join(',') : ''})`);
      if (tags(en[k]) !== tags(v)) bad.push(`${k} ${JSON.stringify(en[k])} → ${JSON.stringify(v)} (tags)`);
    }
    console.log(`${code}: ${n - miss.length}/${n}` + (stale.length ? `, ${stale.length} stale` : '') + (bad.length ? `, ${bad.length} broken` : ''));
    if (process.argv[3] || process.env.V) { for (const k of miss.slice(0, +(process.env.MAX || 40))) console.log('  missing', k, JSON.stringify(en[k])); for (const b of bad) console.log('  ' + b); for (const k of stale.slice(0, 20)) console.log('  stale', k); }
  }
} else if (cmd === 'pack') {
  // shipped: the English keys once, then each language as a list in the same order (no keys repeated)
  const en = english(), ids = Object.keys(en), out = {}, gz = (o) => zlib.deflateRawSync(Buffer.from(JSON.stringify(o)), { level: 9 });
  out.keys = gz(ids.map((i) => en[i])).toString('base64'); let total = out.keys.length;
  for (const code of LANGS) { const d = load(code), arr = ids.map((i) => (d[i] == null ? 0 : d[i])); while (arr.length && arr[arr.length - 1] === 0) arr.pop(); out[code] = gz(arr).toString('base64'); total += out[code].length; console.log(`  ${code}: ${(out[code].length / 1024).toFixed(1)} KB`); }
  fs.mkdirSync(path.join(root, 'build'), { recursive: true });
  fs.writeFileSync(path.join(root, 'build/lang.js'), `H.PACKS = ${JSON.stringify(out)};\n`);
  console.log(`packs: ${(total / 1024).toFixed(0)} KB embedded (keys ${(out.keys.length / 1024).toFixed(1)} KB)`);
}
