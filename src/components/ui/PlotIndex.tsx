import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { plots } from '@/data/plots'
import { profile } from '@/data/profile'
import { site } from '@/data/site'
import { useEstate } from '@/store/useEstate'

// The destinations, in reading order: who, then the work, then the resume.
// Contact is the noticeboard in the park, not a place to go into.
const destinations = [
  ...plots.filter((plot) => plot.kind === 'about'),
  ...plots.filter((plot) => plot.kind === 'project'),
]

const FADE_SECONDS = 0.2

// Type only: no borders, no backgrounds. The active item takes the accent and
// a 2px underline that draws in from the left.
function Entry({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <span className={`relative inline-block pb-0.5 transition-colors duration-200 ${active ? 'text-accent' : ''}`}>
      {children}
      <span
        aria-hidden
        className={`absolute bottom-0 left-0 h-[2px] w-full origin-left bg-accent transition-transform duration-200 ease-out ${
          active ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
    </span>
  )
}

const itemClass = 'block py-0.5 text-left font-body text-step-1 text-ink sm:text-step-2'

function Destinations() {
  const hoveredPlotId = useEstate((state) => state.hoveredPlotId)
  const goToPlot = useEstate((state) => state.goToPlot)
  const setHovered = useEstate((state) => state.setHovered)

  return (
    <nav aria-label="Destinations">
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
              className={itemClass}
            >
              <Entry active={plot.id === hoveredPlotId}>{plot.title}</Entry>
            </button>
          </li>
        ))}
        <li>
          <a href={profile.resume} target="_blank" rel="noreferrer" className={`${itemClass} transition-colors duration-200 hover:text-accent`}>
            {site.resumeLabel}
          </a>
        </li>
      </ul>
    </nav>
  )
}

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
    <nav aria-label={`Inside ${plot.title}`}>
      <p className="font-body text-step-0 text-ink/55">{plot.eyebrow}</p>
      <h2 className="mt-1 font-display text-step-4 leading-tight text-ink">{plot.roomHeadline}</h2>
      <p className="mt-1 max-w-[34ch] font-body text-step-1 text-ink/70">{plot.subhead}</p>

      <ul className="mt-4 flex flex-col">
        {plot.exhibits.map((exhibit) => (
          <li key={exhibit.id}>
            <button
              type="button"
              onClick={() => goToExhibit(exhibit.id)}
              onMouseEnter={() => setHoveredExhibit(exhibit.id)}
              onMouseLeave={() => setHoveredExhibit(null)}
              onFocus={() => setHoveredExhibit(exhibit.id)}
              onBlur={() => setHoveredExhibit(null)}
              aria-current={exhibit.id === activeExhibitId ? 'true' : undefined}
              className={itemClass}
            >
              <Entry active={exhibit.id === hoveredExhibitId || exhibit.id === activeExhibitId}>
                {exhibit.name}
              </Entry>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// The campus list and a room's list cross-fade into each other: one goes
// out, then the other comes in, so the two never overlap mid-change.
export function PlotIndex() {
  const activePlotId = useEstate((state) => state.activePlotId)

  return (
    <div className="pointer-events-auto">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activePlotId ?? 'campus'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_SECONDS }}
        >
          {activePlotId ? <RoomContents plotId={activePlotId} /> : <Destinations />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
