package com.gulzaibsoomro.dodgewing;

public final class AdPolicyTest {
    private static int passed;
    private static void check(boolean value, String label) {
        if (!value) throw new AssertionError(label);
        passed++;
        System.out.println("PASS " + label);
    }
    public static void main(String[] args) {
        check(!AdPolicy.eligibleRun(2), "short run excluded");
        check(!AdPolicy.eligibleRun(Double.NaN) && !AdPolicy.eligibleRun(Double.POSITIVE_INFINITY), "invalid duration excluded");
        check(AdPolicy.eligibleRun(30), "minimum duration inclusive");
        check(!AdPolicy.shouldShow(1, 40, 100000, -1, true), "first eligible run excluded");
        check(!AdPolicy.shouldShow(2, 40, 100000, -1, true), "second eligible run excluded");
        check(AdPolicy.shouldShow(3, 40, 100000, -1, true), "third eligible run allowed");
        check(!AdPolicy.shouldShow(3, 5, 100000, -1, true), "short run never shows ad");
        check(!AdPolicy.shouldShow(3, 40, 100000, -1, false), "unavailable ad excluded");
        check(!AdPolicy.shouldShow(6, 40, 219999, 100000, true), "minimum interval enforced");
        check(AdPolicy.shouldShow(6, 40, 220000, 100000, true), "minimum interval inclusive");
        check(!AdPolicy.shouldShow(6, 40, 90000, 100000, true), "clock reversal fails closed");
        System.out.println("TOTAL " + passed + " passed");
    }
}
