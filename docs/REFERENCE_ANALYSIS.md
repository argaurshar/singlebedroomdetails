# Reference investigation — 24 October 2026

Target: https://visual-learning.app/vision-pro. Python HTTPS fetched the page with
certificate verification enabled (200, 159,864 bytes). SHA-256:
`62d08baee6ed4726408ebccf4bfb76a65f245298bd3ae4599742af9d98731c42`.
Its scene and controller are inline; no external scene assets were needed.
Chromium rejected the live site's certificate. No TLS bypass was used.
The downloaded artifact was served on loopback and executed in Chromium 154.
This establishes delivered-artifact behaviour, not a successful live-site browser visit.

REA CLI 6.7.0 evidence:
`ev_457096b92b71d73e7b6c07debd3d7e5cf381973de55ee7b8991565a7ba7ad739`.
All 23 scenario steps completed; owned browser terminated. Explicit normal motion,
1440 × 1000 viewport; each of seven chapters clicked, sampled after 1.8 and 6.3 seconds.
Raw capture and extracted screenshots remain in ignored `.test-artifacts/reference/`.

| Question | Evidence / observation | Bedroom design decision |
|---|---|---|
| How does the subject stay legible? | Runtime screenshots: large object inside compact card. Inline renderer fits part/effect/label bounds in three passes. | Large stage viewport; fitted detail views with a room locator. |
| How do parts separate? | Source `scene()`: eased stagger per layer, display translations independent of object dimensions. Apart screenshot confirms clearly separated front-to-back layers. | Staggered floor/wall, ceiling, carcass and unit assemblies; physical and display coordinates kept separate. |
| How does focus work? | Source dims context and redraws selected part with a rim; labels enter late after the parts settle. | Component selection, contrasting outline, muted context and anchored delayed labels. |
| What stays synchronized? | Runtime: selected chapter, instruction, part labels and hot live chips. | Active chapter, component list, inspector and numerical chips share one stage state. |
| What is the interaction rhythm? | Seven ordered actions, Manual/Auto, restart and material swatches. Source has 0.6-second gaps and 3.4–5-second actions. | Preserve the seven-stage / 36-second contract; add direct Study navigation, local scrub and replay. |
| What counts as realism here? | Runtime: dense constructed SVG solids, seams, connectors and layered shading, rather than a photograph. | Original architectural solids and joinery, full ceiling footprint, readable construction details. |

No reference source or artwork is incorporated into the bedroom. Its product facts
and component counts are not bedroom facts. The original MIT Anatomy toolkit remains
licensed and pinned. REA's native engines and MCP registration are unnecessary here.

## Frozen revision contract

Keep the approved room dimensions and all numerical model outputs. New construction
inputs are explicitly illustrative assumptions in `spec.study`. A focused view is a
magnified assembly from the same model, not a second room or a dimensional simulation.
Physical dimensions never include exploded presentation offsets. Ceiling coverage is
3600 × 4800 mm, six 1200 × 2400 mm panels; 150 mm nominal void remains unchanged.
The room retains its full furniture composition. Detail views reveal floor/wall layers,
wardrobe carcass and telescopic runner, lighting connections, ceiling build-up and the
indoor unit. Labels explain interfaces without asserting construction compliance.

Execution: model/parts → detailed geometry → synchronized controls → browser and
visual verification → standalone package → review branch. No automatic merge.
