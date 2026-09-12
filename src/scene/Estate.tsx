import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { HoverLabel } from '@/components/ui/HoverLabel'
import { useCoarsePointer } from '@/hooks/useIsMobile'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useEstate } from '@/store/useEstate'
import { CameraRig } from './CameraRig'
import { CAMERA, COLORS, UI } from './constants'
import { Buildings } from './Building'
import { Ground } from './Ground'
import { Lighting } from './Lighting'
import { Props } from './Props'
import { Road } from './Road'
import { Traffic } from './Traffic'

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

function EngagementHint() {
  const engage = useEstate((state) => state.engage)
  const coarsePointer = useCoarsePointer()

  const label = (
    <span className="border border-ink/15 bg-paper/90 px-4 py-2 font-body text-step-0 text-ink/70">
      {coarsePointer ? 'Tap to explore' : 'Drag to explore'}
    </span>
  )

  // On touch the hint is the only way in, because until the visitor engages a
  // swipe over the canvas has to stay a page scroll.
  if (coarsePointer) {
    return (
      <button
        type="button"
        onClick={engage}
        style={{ touchAction: 'pan-y' }}
        className="absolute inset-0 flex items-end justify-center pb-6"
      >
        {label}
      </button>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
      {label}
    </div>
  )
}

export function Estate() {
  const [ready, setReady] = useState(false)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasEngaged = useEstate((state) => state.hasEngaged)
  const hoveredPlotId = useEstate((state) => state.hoveredPlotId)
  const clearSelection = useEstate((state) => state.clearSelection)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearSelection()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [clearSelection])

  return (
    <div
      ref={setContainer}
      className="relative h-full w-full bg-sky"
      style={{ cursor: hoveredPlotId ? 'pointer' : 'default' }}
    >
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
            <Road />
            <Props />
            <Buildings />
            <Traffic />
            <CameraRig />
            <WarmUp onReady={() => setReady(true)} />
          </Suspense>
        </Canvas>
      </div>

      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-body text-step-0 text-ink/40">Loading the estate</p>
        </div>
      )}

      {ready && !hasEngaged && <EngagementHint />}
      {ready && <HoverLabel container={container} />}
    </div>
  )
}
