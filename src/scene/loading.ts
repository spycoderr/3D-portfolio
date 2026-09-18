import { LOADING } from './constants'

// Nothing in the estate is fetched through a three.js loader: every model and
// texture is built in code. What a visitor actually waits for is the scene's
// code arriving, the fonts its labels are drawn in, and the first frame being
// compiled and drawn. Those are the stages counted here.
//
// This file must not import three: it runs in the page's first chunk, before
// the scene's code has arrived. Once it has, the scene hands its loading
// manager over, the stages are replayed into it, and from then on drei's
// useProgress reports them.
export type Stage = 'scene' | 'fonts' | 'frame'

type Manager = { itemStart: (url: string) => void; itemEnd: (url: string) => void }

const STAGES: Stage[] = ['scene', 'fonts', 'frame']
const finished = new Set<Stage>()
const listeners = new Set<() => void>()
let manager: Manager | null = null

export function stageProgress(): number {
  return (finished.size / STAGES.length) * 100
}

export function subscribeStages(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function finishStage(stage: Stage): void {
  if (finished.has(stage)) return
  finished.add(stage)
  manager?.itemEnd(stage)
  listeners.forEach((listener) => listener())
}

// Every stage is started together, then the ones already done are ended.
// Starting them one at a time would let the manager report everything loaded
// the moment the first one ended.
export function attachLoadingManager(next: Manager): void {
  if (manager) return
  manager = next
  for (const stage of STAGES) next.itemStart(stage)
  for (const stage of finished) next.itemEnd(stage)
}

// The canvas labels are painted once, in whatever font is present when they
// are drawn, so the scene waits for the faces it paints with. A font that
// can't be had is waited for only so long: a fallback face is better than no
// estate.
const FACES = ['500 16px Inter', '600 16px Inter', '700 16px Inter', '600 16px "Bricolage Grotesque"']

export function loadFonts(): Promise<void> {
  const loads = Promise.all(FACES.map((face) => document.fonts.load(face))).then(
    () => undefined,
    () => undefined,
  )
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, LOADING.fontTimeoutMs))
  return Promise.race([loads, timeout])
}
