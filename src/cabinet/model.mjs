export const cabinetSpec = Object.freeze({
  width: 600,
  depth: 450,
  height: 650,
  top: 30,
  caseThickness: 20,
  drawerTravel: 320,
  drawerWidth: 470,
  drawerDepth: 360,
  drawerHeight: 150,
  railLength: 340,
  gap: 800,
});
export const cabinetStages = [
  [
    "Turn it around",
    "One cabinet, from every side.",
    "The oak top overhangs a framed carcass. Four tapered legs lift the cabinet off the floor. Turn the object to see its back and the way the parts meet.",
  ],
  [
    "Open the drawer",
    "The box moves. The cabinet stays.",
    "Pull the brass handle: the front, sides, back and base travel together. The drawer moves 320 mm in this demonstration, leaving 480 mm of an assumed 800 mm gap.",
  ],
  [
    "Follow the runners",
    "Three nested rails make one stroke.",
    "The outer channel stays fixed. The intermediate channel travels half as far as the drawer; the inner channel follows it. The side becomes transparent so the bearings remain visible.",
  ],
  [
    "Reveal the joinery",
    "A drawer is a small assembly.",
    "The wooden box lifts clear of the runners, then its front, sides and base separate. The base seats against the box sides; mounting spacers connect the decorative front. Display gaps are exaggerated.",
  ],
  [
    "Read the material",
    "A surface has thickness and an edge.",
    "The 30 mm oak top lifts and turns, revealing the underside and softened perimeter. Grain belongs to the face and rotates with it. This is a material study, not a finish-performance claim.",
  ],
  [
    "Take it apart",
    "The same cabinet, fully separated.",
    "The top, carcass, drawer and hardware separate along their own axes. The runners stay registered with their moving groups. Exploded offsets do not change any physical dimensions.",
  ],
  [
    "Put it together",
    "Every part returns to its place.",
    "Assembly reverses: case panels align, the drawer box closes, the runners retract and the top settles. The final cabinet is exactly the starting object.",
  ],
];
export const cClamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const cEase = (x) => {
  x = cClamp(x);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const cMix = (a, b, t) => a + (b - a) * cEase(t);
export function cabinetState(time = 0, extension = null) {
  if (!Number.isFinite(time)) throw new TypeError("Time must be finite");
  if (
    extension !== null &&
    (!Number.isFinite(extension) ||
      extension < 0 ||
      extension > cabinetSpec.drawerTravel)
  )
    throw new RangeError("Extension must be 0–320 mm");
  const t = cClamp(time, 0, 36),
    index = Math.min(6, Math.floor(t / 5)),
    u = (t - index * 5) / (index === 6 ? 6 : 5);
  const stroke = cabinetSpec.drawerTravel / 10;
  let angle = 0,
    travel = 0,
    lift = 0,
    tilt = 0,
    join = 0,
    explode = 0,
    xray = 0,
    focus = 0,
    boxLift = 0;
  if (index === 0) angle = cMix(0, 160, u);
  if (index === 1) {
    angle = cMix(160, 360, u / 0.62);
    travel = stroke * cEase((u - 0.38) / 0.62);
  }
  if (index === 2) {
    angle = 360 - 18 * cEase(u);
    travel = stroke;
    lift = 18 * cEase(u);
    xray = cEase(u);
    focus = cEase(u);
  }
  if (index === 3) {
    angle = cMix(342, 372, u);
    travel = stroke;
    lift = cMix(18, 27, u);
    xray = 1 - cEase(u);
    focus = 1 - cEase(u);
    boxLift = 24 * cEase(u / 0.4);
    join = cEase((u - 0.42) / 0.58);
  }
  if (index === 4) {
    boxLift = 24;
    angle = cMix(372, 345, u);
    travel = stroke;
    lift = 27;
    join = 1;
    tilt = 65 * cEase((u - 0.12) / 0.88);
  }
  if (index === 5) {
    boxLift = 24;
    angle = cMix(345, 375, u);
    travel = stroke;
    lift = cMix(27, 39, u);
    join = 1;
    tilt = cMix(65, 12, u);
    explode = cEase(u);
  }
  // Close the separated sides first, lower the drawer box, then seat the top.
  if (index === 6) {
    boxLift = 24 * (1 - cEase((u - 0.42) / 0.28));
    const close = cEase(u);
    angle = cMix(375, 360, u);
    travel = stroke * (1 - cEase((u - 0.35) / 0.55));
    lift = 39 * (1 - cEase((u - 0.72) / 0.28));
    join = 1 - cEase(u / 0.4);
    tilt = 12 * (1 - close);
    explode = 1 - cEase(u / 0.4);
  }
  if (extension !== null) travel = extension / 10;
  return {
    time: t,
    index,
    u: cClamp(u),
    angle,
    travel,
    lift,
    tilt,
    join,
    explode,
    xray,
    focus,
    boxLift,
    extension: travel * 10,
    clearance: cabinetSpec.gap - travel * 10,
  };
}
export function cabinetPose(m) {
  const free = (t, angle = 0) => ({ axis: [1, 0, 0], angle, t });
  return {
    cabinet: m.angle,
    drawer: m.travel,
    middle: m.travel / 2,
    bearingOuter: m.travel / 4,
    bearingInner: m.travel * 0.75,
    box: free([0, 0, m.boxLift]),
    top: free([0, 0, m.lift], m.tilt),
    left: free([-25 * m.explode, 0, 0]),
    right: free([25 * m.explode, 0, 0]),
    back: free([0, -25 * m.explode, 0]),
    front: free([0, 10 * m.join + 18 * m.explode, 0]),
    drawerLeft: free([-12 * m.join, 0, 0]),
    drawerRight: free([12 * m.join, 0, 0]),
    drawerBase: free([0, 0, -10 * m.join]),
    drawerBack: free([0, -9 * m.join, 0]),
  };
}
