# Room Anatomy project instructions

Read `docs/Room_Anatomy_RDB_Build_Plan.md` completely before working on the app.
Read `docs/PHASE_CHECKLIST.md` and `docs/SETUP.md` for current decisions and evidence.
The library is merged (PR #3). The active follow-up fixes animation correctness on
`fix/library-animation-order`; read `docs/ANIMATION_FIX_CHECKLIST.md` and
`docs/ANIMATION_FIX_QA.md` before resuming. Do not add features in this follow-up.

## Current authorization

The user has authorized implementation, testing, standalone packaging and hosting configuration.
The first version is merged. The user subsequently rejected the room animation and explicitly
authorized narrowing to one furniture item. The cabinet is merged. The user subsequently authorized a furniture/decor preset library on
`feat/preset-library`. Read `docs/LIBRARY_PLAN.md` and `docs/LIBRARY_QA.md` for current scope,
verification and outstanding limits. Read
`docs/CABINET_DIRECTION.md` and `docs/CABINET_QA.md` for the cabinet contract and current evidence.
Preserve the bedroom source and `dist/bedroom.html`; preserve `dist/cabinet.html` too. The new library becomes the hosting entry after review.
Commit coherent changes and prepare a reviewable PR. Do not treat old room QA as cabinet evidence.
GitHub Pages hosting is now authorized and configured via `.github/workflows/pages.yml`.
Do not merge the PR automatically. Deploy only from `main` through the Pages workflow.
Video/audio follow app acceptance.
Use this existing isolated checkout; do not create a worktree unless explicitly requested.

## Confirmed decisions

- RDB means Requirements → Design → Build.
- Preserve the plan's demonstration bedroom as a separate study. The current lead study is the
  user-authorized bedside cabinet; its new dimensions are explicitly demonstration assumptions.
- Use SVG object-space geometry and isometric projection, HTML controls and CSS; no Plotly.
- Maintain source modules for specification, pure model, timeline, scene, controller and packaging.
  Produce one offline HTML deliverable with inline assets and no runtime CDN or AI API dependency.
- Cream paper, oak, sage, terracotta and bronze; Manual on first visit; seven ordered actions.
- The drawer's geometry and clearance readout share one model. Retain signed negative clearance.
- Core interactive app first. Video/audio and public hosting are separate optional work.

## Skills

Local skills are `.agents/skills/anatomy` and `.agents/skills/reverse-engineer-anything`.
Read their SKILL.md and applicable supporting references when using them. Pins, licences and hashes
are recorded in `docs/SKILLS.md` and `docs/skill-files.sha256.json`.
Keep Manual first, seven chapters, shared geometry/readouts, reduced motion and offline packaging.
The cabinet uses the pinned Anatomy turning engine with face-bound detail and real 3D projection.
Do not recreate the rejected room approach of disconnected box diagrams. The uploaded video was
visually inspected, not decompiled; source recovery from it has not been claimed.
Use ordinary source tools for source analysis. The revision has a verified REA browser CLI;
locked installation manifests are in `tooling/rea/`. MCP is not registered and native engines are
not installed. Do not confuse these capabilities with the pinned skill or with reference-site access.
Do not delegate unless the user explicitly asks; settle shared model/controller contracts first.

## Build and verification discipline (after authorization)

Follow phase gates in order. Freeze exact openings, swing envelopes, layers and fixture assumptions
before model/scene work. Use millimetres; x east across width, y north along length, z up;
origin is the south-west finished floor corner. Presentation offsets never change physical measures.
Every requirement R01–R13 needs its design owner and acceptance evidence. Preserve provenance,
continuous pivots, explicit depth order, canonical reset and deterministic `window.seek(t)`.
`?render` disables the autonomous clock. Test shuffled seeks as well as forward playback.
Test responsive layout, keyboard, storage failure, reduced motion, repeated clicks, interruptions,
hidden-tab resume, collisions and readout invariants. Use the full plan for visual and frame QA.
Do not claim lux, HVAC performance, compliance or physical simulation from illustrative effects.
Do not call unrun application checks passed. Retain upstream licences with reused code.

## Environment

Run `python3 scripts/check-environment.py` from the repository root to check tools using a disposable
upstream example. Serve files over local HTTP for browser checks; managed Chromium blocks file URLs.
Do not modify browser policy. Keep localhost URLs internal to validation.
Use writable npm cache/prefix locations if npm is needed; see `docs/SETUP.md`.
Do not add application dependencies until implementation selects them.

## Architectural-study revision status

The reference gate is closed; `docs/REFERENCE_ANALYSIS.md` records the downloaded
artifact hash, REA scenario evidence and direct-browser certificate limitation.
Implementation is complete in `src/study-model.mjs` and `src/study-scene.mjs`, integrated
with the original numerical model and controller. Read `docs/REVISION_QA.md` before
continuing. Preserve the seven-stage / 36-second contract and canonical seek behaviour.
The camera may crop context on component selection; active geometry must remain visible.
Mobile uses HTML component labels rather than illegibly small SVG labels. Primary controls
require at least 44 px hit areas. Detail offsets never enter physical measurements.
Do not redo reference setup or install unused native engines. Use `npm run test:study`
with the internal server for new study interactions. The user must merge the review
branch before the existing GitHub Pages workflow can publish the revision.

## Cabinet development

Run `npm run build`, `npm test`, and `npm run test:cabinet`. The browser test starts its own local
server and uses system Chromium via Python Playwright. `npm run audit:cabinet` runs Anatomy
geometry/contact and turning diagnostics; `-- --quick` is an iteration aid, not a full pass.
`tests/cabinet-motion.py` expects an internal server on port 4174. Keep reported evidence tied to
the final build. The 69 solids are driven by `src/cabinet/model.mjs`; presentation transforms
never alter physical dimensions. Capture mode canonicalizes depth tie order before each seek.
Do not edit the pinned toolkit to bypass diagnostics. Keep all supporting files and licences.

## Preset library

Seven original demonstration objects live in `src/library/`. One active SVG study at a time.
Run `npm ci`, `npm run build`, `npm test`, and `npm run test:library` (Python Playwright with
system Chromium). `npm run audit:library` runs per-preset Anatomy audits and writes evidence
under `.test-artifacts/library/`. Do not confuse a quick audit or sampled depth test with a full
orbit audit. Millimetres drive solids, measurements, drawings and exported schedules; the
library origin is the object centre in XY at finished floor Z=0. Dimension rebuilds use a local
bundled Web Worker. Keep its esbuild dependency pinned and install it in CI before building.
Keep the original room/cabinet source and evidence. Do not deploy this branch or merge main.


## Library renderer precision

`npm ci`, `npm test` and `npm run build` regenerate the project-owned Anatomy runtime
under `.generated/anatomy/` using `scripts/prepare-anatomy-runtime.mjs`. It verifies the
pinned source hashes before applying production precision/order fixes and copies the MIT
licence. Keep the original skill files unchanged. The generated audit retains the upstream
checks and thresholds; it uses the production renderer and caches exact integer raster samples.
A source guard reverses only those cache substitutions to compare the remaining body, and
byte-exact differential tests compare cached/uncached raster results. See animation QA for
why the lamp story uses 60 fps audit sampling. Do not label scoped or quick checks a full pass.
Coffee-table legs have two render solids each but remain one physical part per leg. Camera
framing, selection, schedules and drawings must preserve those logical identities.
