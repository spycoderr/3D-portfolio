import { profile } from '@/data/profile'


export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-3xl px-6 py-24 sm:px-10 lg:px-0">
      <h2 className="font-display text-step-4 text-ink">Skills</h2>
      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
        {profile.skills.map((group) => (
          <div key={group.label}>
            <h3 className="font-body text-step-1 font-medium text-ink/60">{group.label}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="border border-ink/20 px-3 py-1 font-body text-step-0 text-ink"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
