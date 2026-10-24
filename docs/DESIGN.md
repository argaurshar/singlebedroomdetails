# Requirements → Design contracts

All dimensions are demo assumptions. Millimetres, x east, y north, z up; origin at south-west
finished floor. `src/spec.mjs` holds physical inputs and `src/model.mjs` derives all readouts.
The geometry consumes that result, including exact drawer travel and bed position. Exploded
presentation offsets never feed back into physical quantities. Negative clearance is retained.

East door: y=950–1800, width 850, height 2100, hinge at (3600,950), inward swing 0–90°.
North window: x=1050–2550, sill 1200, height 1200. Bed, wardrobe and room retain plan values.
The room is an architectural cutaway from the outset so a finished furnished room stays visible.
The selected ceiling panel is representative; most of the ceiling is omitted in the cutaway.
Side tables remain outside the drawer's x=1410–2190 clearance section. Moving the bed in Explore
also moves its headboard, bedding and tables; deliberate drawer interference is visible.
Floor: 15 mm oak + 5 mm underlay + 50 mm screed. Wall: 12 mm plaster + 150 mm substrate.
Ceiling service void 150 mm. Lighting: two 7 W downlights, two 4 W lamps, one 8 W strip, 30 W total.
All values are illustrative choices, not a measured project, compliance claim or services design.

Pure evaluation: `{time, explore, extension, bedGap}` → derived quantities and scene factors.
Each stage uses smoothstep over the exact handoff intervals. Final stage continuously returns every
factor to zero. Canonical inputs reconstruct state for any seek order. Scene geometry is in world
coordinates; Anatomy projects the solids. The drawer is an actual translating tray; runner members
translate at half and full travel. All travel comes from the model. Fixed floor/back walls paint
before contents; furniture and foreground cutaway assemblies have explicit assembly order.

Controller: Manual waits between stages; only the next action is enabled. Auto uses the same 36 s
timeline. Auto→Manual preserves the current completed stage or completes the running stage to its
stable endpoint. Reset cancels progress, resets geometry and readouts, retains mode and finish.
Explore pauses the tour, retains valid scenario inputs, and returns to canonical guided state.
Hidden tabs pause elapsed time. Reduced motion completes each stage instantly and disables looping.
Storage failures fall back safely. Focused native controls own Space/Enter; no global duplicate key
handler. Render mode never starts a clock. `window.seek(t)` stops playback and returns full model state.

Module ownership: spec → model → scene; controller combines model/scene and HTML controls;
build inlines modules and CSS. No runtime dependencies or required network assets. Tests use Node's
built-in runner and Python Playwright/system Chromium. R01–R13 map to the phase checklist and QA report.
