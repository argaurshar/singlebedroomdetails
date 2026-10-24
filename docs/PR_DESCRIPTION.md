# Room Anatomy: complete interactive bedroom explainer

Build a standalone SVG bedroom app from the checked-in handoff. Seven ordered actions reveal
room layers, a telescoping drawer, connected lighting, the ceiling service route and schematic
recirculating air, then reassemble the room. A pure model drives both geometry and measurements;
clearance exploration retains negative interference instead of silently moving furniture.

Includes Manual/Auto, reset, finish palettes, native keyboard controls, reduced motion, responsive
layout and deterministic `window.seek(t)` / `?render`. Source modules bundle into one offline-capable
HTML file and a downloadable ZIP with no required external assets. Local pinned Anatomy/REA skills and reusable setup
instructions are retained; REA's optional runtime is not required or installed.

Validation: 10 Node tests; 14 browser acceptance groups; 42 desktop/mobile stage captures;
361 deterministic motion samples with zero ordering cycles/nonfinite geometry. See `docs/QA.md`
and retained evidence. Actual rendered screenshots were visually reviewed and the initial depth
ordering defect was corrected. Stage-boundary text changes are documented as intended scan flags.

Limitations: direct file-URL opening is blocked by managed Chromium; HTTP operation without external
assets passes. Live-reference and GitHub API requests are proxy-blocked. No tablet hardware benchmark,
video/audio export or public deployment is claimed. GitHub Pages configuration builds/tests on PRs and deploys only from `main`.
Enable Settings → Pages → GitHub Actions before merging. Do not merge automatically.
