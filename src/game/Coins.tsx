import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { addGold } from './wallet'
import { GARDEN_HALF, WALL_MARGIN } from './constants'
import { HOUSES } from './layout'

const PICKUP_RADIUS = 1.4
const COIN_Y = 0.7

// True if (x,z) sits inside (or right next to) any village house.
function insideAnyHouse(x: number, z: number) {
  return HOUSES.some(
    (h) => Math.abs(x - h.pos[0]) < h.half + 1 && Math.abs(z - h.pos[2]) < h.half + 1,
  )
}

// One random coin spot inside the garden, avoiding the village houses.
export function gardenCoinSpot(): [number, number, number] {
  const limit = GARDEN_HALF - WALL_MARGIN - 1
  for (let guard = 0; guard < 100; guard++) {
    const x = (Math.random() * 2 - 1) * limit
    const z = (Math.random() * 2 - 1) * limit
    if (insideAnyHouse(x, z)) continue
    return [x, COIN_Y, z]
  }
  return [0, COIN_Y, 0]
}

// A point on the perimeter of a square of half-size R (f in 0..1).
function rectPoint(R: number, f: number): [number, number, number] {
  const side = 2 * R
  const u = f * 4 * side
  const seg = Math.floor(u / side) % 4
  const c = -R + (u - seg * side)
  if (seg === 0) return [c, COIN_Y, -R]
  if (seg === 1) return [R, COIN_Y, c]
  if (seg === 2) return [-c, COIN_Y, R]
  return [-R, COIN_Y, -c]
}

// One random dangerous coin spot just outside the fence, among the zombies.
export function graveyardCoinSpot(): [number, number, number] {
  return rectPoint(GARDEN_HALF + 1.8 + Math.random() * 4.5, Math.random())
}

/**
 * Spinning gold coins the player picks up by walking near them. Shared by the
 * garden and the dangerous graveyard: `makeSpot` decides which zone a coin lives
 * in, and (if `respawn` is given) each coin comes back at a fresh spot a little
 * while after it's collected — a steady trickle so there's always something to grab.
 */
export function Coins({
  count,
  value,
  makeSpot,
  respawn,
}: {
  count: number
  value: number
  makeSpot: () => [number, number, number]
  respawn?: { min: number; max: number }
}) {
  const positions = useRef<[number, number, number][]>(
    Array.from({ length: count }, () => makeSpot()),
  )
  const refs = useRef<(THREE.Group | null)[]>([])
  const collected = useRef<boolean[]>(positions.current.map(() => false))
  const respawnAt = useRef<number[]>(positions.current.map(() => 0))
  const { camera } = useThree()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < positions.current.length; i++) {
      const g = refs.current[i]
      if (!g) continue

      if (collected.current[i]) {
        // Waiting to respawn? Bring the coin back at a fresh spot once it's time.
        if (respawn && t >= respawnAt.current[i]) {
          const spot = makeSpot()
          positions.current[i] = spot
          g.position.set(spot[0], COIN_Y, spot[2])
          g.visible = true
          collected.current[i] = false
        }
        continue
      }

      const p = positions.current[i]
      g.rotation.y = t * 2 + i
      g.position.y = COIN_Y + Math.sin(t * 2 + i) * 0.12
      const dx = camera.position.x - p[0]
      const dz = camera.position.z - p[2]
      if (dx * dx + dz * dz < PICKUP_RADIUS * PICKUP_RADIUS) {
        collected.current[i] = true
        g.visible = false
        addGold(value)
        if (respawn) {
          respawnAt.current[i] = t + respawn.min + Math.random() * (respawn.max - respawn.min)
        }
      }
    }
  })

  return (
    <group>
      {positions.current.map((p, i) => (
        <group
          key={i}
          position={p}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          {/* a flat coin standing upright, edge-on gold disc */}
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.07, 20]} />
            <meshStandardMaterial color="#ffd23f" metalness={0.85} roughness={0.3} emissive="#5a3d00" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
