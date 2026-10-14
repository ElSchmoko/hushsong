# Hushsong languages

- `en.txt` lists every English line the game can show: id, English, where it is used, and English plural forms.
  Regenerate it with `node tools/i18n.js keys` after changing any text.
- `<lang>.1.txt`, `<lang>.2.txt`, `<lang>.3.txt` (read together, in order): one line per key, `id<TAB>text`. Keep `{values}` and `<tags>` as they are.
  A line whose text depends on a number can be JSON with plural forms: `{"one": "…", "few": "…", "many": "…", "other": "…"}`.
- `node tools/i18n.js check [lang]` lists missing, stale and broken lines.
- Pet and Din names stay English in every language.
- `fonts.js` holds the extra letters for Turkish and Russian (made by `node tools/fonts.js`, which needs Python with fontTools and brotli).
  Japanese, Chinese and Korean headings load a rounded font from Google Fonts when online and use the device font otherwise.
