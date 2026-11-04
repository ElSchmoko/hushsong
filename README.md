# Hushsong

A cosy creature battler: collect music pets, form a band, and bring the songs back to a hushed world.
Everything (art, music, sound) is drawn and played by code in one HTML page.

## Play

- **On your phone:** open the GitHub Pages site, then "Add to Home Screen" (iPhone: Share → Add to Home Screen; Android: menu → Install app).
  It runs full screen and works offline. Progress lives on the device; use **Menu → Save code** to move a game between devices.
- **Android app:** download https://elschmoko.github.io/hushsong/hushsong.apk on the phone and open it (allow "install unknown apps" for your browser once).
  The app plays offline and updates itself: on launch it checks `app/version.json` on the site and downloads a newer game in the background.
  Only changes to the app shell (icon, Android code) need a new APK; raise `android:versionCode` for each one.

## Build

```sh
npm install          # fonts only
npm run build        # dist/hushsong.html, the single-page game
npm run pwa          # docs/, the installable app (index.html, manifest, service worker, icons)
npm run icons        # re-render the app icons from assets/icon/icon.html (needs Playwright)
npm run apk          # build/android/hushsong.apk (see tools/apk.sh for the tools it needs and the signing key)
npm run sim          # 4000 random battles as a crash check
node test/pvp.js     # 4000 Battle of the Bands matches
```

## Leaderboards

The Ranks screen (Home, top right) shows online boards for Adventure floors cleared, best Encore wave, and this week's Encore wave.
They are kept by Supabase: `src/net.js` talks to the project, and `supabase/setup.sql` sets up its table and functions (run it once in the Supabase SQL Editor; running it again is safe).
Nothing is sent until a player picks a name. After that, each new best goes up with the name and the band, and an offline phone sends it later.

## Battle of the Bands

Online PvP from level 15 (Gigs). A player locks in a band; each match fetches one rival band from another player near their level and Applause,
and the fight runs on the phone: the player steers their band (or uses Auto), the rival band plays on its own, both at the lower of the two levels. Five matches a day (local midnight): a win pays 50 notes,
a loss 20, the fifth match a shell. Only the attacker's Applause moves; it is the Bands board on the Ranks screen.

- `src/pvp.js` the rules, band copies and pay; `src/ui-pvp.js` the screens and the one-time news card; `src/net.js` the two calls
- `supabase/setup.sql` adds the columns and `hs_pvp_match` / `hs_pvp_result` (run it again in the SQL Editor: it keeps existing scores)
- A result made offline waits in the save and goes up at the next chance. Only bands from players active in the last 30 days are matched.
- `node test/pvp.js` runs 4000 headless band-vs-band matches; `MORE=./pvp-play.js node test/play.js bands` walks the screens with the server answered locally

## Layout

- `src/` game source: data, engine, art, audio and UI, bundled in the order listed in `build.js`
- `assets/icon/` the app icon (Hum up close) and its rendered sizes
- `android/` the Android app: a full-screen WebView around the bundled game
- `tools/` icon, web-app and Android builders
- `supabase/` the database setup for the leaderboards
- `test/` headless simulations and scripted screenshot playthroughs
- `docs/` the built web app, served by GitHub Pages
