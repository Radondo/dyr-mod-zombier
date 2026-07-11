import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { EYE_HEIGHT, GARDEN_HALF } from './constants'
import { World } from './World'
import { Player } from './Player'
import { Hands } from './Hands'
import { Companions } from './Companions'
import { Zombies } from './Zombies'

export function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, EYE_HEIGHT, GARDEN_HALF - 3], fov: 72, near: 0.05, far: 400 }}
    >
      {/* Dusk sky — low sun for a moody, slightly dark graveyard evening. */}
      <Sky
        sunPosition={[18, 2.5, -40]}
        turbidity={9}
        rayleigh={2.4}
        mieCoefficient={0.01}
        mieDirectionalG={0.9}
      />
      {/* Misty fog: garden is clearer, the graveyard/forest fade into gloom. */}
      <fog attach="fog" args={['#39414f', GARDEN_HALF + 4, GARDEN_HALF + 30]} />

      <hemisphereLight args={['#8b95b3', '#2b3322', 0.35]} />
      <ambientLight intensity={0.18} />
      {/* Warm, low evening sun lighting the garden and the cottage front. */}
      <directionalLight
        castShadow
        position={[22, 20, 24]}
        intensity={1.15}
        color="#ffdca8"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      <Suspense fallback={null}>
        <World />
        <Companions />
        <Zombies />
      </Suspense>

      <Hands />
      <Player />
    </Canvas>
  )
}
