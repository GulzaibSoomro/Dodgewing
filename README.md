# Dodgewing 0.9.6

Existing HTML5 canvas game expanded to a single 30-stage campaign. No framework or runtime dependencies. The purple/glass interface, 30 supplied aircraft sprites, four paints, weapons, bosses, joystick, missions, achievements and saved purchases remain.

## Play

Open `index.html`, or run `npm start` and visit `http://localhost:5500`. `dist/dodgewing.html` is a self-contained offline build with embedded sprites and font.

At launch, a black splash screen with a centered orange Sunset Run aircraft panel leads into an asset-loading screen, then the home screen appears. Use **Play** to start a run, **Hangar** to view planes, **Rewards** to view missions and medal badges, **High scores** to view local records, and **Settings** to control sound and visual effects. On touch screens use the bottom steering circle; elsewhere on the screen does not steer. On a keyboard use left/right arrows or A/D. P/Esc pauses or resumes.

## Campaign

- 30 evolution stages use 30 distinct transparent aircraft sprites supplied for this update. Sprite art is preserved as provided; each stage has a unique plane.
- Start at Level 1; each five collected stars advances one stage. Level 30 takes 145 stars without damage (29 level-ups).
- Exactly one collectible star appears at a time. Collect it to reveal the next. During a boss, stars pause; one returns when the encounter ends. HUD pips show progress toward the next five-star milestone.
- Difficulty grows across the 30 levels: regular missile speed rises from 55% to 93% of plane speed, spawn interval decreases from 2.8 to 0.55 seconds, turning grows, and the desktop missile cap rises from 2 to 16 (phone cap 2 to 8). Plane speed remains 250 px/s.
- A hit loses two levels / ten evolution stars, with 1.5 seconds of protection. A hit at Level 1 ends the run. Collected run stars and earned points are not removed. Weapons follow the current stage, including after damage.
- Stages 1–2 have no guns. Auto-fire begins at stage 3 and evolves through twin/wing guns, jet cannons, homing missiles and plasma. Stages 13–30 extend the plasma-storm set with a bounded rate/damage increase.
- The campaign has six five-level sky worlds: Sunrise Skies, Storm Front, Sunset Run, Midnight Flight, Deep Space and Cosmic Finale. Each changes the sky treatment while retaining the shared purple-and-gold arcade style.
- Boss encounters: Heavy at 9, Commander at 17, Advanced at 25, Final Challenge at 30. Each opens with a warning card, warning sound and large health bar. Survive the timer or damage the applicable boss to accelerate defeat.
- Each evolution displays a plane-unlocked card with the new aircraft and weapon. Level 1 also gives short “move,” “collect stars” and “avoid missiles” prompts. Finishing the Level 30 boss opens a final victory screen with the run score, best plane and a Play again button.
- S = shield; M = magnet; L = slow missiles. Near misses give combo bonuses.
- Points = `(whole seconds + stars × 5 + bonus) × 2`. Paint prices remain 0 / 400 / 1200 / 3000. Three daily missions, ten achievements and unlocked trail rewards remain.

## Saves and compatibility

Browser LocalStorage key: `dw`. Points, paint ownership/selection, achievements, trails, mission history and legacy Easy/Normal/Fast best scores are preserved. New campaign scores use `best.play`; old scores are not mixed into a different campaign leaderboard. Legacy `mode` is retained as history and has no gameplay effect.

Save schema 4 maps old aircraft unlocks to the matching stage in the expanded evolution path (old Level 12 → Level 30). `legacyBestLv` retains the old milestone. Migration runs once. Unknown or retired mission IDs are ignored when rendering rewards and processing events, without deleting their saved history. A legacy day can therefore show fewer than three valid missions until the next daily rollover.

Progress requires the same browser and origin. Opening the file under a new origin does not transfer another origin's LocalStorage. An unavailable LocalStorage leaves the game playable but unable to persist changes. Missing or malformed saved values fall back to safe defaults; retired missions remain stored, while unknown trail IDs are ignored.

## Source map

| File | Role |
|---|---|
| `index.html`, `css/style.css` | Menus, overlays, responsive layout and styles |
| `js/01-core.js` | Canvas sizing and helpers |
| `js/02-save-and-assets.js` | Save migration, 30 aircraft assets and stages |
| `js/03-difficulty-and-state.js` | Single-campaign difficulty curve and evolution state |
| `js/04-audio.js` | Generated audio |
| `js/05-missions-achievements.js` | Missions, achievements, rewards and results |
| `js/06-bosses.js` | Bosses and near-miss effects |
| `js/07-game.js` | Navigation, collection, evolution, collision, update and draw |
| `js/08-render-helpers.js` | HUD and canvas rendering |
| `js/08b-weapons-sky-controls.js` | Weapons, morning-to-night sky and joystick |
| `js/09-input-and-loop.js` | Input, pause and animation timing |
| `js/10-professional-pass.js` | World themes, tutorial, boss introductions, unlock and victory cards, polished effects and settings |
| `js/11-intro-sequence.js` | Splash screen, real asset preloading and loading progress |
| `assets/icons/`, `manifest.webmanifest` | Source SVG, platform app icons and installable-web-app metadata |
| `tools/build.js`, `tools/serve.js` | Build the self-contained game and run the local source server without Python |
| `tools/build.py` | Original Python build script, retained for compatible environments |
| `tests/run-tests.js` | Deterministic mocked-DOM logic tests |
| `tests/browser_smoke.py` | Real Chromium interaction and old-save checks |
| `tests/browser_campaign.py` | Full progression and five viewport sizes |

Classic scripts share a global scope. `tests/expected_from_spreadsheet.json` is retained as a historical 12-level/mode fixture; it is not the current campaign specification.

## Build and test

```sh
npm test
pip install playwright
python3 -m playwright install chromium
npm start
# In another terminal:
python3 tests/browser_smoke.py http://127.0.0.1:5500/
python3 tests/browser_campaign.py http://127.0.0.1:5500/
```

See `TESTING.md` and `TEST-REPORT.md` for executed results and limitations, and `ANDROID-CHECKLIST.md` for device testing. The browser scripts use `DW_BROWSER_EXECUTABLE` when supplied, then try a system Chromium or Chrome before using Playwright's downloaded browser. They also accept `DW_BROWSER_JITLESS=1`; that disables the JavaScript optimizer and is unsuitable for representative performance measurements.

## Assets and release work

The game now uses Oxanium, Rajdhani and Pixelify Sans, each included with its SIL Open Font License in `assets/fonts`. The original Pixelta files are retained but are no longer loaded by the game or bundled release. The new Dodgewing icon is supplied as editable SVG and PNGs for browser, iPhone and Android/PWA use. Aircraft licensing remains unconfirmed. No commercial licensing, ad SDK, app-store packaging or release work was done. The bottom strip remains an empty ad placeholder.
