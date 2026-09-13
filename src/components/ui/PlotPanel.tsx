import { useEffect, useRef, useState } from 'react'
import { plots, type Plot } from '@/data/plots'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { UI } from '@/scene/constants'
import { useEstate } from '@/store/useEstate'

// The panel outlives the selection by one transition, the same trick Interior
// uses for the roof: closing content stays mounted so it can slide out rather
// than vanishing mid-animation.
export function PlotPanel() {
  const selectedPlotId = useEstate((state) => state.selectedPlotId)
  const clearSelection = useEstate((state) => state.clearSelection)
  const prefersReducedMotion = usePrefersReducedMotion()
  const selectedPlot = selectedPlotId ? (plots.find((entry) => entry.id === selectedPlotId) ?? null) : null

  const [displayPlot, setDisplayPlot] = useState<Plot | null>(selectedPlot)
  const closeTimer = useRef<number | null>(null)

  useEffect(() => {
    if (selectedPlot) {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current)
        closeTimer.current = null
      }
      setDisplayPlot(selectedPlot)
      return
    }
    if (prefersReducedMotion) {
      setDisplayPlot(null)
      return
    }
    closeTimer.current = window.setTimeout(() => setDisplayPlot(null), UI.panelTransitionMs)
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
    }
  }, [selectedPlot, prefersReducedMotion])

  if (!displayPlot) return null

  const open = selectedPlot !== null
  const plot = displayPlot

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col justify-end lg:flex-row lg:justify-end"
      aria-hidden={!open}
    >
      <div
        className={`pointer-events-auto flex max-h-full w-full flex-col overflow-y-auto border-t border-ink/15 bg-paper/95 p-6 transition-transform ease-out lg:h-full lg:w-[380px] lg:border-l lg:border-t-0 ${
          open ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-full lg:translate-y-0'
        }`}
        style={{ transitionDuration: prefersReducedMotion ? '0ms' : `${UI.panelTransitionMs}ms` }}
      >
        <button
          type="button"
          onClick={clearSelection}
          aria-label="Close plot details"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center border border-ink/20 font-body text-step-1 leading-none text-ink/60 hover:border-ink/50 hover:text-ink"
        >
          &times;
        </button>

        <div className="font-body text-step-0 uppercase tracking-wide text-ink/50">{plot.plotNumber}</div>
        <h3 className="mt-1 max-w-[18ch] font-display text-step-3 leading-tight text-ink">{plot.title}</h3>
        <p className="mt-1 font-body text-step-0 text-ink/60">{plot.tagline}</p>

        <p className="mt-5 font-body text-step-0 leading-relaxed text-ink/80">{plot.summary}</p>

        {plot.problem && (
          <p className="mt-3 font-body text-step-0 leading-relaxed text-ink/70">{plot.problem}</p>
        )}

        {plot.highlights.length > 0 && (
          <ul className="mt-5 flex flex-col gap-2">
            {plot.highlights.map((item, index) => (
              // Keyed by position: highlights are a fixed ordered list that never
              // reorders, and two of them are allowed to read the same.
              <li
                key={index}
                className="flex gap-2 font-body text-step-0 leading-relaxed text-ink/75"
              >
                <span className="text-ink/30">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {plot.stack.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {plot.stack.map((tech) => (
              <span key={tech} className="border border-ink/15 px-2.5 py-1 font-body text-step-0 text-ink/60">
                {tech}
              </span>
            ))}
          </div>
        )}

        {plot.links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {plot.links.map((link) => (
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
