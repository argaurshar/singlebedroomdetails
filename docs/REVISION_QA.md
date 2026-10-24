# Architectural-study revision — validation and delivery

Date: 24 October 2026. Application commit: `3c42825` on `feat/architectural-study`.
Build identity and structured results: [validation.json](revision-evidence/validation.json).
This report supersedes the original version's reference-access and presentation limitations.

## What changed

The original fixed room view made construction details too small. The revised application
uses magnified floor/wall, wardrobe/runner, full ceiling and indoor-unit assemblies, with
staggered separation, fitted component views, context fading, anchored labels and a room locator.
The ceiling detail includes six panels, crossing channels, hangers, anchors, slab and services.
Lighting connects the five illustrative loads in their actual room positions.

A compact chapter sidebar, 31 component entries and synchronized inspector support direct
Study navigation, pause/replay and per-chapter scrubbing. Manual/Auto and the original 36-second
seven-stage timeline remain. Mobile keeps the active chapter visible and uses readable HTML
component names instead of tiny SVG labels. Primary targets are at least 44 px. Reduced motion
stays still unless the user explicitly enables animation for this visit.

Physical dimensions remain the approved demonstration assumptions. New construction details
are declared in `spec.study` and the inspector. Display translations never change measurements.
The ceiling void remains 150 mm; the drawer still travels 0–450 mm and leaves 1,050 mm at its
nominal full extension. The negative-clearance experiment remains available.

## Checks performed

| Check | Evidence / result |
|---|---|
| Pure model and geometry | **17 Node tests pass**: units, limits, invariants, runner travel, full ceiling coverage, physical/display separation, component mappings, ordered layers, shelf contents and deterministic ordering. |
| Existing application acceptance | **14 browser groups pass**: all seven stages in real time, reset during every stage, mode switching, double-click gating, simulated hidden-tab pause, storage failures, finishes, slider limits, keyboard and reduced motion. |
| New study interactions | **8 browser groups pass**: direct chapter switching, interruption, replay, keyboard scrubbing, retained part-button focus, all 31 component entries, active-part bounds, reduced-motion opt-in, canonical seek clearing transient selection, mobile chapter visibility and 44 px targets. |
| Responsive views | Start/middle/end of every stage at **1440 and 390 px** (42 captures), plus 360, 768 and 1024 px layouts. No horizontal page overflow. Final desktop/mobile ceiling and selected runner/fan views inspected at full size. |
| Motion | **361 samples**, 0–36 s at 0.1 s intervals. Zero nonfinite geometry, zero depth-order cycles, zero scene-region jump flags after corrections. |
| Live animation performance | **60.0 average fps**, 16.7 ms median interval across 120 frames in headless Chromium 154 at 1440 × 1100. This is a cloud-machine measurement, not a tablet benchmark. |
| Capture contract | Repeated, reversed and shuffled `window.seek(t)` outputs match. Render mode has no autonomous clock. Seek clears transient component selection; camera fits are reconstructed from time and explicit inputs. |
| Standalone package | Inline HTML, identical hosting/standalone entry points, ZIP with licence. Browser run makes no required external requests. |

The dense motion check ran after the geometry and transition fixes. Subsequent changes were
44 px control hit areas, stylesheet formatting and canonical status/selection text; the final
browser suites and screenshots cover those changes. No geometry changed after the dense review.

## Findings resolved during visual review

- Floor layers initially crossed during staggered separation. Reordered the stagger so the finish
  leads the underlay and screed; a 0.005-progress test checks that they never cross.
- Shelf contents now inherit their shelf's display translation rather than remaining in its path.
- The room locator fades across whole-room/detail handoffs. Mobile fitting applies to each detail
  view independently, avoiding a camera jump at a chapter boundary.
- Fan blades rotate about the fixed x-axis, sort by depth and have visible drum end caps.
- Component selection keeps the selected geometry inside the viewport. Surrounding context may
  deliberately extend outside it; the interface labels this as a component focus with cropped context.
- Dense-image analysis originally included the new transport bar in its scene crop. It now uses the
  actual SVG container bounds. Two remaining **whole-figure** flags at 0.9 and 21.3 seconds are
  expected chapter-title/readout/scrubber updates. The 21.2/21.3 views were inspected side by side;
  they do not show a geometry discontinuity.

Representative evidence:

- [Full ceiling, desktop](revision-evidence/ceiling-desktop.png)
- [Full ceiling, mobile](revision-evidence/ceiling-mobile.png)
- [Runner inspection](revision-evidence/runner-focus.png)
- [Fan inspection](revision-evidence/fan-focus.png)
- [Motion contact sheet](revision-evidence/motion-contact.jpg)

These are browser-rendered application captures. Reference investigation is documented separately
in [REFERENCE_ANALYSIS.md](REFERENCE_ANALYSIS.md); no reference artwork/source was copied into the app.

## Requirement-to-test update

| Requirements | Revision owner and acceptance |
|---|---|
| R01–R03 complete room / style / seven stages | Original room renderer plus study scene; 42 stage captures, full-room inventory, seven real-time stage completions. |
| R04 Manual / Auto | Existing controller regression tests plus direct Study interruption and replay. |
| R05 visible mechanisms | Detailed assembly parts, layer non-crossing test, ceiling coverage, runner and fan close-ups. |
| R06 shared numerical model | Drawer front/bed envelope tests, exact half/full rail stroke, constant physical extents under display offsets. |
| R07–R08 motion and interruption | Dense frame review, zero ordering cycles, reset in all stages, replay/pause and mode switching. |
| R09 accessibility / responsive layout | Native keyboard selection/scrubbing, focus retention, 44 px targets, mobile active chapter, reduced motion and opt-in reversal. |
| R10 clearance | Slider endpoints, −250 mm interference, matching plan/detail/model readouts. |
| R11 deterministic capture | Shuffled seeks, transient selection reset, render clock disabled. |
| R12 honest assumptions | Original spec preserved; additional construction assumptions explicitly labelled; no lux/airflow/compliance results. |
| R13 standalone delivery | Inline build, no required external requests, licence and ZIP. Direct file-opening limitation below. |

## Remaining limits and deployment

- This is an architectural construction study, not a project-specific construction document,
  manufacturer assembly catalogue or physical simulation. It intentionally uses illustrated SVG solids.
- Direct `file://` opening is blocked by managed Chromium policy; local HTTP operation is verified.
  Opening the downloaded HTML in a permissive local browser remains an external check.
- The live reference's Chromium HTTPS visit failed certificate validation. Its normally verified
  Python HTTPS download ran locally under REA; that distinction is retained in the evidence.
- No full screen-reader session, real tablet hardware benchmark, video/audio export or upstream
  Anatomy pipe/connector audit is claimed. Geometry ordering uses the project's convex-overlap
  and separating-plane checks; interaction/accessibility checks use Chromium and native controls.
- GitHub API calls and the live Pages URL return proxy HTTP 403 in this environment. Git transport
  works; the branch is reviewable. A PR must be opened through the supplied compare link because
  automated creation is unavailable. No merge or public deployment was performed.

Download the branch's `dist/room-anatomy.zip`, extract it and open `room-anatomy.html` to review the
working app. To update GitHub Pages, create/review the revision PR, merge when satisfied, and wait
for the existing Pages workflow. If Pages is not active, set Settings → Pages → Source to GitHub Actions.
