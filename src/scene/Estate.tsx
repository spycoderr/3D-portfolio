import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { CAMERA, COLORS, UI } from './constants'
import { Ground } from './Ground'
import { Lighting } from './Lighting'

// Holds the reveal back until a few frames have actually rendered, so shaders
// are compiled and the first frame the visitor sees is never a stutter.
function WarmUp({ onReady }: { onReady: () => void }) {
  const frames = useRef(0)
  const fired = useRef(false)

  useFrame(() => {
    if (fired.current) return
    frames.current += 1
    if (frames.current >= UI.warmupFrames) {
      fired.current = true
      onReady()
    }
  })

  return null
}

export function Estate() {
  const [ready, setReady] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="relative h-full w-full bg-sky">
      <div
        className="h-full w-full transition-opacity ease-out"
        style={{
          opacity: ready ? 1 : 0,
          transitionDuration: prefersReducedMotion ? '0ms' : `${UI.revealDurationMs}ms`,
        }}
      >
        <Canvas
          shadows="percentage"
          dpr={[1, 2]}
          frameloop="always"
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{
            fov: CAMERA.fov,
            near: CAMERA.near,
            far: CAMERA.far,
            position: CAMERA.homePosition,
          }}
        >
          <color attach="background" args={[COLORS.sky]} />
          <Suspense fallback={null}>
            <Lighting />
            <Ground />
            <WarmUp onReady={() => setReady(true)} />
          </Suspense>
        </Canvas>
      </div>

      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-body text-step-0 text-ink/40">Loading the estate</p>
        </div>
      )}
    </div>
  )
}
