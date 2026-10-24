# Room Anatomy — architectural study revision

Status: reference-access gate open; implementation has not started.
Branch: `feat/architectural-study`, based on merged `main` commit `3c22723`.
This plan responds to the user's assessment that the existing animations, ceiling visibility,
and educational depth are insufficient. Previous functional passes are not visual acceptance.

## 1. Evidence boundary and the first gate

The user requires analysis of https://visual-learning.app/vision-pro before rebuilding.
Fresh ordinary HTTP access returns proxy 403; Chromium navigation returns
`ERR_TUNNEL_CONNECTION_FAILED`. These are transport failures, not application behavior.
The environment draft now adds the exact `visual-learning.app` domain while preserving the
existing package-manager network preset. Applying that setting is the next external prerequisite.
Do not retry unchanged failed requests or substitute an invented reconstruction of the reference.

The original full handoff remains available and describes seven stages, SVG projection,
sequential gating, changing hints, Manual/Auto, reset and deterministic capture. Those are prior
reported observations, not a fresh live-page inspection in this revision.

Local Anatomy and REA skills remain at their recorded upstream pins. The published
`rea-agents@6.7.0` CLI is additionally installed in an isolated tooling prefix. Its published
Node engine range accepts this machine's Node 24.19.0; this differs from the engine declaration
in the pinned source checkout. Package-lock integrity records are retained in `tooling/rea/`.
Native engines and MCP registration are not needed for the browser CLI. The doctor reports
unconfigured Codex registration; this is separate from CLI browser capability.

Reference gate completion requires actual page access or a user-supplied page export/recording.
Do not change the application's animation implementation before completing the evidence pass.

## 2. What the existing app actually does poorly

Source observations, distinct from reference evidence:

- `src/scene.mjs` fixes one projection for every stage. It never brings the active assembly closer.
- The ceiling panel is only 2,500 × 640 mm. It represents a small strip above the wardrobe rather
  than a readable whole-room ceiling. It covers only 9.3% of the room footprint. Three battens and a few hangers do not explain the system.
- Floor and wall sections are small floating samples. Their relationship to the room is weak.
- Most room furniture remains static. Drawer travel is numerically correct but visually small.
- The scene is framed as a wide room view even when the mechanism needs a detail view.
- The sidebar offers stage state but no assembly inventory or explanation of constituent parts.
- Important instructions and the exploration controls sit below the principal scene, especially
  on mobile. Existing screenshots verify that many details are too small to study there.
- Tests prove calculations, control flow and bounded geometry. They do not prove pedagogical
  clarity, reference fidelity, readable mechanisms or sufficiently visible movement.

Retain the useful foundations: canonical model, signed clearance, deterministic seek, keyed SVG
updates, offline packaging, keyboard/reduced-motion support, licences and GitHub Pages deployment.

## 3. Reference investigation to execute once access is available

Use REA browser scenarios with declared actions and retained Evidence. Use normal source tools
only on publicly delivered HTML/JS, preserving source hashes. Do not seek private source/history.

1. Capture initial desktop and mobile page: scene bounds, top controls, sidebar labels, hints,
   footer, palettes, initial mode and readable text sizes.
2. Exercise each of seven actions; retain before, intermediate and settled states. Record exact
   visible parts, separation directions, fade rules, pivots, occlusion changes and label timing.
3. Measure screen-space subject occupancy and movement relative to the scene. Distinguish actual
   camera movement from parts moving in a fixed projection; do not assume that the reference zooms.
4. Record active/complete/next sidebar styling, top-title/hint synchronization and readout changes.
5. Exercise reset mid-transition, Manual/Auto switch, repeated clicks, reduced motion and reload.
6. Inspect delivered timing/easing/controller/projection code where accessible. Static code is
   evidence of implementation, not proof that all paths executed.
7. Produce a compact matrix: observed behavior → bedroom adaptation → source/Evidence ID → test.
   Mark unavailable stages/assets explicitly. Keep third-party artwork/branding out of our app.

Only then finalize the storyboard below against actual observations. REA output from our existing
room is baseline evidence for our app, not evidence about the external Vision Pro page.

## 4. Product direction and scope

The interpretation of “more realistic” is architecturally legible construction in the reference's
illustrated isometric style, not photorealistic rendering. The selected demonstration bedroom and
its physical dimensions stay as specified. Measurements remain visibly marked as demonstration
assumptions. No structural adequacy, code compliance, lux or HVAC performance is implied.

A visitor should understand both **where a component belongs** and **what it does**. The core is
still seven guided chapters, with richer assembly inspection inside each chapter. “Study everything”
is bounded to the room's shell, finishes, furniture, openings, ceiling, lighting and recirculating
indoor unit; it does not add a whole-building BIM editor or construction certification.

## 5. Planned learning interface

- **Motion status:** clearly display whether system reduced motion is active; preserve its default
  and offer a deliberate user-controlled motion opt-in for studying an animation. Do not infer the
  user’s system preference from REA’s default emulation.
- **Top:** current chapter number, concrete action title, one-sentence learning objective, mode,
  play/pause and reset. Keep these synchronized with the actual scene state, not a separate timer.
- **Left:** seven named chapters, clear running/completed states and progress. Beneath the active
  chapter, show its component list: choosing a component highlights it and explains its role.
- **Centre:** a substantially larger scene, stable context and a dedicated active-assembly focus.
  Keep a small room locator while studying an enlarged detached component, so location is never lost.
- **Study panel:** selected part name, function, layer order, demonstration dimensions/material,
  attachment relationship and one relevant diagram or calculation. Prefer concise descriptions
  with expandable detail rather than paragraphs scattered across the drawing.
- **Study controls:** scrub the current reveal, replay it, return to the assembled state and toggle
  assembly/section views. Guided Manual/Auto remains available; direct chapter access belongs to
  explicit Study mode so it does not break ordered-tour semantics.
- **Mobile:** active chapter header, scene, visible explanation and reachable controls first;
  collapse the chapter list/component inventory instead of stacking a long sidebar above the lesson.
- **Access:** native controls, textual selected-part state, focus retained across scene updates,
  reduced-motion settled poses, no essential hover-only information or colour-only status.

## 6. Provisional storyboard (adapt after reference inspection)

| Chapter | Readable motion and subject | Study content | Exit evidence |
|---|---|---|---|
| Open the room | Make the full ceiling's cutaway convention explicit; park its obstructing display portion, withdraw foreground wall sections, reveal the furnished interior | Finished dimensions, orientation, door/window positions and swing | Room remains recognisable; reveal changes visibility substantially; dimensions stay invariant |
| See the layers | Isolate a room-connected floor/wall corner; spread selected layers along real normals; frame the section large enough to read | Finish, underlay, screed, plaster and substrate; order, thickness, contact/support | Selected layers are individually visible and traceable to their original location |
| Furniture & drawer | Bring the wardrobe bay and bed clearance section forward; separate carcass/shelf/runner components in a controlled inspection pose; telescope the runner and drawer continuously | Carcass, joints/attachments, shelf, drawer tray, fixed/intermediate/moving runner, travel and signed clearance | 0/225/450 mm states visible; drawer/bed interference highlighted in the same geometry |
| Light the room | Highlight the actual switch, reveal a selected continuous circuit route, then activate connected fixtures with a readable staged signal | Fixture construction, circuit membership and assumed input power | Every highlighted fixture belongs to the selected circuit; no measured lux is implied |
| Ceiling construction | Display a full-footprint representative ceiling system; separate finish panels, secondary/primary supports, hangers and services; focus/section view shows the void | Assembly sequence, support/attachment, downlight cutout and cable route; 150 mm nominal void | Ceiling is a main subject, not a strip; each component remains identifiable in assembled and exploded states |
| Follow the air | Isolate and enlarge the indoor unit; open its casing to expose intake, filter, fan and outlet; show labelled room-air recirculation | Component roles and flow direction, explicitly schematic | Intake/fan/outlet are clearly visible; labels never cover moving parts; no ventilation-rate claim |
| Reassemble | Return assemblies in a coherent reverse sequence with continuous motion and a final complete-room hold | How furniture, finishes and services share space | All temporary offsets/highlights reset; canonical room and measurements match the initial state |

The 36-second deterministic tour remains an export compatibility target. Study mode supplies pauses
and independent scrubbing so learning is not forced into a short recording. If reference evidence
shows the new study sequence needs a different duration, record that decision rather than silently
changing the existing timeline contract.

## 7. Model and rendering contracts

- Expand the assembly data: part ID, parent, physical dimensions, material, local transform,
  attachment, motion axis/pivot, display offset and provenance. Assembly movement carries children.
- Pure evaluation derives physical quantities and presentation state independently. Camera/focus,
  explosion distances and visual offsets cannot alter room dimensions or numeric clearance.
- Stage state includes active assembly/component, phase, reveal progress, focused view and callouts.
  The UI and geometry consume this state together.
- Use continuous anticipation → reveal → settle → inspection phases. Stagger child components
  where it clarifies construction. Easing and timing are selected from evidence, not arbitrary bounce.
- Define assembled/exploded bounds and depth rules. Test crossing components throughout movement;
  use splits/masks where a single painter order cannot express the geometry.
- A study focus should make the active assembly occupy roughly 55–75% of the usable scene width.
  Treat that as a provisional design target, not a measured reference value.
- Keep labels outside active silhouettes and connect them to world anchors. Secondary readouts belong
  in the panel; no tiny in-scene text as the only source of an explanation.

## 8. Execution order and acceptance gates

1. **Reference evidence:** finish section 3; freeze observed/adapted/unknown matrix.
2. **Design freeze:** finalize seven storyboards, viewport composition, parts lists and data contracts.
3. **Visibility prototype:** build ceiling and furniture focus first. Review desktop/mobile screenshots
   showing assembled, mid-reveal and exploded views before expanding the rest of the model.
4. **Assemblies:** complete floor/wall sections, openings, ceiling supports, furniture internals and
   indoor-unit components with explicit attachments and demo provenance.
5. **Controller/UI:** synchronize sidebar/top/panels with scenes; add Study selection/scrubbing while
   preserving Guided mode, reset, preferences and deterministic seek.
6. **Integration:** complete coherent transitions and reassembly; retain measured geometry and useful
   clearance experimentation. Verify component selection remains accessible during all modes.
7. **QA:** numerical/state tests, actual browser interactions, desktop/mobile visual review and dense
   motion scans. Add visual acceptance checks for active-part visibility and meaningful movement;
   a zero-error console or a high part count cannot substitute for that review.
8. **Delivery:** rebuild HTML/ZIP, retain concise QA evidence, push the new feature branch and prepare
   a reviewable PR. Do not merge into `main` automatically; Pages publishes only reviewed `main`.

Specific acceptance: ceiling panels/supports/hangers can be individually studied; furniture reveal
shows structure rather than only a sliding box; layer thicknesses have readable callouts; active
chapter and component are unambiguous; mobile has a useful enlarged view; reset works during every
phase; repeated and shuffled seeks reproduce state; reduced motion presents the same explanations.
Record performance on the available browser, with no unsupported device/frame-rate guarantees.

## 9. Current checklist

- [x] Confirm merged main and preserve it on a new feature branch.
- [x] Identify the reference transport blocker using HTTP and Chromium.
- [x] Save the narrowly scoped reference-host network addition.
- [x] Install a versioned REA CLI with locked dependencies; verify compatible Node and CLI startup.
- [x] Inspect current source and existing rendered QA evidence; document specific shortcomings.
- [x] Draft the learning interface, assembly storyboard and acceptance gates.
- [ ] Complete fresh reference inspection once access is available.
- [ ] Finalize the reference-backed design and implement phases 3–8 above.

## 10. Baseline REA observation completed

`capture_browser_scenario` launched owned Chromium 154, clicked the first five chapter buttons,
waited for each action to settle, and captured the ceiling state of **our existing app**.
All 11 recorded steps (navigation plus five click/wait pairs) completed; the provider reports
`terminated-owned-process` cleanup and complete capture sections. Evidence:
`ev_6df4d8920c73b1623facdbf6b27e1324b6664105cb30e651d35edf2eaec3804c`.
The complete result and extracted screenshot are in `docs/revision-evidence/`.
The scenario used REA’s default reduced-motion setting, so it verifies settled-state visibility,
not normal animated transitions. Future motion scenarios must explicitly set
`environment.reduced_motion` to `no-preference` and capture reduced motion separately.
The screenshot was opened and inspected: the selected ceiling is a narrow band in the wide room
view, confirming the user's visibility complaint. This observation does not inspect the reference.

Reproduce tooling with `npm ci --prefix tooling/rea --ignore-scripts --no-audit --no-fund`;
use `tooling/rea/node_modules/.bin/rea capture-browser-scenario <scenario.json> --format json`.
The CLI is verified independently of MCP registration. Native engines are unnecessary for this work.
