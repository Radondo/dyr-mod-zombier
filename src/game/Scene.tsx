import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import {
  EYE_HEIGHT,
  GARDEN_HALF,
  GARDEN_COIN_COUNT,
  GARDEN_COIN_VALUE,
  GRAVEYARD_COIN_COUNT,
  GRAVEYARD_COIN_VALUE,
  COIN_RESPAWN_MIN,
  COIN_RESPAWN_MAX,
} from './constants'
import { World } from './World'
import { Player } from './Player'
import { Hands } from './Hands'
import { Companions } from './Companions'
import { Zombies } from './Zombies'
import { Coins, gardenCoinSpot, graveyardCoinSpot } from './Coins'
import { Diamonds } from './Diamonds'
import { Shop } from './Shop'
import { Pets } from './Pets'

export function Scene() {
  return (
    <Canvas
      shadows
      // Clamp the device-pixel-ratio: high-DPR tablets otherwise render at 2–3×
      // resolution, which is the main cause of stutter/shake while walking.
      dpr={[1, 1.75]}
      gl={{ powerPreference: 'high-performance', antialias: true }}
      camera={{ position: [0, EYE_HEIGHT, GARDEN_HALF - 3], fov: 72, near: 0.05, far: 300 }}
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
        shadow-camera-far={180}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
      />

      <Suspense fallback={null}>
        <World />
        <Companions />
        <Zombies />
        <Shop />
        <Pets />
      </Suspense>

      {/* Blue diamonds worth 100 gold: one in the garden, some out by the zombies. */}
      <Diamonds count={1} zone="garden" />
      <Diamonds count={3} zone="graveyard" />

      <Coins
        count={GARDEN_COIN_COUNT}
        value={GARDEN_COIN_VALUE}
        makeSpot={gardenCoinSpot}
        respawn={{ min: COIN_RESPAWN_MIN, max: COIN_RESPAWN_MAX }}
      />
      <Coins
        count={GRAVEYARD_COIN_COUNT}
        value={GRAVEYARD_COIN_VALUE}
        makeSpot={graveyardCoinSpot}
        respawn={{ min: COIN_RESPAWN_MIN, max: COIN_RESPAWN_MAX }}
      />

      <Hands />
      <Player />
    </Canvas>
  )
}
