# Changelog

## 0.9.9 — 2026-11-04

- Stabilize Android canvas rendering by using an opaque medium-quality canvas, resetting frame state and using the WebView software layer to prevent black sprite and text artefacts.

## 0.9.8 — 2026-11-04

- Make boss warnings and new-plane cards translucent and reduce their display time.
- Remove the player aircraft exhaust attachment and scale plane speed from 150 px/s at Level 1 to 300 px/s at Level 30.

## 0.9.7 — 2026-11-04

- Remove the unused black ad bar so gameplay and menus use the complete phone screen.
- Smooth aircraft rendering for mobile WebView, prevent the new-plane card from colliding with the level banner, and wrap the touch tutorial above the steering circle.

## 0.9.6 — 2026-11-04

- Replace the text-based launch splash with a black no-text layout featuring a centered, rounded orange Sunset Run aircraft panel.
- Embed the splash artwork in the self-contained mobile build.
- Add an Android WebView wrapper, Gradle build files and a direct-install debug APK build path.

## 0.9.5 — 2026-11-04

- Add the Dodgewing aircraft app icon in standard browser, iPhone and Android/PWA sizes, with an editable SVG source and web manifest.
- Embed browser icon data in the self-contained release file.

## 0.9.4 — 2026-11-04

- Add a branded Dodgewing splash screen followed by a real asset-loading screen with plane and font progress before the home screen.
- Rebuild and test the single-file mobile browser release with the startup sequence.

## 0.9.3 — 2026-11-03

- Add six themed five-level sky worlds, a first-level tutorial, engine flames, smoke, explosion, screen-shake and star-sparkle effects.
- Add boss warning introductions, named large health bars, unlock cards and a Level 30 final-victory screen.
- Complete the home screen with local high scores and settings, render achievements as medal badges, and add feedback sounds for collection, upgrades, boss warnings, damage and victory.

## 0.9.2 — 2026-11-04

- Replace the game font system with Oxanium titles, Rajdhani interface text and Pixelify Sans score/canvas text.
- Include the three fonts and their SIL Open Font Licenses in the project and offline build.

## 0.9.1 — 2026-11-04

- Add Node-only build and local-server commands for Windows and dependency-light development environments.
- Normalize malformed saved-game values so menu, Hangar and Rewards remain usable.
- Ignore unknown saved trail IDs in Rewards.
- Correct the Help screen: auto-fire starts at Level 3.
- Prevent narrow-screen menu labels and long Hangar labels from overflowing.
- Make browser tests use an explicitly supplied or detected Chromium executable.

## 0.9.0 — 2026-11-03

- Integrate the 30 supplied transparent aircraft images as 30 distinct evolution stages; keep the supplied pixels unchanged.
- Extend the named 30-stage progression across six five-stage sky zones.
- Add stage-scaled weapon variants after stage 12 and distinct late-game missile behaviors.
- Show five best local campaign runs on the Rewards screen.
- Improve hangar evolution previews with larger aircraft art and clearer glass panels.
- Update save migration to schema 4 while retaining old scores, aircraft unlocks, cosmetics, and retired mission history.
- Refresh game instructions and tests for the current one-star-at-a-time, single-Play campaign.

## 0.8.0

- Replace Easy/Normal/Fast selection with one Play campaign and 30 evolution stages.
- Add sequential star progression, level-scaled difficulty, sky progression, and bosses at levels 9/17/25/30.
- Keep the existing purple, golden-orange, cartoon and glass visual identity.
