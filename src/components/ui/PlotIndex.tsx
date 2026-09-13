import { plots } from '@/data/plots'
import { useEstate } from '@/store/useEstate'

// A text directory beside the canvas, so a plot is reachable without hunting
// for its building on the ring — the only path in on a coarse pointer, where
// hover has nothing to sync to.
const directoryPlots = plots.filter((plot) => plot.kind !== 'contact')

export function PlotIndex() {
  const selectedPlotId = useEstate((state) => state.selectedPlotId)
  const hoveredPlotId = useEstate((state) => state.hoveredPlotId)
  const selectPlot = useEstate((state) => state.selectPlot)
  const setHovered = useEstate((state) => state.setHovered)

  return (
    <nav aria-label="Plot directory" className="mt-14 flex flex-col border-t border-ink/15">
      {directoryPlots.map((plot) => {
        const active = plot.id === selectedPlotId || plot.id === hoveredPlotId
        return (
          <button
            key={plot.id}
            type="button"
            onClick={() => selectPlot(plot.id)}
            onMouseEnter={() => setHovered(plot.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(plot.id)}
            onBlur={() => setHovered(null)}
            className="group flex items-baseline justify-between gap-4 border-b border-ink/15 py-3 text-left"
          >
            <span className="flex items-baseline gap-3">
              <span className="font-body text-step-0 text-ink/40">{plot.plotNumber}</span>
              <span className={`font-body text-step-1 ${active ? 'text-ink' : 'text-ink/70'}`}>
                {plot.title}
              </span>
            </span>
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full transition-opacity"
              style={{ backgroundColor: plot.palette.roof, opacity: active ? 1 : 0.3 }}
            />
          </button>
        )
      })}
    </nav>
  )
}
