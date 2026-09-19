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

// For projects whose details haven't been written yet: honest placeholders
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

function exhibit(
  id: string,
  name: string,
  object: ExhibitObject,
  claim: string,
  body: string[],
  labels?: string[],
): Exhibit {
  return { id, name, object, claim, body, labels }
}

export type Plot = {
  id: string
  plotNumber: string
  title: string
  // Inside the room, the left overlay reads: eyebrow ("Plot 02 · 2025"), the
  // room's headline, then a one-line subhead above the exhibit list.
  // The name in the tab bar, where space is short.
  shortName: string
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
    shortName: "SpendSense",
    eyebrow: "Plot 01 · Personal finance",
    roomHeadline: "Spending, with the odd ones flagged",
    subhead: "An expense tracker that explains every anomaly it raises.",
    kind: "project",
    tagline: "Expense tracker with explainable anomaly detection",
    summary:
      "A full-stack MERN expense tracker whose anomaly detection is rule-based and transparent, so every flag can be traced to its reasons.",
    problem:
      "An unusual expense is only useful to flag if the person can see why it was flagged. SpendSense scores transactions on signals anyone can check.",
    highlights: [
      "Anomaly score from three weighted signals",
      "React dashboard with Recharts",
      "Tested against ~120 demo transactions with 6 planted anomalies",
    ],
    stack: ["React", "Node.js", "Express", "MongoDB", "JWT"],
    links: [{ label: "GitHub", href: "#" }],
    footprint: { w: 3.4, d: 2.8 },
    floors: 2,
    roofStyle: 'gable',
    props: ['chimney', 'scooter'],
    palette: { wall: 'sand', roof: 'clay', trim: 'ink' },
    exhibits: [
      exhibit('score', 'Anomaly scorer', 'barTerminal', 'Every flag comes with the reasons behind it.', [
        'Each transaction gets an anomaly score built from three weighted signals: how far it deviates from normal spending, how rare its category is, and when it happened.',
        'The detection is rule-based on purpose. Because the score is a weighted sum of signals rather than a black box, a flagged transaction can always be traced back to what pushed it up.',
      ]),
      exhibit('dashboard', 'Category board', 'tileBoard', 'Where the money went, at a glance.', [
        'A React dashboard, charted with Recharts, shows spending so that a flagged transaction can be read against everything around it.',
        'Behind it are RESTful APIs on Node.js and Express with MongoDB, and JWT authentication on the API.',
      ]),
      exhibit('demo', 'Receipt cabinet', 'receiptCabinet', 'Six planted anomalies, and tests that expect to find them.', [
        'To show the scoring working without anyone\'s real finances, I built a realistic demo set of about 120 transactions with six anomalies planted in it.',
        'Unit tests cover the edge cases in the scoring, so its behaviour is checked end to end rather than judged by eye on a chart.',
      ]),
    ],
  },
  {
    id: "pulsedesk",
    plotNumber: "Plot 02",
    title: "PulseDesk",
    shortName: "PulseDesk",
    eyebrow: "Plot 02 · In progress",
    roomHeadline: "Reading the mood of the inbox",
    subhead: "Classifying customer feedback so urgent complaints surface first.",
    kind: "project",
    tagline: "Customer feedback sentiment dashboard",
    summary:
      "A customer feedback system, being built now, that classifies sentiment and urgency and tracks how sentiment moves over time.",
    problem:
      "In a large pile of feedback, the urgent complaints get buried among routine messages. PulseDesk sorts them so support can triage faster.",
    highlights: [
      "TF-IDF and Logistic Regression classifier",
      "MongoDB ingestion pipeline and admin dashboard",
      "Automatic tagging of urgent complaints",
    ],
    stack: ["React", "Node.js", "Express", "MongoDB", "scikit-learn"],
    links: [{ label: "GitHub", href: "#" }],
    footprint: { w: 3.0, d: 3.0 },
    floors: 2,
    roofStyle: 'flat',
    props: ['dish', 'balcony'],
    palette: { wall: 'paper', roof: 'indigo', trim: 'ink' },
    exhibits: [
      exhibit('triage', 'Triage wall', 'kanbanWall', 'Urgent complaints tagged the moment they arrive.', [
        'Urgent complaints are tagged automatically, combining negative sentiment with keyword-based signals, so they can go to the front of the support queue.',
        'The aim is faster triage: the messages that need an answer today shouldn\'t wait behind the ones that don\'t.',
      ]),
      exhibit('classifier', 'Customer voice', 'headset', 'Every message read for mood and urgency.', [
        'PulseDesk classifies each piece of customer feedback for sentiment and for urgency, using TF-IDF features and a Logistic Regression model built with scikit-learn.',
        'It is still in progress: the classifier is being built alongside the rest of the pipeline.',
      ]),
      exhibit('pipeline', 'Ingestion rack', 'statusRack', 'Feedback in, trends out.', [
        'A MongoDB ingestion pipeline brings the feedback in, and an administrative dashboard shows how customer sentiment moves over time.',
        'Like the rest of PulseDesk, this part is being built now.',
      ]),
    ],
  },
  {
    id: "labtrack",
    plotNumber: "Plot 03",
    title: "LabTrack",
    shortName: "LabTrack",
    eyebrow: "Plot 03 · Internal tool",
    roomHeadline: "The lab's equipment, off the spreadsheet",
    subhead: "An asset and request portal built from what lab staff asked for.",
    kind: "project",
    tagline: "Lab asset and request management portal",
    summary:
      "An internal portal that tracks lab equipment, issue and return requests and their approvals, replacing a manual spreadsheet process.",
    problem:
      "Lab equipment, requests and approvals were tracked by hand in a spreadsheet. LabTrack gives them a proper system with roles, reports and an audit trail.",
    highlights: [
      "Normalized MySQL schema with audit logs",
      "JWT auth with admin, lab staff and student roles",
      "Deployed on Render with CI/CD through GitHub Actions",
    ],
    stack: ["React", "Node.js", "Express", "MySQL", "JWT"],
    links: [{ label: "GitHub", href: "#" }],
    footprint: { w: 3.8, d: 2.6 },
    floors: 1,
    roofStyle: 'hip',
    props: ['acUnit', 'hedge'],
    palette: { wall: 'sand', roof: 'ochre', trim: 'ink' },
    exhibits: [
      exhibit('requests', 'Issue counter', 'docScanner', 'Borrowing lab equipment, without the spreadsheet.', [
        'LabTrack started with the people who run the lab. I gathered requirements from lab staff and wrote a technical design document before building: a portal that tracks equipment, issue and return requests, and their approvals.',
        'Access follows roles. RESTful APIs with JWT authentication and role-based access control give admins, lab staff and students different permissions, with input validation and centralised error handling throughout.',
      ]),
      exhibit('ledger', 'Approval ledger', 'stampLedger', 'Every request and approval on the record.', [
        'The data lives in a normalized MySQL schema of assets, users, requests and audit logs, with foreign keys and indexes.',
        'SQL queries with joins and aggregations produce the reports the lab needs: equipment running low, and returns that are overdue.',
      ]),
      exhibit('exports', 'Export table', 'matchedStack', 'Reports in Google Sheets, alerts by email.', [
        'LabTrack connects to the tools around it: reports export to Google Sheets through its API, and Nodemailer sends email alerts.',
        'It is tested and shipped like production software, with Jest unit tests, API documentation in Postman, and deployment on Render with CI/CD through GitHub Actions.',
      ]),
    ],
  },
  {
    id: "finalsay",
    plotNumber: "Plot 04",
    title: "FinalSay",
    shortName: "FinalSay",
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
    shortName: "WattSense",
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
    shortName: "About",
    eyebrow: "About · Thapar Institute",
    roomHeadline: "Nilabh, briefly",
    subhead: "Computer Engineering at Thapar, Batch of 2028.",
    kind: "about",
    tagline: "Who I am",
    summary: profile.about[0],
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
      exhibit('coursework', 'Coursework', 'bookshelf', 'Computer Engineering, with a 9.00 CGPA so far.', [
        'I\'m studying for a B.Tech in Computer Engineering at Thapar Institute of Engineering and Technology, from August 2024 to May 2028, with a CGPA of 9.00.',
        'Coursework so far: Data Structures and Algorithms, Object-Oriented Programming, Operating Systems, Database Management Systems, Computer Networks and Software Engineering.',
      ]),
      exhibit('teams', 'Two teams', 'laptopDesk', 'Coordinating people, and building for events.', [
        'From September 2024 to March 2025 I was a coordinator at the Student Alumni Interaction Cell: the main point of contact between alumni and students, planning engagement events and keeping follow-ups on time.',
        'Over the same months I was on the web team of the Microsoft Learn Student Chapter, where I built the About Us and Timeline pages for Makethon-7 with designers and event organisers.',
      ]),
      exhibit(
        'numbers',
        'Three numbers',
        'statsFrames',
        'Problem solving, measured.',
        [
          '200+ data structures and algorithms problems solved on LeetCode, with a contest rating of 1540.',
          'A 9.00 CGPA at Thapar, and before that the 97th percentile in JEE Mains 2024.',
        ],
        profile.stats.map((stat) => `${stat.value}|${stat.label}`),
      ),
    ],
  },
  {
    id: "contact",
    plotNumber: "Contact",
    title: "Contact",
    shortName: "Contact",
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
      { label: "Email", href: `mailto:${profile.email}` },
      { label: "GitHub", href: profile.github },
      { label: "LinkedIn", href: profile.linkedin },
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
