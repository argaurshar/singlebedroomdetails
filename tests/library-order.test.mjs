import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { presets, motion, poseFor } from "../src/library/catalog.mjs";
import { compilePreset } from "../src/library/geometry.mjs";
import * as TA from "../.generated/anatomy/turn-audit.mjs";

for (const p of presets)
  test(`${p.id}: complete order scan has no swaps, forced ordering or cycles`, () => {
    const o = compilePreset(p.id, {}, { audit: true });
    const result = TA.orbit(o.T, o.R, o.P, {
      only: ["order"],
      random: 300,
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
          frame: 0.1,
        },
        {
          name: "assembly",
          at: (t) => poseFor(o.model, { ...motion(o.model, 0), apart: 1 }, { assembly: t }),
          from: 0,
          to: o.model.components.length,
          frame: 0.1,
        },
      ],
    });
    assert.equal(TA.orbitFailures(result), 0, TA.orbitReport(result));
  });

test("production audit retains upstream diagnostic logic and thresholds", async () => {
  const stripImports = (s) => s.replace(/^import .*;\n/gm, "")
    .replace("const jitterBucketRow = rasterBucketRows(jitter);\n\n", "")
    .replace("      const bucketRow = jitterBucketRow(row, w);\n", "")
    .replace("(bucketRow ? bucketRow[c] : Math.floor(jitter(c, row) * 8)) !== sub", "Math.floor(jitter(c, row) * 8) !== sub")
    .replace("step = 0.05, angularStep = step, crowd = []", "step = 0.05, crowd = []")
    .replace("{ step, angularStep, quick, result, say, families, frameOf }", "{ step, quick, result, say, families, frameOf }")
    .replace("{ step, angularStep, quick, result, say, families = [], frameOf = (f) => f.frame }", "{ step, quick, result, say, families = [], frameOf = (f) => f.frame }")
    .replace("const stepSize = quick ? angularStep * 10 : angularStep;", "const stepSize = quick ? step * 10 : step;")
    .replace('const scale = delta / (g.kind === "slide" ? step : angularStep);', "const scale = delta / step;");
  assert.equal(
    stripImports(await readFile(".generated/anatomy/turn-audit.mjs", "utf8")),
    stripImports(await readFile(".agents/skills/anatomy/kit/turn-audit.mjs", "utf8")),
  );
});
