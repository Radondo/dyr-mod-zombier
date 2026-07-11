// A simple, tidy blocky girl (Roblox-ish) built from primitives — an ordinary
// girl with long brown hair, a pink top and blue trousers. Faces +z; her feet
// sit at y = 0 so she can be dropped straight onto the ground.

const SKIN = '#f2c9a0'
const HAIR = '#6b3f1d'
const SHIRT = '#f28fb8' // pink
const PANTS = '#3f6fb0' // blue
const SHOE = '#3a2b20'
const EYE = '#2a2320'

export function Girl() {
  return (
    <group>
      {/* legs (blue trousers) */}
      <mesh castShadow position={[-0.13, 0.38, 0]}>
        <boxGeometry args={[0.17, 0.72, 0.2]} />
        <meshStandardMaterial color={PANTS} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.13, 0.38, 0]}>
        <boxGeometry args={[0.17, 0.72, 0.2]} />
        <meshStandardMaterial color={PANTS} roughness={0.9} />
      </mesh>
      {/* shoes */}
      <mesh castShadow position={[-0.13, 0.05, 0.03]}>
        <boxGeometry args={[0.19, 0.12, 0.28]} />
        <meshStandardMaterial color={SHOE} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.13, 0.05, 0.03]}>
        <boxGeometry args={[0.19, 0.12, 0.28]} />
        <meshStandardMaterial color={SHOE} roughness={0.8} />
      </mesh>

      {/* torso (pink top) */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <boxGeometry args={[0.46, 0.62, 0.26]} />
        <meshStandardMaterial color={SHIRT} roughness={0.9} />
      </mesh>

      {/* arms — pink short sleeve + skin forearm */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.31, 1.12, 0]}>
          <mesh castShadow position={[0, 0.06, 0]}>
            <boxGeometry args={[0.13, 0.24, 0.18]} />
            <meshStandardMaterial color={SHIRT} roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, -0.22, 0]}>
            <boxGeometry args={[0.12, 0.34, 0.16]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* neck + head */}
      <mesh castShadow position={[0, 1.42, 0]}>
        <boxGeometry args={[0.14, 0.1, 0.14]} />
        <meshStandardMaterial color={SKIN} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 1.62, 0]}>
        <boxGeometry args={[0.34, 0.34, 0.32]} />
        <meshStandardMaterial color={SKIN} roughness={0.8} />
      </mesh>

      {/* eyes (front, +z) */}
      <mesh position={[-0.08, 1.64, 0.17]}>
        <boxGeometry args={[0.05, 0.06, 0.02]} />
        <meshStandardMaterial color={EYE} />
      </mesh>
      <mesh position={[0.08, 1.64, 0.17]}>
        <boxGeometry args={[0.05, 0.06, 0.02]} />
        <meshStandardMaterial color={EYE} />
      </mesh>

      {/* hair: cap on top, and a long braid down the back */}
      <mesh castShadow position={[0, 1.74, -0.01]}>
        <boxGeometry args={[0.4, 0.2, 0.38]} />
        <meshStandardMaterial color={HAIR} roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 1.6, -0.19]}>
        <boxGeometry args={[0.36, 0.34, 0.08]} />
        <meshStandardMaterial color={HAIR} roughness={1} />
      </mesh>
      {/* long hair falling down the back */}
      <mesh castShadow position={[0, 1.15, -0.2]}>
        <boxGeometry args={[0.3, 0.7, 0.1]} />
        <meshStandardMaterial color={HAIR} roughness={1} />
      </mesh>
      {/* side strands framing the face */}
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow position={[s * 0.19, 1.55, 0.02]}>
          <boxGeometry args={[0.07, 0.5, 0.34]} />
          <meshStandardMaterial color={HAIR} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}
