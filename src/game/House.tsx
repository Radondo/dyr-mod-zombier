import { HOUSE_WALL_T, HOUSE_DOOR_HALF, HouseDef } from './layout'
import { Sign } from './signs'

const T = HOUSE_WALL_T
const D = HOUSE_DOOR_HALF
const DOOR_H = 2.7
const FRAME = '#4a3524'
const GLOW = '#ffcf7a'

function Wall({
  color,
  args,
  position,
}: {
  color: string
  args: [number, number, number]
  position: [number, number, number]
}) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  )
}

/** One village house — walls with a doorway, roof, glowing windows, optional
 *  BUTIK sign. Size, position and facing come from its HouseDef. */
export function House({ def }: { def: HouseDef }) {
  const H = def.half
  const WH = def.height
  const ROOF_H = H * 0.95
  const winY = DOOR_H + (WH - DOOR_H) * 0.45
  const frontSegW = H - D
  const wall = def.wall

  return (
    <group position={def.pos} rotation={[0, def.rotY, 0]}>
      {/* floor */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[2 * H, 0.12, 2 * H]} />
        <meshStandardMaterial color="#5f4630" roughness={0.9} />
      </mesh>

      {/* back / left / right walls */}
      <Wall color={wall} args={[2 * H + T, WH, T]} position={[0, WH / 2, -H]} />
      <Wall color={wall} args={[T, WH, 2 * H]} position={[-H, WH / 2, 0]} />
      <Wall color={wall} args={[T, WH, 2 * H]} position={[H, WH / 2, 0]} />

      {/* front wall: two pieces beside the door + lintel */}
      <Wall color={wall} args={[frontSegW, WH, T]} position={[-(D + H) / 2, WH / 2, H]} />
      <Wall color={wall} args={[frontSegW, WH, T]} position={[(D + H) / 2, WH / 2, H]} />
      <Wall color={wall} args={[2 * D, WH - DOOR_H, T]} position={[0, (DOOR_H + WH) / 2, H]} />

      {/* door frame */}
      <mesh position={[-D, DOOR_H / 2, H]} castShadow>
        <boxGeometry args={[0.14, DOOR_H, T + 0.06]} />
        <meshStandardMaterial color={FRAME} roughness={0.8} />
      </mesh>
      <mesh position={[D, DOOR_H / 2, H]} castShadow>
        <boxGeometry args={[0.14, DOOR_H, T + 0.06]} />
        <meshStandardMaterial color={FRAME} roughness={0.8} />
      </mesh>

      {/* pyramid roof */}
      <mesh position={[0, WH + ROOF_H / 2 - 0.02, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[H * Math.SQRT2 + 0.4, ROOF_H, 4]} />
        <meshStandardMaterial color={def.roof} roughness={0.85} />
      </mesh>

      {/* glowing windows (front) */}
      <mesh position={[-(D + H) / 2, winY, H + 0.02]}>
        <planeGeometry args={[1, 1.2]} />
        <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <mesh position={[(D + H) / 2, winY, H + 0.02]}>
        <planeGeometry args={[1, 1.2]} />
        <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>

      {/* shop gets a big BUTIK sign above the door, facing outward */}
      {def.shop && <Sign text="BUTIK" height={1.0} position={[0, DOOR_H + 0.8, H + 0.12]} />}
    </group>
  )
}
