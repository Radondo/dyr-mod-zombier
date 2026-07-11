import { GARDEN_HALF } from './constants'

// Shared world layout: the gate opening, the fence collision segments (with the
// gate gap carved out), and the 10-house village — plus all the wall segments
// the player collides against. Kept as plain data so both the renderers
// (World/Village/Gate) and the Player's collision loop read the same source.

export type Seg = { a: [number, number]; b: [number, number] }

// ---- Gate: a wide, obvious opening in the +z fence side ---------------------
export const GATE_CENTER_X = 0
export const GATE_HALF = 3.2 // opening half-width (≈6.4 m wide)
export const GATE_POST_H = 3.4 // tall gate posts / where the FARLIGT sign sits
export const GATE_Z = GARDEN_HALF // the +z fence line

// ---- Village houses ---------------------------------------------------------
export const HOUSE_HALF = 3.0 // half-width of a house (6 m square)
export const HOUSE_HEIGHT = 7 // wall height — tall (roughly double a normal house)
export const HOUSE_WALL_T = 0.28
export const HOUSE_DOOR_HALF = 1.0

export type HouseDef = {
  pos: [number, number, number]
  rotY: number // 0 → door faces +z
  half: number // per-house half-width (varied, for a real-town feel)
  height: number
  shop: boolean
  wall: string
  roof: string
}

const WALLS = ['#e9dcc0', '#dcc9a6', '#d3bf9a', '#e3d3b0', '#cdb998', '#c9b58e']
const ROOFS = ['#6e3b2f', '#7a4b34', '#5f4a3a', '#764033', '#684236', '#4f3b2c']

function makeRng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// An organic little town: houses of varied size, facing different ways, scattered
// (not a tidy grid). The SHOP sits front-and-centre so its BUTIK sign is visible
// the moment you start (you spawn near the gate looking down into the town).
export const HOUSES: HouseDef[] = (() => {
  const rng = makeRng(2027)
  const list: HouseDef[] = [
    {
      pos: [-5, 0, -3],
      rotY: 0, // door + BUTIK sign face +z, toward the player's start
      half: 3.5,
      height: 8,
      shop: true,
      wall: '#e6d3a8',
      roof: '#8a3a2a',
    },
  ]
  let guard = 0
  while (list.length < 10 && guard++ < 4000) {
    const half = 2.3 + rng() * 1.3
    const x = (rng() * 2 - 1) * (GARDEN_HALF - half - 2)
    const z = -6 - rng() * (GARDEN_HALF - half - 9) // roughly -6 .. -(fence-9)
    const rotY = rng() * Math.PI * 2
    const tooClose = list.some(
      (h) => Math.hypot(x - h.pos[0], z - h.pos[2]) < half + h.half + 2.5,
    )
    if (tooClose) continue
    list.push({
      pos: [x, 0, z],
      rotY,
      half,
      height: 5 + rng() * 3.5,
      shop: false,
      wall: WALLS[list.length % WALLS.length],
      roof: ROOFS[list.length % ROOFS.length],
    })
  }
  return list
})()

// Rotate a local point about a house centre into world space, matching three's
// Y-rotation convention (so collision lines up with the rendered house).
function toWorld(cx: number, cz: number, x: number, z: number, rot: number): [number, number] {
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  return [cx + x * c + z * s, cz - x * s + z * c]
}

// The 5 collision segments of one house: solid walls with a gap where the door
// is (so you can walk inside, just like the earlier cottage door).
export function houseWalls(def: HouseDef): Seg[] {
  const [cx, , cz] = def.pos
  const h = def.half
  const d = HOUSE_DOOR_HALF
  const r = def.rotY
  const P = (x: number, z: number) => toWorld(cx, cz, x, z, r)
  return [
    { a: P(-h, -h), b: P(h, -h) }, // back
    { a: P(-h, -h), b: P(-h, h) }, // left
    { a: P(h, -h), b: P(h, h) }, // right
    { a: P(-h, h), b: P(-d, h) }, // front, left of door
    { a: P(d, h), b: P(h, h) }, // front, right of door
  ]
}

// ---- Fence perimeter as collision segments, with the gate gap on +z ---------
export const FENCE_SEGMENTS: Seg[] = [
  { a: [-GARDEN_HALF, -GARDEN_HALF], b: [GARDEN_HALF, -GARDEN_HALF] }, // back (-z)
  { a: [-GARDEN_HALF, -GARDEN_HALF], b: [-GARDEN_HALF, GARDEN_HALF] }, // left (-x)
  { a: [GARDEN_HALF, -GARDEN_HALF], b: [GARDEN_HALF, GARDEN_HALF] }, // right (+x)
  { a: [-GARDEN_HALF, GARDEN_HALF], b: [GATE_CENTER_X - GATE_HALF, GARDEN_HALF] }, // +z left of gate
  { a: [GATE_CENTER_X + GATE_HALF, GARDEN_HALF], b: [GARDEN_HALF, GARDEN_HALF] }, // +z right of gate
]

// Everything the player bumps into: fence perimeter + every house's walls.
export const WALL_SEGMENTS: Seg[] = [
  ...FENCE_SEGMENTS,
  ...HOUSES.flatMap(houseWalls),
]
