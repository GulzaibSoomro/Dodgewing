# Dodgewing font selection — 2026-11-05

The requested category references were Sky Force Reloaded (Infinite Dreams), Phoenix 2 (Firi Games) and AirAttack (Art In Games). Their official websites could not be inspected in this environment: HTTPS requests were denied by the network proxy. No claim is made that their exact in-game typefaces were identified, or that their screenshots were inspected during this update.

The implemented alternative is a modern arcade treatment using documented open-source families, replacing the previous pixel-style HUD:

| Role | Family | Weight |
| --- | --- | --- |
| Titles and section headings | Oxanium | 600–800 |
| Buttons, instructions and canvas labels | Barlow Semi Condensed | 500–600 |
| Scores, level numbers and countdown digits | Oxanium | 600–700 |

Sources retrieved online on 2026-11-05:

- [Oxanium's official Google Fonts description](https://github.com/google/fonts/blob/main/ofl/oxanium/DESCRIPTION.en_us.html) explicitly describes a square futuristic family for spaceship HUDs and video-game scoreboards, designed for quick glances and small sizes.
- [Barlow Semi Condensed's official description](https://github.com/google/fonts/blob/main/ofl/barlowsemicondensed/DESCRIPTION.en_us.html) documents its low-contrast, slightly rounded letterforms and compact family. Its use for readable mobile labels is our design choice, not an attribution to the reference games.
- [Barlow Semi Condensed font files and SIL license](https://github.com/google/fonts/tree/main/ofl/barlowsemicondensed).

Both families are bundled locally. Medium and SemiBold Barlow TTFs are unmodified upstream files. Source licenses are in `assets/fonts`; the standalone build also includes both SIL licenses. Startup explicitly loads the weights needed by menus and canvas labels before dismissing the loading screen. Legacy Rajdhani, Pixelify Sans and Pixelta files remain archived but are not loaded or embedded in this release.

The top HUD reserves space for the action buttons and constrains long numbers to their own panels. The plane size request is independent: player sprites render at twice their previous width and height, with matching shield and muzzle placement; the existing collision core is retained.
