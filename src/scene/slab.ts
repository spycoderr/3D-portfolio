import { Shape, Vector2 } from 'three'
import { BOUNDARY, SLAB } from './constants'

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

// Where the boundary opens. Shared, so the gate structure and the access road
// that runs through it can never drift apart.
export function gateAnchor(): { x: number; z: number; angle: number; gap: number } {
  const points = slabOutline(BOUNDARY.inset, BOUNDARY.divisions)
  const index = Math.round(BOUNDARY.gateAt * BOUNDARY.divisions) % BOUNDARY.divisions
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
