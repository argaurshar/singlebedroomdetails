# RDB phase checklist

Status: core implementation complete on `feat/room-anatomy`, 24 October 2026.
See `QA.md` for evidence and the external file-opening/hosting limitations.
The full handoff remains authoritative; the user has now confirmed its demonstration bedroom
and Requirements → Design → Build interpretation. Its earlier claims about skill persistence
belong to the previous research environment; this checkout has separate verified local installs.

## Preparation

- [x] Read all 16 sections of the handoff.
- [x] Confirm demonstration bedroom and RDB meaning from the user's request.
- [x] Install both pinned official skills locally with supporting files and licences.
- [x] Check development, browser interaction/capture and optional encoding tools.
- [x] Write persistent instructions, phase gates and setup limitations.
- [x] Receive explicit instruction to begin implementation.

## Requirements

### Phase 0 — Freeze evidence

- [x] Preserve the original handoff unchanged and record upstream pins.
- [x] Carry forward the reference behaviour matrix and requirement IDs R01–R13 into the design/test map.
- [x] Distinguish handoff observations from fresh live checks and proposed behaviour.
- [x] Record that the original article/video are not present here; obtain originals only if further
  frame-level comparisons require them. The handoff is available and sufficient to start design.
- Gate: evidence sources, scope and assumptions are explicit; no new reference QA is claimed.

### Phase 1 — Freeze the room

- [x] Select demonstration geometry: 3,600 × 4,800 × 3,000 mm clear room; 17.28 m²; 51.84 m³.
- [x] Select bed 1,600 × 2,000 mm at x=1,000–2,600, y=2,100–4,100.
- [x] Select wardrobe 2,400 × 600 × 2,400 mm at x=600–3,000, y=0–600.
- [x] Select drawer travel 0–450 mm; opposing-face gap 1,500 mm; service void 150 mm.
- [x] Define east-wall door dimensions, position, hinge axis and swing envelope.
- [x] Define north-wall window dimensions, sill and reveal.
- [x] Define floor/wall/ceiling layer thicknesses, fixture count, circuits and assumed input power.
- [x] Place side tables, curtain track, lamps and accessories; check collision envelopes.
- [x] Attach units and provenance to every input; label geometric clearance as non-certified.
- Gate: no geometry/mechanism ambiguity; every displayed quantity sourced or visibly a demo assumption.
  These remaining choices can be resolved during authorized design without asking about every detail.

## Design

### Phase 2 — Define contracts

- [x] Define specification, pure evaluation, scene, controller, timeline and packaging interfaces.
- [x] Freeze coordinate/pivot conventions, physical/display transforms, depth sorting and masking.
- [x] Map each R01–R13 requirement to a component and acceptance check (handoff section 12).
- [x] Define idle/running/completed/Explore states, interruption rules, Auto→Manual stable state,
  hidden-tab behaviour, input validation, storage failure and reduced-motion fallback.
- [x] Define desktop/mobile layouts, focused mechanism view, labels and material groups.
- [x] Define deterministic seek and offline packaging contracts; account for file-URL test limitation.
- Gate: every critical requirement has a design and test; no unresolved renderer or mechanism choice.

## Build

### Phase 3 — Model first (R06, R12)

- [x] Pure model and unit/input checks; area 17.28 m² and volume 51.84 m³.
- [x] At drawer extensions 0/225/450 mm, clearance is 1,500/1,275/1,050 mm.
- [x] Negative clearance produces visible interference; explosion leaves physical measures unchanged.
- [x] Verify layer sums and circuit power from declared inputs.
- Gate: invariants pass before room scene work.

### Phase 4 — Complete static room (R01, R02)

- [x] Shell, finishes, bed zone, wardrobe, door, window, lighting, ceiling, air unit and accessories.
- [x] Meaningful parts budget approximately 100–150; hierarchy, anchors and painter order recorded.
- [x] Initial/final room stills, assembly inventory, desktop and mobile visibility checks.
- Gate: recognisable furnished room with readable active faces.

### Phase 5 — One working mechanism (R05–R07, R10)

- [x] Drawer and runner motion uses actual continuous transforms and shared model values.
- [x] Clearance slider, collision warning, intersection display and Explore re-entry.
- [x] Inspect all tested positions and continuous motion; preserve context in detail view.
- Gate: geometry, animation and readouts agree end to end.

### Phase 6 — Full guided sequence (R03, R04, R05, R07, R08)

- [x] Open room, see layers, open drawer, lights, ceiling, air, reassembly.
- [x] Use intervals 0.9–4.5, 5.2–9.2, 9.9–15.9, 16.6–20.6, 21.3–25.3,
  26.0–30.6, 31.3–35.7 seconds and final hold to 36.0 seconds.
- [x] Manual initial mode, ordered enablement, running/completed states, preference persistence.
- [x] Reset during every stage; rapid clicks, mode switches, hidden-tab resume and Auto cycling.
- Gate: all transitions and interruptions reach defined states.

### Phase 7 — Presentation and access (R02, R04, R09, R12)

- [x] Cream/ink style, coloured material groups, swatches, shadows, anchored labels and clear chips.
- [x] Scene before controls on mobile, 44 px primary targets, normal scrolling and focused view.
- [x] Keyboard focus/native activation, accessible scene/control names, completion announcements.
- [x] Reduced motion has static explanations and no endless loop; storage failure retains usability.
- [x] Air is explicitly recirculation/schematic; light pools are illustrative, not lux predictions.
- Gate: readable at desktop/mobile and usable without pointer, colour or motion dependence.

### Phase 8 — Deterministic QA (R07–R12)

- [x] Implement and compare repeated, forward, backward and shuffled `window.seek(t)` states.
- [x] `?render` has no autonomous clock/randomness; test every stage boundary.
- [x] Capture start/mid/end of all stages and every reveal/occlusion transition on desktop/mobile.
- [x] Scrub movements longer than 1 s at intervals ≤0.1 s; review depths, pivots, polygons and labels.
- [x] Analyse scene-region and whole-figure differences over 361 samples (no video export), protect near-zero denominators,
  record every anomaly and resolution; retain contact sheets and enlarged stills.
- [x] Measure live headless Chromium performance; retain results. Actual tablet hardware target remains unverified.
- Gate: no unresolved functional, numerical or visual blocker; counts and outcomes recorded honestly.

### Phase 9 — Export and package (R11–R13)

- [x] Build standalone HTML with inline assets and no required network; include source, licences,
  source/assumption register, usage notes, QA report and representative stills.
- [ ] Verify offline operation and direct file opening in a browser permitting that route.
- [ ] If video requested: 2,160 frames at 60 fps, 1500 × 1320, 36.0 seconds;
  verify endpoint separately at 36.0 s, H.264/yuv420p/faststart metadata and actual counts.
- [ ] If audio requested: user-controlled mute; measure loudness/true peak if mastering targets used.
- Gate: delivered files open as promised; optional exports are either verified or clearly omitted/blocked.

### Phase 10 — Review and delivery

- [x] Prepare standalone app, source, QA evidence and delivery limitations for review.
- [x] GitHub Pages hosting selected by the user; test/build/deploy workflow prepared.
- [ ] Enable Pages with GitHub Actions, merge reviewed PR, and verify the live deployment.
- Gate: complete room, seven reliable actions, coherent drawer demonstration, provenance and QA evidence.

## Delivery limitations

- The app runs over local HTTP with no external asset requests. Managed Chromium blocks file URLs;
  direct offline file-opening acceptance remains unrun.
- GitHub API access is rejected by the proxy; a PR description and compare link are prepared.
- GitHub Pages workflow is ready. Repository activation and reviewed merge are pending; no live deployment is claimed.
- Original video/article frames are absent; the complete handoff is the reference evidence available here.
- No 60 fps video, audio export, physical-services simulation or tablet-hardware benchmark is claimed.
