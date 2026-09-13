// The single source of identity for the whole site: palette and type.
//
// Nothing about a specific person or project belongs here, and no component may
// hardcode a colour. Swapping the values below is meant to be the entire job of
// re-skinning the site for a second instance.

type Palette = {
  // The void the slab floats in.
  groundFar: string
  // The model itself.
  slabTop: string
  slabEdge: string
  // Roads and markings.
  road: string
  roadMark: string
  kerb: string
  // Building surfaces. The three accents are roof identities, one per plot.
  sand: string
  clay: string
  indigo: string
  sage: string
  // Planting and water.
  grassDark: string
  hedge: string
  trunk: string
  foliage: string
  foliageDark: string
  water: string
  path: string
  // Glazing. Dusk is the only time windowLit is doing any work.
  windowDark: string
  windowLit: string
  // Plot pads.
  pad: string
  padHighlight: string
  // Type and trim.
  ink: string
  paper: string
  // Interior furnishing.
  wood: string
  woodDark: string
  fabric: string
  rug: string
  pot: string
  leaf: string
  screenFrame: string
  screenBg: string
  shelfBlock: string
  brass: string
}

// A bright midday society. Chosen over a night-first scheme because it reads as
// friendlier in a five-second scan and is legible before the visitor has
// touched anything.
const day: Palette = {
  groundFar: '#dfe6dd',
  slabTop: '#b9cf9e',
  slabEdge: '#a08767',
  road: '#7b8189',
  roadMark: '#eef0e6',
  kerb: '#cfc9b8',
  sand: '#ede2cc',
  clay: '#c2603f',
  indigo: '#3d5a80',
  sage: '#6d9a6a',
  grassDark: '#a3bd88',
  hedge: '#587f45',
  trunk: '#7a5b42',
  foliage: '#5c8a4a',
  foliageDark: '#4a7440',
  water: '#6f9fb5',
  path: '#d8d0bd',
  windowDark: '#2a3a4a',
  windowLit: '#e8f0f8',
  pad: '#a8c485',
  padHighlight: '#c6dda2',
  ink: '#212934',
  paper: '#f3efe6',
  wood: '#a88153',
  woodDark: '#6f5233',
  fabric: '#5b6b7c',
  rug: '#b26a5e',
  pot: '#b5765a',
  leaf: '#4e8a52',
  screenFrame: '#2a3038',
  screenBg: '#12181f',
  shelfBlock: '#c9b48c',
  brass: '#c8a44e',
}

// The toggle. Windows and streetlights are the whole point of it, so anything
// that glows keeps its value while the surfaces around it fall away.
const dusk: Palette = {
  ...day,
  groundFar: '#1a2130',
  slabTop: '#3e5545',
  slabEdge: '#2b2620',
  road: '#333a44',
  roadMark: '#5b6470',
  kerb: '#4a4f52',
  sand: '#6f6960',
  grassDark: '#33452f',
  hedge: '#2f4a2c',
  trunk: '#3f3229',
  foliage: '#2f4a32',
  foliageDark: '#263c29',
  water: '#2f4a5c',
  path: '#4a4740',
  windowDark: '#1b2430',
  windowLit: '#ffd9a0',
  pad: '#35492f',
  padHighlight: '#445c3a',
  paper: '#f0ece2',
}

export const themes = { day, dusk } as const
export type ThemeName = keyof typeof themes

// One accent, in both modes, used sparingly: active states, the wordmark dot,
// the exhibit claim line.
export const ACCENT = '#c2603f'

export const TYPE = {
  display: "'Bricolage Grotesque', sans-serif",
  body: "'Inter', sans-serif",
  scale: [12, 14, 16, 20, 28, 44, 68] as const,
  maxLineLength: 62,
} as const

// The palette the scene is built against. The dusk toggle swaps material and
// vertex colours at runtime rather than rebuilding geometry, so this stays the
// construction-time reference.
export const palette = day
