# Add a detailed rotating bedside cabinet study

Replaces the lead room presentation with one continuous furniture object: turn the cabinet,
open and inspect its telescopic drawer, separate its construction, and reassemble the same parts.
The previous bedroom remains available separately. Adds seven synchronized chapters, keyboard
and reduced-motion controls, finish choices, physical readouts, standalone packaging and source.

Validation: 21 Node tests, 10 cabinet browser groups, 14 bedroom regression groups, 361 motion
samples, deterministic PNG seeking/reset, desktop/mobile screenshots and real playback measurements.
See `docs/CABINET_QA.md` and its retained evidence.

Limitations: the exhaustive audit retains 32 rail-edge ordering warnings despite zero collision,
depth and continuity findings. Normal desktop/mobile-width playback measured about 60 fps median;
the 4× CPU profile measured about 15 fps. Direct file opening and public deployment remain unverified.
No video/audio export. GitHub Pages publishes the new `dist/index.html` after an approved main merge.
