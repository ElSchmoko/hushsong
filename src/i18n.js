/* Hushsong — languages. Every line the game shows goes through H.T(english, values).
   The English text is the key; a language pack maps it to its own words. {name} marks a value the game fills in.
   A key whose text depends on a number ('{n} turns') has plural forms, picked with the language's own plural rules.
   Pet and Din names stay English everywhere. */
(function (H) {
  'use strict';
  // each language in its own name; `font` is the rounded display font that language's pack brings along
  H.LANGS = [
    ['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'], ['it', 'Italiano'], ['pt', 'Português (Brasil)'],
    ['tr', 'Türkçe'], ['ru', 'Русский'], ['ja', '日本語'], ['zh', '简体中文'], ['ko', '한국어'],
  ];
  // the locale used for dates
  H.LOCALE = { en: 'en-GB', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', pt: 'pt-BR', tr: 'tr-TR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN', ko: 'ko-KR' };
  H.lang = 'en'; H.dict = {};
  // English plural forms; every other language brings its own
  const EN = {
    '{n} turns': { one: '{n} turn', other: '{n} turns' }, '{n} times': { one: 'once', two: 'twice', other: '{n} times' },
    '{n} shells': { one: '{n} shell', other: '{n} shells' }, '{n} echoes': { one: '{n} echo', other: '{n} echoes' },
    '{n} boons': { one: '{n} boon', other: '{n} boons' }, '{n} pets': { one: '{n} pet', other: '{n} pets' },
    '{n} waves': { one: '{n} wave', other: '{n} waves' }, 'Foes are {n} levels above you': { one: 'Foes are {n} level above you', other: 'Foes are {n} levels above you' },
    '{n} rehearsals open': { one: '{n} rehearsal open', other: '{n} rehearsals open' }, '{n} bosses open': { one: '{n} boss open', other: '{n} bosses open' },
    'Resets in {n} days': { one: 'Resets tomorrow', other: 'Resets in {n} days' }, 'resets in {n} days': { one: 'resets tomorrow', other: 'resets in {n} days' },
    '+{n} levels!': { one: 'Level up!', other: '+{n} levels!' }, 'You cleared <b>{n}</b> waves.': { one: 'You cleared <b>{n}</b> wave.', other: 'You cleared <b>{n}</b> waves.' },
    'Open another ({n} left)': { other: 'Open another ({n} left)' }, '{n} shells to open': { one: '{n} shell to open', other: '{n} shells to open' },
    '+{n} echoes': { one: '+{n} echo', other: '+{n} echoes' }, '+{n} {pet} echoes': { one: '+{n} {pet} echo', other: '+{n} {pet} echoes' },
  };
  H.T_EN = EN;
  let rules = new Intl.PluralRules('en'), rulesOrd = null;
  const pick = (o, n) => { if (typeof o !== 'object') return o; if (n === 2 && o.two != null && H.lang === 'en') return o.two; const k = rules.select(n); return o[k] != null ? o[k] : o.other != null ? o.other : o.one; };
  // T(english, values): the current language's words, with {name} filled in
  H.T = (s, v) => {
    let o = H.dict[s]; if (o == null || o === '') o = EN[s] != null ? EN[s] : s;
    o = pick(o, v && v.n != null ? +v.n : 1);
    if (H.T.rec) H.T.rec(s);
    return v ? String(o).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m)) : o;
  };
  // how two sentences sit next to each other (no space in Japanese and Chinese)
  H.T.sep = () => (H.lang === 'ja' || H.lang === 'zh' ? '' : ' ');
  // marks English words kept in a list and translated where they are shown (for the key collector)
  H.T.k = (s) => s;
  H.T.list = (xs) => xs.join(H.lang === 'ja' || H.lang === 'zh' ? '、' : ', ');

  /* ----- game data that carries its own words: translated in place, the English kept beside it ----- */
  const fields = (o, keys) => { if (!o) return; o._en = o._en || {}; for (const k of keys) { if (o._en[k] == null && typeof o[k] === 'string') o._en[k] = o[k]; if (o._en[k] != null) o[k] = H.T(o._en[k]); } };
  H.localizeData = () => {
    for (const k in H.FAMILIES) fields(H.FAMILIES[k], ['n']);
    for (const k in H.ROLES) fields(H.ROLES[k], ['n', 'd']);
    for (const k in H.STATUS) fields(H.STATUS[k], ['n', 'd']);
    for (const k in H.RARITY) fields(H.RARITY[k], ['n']);
    for (const k in H.ITEM_TYPES) fields(H.ITEM_TYPES[k], ['n']);
    for (const k in H.LEGENDS) fields(H.LEGENDS[k], ['n', 'pd']);
    for (const k in H.REGIONS) fields(H.REGIONS[k], ['n']);
    for (const k in H.SPECIES) fields(H.SPECIES[k], ['lore']);
    for (const k in H.STORY) { const s = H.STORY[k]; s._en = s._en || s.slice(); s[0] = H.T(s._en[0]); s[1] = H.T(s._en[1]); }
    for (const e of H.ENSEMBLES) fields(e, ['n']);
    for (const r of H.RECORDS) if (!r.ens) fields(r, ['n', 'd']); else { r._en = r._en || {}; r.n = H.ENS[r.ens].n; r.d = H.T('Win a rehearsal with the {ens}.', { ens: r.n }); }
    for (const k in H.SETS) { H.SETS._en = H.SETS._en || Object.assign({}, H.SETS); if (k !== '_en') H.SETS[k] = H.T(H.SETS._en[k]); }
    for (const m of [H.SWELL, H.LOUD, H.FEEDBACK]) fields(m, ['n', 'd']);
    // moves: names and the few written by hand; the rest are written from their effects (H.describe)
    const mv = (a) => fields(a, ['n', 'd']);
    for (const k in H.FORMS) { const f = H.FORMS[k]; for (const s of ['beat', 'phrase', 'finale', 'passive']) if (f[s]) mv(f[s]); }
    for (const k in H.DIN) { const d = H.DIN[k]; for (const s of ['beat', 'phrase', 'finale', 'passive']) if (d[s]) mv(d[s]); }
    if (H.TWISTS) {
      for (const k in H.TWISTS) fields(H.TWISTS[k], ['n', 'd']);
      for (const k in H.VENUES) { H.VENUES._en = H.VENUES._en || Object.assign({}, H.VENUES); if (k !== '_en') H.VENUES[k] = H.T(H.VENUES._en[k]); }
      for (const k in H.BOONS) { const b = H.BOONS[k]; fields(b, ['n', 'd']); b.perk.n = b.n; b.perk.d = b.d; }
      for (const c of H.COMBOS) { c._en = c._en || c[2]; c[2] = H.T(c._en); }
      for (const k in H.EVENTS) { const e = H.EVENTS[k]; fields(e, ['n', 'd']); for (const o of e.opts) fields(o, ['n', 'd']); }
    }
  };
  // switch language: words come from the pack (already loaded), plural rules from the browser
  H.setLang = (code, dict) => {
    H.lang = code; H.dict = code === 'en' ? {} : dict || {};
    if (typeof document !== 'undefined') document.documentElement.lang = code === 'zh' ? 'zh-Hans' : code === 'pt' ? 'pt-BR' : code;
    try { rules = new Intl.PluralRules(code === 'zh' ? 'zh-CN' : code === 'pt' ? 'pt-BR' : code); } catch (e) { rules = new Intl.PluralRules('en'); }
    H.localizeData();
  };
  /* ----- language packs: shipped compressed (H.PACKS, from tools/i18n.js pack), opened when first chosen ----- */
  // H.PACKS.keys is the English key list; each language is a list of its words in the same order (0 = not translated)
  H.FONTS = H.FONTS || {};
  const inflate = async (b64) => {
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), ds = new DecompressionStream('deflate-raw');
    return JSON.parse(await new Response(new Blob([bin]).stream().pipeThrough(ds)).text());
  };
  let KEYS = null; const cache = {};
  H.langReady = (code) => code === 'en' || !!(H.PACKS && H.PACKS[code] && typeof DecompressionStream !== 'undefined');
  // a language's extra letters (Cyrillic, Turkish, Japanese…) come as a small font cut to just those letters
  const addFonts = async (code) => {
    const list = H.FONTS[code]; if (!list || typeof document === 'undefined' || document.getElementById('font-' + code)) return;
    const st = document.createElement('style'); st.id = 'font-' + code;
    st.textContent = list.map(([fam, w, b64, rng]) => `@font-face{font-family:'${fam}';font-weight:${w};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2')${rng ? ';unicode-range:' + rng : ''}}`).join('\n');
    document.head.appendChild(st);
    try { await Promise.race([Promise.all(list.map(([fam, w]) => document.fonts.load(`${w} 20px '${fam}'`))), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* the system font stands in */ }
  };
  // Japanese, Chinese and Korean headings: a rounded font from Google Fonts, cut to just the letters the game uses.
  // It is not carried in the file; offline (or where Google is out of reach) the device's own font is used instead.
  const WEB = { ja: 'M PLUS Rounded 1c:wght@800', zh: 'ZCOOL KuaiLe', ko: 'Jua' };
  const webFont = (code) => {
    if (!WEB[code] || typeof document === 'undefined' || document.getElementById('webfont-' + code)) return;
    const cjk = /[\u2E80-\u9FFF\uAC00-\uD7AF\u3000-\u303F\uFF00-\uFFEF]/, chars = new Set(), add = (v) => { for (const ch of String(v).replace(/<[^>]+>|\{\w+\}/g, '')) if (cjk.test(ch)) chars.add(ch); };
    for (const k in cache[code]) { const v = cache[code][k]; if (typeof v === 'object') Object.values(v).forEach(add); else add(v); }
    let text = [...chars].join(''); while (encodeURIComponent(text).length > 7600) text = text.slice(0, -40);
    const l = document.createElement('link'); l.id = 'webfont-' + code; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(WEB[code].split(':')[0]).replace(/%20/g, '+') + (WEB[code].includes(':') ? ':' + WEB[code].split(':')[1] : '') + '&display=swap&text=' + encodeURIComponent(text);
    l.onload = () => { try { document.fonts.ready.then(() => H.UI && H.UI.cur && H.UI.cur.name !== 'battle' && H.UI.fit && H.UI.fit(document.getElementById('screen'))); } catch (e) { /* fine */ } };
    document.head.appendChild(l);
  };
  // the families headings and canvas text use, in order; a language without its own display font falls through to the device's
  H.fontStack = (display) => (display ? "'Baloo 2', " : '') + "'Nunito', 'M PLUS Rounded 1c', 'ZCOOL KuaiLe', 'Jua', system-ui, sans-serif";
  H.loadLang = async (code) => {
    if (!H.langReady(code)) code = 'en';
    if (code === 'en') { H.setLang('en'); return 'en'; }
    try {
      if (!KEYS) KEYS = await inflate(H.PACKS.keys);
      if (!cache[code]) { const arr = await inflate(H.PACKS[code]), d = {}; arr.forEach((v, i) => { if (v) d[KEYS[i]] = v; }); cache[code] = d; }
      await addFonts(code); H.setLang(code, cache[code]); webFont(code); return code;
    } catch (e) { H.setLang('en'); return 'en'; }
  };
  // the language a new player probably wants: their device's, if the game has it
  H.guessLang = () => {
    const prefs = (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language])) || [];
    for (const p of prefs) { const c = String(p || '').toLowerCase().split('-')[0]; if (H.LANGS.some((l) => l[0] === c) && H.langReady(c)) return c; }
    return 'en';
  };
})(typeof window !== 'undefined' ? (window.H = window.H || {}) : (globalThis.H = globalThis.H || {}));
