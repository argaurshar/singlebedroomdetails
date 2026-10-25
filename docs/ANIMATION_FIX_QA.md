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
The original toolkit files are unchanged. The diagnostic body uses the production renderer and
an exact raster sample cache and separate angular sampling, described below. A source guard
reverses only those explicit substitutions and imports, then verifies all remaining diagnostic
logic and thresholds against the pin. Default sampler results also match upstream exactly.

## Exact audit cache

The full raster continuity check repeatedly computes the same deterministic integer sample
bucket for each pixel. `scripts/raster-buckets.mjs` caches those integer results in rows, bounded
at 16 MiB plus 8 KiB of prefix metadata. Outside the cache bounds it executes the original
calculation. Original jitter arithmetic, edge samples, raster resolution, sample counts and
failure thresholds are unchanged. This helper is only used by offline diagnostics, not the app.

Independent differential checks covered 48 raster fixtures with cold and warm replay: all
8,081,730 tested tone/owner bytes matched the uncached version exactly, including winding holes,
overlap, 4×/16× raster scales and cache boundaries. The row cache also matched 37,170 direct
bucket values and handled invalid/out-of-range fallback. Representative warm bedside raster
cases ran 2.9–3.8× faster. The completed uncached lamp audit is retained as the full-run control. The complete cached lamp
audit matched that entire report after excluding only elapsed time: zero warnings, 800 halving
checks and 79,148 measurements. Permanent tests cover the same raster and prefix cases.

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
The story audit now samples all presets at 60 fps. Geometry and playback were not slowed to
avoid diagnostics, and no failure threshold was relaxed.

## Independent angular sampling

The first completed desk continuity report exposed 40 coarse-step face-emergence flags and one
story halving flag. They were preserved and investigated rather than discarded. Bisection of
all 552 detected root-turn visibility toggles across the presets found a maximum actual switched
area of 0.010243 px², below the unchanged 2 px² criterion. At the original 0.05° spacing, normal
continuous face growth could reach 8.018 px² between samples. At 0.01° every detected birth is
below 2 px² (largest: 1.604 px²). Halving the angle step halves those areas and vertex movement.
The desk's story flag also converges normally: all six 60 fps and twelve 120 fps subdivisions
pass the same raster criterion, with no face-visibility switch in that interval.

A project-owned `angularStep` option defaults to the original `step`, preserving default results.
The final library audit requests `angularStep: 0.01`: 36,000 rotation steps instead of 7,200,
with the same 2 px² per-sample birth limit. Linear slides retain their original `delta / step`
normalization and sample spacing. Changing the shared step alone would have relaxed slide
limits, so that approach was not used. A regression introduces a 0.005 slide-opacity defect;
it remains detected against the original 0.0021 allowance, and the complete slide result is
identical before and after refining angular sampling.

Coarse desk findings and convergence evidence are committed alongside the final reports.
A previous mirror run failed while saving its artifact. It is excluded from the final evidence;
the fresh complete mirror rerun finished successfully without profiling.

## Complete final audits

All seven final commands completed with exit code 0, `quick=false`, no `only` restriction and
**no skipped categories**. Every base/turn finding category is zero. The original **51
order-change warnings are cleared**, and the previously unfinished continuity check is complete.

Settings: 0.01° angular steps, original 0.05 linear normalization, 60 fps story samples,
0.1 assembly increments, 300 random states and 12 angular/event depth samples. Full coverage
includes ordering, rigid/swept/posed intersections, routes, coverage, continuity and depth.

| Preset | Order states | Continuity measurements | Halving failures | Depth pairs |
|---|---:|---:|---:|---:|
| Bedside cabinet | 2,954 | 1,083,705 | 0 / 800 | 12,035 |
| Entry console | 2,838 | 1,168,918 | 0 / 800 | 5,113 |
| Writing desk | 3,066 | 1,264,786 | 0 / 800 | 10,583 |
| Coffee table | 2,874 | 1,319,544 | 0 / 800 | 5,974 |
| Open bookcase | 2,758 | 527,443 | 0 / 800 | 5,065 |
| Floor lamp | 3,058 | 251,948 | 0 / 800 | 3,593 |
| Standing mirror | 2,764 | 599,809 | 0 / 800 | 5,130 |
| Total | 20,312 | 6,216,153 | 0 / 5,600 | 47,493 |

The runs also covered **20,474 posed states and 336 depth states**. Every final raw report,
settings, totals and generated-source hashes are in `evidence/animation-fix/`, summarized by
`full-audit-summary.json`. All four parallel queue processes returned exit code 0. Earlier
scoped reports and the coarse sampling investigations remain historical evidence; the seven
`audit-*-full.json` files are the authoritative final results.

## Validation

- **68 Node tests passed**, including all preserved room/cabinet tests, seven unchanged-threshold
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
A clean `npm ci` followed by a rebuild reproduced that HTML byte-for-byte. ZIP contents and CRCs
were checked; the ZIP includes both preserved studies and the MIT licence. The standalone HTML
is 2,226,176 bytes (17.4% larger than the original library due to retained precision).

A fresh video export passed cancellation, recording/download, state restoration and independent
SVG rendering checks. FFprobe identified VP9 at 960 × 800, with the last frame at 35.775 seconds;
FFmpeg decoded six frames. Representative connection/explosion frames and the independently
rendered SVG were opened and inspected.

A 120-frame desk sample, with heavy audit workers temporarily paused, measured **60.0 fps**
at 1440 px (95th-percentile render work 3.0 ms), and **27.8 fps** at 390 px with Chromium's
4× CPU slowdown (95th-percentile render work 9.4 ms). Offscreen pause/resume and render-mode
clock suppression passed. This is a measured sample, not a universal frame-rate guarantee.

All required follow-up checks are complete. Original cabinet and bedroom builds still match
`85f86be` byte-for-byte. The feature branch is ready for review; it has not been merged or deployed.

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


## Review and deployment handoff

Changes are committed on `fix/library-animation-order`. The tested app is in `dist/library.zip`;
extract and open `index.html`. The branch was pushed successfully. Automatic PR creation returned
`Post "https://api.github.com/graphql": Forbidden`; use the repository comparison page to create
the review PR. No merge was performed. After review and merge, the existing GitHub Pages workflow
publishes the library at https://argaurshar.github.io/singlebedroomdetails/ (the root library page,
not the preserved `/cabinet.html` study).
