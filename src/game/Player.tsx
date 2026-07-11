import { useEffect, useMemo } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  MOVE_SPEED,
  EYE_HEIGHT,
  GARDEN_HALF,
  PLAYER_RADIUS,
  COTTAGE_WALL_T,
} from './constants'
import { WALL_SEGMENTS } from './layout'
import { input, isTouchDevice } from './input'

// Touch look sensitivity, in radians per pixel of drag (tablets only — desktop
// uses PointerLockControls, which stays exactly as it was on laptop).
const LOOK_SPEED = 0.0026
// Never look quite straight up/down, so the horizon can't flip.
const MAX_PITCH = THREE.MathUtils.degToRad(85)

function useKeyboard() {
  const keys = useMemo(() => ({}) as Record<string, boolean>, [])
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys[e.code] = true
    }
    const up = (e: KeyboardEvent) => {
      keys[e.code] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [keys])
  return keys
}

// Scratch vectors, hoisted so useFrame allocates nothing per frame.
const forward = new THREE.Vector3()
const right = new THREE.Vector3()
const move = new THREE.Vector3()
const euler = new THREE.Euler(0, 0, 0, 'YXZ') // yaw (Y) then pitch (X)

const WALL_MIN_DIST = PLAYER_RADIUS + COTTAGE_WALL_T / 2

// Push the player (px,pz) out of a wall segment a→b if too close (capsule test).
// The door gap is simply a missing segment, so you can walk through it.
function collideWall(
  pos: THREE.Vector3,
  ax: number,
  az: number,
  bx: number,
  bz: number,
) {
  const abx = bx - ax
  const abz = bz - az
  const len2 = abx * abx + abz * abz || 1
  let t = ((pos.x - ax) * abx + (pos.z - az) * abz) / len2
  t = Math.max(0, Math.min(1, t))
  const cx = ax + t * abx
  const cz = az + t * abz
  const dx = pos.x - cx
  const dz = pos.z - cz
  const dist = Math.hypot(dx, dz)
  if (dist < WALL_MIN_DIST) {
    if (dist > 1e-4) {
      pos.x = cx + (dx / dist) * WALL_MIN_DIST
      pos.z = cz + (dz / dist) * WALL_MIN_DIST
    } else {
      pos.x = cx + WALL_MIN_DIST
    }
  }
}

export function Player() {
  const keys = useKeyboard()
  const { camera } = useThree()
  // On tablets we drive the camera orientation by hand from the touch drag.
  // On desktop this is unused — PointerLockControls owns the camera rotation.
  const orient = useMemo(() => ({ yaw: 0, pitch: 0 }), [])

  // Start standing in the garden near the gate, looking toward the village
  // (yaw 0 = facing -z, straight down the street).
  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, GARDEN_HALF - 4)
    camera.lookAt(0, EYE_HEIGHT, -GARDEN_HALF)
    orient.yaw = 0
    orient.pitch = 0
  }, [camera, orient])

  useFrame((_, delta) => {
    // ---- Look: tablets only. Apply the accumulated touch drag, then zero it.
    // Desktop keeps the original PointerLockControls (move mouse to look). -----
    if (isTouchDevice) {
      if (input.look.dx !== 0 || input.look.dy !== 0) {
        orient.yaw -= input.look.dx * LOOK_SPEED
        orient.pitch -= input.look.dy * LOOK_SPEED
        orient.pitch = THREE.MathUtils.clamp(orient.pitch, -MAX_PITCH, MAX_PITCH)
        input.look.dx = 0
        input.look.dy = 0
      }
      euler.set(orient.pitch, orient.yaw, 0)
      camera.quaternion.setFromEuler(euler)
    }

    // ---- Move: keyboard WASD/arrows (laptop) plus the left touch joystick. --
    let f = (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0) - (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0)
    let r = (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) - (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0)
    f += input.move.y
    r += input.move.x

    if (f !== 0 || r !== 0) {
      camera.getWorldDirection(forward)
      forward.y = 0
      forward.normalize()
      right.crossVectors(forward, camera.up).normalize()

      move.set(0, 0, 0).addScaledVector(forward, f).addScaledVector(right, r)
      // Clamp to full speed (so keyboard + joystick can't stack), but leave
      // shorter joystick pushes analog for finer control.
      if (move.lengthSq() > 1) move.normalize()

      camera.position.addScaledVector(move, MOVE_SPEED * delta)
    }

    // Collide with the fence perimeter + every village house. The gate gap and
    // the house doorways are simply missing segments, so you can walk out
    // through the gate and step inside houses.
    for (const w of WALL_SEGMENTS) {
      collideWall(camera.position, w.a[0], w.a[1], w.b[0], w.b[1])
    }

    // Safety net so you can't wander off the edge of the world past the gate.
    const outer = GARDEN_HALF + 30
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -outer, outer)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -outer, outer)

    camera.position.y = EYE_HEIGHT
  })

  // Desktop: the original mouse look (click to lock, move to look). Tablets use
  // the on-screen TouchControls overlay instead, so no controls object here.
  return isTouchDevice ? null : <PointerLockControls />
}
