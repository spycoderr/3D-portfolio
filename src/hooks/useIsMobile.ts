import { useEffect, useState } from 'react'

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    media.addEventListener('change', onChange)
    // Resize is heard too: a query's change event can lag behind the layout,
    // and the camera's framing must not be left on the wrong side of it.
    window.addEventListener('resize', onChange)
    return () => {
      media.removeEventListener('change', onChange)
      window.removeEventListener('resize', onChange)
    }
  }, [query])

  return matches
}

// Below the breakpoint where the detail panel moves from the right edge to the
// bottom, which is what the camera's framing offset depends on.
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 1023px)')
}

// Touch input, which needs the scroll gate that a mouse does not.
export function useCoarsePointer(): boolean {
  return useMediaQuery('(pointer: coarse)')
}
