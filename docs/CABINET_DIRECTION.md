# Single-object revision: bedside cabinet

The user rejected the room revision's visual and motion quality and explicitly allowed a
single furniture item. Preserve the bedroom as a separate build. The new lead study is a
600 × 450 × 650 mm bedside cabinet with a 320 mm drawer stroke (new demonstration inputs).
Branch: `feat/bedside-cabinet`; no automatic merge or deployment.

Reference: user-uploaded Apple Watch clip, 1500 × 1182, 60 fps, 37.163 seconds. The clip shows
one dominant object rotating in depth, real internal mechanisms, surface details attached to
moving parts, contextual teaching props and a coherent exploded/reassembled object. This is
visual evidence from a recording, not recovered source code. Previous REA website evidence
remains available but does not prove this video's implementation.

The rejected room design's core problems: flat box vocabulary, a fixed camera, excessive
text surrounding a small subject, and transitions between disconnected detail diagrams.
The new study must retain one recognizable cabinet through all seven stages, with continuous
3D reprojection and shading, purposeful hardware and face-bound material texture.

## Contract and storyboard

- Original pinned Anatomy turning engine, original cabinet geometry; standalone inline HTML.
- Physical model in millimetres, drawing world at 1:10. Physical and exploded positions separate.
- Seven stages: turn; drawer travel; telescopic rails; drawer construction; material/edge detail;
  complete exploded assembly; reassembly. Pure deterministic 36-second state.
- Oak/walnut/painted finishes, Manual/Auto, direct chapter selection, replay, scrub, rotation,
  keyboard, reduced-motion still poses and reset. Do not interpret test counts as visual quality.
- Bevelled solid-oak top/front; cabinet sides/back/base; lower shelf; four tapered legs and pads;
  two mounting runners, intermediate/inner channels and bearings; drawer base, sides, rear,
  front and brass pull; visible mounting hardware and face-bound grain.
- The 320 mm runner extension is illustrative geometry, not a product load rating or brand claim.

## Acceptance gates

- [x] Inspect the new video and record the scope decision.
- [x] Build the detailed cabinet with true 3D motion and attached material detail.
- [x] Audit contact/order and inspect assembled, moving, mechanism and exploded views; record qualified results.
- [x] Complete seven stages and accessible controls; preserve bedroom access.
- [x] Test deterministic rendering, reset/interruption, responsive layout and motion continuity.
- [x] Package and push a reviewable build with evidence and candid limitations.
- [ ] Resolve the 32 remaining rail-edge order-change warnings (see CABINET_QA.md).
- [ ] User review, PR creation/merge and verification of the GitHub Pages deployment.

## Reference evidence

The uploaded MP4 has SHA-256
`e2a964617d39a8de5dd7cb262e6ceead3c8db3239af6ce5b101580ae28e1622f`.
FFprobe reports H.264 at 1500 × 1182 / 60 fps, AAC audio, duration 37.162667 s.
A contact sheet sampled at three-second intervals and individual mechanism views were inspected.
The recording was not copied into the public repository. It establishes a visual/interaction target,
not source provenance, fabrication data, or a claim that our rendering engine is the reference's engine.

| Observed in the recording | Cabinet decision |
| --- | --- |
| One dominant watch turns and retains its identity | One cabinet is reprojected in 3D throughout the story |
| Internal workings remain attached to the object | Runner, drawer and case groups share one hierarchy |
| Details move with faces | Grain, slots, screw marks and underside label use face coordinates |
| Left chapter list and top instruction change with motion | Seven synchronized chapters, instruction, progress and live readouts |
| Take-apart and together use the same parts | Reversible offsets, staged clearance, identical assembled endpoints |
| Close mechanism views explain a specific operation | Runner focus with faded case, plus interactive travel/clearance slider |

## Implementation and data ownership

`src/cabinet/model.mjs` owns the physical specification and pure 36-second motion.
`geometry.mjs` owns physical solids and group parentage. `controller.js` owns input, playback,
camera fitting, projected shadows and DOM updates. `style.css` owns the material ramps and layout.
`scripts/build-cabinet.mjs` uses the unmodified pinned toolkit and produces inline HTML and ZIP.

Physical inputs are millimetres; drawing coordinates are millimetres divided by ten. Width,
depth, height, top/case thickness and runner stroke feed both geometry and readouts. The final
model uses 69 solids in 15 rigid groups. The drawer's 320 mm stroke drives its inner rail, the
middle rail at 1/2 stroke and bearing sets at 1/4 and 3/4 stroke. The assumed opposing gap is
800 mm; the remaining gap is `800 - extension` (480 mm at full stroke). Bearing/contact geometry
is illustrative, not a tested commercial runner or a load calculation.

The wooden box lifts clear of the runners before its sides separate. On reassembly the sides
and case close first, the box lowers, and only then does the top settle. The top's presentation
pivot and all exploded offsets are excluded from physical dimensions. Canonical seeking resets
only SVG tie order, orbit and manual extension; live playback keeps incremental ordering.

## Verification map

| Requirement | Evidence path |
| --- | --- |
| Physical/readout agreement and valid inputs | `tests/cabinet.test.mjs` |
| Stage continuity and assembled endpoints | Pure model tests, `tests/cabinet-motion.py` |
| All seven chapters and reset during motion | `tests/cabinet-browser.py` real-time chapter loop |
| Manual/Auto, interruptions, finishes and drawer slider | Browser interaction groups |
| Keyboard and reduced motion | Browser keyboard, all still poses and opt-in reversal |
| Canonical seek and render mode | Forward/reverse/shuffled PNG comparisons |
| Responsive controls and active-part composition | Four viewport widths, 42 captures and direct visual inspection |
| Contact, separation and depth order | Strict build, Anatomy audit and dense browser samples |
| Actual playback performance | `tests/cabinet-performance.py` |
| Standalone and existing app access | Inline assets, no external requests, ZIP inspection and bedroom regression |

The cabinet supersedes the room as the lead subject under the latest user authorization. The
original plan and requirement matrix remain applicable to the preserved bedroom. This revision
does not falsely mark unbuilt architectural systems as demonstrated by a furniture study.
