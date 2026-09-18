import { Hero } from '@/components/layout/Hero'
import { About } from '@/components/sections/About'
import { Skills } from '@/components/sections/Skills'
import { Timeline } from '@/components/sections/Timeline'
import { Contact } from '@/components/sections/Contact'
import { useThemeVariables } from '@/hooks/useThemeVariables'

function App() {
  useThemeVariables()

  return (
    <div>
      <Hero />
      <About />
      <Skills />
      <Timeline />
      <Contact />
    </div>
  )
}

export default App
