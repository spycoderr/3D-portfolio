import { plots } from '@/data/plots'
import { profile } from '@/data/profile'
import { site } from '@/data/site'
import { useEstate } from '@/store/useEstate'
import { ACCENT } from '@/theme'

// The destinations, in reading order: who, then the work, then the resume.
// Contact is the noticeboard in the park, not a place to go into.
const destinations = [
  ...plots.filter((plot) => plot.kind === 'about'),
  ...plots.filter((plot) => plot.kind === 'project'),
]

// Inside a room the destinations give way to that room's own contents.
// Hovering an exhibit here lights its object in the scene and hovering the
// object lights it here, because both read and write the same store field.
function RoomContents({ plotId }: { plotId: string }) {
  const plot = plots.find((entry) => entry.id === plotId)
  const hoveredExhibitId = useEstate((state) => state.hoveredExhibitId)
  const activeExhibitId = useEstate((state) => state.activeExhibitId)
  const setHoveredExhibit = useEstate((state) => state.setHoveredExhibit)
  const goToExhibit = useEstate((state) => state.goToExhibit)
  if (!plot) return null

  return (
    <nav aria-label={`Inside ${plot.title}`} className="pointer-events-auto flex flex-col">
      <p className="font-body text-step-0 text-ink/50">{plot.eyebrow}</p>
      <h2 className="mt-1 font-display text-step-3 leading-tight text-ink">{plot.roomHeadline}</h2>
      <p className="mt-1 max-w-[32ch] font-body text-step-0 text-ink/70">{plot.subhead}</p>

      <ul className="mt-4 flex flex-col">
        {plot.exhibits.map((exhibit) => {
          const lit = exhibit.id === hoveredExhibitId || exhibit.id === activeExhibitId
          return (
            <li key={exhibit.id}>
              <button
                type="button"
                onClick={() => goToExhibit(exhibit.id)}
                onMouseEnter={() => setHoveredExhibit(exhibit.id)}
                onMouseLeave={() => setHoveredExhibit(null)}
                onFocus={() => setHoveredExhibit(exhibit.id)}
                onBlur={() => setHoveredExhibit(null)}
                aria-current={exhibit.id === activeExhibitId ? 'true' : undefined}
                className="py-1 text-left font-body text-step-1 text-ink"
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
  const activePlotId = useEstate((state) => state.activePlotId)
  const hoveredPlotId = useEstate((state) => state.hoveredPlotId)
  const goToPlot = useEstate((state) => state.goToPlot)
  const setHovered = useEstate((state) => state.setHovered)

  if (activePlotId) return <RoomContents plotId={activePlotId} />

  return (
    <nav aria-label="Destinations" className="pointer-events-auto">
      <ul className="flex flex-col">
        {destinations.map((plot) => (
          <li key={plot.id}>
            <button
              type="button"
              onClick={() => goToPlot(plot.id)}
              onMouseEnter={() => setHovered(plot.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(plot.id)}
              onBlur={() => setHovered(null)}
              className="py-1 text-left font-body text-step-1 text-ink"
              style={{ color: plot.id === hoveredPlotId ? ACCENT : undefined }}
            >
              {plot.title}
            </button>
          </li>
        ))}
        <li>
          <a
            href={profile.resume}
            target="_blank"
            rel="noreferrer"
            className="block py-1 font-body text-step-1 text-ink hover:text-[color:var(--accent)]"
            style={{ ['--accent' as string]: ACCENT }}
          >
            {site.resumeLabel}
          </a>
        </li>
      </ul>
    </nav>
  )
}
