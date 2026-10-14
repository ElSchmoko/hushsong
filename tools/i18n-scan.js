// Lists English text in the UI code that is not inside tr(...): node tools/i18n-scan.js src/ui-*.js
const fs = require('fs'), acorn = require('acorn'), walk = require('acorn-walk');
const letters = (s) => /[A-Za-z]{3,}/.test(s) && /\s|^[A-Z][a-z]/.test(s) && !/^ [a-z][a-z-]*$/.test(s) && !/^<[^>]*>$|^<\/\w+>(<[^>]*>)*$/.test(s.trim());
const SKIP = /^(ic_|st_|fam_|role_|nd_|bn_|ev_|tw_|item_|r-|k-|t-)|^[a-z][a-z0-9 _.\-:#>()=,'"\[\]*]*$|calc\(|var\(|px|rgba|^#[0-9a-f]/;
for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, 'utf8'), ast = acorn.parse(src, { ecmaVersion: 2022, locations: true }), skip = [];
  walk.full(ast, (n) => { const c = n.type === 'CallExpression' && n.callee; if (c && ((c.type === 'Identifier' && c.name === 'tr') || (c.type === 'MemberExpression' && /^H\.T(\.k)?$/.test(src.slice(c.start, c.end))) || (c.type === 'MemberExpression' && src.slice(c.start, c.end) === 'H.T'))) skip.push([n.start, n.end]); });
  const inTr = (n) => skip.some(([a, b]) => n.start >= a && n.end <= b);
  walk.full(ast, (n) => {
    let t = null; if (n.type === 'Literal' && typeof n.value === 'string') t = n.value; else if (n.type === 'TemplateElement') t = n.value.cooked; if (t == null || inTr(n)) return;
    if (letters(t) && !SKIP.test(t)) console.log(file.replace('src/', '') + ':' + n.loc.start.line + '  ' + JSON.stringify(t).slice(0, 110));
  });
}
