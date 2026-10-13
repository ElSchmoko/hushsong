#!/usr/bin/env bash
# Builds the Android app: build/android/hushsong.apk. Run after `node build.js`, `node tools/icons.js` and `node tools/pwa.js`.
# Raise android:versionCode in android/AndroidManifest.xml for every APK you hand out, or it won't install over the last one.
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

# the game as the app runs it, plus its build number (both made by tools/pwa.js, the same files the app updates from)
cp "$ROOT/docs/app/index.html" "$ROOT/docs/app/version.json" "$B/assets/"

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
