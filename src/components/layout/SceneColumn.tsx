import { NoWebGL } from '@/components/ui/NoWebGL'
import { Estate } from '@/scene/Estate'
import { isWebGLAvailable } from '@/scene/webgl'

export function SceneColumn() {
  if (!isWebGLAvailable()) return <NoWebGL />
  return <Estate />
}
