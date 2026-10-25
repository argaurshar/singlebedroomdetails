# Room Anatomy — the object library

Seven interactive demonstration studies: **bedside cabinet, entry console, writing desk, coffee
table, open bookcase, floor lamp and standing mirror**. Choose an object, turn it, inspect its
parts and connections, separate its assemblies, and build it back in order.

**[Download the working library ZIP](https://github.com/argaurshar/singlebedroomdetails/raw/refs/heads/feat/preset-library/dist/library.zip)**

Extract and open `index.html`, or serve the folder locally. The seven studies and their dimension
editor are bundled into one HTML file. No runtime CDN, account, server or AI API is required.
The original [cabinet](dist/cabinet.html) and [bedroom](dist/bedroom.html) remain separate pages.

This revision is on **`feat/preset-library`**, pending review. GitHub Pages publishes `dist/` only
from `main`. The public URL remains https://argaurshar.github.io/singlebedroomdetails/ — the new
library appears there only after the review branch is merged and its Pages deployment succeeds.
See [deployment instructions](docs/DEPLOYMENT.md).

- Seven guided chapters, Manual/Auto, reset, timeline and reduced-motion stills.
- Select an assembly or individual part; isolate, close up, drag to turn, or use keyboard controls.
- Front, side, plan and central-section drawings from the same physical model.
- Bounded width/depth/height/thickness editing, material construction studies and finish swatches.
- Favourites and named variations saved in this browser; JSON import/export for portable designs.
- Parts CSV, standalone drawing SVG, printable PDF study sheets and local 36-second video export.
- A step-by-step assembly workshop and interactive signed drawer-clearance readout.

```sh
npm ci
npm run build
npm test
npm run serve
# Browser checks start their own temporary HTTP server:
npm run test:library
python3 tests/library-export.py
python3 tests/library-performance.py
# Extended geometry diagnostics (slow):
npm run audit:library
# An iteration aid, not a full audit:
npm run audit:library -- --quick --preset=bedside
```

Use Node 24 (minimum 22). The only npm dependency is the pinned **build-time** esbuild bundler.
Browser tests use Python Playwright, Pillow, NumPy and `/usr/bin/chromium`; export validation also
uses FFmpeg/FFprobe. Pinned Anatomy code, supporting files and licences are retained in the repo.
See [setup](docs/SETUP.md) and [skill provenance](docs/SKILLS.md).

Source: [`src/library`](src/library). Catalog, numerical model, geometry, drawings, controller,
video recorder and packaging remain separate. Edited models compile in a local Web Worker;
stale results cannot replace another preset or a newer edit.

Use Tab and Enter/Space for controls. In the 3D scene, Left/Right turns, +/− zooms, Home fits and
Escape clears selection. Native range controls support arrow keys and Home/End. Manual plays
and pauses a chapter; Auto loops the 36-second story. `?render` disables the autonomous clock;
`window.seek(t)` reconstructs a canonical frame from 0–36 seconds. Reduced motion requires
explicit opt-in before animation runs.

These are original **demonstration designs**, not manufacturer specifications or certified
fabrication drawings. Fasteners, lamp internals and mirror sheen are illustrative. No load,
stability, electrical, lux, airflow or compliance results are inferred. One object is studied at
a time; this version is not a room-layout editor. Video is silent and uses browser-supported
MediaRecorder formats (WebM in tested Chromium). Keep the tab visible while recording.

- [Library contract and phase checklist](docs/LIBRARY_PLAN.md)
- [Library validation and limitations](docs/LIBRARY_QA.md)
- [Previous cabinet validation](docs/CABINET_QA.md)
- [Original bedroom handoff](docs/Room_Anatomy_RDB_Build_Plan.md)
- [Reference investigation](docs/REFERENCE_ANALYSIS.md)

Built with the MIT-licensed [Anatomy toolkit](https://github.com/wheresryan22/anatomy).
The reference video was visually inspected during the prior revision; no source recovery is claimed.
