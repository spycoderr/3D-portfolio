import { MotionConfig } from 'framer-motion'
import { Identity } from '@/components/ui/Identity'
import { ControlsHint, Location } from '@/components/ui/Meta'
import { PlotIndex } from '@/components/ui/PlotIndex'
import { PlotPanel } from '@/components/ui/PlotPanel'
import { SceneControls } from '@/components/ui/SceneControls'
import { TabBar } from '@/components/ui/TabBar'
import { useEstate } from '@/store/useEstate'
import { SceneColumn } from './SceneColumn'

// The first screen is the estate, edge to edge, with five clusters floating
// over it: identity and controls along the top, the destination list lower
// left, the tab bar and controls hint bottom centre, the location bottom
// right. The overlay ignores the pointer except on its own controls, so the
// canvas can still be dragged anywhere in between. The DOM order is the
// keyboard order: identity, controls, list, tab bar, then an open exhibit.
//
// This is a section of its own rather than a fixed backdrop, so the sections
// below scroll up after it and the scene stops rendering once it's gone.
export function Hero() {
  const level = useEstate((state) => state.level)
  const exhibitOpen = level === 'exhibit'
  // With an exhibit open the panel takes the right half on desktop, so the
  // clusters on that side step into the left half beside it; on a phone the
  // panel is a bottom sheet over the lower clusters, which step aside too.
  const besidePanel = exhibitOpen ? 'lg:mr-[50vw]' : ''
  const underSheet = exhibitOpen ? 'max-lg:invisible' : ''

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-sky">
      <div className="absolute inset-0">
        <SceneColumn />
      </div>

      {/* A haze in the sky's own colour behind the text, so type reads over
          the estate without a box behind any item. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[34] bg-gradient-to-t from-sky/90 via-sky/30 to-transparent to-60% lg:bg-gradient-to-r lg:via-sky/40 lg:to-[38%]"
      />

      <MotionConfig reducedMotion="user">
        <div className="pointer-events-none absolute inset-0 z-[35] flex flex-col px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:pt-7">
          <div className="flex items-start justify-between gap-4">
            <Identity />
            <div className={`transition-[margin] duration-300 ${besidePanel}`}>
              <SceneControls />
            </div>
          </div>

          <div className="flex-1" />

          <div className={`mb-6 self-start ${underSheet}`}>
            <PlotIndex />
          </div>

          <div
            className={`grid grid-cols-1 items-end gap-3 transition-[margin] duration-300 sm:grid-cols-[1fr_auto_1fr] ${besidePanel} ${underSheet}`}
          >
            <div className="max-sm:hidden" />
            <div className="flex min-w-0 flex-col items-center gap-2">
              <TabBar />
              <ControlsHint />
            </div>
            <div className="flex justify-end max-sm:hidden">
              <Location />
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-40 pointer-events-none">
          <PlotPanel />
        </div>
      </MotionConfig>
    </section>
  )
}
