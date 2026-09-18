import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  PlaneGeometry,
  TorusGeometry,
} from 'three'
import { palette } from '@/theme'

// The generic set of objects a room can hold. Data refers to them by name, so
// a second instance of the site can furnish entirely different projects from
// the same kit without touching any geometry.
export const EXHIBIT_OBJECTS = [
  'tileBoard',
  'barTerminal',
  'receiptCabinet',
  'kanbanWall',
  'headset',
  'statusRack',
  'docScanner',
  'paperPair',
  'matchedStack',
  'posterBoard',
  'stampLedger',
  'versionTree',
  'meterPanel',
  'applianceCluster',
  'lineMonitor',
  'bookshelf',
  'laptopDesk',
  'statsFrames',
] as const

export type ExhibitObject = (typeof EXHIBIT_OBJECTS)[number]

// Where an object goes. Wall and floor objects share the room's two wall
// zones; desk objects share the two places on the desk.
export type Mount = 'wall' | 'desk' | 'floor'

export type SurfaceKind =
  | 'tiles'
  | 'bars'
  | 'kanban'
  | 'posters'
  | 'tree'
  | 'meters'
  | 'line'
  | 'stats'
  | 'prints'
  | 'ledger'
  | 'laptop'
  | 'scan'

// Frames every builder works in, so the room can place any object anywhere
// its mount allows:
//   wall  — back face on the wall at z = 0, facing +z, centred on y = 0
//   floor — standing on y = 0, back against the wall at z = 0, facing +z
//   desk  — standing on the desk top at y = 0, centred, facing +z
// Size limits: wall and floor 1.25 wide, wall 1.0 tall, floor 1.75 tall and
// 0.6 deep; desk 0.8 wide and 0.5 deep.
type KitEntry = {
  mount: Mount
  // What the object's textured face shows, and that face's width over height.
  surface: { kind: SurfaceKind; aspect: number } | null
  build: () => BufferGeometry[]
}

// Faces that are not textured carry this UV, which the room points at the
// plain white cell of its atlas once it knows where each exhibit's cell is.
export const UNTEXTURED = -1

function tint(geometry: BufferGeometry, colour: string): BufferGeometry {
  const value = new Color(colour)
  const count = geometry.attributes.position.count
  const colours = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    colours[index * 3] = value.r
    colours[index * 3 + 1] = value.g
    colours[index * 3 + 2] = value.b
  }
  geometry.setAttribute('color', new BufferAttribute(colours, 3))
  return geometry
}

function solid(geometry: BufferGeometry, colour: string): BufferGeometry {
  tint(geometry, colour)
  const uv = geometry.attributes.uv as BufferAttribute
  for (let index = 0; index < uv.count; index += 1) uv.setXY(index, UNTEXTURED, UNTEXTURED)
  return geometry
}

function box(colour: string, w: number, h: number, d: number, x = 0, y = 0, z = 0) {
  const geometry = new BoxGeometry(w, h, d)
  geometry.translate(x, y, z)
  return solid(geometry, colour)
}

function cyl(colour: string, top: number, bottom: number, h: number, x = 0, y = 0, z = 0) {
  const geometry = new CylinderGeometry(top, bottom, h, 14)
  geometry.translate(x, y, z)
  return solid(geometry, colour)
}

// A textured plane. Its UVs stay in cell space, optionally squeezed into a
// sub-rectangle so one surface drawing can span several planes.
// White, so the texture shows in its own colours rather than tinted.
function surface(w: number, h: number, u0 = 0, v0 = 0, u1 = 1, v1 = 1): BufferGeometry {
  const geometry = tint(new PlaneGeometry(w, h), '#ffffff')
  const uv = geometry.attributes.uv as BufferAttribute
  for (let index = 0; index < uv.count; index += 1) {
    uv.setXY(index, u0 + uv.getX(index) * (u1 - u0), v0 + uv.getY(index) * (v1 - v0))
  }
  return geometry
}

function onDesk(geometry: BufferGeometry): BufferGeometry {
  geometry.rotateX(-Math.PI / 2)
  return geometry
}

// A lid or screen built in its closed position with the hinge on the origin,
// swung about the hinge, then moved to where the hinge actually is.
function hinged(parts: BufferGeometry[], angle: number, y: number, z: number): BufferGeometry[] {
  return parts.map((part) => {
    part.rotateX(angle)
    part.translate(0, y, z)
    return part
  })
}

const SCREEN = { w: 0.61, h: 0.37 }

function monitor(): BufferGeometry[] {
  const screenY = 0.42
  return [
    box(palette.screenFrame, 0.28, 0.02, 0.18, 0, 0.01, -0.06),
    box(palette.screenFrame, 0.06, 0.2, 0.05, 0, 0.12, -0.1),
    box(palette.screenFrame, 0.66, 0.42, 0.035, 0, screenY, -0.08),
    surface(SCREEN.w, SCREEN.h).translate(0, screenY, -0.08 + 0.0185),
    box(palette.charcoal, 0.42, 0.02, 0.13, 0, 0.01, 0.14),
    box(palette.charcoal, 0.05, 0.02, 0.08, 0.3, 0.01, 0.14),
  ]
}

const BOARD_INSET = 0.08

function board(colour: string, w: number, h: number, depth: number): BufferGeometry[] {
  return [
    box(colour, w, h, depth, 0, 0, depth / 2),
    surface(w - BOARD_INSET, h - BOARD_INSET).translate(0, 0, depth + 0.002),
  ]
}

const boardAspect = (w: number, h: number) => (w - BOARD_INSET) / (h - BOARD_INSET)

// Deterministic, so a room is furnished identically on every visit.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const accents = () => [palette.clay, palette.indigo, palette.sage, palette.ochre, palette.plum]

const KIT: Record<ExhibitObject, KitEntry> = {
  tileBoard: {
    mount: 'wall',
    surface: { kind: 'tiles', aspect: boardAspect(1.2, 0.84) },
    build: () => board(palette.woodDark, 1.2, 0.84, 0.05),
  },

  barTerminal: { mount: 'desk', surface: { kind: 'bars', aspect: SCREEN.w / SCREEN.h }, build: monitor },

  lineMonitor: { mount: 'desk', surface: { kind: 'line', aspect: SCREEN.w / SCREEN.h }, build: monitor },

  receiptCabinet: {
    mount: 'floor',
    surface: null,
    build: () => {
      const parts = [box(palette.kerb, 0.56, 1.02, 0.5, 0, 0.51, 0.25)]
      for (let drawer = 0; drawer < 2; drawer += 1) {
        const y = 0.18 + drawer * 0.32
        parts.push(box(palette.paper, 0.5, 0.29, 0.02, 0, y, 0.51))
        parts.push(box(palette.ink, 0.14, 0.03, 0.03, 0, y + 0.06, 0.535))
      }
      // The top drawer stands open, full of receipts.
      const trayY = 0.82
      parts.push(box(palette.kerb, 0.48, 0.2, 0.36, 0, trayY, 0.66))
      parts.push(box(palette.paper, 0.5, 0.26, 0.02, 0, trayY + 0.02, 0.85))
      parts.push(box(palette.ink, 0.14, 0.03, 0.03, 0, trayY + 0.08, 0.875))
      const random = seeded(11)
      for (let slip = 0; slip < 7; slip += 1) {
        const height = 0.14 + random() * 0.08
        parts.push(
          box(palette.paper, 0.1, height, 0.006, -0.18 + slip * 0.06, trayY + 0.08 + height / 2, 0.56 + (slip % 3) * 0.08),
        )
      }
      return parts
    },
  },

  kanbanWall: {
    mount: 'wall',
    surface: { kind: 'kanban', aspect: boardAspect(1.25, 0.9) },
    build: () => board(palette.paper, 1.25, 0.9, 0.04),
  },

  headset: {
    mount: 'desk',
    surface: null,
    build: () => {
      const band = new TorusGeometry(0.12, 0.018, 6, 18, Math.PI)
      band.translate(0, 0.27, 0)
      const parts = [
        cyl(palette.charcoal, 0.07, 0.08, 0.02, 0, 0.01, 0),
        box(palette.charcoal, 0.025, 0.26, 0.025, 0, 0.14, 0),
        solid(band, palette.charcoal),
        box(palette.charcoal, 0.015, 0.015, 0.12, -0.12, 0.17, 0.07),
        box(palette.clay, 0.035, 0.035, 0.035, -0.12, 0.17, 0.14),
      ]
      for (const side of [-1, 1]) {
        const cup = new CylinderGeometry(0.055, 0.055, 0.045, 14)
        cup.rotateZ(Math.PI / 2)
        cup.translate(side * 0.12, 0.2, 0)
        parts.push(solid(cup, palette.indigo))
      }
      // A notepad beside it, so the desk reads as somewhere a call happens.
      parts.push(box(palette.paper, 0.16, 0.012, 0.22, 0.26, 0.006, 0.04))
      return parts
    },
  },

  statusRack: {
    mount: 'floor',
    surface: null,
    build: () => {
      const parts = [
        box(palette.charcoal, 0.62, 1.55, 0.52, 0, 0.775, 0.26),
        box(palette.ink, 0.54, 1.45, 0.01, 0, 0.78, 0.525),
      ]
      for (let row = 0; row < 6; row += 1) {
        parts.push(box(palette.kerb, 0.52, 0.015, 0.012, 0, 0.2 + row * 0.22, 0.532))
        for (let column = 0; column < 5; column += 1) {
          const cell = row * 5 + column
          // Mostly healthy, a couple of warnings, one fault: a rack that is
          // clearly being watched rather than a decorative light pattern.
          const colour = cell === 17 ? palette.clay : cell % 7 === 3 ? palette.ochre : palette.sage
          parts.push(box(colour, 0.045, 0.03, 0.012, -0.18 + column * 0.09, 0.3 + row * 0.22, 0.536))
        }
      }
      return parts
    },
  },

  docScanner: {
    mount: 'desk',
    surface: { kind: 'scan', aspect: 0.52 / 0.34 },
    build: () => [
      box(palette.kerb, 0.6, 0.09, 0.42, 0, 0.045, 0),
      onDesk(surface(0.52, 0.34)).translate(0, 0.0905, 0),
      ...hinged([box(palette.charcoal, 0.62, 0.025, 0.44, 0, 0.0125, 0.22)], -0.95, 0.09, -0.21),
      box(palette.sage, 0.05, 0.02, 0.01, 0.22, 0.05, 0.215),
    ],
  },

  paperPair: {
    mount: 'desk',
    surface: { kind: 'prints', aspect: (0.26 * 2) / 0.34 },
    build: () => {
      const left = onDesk(surface(0.26, 0.34, 0, 0, 0.5, 1))
      left.rotateY(0.06)
      left.translate(-0.15, 0.003, 0.03)
      const right = onDesk(surface(0.26, 0.34, 0.5, 0, 1, 1))
      right.rotateY(-0.05)
      right.translate(0.15, 0.003, 0.03)
      return [
        left,
        right,
        // A lamp arched over the pair, as if someone is comparing them.
        cyl(palette.brass, 0.06, 0.07, 0.02, 0.36, 0.01, -0.17),
        box(palette.brass, 0.018, 0.32, 0.018, 0.36, 0.17, -0.17),
        box(palette.brass, 0.018, 0.018, 0.26, 0.36, 0.33, -0.05),
        cyl(palette.brass, 0.02, 0.075, 0.08, 0.36, 0.3, 0.08),
      ]
    },
  },

  matchedStack: {
    mount: 'floor',
    surface: null,
    build: () => {
      const parts = [box(palette.wood, 1.0, 0.05, 0.5, 0, 0.475, 0.25)]
      for (const [x, z] of [
        [-0.46, 0.04],
        [0.46, 0.04],
        [-0.46, 0.46],
        [0.46, 0.46],
      ]) {
        parts.push(box(palette.woodDark, 0.05, 0.45, 0.05, x, 0.225, z))
      }
      const bands = [palette.sage, palette.ochre, palette.indigo]
      for (let pair = 0; pair < 3; pair += 1) {
        const x = -0.3 + pair * 0.3
        for (const side of [-1, 1]) {
          for (let sheet = 0; sheet < 5; sheet += 1) {
            parts.push(
              box(palette.paper, 0.11, 0.012, 0.15, x + side * 0.07 + (sheet % 2) * 0.006, 0.506 + sheet * 0.014, 0.25),
            )
          }
        }
        // The band across both stacks is what says these two belong together.
        parts.push(box(bands[pair], 0.26, 0.014, 0.03, x, 0.506 + 5 * 0.014, 0.25))
      }
      return parts
    },
  },

  posterBoard: {
    mount: 'wall',
    surface: { kind: 'posters', aspect: boardAspect(1.2, 0.86) },
    build: () => board(palette.wood, 1.2, 0.86, 0.05),
  },

  stampLedger: {
    mount: 'desk',
    surface: { kind: 'ledger', aspect: 0.52 / 0.34 },
    build: () => [
      box(palette.woodDark, 0.56, 0.018, 0.38, -0.08, 0.009, 0),
      box(palette.paper, 0.53, 0.014, 0.35, -0.08, 0.025, 0),
      onDesk(surface(0.52, 0.34)).translate(-0.08, 0.0325, 0),
      box(palette.ink, 0.1, 0.035, 0.07, 0.3, 0.0175, 0.06),
      cyl(palette.woodDark, 0.018, 0.018, 0.05, 0.3, 0.06, 0.06),
      cyl(palette.clay, 0.035, 0.03, 0.05, 0.3, 0.105, 0.06),
      box(palette.indigo, 0.12, 0.015, 0.08, 0.3, 0.0075, -0.1),
    ],
  },

  versionTree: {
    mount: 'wall',
    surface: { kind: 'tree', aspect: boardAspect(1.05, 0.95) },
    build: () => board(palette.paper, 1.05, 0.95, 0.04),
  },

  meterPanel: {
    mount: 'wall',
    surface: { kind: 'meters', aspect: 0.92 / 0.7 },
    build: () => [
      box(palette.kerb, 1.0, 0.78, 0.12, 0, 0, 0.06),
      surface(0.92, 0.7).translate(0, 0, 0.122),
      // Conduit running down to the floor, so the panel is visibly wired in.
      box(palette.kerb, 0.06, 0.5, 0.06, 0.35, -0.64, 0.05),
    ],
  },

  applianceCluster: {
    mount: 'floor',
    surface: null,
    build: () => {
      const porthole = new CylinderGeometry(0.15, 0.15, 0.02, 20)
      porthole.rotateX(Math.PI / 2)
      porthole.translate(0.32, 0.28, 0.505)
      const glass = new CylinderGeometry(0.11, 0.11, 0.022, 20)
      glass.rotateX(Math.PI / 2)
      glass.translate(0.32, 0.28, 0.51)
      return [
        box(palette.paper, 0.52, 1.28, 0.52, -0.33, 0.64, 0.26),
        box(palette.kerb, 0.5, 0.012, 0.01, -0.33, 0.9, 0.525),
        box(palette.charcoal, 0.025, 0.28, 0.03, -0.12, 0.7, 0.535),
        box(palette.charcoal, 0.025, 0.16, 0.03, -0.12, 1.05, 0.535),
        box(palette.sage, 0.03, 0.03, 0.012, -0.5, 1.15, 0.53),
        box(palette.paper, 0.5, 0.62, 0.5, 0.32, 0.31, 0.25),
        solid(porthole, palette.charcoal),
        solid(glass, palette.indigo),
        box(palette.kerb, 0.44, 0.06, 0.01, 0.32, 0.55, 0.505),
        box(palette.ochre, 0.03, 0.03, 0.012, 0.48, 0.55, 0.51),
        // A plug-in energy monitor sitting on the machine it is measuring.
        box(palette.ochre, 0.14, 0.1, 0.1, 0.3, 0.67, 0.2),
      ]
    },
  },

  bookshelf: {
    mount: 'floor',
    surface: null,
    build: () => {
      const parts = [
        box(palette.wood, 0.04, 1.7, 0.34, -0.58, 0.85, 0.17),
        box(palette.wood, 0.04, 1.7, 0.34, 0.58, 0.85, 0.17),
        box(palette.woodDark, 1.2, 1.7, 0.02, 0, 0.85, 0.01),
      ]
      const shelves = [0.02, 0.42, 0.82, 1.22, 1.68]
      for (const y of shelves) parts.push(box(palette.wood, 1.12, 0.035, 0.32, 0, y, 0.17))

      const random = seeded(7)
      const colours = [...accents(), palette.charcoal, palette.paper]
      for (let shelf = 0; shelf < 4; shelf += 1) {
        let x = -0.54
        while (x < 0.5) {
          const width = 0.04 + random() * 0.035
          const height = 0.24 + random() * 0.1
          if (random() > 0.1) {
            const colour = colours[Math.floor(random() * colours.length)]
            parts.push(box(colour, width, height, 0.26, x + width / 2, shelves[shelf] + 0.0175 + height / 2, 0.18))
          }
          x += width + 0.004
        }
      }
      return parts
    },
  },

  laptopDesk: {
    mount: 'desk',
    surface: { kind: 'laptop', aspect: 0.4 / 0.26 },
    build: () => [
      box(palette.charcoal, 0.44, 0.02, 0.3, 0, 0.01, 0.02),
      box(palette.kerb, 0.38, 0.004, 0.16, 0, 0.022, 0.03),
      ...hinged(
        [box(palette.charcoal, 0.44, 0.3, 0.015, 0, 0.15, 0), surface(0.4, 0.26).translate(0, 0.15, 0.0085)],
        -0.25,
        0.02,
        -0.13,
      ),
      cyl(palette.clay, 0.04, 0.036, 0.09, 0.3, 0.045, 0.08),
      box(palette.clay, 0.015, 0.05, 0.01, 0.345, 0.05, 0.08),
      box(palette.indigo, 0.18, 0.012, 0.24, -0.32, 0.006, 0.05),
    ],
  },

  statsFrames: {
    mount: 'wall',
    surface: { kind: 'stats', aspect: (0.29 * 3) / 0.39 },
    build: () => {
      const parts: BufferGeometry[] = []
      for (let frame = 0; frame < 3; frame += 1) {
        const x = (frame - 1) * 0.4
        parts.push(box(palette.woodDark, 0.34, 0.44, 0.03, x, 0, 0.015))
        parts.push(surface(0.29, 0.39, frame / 3, 0, (frame + 1) / 3, 1).translate(x, 0, 0.031))
      }
      return parts
    },
  },
}

export function kitEntry(object: ExhibitObject): KitEntry {
  return KIT[object]
}

// ---------------------------------------------------------------------------
// Surfaces. Each paints one exhibit's share of a room's atlas, in the true
// proportions of the plane it will be shown on: the room squashes the drawing
// into a square cell, and mapping it onto the plane stretches it back, so a
// dial stays a circle on a wide panel. They are what makes a room say what its
// project is before anyone reads a word of the panel.
// ---------------------------------------------------------------------------

type Painter = (context: CanvasRenderingContext2D, w: number, h: number, labels: readonly string[]) => void

function fill(context: CanvasRenderingContext2D, colour: string, x: number, y: number, w: number, h: number) {
  context.fillStyle = colour
  context.fillRect(x, y, w, h)
}

function rounded(
  context: CanvasRenderingContext2D,
  colour: string,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  context.fillStyle = colour
  context.beginPath()
  context.roundRect(x, y, w, h, radius)
  context.fill()
}

function disc(context: CanvasRenderingContext2D, colour: string, x: number, y: number, radius: number) {
  context.fillStyle = colour
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()
}

// Concentric broken loops: close enough to a fingerprint at this size.
function whorl(context: CanvasRenderingContext2D, x: number, y: number, radius: number, turn: number) {
  context.strokeStyle = palette.ink
  context.lineWidth = Math.max(1.5, radius * 0.05)
  for (let ridge = 1; ridge <= 8; ridge += 1) {
    const r = (ridge / 8) * radius
    context.beginPath()
    context.ellipse(x, y, r * 0.82, r, turn, 0.35 + ridge * 0.07, Math.PI * 2 - 0.25)
    context.stroke()
  }
}

const PAINTERS: Record<SurfaceKind, Painter> = {
  // A grid of spending categories, each with a share-of-budget bar.
  tiles: (context, w, h) => {
    fill(context, palette.paper, 0, 0, w, h)
    const colours = accents()
    const columns = 4
    const rows = 2
    const gap = h * 0.06
    const tileW = (w - gap * (columns + 1)) / columns
    const tileH = (h - gap * (rows + 1)) / rows
    for (let index = 0; index < columns * rows; index += 1) {
      const x = gap + (index % columns) * (tileW + gap)
      const y = gap + Math.floor(index / columns) * (tileH + gap)
      const colour = colours[index % colours.length]
      rounded(context, palette.sand, x, y, tileW, tileH, 6)
      fill(context, colour, x, y, tileW, tileH * 0.26)
      fill(context, palette.kerb, x + tileW * 0.12, y + tileH * 0.64, tileW * 0.76, tileH * 0.1)
      fill(context, colour, x + tileW * 0.12, y + tileH * 0.64, tileW * (0.18 + ((index * 37) % 55) / 100), tileH * 0.1)
    }
  },

  // Monthly bars climbing, the one trend every budgeting tool exists to show.
  bars: (context, w, h) => {
    fill(context, palette.screenBg, 0, 0, w, h)
    context.fillStyle = palette.charcoal
    for (let line = 1; line < 5; line += 1) context.fillRect(w * 0.08, h * (0.12 + line * 0.15), w * 0.84, 1.5)
    const values = [0.3, 0.38, 0.34, 0.52, 0.6, 0.78]
    const slot = (w * 0.8) / values.length
    values.forEach((value, index) => {
      const height = value * h * 0.72
      const colour = index === values.length - 1 ? palette.ochre : palette.sage
      fill(context, colour, w * 0.1 + index * slot + slot * 0.18, h * 0.86 - height, slot * 0.64, height)
    })
    fill(context, palette.kerb, w * 0.08, h * 0.86, w * 0.84, 2)
  },

  // Three columns of cards, most still in flight.
  kanban: (context, w, h) => {
    fill(context, palette.paper, 0, 0, w, h)
    const columns = [palette.clay, palette.ochre, palette.sage]
    const counts = [3, 4, 2]
    const gap = w * 0.035
    const width = (w - gap * 4) / 3
    columns.forEach((colour, column) => {
      const x = gap + column * (width + gap)
      fill(context, palette.kerb, x, h * 0.06, width, h * 0.07)
      for (let card = 0; card < counts[column]; card += 1) {
        const y = h * 0.17 + card * h * 0.2
        rounded(context, colour, x + 4, y, width - 8, h * 0.16, 5)
        fill(context, palette.paper, x + 12, y + h * 0.045, width * 0.55, h * 0.022)
        fill(context, palette.paper, x + 12, y + h * 0.09, width * 0.35, h * 0.022)
      }
    })
  },

  // Notices pinned over older notices: the layered history of a decision.
  posters: (context, w, h) => {
    fill(context, palette.wood, 0, 0, w, h)
    const sheets = [
      { colour: palette.sand, x: 0.08, y: 0.1, w: 0.38, h: 0.52, turn: -0.07 },
      { colour: palette.paper, x: 0.42, y: 0.07, w: 0.4, h: 0.44, turn: 0.05 },
      { colour: palette.ochre, x: 0.14, y: 0.48, w: 0.34, h: 0.42, turn: 0.05 },
      { colour: palette.paper, x: 0.5, y: 0.44, w: 0.4, h: 0.46, turn: -0.04 },
    ]
    for (const sheet of sheets) {
      context.save()
      context.translate(w * (sheet.x + sheet.w / 2), h * (sheet.y + sheet.h / 2))
      context.rotate(sheet.turn)
      const sw = w * sheet.w
      const sh = h * sheet.h
      fill(context, sheet.colour, -sw / 2, -sh / 2, sw, sh)
      context.fillStyle = palette.kerb
      for (let line = 0; line < 5; line += 1) {
        context.fillRect(-sw / 2 + sw * 0.1, -sh / 2 + sh * (0.2 + line * 0.13), sw * (0.72 - line * 0.06), sh * 0.04)
      }
      disc(context, palette.clay, 0, -sh / 2 + 7, 5)
      context.restore()
    }
  },

  // A trunk with branches forking off and merging back: revision history.
  tree: (context, w, h) => {
    fill(context, palette.paper, 0, 0, w, h)
    context.lineWidth = Math.max(3, h * 0.02)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    const trunkX = w * 0.26
    context.strokeStyle = palette.ink
    context.beginPath()
    context.moveTo(trunkX, h * 0.08)
    context.lineTo(trunkX, h * 0.92)
    context.stroke()

    const branches = [
      { from: 0.2, to: 0.48, x: 0.56, colour: palette.indigo },
      { from: 0.38, to: 0.72, x: 0.8, colour: palette.plum },
      { from: 0.62, to: 0.86, x: 0.56, colour: palette.sage },
    ]
    for (const branch of branches) {
      context.strokeStyle = branch.colour
      context.beginPath()
      context.moveTo(trunkX, h * branch.from)
      context.lineTo(w * branch.x, h * (branch.from + 0.07))
      context.lineTo(w * branch.x, h * (branch.to - 0.07))
      context.lineTo(trunkX, h * branch.to)
      context.stroke()
      disc(context, branch.colour, w * branch.x, h * ((branch.from + branch.to) / 2), h * 0.035)
    }
    for (let node = 0; node < 6; node += 1) disc(context, palette.ink, trunkX, h * (0.1 + node * 0.16), h * 0.03)
  },

  // Four dials and a readout.
  meters: (context, w, h) => {
    fill(context, palette.charcoal, 0, 0, w, h)
    const readings = [0.3, 0.72, 0.5, 0.88]
    const radius = Math.min(w, h) * 0.17
    readings.forEach((reading, index) => {
      const cx = w * (0.28 + (index % 2) * 0.44)
      const cy = h * (0.27 + Math.floor(index / 2) * 0.38)
      disc(context, palette.paper, cx, cy, radius)
      context.lineWidth = radius * 0.16
      context.strokeStyle = reading > 0.8 ? palette.clay : palette.sage
      context.beginPath()
      context.arc(cx, cy, radius * 0.76, Math.PI * 0.8, Math.PI * (0.8 + reading * 1.4))
      context.stroke()
      const angle = Math.PI * (0.8 + reading * 1.4)
      context.lineWidth = radius * 0.08
      context.strokeStyle = palette.ink
      context.beginPath()
      context.moveTo(cx, cy)
      context.lineTo(cx + Math.cos(angle) * radius * 0.7, cy + Math.sin(angle) * radius * 0.7)
      context.stroke()
    })
    fill(context, palette.screenBg, w * 0.12, h * 0.85, w * 0.76, h * 0.09)
    fill(context, palette.ochre, w * 0.16, h * 0.88, w * 0.42, h * 0.03)
  },

  // Load through the day, with the evening peak marked.
  line: (context, w, h) => {
    fill(context, palette.screenBg, 0, 0, w, h)
    const points = [0.3, 0.26, 0.34, 0.48, 0.42, 0.56, 0.8, 0.7, 0.44]
    const x = (index: number) => w * (0.08 + (index / (points.length - 1)) * 0.84)
    const y = (value: number) => h * (0.86 - value * 0.72)
    context.fillStyle = palette.indigo
    context.beginPath()
    context.moveTo(x(0), h * 0.86)
    points.forEach((value, index) => context.lineTo(x(index), y(value)))
    context.lineTo(x(points.length - 1), h * 0.86)
    context.fill()
    context.strokeStyle = palette.windowLit
    context.lineWidth = Math.max(3, h * 0.025)
    context.lineJoin = 'round'
    context.beginPath()
    points.forEach((value, index) => (index === 0 ? context.moveTo(x(index), y(value)) : context.lineTo(x(index), y(value))))
    context.stroke()
    fill(context, palette.ochre, x(6) - 2, h * 0.1, 4, h * 0.76)
  },

  // Three framed figures. The values are data, never baked into the kit.
  stats: (context, w, h, labels) => {
    const third = w / 3
    for (let frame = 0; frame < 3; frame += 1) {
      const [value = '', caption = ''] = (labels[frame] ?? '').split('|')
      const cx = frame * third + third / 2
      fill(context, palette.paper, frame * third, 0, third, h)
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = palette.ink
      context.font = `700 ${Math.round(h * 0.2)}px Inter, sans-serif`
      context.fillText(value, cx, h * 0.4, third * 0.84)
      context.fillStyle = palette.charcoal
      context.font = `500 ${Math.round(h * 0.07)}px Inter, sans-serif`
      context.fillText(caption, cx, h * 0.62, third * 0.84)
      fill(context, palette.clay, cx - third * 0.18, h * 0.74, third * 0.36, h * 0.02)
    }
  },

  // Two prints, one per sheet, each ticked as a match.
  prints: (context, w, h) => {
    const half = w / 2
    for (let sheet = 0; sheet < 2; sheet += 1) {
      const left = sheet * half
      fill(context, palette.paper, left, 0, half, h)
      whorl(context, left + half / 2, h * 0.4, Math.min(half, h) * 0.3, 0.15 + sheet * 0.08)
      fill(context, palette.kerb, left + half * 0.15, h * 0.78, half * 0.5, h * 0.03)
      context.strokeStyle = palette.sage
      context.lineWidth = Math.max(4, h * 0.03)
      context.lineCap = 'round'
      context.beginPath()
      context.moveTo(left + half * 0.7, h * 0.86)
      context.lineTo(left + half * 0.77, h * 0.92)
      context.lineTo(left + half * 0.9, h * 0.8)
      context.stroke()
    }
  },

  // Ruled pages with a stamp across the latest entry.
  ledger: (context, w, h) => {
    fill(context, palette.paper, 0, 0, w, h)
    fill(context, palette.kerb, w / 2 - 1, 0, 2, h)
    context.fillStyle = palette.kerb
    for (let line = 0; line < 10; line += 1) {
      const y = h * (0.1 + line * 0.08)
      context.fillRect(w * 0.05, y, w * 0.4, 1.5)
      context.fillRect(w * 0.55, y, w * 0.4, 1.5)
    }
    context.fillStyle = palette.charcoal
    for (let entry = 0; entry < 7; entry += 1) {
      context.fillRect(w * 0.06, h * (0.07 + entry * 0.08), w * (0.16 + ((entry * 13) % 17) / 100), h * 0.022)
    }
    context.strokeStyle = palette.clay
    context.lineWidth = Math.max(4, h * 0.03)
    const radius = h * 0.16
    context.beginPath()
    context.arc(w * 0.74, h * 0.55, radius, 0, Math.PI * 2)
    context.stroke()
    fill(context, palette.clay, w * 0.74 - radius * 0.7, h * 0.55 - h * 0.018, radius * 1.4, h * 0.036)
  },

  // A profile page open on the screen.
  laptop: (context, w, h) => {
    fill(context, palette.paper, 0, 0, w, h)
    fill(context, palette.ink, 0, 0, w, h * 0.1)
    disc(context, palette.sage, w * 0.2, h * 0.34, h * 0.14)
    fill(context, palette.ink, w * 0.36, h * 0.24, w * 0.46, h * 0.06)
    fill(context, palette.kerb, w * 0.36, h * 0.36, w * 0.32, h * 0.05)
    const colours = [palette.clay, palette.indigo, palette.ochre]
    colours.forEach((colour, block) => {
      rounded(context, colour, w * (0.08 + block * 0.3), h * 0.58, w * 0.26, h * 0.3, 6)
    })
  },

  // A document under the glass, with the scan line partway down it.
  scan: (context, w, h) => {
    fill(context, palette.screenBg, 0, 0, w, h)
    fill(context, palette.paper, w * 0.28, h * 0.1, w * 0.44, h * 0.8)
    whorl(context, w / 2, h * 0.42, h * 0.2, 0.1)
    fill(context, palette.windowLit, 0, h * 0.62, w, h * 0.04)
    fill(context, palette.sage, 0, h * 0.6, w, h * 0.015)
  },
}

// Paints into a square region of a canvas, drawing at the surface's own aspect
// so that the plane it lands on stretches it back into proportion.
export function paintSurface(
  context: CanvasRenderingContext2D,
  kind: SurfaceKind,
  size: number,
  aspect: number,
  labels: readonly string[],
) {
  const w = size * aspect
  const h = size
  context.save()
  context.scale(1 / aspect, 1)
  context.beginPath()
  context.rect(0, 0, w, h)
  context.clip()
  PAINTERS[kind](context, w, h, labels)
  context.restore()
}
