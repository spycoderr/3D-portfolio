import { lazy, Suspense } from 'react'
import { StagedLoadingScreen } from '@/components/ui/LoadingScreen'
import { NoWebGL } from '@/components/ui/NoWebGL'
import { finishStage, loadFonts } from '@/scene/loading'
import { isWebGLAvailable } from '@/scene/webgl'

// The scene and everything it needs — three.js, the renderer, the estate —
// arrive as their own chunk, so the page and the loading screen are up long
// before the heaviest part of the site has finished downloading. Its labels
// are painted from fonts, so it isn't drawn until those are in too.
const Estate = lazy(async () => {
  const [module] = await Promise.all([
    import('@/scene/Estate').then((loaded) => {
      finishStage('scene')
      return loaded
    }),
    loadFonts().then(() => finishStage('fonts')),
  ])
  return { default: module.Estate }
})

export function SceneColumn() {
  if (!isWebGLAvailable()) return <NoWebGL />
  return (
    // Positioned, so the loading screen covers the same area whether the
    // fallback or the scene is showing it.
    <div className="relative h-full w-full">
      <Suspense fallback={<StagedLoadingScreen />}>
        <Estate />
      </Suspense>
    </div>
  )
}
