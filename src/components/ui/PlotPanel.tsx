import { useEffect, useRef, useState } from 'react'
import { plots, type Exhibit, type Plot } from '@/data/plots'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { UI } from '@/scene/constants'
import { useEstate } from '@/store/useEstate'

// "plotId/exhibitId": a plain string, so the effect below can depend on it.
type Key = string

function resolve(key: Key): { plot: Plot; exhibit: Exhibit } | null {
  const [plotId, exhibitId] = key.split('/')
  const plot = plots.find((entry) => entry.id === plotId)
  const exhibit = plot?.exhibits.find((entry) => entry.id === exhibitId)
  return plot && exhibit ? { plot, exhibit } : null
}

// The exhibit panel, over the estate's column: its right side on desktop, all
// of it below the controls row on a phone, where the scene is too short to
// share and the way back out must stay in reach. It outlives the selection by
// one transition, so closing slides the content out instead of blanking it
// mid-animation. Closing returns to the room, not to the campus.
export function PlotPanel() {
  const activePlotId = useEstate((state) => state.activePlotId)
  const activeExhibitId = useEstate((state) => state.activeExhibitId)
  const backToInterior = useEstate((state) => state.backToInterior)
  const prefersReducedMotion = usePrefersReducedMotion()

  const currentKey: Key | null =
    activePlotId && activeExhibitId ? `${activePlotId}/${activeExhibitId}` : null

  const [shownKey, setShownKey] = useState<Key | null>(currentKey)
  const closeTimer = useRef<number | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Focus follows the panel open, so the next Tab reaches its links and close
  // button instead of starting again from the top of the page. Keyed on what
  // is shown, because the heading only exists once that has caught up.
  useEffect(() => {
    if (currentKey && shownKey === currentKey) headingRef.current?.focus({ preventScroll: true })
  }, [currentKey, shownKey])

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
    <div
      className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end lg:flex-row lg:justify-end"
      aria-hidden={!open}
    >
      <div
        // lg:w-[55%] must match FOCUS.panelFraction, which frames the room beside it.
        role="region"
        aria-label={shown.exhibit.name}
        className={`pointer-events-auto relative flex h-[calc(100%-3.75rem)] w-full flex-col overflow-y-auto lg:h-full border-t border-ink/15 bg-paper/95 px-6 py-6 transition-transform ease-out lg:w-[55%] lg:border-l lg:border-t-0 lg:px-10 lg:py-12 ${
          open ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-full lg:translate-y-0'
        }`}
        style={{ transitionDuration: prefersReducedMotion ? '0ms' : `${UI.panelTransitionMs}ms` }}
      >

        <div className="font-body text-step-0 text-ink/50">
          {shown.plot.plotNumber === shown.plot.title
            ? shown.plot.title
            : `${shown.plot.plotNumber} · ${shown.plot.title}`}
        </div>
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="mt-1 max-w-[18ch] font-display text-step-4 leading-tight text-ink outline-none"
        >
          {shown.exhibit.name}
        </h3>
        <p className="mt-3 max-w-[48ch] font-body text-step-2 leading-snug text-accent">
          {shown.exhibit.claim}
        </p>

        <div className="mt-6 flex max-w-[62ch] flex-col gap-4">
          {shown.exhibit.body.map((paragraph, index) => (
            // Keyed by position: paragraphs are a fixed ordered list, and two of
            // them are allowed to read the same.
            <p key={index} className="font-body text-step-1 leading-relaxed text-ink/80">
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

        {/* Last in reading order, so Tab from the heading runs through the
            content first; it still sits in the top corner. */}
        <button
          type="button"
          onClick={backToInterior}
          aria-label="Close exhibit"
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 font-body text-step-2 leading-none text-ink/70 hover:border-ink/50 hover:text-ink lg:right-6 lg:top-6"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
