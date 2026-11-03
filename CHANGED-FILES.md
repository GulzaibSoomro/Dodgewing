# Changed files

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
- Updated `tests/run-tests.js`; 417 logic checks pass in the current run.
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

The original snapshot backup is `backup/dodgewing-original.zip`; a separate pre-integration rollback is `backup/dodgewing-v0.8-before-30-planes.zip`.
