import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  SphereGeometry,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { plots, type Plot } from '@/data/plots'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useEstate } from '@/store/useEstate'
import { getOpenParts, type OpenParts } from './Building'
import { COLORS, INTERIOR, REVEAL } from './constants'

const roomMaterial = new MeshLambertMaterial({ vertexColors: true })

function box(w: number, h: number, d: number, x = 0, y = 0, z = 0): BufferGeometry {
  const geometry = new BoxGeometry(w, h, d)
  geometry.translate(x, y, z)
  return geometry
}

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

function merge(parts: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  return merged
}

// The monitor is what tells you which project you are standing in, so each
// kind gets its own drawing rather than a generic screen.
function createScreenTexture(kind: Plot['interior']['monitorContent']): CanvasTexture {
  const width = 320
  const height = 208
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!

  context.fillStyle = COLORS.screenBg
  context.fillRect(0, 0, width, height)

  if (kind === 'chart') {
    const bars = [0.25, 0.4, 0.34, 0.56, 0.68, 0.82]
    context.fillStyle = '#4d7fae'
    bars.forEach((value, index) => {
      const barWidth = 34
      const x = 34 + index * 44
      const barHeight = value * 140
      context.fillRect(x, height - 34 - barHeight, barWidth, barHeight)
    })
    context.fillStyle = '#7d8b99'
    context.fillRect(24, height - 32, width - 48, 2)
  }

  if (kind === 'board') {
    const columns = ['#c2603f', '#4d7fae', '#4e8a52']
    columns.forEach((colour, column) => {
      const x = 26 + column * 96
      context.fillStyle = '#1c242e'
      context.fillRect(x, 24, 80, height - 48)
      context.fillStyle = colour
      const cards = column === 1 ? 3 : 2
      for (let card = 0; card < cards; card += 1) {
        context.fillRect(x + 8, 36 + card * 40, 64, 28)
      }
    })
  }

  if (kind === 'code') {
    const palette = ['#7fb2e5', '#c9a227', '#9fd39f', '#c98a8a']
    for (let line = 0; line < 9; line += 1) {
      const indent = (line % 3) * 18
      context.fillStyle = palette[line % palette.length]
      context.fillRect(28 + indent, 24 + line * 20, 60 + ((line * 37) % 150), 8)
    }
  }

  if (kind === 'docs') {
    context.fillStyle = '#e8e4da'
    context.fillRect(24, 20, 190, height - 40)
    context.fillStyle = '#9aa3ad'
    for (let line = 0; line < 7; line += 1) {
      context.fillRect(38, 40 + line * 20, 150 - ((line * 23) % 60), 6)
    }
    // Version history down the side.
    context.fillStyle = '#1c242e'
    context.fillRect(232, 20, 64, height - 40)
    context.fillStyle = '#4d7fae'
    for (let entry = 0; entry < 5; entry += 1) {
      context.fillRect(242, 36 + entry * 32, 44, 18)
    }
  }

  if (kind === 'graph') {
    const points = [0.3, 0.45, 0.38, 0.62, 0.55, 0.78, 0.7]
    context.strokeStyle = '#6fc0a8'
    context.lineWidth = 4
    context.beginPath()
    points.forEach((value, index) => {
      const x = 30 + index * 43
      const y = height - 34 - value * 130
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    })
    context.stroke()
    context.fillStyle = '#7d8b99'
    context.fillRect(24, height - 32, width - 48, 2)
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

function createPosterTexture(text: string): CanvasTexture {
  const width = 320
  const height = 216
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!

  context.fillStyle = COLORS.paper
  context.fillRect(0, 0, width, height)
  context.fillStyle = COLORS.ink
  context.font = 'bold 30px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (context.measureText(candidate).width > width - 48 && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)

  lines.forEach((line, index) => {
    context.fillText(line, width / 2, height / 2 + (index - (lines.length - 1) / 2) * 38)
  })

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

// One atlas for every shelf label, so the stack on the shelf costs one draw call.
function createShelfAtlas(items: readonly string[]): CanvasTexture {
  const cell = 128
  const canvas = document.createElement('canvas')
  canvas.width = cell
  canvas.height = cell * Math.max(1, items.length)
  const context = canvas.getContext('2d')!

  items.forEach((item, index) => {
    context.fillStyle = COLORS.shelfBlock
    context.fillRect(0, index * cell, cell, cell)
    context.fillStyle = COLORS.ink
    context.font = 'bold 20px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(item, cell / 2, index * cell + cell / 2, cell - 12)
  })

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

type RoomParts = {
  furniture: BufferGeometry
  screen: BufferGeometry
  screenTexture: CanvasTexture
  poster: BufferGeometry
  posterTexture: CanvasTexture
  labels: BufferGeometry | null
  labelTexture: CanvasTexture | null
}

function composeRoom(plot: Plot, open: OpenParts): RoomParts {
  const parts: BufferGeometry[] = []
  const width = open.roomWidth
  const depth = open.roomDepth
  const floorY = open.roomFloorY
  const isAbout = plot.kind === 'about'

  parts.push(tint(box(INTERIOR.rugWidth, 0.012, INTERIOR.rugDepth, 0, floorY + 0.008, 0.1), COLORS.rug))

  // Desk against the back wall, so the screen faces the way the camera arrives.
  const deskWidth = Math.min(INTERIOR.deskWidth, width * 0.68)
  const deskZ = -depth / 2 + INTERIOR.deskDepth / 2 + 0.1
  const deskTopY = floorY + INTERIOR.deskHeight
  parts.push(
    tint(box(deskWidth, INTERIOR.deskTopThickness, INTERIOR.deskDepth, 0, deskTopY, deskZ), COLORS.wood),
  )
  for (const side of [-1, 1]) {
    parts.push(
      tint(
        box(
          0.05,
          INTERIOR.deskHeight,
          INTERIOR.deskDepth - 0.06,
          (side * (deskWidth - 0.05)) / 2,
          floorY + INTERIOR.deskHeight / 2,
          deskZ,
        ),
        COLORS.woodDark,
      ),
    )
  }

  // Monitor: stand and bezel here, the lit face is its own textured plane.
  const monitorY = deskTopY + INTERIOR.monitorStandHeight + INTERIOR.monitorHeight / 2
  parts.push(
    tint(box(0.1, INTERIOR.monitorStandHeight, 0.1, 0, deskTopY + INTERIOR.monitorStandHeight / 2, deskZ), COLORS.screenFrame),
  )
  parts.push(
    tint(
      box(INTERIOR.monitorWidth + 0.05, INTERIOR.monitorHeight + 0.05, 0.03, 0, monitorY, deskZ - 0.01),
      COLORS.screenFrame,
    ),
  )

  const chairZ = deskZ + INTERIOR.deskDepth / 2 + 0.32
  parts.push(tint(box(0.4, 0.05, 0.4, 0, floorY + INTERIOR.chairSeatHeight, chairZ), COLORS.fabric))
  parts.push(
    tint(box(0.4, 0.34, 0.05, 0, floorY + INTERIOR.chairSeatHeight + 0.19, chairZ + 0.18), COLORS.fabric),
  )
  parts.push(
    tint(box(0.07, INTERIOR.chairSeatHeight, 0.07, 0, floorY + INTERIOR.chairSeatHeight / 2, chairZ), COLORS.woodDark),
  )

  // Desk lamp.
  parts.push(tint(box(0.12, 0.02, 0.12, deskWidth / 2 - 0.16, deskTopY + 0.03, deskZ + 0.1), COLORS.brass))
  parts.push(
    tint(box(0.02, INTERIOR.lampHeight, 0.02, deskWidth / 2 - 0.16, deskTopY + INTERIOR.lampHeight / 2, deskZ + 0.1), COLORS.brass),
  )
  const shade = new CylinderGeometry(0.04, 0.09, 0.09, 10)
  shade.translate(deskWidth / 2 - 0.16, deskTopY + INTERIOR.lampHeight, deskZ + 0.1)
  parts.push(tint(shade, COLORS.brass))

  // Shelf on the right-hand wall, carrying one labelled block per stack item.
  const shelfX = width / 2 - 0.12
  const shelfItems = plot.interior.shelfItems
  const boards = isAbout
    ? [INTERIOR.shelfLowerY, INTERIOR.shelfUpperY, INTERIOR.shelfUpperY + 0.34]
    : [INTERIOR.shelfLowerY, INTERIOR.shelfUpperY]
  for (const boardY of boards) {
    parts.push(
      tint(box(0.22, INTERIOR.shelfBoardThickness, INTERIOR.shelfWidth, shelfX, floorY + boardY, 0), COLORS.wood),
    )
  }

  const labelFaces: BufferGeometry[] = []
  shelfItems.forEach((_item, index) => {
    const perBoard = Math.ceil(shelfItems.length / 2) || 1
    const boardY = index < perBoard ? INTERIOR.shelfLowerY : INTERIOR.shelfUpperY
    const slot = index % perBoard
    const spacing = INTERIOR.shelfWidth / (perBoard + 1)
    const z = -INTERIOR.shelfWidth / 2 + spacing * (slot + 1)
    const y = floorY + boardY + INTERIOR.shelfBoardThickness / 2 + INTERIOR.blockSize / 2

    parts.push(
      tint(box(0.12, INTERIOR.blockSize, INTERIOR.blockSize, shelfX, y, z), COLORS.shelfBlock),
    )

    // The label reads off the inward face of the block.
    const face = new PlaneGeometry(INTERIOR.blockSize, INTERIOR.blockSize)
    const uv = face.attributes.uv as BufferAttribute
    for (let vertex = 0; vertex < uv.count; vertex += 1) {
      uv.setXY(
        vertex,
        uv.getX(vertex),
        (shelfItems.length - 1 - index + uv.getY(vertex)) / shelfItems.length,
      )
    }
    uv.needsUpdate = true
    face.rotateY(-Math.PI / 2)
    face.translate(shelfX - 0.061, y, z)
    labelFaces.push(face)
  })

  // Poster on the left-hand wall.
  const posterX = -width / 2 + 0.06
  parts.push(
    tint(
      box(0.03, INTERIOR.posterHeight + 0.05, INTERIOR.posterWidth + 0.05, posterX, floorY + INTERIOR.posterY, 0),
      COLORS.woodDark,
    ),
  )
  const poster = new PlaneGeometry(INTERIOR.posterWidth, INTERIOR.posterHeight)
  poster.rotateY(Math.PI / 2)
  poster.translate(posterX + 0.02, floorY + INTERIOR.posterY, 0)

  // Plant in the far corner.
  const plantX = -width / 2 + 0.26
  const plantZ = -depth / 2 + 0.26
  const pot = new CylinderGeometry(INTERIOR.plantPotRadius, INTERIOR.plantPotRadius * 0.8, INTERIOR.plantPotHeight, 10)
  pot.translate(plantX, floorY + INTERIOR.plantPotHeight / 2, plantZ)
  parts.push(tint(pot, COLORS.pot))
  const foliage = new SphereGeometry(0.21, 10, 8)
  foliage.translate(plantX, floorY + INTERIOR.plantPotHeight + 0.17, plantZ)
  parts.push(tint(foliage, COLORS.leaf))

  if (isAbout) {
    // Framed things on the back wall, and something personal in the corner.
    for (let index = 0; index < 3; index += 1) {
      parts.push(
        tint(
          box(0.26, 0.2, 0.03, -width / 4 + index * 0.34, floorY + 1.05, -depth / 2 + 0.05),
          COLORS.brass,
        ),
      )
    }
    const bat = box(0.09, 0.72, 0.05, width / 2 - 0.3, floorY + 0.36, depth / 2 - 0.3)
    bat.rotateZ(0.18)
    parts.push(tint(bat, COLORS.wood))
  }

  const screen = new PlaneGeometry(INTERIOR.monitorWidth, INTERIOR.monitorHeight)
  screen.translate(0, monitorY, deskZ + 0.007)

  return {
    furniture: merge(parts),
    screen,
    screenTexture: createScreenTexture(plot.interior.monitorContent),
    poster,
    posterTexture: createPosterTexture(plot.interior.posterText),
    labels: labelFaces.length ? merge(labelFaces) : null,
    labelTexture: labelFaces.length ? createShelfAtlas(shelfItems) : null,
  }
}

const roomCache = new Map<string, RoomParts>()

function getRoom(plot: Plot, open: OpenParts): RoomParts {
  let room = roomCache.get(plot.id)
  if (!room) {
    room = composeRoom(plot, open)
    roomCache.set(plot.id, room)
  }
  return room
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const cameraWorld = new Vector3()
const wallWorld = new Vector3()
const toCamera = new Vector3()
const wallNormal = new Vector3()

function OpenBuilding({ plot, progress }: { plot: Plot; progress: { current: number } }) {
  const open = useMemo(() => getOpenParts(plot), [plot])
  const room = useMemo(() => getRoom(plot, open), [plot, open])
  const camera = useThree((state) => state.camera)

  const roofRef = useRef<Group>(null)
  const roomRef = useRef<Group>(null)
  const wallRefs = useRef<(Mesh | null)[]>([])

  // Always transparent with depth writing off. Toggling either would recompile
  // the shader mid-reveal, and depth testing alone keeps far walls behind the
  // furniture while near walls blend over it.
  const wallMaterials = useMemo(
    () =>
      open.walls.map(
        () =>
          new MeshLambertMaterial({
            vertexColors: true,
            transparent: true,
            depthWrite: false,
            opacity: 1,
          }),
      ),
    [open.walls],
  )

  useEffect(() => () => wallMaterials.forEach((material) => material.dispose()), [wallMaterials])

  useFrame(() => {
    const t = progress.current
    const roofT = easeInOut(Math.min(t / REVEAL.roofSpan, 1))
    const wallT = easeInOut(Math.max(0, Math.min((t - REVEAL.wallDelay) / REVEAL.wallSpan, 1)))

    if (roofRef.current) {
      roofRef.current.position.y = roofT * REVEAL.roofLift
      roofRef.current.position.z = roofT * REVEAL.roofDrift
    }
    if (roomRef.current) roomRef.current.visible = wallT > 0.01

    camera.getWorldPosition(cameraWorld)

    open.walls.forEach((wall, index) => {
      const mesh = wallRefs.current[index]
      if (!mesh) return
      mesh.getWorldPosition(wallWorld)
      wallNormal.copy(wall.normal).transformDirection(mesh.matrixWorld)
      toCamera.copy(cameraWorld).sub(wallWorld).normalize()

      // Saturates well before head-on, because a three-quarter view meets both
      // near walls at an angle and half-fading each of them hides the room.
      // Walls turned away, or seen edge-on, still stay solid.
      const dot = wallNormal.dot(toCamera)
      const facing = Math.min(1, Math.max(0, dot) / REVEAL.wallFadeThreshold)
      wallMaterials[index].opacity = 1 - (1 - REVEAL.wallMinOpacity) * facing * wallT
    })
  })

  return (
    <group position={plot.position} rotation={[0, plot.rotation, 0]}>
      <mesh geometry={open.body} material={roomMaterial} castShadow receiveShadow raycast={() => null} />
      <mesh geometry={open.floor} material={roomMaterial} receiveShadow castShadow={false} raycast={() => null} />

      {/* The roof stops casting once it is off, otherwise it drops its own
          shadow straight onto the room it just uncovered. */}
      <group ref={roofRef}>
        <mesh geometry={open.roof} material={roomMaterial} castShadow={false} receiveShadow raycast={() => null} />
      </group>

      {open.walls.map((wall, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            wallRefs.current[index] = mesh
          }}
          geometry={wall.geometry}
          material={wallMaterials[index]}
          renderOrder={2}
          castShadow={false}
          receiveShadow={false}
          raycast={() => null}
        />
      ))}

      <group ref={roomRef}>
        <mesh geometry={room.furniture} material={roomMaterial} castShadow receiveShadow raycast={() => null} />
        <mesh geometry={room.screen} raycast={() => null}>
          <meshBasicMaterial map={room.screenTexture} />
        </mesh>
        <mesh geometry={room.poster} raycast={() => null}>
          <meshBasicMaterial map={room.posterTexture} />
        </mesh>
        {room.labels && room.labelTexture && (
          <mesh geometry={room.labels} raycast={() => null}>
            <meshBasicMaterial map={room.labelTexture} />
          </mesh>
        )}
      </group>
    </group>
  )
}

export function Interiors() {
  const selectedPlotId = useEstate((state) => state.selectedPlotId)
  const openPlotId = useEstate((state) => state.openPlotId)
  const setOpenPlot = useEstate((state) => state.setOpenPlot)
  const prefersReducedMotion = usePrefersReducedMotion()

  const progress = useRef(0)
  const target = useRef(0)

  useEffect(() => {
    if (selectedPlotId) {
      setOpenPlot(selectedPlotId)
      target.current = 1
      // Reduced motion skips the sequence: the roof is simply already off.
      if (prefersReducedMotion) progress.current = 1
      return
    }

    target.current = 0
    if (prefersReducedMotion) {
      progress.current = 0
      setOpenPlot(null)
      return
    }

    // Kept mounted until the closing sequence has finished playing.
    const timer = window.setTimeout(() => setOpenPlot(null), REVEAL.durationSeconds * 1000)
    return () => window.clearTimeout(timer)
  }, [selectedPlotId, prefersReducedMotion, setOpenPlot])

  useFrame((_, delta) => {
    if (prefersReducedMotion) return
    const step = Math.min(delta, 0.05) / REVEAL.durationSeconds
    const next = Math.max(0, Math.min(1, progress.current + (target.current === 1 ? step : -step)))
    progress.current = next
  })

  const plot = openPlotId ? plots.find((entry) => entry.id === openPlotId) : null
  if (!plot) return null

  return <OpenBuilding plot={plot} progress={progress} />
}
