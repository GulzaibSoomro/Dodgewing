# Dodgewing 0.12.1 completion report

## Delivered

- A 30-stage HTML5 canvas aircraft game with supplied aircraft sprites, weapons, bosses, missions, achievements and local saves.
- Node-only build and local-server commands: `npm test` and `npm start` work without Python.
- Safer save loading: invalid values no longer break the menu, Hangar or Rewards screens.
- A 30-cell transparent missile sprite sheet that evolves across the campaign, with three final futuristic missiles reserved for Final Challenge waves.
- Player auto-fire begins at Level 4; the opening three aircraft are dodge-only stages.
- Four distinct, transparent boss sprites with charge, laser/volley, tracking and final-wave encounters.
- An Android Safe Render WebView configuration to prevent black canvas/text/sprite artefacts with capped rendering work.
- A replacement 30-cell thin missile sheet, rendered below player-plane scale while retaining the established progression and final-wave mapping.
- A rebuilt self-contained `dist/dodgewing.html` with all 30 aircraft sprites and the current font set embedded.
- Six five-level sky worlds, smoke/explosion/star effects, short translucent boss warnings and large boss health bars.
- A full home screen, tutorial prompts, plane-unlock cards, medal-style achievements, sound feedback, settings and a final Level 30 victory screen.
- A black, no-text splash screen with a centered rounded Sunset Run aircraft panel, followed by an asset-aware loading screen.
- A Dodgewing aircraft app icon in browser, iPhone and Android/PWA sizes, plus web-app metadata.
- An Android 15 debug APK wrapper that bundles the offline game and launcher icon for direct phone installation.
- Persistent coins, four Hangar upgrades, checkpoint rescue, six plane abilities, five world hazards, boss rewards and expanded accessibility/performance settings.
- A mobile UI/UX pass with grouped HUD information, power-up icon timers, ability cooldown ring, smoother joystick feedback, fixed notification stacking, evolution and hit feedback, a resume countdown and count-up run results.
- A persistent Reduced Motion option, boss danger labels and delayed boss-health damage strip that preserve Android Safe Render limits.
- Oxanium titles/scores and Barlow Semi Condensed UI, bundled offline and preloaded before gameplay; HUD spacing reserves room for action buttons.
- All 30 player planes draw at 1.6× their original dimensions, 20% smaller than v0.12.0, with aligned shield effects and weapon muzzles.
- A Living Command Hangar with a large inspectable/swipeable aircraft, dynamic world scene, smart flight action, briefing, reward crate, pilot identity, boss radar, campaign route and one-thumb dock.
- A complete 30-level Flight Map, checkpoint return, last-flight card, adaptive home ambience, unlock spotlight and Reduced Motion support for the new effects.

## Verification

`npm test` passed 437 logic checks. The Chromium source suites passed 116 checks over five viewport sizes, and the 88-check Command Hangar suite passed against both source and standalone releases over four portrait, landscape and desktop sizes. The self-contained release passed 56 Android-profile browser smoke checks, including the Safe Render 1× canvas path. Another 31 standalone checks verified loaded fonts, font-failure recovery, all 30 aircraft at the 1.6× artwork scale, muzzle placement and preserved collision/collection boundaries at mobile and desktop sizes. The release file embeds aircraft, raster missile and boss sheets, splash art and app-icon data, both font families and SIL licenses, and no external source-script or aircraft references.

The Android debug APK v0.12.1 (version code 14) compiled successfully with application ID `com.gulzaibsoomro.dodgewing`, Android 15 target SDK and the offline HTML asset. Its embedded HTML matches `dist/dodgewing.html` byte for byte, and its v1 and v2 debug signatures were verified. A physical Android device has not been tested.

## Remaining manual work

- Test joystick feel, audio, campaign balance, frame time and memory on a physical Android phone.
- Confirm commercial rights for supplied aircraft images before any monetized or store release. The active fonts use bundled SIL licenses; legacy Pixelta is not loaded.
