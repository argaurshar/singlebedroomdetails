# Preset library — implementation contract

The user requested multiple furniture/decor presets and the eight recommended improvements.
This authorizes implementation on `feat/preset-library`; do not merge or deploy automatically.
The existing cabinet and bedroom remain separately accessible. The library becomes the index.

Seven original demonstration designs: bedside cabinet, console, writing desk, coffee table,
bookcase, floor lamp and standing mirror. One live object at a time; no room composition editor.
Each preset has its own assemblies, explanatory text, parameter limits and parts schedule.
Use the pinned Anatomy SVG turning engine; retain its supporting files and licence.

## Contracts

- Millimetres are physical truth; drawing units = mm / 10. A pure catalog/model creates the
  solids and schedule. Neither explosion nor camera offsets change dimensions.
- Each component has an id, role, material, explanation, connection and assembly rank.
- Seven guided chapters, Manual/Auto, reset, seek, reduced motion and offscreen pause.
- Part picking/list, isolate/context controls, focused connections, keyboard orbit/zoom.
- Front/side/plan/central-section drawings derive from the same physical parts; technical views
  show assembled geometry and state this explicitly. Dimensions are not fabrication certification.
- Validated parameters: width, depth, height, thickness and drawer clearance where applicable.
  Build edited geometry in a local Web Worker; reject invalid input and discard stale responses.
- Solid timber / veneered plywood / painted MDF studies show corresponding edge/face treatment;
  lighting and mirror finishes have their own materials. No invented performance results.
- Stepwise assembly mode with explanations, saved variants/favourites, local JSON, CSV schedule,
  SVG drawing and printable PDF study sheet. Video follows core acceptance; no autoplay sound.
- Offline single HTML and ZIP; no runtime remote services. Build-only esbuild version is pinned.

## Phase checklist

- [x] Inspect source, preserved studies, previous audit limits and latest authorization.
- [x] Define and test catalog, physical models, joints and parameter boundaries.
- [x] Implement seven distinct detailed presets and continuous assembly motion.
- [x] Build library, inspector, selectable components and dimensioned drawing modes.
- [x] Add materials, dimension editing, guided assembly and saved designs.
- [x] Finish standalone exports and print sheet; validate before video work. Silent local video export was then implemented and tested.
- [x] Validate numerical contracts, every preset/stage, reset/switching/worker races,
  keyboard/reduced motion, desktop/mobile screenshots, motion/depth and performance.
- [x] Package, document evidence/limits, commit and push a reviewable feature branch.

## Acceptance

Every card opens a working study. Every preset supports all shared tools where meaningful;
non-applicable controls are absent rather than faked. Material, part count, physical extents,
measurements, exports and technical drawings agree. No preset uses a stretched screenshot.
Default and parameter-boundary builds must compile strictly and stay finite. No unresolved
large geometry intersections or forced depth orders in sampled assembled/assembly states.
Prior cabinet warnings are tracked separately, never relabelled as a clean library audit.


## Review status

Core implementation and acceptance checks are complete. See `LIBRARY_QA.md` for the exact
performed tests and known renderer diagnostics. The scoped audit has 51 edge-order warnings;
full pixel-level continuity remains outstanding; the depth oracle completed without failures, so no audit-clean claim is made.
Source, standalone build, ZIP and reproducible checks are prepared for review. Do not merge or
publish automatically. A room composition editor, manufacturer catalogs, CAD/GLB export and
narrated audio are outside this first library version.
