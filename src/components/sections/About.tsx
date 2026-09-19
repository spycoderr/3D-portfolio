import { profile } from '@/data/profile'

export function About() {
  return (
    <section id="about" className="mx-auto max-w-3xl px-6 py-24 sm:px-10 lg:px-0">
      <h2 className="font-display text-step-4 text-ink">About</h2>
      <div className="mt-6 flex max-w-prose flex-col gap-4">
        {profile.about.map((paragraph) => (
          <p key={paragraph} className="font-body text-step-2 leading-relaxed text-ink/80">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}
