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
  palette: { wall: string; roof: string; trim: string }
  interior: {
    monitorContent: "chart" | "board" | "code" | "graph" | "docs"
    shelfItems: string[]
    posterText: string
  }
}

export const plots: Plot[] = [
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
    position: [8, 0, 0],
    rotation: 0,
    footprint: { w: 3, d: 3 },
    floors: 2,
    palette: { wall: "#e6ddca", roof: "#c2603f", trim: "#1d2430" },
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
    position: [5.7, 0, 5.7],
    rotation: Math.PI / 4,
    footprint: { w: 3, d: 3 },
    floors: 2,
    palette: { wall: "#e6ddca", roof: "#37506b", trim: "#1d2430" },
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
    position: [0, 0, 8],
    rotation: Math.PI / 2,
    footprint: { w: 3, d: 3 },
    floors: 1,
    palette: { wall: "#e6ddca", roof: "#4e7a4a", trim: "#1d2430" },
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
    position: [-5.7, 0, 5.7],
    rotation: (3 * Math.PI) / 4,
    footprint: { w: 3, d: 3 },
    floors: 2,
    palette: { wall: "#e6ddca", roof: "#c2603f", trim: "#1d2430" },
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
    position: [-8, 0, 0],
    rotation: Math.PI,
    footprint: { w: 3, d: 3 },
    floors: 2,
    palette: { wall: "#e6ddca", roof: "#37506b", trim: "#1d2430" },
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
    position: [-5.7, 0, -5.7],
    rotation: (5 * Math.PI) / 4,
    footprint: { w: 4, d: 4 },
    floors: 1,
    palette: { wall: "#e6ddca", roof: "#4e7a4a", trim: "#1d2430" },
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
    position: [5.7, 0, -5.7],
    rotation: (7 * Math.PI) / 4,
    footprint: { w: 2, d: 2 },
    floors: 1,
    palette: { wall: "#e6ddca", roof: "#c2603f", trim: "#1d2430" },
    interior: {
      monitorContent: "docs",
      shelfItems: [],
      posterText: "Let's talk",
    },
  },
]
