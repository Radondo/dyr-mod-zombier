import { useMemo } from 'react'
import { Model, GRAVE_KEYS } from './models'
import {
  GARDEN_HALF,
  GRAVE_COUNT,
  DEAD_TREE_COUNT,
  GRAVEYARD_BAND_MIN,
  GRAVEYARD_BAND_MAX,
} from './constants'

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

// A point on the perimeter of a square of half-size R (f in 0..1). Because R is
// always > GARDEN_HALF, everything placed this way sits OUTSIDE the fence.
function rectPoint(R: number, f: number): [number, number, number] {
  const side = 2 * R
  const u = f * 4 * side
  const seg = Math.floor(u / side) % 4
  const c = -R + (u - seg * side) / side * side
  if (seg === 0) return [c, 0, -R]
  if (seg === 1) return [R, 0, c]
  if (seg === 2) return [-c, 0, R]
  return [-R, 0, -c]
}

export function Graveyard() {
  const { graves, deadTrees } = useMemo(() => {
    const rng = makeRng(2024)

    const graves = Array.from({ length: GRAVE_COUNT }, () => {
      const R = GRAVEYARD_BAND_MIN + rng() * (GRAVEYARD_BAND_MAX - GRAVEYARD_BAND_MIN)
      const kind = GRAVE_KEYS[Math.floor(rng() * GRAVE_KEYS.length)]
      const height = kind === 'cross' ? 1.1 + rng() * 0.4 : 0.7 + rng() * 0.4
      return {
        kind,
        height,
        pos: rectPoint(R, rng()),
        rotY: rng() * Math.PI * 2,
        tilt: (rng() - 0.5) * 0.18, // leaning, spooky
      }
    })

    const deadTrees = Array.from({ length: DEAD_TREE_COUNT }, () => {
      const R = GARDEN_HALF + 2 + rng() * 7
      return {
        height: 4 + rng() * 2.5,
        pos: rectPoint(R, rng()),
        rotY: rng() * Math.PI * 2,
      }
    })

    return { graves, deadTrees }
  }, [])

  return (
    <group>
      {graves.map((g, i) => (
        <Model
          key={`g${i}`}
          kind={g.kind}
          targetHeight={g.height}
          position={g.pos}
          rotation={[g.tilt, g.rotY, g.tilt]}
        />
      ))}
      {deadTrees.map((d, i) => (
        <Model
          key={`d${i}`}
          kind="deadtree"
          targetHeight={d.height}
          position={d.pos}
          rotation={[0, d.rotY, 0]}
        />
      ))}
    </group>
  )
}
