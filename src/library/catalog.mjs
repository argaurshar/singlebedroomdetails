export const presets = [
  {
    id: "bedside",
    name: "Bedside cabinet",
    kind: "Furniture",
    tag: "Storage / sliding",
    description:
      "A compact case with a cleat-supported drawer box and nested runners.",
    size: [600, 450, 650, 20],
    limits: [
      [450, 800],
      [360, 600],
      [550, 850],
      [16, 26],
    ],
    focus: "drawer",
    lesson: "A drawer is a moving box carried by a fixed case.",
  },
  {
    id: "console",
    name: "Entry console",
    kind: "Furniture",
    tag: "Frame / shelf",
    description:
      "A slender hallway table with a lower shelf and exposed frame connections.",
    size: [1200, 360, 800, 24],
    limits: [
      [900, 1600],
      [300, 500],
      [700, 900],
      [18, 30],
    ],
    focus: "frame",
    lesson: "Aprons connect the legs and support the span of the top.",
  },
  {
    id: "desk",
    name: "Writing desk",
    kind: "Furniture",
    tag: "Work / drawer",
    description: "A writing surface, leg frame and suspended pencil drawer.",
    size: [1200, 650, 750, 24],
    limits: [
      [1000, 1600],
      [550, 800],
      [680, 850],
      [18, 30],
    ],
    focus: "drawer",
    lesson:
      "The drawer mechanism sits inside the structure without replacing it.",
  },
  {
    id: "coffee",
    name: "Coffee table",
    kind: "Furniture",
    tag: "Low table / joinery",
    description:
      "A substantial top, lower shelf and four framed corner assemblies.",
    size: [1000, 600, 420, 28],
    limits: [
      [800, 1400],
      [450, 800],
      [350, 550],
      [20, 36],
    ],
    focus: "frame",
    lesson: "The top, frame and shelf each have a different structural role.",
  },
  {
    id: "bookcase",
    name: "Open bookcase",
    kind: "Furniture",
    tag: "Shelves / support",
    description:
      "Four shelf levels with pin supports, a back and an illustrative restraint plate.",
    size: [800, 320, 1500, 20],
    limits: [
      [600, 1100],
      [280, 450],
      [1200, 1900],
      [16, 26],
    ],
    focus: "shelves",
    lesson:
      "Shelf positions and clear openings come from the same case dimensions.",
  },
  {
    id: "lamp",
    name: "Floor lamp",
    kind: "Decor",
    tag: "Light / layers",
    description: "A weighted base, stem, socket housing and a pleated shade.",
    size: [420, 420, 1500, 24],
    limits: [
      [340, 520],
      [340, 520],
      [1200, 1800],
      [18, 32],
    ],
    focus: "shade",
    lesson:
      "A shade, its support and a socket housing are distinct assemblies.",
  },
  {
    id: "mirror",
    name: "Standing mirror",
    kind: "Decor",
    tag: "Frame / backing",
    description:
      "A framed mirror panel, backing, retaining plates and a freestanding base.",
    size: [650, 360, 1700, 36],
    limits: [
      [500, 850],
      [300, 500],
      [1400, 1900],
      [28, 48],
    ],
    focus: "glass",
    lesson:
      "The reflective panel is supported by a frame, backing and retainers.",
  },
];
export const materials = {
  timber: {
    name: "Solid oak",
    note: "Face grain and end grain. Slotted top attachments illustrate allowance for timber movement.",
  },
  ply: {
    name: "Oak-veneered plywood",
    note: "Oak face veneer over a layered core; exposed edges show the ply build-up schematically.",
  },
  mdf: {
    name: "Painted MDF",
    note: "Uniform core with painted faces and sealed edges. No timber grain is shown.",
  },
};
export const finishes = {
  natural: "Natural",
  walnut: "Walnut tone",
  sage: "Sage",
  ink: "Ink",
};
export function preset(id) {
  const p = presets.find((p) => p.id === id);
  if (!p) throw new RangeError("Unknown preset");
  return p;
}
export function defaults(id) {
  const p = preset(id);
  return {
    width: p.size[0],
    depth: p.size[1],
    height: p.size[2],
    thickness: p.size[3],
    material: "timber",
    finish: "natural",
    gap: 800,
  };
}
export function validate(id, input = {}) {
  const p = preset(id),
    v = { ...defaults(id), ...input };
  for (const [i, key] of ["width", "depth", "height", "thickness"].entries())
    if (
      !Number.isFinite(v[key]) ||
      v[key] < p.limits[i][0] ||
      v[key] > p.limits[i][1]
    )
      throw new RangeError(
        `${key}: use ${p.limits[i][0]}–${p.limits[i][1]} mm`,
      );
  if (id === "lamp") v.depth = v.width;
  if (!materials[v.material] || !finishes[v.finish])
    throw new RangeError("Unknown material or finish");
  if (!Number.isFinite(v.gap) || v.gap < 0 || v.gap > 2000)
    throw new RangeError("Opposing gap: use 0–2000 mm");
  return Object.fromEntries(Object.keys(defaults(id)).map((k) => [k, v[k]]));
}
export const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
export const ease = (n) => {
  n = clamp(n);
  return n * n * n * (n * (n * 6 - 15) + 10);
};
export function timeline(time) {
  if (!Number.isFinite(time)) throw new TypeError("Time must be finite");
  const t = clamp(time, 0, 36),
    index = Math.min(6, Math.floor(t / 5)),
    u = (t - index * 5) / (index === 6 ? 6 : 5);
  return { time: t, index, u };
}
export const chapterNames = [
  "Turn & understand",
  "Reveal the working parts",
  "Inspect the connection",
  "Read the material",
  "Separate the assemblies",
  "Build it in order",
  "Return to the object",
];
export function motion(model, time) {
  const s = timeline(time),
    e = ease(s.u);
  let angle = 0,
    open = 0,
    apart = 0,
    xray = 0;
  if (s.index === 0) angle = 150 * e;
  if (s.index === 1) {
    angle = 150 + 210 * ease(s.u / 0.6);
    open = ease((s.u - 0.35) / 0.65);
  }
  if (s.index === 2) {
    angle = 360;
    open = 1;
    xray = e;
  }
  if (s.index === 3) {
    angle = 360 - 28 * e;
    open = 1;
    xray = 1 - e;
  }
  if (s.index === 4) {
    angle = 332 + 28 * e;
    open = 1;
    apart = e;
  }
  if (s.index === 5) {
    angle = 360;
    open = 1;
    apart = 1 - e;
  }
  if (s.index === 6) {
    angle = 360;
    open = 1 - e;
  }
  const lift = model.config.depth * 0.38 + model.config.thickness;
  const topLift =
    s.index === 2
      ? lift * e
      : s.index === 3
        ? lift
        : s.index === 4
          ? lift * (1 - e)
          : 0;
  const tilt = s.index === 3 ? 35 * e : s.index === 4 ? 35 * (1 - e) : 0;
  return {
    ...s,
    angle,
    open,
    apart,
    xray,
    topLift,
    tilt,
    travel: open * model.travel,
    clearance: model.config.gap - open * model.travel,
  };
}
// Each assembly leaves along a clear axis. Display offsets never alter the physical schedule.
export function poseFor(model, state, { orbit = 0, assembly = null } = {}) {
  const poses = { object: state.angle + orbit };
  for (const c of model.motionGroups) {
    let f = state.apart;
    const componentIndex = model.components.findIndex(
      (p) => p.id === c.component,
    );
    if (assembly !== null) f = 1 - ease(assembly - componentIndex);
    else if (state.index === 5)
      f = 1 - ease(state.u * model.components.length - componentIndex);
    const open =
      c.id === "drawer" || c.id === "middle"
        ? state.travel * (c.id === "middle" ? 0.5 : 1)
        : 0;
    if (c.id === "top")
      poses[c.id] = {
        axis: [1, 0, 0],
        angle: assembly === null ? state.tilt : 0,
        t: [
          0,
          0,
          (c.offset[2] * f + (assembly === null ? state.topLift : 0)) / 10,
        ],
      };
    else poses[c.id] = (Math.hypot(...c.offset) * f + open) / 10;
  }
  return poses;
}
