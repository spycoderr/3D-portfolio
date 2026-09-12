import { Hero } from '@/components/layout/Hero'
import { About } from '@/components/sections/About'
import { Skills } from '@/components/sections/Skills'
import { Timeline } from '@/components/sections/Timeline'
import { Contact } from '@/components/sections/Contact'

function App() {
  return (
    <div className="bg-paper text-ink">
      <Hero />
      <About />
      <Skills />
      <Timeline />
      <Contact />
    </div>
  )
}

export default App
