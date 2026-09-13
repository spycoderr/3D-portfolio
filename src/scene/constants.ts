import { palette } from '@/theme'

// Scene geometry. The estate reads from the middle out: park, ring road, then
// the plots facing inward from beyond it.
export const SCENE = {
  // Control radii for the ring road loop. Varying them gives the curvature the
  // cars bank into; the list is fixed so the layout is identical every load.
  roadControlRadii: [11.9, 11.4, 10.9, 10.8, 11.1, 11.7, 11.8, 11.2],
} as const

// The floating slab. Its thick exposed edge is what makes the estate read as a
// model on a table rather than a world with a horizon, so the edge is the one
// dimension worth being generous with.
export const SLAB = {
  width: 38,
  depth: 38,
  cornerRadius: 6,
  thickness: 1.05,
  // A slight chamfer catches the light where grass meets soil, so the two
  // materials never meet in a hard black line.
  bevel: 0.09,
  bevelSegments: 2,
  // Resolution of the rounded corners.
  curveSegments: 14,
  // Everything on the model is laid out relative to a top surface at y = 0, so
  // the road and prop heights never need to know the slab is there at all.
  topY: 0,
  // Usable ground stops short of the lip, so nothing hangs over the edge.
  margin: 1.6,
  // The slab floats, so its shadow lands on nothing: one large blurred plane
  // below it does the whole job of grounding the model in the void.
  shadowDrop: 1.5,
  shadowScale: 1.16,
  shadowOpacity: 0.17,
  shadowTextureSize: 256,
} as const

// Road. Every surface gets its own y so no two are ever coplanar.
export const ROAD = {
  width: 2.4,
  laneOffset: 0.6,
  kerbWidth: 0.35,
  dashLength: 0.6,
  dashGap: 0.4,
  dashWidth: 0.11,
  // Resolution of the ribbon. High enough that the outer edge reads as a smooth
  // curve rather than a polygon at the closest camera distance.
  segments: 260,
  kerbY: 0.03,
  roadY: 0.06,
  dashY: 0.08,
  arcLengthDivisions: 2000,
} as const

export const DRIVEWAY = {
  width: 1.5,
  // Above the kerb it crosses, below nothing else.
  y: 0.05,
} as const

export const TRAFFIC = {
  // Two vehicles one way, one the other.
  directions: [1, 1, -1],
  startOffsets: [0, 0.42, 0.73],
  speedScales: [1, 0.88, 0.95],
  baseSpeed: 3.2,
  // A touch of wander so they never look metronomic.
  wanderAmplitude: 0.06,
  wanderFrequency: 0.8,
  maxBank: 0.052,
  bankScale: 9,
  bodyLength: 1.7,
  bodyWidth: 0.8,
  bodyHeight: 0.38,
  bodyCentreY: 0.26,
  cabinLength: 0.78,
  cabinWidth: 0.68,
  cabinHeight: 0.3,
  cabinOffsetZ: -0.12,
  wheelRadius: 0.13,
  wheelWidth: 0.12,
  track: 0.74,
  wheelbase: 0.98,
  colors: ['#c2603f', '#37506b', '#f3efe6'],
} as const

// Camera
export const CAMERA = {
  fov: 50,
  near: 0.1,
  far: 150,
  // Distance is set by the narrowest viewport the canvas gets: the desktop
  // right column is taller than wide, so horizontal FOV frames the plinth.
  homePosition: [20.4, 31.5, 50.6] as [number, number, number],
  homeTarget: [0, 0, 0] as [number, number, number],
  defaultDistance: 63,
  minDistance: 28,
  maxDistance: 88,
  minPolarAngle: 0.5,
  maxPolarAngle: 1.35,
  rotateSpeed: 0.55,
  zoomSpeed: 0.7,
  dampingFactor: 0.06,
  idleDriftSpeed: 0.015,
  idleDelay: 4,
  transitionDuration: 1.1,
  // A backgrounded tab resumes with one enormous delta; clamping it stops the
  // drift from lurching on the first frame back.
  maxFrameDelta: 0.05,
} as const

// How the camera frames a selected plot. Every value is derived from the plot's
// own geometry, so no building ever needs a hand-placed camera.
export const FOCUS = {
  distanceScale: 2.8,
  elevation: 0.62,
  // Swings off the radial axis so two faces of the building are visible.
  azimuthOffset: 0.6,
  targetHeightFactor: 0.55,
  // Pushes the look-at point right so the building sits clear of the panel.
  panelShiftFactor: 0.22,
  minDistanceFactor: 0.6,
  maxDistanceFactor: 1.8,
  interiorDistanceFactor: 0.42,
  interiorElevation: 0.3,
  interiorAzimuthArc: 0.5,
} as const

// Lighting
export const LIGHTING = {
  hemiIntensity: 0.85,
  hemiSky: "#dcecf5",
  hemiGround: "#6f7a5c",
  directionalIntensity: 0.95,
  directionalColor: "#fff3e0",
  // Far enough out that the shadow frustum stays tight around the estate.
  directionalPosition: [26, 34, 20] as [number, number, number],
  shadowMapSize: 2048,
  shadowBias: -0.0005,
  shadowNormalBias: 0.02,
  // PCFSoftShadowMap was removed in three r186, so softness comes from the PCF
  // kernel radius instead. Cheaper than PCSS, which the frame budget rules out.
  shadowRadius: 3,
  shadowExtent: 24,
  shadowNear: 20,
  shadowFar: 80,
} as const

// The park inside the ring road, and the estate dressing around it.
export const PARK = {
  pondCentre: [-1.8, -1.5] as [number, number],
  pondRadius: 3.0,
  pondY: 0.025,
  pathInnerRadius: 5.0,
  pathOuterRadius: 5.9,
  pathY: 0.022,
  benchCount: 4,
  benchRadius: 4.2,
} as const

export const ESTATE = {
  treeCount: 84,
  treeSeed: 20280512,
  treeClearanceFromRoad: 2.4,
  treeClearanceFromPlot: 3.4,
  treeClearanceFromPond: 1.2,
  treeMinSpacing: 1.5,
  // Trees have to reach the lip now that the ground is a slab, or the rounded
  // corners read as bald patches.
  treeSlabMargin: 2.5,
  lampCount: 14,
  lampHeight: 1.5,
  noticeBoardWidth: 1.5,
  noticeBoardHeight: 0.95,
  noticeBoardPostHeight: 0.75,
} as const

// The wall and hedge that run the slab's perimeter, and the one gap in them
// where the society is entered.
export const BOUNDARY = {
  inset: 1.5,
  wallHeight: 0.42,
  wallThickness: 0.26,
  hedgeHeight: 0.55,
  hedgeThickness: 0.44,
  // Sampling resolution around the outline. High enough that the rounded
  // corners read as curves rather than facets.
  divisions: 168,
  // Fraction of the outline left open for the gate, centred on gateAt.
  gateAt: 0.375,
  gateSpan: 0.035,
  gatePillarHeight: 1.55,
  gatePillarSize: 0.5,
  gateArchHeight: 0.24,
} as const

// Plot names marked into the grass beside each building. Kept close to the
// grass tone so they read as terrain marking rather than a label floating in
// the scene, and lifted only when that plot is being looked at.
export const GROUND_LABEL = {
  width: 2.5,
  height: 0.62,
  // Clear of the grass without ever reaching the kerb it sits next to.
  y: 0.02,
  offsetX: 1.15,
  offsetZ: 0.45,
  restOpacity: 0.26,
  activeOpacity: 0.95,
  // Per-second decay for the fade, frame-rate independent via 1 - decay^dt.
  fadeDecay: 0.0001,
  cellWidth: 512,
  cellHeight: 128,
  fontSize: 74,
} as const

// Painted crossings where each plot's spur meets the ring road.
export const CROSSING = {
  stripeCount: 5,
  stripeWidth: 0.2,
  stripeGap: 0.19,
  y: 0.085,
} as const

// The community block on the central green: the one building that belongs to
// the society rather than to a project.
export const COMMUNITY = {
  position: [4.3, 0, -3.4] as [number, number, number],
  rotation: -0.5,
  width: 3.1,
  depth: 1.9,
  height: 1.15,
  roofOverhang: 0.16,
  roofHeight: 0.2,
} as const

// Colours all come from the theme; this is the scene's view of it under the
// names the geometry already speaks. The theme file is the only place a colour
// is ever chosen.
export const COLORS = {
  sky: palette.groundFar,
  grass: palette.slabTop,
  grassDark: palette.grassDark,
  road: palette.road,
  kerb: palette.kerb,
  sand: palette.sand,
  brick: palette.clay,
  slate: palette.indigo,
  moss: palette.sage,
  ink: palette.ink,
  paper: palette.paper,
  windowDark: palette.windowDark,
  windowLight: palette.windowLit,
  slabEdge: palette.slabEdge,
  roadMark: palette.roadMark,
  pad: palette.pad,
  padHighlight: palette.padHighlight,
  water: palette.water,
  path: palette.path,
  trunk: palette.trunk,
  foliage: palette.foliage,
  foliageDark: palette.foliageDark,
  hedge: palette.hedge,
  wood: palette.wood,
  woodDark: palette.woodDark,
  fabric: palette.fabric,
  rug: palette.rug,
  pot: palette.pot,
  leaf: palette.leaf,
  screenFrame: palette.screenFrame,
  screenBg: palette.screenBg,
  shelfBlock: palette.shelfBlock,
  brass: palette.brass,
} as const

// Typography (px)
export const TYPOGRAPHY = {
  scale: [13, 15, 18, 24, 34, 56, 84] as const,
  maxLineLength: 66,
  fontDisplay: "'Bricolage Grotesque', sans-serif",
  fontBody: "'Inter', sans-serif",
  weightLight: 300,
  weightRegular: 400,
  weightMedium: 500,
  weightBold: 700,
} as const

// UI/Animation
export const UI = {
  revealDurationMs: 700,
  // Frames rendered before the scene is revealed, so shaders are compiled
  // and the first visible frame is never a stutter.
  warmupFrames: 3,
  hoverLiftDistance: 0.15,
  // Per-second decay for the lift. Frame-rate independent via
  // 1 - decay^dt, which settles in roughly a third of a second.
  hoverLiftDecay: 0.00002,
  // Pointer travel between down and up beyond which it was a drag, not a click.
  dragThresholdPx: 6,
  // Holding the hover briefly stops it flickering when the pointer crosses a
  // seam or passes between two buildings.
  hoverReleaseMs: 60,
  // The detail panel slides in from the right on desktop, up from the bottom
  // on mobile. Short enough to feel attached to the camera flight it follows.
  panelTransitionMs: 260,
} as const

// The budget the scene is held to, and the levers for meeting it on hardware
// slower than the machine it was built on.
export const PERF = {
  // Retina is worth it where there is headroom for it. On a weaker GPU the
  // extra 78% of pixels buys nothing a visitor would ever notice.
  maxPixelRatio: 2,
  maxPixelRatioLowTier: 1.5,
  // At or below these a device is treated as low tier. Read once, at boot.
  lowTierCores: 4,
  lowTierMemoryGb: 4,
} as const

// Opening a building: the roof leads, the near walls follow, and the whole
// sequence is one orchestrated move rather than two independent tweens.
export const REVEAL = {
  durationSeconds: 0.9,
  // Fractions of the sequence. The roof starts immediately and the walls a
  // beat later, both finishing together.
  roofSpan: 0.833,
  wallDelay: 0.167,
  wallSpan: 0.833,
  roofLift: 1.15,
  roofDrift: 0.12,
  // Walls facing the camera thin out to this; walls edge-on stay solid.
  wallMinOpacity: 0.08,
  // Dot product at which a wall is treated as fully facing the camera.
  wallFadeThreshold: 0.42,
  wallThickness: 0.12,
} as const

// The furnished room inside the top storey, in units relative to that storey.
export const INTERIOR = {
  floorThickness: 0.06,
  deskHeight: 0.44,
  deskWidth: 1.15,
  deskDepth: 0.5,
  deskTopThickness: 0.05,
  chairSeatHeight: 0.25,
  monitorWidth: 0.52,
  monitorHeight: 0.34,
  monitorStandHeight: 0.1,
  shelfWidth: 0.95,
  shelfBoardThickness: 0.04,
  shelfLowerY: 0.62,
  shelfUpperY: 0.98,
  blockSize: 0.14,
  posterWidth: 0.62,
  posterHeight: 0.42,
  posterY: 0.95,
  rugWidth: 1.25,
  rugDepth: 0.95,
  plantPotRadius: 0.13,
  plantPotHeight: 0.17,
  lampHeight: 0.3,
} as const

// Building defaults
export const BUILDING = {
  floorHeight: 1.55,
  // The pad gives each building an address. It clears the grass by more than
  // the z-fighting margin rather than sitting on it.
  padMargin: 0.6,
  padBaseY: 0.02,
  padHeight: 0.08,
  // Each storey steps in slightly, so stacked floors read as a building rather
  // than one extruded box.
  setback: 0.13,
  roofHeight: 0.82,
  hipInset: 0.28,
  parapetHeight: 0.26,
  parapetThickness: 0.1,
  railingHeight: 0.34,
  railingThickness: 0.06,
  windowWidth: 0.46,
  windowHeight: 0.6,
  windowRecess: 0.06,
  windowSpacing: 0.92,
  windowSillHeight: 0.62,
  frameThickness: 0.06,
  frameDepth: 0.07,
  doorWidth: 0.6,
  doorHeight: 1.1,
  doorStepHeight: 0.07,
  doorStepDepth: 0.3,
  canopyDepth: 0.4,
  canopyThickness: 0.07,
  nameplateWidth: 0.44,
  nameplateHeight: 0.26,
  nameplatePostHeight: 0.5,
} as const
