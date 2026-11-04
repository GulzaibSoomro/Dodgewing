# Testing — 0.9.5

## Results executed for this completion pass

| Check | Result |
|---|---|
| Deterministic Node logic suite | Passed: 418 checks, 0 failures |
| Source browser tests at 360×640, 390×800, 412×915, 800×390 and 1280×800 | Passed: 96 checks, 0 failures |
| Self-contained `dist/dodgewing.html` browser smoke test | Passed: 36 checks, 0 failures |
| JavaScript syntax checks | Passed |
| Physical Android device | Not tested |

`npm test` rebuilt the standalone game with `node tools/build.js` and ran the logic suite. It covers save migration and malformed saves, all 30 aircraft/stages, progressive stars, campaign difficulty, weapons, missile hit points and variants, bosses, achievements, final victory, LocalStorage behavior and representative mocked rendering.

The browser suites ran against `http://127.0.0.1:5500/` using the local server. They exercised the splash-to-loading sequence, app-icon metadata, full home screen, settings, medals, touch controls, pause/resume, save compatibility, all 30 campaign stages, boss intros, final victory, level regression, game-over/retry and five viewport sizes. The standalone build was also checked in Chromium: it contains all aircraft assets, app-icon data, the three new font families, and no external source-script or aircraft references.

## Running the checks

```sh
npm test
pip install playwright
python3 -m playwright install chromium
npm start
# In another terminal:
python3 tests/browser_smoke.py http://127.0.0.1:5500/
python3 tests/browser_campaign.py http://127.0.0.1:5500/
```

No result here represents testing on a physical phone. Use [ANDROID-CHECKLIST.md](ANDROID-CHECKLIST.md) for manual Android checks.
