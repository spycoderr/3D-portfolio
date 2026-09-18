import { create } from 'zustand'
import type { ThemeName } from '@/theme'

const THEME_KEY = 'estate.theme'
const PAUSED_KEY = 'estate.paused'

// Storage can be missing or throw (private windows, blocked site data), and
// the site must still open, in daylight and moving, when it does.
function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Remembering is a convenience; the control still works for this visit.
  }
}

// Overview is the campus; focused is inside a plot's room. An open exhibit is
// a third level layered on focused rather than a separate mode, because the
// camera stays in the same room — only the panel and framing change.
export type CameraMode = 'overview' | 'focused'

type EstateState = {
  mode: CameraMode
  selectedPlotId: string | null
  // Until the visitor deliberately engages, the canvas stays out of the way:
  // the wheel scrolls the page and a touch swipe scrolls it too.
  hasEngaged: boolean
  hoveredPlotId: string | null
  // The exhibit whose panel is open. Only meaningful inside the selected plot.
  activeExhibitId: string | null
  // One field for both the object in the room and its entry in the list, which
  // is what makes hovering either one light up the other.
  hoveredExhibitId: string | null
  theme: ThemeName
  // Freezes every ambient motion: traffic and the idle drift. Camera moves the
  // visitor asks for still run.
  paused: boolean
  // Bumped to ask the camera to reframe its current level. A counter rather
  // than a flag, so asking twice in a row still reaches the camera twice.
  resetRequest: number
  engage: () => void
  setHovered: (id: string | null) => void
  selectPlot: (id: string) => void
  clearSelection: () => void
  setHoveredExhibit: (id: string | null) => void
  selectExhibit: (id: string) => void
  clearExhibit: () => void
  // Steps back exactly one level: exhibit to room, room to campus.
  back: () => void
  toggleTheme: () => void
  togglePaused: () => void
  requestReset: () => void
}

export const useEstate = create<EstateState>()((set, get) => ({
  mode: 'overview',
  selectedPlotId: null,
  hasEngaged: false,
  hoveredPlotId: null,
  activeExhibitId: null,
  hoveredExhibitId: null,
  theme: read(THEME_KEY) === 'dusk' ? 'dusk' : 'day',
  paused: read(PAUSED_KEY) === 'true',
  resetRequest: 0,

  engage: () => set({ hasEngaged: true }),

  setHovered: (id) => set({ hoveredPlotId: id }),

  // Entering a room never carries an exhibit over from the last one.
  selectPlot: (id) =>
    set({
      mode: 'focused',
      selectedPlotId: id,
      hasEngaged: true,
      activeExhibitId: null,
      hoveredExhibitId: null,
    }),

  clearSelection: () =>
    set({ mode: 'overview', selectedPlotId: null, activeExhibitId: null, hoveredExhibitId: null }),

  setHoveredExhibit: (id) => set({ hoveredExhibitId: id }),

  selectExhibit: (id) => set((state) => (state.selectedPlotId ? { activeExhibitId: id } : state)),

  clearExhibit: () => set({ activeExhibitId: null }),

  back: () => {
    const { activeExhibitId, selectedPlotId, clearExhibit, clearSelection } = get()
    if (activeExhibitId) clearExhibit()
    else if (selectedPlotId) clearSelection()
  },

  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === 'day' ? 'dusk' : 'day'
      write(THEME_KEY, theme)
      return { theme }
    }),

  togglePaused: () =>
    set((state) => {
      write(PAUSED_KEY, String(!state.paused))
      return { paused: !state.paused }
    }),

  requestReset: () => set((state) => ({ resetRequest: state.resetRequest + 1 })),
}))
