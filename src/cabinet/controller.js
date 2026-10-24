const cNodes = new Map();
const c$ = (s) => {
  if (!cNodes.has(s)) cNodes.set(s, document.querySelector(s));
  return cNodes.get(s);
};
const cStage = c$("#cabinet-stage"),
  cReduced = matchMedia("(prefers-reduced-motion: reduce)"),
  cRender = new URLSearchParams(location.search).has("render");
let cTime = 0,
  cRunning = false,
  cFrame = 0,
  cLast = 0,
  cTarget = null,
  cMode = "manual",
  cFinish = "walnut",
  cOrbit = 0,
  cMotion = false,
  cVisible = true,
  cChapter = -1,
  cDrag = null,
  cExtension = null;
try {
  const p = JSON.parse(localStorage.getItem("cabinet-study") || "{}");
  if (["oak", "walnut", "sage"].includes(p.finish)) cFinish = p.finish;
} catch {}
const cSave = () => {
  try {
    localStorage.setItem("cabinet-study", JSON.stringify({ finish: cFinish }));
  } catch {}
};
c$("#chapters").innerHTML = cabinetStages
  .map(
    (s, i) =>
      `<li><button class="chapter" data-chapter="${i}" aria-current="false"><span>${i + 1}</span>${s[0]}</button></li>`,
  )
  .join("");
const cController = TURN.mount(cStage, CABINET_DATA, { onHold: () => cStop() });
const cFaces = new Map(
  [...cStage.querySelectorAll("[data-name]")].map((el) => [
    el.dataset.name,
    el,
  ]),
);
const cAnnounce = (s) => (c$("#status").textContent = s);
for (const key of ["width", "depth", "height"])
  cText("#" + key + "-readout", cabinetSpec[key] + " mm");
// Reuse shadow nodes and avoid rewriting unchanged UI during animation.
const cShadowParts = CABINET_PARTS.filter((p) => p.w && p.w * p.d > 10).map(
  (part) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "path");
    c$("#object-shadows").appendChild(node);
    return { part, node };
  },
);
function cText(selector, value) {
  const node = c$(selector);
  if (node.textContent !== value) node.textContent = value;
}
function cAttr(node, key, value) {
  if (node.getAttribute(key) !== value) node.setAttribute(key, value);
}
function cStop() {
  cancelAnimationFrame(cFrame);
  cFrame = 0;
  cRunning = false;
  cLast = 0;
  cTarget = null;
}
function cDraw() {
  const m = cabinetState(cTime, cExtension),
    pose = cabinetPose(m);
  pose.cabinet += cOrbit;
  cController.set(pose);
  const frames = cController.frames(),
    runs = cController.scene().runs;
  const boxes = frames.map((f) => f.box);
  const boxOf = (bs) => [
    Math.min(...bs.map((b) => b[0])),
    Math.min(...bs.map((b) => b[1])),
    Math.max(...bs.map((b) => b[2])),
    Math.max(...bs.map((b) => b[3])),
  ];
  const bounds = boxOf(boxes),
    runnerBox = boxOf(
      boxes.filter(
        (b, i) =>
          runs[i].name.startsWith("runner.1") ||
          runs[i].name.startsWith("bearing.1"),
      ),
    );
  const baseWidth = Math.max(
    (bounds[2] - bounds[0]) * 1.28,
    (((bounds[3] - bounds[1]) * 1000) / 760) * 1.28,
  );
  const focusWidth = Math.max(
    baseWidth / 2.1,
    (runnerBox[2] - runnerBox[0]) * 1.55,
    (((runnerBox[3] - runnerBox[1]) * 1000) / 760) * 1.55,
  );
  const width = baseWidth + (focusWidth - baseWidth) * m.focus,
    cx =
      (bounds[0] + bounds[2]) / 2 +
      ((runnerBox[0] + runnerBox[2] - bounds[0] - bounds[2]) / 2) * m.focus,
    cy =
      (bounds[1] + bounds[3]) / 2 +
      ((runnerBox[1] + runnerBox[3] - bounds[1] - bounds[3]) / 2) * m.focus;
  const camera = [cx - width / 2, cy - (width * 0.76) / 2, width, width * 0.76];
  cStage
    .querySelectorAll("svg")
    .forEach((svg) =>
      cAttr(svg, "viewBox", camera.map((v) => v.toFixed(4)).join(" ")),
    );
  for (const [name, el] of cFaces) {
    const shell = /^case\.(right|left|back)$/.test(name);
    const hide = shell
      ? 1 - m.xray * 0.9
      : /^drawer\.(right|front)/.test(name)
        ? 1 - m.xray * 0.45
        : 1;
    const opacity = String(
      /^runner\.1\.fixed/.test(name)
        ? 1 - m.xray * 0.8
        : /^runner\.1\.middle/.test(name)
          ? 1 - m.xray * 0.45
          : hide,
    );
    if (el.style.opacity !== opacity) el.style.opacity = opacity;
  }
  // A projected footprint follows the actual moving object, including its lifted parts.
  for (const { part: p, node } of cShadowParts) {
    const points = [
      [p.x, p.y, p.z],
      [p.x + p.w, p.y, p.z],
      [p.x + p.w, p.y + p.d, p.z],
      [p.x, p.y + p.d, p.z],
    ].map((v) => {
      const w = cController.anchor(p.group, v).world;
      return iso(
        [w[0] + w[2] * 0.17, w[1] + w[2] * 0.22, 0],
        CABINET_PROJECTION,
      );
    });
    cAttr(node, "d", pathOf(points, true));
  }
  if (document.body.dataset.finish !== cFinish)
    document.body.dataset.finish = cFinish;
  const active = cTime > 0 ? m.index : -1;
  cText(
    "#instruction",
    active < 0 ? "One cabinet. Every connection." : cabinetStages[m.index][1],
  );
  cText("#chapter-count", `${String(active + 1).padStart(2, "0")} / 07`);
  cText(
    "#lesson-name",
    active < 0
      ? "THE BIG IDEA"
      : `0${m.index + 1} / ${cabinetStages[m.index][0].toUpperCase()}`,
  );
  cText(
    "#explanation",
    active < 0
      ? "A cabinet is more than its surfaces. Open it, look through it, then take it apart—without losing sight of how it goes back together."
      : cabinetStages[m.index][2],
  );
  c$("#chapters")
    .querySelectorAll("button")
    .forEach((b, i) =>
      cAttr(b, "aria-current", i === m.index ? "step" : "false"),
    );
  if (cChapter !== m.index) {
    cChapter = m.index;
    const list = c$("#chapters"),
      b = list.querySelector(`[data-chapter="${m.index}"]`);
    if (list.scrollWidth > list.clientWidth)
      list.parentElement.scrollLeft = b.offsetLeft - list.offsetLeft - 5;
  }
  c$("#drawer-control").hidden = ![1, 2].includes(m.index);
  c$("#extension").value = String(Math.round(m.extension));
  cText("#clearance", `${Math.round(m.clearance)} mm remaining`);
  cText("#travel", `${Math.round(m.extension)} mm`);
  cText("#rail", `${Math.round(m.extension / 2)} mm`);
  c$("#travel-chip").classList.toggle("hot", m.index === 1 || m.index === 3);
  c$("#rail-chip").classList.toggle("hot", m.index === 2);
  c$("#scrub").value = String(Math.round(cTime * 100));
  cText("#time", `0:${String(Math.floor(cTime)).padStart(2, "0")} / 0:36`);
  cText(
    "#play",
    cRunning
      ? "Ⅱ Pause"
      : cTime === 0
        ? "▶ Play the story"
        : "▶ Continue story",
  );
  for (const name of ["manual", "auto"])
    cAttr(c$("#" + name), "aria-pressed", String(name === cMode));
  document.querySelectorAll("[data-finish]").forEach((b) => {
    if (b.tagName === "BUTTON")
      cAttr(b, "aria-pressed", String(b.dataset.finish === cFinish));
  });
  c$("#motion").hidden = !cReduced.matches;
  cText(
    "#motion",
    cMotion ? "Use reduced motion" : "Enable animation for this visit",
  );
  cText(
    "#view-note",
    m.focus > 0.5
      ? "RUNNER CUTAWAY · CASE FADED FOR VISIBILITY"
      : m.explode > 0.1 || m.join > 0.1
        ? "EXPLODED STUDY · DISPLAY GAPS EXAGGERATED"
        : "DRAG TO TURN · SCROLL THE PAGE NORMALLY",
  );
  window.cabinetState = {
    ...m,
    running: cRunning,
    mode: cMode,
    finish: cFinish,
    orbit: cOrbit,
    camera,
    bounds,
    renderMode: cRender,
    parts: CABINET_PARTS.length,
    stats: cController.stats(),
  };
}
function cTick(now) {
  if (!cRunning) return;
  if (document.hidden || !cVisible) {
    cLast = 0;
    cFrame = requestAnimationFrame(cTick);
    return;
  }
  const dt = cLast ? Math.min((now - cLast) / 1000, 1 / 30) : 0;
  cLast = now;
  cTime += dt;
  const end = cTarget ?? 36;
  if (cTime >= end) {
    cTime = cTarget !== null && end < 36 ? end - 1e-7 : end;
    if (cTarget !== null || cMode === "manual") {
      cStop();
      cAnnounce(
        "Chapter complete. Choose the next chapter or continue the story.",
      );
      cDraw();
      return;
    }
    cTime = 0;
  }
  cDraw();
  cFrame = requestAnimationFrame(cTick);
}
function cStart() {
  cExtension = null;
  if (cRender || (cReduced.matches && !cMotion)) return;
  cRunning = true;
  cLast = 0;
  cancelAnimationFrame(cFrame);
  cFrame = requestAnimationFrame(cTick);
}
function cChapterPlay(i) {
  cStop();
  cExtension = null;
  cOrbit = 0;
  c$("#orbit").value = "0";
  cTime = i * 5;
  cTarget = i === 6 ? 36 : (i + 1) * 5;
  if ((cReduced.matches && !cMotion) || cRender) {
    cTime = cTarget - 1e-6;
    cTarget = null;
  } else cStart();
  cAnnounce(cabinetStages[i][0] + ".");
  cDraw();
}
c$("#chapters").addEventListener("click", (e) => {
  const b = e.target.closest("[data-chapter]");
  if (b) cChapterPlay(Number(b.dataset.chapter));
});
c$("#play").addEventListener("click", () => {
  if (cRunning) {
    cStop();
    cAnnounce("Paused. Scrub or turn the cabinet to inspect it.");
  } else if (cReduced.matches && !cMotion) {
    cChapterPlay(Math.min(6, Math.floor((cTime + 0.001) / 5)));
    return;
  } else {
    cStop();
    if (cTime >= 36) cTime = 0;
    cStart();
  }
  cDraw();
});
c$("#manual").addEventListener("click", () => {
  cStop();
  cMode = "manual";
  cDraw();
  cAnnounce("Manual. Choose a chapter to animate.");
});
c$("#auto").addEventListener("click", () => {
  cStop();
  cMode = "auto";
  if (cTime >= 36) cTime = 0;
  cStart();
  cDraw();
  cAnnounce(
    cReduced.matches && !cMotion
      ? "Reduced motion. Choose a chapter for its settled view."
      : "Auto story playing.",
  );
});
function cReset() {
  cStop();
  cCanonicalOrder();
  cExtension = null;
  cTime = 0;
  cOrbit = 0;
  c$("#orbit").value = "0";
  cAnnounce("Cabinet assembled. Choose a chapter to begin.");
  cDraw();
}
c$("#reset").addEventListener("click", cReset);
c$("#scrub").addEventListener("input", () => {
  cStop();
  cExtension = null;
  cTime = Number(c$("#scrub").value) / 100;
  cDraw();
});
c$("#extension").addEventListener("input", () => {
  cStop();
  cExtension = Number(c$("#extension").value);
  cDraw();
});
c$("#orbit").addEventListener("input", () => {
  cStop();
  cOrbit = Number(c$("#orbit").value);
  cDraw();
});
c$("#home-view").addEventListener("click", () => {
  cOrbit = 0;
  c$("#orbit").value = "0";
  cDraw();
});
document.querySelector(".finishes").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-finish]");
  if (b) {
    cFinish = b.dataset.finish;
    cSave();
    cDraw();
  }
});
c$("#motion").addEventListener("click", () => {
  cMotion = !cMotion;
  cStop();
  cDraw();
});
cReduced.addEventListener("change", () => {
  cMotion = false;
  cStop();
  cDraw();
});
cStage.addEventListener("pointerdown", (e) => {
  cStop();
  cDrag = { x: e.clientX, angle: cOrbit };
  cStage.setPointerCapture(e.pointerId);
});
cStage.addEventListener("pointermove", (e) => {
  if (!cDrag) return;
  cOrbit = cClamp(cDrag.angle + (e.clientX - cDrag.x) * 0.45, -180, 180);
  c$("#orbit").value = String(cOrbit);
  cDraw();
});
for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
  cStage.addEventListener(event, () => (cDrag = null));
new IntersectionObserver(
  (entries) => {
    cVisible = entries.at(-1).isIntersecting;
    cLast = 0;
  },
  { rootMargin: "120px" },
).observe(cStage);
document.addEventListener("visibilitychange", () => (cLast = 0));
// Canonical capture also resets tie order for touching/disjoint SVG solids.
// Live playback retains the engine's incremental order for smooth, cheap updates.
function cCanonicalOrder() {
  const order = cController.orderIndex("object"),
    rest = CABINET_DATA.layers[0].rest;
  const container = cStage.querySelector('[data-layer="object"]');
  const nodes = new Map(
    [...container.children].map((el) => [Number(el.dataset.p), el]),
  );
  order.set(rest);
  for (const i of rest) container.appendChild(nodes.get(i));
}
window.seek = (t) => {
  if (!Number.isFinite(t)) throw new TypeError("Time must be finite");
  cStop();
  cCanonicalOrder();
  cExtension = null;
  cTime = cClamp(t, 0, 36);
  cOrbit = 0;
  c$("#orbit").value = "0";
  cAnnounce("Paused for inspection. Scrub or choose a chapter.");
  cDraw();
  return structuredClone(window.cabinetState);
};
window.cabinetAPI = {
  evaluate: cabinetState,
  pose: cabinetPose,
  spec: cabinetSpec,
  reset: cReset,
};
cDraw();
