# Room Anatomy — object studies

The current revision leads with an interactive **bedside cabinet**: turn it in depth, open its
drawer, inspect the telescopic runners, separate its construction and reassemble the same object.
The earlier complete bedroom remains available through **The bedroom** link.

**[Download the working cabinet and bedroom ZIP](https://github.com/argaurshar/singlebedroomdetails/raw/refs/heads/feat/bedside-cabinet/dist/cabinet.zip)**

Extract it and open `cabinet.html` in a browser that permits local HTML. Both studies contain
their artwork and scripts inline, with no runtime CDN, API or package dependencies.
Source: [`src/cabinet`](src/cabinet); builds: [`dist/cabinet.html`](dist/cabinet.html) and
[`dist/bedroom.html`](dist/bedroom.html). `dist/index.html` is identical to the cabinet.

This revision is on **`feat/bedside-cabinet`**, pending review and merge. The existing GitHub Pages
workflow publishes `dist` only from `main`. The public URL remains
https://argaurshar.github.io/singlebedroomdetails/ — it does not show this branch until deployment.
No Vercel account is required. See [deployment instructions](docs/DEPLOYMENT.md).

```sh
npm run build
npm test
npm run serve
# Browser checks start their own HTTP server:
npm run test:cabinet
# More extensive geometric diagnostics:
npm run audit:cabinet
```

Requires Node 22+ for development; browser tests use Python Playwright and `/usr/bin/chromium`.
Pinned Anatomy code and its licence are checked in; the build needs no package installation.
See [setup](docs/SETUP.md) and [skill provenance](docs/SKILLS.md).

Manual plays a selected chapter and waits; Auto loops the 36-second story. Drag the cabinet to
turn it, or use the keyboard rotation slider in Study notes. Scrub, change finishes, and pull the
drawer using its slider. Tab reaches controls; Enter/Space activates buttons; arrow keys adjust
sliders. Reduced motion uses settled views unless explicitly enabled for the visit.
`?render` disables playback; `window.seek(t)` reconstructs any time from 0 to 36 seconds.

Cabinet dimensions, clearance and runner proportions are demonstration assumptions. This is an
illustrated construction study, not a shop drawing, product load rating or fabrication certification.
The original bedroom's lighting and air effects remain illustrative.

- [Cabinet scope, reference observations and checklist](docs/CABINET_DIRECTION.md)
- [Cabinet validation and limitations](docs/CABINET_QA.md)
- [Original complete bedroom handoff](docs/Room_Anatomy_RDB_Build_Plan.md)
- [Previous website reference investigation](docs/REFERENCE_ANALYSIS.md)

Built with the MIT-licensed [Anatomy toolkit](https://github.com/wheresryan22/anatomy).
The new user-supplied video was visually inspected; no source-code recovery from the video is claimed.
