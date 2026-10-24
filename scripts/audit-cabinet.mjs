import { writeFile, mkdir } from "node:fs/promises";
import * as A from "../.agents/skills/anatomy/kit/audit.mjs";
import * as TA from "../.agents/skills/anatomy/kit/turn-audit.mjs";
import { buildCabinet, CR, CP, CT } from "../src/cabinet/geometry.mjs";
import { cabinetPose, cabinetState } from "../src/cabinet/model.mjs";
buildCabinet();
const audit = A.audit(CR, CP);
console.log(A.report(audit));
const options = {
  log: console.log,
  random: 300,
  depthAngles: 12,
  depthEvents: 12,
  sweep: {
    at: (x) => ({ ...cabinetPose(cabinetState(0)), cabinet: x }),
    from: 0,
    to: 360,
    frame: 3,
  },
  clips: [
    {
      name: "story",
      at: (t) => cabinetPose(cabinetState(t)),
      from: 0,
      to: 36,
      frame: 0.1,
    },
  ],
  quick: process.argv.includes("--quick"),
};
const orbit = TA.orbit(CT, CR, CP, options);
console.log(TA.orbitReport(orbit));
await mkdir(".test-artifacts/cabinet", { recursive: true });
await writeFile(
  ".test-artifacts/cabinet/audit.json",
  JSON.stringify(
    { audit, orbit },
    (k, v) => (typeof v === "function" ? undefined : v),
    2,
  ),
);
if (A.failures(audit) || TA.orbitFailures(orbit)) process.exitCode = 1;
