# Room Anatomy project instructions

Read `docs/Room_Anatomy_RDB_Build_Plan.md` completely before working on the app.
Read `docs/PHASE_CHECKLIST.md` and `docs/SETUP.md` for current decisions and evidence.

## Current authorization

The user has authorized implementation, testing, standalone packaging and hosting configuration.
The first version is merged. Use revision branch `feat/architectural-study`; commit coherent changes
and prepare a new reviewable PR. Read `docs/ARCHITECTURAL_STUDY_REVISION.md` for the current evidence
gate and execution plan. The user requires fresh reference analysis before the animation rebuild.
GitHub Pages hosting is now authorized and configured via `.github/workflows/pages.yml`.
Do not merge the PR automatically. Deploy only from `main` through the Pages workflow.
Video/audio follow app acceptance.
Use this existing isolated checkout; do not create a worktree unless explicitly requested.

## Confirmed decisions

- RDB means Requirements → Design → Build.
- Use the plan's demonstration bedroom, with every physical input labelled as a demo assumption.
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
Apply the room plan's explicit presentation over generic Anatomy defaults: Manual first,
coloured room assemblies, useful anchored labels, and the full furnished bedroom subject.
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
