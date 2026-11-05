# Changelog

## 0.12.0 — 2026-11-05

- Replace the old button stack with a Living Command Hangar built around a large interactive aircraft, dynamic world lighting, runway depth and lightweight parallax.
- Add swipeable unlocked-plane previews, tap inspection for engine/weapon/ability details, Level 4+ engine glow and a new-aircraft spotlight return animation.
- Add a smart Continue Flight action, affordable checkpoint return, pilot callsign/rank, last-flight card, daily briefing and animated reward crate.
- Add a six-world progress strip, next-boss radar and a complete 30-level Flight Map with unlocked-plane and boss markers.
- Add a one-thumb five-item navigation dock, contextual icon/button motion, adaptive home ambience and Reduced Motion coverage.
- Hide leftover gameplay objects whenever the Command Hangar is visible and retain the low-cost Android Safe Render composition.

## 0.11.1 — 2026-11-05

- Replace pixel-style gameplay text with Barlow Semi Condensed; use Oxanium for titles and scores, with local font preloading and bundled SIL licenses.
- Reserve HUD space for pause and ability buttons, constrain long values to their panels and make labels readable with the new fonts.
- Double every player aircraft's rendered width and height; align shield effects and weapon origins to the larger artwork while retaining the existing collision core and missile size.
- Document online font sources and the network restriction that prevented verification of reference games' exact in-game fonts.

## 0.11.0 — 2026-11-05

- Rework the in-flight interface with clearer HUD groups, animated star and coin feedback, compact power-up timers, an icon-and-ring ability control, responsive joystick feedback and a three-second resume countdown.
- Make messages use a fixed non-overlapping stack; add evolution bursts, damage and shield feedback, count-up game-over results, improved upgrade previews and smooth screen entries.
- Improve boss attack readability with a danger label, Seeker warning rings and a smoothly drained health bar with a delayed damage strip.
- Add a persistent Reduced Motion setting that suppresses nonessential pulsing, shake, sparkles and moving atmospheric effects while retaining gameplay feedback.

## 0.10.0 — 2026-11-05

- Add persistent ◈ coins from stars, defeated missiles and bosses, plus four Hangar upgrades for engine speed, shield duration, magnet range and weapon damage.
- Add checkpoint rescue at every five-level milestone, six aircraft-family abilities, five world hazard types and coin rewards for bosses.
- Extend Settings with adaptive music, graphics mode, vibration and left-handed steering, while retaining Android Safe Render limits.

## 0.9.14 — 2026-11-05

- Add Android Safe Render mode to stop black/stale tiles affecting canvas text, aircraft and missiles on unstable phone GPU drivers.
- Render gameplay missile and boss sheets from pre-rasterized transparent PNGs instead of the runtime SVG texture path.
- Use a 1× Android canvas, bounded 40 FPS update cadence, lower particle/projectile limits and low-cost effects so the software compositor remains responsive.

## 0.9.13 — 2026-11-05

- Replace the missile sheet with 30 thin rocket designs based on the latest supplied reference.
- Keep the Level 1–3 opening missile, normal level-by-level progression and Final Challenge-only last three designs.
- Reduce normal missile draw size from 62 px to 48 px so they remain clearly smaller than the player aircraft.

## 0.9.12 — 2026-11-05

- Add four distinct, lightweight boss sprites: Heavy Missile, Missile Commander, Advanced Seeker and Cosmic Overlord, with their existing charge, laser/volley, tracking and final-wave attack patterns.
- Fix Android canvas artefacts by removing the forced hardware texture layer while retaining normal GPU composition and mobile-safe canvas settings.
- Keep mobile rendering smooth with a 1.5× pixel cap, low-cost Android image smoothing and existing projectile/particle caps.

## 0.9.11 — 2026-11-04

- Add a transparent game-ready missile sprite sheet based on the supplied rocket artwork, embedded in the offline browser and Android builds.
- Keep the opening missile for Levels 1–3, then evolve normal missile visuals with the campaign; reserve the three final futuristic missiles for Final Challenge waves.
- Delay player auto-fire until Level 4, starting with the nose gun.

## 0.9.10 — 2026-11-04

- Restore the Android hardware canvas layer for smooth gameplay while retaining the opaque canvas fix for black artefacts.
- Add slow vertical cloud drift alongside horizontal movement and move active power-up timers from the joystick area into a transparent top-HUD bar.

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
