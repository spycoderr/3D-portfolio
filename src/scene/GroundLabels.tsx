import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferAttribute,
  CanvasTexture,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  type BufferGeometry,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { palette } from '@/theme'
import { useEstate } from '@/store/useEstate'
import { buildingPlots } from './Building'
import { BUILDING, GROUND_LABEL } from './constants'

// Every plot name in one texture and one merged quad set, so the whole set of
// ground markings costs a single draw call. Per-plot fading rides on vertex
// alpha rather than on separate materials, which would cost one draw call each.

function createLabelAtlas(): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = GROUND_LABEL.cellWidth
  canvas.height = GROUND_LABEL.cellHeight * buildingPlots.length

  const context = canvas.getContext('2d')!
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = palette.grassDark
  context.font = `600 ${GROUND_LABEL.fontSize}px Inter, sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  buildingPlots.forEach((plot, index) => {
    context.fillText(
      plot.title,
      GROUND_LABEL.cellWidth / 2,
      index * GROUND_LABEL.cellHeight + GROUND_LABEL.cellHeight / 2,
      GROUND_LABEL.cellWidth * 0.9,
    )
  })

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

function buildLabels(): BufferGeometry {
  const rows = buildingPlots.length
  const quads = buildingPlots.map((plot, index) => {
    const quad = new PlaneGeometry(GROUND_LABEL.width, GROUND_LABEL.height)

    const uv = quad.attributes.uv as BufferAttribute
    for (let vertex = 0; vertex < uv.count; vertex += 1) {
      // Canvas rows run top-down while V runs bottom-up, so the row flips.
      uv.setY(vertex, (rows - 1 - index + uv.getY(vertex)) / rows)
    }
    uv.needsUpdate = true

    // Laid flat, then set beside the building on the grass rather than on the
    // driveway that runs up the middle of the plot's frontage.
    quad.rotateX(-Math.PI / 2)
    quad.translate(
      -(plot.footprint.w / 2 + GROUND_LABEL.offsetX),
      GROUND_LABEL.y,
      plot.footprint.d / 2 + BUILDING.padMargin + GROUND_LABEL.offsetZ,
    )
    quad.rotateY(plot.rotation)
    quad.translate(plot.position[0], 0, plot.position[2])

    // Four components so three enables vertex alpha; RGB stays white and lets
    // the atlas carry the colour. Alpha starts at rest, matching the fade state
    // the component begins from — otherwise a label that never changes is never
    // written, and stays at whatever the buffer was initialised to.
    const colours = new Float32Array(quad.attributes.position.count * 4)
    for (let vertex = 0; vertex < quad.attributes.position.count; vertex += 1) {
      colours[vertex * 4] = 1
      colours[vertex * 4 + 1] = 1
      colours[vertex * 4 + 2] = 1
      colours[vertex * 4 + 3] = GROUND_LABEL.restOpacity
    }
    quad.setAttribute('color', new BufferAttribute(colours, 4))

    return quad
  })

  const merged = mergeGeometries(quads, false)
  quads.forEach((quad) => quad.dispose())
  return merged
}

let resources: { geometry: BufferGeometry; material: MeshBasicMaterial } | null = null

function getResources() {
  if (!resources) {
    resources = {
      geometry: buildLabels(),
      material: new MeshBasicMaterial({
        map: createLabelAtlas(),
        transparent: true,
        vertexColors: true,
        // Lies flat on the grass; writing depth would let it fight the slab.
        depthWrite: false,
      }),
    }
  }
  return resources
}

export function GroundLabels() {
  const { geometry, material } = getResources()
  const hoveredPlotId = useEstate((state) => state.hoveredPlotId)
  const activePlotId = useEstate((state) => state.activePlotId)

  // Target per plot, recomputed only when the selection actually changes.
  const targets = useMemo(
    () =>
      buildingPlots.map((plot) =>
        plot.id === hoveredPlotId || plot.id === activePlotId
          ? GROUND_LABEL.activeOpacity
          : GROUND_LABEL.restOpacity,
      ),
    [hoveredPlotId, activePlotId],
  )

  const current = useRef<number[]>(buildingPlots.map(() => GROUND_LABEL.restOpacity))

  useFrame((_, delta) => {
    const colour = geometry.attributes.color as BufferAttribute
    const perQuad = colour.count / buildingPlots.length
    const blend = 1 - Math.pow(GROUND_LABEL.fadeDecay, Math.min(delta, 0.05))

    let changed = false
    for (let plot = 0; plot < buildingPlots.length; plot += 1) {
      const next = current.current[plot] + (targets[plot] - current.current[plot]) * blend
      if (Math.abs(next - current.current[plot]) < 0.0005) continue

      current.current[plot] = next
      changed = true
      for (let vertex = 0; vertex < perQuad; vertex += 1) {
        colour.setW(plot * perQuad + vertex, next)
      }
    }

    if (changed) colour.needsUpdate = true
  })

  return (
    <mesh
      geometry={geometry}
      material={material}
      receiveShadow={false}
      castShadow={false}
      raycast={() => null}
    />
  )
}
