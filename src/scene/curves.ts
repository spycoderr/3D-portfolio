import { CatmullRomCurve3, Vector3 } from 'three'
import { plots } from '@/data/plots'
import { CROSSING, DRIVEWAY, ROAD, SCENE } from './constants'
import { gateAnchor } from './slab'

const UP = new Vector3(0, 1, 0)

function buildControlPoints(): Vector3[] {
  const radii = SCENE.roadControlRadii
  return radii.map((radius, index) => {
    const angle = (index / radii.length) * Math.PI * 2
    return new Vector3(Math.sin(angle) * radius, 0, Math.cos(angle) * radius)
  })
}

// Centripetal parameterisation: uniform spacing makes a closed loop bulge and
// pinch between control points, which is what made the earlier cars surge.
export const roadCurve = new CatmullRomCurve3(buildControlPoints(), true, 'centripetal')

// Built once here rather than lazily on first sample, so no frame pays for it
// and getPointAt is arc-length accurate from the very first vehicle update.
roadCurve.arcLengthDivisions = ROAD.arcLengthDivisions
roadCurve.updateArcLengths()

export const roadLength = roadCurve.getLength()

export function wrapU(u: number): number {
  return ((u % 1) + 1) % 1
}

const tangentScratch = new Vector3()
const normalScratch = new Vector3()

// Perpendicular to the road in the ground plane, pointing outward from the loop.
export function getNormalAt(u: number, out = new Vector3()): Vector3 {
  roadCurve.getTangentAt(wrapU(u), tangentScratch)
  return out.copy(tangentScratch).cross(UP).normalize()
}

export function getPointAt(u: number, out = new Vector3()): Vector3 {
  return roadCurve.getPointAt(wrapU(u), out)
}

export function getTangentAt(u: number, out = new Vector3()): Vector3 {
  return roadCurve.getTangentAt(wrapU(u), out)
}

// A point shifted sideways off the centreline, used for lanes and road edges.
export function getLanePoint(u: number, offset: number, out = new Vector3()): Vector3 {
  getPointAt(u, out)
  getNormalAt(u, normalScratch)
  return out.addScaledVector(normalScratch, offset)
}

const stretchTables = new Map<number, Float32Array>()
const stretchA = new Vector3()
const stretchB = new Vector3()

function buildStretchTable(offset: number): Float32Array {
  const samples = ROAD.laneStretchSamples
  const table = new Float32Array(samples)
  const half = 0.5 / samples
  for (let index = 0; index < samples; index += 1) {
    const u = index / samples
    const lane = getLanePoint(u + half, offset, stretchA).distanceTo(getLanePoint(u - half, offset, stretchB))
    table[index] = lane / (2 * half * roadLength)
  }
  return table
}

// How much longer a lane is than the centreline at u: above 1 on the outside
// of a bend, below 1 on the inside. The centreline is arc-length accurate, but
// a lane offset from it is not, so a car advancing by centreline distance
// would surge through the tighter bends on the outside and crawl on the
// inside. Dividing its step by this keeps its real speed constant.
export function getLaneStretchAt(u: number, offset: number): number {
  let table = stretchTables.get(offset)
  if (!table) {
    table = buildStretchTable(offset)
    stretchTables.set(offset, table)
  }
  const x = wrapU(u) * table.length
  const index = Math.floor(x) % table.length
  const next = (index + 1) % table.length
  const k = x - Math.floor(x)
  return table[index] + (table[next] - table[index]) * k
}

const curvatureA = new Vector3()
const curvatureB = new Vector3()

// Signed turn rate in radians per world unit. Positive means the road bends one
// way, negative the other, so vehicles can bank into the corner correctly.
export function getCurvatureAt(u: number): number {
  const delta = 0.003
  getTangentAt(u - delta, curvatureA)
  getTangentAt(u + delta, curvatureB)

  const angle = curvatureA.angleTo(curvatureB)
  const turnSign = Math.sign(curvatureA.cross(curvatureB).y)
  const arc = 2 * delta * roadLength

  return arc === 0 ? 0 : (angle / arc) * turnSign
}

const nearestScratch = new Vector3()

// Used to hang driveways off the road: each plot finds its own closest point
// rather than being given a hand-placed connector.
export function nearestUTo(point: Vector3, samples = 720): number {
  let bestU = 0
  let bestDistance = Infinity

  for (let index = 0; index < samples; index += 1) {
    const u = index / samples
    const distance = getPointAt(u, nearestScratch).distanceToSquared(point)
    if (distance < bestDistance) {
      bestDistance = distance
      bestU = u
    }
  }

  return bestU
}

// Everywhere something joins the ring, and how much road it occupies there.
// Spurs, crossings and the gate approach are all built from this, and anything
// placed along the kerb has to keep clear of all of it.
export type Junction = { u: number; halfWidth: number }

let junctions: { plots: Junction[]; gate: Junction } | null = null

export function roadJunctions(): { plots: Junction[]; gate: Junction } {
  if (junctions) return junctions

  const point = new Vector3()
  // A plot's junction is as wide as whichever is wider: its driveway, or the
  // crossing painted where the driveway meets the road.
  const crossingHalf =
    (CROSSING.stripeCount * CROSSING.stripeWidth + (CROSSING.stripeCount - 1) * CROSSING.stripeGap) /
    2
  const gate = gateAnchor()

  junctions = {
    plots: plots
      .filter((plot) => plot.kind !== 'contact')
      .map((plot) => ({
        u: nearestUTo(point.set(plot.position[0], 0, plot.position[2])),
        halfWidth: Math.max(DRIVEWAY.width / 2, crossingHalf),
      })),
    gate: { u: nearestUTo(point.set(gate.x, 0, gate.z)), halfWidth: ROAD.width / 2 },
  }

  return junctions
}
