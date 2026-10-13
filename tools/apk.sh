#!/usr/bin/env bash
# Builds the Android app: build/android/hushsong.apk. Run after `node build.js` and `node tools/icons.js`.
# Needs (Ubuntu): apt install aapt apksigner zipalign android-sdk-platform-23 dalvik-exchange, and a JDK.
# Signing key: $HUSHSONG_KEYSTORE (default ~/.hushsong/release.keystore) with its password in $HUSHSONG_KEYPASS
# or the file next to it. Updates install over an older version only when signed with the SAME key, so keep it safe.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; B="$ROOT/build/android"
JAR=/usr/lib/android-sdk/platforms/android-23/android.jar
KS="${HUSHSONG_KEYSTORE:-$HOME/.hushsong/release.keystore}"

rm -rf "$B"; mkdir -p "$B/res" "$B/assets" "$B/classes" "$B/gen"
cp -r "$ROOT/android/res/." "$B/res/"
cp -r "$ROOT/assets/icon/out/android/." "$B/res/"

# the game page, wrapped for the app: no web-app manifest or offline cache needed, everything is already on the phone
node -e '
const fs = require("fs"), [src, out] = process.argv.slice(1);
const page = fs.readFileSync(src, "utf8").replace("<title>Hushsong</title>\n", "");
fs.writeFileSync(out, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Hushsong</title>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>html{background:#2b2140;color-scheme:light;height:100%;overscroll-behavior:none}body{margin:0;height:100%;font:14px system-ui}[hidden]{display:none!important}</style>
</head><body>${page}</body></html>`);
' "$ROOT/dist/hushsong.html" "$B/assets/index.html"

aapt package -f -m -M "$ROOT/android/AndroidManifest.xml" -S "$B/res" -A "$B/assets" -I "$JAR" -J "$B/gen" -F "$B/unsigned.apk"
javac -nowarn -Xlint:-options --release 8 -classpath "$JAR" -d "$B/classes" $(find "$ROOT/android/src" "$B/gen" -name '*.java')
dalvik-exchange --dex --output="$B/classes.dex" "$B/classes"
(cd "$B" && aapt add unsigned.apk classes.dex >/dev/null)
zipalign -f -p 4 "$B/unsigned.apk" "$B/aligned.apk"

if [ ! -f "$KS" ]; then
  mkdir -p "$(dirname "$KS")"; PASS="$(head -c 18 /dev/urandom | base64 | tr -dc 'A-Za-z0-9')"
  keytool -genkeypair -keystore "$KS" -storepass "$PASS" -keypass "$PASS" -alias hushsong -keyalg RSA -keysize 4096 -validity 36500 \
    -dname "CN=Hushsong, O=ElSchmoko" >/dev/null 2>&1
  echo "$PASS" > "$KS.pass"; echo "new signing key: $KS (password in $KS.pass)"
fi
PASS="${HUSHSONG_KEYPASS:-$(cat "$KS.pass")}"
apksigner sign --ks "$KS" --ks-pass "pass:$PASS" --ks-key-alias hushsong --out "$B/hushsong.apk" "$B/aligned.apk"
apksigner verify --print-certs "$B/hushsong.apk" | head -2
ls -la "$B/hushsong.apk"
