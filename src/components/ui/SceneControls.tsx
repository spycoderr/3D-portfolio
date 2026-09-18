import type { ReactNode } from 'react'
import { useEstate } from '@/store/useEstate'

// The controls cluster, top right of the canvas. The theme toggle belongs to
// the campus; inside a room its place goes to the way back out.
function RoundButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-paper/90 text-ink/80 hover:border-ink/40 hover:text-ink"
    >
      {children}
    </button>
  )
}

const icon = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function SceneControls() {
  const mode = useEstate((state) => state.mode)
  const theme = useEstate((state) => state.theme)
  const paused = useEstate((state) => state.paused)
  const togglePaused = useEstate((state) => state.togglePaused)
  const exhibitOpen = useEstate((state) => state.activeExhibitId !== null)
  const toggleTheme = useEstate((state) => state.toggleTheme)
  const requestReset = useEstate((state) => state.requestReset)
  const back = useEstate((state) => state.back)

  return (
    <div
      className={`absolute right-3 top-3 z-20 flex items-center gap-2 ${exhibitOpen ? 'lg:right-[392px]' : ''}`}
    >
      {mode === 'overview' ? (
        <RoundButton label={theme === 'day' ? 'Switch to dusk' : 'Switch to day'} onClick={toggleTheme}>
          {theme === 'day' ? (
            <svg {...icon}>
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
            </svg>
          ) : (
            <svg {...icon}>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          )}
        </RoundButton>
      ) : (
        <button
          type="button"
          onClick={back}
          className="flex h-11 items-center rounded-full border border-ink/15 bg-paper/90 px-4 font-body text-step-0 text-ink/80 hover:border-ink/40 hover:text-ink"
        >
          ← Back
        </button>
      )}
      <RoundButton label={paused ? 'Resume motion' : 'Pause motion'} onClick={togglePaused}>
        {paused ? (
          <svg {...icon}>
            <path d="M8 5.5v13l10-6.5-10-6.5Z" />
          </svg>
        ) : (
          <svg {...icon}>
            <path d="M9 5v14M15 5v14" />
          </svg>
        )}
      </RoundButton>
      <RoundButton label="Reset view" onClick={requestReset}>
        <svg {...icon}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
      </RoundButton>
    </div>
  )
}
