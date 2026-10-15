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
```

## Leaderboards

The Ranks screen (Home, top right) shows online boards for Adventure floors cleared, best Encore wave, and this week's Encore wave.
They are kept by Supabase: `src/net.js` talks to the project, and `supabase/setup.sql` sets up its table and functions (run it once in the Supabase SQL Editor; running it again is safe).
Nothing is sent until a player picks a name. After that, each new best goes up with the name and the band, and an offline phone sends it later.

## Layout

- `src/` game source: data, engine, art, audio and UI, bundled in the order listed in `build.js`
- `assets/icon/` the app icon (Hum up close) and its rendered sizes
- `android/` the Android app: a full-screen WebView around the bundled game
- `tools/` icon, web-app and Android builders
- `supabase/` the database setup for the leaderboards
- `test/` headless simulations and scripted screenshot playthroughs
- `docs/` the built web app, served by GitHub Pages
