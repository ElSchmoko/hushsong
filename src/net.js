/* Hushsong — online leaderboards, kept by Supabase (supabase/setup.sql). No DOM.
   Nothing leaves the device until the player picks a name on the Ranks screen. After that, each new best
   (Adventure floors cleared, Encore waves) is sent with the name and the band's forms, and nothing else.
   Each save holds its own id and a secret that proves it, so the save code carries a player's place to another device. */
(function (H) {
  'use strict';
  const BASE = 'https://ldiqtoqrzfcjdvrrvazg.supabase.co/rest/v1/rpc/', KEY = 'sb_publishable_jQL0W7aW87RfSSaPas2EQQ_aLo2qCcg';
  const Net = (H.Net = { NAME_MAX: 16, BOARDS: ['floors', 'encore', 'encore_week'] });

  const rand = (n) => { const a = new Uint8Array(n); (globalThis.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => (a[i] = Math.floor(Math.random() * 256))); return Array.from(a, (x) => x.toString(16).padStart(2, '0')).join(''); };
  const uuid = () => { const h = rand(16).split(''); h[12] = '4'; h[16] = '89ab'[parseInt(h[16], 16) & 3]; const s = h.join(''); return [s.slice(0, 8), s.slice(8, 12), s.slice(12, 16), s.slice(16, 20), s.slice(20)].join('-'); };

  // this save's online self: made the first time it is asked for
  Net.me = (S) => { if (!S.net || !S.net.id) S.net = { id: uuid(), secret: rand(20), name: null, dirty: 0 }; return S.net; };
  Net.named = (S) => !!(S.net && S.net.name);
  Net.cleanName = (s) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, Net.NAME_MAX);

  const call = async (fn, args) => {
    const ctl = typeof AbortController === 'function' ? new AbortController() : null, t = setTimeout(() => ctl && ctl.abort(), 9000);
    try {
      const r = await fetch(BASE + fn, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(args), signal: ctl ? ctl.signal : undefined });
      const j = await r.json().catch(() => null);
      if (!r.ok) { const e = new Error((j && j.message) || 'HTTP ' + r.status); e.status = r.status; e.code = j && j.code; throw e; }
      return j;
    } finally { clearTimeout(t); }
  };
  Net.call = call;

  // what this save sends: its name, the band's forms, its level and its bests
  Net.payload = (S) => {
    const me = Net.me(S); if (H.refreshEncore) H.refreshEncore(S); const E = S.encore || {};
    return { p_id: me.id, p_secret: me.secret, p_name: me.name, p_band: H.teamPets(S).filter(Boolean).map((p) => p.form), p_level: S.level,
      p_floors: Math.max(0, S.stage - 1), p_encore: E.best || 0, p_encore_week: E.weekBest || 0 };
  };

  // Send this save's bests. Calls while one is on its way fold into one more send after it.
  // An offline phone keeps the `dirty` mark and sends at the next chance (a new best, opening Ranks, or coming back online).
  let flight = null, again = false;
  Net.push = (S, onSaved) => {
    if (!Net.named(S)) return Promise.resolve(false);
    S.net.dirty = 1;
    if (flight) { again = true; return flight; }
    flight = (async () => {
      let ok = false;
      do { again = false; try { await call('hs_submit', Net.payload(S)); ok = true; } catch (e) { ok = false; Net.lastError = e; again = false; } } while (again);
      if (ok) S.net.dirty = 0; flight = null; Net.cache = {}; if (onSaved) onSaved(); return ok;
    })();
    return flight;
  };
  Net.flush = (S, onSaved) => (Net.named(S) && S.net.dirty ? Net.push(S, onSaved) : Promise.resolve(true));

  // Pick or change the name. Resolves to null when it went through, or to a reason: 'name', 'taken', 'offline'.
  Net.setName = async (S, name, onSaved) => {
    const n = Net.cleanName(name); if (!n) return 'name';
    const me = Net.me(S), was = me.name; me.name = n;
    try { await call('hs_submit', Net.payload(S)); me.dirty = 0; Net.cache = {}; if (onSaved) onSaved(); return null; }
    catch (e) { me.name = was; return e.status === 403 || e.code === '42501' ? 'taken' : e.code === '22023' ? 'name' : 'offline'; }
  };

  // One board: { top: [{ rank, name, band, level, v, me }], me: { rank, v } | null }. Kept for half a minute.
  Net.cache = {};
  Net.board = async (S, which) => {
    const hit = Net.cache[which]; if (hit && Date.now() - hit.at < 30000) return hit.data;
    const data = await call('hs_board', { p_board: which, p_id: S.net && S.net.name ? S.net.id : null });
    Net.cache[which] = { at: Date.now(), data }; return data;
  };
})(typeof window !== 'undefined' ? window.H : globalThis.H);
