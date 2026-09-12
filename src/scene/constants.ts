// Scene geometry
export const SCENE = {
  roadRadius: 15,
  estateRadius: 12,
  groundRadius: 20,
  groundSegments: 96,
  // Plinth reads as the table the model sits on. Its top sits below the grass
  // disc and its radius is wider, so the lip is visible and nothing is coplanar.
  plinthRadius: 20.6,
  plinthTopY: -0.05,
  plinthHeight: 0.8,
} as const

// Road and traffic
export const ROAD = {
  width: 2.4,
  laneOffset: 0.6,
  dashLength: 0.6,
  dashGap: 0.4,
  kerbHeight: 0.04,
  kerbWidth: 0.3,
  dashYOffset: 0.08,
  roadYOffset: 0.06,
  kerbYOffset: 0.03,
} as const

export const TRAFFIC = {
  vehicleCount: 3,
  baseSpeed: 8,
  speedVariation: 0.15,
  sinusoidalFreq: 1.2,
  bankingAngle: 0.05,
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
  floorHeight: 2.6,
  defaultWallColor: COLORS.sand,
  defaultTrimColor: COLORS.ink,
  windowFrameThickness: 0.08,
  doorCanopyDepth: 0.2,
  doorStepHeight: 0.15,
} as const
