import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, writeFile, rm } from "node:fs/promises";
import { rasterBucketRows } from "../scripts/raster-buckets.mjs";

const jitter = (a, b) => {
  const t = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return t - Math.floor(t);
};

test("audit raster bucket cache preserves exact samples through prefix growth and bounded fallback", () => {
  let evaluations = 0;
  const rowFor = rasterBucketRows((a, b) => {
    evaluations++;
    return jitter(a, b);
  });
  const rows = [0, 1, 15, 1023, 2048, 4095];
  for (const row of rows) {
    let previous;
    for (const width of [1, 2, 1, 31, 16, 4096, 0, 2048]) {
      const values = rowFor(row, width);
      assert.ok(values instanceof Uint8Array);
      assert.equal(values.byteLength, 4096);
      if (previous) assert.equal(values, previous);
      previous = values;
      for (let c = 0; c < width; c++)
        assert.equal(values[c], Math.floor(jitter(c, row) * 8));
    }
  }
  // Every requested prefix element is evaluated once, even when its bucket is 0.
  assert.equal(evaluations, rows.length * 4096);
  for (const [row, width] of [
    [-1, 4],
    [4096, 4],
    [0, 4097],
    [0, -1],
    [0, 2.5],
    [0.25, 4],
    [Infinity, 1],
    [0, NaN],
  ])
    assert.equal(rowFor(row, width), null);
  assert.equal(evaluations, rows.length * 4096);
});

const rectangle = (x, y, w, h) => [x, y, x + w, y, x + w, y + h, x, y + h];
const reverse = (p) => {
  const out = [];
  for (let i = p.length - 2; i >= 0; i -= 2) out.push(p[i], p[i + 1]);
  return out;
};

function rasterFixtures() {
  const cases = [];
  for (const scale of [0.5, 1, 4, 16]) {
    cases.push({
      name: `empty-${scale}`,
      layers: [],
      box: [-1.2, -0.3, 12.4, 9.7],
      scale,
    });
    cases.push({
      name: `holes-overlap-${scale}`,
      layers: [
        {
          id: 1,
          v: 0.25,
          polys: [
            rectangle(-0.25, -0.5, 12.3, 10.2),
            reverse(rectangle(2.1, 1.25, 4.3, 5.75)),
          ],
        },
        {
          id: 2,
          v: 3.75,
          polys: [[1.125, -1.75, 13.125, 2.75, 7.875, 8.125, -2.25, 5.75]],
        },
        { id: 3, v: 0, polys: [rectangle(7.99, 0.5, 0.2, 8)] },
      ],
      box: [-3, -2, 14, 11],
      scale,
    });
  }
  let seed = 0xcf0fb951;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  for (let n = 0; n < 32; n++) {
    const layers = Array.from({ length: 4 }, (_, id) => {
      const x = -2 + random() * 7,
        y = -1 + random() * 5,
        w = 0.05 + random() * 8,
        h = 0.05 + random() * 8;
      return {
        id,
        v: random() * 4,
        polys: [
          rectangle(x, y, w, h),
          [x - 0.1, y + 1, x + w + 0.3, y + 0.1, x + w / 2, y + h + 0.4],
        ],
      };
    });
    cases.push({
      name: `seeded-${n}`,
      layers,
      box: [-3, -2, 14, 14],
      scale: n % 2 ? 4 : 16,
    });
  }
  // Cross the cache boundary in both orientations, retaining uncached edge samples.
  for (const [w, h] of [
    [4095, 2],
    [4096, 2],
    [4097, 2],
    [4102, 2],
    [2, 4095],
    [2, 4096],
    [2, 4097],
    [2, 4102],
  ]) {
    cases.push({
      name: `cache-boundary-${w}x${h}`,
      layers: [
        {
          id: 3,
          v: 1.75,
          polys: [rectangle(0.123, 0.071, w - 0.246, h - 0.142)],
        },
        { id: 7, v: 3, polys: [rectangle(0.75, 0.5, w - 1.5, h - 1)] },
      ],
      box: [0, 0, w, h],
      scale: 1,
    });
  }
  return cases;
}

test("cached production audit produces byte-identical tone and owner rasters", async () => {
  const sourceUrl = new URL(
    "../.generated/anatomy/turn-audit.mjs",
    import.meta.url,
  );
  const cachedSource = await readFile(sourceUrl, "utf8");
  let referenceSource = cachedSource;
  for (const [cached, original] of [
    [
      'import { rasterBucketRows } from "../../scripts/raster-buckets.mjs";\n',
      "",
    ],
    ["const jitterBucketRow = rasterBucketRows(jitter);\n\n", ""],
    ["      const bucketRow = jitterBucketRow(row, w);\n", ""],
    [
      "(bucketRow ? bucketRow[c] : Math.floor(jitter(c, row) * 8)) !== sub",
      "Math.floor(jitter(c, row) * 8) !== sub",
    ],
  ]) {
    assert.equal(
      referenceSource.split(cached).length,
      2,
      `one cache substitution: ${cached}`,
    );
    referenceSource = referenceSource.replace(cached, original);
  }
  // Keep temporary modules beside the generated audit so its imports resolve.
  // Production and upstream files are never edited by this comparison.
  const id = `${process.pid}-${randomUUID()}`;
  const cachedUrl = new URL(`_audit-test-${id}-cached.mjs`, sourceUrl);
  const referenceUrl = new URL(`_audit-test-${id}-reference.mjs`, sourceUrl);
  const exports = "\nexport { toneRaster, jitter };\n";
  try {
    await writeFile(cachedUrl, cachedSource + exports);
    await writeFile(referenceUrl, referenceSource + exports);
    const cached = await import(cachedUrl.href);
    const reference = await import(referenceUrl.href);
    const bytes = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength);
    const fixtures = rasterFixtures();
    assert.equal(fixtures.length, 48);
    for (const fixture of fixtures) {
      const expected = reference.toneRaster(
        fixture.layers,
        fixture.box,
        fixture.scale,
      );
      for (let replay = 0; replay < 2; replay++) {
        const actual = cached.toneRaster(
          fixture.layers,
          fixture.box,
          fixture.scale,
        );
        assert.deepEqual(
          bytes(actual.out),
          bytes(expected.out),
          `${fixture.name}: tone bytes, replay ${replay}`,
        );
        assert.deepEqual(
          bytes(actual.owner),
          bytes(expected.owner),
          `${fixture.name}: owner bytes, replay ${replay}`,
        );
      }
    }
  } finally {
    await Promise.all([
      rm(cachedUrl, { force: true }),
      rm(referenceUrl, { force: true }),
    ]);
  }
});
