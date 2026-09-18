import { profile } from '@/data/profile'
import { site } from '@/data/site'
import { useCoarsePointer } from '@/hooks/useIsMobile'

// How to move, centred under the tab bar. Not interactive.
export function ControlsHint() {
  const coarsePointer = useCoarsePointer()
  return <p className="font-body text-step-0 text-ink/55">{coarsePointer ? site.hintTouch : site.hintPointer}</p>
}

// Where, bottom right, beside the one accent dot.
export function Location() {
  return (
    <p className="flex items-center gap-2 whitespace-nowrap font-body text-step-0 text-ink/60">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
      {profile.location}
    </p>
  )
}
