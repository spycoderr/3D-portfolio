import { useEffect, useRef } from 'react'
import { plots } from '@/data/plots'
import { useEstate } from '@/store/useEstate'

// Positioned imperatively from the raw pointer event. Putting the cursor in
// React state would re-render the whole hero on every mouse move.
export function HoverLabel({ container }: { container: HTMLElement | null }) {
  const labelRef = useRef<HTMLDivElement>(null)
  const hoveredPlotId = useEstate((state) => state.hoveredPlotId)
  const plot = hoveredPlotId ? plots.find((entry) => entry.id === hoveredPlotId) : null

  useEffect(() => {
    if (!container) return

    const onMove = (event: PointerEvent) => {
      const label = labelRef.current
      if (!label) return
      const bounds = container.getBoundingClientRect()
      label.style.transform = `translate(${event.clientX - bounds.left + 14}px, ${
        event.clientY - bounds.top + 16
      }px)`
    }

    container.addEventListener('pointermove', onMove)
    return () => container.removeEventListener('pointermove', onMove)
  }, [container])

  if (!plot) return null

  return (
    <div
      ref={labelRef}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 max-w-[22ch] border border-ink/15 bg-paper/95 px-3 py-2"
    >
      <div className="font-body text-step-0 font-medium text-ink">{plot.title}</div>
      <div className="mt-0.5 font-body text-step-0 leading-tight text-ink/60">{plot.tagline}</div>
    </div>
  )
}
