import { useEffect, useState } from 'react'
import { site } from '@/data/site'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { LOADING, UI } from '@/scene/constants'
import { useEstate } from '@/store/useEstate'

const SEEN_KEY = 'estate.oriented'

function alreadySeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === 'true'
  } catch {
    return false
  }
}

function remember() {
  try {
    window.localStorage.setItem(SEEN_KEY, 'true')
  } catch {
    // Without storage the card simply comes back next visit.
  }
}

// Shown once, over the campus: what the estate is and how to use it. Going
// into a building counts as having understood it, as much as dismissing does.
export function FirstRunCard() {
  const mode = useEstate((state) => state.mode)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [seen, setSeen] = useState(alreadySeen)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (seen) return
    const timer = window.setTimeout(() => setVisible(true), prefersReducedMotion ? 0 : LOADING.firstRunDelayMs)
    return () => window.clearTimeout(timer)
  }, [seen, prefersReducedMotion])

  // Listens for the visitor going into a building rather than reacting to a
  // render, so the card is retired at the moment it happens.
  useEffect(
    () =>
      useEstate.subscribe((state) => {
        if (state.mode !== 'focused') return
        remember()
        setSeen(true)
      }),
    [],
  )

  if (seen || mode !== 'overview') return null

  const dismiss = () => {
    remember()
    setSeen(true)
  }

  return (
    <div
      role="note"
      className="pointer-events-auto absolute inset-x-3 top-16 z-20 mx-auto flex max-w-[300px] items-start gap-3 border border-ink/15 bg-paper/95 p-4 transition-opacity ease-out sm:inset-x-auto sm:left-3 sm:top-3 sm:mx-0"
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: prefersReducedMotion ? '0ms' : `${UI.panelTransitionMs}ms`,
      }}
    >
      <div className="flex flex-col gap-1 font-body text-step-0 leading-snug text-ink/80">
        {site.orientation.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="min-h-11 shrink-0 border border-ink/20 px-3 font-body text-step-0 text-ink hover:border-ink/50"
      >
        {site.orientationDismiss}
      </button>
    </div>
  )
}
