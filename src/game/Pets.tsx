import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Model, ModelKey } from './models'
import { wallet, toggleFollow, followingCount, petsSignature, MAX_FOLLOWERS, Pet } from './wallet'
import { petUI } from './petState'
import { GARDEN_HALF } from './constants'

const SIZE: Record<string, number> = {
  cat: 0.5,
  dog: 0.75,
  cow: 1.4,
  beaver: 0.6,
  tiger: 1.1,
  hummingbird: 1.1, // "giant" hummingbird
}
const LABEL: Record<string, string> = {
  cat: 'Kat',
  dog: 'Hund',
  cow: 'Ko',
  beaver: 'Bæver',
  tiger: 'Tiger',
  hummingbird: 'Kolibri',
}

const INTERACT_RANGE = 3
const FACE_DOT = 0.35

// A little "pen" of spots in the open front-left of the garden where pets that
// aren't following you stand and wait.
function penSpots(): [number, number][] {
  const spots: [number, number][] = []
  for (let i = 0; i < 20; i++) {
    const col = i % 5
    const row = Math.floor(i / 5)
    spots.push([-GARDEN_HALF + 4 + col * 3, GARDEN_HALF - 6 - row * 3])
  }
  return spots
}

/**
 * Renders every animal you own. Up to three follow you around; the rest stand in
 * the pen. Walk up to any pet and click to send it home (if following) or make
 * it follow you (if there's room — only three follow at once).
 */
export function Pets() {
  const { camera } = useThree()
  const [pets, setPets] = useState<Pet[]>([])
  const refs = useRef<(THREE.Group | null)[]>([])
  const activeId = useRef<number | null>(null)
  const fwd = useMemo(() => new THREE.Vector3(), [])
  const spots = useMemo(() => penSpots(), [])

  // Re-read the pet list whenever it (or any follow-state) changes.
  useEffect(() => {
    let raf = 0
    let last = ''
    const tick = () => {
      const s = petsSignature()
      if (s !== last) {
        last = s
        setPets([...wallet.pets])
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Click/tap toggles the pet you're standing in front of.
  useEffect(() => {
    const onDown = () => {
      const id = activeId.current
      if (id == null) return
      const p = wallet.pets.find((x) => x.id === id)
      if (!p) return
      if (!p.following && followingCount() >= MAX_FOLLOWERS) return // full — send one home first
      toggleFollow(id)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    camera.getWorldDirection(fwd)
    fwd.y = 0
    fwd.normalize()

    let followIdx = 0
    let best = -1
    let bestDist = Infinity

    for (let i = 0; i < pets.length; i++) {
      const g = refs.current[i]
      const p = pets[i]
      if (!g) continue

      if (p.following) {
        const angle = 2.4 + followIdx * 1.35
        const radius = 1.8 + followIdx * 0.6
        followIdx++
        const tx = camera.position.x + Math.cos(angle) * radius
        const tz = camera.position.z + Math.sin(angle) * radius + 1.2
        const ox = g.position.x
        const oz = g.position.z
        g.position.x += (tx - g.position.x) * 0.05
        g.position.z += (tz - g.position.z) * 0.05
        g.position.y = Math.abs(Math.sin(t * 4 + i)) * 0.05
        const mvx = g.position.x - ox
        const mvz = g.position.z - oz
        if (mvx * mvx + mvz * mvz > 1e-6) g.rotation.y = Math.atan2(mvx, mvz)
      } else {
        const s = spots[i % spots.length]
        g.position.x = s[0]
        g.position.z = s[1]
        g.position.y = Math.abs(Math.sin(t * 2 + i)) * 0.03
      }

      // Targeting for the click prompt.
      const dx = g.position.x - camera.position.x
      const dz = g.position.z - camera.position.z
      const dist = Math.hypot(dx, dz)
      if (dist <= INTERACT_RANGE && dist > 0.001) {
        const dot = (dx / dist) * fwd.x + (dz / dist) * fwd.z
        if (dot >= FACE_DOT && dist < bestDist) {
          bestDist = dist
          best = i
        }
      }
    }

    if (best >= 0) {
      const p = pets[best]
      activeId.current = p.id
      const label = LABEL[p.kind] ?? 'Dyr'
      if (p.following) petUI.prompt = `Klik: send ${label} hjem 🏠`
      else if (followingCount() < MAX_FOLLOWERS) petUI.prompt = `Klik: ${label} følger dig`
      else petUI.prompt = `${label} — du har 3 dyr, send et hjem først`
    } else {
      activeId.current = null
      petUI.prompt = null
    }
  })

  return (
    <group>
      {pets.map((p, i) => (
        <group
          key={p.id}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          <Model kind={p.kind as ModelKey} targetHeight={SIZE[p.kind] ?? 0.6} />
        </group>
      ))}
    </group>
  )
}
