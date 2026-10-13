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

/** Hushsong for Android: the whole game is one page bundled in the app, shown full screen in a WebView. */
public class MainActivity extends Activity {
    private static final int INK = 0xFF2B2140;
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
        if (saved != null) web.restoreState(saved);
        if (web.getUrl() == null) web.loadUrl("file:///android_asset/index.html");
    }

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
