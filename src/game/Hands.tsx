import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Placeholder first-person hands — nicer than before: a sleeved forearm, a palm,
// and four little fingers + a thumb per hand, with a gentle idle sway. (A real
// rigged girl's hands are still a dedicated later step.)
const SKIN = '#f3c6a0'
const SLEEVE = '#c85c8e' // pink sleeve so she reads as a girl

function Finger({ x, len, rot = 0 }: { x: number; len: number; rot?: number }) {
  return (
    <mesh castShadow position={[x, 0, -len / 2]} rotation={[rot, 0, 0]}>
      <capsuleGeometry args={[0.018, len, 4, 8]} />
      <meshStandardMaterial color={SKIN} roughness={0.7} />
    </mesh>
  )
}

function Hand({ side }: { side: 1 | -1 }) {
  return (
    <group
      position={[0.19 * side, -0.2, -0.5]}
      rotation={[-0.85, 0.12 * side, 0.1 * side]}
    >
      {/* sleeve cuff */}
      <mesh castShadow position={[0, 0, 0.24]}>
        <cylinderGeometry args={[0.062, 0.07, 0.16, 14]} />
        <meshStandardMaterial color={SLEEVE} roughness={0.85} />
      </mesh>
      {/* forearm */}
      <mesh castShadow position={[0, 0, 0.12]}>
        <capsuleGeometry args={[0.05, 0.22, 6, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
      {/* palm */}
      <mesh castShadow position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.09, 0.11, 0.045]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
      {/* four fingers */}
      <group position={[0, 0.005, -0.1]} rotation={[0.25, 0, 0]}>
        <Finger x={-0.032} len={0.075} />
        <Finger x={-0.011} len={0.085} />
        <Finger x={0.011} len={0.082} />
        <Finger x={0.032} len={0.07} />
      </group>
      {/* thumb */}
      <mesh
        castShadow
        position={[0.05 * side, 0.01, -0.05]}
        rotation={[0.4, 0, -0.7 * side]}
      >
        <capsuleGeometry args={[0.02, 0.05, 4, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
    </group>
  )
}

export function Hands() {
  const ref = useRef<THREE.Group>(null)
  const sway = useRef<THREE.Group>(null)
  const { camera } = useThree()

  useFrame((state) => {
    const g = ref.current
    if (!g) return
    g.position.copy(camera.position)
    g.quaternion.copy(camera.quaternion)
    // gentle breathing / walking sway on the inner group
    if (sway.current) {
      const t = state.clock.elapsedTime
      sway.current.position.y = Math.sin(t * 1.6) * 0.008
      sway.current.rotation.z = Math.sin(t * 0.8) * 0.02
    }
  })

  return (
    <group ref={ref} renderOrder={10}>
      <group ref={sway}>
        <Hand side={1} />
        <Hand side={-1} />
      </group>
    </group>
  )
}
