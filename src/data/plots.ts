import type { PaletteToken } from '@/theme'

export type BuildingProp = 'waterTank' | 'acUnit' | 'dish' | 'balcony' | 'chimney' | 'scooter' | 'hedge'

export type Plot = {
  id: string
  plotNumber: string
  title: string
  kind: "project" | "about" | "contact"
  tagline: string
  summary: string
  problem: string
  highlights: string[]
  stack: string[]
  links: { label: string; href: string }[]
  position: [number, number, number]
  rotation: number
  footprint: { w: number; d: number }
  floors: number
  // Roof shape and props are what make each building recognisable from the
  // overview, so they are chosen per plot rather than generated. Any prop may
  // go on any roof: the kit relocates the ones a pitched roof can't carry.
  roofStyle: 'gable' | 'hip' | 'flat' | 'terrace'
  props: BuildingProp[]
  // Theme token names, not colours. The roof is the plot's identity and must be
  // unique across plots; walls and trim may repeat.
  palette: { wall: PaletteToken; roof: PaletteToken; trim: PaletteToken }
  interior: {
    monitorContent: "chart" | "board" | "code" | "graph" | "docs"
    shelfItems: string[]
    posterText: string
  }
}

// Placement is derived, not hand-written: every plot on the ring is spaced
// evenly outside the road and turned to face the estate centre, so moving the
// ring never leaves a building pointing the wrong way.
type PlotDefinition = Omit<Plot, 'position' | 'rotation'>

const RING_RADIUS = 15.8
const RING_START_ANGLE = Math.PI * 0.12

function ringPlacement(index: number, total: number): Pick<Plot, 'position' | 'rotation'> {
  const angle = (index / total) * Math.PI * 2 + RING_START_ANGLE
  return {
    position: [Math.sin(angle) * RING_RADIUS, 0, Math.cos(angle) * RING_RADIUS],
    rotation: angle + Math.PI,
  }
}

const definitions: PlotDefinition[] = [
  {
    id: "spendsense",
    plotNumber: "Plot 01",
    title: "SpendSense",
    kind: "project",
    tagline: "Smart expense tracking and insights",
    summary: "Placeholder summary for SpendSense. To be written in Phase 11.",
    problem: "Placeholder problem statement. To be written in Phase 11.",
    highlights: ["Placeholder", "Placeholder", "Placeholder"],
    stack: ["React", "Node.js", "MongoDB"],
    links: [{ label: "GitHub", href: "#" }],
    footprint: { w: 3.4, d: 2.8 },
    floors: 2,
    roofStyle: 'gable',
    props: ['chimney', 'scooter'],
    palette: { wall: 'sand', roof: 'clay', trim: 'ink' },
    interior: {
      monitorContent: "chart",
      shelfItems: ["React", "Node", "MongoDB"],
      posterText: "Track. Analyze. Thrive.",
    },
  },
  {
    id: "pulsedesk",
    plotNumber: "Plot 02",
    title: "PulseDesk",
    kind: "project",
    tagline: "Collaboration and task management",
    summary: "Placeholder summary for PulseDesk. To be written in Phase 11.",
    problem: "Placeholder problem statement. To be written in Phase 11.",
    highlights: ["Placeholder", "Placeholder", "Placeholder"],
    stack: ["React", "Express", "PostgreSQL"],
    links: [{ label: "GitHub", href: "#" }],
    footprint: { w: 3.0, d: 3.0 },
    floors: 2,
    roofStyle: 'flat',
    props: ['dish', 'balcony'],
    palette: { wall: 'paper', roof: 'indigo', trim: 'ink' },
    interior: {
      monitorContent: "board",
      shelfItems: ["React", "Express", "PostgreSQL"],
      posterText: "Collaborate. Organize. Ship.",
    },
  },
  {
    id: "fingerprint",
    plotNumber: "Plot 03",
    title: "Fingerprint Match",
    kind: "project",
    tagline: "Biometric recognition system",
    summary: "Placeholder summary for Fingerprint Match. To be written in Phase 11.",
    problem: "Placeholder problem statement. To be written in Phase 11.",
    highlights: ["Placeholder", "Placeholder", "Placeholder"],
    stack: ["Python", "OpenCV", "TensorFlow"],
    links: [{ label: "GitHub", href: "#" }],
    footprint: { w: 3.8, d: 2.6 },
    floors: 1,
    roofStyle: 'hip',
    props: ['acUnit', 'hedge'],
    palette: { wall: 'sand', roof: 'ochre', trim: 'ink' },
    interior: {
      monitorContent: "code",
      shelfItems: ["Python", "OpenCV", "TensorFlow"],
      posterText: "Identify. Secure. Verify.",
    },
  },
  {
    id: "finalsay",
    plotNumber: "Plot 04",
    title: "FinalSay",
    kind: "project",
    tagline: "Document version control and collaboration",
    summary: "Placeholder summary for FinalSay. To be written in Phase 11.",
    problem: "Placeholder problem statement. To be written in Phase 11.",
    highlights: ["Placeholder", "Placeholder", "Placeholder"],
    stack: ["React", "Node.js", "Git API"],
    links: [{ label: "GitHub", href: "#" }],
    footprint: { w: 2.8, d: 3.2 },
    floors: 2,
    roofStyle: 'hip',
    props: ['balcony', 'waterTank'],
    palette: { wall: 'paper', roof: 'plum', trim: 'ink' },
    interior: {
      monitorContent: "docs",
      shelfItems: ["React", "Node", "Git API"],
      posterText: "Version. Collaborate. Preserve.",
    },
  },
  {
    id: "wattsense",
    plotNumber: "Plot 05",
    title: "WattSense",
    kind: "project",
    tagline: "Real-time energy monitoring",
    summary: "Placeholder summary for WattSense. To be written in Phase 11.",
    problem: "Placeholder problem statement. To be written in Phase 11.",
    highlights: ["Placeholder", "Placeholder", "Placeholder"],
    stack: ["IoT", "Node.js", "InfluxDB"],
    links: [{ label: "GitHub", href: "#" }],
    footprint: { w: 3.7, d: 3.2 },
    floors: 3,
    roofStyle: 'terrace',
    props: ['waterTank', 'dish'],
    palette: { wall: 'sand', roof: 'charcoal', trim: 'ink' },
    interior: {
      monitorContent: "graph",
      shelfItems: ["IoT", "Node.js", "InfluxDB"],
      posterText: "Monitor. Optimize. Save.",
    },
  },
  {
    id: "about",
    plotNumber: "About",
    title: "About",
    kind: "about",
    tagline: "Who I am",
    summary: "Placeholder summary. To be written in Phase 11.",
    problem: "",
    highlights: [],
    stack: [],
    links: [],
    footprint: { w: 4.2, d: 3.4 },
    floors: 1,
    roofStyle: 'gable',
    props: ['chimney', 'hedge'],
    palette: { wall: 'sand', roof: 'sage', trim: 'ink' },
    interior: {
      monitorContent: "docs",
      shelfItems: ["Books", "Code", "Music"],
      posterText: "Learn. Build. Share.",
    },
  },
  {
    id: "contact",
    plotNumber: "Contact",
    title: "Contact",
    kind: "contact",
    tagline: "Get in touch",
    summary: "Placeholder summary. To be written in Phase 11.",
    problem: "",
    highlights: [],
    stack: [],
    links: [
      { label: "Email", href: "mailto:nilabhxintern@gmail.com" },
      { label: "GitHub", href: "https://github.com/spycoderr" },
      { label: "LinkedIn", href: "https://linkedin.com/in/nilabh-kishore-gupta" },
    ],
    footprint: { w: 2.0, d: 2.0 },
    floors: 1,
    roofStyle: 'flat',
    props: [],
    // The noticeboard, not a building, so its swatch is deliberately neutral
    // rather than borrowing a roof identity that belongs to a plot.
    palette: { wall: 'sand', roof: 'ink', trim: 'ink' },
    interior: {
      monitorContent: "docs",
      shelfItems: [],
      posterText: "Let's talk",
    },
  },
]

// The noticeboard stands in the central park rather than on the ring, so it is
// placed directly and takes no driveway.
const CONTACT_PLACEMENT: Pick<Plot, 'position' | 'rotation'> = {
  position: [3.4, 0, 4.2],
  rotation: Math.PI * 0.18,
}

const ringDefinitions = definitions.filter((plot) => plot.kind !== 'contact')

export const plots: Plot[] = definitions.map((definition) => {
  if (definition.kind === 'contact') return { ...definition, ...CONTACT_PLACEMENT }
  const index = ringDefinitions.indexOf(definition)
  return { ...definition, ...ringPlacement(index, ringDefinitions.length) }
})
