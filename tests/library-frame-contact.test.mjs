import { test } from "node:test";
import assert from "node:assert/strict";
import { preset } from "../src/library/catalog.mjs";
import { createModel } from "../src/library/model.mjs";

const keys = ["width", "depth", "height", "thickness"];
const epsilon = 1e-8;
function overlaps(a, b) {
  return [
    Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x),
    Math.min(a.y + a.d, b.y + b.d) - Math.max(a.y, b.y),
    Math.min(a.z + a.h, b.z + b.h) - Math.max(a.z, b.z),
  ];
}
function faceContact(a, b) {
  const axes = overlaps(a, b);
  return (
    axes.filter((n) => Math.abs(n) <= epsilon).length === 1 &&
    axes.filter((n) => n > epsilon).length === 2
  );
}

for (const id of ["desk", "console", "coffee"])
  test(`${id}: corner blocks meet both aprons without penetrating legs at parameter limits`, () => {
    const p = preset(id);
    const inputs = Array.from({ length: 16 }, (_, mask) =>
      Object.fromEntries(
        keys.map((key, i) => [key, p.limits[i][(mask >> i) & 1]]),
      ),
    );
    // Cover the joinery transition as well as the minimum/maximum dimensions.
    inputs.push({ thickness: 21 }, { thickness: 21.5 });
    for (const input of inputs) {
      const model = createModel(id, input);
      const blocks = model.parts.filter((part) => part.id.startsWith("corner."));
      const legs = model.parts.filter((part) => part.id.startsWith("leg."));
      const aprons = model.parts.filter((part) => part.id.startsWith("apron."));
      const scenario = JSON.stringify(input);
      assert.equal(blocks.length, 4);
      assert.equal(legs.length, 4);
      for (const block of blocks) {
        assert.equal(
          aprons.filter((apron) => faceContact(block, apron)).length,
          2,
          `${scenario}: ${block.id} must contact two apron faces`,
        );
      }
      for (const part of [...blocks, ...aprons])
        for (const leg of legs)
          assert.ok(
            !overlaps(part, leg).every((n) => n > epsilon),
            `${scenario}: ${part.id} penetrates ${leg.id}`,
          );
    }
  });
