import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { useGLTF } from '@react-three/drei'
import { Model, TREE_KEYS } from './models'
import { Village } from './Village'
import { Gate } from './Gate'
import { Graveyard } from './Graveyard'
import { asset } from './assets'
import { GATE_CENTER_X, GATE_HALF } from './layout'
import {
  GARDEN_HALF,
  FENCE_HEIGHT,
  TREE_COUNT,
  TREE_RING_MIN,
  TREE_RING_MAX,
  TREE_MIN_HEIGHT,
  TREE_MAX_HEIGHT,
} from './constants'

// Tiny seeded RNG so the forest layout is the same every run (mulberry32).
function makeRng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function Ground() {
  const [map, normalMap, roughnessMap] = useTexture([
    asset('/textures/grass_color.jpg'),
    asset('/textures/grass_normal.jpg'),
    asset('/textures/grass_rough.jpg'),
  ])
  useMemo(() => {
    for (const t of [map, normalMap, roughnessMap]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(90, 90)
      t.anisotropy = 8
    }
  }, [map, normalMap, roughnessMap])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial map={map} normalMap={normalMap} roughnessMap={roughnessMap} />
    </mesh>
  )
}

// A fence built by measuring the panel once and tiling it around the perimeter.
function Fence() {
  const { scene } = useGLTF(asset('/models/fence.glb'))

  const { panels, scale, offset } = useMemo(() => {
    scene.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s = FENCE_HEIGHT / (size.y || 1)
    const off: [number, number, number] = [-center.x * s, -box.min.y * s, -center.z * s]
    const panelWidth = (size.x || 1) * s

    const span = GARDEN_HALF * 2
    const n = Math.max(1, Math.ceil(span / panelWidth))
    const step = span / n

    const list: { pos: [number, number, number]; rotY: number }[] = []
    for (let i = 0; i < n; i++) {
      const t = -GARDEN_HALF + (i + 0.5) * step
      // North side (-z) runs the full width.
      list.push({ pos: [t, 0, -GARDEN_HALF], rotY: 0 })
      // South side (+z) has the gate opening — skip panels inside it.
      if (Math.abs(t - GATE_CENTER_X) > GATE_HALF + step * 0.5) {
        list.push({ pos: [t, 0, GARDEN_HALF], rotY: 0 })
      }
      // East & west sides (run along z, at x = ±GARDEN_HALF) — rotated 90°
      list.push({ pos: [-GARDEN_HALF, 0, t], rotY: Math.PI / 2 })
      list.push({ pos: [GARDEN_HALF, 0, t], rotY: Math.PI / 2 })
    }
    return { panels: list, scale: s, offset: off }
  }, [scene])

  return (
    <group>
      {panels.map((p, i) => {
        const obj = skeletonClone(scene)
        obj.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            o.castShadow = true
            o.receiveShadow = true
          }
        })
        return (
          <group key={i} position={p.pos} rotation={[0, p.rotY, 0]}>
            <group scale={scale} position={offset}>
              <primitive object={obj} />
            </group>
          </group>
        )
      })}
    </group>
  )
}

function Forest() {
  const trees = useMemo(() => {
    const rng = makeRng(1337)
    return Array.from({ length: TREE_COUNT }, () => {
      const angle = rng() * Math.PI * 2
      const radius = TREE_RING_MIN + rng() * (TREE_RING_MAX - TREE_RING_MIN)
      const kind = TREE_KEYS[Math.floor(rng() * TREE_KEYS.length)]
      const height = TREE_MIN_HEIGHT + rng() * (TREE_MAX_HEIGHT - TREE_MIN_HEIGHT)
      return {
        kind,
        height,
        pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number],
        rotY: rng() * Math.PI * 2,
      }
    })
  }, [])

  return (
    <group>
      {trees.map((t, i) => (
        <Model
          key={i}
          kind={t.kind}
          targetHeight={t.height}
          position={t.pos}
          rotation={[0, t.rotY, 0]}
        />
      ))}
    </group>
  )
}

export function World() {
  return (
    <group>
      <Ground />
      <Fence />
      <Forest />
      <Graveyard />
      <Village />
      <Gate />
    </group>
  )
}
