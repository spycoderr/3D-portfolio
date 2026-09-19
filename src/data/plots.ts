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

// A project's full story, opened from the first entry in its room: what it
// is, a few numbers worth knowing, how it works, and what it trades away.
export type PlotOverview = {
  intro: string[]
  // Shown large, and counted up when the panel opens: "87.8%", "0.55", "~120".
  facts: { value: string; label: string }[]
  sections: { title: string; body: string[] }[]
}

// The id the overview answers to in the address, beside the exhibits' own.
export const OVERVIEW_ID = 'overview'

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
  overview?: PlotOverview
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
      "A personal expense tracker that flags transactions which break from your own spending history, each with a plain-English reason.",
    problem:
      "Card issuers run anomaly alerts nobody can inspect. SpendSense does the same job with statistics simple enough to check by hand.",
    highlights: [
      "Four weighted signals, one flag threshold",
      "Scoring runs off the request path",
      "Idempotent writes, enforced by the database",
    ],
    stack: ["React", "Vite", "Recharts", "Node.js", "Express", "MongoDB", "Mongoose", "JWT", "node:test"],
    links: [
      { label: "Live demo", href: "https://spendsense-kohl.vercel.app" },
      { label: "GitHub", href: "https://github.com/spycoderr/spendsense" },
    ],
    footprint: { w: 3.4, d: 2.8 },
    floors: 2,
    roofStyle: 'gable',
    props: ['chimney', 'scooter'],
    palette: { wall: 'sand', roof: 'clay', trim: 'ink' },
    exhibits: [
      exhibit('score', 'Anomaly scorer', 'barTerminal', 'Every flag comes with the reason behind it.', [
        'Each new transaction is scored against your own history in four ways: how far its amount sits above your average in that category, how rarely you spend in that category at all, whether other purchases landed in the hour before it, and whether it happened between midnight and 5 AM.',
        'The signals are weighted 0.57, 0.25, 0.10 and 0.08 and compared against a single threshold of 0.55. The two strong signals only switch on once there is enough history to trust them, and timing and velocity can never flag a purchase on their own: even together they top out at 0.18.',
        'A flag is never a bare verdict. It names the signal that drove it, in a sentence like "₹8,600 is 4.7x your usual bills spend (avg ₹1,833)", so anyone can check the reasoning.',
      ]),
      exhibit('dashboard', 'Category board', 'tileBoard', 'Where the money went, at a glance.', [
        'The React dashboard pairs stat cards with a category breakdown and a spending trend, charted with Recharts, so a flagged transaction can be read against everything around it.',
        'Flags land in an Alerts inbox, where each one is confirmed or dismissed and moves to a Reviewed page. Transactions can be logged one at a time or brought in by CSV import, which scores its rows as it goes.',
        'Behind it is a Node.js and Express API on MongoDB, with JWT authentication and rate limiting.',
      ]),
      exhibit('demo', 'Receipt cabinet', 'receiptCabinet', 'Planted anomalies, and tests that expect to find them.', [
        'A seed script builds a demo account with about 120 transactions over six months: recurring bills, everyday food, occasional shopping, and a few deliberately planted anomalies, from an outsized purchase to a rare-category spend and some late-night transactions.',
        'The scorer is a pure function with no database or framework in it, so its test suite, run on Node\'s built-in test runner, can pin down the edge cases: zero-variance history, missing signals, and the cold start.',
        'Nobody is flagged in their first ten transactions. Without that, the model would raise alarms before it had anything meaningful to compare against.',
      ]),
    ],
    overview: {
      intro: [
        'SpendSense is a personal expense tracker that flags transactions which break from your own spending pattern: a simplified, transparent version of the anomaly alerts a card issuer runs.',
        'You log your spending, and each new transaction is scored against your history in its category. If something looks out of character, whether an unusually large purchase, a category you rarely touch, or a purchase in the middle of the night, it is flagged with a plain-English reason and waits in an Alerts inbox to be confirmed or dismissed.',
      ],
      facts: [
        { value: "4", label: "weighted signals behind every score" },
        { value: "0.55", label: "score at which a transaction is flagged" },
        { value: "~120", label: "transactions in the seeded demo account" },
        { value: "10", label: "transactions before anything can be flagged" },
      ],
      sections: [
        {
          title: "Why statistics, not a black box",
          body: [
            "The detection is deliberately simple statistics. Every score can be explained in one sentence and audited by looking at a handful of numbers, so someone who disagrees with a flag can see exactly which signal caused it. For a personal finance tool that is a far better trust story than \"the model says so\".",
            "It also keeps the threshold, the weights and every edge case in reach of a human reviewer, who can adjust them deliberately rather than retrain anything.",
          ],
        },
        {
          title: "Built like a production API",
          body: [
            "Scoring runs off the request path. A new transaction is saved as pending and the response goes straight back; an in-process queue does the scoring afterwards, and the interface shows a \"Scoring…\" pill until it is done. The queue is shaped like a Redis-backed one, so swapping in BullMQ later means replacing one file, not its callers.",
            "Duplicate submissions are deduped, not just rate-limited. Each submission carries an idempotency key, and a partial unique index in MongoDB means even two racing requests cannot both insert: a double-click or a silent browser retry gets back the original transaction.",
          ],
        },
        {
          title: "What it trades away",
          body: [
            "The cold start suppresses real anomalies too: a genuinely large first purchase goes unflagged. Transactions are scored once, against the history that existed then, and never rescored, which keeps reviewed scores stable but means an old flag can look odd in hindsight.",
            "The weights and threshold are hand-picked rather than tuned on real labelled data, which does not exist for a demo. A review status is stored on every transaction precisely so that feedback loop can be built later.",
          ],
        },
      ],
    },
  },
  {
    id: "pulsedesk",
    plotNumber: "Plot 02",
    title: "PulseDesk",
    shortName: "PulseDesk",
    eyebrow: "Plot 02 · Feedback triage",
    roomHeadline: "Reading the mood of the inbox",
    subhead: "Sorting customer feedback so the urgent complaints surface first.",
    kind: "project",
    tagline: "Customer feedback sentiment and urgency triage",
    summary:
      "Customer feedback triage that classifies every submission by sentiment and urgency, so support works a prioritised queue instead of reading top to bottom.",
    problem:
      "Feedback queues sorted by submission time put a compliment next to a furious cancellation. PulseDesk sorts them by what needs attention today.",
    highlights: [
      "TF-IDF and Logistic Regression, 87.8% held-out accuracy",
      "Urgency as an auditable rule, not a model",
      "Flask classifier behind a Node.js API",
    ],
    stack: ["React", "Vite", "Recharts", "Node.js", "Express", "MongoDB", "Python", "scikit-learn", "Flask", "JWT"],
    links: [{ label: "GitHub", href: "https://github.com/spycoderr/pulsedeck" }],
    footprint: { w: 3.0, d: 3.0 },
    floors: 2,
    roofStyle: 'flat',
    props: ['dish', 'balcony'],
    palette: { wall: 'paper', roof: 'indigo', trim: 'ink' },
    exhibits: [
      exhibit('triage', 'Triage wall', 'kanbanWall', 'Urgent complaints go to the top, with the reason why.', [
        'Urgency is a plain rule on top of the sentiment prediction. Negative feedback containing one of eight escalation words, such as "refund", "broken", "cancel" or "unacceptable", is high urgency; any other negative feedback is medium; everything else is low.',
        'Only negative feedback can escalate, so "the refund was handled quickly" never triggers anything. Every escalated entry carries a reason naming the exact word that triggered it.',
        'The rule lives in exactly one place, the Python classifier, and comes back with the sentiment from a single call. Node never reimplements it, so two copies can never drift apart.',
      ]),
      exhibit('classifier', 'Customer voice', 'headset', 'Every message read for mood, and every call explainable.', [
        'Each piece of feedback becomes a TF-IDF vector of unigrams and bigrams, English stop words removed and capped at 2,000 features, and a multinomial Logistic Regression classifies it as positive, negative or neutral with the full probability for each.',
        'It scores 87.8% on a held-out test split, and 85.0% ± 4.4% under 50-fold repeated cross-validation.',
        'A linear model was chosen on purpose: every word carries a signed weight you can point at when someone asks why a message was flagged; it suits a small dataset; and classifying is a single sparse matrix multiply, with no GPU, no API cost and no outside service.',
      ]),
      exhibit('pipeline', 'Ingestion rack', 'statusRack', 'From a public form to a prioritised queue.', [
        'Customers leave a star rating and a comment on a public form. The Node.js and Express API stores it in MongoDB and sends the text to the Flask classifier, which returns sentiment and urgency in one reply.',
        'Admins sign in with JWT to a dashboard with a sentiment breakdown, a trend chart and a filterable, prioritised feedback queue.',
        'The seed script classifies all 86 demo entries through the live classifier rather than labelling any by hand, so seeding the database proves the whole pipeline end to end.',
      ]),
    ],
    overview: {
      intro: [
        'Support teams that collect open-ended feedback usually end up with a queue sorted by nothing more useful than submission time: a five-star compliment beside a furious cancellation request, and someone has to read every entry to find the ones that need attention today.',
        'PulseDesk collects a star rating and a comment through a public form, classifies each one by sentiment and urgency, and gives an admin a dashboard and a filterable, prioritised queue, so the team can triage instead of reading top to bottom.',
      ],
      facts: [
        { value: "87.8%", label: "accuracy on held-out feedback" },
        { value: "85.0%", label: "under 50-fold cross-validation, ± 4.4%" },
        { value: "366", label: "hand-written training examples" },
        { value: "8", label: "escalation keywords, in one place" },
      ],
      sections: [
        {
          title: "The dataset lesson",
          body: [
            "The first draft of the training set had about 204 completely distinct sentences and scored only 56%. The diagnosis: 65% of words appeared in exactly one example, so the model had no repeated signal to learn from — 100% on training data, 56% on test, textbook overfitting.",
            "Rewriting the 366 examples to reuse a core sentiment vocabulary across varied sentences, the way real feedback behaves, raised held-out accuracy to 87.8%. A handful are deliberately adversarial, like \"Support fixed my broken account within the hour\", so words such as \"broken\" are learned in context rather than as labels.",
          ],
        },
        {
          title: "Why not a transformer",
          body: [
            "A modern language model would likely read sarcasm and nuance better. But a Logistic Regression can explain every prediction word by word, it fits a dataset this size, it runs in well under a millisecond on a laptop, and nothing depends on an outside service being up, priced right or consistent over time.",
            "For a triage tool where every prediction should be defensible line by line, that tradeoff is the point.",
          ],
        },
        {
          title: "What it trades away",
          body: [
            "The training set proves the pipeline, not production. It is English only, and a bag-of-words model misses sarcasm and mixed sentiment: \"Works okay but the sync is a bit unreliable\" reads as mildly positive. The escalation words cover common language but not every synonym, and adding one is a one-line change rather than retraining.",
            "On ambiguous text, confidence honestly sits around 0.4 to 0.6, and the interface shows the full probability spread instead of hiding that uncertainty behind a single label.",
          ],
        },
      ],
    },
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
    overview: {
      intro: [
        'LabTrack is an internal portal for a lab: it tracks equipment, issue and return requests, and their approvals, replacing a process that ran on a manual spreadsheet.',
        'It began with the people who would use it. Requirements were gathered from lab staff and written up in a technical design document before any code, and the system was built to that design.',
      ],
      facts: [
        { value: "3", label: "roles: admin, lab staff and student" },
        { value: "4", label: "core tables: assets, users, requests, audit logs" },
        { value: "2", label: "integrations: Google Sheets and email" },
      ],
      sections: [
        {
          title: "Data model",
          body: [
            "A normalized MySQL schema holds assets, users, requests and audit logs, tied together with foreign keys and indexes.",
            "SQL with joins and aggregations produces the reports the lab needs most: equipment running low, and returns that are overdue.",
          ],
        },
        {
          title: "Access and safety",
          body: [
            "RESTful APIs with JWT authentication and role-based access control separate what admins, lab staff and students can do, with input validation and centralized error handling throughout, and every request and approval recorded in the audit log.",
          ],
        },
        {
          title: "Shipping it",
          body: [
            "Reports export to Google Sheets through its API, and Nodemailer sends email alerts. The API is covered by Jest unit tests and documented in Postman, and deployed on Render with CI/CD through GitHub Actions.",
          ],
        },
      ],
    },
  },
  {
    id: "about",
    plotNumber: "About",
    title: "About",
    shortName: "About",
    eyebrow: "About · Thapar Institute",
    roomHeadline: "Nilabh, briefly",
    subhead: "Computer Science and Engineering at Thapar, Batch of 2028.",
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
      exhibit('coursework', 'Coursework', 'bookshelf', 'Computer Science and Engineering, with a 9.00 CGPA so far.', [
        'I\'m studying for a B.Tech in Computer Science and Engineering at Thapar Institute of Engineering and Technology, from August 2024 to May 2028, with a CGPA of 9.00.',
        'Coursework so far: Data Structures and Algorithms, Object-Oriented Programming, Operating Systems, Database Management Systems, Computer Networks and Software Engineering.',
      ]),
      exhibit('teams', 'On the web team', 'laptopDesk', 'Building for events, with designers and organisers.', [
        'From September 2024 to March 2025 I was on the web team of the Microsoft Learn Student Chapter, where I built the About Us and Timeline pages for Makethon-7 with designers and event organisers.',
        'Outside coursework: a semifinalist run at the Flipkart GRID 8.0 Software Development Challenge.',
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
