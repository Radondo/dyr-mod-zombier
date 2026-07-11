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
  rotY: number // 0 → door faces +z; PI → door faces -z
  shop: boolean
  wall: string
  roof: string
}

const WALLS = ['#e9dcc0', '#dcc9a6', '#d3bf9a', '#e3d3b0', '#cdb998']
const ROOFS = ['#6e3b2f', '#7a4b34', '#5f4a3a', '#764033', '#684236']

// Two rows of five houses facing a central street (running along x). The shop is
// the middle house of the back row, so you see its BUTIK sign down the street.
export const HOUSES: HouseDef[] = (() => {
  const xs = [-18, -9, 0, 9, 18]
  const list: HouseDef[] = []
  xs.forEach((x, i) => {
    // back row (z = -18), doors face the street (+z)
    list.push({
      pos: [x, 0, -18],
      rotY: 0,
      shop: x === 0,
      wall: WALLS[i % WALLS.length],
      roof: ROOFS[i % ROOFS.length],
    })
    // front row (z = -8), doors face the street (-z)
    list.push({
      pos: [x, 0, -8],
      rotY: Math.PI,
      shop: false,
      wall: WALLS[(i + 2) % WALLS.length],
      roof: ROOFS[(i + 1) % ROOFS.length],
    })
  })
  return list
})()

// Rotate a local point (only 0 or PI here) about a house centre, to world space.
function toWorld(cx: number, cz: number, x: number, z: number, rotY: number): [number, number] {
  if (rotY === 0) return [cx + x, cz + z]
  return [cx - x, cz - z] // PI
}

// The 5 collision segments of one house: solid walls with a gap where the door
// is (so you can walk inside, just like the earlier cottage door).
export function houseWalls(def: HouseDef): Seg[] {
  const [cx, , cz] = def.pos
  const h = HOUSE_HALF
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
