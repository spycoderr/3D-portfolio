import { plots } from '@/data/plots'

export function NoWebGL() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-8 bg-sky px-6 py-12 sm:px-10">
      <p className="max-w-prose font-body text-step-1 leading-relaxed text-ink/70">
        The interactive estate needs WebGL, which this browser has turned off.
        Everything it holds is listed here instead.
      </p>
      <ul className="flex flex-col gap-3">
        {plots.map((plot) => (
          <li key={plot.id} className="flex items-baseline gap-3">
            <span
              className="h-3 w-3 shrink-0 translate-y-0.5"
              style={{ backgroundColor: plot.palette.roof }}
            />
            <span className="font-body text-step-1 text-ink">{plot.title}</span>
            <span className="font-body text-step-0 text-ink/50">{plot.tagline}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
