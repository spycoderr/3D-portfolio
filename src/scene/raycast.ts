import { Matrix4, Ray, Vector3, type Box3, type Intersection, type Object3D, type Raycaster } from 'three'

const rayInverse = new Matrix4()
const localRay = new Ray()
const localHit = new Vector3()

// Replaces an object's raycast with a single box test in its own space. The
// pointer hits one simple volume instead of every part, so there is no gap to
// fall through between details and small objects are easy to catch.
export function boxRaycast(box: Box3) {
  return function raycast(this: Object3D, raycaster: Raycaster, intersects: Intersection[]) {
    rayInverse.copy(this.matrixWorld).invert()
    localRay.copy(raycaster.ray).applyMatrix4(rayInverse)
    if (!localRay.intersectBox(box, localHit)) return

    const point = localHit.clone().applyMatrix4(this.matrixWorld)
    const distance = raycaster.ray.origin.distanceTo(point)
    if (distance < raycaster.near || distance > raycaster.far) return

    intersects.push({ distance, point, object: this })
  }
}
