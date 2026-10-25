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


Checkpoint: 68 Node tests, 10 main browser groups and five targeted camera browser groups pass.
The final lamp continuity audit is clean (800 convergence checks). Six other full continuity
checks are running. All seven scoped ordering/collision/depth audits pass with zero warnings.
Full continuity remains pending, not passed. The exact raster cache passed both byte-level
regressions and complete lamp-report equivalence; remaining runs use that verified cache.
The fresh HTML and ZIP reproduce exactly after a clean install. Export validation passed.


Final sampling: 0.01° angular steps, original 0.05 linear normalization, 60 fps story.
Three regression tests establish default equivalence and unchanged slide-defect detection.
All seven full, unscoped audits are running to `.test-artifacts/animation-final/`; only those
completed reports will be counted as final full passes. The coarse desk findings and their
convergence evidence remain archived. The mirror's previous JSON write failed after a profiling
cleanup error and is being rerun without profiling. App HTML/ZIP hashes remain unchanged.
