import { ease } from "./catalog.mjs";

const boxOf = (boxes) => [
  Math.min(...boxes.map((b) => b[0])),
  Math.min(...boxes.map((b) => b[1])),
  Math.max(...boxes.map((b) => b[2])),
  Math.max(...boxes.map((b) => b[3])),
];
const fit = (box, padding, minimum = 0) => [
  (box[0] + box[2]) / 2,
  (box[1] + box[3]) / 2,
  Math.max(
    (box[2] - box[0]) * padding,
    ((box[3] - box[1]) * 4 * padding) / 3,
    minimum,
  ),
];
const mix = (a, b, weight) => a.map((v, i) => v + (b[i] - v) * weight);

/** Collapse render subdivisions back to the physical model's stable part order. */
export function physicalPartBoxes(model, renderParts, boxes) {
  const byPart = new Map();
  renderParts.forEach((part, i) => {
    const group = byPart.get(part.logical) || [];
    group.push(boxes[i]);
    byPart.set(part.logical, group);
  });
  return model.parts.map((part) => boxOf(byPart.get(part.id)));
}

/** Pure framing from projected physical parts; camera offsets never enter the model. */
export function cameraFor(
  model,
  state,
  boxes,
  {
    selected = "",
    selectedPart = "",
    focus = false,
    assembly = null,
    zoom = 1,
  } = {},
) {
  const fullBox = boxOf(boxes),
    full = fit(fullBox, 1.28);
  const close = (component, part = "") => {
    const matching = boxes.filter((_, i) =>
      part ? model.parts[i]?.id === part : model.parts[i]?.group === component,
    );
    return fit(
      matching.length ? boxOf(matching) : fullBox,
      1.4,
      full[2] * (part ? 0.08 : 0.35),
    );
  };
  let framed = full;
  if (focus && selected) framed = close(selected, selectedPart);
  else if (assembly === null) {
    const inspection = close(selected || model.focus);
    if (state.index === 2) framed = mix(full, inspection, ease(state.u));
    else if (state.index === 3) {
      const material = model.components.some((c) => c.id === "top")
        ? close("top")
        : inspection;
      // Begin exactly at the previous chapter's connection view. Move to the
      // material view, then widen to the complete object before the explosion.
      // Both eased hand-offs have zero endpoint velocity, including at u = .5.
      const handoff = mix(inspection, material, ease(state.u * 2));
      framed = mix(handoff, full, ease((state.u - 0.5) * 2));
    }
  }
  const [cx, cy] = framed,
    width = framed[2] / zoom;
  return [cx - width / 2, cy - (width * 0.75) / 2, width, width * 0.75];
}
