import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import * as A from "../.agents/skills/anatomy/kit/audit.mjs";
import { turning } from "../.generated/anatomy/turn-build.mjs";
import { TURN } from "../.generated/anatomy/turn.mjs";
import * as audit from "../.generated/anatomy/turn-audit.mjs";

function fixture(kind) {
  const P = { origin: [10, 10], scale: 1, azimuth: 38, elevation: 26 };
  const R = A.recorder(P);
  const T = turning(P, { recorder: R });
  const group = T.group("motion", kind === "slide"
    ? { slide: { direction: [1, 0, 0], travel: 4 } }
    : { turn: { pivot: [0, 0] } });
  const layer = T.layer("sample");
  T.stack(["sample"]);
  const part = T.prism({
    name: "sample", group, layer,
    plan: { x: 0, y: 0, w: 1, d: 1 }, z: 0, h: 2, bevel: 0,
  });
  T.plane({ part, o: [0, 0, 2], u: [1, 0, 0], v: [0, 1, 0],
    svg: '<rect width="1" height="1"/>' });
  T.build({ fullClouds: true });
  return { T, R, P };
}

const options = {
  only: ["continuity"], random: 0, depthAngles: 0, depthEvents: 0,
  sweep: { at: (x) => ({ motion: x }), from: 0, to: 0, frame: 1 },
};

const withoutTime = (result) => {
  const copy = structuredClone(result);
  delete copy.stats.seconds;
  return copy;
};

async function upstreamAudit() {
  // Use upstream diagnostic code with the same production geometry/runtime.
  // This isolates the sampler change from the separate renderer fixes.
  const kit = ".agents/skills/anatomy/kit/";
  const original = await readFile(kit + "turn-audit.mjs", "utf8");
  const source = original.replace(/from "\.\/([^\"]+)"/g, (_, file) => {
    const directory = ["turn.mjs", "turn-build.mjs"].includes(file)
      ? ".generated/anatomy/" : kit;
    return `from "${pathToFileURL(process.cwd() + "/" + directory + file)}"`;
  });
  return import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
}

test("default angular sampling reproduces the upstream audit result", async () => {
  const { T, R, P } = fixture("turn");
  const upstream = await upstreamAudit();
  assert.deepEqual(
    withoutTime(audit.orbit(T, R, P, options)),
    withoutTime(upstream.orbit(T, R, P, options)),
  );
});

test("finer angular sampling adds poses without relaxing the angular limits", () => {
  const { T, R, P } = fixture("turn");
  const coarse = audit.orbit(T, R, P, options);
  const fine = audit.orbit(T, R, P, { ...options, angularStep: 0.01 });
  assert.equal(coarse.stats.continuity.measures, 7200);
  assert.equal(fine.stats.continuity.measures, 36000);
  assert.equal(audit.orbitFailures(fine), 0, audit.orbitReport(fine));
  assert.equal(fine.stats.continuity.halvingChecked, coarse.stats.continuity.halvingChecked);
});

test("finer angular sampling preserves slide states and detects the same opacity jump", (t) => {
  const { T, R, P } = fixture("slide");
  const emit = TURN.emit;
  t.mock.method(TURN, "emit", (run, cam, frame) => {
    emit(run, cam, frame);
    const plane = run.roles.findIndex((role) => role.type === "plane");
    if (plane >= 0) frame.o[plane] = cam.t[0] >= 2 ? 0.005 : 0;
  });
  const coarse = audit.orbit(T, R, P, options);
  const fine = audit.orbit(T, R, P, { ...options, angularStep: 0.01 });
  assert.deepEqual(withoutTime(fine), withoutTime(coarse));
  assert.equal(fine.stats.continuity.measures, 400);
  assert.ok(fine.continuity.some((failure) => failure.m.dot === 0.005),
    "A 0.005 opacity jump exceeds the unchanged 0.0021 slide allowance");
});
