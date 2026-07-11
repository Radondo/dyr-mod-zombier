import { useEffect, useMemo, useReducer, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { Model, ModelKey } from './models'
import { Sign } from './signs'
import { wallet } from './wallet'
import { shopUI } from './shopState'
import { HOUSES } from './layout'

const BUY_RANGE = 3.2
const FACE_DOT = 0.5 // must be looking fairly directly at the animal to buy

type ShopAnimal = {
  kind: ModelKey
  label: string
  price: number
  size: number
  local: [number, number, number]
}

// Three animals for sale, placed inside the (rotY 0) BUTIK building.
const ANIMALS: ShopAnimal[] = [
  { kind: 'cat', label: 'Kat', price: 25, size: 0.55, local: [-2, 0, -1.6] },
  { kind: 'dog', label: 'Hund', price: 45, size: 0.85, local: [0, 0, -2.4] },
  { kind: 'cow', label: 'Ko', price: 80, size: 1.5, local: [2, 0, -1.6] },
]

export function Shop() {
  const { camera } = useThree()
  const boughtRef = useRef([false, false, false])
  const activeRef = useRef<number | null>(null)
  const [, force] = useReducer((n: number) => n + 1, 0)

  const base = useMemo(() => {
    const shop = HOUSES.find((h) => h.shop)
    return shop ? shop.pos : ([0, 0, 0] as [number, number, number])
  }, [])
  const worldPos = useMemo(
    () => ANIMALS.map((a) => new THREE.Vector3(base[0] + a.local[0], 0, base[2] + a.local[2])),
    [base],
  )
  const fwd = useMemo(() => new THREE.Vector3(), [])

  // Click / tap buys the animal you're standing in front of (if you can afford it).
  useEffect(() => {
    const onDown = () => {
      const i = activeRef.current
      if (i == null || boughtRef.current[i]) return
      const a = ANIMALS[i]
      if (wallet.gold >= a.price) {
        wallet.gold -= a.price
        wallet.pets.push(a.kind)
        boughtRef.current[i] = true
        activeRef.current = null
        shopUI.prompt = null
        force()
      }
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  useFrame(() => {
    camera.getWorldDirection(fwd)
    fwd.y = 0
    fwd.normalize()

    let best = -1
    let bestDist = Infinity
    for (let i = 0; i < ANIMALS.length; i++) {
      if (boughtRef.current[i]) continue
      const dx = worldPos[i].x - camera.position.x
      const dz = worldPos[i].z - camera.position.z
      const dist = Math.hypot(dx, dz)
      if (dist > BUY_RANGE || dist < 0.001) continue
      const dot = (dx / dist) * fwd.x + (dz / dist) * fwd.z
      if (dot < FACE_DOT) continue
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    }

    if (best >= 0) {
      const a = ANIMALS[best]
      activeRef.current = best
      shopUI.affordable = wallet.gold >= a.price
      shopUI.prompt = shopUI.affordable
        ? `Klik for at købe ${a.label} (${a.price} 🪙)`
        : `${a.label} koster ${a.price} 🪙 — ikke nok guld`
    } else if (activeRef.current !== null) {
      activeRef.current = null
      shopUI.prompt = null
    } else {
      shopUI.prompt = null
    }
  })

  return (
    <group>
      {ANIMALS.map((a, i) =>
        boughtRef.current[i] ? null : (
          <group key={a.kind} position={[worldPos[i].x, 0, worldPos[i].z]}>
            <Model kind={a.kind} targetHeight={a.size} />
            <Billboard position={[0, a.size + 0.7, 0]}>
              <Sign text={`${a.label} · ${a.price}`} height={0.4} />
            </Billboard>
          </group>
        ),
      )}
    </group>
  )
}
