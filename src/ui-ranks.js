/* Hushsong — the Ranks screen: online boards for Adventure floors and Encore waves (kept by src/net.js). */
(function (H) {
  'use strict';
  const tr = (s, v) => H.T(s, v);
  const Au = H.Audio, UI = H.UI, Net = H.Net, el = UI.el, add = UI.add, box = UI.box, txt = UI.txt, key = UI.key;
  // the boards: id, tab name, what the number is
  const BOARDS = [['floors', H.T.k('Floors'), H.T.k('Floors cleared')], ['encore', H.T.k('Encore'), H.T.k('Best wave')], ['encore_week', H.T.k('This week'), H.T.k('Best wave')]];

  // a name box: up to 16 letters, Enter submits
  const nameInput = (val, onEnter) => {
    const i = el('input', 'namein'); i.type = 'text'; i.maxLength = Net.NAME_MAX; i.autocomplete = 'off'; i.spellcheck = false; i.value = val || ''; i.placeholder = tr('Your name'); i.setAttribute('aria-label', tr('Your name'));
    i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); onEnter(); } }); return i;
  };
  const why = (r) => (r === 'name' ? tr('Pick a name of 1 to 16 letters.') : tr('Could not reach the boards. Check your connection and try again.'));
  // send a name; the key shows it is busy meanwhile
  const sendName = async (inp, btn, msg, done) => {
    if (btn.disabled) return; const S = UI.S; btn.disabled = true; msg.textContent = '';
    const r = await Net.setName(S, inp.value, UI.save); btn.disabled = false;
    if (r) { msg.textContent = why(r); return; }
    Au.sfx('good'); UI.save(); done();
  };
  UI.renameRanks = (after) => {
    const S = UI.S, msg = txt('small bad center'), save = key(tr('Save'), () => sendName(inp, save, msg, () => { UI.closeModal(); after(); }), 'wide go'), inp = nameInput(S.net.name, () => save.click());
    UI.modal(txt('disp', tr('Change your name')), txt('small dim', tr('It changes on every board.')), inp, msg, save, key(tr('Cancel'), UI.closeModal, 'wide soft'));
    setTimeout(() => inp.focus(), 50);
  };

  UI.screens.ranks = (root, pr) => {
    const S = UI.S; UI.music('camp', H.stage(S.stage).region);
    let tab = BOARDS.some((b) => b[0] === pr.tab) ? pr.tab : 'floors', live = true, ask = 0;
    root.appendChild(UI.topbar(tr('Ranks'), () => UI.go(pr.from || 'home'), UI.wallet()));
    const seg = el('div', 'seg three'); root.appendChild(seg);
    const body = el('div', 'scroll'), pad = el('div', 'pad ranks'), foot = el('div', 'gofoot rankfoot'); body.appendChild(pad); add(root, body, foot);

    // one player on a board
    const row = (r, mine) => {
      const c = el('div', 'rkrow' + (r.me || mine ? ' me' : '') + (r.rank <= 3 ? ' top' + r.rank : ''));
      const faces = el('div', 'rkband'); (r.band || []).forEach((f) => { if (H.FORMS[f]) faces.appendChild(UI.sp(f, 0.42, { anim: false })); });
      add(c, el('b', 'rkn', String(r.rank)), add(el('div', 'grow col rkwho'), el('b', 'rkname', ''), txt('small dim', tr('Lv {level}', { level: r.level }))), faces, el('b', 'rkv', UI.fmt(r.v)));
      c.querySelector('.rkname').textContent = r.name;   // names are other players' words: text, never markup
      return c;
    };
    const join = () => {
      const msg = txt('small bad center'), go = key(tr('Join the boards'), () => sendName(inp, go, msg, () => { Net.cache = {}; draw(); }), 'wide go'), inp = nameInput('', () => go.click());
      return add(el('div', 'panel col rkjoin'), box('row', UI.icon('ic_trophy', 1.6), add(el('div', 'grow col'), txt('disp', tr('Put your name up')), txt('small dim', tr('Your name, band and best results go online so others can see them. Nothing else leaves this device.')))), inp, msg, go);
    };
    // the bar along the bottom: your place, and a way to change your name
    const mine = (data) => {
      foot.innerHTML = ''; if (!Net.named(S)) { foot.hidden = true; return; } foot.hidden = false;
      const me = data && data.me, line = me ? tr('You: <b>#{rank}</b>', { rank: me.rank }) : data ? tr('Not on this board yet') : '';
      const who = el('b', 'rkname', ''); who.textContent = S.net.name;
      add(foot, box('row', add(el('div', 'grow col'), who, txt('small', line)), me ? el('b', 'rkv', UI.fmt(me.v)) : null, key(tr('Rename'), () => UI.renameRanks(() => { Net.cache = {}; draw(); }), 'soft sm')));
    };
    const draw = async () => {
      seg.innerHTML = '';
      for (const [id, name] of BOARDS) { const b = el('button', id === tab ? 'on' : '', tr(name)); b.type = 'button'; b.setAttribute('aria-pressed', String(id === tab)); b.addEventListener('click', () => { if (tab === id) return; tab = id; UI.cur.params.tab = id; Au.sfx('tap'); draw(); }); seg.appendChild(b); }
      const B = BOARDS.find((b) => b[0] === tab), n = ++ask;
      pad.innerHTML = ''; if (!Net.named(S)) pad.appendChild(join());
      const list = el('div', 'rklist'); add(pad, box('row between rkhead', txt('label', tr('Player')), txt('label', tr(B[2]))), list);
      if (tab === 'encore_week') pad.insertBefore(txt('small dim center', tr('Resets on Monday')), list);
      list.appendChild(txt('dim center rkmsg', tr('Tuning in…'))); mine(null);
      let data;
      try { await Net.flush(S, UI.save); data = await Net.board(S, tab); }
      catch (e) {
        if (!live || n !== ask) return; list.innerHTML = '';
        add(list, txt('dim center rkmsg', tr('Could not reach the boards. Check your connection and try again.')), key(tr('Try again'), () => draw(), 'soft wide')); return;
      }
      if (!live || n !== ask) return; list.innerHTML = '';
      if (!data.top.length) list.appendChild(txt('dim center rkmsg', tr('No one here yet. Be the first!')));
      data.top.forEach((r) => list.appendChild(row(r)));
      mine(data);
    };
    draw();
    return { leave: () => { live = false; } };
  };
})(window.H);
