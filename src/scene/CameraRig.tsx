import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Spherical, Vector3 } from 'three'
import { plots, type Plot } from '@/data/plots'
import { useCoarsePointer, useIsMobile } from '@/hooks/useIsMobile'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useEstate, type CameraMode } from '@/store/useEstate'
import { BUILDING, CAMERA, FOCUS } from './constants'

type Controls = ComponentRef<typeof OrbitControls>

type Pose = { position: Vector3; target: Vector3 }

// Interpolating in spherical space keeps the camera on a dome around the model,
// so it swings around the estate instead of cutting a straight line through it.
type Transition = {
  fromTarget: Vector3
  toTarget: Vector3
  fromRadius: number
  fromPhi: number
  fromTheta: number
  toRadius: number
  toPhi: number
  deltaTheta: number
  startedAt: number
}

type Limits = {
  min: number
  max: number
  azimuth: { center: number; arc: number } | null
}

const UP = new Vector3(0, 1, 0)

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function shortestAngle(from: number, to: number): number {
  let delta = (to - from) % (Math.PI * 2)
  if (delta > Math.PI) delta -= Math.PI * 2
  if (delta < -Math.PI) delta += Math.PI * 2
  return delta
}

function overviewPose(): Pose {
  return {
    position: new Vector3(...CAMERA.homePosition),
    target: new Vector3(...CAMERA.homeTarget),
  }
}

function plotPose(plot: Plot, mode: CameraMode, isMobile: boolean): Pose {
  const base = new Vector3(...plot.position)
  const interior = mode === 'interior'

  // Framing follows the building's largest dimension, height included. Using
  // the footprint alone pulled the camera far too close to tall plots.
  const height = plot.floors * BUILDING.floorHeight + BUILDING.roofHeight
  const size = Math.max(plot.footprint.w, plot.footprint.d, height)

  let distance = size * FOCUS.distanceScale
  if (interior) distance *= FOCUS.interiorDistanceFactor
  const elevation = interior ? FOCUS.interiorElevation : FOCUS.elevation

  // Buildings face the estate centre, so the camera belongs on the inward side,
  // out over the road where a visitor would stand to see the front door. Taken
  // from position rather than the stored rotation so it stays correct whenever
  // plots are moved.
  const outward = base.clone().setY(0)
  if (outward.lengthSq() === 0) outward.set(0, 0, 1)
  outward.normalize()
  const azimuth = Math.atan2(-outward.x, -outward.z) + FOCUS.azimuthOffset

  // Aim at the top storey, which is the one that opens up into the room.
  const roomY =
    BUILDING.padBaseY +
    BUILDING.padHeight +
    (plot.floors - 1) * BUILDING.floorHeight +
    BUILDING.floorHeight * FOCUS.targetHeightFactor
  const target = new Vector3(base.x, roomY, base.z)

  const horizontal = Math.cos(elevation) * distance
  const position = new Vector3(
    target.x + Math.sin(azimuth) * horizontal,
    target.y + Math.sin(elevation) * distance,
    target.z + Math.cos(azimuth) * horizontal,
  )

  // Move the look-at point right so the building sits clear of the detail panel.
  if (!isMobile && !interior) {
    const view = target.clone().sub(position).setY(0).normalize()
    target.addScaledVector(new Vector3(-view.z, 0, view.x), distance * FOCUS.panelShiftFactor)
  }

  return { position, target }
}

export function CameraRig() {
  const controlsRef = useRef<Controls>(null)
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)

  const mode = useEstate((state) => state.mode)
  const selectedPlotId = useEstate((state) => state.selectedPlotId)
  const hasEngaged = useEstate((state) => state.hasEngaged)
  const engage = useEstate((state) => state.engage)

  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobile()
  const coarsePointer = useCoarsePointer()

  // Drives the control gating as a prop rather than a per-frame write, so the
  // gate is correct from the moment React renders, not from the first frame.
  const [flying, setFlying] = useState(false)
  const transition = useRef<Transition | null>(null)
  const limits = useRef<Limits>({
    min: CAMERA.minDistance,
    max: CAMERA.maxDistance,
    azimuth: null,
  })
  const lastInputAt = useRef(performance.now() / 1000)
  const initialised = useRef(false)

  const offset = useMemo(() => new Vector3(), [])
  const spherical = useMemo(() => new Spherical(), [])

  // A pointer press counts as engaging on desktop, where dragging can never be
  // a page scroll. Touch has to engage through the affordance instead.
  useEffect(() => {
    const element = gl.domElement
    const markInput = () => {
      lastInputAt.current = performance.now() / 1000
    }
    const onPointerDown = () => {
      markInput()
      if (!coarsePointer) engage()
    }
    const onPointerMove = (event: PointerEvent) => {
      if (event.buttons > 0) markInput()
    }

    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('wheel', markInput, { passive: true })
    element.addEventListener('touchstart', markInput, { passive: true })
    element.addEventListener('touchmove', markInput, { passive: true })
    return () => {
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('wheel', markInput)
      element.removeEventListener('touchstart', markInput)
      element.removeEventListener('touchmove', markInput)
    }
  }, [gl, engage, coarsePointer])

  // Child effects run first, so this overrides the touchAction OrbitControls
  // sets on connect. The per-frame guard below re-asserts it after a reconnect.
  useEffect(() => {
    gl.domElement.style.touchAction = hasEngaged ? 'none' : 'pan-y'
  }, [gl, hasEngaged])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const plot = selectedPlotId ? (plots.find((p) => p.id === selectedPlotId) ?? null) : null
    const pose = mode === 'overview' || !plot ? overviewPose() : plotPose(plot, mode, isMobile)
    const radius = pose.position.distanceTo(pose.target)

    // Applied before the next frame, so update() never clamps the new pose to
    // the previous mode's distance range and snaps.
    limits.current = {
      min: mode === 'overview' ? CAMERA.minDistance : radius * FOCUS.minDistanceFactor,
      max: mode === 'overview' ? CAMERA.maxDistance : radius * FOCUS.maxDistanceFactor,
      azimuth:
        mode === 'interior'
          ? {
              center: Math.atan2(
                pose.position.x - pose.target.x,
                pose.position.z - pose.target.z,
              ),
              arc: FOCUS.interiorAzimuthArc,
            }
          : null,
    }
    controls.minDistance = limits.current.min
    controls.maxDistance = limits.current.max
    controls.minAzimuthAngle = limits.current.azimuth
      ? limits.current.azimuth.center - limits.current.azimuth.arc
      : -Infinity
    controls.maxAzimuthAngle = limits.current.azimuth
      ? limits.current.azimuth.center + limits.current.azimuth.arc
      : Infinity

    const settle = () => {
      transition.current = null
      camera.position.copy(pose.position)
      controls.target.copy(pose.target)
      camera.lookAt(pose.target)
      controls.update()
    }

    // Crossing the panel breakpoint re-runs this while already parked, so a
    // pose that matches settles instead of burning 1.1s going nowhere.
    const alreadyThere =
      camera.position.distanceToSquared(pose.position) < 1e-4 &&
      controls.target.distanceToSquared(pose.target) < 1e-4

    if (!initialised.current || prefersReducedMotion || alreadyThere) {
      initialised.current = true
      settle()
      setFlying(false)
      return
    }

    // Starting from where the camera actually is means interrupting a flight
    // mid-air continues from that point rather than snapping to a stored origin.
    const fromTarget = controls.target.clone()
    const from = new Spherical().setFromVector3(camera.position.clone().sub(fromTarget))
    const to = new Spherical().setFromVector3(pose.position.clone().sub(pose.target))

    transition.current = {
      fromTarget,
      toTarget: pose.target,
      fromRadius: from.radius,
      fromPhi: from.phi,
      fromTheta: from.theta,
      toRadius: to.radius,
      toPhi: to.phi,
      deltaTheta: shortestAngle(from.theta, to.theta),
      startedAt: performance.now() / 1000,
    }
    setFlying(true)

    // Guarantees arrival even if frames stop being delivered mid-flight, so
    // switching away mid-transition can never strand the camera part-way.
    const timer = window.setTimeout(() => {
      settle()
      setFlying(false)
    }, CAMERA.transitionDuration * 1000)
    return () => window.clearTimeout(timer)
  }, [mode, selectedPlotId, isMobile, prefersReducedMotion, camera])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    // OrbitControls rewrites touchAction whenever it connects or disposes, so
    // owning it per frame is the only way to keep the pre-engagement scroll.
    const touchAction = hasEngaged ? 'none' : 'pan-y'
    if (gl.domElement.style.touchAction !== touchAction) {
      gl.domElement.style.touchAction = touchAction
    }

    const flight = transition.current

    if (flight) {
      const elapsed = performance.now() / 1000 - flight.startedAt
      const t = Math.min(elapsed / CAMERA.transitionDuration, 1)
      const k = easeInOutCubic(t)

      controls.target.lerpVectors(flight.fromTarget, flight.toTarget, k)
      spherical.radius = flight.fromRadius + (flight.toRadius - flight.fromRadius) * k
      spherical.phi = flight.fromPhi + (flight.toPhi - flight.fromPhi) * k
      spherical.theta = flight.fromTheta + flight.deltaTheta * k
      spherical.makeSafe()

      offset.setFromSpherical(spherical)
      camera.position.copy(controls.target).add(offset)
      camera.lookAt(controls.target)
      return
    }

    if (mode !== 'overview' || prefersReducedMotion) return

    const now = performance.now() / 1000
    if (now - lastInputAt.current < CAMERA.idleDelay) return

    const step = Math.min(delta, CAMERA.maxFrameDelta) * CAMERA.idleDriftSpeed
    offset.copy(camera.position).sub(controls.target).applyAxisAngle(UP, step)
    camera.position.copy(controls.target).add(offset)
    camera.lookAt(controls.target)
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableDamping
      // Input is off during a flight, but controls keep updating so leftover
      // drag momentum decays instead of kicking in on arrival.
      enableZoom={hasEngaged && !flying}
      enableRotate={(coarsePointer ? hasEngaged : true) && !flying}
      dampingFactor={CAMERA.dampingFactor}
      rotateSpeed={CAMERA.rotateSpeed}
      zoomSpeed={CAMERA.zoomSpeed}
      minPolarAngle={CAMERA.minPolarAngle}
      maxPolarAngle={CAMERA.maxPolarAngle}
    />
  )
}
