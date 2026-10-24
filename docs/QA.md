# Current revision evidence

See [REVISION_QA.md](REVISION_QA.md) for the architectural-study build. The results below describe
the original version and are retained as historical evidence; reference access and REA runtime
availability were subsequently resolved as documented in [REFERENCE_ANALYSIS.md](REFERENCE_ANALYSIS.md).

# Validation record

24 October 2026. The original handoff was read in full and preserved byte-for-byte. Tests below
exercise the actual standalone build in `dist`, not a static mockup. No public deployment, tablet
hardware benchmark, app video or audio export is claimed.

## Executed checks

| Check | Result and scope |
|---|---|
| `npm run build` | Produces identical HTML entry points and a ZIP; extraction/CRC checks and repeated-build SHA-256 equality pass; final packaged HTML browser smoke passes |
| `npm test` | 10 tests pass: units, area/volume/layers, three drawer positions, negative clearance, invalid inputs, continuous boundaries, power, transforms, order-independent seek, scene/readout agreement, canonical final reassembly |
| `npm run test:browser` | 14 acceptance groups pass; Chromium executes the real app |
| Browser stage coverage | Each of seven actions ran to completion in real time; reset was exercised during every action |
| Browser interactions | Native keyboard activation, repeated-click gating, Auto→Manual stable state, Auto restart, finish/reload preferences, Explore/return/reset, slider limits and interference |
| Accessibility behavior | Reduced-motion completion of all stages with no endless Auto; native focus and slider keys; storage-denied fallback; simulated hidden-document pause/resume |
| Determinism | Repeated, reversed and shuffled seeks compare actual scene markup; render mode stays frozen |
| Responsive capture | 42 screenshots: start/middle/end of all stages at 1440×1100 and 390×844; no horizontal document overflow |
| Dense motion | 361 states from 0 to 36 seconds at 0.1-second spacing, with screenshots and frame differences; zero depth-sort cycles or nonfinite geometry; invariant travel + clearance = 1,500 mm |
| Network | No required external requests during the app run |
| Browser errors | No uncaught JavaScript errors in acceptance suite |
| Skill setup | 171 files hashed; pinned source byte comparisons; upstream example build, CDP capture and Playwright interaction pass |
| Optional encoder prerequisite | A separate 1-second synthetic clip verified H.264, yuv420p and 60 frames; this is not an app video |

Browser measurements use system Chromium 154 and Python Playwright 1.62.0. JSON results and selected
screenshots are retained in `docs/qa/`. The larger dense image sequence lives in ignored
`.test-artifacts/` and can be reproduced with `python3 tests/visual.py` while the local server runs.

## Visual inspection and corrections

Actual desktop, mobile, interference, ceiling and air-stage screenshots were opened and inspected.
All seven stages' start/mid/end compositions were reviewed in contact sheets. The drawer/runner,
ceiling route and air unit received enlarged inspection. No claim is made that a contact sheet
alone proves every frame correct.

The first render exposed the mattress painting over the duvet. Geometry-based overlap ordering
replaced centre-only sorting. The final sorter uses separating physical planes for overlapping
convex silhouettes; fixed shell and cutaway strata remain explicit. All sampled ordering graphs
are acyclic. It is an application geometry check, not an upstream Anatomy audit certification.

A later review found the air label covering the fan. The label was relocated, and previous-stage
callouts fade away so the current mechanism stays visible. Lamp colour now interpolates instead
of changing at a threshold. Room width/length callouts accompany the opening stage. Mobile retains
textual explanations and offers a larger plan view in the clearance experiment.

The frame-difference heuristic compares scene-only and whole-figure regions with a nonzero baseline
floor. Seven whole-figure flags occur at 0.9, 5.2, 9.9, 16.6, 21.3, 26.0 and 31.3 seconds: the intended
stage heading and metric transitions. Adjacent captures were reviewed; these are not geometry jumps.
No scene-region anomaly exceeded the chosen 3× threshold. This heuristic is evidence, not a proof
of all possible visual correctness. The complete 2,160-frame export scan remains future video work.

## Performance

The initial full-SVG replacement approach measured about 21.5 fps in a live drawer-stage sample.
Keyed DOM updates now preserve static parts; cached overlap relationships avoid repeated static
geometry work. The subsequent 120-interval sample measured **58.1 fps average**, with a **16.7 ms
median frame interval**, at 1440×1100 in headless Chromium on this cloud runner. This is a bounded
measurement, not a guaranteed 60 fps claim across devices. Actual tablet hardware remains untested.
Run `python3 tests/performance.py` against the port-4173 server to repeat the sample.

## Requirement traceability

| ID | Implementation and evidence |
|---|---|
| R01 | 150 meaningful solids/parts in scene inventory; furnished initial/final screenshots |
| R02 | Pinned Anatomy SVG projection/solids, shaded original room, cream paper and coloured finishes; visual review against handoff descriptions |
| R03 | Seven timed actions; real-time completion and enablement tests |
| R04 | Manual default, explicit Auto persistence and blocked-storage tests |
| R05 | Moving drawer/runner, floor/wall section, ceiling reveal; selected stills |
| R06 | Pure `evaluate` drives scene/readouts; exact model/scene envelope tests |
| R07 | Smoothstep timing, pivot transforms, dense 0.1 s samples and anomaly review |
| R08 | Reset in every action, mode interruption, simulated hidden-tab resume, Auto loop |
| R09 | Desktop/mobile captures, native keyboard/focus, reduced-motion tests and textual state |
| R10 | 0/225/450 mm extension, gap limits, −250 mm interference, plan-view intersection, re-entry |
| R11 | `window.seek(t)` reconstructs scene; repeated/reversed/shuffled equality; render clock disabled |
| R12 | Spec and UI mark demo assumptions; physical measures independent of exploded offsets; no lux/flow/compliance inference |
| R13 | Inline standalone build; no external asset requests; direct file-opening acceptance blocked as below |
| R14 | Preparation stayed separate until the user explicitly authorized implementation |

## Limitations and blocked checks

- Managed Chromium returns `ERR_BLOCKED_BY_ADMINISTRATOR` for file URLs. Direct opening of the
  downloaded HTML in a permissive local browser remains unverified here. Local HTTP execution and
  absence of required external requests are verified independently.
- Live reference access returns proxy HTTP 403. The original article/video are not in this checkout;
  the full handoff is the available evidence. No fresh side-by-side live-reference comparison is claimed.
- `api.github.com` requests are proxy-blocked (HTTP 403), so PR creation is unavailable here. Git
  transport is separately verified; a feature branch and PR description are prepared.
- Native REA runtime/engines are not installed, needed or claimed. The skill and references are installed.
- No screen-reader hardware/session audit, tablet hardware benchmark or engineering simulation was run.
- Video/audio remain deferred. GitHub Pages hosting was subsequently authorized; workflow preparation
  is complete, while repository activation and live deployment verification remain pending.

## GitHub Pages hosting follow-up

The user selected GitHub-only hosting. Added `.github/workflows/pages.yml` and removed Vercel
configuration. Re-ran all 10 Node tests and the standalone build successfully. Parsed the workflow
YAML and checked its `main`-only deployment guards and job permissions. Served the build under
`/singlebedroomdetails/` in Chromium: HTTP 200, expected title, and `seek(15.9)` reporting 450 mm
extension / 1,050 mm clearance, with no page errors. These are local checks, not a claim that
GitHub Actions or the live Pages deployment has run. Repository Pages API access returned HTTP 403;
activation instructions are in `DEPLOYMENT.md`.
