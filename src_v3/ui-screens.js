/* Hushsong — screens outside of battle: title, intro, choosing a pet, home, pets. */
(function (H) {
  'use strict';
  const A = H.Art, Au = H.Audio, UI = H.UI, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key;
  const rnd = Math.random;
  const tierName = ['Not evolved', 'Evolved once', 'Fully evolved'];

  // Where to go when nothing else is asked for.
  UI.next = () => {
    const S = UI.S;
    if (!S.flags.intro) return UI.go('intro');
    if (!S.pets.length) return UI.go('pick', { starter: true });
    if (S.hatch && S.hatch.length) return UI.go('pick', {});
    UI.go('home');
  };

  /* ================= title ================= */
  UI.screens.title = (root) => {
    const S = UI.S, W = UI.W, Hh = UI.Hh; UI.music('silent');
    const c = A.make(W, Hh), ctx = c.getContext('2d'); c.className = 'px bgc'; c.style.width = `calc(var(--u) * ${W})`; c.style.height = `calc(var(--u) * ${Hh})`;
    ctx.drawImage(A.bg('camp', W, Hh), 0, 0);
    const gy = Math.round(Hh * 0.62);
    ctx.drawImage(A.sprite('wagon', 0), Math.round(W / 2 - 70), gy - 40);
    const show = S.pets.length ? H.teamPets(S).filter(Boolean).map((p) => p.form) : ['thud', 'twang', 'hum'];
    show.forEach((f, i) => ctx.drawImage(A.sprite(f, 0), Math.round(W / 2 - 24 + i * 30), gy - 14 + (i % 2) * 10));
    const t = el('div', 'title'); t.appendChild(c);
    add(t, el('div', 'logo', 'HUSH<br><span>SONG</span>'), txt('center', 'Collect musical pets.<br>Bring the music back.'));
    const b = key(S.pets.length ? 'Continue' : 'Play', () => UI.next(), 'go wide big'); b.classList.add('push'); t.appendChild(b);
    if (S.pets.length) t.appendChild(key('Menu', () => UI.settings(), 'wide soft sm'));
    root.appendChild(t);
  };

  /* ================= intro ================= */
  UI.screens.intro = (root) => {
    UI.music('silent');
    const slides = [['ridge', ['racket', 'gibber', 'hiss'], 'The world has gone quiet. Noisy monsters called <b>the Din</b> have drowned out all the music.'], ['camp', ['thud', 'twang', 'hum'], 'Musical pets can win it back. Battle the Din stage by stage, and your team grows as you go.']];
    let i = 0; const s = el('div', 'story'), stage = el('div', 'stage'), p = el('p');
    const draw = () => { stage.innerHTML = ''; stage.appendChild(UI.bgEl(slides[i][0], UI.W, 90)); const r = box('row center'); r.style.position = 'relative'; r.style.gap = '0'; slides[i][1].forEach((k) => { const c = UI.sp(k, 1, { flip: i === 0 }); c.style.margin = '0 calc(var(--u) * -4) calc(var(--u) * 2)'; r.appendChild(c); }); stage.appendChild(r); p.innerHTML = slides[i][2]; A.tick(UI.frame); };
    const k = key('Next', () => { i++; if (i >= slides.length) { UI.S.flags.intro = 1; UI.next(); } else { draw(); k.textContent = 'Choose my first pet'; } }, 'go wide');
    draw(); add(s, stage, p, k); root.appendChild(s);
  };

  /* ================= choose one pet of three ================= */
  UI.screens.pick = (root, pr) => {
    const S = UI.S, starter = !!pr.starter, opts = starter ? H.STARTERS : (S.hatch || []);
    if (!opts.length) return UI.go('home');
    UI.music(S.pets.length ? 'camp' : 'silent', 'camp');
    add(root, UI.topbar(starter ? 'Your first pet' : 'A new pet!', null));
    const body = el('div', 'scroll'), pad = el('div', 'pad'); body.appendChild(pad); root.appendChild(body);
    let sel = -1; const go = key('Choose', () => choose(), 'go wide big push'); go.disabled = true;
    add(pad, txt('center', starter ? 'Pick one to start with. You will meet more later.' : opts.length > 1 ? 'You found some shells, each with a pet inside. <b>You can keep one.</b>' : 'You found a shell with a pet inside.'));
    const btns = opts.map((sp, i) => {
      const d = H.SPECIES[sp]; const b = UI.btnPick(() => { sel = i; btns.forEach((x, j) => x.classList.toggle('sel', j === i)); go.disabled = false; go.textContent = 'Choose ' + H.FORMS[sp].n; Au.sfx('noise', sp); });
      add(b, UI.sp(sp, 1), add(el('div', 'col'), box('row', txt('disp', H.FORMS[sp].n), UI.famChip(d.family)), txt('small dim', d.lore)));
      pad.appendChild(b); return b;
    });
    pad.appendChild(go);
    const choose = () => {
      const sp = opts[sel]; const pet = H.addPet(S, sp); S.hatch = null; UI.save(); Au.sfx('evolve'); UI.music('camp', 'camp');
      const s = UI.sp(sp, 2); s.classList.add('pop'); const inTeam = S.team.includes(pet.id);
      UI.modal(txt('label center', 'Joined you'), box('row center', s), txt('disp big center', H.FORMS[sp].n), txt('center dim', inTeam ? 'It goes straight into your team.' : 'Your team is full. Tap its card to swap it in.'), key('Great', () => UI.go('home'), 'go wide'));
    };
  };
  UI.btnPick = (fn) => { const b = el('button', 'key pick'); b.type = 'button'; b.addEventListener('click', fn); return b; };

  /* ================= home: your line-up, the next foes, and everyone you can choose from ================= */
  const roleOf = (f) => { let x = H.FORMS[f]; while (x && !x.role && x.parent) x = H.FORMS[x.parent]; return (x && x.role) || 'stray'; };
  UI.screens.home = (root, pr) => {
    const S = UI.S, W = UI.W; let n = Math.min(pr.n || S.stage, S.stage);
    const draw = () => {
      root.innerHTML = '';
      const st = H.stage(n), R = H.REGIONS[st.region]; UI.music('camp', st.region);
      // top bar: level and progress to the next one
      const bar = el('div', 'bar'); add(bar, txt('disp', 'Lv ' + S.level), add(el('div', 'grow'), UI.meter(S.level >= H.MAX_LEVEL ? 1 : S.xp / H.xpNeed(S.level))), UI.notes(S.notes), UI.gearKey(() => UI.settings())); bar.firstChild.style.flex = 'none'; root.appendChild(bar);
      // the line-up, standing where the next stage is
      const lh = Math.max(74, Math.min(104, UI.Hh - 232)), lu = el('div', 'lineup'); lu.style.height = `calc(var(--u) * ${lh})`; lu.appendChild(UI.bgEl(st.region, W, lh));
      const row = el('div', 'lurow');
      H.teamPets(S).forEach((p) => {
        if (!p) { row.appendChild(el('div', 'lu empty', '<b>+</b><span>free spot</span>')); return; }
        const b = el('button', 'lu'); b.type = 'button'; b.addEventListener('click', () => { Au.sfx('noise', H.petSpecies(p)); UI.go('pet', { id: p.id, n }); });
        add(b, add(el('div', 'lutop'), UI.icon('fam_' + H.petFamily(p)), el('span', '', ['Young', 'Grown', 'Master'][H.petTier(p)])), UI.sp(p.form, 1), add(el('div', 'lunm'), UI.icon('role_' + roleOf(p.form)), el('span', '', H.FORMS[p.form].n)));
        if (H.nextForms(p).some((f) => H.evoCheck(S, p, f).ok)) b.appendChild(add(el('span', 'dot'), UI.icon('ic_bang')));
        row.appendChild(b);
      });
      lu.appendChild(row); root.appendChild(lu);
      // who is waiting on this stage
      const fb = el('div', 'foebar'), prev = key('‹', () => { n--; draw(); }, 'soft sm'), nextB = key('›', () => { n++; draw(); }, 'soft sm'); prev.disabled = n <= 1; nextB.disabled = n >= S.stage;
      const foes = el('div', 'foes'); st.enemies.forEach((e) => { const c = UI.sp(e.id, 1, { flip: true, anim: false }); if (H.DIN[e.id].boss) c.classList.add('bossy'); foes.appendChild(c); });
      const gapL = st.level - S.level;
      add(fb, add(el('div', 'col'), txt('label', R.n + (n > H.STORY_STAGES ? ' · encore' : '')), box('row', prev, txt('disp', (st.boss ? 'Boss ' : 'Stage ') + n), nextB), txt('small ' + (gapL >= 2 ? 'bad' : 'dim'), n < S.stage ? 'Cleared · half reward' : `Foes Lv ${st.level}` + (H.isShellStage(n) ? ' · new pet!' : ''))), foes);
      root.appendChild(fb);
      // everyone you have, as cards; tap to put in or take out
      const body = el('div', 'scroll'), pad = el('div', 'pad'); pad.style.gap = 'calc(var(--u) * 3)'; pad.style.minHeight = '0';
      const missing = H.SPECIES_ORDER.filter((sp) => !H.owned(S, sp));
      add(pad, box('row between', txt('disp', 'Choose pets'), txt('small dim', `${S.pets.length} of ${H.SPECIES_ORDER.length} found`)));
      const grid = el('div', 'cards');
      const sorted = S.pets.slice().sort((a, b) => (S.team.includes(b.id) ? 1 : 0) - (S.team.includes(a.id) ? 1 : 0));
      sorted.forEach((p) => {
        const on = S.team.includes(p.id), fam = H.petFamily(p), c = el('div', 'card ' + fam + (on ? ' on' : ''));
        const main = el('button', 'cmain'); main.type = 'button'; main.addEventListener('click', () => toggle(p));
        add(main, UI.sp(p.form, 1, { anim: false }), add(el('div', 'cnm'), UI.icon('role_' + roleOf(p.form)), el('span', '', H.FORMS[p.form].n))); if (on) main.appendChild(add(el('div', 'ccheck'), UI.icon('ic_bigcheck')));
        const fi = UI.icon('fam_' + fam); fi.classList.add('cfam');
        const evo = H.nextForms(p).some((f) => H.evoCheck(S, p, f).ok), info = el('button', 'cinfo'); info.type = 'button'; info.setAttribute('aria-label', 'Details'); info.appendChild(UI.icon(evo ? 'ic_bang' : 'ic_info')); info.addEventListener('click', () => { Au.sfx('tap'); UI.go('pet', { id: p.id, n }); });
        add(c, main, fi, info); grid.appendChild(c);
      });
      missing.forEach((sp) => { const c = el('div', 'card locked'); add(c, add(el('div', 'cmain'), UI.sp(sp, 1, { variant: 'sil', anim: false }), el('div', 'cnm', '? ? ?'))); grid.appendChild(c); });
      add(pad, grid, txt('small dim center', missing.length ? 'Tap a card to put a pet in or out of your team. Every boss you beat leaves a new pet.' : 'Tap a card to put a pet in or out of your team.'));
      body.appendChild(pad); root.appendChild(body);
      // two big buttons
      const foot = el('div', 'gofoot'); const ready = H.teamPets(S).some(Boolean);
      if (gapL >= 2 && n >= S.stage) foot.appendChild(txt('warn', `Tough stage: foes are ${gapL} levels above you`));
      const a = key('Auto battle', () => { S.settings.auto = 1; UI.go('battle', { n }); }, 'blue grow'), b = key('Battle', () => { S.settings.auto = 0; UI.go('battle', { n }); }, 'coral grow big'); a.disabled = b.disabled = !ready;
      add(foot, box('row', a, b)); root.appendChild(foot); A.tick(UI.frame);
    };
    const toggle = (p) => {
      const at = S.team.indexOf(p.id);
      if (at >= 0) { if (S.team.filter(Boolean).length <= 1) return UI.toast('Your team needs at least one pet.'); S.team[at] = null; Au.sfx('back'); }
      else { const free = S.team.indexOf(null); if (free < 0) return UI.toast('Team is full. Take one out first.'); S.team[free] = p.id; Au.sfx('noise', H.petSpecies(p)); }
      UI.save(); draw();
    };
    draw();
  };
  UI.screens.pets = (root, pr) => UI.screens.home(root, pr);

  /* ================= one pet ================= */
  UI.screens.pet = (root, pr) => {
    const S = UI.S, pet = H.petById(S, pr.id); if (!pet) return UI.go('home');
    const body = el('div', 'scroll');
    const draw = () => {
      root.innerHTML = ''; body.innerHTML = '';
      const f = H.FORMS[pet.form], sp = H.SPECIES[f.sp], kit = H.kitOf(pet.form), st = UI.statSheet(S, pet), pad = el('div', 'pad');
      add(root, UI.topbar(f.n, () => UI.go('home', { n: pr.n }), [UI.notes(S.notes)]));
      const stage = el('div', 'stage'); stage.appendChild(UI.bgEl('camp', UI.W, 90)); stage.appendChild(UI.sp(pet.form, 2));
      add(pad, stage, box('row wrap center', UI.famChip(sp.family), kit.role !== 'stray' ? UI.roleChip(kit.role) : null, txt('chip', tierName[f.tier])), txt('small dim center', f.tier ? H.ROLES[kit.role].d : sp.lore),
        el('div', 'stats', `<div><b>${st.hp}</b><span class="label">HP</span></div><div><b>${st.vol}</b><span class="label">Power</span></div><div><b>${st.poise}</b><span class="label">Guard</span></div><div><b>${st.tempo}</b><span class="label">Speed</span></div>`));
      // evolution: two big choices
      const kids = H.nextForms(pet);
      if (kids.length) {
        const need = H.TIER_LEVEL[f.tier + 1], row = el('div', 'evo');
        kids.forEach((id) => { const kk = H.kitOf(id), b = key('', () => evoSheet(id)); add(b, UI.sp(id, 1), el('b', '', H.FORMS[id].n), el('span', 'sub', f.tier === 0 ? H.ROLES[kk.role].n : 'new Special')); row.appendChild(b); });
        add(pad, txt('label', 'Evolve into'), row, txt('small dim center', S.level < need ? `Opens at level ${need}. You are level ${S.level}.` : f.tier === 0 ? 'Each path gives it a different role and new moves.' : 'Each path teaches a different Special move.'));
      } else add(pad, txt('small dim center', 'This pet is fully evolved.'));
      add(pad, txt('label', 'Moves'), UI.formInfo(pet.form, false));
      if (f.tier > 0) pad.appendChild(key('Change its path (free)', () => pathSheet(), 'wide soft sm'));
      body.appendChild(pad); root.appendChild(body); A.tick(UI.frame);
    };
    const evoSheet = (id) => {
      const ff = H.FORMS[id], kit = H.kitOf(id), chk = H.evoCheck(S, pet, id);
      const b = key(chk.ok ? (chk.cost ? `Evolve · ${chk.cost} notes` : 'Evolve') : chk.why, () => { H.evolve(S, pet, id); UI.save(); Au.sfx('evolve'); UI.music('camp'); const s = UI.sp(id, 2); s.classList.add('pop'); UI.modal(txt('label center', 'Evolved'), box('row center', s), txt('disp big center', ff.n), txt('center dim', H.ROLES[kit.role].d), key('Great', () => { UI.closeModal(); draw(); }, 'go wide')); }, 'wide go'); b.disabled = !chk.ok;
      UI.modal(box('row', UI.sp(id, 1), add(el('div', 'col grow'), txt('disp', ff.n), box('row wrap', UI.roleChip(kit.role)))), txt('small dim', H.ROLES[kit.role].d), ...UI.formInfo(id, true), b, key('Back', UI.closeModal, 'wide soft'));
    };
    const pathSheet = () => {
      const cur = H.FORMS[pet.form], all = Object.keys(H.FORMS).filter((id) => { const x = H.FORMS[id]; return x.sp === cur.sp && x.tier > 0 && x.tier <= (pet.t2 ? 2 : 1) && id !== pet.form; });
      const kids = [txt('disp', 'Change path'), txt('small dim', 'These are already paid for. Switch as often as you like.')];
      all.forEach((id) => { const b = UI.btnPick(() => { H.evolve(S, pet, id); UI.save(); Au.sfx('evolve'); UI.closeModal(); draw(); }); b.style.minHeight = 'calc(var(--u) * 36)'; add(b, UI.sp(id, 1), add(el('div', 'col'), el('b', '', H.FORMS[id].n), txt('small dim', H.ROLES[H.kitOf(id).role].n + (H.kitOf(id).finale ? ' · ' + H.kitOf(id).finale.n : '')))); kids.push(b); });
      kids.push(key('Back', UI.closeModal, 'wide soft')); UI.modal(...kids);
    };
    const teamSheet = () => {
      const free = S.team.indexOf(null); if (free >= 0) { H.setTeam(S, free, pet.id); UI.save(); Au.sfx('good'); return draw(); }
      const kids = [txt('disp', 'Who steps out?'), txt('small dim', `${H.FORMS[pet.form].n} takes their place.`)];
      H.teamPets(S).forEach((p, i) => { const b = UI.btnPick(() => { H.setTeam(S, i, pet.id); UI.save(); Au.sfx('good'); UI.closeModal(); draw(); }); b.style.minHeight = 'calc(var(--u) * 36)'; add(b, UI.sp(p.form, 1), add(el('div', 'col'), el('b', '', H.FORMS[p.form].n), box('row', UI.famChip(H.petFamily(p))))); kids.push(b); });
      kids.push(key('Cancel', UI.closeModal, 'wide soft')); UI.modal(...kids);
    };
    UI.music('camp', H.stage(S.stage).region); draw();
  };
})(window.H);
