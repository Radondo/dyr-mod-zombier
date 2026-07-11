import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { addGold } from './wallet'
import { GARDEN_HALF, WALL_MARGIN } from './constants'
import { HOUSES, HOUSE_HALF } from './layout'

const COIN_COUNT = 14
const COIN_VALUE = 5
const PICKUP_RADIUS = 1.4
const COIN_Y = 0.7

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

// True if (x,z) sits inside (or right next to) any village house.
function insideAnyHouse(x: number, z: number) {
  return HOUSES.some(
    (h) => Math.abs(x - h.pos[0]) < HOUSE_HALF + 1 && Math.abs(z - h.pos[2]) < HOUSE_HALF + 1,
  )
}

// Scatter coins across the garden, avoiding the village houses.
function gardenCoinSpots() {
  const rng = makeRng(7)
  const spots: [number, number, number][] = []
  const limit = GARDEN_HALF - WALL_MARGIN - 1
  let guard = 0
  while (spots.length < COIN_COUNT && guard++ < 500) {
    const x = (rng() * 2 - 1) * limit
    const z = (rng() * 2 - 1) * limit
    if (insideAnyHouse(x, z)) continue
    spots.push([x, COIN_Y, z])
  }
  return spots
}

/**
 * Spinning gold coins the player picks up by walking near them. Reusable for the
 * garden (default) or, later, the dangerous graveyard by passing custom spots.
 */
export function Coins({ spots }: { spots?: [number, number, number][] }) {
  const positions = useMemo(() => spots ?? gardenCoinSpots(), [spots])
  const refs = useRef<(THREE.Group | null)[]>([])
  const collected = useRef<boolean[]>(positions.map(() => false))
  const { camera } = useThree()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < positions.length; i++) {
      if (collected.current[i]) continue
      const g = refs.current[i]
      if (!g) continue
      g.rotation.y = t * 2 + i
      g.position.y = COIN_Y + Math.sin(t * 2 + i) * 0.12
      const dx = camera.position.x - positions[i][0]
      const dz = camera.position.z - positions[i][2]
      if (dx * dx + dz * dz < PICKUP_RADIUS * PICKUP_RADIUS) {
        collected.current[i] = true
        g.visible = false
        addGold(COIN_VALUE)
      }
    }
  })

  return (
    <group>
      {positions.map((p, i) => (
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
