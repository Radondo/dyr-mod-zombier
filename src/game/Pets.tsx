import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Model, ModelKey } from './models'
import { wallet } from './wallet'

const SIZE: Record<string, number> = { cat: 0.5, dog: 0.75, cow: 1.4 }

// One bought animal that trails the player on the ground, like a real pet.
function Follower({ kind, index }: { kind: ModelKey; index: number }) {
  const ref = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const target = useMemo(() => new THREE.Vector3(), [])
  // Spread the pets out around/behind the player.
  const angle = 2.4 + index * 1.35
  const radius = 1.8 + index * 0.6

  useFrame((state) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    target.set(
      camera.position.x + Math.cos(angle) * radius,
      0,
      camera.position.z + Math.sin(angle) * radius + 1.2,
    )
    const ox = g.position.x
    const oz = g.position.z
    g.position.lerp(target, 0.05)
    g.position.y = Math.abs(Math.sin(t * 4 + index)) * 0.05
    const mvx = g.position.x - ox
    const mvz = g.position.z - oz
    if (mvx * mvx + mvz * mvz > 1e-6) g.rotation.y = Math.atan2(mvx, mvz)
  })

  return (
    <group ref={ref} position={[0, 0, 6]}>
      <Model kind={kind} targetHeight={SIZE[kind] ?? 0.6} />
    </group>
  )
}

/** Renders every animal the player has bought (wallet.pets), each following. */
export function Pets() {
  const countRef = useRef(0)
  const [pets, setPets] = useState<ModelKey[]>([])

  useEffect(() => {
    let raf = 0
    const tick = () => {
      if (wallet.pets.length !== countRef.current) {
        countRef.current = wallet.pets.length
        setPets([...wallet.pets] as ModelKey[])
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <group>
      {pets.map((k, i) => (
        <Follower key={i} kind={k} index={i} />
      ))}
    </group>
  )
}
