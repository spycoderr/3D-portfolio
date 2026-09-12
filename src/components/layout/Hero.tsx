import { IntroColumn } from './IntroColumn'
import { SceneColumn } from './SceneColumn'

export function Hero() {
  return (
    <section className="flex flex-col lg:h-screen lg:flex-row">
      <div className="h-[42vh] w-full md:h-[55vh] lg:order-2 lg:h-full lg:w-[58%]">
        <SceneColumn />
      </div>
      <div className="w-full lg:order-1 lg:h-full lg:w-[42%]">
        <IntroColumn />
      </div>
    </section>
  )
}
