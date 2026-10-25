# Library animation correctness — 2026-10-25

Follow-up to the merged preset library (PR #3, `85f86be`). The user requested fixing the
remaining animation warnings before adding features. Review branch: `fix/library-animation-order`.
The seven studies and their existing controls remain the scope. Original cabinet/bedroom
sources and packaged pages are unchanged.

## Corrections

The baseline recorded **51 order-change warnings**: bedside 8, console 0, desk 5, coffee 4,
bookcase 2, lamp 32, mirror 0. These were real nonzero diagnostics, not a clean audit.

- SVG coordinates rounded to 0.01 px and packed separating normals disagreed at shared edges.
  Production output now retains six decimal SVG positions and nine decimal geometry/normal data.
  Raw separating-normal arrays use an existing runtime input format.
- Ordering broadphase and cycle pruning discarded constraints while faces still overlapped.
  The renderer now retains those constraints down to the shared edge (zero broadphase shrink;
  cycle hull separation allowance `1e-6` px rather than `0.1` px).
- The stricter ordering exposed a coffee-table painter cycle around 127.9963°. Each continuous
  leg now has two render solids at the shelf plane. Cut-edge suppression prevents an invented
  physical seam. Both pieces retain the same logical part identity; schedules still contain
  four legs, and selection/camera bounds include each complete leg.
- Thin table/desk/console configurations previously placed corner blocks inside legs. Apron
  inner faces and blocks now meet without penetration, including the desk's divided front apron.
  All three default models are unchanged; the correction applies below 21 mm thickness.
- The camera previously switched its full-strength target abruptly at 15 seconds (the bedside
  view origin jumped about 318 drawing units). It now eases from the connection to the material
  view and then back to the complete object, joining smoothly at 15 and 17.5 seconds.

`prepare-anatomy-runtime.mjs` generates project-owned production modules from hash-verified
pinned sources under `.generated/anatomy/`. Install, build, test and audit hooks regenerate them.
The MIT licence and supporting files are retained. All **171 pinned skill hashes** still match.
The original toolkit files are unchanged, and a regression checks that the generated diagnostic
body and failure thresholds are identical to the pinned audit (only imports differ).

## Lamp continuity investigation

The earlier release never completed its full continuity audit. This follow-up first completed
that check for the lamp and found 32 halving warnings at the original 0.1-second story sampling.
Long, narrow shade faces rotate roughly 13° in those intervals, moving across their own projected
width; the raster-change metric saturates instead of measuring local convergence.

The same thresholds and raster metric were used to subdivide every reported interval:
**192 checks at 60 fps and 384 at 120 fps passed**, covering 19 distinct shade panels. Maximum
corresponding-vertex motion converged from 1.7058 px at 1/60 s to 0.8614 at 1/120 s, 0.4329 at
1/240 s and 0.0869 at 1/1200 s. Six edge-on face switches were localized by bisection; their
largest switched projected area was approximately 0.002266 px², below the unchanged 2 px² check.
The complete lamp story audit now samples at 60 fps. Geometry and playback were not slowed to
avoid diagnostics, and no failure threshold was relaxed.

## Validation

- **63 Node tests passed**, including all preserved room/cabinet tests, seven unchanged-threshold
  ordering regressions, seven camera boundary checks, physical/render mapping checks and thin
  joinery contact checks. Parameter contracts compile all 112 min/max combinations.
- Additional coffee ordering investigation: all 16 dimension-limit combinations × 361 angles
  produced no forced/unseparated ordering; four coffee corners and minimum desk/console order
  audits had no swaps, forced orders or cycles.
- **10 browser acceptance groups passed**, with 53 captures: all 49 chapter selections/reset,
  actual motion interruption/reset, Auto/Manual, keyboard and slider limits, worker rebuilds and
  request replacement, saved designs, drawings, downloads/print, reduced motion, mobile layout,
  blocked storage handling, no page errors and no runtime external requests.
- **Five targeted browser groups passed** on the final build: 84 deterministic transition
  captures around 15 and 17.5 seconds, plus 12 full-page desktop/mobile captures. Actual browser
  playback recorded **1,795 frames** crossing those transitions for all seven presets. No
  forced/unseparated counters or page errors occurred in those ranges. The largest camera
  crossing delta was 2.027 units normalized to a 960-pixel viewport.
- Both final transition contact sheets and all 12 individual full-page screenshots were opened
  and inspected. Active drawer/frame/shade/material geometry remained visible; adjacent frames
  showed no camera pop. Contextual geometry is intentionally cropped in close-ups. No new label
  collisions or layout defects were observed in those captures.

Final HTML SHA256: `5a86d2edfb67dd8c1c1a7b73eb060985c40f81318389494f807ca9c234001b27`.
Extended audit completion and final export/performance evidence are pending below; this document
must not be used to claim those pending checks passed.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run test:library
python3 tests/library-animation.py
python3 tests/library-export.py
python3 tests/library-performance.py
npm run audit:library
```

For parallel audit execution, run the unchanged scopes separately and retain both results:

```sh
node scripts/audit-library.mjs --preset=bedside --only=continuity --out=.test-artifacts/animation-fix
node scripts/audit-library.mjs --only=order,rigid,swept,posed,routes,coverage,depth --out=.test-artifacts/animation-fix
```

Repeat the first command for each preset. Unique scope filenames prevent overwriting evidence.
A quick run or only one scope is not a complete audit. Continuous-time proofs, fabrication
certification and device-wide performance guarantees are not implied by sampled checks.

The managed browser still blocks direct `file://` navigation; self-contained operation is
validated over local HTTP. The existing GitHub Pages workflow publishes from `main` after the
user merges the review branch. This follow-up does not merge or publish automatically.
