import { readFile, writeFile, mkdir } from "node:fs/promises";
import { build } from "esbuild";
import { presets } from "../src/library/catalog.mjs";
import { compilePreset } from "../src/library/geometry.mjs";
import { ISO_CSS } from "../.agents/skills/anatomy/kit/iso-kit.mjs";
import { storeZip } from "./zip.mjs";
const library = {},
  reports = {};
for (const p of presets) {
  const { report, ...result } = compilePreset(p.id);
  reports[p.id] = report;
  library[p.id] = result;
  console.log(
    `${p.name}: ${result.model.parts.length} physical parts; strict compilation passed`,
  );
}
const worker = await build({
  entryPoints: ["src/library/worker.mjs"],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: "es2022",
  minify: true,
});
const app = await build({
  entryPoints: ["src/library/controller.mjs"],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: "es2022",
  minify: true,
});
const css =
  ISO_CSS +
  "\n" +
  library.bedside.css +
  "\n" +
  (await readFile("src/library/style.css", "utf8"));
const script = `globalThis.LIBRARY_DATA=${JSON.stringify(library)};globalThis.LIBRARY_WORKER=${JSON.stringify(worker.outputFiles[0].text)};globalThis.LIBRARY_CSS=${JSON.stringify(css)};${app.outputFiles[0].text}`;
const licence = await readFile(".agents/skills/anatomy/LICENSE", "utf8");
let html = (await readFile("src/library/index.html", "utf8"))
  .replace("/* STYLES */", css.trim())
  .replace("/* APP */", () => script.replace(/<\/script/gi, "<\\/script"))
  .replace("</head>", `<!-- Anatomy toolkit licence:\n${licence}-->\n</head>`);
await mkdir("dist", { recursive: true });
await writeFile("dist/library.html", html);
await writeFile("dist/index.html", html);
await writeFile(
  "dist/library.zip",
  storeZip([
    ["index.html", html],
    ["library.html", html],
    ["cabinet.html", await readFile("dist/cabinet.html", "utf8")],
    ["bedroom.html", await readFile("dist/bedroom.html", "utf8")],
    ["ANATOMY-LICENSE.txt", licence],
    [
      "READ-ME.txt",
      "Open index.html. Seven presets, local dimension editor, parts inspection, orthographic drawings and exports. No remote services. All dimensions are demonstration assumptions. Preserved studies: cabinet.html and bedroom.html. Some browsers restrict local workers; use a local HTTP server if dimension editing is unavailable.\n",
    ],
  ]),
);
await mkdir(".test-artifacts/library", { recursive: true });
await writeFile(
  ".test-artifacts/library/build.json",
  JSON.stringify(
    Object.fromEntries(
      Object.entries(library).map(([id, b]) => [
        id,
        { parts: b.model.parts.length, report: reports[id] },
      ]),
    ),
    null,
    2,
  ),
);
console.log(
  `Preset library: ${Buffer.byteLength(html)} bytes; local worker included; no runtime CDN dependencies.`,
);
