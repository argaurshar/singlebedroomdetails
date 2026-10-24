import test from "node:test";
import assert from "node:assert/strict";
import {
  cabinetState,
  cabinetPose,
  cabinetSpec,
} from "../src/cabinet/model.mjs";
import { buildCabinet, cabinetParts } from "../src/cabinet/geometry.mjs";
test("cabinet physical dimensions, travel and rails have one source", () => {
  const top = cabinetParts.find((p) => p.name === "top.oak");
  assert.equal(top.w * 10, cabinetSpec.width);
  assert.equal(top.d * 10, cabinetSpec.depth);
  assert.equal((top.z + top.h) * 10, cabinetSpec.height);
  assert.equal(top.h * 10, cabinetSpec.top);
  assert.equal(
    cabinetParts.find((p) => p.name === "case.left").w * 10,
    cabinetSpec.caseThickness,
  );
  for (const e of [0, 160, 320]) {
    const m = cabinetState(14, e),
      p = cabinetPose(m);
    assert.equal(m.extension, e);
    assert.equal(m.clearance, 800 - e);
    assert.equal(p.drawer * 10, e);
    assert.equal(p.middle * 10, e / 2);
    assert.equal(p.bearingOuter, e / 40);
    assert.equal(p.bearingInner, e * 0.075);
  }
  for (const e of [-1, 321, NaN, Infinity])
    assert.throws(() => cabinetState(14, e));
  assert.throws(() => cabinetState(NaN));
});
test("seven-stage cabinet motion is continuous at every boundary", () => {
  for (const t of [5, 10, 15, 20, 25, 30]) {
    const a = cabinetState(t - 1e-6),
      b = cabinetState(t + 1e-6);
    for (const key of [
      "angle",
      "travel",
      "lift",
      "tilt",
      "join",
      "explode",
      "xray",
      "focus",
      "boxLift",
    ])
      assert.ok(Math.abs(a[key] - b[key]) < 1e-4, `${t}/${key}`);
  }
  const end = cabinetState(36);
  for (const k of [
    "travel",
    "lift",
    "tilt",
    "join",
    "explode",
    "xray",
    "focus",
    "boxLift",
  ])
    assert.equal(end[k], 0);
  assert.equal(end.angle % 360, 0);
});
test("cabinet seeks and presentation offsets are deterministic and bounded", () => {
  for (let t = 0; t <= 36; t += 0.05) {
    const m = cabinetState(t);
    assert.ok(m.extension >= 0 && m.extension <= 320);
    assert.equal(m.extension + m.clearance, 800);
    assert.ok(Object.values(m).every(Number.isFinite));
  }
  const times = [0, 28, 14, 5, 36, 3.44, 19.9];
  const snapshots = times.map((t) => cabinetState(t));
  times.forEach((t, i) => assert.deepEqual(cabinetState(t), snapshots[i]));
});
test("69 real solids pass strict turning build across all sampled story poses", () => {
  const out = buildCabinet();
  assert.equal(cabinetParts.length, 69);
  assert.equal(out.report.parts, 69);
  assert.ok(out.report.margins.every((m) => m.margin >= -0.08));
  const names = cabinetParts.map((p) => p.name);
  assert.equal(new Set(names).size, names.length);
  for (const name of [
    "top.oak",
    "drawer.bottom",
    "drawer.front",
    "handle.pull",
    "runner.1.fixed",
    "runner.1.middle",
    "runner.1.inner",
  ])
    assert.ok(names.includes(name));
});
