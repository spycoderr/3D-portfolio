import { useEffect, useRef, useState } from 'react'
import { plots, type Exhibit, type Plot } from '@/data/plots'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { UI } from '@/scene/constants'
import { useEstate } from '@/store/useEstate'
import { ACCENT } from '@/theme'

// "plotId/exhibitId": a plain string, so the effect below can depend on it.
type Key = string

function resolve(key: Key): { plot: Plot; exhibit: Exhibit } | null {
  const [plotId, exhibitId] = key.split('/')
  const plot = plots.find((entry) => entry.id === plotId)
  const exhibit = plot?.exhibits.find((entry) => entry.id === exhibitId)
  return plot && exhibit ? { plot, exhibit } : null
}

// The exhibit panel. It outlives the selection by one transition, so closing
// slides the content out instead of blanking it mid-animation. Closing returns
// to the room, not to the campus.
export function PlotPanel() {
  const selectedPlotId = useEstate((state) => state.selectedPlotId)
  const activeExhibitId = useEstate((state) => state.activeExhibitId)
  const clearExhibit = useEstate((state) => state.clearExhibit)
  const prefersReducedMotion = usePrefersReducedMotion()

  const currentKey: Key | null =
    selectedPlotId && activeExhibitId ? `${selectedPlotId}/${activeExhibitId}` : null

  const [shownKey, setShownKey] = useState<Key | null>(currentKey)
  const closeTimer = useRef<number | null>(null)

  useEffect(() => {
    if (currentKey) {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current)
        closeTimer.current = null
      }
      setShownKey(currentKey)
      return
    }
    if (prefersReducedMotion) {
      setShownKey(null)
      return
    }
    closeTimer.current = window.setTimeout(() => setShownKey(null), UI.panelTransitionMs)
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
    }
  }, [currentKey, prefersReducedMotion])

  const shown = shownKey ? resolve(shownKey) : null
  if (!shown) return null

  const open = currentKey !== null
  const links = shown.plot.links.filter((link) => link.href !== '#')

  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end lg:flex-row lg:justify-end" aria-hidden={!open}>
      <div
        className={`pointer-events-auto flex max-h-full w-full flex-col overflow-y-auto border-t border-ink/15 bg-paper/95 p-6 transition-transform ease-out lg:h-full lg:w-[380px] lg:border-l lg:border-t-0 ${
          open ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-full lg:translate-y-0'
        }`}
        style={{ transitionDuration: prefersReducedMotion ? '0ms' : `${UI.panelTransitionMs}ms` }}
      >
        <button
          type="button"
          onClick={clearExhibit}
          aria-label="Close exhibit"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center border border-ink/20 font-body text-step-1 leading-none text-ink/60 hover:border-ink/50 hover:text-ink"
        >
          &times;
        </button>

        <div className="font-body text-step-0 text-ink/50">
          {shown.plot.plotNumber} · {shown.plot.title}
        </div>
        <h3 className="mt-1 max-w-[18ch] font-display text-step-4 leading-tight text-ink">{shown.exhibit.name}</h3>
        <p className="mt-3 font-body text-step-1 leading-snug" style={{ color: ACCENT }}>
          {shown.exhibit.claim}
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {shown.exhibit.body.map((paragraph, index) => (
            // Keyed by position: paragraphs are a fixed ordered list, and two of
            // them are allowed to read the same.
            <p key={index} className="font-body text-step-0 leading-relaxed text-ink/80">
              {paragraph}
            </p>
          ))}
        </div>

        {links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                className="border border-ink px-4 py-2 font-body text-step-0 text-ink hover:bg-ink hover:text-paper"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
