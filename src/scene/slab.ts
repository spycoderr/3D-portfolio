import { Shape, Vector2 } from 'three'
import { plots } from '@/data/plots'
import { BOUNDARY, CAMERA, SLAB } from './constants'

// The slab's outline, shared by everything that has to respect it: the slab
// geometry itself, the boundary wall that follows it, and the tree scatter that
// must not spill over the lip.

export function slabShape(inset = 0): Shape {
  const w = SLAB.width / 2 - inset
  const d = SLAB.depth / 2 - inset
  const radius = Math.max(0.01, SLAB.cornerRadius - inset)
  const shape = new Shape()

  // Four straights joined by true circular arcs, so the corners hold a constant
  // radius rather than the pinch a quadratic curve would give.
  shape.moveTo(-w + radius, -d)
  shape.lineTo(w - radius, -d)
  shape.absarc(w - radius, -d + radius, radius, -Math.PI / 2, 0, false)
  shape.lineTo(w, d - radius)
  shape.absarc(w - radius, d - radius, radius, 0, Math.PI / 2, false)
  shape.lineTo(-w + radius, d)
  shape.absarc(-w + radius, d - radius, radius, Math.PI / 2, Math.PI, false)
  shape.lineTo(-w, -d + radius)
  shape.absarc(-w + radius, -d + radius, radius, Math.PI, Math.PI * 1.5, false)
  shape.closePath()

  return shape
}

// Evenly spaced samples around the outline, for sweeping the boundary along it.
// Shape coordinates are (x, y); the caller reads y as z on the ground plane.
export function slabOutline(inset: number, divisions: number): Vector2[] {
  return slabShape(inset).getSpacedPoints(divisions)
}

function angleBetween(a: number, b: number): number {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))
}

let cachedGateT: number | null = null

// Where round the outline the gate goes, as a fraction of it. Derived from the
// plots rather than fixed, because a fixed fraction put the gate — and the road
// through it — straight behind a building. The widest gap between neighbouring
// plots wins; among equal gaps, the one facing the camera's resting position,
// so the way in is the first thing a visitor sees. Any plot count works.
export function gateT(): number {
  if (cachedGateT !== null) return cachedGateT

  const angles = plots
    .filter((plot) => plot.kind !== 'contact')
    .map((plot) => Math.atan2(plot.position[0], plot.position[2]))
    .sort((a, b) => a - b)
  const home = Math.atan2(CAMERA.homePosition[0], CAMERA.homePosition[2])

  let target = home
  let widest = -Infinity
  let facing = Infinity
  angles.forEach((angle, index) => {
    const next = index + 1 < angles.length ? angles[index + 1] : angles[0] + Math.PI * 2
    const gap = next - angle
    const bisector = angle + gap / 2
    const towardCamera = angleBetween(bisector, home)
    const wider = gap > widest + 1e-6
    const tiedButCloser = Math.abs(gap - widest) <= 1e-6 && towardCamera < facing
    if (wider || tiedButCloser) {
      widest = gap
      facing = towardCamera
      target = bisector
    }
  })

  // Outline samples are (x, z) on the ground, so their bearing is atan2(x, z) —
  // the same convention the plot angles above use.
  const points = slabOutline(BOUNDARY.inset, BOUNDARY.divisions)
  let bestIndex = 0
  let bestDelta = Infinity
  for (let index = 0; index < BOUNDARY.divisions; index += 1) {
    const delta = angleBetween(Math.atan2(points[index].x, points[index].y), target)
    if (delta < bestDelta) {
      bestDelta = delta
      bestIndex = index
    }
  }

  cachedGateT = bestIndex / BOUNDARY.divisions
  return cachedGateT
}

// Where the boundary opens. Shared, so the gate structure and the access road
// that runs through it can never drift apart.
export function gateAnchor(): { x: number; z: number; angle: number; gap: number } {
  const points = slabOutline(BOUNDARY.inset, BOUNDARY.divisions)
  const index = Math.round(gateT() * BOUNDARY.divisions) % BOUNDARY.divisions
  const here = points[index]
  const next = points[index + 1]

  let perimeter = 0
  for (let step = 0; step < BOUNDARY.divisions; step += 1) {
    perimeter += points[step].distanceTo(points[step + 1])
  }

  return {
    x: here.x,
    z: here.y,
    angle: Math.atan2(next.x - here.x, next.y - here.y),
    gap: BOUNDARY.gateSpan * perimeter,
  }
}

// Signed containment for a rounded rectangle, used to keep scattered props on
// the model. Exact rather than an approximation, so nothing lands on the bevel.
export function isOnSlab(x: number, z: number, margin: number): boolean {
  const w = SLAB.width / 2 - margin
  const d = SLAB.depth / 2 - margin
  if (w <= 0 || d <= 0) return false

  const radius = Math.min(Math.max(0, SLAB.cornerRadius - margin), Math.min(w, d))
  const qx = Math.abs(x) - (w - radius)
  const qz = Math.abs(z) - (d - radius)

  if (qx <= 0 || qz <= 0) return Math.abs(x) <= w && Math.abs(z) <= d
  return Math.hypot(qx, qz) <= radius
}
