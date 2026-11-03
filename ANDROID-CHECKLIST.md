# Manual Android testing checklist

No physical Android device was tested during this update.

- [ ] Record phone model, Android version, Chrome version and refresh rate.
- [ ] Use the same origin as the old game; confirm points, paints, trails and original aircraft unlocks survive upgrade/reload.
- [ ] Open Rewards with an old flare mission save; valid missions render and complete once.
- [ ] Play portrait and landscape; confirm Play, Back, pause, Retry and Menu are reachable above the ad strip.
- [ ] Drag/release the joystick; test pointer cancellation and switching apps; touching outside it must not steer.
- [ ] Collect stars: one at a time, five per evolution; check transitions through all 30 stages and two-level regression.
- [ ] Fight each boss at 9/17/25/30; stars must pause and return one at a time after defeat.
- [ ] Check automatic weapons from stage 3 onward, later homing missiles, shield, magnet and slow power-ups.
- [ ] Check audio enable/mute, background/resume, game over, retry and browser restart.
- [ ] Play at least ten minutes on a low-end phone; record visible stutter, heat, memory growth and battery use.
- [ ] Profile real frame time and memory at levels 1/15/30 and during each boss with Chrome remote debugging.
- [ ] Assess whether early stages take too long without guns; assess final missile pressure and boss difficulty without test invulnerability.
- [ ] Check long aircraft/weapon labels and many simultaneous reward notifications on small screens.
- [ ] Confirm licenses and privacy/ad integration separately before a commercial release.
