import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import * as k from "../.agents/skills/anatomy/kit/iso-kit.mjs";
import {
  kitScript,
  turnScript,
} from "../.agents/skills/anatomy/scripts/inline-kit.mjs";
import {
  buildCabinet,
  CP,
  CW,
  CH,
  cabinetParts,
} from "../src/cabinet/geometry.mjs";
import { storeZip } from "./zip.mjs";
const out = buildCabinet();
const mat = k.slabOf(
  { x: -75, y: -55, w: 150, d: 150, r: 2 },
  -0.35,
  0.35,
  CP,
  6,
  0.1,
);
let grid = "";
for (let x = -70; x <= 70; x += 5)
  grid += `<path d="${k.pathOf(
    [
      [x, -50, 0],
      [x, 90, 0],
    ].map((p) => k.iso(p, CP)),
  )}"/>`;
for (let y = -50; y <= 90; y += 5)
  grid += `<path d="${k.pathOf(
    [
      [-70, y, 0],
      [70, y, 0],
    ].map((p) => k.iso(p, CP)),
  )}"/>`;
const ground = `<svg class="ground" viewBox="0 0 ${CW} ${CH}" aria-hidden="true"><defs><filter id="shadow-blur"><feGaussianBlur stdDeviation="2.8"/></filter></defs><g style="--anatomy-paper:#d4ded0;--anatomy-top:#dfe7d8;--anatomy-shade-0:#b6c7b2;--anatomy-shade-1:#c0ceba;--anatomy-shade-2:#cbd7c4;--anatomy-shade-3:#d5dfce;--anatomy-mid:#9ba991;--anatomy-hi:#87997e">${k.solidSvg(mat)}</g><g stroke="#a9b9a0" stroke-width=".35" opacity=".4" fill="none">${grid}</g><g id="object-shadows" fill="#596d45" opacity=".15" filter="url(#shadow-blur)"></g></svg>`;
const partMap = new Map(cabinetParts.map((p) => [p.name, p]));
const object = out
  .layerSvg("object", { width: CW, height: CH })
  .replace(/data-name="([^"]+)"/g, (all, name) => {
    const material = partMap.get(name)?.material;
    return material &&
      !["steel", "chrome", "brass", "rubber"].includes(material)
      ? `${all} data-surface="${material}"`
      : all;
  });
let html = await readFile("src/cabinet/index.html", "utf8");
const css =
  k.ISO_CSS +
  "\n" +
  out.css +
  "\n" +
  (await readFile("src/cabinet/style.css", "utf8"));
const strip = (s) =>
  s
    .replace(/^import .*;\s*$/gm, "")
    .replace(/\bexport (?=(const|function|class|let)\b)/g, "");
const code = `(()=>{'use strict';${kitScript()}\n${turnScript()}\nconst CABINET_DATA=${JSON.stringify(out.data)};const CABINET_PARTS=${JSON.stringify(cabinetParts)};const CABINET_PROJECTION=${JSON.stringify(CP)};\n${strip(await readFile("src/cabinet/model.mjs", "utf8"))}\n${await readFile("src/cabinet/controller.js", "utf8")}\n})();`;
html = html
  .replace("/* STYLES */", css.trim())
  .replace("<!-- SCENE -->", ground + object)
  .replace("/* APP */", code.replace(/<\/script/gi, "<\\/script"));
const licence = await readFile(".agents/skills/anatomy/LICENSE", "utf8");
html = html.replace(
  "</head>",
  `<!-- Anatomy toolkit licence:\n${licence}-->\n</head>`,
);
await mkdir("dist", { recursive: true });
await copyFile("dist/room-anatomy.html", "dist/bedroom.html");
await writeFile("dist/cabinet.html", html);
await writeFile("dist/index.html", html);
await writeFile(
  "dist/cabinet.zip",
  storeZip([
    ["cabinet.html", html],
    ["bedroom.html", await readFile("dist/bedroom.html", "utf8")],
    ["ANATOMY-LICENSE.txt", licence],
    [
      "READ-ME.txt",
      "Open cabinet.html in a browser. All artwork and scripts are inline. Demonstration furniture dimensions; no product or performance certification. The earlier bedroom study is included as bedroom.html.\n",
    ],
  ]),
);
await mkdir(".test-artifacts/cabinet", { recursive: true });
await writeFile(
  ".test-artifacts/cabinet/build-report.json",
  JSON.stringify(out.report, null, 2),
);
console.log(
  `Cabinet: ${cabinetParts.length} solids, ${out.report.groups} rigid groups, ${Buffer.byteLength(html)} bytes. Strict geometry build passed.`,
);
