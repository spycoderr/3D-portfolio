import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  MeshLambertMaterial,
  Quaternion,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { COLORS, ROAD, TRAFFIC } from './constants'
import { getCurvatureAt, getLanePoint, getTangentAt, roadLength, wrapU } from './curves'

const UP = new Vector3(0, 1, 0)
const UNIT_SCALE = new Vector3(1, 1, 1)
const VEHICLE_COUNT = TRAFFIC.directions.length

// Hoisted so the per-frame update allocates nothing.
const position = new Vector3()
const tangent = new Vector3()
const forward = new Vector3()
const right = new Vector3()
const up = new Vector3()
const orientation = new Quaternion()
const roll = new Quaternion()
const carMatrix = new Matrix4()
const basis = new Matrix4()
const axleOffset = new Matrix4()
const axleSpin = new Matrix4()
const axleMatrix = new Matrix4()

type TrafficResources = {
  body: BufferGeometry
  axle: BufferGeometry
  bodyMaterial: MeshLambertMaterial
  wheelMaterial: MeshLambertMaterial
}

let resources: TrafficResources | null = null

function getResources(): TrafficResources {
  if (resources) return resources

  const hull = new BoxGeometry(TRAFFIC.bodyWidth, TRAFFIC.bodyHeight, TRAFFIC.bodyLength)
  hull.translate(0, TRAFFIC.bodyCentreY, 0)

  const cabin = new BoxGeometry(TRAFFIC.cabinWidth, TRAFFIC.cabinHeight, TRAFFIC.cabinLength)
  cabin.translate(
    0,
    TRAFFIC.bodyCentreY + TRAFFIC.bodyHeight / 2 + TRAFFIC.cabinHeight / 2,
    TRAFFIC.cabinOffsetZ,
  )

  // Both wheels of an axle live in one geometry, so spinning the pair is a
  // single rotation about its own axis instead of four separate meshes.
  const left = new CylinderGeometry(
    TRAFFIC.wheelRadius,
    TRAFFIC.wheelRadius,
    TRAFFIC.wheelWidth,
    14,
  )
  left.rotateZ(Math.PI / 2)
  const right = left.clone()
  left.translate(-TRAFFIC.track / 2, 0, 0)
  right.translate(TRAFFIC.track / 2, 0, 0)

  resources = {
    body: mergeGeometries([hull, cabin], false),
    axle: mergeGeometries([left, right], false),
    bodyMaterial: new MeshLambertMaterial(),
    wheelMaterial: new MeshLambertMaterial({ color: COLORS.ink }),
  }

  return resources
}

type Vehicle = {
  u: number
  direction: number
  laneOffset: number
  speedScale: number
  phase: number
  spin: number
}

function createVehicles(): Vehicle[] {
  return TRAFFIC.directions.map((direction, index) => ({
    u: TRAFFIC.startOffsets[index],
    direction,
    // Opposite directions sit on opposite sides of the centreline.
    laneOffset: ROAD.laneOffset * direction,
    speedScale: TRAFFIC.speedScales[index],
    phase: index * 2.1,
    spin: 0,
  }))
}

export function Traffic() {
  const bodyRef = useRef<InstancedMesh>(null)
  const axleRef = useRef<InstancedMesh>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const vehicles = useRef<Vehicle[]>(createVehicles())
  const { body, axle, bodyMaterial, wheelMaterial } = getResources()

  useEffect(() => {
    const mesh = bodyRef.current
    if (!mesh) return
    const colour = new Color()
    vehicles.current.forEach((_, index) => {
      mesh.setColorAt(index, colour.set(TRAFFIC.colors[index]))
    })
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [])

  useFrame((state, delta) => {
    const bodyMesh = bodyRef.current
    const axleMesh = axleRef.current
    if (!bodyMesh || !axleMesh) return

    const step = Math.min(delta, 0.05)
    const moving = !prefersReducedMotion
    const elapsed = state.clock.elapsedTime

    vehicles.current.forEach((vehicle, index) => {
      const wander =
        1 + TRAFFIC.wanderAmplitude * Math.sin(TRAFFIC.wanderFrequency * elapsed + vehicle.phase)
      const speed = TRAFFIC.baseSpeed * vehicle.speedScale * wander

      if (moving) {
        // Arc-length parameterisation means equal u steps are equal distances,
        // so the cars hold their speed through corners instead of surging.
        vehicle.u = wrapU(vehicle.u + (speed * step * vehicle.direction) / roadLength)
        vehicle.spin += (speed * step) / TRAFFIC.wheelRadius
      }

      getLanePoint(vehicle.u, vehicle.laneOffset, position)
      getTangentAt(vehicle.u, tangent)
      forward.copy(tangent).multiplyScalar(vehicle.direction).normalize()
      right.crossVectors(UP, forward).normalize()
      up.crossVectors(forward, right).normalize()

      basis.makeBasis(right, up, forward)
      orientation.setFromRotationMatrix(basis)

      const bank = Math.max(
        -TRAFFIC.maxBank,
        Math.min(
          TRAFFIC.maxBank,
          getCurvatureAt(vehicle.u) * vehicle.direction * TRAFFIC.bankScale,
        ),
      )
      roll.setFromAxisAngle(forward, bank)
      orientation.premultiply(roll)

      position.y = ROAD.roadY
      carMatrix.compose(position, orientation, UNIT_SCALE)
      bodyMesh.setMatrixAt(index, carMatrix)

      for (let axleIndex = 0; axleIndex < 2; axleIndex += 1) {
        const z = axleIndex === 0 ? TRAFFIC.wheelbase / 2 : -TRAFFIC.wheelbase / 2
        axleOffset.makeTranslation(0, TRAFFIC.wheelRadius, z)
        axleSpin.makeRotationX(vehicle.spin)
        axleMatrix.multiplyMatrices(carMatrix, axleOffset).multiply(axleSpin)
        axleMesh.setMatrixAt(index * 2 + axleIndex, axleMatrix)
      }
    })

    bodyMesh.instanceMatrix.needsUpdate = true
    axleMesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[body, bodyMaterial, VEHICLE_COUNT]}
        castShadow
        receiveShadow={false}
      />
      <instancedMesh
        ref={axleRef}
        args={[axle, wheelMaterial, VEHICLE_COUNT * 2]}
        castShadow
        receiveShadow={false}
      />
    </group>
  )
}
