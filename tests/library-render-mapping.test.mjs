import { test } from "node:test";
import assert from "node:assert/strict";
import { physicalPartBoxes, cameraFor } from "../src/library/camera.mjs";
import { compilePreset } from "../src/library/geometry.mjs";
import { motion, poseFor } from "../src/library/catalog.mjs";
import { TURN } from "../.generated/anatomy/turn.mjs";

test("render subdivisions retain stable physical IDs and union their complete screen bounds", () => {
  const model = { parts: [{ id: "leg" }, { id: "shelf" }, { id: "top" }] };
  const renderParts = [
    { logical: "top" },
    { logical: "leg" },
    { logical: "shelf" },
    { logical: "leg" },
  ];
  const boxes = [
    [5, 0, 80, 20],
    [-8, 20, 8, 90],
    [0, 35, 75, 40],
    [-6, 5, 10, 25],
  ];
  assert.deepEqual(physicalPartBoxes(model, renderParts, boxes), [
    [-8, 5, 10, 90],
    [0, 35, 75, 40],
    [5, 0, 80, 20],
  ]);
});

test("each selected coffee-table leg frames both render halves without changing the physical part count", () => {
  const built = compilePreset("coffee"),
    scene = TURN.prepare(built.data, { unit: 1 });
  const frames = scene.runs.map((run) => TURN.frame(run));
  const legs = built.model.parts.filter((part) => part.id.startsWith("leg."));
  assert.equal(legs.length, 4);
  assert.equal(built.renderParts.length, built.model.parts.length + 4);
  for (const leg of legs) {
    const halves = built.renderParts.filter((part) => part.logical === leg.id)
      .sort((a, b) => a.z - b.z);
    assert.equal(halves.length, 2);
    assert.equal(halves[0].z, leg.z);
    assert.equal(halves[0].z + halves[0].h, halves[1].z);
    assert.equal(halves[1].z + halves[1].h, leg.z + leg.h);
    assert.equal(halves.reduce((sum, p) => sum + p.w * p.d * p.h, 0), leg.w * leg.d * leg.h);
    for (const half of halves)
      assert.deepEqual([half.x, half.y, half.w, half.d], [leg.x, leg.y, leg.w, leg.d]);
  }
  for (const time of [0, 14.9, 17.5, 24.9, 29.9, 36]) {
    const state = motion(built.model, time),
      cams = TURN.cams(scene, poseFor(built.model, state));
    for (const run of scene.runs)
      TURN.emit(
        run,
        run.group >= 0 ? cams[run.group] : cams.world,
        frames[run.index],
      );
    const boxes = physicalPartBoxes(
      built.model,
      built.renderParts,
      frames.map((frame) => frame.box),
    );
    assert.equal(boxes.length, built.model.parts.length);
    for (const leg of legs) {
      const halves = built.renderParts
        .map((part, i) => (part.logical === leg.id ? frames[i].box : null))
        .filter(Boolean);
      assert.equal(halves.length, 2);
      const box =
        boxes[built.model.parts.findIndex((part) => part.id === leg.id)];
      const camera = cameraFor(built.model, state, boxes, {
        selected: leg.group,
        selectedPart: leg.id,
        focus: true,
      });
      assert.ok(
        Math.abs(camera[0] + camera[2] / 2 - (box[0] + box[2]) / 2) < 1e-9,
      );
      assert.ok(
        Math.abs(camera[1] + camera[3] / 2 - (box[1] + box[3]) / 2) < 1e-9,
      );
      for (const half of halves) {
        assert.ok(half[0] >= camera[0] && half[1] >= camera[1]);
        assert.ok(
          half[2] <= camera[0] + camera[2] && half[3] <= camera[1] + camera[3],
        );
      }
    }
  }
});
