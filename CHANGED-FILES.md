# Changed files

## Arcade typography and larger player — 0.11.1

- Added the Barlow Semi Condensed Medium and SemiBold files with their SIL license, and recorded font research in `FONT-NOTES.md`.
- Shared font helpers now cover all canvas text, alongside updated CSS roles and startup font preloading. The offline build carries the font licenses.
- Added a separate player artwork size and updated shields and firing points for an exact 2× enlargement without widening the collision core.
- Added focused real-browser checks for font loading, all aircraft dimensions, pickup/collision boundaries and weapon alignment.

## Mobile UI/UX and motion pass — 0.11.0

- Updated the game HUD, ability control, power-up timers, boss warning and health-bar presentation, joystick feedback, evolution and hit effects.
- Added notification stacking, a 3–2–1 resume countdown, game-over value count-up, upgrade before/after previews and a persistent Reduced Motion setting.
- Added focused logic and mobile-browser checks for the new controls and settings, then rebuilt the standalone release and Android APK as v0.11.0.

## Progression, abilities and hazards — 0.10.0

- Added `js/07b-flight-systems.js` for account upgrades, checkpoint rescue, six plane-family abilities and the five world hazard families.
- Added persistent coins and boss coin rewards, Hangar Upgrade Bay cards, ability control, music/vibration/graphics/handedness settings and boss attack-state labels.
- Rebuilt the standalone release and Android APK as v0.10.0.

## Android Safe Render build — 0.9.14

- Added raster runtime sheets at `assets/missiles/missile-sheet.png` and `assets/bosses/boss-sheet.png`; the editable SVGs remain in the repository.
- Added Android-only Safe Render limits for resolution, frame cadence, effects, particles, projectiles and storm lines.
- Switched the Android WebView to software composition and rebuilt the mobile APK as v0.9.14.

## Smaller reference missile sprites — 0.9.13

- Replaced `assets/missiles/missile-sheet.svg` with a thin 30-rocket sheet based on the latest supplied reference image.
- Kept the Level 1–3 / level progression / final-wave mapping and reduced normal missile draw size to 48 px.
- Rebuilt the mobile APK as v0.9.13.

## Boss variety and Android canvas stability — 0.9.12

- Added `assets/bosses/boss-sheet.svg` and rendered a unique transparent sprite for each campaign boss.
- Positioned Commander and Cosmic Overlord below the HUD, while retaining their distinct attack patterns and collision rules.
- Replaced Android's forced WebView hardware layer with normal GPU composition to prevent stale black text and sprite tiles without falling back to slow software rendering.
- Rebuilt the mobile APK as v0.9.12.

## Evolving missile sprites — 0.9.11

- Added `assets/missiles/missile-sheet.svg`: 30 transparent rocket sprites adapted from the supplied reference for the game’s canvas scale.
- Added level-to-missile mapping, Final Challenge-only final missile waves, preloading and offline-build asset embedding.
- Moved player auto-fire from Level 3 to Level 4 and rebuilt the Android APK as v0.9.11.

## Smooth flight presentation — 0.9.10

- Restored hardware canvas acceleration, added mobile particle limits and vertical cloud parallax.
- Moved active power-up timer cards into the top HUD and rebuilt the APK as v0.9.10.

## Android canvas stability — 0.9.9

- Added a stable opaque canvas frame path and Android WebView software rendering to avoid black plane and text artefacts on phones.
- Rebuilt the mobile APK as v0.9.9.

## Flight presentation and speed — 0.9.8

- Made boss warnings and new-plane cards translucent, with short display times.
- Removed the player aircraft exhaust attachment and added the 150–300 px/s level-based speed curve.
- Rebuilt the mobile APK as v0.9.8.

Compared with the original uploaded project snapshot:

- Added 30 supplied airplane sprites: `assets/planes/plane_01.png` through `assets/planes/plane_30.png`.
- Added the manual device checklist: `ANDROID-CHECKLIST.md`.
- Added `CHANGELOG.md`, `TEST-REPORT.md`, and this file.
- Updated `README.md`, `TESTING.md`, `package.json`, `index.html`, and `css/style.css`.
- Updated `dist/dodgewing.html` with the single-file build containing all 30 sprites.
- Updated `js/02-save-and-assets.js` for 30 aircraft and schema 4 migration.
- Updated `js/07-game.js` for the 30-stage hangar path, zone banners, and local score records.
- Updated `js/08b-weapons-sky-controls.js` for late-stage weapon scaling and missile variants.
- Updated `js/05-missions-achievements.js` for safe unknown mission handling and the local best-runs list.
- Updated `tests/run-tests.js`; 419 logic checks pass in the current run.
- Retained the existing source modules for game state, bosses, rendering, controls, and audio.

## Completion pass — 0.9.1

- Added `tools/build.js` and `tools/serve.js` for Node-only building and local development.
- Updated save loading, Rewards, Help text and small-screen layout safety.
- Updated browser tests for all 30 aircraft and detected Chromium installations.
- Rebuilt `dist/dodgewing.html` and expanded logic-test coverage for malformed saved data.

## Font refresh — 0.9.2

- Added Oxanium, Rajdhani and Pixelify Sans with their included SIL Open Font Licenses.
- Updated the title, interface, scores and canvas text to use the new font system.
- Rebuilt and browser-tested the source and offline release after the font change.

## Professional arcade pass — 0.9.3

- Added `js/10-professional-pass.js` for themed worlds, tutorial prompts, visual effects, sound feedback, unlock cards, boss introductions and final victory.
- Updated the home screen, settings, local scores, achievement badges and responsive panel styling in `index.html` and `css/style.css`.
- Updated save defaults, zones, tests, documentation and the self-contained release build.

## Startup sequence — 0.9.4

- Added the branded splash screen and loading screen markup and styling in `index.html` and `css/style.css`.
- Added `js/11-intro-sequence.js` to preload game aircraft and fonts before showing the home screen.
- Rebuilt the self-contained mobile release and expanded browser coverage for the startup flow.

## App icon — 0.9.5

- Added the editable Dodgewing aircraft icon SVG and browser, iPhone and Android/PWA PNG exports in `assets/icons/`.
- Added `manifest.webmanifest`, browser and mobile home-screen icon metadata, and embedded icon references in the offline build.

## Final startup splash — 0.9.6

- Added the active no-text Sunset Run splash SVG in `assets/splash/`.
- Updated startup markup, styles, loading setup, browser tests and the self-contained build to use the centered orange panel on black.
- Added the Android native wrapper, Gradle wrapper, Android build preparation script and manual APK build notes.

## Mobile layout fix — 0.9.7

- Removed the empty ad strip, expanded the canvas to the full viewport and improved aircraft image smoothing.
- Prevented the unlock card and level banner from displaying together, wrapped the touch tutorial above the steering circle, and updated Android package versioning and mobile browser coverage.

The original snapshot backup is `backup/dodgewing-original.zip`; a separate pre-integration rollback is `backup/dodgewing-v0.8-before-30-planes.zip`.
