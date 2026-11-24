package com.gulzaibsoomro.dodgewing;

/** Pure interstitial policy, independent of the AdMob SDK and player data. */
final class AdPolicy {
    static final int EVERY_ELIGIBLE_RUNS = 3;
    static final double MIN_RUN_SECONDS = 30;
    static final long MIN_INTERVAL_MS = 120_000L;
    private AdPolicy() {}
    static boolean eligibleRun(double seconds) {
        return !Double.isNaN(seconds) && !Double.isInfinite(seconds) && seconds >= MIN_RUN_SECONDS;
    }
    static boolean shouldShow(int eligibleRuns, double seconds, long now, long lastShown, boolean ready) {
        return ready && eligibleRun(seconds) && eligibleRuns > 0 && eligibleRuns % EVERY_ELIGIBLE_RUNS == 0
            && (lastShown < 0 || (now >= lastShown && now - lastShown >= MIN_INTERVAL_MS));
    }
}
