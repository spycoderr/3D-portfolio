import { useEffect, useState } from 'react'

// The canvas is one part of a page the visitor scrolls past. Rendering a scene
// nobody is looking at is the most expensive thing this site could do, so the
// loop stops outright when the hero leaves the viewport or the tab goes to the
// background — a backgrounded tab only throttles rAF, it does not stop it.
export function useRenderGate(element: HTMLElement | null): boolean {
  const [onScreen, setOnScreen] = useState(true)
  const [foreground, setForeground] = useState(() => !document.hidden)

  useEffect(() => {
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      threshold: 0,
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  useEffect(() => {
    const onVisibility = () => setForeground(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return onScreen && foreground
}
