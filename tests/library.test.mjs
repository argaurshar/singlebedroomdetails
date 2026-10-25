import { test } from "node:test";
import assert from "node:assert/strict";
import {
  presets,
  defaults,
  validate,
  motion,
  poseFor,
} from "../src/library/catalog.mjs";
import { createModel } from "../src/library/model.mjs";
import { compilePreset } from "../src/library/geometry.mjs";
import { drawing, scheduleCSV } from "../src/library/drawings.mjs";
import * as A from "../.agents/skills/anatomy/kit/audit.mjs";
import { TURN } from "../.generated/anatomy/turn.mjs";
const keys = ["width", "depth", "height", "thickness"];
for (const p of presets) {
  test(`${p.id}: physical contract at every parameter corner`, () => {
    for (let mask = 0; mask < 16; mask++) {
      const cfg = Object.fromEntries(
        keys.map((k, i) => [k, p.limits[i][(mask >> i) & 1]]),
      );
      const m = createModel(p.id, cfg);
      assert.equal(new Set(m.parts.map((p) => p.id)).size, m.parts.length);
      for (const part of m.parts) {
        assert.ok(m.components.some((c) => c.id === part.group));
        for (const k of ["x", "y", "z", "w", "d", "h"])
          assert.ok(Number.isFinite(part[k]), `${part.id}:${k}`);
        assert.ok(Math.min(part.w, part.d, part.h) > 0);
        assert.ok(part.z >= 0);
        assert.ok(part.z + part.h <= m.config.height + 1.3, part.id);
        assert.ok(part.x >= -m.config.width / 2 - 1.3, part.id);
        assert.ok(part.x + part.w <= m.config.width / 2 + 1.3, part.id);
        assert.ok(part.y >= -m.config.depth / 2 - 1.3, part.id);
        assert.ok(part.y + part.d <= m.config.depth / 2 + 1.3, part.id);
      }
      const built = compilePreset(p.id, cfg);
      assert.equal(built.model.parts.length, m.parts.length);
    }
  });
  test(`${p.id}: rest contacts and sampled motion/depth`, () => {
    const o = compilePreset(p.id, {}, { audit: true });
    const a = A.audit(o.R, o.P);
    assert.equal(A.failures(a), 0, A.report(a));
    const scene = TURN.prepare(o.data, { unit: 1 }),
      frames = scene.runs.map((r) => TURN.frame(r));
    let previous = null;
    for (let i = 0; i <= 360; i++) {
      const s = motion(o.model, i / 10),
        cams = TURN.cams(scene, poseFor(o.model, s));
      scene.runs.forEach((r) =>
        TURN.emit(
          r,
          r.group >= 0 ? cams[r.group] : cams.world,
          frames[r.index],
        ),
      );
      const stats = {};
      previous = TURN.order(
        scene.layers[0],
        frames,
        cams,
        previous,
        stats,
        scene,
      );
      assert.equal(stats.forced || 0, 0, `forced at ${i / 10}`);
      assert.equal(stats.unseparated || 0, 0, `unseparated at ${i / 10}`);
      assert.equal(s.clearance, o.model.config.gap - s.travel);
    }
  });
  test(`${p.id}: continuous chapter boundaries, drawings and portable schedule`, () => {
    const m = createModel(p.id);
    const flatten = (x) =>
      typeof x === "number" ? [x] : Object.values(x).flatMap(flatten);
    for (const t of [5, 10, 15, 20, 25, 30]) {
      const a = flatten(poseFor(m, motion(m, t - 1e-5))),
        b = flatten(poseFor(m, motion(m, t + 1e-5)));
      assert.equal(a.length, b.length);
      assert.ok(
        Math.max(...a.map((v, i) => Math.abs(v - b[i]))) < 0.002,
        `jump at ${t}`,
      );
    }
    for (const view of ["front", "side", "plan", "section"]) {
      const svg = drawing(m, view);
      assert.ok(svg.includes("ASSEMBLED"));
      assert.ok(!/NaN|undefined/.test(svg));
      assert.ok(svg.includes("mm"));
    }
    assert.equal(scheduleCSV(m).split("\r\n").length, m.parts.length + 1);
    for (const material of ["timber", "ply", "mdf"])
      assert.deepEqual(createModel(p.id, { material }).parts, m.parts);
    assert.equal(motion(m, 36).travel, 0);
    assert.equal(motion(m, -10).time, 0);
    assert.equal(motion(m, 80).time, 36);
  });
}
test("Input validation refuses invalid and hostile dimensions", () => {
  for (const bad of [NaN, Infinity, -1, 0, "600"])
    assert.throws(() => validate("bedside", { width: bad }));
  assert.throws(() => validate("unknown", {}));
  assert.throws(() => validate("lamp", { finish: "unknown" }));
  assert.throws(() => validate("desk", { gap: -1 }));
  assert.throws(() => motion(createModel("bedside"), NaN));
  assert.equal(validate("bedside", { extra: "ignored" }).extra, undefined);
  assert.equal(validate("lamp", { width: 500 }).depth, 500);
});
