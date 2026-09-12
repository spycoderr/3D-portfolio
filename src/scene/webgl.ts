let cached: boolean | null = null

// Synchronous and cached, so the first render already knows which of
// <Estate> / <NoWebGL> to mount and neither ever flashes.
export function isWebGLAvailable(): boolean {
  if (cached !== null) return cached

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    cached = gl !== null
    if (gl) {
      // Release the probe context instead of waiting for GC to reclaim the slot.
      const lose = gl.getExtension('WEBGL_lose_context')
      lose?.loseContext()
    }
  } catch {
    cached = false
  }

  return cached
}
