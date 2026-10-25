# Environment setup results

Verified 24 October 2026. No app was created during the preparation step. The user subsequently
authorized implementation on `feat/room-anatomy`; follow the implementation checklist for app status.

| Capability | Observed result |
|---|---|
| Node / npm | 24.19.0 / 11.9.0; sufficient for Anatomy (Node ≥20.10) and dependency-free ESM build |
| Python | 3.12.14 |
| Chromium | 154.0.8037.57, `/usr/bin/chromium` |
| Python Playwright | 1.62.0; launches system Chromium, renders SVG, checks keyboard changes and captures screenshots |
| Pillow / NumPy / PyYAML | 12.3.0 / 2.3.5 / 6.0.3 |
| ffmpeg / ffprobe | 7.1.5; verified H.264/yuv420p 320×240 smoke clip, 60 frames, 1.000 s, faststart requested |
| Anatomy | Pinned skill installed; upstream dial-indicator light example builds and captures with clean JS console |
| REA | Pinned skill installed; runtime/engines not installed or required; see SKILLS.md |

Run `python3 scripts/check-environment.py` from the repository root. It validates skill hashes,
builds an upstream example in a temporary directory, serves it internally over local HTTP,
checks End/Home keyboard changes (10/18), reduced-motion emulation, mobile screenshot capture,
and the optional encoder. Temporary servers and browsers are closed. Desktop and 390 px mobile
example screenshots were also opened and visually inspected during setup.

Direct `file://` browser navigation returns `ERR_BLOCKED_BY_ADMINISTRATOR`. Use local HTTP for
browser checks; do not change policy. Direct offline file-opening acceptance needs another permitted
browser. An HTTP test without external requests can separately establish self-contained operation.
Live reference access returned proxy HTTP 403; the complete checked-in handoff supplies the recorded
reference behaviour. No new live-reference inspection is claimed.

The default global npm prefix did not exist and the default cache is outside writable roots.
For future npm commands, if needed:

```sh
mkdir -p /workspace/tooling/npm-prefix/lib /workspace/tooling/npm-cache
export npm_config_prefix=/workspace/tooling/npm-prefix
export npm_config_cache=/workspace/tooling/npm-cache
```

No application packages or credentials are required for the selected vanilla SVG/ESM architecture.
The Node build and Python test commands use existing tools. Vendored skills travel with Git;
no refetch is necessary. Future machines missing browser-test packages can use a writable virtual
environment and install the versions listed above with normal package integrity/TLS verification.
Live processes do not persist across cloud snapshots. Start servers only when required for testing.


## Preset library addendum (2026-10-25)

The library adds pinned build-only `esbuild@0.25.12`; run `npm ci` before `npm run build`.
The lockfile and GitHub Pages workflow include this step. All app assets, geometry data and the
local dimension-builder worker are inlined into `dist/library.html` and `dist/index.html`.
No separate REA server or native analysis engine is needed for this source implementation.
Run `npm run test:library` plus the export/performance scripts listed in the README. Browser
checks use system Chromium and local HTTP; the managed local-file policy remains unchanged.


## Animation follow-up runtime

`npm ci` now runs `scripts/prepare-anatomy-runtime.mjs` automatically. Build, test and audit
pre-hooks also run it, so deleting `.generated/` is safe. It verifies the pinned toolkit hashes,
creates the project renderer/build modules with consistent coordinate precision and stricter
overlap retention, and copies the licence. No additional dependency or network fetch is needed.
The generated diagnostic module retains its upstream checks and failure thresholds. A bounded
16 MiB cache reuses exact integer raster sample buckets during offline audits; it changes neither
sampling coverage nor edge arithmetic, and is covered by byte-exact differential regressions.
The additional `angularStep` option refines rotation checks independently of the original linear
normalization. Final library audits use 0.01° rotation and 60 fps story sampling; defaults and
unchanged slide-defect detection have regression coverage. Original
cabinet and bedroom builds continue using their original runtime. Detailed rationale and
validation are in `ANIMATION_FIX_QA.md`.
