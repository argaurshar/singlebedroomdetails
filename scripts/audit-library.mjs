import { mkdir, writeFile } from "node:fs/promises";
import * as A from "../.agents/skills/anatomy/kit/audit.mjs";
import * as TA from "../.generated/anatomy/turn-audit.mjs";
import { compilePreset } from "../src/library/geometry.mjs";
import { presets, motion, poseFor } from "../src/library/catalog.mjs";
const output = process.argv.find((a) => a.startsWith("--out="))?.slice(6) || ".test-artifacts/library";
await mkdir(output, { recursive: true });
const only = process.argv
  .find((a) => a.startsWith("--only="))
  ?.slice(7)
  .split(",");
const wanted = process.argv
  .find((a) => a.startsWith("--preset="))
  ?.split("=")[1];
for (const p of presets.filter((p) => !wanted || p.id === wanted)) {
  const o = compilePreset(p.id, {}, { audit: true });
  const audit = A.audit(o.R, o.P);
  console.log(p.id, A.report(audit));
  const orbit = TA.orbit(o.T, o.R, o.P, {
    log: (s) => console.log(p.id, s),
    only,
    random: 300,
    // Refine angular face emergence without relaxing the original slide limits.
    angularStep: 0.01,
    depthAngles: 12,
    depthEvents: 12,
    sweep: {
      at: (x) => ({ ...poseFor(o.model, motion(o.model, 0)), object: x }),
      from: 0,
      to: 360,
      frame: 3,
    },
    clips: [
      {
        name: "story",
        at: (t) => poseFor(o.model, motion(o.model, t)),
        from: 0,
        to: 36,
        // Display-rate sampling measures local motion of narrow, fast-moving
        // faces without saturating the unchanged raster halving criterion.
        frame: 1 / 60,
      },
      {
        name: "assembly",
        at: (t) =>
          poseFor(
            o.model,
            { ...motion(o.model, 0), apart: 1 },
            { assembly: t },
          ),
        from: 0,
        to: o.model.components.length,
        frame: 0.1,
      },
    ],
    quick: process.argv.includes("--quick"),
  });
  console.log(p.id, TA.orbitReport(orbit));
  await writeFile(
    `${output}/audit-${p.id}${only ? "-" + only.join("-") : ""}.json`,
    JSON.stringify(
      { audit, orbit },
      (k, v) => (typeof v === "function" ? undefined : v),
      2,
    ),
  );
  if (A.failures(audit) || TA.orbitFailures(orbit)) process.exitCode = 1;
}
