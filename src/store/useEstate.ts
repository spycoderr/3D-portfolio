import { create } from 'zustand'

export type CameraMode = 'overview' | 'focused' | 'interior'

type EstateState = {
  mode: CameraMode
  selectedPlotId: string | null
  // Until the visitor deliberately engages, the canvas stays out of the way:
  // the wheel scrolls the page and a touch swipe scrolls it too.
  hasEngaged: boolean
  hoveredPlotId: string | null
  // The plot whose interior is on screen. It outlives the selection, because
  // the building has to stay open while the closing sequence plays out.
  openPlotId: string | null
  engage: () => void
  setHovered: (id: string | null) => void
  setOpenPlot: (id: string | null) => void
  selectPlot: (id: string) => void
  clearSelection: () => void
  enterInterior: () => void
  exitInterior: () => void
}

export const useEstate = create<EstateState>()((set) => ({
  mode: 'overview',
  selectedPlotId: null,
  hasEngaged: false,
  hoveredPlotId: null,
  openPlotId: null,

  engage: () => set({ hasEngaged: true }),

  setHovered: (id) => set({ hoveredPlotId: id }),

  setOpenPlot: (id) => set({ openPlotId: id }),

  selectPlot: (id) => set({ mode: 'focused', selectedPlotId: id, hasEngaged: true }),

  clearSelection: () => set({ mode: 'overview', selectedPlotId: null }),

  enterInterior: () =>
    set((state) => (state.selectedPlotId ? { mode: 'interior' } : state)),

  exitInterior: () =>
    set((state) => (state.mode === 'interior' ? { mode: 'focused' } : state)),
}))
