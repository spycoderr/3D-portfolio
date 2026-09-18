import { Identity } from '@/components/ui/Identity'
import { PlotIndex } from '@/components/ui/PlotIndex'
import { useEstate } from '@/store/useEstate'
import { SceneColumn } from './SceneColumn'

// The first screen is the estate, edge to edge, with the page's UI floating
// over it. The overlay ignores the pointer except on its own controls, so the
// canvas can still be dragged anywhere in between. The sections that follow
// scroll up over nothing: this is a section of its own, not a fixed backdrop,
// which is also what lets the scene stop rendering once it's scrolled away.
export function Hero() {
  const level = useEstate((state) => state.level)

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-sky">
      <div className="absolute inset-0">
        <SceneColumn />
      </div>

      {/* items-start keeps each cluster only as wide as its content, so the
          canvas stays draggable right up to the edge of the words. */}
      <div className="pointer-events-none absolute inset-0 z-[35] flex flex-col items-start justify-between p-5 sm:p-8">
        <Identity />
        {/* On a phone an open exhibit's panel is a bottom sheet over this spot. */}
        <div className={`mb-16 sm:mb-20 ${level === 'exhibit' ? 'max-lg:hidden' : ''}`}>
          <PlotIndex />
        </div>
      </div>
    </section>
  )
}
