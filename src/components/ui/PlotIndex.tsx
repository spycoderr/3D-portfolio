import { plots } from '@/data/plots'
import { useEstate } from '@/store/useEstate'
import { ACCENT, palette } from '@/theme'

// A text directory beside the canvas, so a plot is reachable without hunting
// for its building on the ring — the only path in on a coarse pointer, where
// hover has nothing to sync to.
const directoryPlots = plots.filter((plot) => plot.kind !== 'contact')

// Inside a room the directory gives way to that room's exhibits. Hovering an
// entry lights its object and hovering the object lights its entry, because
// both read and write the same store field.
function ExhibitList({ plotId }: { plotId: string }) {
  const plot = plots.find((entry) => entry.id === plotId)
  const hoveredExhibitId = useEstate((state) => state.hoveredExhibitId)
  const activeExhibitId = useEstate((state) => state.activeExhibitId)
  const setHoveredExhibit = useEstate((state) => state.setHoveredExhibit)
  const selectExhibit = useEstate((state) => state.selectExhibit)
  const clearSelection = useEstate((state) => state.clearSelection)
  if (!plot) return null

  return (
    <nav aria-label={`Inside ${plot.title}`} className="mt-14 flex flex-col">
      <button
        type="button"
        onClick={clearSelection}
        className="self-start font-body text-step-0 text-ink/60 hover:text-ink"
      >
        ← All plots
      </button>
      <div className="mt-4 font-body text-step-0 text-ink/50">{plot.plotNumber}</div>
      <div className="font-display text-step-3 leading-tight text-ink">{plot.title}</div>

      <ul className="mt-5 flex flex-col border-t border-ink/15">
        {plot.exhibits.map((exhibit) => {
          const lit = exhibit.id === hoveredExhibitId || exhibit.id === activeExhibitId
          return (
            <li key={exhibit.id}>
              <button
                type="button"
                onClick={() => selectExhibit(exhibit.id)}
                onMouseEnter={() => setHoveredExhibit(exhibit.id)}
                onMouseLeave={() => setHoveredExhibit(null)}
                onFocus={() => setHoveredExhibit(exhibit.id)}
                onBlur={() => setHoveredExhibit(null)}
                aria-current={exhibit.id === activeExhibitId ? 'true' : undefined}
                className="w-full border-b border-ink/15 py-3 text-left font-body text-step-1"
                style={{ color: lit ? ACCENT : undefined }}
              >
                {exhibit.name}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function PlotIndex() {
  const selectedPlotId = useEstate((state) => state.selectedPlotId)
  const hoveredPlotId = useEstate((state) => state.hoveredPlotId)
  const selectPlot = useEstate((state) => state.selectPlot)
  const setHovered = useEstate((state) => state.setHovered)

  if (selectedPlotId) return <ExhibitList plotId={selectedPlotId} />

  return (
    <nav aria-label="Plot directory" className="mt-14 flex flex-col border-t border-ink/15">
      {directoryPlots.map((plot) => {
        const active = plot.id === hoveredPlotId
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
              style={{ backgroundColor: palette[plot.palette.roof], opacity: active ? 1 : 0.3 }}
            />
          </button>
        )
      })}
    </nav>
  )
}
