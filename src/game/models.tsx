import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { asset } from './assets'

// Every downloaded model comes in a different scale and origin. `fit` measures
// the model's bounding box at load time and returns the scale + offset needed to
// make it `targetHeight` tall and sit centred on the ground (bottom at y = 0).
function fit(object: THREE.Object3D, targetHeight: number) {
  object.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const scale = targetHeight / (size.y || 1)
  const offset: [number, number, number] = [
    -center.x * scale,
    -box.min.y * scale,
    -center.z * scale,
  ]
  return { scale, offset, footprint: new THREE.Vector2(size.x * scale, size.z * scale) }
}

const MODEL_URLS = {
  fence: asset('/models/fence.glb'),
  tree1: asset('/models/tree1.glb'),
  tree2: asset('/models/tree2.glb'),
  tree3: asset('/models/tree3.glb'),
  bee: asset('/models/bee.glb'),
  ladybug: asset('/models/ladybug.glb'),
  zombie: asset('/models/zombie.glb'),
  grave1: asset('/models/grave1.glb'),
  grave2: asset('/models/grave2.glb'),
  grave3: asset('/models/grave3.glb'),
  cross: asset('/models/cross.glb'),
  deadtree: asset('/models/deadtree.glb'),
  cat: asset('/models/cat.glb'),
  dog: asset('/models/dog.glb'),
  cow: asset('/models/cow.glb'),
  beaver: asset('/models/beaver.glb'),
  tiger: asset('/models/tiger.glb'),
  hummingbird: asset('/models/hummingbird.glb'),
} as const

export type ModelKey = keyof typeof MODEL_URLS

export const TREE_KEYS: ModelKey[] = ['tree1', 'tree2', 'tree3']
export const GRAVE_KEYS: ModelKey[] = ['grave1', 'grave2', 'grave3', 'cross']

// Preload everything so the scene pops in together rather than piecemeal.
Object.values(MODEL_URLS).forEach((url) => useGLTF.preload(url))

type ModelProps = {
  kind: ModelKey
  targetHeight: number
  /** Called once with the on-ground footprint (width x depth after scaling). */
  onFootprint?: (footprint: THREE.Vector2) => void
} & JSX.IntrinsicElements['group']

/**
 * Loads a GLB, clones it (so it can appear many times), normalises it to
 * `targetHeight`, grounds it, and enables shadows. Extra props (position,
 * rotation, scale) apply to the outer group in world space.
 */
export function Model({ kind, targetHeight, onFootprint, ...groupProps }: ModelProps) {
  const { scene } = useGLTF(MODEL_URLS[kind])

  const { object, scale, offset } = useMemo(() => {
    const cloned = skeletonClone(scene)
    cloned.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    const f = fit(cloned, targetHeight)
    onFootprint?.(f.footprint)
    return { object: cloned, scale: f.scale, offset: f.offset }
  }, [scene, targetHeight, onFootprint])

  return (
    <group {...groupProps}>
      <group scale={scale} position={offset}>
        <primitive object={object} />
      </group>
    </group>
  )
}
