import * as THREE from 'three'
import { GARDEN_HALF } from './constants'

// Shared player position (the girl's feet) + which way she faces. In third
// person the camera orbits this point, and everything that used to track the
// camera (coins, zombies, pets, shop…) now tracks this instead.
export const player = {
  pos: new THREE.Vector3(0, 0, GARDEN_HALF - 4),
  facing: 0, // radians; 0 = facing +z
}
