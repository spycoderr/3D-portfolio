import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
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
import { CAMERA, COLORS, ESTATE, PARK, ROAD } from './constants'
import { getLanePoint, getNormalAt, getPointAt, getTangentAt } from './curves'

const materials = {
  trunk: new MeshLambertMaterial({ color: COLORS.trunk }),
  foliage: new MeshLambertMaterial({ color: COLORS.foliage }),
  hedge: new MeshLambertMaterial({ color: COLORS.hedge }),
  water: new MeshLambertMaterial({ color: COLORS.water }),
  path: new MeshLambertMaterial({ color: COLORS.path }),
  stone: new MeshLambertMaterial({ color: COLORS.kerb }),
  ink: new MeshLambertMaterial({ color: COLORS.ink }),
  paper: new MeshLambertMaterial({ color: COLORS.paper }),
}

function box(w: number, h: number, d: number, x = 0, y = 0, z = 0): BufferGeometry {
  const geometry = new BoxGeometry(w, h, d)
  geometry.translate(x, y, z)
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

function placeTrees(): TreePlacement[] {
  const random = mulberry32(ESTATE.treeSeed)
  const placements: TreePlacement[] = []

  // Sampled once so each candidate can be rejected against the road cheaply.
  const roadSamples: Vector2[] = []
  const point = new Vector3()
  for (let index = 0; index < 220; index += 1) {
    getPointAt(index / 220, point)
    roadSamples.push(new Vector2(point.x, point.z))
  }

  const plotPoints = plots.map((plot) => new Vector2(plot.position[0], plot.position[2]))
  const pond = new Vector2(PARK.pondCentre[0], PARK.pondCentre[1])
  const candidate = new Vector2()
  const roadClearance = ROAD.width / 2 + ROAD.kerbWidth + ESTATE.treeClearanceFromRoad

  let attempts = 0
  while (placements.length < ESTATE.treeCount && attempts < 6000) {
    attempts += 1

    const angle = random() * Math.PI * 2
    // Trees live either in the park or in the band outside the ring.
    const inPark = random() < 0.3
    const radius = inPark ? 3 + random() * 5.5 : 12.9 + random() * 5.4
    candidate.set(Math.sin(angle) * radius, Math.cos(angle) * radius)

    if (candidate.distanceTo(pond) < PARK.pondRadius + ESTATE.treeClearanceFromPond) continue
    if (roadSamples.some((sample) => sample.distanceTo(candidate) < roadClearance)) continue
    if (plotPoints.some((plot) => plot.distanceTo(candidate) < ESTATE.treeClearanceFromPlot)) continue
    if (
      placements.some(
        (tree) => Math.hypot(tree.x - candidate.x, tree.z - candidate.y) < ESTATE.treeMinSpacing,
      )
    ) {
      continue
    }
    if (inPark) {
      const fromPathCentre = candidate.length()
      if (fromPathCentre > PARK.pathInnerRadius - 0.6 && fromPathCentre < PARK.pathOuterRadius + 0.6) {
        continue
      }
    }

    placements.push({
      x: candidate.x,
      z: candidate.y,
      scale: 0.75 + random() * 0.6,
      rotation: random() * Math.PI * 2,
    })
  }

  return placements
}

type EstateResources = {
  trunk: BufferGeometry
  foliage: BufferGeometry
  lamp: BufferGeometry
  bench: BufferGeometry
  pond: BufferGeometry
  pondRim: BufferGeometry
  path: BufferGeometry
  hedge: BufferGeometry
  gate: BufferGeometry
  noticeBoard: BufferGeometry
  noticePanel: BufferGeometry
  trees: TreePlacement[]
}

let resources: EstateResources | null = null

function buildGate(): BufferGeometry {
  const parts: BufferGeometry[] = []
  const centre = getPointAt(ESTATE.gateU, new Vector3())
  const normal = getNormalAt(ESTATE.gateU, new Vector3())
  const tangent = getTangentAt(ESTATE.gateU, new Vector3())
  const angle = Math.atan2(tangent.x, tangent.z)
  const reach = ROAD.width / 2 + ROAD.kerbWidth + 0.3

  for (const side of [1, -1]) {
    const pillar = box(0.42, ESTATE.gatePillarHeight, 0.42)
    pillar.rotateY(angle)
    pillar.translate(
      centre.x + normal.x * reach * side,
      ESTATE.gatePillarHeight / 2,
      centre.z + normal.z * reach * side,
    )
    parts.push(pillar)
  }

  const arch = box(0.3, ESTATE.gateArchHeight, reach * 2)
  arch.rotateY(angle)
  arch.translate(centre.x, ESTATE.gatePillarHeight + ESTATE.gateArchHeight / 2, centre.z)
  parts.push(arch)

  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  return merged
}

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

  const hedge = new TorusGeometry(ESTATE.hedgeRadius, ESTATE.hedgeTube, 6, 72)
  hedge.rotateX(-Math.PI / 2)
  hedge.scale(1, ESTATE.hedgeSquash, 1)
  hedge.translate(0, ESTATE.hedgeTube * ESTATE.hedgeSquash, 0)

  const contact = plots.find((plot) => plot.kind === 'contact')!
  // Angled to face the camera's resting position, so the board reads on arrival.
  const facing = Math.atan2(
    CAMERA.homePosition[0] - contact.position[0],
    CAMERA.homePosition[2] - contact.position[2],
  )
  const boardY = ESTATE.noticeBoardPostHeight + ESTATE.noticeBoardHeight / 2
  const noticeParts = [
    box(0.1, ESTATE.noticeBoardPostHeight, 0.1, -ESTATE.noticeBoardWidth / 2 + 0.15, ESTATE.noticeBoardPostHeight / 2, 0),
    box(0.1, ESTATE.noticeBoardPostHeight, 0.1, ESTATE.noticeBoardWidth / 2 - 0.15, ESTATE.noticeBoardPostHeight / 2, 0),
    box(ESTATE.noticeBoardWidth + 0.12, ESTATE.noticeBoardHeight + 0.12, 0.08, 0, boardY, 0),
  ]
  const noticeBoard = mergeGeometries(noticeParts, false)
  noticeParts.forEach((part) => part.dispose())
  noticeBoard.rotateY(facing)
  noticeBoard.translate(contact.position[0], 0, contact.position[2])

  const noticePanel = box(ESTATE.noticeBoardWidth, ESTATE.noticeBoardHeight, 0.03, 0, boardY, 0.06)
  noticePanel.rotateY(facing)
  noticePanel.translate(contact.position[0], 0, contact.position[2])

  resources = {
    trunk,
    foliage,
    lamp,
    bench,
    pond,
    pondRim,
    path,
    hedge,
    gate: buildGate(),
    noticeBoard,
    noticePanel,
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
      <mesh geometry={parts.pond} material={materials.water} receiveShadow castShadow={false} />
      <mesh geometry={parts.pondRim} material={materials.stone} receiveShadow castShadow={false} />
      <mesh geometry={parts.path} material={materials.path} receiveShadow castShadow={false} />
      <mesh geometry={parts.hedge} material={materials.hedge} castShadow receiveShadow />
      <mesh geometry={parts.gate} material={materials.stone} castShadow receiveShadow />
      <mesh geometry={parts.noticeBoard} material={materials.ink} castShadow receiveShadow />
      <mesh geometry={parts.noticePanel} material={materials.paper} castShadow={false} receiveShadow />

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
