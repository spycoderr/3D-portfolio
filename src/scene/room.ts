import type { Plot } from '@/data/plots'
import { BUILDING, ROOM } from './constants'

// Top of a plot's pad: where a building stands, and where its room's floor sits.
export const PAD_TOP = BUILDING.padBaseY + BUILDING.padHeight

// The room is designed at one canonical size and scaled to fit inside each
// plot's footprint. Shared by the room itself and the camera that frames it.
export function roomScale(plot: Plot): number {
  return Math.min(plot.footprint.w / ROOM.width, plot.footprint.d / ROOM.depth) * ROOM.footprintFill
}
