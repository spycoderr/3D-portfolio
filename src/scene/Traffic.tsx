import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useEstate } from '@/store/useEstate'
import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { COLORS, ROAD, TRAFFIC } from './constants'
import { getCurvatureAt, getLanePoint, getLaneStretchAt, getTangentAt, roadLength, wrapU } from './curves'

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
const blobMatrix = new Matrix4()
const heading = new Quaternion()
const blobPosition = new Vector3()

type TrafficResources = {
  body: BufferGeometry
  axle: BufferGeometry
  bodyMaterial: MeshLambertMaterial
  wheelMaterial: MeshLambertMaterial
  blob: BufferGeometry
  blobMaterial: MeshBasicMaterial
}

// A soft dark oval, darkest in the middle, fading to nothing at the edge.
function createBlobTexture(): CanvasTexture {
  const size = TRAFFIC.blobTextureSize
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(0,0,0,1)')
  gradient.addColorStop(0.55, 'rgba(0,0,0,0.7)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  return new CanvasTexture(canvas)
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

  const blob = new PlaneGeometry(TRAFFIC.blobWidth, TRAFFIC.blobLength)
  blob.rotateX(-Math.PI / 2)

  resources = {
    body: mergeGeometries([hull, cabin], false),
    axle: mergeGeometries([left, right], false),
    bodyMaterial: new MeshLambertMaterial(),
    wheelMaterial: new MeshLambertMaterial({ color: COLORS.ink }),
    blob,
    blobMaterial: new MeshBasicMaterial({
      color: '#000000',
      alphaMap: createBlobTexture(),
      transparent: true,
      opacity: TRAFFIC.blobOpacity,
      depthWrite: false,
    }),
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
  const vehicles = TRAFFIC.directions.map((direction, index) => ({
    u: TRAFFIC.startOffsets[index],
    direction,
    // Opposite directions sit on opposite sides of the centreline.
    laneOffset: ROAD.laneOffset * direction,
    speedScale: TRAFFIC.speedScales[index],
    phase: index * 2.1,
    spin: 0,
  }))
  // Build each lane's stretch table now, behind the loading screen, rather
  // than on the first frame the cars move.
  for (const vehicle of vehicles) getLaneStretchAt(vehicle.u, vehicle.laneOffset)
  return vehicles
}

export function Traffic() {
  const bodyRef = useRef<InstancedMesh>(null)
  const axleRef = useRef<InstancedMesh>(null)
  const blobRef = useRef<InstancedMesh>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const paused = useEstate((state) => state.paused)

  const vehicles = useRef<Vehicle[]>(createVehicles())
  const { body, axle, bodyMaterial, wheelMaterial, blob, blobMaterial } = getResources()

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
    const blobMesh = blobRef.current
    if (!bodyMesh || !axleMesh || !blobMesh) return

    const step = Math.min(delta, 0.05)
    const moving = !prefersReducedMotion && !paused
    const elapsed = state.clock.elapsedTime

    vehicles.current.forEach((vehicle, index) => {
      const wander =
        1 + TRAFFIC.wanderAmplitude * Math.sin(TRAFFIC.wanderFrequency * elapsed + vehicle.phase)
      const speed = TRAFFIC.baseSpeed * vehicle.speedScale * wander

      if (moving) {
        // u is centreline arc length; the lane's stretch turns it into the
        // distance this car actually covers, so its speed holds through bends.
        const stretch = getLaneStretchAt(vehicle.u, vehicle.laneOffset)
        vehicle.u = wrapU(vehicle.u + (speed * step * vehicle.direction) / (roadLength * stretch))
        vehicle.spin += (speed * step) / TRAFFIC.wheelRadius
      }

      getLanePoint(vehicle.u, vehicle.laneOffset, position)
      getTangentAt(vehicle.u, tangent)
      forward.copy(tangent).multiplyScalar(vehicle.direction).normalize()
      right.crossVectors(UP, forward).normalize()
      up.crossVectors(forward, right).normalize()

      basis.makeBasis(right, up, forward)
      orientation.setFromRotationMatrix(basis)

      // The blob lies flat and follows the heading, never the body's roll.
      heading.copy(orientation)
      blobPosition.set(position.x, TRAFFIC.blobY, position.z)
      blobMatrix.compose(blobPosition, heading, UNIT_SCALE)
      blobMesh.setMatrixAt(index, blobMatrix)

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
    blobMesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[body, bodyMaterial, VEHICLE_COUNT]}
        castShadow={false}
        receiveShadow={false}
      />
      <instancedMesh
        ref={axleRef}
        args={[axle, wheelMaterial, VEHICLE_COUNT * 2]}
        castShadow={false}
        receiveShadow={false}
      />
      <instancedMesh
        ref={blobRef}
        args={[blob, blobMaterial, VEHICLE_COUNT]}
        castShadow={false}
        receiveShadow={false}
        raycast={() => null}
      />
    </group>
  )
}
