import { preset, validate } from "./catalog.mjs";
export function createModel(id, input = {}) {
  const config = validate(id, input),
    p = preset(id),
    { width: W, depth: D, height: H, thickness: T } = config;
  const parts = [],
    components = [];
  let travel = 0;
  const component = (id, name, role, connection, rank, offset) => {
    components.push({ id, name, role, connection, rank, offset });
  };
  const box = (id, group, x, y, z, w, d, h, material = "wood", detail = "") => {
    if (Math.min(w, d, h) <= 0) throw Error("Nonpositive part " + id);
    parts.push({ id, group, shape: "box", x, y, z, w, d, h, material, detail });
  };
  const cyl = (id, group, x, y, z, r, h, material = "brass") =>
    parts.push({
      id,
      group,
      shape: "cylinder",
      x: x - r,
      y: y - r,
      z,
      w: r * 2,
      d: r * 2,
      h,
      r,
      material,
    });
  const screw = (id, g, x, y, z) => cyl(id, g, x, y, z, 3.5, 2, "steel");
  const four = (fn, xx, yy) => {
    for (const x of [-xx, xx]) for (const y of [-yy, yy]) fn(x, y);
  };
  const frameLegs = (zTop, inset = 50, leg = 42) => {
    component(
      "feet",
      "Feet & legs",
      "Transfers the frame to four feet.",
      "Illustrative top plates and screws connect each leg to the frame.",
      0,
      [0, 0, 0],
    );
    four(
      (x, y) => {
        const n = `${x}.${y}`;
        cyl("pad." + n, "feet", x, y, 0, leg * 0.44, 5, "rubber");
        box(
          "leg." + n,
          "feet",
          x - leg / 2,
          y - leg / 2,
          5,
          leg,
          leg,
          zTop - 5,
          "wood",
          "end",
        );
        box(
          "mount." + n,
          "feet",
          x - leg / 2 - 4,
          y - leg / 2 - 4,
          zTop,
          leg + 8,
          leg + 8,
          3,
          "steel",
        );
        for (const dx of [-leg * 0.3, leg * 0.3])
          for (const dy of [-leg * 0.3, leg * 0.3])
            screw(
              "fixing." + n + "." + dx + "." + dy,
              "feet",
              x + dx,
              y + dy,
              zTop + 3,
            );
      },
      W / 2 - inset,
      D / 2 - inset,
    );
  };
  const top = (z = H - T) => {
    component(
      "top",
      "Top panel",
      "A continuous surface with a readable edge.",
      "Top clips and slots are illustrative; dimensions are demonstration assumptions.",
      6,
      [0, 0, H * 0.5],
    );
    box("top.panel", "top", -W / 2, -D / 2, z, W, D, T, "wood", "grain");
    for (const x of [-W * 0.3, W * 0.3])
      for (const y of [-D * 0.25, D * 0.25])
        box(
          `top.clip.${x}.${y}`,
          "top",
          x - 12,
          y - 5,
          z - 3,
          24,
          10,
          3,
          "steel",
          "slot",
        );
  };
  const drawer = (innerW, z, boxH, caseDepth) => {
    // The 6 mm bottom rests on two internal cleats with explicit surface contacts.
    const dw = innerW - 26,
      dd = caseDepth - 38,
      wall = 12,
      base = 6,
      bottomZ = z + 8,
      frontY = D / 2 - 40,
      backY = frontY - dd;
    travel = Math.min(360, Math.floor((dd * 0.78) / 10) * 10);
    component(
      "drawer",
      "Drawer box",
      "The front, sides, cleats, base and back move together.",
      "A 6 mm bottom rests on two internal cleats; the selected section shows the actual butt-jointed construction.",
      4,
      [0, D + 150, 0],
    );
    component(
      "middle",
      "Intermediate runners",
      "The middle channels move half the drawer stroke.",
      "Nested webs have folded lips. The bearing relationship is illustrative, not a product specification.",
      3,
      [0, 0, 0],
    );
    box(
      "drawer.front",
      "drawer",
      -innerW / 2,
      frontY,
      z - 3,
      innerW,
      20,
      H - T - z - 8,
      "wood",
      "grain",
    );
    for (const sign of [-1, 1]) {
      const x = sign < 0 ? -dw / 2 : dw / 2 - wall;
      box(
        "drawer.side." + sign,
        "drawer",
        x,
        backY,
        z,
        wall,
        dd,
        boxH,
        "core",
        "grain",
      );
      box(
        "drawer.cleat." + sign,
        "drawer",
        sign < 0 ? x + wall : x - 6,
        backY + wall,
        z,
        6,
        dd - wall,
        8,
        "core",
      );
    }
    box(
      "drawer.base",
      "drawer",
      -dw / 2 + wall,
      backY + wall,
      bottomZ,
      dw - 2 * wall,
      dd - wall,
      base,
      "core",
      "grain",
    );
    box(
      "drawer.back",
      "drawer",
      -dw / 2 + wall,
      backY,
      z,
      dw - 2 * wall,
      wall,
      boxH,
      "core",
      "grain",
    );
    box(
      "drawer.inner-front",
      "drawer",
      -dw / 2 + wall,
      frontY - wall,
      z + 14,
      dw - 2 * wall,
      wall,
      boxH - 14,
      "core",
    );
    // Pull is formed from three small solids on the decorative front.
    box(
      "pull.left",
      "drawer",
      -65,
      frontY + 20,
      z + boxH * 0.5,
      7,
      9,
      8,
      "brass",
    );
    box(
      "pull.right",
      "drawer",
      58,
      frontY + 20,
      z + boxH * 0.5,
      7,
      9,
      8,
      "brass",
    );
    box(
      "pull.bar",
      "drawer",
      -70,
      frontY + 29,
      z + boxH * 0.5 - 1,
      140,
      7,
      10,
      "brass",
    );
    for (const side of [-1, 1]) {
      const x = side * (dw / 2 + 2);
      for (const [name, g, dx] of [
        ["inner", "drawer", 0],
        ["middle", "middle", 4],
        ["fixed", "frame", 8],
      ]) {
        const xx = side > 0 ? x + dx : x - dx - 2;
        // Square webs and lips retain a common exact separating plane (no rounded contact gap).
        box(
          `rail.${side}.${name}.web`,
          g,
          xx,
          backY + 2,
          z + 28,
          2,
          dd - 4,
          24,
          "steel",
          "slot",
        );
        box(
          `rail.${side}.${name}.lip`,
          g,
          side > 0 ? xx - 2 : xx + 2,
          backY + 2,
          z + 28,
          2,
          dd - 4,
          2,
          "steel",
        );
      }
    }
    if (id === "desk")
      for (const side of [-1, 1])
        box(
          "drawer.hanger." + side,
          "frame",
          side > 0 ? dw / 2 + 12 : -dw / 2 - 24,
          backY + 2,
          z + 28,
          12,
          dd - 4,
          H - T - z - 28,
          "core",
          "edge",
        );
  };
  if (["bedside", "desk", "console", "coffee"].includes(id)) {
    if (id === "bedside") {
      const legH = 130,
        baseZ = legH + 5,
        sideTop = H - T;
      frameLegs(legH, 58, 26);
      component(
        "frame",
        "Carcass & runners",
        "Side panels, back and shelf keep the drawer aligned.",
        "Butt joints with illustrated corner blocks; panel thickness is editable.",
        1,
        [-W * 0.9, 0, 0],
      );
      box(
        "case.base",
        "frame",
        -W / 2 + 18,
        -D / 2 + 15,
        baseZ,
        W - 36,
        D - 30,
        T,
        "wood",
        "grain",
      );
      for (const side of [-1, 1])
        box(
          "case.side." + side,
          "frame",
          side < 0 ? -W / 2 + 18 : W / 2 - 18 - T,
          -D / 2 + 15,
          baseZ + T,
          T,
          D - 30,
          sideTop - baseZ - T,
          "wood",
          "edge",
        );
      box(
        "case.back",
        "frame",
        -W / 2 + 18 + T,
        -D / 2 + 15,
        baseZ + T,
        W - 36 - 2 * T,
        8,
        sideTop - baseZ - T,
        "core",
      );
      const shelfZ = H * 0.48;
      box(
        "case.shelf",
        "frame",
        -W / 2 + 18 + T,
        -D / 2 + 23,
        shelfZ,
        W - 36 - 2 * T,
        D - 53,
        T,
        "wood",
        "grain",
      );
      drawer(W - 36 - 2 * T, H * 0.57, H * 0.22, D - 45);
    } else {
      const leg = 42,
        zTop = H - T - 5;
      frameLegs(zTop, 55, leg);
      component(
        "frame",
        "Aprons & rails",
        "The apron frame joins the legs below the top.",
        "Corner blocks connect the aprons; decorative screw heads mark fixing positions.",
        1,
        [-W * 0.9, 0, 0],
      );
      const apronH = id === "coffee" ? 60 : 75,
        xLeg = W / 2 - 55,
        yLeg = D / 2 - 55;
      for (const side of [-1, 1]) {
        box(
          "apron.long." + side,
          "frame",
          -xLeg + Math.max(leg / 2, T),
          side < 0 ? -yLeg : yLeg - T,
          H - T - 5 - apronH,
          2 * xLeg - 2 * Math.max(leg / 2, T),
          T,
          apronH,
          "wood",
          "grain",
        );
        box(
          "apron.short." + side,
          "frame",
          side < 0 ? -xLeg : xLeg - T,
          -yLeg + leg / 2,
          H - T - 5 - apronH,
          T,
          2 * yLeg - leg,
          apronH,
          "wood",
          "edge",
        );
      }
      four(
        (x, y) => {
          box(
            `corner.${x}.${y}`,
            "frame",
            x > 0 ? x - 28 : x,
            y > 0 ? y - 28 : y,
            H - T - 40,
            28,
            28,
            30,
            "core",
          );
        },
        xLeg - T,
        yLeg - T,
      );
      if (id === "desk") {
        const dw = Math.min(W * 0.53, 660),
          opening = dw + 42;
        parts.splice(
          parts.findIndex((p) => p.id === "apron.long.1"),
          1,
        );
        for (const side of [-1, 1])
          box(
            "apron.front." + side,
            "frame",
            side < 0 ? -xLeg + Math.max(leg / 2, T) : opening / 2,
            yLeg - T,
            H - T - 5 - apronH,
            xLeg - Math.max(leg / 2, T) - opening / 2,
            T,
            apronH,
            "wood",
            "grain",
          );
        drawer(dw, H - 150, 85, D - 145);
      } else {
        component(
          "shelves",
          "Lower shelf",
          "A second surface ties the lower portion of the table together.",
          "Shelf rests on four inset support blocks; no load rating is implied.",
          2,
          [W * 0.8, 0, 0],
        );
        const z = id === "coffee" ? 95 : 170;
        box(
          "shelf.panel",
          "shelves",
          -W / 2 + 82,
          -D / 2 + 82,
          z,
          W - 164,
          D - 164,
          T,
          "wood",
          "grain",
        );
        four(
          (x, y) =>
            box(
              `shelf.block.${x}.${y}`,
              "feet",
              x > 0 ? W / 2 - 98 : -W / 2 + 76,
              y > 0 ? D / 2 - 90 : -D / 2 + 55,
              z - 15,
              22,
              35,
              15,
              "wood",
            ),
          W / 2 - 90,
          D / 2 - 90,
        );
      }
    }
    top();
  } else if (id === "bookcase") {
    component(
      "feet",
      "Plinth & pads",
      "A recessed base supports the case.",
      "Four pads sit below a continuous plinth.",
      0,
      [0, 0, 0],
    );
    four(
      (x, y) => cyl(`pad.${x}.${y}`, "feet", x, y, 0, 15, 6, "rubber"),
      W / 2 - 45,
      D / 2 - 45,
    );
    box(
      "plinth",
      "feet",
      -W / 2 + 20,
      -D / 2 + 20,
      6,
      W - 40,
      D - 40,
      54,
      "wood",
    );
    component(
      "frame",
      "Case sides & back",
      "The side panels define the clear shelf span.",
      "Back and sides form the case; restraint plate is schematic and must be designed for the actual wall.",
      1,
      [-W * 0.95, 0, 0],
    );
    for (const side of [-1, 1])
      box(
        "side." + side,
        "frame",
        side < 0 ? -W / 2 : W / 2 - T,
        -D / 2,
        60,
        T,
        D,
        H - 60 - T,
        "wood",
        "edge",
      );
    box(
      "back",
      "frame",
      -W / 2 + T,
      -D / 2,
      60,
      W - 2 * T,
      8,
      H - 60 - T,
      "core",
    );
    box(
      "bottom",
      "frame",
      -W / 2 + T,
      -D / 2 + 8,
      60,
      W - 2 * T,
      D - 8,
      T,
      "wood",
      "grain",
    );
    component(
      "shelves",
      "Adjustable shelves",
      "Four levels divide the clear case height.",
      "Four pins support each shelf; holes are illustrative, not a manufacturer drilling pattern.",
      3,
      [W * 0.9, 0, 0],
    );
    for (let i = 1; i <= 4; i++) {
      const z = 60 + ((H - 60 - T) * i) / 5;
      box(
        "shelf." + i,
        "shelves",
        -W / 2 + T + 1,
        -D / 2 + 9,
        z,
        W - 2 * T - 2,
        D - 14,
        T,
        "wood",
        "grain",
      );
      for (const side of [-1, 1])
        for (const y of [-D / 2 + 35, D / 2 - 35]) {
          box(
            `pin.${i}.${side}.${y}`,
            "frame",
            side < 0 ? -W / 2 + T : W / 2 - T - 9,
            y - 3,
            z - 6,
            9,
            6,
            6,
            "steel",
          );
        }
    }
    for (let b = 0; b < 2; b++) {
      const x = -W * 0.32 + b * W * 0.34,
        y = -D * 0.22,
        z = 60 + T,
        ww = W * 0.26,
        dd = D * 0.62;
      box("book.cover.lower." + b, "frame", x, y, z, ww, dd, 2, "fabric");
      box(
        "book.pages." + b,
        "frame",
        x + 1,
        y + 1,
        z + 2,
        ww - 2,
        dd - 2,
        18,
        "paper",
      );
      box("book.cover.upper." + b, "frame", x, y, z + 20, ww, dd, 2, "fabric");
      box("book.spine." + b, "frame", x - 2, y, z, 2, dd, 22, "fabric");
    }
    box(
      "restraint.plate",
      "frame",
      -24,
      -D / 2 + 9,
      H - T - 55,
      48,
      3,
      35,
      "steel",
      "slot",
    );
    top();
  } else if (id === "mirror") {
    component(
      "feet",
      "Stand & pads",
      "A wide foot supports the upright assembly.",
      "Freestanding teaching model; stability and fixings require project-specific engineering.",
      0,
      [0, 0, 0],
    );
    four(
      (x, y) => cyl(`pad.${x}.${y}`, "feet", x, y, 0, 12, 6, "rubber"),
      W * 0.3,
      D * 0.3,
    );
    for (const side of [-1, 1])
      box(
        "base.rail." + side,
        "feet",
        side * W * 0.3 - 25,
        -D / 2,
        6,
        50,
        D,
        32,
        "wood",
        "grain",
      );
    box(
      "base.cross",
      "feet",
      -W * 0.3 + 25,
      -18,
      6,
      W * 0.6 - 50,
      36,
      32,
      "wood",
    );
    const bottom = 90,
      fh = H - bottom,
      rail = T;
    component(
      "frame",
      "Timber frame",
      "Four rails surround the mirror opening.",
      "Square corner joints and four backing blocks are shown; no hidden glass fixing is invented.",
      1,
      [-W * 0.95, 0, 0],
    );
    for (const side of [-1, 1]) {
      box(
        "upright." + side,
        "frame",
        side < 0 ? -W / 2 : W / 2 - rail,
        -rail / 2,
        bottom,
        rail,
        rail,
        fh,
        "wood",
        "grain",
      );
      box(
        "stand.post." + side,
        "feet",
        side * W * 0.3 - 12,
        -12,
        38,
        24,
        24,
        52,
        "brass",
      );
    }
    for (const z of [bottom, H - rail])
      box(
        "frame.cross." + z,
        "frame",
        -W / 2 + rail,
        -rail / 2,
        z,
        W - 2 * rail,
        rail,
        rail,
        "wood",
        "grain",
      );
    component(
      "back",
      "Backing & retainers",
      "A backing panel protects the rear face.",
      "Retainer plates bridge frame and backing; no glass-strength rating is implied.",
      2,
      [0, -D * 0.9, 0],
    );
    box(
      "backing",
      "back",
      -W / 2 + rail,
      -rail / 2,
      bottom + rail,
      W - 2 * rail,
      6,
      fh - 2 * rail,
      "core",
    );
    component(
      "glass",
      "Mirror panel",
      "A reflective panel sits inside the frame.",
      "The front sheen is illustrative rather than a live reflected scene.",
      3,
      [0, D, 0],
    );
    box(
      "mirror.panel",
      "glass",
      -W / 2 + rail,
      -rail / 2 + 6,
      bottom + rail,
      W - 2 * rail,
      5,
      fh - 2 * rail,
      "mirror",
      "reflection",
    );
    for (const x of [-W / 2 + rail, W / 2 - rail])
      for (const z of [bottom + rail + 20, H / 2, H - rail - 20]) {
        box(
          `retainer.${x}.${z}`,
          "back",
          x - 12,
          -rail / 2 - 3,
          z - 7,
          24,
          3,
          14,
          "brass",
        );
        parts.push({
          id: `screw.${x}.${z}`,
          group: "back",
          shape: "cylinder",
          axis: "y",
          x: x - 3.5,
          y: -rail / 2 - 5,
          z: z - 3.5,
          r: 3.5,
          w: 7,
          d: 2,
          h: 7,
          material: "steel",
        });
      }
    for (const side of [-1, 1]) {
      box(
        "bead.side." + side,
        "glass",
        side < 0 ? -W / 2 + rail : W / 2 - rail - 5,
        -rail / 2 + 11,
        bottom + rail + 5,
        5,
        4,
        fh - 2 * rail - 10,
        "wood",
      );
      for (const zz of [bottom + rail, H - rail - 5])
        box(
          "bead.cross." + side + "." + zz,
          "glass",
          side < 0 ? -W / 2 + rail : 0,
          -rail / 2 + 11,
          zz,
          (W - 2 * rail) / 2,
          4,
          5,
          "wood",
        );
      box(
        "stand.bracket." + side,
        "feet",
        side * W * 0.3 - 20,
        -20,
        70,
        40,
        8,
        20,
        "brass",
      );
      for (const xx of [-10, 10])
        screw(
          "stand.fixing." + side + "." + xx,
          "feet",
          side * W * 0.3 + xx,
          -16,
          68,
        );
    }
    for (let i = 0; i < 4; i++) {
      const x = (i % 2 ? -1 : 1) * (W / 2 - rail * 0.5),
        z = i < 2 ? bottom + rail * 0.5 : H - rail * 0.5;
      box(
        "corner.block." + i,
        "frame",
        x - 8,
        rail / 2,
        z - 8,
        16,
        8,
        16,
        "wood",
      );
    }
  } else if (id === "lamp") {
    const baseH = T,
      shadeH = H * 0.23,
      shadeBottom = H - shadeH,
      stemR = 12;
    component(
      "feet",
      "Weighted base",
      "A stepped base supports the stem.",
      "Weight and stability are illustrative; no overturning or electrical certification is claimed.",
      0,
      [0, 0, 0],
    );
    four(
      (x, y) => cyl(`pad.${x}.${y}`, "feet", x, y, 0, 12, 5, "rubber"),
      W * 0.18,
      W * 0.18,
    );
    cyl("base.bottom", "feet", 0, 0, 5, W * 0.38, baseH * 0.6, "steel");
    cyl(
      "base.top",
      "feet",
      0,
      0,
      5 + baseH * 0.6,
      W * 0.32,
      baseH * 0.4,
      "brass",
    );
    component(
      "frame",
      "Stem & collars",
      "The stem connects the base to the upper housing.",
      "A segmented stem and threaded collars are shown; this is not an electrical wiring guide.",
      1,
      [W, 0, 0],
    );
    const start = 5 + baseH,
      stemEnd = shadeBottom + shadeH * 0.35;
    for (let i = 0; i < 3; i++) {
      const hh = (stemEnd - start) / 3;
      cyl(
        "stem." + i,
        "frame",
        0,
        0,
        start + i * hh + 8,
        stemR,
        hh - 8,
        "brass",
      );
      cyl("collar." + i, "frame", 0, 0, start + i * hh, stemR + 5, 8, "steel");
    }
    component(
      "socket",
      "Socket housing",
      "The upper housing carries an illustrative light source.",
      "No voltage, power, heat or illumination value is inferred.",
      2,
      [0, 0, H * 0.5],
    );
    cyl("socket.body", "socket", 0, 0, stemEnd, 25, 45, "ceramic");
    cyl("socket.collar", "socket", 0, 0, stemEnd + 45, 28, 8, "brass");
    cyl("lamp.diffuser", "socket", 0, 0, stemEnd + 53, 36, 65, "paper");
    cyl(
      "upper.rod",
      "socket",
      0,
      0,
      stemEnd + 118,
      3,
      H - stemEnd - 130,
      "brass",
    );
    cyl("finial", "socket", 0, 0, H - 12, 8, 12, "brass");
    component(
      "shade",
      "Pleated shade",
      "Individual folded panels surround the upper assembly.",
      "Fold seams and a two-arm spider show shade construction; no illumination result is simulated.",
      3,
      [-W, 0, H * 0.35],
    );
    // Narrow convex trapezoids form a faceted hollow shade; no solid cone hides its interior.
    const n = 24,
      r0 = W / 2,
      r1 = W * 0.33;
    const spokeEnd = r1 + ((r0 - r1) * 10) / shadeH - 0.5;
    for (const side of [-1, 1])
      box(
        "shade.spider." + side,
        "shade",
        side > 0 ? 8 : -spokeEnd,
        -1.5,
        H - 12,
        spokeEnd - 8,
        3,
        2,
        "brass",
      );
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI) / n,
        b = ((i + 1) * 2 * Math.PI) / n,
        mid = (a + b) / 2;
      const outer = [
        [r0 * Math.cos(a), r0 * Math.sin(a), shadeBottom],
        [r0 * Math.cos(b), r0 * Math.sin(b), shadeBottom],
        [r1 * Math.cos(b), r1 * Math.sin(b), H],
        [r1 * Math.cos(a), r1 * Math.sin(a), H],
      ];
      parts.push({
        id: "shade.fold." + i,
        group: "shade",
        shape: "panel",
        vertices: outer,
        thickness: 1.2,
        material: i % 2 ? "fabric" : "paper",
        x: Math.min(...outer.map((v) => v[0])),
        y: Math.min(...outer.map((v) => v[1])),
        z: shadeBottom,
        w:
          Math.max(...outer.map((v) => v[0])) -
          Math.min(...outer.map((v) => v[0])),
        d:
          Math.max(...outer.map((v) => v[1])) -
          Math.min(...outer.map((v) => v[1])),
        h: shadeH,
      });
    }
  }
  const motionGroups = [];
  for (const part of parts) {
    const c = components.find((c) => c.id === part.group);
    let key = part.group,
      offset = c.offset;
    if (part.group === "frame" && id !== "lamp") {
      let direction = "base";
      if (/side|upright|pin\.|apron.short/.test(part.id))
        direction = part.x + part.w / 2 < 0 ? "left" : "right";
      else if (/back|restraint/.test(part.id)) direction = "back";
      else if (/apron.long|apron.front/.test(part.id))
        direction = part.y + part.d / 2 < 0 ? "back" : "front";
      else if (/frame.cross|bead.cross/.test(part.id))
        direction = part.z > H / 2 ? "up" : "base";
      else if (/shelf/.test(part.id)) direction = "front";
      else if (id === "desk" && /rail/.test(part.id)) direction = "base";
      else if (/corner|rail/.test(part.id))
        direction = part.x + part.w / 2 < 0 ? "left" : "right";
      key = "frame." + direction;
      offset = {
        base: [0, 0, 0],
        left: [-W * 0.7, 0, 0],
        right: [W * 0.7, 0, 0],
        back: [0, -D, 0],
        front: [0, D + 100, 0],
        up: [0, 0, H * 0.45],
      }[direction];
    }
    if (part.group === "shelves") offset = [0, D + 100, 0];
    if (id === "lamp" && part.group === "shade") offset = [0, 0, H * 0.5];
    part.motion = key;
    if (!motionGroups.some((g) => g.id === key))
      motionGroups.push({ id: key, component: c.id, rank: c.rank, offset });
  }
  const extents = { width: W, depth: D, height: H };
  return {
    id,
    name: p.name,
    kind: p.kind,
    config,
    parts,
    motionGroups,
    components: components.sort((a, b) => a.rank - b.rank),
    travel,
    extents,
    lesson: p.lesson,
    focus: p.focus,
  };
}
