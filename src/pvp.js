/* Hushsong — Battle of the Bands: online PvP against other players' locked bands. No DOM.
   A player locks in a band; a copy of it (forms, stars, equipment) goes online with the next match. A match fetches one
   rival band near the player's level and Applause (src/net.js, supabase/setup.sql) and fights it here, on the phone,
   auto on both sides. Both bands play at the lower of the two players' levels. Only the attacker's Applause moves.
   Five matches a day (local midnight, like the Daily Gig): a win pays 50 notes, a loss 20, the fifth match a shell. */
(function (H) {
  'use strict';
  H.PVP = {
    unlock: 15, perDay: 5, win: 50, loss: 20, dayShells: 1,
    start: 1000, elo: 32, giant: 100,                           // Applause: where everyone starts, how far one match can move it, the gap for Giant Killer
    restless: { from: 30, per: 0.06 }, finish: 60,               // long fights: hits land harder after turn 30; at turn 60 the larger share of HP left wins
  };
  H.pvpOpen = (S) => S.level >= H.PVP.unlock;

  // this save's PvP state; the day's count resets at local midnight
  H.refreshPvp = (S, ms) => {
    const d = H.dayOf(ms == null ? Date.now() : ms);
    if (!S.pvp) S.pvp = { day: d, played: 0, band: null, applause: H.PVP.start, cur: null, unsent: null };
    if (S.pvp.day === d) return false;
    S.pvp.day = d; S.pvp.played = 0; return true;
  };
  H.pvpLeft = (S) => { H.refreshPvp(S); return Math.max(0, H.PVP.perDay - S.pvp.played); };

  // the locked band: its pets as they are now (a pet given away since drops out)
  H.pvpBand = (S) => { H.refreshPvp(S); return (S.pvp.band || []).map((id) => (id ? H.petById(S, id) : null)).filter(Boolean); };
  H.pvpLocked = (S) => H.pvpBand(S).length === 3;
  H.lockPvpBand = (S) => { H.refreshPvp(S); const T = H.teamPets(S).filter(Boolean); if (T.length !== 3) return false; S.pvp.band = T.map((p) => p.id); return true; };
  H.pvpSameAsTeam = (S) => { const a = H.pvpBand(S).map((p) => p.id), b = H.teamPets(S).filter(Boolean).map((p) => p.id); return a.length === b.length && a.every((id, i) => id === b[i]); };
  H.pvpEnsemble = (S) => { const T = H.pvpBand(S); return T.length === 3 ? H.ensembleOf(T.map(H.petFamily)) : null; };

  /* ----- band copies: what goes online, and what comes back ----- */
  // one pet: { f: form, r: stars, g: [{ t: equipment type, r: rarity, l: legendary or null }] }
  H.bandCopy = (S) => H.pvpBand(S).map((p) => ({ f: p.form, r: p.rank || 0, g: (p.gear || []).map((id) => id && H.itemById(S, id)).filter(Boolean).map((it) => ({ t: it.type, r: it.rar, l: it.leg || null })) }));
  // a copy from another player, kept to what this version of the game knows
  H.cleanCopy = (band) => (Array.isArray(band) ? band : []).slice(0, 3).filter((c) => c && H.FORMS[c.f]).map((c) => ({
    f: c.f, r: Math.max(0, Math.min(H.RANK_MAX, Math.floor(+c.r || 0))),
    g: (Array.isArray(c.g) ? c.g : []).slice(0, 2).filter((g) => g && H.ITEM_TYPES[g.t] && H.RARITY[g.r]).map((g) => ({ t: g.t, r: g.r, l: g.r === 'l' && g.l && H.LEGENDS[g.l] ? g.l : null })),
  }));
  H.copyFamily = (c) => H.SPECIES[H.FORMS[c.f].sp].family;
  H.copyEnsemble = (band) => (band.length === 3 ? H.ensembleOf(band.map(H.copyFamily)) : null);
  // a pet from a copy, built like the player's own pets (passive, stars and equipment all count)
  H.copyUnit = (c, level) => {
    const form = H.FORMS[c.f], sp = H.SPECIES[form.sp], kit = H.kitOf(c.f), perks = kit.passive ? [kit.passive] : [];
    if (c.r) perks.push({ mod: { hp: c.r * H.RANK_STEP, vol: c.r * H.RANK_STEP } });
    for (const g of c.g) perks.push(H.itemPerk({ type: g.t, rar: g.r, leg: g.l || undefined }));
    return { name: form.n, form: c.f, sprite: c.f, family: sp.family, role: kit.role, lvl: level, base: H.petStats({ form: c.f }, level), perks, kit };
  };
  // a whole number from a match token, to seed its fight: the same token always plays the same fight
  H.seedOf = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

  /* ----- Applause: the same sum the server makes, so the phone can show it at once, online or not ----- */
  H.applauseDelta = (mine, theirs, win) => Math.round(H.PVP.elo * ((win ? 1 : 0) - 1 / (1 + Math.pow(10, (theirs - mine) / 400))));

  /* ----- a match ----- */
  // a fetched rival becomes this save's open match; it counts toward today's five at once, so it cannot be dodged
  H.openPvpMatch = (S, res) => {
    H.refreshPvp(S); const band = H.cleanCopy(res.rival.band);
    S.pvp.played++;
    S.pvp.cur = { token: res.token, seed: H.seedOf(res.token), n: S.pvp.played, rival: { name: String(res.rival.name || '?').slice(0, 16), level: Math.max(1, +res.rival.level || 1), applause: +res.rival.applause || H.PVP.start, band } };
    return S.pvp.cur;
  };
  H.pvpLevel = (S) => Math.max(1, Math.min(S.level, S.pvp.cur ? S.pvp.cur.rival.level : S.level));
  H.startPvp = (S) => {
    const cur = S.pvp.cur, L = H.pvpLevel(S), mine = H.pvpBand(S), ens = H.pvpEnsemble(S), foeEns = H.copyEnsemble(cur.rival.band);
    return new H.Battle({ allies: mine.map((p) => H.buildPetUnit(p, L, S)), enemies: cur.rival.band.map((c) => H.copyUnit(c, L)), rng: H.rng(cur.seed),
      ensemble: ens ? ens.id : null, foeEnsemble: foeEns ? foeEns.id : null, rules: { restless: H.PVP.restless, finish: H.PVP.finish } });
  };
  // the match is over (or given up): pay at once, keep the result to send
  H.finishPvp = (S, win, battle) => {
    const cur = S.pvp.cur; if (!cur) return null;
    const P = H.PVP, before = S.pvp.applause, delta = H.applauseDelta(before, cur.rival.applause, win);
    const out = { pvp: true, win, rival: cur.rival, notes: win ? P.win : P.loss, shells: cur.n === P.perDay ? P.dayShells : 0, delta, applause: Math.max(0, before + delta), n: cur.n,
      why: battle && battle.ev.some((e) => e.t === 'end' && e.why === 'time') ? 'time' : null, records: [] };
    S.notes += out.notes; S.shells += out.shells;
    S.pvp.applause = out.applause; S.pvp.unsent = { token: cur.token, win: win ? 1 : 0 }; S.pvp.cur = null;
    const st = S.stats; st.pvp = (st.pvp || 0) + 1; if (win) st.pvpWins = (st.pvpWins || 0) + 1;
    if (win && cur.rival.applause - before >= P.giant) st.pvpGiant = 1;
    st.applause = Math.max(st.applause || 0, out.applause);
    return out;
  };
})(typeof window !== 'undefined' ? window.H : globalThis.H);
