// The sun never moves except during the dusk sequence, and almost nothing
// that casts a shadow moves at all, so the shadow map is redrawn only when
// something asks for it rather than on every frame. That takes the whole
// shadow pass — a third of the draw calls — out of an ordinary frame.
//
// Anything that moves a shadow caster, or moves the sun, calls this.
let pending = true

export function requestShadowUpdate(): void {
  pending = true
}

// Taken by the one component that owns the renderer's shadow map.
export function takeShadowRequest(): boolean {
  const was = pending
  pending = false
  return was
}
