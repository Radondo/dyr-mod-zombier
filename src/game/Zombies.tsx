import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Model } from './models'
import { player } from './playerState'
import {
  GARDEN_HALF,
  ZOMBIE_COUNT,
  ZOMBIE_HEIGHT,
  ZOMBIE_SPEED,
  ZOMBIE_CHASE_SPEED,
  ZOMBIE_AGGRO,
  ZOMBIE_OFFSET_MIN,
  ZOMBIE_OFFSET_MAX,
  CATCH_DISTANCE,
} from './constants'
import { triggerCaught } from './gameState'

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

// Point at arc-length `s` around the perimeter of a square of half-size R.
// Since R > GARDEN_HALF, this ring is always OUTSIDE the fence.
function rectPerimeter(R: number, s: number, out: THREE.Vector2) {
  const side = 2 * R
  const perim = 4 * side
  let u = s % perim
  if (u < 0) u += perim
  const seg = Math.floor(u / side)
  const f = (u - seg * side) / side
  const c = -R + f * side
  if (seg === 0) out.set(c, -R)
  else if (seg === 1) out.set(R, c)
  else if (seg === 2) out.set(-c, R)
  else out.set(-R, -c)
  return out
}

type ZombieState = {
  x: number
  z: number
  s: number
  R: number
  dir: number
  speed: number
  phase: number
  heading: number
}

export function Zombies() {
  const zombies = useMemo<ZombieState[]>(() => {
    const rng = makeRng(99)
    return Array.from({ length: ZOMBIE_COUNT }, () => {
      const R = GARDEN_HALF + ZOMBIE_OFFSET_MIN + rng() * (ZOMBIE_OFFSET_MAX - ZOMBIE_OFFSET_MIN)
      const s = rng() * 1000
      const p = rectPerimeter(R, s, new THREE.Vector2())
      return { x: p.x, z: p.y, s, R, dir: rng() < 0.5 ? 1 : -1, speed: 0.6 + rng() * 0.8, phase: rng() * Math.PI * 2, heading: 0 }
    })
  }, [])

  const refs = useRef<(THREE.Group | null)[]>([])
  const target = useMemo(() => new THREE.Vector2(), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const px = player.pos.x
    const pz = player.pos.z
    const bound = GARDEN_HALF + 0.5
    // The player is "outside" (in the graveyard) when past the fence square.
    const outside = Math.abs(px) > GARDEN_HALF + 0.1 || Math.abs(pz) > GARDEN_HALF + 0.1

    for (let i = 0; i < zombies.length; i++) {
      const z = zombies[i]
      const g = refs.current[i]
      const dxp = px - z.x
      const dzp = pz - z.z
      const distToPlayer = Math.hypot(dxp, dzp)

      const hunting = outside && distToPlayer < ZOMBIE_AGGRO
      const oldX = z.x
      const oldZ = z.z

      if (hunting) {
        // Chase the player, but never step inside the fence.
        if (distToPlayer > 0.001) {
          z.x += (dxp / distToPlayer) * ZOMBIE_CHASE_SPEED * delta
          z.z += (dzp / distToPlayer) * ZOMBIE_CHASE_SPEED * delta
        }
        if (Math.abs(z.x) < bound && Math.abs(z.z) < bound) {
          if (Math.abs(z.x) >= Math.abs(z.z)) z.x = Math.sign(z.x || 1) * bound
          else z.z = Math.sign(z.z || 1) * bound
        }
        // Caught!
        if (distToPlayer < CATCH_DISTANCE) {
          triggerCaught()
          player.pos.set(0, 0, GARDEN_HALF - 4)
        }
      } else {
        // Patrol the perimeter ring, easing back onto it after any chase.
        z.s += z.dir * ZOMBIE_SPEED * z.speed * delta
        rectPerimeter(z.R, z.s, target)
        const step = ZOMBIE_SPEED * z.speed * 3 * delta
        const tx = target.x - z.x
        const tz = target.y - z.z
        const td = Math.hypot(tx, tz)
        if (td > step && td > 0.0001) {
          z.x += (tx / td) * step
          z.z += (tz / td) * step
        } else {
          z.x = target.x
          z.z = target.y
        }
      }

      if (g) {
        const mvx = z.x - oldX
        const mvz = z.z - oldZ
        if (mvx * mvx + mvz * mvz > 1e-6) z.heading = Math.atan2(mvx, mvz)
        g.position.set(z.x, Math.abs(Math.sin(t * 3 + z.phase)) * 0.06, z.z)
        g.rotation.y = z.heading + Math.sin(t * 2 + z.phase) * 0.1
      }
    }
  })

  return (
    <group>
      {zombies.map((_, i) => (
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
