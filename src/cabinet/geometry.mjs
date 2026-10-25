import * as k from "../../.agents/skills/anatomy/kit/iso-kit.mjs";
import * as G from "../../.agents/skills/anatomy/kit/lathe.mjs";
import * as A from "../../.agents/skills/anatomy/kit/audit.mjs";
import { turning } from "../../.agents/skills/anatomy/kit/turn-build.mjs";
import { cabinetState, cabinetPose, cabinetSpec } from "./model.mjs";
const W = cabinetSpec.width / 10,
  D = cabinetSpec.depth / 10,
  H = cabinetSpec.height / 10,
  topThickness = cabinetSpec.top / 10,
  caseThickness = cabinetSpec.caseThickness / 10,
  stroke = cabinetSpec.drawerTravel / 10;
export const CW = 1000,
  CH = 760;
export const CP = k.fitProjection(
  k.boxCorners({ x: -65, y: -55, w: 130, d: 160 }, 0, 115),
  CW,
  CH,
  { pad: 20, azimuth: 38, elevation: 26 },
);
export const CR = A.recorder(CP),
  CT = turning(CP, { recorder: CR });
const root = CT.group("cabinet", { turn: { pivot: [0, 0] } }),
  layer = CT.layer("object");
CT.stack(["object"]);
const groups = { cabinet: root };
for (const [name, parent] of [
  ["top", "cabinet"],
  ["left", "cabinet"],
  ["right", "cabinet"],
  ["back", "cabinet"],
  ["box", "drawer"],
  ["front", "box"],
  ["drawerLeft", "box"],
  ["drawerRight", "box"],
  ["drawerBase", "box"],
  ["drawerBack", "box"],
]) {
  if (parent === "drawer" && !groups.drawer)
    groups.drawer = CT.group("drawer", {
      parent: root,
      slide: { direction: [0, 1, 0], travel: stroke },
    });
  groups[name] = CT.group(name, {
    parent: groups[parent],
    free: { origin: name === "top" ? [0, 0, H - topThickness / 2] : [0, 0, 0] },
  });
}
for (const [name, travel] of [
  ["middle", stroke / 2],
  ["bearingOuter", stroke / 4],
  ["bearingInner", stroke * 0.75],
])
  groups[name] = CT.group(name, {
    parent: root,
    slide: { direction: [0, 1, 0], travel },
  });
export const cabinetParts = [];
function box(
  name,
  group,
  x,
  y,
  z,
  w,
  d,
  h,
  material = "oak",
  r = 0,
  bevel = 0.12,
) {
  const p = CT.prism({
    name,
    group: groups[group],
    layer,
    plan: { x, y, w, d, r },
    z,
    h,
    steps: 5,
    bevel,
    material: ["steel", "brass", "chrome", "rubber"].includes(material)
      ? material
      : undefined,
    tone: "mid",
  });
  cabinetParts.push({ name, group, x, y, z, w, d, h, material });
  return p;
}
function round(name, group, o, axis, s0, s1, r, material = "brass") {
  const p = CT.round({
    name,
    group: groups[group],
    layer,
    F: G.frameAlong(o, axis),
    s0,
    s1,
    r,
    material,
  });
  if (name.startsWith("foot."))
    for (const shape of p.shapes) shape.ground = true;
  cabinetParts.push({
    name,
    group,
    kind: "round",
    o,
    axis,
    s0,
    s1,
    r,
    material,
  });
  return p;
}
function grain(part, x, y, z, w, d, face = "top", count = 20) {
  // Face-local curves, clipped to the host; deterministic grain with no screen-space texture.
  let svg = "";
  for (let i = 0; i < count; i++) {
    const v = ((i + 0.5) * d) / count,
      amp = Math.min(d * 0.065, 2.1) * Math.sin((Math.PI * v) / d),
      shift = Math.sin(i * 1.37) * 0.12;
    svg += `<path d="M0 ${v} C${w * 0.18} ${v + shift},${w * 0.26} ${v - amp},${w * 0.45} ${v - amp * 0.8} S${w * 0.76} ${v + amp * 0.8},${w} ${v}" fill="none" stroke="#4f321e" stroke-opacity="${0.2 + (i % 4) * 0.035}" stroke-width="${i % 3 ? 0.085 : 0.13}"/>`;
  }
  CT.plane({
    part,
    o: [x, y, z],
    u: [1, 0, 0],
    v: face === "top" ? [0, 1, 0] : [0, 0, 1],
    normal: face === "top" ? [0, 0, 1] : [0, 1, 0],
    svg,
  });
}
function fasteners(part, o, u, v, positions) {
  CT.plane({
    part,
    o,
    u,
    v,
    svg: positions
      .map(
        ([x, y]) =>
          `<circle cx="${x}" cy="${y}" r=".27" fill="#b8b8ab" stroke="#5d6259" stroke-width=".06"/><path d="M${x - 0.14} ${y}h.28 M${x} ${y - 0.14}v.28" stroke="#505a52" stroke-width=".06"/>`,
      )
      .join(""),
  });
}
box("case.base", "cabinet", -28, -21, 14, 56, 42, 2, "case", 0.35, 0.15);
box(
  "case.left",
  "left",
  -28,
  -21,
  16,
  caseThickness,
  42,
  H - topThickness - 16,
  "case",
  0.3,
  0.12,
);
box(
  "case.right",
  "right",
  26,
  -21,
  16,
  caseThickness,
  42,
  H - topThickness - 16,
  "case",
  0.3,
  0.12,
);
const back = box(
  "case.back",
  "back",
  -26,
  -21,
  16,
  52,
  1.2,
  46,
  "case",
  0,
  0.08,
);
fasteners(
  back,
  [-26, -21, 16],
  [1, 0, 0],
  [0, 0, 1],
  [
    [2, 2],
    [50, 2],
    [2, 44],
    [50, 44],
    [26, 2],
    [26, 44],
  ],
);
const shelf = box(
  "case.shelf",
  "cabinet",
  -26,
  -19.8,
  34,
  52,
  39.6,
  1.8,
  "oak",
  0.15,
  0.1,
);
grain(shelf, -26, -19.8, 35.8, 52, 39.6);
const top = box(
  "top.oak",
  "top",
  -W / 2,
  -D / 2,
  H - topThickness,
  W,
  D,
  topThickness,
  "oak",
  1.1,
  0.28,
);
grain(top, -29.1, -21.6, 65, 58.2, 43.2, "top", 45);
grain(top, -29.1, 22.5, 62.3, 58.2, 2.4, "front", 6);
// An underside label and screw recesses turn with the top, not with the screen.
CT.plane({
  part: top,
  o: [-8, -4, 62],
  u: [1, 0, 0],
  v: [0, 1, 0],
  normal: [0, 0, -1],
  svg: '<rect width="16" height="8" rx=".5" fill="#d0c29f" stroke="#766649" stroke-width=".1"/><text x="8" y="3.4" text-anchor="middle" font-size="1.3" fill="#60553f" font-family="monospace">SOLID OAK</text><text x="8" y="5.6" text-anchor="middle" font-size=".8" fill="#60553f">30 mm / STUDY 02</text>',
});
for (const x of [-22, 22])
  for (const y of [-16, 16]) {
    round(
      `foot.${x}.${y}`,
      "cabinet",
      [x, y, 0],
      [0, 0, 1],
      0,
      0.8,
      0.8,
      "rubber",
    );
    round(
      `leg.${x}.${y}`,
      "cabinet",
      [x, y, 0],
      [0, 0, 1],
      0.8,
      13.5,
      [0.8, 1.4],
      "brass",
    );
    const mount = box(
      `leg.mount.${x}.${y}`,
      "cabinet",
      x - 1.9,
      y - 1.9,
      13.5,
      3.8,
      3.8,
      0.5,
      "steel",
      0.2,
      0.05,
    );
    fasteners(
      mount,
      [x - 1.9, y - 1.9, 13.5],
      [1, 0, 0],
      [0, 1, 0],
      [
        [0.5, 0.5],
        [3.3, 0.5],
        [0.5, 3.3],
        [3.3, 3.3],
      ],
    );
  }
const front = box(
  "drawer.front",
  "front",
  -25.5,
  19,
  37,
  51,
  2,
  23,
  "oak",
  0.5,
  0.2,
);
grain(front, -25, 21, 37.5, 50, 22, "front", 35);
for (const x of [-9, 9])
  round(
    `handle.post.${x}`,
    "front",
    [x, 0, 48],
    [0, 1, 0],
    21,
    22.3,
    0.48,
    "brass",
  );
round("handle.pull", "front", [0, 23, 48], [1, 0, 0], -10, 10, 0.7, "brass");
const left = box(
  "drawer.left",
  "drawerLeft",
  -23.5,
  -18,
  39,
  1.2,
  36,
  15,
  "maple",
  0,
  0.06,
);
const right = box(
  "drawer.right",
  "drawerRight",
  22.3,
  -18,
  39,
  1.2,
  36,
  15,
  "maple",
  0,
  0.06,
);
const rear = box(
  "drawer.back",
  "drawerBack",
  -22.3,
  -18,
  39,
  44.6,
  1.2,
  15,
  "maple",
  0,
  0.06,
);
const base = box(
  "drawer.bottom",
  "drawerBase",
  -22.3,
  -16.8,
  39,
  44.6,
  33.6,
  1,
  "maple",
  0,
  0.04,
);
grain(base, -22.3, -16.8, 40, 44.6, 33.6, "top", 28);
const innerfront = box(
  "drawer.inner-front",
  "box",
  -22.3,
  16.8,
  39,
  44.6,
  1.2,
  15,
  "maple",
  0,
  0.06,
);
for (const x of [-18, 18])
  box(`front.spacer.${x}`, "box", x - 1, 18, 42, 2, 1, 8, "maple", 0, 0.04);
fasteners(
  innerfront,
  [-22.3, 18, 39],
  [1, 0, 0],
  [0, 0, 1],
  [
    [4.3, 6],
    [40.3, 6],
  ],
);
// Triangular corner blocks meet the drawer base and two adjoining faces.
for (const x of [-1, 1])
  for (const end of [-1, 1]) {
    const xx = x > 0 ? 22.3 : -22.3,
      yy = end > 0 ? 16.8 : -16.8;
    const plan = [
      [xx, yy],
      [xx - x * 3, yy],
      [xx, yy - end * 3],
    ];
    const name = `drawer.corner.${x}.${end}`,
      part = CT.prism({
        name,
        group: groups[end > 0 ? "box" : "drawerBack"],
        layer,
        F: { o: [0, 0, 0], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
        polygon: plan,
        s0: 40,
        s1: 43,
        bevel: 0.04,
      });
    cabinetParts.push({
      name,
      group: end > 0 ? "box" : "drawerBack",
      material: "maple",
      kind: "corner",
    });
    CT.plane({
      part,
      o: [xx - x * 0.8, yy - end * 0.8, 43],
      u: [1, 0, 0],
      v: [0, 1, 0],
      normal: [0, 0, 1],
      svg: '<circle r=".25" fill="#b0aca0" stroke="#6f756c" stroke-width=".06"/><path d="M-.14 0h.28 M0 -.14v.28" stroke="#4f5b51" stroke-width=".06"/>',
    });
  }
// Three independent channels per side. Bearing centres follow half relative travel.
for (const side of [-1, 1]) {
  const mirror = (x, w) => (side === 1 ? x : -x - w);
  for (const [name, group, x, w, z, h] of [
    ["fixed", "cabinet", 25.6, 0.4, 42.8, 4.4],
    ["middle", "middle", 24.8, 0.4, 43.2, 3.6],
    ["inner", "drawer", 24, 0.4, 43.6, 2.8],
  ]) {
    const rail = box(
      `runner.${side}.${name}`,
      group,
      mirror(x, w),
      -17,
      z,
      w,
      34,
      h,
      "steel",
      0,
      0.045,
    );
    for (const zz of [z, z + h - 0.16])
      box(
        `runner.${side}.${name}.lip.${zz}`,
        group,
        mirror(x - 0.4, 0.4),
        -17,
        zz,
        0.4,
        34,
        0.16,
        "steel",
        0,
        0.025,
      );
    // Mounting slots and bearing-race seams lie on the actual channel side.
    CT.plane({
      part: rail,
      o: [side === 1 ? x + w : -x - w, -17, z],
      u: [0, 1, 0],
      v: [0, 0, 1],
      normal: [side, 0, 0],
      svg:
        `<path d="M.5 .45 H33.5 M.5 ${h - 0.45} H33.5" stroke="#5c6b71" stroke-width=".045"/>` +
        [3, 17, 31]
          .map(
            (y) =>
              `<rect x="${y - 1}" y="${h / 2 - 0.2}" width="2" height=".4" rx=".2" fill="#636e70"/>`,
          )
          .join(""),
    });
  }
  box(
    `drawer.mount.${side}`,
    "drawer",
    mirror(23.5, 0.5),
    -15,
    44,
    0.5,
    30,
    2,
    "steel",
    0,
    0.04,
  );
  for (const [group, x] of [
    ["bearingOuter", 25.4],
    ["bearingInner", 24.6],
  ])
    for (const y of [-11, 0, 11]) {
      CT.ball({
        name: `bearing.${side}.${group}.${y}`,
        group: groups[group],
        layer,
        c: [side * x, y, 45],
        r: 0.2,
        material: "chrome",
      });
      cabinetParts.push({
        name: `bearing.${side}.${group}.${y}`,
        group,
        kind: "ball",
        c: [side * x, y, 45],
        r: 0.2,
      });
    }
}
// A lower shelf book provides scale, with bounded page lines, a cover and a spine.
const book = box(
  "book.pages",
  "cabinet",
  -17,
  -11,
  16.2,
  27,
  19,
  2.3,
  "paper",
  0.15,
  0.04,
);
box(
  "book.cover.bottom",
  "cabinet",
  -17.3,
  -11.3,
  16,
  27.6,
  19.6,
  0.2,
  "linen",
  0.2,
  0.04,
);
box(
  "book.cover.top",
  "cabinet",
  -17.3,
  -11.3,
  18.5,
  27.6,
  19.6,
  0.2,
  "linen",
  0.2,
  0.04,
);
box(
  "book.spine",
  "cabinet",
  -17.3,
  -11.3,
  16.2,
  0.3,
  19.6,
  2.3,
  "linen",
  0,
  0.03,
);
CT.plane({
  part: book,
  o: [-17, 8, 16.2],
  u: [1, 0, 0],
  v: [0, 0, 1],
  normal: [0, 1, 0],
  svg: Array.from(
    { length: 9 },
    (_, i) =>
      `<path d="M.15 ${0.2 + i * 0.22}H26.85" fill="none" stroke="#b5ad98" stroke-width=".045"/>`,
  ).join(""),
});
export const cabinetPoses = () =>
  Array.from({ length: 145 }, (_, i) => cabinetPose(cabinetState(i / 4)));
export function buildCabinet() {
  return CT.build({ poses: cabinetPoses, verify: true });
}
