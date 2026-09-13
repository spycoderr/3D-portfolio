import { useLayoutEffect, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  InstancedMesh,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  Vector3,
} from 'three'
import { plots } from '@/data/plots'
import { COLORS, CROSSING, DRIVEWAY, ROAD } from './constants'
import {
  getLanePoint,
  getNormalAt,
  getPointAt,
  getTangentAt,
  nearestUTo,
  roadLength,
} from './curves'
import { gateAnchor } from './slab'

// A closed ribbon swept along the road curve: sample the centreline, step out
// to both edges, then stitch the pairs together and wrap the seam.
function buildRibbon(halfWidth: number, y: number): BufferGeometry {
  const segments = ROAD.segments
  const positions = new Float32Array(segments * 2 * 3)
  const normals = new Float32Array(segments * 2 * 3)
  const indices: number[] = []
  const edge = new Vector3()

  for (let index = 0; index < segments; index += 1) {
    const u = index / segments

    getLanePoint(u, -halfWidth, edge)
    positions.set([edge.x, y, edge.z], index * 6)
    getLanePoint(u, halfWidth, edge)
    positions.set([edge.x, y, edge.z], index * 6 + 3)
    normals.set([0, 1, 0, 0, 1, 0], index * 6)
  }

  // Wound so the face points up; the reverse order is culled from above.
  for (let index = 0; index < segments; index += 1) {
    const next = (index + 1) % segments
    indices.push(index * 2, index * 2 + 1, next * 2)
    indices.push(index * 2 + 1, next * 2 + 1, next * 2)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new BufferAttribute(normals, 3))
  geometry.setIndex(indices)
  return geometry
}

// Where each plot meets the ring. Both the spur and its crossing hang off this,
// so a crossing can never drift away from the driveway it belongs to.
function spurPoints(): number[] {
  const plotPoint = new Vector3()
  const us: number[] = []

  for (const plot of plots) {
    if (plot.kind === 'contact') continue
    plotPoint.set(plot.position[0], 0, plot.position[2])
    us.push(nearestUTo(plotPoint))
  }

  return us
}

// A flat quad laid between two ground points, which is all a spur or the
// approach from the gate ever needs to be.
function pushConnector(
  positions: number[],
  normals: number[],
  indices: number[],
  from: Vector3,
  to: Vector3,
  width: number,
  y: number,
) {
  const direction = to.clone().sub(from).setY(0)
  if (direction.length() < 0.1) return
  direction.normalize()

  const across = new Vector3(-direction.z, 0, direction.x).multiplyScalar(width / 2)
  const base = positions.length / 3

  for (const [origin, side] of [
    [from, 1],
    [from, -1],
    [to, 1],
    [to, -1],
  ] as const) {
    positions.push(origin.x + across.x * side, y, origin.z + across.z * side)
    normals.push(0, 1, 0)
  }

  indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3)
}

// Each plot reaches back to whichever point on the road is actually closest, so
// connectors stay correct if the ring or the road is ever reshaped.
function buildDriveways(): BufferGeometry {
  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []

  const centre = new Vector3()
  const normal = new Vector3()
  const toPlot = new Vector3()
  const roadEdge = new Vector3()
  const frontOfPlot = new Vector3()
  const across = new Vector3()
  const corner = new Vector3()
  const plotPoint = new Vector3()

  let vertexCount = 0

  for (const plot of plots) {
    if (plot.kind === 'contact') continue

    plotPoint.set(plot.position[0], 0, plot.position[2])
    const u = nearestUTo(plotPoint)

    getPointAt(u, centre)
    getNormalAt(u, normal)
    // The curve normal can face either way around the loop; point it at the plot.
    toPlot.copy(plotPoint).sub(centre)
    if (normal.dot(toPlot) < 0) normal.negate()

    roadEdge.copy(centre).addScaledVector(normal, ROAD.width / 2 + ROAD.kerbWidth)

    toPlot.copy(plotPoint).sub(roadEdge).setY(0)
    const span = toPlot.length()
    if (span < 0.1) continue
    toPlot.normalize()

    // Stop at the front wall rather than running under the building.
    frontOfPlot.copy(plotPoint).addScaledVector(toPlot, -plot.footprint.d / 2)
    across.set(-toPlot.z, 0, toPlot.x).multiplyScalar(DRIVEWAY.width / 2)

    for (const [origin, side] of [
      [roadEdge, 1],
      [roadEdge, -1],
      [frontOfPlot, 1],
      [frontOfPlot, -1],
    ] as const) {
      corner.copy(origin).addScaledVector(across, side)
      positions.push(corner.x, DRIVEWAY.y, corner.z)
      normals.push(0, 1, 0)
    }

    indices.push(
      vertexCount,
      vertexCount + 2,
      vertexCount + 1,
      vertexCount + 1,
      vertexCount + 2,
      vertexCount + 3,
    )
    vertexCount += 4
  }

  // The approach from the gate, so the one opening in the boundary actually
  // leads somewhere instead of being a gate into a wall.
  const gate = gateAnchor()
  const gatePoint = new Vector3(gate.x, 0, gate.z)
  const gateU = nearestUTo(gatePoint)
  getPointAt(gateU, centre)
  getNormalAt(gateU, normal)
  toPlot.copy(gatePoint).sub(centre)
  if (normal.dot(toPlot) < 0) normal.negate()
  roadEdge.copy(centre).addScaledVector(normal, ROAD.width / 2 + ROAD.kerbWidth)

  pushConnector(positions, normals, indices, roadEdge, gatePoint, ROAD.width, DRIVEWAY.y)

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3))
  geometry.setIndex(indices)
  return geometry
}

type RoadResources = {
  road: BufferGeometry
  kerb: BufferGeometry
  driveways: BufferGeometry
  dash: PlaneGeometry
  stripe: PlaneGeometry
  roadMaterial: MeshLambertMaterial
  kerbMaterial: MeshLambertMaterial
  dashMaterial: MeshLambertMaterial
  dashCount: number
  spurs: number[]
}

let resources: RoadResources | null = null

function getResources(): RoadResources {
  if (resources) return resources

  // Long axis on Z so a Y rotation can line each dash up with the tangent.
  const dash = new PlaneGeometry(ROAD.dashWidth, ROAD.dashLength)
  dash.rotateX(-Math.PI / 2)

  // A crossing bar spans the carriageway, so its long axis is X — which the
  // same Y rotation turns into the road's normal.
  const stripe = new PlaneGeometry(ROAD.width, CROSSING.stripeWidth)
  stripe.rotateX(-Math.PI / 2)

  resources = {
    road: buildRibbon(ROAD.width / 2, ROAD.roadY),
    kerb: buildRibbon(ROAD.width / 2 + ROAD.kerbWidth, ROAD.kerbY),
    driveways: buildDriveways(),
    dash,
    stripe,
    roadMaterial: new MeshLambertMaterial({ color: COLORS.road }),
    kerbMaterial: new MeshLambertMaterial({ color: COLORS.kerb }),
    dashMaterial: new MeshLambertMaterial({ color: COLORS.roadMark }),
    dashCount: Math.floor(roadLength / (ROAD.dashLength + ROAD.dashGap)),
    spurs: spurPoints(),
  }

  return resources
}

// One instanced mesh for every stripe of every crossing on the estate.
function Crossings({ spurs }: { spurs: number[] }) {
  const meshRef = useRef<InstancedMesh>(null)
  const { stripe, dashMaterial } = getResources()
  const count = spurs.length * CROSSING.stripeCount

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const dummy = new Object3D()
    const point = new Vector3()
    const tangent = new Vector3()
    const pitch = (CROSSING.stripeWidth + CROSSING.stripeGap) / roadLength

    spurs.forEach((centre, spur) => {
      for (let index = 0; index < CROSSING.stripeCount; index += 1) {
        const u = centre + (index - (CROSSING.stripeCount - 1) / 2) * pitch
        getPointAt(u, point)
        dummy.position.set(point.x, CROSSING.y, point.z)

        getTangentAt(u, tangent)
        dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0)
        dummy.updateMatrix()
        mesh.setMatrixAt(spur * CROSSING.stripeCount + index, dummy.matrix)
      }
    })

    mesh.instanceMatrix.needsUpdate = true
  }, [spurs, count])

  return (
    <instancedMesh
      ref={meshRef}
      args={[stripe, dashMaterial, count]}
      castShadow={false}
      receiveShadow
    />
  )
}

function CentreLine({ count }: { count: number }) {
  const meshRef = useRef<InstancedMesh>(null)
  const { dash, dashMaterial } = getResources()

  // Baked once: the dashes never move, so they cost nothing per frame.
  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const dummy = new Object3D()
    const point = new Vector3()
    const tangent = new Vector3()

    for (let index = 0; index < count; index += 1) {
      const u = index / count
      getPointAt(u, point)
      dummy.position.set(point.x, ROAD.dashY, point.z)

      getTangentAt(u, tangent)
      dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  }, [count])

  return (
    <instancedMesh
      ref={meshRef}
      args={[dash, dashMaterial, count]}
      castShadow={false}
      receiveShadow
    />
  )
}

export function Road() {
  const { road, kerb, driveways, roadMaterial, kerbMaterial, dashCount, spurs } = getResources()

  return (
    <group>
      <mesh geometry={kerb} material={kerbMaterial} receiveShadow castShadow={false} />
      <mesh geometry={road} material={roadMaterial} receiveShadow castShadow={false} />
      <mesh geometry={driveways} material={kerbMaterial} receiveShadow castShadow={false} />
      <CentreLine count={dashCount} />
      <Crossings spurs={spurs} />
    </group>
  )
}
