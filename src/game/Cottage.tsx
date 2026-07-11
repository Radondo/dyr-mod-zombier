import {
  COTTAGE_POS,
  COTTAGE_HALF,
  COTTAGE_WALL_T,
  COTTAGE_WALL_H,
  COTTAGE_DOOR_HALF,
} from './constants'

const H = COTTAGE_HALF
const T = COTTAGE_WALL_T
const WH = COTTAGE_WALL_H
const D = COTTAGE_DOOR_HALF
const DOOR_H = 2.1
const ROOF_H = 1.9

// Wall centre-lines in WORLD coordinates, as [x,z] segment pairs. The front
// wall is split around the door gap, so the player (see Player.tsx) collides
// with the walls but can walk straight through the doorway.
export const COTTAGE_WALLS: { a: [number, number]; b: [number, number] }[] = (() => {
  const [cx, , cz] = COTTAGE_POS
  return [
    { a: [cx - H, cz - H], b: [cx + H, cz - H] }, // back
    { a: [cx - H, cz - H], b: [cx - H, cz + H] }, // left
    { a: [cx + H, cz - H], b: [cx + H, cz + H] }, // right
    { a: [cx - H, cz + H], b: [cx - D, cz + H] }, // front, left of door
    { a: [cx + D, cz + H], b: [cx + H, cz + H] }, // front, right of door
  ]
})()

const WALL_COLOR = '#d9cdb4'
const ROOF_COLOR = '#6e3b2f'
const FLOOR_COLOR = '#6b4a2f'
const FRAME_COLOR = '#4a3524'
const WINDOW_GLOW = '#ffcf7a'

function Window({ x }: { x: number }) {
  return (
    <mesh position={[x, 1.45, H + 0.02]}>
      <planeGeometry args={[0.7, 0.7]} />
      <meshStandardMaterial
        color={WINDOW_GLOW}
        emissive={WINDOW_GLOW}
        emissiveIntensity={1.4}
        toneMapped={false}
      />
    </mesh>
  )
}

export function Cottage() {
  const frontSegW = H - D // width of each front wall piece beside the door

  return (
    <group position={COTTAGE_POS}>
      {/* floor */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[2 * H, 0.12, 2 * H]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.9} />
      </mesh>

      {/* back / left / right walls */}
      <mesh position={[0, WH / 2, -H]} castShadow receiveShadow>
        <boxGeometry args={[2 * H + T, WH, T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[-H, WH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, WH, 2 * H]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[H, WH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, WH, 2 * H]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>

      {/* front wall: two pieces beside the door + a lintel above it */}
      <mesh position={[-(D + H) / 2, WH / 2, H]} castShadow receiveShadow>
        <boxGeometry args={[frontSegW, WH, T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[(D + H) / 2, WH / 2, H]} castShadow receiveShadow>
        <boxGeometry args={[frontSegW, WH, T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[0, (DOOR_H + WH) / 2, H]} castShadow receiveShadow>
        <boxGeometry args={[2 * D, WH - DOOR_H, T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>

      {/* door frame */}
      <mesh position={[-D, DOOR_H / 2, H]} castShadow>
        <boxGeometry args={[0.12, DOOR_H, T + 0.06]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.8} />
      </mesh>
      <mesh position={[D, DOOR_H / 2, H]} castShadow>
        <boxGeometry args={[0.12, DOOR_H, T + 0.06]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.8} />
      </mesh>

      {/* pyramid roof (4-sided cone, rotated so faces align with the walls) */}
      <mesh position={[0, WH + ROOF_H / 2 - 0.02, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[H * Math.SQRT2 + 0.5, ROOF_H, 4]} />
        <meshStandardMaterial color={ROOF_COLOR} roughness={0.85} />
      </mesh>

      {/* glowing windows either side of the door */}
      <Window x={-(D + H) / 2} />
      <Window x={(D + H) / 2} />

      {/* cosy interior light */}
      <pointLight position={[0, 2.2, 0]} intensity={6} distance={9} decay={2} color="#ffcf8f" />
    </group>
  )
}
