import type { ExhibitObject } from '@/scene/exhibitKit'
import type { PaletteToken } from '@/theme'
import { profile } from './profile'

export type BuildingProp = 'waterTank' | 'acUnit' | 'dish' | 'balcony' | 'chimney' | 'scooter' | 'hedge'

// Something in a plot's room that is also an entry in its list. The object is
// chosen from the generic kit by name; the words are this plot's own.
export type Exhibit = {
  id: string
  // The list label: two or three words.
  name: string
  // The accent one-liner in the panel. States an outcome, not a technology.
  claim: string
  body: string[]
  object: ExhibitObject
  // Text a surface draws, for objects that show figures ("value|caption").
  labels?: string[]
}

// Until R8 writes the real copy, every exhibit carries honest placeholders
// rather than invented claims about the work.
function draft(id: string, name: string, object: ExhibitObject, labels?: string[]): Exhibit {
  return {
    id,
    name,
    object,
    labels,
    claim: 'Placeholder claim. Written in R8.',
    body: ['Placeholder paragraph. Written in R8.', 'Placeholder paragraph. Written in R8.'],
  }
}

export type Plot = {
  id: string
  plotNumber: string
  title: string
  // Inside the room, the left overlay reads: eyebrow ("Plot 02 · 2025"), the
  // room's headline, then a one-line subhead above the exhibit list.
  eyebrow: string
  roomHeadline: string
  subhead: string
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
  // Three per room. A room has two wall zones, each taking one wall or floor
  // object, and two places on the desk.
  exhibits: Exhibit[]
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
    // Year and wording to be written in R8.
    eyebrow: "Plot 01",
    roomHeadline: "Inside SpendSense",
    subhead: "Placeholder subhead. Written in R8.",
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
    exhibits: [
      draft('categories', 'Category board', 'tileBoard'),
      draft('trends', 'Spending trend', 'barTerminal'),
      draft('receipts', 'Receipt cabinet', 'receiptCabinet'),
    ],
  },
  {
    id: "pulsedesk",
    plotNumber: "Plot 02",
    title: "PulseDesk",
    // Year and wording to be written in R8.
    eyebrow: "Plot 02",
    roomHeadline: "Inside PulseDesk",
    subhead: "Placeholder subhead. Written in R8.",
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
    exhibits: [
      draft('board', 'Kanban wall', 'kanbanWall'),
      draft('calls', 'Support headset', 'headset'),
      draft('status', 'Status rack', 'statusRack'),
    ],
  },
  {
    id: "fingerprint",
    plotNumber: "Plot 03",
    title: "Fingerprint Match",
    // Year and wording to be written in R8.
    eyebrow: "Plot 03",
    roomHeadline: "Inside Fingerprint Match",
    subhead: "Placeholder subhead. Written in R8.",
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
    exhibits: [
      draft('capture', 'Document scanner', 'docScanner'),
      draft('compare', 'Side by side', 'paperPair'),
      draft('matches', 'Matched pairs', 'matchedStack'),
    ],
  },
  {
    id: "finalsay",
    plotNumber: "Plot 04",
    title: "FinalSay",
    // Year and wording to be written in R8.
    eyebrow: "Plot 04",
    roomHeadline: "Inside FinalSay",
    subhead: "Placeholder subhead. Written in R8.",
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
    exhibits: [
      draft('drafts', 'Layered notices', 'posterBoard'),
      draft('signoff', 'Stamp and ledger', 'stampLedger'),
      draft('history', 'Version tree', 'versionTree'),
    ],
  },
  {
    id: "wattsense",
    plotNumber: "Plot 05",
    title: "WattSense",
    // Year and wording to be written in R8.
    eyebrow: "Plot 05",
    roomHeadline: "Inside WattSense",
    subhead: "Placeholder subhead. Written in R8.",
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
    exhibits: [
      draft('meters', 'Meter panel', 'meterPanel'),
      draft('appliances', 'Appliance cluster', 'applianceCluster'),
      draft('load', 'Load curve', 'lineMonitor'),
    ],
  },
  {
    id: "about",
    plotNumber: "About",
    title: "About",
    // Year and wording to be written in R8.
    eyebrow: "About",
    roomHeadline: "Inside About",
    subhead: "Placeholder subhead. Written in R8.",
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
    exhibits: [
      draft('reading', 'Bookshelf', 'bookshelf'),
      draft('work', 'Study desk', 'laptopDesk'),
      draft(
        'numbers',
        'Three numbers',
        'statsFrames',
        profile.stats.map((stat) => `${stat.value}|${stat.label}`),
      ),
    ],
  },
  {
    id: "contact",
    plotNumber: "Contact",
    title: "Contact",
    eyebrow: "",
    roomHeadline: "",
    subhead: "",
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
    // The noticeboard has no room to enter.
    exhibits: [],
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
