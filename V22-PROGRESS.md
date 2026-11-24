# Dodgewing v2.2 verification

This report summarizes the verified v2.2 development build. Evidence files use paths relative to the published source tree.

| Area | Verified result |
| --- | --- |
| Campaign | 979 standalone assertions passed. The browser campaign exercised 30 assigned aircraft, 750 pickups, both boss win methods, checkpoint recovery and the one-time final reward. |
| Final star | A held steering input survived the transition on the last fuel tick. Both save mirrors contained the boss checkpoint. Reload resumed the fight with the correct star credit. |
| Boss HUD | Full-health and half-health encounters produced identical overlay pixels. Weapon damage, boss phases, telegraphs and the survival timer remained active. [HUD capture](docs/qa/v2.2/v22-boss-hud.png) |
| Victory UI | The result card showed combat or survival, flight time, wallet and first-clear reward. Next Level and the final Campaign Map action worked in portrait and landscape. Reduced motion and final replay checks passed. [Level-clear capture](docs/qa/v2.2/level-complete.png) |
| Lifecycle and input | Six pause and input stability checks, 29 browser release checks, and 56 Android browser recovery checks passed. The ad suites passed 22 browser, eight native integration, nine banner and 11 Java policy checks. |
| Android packaging | Gradle assembled the debug APK. APK Signature Scheme v2 and zip alignment checks passed. All 103 WebView entries matched both staging and source by SHA-256. [Payload inventory](docs/qa/v2.2/debug-webview.json) |
| Artwork | Eleven launcher, web icon and splash inputs matched the verified baseline. The compiled launcher icon also matched v2.1. |

## Performance and device coverage

A 6.5-second final-boss sample ran in desktop Chrome at 390 × 844 against the offline payload extracted from the verified APK. Across 290 frames, the median interval was 16.6 ms and p95 was 34.0 ms. Eleven intervals exceeded 50 ms. The p95 JavaScript draw duration was 1.5 ms. The peak was nine missiles and 91 particles, with zero runtime diagnostics. [Frame measurements](docs/qa/v2.2/v22-browser-performance.json)

No handset or Android virtual device was available for that verification. Installation, native process recreation, touch feel and sustained handset frame pacing remain unverified.

## Artifact provenance

The verified local v2.2 debug APK was 19,618,497 bytes with SHA-256 `831a00d75b48a381f71a8bad3296bd563e121cede8b4814519a17e8178a8c966`. The protected submitted Code 23 AAB has recorded SHA-256 `20573c5da7fa93976bdfdb2ec7fa5cc205bdc1335e594827ca646f5686490d6a`. Both identifiers refer to the previous local verification. This branch distributes the source.
