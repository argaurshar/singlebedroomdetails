// Project-owned production fixes; pinned upstream sources and diagnostics stay intact.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";

const base = ".agents/skills/anatomy/kit/";
const destination = ".generated/anatomy/";
const manifest = JSON.parse(await readFile("docs/skill-files.sha256.json", "utf8"));
const names = ["turn.mjs", "turn-build.mjs", "turn-audit.mjs"];

function replace(source, from, to, count = 1) {
  const matches = source.split(from).length - 1;
  if (matches !== count)
    throw Error(`Upstream patch mismatch (${matches} != ${count}): ${from}`);
  return source.split(from).join(to);
}

await mkdir(destination, { recursive: true });
for (const name of names) {
  let source = await readFile(base + name, "utf8");
  const hash = createHash("sha256").update(source).digest("hex");
  if (hash !== manifest[base + name])
    throw Error("Pinned source hash mismatch: " + name);

  if (name === "turn.mjs") {
    // Always retain six decimal SVG coordinates. Exact mode is toggled by the
    // upstream audit, so relying on that global mode would make browser output
    // and audited output differ. Shared face edges must round consistently.
    const start = source.indexOf("function t3Num(v) {");
    const end = source.indexOf("\n}", start) + 2;
    source = source.slice(0, start)
      + "function t3Num(v) {\n  return String(Math.round(v * 1e6) / 1e6);\n}"
      + source.slice(end);

    // Keep visible overlap constraints until the actual shared edge. The old
    // broadphase shrink and cycle-pruning allowance could discard them early.
    source = replace(source, ", -0.05)) continue;", ", 0)) continue;", 7);
    source = replace(
      source,
      "t3Disjoint(frames[parts[a]], frames[parts[b]], 0.1)",
      "t3Disjoint(frames[parts[a]], frames[parts[b]], 1e-6)",
    );
  }

  if (name === "turn-build.mjs") {
    // Quantized separating normals and rounded geometry must not disagree at
    // touching faces. Raw normal arrays are already supported by the runtime.
    source = replace(source,
      "const r4 = (v) => Math.round(v * 1e4) / 1e4;",
      "const r4 = (v) => Math.round(v * 1e9) / 1e9;");
    source = replace(source,
      "const r3 = (v) => Math.round(v * 1e3) / 1e3;",
      "const r3 = (v) => Math.round(v * 1e9) / 1e9;");
    const start = source.indexOf("function packPairs(");
    const end = source.indexOf("\nfunction signedArea", start);
    source = source.slice(0, start)
      + `function packPairs(byLayer) {
  return Object.fromEntries(Object.entries(byLayer).map(([name, list]) => [name, Array.from(list)]));
}
`
      + source.slice(end);
  }

  // Do not patch the audit body or its failure thresholds. Its imports use the
  // production renderer, with all remaining support modules from the same pin.
  source = source.replace(/from "\.\/([^\"]+)"/g, (all, file) =>
    names.includes(file) ? all : `from "../../${base}${file}"`,
  );
  await writeFile(destination + name, source);
}
await writeFile(destination + "LICENSE", await readFile(".agents/skills/anatomy/LICENSE"));
console.log("Prepared project Anatomy runtime; pinned source hashes verified.");
