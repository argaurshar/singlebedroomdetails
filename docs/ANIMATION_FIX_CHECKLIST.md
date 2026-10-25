# Animation correctness follow-up

User authorized fixing all remaining library animation warnings before adding features.
Branch: `fix/library-animation-order`, based on merged library PR #3 (`85f86be`).
Preserve physical dimensions, presets, controls, exports and the original studies.

- [x] Read current instructions, handoff and previous evidence; confirm clean checkout and merged base.
- [x] Reproduce the 51 order-change warnings and identify their causes.
- [x] Correct production rendering/geometry; keep vendored diagnostics and thresholds unchanged.
- [x] Add meaningful regressions for the actual failures, including smooth camera motion.
- [ ] Run order, collision, depth and complete continuity checks on all seven presets.
- [x] Inspect desktop/mobile rendered motion around former warning angles and stage boundaries.
- [ ] Rebuild, record evidence, commit and push a reviewable branch. Do not merge or deploy.

Baseline: bedside 8, console 0, desk 5, coffee 4, bookcase 2, lamp 32, mirror 0 order warnings.
Prior full continuity audit was interrupted; it must not be counted as passed.


Checkpoint: 63 Node tests, 10 main browser groups and five targeted camera browser groups pass.
The final lamp continuity audit is clean (800 convergence checks). Six other full continuity
checks and the seven-preset depth/collision audit are running. They remain pending, not passed.
The fresh HTML and ZIP reproduce exactly after a clean install. Export validation passed.
