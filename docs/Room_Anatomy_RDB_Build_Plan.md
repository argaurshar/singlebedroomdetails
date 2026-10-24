# Room Anatomy — complete-room build plan

Prepared 23 October 2026. Status: research and planning only; application implementation has not started.

## 1. The proposed app

Build an interactive, illustrated **complete bedroom** that opens up to explain its construction, furniture and services. It should feel like the supplied Vision Pro explainer: one recognisable object, sequential buttons, visible mechanisms, readable numbers and a concise explanation. The room is the object.

Recommended working title: **Room Anatomy — How a finished room fits together**.

The big idea: **A room works when its layers, furniture and services fit together.**

The central numerical demonstration is a wardrobe drawer opening into the space beside the bed. Its travel and the remaining clearance must come from the same geometry. This supplies a clear, testable cause-and-effect moment without pretending that an illustrated animation is a lighting or airflow simulation.

“Complete room” means a furnished room with an architectural shell, openings, finishes, ceiling, joinery, lighting and an illustrative service route. It does not mean a whole building, a full BIM authoring system or construction documentation. Every major room system is represented; only the selected mechanisms need detailed moving internals.

The user requested planning before code. The next implementation turn must begin from this document, resolve critical assumptions and obtain the user's instruction to start. No app, hosting deployment or video is claimed as completed here.

## 2. What the reference actually establishes

### Evidence and limitations

| Evidence | What was examined | What it supports |
| --- | --- | --- |
| Supplied video | 36.2 seconds, 30 fps, 1,086 frames; encoded size 666 × 512 despite the filename; chronological frame sheets and enlarged second-by-second frames | Visible layout, progression, transitions and seven-stage story |
| Supplied article | Full text provided in this conversation | Intended six-part figure pattern, visual style, model-first method, QA and recording workflow |
| Live Vision Pro page | Page layout, controls, first action, reset and colour control inspected | Current interface and initial interaction; not an exhaustive live-browser regression test |
| Public page HTML/JavaScript | Browser-delivered page downloaded and examined | SVG projection, sequential controller, persistence, reduced motion and deterministic capture functions |
| Official Anatomy repository | Pinned source and skill instructions | Toolkit, examples, construction and verification approach |
| Official REA repository | README and bundled skill instructions | Correct project identity, installation boundary and appropriate uses |

The article, uploaded clip and current live page are different snapshots. The uploaded clip is 36.2 seconds. The inspected live controller's durations and gaps total approximately 36.9 seconds. The proposed room tour deliberately targets exactly 36.0 seconds; that is a new specification, not a claim about every reference version.

**Plotly correction:** the supplied article does not establish Plotly as the renderer. The delivered Vision Pro page contains SVG and custom isometric projection code, with no Plotly occurrence found. Its footer credits the Anatomy iso kit. Use that implementation evidence to select the architecture.

This investigation does not recover private source history or prove the physical accuracy of all numbers in the reference. It identifies public behaviour and the delivered implementation. Reference product specifications are not inputs to the new room.

### Second-by-second visual reading

These are observations at whole-second samples, supported by the chronological frame review. They are not exact inferred click timestamps or a claim that every original frame passed an automated defect detector.

| Second | Visible event | Translation to the room |
| --- | --- | --- |
| 0 | Complete headset and first available button | Start with a recognisable furnished room |
| 1 | First step activates; cover starts separating | One button visibly starts one action |
| 2 | Cover lifts; interior board appears | Reveal shell or ceiling internals |
| 3 | Outer body becomes translucent | Ghost obstructing surfaces selectively |
| 4 | Chip and explanatory label become the focus | Highlight one working component |
| 5 | Second step activates | Maintain ordered progress |
| 6 | Cover returns | Reset geometry needed for the next explanation |
| 7 | Field-of-view cones become visible | Use a restrained explanatory overlay |
| 8–10 | Sensor-view explanation continues | Hold the result long enough to understand |
| 11–12 | Teardown begins and major layers separate | Explode room assemblies along clear axes |
| 13 | More layers become distinct | Preserve readable spacing and depth order |
| 14 | Expanded arrangement settles | Give the viewer a stable inspection moment |
| 15 | Component labels appear | Label selected parts after motion settles |
| 16 | Display-focused stage starts | Move from whole room to one mechanism |
| 17–19 | Assembly contracts and display is isolated | Keep context while isolating joinery |
| 20–21 | Small display detail is explained | Explain a dimension with an anchored inset |
| 22–23 | Eye-tracking stage begins; lenses turn | Rotate actual geometry about defined pivots |
| 24 | Lens modules and emitters are emphasised | Highlight the active mechanism only |
| 25 | Labels explain the revealed function | Couple words to the visible result |
| 26 | Air/sound stage begins | Introduce the room's service explanation |
| 27 | Parts transition back toward the assembly | Restore context before another system |
| 28 | Fans become visible | Show a real service component |
| 29 | Fans are emphasised above the shell | Avoid hiding the active component |
| 30 | Air paths enter and leave the object | Show schematic supply/return or recirculation |
| 31 | Final button activates | Reassemble with one final action |
| 32–35 | Explanatory overlays withdraw and parts return | Return all assemblies continuously |
| 36 | Completed object closes the tour | End in the same complete-room state |

### Feature-by-feature reconstruction

| Reference feature | Room requirement | Evidence type |
| --- | --- | --- |
| One object built from small solids | Detailed furnished room with real assemblies | Video and Anatomy source |
| Left-hand numbered steps | Seven named room actions | Video and live interface |
| Only next action enabled | Idle/running/completed controller; prevent double starts | Delivered JavaScript |
| Hint changes with action | One plain-language sentence per stage | Video and interface |
| Active step highlighted | Running, finished and next states visually distinct | Video and controller |
| Cutaway/transparency | Ceiling reveal, finish section, drawer mechanism | Video; adaptation proposed |
| Live chips | Area, selected layer thickness, drawer travel and clearance | Article; room quantities proposed |
| Manual/Auto | Manual first visit; remember explicit choice | Live page and controller |
| Start over | Cancel motion and restore canonical initial state | Interface and controller |
| Colour swatches | Recolour compatible finish groups | Interface and CSS-variable implementation |
| Keyboard controls | Space/Enter advance when appropriate; native controls retain their keys | Delivered JavaScript |
| Gallery arrows | Omit on a one-room launch; add only with multiple figures | Live site; deliberate scope decision |
| Reduced motion | Instant state changes with complete static explanations | Delivered JavaScript |
| Seekable recording | Deterministic scene at any timeline time | Delivered JavaScript |
| Sound words | Optional small “click”, “shhh” and “tok” tied to actions | Article |
| Actual audio | Optional export enhancement; never autoplay sound on entry | Article; room behaviour proposed |
| One big idea | Permanent footer sentence | Article and video |

## 3. Skills and installation record

The article names **one skill: Anatomy**. Node.js, Chrome, Python and ffmpeg are runtime/build tools, not additional skills. REA is a separate user-requested addition.

| Item | Verified upstream | Pinned revision | Use |
| --- | --- | --- | --- |
| Anatomy | https://github.com/wheresryan22/anatomy | `1482e8469b0a9e0d8cc18ea2740a01423d29ae80` | Isometric scene, model-driven behaviour, motion and visual QA |
| Reverse Engineer Anything | https://github.com/morluto/rea | `9fd78a74f84a8e924bd58e7deaf5934bfb24f53c` | Evidence discipline for shipped apps; advanced runtime analysis only if necessary |

REA's name is **Reverse Engineer Anything**, not “Reverse Engineering Architecture”. The official repository documents a 300,000-star milestone. This identifies the likely intended project; popularity is not evidence that it is required for this room app.

Both packages were imported from pinned upstream sources and passed skill validation. Anatomy's compatibility field was moved into metadata for the local skill schema, preserving its content. Upstream licence and provenance were retained. Generated example exports and repository administration files are not necessary to run the skill; example source, toolkit, scripts and references are retained.

**Persistence status: both skills saved successfully.** REA was pushed in commit `43335ee`; Anatomy was pushed in commit `cfcd2d1` after synchronising a remote update. Both passed local skill validation. They are saved for subsequent use; this does not mean the REA server or engines are running. The initial combined save failed; separate saves succeeded, so the installation is not being inferred from validation alone.

Installing REA's skill does not install/register the REA MCP server or its analysis engines. No REA runtime execution is claimed. Its current runtime prerequisites also need a separate compatibility check before activation. The available public source is sufficient for the present analysis, and REA's own instructions say to use ordinary repository tools for that case.

Apply the article's requested presentation when it differs from generic Anatomy defaults: Manual initially, cream paper, coloured objects, selective useful labels and a full-room subject. Do not substitute unattended motion or a monochrome machine merely because a generic example uses it.

## 4. RDB and the confidence gate

For this document, **RDB provisionally means Requirements → Design → Build**. The clarification prompt received no answer. If the user intended a named framework, remap the work packages before implementation; do not silently claim that this interpretation is confirmed.

“More than 95% sure” cannot honestly be reported as a measured probability. Use a concrete readiness gate instead:

1. Every critical requirement has an explicit design decision and an acceptance check.
2. No unresolved assumption can change the chosen room, renderer or main mechanism.
3. Every displayed physical quantity has a source or is visibly identified as a demonstration assumption.
4. Rendering, standalone delivery and validation capabilities are confirmed before depending on them.
5. Any remaining uncertainty concerns reversible presentation choices, not project geometry or physical claims.

The **planning** work can be completed using explicit defaults. The **implementation** gate remains closed while the user has instructed “do not code”. A real-project room also requires its actual geometry. The future app cannot be declared verified before it exists and passes the checks below.

## 5. Requirements: complete room, controlled scope

### Recommended demonstration brief

Use a warm contemporary bedroom: cream plaster, light oak joinery, sage upholstery, muted terracotta accents and dark bronze hardware. Retain the hand-inked character of the reference. The first screen should look like an inhabited room, not an empty CAD box.

The following are **proposed demonstration values**, not measured values, construction advice or user-approved project dimensions:

| Parameter | Proposed value | Notes |
| --- | --- | --- |
| Clear internal room width | 3,600 mm | Finished-face reference |
| Clear internal room length | 4,800 mm | Finished-face reference |
| Finished ceiling height | 3,000 mm | Defines displayed room volume |
| Floor area | 17.28 m² | Derived from clear dimensions |
| Internal volume | 51.84 m³ | Geometric volume; not HVAC sizing |
| Bed | 1,600 × 2,000 mm | Demo furniture footprint |
| Wardrobe | 2,400 × 600 × 2,400 mm | Demo carcass envelope |
| Drawer travel | 0–450 mm | Adjustable within model constraints |
| Nominal ceiling service void | 150 mm | Above the stated finished ceiling |

Use world coordinates in millimetres: x across width, y along length, z upward. Origin is the south-west finished floor corner. Put the wardrobe against the south wall, x = 600–3,000 and y = 0–600. Put the bed at x = 1,000–2,600 and y = 2,100–4,100. The wardrobe-to-bed gap is therefore 1,500 mm; a drawer extended by 450 mm leaves 1,050 mm in this defined section. Call this **remaining geometric clearance**, not a certified compliant aisle.

Locate the room door on the east wall toward the south and a window on the north wall. Freeze exact opening dimensions and swing envelopes during requirements. Position side tables, curtains and accessories only after collision checks. Their final footprints must not silently invalidate the highlighted clearance section.

If the user selects an actual room, replace this entire geometric brief with the supplied plan and elevations. Do not borrow dimensions from another project or infer invisible construction from a photograph.

### Included content

| Assembly | Visible content | Inspectable behaviour |
| --- | --- | --- |
| Shell | Floor, walls, openings, skirting | Two foreground walls ghost or lower for visibility |
| Finishes | Floor finish, underlayer, wall finish and substrate | Small sectional slice separates; dimensions remain attached |
| Bed zone | Frame, legs, mattress, duvet, pillows, headboard, rug, side tables | Context retained throughout; no unnecessary furniture explosions |
| Wardrobe | Carcass, panels, shelves, hanging rail, handles, drawer and runners | Drawer opens; one runner section reveals telescoping action |
| Window | Frame, glazing, reveal, curtains and track | Identifiable assembly; optional curtain movement |
| Door | Leaf, frame, hinge axis, handle | Swing envelope available for inspection |
| Lighting | Ceiling fixtures, bedside lamps, concealed strip and switches | Selected circuit activates connected fixtures |
| Ceiling | Finish panel, framing/suspension, service void | Panel lifts to reveal the selected route |
| Air system | Illustrative indoor unit, intake and outlet | Recirculating air shown schematically; not labelled outdoor ventilation |
| Accessories | Art, books, plant and small objects | Enough detail to make the room recognisable |

Aim for approximately 100–150 meaningful solids, adapting after readability and performance checks. This is a modelling budget, not a quota; individual fasteners should earn their place in the explanation.

### Explicitly later

Free camera orbit, photorealistic path tracing, Blender/BIM import, arbitrary room drawing, a whole-home gallery, live generative redesign, material shopping, prices, code-compliance advice, energy analysis and real CFD/lux prediction are later scope. A standalone explainer needs no runtime ChatGPT API key or server-side AI call.

## 6. Design: layout and rendering

Use Anatomy-style **SVG with real object-space geometry and isometric projection**, plus HTML controls and CSS. This is the closest evidenced match to the reference. Do not introduce Plotly. Three.js/WebGL becomes an option only if the user later needs unrestricted orbit, complex imported meshes or effects SVG cannot reasonably support.

Develop separate data, model, scene and controller modules; package them into one standalone HTML deliverable. This combines maintainable source with the article's single-file output. Inline required assets; avoid runtime CDN dependencies.

Desktop layout: a compact title and mode control above the left step column; room scene on the right; one changing hint above the scene; selected live chips immediately below; big-idea sentence and finish swatches at the bottom. Keep secondary specifications in a collapsible detail panel.

At tablet/mobile widths, place the scene before the stacked step controls and allow normal page scrolling. Preserve a readable scene rather than shrinking every label to fit. Provide a focused mechanism view when the whole room would make details too small.

Visual specification:

- Cream paper background `#f5f0e5`, dark navy outlines and restrained flat fills.
- Light top faces, mid side faces and darker opposing faces; avoid a uniform flat silhouette.
- Short warm-grey shadows `#ddd4c3`; stable shadow direction across objects.
- Approximately 1.2 px outlines at the intended reference scale; tune after actual display checks.
- Compact architectural dimension text, large readable step labels and at least 44 px primary touch targets.
- Finish swatches affect named material groups, not every object indiscriminately.
- Active labels never sit behind geometry; one or two labels per active mechanism are preferable to covering the room.
- Decorative textures must not change the measured silhouettes or obscure the moving parts.

### Geometric discipline

Every part has an ID, parent assembly, physical dimensions, local transform, material and visibility rule. Moving parts also have a pivot/axis and allowed motion range. Compute world coordinates, then projection and depth ordering. Do not fake a long rotation by swapping a handful of pre-drawn poses.

Represent physical dimensions separately from exploded-display offsets. Pulling a wall slice outward to explain it must not increase the floor area or room volume. Selection callouts attach to projected world anchors and are positioned to avoid collisions.

Define painter's order explicitly for crossing or interpenetrating geometry. Split shapes or use carefully scoped masks when depth sorting alone is insufficient. A large transparent wall must not wash out the active mechanism.

## 7. One model for geometry and numbers

The core is a pure evaluation of **room specification + scenario settings + timeline position → derived measurements and scene state**. Renderers and readouts consume that same result. No widget stores its own competing dimension calculation.

| Data group | Required fields |
| --- | --- |
| Room | Clear dimensions, coordinate convention, finished levels and opening geometry |
| Assemblies | IDs, parents, layer order, dimensions, material and attachment relationship |
| Mechanisms | Travel range, pivot, selected extension and collision envelope |
| Lighting | Fixture count, circuit, assumed or manufacturer-rated input power |
| Provenance | Source type, source reference, units, assumption note and confidence limitation |
| Presentation | Stage, progress, focus assembly, explosion offsets, labels and palette |

Provenance types: user measured, drawing supplied, manufacturer specified, demonstration assumption, or derived. Display assumptions near the relevant detail, with a compact “Demo dimensions” marker on the overall figure.

Required calculations:

- Floor area = clear width × clear length, converted from mm² to m².
- Geometric volume = clear floor area × finished height, converted to m³.
- Layer thickness = sum of the selected physical layer thicknesses.
- Drawer extension = travel limit × continuous opening fraction.
- Remaining clearance = defined opposing-face gap − drawer extension; preserve signed values for collision warnings rather than hiding negative results.
- Connected lighting power = sum of rated input power of active fixtures; show only when fixture assumptions or specifications exist.

If using demo lighting values, label them as such. Do not infer lux, brightness, thermal comfort, ventilation rate, air changes, cooling load, cost or compliance from an aesthetic animation. Light pools and moving air traces are illustrative unless a separate validated model is introduced.

The “let them break it” control adjusts drawer extension and optionally bed distance within a defined demonstration range. Recompute clearance immediately. Warn on interference and show the intersection; do not silently move furniture to make the numbers look acceptable. Other room measurements stay unchanged unless the user actually edits their inputs.

## 8. Guided story and exact 36-second export plan

Manual mode waits for a press before every stage. Export/Auto mode uses the following sequence. Initial synthetic click is at 0.9 s; gaps between actions are 0.7 s. The final hold is 0.3 s. The timeline totals 36.0 s.

| Stage | Action interval | Duration | Button | Hint and visible result |
| --- | --- | --- | --- | --- |
| 1 | 0.9–4.5 s | 3.6 s | Open the room | “Move the front walls so we can look inside.” Foreground occluders withdraw; room dimensions appear. |
| 2 | 5.2–9.2 s | 4.0 s | See the layers | “The finished surface sits on other layers.” A local wall/floor section separates; physical thicknesses are shown. |
| 3 | 9.9–15.9 s | 6.0 s | Open the drawer | “The drawer needs space in front of it.” Runners extend; travel rises and remaining clearance falls together. This is the slowest and clearest moment. |
| 4 | 16.6–20.6 s | 4.0 s | Turn on the lights | “This switch controls these lights.” The chosen switch activates its connected fixtures and rated-power total. |
| 5 | 21.3–25.3 s | 4.0 s | Lift the ceiling | “The ceiling hides the service route.” A panel and framing reveal the selected cable route and void. |
| 6 | 26.0–30.6 s | 4.6 s | Follow the air | “The unit takes room air in and sends it back out.” Show intake, fan and outlet with a clear schematic label. |
| 7 | 31.3–35.7 s | 4.4 s | Put it together | “All the parts fit back into one room.” Clear overlays; restore parts in a physically understandable order. |
| End | 35.7–36.0 s | 0.3 s | — | Hold the finished room. |

The opening 0.9 seconds establishes the complete room. Draw the recording cursor approaching each button before its scheduled press. Synthetic cursor timing must not become a second source of animation state.

Exploding architecture is an explanatory transformation, not a real-duration construction process. Label it “illustrative motion” if timing could mislead. Show a playback multiplier only when a meaningful physical duration exists and is recorded in the model; do not invent a construction speed multiplier to imitate the espresso video.

## 9. Interaction state and accessibility

| Situation | Required result |
| --- | --- |
| First visit | Manual selected; no unsolicited motion; first button available |
| Start an action | Disable other action buttons; show running state and current hint |
| Finish an action | Mark it complete; enable only the next step |
| Finish final action in Manual | Show completed room and a clear replay/reset action |
| Finish final action in Auto | Hold, reset deterministically, then begin another cycle |
| Switch to Manual during Auto | Stop continuous playback at a documented stable stage state; no orphan animation |
| Start over during any action | Cancel the active run, reset geometry/readouts/step state, retain explicit mode and finish preferences |
| Change finish | Recolour allowed materials without altering geometry or progression |
| Edit experimental slider | Pause the tour, enter Explore state and recompute the same model |
| Return from Explore | Restart the guided sequence from its canonical state using retained valid inputs |
| Reload | Restore mode and optional finish choice; do not restore an unstable half-finished animation |
| Storage unavailable | Fall back to Manual/default palette; the app still works |
| Reduced motion enabled | Show completed states immediately with textual explanations; disable endless animated looping |
| Keyboard | Tab and visible focus work; Space/Enter activate focused native controls; page-level shortcuts never double-trigger |

Provide accessible names for the SVG scene and every control. Explain the important state in text outside the drawing. Announce stage completion, not every animation-frame number. Do not rely on colour alone for completed/running/disabled states. Optional audio starts muted and requires a user action.

## 10. Build phases and acceptance gates

These are future work packages, not a claim that app development has occurred.

| Phase | RDB | Work and outputs | Exit gate |
| --- | --- | --- | --- |
| 0. Freeze evidence | Requirements | Record source versions, behaviour matrix, assumptions and scope | Reference observations separated from proposed behaviour |
| 1. Freeze the room | Requirements | Confirm demo versus real room; settle openings, assemblies, primary mechanism and data provenance | No critical dimension or mechanism ambiguity |
| 2. Define contracts | Design | Room schema, coordinate conventions, stage/state table, pure model interface, error handling | Every requirement maps to a design component and test |
| 3. Model first | Build | Implement dimensions, layer totals, drawer travel, clearance and fixture totals | Derived values and invariants pass before scene work |
| 4. Complete static room | Build | Build shell, furniture, openings, finishes and fixtures with defined hierarchy | Recognisable complete room at desktop and mobile; no hidden active faces |
| 5. One working mechanism | Build | Finish drawer/runners and clearance demonstration end to end | Geometry, animation and numbers agree at all tested positions |
| 6. Full guided sequence | Build | Add seven stages, continuous transitions, state gating, reset and Auto | Every transition and interruption reaches a defined state |
| 7. Presentation and access | Build | Refine ink style, responsive composition, labels, swatches, keyboard and reduced motion | Readable controls and scene; no blocked keyboard path |
| 8. Deterministic QA | Build | Add seek/render mode; inspect every stage and run complete frame/motion checks | No unresolved functional, numerical or visual blocker |
| 9. Export and package | Build | Standalone HTML, maintainable source, QA evidence; 36-second video if requested | Offline app opens; capture metadata and output counts verified |
| 10. Review and delivery | Build | Present app preview and findings; create private hosted version if requested in build scope | Working reviewable app; public/domain publication only under actual authorization |

Dependencies: do not detail the whole room before the data and projection contracts are settled. Do not parallelise tightly coupled controller/model work. After the first mechanism passes, independent assemblies can be delegated only when explicitly requested, with separate files and one integration owner. The article's many-machine parallel workflow is not necessary for one room.

### Proposed future source responsibilities

| Component | Responsibility |
| --- | --- |
| Room specification | All physical inputs, assembly definitions and provenance |
| Pure model | Derived quantities, constraints and scenario evaluation |
| Timeline | Stage timings, continuous progress and deterministic seek |
| Geometry/scene | Parts, attachment relationships, projection and painter order |
| UI controller | Events, mode, reset, controls, accessibility and preferences |
| Packaging | Inline the required runtime into one offline HTML file |
| QA/capture | Numerical checks, screenshots, frame analysis and optional video/audio |

Source filenames can be chosen during implementation. Keep module boundaries stable; avoid one unmaintainable script merely to produce a one-file distribution.

## 11. Test and visual-review specification

### Numerical and behavioural checks

Verify the demo floor area is 17.28 m² and volume is 51.84 m³. At 0, 225 and 450 mm drawer extension, the defined clearance section must read 1,500, 1,275 and 1,050 mm. Test an intentional interference case and verify the negative clearance/warning. These checks validate the geometric model, not regulatory acceptability.

Also test invalid inputs, unit conversions, nested transforms, every stage boundary, rapid repeated clicks, reset during each stage, mode changes during motion, hidden-tab resume, preference-storage failure and reduced-motion operation. Confirm an exploded display does not change physical measurements.

### Visual inspection

Capture the start, middle and end of all seven stages, plus every reveal/occlusion transition. Inspect labels, active geometry, layer spacing, connected routes, furniture intersections, shadows, numerical chips and final reassembly. Use both desktop and narrow-screen compositions.

Scrub every movement longer than one second at intervals no larger than 0.1 s. For final export, inspect consecutive frame differences across the full frame sequence. The article's “three times neighbouring change” is an anomaly heuristic, not a proof of smoothness: guard against near-zero denominators and distinguish intended text/control changes from geometric jumps. Analyse the scene region separately from the cursor/UI, and retain an unmasked pass to catch interface defects. Record every flagged frame, the cause and its resolution.

Continuous motion must use continuous interpolation and correct pivots. Stable depth order, bounded geometry and no suddenly enormous polygons are mandatory. Record contact sheets and selected enlarged stills alongside the QA report; do not present a contact sheet alone as an exhaustive pass.

### Determinism and recording

`window.seek(t)` must reconstruct the full state from canonical inputs, even when frames are requested out of order. `?render` disables the autonomous clock. Repeating a seek to the same time must produce the same geometry and numbers. Compare forward, backward and shuffled seek requests. Seed or remove randomness; use no wall-clock-dependent effects in capture mode.

If video is included: 36.0 s × 60 fps = **2,160 frames**, sampled from t = 0 through t = 35.9833… s. Verify the endpoint separately at 36.0 s. Target 1500 × 1320 as requested by the article, with H.264, yuv420p and faststart. Use a contact sheet at 3-second intervals plus the final endpoint. Verify actual file duration, dimensions and frame count; do not promise the source video's file size.

This environment requires supported browser-control routes. Confirm that deterministic frame capture is available through the permitted workflow before committing to a full render. If capture tooling is unavailable, deliver the verified app and explicitly identify the video as blocked rather than pretending a recording was produced.

Optional sound design follows visual lock: generated clicks, a drawer slide and a quiet fan bed, with a user-controlled mute. The article's music specification can be retained for an optional export: 84 BPM, original synthesis, target −14 LUFS and true peak below −1 dB. Verify these with measurements; do not claim mastering from a target setting alone.

### Proposed performance targets

Aim for fluid 60 fps desktop interaction and usable 30 fps tablet interaction on recorded test hardware. Measure before claiming either. Profile the most complex exploded view and moving mechanism. Prefer reducing invisible detail and unnecessary recomputation before weakening the explanatory motion. The recorded 60 fps video is separate from live-device performance.

## 12. Requirement-to-test traceability

| ID | Requirement | Phase | Required evidence |
| --- | --- | --- | --- |
| R01 | One complete furnished room | 4 | Initial and final room stills; assembly inventory |
| R02 | Reference-style illustrated isometric scene | 4, 7 | Side-by-side visual critique against the supplied reference |
| R03 | Seven ordered actions | 6 | Full run and disabled-button tests |
| R04 | Manual default and remembered Auto | 6, 7 | Fresh-session, reload and storage-failure tests |
| R05 | Visible mechanism and cutaway | 5, 6 | Drawer/runners, section and ceiling stills |
| R06 | All numbers driven by one model | 3, 5 | Numerical invariants and scene/readout comparisons |
| R07 | Continuous motion | 5, 6, 8 | Dense frame scan, anomaly review and pivot inspection |
| R08 | Reset and interruptions are reliable | 6, 8 | Reset/mode tests at every stage |
| R09 | Responsive and accessible controls | 7 | Mobile, keyboard, focus and reduced-motion checks |
| R10 | Safe exploration of clearance | 5, 8 | Slider boundaries, interference warning and tour re-entry |
| R11 | Deterministic export support | 8 | Repeated and shuffled seek comparisons |
| R12 | Honest assumptions and physical claims | 1–9 | Provenance audit and explanatory copy review |
| R13 | Standalone distribution | 9 | Offline open with no required network requests |
| R14 | No app coding during this planning request | Current turn | Deliver only research, skill setup and this plan |

## 13. Risks and decisions

| Risk | Design response | Revisit when |
| --- | --- | --- |
| Whole room becomes visually crowded | One active mechanism; local detail view; restrained labels | Mobile review or mechanism obscured |
| Large SVG becomes slow | Part budget, cached static geometry, profile active groups | Measured performance misses target |
| Wrong face drawn in front | Explicit depth rules and geometry splits | Crossing geometry fails frame review |
| App numbers look more authoritative than the inputs | Visible demo marker and source records | Real project/manufacturer data arrives |
| Decorative air/light looks like engineering simulation | Explicit schematic wording; no unsupported units | A validated simulation is requested |
| Standalone and hosted versions diverge | Generate both from the same source and model | Packaging regression |
| REA installation mistaken for runtime availability | Separate skill, server and engine status | Binary/runtime investigation becomes necessary |
| Exact copying obscures architectural purpose | Preserve interaction pattern; design original room assemblies and text | Review says it looks like a headset reskin |

## 14. Future deliverables and completion criteria

Core delivery: a working complete-room app, its standalone HTML, maintainable source, short usage notes, source/assumption register and QA report with representative stills. A private web preview can accompany it through the available site workflow. Public hosting, a custom domain and the article's multi-figure gallery are separate decisions, not prerequisites for a one-room app.

The 36-second video and original audio are optional export deliverables after the app passes. A preview/share image can be generated from a verified scene frame; use absolute hosted image URLs only when a hosted page actually exists.

Complete means the room remains recognisable, all seven actions work, the key mechanism visibly proves its numeric relationship, every quantity has provenance, controls survive interruptions, motion passes review and the deliverable opens as promised. “Looks similar” alone is not completion.

## 15. Open decisions before implementation

1. **Room basis:** recommended demonstration bedroom, or an actual room plan supplied by the user? This is the most consequential remaining question.
2. **RDB meaning:** retain Requirements → Design → Build unless the user names another framework.
3. **Delivery depth:** core app first; video/audio after the interactive version is accepted unless explicitly included in the next build instruction.

No need to ask about every colour, furniture accessory or code filename. Those are reversible choices covered by the recommended defaults.

## 16. Sources

- User-supplied article and video in this conversation; article claims not independently verified are treated as the requested workflow, not established product facts.
- Live reference: https://visual-learning.app/vision-pro — inspected 23 October 2026.
- Anatomy upstream: https://github.com/wheresryan22/anatomy
- Pinned Anatomy skill: https://github.com/wheresryan22/anatomy/blob/1482e8469b0a9e0d8cc18ea2740a01423d29ae80/SKILL.md
- REA upstream: https://github.com/morluto/rea
- Pinned REA skill: https://github.com/morluto/rea/blob/9fd78a74f84a8e924bd58e7deaf5934bfb24f53c/.agents/skills/reverse-engineer-anything/SKILL.md

Upstream licences must accompany reused code in the future app. Attribution to the toolkit is distinct from claiming ownership of the reference application's artwork or branding.
