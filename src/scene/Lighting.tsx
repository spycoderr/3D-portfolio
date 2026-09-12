import { useLayoutEffect, useRef } from 'react'
import type { DirectionalLight } from 'three'
import { LIGHTING } from './constants'

export function Lighting() {
  const lightRef = useRef<DirectionalLight>(null!)

  useLayoutEffect(() => {
    const camera = lightRef.current.shadow.camera
    const e = LIGHTING.shadowExtent
    camera.left = -e
    camera.right = e
    camera.top = e
    camera.bottom = -e
    camera.near = LIGHTING.shadowNear
    camera.far = LIGHTING.shadowFar
    // three does not rebuild the shadow projection when these change.
    camera.updateProjectionMatrix()
  }, [])

  return (
    <>
      <hemisphereLight
        args={[LIGHTING.hemiSky, LIGHTING.hemiGround, LIGHTING.hemiIntensity]}
      />
      <directionalLight
        ref={lightRef}
        castShadow
        position={LIGHTING.directionalPosition}
        color={LIGHTING.directionalColor}
        intensity={LIGHTING.directionalIntensity}
        shadow-mapSize-width={LIGHTING.shadowMapSize}
        shadow-mapSize-height={LIGHTING.shadowMapSize}
        shadow-bias={LIGHTING.shadowBias}
        shadow-normalBias={LIGHTING.shadowNormalBias}
        shadow-radius={LIGHTING.shadowRadius}
      />
    </>
  )
}
