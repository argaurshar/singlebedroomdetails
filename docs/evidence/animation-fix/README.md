# Animation follow-up evidence

See ../../ANIMATION_FIX_QA.md for scope, methodology, results and limitations.

- `build-hashes.json`: standalone build tested by the browser scripts and reproduced after `npm ci`.
- `camera-browser-results.json`: deterministic seeks, actual playback measurements and capture names.
- `desktop-camera-review.png`, `mobile-camera-review.png`: unmodified browser screenshot pixels tiled
  for review, covering every preset immediately before/at/after 15 and 17.5 seconds.
- `desktop-coffee-15.00-full.png`, `mobile-lamp-17.50-full.png`: representative complete-page captures.
- `browser-results.json`: main application acceptance checks and capture inventory.
- `video-results.json`: fresh exported video inspection using FFprobe/FFmpeg.
- `lamp-sampling-study.json`: unchanged-threshold convergence study and completed lamp continuity audit.

Both contact sheets and all twelve full-page captures were opened and visually inspected.
Individual local captures and the fresh video remain in `.test-artifacts/`; the test scripts
regenerate them. The committed images are representative evidence, not a substitute for the app.


Extended ordering/collision/depth reports and their summary cover all seven presets.
`audit-cache-*` records exact cached/uncached comparisons and the measured CPU benefit.
`performance.json` records the idle browser sample and offscreen/render-mode checks.


The seven `audit-*-full.json` files and `full-audit-summary.json` are the final authoritative
reports: no quick mode, no skipped categories, zero findings. Earlier scoped reports and
coarse-sampling investigations are retained for provenance, not counted as substitute full runs.
`unit-results.json` records all 68 passing Node tests. The cached/uncached lamp control reports
are archived so the exact-equivalence comparison can be independently repeated.
