package com.elschmoko.hushsong;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;

/**
 * Hushsong for Android: the game is one page, shown full screen in a WebView.
 *
 * The page lives in the app's own storage (files/game/index.html). The first launch copies in the version packed
 * inside the app; after that, every launch checks the game's website for a newer build and downloads it in the
 * background. The game always runs from the same place on the phone, so the save carries over every update.
 */
public class MainActivity extends Activity {
    private static final int INK = 0xFF2B2140;
    private static final String SITE = "https://elschmoko.github.io/hushsong/app/";
    private WebView web;

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        Window w = getWindow();
        w.setStatusBarColor(INK);
        w.setNavigationBarColor(INK);

        web = new WebView(this);
        web.setBackgroundColor(INK);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // the save game lives in localStorage
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);            // the game is loaded from the app's own files
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);                    // the game sizes its own text; ignore the phone's font scale
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("file:")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e) { /* no browser */ }
                return true;
            }
        });
        setContentView(web);

        boolean ready = installBundled();
        if (saved != null) web.restoreState(saved);
        if (web.getUrl() == null) web.loadUrl(ready ? gameUrl() : "file:///android_asset/index.html");
        if (ready) checkForUpdate();
    }

    /* ----- where the game lives ----- */

    private File gameDir() { return new File(getFilesDir(), "game"); }
    private File gameFile() { return new File(gameDir(), "index.html"); }
    private File versionFile() { return new File(gameDir(), "version.json"); }
    private String gameUrl() { return Uri.fromFile(gameFile()).toString(); }

    private int installedBuild() {
        try { return new JSONObject(readAll(new FileInputStream(versionFile()))).optInt("build", 0); } catch (Exception e) { return -1; }
    }

    /** Copies the version packed in the app into storage when storage has nothing newer (first launch, or a newer app). */
    private boolean installBundled() {
        try {
            byte[] ver = readBytes(getAssets().open("version.json"));
            int bundled = new JSONObject(new String(ver, "UTF-8")).getInt("build");
            if (gameFile().exists() && installedBuild() >= bundled) return true;
            gameDir().mkdirs();
            writeAtomically(gameFile(), readBytes(getAssets().open("index.html")));
            writeAtomically(versionFile(), ver);
            return true;
        } catch (Exception e) {
            return gameFile().exists();
        }
    }

    /* ----- updates from the website ----- */

    private void checkForUpdate() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    String bust = "?t=" + System.currentTimeMillis();
                    JSONObject remote = new JSONObject(new String(fetch(SITE + "version.json" + bust), "UTF-8"));
                    int build = remote.getInt("build");
                    if (build <= installedBuild()) return;
                    byte[] page = fetch(SITE + "index.html" + bust);
                    // only a complete, untouched download replaces the game
                    if (!sha256(page).equalsIgnoreCase(remote.getString("sha256"))) return;
                    writeAtomically(gameFile(), page);
                    writeAtomically(versionFile(), remote.toString().getBytes("UTF-8"));
                    runOnUiThread(new Runnable() { @Override public void run() { updateArrived(); } });
                } catch (Exception e) {
                    // offline or the site is unreachable: keep playing the version we have
                }
            }
        }).start();
    }

    /** On the title screen the new version loads straight away; mid-game it waits for the next launch. */
    private void updateArrived() {
        web.evaluateJavascript("(window.H&&H.UI&&H.UI.cur&&H.UI.cur.name)||''", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String screen) {
                if ("\"title\"".equals(screen)) web.loadUrl(gameUrl());
                else web.evaluateJavascript("try{H.UI.toast('A new version of Hushsong is ready. It starts next time you open the game.')}catch(e){}", null);
            }
        });
    }

    private static byte[] fetch(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(8000);
        c.setReadTimeout(20000);
        c.setUseCaches(false);
        try {
            if (c.getResponseCode() != 200) throw new Exception("HTTP " + c.getResponseCode());
            return readBytes(c.getInputStream());
        } finally {
            c.disconnect();
        }
    }

    /* ----- small file helpers ----- */

    private static void writeAtomically(File f, byte[] data) throws Exception {
        File tmp = new File(f.getPath() + ".tmp");
        OutputStream o = new FileOutputStream(tmp);
        try { o.write(data); } finally { o.close(); }
        if (!tmp.renameTo(f)) { f.delete(); if (!tmp.renameTo(f)) throw new Exception("rename failed"); }
    }

    private static byte[] readBytes(InputStream in) throws Exception {
        try {
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            int n;
            while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
            return b.toByteArray();
        } finally {
            in.close();
        }
    }

    private static String readAll(InputStream in) throws Exception { return new String(readBytes(in), "UTF-8"); }

    private static String sha256(byte[] data) throws Exception {
        byte[] d = MessageDigest.getInstance("SHA-256").digest(data);
        StringBuilder sb = new StringBuilder();
        for (byte x : d) sb.append(String.format("%02x", x));
        return sb.toString();
    }

    /* ----- lifecycle ----- */

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    // The music stops while the app is in the background and picks up again on return.
    @Override
    protected void onPause() {
        web.evaluateJavascript("try{H.Audio.ctx&&H.Audio.ctx.suspend()}catch(e){}", null);
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        web.evaluateJavascript("try{H.Audio.ctx&&H.Audio.ctx.resume()}catch(e){}", null);
    }

    // Back closes an open sheet first; otherwise the game goes to the background instead of quitting.
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(function(){var m=document.getElementById('modal');if(m&&!m.hidden){H.UI.closeModal();return 1}return 0})()",
            new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String v) { if (!"1".equals(v)) moveTaskToBack(true); }
            });
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
