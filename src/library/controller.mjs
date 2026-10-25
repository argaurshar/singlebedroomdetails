import { recordStory, videoType } from "./video.mjs";
import { TURN } from "../../.agents/skills/anatomy/kit/turn.mjs";
import { iso, pathOf } from "../../.agents/skills/anatomy/kit/iso-kit.mjs";
import {
  presets,
  preset,
  defaults,
  validate,
  materials,
  chapterNames,
  motion,
  poseFor,
  ease,
  clamp,
} from "./catalog.mjs";
import { drawing, scheduleCSV, escapeHTML as esc } from "./drawings.mjs";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const text = (sel, value) => {
  const e = $(sel);
  if (e.textContent !== value) e.textContent = value;
};
const attr = (e, k, v) => {
  if (e.getAttribute(k) !== v) e.setAttribute(k, v);
};
const data = globalThis.LIBRARY_DATA,
  renderMode = new URLSearchParams(location.search).has("render"),
  reduced = matchMedia("(prefers-reduced-motion: reduce)");
let store = { favourites: [], designs: [] };
try {
  const v = JSON.parse(localStorage.getItem("room-anatomy-library") || "{}");
  if (Array.isArray(v.favourites))
    store.favourites = v.favourites.filter((id) =>
      presets.some((p) => p.id === id),
    );
  if (Array.isArray(v.designs))
    store.designs = v.designs
      .filter((d) => {
        try {
          validate(d.id, d.config);
          return typeof d.name === "string";
        } catch {
          return false;
        }
      })
      .slice(0, 30);
} catch {}
const persist = () => {
  try {
    localStorage.setItem("room-anatomy-library", JSON.stringify(store));
    return true;
  } catch {
    toast("Storage is unavailable. Export Design JSON to keep this variation.");
    return false;
  }
};
let toastTimer;
function toast(s) {
  text("#toast", s);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => text("#toast", ""), 4200);
}
function uniqueSVG(svg, prefix) {
  return svg
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}-${id})`)
    .replace(/href="#([^"]+)"/g, (_, id) => `href="#${prefix}-${id}"`);
}
let filter = "All",
  controller = null,
  built = null,
  model = null,
  t = 0,
  running = false,
  mode = "manual",
  raf = 0,
  last = 0,
  target = null,
  orbit = 0,
  zoom = 1,
  view = "3d",
  selected = "",
  selectedPart = "",
  isolated = false,
  focus = false,
  manualTravel = null,
  assembly = null,
  assemblyTarget = null,
  assemblyStart = null,
  drag = null,
  optMotion = false,
  visible = true,
  requestSeq = 0,
  busy = false;
const workerURL = URL.createObjectURL(
  new Blob([globalThis.LIBRARY_WORKER], { type: "text/javascript" }),
);
let worker;
try {
  worker = new Worker(workerURL);
} catch (e) {
  toast(
    "Dimension editing is unavailable in this browser; the preset studies still work.",
  );
}
function renderGallery() {
  const term = $("#search").value.toLowerCase().trim();
  $("#preset-grid").innerHTML = presets
    .filter(
      (p) =>
        (filter === "All" ||
          (filter === "Saved" && store.favourites.includes(p.id)) ||
          p.kind === filter) &&
        `${p.name} ${p.tag} ${p.description} ${p.id === "lamp" ? "lighting" : ""}`
          .toLowerCase()
          .includes(term),
    )
    .map(
      (p, i) =>
        `<article class="preset-card"><button class="open-card" data-open="${p.id}"><div class="thumbnail" aria-hidden="true">${uniqueSVG(data[p.id].svg, "card-" + p.id)}</div><div class="card-copy"><span class="eyebrow">${esc(p.tag.toUpperCase())}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="card-bottom"><span>${p.size.slice(0, 3).join(" × ")} mm</span><b>→</b></div></div></button><button class="card-fav" data-fav="${p.id}" aria-label="Favourite ${esc(p.name)}" aria-pressed="${store.favourites.includes(p.id)}">${store.favourites.includes(p.id) ? "♥" : "♡"}</button></article>`,
    )
    .join("");
  $("#no-results").hidden = $("#preset-grid").children.length > 0;
  $("#saved-list").innerHTML = store.designs
    .map(
      (d, i) =>
        `<div class="saved-card"><button data-saved="${i}">${esc(d.name)} <span>→</span></button><button data-delete="${i}" aria-label="Delete ${esc(d.name)}">×</button></div>`,
    )
    .join("");
  $("#saved-empty").hidden = store.designs.length > 0;
}
$("#hero-art").innerHTML = uniqueSVG(data.bedside.svg, "hero");
renderGallery();
function stop() {
  running = false;
  cancelAnimationFrame(raf);
  raf = 0;
  last = 0;
  target = null;
  assemblyTarget = null;
  assemblyStart = null;
}
function showLibrary() {
  stop();
  requestSeq++;
  busy = false;
  $("#study").hidden = true;
  $("#library").hidden = false;
  document.body.dataset.finish = "natural";
  document.body.dataset.material = "timber";
  renderGallery();
  if (location.hash !== "#library") history.replaceState(null, "", "#library");
  window.scrollTo(0, 0);
}
function setPanel(panel) {
  $$("[data-inspector]").forEach(
    (e) => (e.hidden = e.dataset.inspector !== panel),
  );
  $$("[data-panel]").forEach((e) =>
    attr(e, "aria-pressed", String(e.dataset.panel === panel)),
  );
}
$(".inspector-tabs").onclick = (e) => {
  const b = e.target.closest("[data-panel]");
  if (b) setPanel(b.dataset.panel);
};
function open(id, config = null) {
  stop();
  setPanel("inspect");
  requestSeq++;
  busy = false;
  $("#library").hidden = true;
  $("#study").hidden = false;
  view = "3d";
  selected = "";
  selectedPart = "";
  isolated = false;
  focus = false;
  orbit = 0;
  zoom = 1;
  t = 0;
  assembly = null;
  manualTravel = null;
  history.replaceState(null, "", "#" + id);
  mount(data[id]);
  if (config) rebuild(config);
  $("#study-name").setAttribute("tabindex", "-1");
  $("#study-name").focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
function mount(value) {
  if (controller?.destroy) controller.destroy();
  built = value;
  model = { ...value.model, config: { ...value.model.config } };
  const scene = $("#scene");
  scene.innerHTML = floorSVG(value) + uniqueSVG(value.svg, "study");
  controller = TURN.mount(scene, value.data, { onHold: () => stop() });
  $("#study-name").textContent = model.name;
  $("#study-tag").textContent = preset(model.id).tag.toUpperCase();
  scene.setAttribute(
    "aria-label",
    model.name + "; drag to turn or choose a component from the inspector",
  );
  $("#chapters").innerHTML = chapterNames
    .map(
      (name, i) =>
        `<li><button data-chapter="${i}" aria-current="false"><span>${i + 1}</span>${name}</button></li>`,
    )
    .join("");
  $("#component-select").innerHTML =
    '<option value="">Whole object</option>' +
    model.components
      .map((c) => `<option value="${c.id}">${esc(c.name)}</option>`)
      .join("");
  $("#part-select").innerHTML =
    '<option value="">Choose a part</option>' +
    model.parts
      .map(
        (p) =>
          `<option value="${p.id}">${esc(p.id.replaceAll(".", " / "))}</option>`,
      )
      .join("");
  const p = preset(model.id);
  $("#dimension-fields").innerHTML = ["width", "depth", "height", "thickness"]
    .map(
      (key, i) =>
        `<label>${key === "thickness" ? (model.id === "lamp" ? "Base thickness" : "Panel / frame thickness") : key[0].toUpperCase() + key.slice(1)} (mm)<input name="${key}" type="number" min="${p.limits[i][0]}" max="${p.limits[i][1]}" step="1" required value="${model.config[key]}" ${model.id === "lamp" && key === "depth" ? "readonly" : ""}><span>${p.limits[i].join("–")} mm</span></label>`,
    )
    .join("");
  $("#material").value = model.config.material;
  $("#material-label").hidden = model.kind === "Decor";
  $("#travel").max = String(model.travel);
  $("#gap").value = String(model.config.gap);
  $("#drawer-tools").hidden = !model.travel;
  $("#apply-dimensions").disabled = !worker;
  $("#apply-dimensions").textContent = "Apply dimensions";
  $("#form-error").textContent = "";
  busy = false;
  updateInspector();
  draw();
  window.libraryReady = true;
}
function floorSVG(b) {
  const { width: W, depth: D } = b.model.config,
    P = b.P;
  const x = W / 20 + 20,
    y = D / 20 + 20;
  let lines = "";
  for (let xx = -x; xx <= x; xx += 10)
    lines += `<path d="${pathOf(
      [
        [xx, -y, 0],
        [xx, y, 0],
      ].map((p) => iso(p, P)),
    )}"/>`;
  for (let yy = -y; yy <= y; yy += 10)
    lines += `<path d="${pathOf(
      [
        [-x, yy, 0],
        [x, yy, 0],
      ].map((p) => iso(p, P)),
    )}"/>`;
  return `<svg class="floor" viewBox="0 0 960 720" aria-hidden="true"><defs><filter id="floor-shadow"><feGaussianBlur stdDeviation="4"/></filter></defs><path d="${pathOf(
    [
      [-x, -y, 0],
      [x, -y, 0],
      [x, y, 0],
      [-x, y, 0],
    ].map((p) => iso(p, P)),
    true,
  )}" fill="#e0e7d4" stroke="#b8c8a8" stroke-width=".5"/><g fill="none" stroke="#b0c2a2" stroke-width=".4" opacity=".5">${lines}</g><ellipse cx="${iso([0, 0, 0], P)[0]}" cy="${iso([0, 0, 0], P)[1]}" rx="${(Math.min(W, D) * P.scale) / 25 || 100}" ry="22" fill="#557045" opacity=".12" filter="url(#floor-shadow)"/></svg>`;
}
function updateInspector() {
  if (!model) return;
  const c = model.components.find((c) => c.id === selected);
  $("#component-select").value = selected;
  $("#part-select").value = selectedPart;
  $("#part-title").textContent = c?.name || "The complete object";
  $("#part-description").textContent = c?.role || model.lesson;
  $("#connection").textContent =
    c?.connection ||
    "Select an assembly or click a visible part. Close-up keeps the connection in view; Isolate removes the surrounding context.";
  const p = model.parts.find((p) => p.id === selectedPart);
  $("#part-size").textContent = p
    ? `${p.w.toFixed(1)} × ${p.d.toFixed(1)} × ${p.h.toFixed(1)} mm · ${p.material}`
    : `${c ? model.parts.filter((p) => p.group === c.id).length : model.parts.length} modelled parts · demonstration dimensions`;
  $("#material-note").textContent =
    model.kind === "Decor"
      ? model.id === "lamp"
        ? "Metal, fabric and ceramic assemblies. Light is illustrative; no lux, power or heat result is calculated."
        : "Timber frame, mirror panel and backing. The sheen is illustrative, not a reflected scene."
      : materials[model.config.material].note;
  attr(
    $("#favourite"),
    "aria-pressed",
    String(store.favourites.includes(model.id)),
  );
  $("#favourite").textContent = store.favourites.includes(model.id)
    ? "♥ Favourite"
    : "♡ Favourite";
}
function inspect(component, part = "") {
  stop();
  setPanel("inspect");
  selected = model.components.some((c) => c.id === component) ? component : "";
  selectedPart = part;
  isolated = selected ? isolated : false;
  focus = false;
  updateInspector();
  draw();
}
function canonicalOrder() {
  controller.destroy();
  const scene = $("#scene");
  scene.innerHTML = floorSVG(built) + uniqueSVG(built.svg, "study");
  controller = TURN.mount(scene, built.data, { onHold: () => stop() });
  const order = controller.orderIndex("object"),
    rest = built.data.layers[0].rest,
    container = $('#scene [data-layer="object"]'),
    nodes = new Map(
      [...container.children].map((e) => [Number(e.dataset.p), e]),
    );
  order.set(rest);
  for (const i of rest) container.appendChild(nodes.get(i));
}
function draw() {
  if (!model) return;
  let state = motion(model, t);
  if (manualTravel !== null)
    state = {
      ...state,
      travel: manualTravel,
      clearance: model.config.gap - manualTravel,
    };
  if (assembly !== null)
    state = { ...motion(model, 0), apart: 1, travel: 0, angle: 0 };
  controller.set(poseFor(model, state, { orbit, assembly }));
  document.body.dataset.preset = model.id;
  document.body.dataset.finish = model.config.finish;
  document.body.dataset.material = model.config.material;
  const active = selected || model.focus,
    frames = controller.frames(),
    all = frames.map((f) => f.box),
    boxOf = (arr) => [
      Math.min(...arr.map((b) => b[0])),
      Math.min(...arr.map((b) => b[1])),
      Math.max(...arr.map((b) => b[2])),
      Math.max(...arr.map((b) => b[3])),
    ];
  const full = boxOf(all),
    wanted = focus
      ? selected
      : state.index === 3 && model.components.some((c) => c.id === "top")
        ? "top"
        : active,
    subset = all.filter((_, i) =>
      focus && selectedPart
        ? built.model.parts[i]?.id === selectedPart
        : built.model.parts[i]?.group === wanted,
    ),
    close = subset.length ? boxOf(subset) : full;
  const weight =
    focus && selected
      ? 1
      : assembly !== null
        ? 0
        : state.index === 2
          ? ease(state.u)
          : state.index === 3
            ? 1 - ease(state.u)
            : 0;
  const fullW = Math.max(
      (full[2] - full[0]) * 1.28,
      (((full[3] - full[1]) * 960) / 720) * 1.28,
    ),
    closeW = Math.max(
      (close[2] - close[0]) * 1.4,
      (((close[3] - close[1]) * 960) / 720) * 1.4,
      fullW * (focus && selectedPart ? 0.08 : 0.35),
    ),
    width = (fullW + (closeW - fullW) * weight) / zoom,
    cx =
      (full[0] + full[2]) / 2 +
      ((close[0] + close[2] - full[0] - full[2]) / 2) * weight,
    cy =
      (full[1] + full[3]) / 2 +
      ((close[1] + close[3] - full[1] - full[3]) / 2) * weight;
  const camera = [cx - width / 2, cy - (width * 0.75) / 2, width, width * 0.75];
  $("#scene")
    .querySelectorAll("svg")
    .forEach((s) =>
      attr(s, "viewBox", camera.map((n) => n.toFixed(4)).join(" ")),
    );
  $("#scene")
    .querySelectorAll("[data-component]")
    .forEach((e) => {
      const comp = e.dataset.component;
      let opacity =
        isolated && selected
          ? comp === selected
            ? 1
            : 0
          : comp === active
            ? 1
            : 1 - state.xray * 0.82;
      if (e.style.opacity !== String(opacity))
        e.style.opacity = String(opacity);
      e.classList.toggle(
        "is-selected",
        Boolean(
          selectedPart
            ? e.dataset.part === selectedPart
            : selected && comp === selected,
        ),
      );
    });
  $("#technical").hidden = view === "3d";
  $("#scene").hidden = view !== "3d";
  if (view !== "3d") $("#technical").innerHTML = drawing(model, view, selected);
  $$(".view-tabs button").forEach((b) =>
    attr(b, "aria-pressed", String(b.dataset.view === view)),
  );
  text(
    "#stage-count",
    assembly === null
      ? `${String(state.index + 1).padStart(2, "0")} / 07`
      : "ASSEMBLY WORKSHOP",
  );
  text(
    "#stage-title",
    assembly === null ? chapterNames[state.index] : "One connection at a time",
  );
  $$("#chapters button").forEach((b, i) =>
    attr(b, "aria-current", i === state.index ? "step" : "false"),
  );
  const lesson = [
    model.lesson,
    model.travel
      ? `The drawer travels ${model.travel} mm. Its intermediate runner moves half as far. Use the slider to test the assumed opposing gap.`
      : `Look around the ${model.name.toLowerCase()} and identify its ${model.components.find((c) => c.id === model.focus)?.name.toLowerCase()}.`,
    model.components.find((c) => c.id === active)?.connection || model.lesson,
    model.kind === "Furniture"
      ? materials[model.config.material].note
      : "Look at how the surfaces, supports and retaining pieces meet. Their finishes are illustrative.",
    "Assemblies separate along their own axes. Display gaps are exaggerated; the physical dimensions stay unchanged.",
    "Build the supports first, then the contained pieces, then the final surface or enclosure.",
    "Every component returns to the original assembly. Continue inspecting or save your variation.",
  ][state.index];
  text(
    "#lesson",
    view === "3d"
      ? lesson
      : "Assembled " +
          view +
          " drawing, generated from the physical model. Dimensions are in millimetres; this is a study reference, not a certified workshop drawing.",
  );
  text("#clock", `0:${String(Math.floor(t)).padStart(2, "0")} / 0:36`);
  $("#timeline").value = String(t);
  text("#play", running ? "Ⅱ Pause" : "▶ Play story");
  attr($("#manual"), "aria-pressed", String(mode === "manual"));
  attr($("#auto"), "aria-pressed", String(mode === "auto"));
  attr($("#isolate"), "aria-pressed", String(isolated));
  attr($("#assembly-toggle"), "aria-pressed", String(assembly !== null));
  const chips = `<span>W <b>${model.config.width}</b></span><span>D <b>${model.config.depth}</b></span><span>H <b>${model.config.height}</b></span><span>THICKNESS <b>${model.config.thickness}</b></span><span>PARTS <b>${model.parts.length}</b></span>`;
  if ($("#readouts").innerHTML !== chips) $("#readouts").innerHTML = chips;
  if (model.travel) {
    $("#travel").value = String(state.travel);
    text(
      "#clearance",
      `${Math.round(state.travel)} mm travel · ${Math.round(state.clearance)} mm ${state.clearance < 0 ? "INTERFERENCE" : "remaining geometric clearance"}`,
    );
    $("#clearance").dataset.warning = String(state.clearance < 0);
  }
  $("#assembly-prev").hidden = assembly === null;
  $("#assembly-next").hidden = assembly === null;
  const ai =
    assembly === null
      ? -1
      : Math.min(model.components.length - 1, Math.floor(assembly));
  text(
    "#assembly-caption",
    assembly === null
      ? ""
      : assembly >= model.components.length
        ? "Assembly complete. Every part is back in its physical position."
        : `${Math.floor(assembly) + 1} / ${model.components.length} · ${model.components[ai].name}: ${model.components[ai].connection}`,
  );
  $("#assembly-prev").disabled = assembly !== null && assembly <= 0;
  $("#assembly-next").disabled =
    assembly !== null && assembly >= model.components.length;
  $("#motion-opt").hidden = !reduced.matches;
  text(
    "#motion-opt",
    optMotion ? "Use reduced motion" : "Enable motion for this visit",
  );
  $$(".finishes button").forEach((b) => {
    attr(b, "aria-pressed", String(b.dataset.finish === model.config.finish));
    b.hidden =
      model.id === "lamp" && ["walnut", "sage"].includes(b.dataset.finish);
    b.setAttribute(
      "aria-label",
      model.id === "lamp"
        ? b.dataset.finish === "natural"
          ? "Brass finish"
          : "Graphite finish"
        : b.dataset.finish + " finish",
    );
  });
  text(
    "#view-hint",
    view !== "3d"
      ? "ASSEMBLED DRAWING · SELECT PARTS IN THE INSPECTOR"
      : isolated
        ? "ISOLATED ASSEMBLY · CLEAR TO RESTORE CONTEXT"
        : "DRAG / ARROW KEYS TO TURN · +/− ZOOM · SELECT A PART",
  );
  window.libraryState = {
    id: model.id,
    time: t,
    stage: state.index,
    running,
    mode,
    view,
    selected,
    selectedPart,
    isolated,
    orbit,
    zoom,
    assembly,
    config: { ...model.config },
    travel: state.travel,
    clearance: state.clearance,
    parts: model.parts.length,
    busy,
    stats: controller.stats(),
    camera,
  };
}
function tick(now) {
  if (!running) return;
  if (document.hidden || !visible) {
    last = 0;
    raf = requestAnimationFrame(tick);
    return;
  }
  const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
  last = now;
  if (assemblyTarget !== null) {
    assemblyStart ??= { value: assembly, time: now };
    const u = clamp((now - assemblyStart.time) / 800);
    assembly =
      assemblyStart.value + (assemblyTarget - assemblyStart.value) * ease(u);
    if (u >= 1) {
      assembly = assemblyTarget;
      stop();
      draw();
      return;
    }
  } else {
    t += dt;
    const end = target ?? 36;
    if (t >= end) {
      t = end < 36 ? end - 1e-7 : 36;
      if (target !== null || mode === "manual") {
        stop();
        text(
          "#status",
          "Chapter complete. Inspect or choose the next chapter.",
        );
        draw();
        return;
      }
      t = 0;
    }
  }
  draw();
  raf = requestAnimationFrame(tick);
}
function start() {
  if (renderMode || (reduced.matches && !optMotion)) return;
  running = true;
  last = 0;
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(tick);
}
function playChapter(i) {
  stop();
  manualTravel = null;
  assembly = null;
  selected = "";
  selectedPart = "";
  isolated = false;
  focus = false;
  orbit = 0;
  zoom = 1;
  $("#orbit").value = "0";
  $("#zoom").value = "1";
  t = i * 5;
  view = "3d";
  target = i === 6 ? 36 : (i + 1) * 5;
  if (renderMode || (reduced.matches && !optMotion)) {
    t = target - 1e-6;
    target = null;
  } else start();
  updateInspector();
  draw();
  text("#status", chapterNames[i] + ".");
  const b = $(`[data-chapter="${i}"]`);
  if ($("#chapters").scrollWidth > $("#chapters").clientWidth)
    $("#chapters").scrollLeft =
      b.parentElement.offsetLeft - $("#chapters").offsetLeft;
}
function reset() {
  stop();
  t = 0;
  orbit = 0;
  zoom = 1;
  assembly = null;
  manualTravel = null;
  selected = "";
  selectedPart = "";
  focus = false;
  isolated = false;
  $("#orbit").value = "0";
  $("#zoom").value = "1";
  canonicalOrder();
  updateInspector();
  draw();
  text("#status", "Study reset. Your dimensions and finish are retained.");
}
function rebuild(config) {
  if (!worker) {
    toast("This browser cannot start the local geometry worker.");
    return;
  }
  let valid;
  try {
    valid = validate(model.id, config);
  } catch (e) {
    text("#form-error", e.message);
    return;
  }
  stop();
  busy = true;
  const request = ++requestSeq;
  $("#apply-dimensions").disabled = true;
  text("#apply-dimensions", "Updating geometry…");
  text("#form-error", "");
  worker.postMessage({ request, id: model.id, config: valid });
  window.libraryReady = false;
}
if (worker)
  worker.onerror = () => {
    busy = false;
    window.libraryReady = true;
    $("#apply-dimensions").disabled = false;
    text("#apply-dimensions", "Apply dimensions");
    text(
      "#form-error",
      "The local geometry worker could not finish. Reload to try again.",
    );
  };
if (worker)
  worker.onmessage = ({ data: d }) => {
    if (d.request !== requestSeq) return;
    if (d.error) {
      busy = false;
      $("#apply-dimensions").disabled = false;
      text("#apply-dimensions", "Apply dimensions");
      text("#form-error", d.error);
      window.libraryReady = true;
      return;
    }
    t = 0;
    orbit = 0;
    zoom = 1;
    assembly = null;
    manualTravel = null;
    selected = "";
    selectedPart = "";
    focus = false;
    isolated = false;
    mount(d.result);
    toast("Geometry, dimensions and parts schedule updated.");
  };
function toggleFavourite(id) {
  store.favourites = store.favourites.includes(id)
    ? store.favourites.filter((x) => x !== id)
    : [...store.favourites, id];
  persist();
  renderGallery();
  updateInspector();
}
$("#preset-grid").addEventListener("click", (e) => {
  const fav = e.target.closest("[data-fav]"),
    o = e.target.closest("[data-open]");
  if (fav) toggleFavourite(fav.dataset.fav);
  else if (o) open(o.dataset.open);
});
$(".filters").addEventListener("click", (e) => {
  const b = e.target.closest("[data-filter]");
  if (!b) return;
  filter = b.dataset.filter;
  $$("[data-filter]").forEach((x) => attr(x, "aria-pressed", String(x === b)));
  renderGallery();
});
$("#search").addEventListener("input", renderGallery);
$("#saved-list").addEventListener("click", (e) => {
  const d = e.target.closest("[data-delete]"),
    s = e.target.closest("[data-saved]");
  if (d) {
    store.designs.splice(Number(d.dataset.delete), 1);
    persist();
    renderGallery();
  } else if (s) {
    const item = store.designs[Number(s.dataset.saved)];
    open(item.id, item.config);
  }
});
$("#hero-open").onclick = () => open("bedside");
$("#back-library").onclick = showLibrary;
window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (presets.some((p) => p.id === id)) open(id);
  else showLibrary();
});
$("#chapters").onclick = (e) => {
  const b = e.target.closest("[data-chapter]");
  if (b) playChapter(Number(b.dataset.chapter));
};
$("#reset").onclick = reset;
$("#play").onclick = () => {
  if (running) stop();
  else {
    assembly = null;
    manualTravel = null;
    if (t >= 36) t = 0;
    start();
    if (reduced.matches && !optMotion)
      playChapter(Math.min(6, Math.floor(t / 5)));
  }
  draw();
};
$("#manual").onclick = () => {
  stop();
  mode = "manual";
  draw();
};
$("#auto").onclick = () => {
  stop();
  assembly = null;
  manualTravel = null;
  mode = "auto";
  if (t >= 36) t = 0;
  start();
  draw();
};
$("#timeline").oninput = () => {
  stop();
  assembly = null;
  manualTravel = null;
  t = Number($("#timeline").value);
  draw();
};
$("#travel").oninput = () => {
  stop();
  manualTravel = Number($("#travel").value);
  draw();
};
$("#gap").oninput = () => {
  const value = Number($("#gap").value);
  if (!Number.isFinite(value) || value < 0 || value > 2000) return;
  model.config.gap = value;
  draw();
};
$(".view-tabs").onclick = (e) => {
  const b = e.target.closest("[data-view]");
  if (b) {
    stop();
    view = b.dataset.view;
    draw();
  }
};
$("#component-select").onchange = () => inspect($("#component-select").value);
$("#part-select").onchange = () => {
  const p = model.parts.find((p) => p.id === $("#part-select").value);
  inspect(p?.group || "", p?.id || "");
};
$("#clear-selection").onclick = () => inspect("");
$("#isolate").onclick = () => {
  if (!selected) {
    toast("Select an assembly first.");
    return;
  }
  stop();
  isolated = !isolated;
  draw();
};
$("#focus-part").onclick = () => {
  if (!selected) {
    inspect(model.focus);
  }
  stop();
  focus = true;
  view = "3d";
  draw();
};
$("#fit-view").onclick = () => {
  focus = false;
  zoom = 1;
  orbit = 0;
  $("#orbit").value = "0";
  $("#zoom").value = "1";
  draw();
};
$("#orbit").oninput = () => {
  stop();
  orbit = Number($("#orbit").value);
  draw();
};
$("#zoom").oninput = () => {
  stop();
  zoom = Number($("#zoom").value);
  draw();
};
$("#scene").addEventListener("pointerdown", (e) => {
  stop();
  drag = {
    x: e.clientX,
    y: e.clientY,
    angle: orbit,
    part: e.target.closest("[data-part]")?.dataset.part,
    component: e.target.closest("[data-component]")?.dataset.component,
  };
  $("#scene").setPointerCapture(e.pointerId);
});
$("#scene").addEventListener("pointermove", (e) => {
  if (!drag) return;
  if (Math.abs(e.clientX - drag.x) > 4) {
    orbit = clamp(drag.angle + (e.clientX - drag.x) * 0.45, -180, 180);
    $("#orbit").value = String(orbit);
    draw();
  }
});
$("#scene").addEventListener("pointerup", (e) => {
  if (
    drag &&
    Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5 &&
    drag.component
  )
    inspect(drag.component, drag.part);
  drag = null;
});
$("#scene").addEventListener("pointercancel", () => (drag = null));
$("#technical").onclick = (e) => {
  const p = e.target.closest("[data-part]");
  if (p) inspect(p.dataset.component, p.dataset.part);
};
$("#scene").addEventListener("keydown", (e) => {
  if (
    !["ArrowLeft", "ArrowRight", "+", "=", "-", "Home", "Escape"].includes(
      e.key,
    )
  )
    return;
  e.preventDefault();
  stop();
  if (e.key === "ArrowLeft") orbit = clamp(orbit - 10, -180, 180);
  if (e.key === "ArrowRight") orbit = clamp(orbit + 10, -180, 180);
  if (e.key === "+" || e.key === "=") zoom = clamp(zoom + 0.1, 1, 2.5);
  if (e.key === "-") zoom = clamp(zoom - 0.1, 1, 2.5);
  if (e.key === "Home") {
    orbit = 0;
    zoom = 1;
    focus = false;
  }
  if (e.key === "Escape") {
    selected = "";
    selectedPart = "";
    isolated = false;
    focus = false;
    updateInspector();
  }
  $("#orbit").value = String(orbit);
  $("#zoom").value = String(zoom);
  draw();
});
$("#motion-opt").onclick = () => {
  optMotion = !optMotion;
  stop();
  draw();
};
reduced.addEventListener("change", () => {
  optMotion = false;
  stop();
  draw();
});
new IntersectionObserver(
  (e) => {
    visible = e.at(-1).isIntersecting;
    last = 0;
  },
  { rootMargin: "120px" },
).observe($("#scene"));
document.addEventListener("visibilitychange", () => (last = 0));
$("#dimensions").onsubmit = (e) => {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(e.target));
  const config = { ...model.config };
  for (const k of ["width", "depth", "height", "thickness"])
    config[k] = Number(values[k]);
  config.material = $("#material").value;
  rebuild(config);
};
$("#restore-defaults").onclick = () => rebuild(defaults(model.id));
$(".finishes").onclick = (e) => {
  const b = e.target.closest("[data-finish]");
  if (b) {
    model.config.finish = b.dataset.finish;
    draw();
  }
};
$("#assembly-toggle").onclick = () => {
  stop();
  assembly = assembly === null ? 0 : null;
  manualTravel = null;
  view = "3d";
  t = 0;
  orbit = 0;
  draw();
};
function assemblyStep(d) {
  if (assembly === null) return;
  stop();
  const next = clamp(Math.round(assembly) + d, 0, model.components.length);
  if ((reduced.matches && !optMotion) || renderMode) {
    assembly = next;
    draw();
  } else {
    assemblyTarget = next;
    start();
    draw();
  }
}
$("#assembly-prev").onclick = () => assemblyStep(-1);
$("#assembly-next").onclick = () => assemblyStep(1);
$("#favourite").onclick = () => toggleFavourite(model.id);
$("#save-design").onclick = () => {
  $("#design-name").value = model.name + " variation";
  $("#save-dialog").showModal();
  $("#design-name").focus();
};
$("#cancel-save").onclick = () => $("#save-dialog").close();
$("#save-form").onsubmit = (e) => {
  e.preventDefault();
  store.designs.unshift({
    name: $("#design-name").value.trim().slice(0, 60) || model.name,
    id: model.id,
    config: { ...model.config },
  });
  store.designs = store.designs.slice(0, 30);
  const saved = persist();
  $("#save-dialog").close();
  renderGallery();
  if (saved) toast("Variation saved to your workbench.");
};
function download(name, type, content) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}
function svgExport() {
  if (view !== "3d") return drawing(model, view, selected);
  const scene = $("#scene"),
    camera = $("#scene svg").getAttribute("viewBox");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${camera}" class="iso iso-live" data-preset="${model.id}" data-theme="light" data-finish="${model.config.finish}" data-material="${model.config.material}" style="background:#f3f2e4"><style>${globalThis.LIBRARY_CSS}</style>${[...scene.querySelectorAll("svg")].map((s) => s.innerHTML).join("")}</svg>`;
}
$("#export-svg").onclick = () =>
  download(model.id + "-" + view + ".svg", "image/svg+xml", svgExport());
$("#export-csv").onclick = () =>
  download(
    model.id + "-parts.csv",
    "text/csv;charset=utf-8",
    scheduleCSV(model),
  );
$("#export-json").onclick = () =>
  download(
    model.id + "-design.json",
    "application/json",
    JSON.stringify({ version: 1, id: model.id, config: model.config }, null, 2),
  );
let recording = null;
$("#export-video").onclick = async () => {
  if (busy) {
    toast("Wait for the dimension update before recording.");
    return;
  }
  if (!videoType()) {
    toast(
      "Video export is unavailable in this browser. Use SVG or the study sheet.",
    );
    return;
  }
  const old = { time: t, view },
    cancel = new AbortController();
  recording = cancel;
  stop();
  view = "3d";
  selected = "";
  selectedPart = "";
  isolated = false;
  focus = false;
  updateInspector();
  $("#video-progress").value = 0;
  text("#video-status", "Recording locally. Keep this tab visible.");
  $("#video-dialog").showModal();
  try {
    const result = await recordStory({
      name: model.name,
      dimensions: `${model.config.width} × ${model.config.depth} × ${model.config.height} mm`,
      signal: cancel.signal,
      frame: (time) => {
        window.seek(time);
        return {
          svg: svgExport(),
          chapter: chapterNames[motion(model, time).index],
        };
      },
      progress: (n) => {
        $("#video-progress").value = n;
        text(
          "#video-status",
          `Recording ${Math.round(n * 100)}% · keep this tab visible`,
        );
      },
    });
    download(
      model.id + "-study." + result.extension,
      result.blob.type,
      result.blob,
    );
    toast("Video downloaded. The study is paused.");
  } catch (e) {
    toast(e.name === "AbortError" ? "Recording cancelled." : e.message);
  } finally {
    recording = null;
    window.seek(old.time);
    view = old.view;
    draw();
    $("#video-dialog").close();
  }
};
$("#cancel-video").onclick = () => recording?.abort();
$("#video-dialog").addEventListener("cancel", (e) => {
  e.preventDefault();
  recording?.abort();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) recording?.abort();
});
$("#import-json").onchange = async () => {
  const f = $("#import-json").files[0];
  if (!f) return;
  try {
    if (f.size > 10000) throw Error("Design file is too large");
    const v = JSON.parse(await f.text());
    if (v.version !== 1) throw Error("Unsupported design version");
    const cfg = validate(v.id, v.config);
    open(v.id, cfg);
  } catch (e) {
    toast("Cannot open design: " + e.message);
  } finally {
    $("#import-json").value = "";
  }
};
function studySheet() {
  const dims = model.config;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(model.name)} — study sheet</title><style>body{font:11px Arial;color:#263d31;margin:24px}h1{font:32px Georgia;margin-bottom:6px}.views{display:grid;grid-template-columns:1fr 1fr;gap:12px}.views svg{width:100%;height:260px;border:1px solid #c5cdbb}table{border-collapse:collapse;width:100%;font-size:9px}td,th{padding:5px;border-bottom:1px solid #ddd;text-align:left}header{border-bottom:1px solid #adbba5;padding-bottom:15px;margin-bottom:15px}p{line-height:1.6}.notes{page-break-before:always}@page{size:A4;margin:12mm}@media print{button{display:none}body{margin:0}}</style></head><body><button onclick="print()">Print / Save as PDF</button><header><p>ROOM ANATOMY · DEMONSTRATION STUDY</p><h1>${esc(model.name)}</h1><p>${dims.width} × ${dims.depth} × ${dims.height} mm · ${dims.thickness} mm thickness · ${esc(model.kind === "Furniture" ? materials[dims.material].name : "Mixed materials")} · ${esc(dims.finish)} finish</p></header><div class="views">${["front", "side", "plan", "section"].map((v) => drawing(model, v)).join("")}</div><p>${esc(model.lesson)} Dimensions are illustrative, not certified fabrication information. Section A–A cuts the assembled model at X = 0. No load, electrical or stability certification is implied.</p><section class="notes"><h2>Assemblies & connections</h2>${model.components.map((c) => `<p><b>${esc(c.name)}</b> — ${esc(c.connection)}</p>`).join("")}<h2>Parts schedule</h2><table><thead><tr><th>Part</th><th>Assembly</th><th>Material</th><th>W × D × H (mm)</th></tr></thead><tbody>${model.parts.map((p) => `<tr><td>${esc(p.id)}</td><td>${esc(p.group)}</td><td>${esc(["wood", "core"].includes(p.material) ? dims.material : p.material)}</td><td>${[p.w, p.d, p.h].map((n) => n.toFixed(1)).join(" × ")}</td></tr>`).join("")}</tbody></table><p>Fixing heads and shade panels are illustrative representations. Schedule dimensions are bounding dimensions, not machining allowances or flat cut patterns. Anatomy toolkit: MIT licence.</p></section></body></html>`;
}
$("#print-sheet").onclick = () => {
  stop();
  draw();
  const w = window.open("", "_blank");
  if (!w) {
    toast("Allow this study sheet to open in a new tab, then print it.");
    return;
  }
  w.document.write(studySheet());
  w.document.close();
};
window.seek = (value) => {
  if (!Number.isFinite(value)) throw TypeError("Time must be finite");
  stop();
  assembly = null;
  manualTravel = null;
  t = clamp(value, 0, 36);
  orbit = 0;
  zoom = 1;
  focus = false;
  canonicalOrder();
  draw();
  return structuredClone(window.libraryState);
};
window.libraryAPI = {
  open,
  reset,
  select: inspect,
  model: () => model,
  setView(v) {
    if (!["3d", "front", "side", "plan", "section"].includes(v))
      throw Error("Unknown view");
    view = v;
    draw();
  },
  rebuild,
  svg: svgExport,
  csv: () => scheduleCSV(model),
  sheet: studySheet,
};
const hash = location.hash.slice(1);
if (presets.some((p) => p.id === hash)) open(hash);
else showLibrary();
