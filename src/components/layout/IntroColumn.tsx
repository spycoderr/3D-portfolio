import { profile } from '@/data/profile'

export function IntroColumn() {
  return (
    <div className="flex h-full flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
      <h1 className="max-w-[14ch] font-display text-step-5 leading-[0.95] tracking-tight text-ink lg:text-step-6">
        {profile.name}
      </h1>

      <div className="mt-6 h-px w-16 bg-ink" />

      <p className="mt-6 max-w-[38ch] font-body text-step-2 leading-relaxed text-ink/80">
        {profile.role}, {profile.place}. {profile.batch}.
      </p>

      {profile.pitch && (
        <p className="mt-4 max-w-[38ch] font-body text-step-1 leading-relaxed text-ink/70">
          {profile.pitch}
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href={`mailto:${profile.email}`}
          className="border border-ink bg-ink px-5 py-2.5 font-body text-step-0 text-paper"
        >
          Email
        </a>
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer"
          className="border border-ink px-5 py-2.5 font-body text-step-0 text-ink"
        >
          GitHub
        </a>
        <a
          href="/resume.pdf"
          className="border border-ink px-5 py-2.5 font-body text-step-0 text-ink"
        >
          CV
        </a>
      </div>

      <div className="mt-14 flex flex-wrap gap-10">
        {profile.stats.map((stat) => (
          <div key={stat.label}>
            <div className="font-display text-step-4 text-ink">{stat.value}</div>
            <div className="mt-1 max-w-[14ch] font-body text-step-0 leading-tight text-ink/60">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
