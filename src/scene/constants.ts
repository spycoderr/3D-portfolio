// Scene geometry. The estate reads from the middle out: park, ring road, then
// the plots facing inward from beyond it.
export const SCENE = {
  // Control radii for the ring road loop. Varying them gives the curvature the
  // cars bank into; the list is fixed so the layout is identical every load.
  roadControlRadii: [11.9, 11.4, 10.9, 10.8, 11.1, 11.7, 11.8, 11.2],
  groundRadius: 20,
  groundSegments: 96,
  // Plinth reads as the table the model sits on. Its top sits below the grass
  // disc and its radius is wider, so the lip is visible and nothing is coplanar.
  plinthRadius: 20.6,
  plinthTopY: -0.05,
  plinthHeight: 0.8,
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
  homePosition: [17.8, 27.5, 44.1] as [number, number, number],
  homeTarget: [0, 0, 0] as [number, number, number],
  defaultDistance: 55,
  minDistance: 24,
  maxDistance: 72,
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
  distanceScale: 2.6,
  floorBonus: 1.2,
  elevation: 0.62,
  // Swings off the radial axis so two faces of the building are visible.
  azimuthOffset: 0.6,
  targetHeightFactor: 0.55,
  // Pushes the look-at point right so the building sits clear of the panel.
  panelShiftFactor: 0.26,
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
  treeCount: 56,
  treeSeed: 20280512,
  treeClearanceFromRoad: 2.4,
  treeClearanceFromPlot: 3.4,
  treeClearanceFromPond: 1.2,
  treeMinSpacing: 1.5,
  lampCount: 14,
  lampHeight: 1.5,
  hedgeRadius: 18.9,
  hedgeTube: 0.34,
  hedgeSquash: 0.55,
  gateU: 0.52,
  gatePillarHeight: 1.9,
  gateArchHeight: 0.26,
  noticeBoardWidth: 1.5,
  noticeBoardHeight: 0.95,
  noticeBoardPostHeight: 0.75,
} as const

// Colors (hex)
export const COLORS = {
  sky: "#cfe0ea",
  grass: "#8fb56a",
  grassDark: "#6f9a55",
  road: "#5f6771",
  kerb: "#cfc9b8",
  sand: "#e6ddca",
  brick: "#c2603f",
  slate: "#37506b",
  moss: "#4e7a4a",
  ink: "#1d2430",
  paper: "#f3efe6",
  windowDark: "#2a3a4a",
  windowLight: "#e8f0f8",
  plinth: "#bdb7a6",
  pad: "#9cc077",
  padHighlight: "#b6d68f",
  water: "#6f9fb5",
  path: "#d8d0bd",
  trunk: "#7a5b42",
  foliage: "#5c8a4a",
  foliageDark: "#4a7440",
  hedge: "#587f45",
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
  hoverLiftDuration: 0.3,
  interactionThreshold: 6,
  debounceHoverMs: 50,
  buildingPadOffset: 0.08,
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
