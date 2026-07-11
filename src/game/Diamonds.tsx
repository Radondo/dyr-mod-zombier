import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { addGold } from './wallet'
import { gardenCoinSpot, graveyardCoinSpot } from './Coins'

const DIAMOND_VALUE = 100
const PICKUP_RADIUS = 1.7
const DIAMOND_Y = 1.0
const RESPAWN_MIN = 12
const RESPAWN_MAX = 26

type Zone = 'garden' | 'graveyard'

function spotFor(zone: Zone): [number, number, number] {
  return zone === 'garden' ? gardenCoinSpot() : graveyardCoinSpot()
}

/**
 * Shiny blue diamonds worth 100 gold. `zone` picks where they live — inside the
 * garden (safe) or out among the zombies. Each one respawns at a fresh spot in
 * its zone a while after it's collected.
 */
export function Diamonds({ count, zone }: { count: number; zone: Zone }) {
  const positions = useRef<[number, number, number][]>(
    Array.from({ length: count }, () => spotFor(zone)),
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
        if (t >= respawnAt.current[i]) {
          const s = spotFor(zone)
          positions.current[i] = s
          g.position.set(s[0], DIAMOND_Y, s[2])
          g.visible = true
          collected.current[i] = false
        }
        continue
      }

      const p = positions.current[i]
      g.rotation.y = t * 1.5 + i
      g.position.y = DIAMOND_Y + Math.sin(t * 1.8 + i) * 0.18
      const dx = camera.position.x - p[0]
      const dz = camera.position.z - p[2]
      if (dx * dx + dz * dz < PICKUP_RADIUS * PICKUP_RADIUS) {
        collected.current[i] = true
        g.visible = false
        addGold(DIAMOND_VALUE)
        respawnAt.current[i] = t + RESPAWN_MIN + Math.random() * (RESPAWN_MAX - RESPAWN_MIN)
      }
    }
  })

  return (
    <group>
      {positions.current.map((p, i) => (
        <group
          key={i}
          position={[p[0], DIAMOND_Y, p[2]]}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          <mesh castShadow>
            <octahedronGeometry args={[0.45]} />
            <meshStandardMaterial
              color="#39c0ff"
              emissive="#0a6fb0"
              emissiveIntensity={0.6}
              metalness={0.6}
              roughness={0.15}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
