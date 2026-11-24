# Dodgewing v2.2

Dodgewing is an offline HTML5 canvas flight game from GZS Studio. Fly 30 campaign levels, collect stars to upgrade individual aircraft in the Forge, and defeat each assigned boss to open the next level. An unarmed aircraft can win by evading the boss until its timer expires.

## Play

Open `index.html`, or run `npm start` and visit `http://localhost:5500`. Select a level from the Campaign Map. Steer with the touch joystick, touch steering, or the arrow keys. Use the pause button or P/Esc to pause.

The final star now saves a boss checkpoint and refills the equipped tank while you keep flying. Your position, steering, active powers and flight clock carry into the fight. Watch the attack warning and evasion timer. Weapons still deal damage and can end the encounter early. After a clear, the result screen identifies the aircraft, victory method and first-clear reward. Next Level opens its briefing. Clearing level 30 returns you to the map through the primary action.

## Build and test

Run these commands from the repository root with Node.js and npm installed.

```sh
npm test
npm run prepare:android
```

`npm test` builds the standalone `dist/dodgewing.html`, runs the campaign rules suite, and checks native ad integration. `prepare:android` stages the offline WebView payload. To build a local debug APK, follow the [Android build instructions](android/README.md).

For the focused v2.2 browser regression, make the Node.js `playwright` package available, create a `test-results` directory, and run the following after Android staging. Set `CHROME_BINARY` to your Chromium executable. `DW_PLAYWRIGHT_MODULE` can point to a Playwright installation outside this checkout.

```sh
node tests/v22-flight.js
```

## Project layout

| Path | Contents |
| --- | --- |
| `index.html`, `js/`, `css/` | Browser entry point, gameplay, persistence, input, rendering and UI |
| `assets/` | Aircraft, bosses, missiles, home art, launcher and splash artwork, fonts and licenses |
| `android/` | Native WebView host, ad integration, Android resources and Gradle wrapper |
| `tools/`, `tests/` | Build scripts, focused regressions and historical test fixtures |
| `docs/qa/v2.2/` | Verified payload hashes, screenshots and browser frame measurements |

The campaign release is v2.2. Android retains version name `0.14.0`, code 23, and the debug application ID `com.gzsstudio.dodgewing.debug`. For handset coverage and performance limits, see the [v2.2 QA report](V22-PROGRESS.md). Earlier development notes remain in the repository for historical reference. Font sources and attribution are documented in [FONT-NOTES.md](FONT-NOTES.md).
