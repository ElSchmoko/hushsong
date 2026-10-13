/* Hushsong — screens outside of a delve: title, prologue, camp, band, pet, shells, luthier, songbook, map. */
(function (H) {
  'use strict';
  const A = H.Art, Au = H.Audio, UI = H.UI, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key;
  const rnd = Math.random;

  UI.bgEl = (k, w, h, muted, cls) => { const src = A.bg(k, w, h, muted); const c = A.make(w, h); c.getContext('2d').drawImage(src, 0, 0); c.className = 'px bgc ' + (cls || ''); c.style.width = `calc(var(--u) * ${w})`; c.style.height = `calc(var(--u) * ${h})`; return c; };
  const anyClear = (S) => H.REGION_ORDER.some((r) => (S.regions[r] || {}).clears);
  const tierName = ['Unevolved', 'First form', 'Final form'];

  // Where the story sends you next.
  UI.next = () => {
    const S = UI.S;
    if (!S.flags.intro) return UI.go('intro');
    if (S.pets.length === 0) return UI.go('shells', { starter: true });
    if (!S.flags.tut) return UI.go('battle', { tutorial: true });
    if (S.shells.starter > 0) return UI.go('shells', { starter: true });
    if (S.delve) return UI.go('delve');
    UI.go('camp');
  };

  /* ================= title ================= */
  UI.screens.title = (root) => {
    const S = UI.S; UI.music('silent');
    const W = UI.W, Hh = UI.Hh, c = A.make(W, Hh), ctx = c.getContext('2d'); c.className = 'px bgc'; c.style.width = `calc(var(--u) * ${W})`; c.style.height = `calc(var(--u) * ${Hh})`;
    ctx.drawImage(A.bg('camp', W, Hh, !UI.hasSave()), 0, 0);
    const gy = Math.round(Hh * 0.37) + 22;
    if (UI.hasSave() && S.pets.length) { ctx.drawImage(A.sprite('wagon', 0), Math.round(W / 2 - 62), gy - 44); A.glowPool(ctx, Math.round(W / 2 + 34), gy + 16, 16, '#ff9a3a', 0.35); ctx.drawImage(A.sprite('fire', 0), Math.round(W / 2 + 24), gy - 2); H.bandPets(S).forEach((p, i) => { if (p) ctx.drawImage(A.sprite(p.form, 0), Math.round(W / 2 - 30 + i * 34), gy + 6 + (i % 2) * 8); }); }
    else ['starter', 'starter', 'starter'].forEach((k, i) => ctx.drawImage(A.sprite('shell_' + k, 0), Math.round(W / 2 - 54 + i * 37), gy + 4 + (i % 2) * 7));
    const t = el('div', 'title'); t.appendChild(c);
    add(t, el('div', 'logo', 'HUSH<br><span>SONG</span>'), txt('center dim', 'A world with every sound in it,<br>and not one song.'));
    if (UI.hasSave()) add(t, key('Carry on', () => UI.next(), 'gold wide'), key('Settings', UI.settings, 'black wide sm'));
    else add(t, key('Listen', () => UI.next(), 'gold wide'));
    root.appendChild(t);
  };

  /* ================= prologue ================= */
  UI.screens.intro = (root) => {
    UI.music('silent');
    const lines = ['The Hush has every sound there is. Wind in the reeds. Rain on tin. A spoon going round a cup.', 'What it does not have is music. Nobody here remembers what a song was, or that anything is missing.', 'Then three shells wash up beside your wagon. Hold one to your ear and something inside is trying to keep time.'];
    let i = 0; const s = el('div', 'story'); const p = el('p'); const k = key('Go on', () => { i++; if (i >= lines.length) { UI.S.flags.intro = 1; UI.next(); } else { p.textContent = lines[i]; p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; if (i === lines.length - 1) k.textContent = 'Pick one up'; } }, 'gold');
    const pics = [['fen', null], ['hall', null], ['camp', 'shell_starter']]; const stage = el('div', 'stage');
    const pic = () => { stage.innerHTML = ''; stage.appendChild(UI.bgEl(pics[i][0], UI.W, 96, true)); if (pics[i][1]) { const r = box('row center'); r.style.position = 'relative'; r.style.gap = '0'; r.style.marginTop = 'calc(var(--u) * 34)'; [0, 1, 2].forEach(() => r.appendChild(UI.sp(pics[i][1], 1))); stage.appendChild(r); } A.tick(UI.frame); };
    k.addEventListener('click', () => { if (i < lines.length) pic(); });
    p.textContent = lines[0]; pic(); add(s, stage, p, box('row center', k)); root.appendChild(s);
  };

  /* ================= camp ================= */
  UI.screens.camp = (root) => {
    const S = UI.S, W = UI.W; UI.music('camp', 'camp');
    add(root, UI.topbar('The Bandwagon', null, [UI.notes(S.notes), UI.gearKey(UI.settings)]));
    const sh = Math.max(118, Math.min(176, UI.Hh - 172)), g0 = sh - 118, scene = el('div', 'scene'); const c = A.make(W, sh), ctx = c.getContext('2d'); c.className = 'px';
    ctx.drawImage(A.bg('camp', W, sh, false), 0, 0); const cx = Math.round(W / 2);
    ctx.drawImage(A.sprite('wagon', 0), 2, 34 + g0); A.glowPool(ctx, cx + 24, 102 + g0, 13, '#ff9a3a', 0.4);
    scene.appendChild(c);
    const put = (node, x, y) => { node.style.position = 'absolute'; node.style.left = `calc(var(--u) * ${x})`; node.style.top = `calc(var(--u) * ${y})`; scene.appendChild(node); return node; };
    const pets = H.bandPets(S); const spots = [[cx + 34, 62 + g0, true], [cx - 34, 64 + g0, false], [cx + 4, 44 + g0, false]];
    [2, 0, 1].forEach((i) => { const p = pets[i]; if (!p) return; const [x, y, flip] = spots[i]; put(UI.sp(p.form, 1, { flip }), x, y); const hit = put(UI.btn('hit', () => { Au.sfx('noise', H.petSpecies(p)); UI.go('pet', { id: p.id, from: 'camp' }); }), x + 7, y + 8); hit.setAttribute('aria-label', H.FORMS[p.form].n); });
    put(UI.sp('fire', 1), cx + 14, 86 + g0);
    root.appendChild(scene);
    const body = el('div', 'scroll'); const pad = el('div', 'pad'); pad.style.minHeight = '100%'; pad.style.boxSizing = 'border-box';
    const bonus = H.bandBonus(pets.map((p) => (p ? H.petFamily(p) : null)));
    const lvl = box('row', txt('', `Band level <b>${S.level}</b>`), add(el('div', 'grow'), UI.meter('xp', S.level >= H.MAX_LEVEL ? 1 : S.xp / H.xpNeed(S.level))), bonus ? txt('badge', bonus.n) : null);
    // one nudge at a time, for whatever matters most right now
    let hint = '';
    const canEvo = S.pets.find((p) => H.childrenOf(p.form).some((f) => H.evoCheck(S, p, f).ok));
    if (pets.filter(Boolean).length < 3) hint = 'There is an empty spot on stage. Open <b>Band</b> to fill it.';
    else if (H.shellCount(S)) hint = `${H.shellCount(S) === 1 ? 'A shell is' : H.shellCount(S) + ' shells are'} humming in the wagon.`;
    else if (canEvo) hint = `<b>${H.FORMS[canEvo.form].n}</b> is ready to find its part. Tap it by the fire.`;
    else if (S.delve) hint = 'The band is waiting out in ' + H.REGIONS[S.delve.region].n + '.';
    else if (!anyClear(S)) hint = 'The fen to the east has gone quiet. Something there is swallowing sound.';
    else hint = 'The fire is on. The band is in tune, more or less.';
    add(pad, lvl, txt('dim', hint));
    const n = H.shellCount(S);
    const mk = (label, ic, fn, badge) => { const b = key('', fn); add(b, UI.icon(ic, 1), el('span', '', label)); if (badge) b.appendChild(el('span', 'n', String(badge))); return b; };
    add(pad, box('keys', mk('Band', 'role_lead', () => UI.go('band')), mk('Shells', 'node_shell', () => UI.go('shells', {}), n), mk('Luthier', 'gear_mallet', () => UI.go('luthier')), mk('Songbook', 'gear_score', () => UI.go('songbook'))));
    const so = key(S.delve ? 'Back to the delve' : 'Set out', () => UI.go(S.delve ? 'delve' : 'map'), 'gold wide'); so.style.marginTop = 'auto'; add(pad, so);
    body.appendChild(pad); root.appendChild(body);
  };

  /* ================= band ================= */
  UI.screens.band = (root, pr) => {
    const S = UI.S; let sel = null; UI.music('camp', 'camp');
    add(root, UI.topbar('The Band', () => UI.go('camp')));
    const body = el('div', 'scroll'), pad = el('div', 'pad'); body.appendChild(pad); root.appendChild(body);
    const draw = () => {
      pad.innerHTML = '';
      const pets = H.bandPets(S), names = ['Front', 'Middle', 'Back'];
      const slots = box('row'); slots.style.gap = 'var(--u)';
      pets.forEach((p, i) => { const b = UI.btn('slot' + (sel === 's' + i ? ' sel' : ''), () => tapSlot(i)); add(b, txt('label', names[i]), p ? UI.sp(p.form, 1) : el('div', 'dim', '<br>empty<br><br>'), p ? box('row', UI.icon('fam_' + H.petFamily(p)), txt('nm', `<b>${H.FORMS[p.form].n}</b>`)) : null); if (!p) b.style.minHeight = 'calc(var(--u) * 60)'; slots.appendChild(b); });
      const bonus = H.bandBonus(pets.map((p) => (p ? H.petFamily(p) : null)));
      add(pad, slots, bonus ? txt('', `<b class="gold">${bonus.n}.</b> <span class="dim">${bonus.d}</span>`) : txt('dim', 'Fill all three spots to earn a band bonus.'),
        txt('dim small', S.delve ? 'The line-up is fixed until this delve ends. Evolving and gear are still fine.' : sel ? 'Now tap another spot to swap, or a pet below to bring it on.' : 'Foes aim at the front first. Tap a spot to move things around, or a pet to look closer.'));
      const grid = box('row wrap'); grid.style.gap = 'var(--u)'; grid.style.justifyContent = 'center';
      S.pets.forEach((p) => { const on = S.band.indexOf(p.id); const b = UI.btn('pet' + (on >= 0 ? ' on' : ''), () => tapPet(p)); add(b, UI.sp(p.form, 1), txt('nm', H.FORMS[p.form].n), txt('label', on >= 0 ? names[on] : H.TRAITS[p.trait] ? H.TRAITS[p.trait].n : '')); const tg = UI.icon('fam_' + H.petFamily(p)); tg.classList.add('tag'); b.appendChild(tg); grid.appendChild(b); });
      add(pad, txt('label', `Everyone (${S.pets.length})`), grid);
      A.tick(UI.frame);
    };
    const locked = () => { if (!S.delve) return false; UI.toast('The band is out on the road.'); return true; };
    const tapSlot = (i) => { if (locked()) return; Au.sfx('tap', i); if (sel && sel[0] === 's') { const j = +sel[1]; [S.band[i], S.band[j]] = [S.band[j], S.band[i]]; sel = null; UI.save(); } else sel = 's' + i; draw(); UI.music('camp', 'camp'); };
    const tapPet = (p) => {
      if (sel && sel[0] === 's') { const i = +sel[1], was = S.band.indexOf(p.id); if (was >= 0) S.band[was] = S.band[i]; S.band[i] = p.id; sel = null; Au.sfx('noise', H.petSpecies(p)); UI.save(); draw(); UI.music('camp', 'camp'); }
      else { Au.sfx('tap'); UI.go('pet', { id: p.id, from: 'band' }); }
    };
    draw();
  };

  /* ================= pet ================= */
  UI.formInfo = (formId, S, pet) => {
    const f = H.FORMS[formId], kit = H.kitOf(formId), out = [];
    const own = (k) => !!f[k];
    out.push(UI.abilityCard('beat', kit.beat, { isNew: own('beat') && f.tier > 0 })); out.push(UI.abilityCard('phrase', kit.phrase, { isNew: own('phrase') && f.tier > 0 }));
    if (kit.finale) out.push(UI.abilityCard('finale', kit.finale, { isNew: own('finale') }));
    if (kit.passive) out.push(UI.abilityCard('passive', kit.passive, { isNew: own('passive') }));
    return out;
  };
  UI.screens.pet = (root, pr) => {
    const S = UI.S, pet = H.petById(S, pr.id); if (!pet) return UI.go('band');
    let tab = pr.tab || 'kit', pick = pr.pick || null; UI.music('camp', 'camp');
    const back = () => UI.go(pr.from === 'camp' ? 'camp' : 'band');
    const body = el('div', 'scroll'), pad = el('div', 'pad');
    const draw = () => {
      root.innerHTML = ''; pad.innerHTML = '';
      const f = H.FORMS[pet.form], sp = H.SPECIES[f.sp], kit = H.kitOf(pet.form), st = UI.statSheet(S, pet);
      add(root, UI.topbar(f.n, back));
      const stage = el('div', 'stage'); stage.appendChild(UI.bgEl('camp', UI.W, 96, false)); const big = UI.sp(pet.form, 2); big.classList.add('big'); stage.appendChild(big);
      if (tab !== 'evo') add(pad, stage, box('row wrap center', UI.famChip(sp.family), kit.role !== 'stray' ? UI.roleChip(kit.role) : null, txt('chip', tierName[f.tier])),
        el('div', 'stats', `<div><b>${st.hp}</b><span class="label">HP</span></div><div><b>${st.vol}</b><span class="label">Volume</span></div><div><b>${st.poise}</b><span class="label">Poise</span></div><div><b>${st.tempo}</b><span class="label">Tempo</span></div>`));
      const tabs = el('div', 'tabs'); tabs.style.padding = '0';
      [['kit', 'Kit'], ['evo', 'Evolve'], ['gear', 'Gear']].forEach(([k, l], i) => tabs.appendChild(key(l, () => { tab = k; pick = null; draw(); }, tab === k ? 'on' : 'black', i)));
      pad.appendChild(tabs);
      if (tab === 'kit') {
        add(pad, txt('dim', sp.lore), UI.formInfo(pet.form));
        const tr = H.TRAITS[pet.trait];
        if (tr) add(pad, UI.abilityCard('trait', tr), box('row between', txt('dim small', 'A different trait, at random.'), key('Reroll · 25', () => { if (!H.rerollTrait(S, pet, rnd)) return UI.toast('Not enough notes.'); Au.sfx('good'); UI.save(); draw(); }, 'black sm')));
        const pos = S.band.indexOf(pet.id);
        add(pad, txt('dim small', kit.finale ? '' : 'A Finale arrives with its second evolution.'),
          pos >= 0 ? txt('dim small center', `On stage: ${['front', 'middle', 'back'][pos]}. Played ${pet.shows} ${pet.shows === 1 ? 'show' : 'shows'}.`) : key('Put on stage', () => UI.go('band'), 'black wide sm'));
        if (S.pets.length > 3 && pos < 0) add(pad, key('Let it go', () => UI.confirm('Let ' + f.n + ' go?', 'It wanders back into the Hush, a little more musical than it was. Its gear comes off first, and you get some notes back.', 'Wave goodbye', () => { const r = H.releasePet(S, pet.id); UI.toast('+' + r + ' notes'); UI.go('band'); }), 'black wide sm'));
      } else if (tab === 'evo') drawTree(f, sp);
      else drawGear();
      body.appendChild(pad); root.appendChild(body); A.tick(UI.frame);
    };
    const conn = (np, nc) => { const w = UI.W - 18, c = A.make(w, 9), x = c.getContext('2d'); c.className = 'px'; c.style.width = '100%'; c.style.margin = 'calc(var(--u) * -4) 0'; x.fillStyle = '#3d3570'; for (let p = 0; p < np; p++) { const px = Math.round(((p + 0.5) / np) * w); x.fillRect(px, 0, 1, 4); const kids = nc / np; const a = Math.round(((p * kids + 0.5) / nc) * w), b = Math.round((((p + 1) * kids - 0.5) / nc) * w); x.fillRect(a, 4, b - a + 1, 1); for (let k = 0; k < kids; k++) x.fillRect(Math.round(((p * kids + k + 0.5) / nc) * w), 4, 1, 5); } return c; };
    const drawTree = (f, sp) => {
      const base = f.sp, t1 = H.childrenOf(base), t2 = t1.flatMap((x) => H.childrenOf(x)), chain = H.formChain(pet.form);
      const node = (id) => { const ff = H.FORMS[id]; const cur = id === pet.form, onPath = chain.includes(id); const b = UI.btn('nodeb' + (cur ? ' cur' : '') + (onPath || cur ? '' : ' off') + (pick === id ? ' pick' : ''), () => { Au.sfx('tap', ff.tier * 2); pick = id; draw(); }); add(b, UI.sp(id, 1), txt('nm small', ff.n)); return b; };
      const tree = el('div', 'tree'); const tier = (ids) => add(el('div', 'tier'), ids.map(node));
      add(tree, tier([base]), conn(1, 2), tier(t1), conn(2, 4), tier(t2));
      add(pad, txt('dim small', 'The first evolution picks a part to play. The second gives it a Finale. Once a tier is paid for, switching branches is free.'), tree);
      const id = pick || pet.form, ff = H.FORMS[id], kit = H.kitOf(id), chk = H.evoCheck(S, pet, id);
      const panel = el('div', 'sheet tight');
      add(panel, box('row between wrap', txt('disp', ff.n), box('row', UI.roleChip(kit.role), ff.mood ? txt('chip', ff.mood === 'loud' ? 'forte' : 'piano') : null)), txt('dim small', H.ROLES[kit.role].d), UI.formInfo(id));
      let btn;
      if (chk.current) btn = key('This is its form now', () => {}, 'wide black'), btn.disabled = true;
      else if (chk.ok) btn = key(chk.cost ? `Evolve · ${chk.cost} notes` : (ff.tier < f.tier ? 'Go back to this form' : 'Switch to this form'), () => { H.evolve(S, pet, id); Au.sfx('evolve'); pick = null; UI.save(); UI.music('camp', 'camp'); evolveShow(id); }, 'gold wide');
      else { btn = key(chk.why, () => {}, 'wide black'); btn.disabled = true; }
      add(panel, btn); pad.appendChild(panel);
    };
    const evolveShow = (id) => { const ff = H.FORMS[id]; const s = UI.sp(id, 2); s.classList.add('pop'); UI.modal(txt('label center', 'It found its part'), box('row center', s), txt('disp center', ff.n), txt('dim center', H.ROLES[H.kitOf(id).role].d), key('Good', () => { UI.closeModal(); draw(); }, 'wide gold')); draw(); };
    const drawGear = () => {
      add(pad, txt('dim small', 'Two pieces each. Gear changes how a pet plays, not just how hard it hits.'));
      const row = box('row'); row.style.alignItems = 'stretch';
      [0, 1].forEach((i) => { const g = pet.gear[i], d = g && H.GEAR[g]; const b = UI.btn('gslot' + (g ? ' full' : ''), () => chooseGear(i)); if (g) add(b, UI.icon('gear_' + g), add(el('div', 'col'), txt('nm', `<b>${d.n}</b>`), txt('dim small', UI.rich(d.d)))); else add(b, txt('dim', 'Empty slot.<br>Tap to equip.')); row.appendChild(b); });
      row.style.flexDirection = 'column'; pad.appendChild(row);
      const have = Object.keys(S.gear).filter((g) => S.gear[g] > 0);
      add(pad, txt('dim small', have.length ? `In the wagon: ${have.map((g) => H.GEAR[g].n + (S.gear[g] > 1 ? ' x' + S.gear[g] : '')).join(', ')}.` : 'Nothing spare in the wagon. Loud Din drop gear, and the Luthier sells it.'));
    };
    const chooseGear = (slot) => {
      const have = Object.keys(S.gear).filter((g) => S.gear[g] > 0 && !pet.gear.includes(g)), kids = [txt('disp', 'Gear slot ' + (slot + 1))];
      if (pet.gear[slot]) kids.push(key('Take off ' + H.GEAR[pet.gear[slot]].n, () => { H.equip(S, pet, slot, null); UI.closeModal(); UI.save(); draw(); }, 'black wide sm'));
      if (!have.length) kids.push(txt('dim', 'Nothing else to put on. The Luthier at camp sells gear, and Loud Din carry it.'));
      have.forEach((g) => { const d = H.GEAR[g]; const b = UI.btn('gslot full', () => { H.equip(S, pet, slot, g); Au.sfx('good'); UI.closeModal(); UI.save(); draw(); }); add(b, UI.icon('gear_' + g), add(el('div', 'col'), txt('', `<b>${d.n}</b>${S.gear[g] > 1 ? ' x' + S.gear[g] : ''}`), txt('dim small', UI.rich(d.d)))); kids.push(b); });
      kids.push(key('Close', UI.closeModal, 'wide')); UI.modal(...kids);
    };
    draw();
  };

  /* ================= shells ================= */
  UI.screens.shells = (root, pr) => {
    const S = UI.S; UI.music(S.pets.length ? 'camp' : 'silent', 'camp');
    const starter = !!pr.starter;
    add(root, UI.topbar('Shells', starter ? null : () => UI.go('camp'), false));
    const body = el('div', 'scroll'), pad = el('div', 'pad'); body.appendChild(pad); root.appendChild(body);
    const k = H.nextShellKey(S);
    if (!k) { add(pad, txt('center dim', '<br>No shells in the wagon.<br><br>Mutes cough them up when they fall, and now and then one turns up on the road.'), key('Back to camp', () => UI.go('camp'), 'wide')); return; }
    if (S.pets.length >= 18) { add(pad, txt('center dim', '<br>The wagon is full: 18 is all it holds.<br>Let someone go from the Band page first.'), key('Open the Band', () => UI.go('band'), 'wide')); return; }
    const opts = (pr.opts = pr.opts || H.hatchOptions(S, k, rnd)); let sel = -1; const heard = {};
    const origin = k === 'starter' ? 'Washed up by the wagon' : 'From ' + H.REGIONS[k].n;
    const noiseEl = txt('noise center', '&nbsp;'), famEl = box('row center'), go = key('Hatch this one', () => hatch(), 'gold wide'); go.disabled = true;
    const row = el('div', 'shells');
    const btns = opts.map((o, i) => { const b = UI.btn('shellb', () => { sel = i; heard[i] = 1; Au.sfx('noise', o.sp); btns.forEach((x, j) => x.classList.toggle('sel', j === i)); b.classList.remove('heard'); void b.offsetWidth; b.classList.add('heard'); noiseEl.textContent = '“' + H.SPECIES[o.sp].noise + '”'; noiseEl.style.color = H.FAMILIES[H.SPECIES[o.sp].family].col; famEl.innerHTML = ''; add(famEl, UI.famChip(H.SPECIES[o.sp].family), S.seen[o.sp] ? txt('chip', 'You know this sound') : txt('chip', 'A new sound')); go.disabled = false; }); add(b, UI.sp('shell_' + k, 2), txt('label', ['left', 'middle', 'right'][i])); row.appendChild(b); return b; });
    const left = H.shellCount(S);
    add(pad, txt('center', `<span class="label">${origin}</span>`), txt('center dim', starter && S.pets.length === 0 ? 'Three shells. Tap one to hold it to your ear. You keep one.' : 'Tap a shell to listen. You keep one of the three.'), row, noiseEl, famEl, go,
      txt('center dim small', left > 1 ? `${left} shells in the wagon.` : 'This is the last shell in the wagon.'));
    if (!starter) add(pad, txt('label center', 'These shells can hold'), UI.petRow(H.shellPool(k), (x) => S.seen[x]));
    const hatch = () => {
      const o = opts[sel]; S.shells[k]--; if (S.shells[k] <= 0) delete S.shells[k];
      const pet = H.addPet(S, o.sp, o.trait); UI.save();
      pad.innerHTML = ''; const sh = UI.sp('shell_' + k, 2); sh.classList.add('shake'); const holder = box('row center', sh); holder.style.minHeight = 'calc(var(--u) * 100)'; holder.style.alignItems = 'center';
      add(pad, holder); Au.sfx('noise', o.sp);
      setTimeout(() => { Au.sfx('crack'); }, 600);
      setTimeout(() => {
        if (UI.cur.name !== 'shells') return;
        const sp = H.SPECIES[o.sp], s = UI.sp(o.sp, 2); s.classList.add('pop'); holder.innerHTML = ''; holder.appendChild(s);
        Au.sfx('evolve'); UI.music('camp', 'camp');
        const first = S.pets.length === 1;
        add(pad, txt('disp big center', H.FORMS[o.sp].n), box('row center wrap', UI.famChip(sp.family), txt('chip', 'the ' + sp.animal)), txt('center dim', sp.lore), UI.abilityCard('trait', H.TRAITS[o.trait]),
          first ? txt('center gold', 'That is one note. It is a start.') : null,
          key(first ? 'Take it outside' : starter && S.shells.starter > 0 ? 'Next shell' : 'Onward', () => { if (starter) UI.next(); else UI.go(H.shellCount(S) ? 'shells' : 'camp', {}); }, 'gold wide'));
        A.tick(UI.frame);
      }, 950);
    };
  };

  /* ================= luthier ================= */
  UI.screens.luthier = (root) => {
    const S = UI.S; UI.music('camp', 'camp');
    add(root, UI.topbar('The Luthier', () => UI.go('camp')));
    const body = el('div', 'scroll'), pad = el('div', 'pad'); body.appendChild(pad); root.appendChild(body);
    const draw = () => {
      pad.innerHTML = ''; const un = H.gearUnlocked(S);
      add(pad, txt('dim', 'She mends what the road breaks and sells what she mends. Every piece changes a rule. Each pet wears two.'));
      un.forEach((g) => { const d = H.GEAR[g]; const r = el('div', 'gslot full'); add(r, UI.icon('gear_' + g), add(el('div', 'col grow'), txt('', `<b>${d.n}</b>${S.gear[g] ? ` <span class="dim small">have ${S.gear[g]}</span>` : ''}`), txt('dim small', UI.rich(d.d)))); const b = key(String(d.cost), () => { if (!H.buyGear(S, g)) return UI.toast('Not enough notes.'); Au.sfx('coin'); UI.save(); UI.redraw(); }, 'sm' + (S.notes >= d.cost ? '' : ' black')); b.prepend(UI.icon('ic_note')); r.appendChild(b); pad.appendChild(r); });
      const next = H.REGION_ORDER.find((r, i) => i > 0 && !(S.regions[H.REGION_ORDER[i - 1]] || {}).clears);
      if (next) add(pad, txt('dim small center', `She will have more on the bench once ${H.REGIONS[H.REGION_ORDER[H.REGION_ORDER.indexOf(next) - 1]].n} has its song back.`));
      A.tick(UI.frame);
    };
    draw();
  };

  /* ================= songbook ================= */
  UI.screens.songbook = (root, pr) => {
    const S = UI.S; let tab = pr.tab || 'pets'; UI.music('camp', 'camp');
    add(root, UI.topbar('Songbook', () => UI.go('camp'), false));
    const tabs = el('div', 'tabs'); tabs.style.paddingTop = 'calc(var(--u) * 3)'; root.appendChild(tabs);
    const body = el('div', 'scroll'), pad = el('div', 'pad'); body.appendChild(pad); root.appendChild(body);
    const draw = () => {
      tabs.innerHTML = ''; [['pets', 'Pets'], ['din', 'The Din'], ['terms', 'Terms']].forEach(([k, l], i) => tabs.appendChild(key(l, () => { tab = k; draw(); }, tab === k ? 'on' : 'black', i)));
      pad.innerHTML = '';
      if (tab === 'pets') {
        const all = Object.keys(H.FORMS), got = all.filter((f) => S.seen[f]).length;
        add(pad, box('row', txt('', `<b>${got}</b> of ${all.length} forms heard`), add(el('div', 'grow'), UI.meter('xp', got / all.length))));
        H.SPECIES_ORDER.forEach((sp) => {
          const t1 = H.childrenOf(sp), ids = [sp].concat(t1.flatMap((x) => [x].concat(H.childrenOf(x)))); const known = S.seen[sp];
          const g = el('div', 'grid7');
          ids.forEach((id, i) => { const seen = S.seen[id]; const c = UI.btn('cell', () => { if (!seen) return UI.toast('Not heard yet.'); Au.sfx('tap', i); const kit = H.kitOf(id); UI.modal(box('row center', UI.sp(id, 2)), txt('disp center', H.FORMS[id].n), box('row center wrap', UI.famChip(H.SPECIES[sp].family), UI.roleChip(kit.role)), UI.formInfo(id), key('Close', UI.closeModal, 'wide')); }); add(c, UI.sp(id, 1, { variant: seen ? '' : 'sil', anim: !!seen }), txt('small ' + (seen ? '' : 'dim'), seen ? H.FORMS[id].n : '? ? ?')); g.appendChild(c); if (i === 0) c.style.gridRow = 'span 2'; });
          add(pad, box('row between', txt('disp', known ? H.FORMS[sp].n : '? ? ?'), known ? UI.famChip(H.SPECIES[sp].family) : null), g);
        });
      } else if (tab === 'din') {
        add(pad, txt('dim', 'The Din is noise that never learned to listen. The Mutes are worse: they are what is left when a song is swallowed whole.'));
        Object.keys(H.DIN).forEach((id) => { const d = H.DIN[id], seen = S.dinSeen[id]; const r = el('div', 'gslot full'); r.style.alignItems = 'flex-start'; const c = UI.sp(id, 1, { variant: seen ? '' : 'sil', flip: true, anim: !!seen }); c.style.margin = d.boss ? 'calc(var(--u) * -6) calc(var(--u) * -6) calc(var(--u) * -2)' : 'calc(var(--u) * -6) calc(var(--u) * -4) calc(var(--u) * -2)'; c.style.flex = 'none'; r.style.overflow = 'hidden'; add(r, c, add(el('div', 'col grow'), box('row', txt('', `<b>${seen ? d.n : '? ? ?'}</b>`), seen ? UI.icon('fam_' + d.family) : null, d.boss && seen ? txt('label', 'Mute') : null), txt('dim small', seen ? d.lore : 'Not met yet.'))); pad.appendChild(r); });
      } else {
        const loop = el('div', 'loop'); H.FAMILY_ORDER.forEach((f, i) => { add(loop, UI.famChip(f), txt('dim', '›')); }); loop.appendChild(UI.famChip('drum'));
        add(pad, txt('label', 'Families'), txt('dim', 'Each family drowns out the next one along: +30% damage dealt, and it takes 20% less in return.'), loop,
          txt('label', 'Band bonuses'), txt('', '<b class="gold">Chord</b> <span class="dim">three different families: +12% HP.</span><br><b class="gold">Duet</b> <span class="dim">two alike: +7% Tempo.</span><br><b class="gold">Unison</b> <span class="dim">three alike: +18% Volume.</span>'),
          txt('label', 'Stats'), txt('dim', '<b>Volume</b> is how hard it hits and heals. <b>Poise</b> turns damage aside. <b>Tempo</b> is how fast its note runs along the tempo bar.'),
          txt('label', 'In battle'), txt('dim', 'A <b>Beat</b> is played when nothing better is ready. A <b>Phrase</b> and a <b>Finale</b> come back after a few turns. When the baton fills, tap a pet to <b>Cue</b> its best move at once, 30% stronger.'), txt('label', 'Reading a move'), txt('dim', 'Percentages are of the user\'s <b>Volume</b>. The number after a boon or ailment is how many turns it lasts: <b>Drag 2</b> drags for two turns.'), txt('label', 'Boons and ailments'));
        Object.keys(H.STATUS).forEach((s) => { const d = H.STATUS[s]; add(pad, box('row', UI.icon('st_' + s, 1), txt('grow', `${UI.rich(d.n)} <span class="dim">${d.d}</span>`))); });
      }
      A.tick(UI.frame);
    };
    draw();
  };

  /* ================= map ================= */
  UI.screens.map = (root) => {
    const S = UI.S; UI.music('camp', 'camp');
    add(root, UI.topbar('The Hush', () => UI.go('camp')));
    const body = el('div', 'scroll'), pad = el('div', 'pad'); pad.style.gap = '0'; body.appendChild(pad); root.appendChild(body);
    H.REGION_ORDER.forEach((r, i) => {
      const R = H.REGIONS[r], st = S.regions[r] || {}, open = H.regionOpen(S, r);
      const c = UI.btn('card' + (open ? '' : ' locked'), () => { if (!open) return UI.toast('Bring back the song before it first.'); Au.sfx('step'); regionSheet(r); });
      const pic = el('div', 'pic'); pic.appendChild(UI.bgEl(r, UI.W, 40, !st.clears)); c.appendChild(pic);
      const boss = UI.sp(R.boss, 1, { variant: S.dinSeen[R.boss] ? '' : 'sil', flip: true, anim: false }); boss.classList.add('boss'); if (!st.clears && open) pic.appendChild(boss);
      add(c, add(el('div', 'info'), box('row between', txt('disp', open ? R.n : '? ? ?'), st.clears ? txt('badge gold', '♪ singing') : open ? txt('badge', 'silent') : UI.icon('ic_lock')), txt('dim small', open ? `${R.sub} Din level ${R.lvl[0]}–${R.lvl[1]}.` : 'The road is not open yet.')));
      pad.appendChild(c); if (i < 3) pad.appendChild(el('div', 'path'));
    });
    const regionSheet = (r) => {
      const R = H.REGIONS[r], st = S.regions[r] || {};
      const fams = [...new Set(R.din.map((d) => H.DIN[d].family))];
      const pool = UI.petRow(R.pool, (x) => S.seen[x]);
      const kids = [txt('disp', R.n), txt('dim', R.sub), box('row wrap', txt('label', 'The Din here'), fams.map((f) => UI.icon('fam_' + f))), txt('label', 'Shells from here can hold'), pool];
      kids.push(key(`Set out <span class="sub">Lv ${R.lvl[0]}–${R.lvl[1]}</span>`, () => start(r, false), 'gold wide'));
      if (st.clears) kids.push(key(`Encore <span class="sub">Lv ${R.encore[0]}–${R.encore[1]}</span>`, () => start(r, true), 'wide'));
      else kids.push(txt('dim small center', 'Bring the song back to unlock an Encore: the same road, much louder.'));
      kids.push(key('Not yet', UI.closeModal, 'black wide sm')); UI.modal(...kids);
    };
    const start = (r, enc) => {
      if (H.bandPets(S).filter(Boolean).length < 1) return UI.toast('Nobody is on stage.');
      const go = () => { S.delve = H.genDelve(S, r, enc, rnd); UI.save(); UI.go('delve'); };
      if (S.delve) UI.confirm('Leave the other road?', 'The band is still out in ' + H.REGIONS[S.delve.region].n + '. Setting out again ends that delve. You keep what you earned.', 'Set out', go); else go();
    };
  };
})(window.H);
