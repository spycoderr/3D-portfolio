import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  InstancedMesh,
  MeshLambertMaterial,
  Object3D,
  RingGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { plots } from '@/data/plots'
import { palette } from '@/theme'
import { BOUNDARY, COLORS, COMMUNITY, ESTATE, PARK, ROAD, SLAB } from './constants'
import { getLanePoint, getPointAt } from './curves'
import { gateAnchor, isOnSlab, slabOutline } from './slab'

// One material for every piece of static dressing. Colour rides on the vertices
// instead, so nine separate props collapse into a single draw call.
const dressingMaterial = new MeshLambertMaterial({ vertexColors: true })

const materials = {
  trunk: new MeshLambertMaterial({ color: COLORS.trunk }),
  foliage: new MeshLambertMaterial({ color: COLORS.foliage }),
  ink: new MeshLambertMaterial({ color: COLORS.ink }),
}

function box(w: number, h: number, d: number, x = 0, y = 0, z = 0): BufferGeometry {
  const geometry = new BoxGeometry(w, h, d)
  geometry.translate(x, y, z)
  return geometry
}

// Bakes a flat colour into a geometry so it can be merged with differently
// coloured neighbours and still be drawn by one shared material.
function tint(geometry: BufferGeometry, colour: string): BufferGeometry {
  const value = new Color(colour)
  const count = geometry.attributes.position.count
  const colours = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    colours[index * 3] = value.r
    colours[index * 3 + 1] = value.g
    colours[index * 3 + 2] = value.b
  }
  geometry.setAttribute('color', new BufferAttribute(colours, 3))
  return geometry
}

// Small deterministic PRNG: the estate must lay out identically on every load.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type TreePlacement = { x: number; z: number; scale: number; rotation: number }

// Sampled across the whole slab rather than in an annulus, because the rounded
// corners of the slab are exactly where an annulus leaves bald patches.
function placeTrees(): TreePlacement[] {
  const random = mulberry32(ESTATE.treeSeed)
  const placements: TreePlacement[] = []

  const roadSamples: Vector2[] = []
  const point = new Vector3()
  for (let index = 0; index < 260; index += 1) {
    getPointAt(index / 260, point)
    roadSamples.push(new Vector2(point.x, point.z))
  }

  const plotPoints = plots.map((plot) => new Vector2(plot.position[0], plot.position[2]))
  const pond = new Vector2(PARK.pondCentre[0], PARK.pondCentre[1])
  const community = new Vector2(COMMUNITY.position[0], COMMUNITY.position[2])
  const candidate = new Vector2()
  const roadClearance = ROAD.width / 2 + ROAD.kerbWidth + ESTATE.treeClearanceFromRoad

  let attempts = 0
  while (placements.length < ESTATE.treeCount && attempts < 20000) {
    attempts += 1

    candidate.set((random() - 0.5) * SLAB.width, (random() - 0.5) * SLAB.depth)

    if (!isOnSlab(candidate.x, candidate.y, ESTATE.treeSlabMargin)) continue
    if (candidate.distanceTo(pond) < PARK.pondRadius + ESTATE.treeClearanceFromPond) continue
    if (candidate.distanceTo(community) < COMMUNITY.width) continue
    if (roadSamples.some((sample) => sample.distanceTo(candidate) < roadClearance)) continue
    if (plotPoints.some((plot) => plot.distanceTo(candidate) < ESTATE.treeClearanceFromPlot)) continue
    if (
      placements.some(
        (tree) => Math.hypot(tree.x - candidate.x, tree.z - candidate.y) < ESTATE.treeMinSpacing,
      )
    ) {
      continue
    }

    // Keep the ring of grass around the pond path clear so the walk reads.
    const fromCentre = candidate.length()
    if (fromCentre > PARK.pathInnerRadius - 0.6 && fromCentre < PARK.pathOuterRadius + 0.6) continue

    placements.push({
      x: candidate.x,
      z: candidate.y,
      scale: 0.75 + random() * 0.6,
      rotation: random() * Math.PI * 2,
    })
  }

  return placements
}

// Wrapped distance around the outline, used to leave a gap for the gate.
function outlineDistance(t: number, from: number): number {
  const delta = Math.abs(t - from)
  return Math.min(delta, 1 - delta)
}

// The wall and hedge are swept as segments along the slab's own outline, so
// they follow its rounded corners instead of approximating them with a circle.
function sweepBoundary(inset: number, width: number, height: number, colour: string) {
  const points = slabOutline(inset, BOUNDARY.divisions)
  const parts: BufferGeometry[] = []

  for (let index = 0; index < BOUNDARY.divisions; index += 1) {
    const t = (index + 0.5) / BOUNDARY.divisions
    if (outlineDistance(t, BOUNDARY.gateAt) < BOUNDARY.gateSpan / 2) continue

    const a = points[index]
    const b = points[index + 1]
    const dx = b.x - a.x
    const dz = b.y - a.y
    const length = Math.hypot(dx, dz)
    if (length < 1e-5) continue

    // Overlapped slightly so the outside of each corner never opens a seam.
    const segment = box(width, height, length * 1.4, 0, height / 2, 0)
    segment.rotateY(Math.atan2(dx, dz))
    segment.translate((a.x + b.x) / 2, 0, (a.y + b.y) / 2)
    parts.push(segment)
  }

  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  return tint(merged, colour)
}

function buildGate(): BufferGeometry[] {
  const gate = gateAnchor()

  // Along the wall line, so the pillars land on the two cut ends of the gap.
  const alongX = Math.sin(gate.angle)
  const alongZ = Math.cos(gate.angle)
  // Half the gap, plus half a pillar, so each pillar closes one cut end of it.
  const reach = gate.gap / 2 + BOUNDARY.gatePillarSize / 2

  const parts: BufferGeometry[] = []

  for (const side of [1, -1]) {
    const pillar = box(
      BOUNDARY.gatePillarSize,
      BOUNDARY.gatePillarHeight,
      BOUNDARY.gatePillarSize,
      0,
      BOUNDARY.gatePillarHeight / 2,
      0,
    )
    pillar.rotateY(gate.angle)
    pillar.translate(gate.x + alongX * reach * side, 0, gate.z + alongZ * reach * side)
    parts.push(tint(pillar, palette.kerb))
  }

  const arch = box(
    BOUNDARY.gatePillarSize * 0.6,
    BOUNDARY.gateArchHeight,
    reach * 2,
    0,
    BOUNDARY.gatePillarHeight + BOUNDARY.gateArchHeight / 2,
    0,
  )
  arch.rotateY(gate.angle)
  arch.translate(gate.x, 0, gate.z)
  parts.push(tint(arch, palette.clay))

  return parts
}

function buildCommunityBlock(): BufferGeometry[] {
  const walls = box(COMMUNITY.width, COMMUNITY.height, COMMUNITY.depth, 0, COMMUNITY.height / 2, 0)
  const roof = box(
    COMMUNITY.width + COMMUNITY.roofOverhang * 2,
    COMMUNITY.roofHeight,
    COMMUNITY.depth + COMMUNITY.roofOverhang * 2,
    0,
    COMMUNITY.height + COMMUNITY.roofHeight / 2,
    0,
  )

  return [tint(walls, palette.sand), tint(roof, palette.sage)].map((part) => {
    part.rotateY(COMMUNITY.rotation)
    part.translate(COMMUNITY.position[0], 0, COMMUNITY.position[2])
    return part
  })
}

type EstateResources = {
  trunk: BufferGeometry
  foliage: BufferGeometry
  lamp: BufferGeometry
  bench: BufferGeometry
  // Flat on the ground: receives shadow, casts none, so it never shadow-acnes
  // against the surface it is lying on.
  flat: BufferGeometry
  // Everything with height, merged into one shadow-casting mesh.
  standing: BufferGeometry
  trees: TreePlacement[]
}

let resources: EstateResources | null = null

function getResources(): EstateResources {
  if (resources) return resources

  const trunk = new CylinderGeometry(0.09, 0.13, 0.9, 7)
  trunk.translate(0, 0.45, 0)

  const canopyLower = new ConeGeometry(0.62, 1.0, 8)
  canopyLower.translate(0, 1.25, 0)
  const canopyUpper = new ConeGeometry(0.44, 0.8, 8)
  canopyUpper.translate(0, 1.85, 0)
  const foliage = mergeGeometries([canopyLower, canopyUpper], false)
  canopyLower.dispose()
  canopyUpper.dispose()

  const pole = new CylinderGeometry(0.045, 0.055, ESTATE.lampHeight, 8)
  pole.translate(0, ESTATE.lampHeight / 2, 0)
  const head = box(0.26, 0.12, 0.26, 0, ESTATE.lampHeight + 0.06, 0)
  const lamp = mergeGeometries([pole, head], false)
  pole.dispose()
  head.dispose()

  const bench = mergeGeometries(
    [
      box(1.0, 0.07, 0.34, 0, 0.34, 0),
      box(1.0, 0.28, 0.07, 0, 0.5, -0.14),
      box(0.08, 0.34, 0.3, -0.42, 0.17, 0),
      box(0.08, 0.34, 0.3, 0.42, 0.17, 0),
    ],
    false,
  )

  const pond = new CircleGeometry(PARK.pondRadius, 40)
  pond.rotateX(-Math.PI / 2)
  pond.translate(PARK.pondCentre[0], PARK.pondY, PARK.pondCentre[1])

  const pondRim = new TorusGeometry(PARK.pondRadius, 0.11, 6, 40)
  pondRim.rotateX(-Math.PI / 2)
  pondRim.translate(PARK.pondCentre[0], PARK.pondY, PARK.pondCentre[1])

  const path = new RingGeometry(PARK.pathInnerRadius, PARK.pathOuterRadius, 56)
  path.rotateX(-Math.PI / 2)
  path.translate(0, PARK.pathY, 0)

  const contact = plots.find((plot) => plot.kind === 'contact')!
  const boardY = ESTATE.noticeBoardPostHeight + ESTATE.noticeBoardHeight / 2
  const noticeParts = [
    box(0.1, ESTATE.noticeBoardPostHeight, 0.1, -ESTATE.noticeBoardWidth / 2 + 0.15, ESTATE.noticeBoardPostHeight / 2, 0),
    box(0.1, ESTATE.noticeBoardPostHeight, 0.1, ESTATE.noticeBoardWidth / 2 - 0.15, ESTATE.noticeBoardPostHeight / 2, 0),
    box(ESTATE.noticeBoardWidth + 0.12, ESTATE.noticeBoardHeight + 0.12, 0.08, 0, boardY, 0),
  ]
  const noticeBoard = mergeGeometries(noticeParts, false)
  noticeParts.forEach((part) => part.dispose())
  noticeBoard.rotateY(contact.rotation)
  noticeBoard.translate(contact.position[0], 0, contact.position[2])

  const noticePanel = box(ESTATE.noticeBoardWidth, ESTATE.noticeBoardHeight, 0.03, 0, boardY, 0.06)
  noticePanel.rotateY(contact.rotation)
  noticePanel.translate(contact.position[0], 0, contact.position[2])

  resources = {
    trunk,
    foliage,
    lamp,
    bench,
    flat: mergeGeometries(
      [tint(pond, palette.water), tint(pondRim, palette.kerb), tint(path, palette.path)],
      false,
    ),
    standing: mergeGeometries(
      [
        sweepBoundary(BOUNDARY.inset, BOUNDARY.wallThickness, BOUNDARY.wallHeight, palette.kerb),
        sweepBoundary(
          BOUNDARY.inset + (BOUNDARY.wallThickness + BOUNDARY.hedgeThickness) / 2,
          BOUNDARY.hedgeThickness,
          BOUNDARY.hedgeHeight,
          palette.hedge,
        ),
        ...buildGate(),
        ...buildCommunityBlock(),
        tint(noticeBoard, palette.ink),
        tint(noticePanel, palette.paper),
      ],
      false,
    ),
    trees: placeTrees(),
  }

  return resources
}

export function Props() {
  const parts = getResources()

  const lampTransform = useMemo(
    () => (dummy: Object3D, index: number) => {
      const u = index / ESTATE.lampCount
      const point = getLanePoint(u, ROAD.width / 2 + ROAD.kerbWidth + 0.28, new Vector3())
      dummy.position.set(point.x, ROAD.kerbY, point.z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(1)
    },
    [],
  )

  const benchTransform = useMemo(
    () => (dummy: Object3D, index: number) => {
      const angle = (index / PARK.benchCount) * Math.PI * 2 + 0.4
      const x = PARK.pondCentre[0] + Math.sin(angle) * PARK.benchRadius
      const z = PARK.pondCentre[1] + Math.cos(angle) * PARK.benchRadius
      dummy.position.set(x, 0, z)
      // Benches turn to look back at the water.
      dummy.rotation.set(0, angle + Math.PI, 0)
      dummy.scale.setScalar(1)
    },
    [],
  )

  return (
    <group>
      <mesh geometry={parts.flat} material={dressingMaterial} receiveShadow castShadow={false} />
      <mesh geometry={parts.standing} material={dressingMaterial} castShadow receiveShadow />

      <TreeInstances trees={parts.trees} trunk={parts.trunk} foliage={parts.foliage} />
      <CountedInstances
        geometry={parts.lamp}
        material={materials.ink}
        count={ESTATE.lampCount}
        transform={lampTransform}
      />
      <CountedInstances
        geometry={parts.bench}
        material={materials.trunk}
        count={PARK.benchCount}
        transform={benchTransform}
      />
    </group>
  )
}

function CountedInstances({
  geometry,
  material,
  count,
  transform,
}: {
  geometry: BufferGeometry
  material: MeshLambertMaterial
  count: number
  transform: (dummy: Object3D, index: number) => void
}) {
  const meshRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh || count === 0) return
    const dummy = new Object3D()
    for (let index = 0; index < count; index += 1) {
      transform(dummy, index)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [count, transform])

  if (count === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow={false}
    />
  )
}

function TreeInstances({
  trees,
  trunk,
  foliage,
}: {
  trees: TreePlacement[]
  trunk: BufferGeometry
  foliage: BufferGeometry
}) {
  const transform = useMemo(
    () => (dummy: Object3D, index: number) => {
      const tree = trees[index]
      dummy.position.set(tree.x, 0, tree.z)
      dummy.rotation.set(0, tree.rotation, 0)
      dummy.scale.setScalar(tree.scale)
    },
    [trees],
  )

  return (
    <>
      <CountedInstances
        geometry={trunk}
        material={materials.trunk}
        count={trees.length}
        transform={transform}
      />
      <CountedInstances
        geometry={foliage}
        material={materials.foliage}
        count={trees.length}
        transform={transform}
      />
    </>
  )
}
