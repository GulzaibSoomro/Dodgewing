# Testing — 0.11.1

## Results executed for this completion pass

| Check | Result |
|---|---|
| Deterministic Node logic suite | Passed: 437 checks, 0 failures |
| Source browser tests at 360×640, 390×800, 412×915, 800×390 and 1280×800 | Passed: 116 checks, 0 failures |
| Self-contained `dist/dodgewing.html` browser smoke test | Passed: 56 checks, 0 failures |
| Standalone typography and 2× player rendering at 390×800 and 1280×800 | Passed: 31 checks, 0 failures |
| Android debug APK | Passed: compiled for Android 15; package metadata, embedded offline game and v1/v2 signatures verified |
| JavaScript syntax checks | Passed |
| Physical Android device | Not tested |

`npm test` rebuilt the standalone game with `node tools/build.js` and ran the logic suite. It covers save migration and malformed saves, all 30 aircraft/stages, progressive stars, campaign difficulty, coins, upgrades, checkpoints, signature abilities, world hazards, the Level 1–3 opening missile and later missile evolution, Final Challenge missile skins, Level 4 weapon start, four boss identities and attacks, missile hit points and variants, achievements, final victory, LocalStorage behavior, the 3–2–1 resume transition, upgrade previews, Reduced Motion persistence, collection HUD feedback and representative mocked rendering.

The browser suites ran against `http://127.0.0.1:5500/` using the local server. They exercised the no-text, centered black-and-orange splash-to-loading sequence, app-icon metadata, full-screen mobile layout, coin upgrades and rank previews, plane ability icons and cooldown ring, compact power-up timers, touch controls, the 3–2–1 resume transition, Reduced Motion persistence, game-over count-up, save compatibility, all 30 campaign stages, boss intros, final victory, level regression, game-over/retry and five viewport sizes. The standalone build was also checked in Chromium: it contains all aircraft assets, missile and boss sheets, splash art, app-icon data, Oxanium and Barlow Semi Condensed fonts with their SIL licenses, and no external source-script or aircraft references.

The focused typography/scale suite ran against the standalone HTML. It verifies actual loaded font faces and text measurements, intended menu font families, all 30 sprites at normal and evolution-animation scales, original collision and collection boundaries, rotated muzzle placement, Level 4 firing onset, unchanged missile size and successful startup when font requests fail. A mobile gameplay screenshot was inspected for HUD spacing and plane size. These checks do not measure frame times on Android hardware.

## Running the checks

```sh
npm test
pip install playwright
python3 -m playwright install chromium
npm start
# In another terminal:
python3 tests/browser_smoke.py http://127.0.0.1:5500/
python3 tests/browser_campaign.py http://127.0.0.1:5500/
python3 tests/browser_typography_scale.py http://127.0.0.1:5500/dist/dodgewing.html
```

No result here represents testing on a physical phone. Use [ANDROID-CHECKLIST.md](ANDROID-CHECKLIST.md) for manual Android checks.
