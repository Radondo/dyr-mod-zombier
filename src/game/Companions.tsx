import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Model } from './models'
import {
  BEE_HEIGHT,
  LADYBUG_SIZE,
  COMPANION_FOLLOW,
  COMPANION_ALTITUDE,
  GARDEN_HALF,
  WALL_MARGIN,
} from './constants'

type CompanionProps = {
  kind: 'bee' | 'ladybug'
  size: number
  side: 1 | -1
  buzz: number // how lively the little circular motion is
  freq: number // bob speed
}

function Companion({ kind, size, side, buzz, freq }: CompanionProps) {
  const ref = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const target = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    const limit = GARDEN_HALF - WALL_MARGIN

    // Hover to one side of the player, with a little buzzing circle + bob.
    const x = camera.position.x + side * 1.2 + Math.cos(t * buzz) * 0.35
    const z = camera.position.z + 0.9 + Math.sin(t * buzz * 0.9) * 0.35
    const y = COMPANION_ALTITUDE + Math.sin(t * freq) * 0.18

    target.set(
      THREE.MathUtils.clamp(x, -limit, limit),
      y,
      THREE.MathUtils.clamp(z, -limit, limit),
    )
    g.position.lerp(target, COMPANION_FOLLOW)

    // Gently face the direction of travel + a slow spin so they read as alive.
    g.rotation.y = Math.sin(t * buzz) * 0.6
  })

  return (
    <group ref={ref} position={[side * 1.2, COMPANION_ALTITUDE, GARDEN_HALF - 2]}>
      <Model kind={kind} targetHeight={size} />
    </group>
  )
}

export function Companions() {
  return (
    <group>
      <Companion kind="bee" size={BEE_HEIGHT} side={-1} buzz={2.2} freq={3.0} />
      <Companion kind="ladybug" size={LADYBUG_SIZE} side={1} buzz={1.2} freq={1.8} />
    </group>
  )
}
