// One-off codemod: wraps player-facing strings in the UI code with tr('english', { values }).
// node tools/wrap-t.js src/ui-screens.js ...   (rewrites the files in place; prints what it touched)
const fs = require('fs'), acorn = require('acorn'), walk = require('acorn-walk'), MagicString = require('magic-string').default || require('magic-string');
// which arguments of which calls are text the player reads
const ARGS = { txt: [1], el: [2], key: [0], toast: [0], confirm: [0, 1, 2], topbar: [0], purse: [2], stamp: [0], coach: [2], float: [1], say: [0], idle: [0],
  small: [2, 3], later: [2, 3, 4], atLv: [2, 5], pin: [2], opt: [1, 2], sec: 'all', label: [0], fail: [0] };
const letters = (s) => /[A-Za-z]{2,}|[A-Z]/.test(s);
for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, 'utf8'), ast = acorn.parse(src, { ecmaVersion: 2022 }), ms = new MagicString(src), done = new Set(); let n = 0;
  const S = (node) => src.slice(node.start, node.end);
  const nameOf = (e, i) => { if (e.type === 'Identifier') return e.name; if (e.type === 'MemberExpression' && !e.computed) return e.property.name; if (e.type === 'CallExpression') { if (e.arguments[0]) return nameOf(e.arguments[0], i); if (e.callee.type === 'MemberExpression') return e.callee.property.name; } return 'v' + i; };
  const q = (s) => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
  // turn a list of parts (strings and expression nodes) into tr('…{x}…', { x: … })
  const fromParts = (parts) => {
    let key = '', vars = [], used = {};
    parts.forEach((p, i) => { if (typeof p === 'string') key += p; else { let nm = nameOf(p, i); while (used[nm] && used[nm] !== S(p)) nm += '2'; used[nm] = S(p); key += '{' + nm + '}'; if (!vars.some((v) => v[0] === nm)) vars.push([nm, gen(p, true)]); } });
    if (!letters(key.replace(/\{\w+\}/g, ''))) return null;
    return 'tr(' + q(key) + (vars.length ? ', { ' + vars.map(([k, v]) => (k === v ? k : k + ': ' + v)).join(', ') + ' }' : '') + ')';
  };
  const flat = (e, out) => { if (e.type === 'BinaryExpression' && e.operator === '+') { flat(e.left, out); flat(e.right, out); } else out.push(e); return out; };
  function gen(e, inner) {
    if (e.type === 'Literal' && typeof e.value === 'string') return letters(e.value) && !inner ? (n++, 'tr(' + q(e.value) + ')') : letters(e.value) && inner ? (n++, 'tr(' + q(e.value) + ')') : S(e);
    if (e.type === 'TemplateLiteral') { const parts = []; e.quasis.forEach((qq, i) => { parts.push(qq.value.cooked); if (e.expressions[i]) parts.push(e.expressions[i]); }); const r = fromParts(parts); if (r) { n++; return r; } return S(e); }
    if (e.type === 'ConditionalExpression') return S(e.test) + ' ? ' + gen(e.consequent, inner) + ' : ' + gen(e.alternate, inner);
    if (e.type === 'LogicalExpression') return gen(e.left, inner) + ' ' + e.operator + ' ' + gen(e.right, inner);
    if (e.type === 'BinaryExpression' && e.operator === '+') { const xs = flat(e, []); if (xs.some((x) => x.type === 'Literal' && typeof x.value === 'string' && letters(x.value)) && xs.some((x) => !(x.type === 'Literal'))) { const parts = xs.map((x) => (x.type === 'Literal' && typeof x.value === 'string' ? x.value : x)); const r = fromParts(parts); if (r) { n++; return r; } } return S(e); }
    return S(e);
  }
  const touch = (node) => { if (done.has(node.start)) return; const out = gen(node); if (out !== S(node)) { try { ms.overwrite(node.start, node.end, out); done.add(node.start); } catch (e) { console.log('overlap at', file, src.slice(0, node.start).split('\n').length); } } };
  walk.full(ast, (node) => {
    if (node.type === 'CallExpression') {
      const c = node.callee, name = c.type === 'Identifier' ? c.name : c.type === 'MemberExpression' && !c.computed ? c.property.name : null;
      if (name === 'setAttribute' && node.arguments[0] && node.arguments[0].value === 'aria-label') return touch(node.arguments[1]);
      const pos = ARGS[name]; if (!pos) return;
      node.arguments.forEach((a, i) => { if (pos === 'all' || pos.includes(i)) touch(a); });
    } else if (node.type === 'AssignmentExpression' && node.left.type === 'MemberExpression' && ['textContent', 'innerHTML'].includes(node.left.property && node.left.property.name)) touch(node.right);
  });
  // nested touches can overlap (a call inside a wrapped argument): magic-string refuses those, so they were skipped
  fs.writeFileSync(file, ms.toString()); console.log(file, n, 'strings');
}
