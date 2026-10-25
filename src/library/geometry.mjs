import * as k from "../../.agents/skills/anatomy/kit/iso-kit.mjs";
import * as G from "../../.agents/skills/anatomy/kit/lathe.mjs";
import * as A from "../../.agents/skills/anatomy/kit/audit.mjs";
import { turning } from "../../.agents/skills/anatomy/kit/turn-build.mjs";
import { createModel } from "./model.mjs";
import { motion, poseFor } from "./catalog.mjs";
// The upstream builder only needs Buffer for byte-array base64 packaging. Keep it unmodified.
if (typeof globalThis.Buffer === "undefined")
  globalThis.Buffer = {
    from(bytes) {
      return {
        toString(format) {
          if (format !== "base64") throw Error("Unsupported encoding");
          let s = "";
          for (const b of bytes) s += String.fromCharCode(b);
          return btoa(s);
        },
      };
    },
  };
export function compilePreset(id, input = {}, options = {}) {
  const model = createModel(id, input),
    { width: W, depth: D, height: H } = model.config;
  const P = k.fitProjection(
    k.boxCorners({ x: -W / 20, y: -D / 20, w: W / 10, d: D / 10 }, 0, H / 10),
    960,
    720,
    { pad: 60, azimuth: 38, elevation: 26 },
  );
  const R = A.recorder(P),
    T = turning(P, { recorder: R }),
    root = T.group("object", { turn: { pivot: [0, 0] } }),
    layer = T.layer("object");
  T.stack(["object"]);
  const groups = Object.fromEntries(
    model.motionGroups.map((g) => {
      const length = Math.hypot(...g.offset),
        stroke =
          g.id === "drawer"
            ? model.travel
            : g.id === "middle"
              ? model.travel / 2
              : 0;
      if (g.id === "top")
        return [
          g.id,
          T.group(g.id, {
            parent: root,
            free: { origin: [0, 0, (H - model.config.thickness / 2) / 10] },
          }),
        ];
      if (!length && !stroke) return [g.id, root];
      return [
        g.id,
        T.group(g.id, {
          parent: root,
          slide: {
            direction: length ? g.offset.map((v) => v / length) : [0, 1, 0],
            travel: (length + stroke) / 10,
          },
        }),
      ];
    }),
  );
  const rendered = model.parts.map((p) => ({ ...p, logical: p.id }));
  for (const p of rendered) {
    const name = id + "." + p.id;
    let part;
    const material = ["brass", "steel", "rubber"].includes(p.material)
      ? p.material
      : undefined;
    if (p.shape === "box")
      part = T.prism({
        name,
        group: groups[p.motion],
        layer,
        plan: {
          x: p.x / 10,
          y: p.y / 10,
          w: p.w / 10,
          d: p.d / 10,
          r: p.id === "top.panel" ? 0.6 : 0,
        },
        z: p.z / 10,
        h: p.h / 10,
        steps: 3,
        bevel: 0,
        material,
      });
    if (p.shape === "cylinder")
      part = T.round({
        name,
        group: groups[p.motion],
        layer,
        F:
          p.axis === "y"
            ? G.frameAlong([(p.x + p.r) / 10, 0, (p.z + p.r) / 10], [0, 1, 0])
            : G.frameAlong([(p.x + p.r) / 10, (p.y + p.r) / 10, 0], [0, 0, 1]),
        s0: (p.axis === "y" ? p.y : p.z) / 10,
        s1: (p.axis === "y" ? p.y + p.d : p.z + p.h) / 10,
        r: p.r / 10,
        material,
      });
    if (p.shape === "panel") {
      const vs = p.vertices.map((v) => v.map((n) => n / 10)),
        o = vs[0],
        u = G.unit3(G.sub3(vs[1], o)),
        v = G.unit3(G.sub3(vs[3], o)),
        n = G.unit3(G.cross3(u, v));
      // An orthonormal face frame preserves the exact tilted panel silhouette.
      const vv = G.unit3(G.cross3(n, u));
      const polygon = vs.map((q) => {
        const d = G.sub3(q, o);
        return [G.dot3(d, u), G.dot3(d, vv)];
      });
      part = T.prism({
        name,
        group: groups[p.motion],
        layer,
        F: { o, a: n, u, v: vv },
        polygon,
        s0: 0,
        s1: p.thickness / 10,
        bevel: 0,
      });
    }
    if (p.z === 0) for (const shape of part.shapes) shape.ground = true;
    if (p.shape === "box" && ["wood", "core"].includes(p.material)) {
      const w = p.w / 10,
        d = p.d / 10,
        h = p.h / 10;
      if (model.config.material !== "mdf" && w > 2 && d > 2) {
        const count = Math.min(40, Math.max(6, Math.floor(d * 1.1)));
        let svg = "";
        for (let i = 0; i < count; i++) {
          const y = ((i + 0.5) * d) / count,
            amp = Math.min(0.9, d * 0.02) * Math.sin(i * 1.3);
          svg += `<path d="M.1 ${y} C${w * 0.3} ${y + amp},${w * 0.5} ${y - amp},${w - 0.1} ${y}" stroke="#533c29" stroke-opacity=".28" stroke-width=".12" style="vector-effect:none" fill="none"/>`;
        }
        T.plane({
          part,
          o: [p.x / 10, p.y / 10, (p.z + p.h) / 10],
          u: [1, 0, 0],
          v: [0, 1, 0],
          normal: [0, 0, 1],
          svg,
        });
      }
      if (w > 2 && h > 0.5) {
        let svg = "";
        if (model.config.material === "ply")
          for (let z = 0.13; z < h; z += 0.17)
            svg += `<path d="M.04 ${z}H${w - 0.04}" stroke="#735c3e" stroke-opacity=".5" stroke-width=".1" style="vector-effect:none"/>`;
        else if (model.config.material === "timber")
          for (let i = 0; i < Math.min(20, Math.floor(h * 2)); i++) {
            const z = ((i + 0.5) * h) / Math.min(20, Math.floor(h * 2));
            svg += `<path d="M.04 ${z} Q${w * 0.5} ${z + 0.15},${w - 0.04} ${z}" stroke="#60452e" stroke-opacity=".25" stroke-width=".1" style="vector-effect:none" fill="none"/>`;
          }
        if (svg)
          T.plane({
            part,
            o: [p.x / 10, (p.y + p.d) / 10, p.z / 10],
            u: [1, 0, 0],
            v: [0, 0, 1],
            normal: [0, 1, 0],
            svg,
          });
      }
    }
    if (p.detail === "slot")
      T.plane({
        part,
        o: [p.x / 10, (p.y + p.d) / 10, p.z / 10],
        u: [1, 0, 0],
        v: [0, 0, 1],
        normal: [0, 1, 0],
        svg: `<rect x="${(p.w / 10) * 0.2}" y="${(p.h / 10) * 0.3}" width="${(p.w / 10) * 0.6}" height="${(p.h / 10) * 0.4}" rx=".12" fill="#4d5854"/>`,
      });
    if (p.material === "mirror")
      T.plane({
        part,
        o: [p.x / 10, (p.y + p.d) / 10, p.z / 10],
        u: [1, 0, 0],
        v: [0, 0, 1],
        normal: [0, 1, 0],
        svg: `<path d="M0 0L${(p.w / 10) * 0.4} 0L${p.w / 10} ${(p.h / 10) * 0.65}L${p.w / 10} ${p.h / 10}Z" fill="#fafbf4" opacity=".38"/>`,
      });
  }
  const poses = Array.from({ length: 37 }, (_, i) =>
    poseFor(model, motion(model, i)),
  );
  const out = T.build({ poses, verify: true, fullClouds: true });
  let svg = out.layerSvg("object", { width: 960, height: 720 });
  const byName = new Map(rendered.map((p) => [id + "." + p.id, p]));
  svg = svg.replace(/data-name="([^"]+)"/g, (a, name) => {
    const p = byName.get(name);
    return `${a} data-part="${p.logical}" data-component="${p.group}" ${["steel", "brass", "rubber"].includes(p.material) ? "" : `data-surface="${p.material}"`}`;
  });
  const result = {
    model,
    P,
    data: out.data,
    svg,
    css: out.css,
    report: out.report,
  };
  if (options.audit) return { ...result, T, R };
  return result;
}
