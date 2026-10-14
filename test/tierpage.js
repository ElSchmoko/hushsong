// Builds the tier list page from test/tier.js results. node test/tierpage.js <t0.json> <t1.json> <t2.json> <sprites.json> <finds.json> > page.html
require('../src/i18n.js'); require('../src/data.js'); require('../src/engine.js'); require('../src/game.js');
const fs = require('fs'), H = globalThis.H;
if (fs.existsSync(__dirname + '/movek.json')) { Object.assign(H.MOVE_K, JSON.parse(fs.readFileSync(__dirname + '/movek.json', 'utf8'))); H.applyMoveK(); }
const [t0, t1, t2] = process.argv.slice(2, 5).map((f) => JSON.parse(fs.readFileSync(f, 'utf8'))), sprites = JSON.parse(fs.readFileSync(process.argv[5], 'utf8')), finds = JSON.parse(fs.readFileSync(process.argv[6], 'utf8'));
const FAMC = { drum: '#ff9234', string: '#35d07c', breath: '#4aa8f0', brass: '#ffc928', voice: '#ff6aa0' };
const ROLE = { rhythm: 'Tank', lead: 'Attacker', harmony: 'Healer', bass: 'Trickster', stray: 'Young' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plain = (s) => String(s).replace(/<[^>]+>/g, '');
// one line on what the form brings: its body, then the move that sets it apart at this stage
const body = (id) => {
  const f = H.FORMS[id], sp = H.SPECIES[f.sp], kit = H.kitOf(id), r = H.ROLES[kit.role], hp = sp.base.hp * r.hp, tempo = sp.base.tempo * r.tempo, notes = [];
  if (hp >= 165) notes.push('very tough'); else if (hp >= 145) notes.push('tough'); else if (hp < 112) notes.push('frail');
  if (tempo >= 112) notes.push('fast'); else if (tempo <= 86) notes.push('slow');
  return notes.length ? notes.join(' and ').replace(/^./, (c) => c.toUpperCase()) + '. ' : '';
};
const line = (id) => {
  const f = H.FORMS[id], kit = H.kitOf(id);
  if (f.tier === 0) return body(id) + `${kit.phrase.n}: ${plain(H.describe(kit.phrase))}`;
  if (f.tier === 1) return body(id) + `${kit.passive.n}: ${plain(kit.passive.d)} ${kit.phrase.n}: ${plain(H.describe(kit.phrase))}`;
  return body(id) + `${kit.finale.n}: ${plain(H.describe(kit.finale))}`;
};
const NEW = new Set(process.env.NEWMOVES ? process.env.NEWMOVES.split(',') : []);
const stage = (T, key, title, range) => {
  const avg = T.avg, rows = T.forms.slice().sort((a, b) => b.win - a.win), wins = rows.map((r) => r.win);
  const tierOf = (w) => (w >= avg + 0.06 ? 'S' : w >= avg + 0.02 ? 'A' : w >= avg - 0.03 ? 'B' : 'C');
  const L = { S: ['Carries a band', `${Math.round(100 * (avg + 0.06))}%+`], A: ['Strong pick', `${Math.round(100 * (avg + 0.02))}–${Math.round(100 * (avg + 0.06))}%`], B: ['Solid', `${Math.round(100 * (avg - 0.03))}–${Math.round(100 * (avg + 0.02))}%`], C: ['Needs help', `under ${Math.round(100 * (avg - 0.03))}%`] };
  let h = `<section class="stage" id="${key}"><header class="stage-h"><h2>${title}</h2><p>${rows.length} forms · tested on floors ${range} · average win <b>${(100 * avg).toFixed(1)}%</b> · range ${Math.round(100 * Math.min(...wins))}–${Math.round(100 * Math.max(...wins))}%</p></header>`;
  for (const t of ['S', 'A', 'B', 'C']) {
    const list = rows.filter((r) => tierOf(r.win) === t); if (!list.length) continue;
    h += `<div class="tier t-${t}"><div class="badge"><span>${t}</span><small>${L[t][0]}</small><small class="rng">${L[t][1]}</small></div><div class="cards">`;
    for (const r of list) {
      const img = sprites[r.n] || '';
      h += `<article class="card"><img src="${img}" alt="" width="64" height="64"><div class="body"><div class="top"><h3>${esc(r.n)}${NEW.has(r.id) ? ' <em class="new">New move</em>' : ''}</h3><span class="win" title="Win rate in simulated battles">${(100 * r.win).toFixed(1)}%</span></div><div class="tags"><span class="fam" style="--fc:${FAMC[r.fam]}">${H.FAMILIES[r.fam].n}</span>${T.tier ? `<span class="role">${ROLE[r.role]}</span>` : ''}<span class="boss" title="Win rate on boss floors">bosses ${Math.round(100 * r.boss)}%</span></div><p>${esc(line(r.id))}</p></div></article>`;
    }
    h += '</div></div>';
  }
  return h + '</section>';
};
const css = fs.readFileSync(__dirname + '/tierpage.css', 'utf8');
const html = `<title>Hushsong Tier List</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap">
<style>${css}</style>
<div class="wrap">
  <header class="intro">
    <h1>Hushsong Tier List</h1>
    <p>All 175 pet forms, ranked by how often a band with them wins. Each stage is compared only with itself: base forms against base forms, and so on. Each card names what sets the form apart at its stage.</p>
  </header>
  <div class="find">${finds.map(([b, p]) => `<div><b>${esc(b)}</b><p>${esc(p)}</p></div>`).join('')}</div>
  <nav class="jump" aria-label="Stages"><a href="#base">Base forms</a><a href="#first">First evolutions</a><a href="#second">Second evolutions</a></nav>
  ${stage(t0, 'base', 'Base forms', '4–20')}
  ${stage(t1, 'first', 'First evolutions', '24–50')}
  ${stage(t2, 'second', 'Second evolutions', '64–100')}
  <p class="method">How this was measured: random bands of three pets from the same stage played auto battles at a level where an average band wins about 60% of the time, on floors 4–20, 24–50 and 64–100. Family advantage was switched off, since some floors lean towards one family. Each base form played about ${Math.round((3 * t0.fights) / t0.forms.length).toLocaleString('en')} battles, each first evolution about ${Math.round((3 * t1.fights) / t1.forms.length).toLocaleString('en')} and each second evolution about ${Math.round((3 * t2.fights) / t2.forms.length).toLocaleString('en')}, so gaps under 2 points are within noise. Tiers sit relative to each stage’s average: S is 6 points or more above it, A 2 or more, B down to 3 below, C lower. “Bosses” is the win rate on boss floors only.</p>
</div>`;
process.stdout.write(html);
