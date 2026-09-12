import { CatmullRomCurve3, Vector3 } from 'three'
import { ROAD, SCENE } from './constants'

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
