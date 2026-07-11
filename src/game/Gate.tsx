import { GATE_CENTER_X, GATE_HALF, GATE_POST_H, GATE_Z } from './layout'
import { Sign } from './signs'

const POST = '#4a3320'
const WOOD = '#6b4a2f'
const DOOR_H = 3.0
const DOOR_W = 2 * GATE_HALF // width of the swung-open leaf
const OPEN_ANGLE = -1.9 // radians the leaf is swung outward (into the graveyard)

// A tall picket gate leaf that stands open like a door, hinged on the right post.
function GateLeaf() {
  const pickets = 6
  return (
    <group position={[GATE_CENTER_X + GATE_HALF, 0, GATE_Z]} rotation={[0, OPEN_ANGLE, 0]}>
      {/* the leaf extends from the hinge toward local -x */}
      {/* two horizontal rails */}
      {[0.5, DOOR_H - 0.5].map((y, i) => (
        <mesh key={i} position={[-DOOR_W / 2, y, 0]} castShadow>
          <boxGeometry args={[DOOR_W, 0.14, 0.1]} />
          <meshStandardMaterial color={WOOD} roughness={0.85} />
        </mesh>
      ))}
      {/* vertical pickets */}
      {Array.from({ length: pickets }, (_, i) => {
        const x = -0.2 - (i / (pickets - 1)) * (DOOR_W - 0.4)
        return (
          <mesh key={`p${i}`} position={[x, DOOR_H / 2, 0]} castShadow>
            <boxGeometry args={[0.12, DOOR_H, 0.08]} />
            <meshStandardMaterial color={WOOD} roughness={0.85} />
          </mesh>
        )
      })}
    </group>
  )
}

export function Gate() {
  return (
    <group>
      {/* two tall posts either side of the opening */}
      {[GATE_CENTER_X - GATE_HALF, GATE_CENTER_X + GATE_HALF].map((x, i) => (
        <mesh key={i} position={[x, GATE_POST_H / 2, GATE_Z]} castShadow>
          <boxGeometry args={[0.35, GATE_POST_H, 0.35]} />
          <meshStandardMaterial color={POST} roughness={0.8} />
        </mesh>
      ))}

      {/* beam across the top */}
      <mesh position={[GATE_CENTER_X, GATE_POST_H + 0.1, GATE_Z]} castShadow>
        <boxGeometry args={[2 * GATE_HALF + 0.5, 0.3, 0.35]} />
        <meshStandardMaterial color={POST} roughness={0.8} />
      </mesh>

      {/* FARLIGT warning sign hanging under the beam */}
      <Sign
        text="FARLIGT"
        height={0.75}
        color="#b02020"
        bg="#e9cf95"
        position={[GATE_CENTER_X, GATE_POST_H - 0.35, GATE_Z]}
      />

      <GateLeaf />
    </group>
  )
}
