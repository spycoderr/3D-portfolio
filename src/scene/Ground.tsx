import {
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  MeshLambertMaterial,
  SRGBColorSpace,
} from 'three'
import { COLORS, SCENE } from './constants'

type GroundResources = {
  grassGeometry: CircleGeometry
  grassMaterial: MeshLambertMaterial
  plinthGeometry: CylinderGeometry
  plinthMaterial: MeshLambertMaterial
}

let resources: GroundResources | null = null

function createGrassTexture(): CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.12,
    size / 2,
    size / 2,
    size * 0.5,
  )
  gradient.addColorStop(0, COLORS.grass)
  gradient.addColorStop(0.65, COLORS.grass)
  gradient.addColorStop(1, COLORS.grassDark)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

function getResources(): GroundResources {
  if (resources) return resources

  resources = {
    grassGeometry: new CircleGeometry(SCENE.groundRadius, SCENE.groundSegments),
    grassMaterial: new MeshLambertMaterial({ map: createGrassTexture() }),
    plinthGeometry: new CylinderGeometry(
      SCENE.plinthRadius,
      SCENE.plinthRadius,
      SCENE.plinthHeight,
      SCENE.groundSegments,
    ),
    plinthMaterial: new MeshLambertMaterial({ color: COLORS.plinth }),
  }

  return resources
}

export function Ground() {
  const { grassGeometry, grassMaterial, plinthGeometry, plinthMaterial } = getResources()

  return (
    <group>
      <mesh
        geometry={grassGeometry}
        material={grassMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow={false}
      />
      <mesh
        geometry={plinthGeometry}
        material={plinthMaterial}
        position={[0, SCENE.plinthTopY - SCENE.plinthHeight / 2, 0]}
        receiveShadow={false}
        castShadow={false}
      />
    </group>
  )
}
