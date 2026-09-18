import { create } from 'zustand'
import type { ThemeName } from '@/theme'

const THEME_KEY = 'estate.theme'

// Storage can be missing or throw (private windows, blocked site data), and
// the site must still open in daylight when it does.
function storedTheme(): ThemeName {
  try {
    return window.localStorage.getItem(THEME_KEY) === 'dusk' ? 'dusk' : 'day'
  } catch {
    return 'day'
  }
}

function storeTheme(theme: ThemeName) {
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Remembering is a convenience; the toggle still works for this visit.
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
  requestReset: () => void
}

export const useEstate = create<EstateState>()((set, get) => ({
  mode: 'overview',
  selectedPlotId: null,
  hasEngaged: false,
  hoveredPlotId: null,
  activeExhibitId: null,
  hoveredExhibitId: null,
  theme: storedTheme(),
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
      storeTheme(theme)
      return { theme }
    }),

  requestReset: () => set((state) => ({ resetRequest: state.resetRequest + 1 })),
}))
