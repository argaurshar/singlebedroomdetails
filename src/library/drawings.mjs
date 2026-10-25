export const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function drawing(model, view = "front", selected = "") {
  const { width: W, depth: D, height: H } = model.config,
    side = view === "side" || view === "section",
    plan = view === "plan";
  const ww = side ? D : W,
    hh = plan ? D : H,
    f = Math.max(ww, hh) / 35,
    pad = f * 3;
  const color = (p) =>
    p.group === selected
      ? "#bfd8b9"
      : {
          wood: "#d7bb90",
          core: "#e2d2ad",
          brass: "#c8a85f",
          steel: "#adb5b4",
          rubber: "#49544c",
          mirror: "#c2dbd7",
          fabric: "#b4b99d",
          paper: "#eee8d8",
          ceramic: "#e5e4d9",
        }[p.material] || "#ddd5c3";
  const project = (v) =>
    side ? [v[1], -v[2]] : plan ? [v[0], v[1]] : [v[0], -v[2]];
  const parts = model.parts
    .filter((p) => view !== "section" || (p.x <= 0 && p.x + p.w >= 0))
    .slice()
    .sort((a, b) => (side ? a.x - b.x : plan ? a.z - b.z : a.y - b.y));
  let art = "";
  for (const p of parts) {
    let shape;
    const axis = p.axis || "z";
    if (p.shape === "panel") {
      if (view === "section") {
        const hits = [];
        for (let i = 0; i < p.vertices.length; i++) {
          const a = p.vertices[i],
            b = p.vertices[(i + 1) % p.vertices.length];
          if (a[0] * b[0] <= 0 && Math.abs(a[0] - b[0]) > 0.0001) {
            const t = -a[0] / (b[0] - a[0]);
            hits.push([a[1] + t * (b[1] - a[1]), -(a[2] + t * (b[2] - a[2]))]);
          }
        }
        shape =
          hits.length >= 2
            ? `<path d="M${hits[0]}L${hits[1]}" fill="none" stroke-width="${p.thickness}"/>`
            : "";
      } else
        shape = `<polygon points="${p.vertices
          .map(project)
          .map((a) => a.join(","))
          .join(" ")}"/>`;
    } else {
      let xx = side ? p.y : p.x,
        yy = plan ? p.y : -p.z - p.h,
        w = side ? p.d : p.w,
        h = plan ? p.d : p.h;
      if (view === "section" && p.shape === "cylinder" && axis === "z") {
        const cx = p.x + p.r,
          chord = 2 * Math.sqrt(Math.max(0, p.r * p.r - cx * cx));
        xx = p.y + p.r - chord / 2;
        w = chord;
      }
      const circle =
        p.shape === "cylinder" &&
        ((plan && axis === "z") || (!side && !plan && axis === "y"));
      shape = circle
        ? `<ellipse cx="${xx + w / 2}" cy="${yy + h / 2}" rx="${w / 2}" ry="${h / 2}"/>`
        : `<rect x="${xx}" y="${yy}" width="${w}" height="${h}"/>`;
    }
    art += `<g data-component="${p.group}" data-part="${p.id}" fill="${view === "section" ? "url(#hatch-" + model.id + ")" : color(p)}" stroke="#516157" stroke-width="${f / 24}" vector-effect="non-scaling-stroke"><title>${escapeHTML(p.id)}</title>${shape}</g>`;
  }
  const top = plan ? -D / 2 : -H,
    bottom = plan ? D / 2 : 0;
  const dim = (x1, y1, x2, y2, label) =>
    `<g stroke="#556a5a" stroke-width="${f / 30}" fill="none"><path d="M${x1} ${y1}L${x2} ${y2}"/><path d="M${x1 - f / 5} ${y1 - f / 5}l${f / 2} ${f / 2}M${x2 - f / 5} ${y2 - f / 5}l${f / 2} ${f / 2}"/></g><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - f * 0.35}" text-anchor="middle" font-size="${f * 0.65}" fill="#334b3c" ${x1 === x2 ? `transform="rotate(-90 ${(x1 + x2) / 2} ${(y1 + y2) / 2 - f * 0.35})"` : ""}>${label} mm</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-ww / 2 - pad} ${top - pad} ${ww + pad * 2} ${hh + pad * 2}" role="img" aria-label="${view} drawing of ${escapeHTML(model.name)}" style="background:#faf7ee;font-family:Arial,sans-serif"><defs><pattern id="hatch-${model.id}" width="${f * 0.4}" height="${f * 0.4}" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#e4d4b3"/><path d="M0 ${f * 0.4}L${f * 0.4} 0" stroke="#b7a47b" stroke-width="${f * 0.035}"/></pattern></defs><text x="${-ww / 2}" y="${top - f * 1.5}" font-size="${f * 0.55}" fill="#677764">${view.toUpperCase()}${view === "section" ? " A–A / X = 0" : ""} · ASSEMBLED</text>${art}${dim(-ww / 2, bottom + f * 1.2, ww / 2, bottom + f * 1.2, ww)}${dim(ww / 2 + f * 1.3, bottom, ww / 2 + f * 1.3, top, hh)}</svg>`;
}
export function scheduleCSV(model) {
  const quote = (s) => '"' + String(s).replace(/"/g, '""') + '"';
  const rows = [
    [
      "Part",
      "Assembly",
      "Material",
      "Width mm",
      "Depth mm",
      "Height mm",
      "Quantity",
      "Notes",
    ],
  ];
  for (const p of model.parts)
    rows.push([
      p.id,
      p.group,
      ["wood", "core"].includes(p.material)
        ? model.config.material
        : p.material,
      ...[p.w, p.d, p.h].map((n) => Math.round(n * 100) / 100),
      1,
      p.shape === "panel"
        ? "Inclined shade panel: bounding dimensions; not a cut pattern"
        : p.id.includes("fixing") || p.id.includes("screw")
          ? "Illustrative fixing head; not a complete fastener specification"
          : "Demonstration dimensions; verify before fabrication",
    ]);
  return rows.map((r) => r.map(quote).join(",")).join("\r\n");
}
