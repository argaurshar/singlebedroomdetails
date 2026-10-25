import { test } from "node:test";
import assert from "node:assert/strict";
import { presets, motion, poseFor } from "../src/library/catalog.mjs";
import { cameraFor, physicalPartBoxes } from "../src/library/camera.mjs";
import { compilePreset } from "../src/library/geometry.mjs";
import { TURN } from "../.generated/anatomy/turn.mjs";

for (const preset of presets) {
  test(`${preset.id}: camera remains continuous through every chapter and material hand-off`, () => {
    const built = compilePreset(preset.id);
    const scene = TURN.prepare(built.data, { unit: 1 });
    const frames = scene.runs.map((r) => TURN.frame(r));
    const at = (time, options) => {
      const state = motion(built.model, time),
        cams = TURN.cams(scene, poseFor(built.model, state));
      for (const run of scene.runs)
        TURN.emit(
          run,
          run.group >= 0 ? cams[run.group] : cams.world,
          frames[run.index],
        );
      return cameraFor(
        built.model,
        state,
        physicalPartBoxes(built.model, built.renderParts, frames.map((f) => f.box)),
        options,
      );
    };
    const epsilon = 1e-4;
    for (const boundary of [5, 10, 15, 17.5, 20, 25, 30]) {
      const before = at(boundary - epsilon),
        after = at(boundary + epsilon);
      assert.ok(
        Math.max(...before.map((v, i) => Math.abs(v - after[i]))) < 0.1,
        `camera jumps at ${boundary}s: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`,
      );
      const left = at(boundary - 2 * epsilon),
        right = at(boundary + 2 * epsilon);
      // Zoom/centre velocity should also join smoothly at the new 15/17.5s hand-offs.
      if ([15, 17.5].includes(boundary))
        assert.ok(
          Math.max(
            ...before.map((v, i) =>
              Math.abs(v - left[i] - (right[i] - after[i])),
            ),
          ) < 0.001,
          `camera velocity changes abruptly at ${boundary}s`,
        );
    }
    const start = at(0),
      finish = at(36);
    assert.ok(Math.max(...start.map((v, i) => Math.abs(v - finish[i]))) < 1e-5);
    for (const t of [0, 11, 15, 17.5, 19.9, 24, 36])
      assert.ok(at(t).every(Number.isFinite));
    // At the end of the material hand-off the top (or preset focus for decor)
    // must still fit completely; fading context may intentionally be cropped.
    const materialView = at(17.5);
    const materialGroup = built.model.components.some((c) => c.id === "top")
      ? "top"
      : built.model.focus;
    physicalPartBoxes(built.model, built.renderParts, frames.map((f) => f.box)).forEach((box, i) => {
      if (built.model.parts[i].group !== materialGroup) return;
      const [x0, y0, x1, y1] = box;
      assert.ok(x0 >= materialView[0] && y0 >= materialView[1]);
      assert.ok(
        x1 <= materialView[0] + materialView[2] &&
          y1 <= materialView[1] + materialView[3],
      );
    });
    const selected = built.model.focus;
    const first = built.model.parts.find((p) => p.group === selected).id;
    for (const selectedPart of ["", first]) {
      const normal = at(0, { selected, selectedPart, focus: true });
      const zoomed = at(0, { selected, selectedPart, focus: true, zoom: 2 });
      assert.equal(zoomed[2], normal[2] / 2);
      assert.equal(zoomed[3], normal[3] / 2);
    }
  });
}
