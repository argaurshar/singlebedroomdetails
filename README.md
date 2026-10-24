# Room Anatomy

A complete illustrated bedroom explainer: seven guided stages, a shared numerical/geometry model,
Manual/Auto playback, finish studies and an interactive drawer-clearance experiment.

The architectural-study revision adds magnified construction assemblies, a full six-panel ceiling,
31 selectable component explanations, fitted views, staggered part motion, chapter replay and scrubbing.
Study mode lets you jump directly to any chapter. The original room dimensions remain unchanged.

Hosting: **GitHub Pages**. See [activation instructions](docs/DEPLOYMENT.md#github-pages).
Expected URL after deployment: https://argaurshar.github.io/singlebedroomdetails/

**[Download the standalone app ZIP](https://github.com/argaurshar/singlebedroomdetails/raw/refs/heads/feat/architectural-study/dist/room-anatomy.zip)**

The app is also in [`dist/room-anatomy.html`](dist/room-anatomy.html), with an identical hosting entry
at `dist/index.html`. It has no required runtime network dependencies. Open the downloaded file in
a browser permitting local HTML, or run the internal development server below.

```sh
npm run build
npm test
npm run serve
# In another terminal:
npm run test:browser
npm run test:study
python3 tests/visual.py
```

Use Tab to reach controls, Enter/Space for buttons and arrow keys for sliders. Manual is the first-visit
default. Auto plays the 36-second tour. Explore pauses playback; a negative clearance displays the
intersection. Reset restores the room while retaining the chosen mode and finish. Reduced motion
uses still states and prevents looping unless you explicitly enable animation for this visit. `?render` disables the clock; `window.seek(t)` reconstructs
any time from 0 to 36 seconds, in any order.

All dimensions and fixture powers are demonstration assumptions. Air and light effects are illustrative;
no compliance, ventilation, lux, pricing or engineering performance is implied.

- [Full source handoff](docs/Room_Anatomy_RDB_Build_Plan.md)
- [Design and data contracts](docs/DESIGN.md)
- [Implementation checklist](docs/PHASE_CHECKLIST.md)
- [QA evidence and limitations](docs/QA.md)
- [Deployment preparation](docs/DEPLOYMENT.md)
- [Environment checks](docs/SETUP.md) and [pinned local skills](docs/SKILLS.md)

Built with the MIT-licensed [Anatomy toolkit](https://github.com/wheresryan22/anatomy).
The reference was investigated using the REA browser CLI; see [evidence and reconstruction decisions](docs/REFERENCE_ANALYSIS.md).
The original handoff remains unchanged. Revision work is isolated on `feat/architectural-study`; this revision is not merged or publicly deployed. Video/audio are optional follow-up deliverables after app acceptance.
