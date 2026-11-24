package com.gulzaibsoomro.dodgewing;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.res.Configuration;
import android.graphics.Insets;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.os.Vibrator;
import android.os.VibrationEffect;
import android.util.Log;
import android.util.DisplayMetrics;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.ConsoleMessage;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.window.OnBackInvokedDispatcher;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.UserMessagingPlatform;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.lang.ref.WeakReference;
import java.util.UUID;
import org.json.JSONObject;

/**
 * Full-screen offline WebView game + Google AdMob (banner, interstitial, rewarded rescue).
 * Ads live in native views OUTSIDE the WebView, as AdMob policy requires.
 * Google AdSense must NOT be used inside an app.
 */
public final class MainActivity extends Activity {
    private static final String TAG = "Dodgewing";
    private static WeakReference<MainActivity> currentActivity = new WeakReference<>(null);
    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean destroyed, foreground, sdkReady, interstitialLoading, rewardedLoading, interstitialShowing;
    private long nextInterstitialLoad, nextRewardedLoad;
    private long activeInterstitialSerial;
    private long lastInterstitialShown = -1, lastVibration = -1000;
    private int bannerWidth;
    private int bannerOrientation;
    private boolean bannerLoading, bannerLoaded;
    private volatile boolean privacyOptionsRequired;
    private static final class GameScreen {
        final String name; final long serial;
        GameScreen(String name, long serial) { this.name = name; this.serial = serial; }
    }
    private final AtomicReference<GameScreen> gameScreen = new AtomicReference<>(new GameScreen("unknown", 0));
    private int consentGeneration;
    private long nextBannerLoad;
    private final Runnable retryAds = () -> { if (canLoadAds()) { loadBanner(); loadInterstitial(); loadRewarded(); } };

    private boolean canLoadAds() {
        return !destroyed && !isFinishing() && foreground && sdkReady &&
            UserMessagingPlatform.getConsentInformation(this).canRequestAds();
    }
    private void retryLater() {
        handler.removeCallbacks(retryAds);
        handler.postDelayed(retryAds, 60000);
    }
    private void adError(String stage, AdError error) {
        // Deliberately omit response IDs, ad units, device identifiers and request payloads.
        Log.w(TAG, stage + " domain=" + error.getDomain() + " code=" + error.getCode());
    }

    private WebView game;
    private FrameLayout bannerHolder;
    private AdView banner;
    private InterstitialAd interstitial;
    private RewardedAd rewarded;
    private boolean rewardedShowing = false;
    private int gameOvers = 0;
    private final AtomicBoolean adsStarted = new AtomicBoolean(false);

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        currentActivity = new WeakReference<>(this);
        lastInterstitialShown = getPreferences(MODE_PRIVATE).getLong("last_interstitial_shown", -1);
        getWindow().setStatusBarColor(Color.BLACK);
        getWindow().setNavigationBarColor(Color.BLACK);
        enterImmersiveMode();

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(5, 5, 7));

        game = new WebView(this);
        if (Build.VERSION.SDK_INT >= 26 && WebView.getCurrentWebViewPackage() != null)
            Log.i(TAG, "WebView version=" + WebView.getCurrentWebViewPackage().versionName + " API=" + Build.VERSION.SDK_INT);
        game.setBackgroundColor(Color.rgb(5, 5, 7));
        // Default composition uses the window's hardware acceleration when available.
        game.setLayerType(getIntent().getBooleanExtra("softwareRendering", false)
            ? View.LAYER_TYPE_SOFTWARE : View.LAYER_TYPE_NONE, null);
        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        // Respect Android's chosen font scale; CSS allows text to reflow instead
        // of shrinking it back to fit fixed-height cards.
        settings.setTextZoom(Math.round(getResources().getConfiguration().fontScale * 100));
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            game.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, true);
        }
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        game.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                Log.i(TAG, "page ready; size=" + view.getWidth() + "x" + view.getHeight()
                    + " accelerated=" + view.isHardwareAccelerated() + " layer=" + view.getLayerType());
                updatePrivacyOptions();
                syncEarnedRescue();
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                Log.w(TAG, "web resource failure code=" + error.getErrorCode() + " main=" + request.isForMainFrame());
                if (request.isForMainFrame() && !isFinishing()) new AlertDialog.Builder(MainActivity.this)
                    .setMessage("Dodgewing could not load. Saved progress is retained.")
                    .setPositiveButton("Reload", (dialog, which) -> view.reload()).show();
            }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                Log.e(TAG, "renderer lost; crashed=" + detail.didCrash());
                ((ViewGroup)view.getParent()).removeView(view);
                view.destroy();game = null;
                if (!isFinishing() && !destroyed) new AlertDialog.Builder(MainActivity.this)
                    .setMessage("The graphics process stopped. Reload to return to Home. Saved progress is retained; the current flight may be lost.")
                    .setPositiveButton("Reload", (dialog, which) -> recreate())
                    .setNeutralButton("Compatibility mode", (dialog, which) -> {
                        getIntent().putExtra("softwareRendering", true);recreate();
                    }).setNegativeButton("Close", (dialog, which) -> finish()).setCancelable(false).show();
                return true;
            }
        });
        game.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage message) {
                // Only our bounded diagnostics include text; omit arbitrary page/SDK console payloads.
                if (message.messageLevel() == ConsoleMessage.MessageLevel.ERROR ||
                    message.messageLevel() == ConsoleMessage.MessageLevel.WARNING) {
                    String detail = message.message().startsWith("[Dodgewing] ") ? message.message() : "";
                    Log.w(TAG, "web console " + message.messageLevel() + " line=" + message.lineNumber()
                        + " " + detail.substring(0, Math.min(detail.length(), 280)));
                }
                return true;
            }
        });
        game.addJavascriptInterface(new AdBridge(), "DodgewingAds");

        bannerHolder = new FrameLayout(this);
        bannerHolder.setBackgroundColor(Color.BLACK);
        // An unloaded banner occupies no space; the native view remains above
        // the WebView and within the root's consumed system/cutout insets.
        bannerHolder.setVisibility(View.GONE);
        root.addView(bannerHolder, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
        root.addView(game, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));

        setContentView(root);
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return WindowInsets.CONSUMED;
            }
            int left=insets.getSystemWindowInsetLeft(), top=insets.getSystemWindowInsetTop();
            int right=insets.getSystemWindowInsetRight(), bottom=insets.getSystemWindowInsetBottom();
            if (Build.VERSION.SDK_INT >= 28 && insets.getDisplayCutout()!=null) {
                left=Math.max(left,insets.getDisplayCutout().getSafeInsetLeft());
                top=Math.max(top,insets.getDisplayCutout().getSafeInsetTop());
                right=Math.max(right,insets.getDisplayCutout().getSafeInsetRight());
                bottom=Math.max(bottom,insets.getDisplayCutout().getSafeInsetBottom());
            }
            view.setPadding(left,top,right,bottom);return insets.consumeSystemWindowInsets();
        });
        root.requestApplyInsets();
        game.addOnLayoutChangeListener((view,l,t,r,b,ol,ot,or,ob) -> {
            if (r-l != or-ol && canLoadAds()) handler.post(this::loadBanner);
        });
        game.loadUrl("file:///android_asset/www/dodgewing.html");

        // Android 13+ predictive back callback.
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }

        gatherConsentThenStartAds();
    }

    /** EEA/UK consent (Google UMP) before any ad request. */
    private void gatherConsentThenStartAds() {
        final ConsentInformation info = UserMessagingPlatform.getConsentInformation(this);
        ConsentRequestParameters params = new ConsentRequestParameters.Builder().build();
        info.requestConsentInfoUpdate(this, params,
            () -> UserMessagingPlatform.loadAndShowConsentFormIfRequired(this, formError -> {
                if (formError != null) Log.w(TAG, "consent form error code=" + formError.getErrorCode());
                Log.i(TAG, "consent ready=" + info.canRequestAds());
                handleConsentReady();
            }),
            requestError -> {
                Log.w(TAG, "consent update error code=" + requestError.getErrorCode() + " ready=" + info.canRequestAds());
                handleConsentReady();
            });
        if (info.canRequestAds()) startAds();
        updatePrivacyOptions();
    }

    private void updatePrivacyOptions() {
        privacyOptionsRequired = UserMessagingPlatform.getConsentInformation(this).getPrivacyOptionsRequirementStatus()
            == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED;
        if (game != null && !destroyed) game.evaluateJavascript("window.onPrivacyOptionsChanged&&window.onPrivacyOptionsChanged()", null);
    }

    private void clearAdInventory() {
        consentGeneration++;
        interstitial = null; rewarded = null;
        interstitialLoading = false; rewardedLoading = false;
        if (banner != null) { banner.destroy(); banner = null; }
        bannerLoading = false; bannerLoaded = false;
        if (bannerHolder != null) { bannerHolder.removeAllViews(); bannerHolder.setVisibility(View.GONE); }
    }

    private void handleConsentReady() {
        updatePrivacyOptions();
        if (!UserMessagingPlatform.getConsentInformation(this).canRequestAds()) { clearAdInventory(); return; }
        startAds();
        if (sdkReady) { loadBanner(); loadInterstitial(); loadRewarded(); }
    }

    private void showPrivacyOptions() {
        if (destroyed || !foreground || !privacyOptionsRequired) return;
        UserMessagingPlatform.showPrivacyOptionsForm(this, error -> {
            if (error != null) Log.w(TAG, "privacy options error code=" + error.getErrorCode());
            clearAdInventory();
            handleConsentReady();
        });
    }

    private boolean bannerScreenAllowed() {
        String name = gameScreen.get().name;
        return "menu".equals(name) || "hangar".equals(name) || "settings".equals(name);
    }

    private void updateBannerVisibility() {
        boolean visible = bannerLoaded && bannerScreenAllowed() && canLoadAds();
        if (bannerHolder != null) bannerHolder.setVisibility(visible ? View.VISIBLE : View.GONE);
        if (banner != null) { if (visible) banner.resume(); else banner.pause(); }
    }

    private void startAds() {
        if (!adsStarted.compareAndSet(false, true)) return;
        MobileAds.setRequestConfiguration(new RequestConfiguration.Builder()
            .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G)
            .build());
        MobileAds.initialize(this, status -> runOnUiThread(() -> {
            if (destroyed) return;
            sdkReady = true;Log.i(TAG, "ads SDK initialized");
            loadBanner();
            loadInterstitial();
            loadRewarded();
        }));
    }

    private void loadBanner() {
        if (!canLoadAds() || !bannerScreenAllowed() || game == null || game.getWidth() <= 0) return;
        DisplayMetrics dm = getResources().getDisplayMetrics();
        int widthDp = Math.max(1, (int) (game.getWidth() / dm.density));
        int orientation = getResources().getConfiguration().orientation;
        if (banner != null && bannerWidth == widthDp && bannerOrientation == orientation) {
            if (!bannerLoaded && !bannerLoading && SystemClock.elapsedRealtime() >= nextBannerLoad) {
                bannerLoading = true;banner.loadAd(new AdRequest.Builder().build());
            }
            return;
        }
        if (banner != null) banner.destroy();
        bannerHolder.setVisibility(View.GONE);
        bannerWidth = widthDp;
        bannerOrientation = orientation;
        bannerLoaded = false;bannerLoading = true;
        banner = new AdView(this);
        final AdView requestedBanner = banner;
        banner.setAdListener(new AdListener() {
            @Override public void onAdLoaded() {
                if (banner != requestedBanner) return;
                // Reveal on the next eligible screen transition, not during an active layout.
                bannerLoading = false;bannerLoaded = true;Log.i(TAG, "banner loaded widthDp=" + widthDp);
            }
            @Override public void onAdFailedToLoad(LoadAdError error) {
                if (banner != requestedBanner) return;
                bannerLoading = false;bannerLoaded = false;bannerHolder.setVisibility(View.GONE);nextBannerLoad = SystemClock.elapsedRealtime() + 60000;
                adError("banner load", error);
                if (!destroyed) retryLater();
            }
        });
        banner.setAdUnitId(getString(R.string.admob_banner_id));
        banner.setAdSize(AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(this, widthDp));
        bannerHolder.removeAllViews();
        bannerHolder.addView(banner);
        banner.loadAd(new AdRequest.Builder().build());
    }

    private void loadInterstitial() {
        if (!canLoadAds() || interstitialLoading || interstitial != null || interstitialShowing || SystemClock.elapsedRealtime() < nextInterstitialLoad) return;
        interstitialLoading = true;final int generation = consentGeneration;Log.i(TAG, "interstitial request");
        InterstitialAd.load(this, getString(R.string.admob_interstitial_id),
            new AdRequest.Builder().build(), new InterstitialAdLoadCallback() {
                @Override public void onAdLoaded(InterstitialAd ad) {
                    if (generation != consentGeneration) return;
                    interstitialLoading = false;if (destroyed) return;
                    Log.i(TAG, "interstitial loaded");
                    interstitial = ad;
                    ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                        @Override public void onAdShowedFullScreenContent() {
                            lastInterstitialShown = System.currentTimeMillis();
                            getPreferences(MODE_PRIVATE).edit().putLong("last_interstitial_shown", lastInterstitialShown).commit();
                        }
                        @Override public void onAdDismissedFullScreenContent() {
                            interstitialShowing = false;Log.i(TAG, "interstitial dismissed");
                            finishInterstitialDecision(activeInterstitialSerial);
                            interstitial = null;
                            loadInterstitial();
                        }
                        @Override public void onAdFailedToShowFullScreenContent(AdError e) {
                            interstitialShowing = false;adError("interstitial show", e);
                            finishInterstitialDecision(activeInterstitialSerial);
                            interstitial = null;
                            loadInterstitial();
                        }
                    });
                }
                @Override public void onAdFailedToLoad(LoadAdError e) {
                    if (generation != consentGeneration) return;
                    interstitialLoading = false;adError("interstitial load", e);
                    nextInterstitialLoad = SystemClock.elapsedRealtime() + 60000;if (!destroyed) retryLater();
                    interstitial = null;
                }
            });
    }

    /** Reward is issued only after AdMob reports that the user earned it. */
    private void finishInterstitialDecision(long serial) {
        if (game != null && !destroyed) game.evaluateJavascript("window.onInterstitialDecisionComplete&&window.onInterstitialDecisionComplete(" + serial + ")", null);
    }
    private void sendRewardResult(boolean earned) {
        if (game != null) {
            game.evaluateJavascript("window.onRewardedRescueResult && window.onRewardedRescueResult(" + earned + ")", null);
        }
    }

    private void syncEarnedRescue() {
        if (destroyed || !foreground || game == null) return;
        android.content.SharedPreferences prefs = getPreferences(MODE_PRIVATE);
        String id = prefs.getString("earned_rescue_id", "");
        int level = prefs.getInt("earned_rescue_level", 0);
        if (id.isEmpty() || level < 1 || level > 30) return;
        game.evaluateJavascript("window.receiveNativeRescue&&window.receiveNativeRescue(" + JSONObject.quote(id) + "," + level + ")", result -> {
            if ("true".equals(result) && id.equals(prefs.getString("earned_rescue_id", "")))
                prefs.edit().remove("earned_rescue_id").remove("earned_rescue_level").commit();
        });
    }

    private static void notifyCurrentRescue() {
        MainActivity current = currentActivity.get();
        if (current != null) current.runOnUiThread(current::syncEarnedRescue);
    }

    private void loadRewarded() {
        if (!canLoadAds() || rewardedLoading || rewarded != null || rewardedShowing || SystemClock.elapsedRealtime() < nextRewardedLoad) return;
        rewardedLoading = true;final int generation = consentGeneration;Log.i(TAG, "rewarded request");
        RewardedAd.load(this, getString(R.string.admob_rewarded_rescue_id),
            new AdRequest.Builder().build(), new RewardedAdLoadCallback() {
                @Override public void onAdLoaded(RewardedAd ad) { if (generation != consentGeneration) return; rewardedLoading = false;if (!destroyed) rewarded = ad;Log.i(TAG, "rewarded loaded"); }
                @Override public void onAdFailedToLoad(LoadAdError error) {
                    if (generation != consentGeneration) return;
                    rewardedLoading = false;rewarded = null;adError("rewarded load", error);
                    nextRewardedLoad = SystemClock.elapsedRealtime() + 60000;if (!destroyed) retryLater();
                }
            });
    }

    private void showRewardedRescue(int rescueLevel, long serial) {
        if (rewardedShowing) { sendRewardResult(false); return; }
        if (getPreferences(MODE_PRIVATE).contains("earned_rescue_id")) { sendRewardResult(false); syncEarnedRescue(); return; }
        GameScreen screen = gameScreen.get();
        if (rescueLevel < 1 || rescueLevel > 30 || screen.serial != serial || !"over".equals(screen.name) || rewarded == null || !canLoadAds() || interstitialShowing) {
            Log.i(TAG, "rewarded unavailable; no rescue granted");
            sendRewardResult(false);
            // A failed load should not trap the player; they can retry later.
            if (adsStarted.get()) loadRewarded();
            return;
        }
        final RewardedAd ad = rewarded;
        rewarded = null; // Each rewarded ad object can only be displayed once.
        rewardedShowing = true;
        final AtomicBoolean earned = new AtomicBoolean(false);
        final AtomicBoolean savedReward = new AtomicBoolean(false);
        final AtomicBoolean finished = new AtomicBoolean(false);
        ad.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override public void onAdDismissedFullScreenContent() {
                Log.i(TAG, "rewarded dismissed earned=" + earned.get());
                finished.set(true);
                rewardedShowing = false;
                if (!savedReward.get()) sendRewardResult(false);
                notifyCurrentRescue();
                loadRewarded();
            }
            @Override public void onAdFailedToShowFullScreenContent(AdError error) {
                adError("rewarded show", error);
                finished.set(true);
                rewardedShowing = false;
                sendRewardResult(false);
                notifyCurrentRescue();
                loadRewarded();
            }
        });
        try {
            ad.show(this, reward -> {
                if (!earned.compareAndSet(false, true)) return;
                android.content.SharedPreferences prefs = getPreferences(MODE_PRIVATE);
                if (!prefs.contains("earned_rescue_id")) {
                    boolean saved = prefs.edit().putString("earned_rescue_id", UUID.randomUUID().toString()).putInt("earned_rescue_level", rescueLevel).commit();
                    savedReward.set(saved);
                    if (!saved) Log.e(TAG, "unable to persist earned rescue");
                }
                if (finished.get()) notifyCurrentRescue();
            });
            handler.postDelayed(() -> {
                if (finished.compareAndSet(false, true)) {
                    rewardedShowing = false;sendRewardResult(false);notifyCurrentRescue();loadRewarded();
                }
            }, 120_000);
        } catch (RuntimeException e) {
            finished.set(true);rewardedShowing = false;sendRewardResult(false);loadRewarded();
        }
    }

    /** Called from the local game's JavaScript bridge. */
    private final class AdBridge {
        @JavascriptInterface
        public void setGameScreen(String screen, long serial) {
            gameScreen.set(new GameScreen(screen, serial));
            if (bannerScreenAllowed()) {
                runOnUiThread(() -> { updateBannerVisibility(); loadBanner(); });
            } else if (Looper.myLooper() == Looper.getMainLooper()) {
                updateBannerVisibility();
            } else {
                // Hide the native row before the WebView transitions into play.
                CountDownLatch hidden = new CountDownLatch(1);
                runOnUiThread(() -> { try { updateBannerVisibility(); } finally { hidden.countDown(); } });
                try { hidden.await(2, TimeUnit.SECONDS); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
        }
        @JavascriptInterface
        public boolean isPrivacyOptionsRequired() { return privacyOptionsRequired; }
        @JavascriptInterface
        public void showPrivacyOptions() { runOnUiThread(MainActivity.this::showPrivacyOptions); }
        /** The root native layout already excludes system bars/cutouts and the banner. */
        @JavascriptInterface
        public boolean usesNativeInsets() { return true; }

        @JavascriptInterface
        public void vibrate(int durationMs) {
            runOnUiThread(() -> {
                long now = SystemClock.elapsedRealtime();
                if (destroyed || !foreground || now - lastVibration < 150) return;
                try {
                    Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
                    if (v == null || !v.hasVibrator()) return;
                    int duration = Math.max(1, Math.min(60, durationMs));
                    if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE));
                    else v.vibrate(duration);
                    lastVibration = now;
                } catch (RuntimeException e) { Log.w(TAG, "haptic unavailable"); }
            });
        }

        @JavascriptInterface
        public void cancelVibration() {
            runOnUiThread(() -> {
                try { Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE); if (v != null) v.cancel(); }
                catch (RuntimeException e) { Log.w(TAG, "haptic cancellation unavailable"); }
            });
        }

        @JavascriptInterface
        public void requestRewardedRescue(int level, long serial) {
            runOnUiThread(() -> {
                GameScreen screen = gameScreen.get();
                if (game == null || screen.serial != serial || !"over".equals(screen.name)) { sendRewardResult(false); return; }
                game.evaluateJavascript("(typeof S!=='undefined'&&S==='over'&&typeof rewardedRescuePending!=='undefined'&&rewardedRescuePending&&adScreenSerial===" + serial + ")", result -> {
                    if (!"true".equals(result)) { sendRewardResult(false); return; }
                    showRewardedRescue(level, serial);
                });
            });
        }

        @JavascriptInterface
        public void onGameOver(double runSeconds, long serial) {
            runOnUiThread(() -> {
                if (AdPolicy.eligibleRun(runSeconds)) gameOvers++;
                // Only between runs (game-over screen), never mid-flight.
                GameScreen screen = gameScreen.get();
                boolean ready = screen.serial == serial && "over".equals(screen.name) && canLoadAds() && !rewardedShowing && !interstitialShowing && interstitial != null;
                if (AdPolicy.shouldShow(gameOvers, runSeconds, System.currentTimeMillis(), lastInterstitialShown, ready) && game != null) {
                    game.evaluateJavascript("(window.claimInterstitialDecision&&window.claimInterstitialDecision(" + serial + "))", result -> {
                        GameScreen current = gameScreen.get();
                        if (!"true".equals(result) || current.serial != serial || !"over".equals(current.name) || !canLoadAds() || rewardedShowing || interstitialShowing || interstitial == null) { finishInterstitialDecision(serial); return; }
                        InterstitialAd ad = interstitial;interstitial = null;interstitialShowing = true;
                        activeInterstitialSerial = serial;
                        try { Log.i(TAG, "interstitial show");ad.show(MainActivity.this); }
                        catch (RuntimeException e) { interstitialShowing = false;finishInterstitialDecision(serial);loadInterstitial(); }
                    });
                } else {
                    finishInterstitialDecision(serial);
                    Log.i(TAG, "interstitial skipped; eligible cadence=" + (gameOvers % AdPolicy.EVERY_ELIGIBLE_RUNS) + " loaded=" + (interstitial != null));
                    loadInterstitial();
                }
            });
        }
    }

    private void handleBack() {
        if (game == null) { finish(); return; }
        game.evaluateJavascript("typeof window.handleFlightBack==='function' && window.handleFlightBack()", handled -> {
            if ("true".equals(handled) || destroyed) return;
            if (game.canGoBack()) game.goBack();
            else finish();
        });
    }

    @SuppressWarnings({"deprecation", "MissingSuperCall"})
    @Override
    public void onBackPressed() {
        // Used only below Android 13; API 33+ goes through the back-invoked callback.
        handleBack();
    }

    @Override protected void onPause() {
        foreground = false;
        if (game != null) game.evaluateJavascript("if(typeof pauseG==='function')pauseG()", null);
        if (banner != null) banner.pause();
        if (game != null) game.onPause();
        super.onPause();
    }

    @Override public void onConfigurationChanged(Configuration configuration) {
        super.onConfigurationChanged(configuration);
        // Re-evaluate adaptive sizing only for actual width/orientation changes;
        // loadBanner's cached dimensions prevent resize-driven request loops.
        if (game != null) game.getSettings().setTextZoom(Math.round(configuration.fontScale * 100));
        handler.post(this::loadBanner);
    }

    @Override protected void onResume() {
        super.onResume();
        foreground = true;
        if (game != null) game.onResume();
        syncEarnedRescue();
        updateBannerVisibility();
        if (sdkReady) { loadBanner();loadInterstitial();loadRewarded();retryLater(); }
    }

    @Override protected void onDestroy() {
        destroyed = true;handler.removeCallbacksAndMessages(null);
        if (currentActivity.get() == this) currentActivity.clear();
        if (banner != null) banner.destroy();
        if (game != null) game.destroy();
        banner = null;game = null;interstitial = null;rewarded = null;
        super.onDestroy();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterImmersiveMode();
    }

    @SuppressWarnings("deprecation")
    private void enterImmersiveMode() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
    }
}
