import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Model } from './models'
import {
  GARDEN_HALF,
  ZOMBIE_COUNT,
  ZOMBIE_HEIGHT,
  ZOMBIE_SPEED,
  ZOMBIE_OFFSET_MIN,
  ZOMBIE_OFFSET_MAX,
} from './constants'

// Small seeded RNG (mulberry32) for a stable zombie layout.
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

// Point at arc-length `s` around the perimeter of a square of half-size R,
// centred on the origin. Because R > GARDEN_HALF, this path is ALWAYS outside
// the (square) fence — zombies can never enter the garden.
function rectPerimeter(R: number, s: number, out: THREE.Vector2) {
  const side = 2 * R
  const perim = 4 * side
  let u = s % perim
  if (u < 0) u += perim
  const seg = Math.floor(u / side)
  const f = (u - seg * side) / side // 0..1 along this side
  const c = -R + f * side
  if (seg === 0) out.set(c, -R) // bottom
  else if (seg === 1) out.set(R, c) // right
  else if (seg === 2) out.set(-c, R) // top (reverse for CCW)
  else out.set(-R, -c) // left
  return out
}

export function Zombies() {
  const layout = useMemo(() => {
    const rng = makeRng(99)
    return Array.from({ length: ZOMBIE_COUNT }, () => ({
      R: GARDEN_HALF + ZOMBIE_OFFSET_MIN + rng() * (ZOMBIE_OFFSET_MAX - ZOMBIE_OFFSET_MIN),
      s0: rng() * 1000,
      dir: rng() < 0.5 ? 1 : -1,
      speed: 0.6 + rng() * 0.8,
      phase: rng() * Math.PI * 2,
    }))
  }, [])

  const refs = useRef<(THREE.Group | null)[]>([])
  const p = useMemo(() => new THREE.Vector2(), [])
  const ahead = useMemo(() => new THREE.Vector2(), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < layout.length; i++) {
      const g = refs.current[i]
      const z = layout[i]
      if (!g) continue
      const s = z.s0 + z.dir * ZOMBIE_SPEED * z.speed * t
      rectPerimeter(z.R, s, p)
      rectPerimeter(z.R, s + z.dir * 0.1, ahead) // small step ahead → heading
      g.position.set(p.x, Math.abs(Math.sin(t * 3 + z.phase)) * 0.06, p.y)
      g.rotation.y = Math.atan2(ahead.x - p.x, ahead.y - p.y) + Math.sin(t * 2 + z.phase) * 0.12
    }
  })

  return (
    <group>
      {layout.map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          <Model kind="zombie" targetHeight={ZOMBIE_HEIGHT} />
        </group>
      ))}
    </group>
  )
}
