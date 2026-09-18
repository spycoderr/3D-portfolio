import {
  CanvasTexture,
  DoubleSide,
  ExtrudeGeometry,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  type BufferGeometry,
} from 'three'
import { palette } from '@/theme'
import { SLAB } from './constants'
import { trackColour, trackTint } from './dusk'
import { slabShape } from './slab'

type GroundResources = {
  slab: BufferGeometry
  topMaterial: MeshLambertMaterial
  edgeMaterial: MeshLambertMaterial
  shadow: PlaneGeometry
  shadowMaterial: MeshBasicMaterial
}

let resources: GroundResources | null = null

// A soft gradient keeps 1400 square units of grass from reading as one dead
// fill, without costing a second material.
function createGrassTexture(): CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.1,
    size / 2,
    size / 2,
    size * 0.62,
  )
  gradient.addColorStop(0, palette.slabTop)
  gradient.addColorStop(0.6, palette.slabTop)
  gradient.addColorStop(1, palette.grassDark)
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

// Radial falloff painted once. A real shadow map has nothing to fall on here,
// because the slab floats over flat background colour.
function createShadowTexture(): CanvasTexture {
  const size = SLAB.shadowTextureSize
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  gradient.addColorStop(0, 'rgba(0,0,0,1)')
  gradient.addColorStop(0.55, 'rgba(0,0,0,0.72)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  return new CanvasTexture(canvas)
}

function getResources(): GroundResources {
  if (resources) return resources

  const slab = new ExtrudeGeometry(slabShape(), {
    depth: SLAB.thickness,
    bevelEnabled: true,
    bevelThickness: SLAB.bevel,
    bevelSize: SLAB.bevel,
    bevelOffset: 0,
    bevelSegments: SLAB.bevelSegments,
    curveSegments: SLAB.curveSegments,
  })

  // Extrusion runs along +Z, so the slab is laid flat and then dropped until
  // its top face sits exactly on y = 0 — the height every other prop assumes.
  slab.rotateX(-Math.PI / 2)
  slab.computeBoundingBox()
  slab.translate(0, SLAB.topY - slab.boundingBox!.max.y, 0)
  slab.computeVertexNormals()

  const shadow = new PlaneGeometry(SLAB.width * SLAB.shadowScale, SLAB.depth * SLAB.shadowScale)
  shadow.rotateX(-Math.PI / 2)

  const topMaterial = new MeshLambertMaterial({ map: createGrassTexture() })
  const edgeMaterial = new MeshLambertMaterial({ color: palette.slabEdge })
  trackTint(topMaterial.color, 'slabTop')
  trackColour(edgeMaterial.color, 'slabEdge')

  resources = {
    slab,
    topMaterial,
    edgeMaterial,
    shadow,
    shadowMaterial: new MeshBasicMaterial({
      map: createShadowTexture(),
      transparent: true,
      opacity: SLAB.shadowOpacity,
      // Never occludes anything: it exists only to darken empty background.
      depthWrite: false,
      side: DoubleSide,
    }),
  }

  return resources
}

export function Ground() {
  const { slab, topMaterial, edgeMaterial, shadow, shadowMaterial } = getResources()

  return (
    <group>
      {/* ExtrudeGeometry groups the flat caps as material 0 and the swept sides
          as material 1, which is exactly the grass/soil split the slab wants. */}
      <mesh
        geometry={slab}
        material={[topMaterial, edgeMaterial]}
        receiveShadow
        castShadow={false}
      />
      <mesh
        geometry={shadow}
        material={shadowMaterial}
        position={[0, SLAB.topY - SLAB.thickness - SLAB.shadowDrop, 0]}
        receiveShadow={false}
        castShadow={false}
        raycast={() => null}
      />
    </group>
  )
}
