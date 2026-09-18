import { profile } from '@/data/profile'
import { ACCENT } from '@/theme'

// Top left: the wordmark with its accent dot, and one line of role under it.
// The full name is the page's heading for anyone not seeing the wordmark.
export function Identity() {
  return (
    <header className="pointer-events-auto">
      <h1 className="font-display text-step-4 leading-none tracking-tight text-ink">
        <span className="sr-only">{profile.name}</span>
        <span aria-hidden>
          {profile.wordmark}
          <span style={{ color: ACCENT }}>●</span>
        </span>
      </h1>
      <p className="mt-1 font-body text-step-0 text-ink/60">{profile.roleLine}</p>
    </header>
  )
}
