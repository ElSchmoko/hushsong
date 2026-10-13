/* Hushsong — a delve: the road drawn as a score, wayside events, rewards. */
(function (H) {
  'use strict';
  const A = H.Art, Au = H.Audio, UI = H.UI, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key;
  const rnd = Math.random;
  const NODE = { fight: ['The Din', 'A fight. Win an Ornament.'], elite: ['Loud Din', 'A hard fight. Drops gear.'], event: ['An echo', 'Something by the road.'], rest: ['A fire', 'The band heals 60%.'], shell: ['A shell', 'Take it home to hatch.'], boss: ['The Mute', 'Silence it to bring the song back.'] };

  UI.ornamentPick = (dv, ids, then, title) => {
    const kids = [txt('disp', title || 'Choose an ornament'), txt('dim small', 'It lasts until this delve ends.')];
    ids.forEach((id, i) => { const o = H.ORNAMENTS[id]; const b = key(`<b>${o.n}</b><span class="sub">${UI.rich(o.d)}</span>`, () => { dv.ornaments.push(id); Au.sfx('good'); UI.save(); UI.closeModal(); then(); }, 'choice wide', i * 2); kids.push(b); });
    UI.modal(...kids);
  };
  const lootRows = (out) => {
    const rows = [];
    if (out.notes || out.xp) rows.push(box('row center', out.notes ? UI.notes('+' + out.notes) : null, out.xp ? add(el('span', 'purse'), UI.icon('ic_xp'), el('span', '', '+' + out.xp)) : null));
    if (out.xp) { const x = rows[rows.length - 1].lastChild; x.style.color = 'var(--breath)'; }
    if (out.xp) rows.push(box('row', txt('small dim', 'Band level ' + UI.S.level), add(el('div', 'grow'), UI.meter('xp', UI.S.level >= H.MAX_LEVEL ? 1 : UI.S.xp / H.xpNeed(UI.S.level)))));
    if (out.ups) { const L = UI.S.level; rows.push(txt('center gold', `Band level ${L}!`)); if (L - out.ups < H.TIER_LEVEL[1] && L >= H.TIER_LEVEL[1]) rows.push(txt('center', 'Strays can now find their part. Evolve them at camp.')); if (L - out.ups < H.TIER_LEVEL[2] && L >= H.TIER_LEVEL[2]) rows.push(txt('center', 'Second evolutions are open. Finales await at camp.')); }
    if (out.gear) { const d = H.GEAR[out.gear]; rows.push(add(el('div', 'gslot full'), UI.icon('gear_' + out.gear), add(el('div', 'col'), txt('', `<b>${d.n}</b> <span class="label">found</span>`), txt('dim small', UI.rich(d.d))))); }
    if (out.shells) rows.push(box('row center', UI.sp('shell_' + UI.S.delve.region, 1), txt('', out.shells > 1 ? `<b>${out.shells} shells</b>, still humming.` : '<b>A shell</b>, still humming.')));
    return rows;
  };

  UI.rewards = (out, dv, node) => {
    const S = UI.S, R = H.REGIONS[dv.region];
    if (!out.win) {
      const l = dv.loot; S.delve = null; UI.save();
      return UI.modal(txt('disp center', 'The band falls silent'), txt('dim center', 'Not for good. Everyone limps back to the wagon, and everything you earned on the road comes with you.'),
        box('row center', UI.notes(l.notes), add(el('span', 'purse'), UI.icon('ic_xp'), String(l.xp))), l.gear.length ? txt('dim small center', 'Kept: ' + l.gear.map((g) => H.GEAR[g].n).join(', ') + '.') : null,
        txt('dim small center', 'A higher band level, an evolution or a different line-up can turn it around.'), key('Back to camp', () => UI.go('camp'), 'wide gold'));
    }
    if (node.type === 'boss') return UI.cleared(out, dv);
    const cont = () => { if (out.ornaments && out.ornaments.length) UI.ornamentPick(dv, out.ornaments, () => UI.go('delve')); else UI.go('delve'); };
    UI.modal(txt('disp center', node.type === 'elite' ? 'That shut it up' : 'Quieted'), ...lootRows(out), key('Onward', cont, 'wide gold'));
  };

  // A Mute falls: colour and music come back to the region.
  UI.cleared = (out, dv) => {
    const S = UI.S, R = H.REGIONS[dv.region], boss = H.DIN[R.boss];
    const stage = el('div', 'stage'); stage.style.height = 'calc(var(--u) * 70)';
    const a = UI.bgEl(dv.region, UI.W, 70, true), b = UI.bgEl(dv.region, UI.W, 70, false); b.style.opacity = '0'; b.style.transition = 'opacity 2.4s steps(8)'; add(stage, a, b);
    const row = box('row center'); row.style.position = 'relative'; row.style.gap = '0'; H.bandPets(S).forEach((p) => { if (p) { const c = UI.sp(p.form, 1); c.style.margin = '0 calc(var(--u) * -5) calc(var(--u) * -2)'; row.appendChild(c); } }); stage.appendChild(row);
    setTimeout(() => { b.style.opacity = '1'; }, 250);
    const all = H.REGION_ORDER.every((r) => (S.regions[r] || {}).clears);
    const lines = out.firstClear && !dv.encore ? [`${boss.n} comes apart like wet paper, and every sound it swallowed comes back out at once.`, `${R.n} has a song again.`] : [`${boss.n} is silenced again. ${dv.encore ? 'Louder this time, and it still was not enough.' : ''}`];
    S.delve = null; UI.save(); UI.music('camp', dv.region);
    const kids = [txt('label center', dv.encore ? 'Encore' : 'The song comes back'), stage, txt('disp center', R.n), ...lines.map((l) => txt('center dim', l)), ...lootRows(Object.assign({}, out, { shells: 0 }))];
    if (out.shells) kids.push(box('row center', UI.sp('shell_' + dv.region, 1), txt('', out.shells > 1 ? `<b>${out.shells} shells</b> were inside it.` : '<b>A shell</b> was inside it.')));
    if (out.firstClear && !dv.encore) { const i = H.REGION_ORDER.indexOf(dv.region); if (i < 3) kids.push(txt('center small', `The road to <b>${H.REGIONS[H.REGION_ORDER[i + 1]].n}</b> is open, and the Luthier has new stock.`)); }
    kids.push(key(all && out.firstClear && dv.region === 'hall' && !dv.encore ? 'Listen' : 'Back to camp', () => { if (all && out.firstClear && dv.region === 'hall' && !dv.encore) UI.ending(); else UI.go('camp'); }, 'wide gold'));
    UI.modal(...kids);
  };
  UI.ending = () => {
    UI.modal(txt('label center', 'Finale'), txt('disp big center', 'The Hush<br>has a song'), txt('center dim', 'Four Mutes down. The fen whistles, the foundry rings, the ridge hums and the hall, at last, applauds.'), txt('center dim', 'Nobody is quite sure how songs work yet. The band is going to keep playing until somebody is.'),
      txt('center small', 'Every region now has an <b>Encore</b>: the same road, much louder. There are still forms in the Songbook nobody has heard.'), key('Take a bow', () => UI.go('camp'), 'wide gold'));
  };

  UI.screens.delve = (root) => {
    const S = UI.S, dv = S.delve; if (!dv) return UI.go('camp');
    const R = H.REGIONS[dv.region], W = UI.W; UI.music('delve', dv.region);
    const cleared = !!(S.regions[dv.region] || {}).clears;
    const cur = dv.at >= 0 ? H.delveNode(dv, dv.at) : null;
    add(root, UI.topbar(R.n, () => UI.go('camp'), [txt('badge', dv.encore ? 'Encore' : `Bar ${cur ? cur.col + 2 : 1} of 7`), UI.notes(S.notes)]));
    const body = el('div', 'scroll'); root.appendChild(body);
    /* the score */
    const SHh = 104, sc = el('div', 'score'), c = A.make(W, SHh), ctx = c.getContext('2d'); c.className = 'px'; sc.appendChild(c);
    ctx.drawImage(A.bg(dv.region, W, SHh, !cleared), 0, 0); ctx.fillStyle = 'rgba(11,9,25,0.72)'; ctx.fillRect(0, 0, W, SHh);
    const mx = 15, cw = (W - mx * 2) / 6, colX = (i) => Math.round(mx + cw * i), laneY = (l) => 24 + l * 28;
    ctx.fillStyle = '#3d3570'; for (let i = 0; i < 5; i++) ctx.fillRect(4, 24 + i * 14, W - 8, 1);
    ctx.fillStyle = '#2a2450'; for (let i = 0; i < 6; i++) ctx.fillRect(Math.round(colX(i) + cw / 2), 24, 1, 57);
    ctx.fillStyle = '#9b93c4'; ctx.fillRect(W - 4, 24, 2, 57); ctx.fillRect(W - 7, 24, 1, 57); ctx.fillRect(3, 24, 1, 57);
    const choices = dv.pending != null ? [dv.pending] : H.delveChoices(dv);
    // ties between notes
    const line = (x0, y0, x1, y1, col) => { ctx.fillStyle = col; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const t = i / n; const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 3; if (i % 3 !== 2) ctx.fillRect(Math.round(x), Math.round(y), 1, 1); } };
    for (const col of dv.cols) for (const n of col) for (const id of n.next) { const m = H.delveNode(dv, id); const hot = (n.id === dv.at && dv.pending == null) || (n.done && m.done); line(colX(n.col) + 6, laneY(n.lane), colX(m.col) - 6, laneY(m.lane), hot ? '#f2c744' : '#4a4288'); }
    for (const col of dv.cols) for (const n of col) {
      const x = colX(n.col), y = laneY(n.lane), can = choices.includes(n.id);
      ctx.globalAlpha = n.done ? 0.35 : can || n.col > (cur ? cur.col : -1) ? 1 : 0.3; ctx.drawImage(A.sprite('node_' + n.type, 0), x - 7, y - 7); ctx.globalAlpha = 1;
      if (n.id === dv.at) { ctx.drawImage(A.sprite('ic_note', 0), x - 3, y - 19); }
      if (can) { const b = UI.btn('can', () => enter(n)); b.style.left = (x / W * 100) + '%'; b.style.top = (y / SHh * 100) + '%'; b.setAttribute('aria-label', NODE[n.type][0]); sc.appendChild(b); }
    }
    A.text(ctx, dv.at < 0 ? 'PICK WHERE TO START' : dv.pending != null ? 'UNFINISHED BUSINESS' : 'PICK THE NEXT BAR', W / 2, 7, '#9b93c4');
    body.appendChild(sc);
    const pad = el('div', 'pad'); body.appendChild(pad);
    /* the band */
    const minis = box('row'); H.bandPets(S).forEach((p) => { if (!p) return; const hp = dv.hp[p.id] == null ? 1 : dv.hp[p.id]; const m = UI.btn('mini', () => UI.go('pet', { id: p.id, from: 'camp' })); const s = UI.sp(p.form, 1); if (hp <= 0) s.style.filter = 'grayscale(1) brightness(0.6)'; add(m, s, UI.meter('hp' + (hp < 0.3 ? ' low' : ''), hp), txt('small ' + (hp < 0.3 ? 'bad' : 'dim'), Math.round(hp * 100) + '%')); m.disabled = true; minis.appendChild(m); });
    pad.appendChild(minis);
    /* ornaments held */
    const orn = box('row wrap'); if (dv.ornaments.length) { dv.ornaments.forEach((o) => orn.appendChild(UI.btn('orn', () => UI.modal(txt('disp', H.ORNAMENTS[o].n), txt('dim', UI.rich(H.ORNAMENTS[o].d)), key('Close', UI.closeModal, 'wide')), UI.icon('ic_orn'), H.ORNAMENTS[o].n))); add(pad, txt('label', 'Ornaments'), orn); }
    else add(pad, txt('dim small', dv.at < 0 ? 'Every bar is a choice. Fights earn Ornaments: boons that last until this delve ends. HP carries over between fights.' : 'No Ornaments yet. Win a fight to earn one.'));
    /* legend */
    const leg = box('col'); leg.style.gap = 'var(--u)';
    const seen = [...new Set(dv.cols.flat().map((n) => n.type))];
    ['fight', 'elite', 'event', 'rest', 'shell', 'boss'].filter((t) => seen.includes(t)).forEach((t) => leg.appendChild(box('row', UI.icon('node_' + t), txt('small', `<b>${NODE[t][0]}.</b> <span class="dim">${NODE[t][1]}</span>`))));
    add(pad, leg, key('Head back to camp for good', () => UI.confirm('End this delve?', 'The road resets. You keep the notes, practice, gear and shells you picked up.', 'Head back', () => { S.delve = null; UI.save(); UI.go('camp'); }), 'black wide sm'));

    function enter(n) {
      Au.sfx('step');
      if (n.type === 'fight' || n.type === 'elite' || n.type === 'boss') { dv.pending = n.id; UI.save(); return UI.go('battle'); }
      n.done = true; dv.at = n.id; dv.pending = null;
      if (n.type === 'rest') { H.restNode(dv); UI.save(); Au.sfx('heal'); return UI.modal(box('row center', UI.sp('fire', 2)), txt('disp center', 'A fire'), txt('dim center', 'Somebody hums. Somebody else joins in a third above, by accident. The band heals 60% and anyone silenced gets back up.'), key('Onward', () => UI.go('delve'), 'wide gold')); }
      if (n.type === 'shell') { S.shells[dv.region] = (S.shells[dv.region] || 0) + 1; dv.loot.shells++; UI.save(); Au.sfx('coin'); return UI.modal(box('row center', UI.sp('shell_' + dv.region, 2)), txt('disp center', 'A shell'), txt('dim center', 'Half buried by the path. You hold it up and it is definitely doing something in there. It goes in the wagon.'), key('Onward', () => UI.go('delve'), 'wide gold')); }
      if (n.type === 'event') return event(n);
    }
    function event(n) {
      const ev = H.EVENTS.find((e) => e.id === n.ev) || H.EVENTS[0]; UI.save();
      const kids = [txt('label', 'By the road'), txt('disp', ev.t), txt('dim', ev.body)];
      ev.opts.forEach((o, i) => kids.push(key(`<b>${o.l}</b><span class="sub">${o.d}</span>`, () => {
        const res = H.applyEventFx(S, dv, o.fx, rnd); UI.save(); UI.closeModal();
        const done = () => UI.go('delve');
        const show = () => { const rows = lootRows({ notes: res.notes, xp: res.xp, ups: res.ups, gear: res.gear }); if (rows.length) UI.modal(txt('disp center', ev.t), ...rows, key('Onward', done, 'wide gold')); else done(); };
        if (res.ornaments && res.ornaments.length) UI.ornamentPick(dv, res.ornaments, show, res.lost ? `${H.ORNAMENTS[res.lost].n} sinks. Something else rises.` : null); else show();
      }, 'choice wide' + (i ? ' black' : ''), i * 3)));
      UI.modal(...kids);
    }
  };
})(window.H);
