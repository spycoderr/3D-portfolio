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
  // Cars don't cast real shadows: they move every frame, and a moving caster
  // would force the whole shadow map to redraw every frame. A soft blob under
  // each one grounds it instead, drawn just above the road markings.
  blobLength: 2.0,
  blobWidth: 1.05,
  blobY: 0.092,
  blobOpacity: 0.32,
  blobTextureSize: 64,
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
  // Seconds untouched at campus level before the camera starts to drift.
  idleDelay: 5,
  // A backgrounded tab resumes with one enormous delta; clamping it stops the
  // drift from lurching on the first frame back.
  maxFrameDelta: 0.05,
} as const

// Every camera move is a fixed-duration eased tween off elapsed time, one per
// kind of move between levels.
export const FLIGHT = {
  // Campus into a room, and back out to where the visitor left the campus.
  enterSeconds: 1.2,
  exitSeconds: 1.2,
  // Room to exhibit and back: the room slides aside for the panel.
  shiftSeconds: 0.6,
  // Room to a different room: up through campus altitude, then down.
  hopSeconds: 1.8,
  // Peak of a hop, as a fraction of the default campus distance, and how far
  // toward looking straight down the camera tilts at that peak.
  hopRadiusFactor: 0.55,
  hopPhi: 0.72,
  // Slack on the safety timer that lands a flight whose frames stopped coming.
  settleGraceSeconds: 0.05,
  // An interrupting flight inherits the camera's velocity, measured over at
  // least the first span and forgotten if the last sample is older than the
  // second.
  // No flight ever takes the camera below floorHeight. Within cushion of it
  // the descent eases off smoothly rather than stopping against a hard line.
  floorHeight: 1.2,
  floorCushion: 1.5,
  velocitySampleSeconds: 0.008,
  velocityStaleSeconds: 0.2,
} as const

// How the camera frames a selected plot. Every value is derived from the plot's
// own geometry, so no building ever needs a hand-placed camera.
export const FOCUS = {
  // Distance as a multiple of the room's larger floor dimension.
  roomDistanceScale: 2.0,
  elevation: 0.62,
  // Swings off the radial axis toward the room's open corner. The room builds
  // its walls on the far two sides, so this sign and the walls must agree.
  azimuthOffset: 0.6,
  // Look-at height as a fraction of the room's height.
  targetHeightFactor: 0.38,
  // With an exhibit's panel open on desktop, the room is framed in the strip
  // the panel leaves. panelFraction is the share of the scene's width the
  // panel covers, and must match PlotPanel's own width; exhibitFill is how
  // much of the remaining strip the room spans.
  panelFraction: 0.55,
  exhibitFill: 0.72,
  minDistanceFactor: 0.6,
  maxDistanceFactor: 1.8,
  // Half-width, in radians, of the orbit allowed inside a room.
  roomAzimuthArc: 0.55,
} as const

// Lighting. The directional light keeps its distance from the estate as it
// moves, so the shadow frustum below still encloses the slab at dusk.
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

// The dusk toggle: one timeline, played forward into dusk and backward out of
// it, so reversing midway simply turns round wherever it has got to. Times are
// seconds from the start of the sequence.
export const DUSK = {
  duration: 1.4,
  // Sky and slab cross-fade. Surfaces travel only this far toward their dusk
  // colours, because the dimmed lights darken them as well; the sky, which no
  // light touches, goes all the way.
  colourEnd: 0.9,
  surfaceFade: 0.55,
  // The sun dims, warms and drops.
  lightEnd: 1.0,
  // Windows come on in steps of cascadeStep, nearest the camera first, each
  // step fading in over windowFade.
  cascadeStart: 0.3,
  cascadeSpan: 0.72,
  cascadeStep: 0.04,
  windowFade: 0.14,
  // Streetlights last.
  lampStart: 1.02,
  lampEnd: 1.4,

  sunElevationDusk: 0.34,
  sunColourDusk: '#ffb27a',
  sunIntensityDusk: 0.8,
  hemiSkyDusk: '#7486ad',
  hemiGroundDusk: '#3a3830',
  hemiIntensityDusk: 1.1,

  windowGlow: 1.35,
  lampGlow: 2.2,
  poolRadius: 2.3,
  poolOpacity: 0.32,
  poolY: 0.09,
  poolTextureSize: 128,
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
  // Extra room a lamp keeps beyond the edge of any driveway or crossing.
  lampJunctionClearance: 0.55,
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
  // Fraction of the outline left open for the gate. Where the gate goes is
  // derived from the plot layout, not fixed here.
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

// The loading screen and the first-run card.
export const LOADING = {
  // How long a font that can't be had is waited for before the scene is drawn
  // in a fallback face.
  fontTimeoutMs: 4000,
  // The counter climbs toward the real percentage, never past it. Per-second
  // decay, frame-rate independent via 1 - decay^dt.
  counterDecay: 0.002,
  // Within this many percent of the real figure, the counter shows it exactly.
  counterSnap: 0.5,
  // The first-run card waits for the reveal to finish before appearing.
  firstRunDelayMs: 900,
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

// The cutaway room a building opens into. Designed once at this canonical
// size, then scaled uniformly to fit inside each plot's footprint — so one
// layout serves every plot, and the nameplate and ground label outside the
// footprint keep their places. Origin is the centre of the floor's top face.
// The back wall runs along -z and the side wall along -x; the other two sides
// are open, facing the quarter the camera arrives from.
export const ROOM = {
  width: 4.4,
  depth: 3.6,
  height: 2.1,
  wallThickness: 0.1,
  floorThickness: 0.08,
  // World units the floor's top face stands above the plot pad. Without it the
  // two are coplanar and the pad shows through the boards.
  floorLift: 0.02,
  skirtingHeight: 0.09,
  skirtingDepth: 0.025,
  // Fraction of the footprint the room may fill.
  footprintFill: 0.97,

  deskWidth: 1.8,
  deskDepth: 0.62,
  deskHeight: 0.74,
  deskTopThickness: 0.05,
  deskCentreX: 1.0,
  // Two places on the desk, either side of centre.
  deskSlotOffset: 0.45,
  chairSeat: 0.46,

  // Wall-mounted exhibits hang with their centre at this height.
  wallMountY: 1.3,
  // The back-left zone and the side-wall zone each take one wall or one
  // floor-standing exhibit. Kept apart so neither can reach into the corner
  // the other occupies.
  backZoneX: -0.8,
  sideZoneZ: 0.2,

  doorWidth: 0.62,
  doorHeight: 1.6,
  // Toward the back of the side wall, clear of the side-wall exhibit zone.
  doorCentreZ: -1.2,

  rugWidth: 2.2,
  rugDepth: 1.6,
  stripLightWidth: 3.4,

  // Hover: lift in canonical room units, and how fast it settles.
  exhibitLift: 0.08,
  hoverDecay: 0.0004,
  rimStrength: 0.55,
  rimPower: 1.6,
  hoverReleaseMs: 60,

  // Surfaces for all three exhibits share one atlas per room; the fourth cell
  // is plain white, which is where every untextured face samples.
  atlasCell: 256,
  atlasInset: 8,
} as const

// Character props: the details that stop six boxes reading as six boxes. All
// positions derive from the building they belong to, never from a plot index.
export const BUILDING_PROPS = {
  acWidth: 0.42,
  acHeight: 0.32,
  // How far the unit stands proud of the ground-storey wall it hangs on.
  acProtrusion: 0.24,
  acHeightFactor: 0.62,
  // The hedge rings the side and back garden; the forecourt stays open so it
  // never crowds the door, the nameplate or a parked scooter.
  hedgeHeight: 0.42,
  hedgeThickness: 0.26,
  // Gap between the door step and the scooter parked beside it.
  scooterClearance: 0.3,
  scooterLength: 0.86,
  // A pitched roof has nowhere to put an overhead tank, so it goes up on a
  // stand behind the house — which is what a real one would do.
  tankRadius: 0.3,
  tankHeight: 0.45,
  tankStandBehind: 0.45,
  tankStandInset: 0.5,
  legSize: 0.06,
  dishBracket: 0.2,
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
