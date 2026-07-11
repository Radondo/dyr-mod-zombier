import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MOVE_SPEED, GARDEN_HALF, PLAYER_RADIUS, COTTAGE_WALL_T } from './constants'
import { WALL_SEGMENTS } from './layout'
import { input, isTouchDevice } from './input'
import { player } from './playerState'
import { Girl } from './Girl'

// Third-person camera: it orbits the girl. `yaw`/`pitch` are the orbit angles;
// the girl moves in camera-relative directions (GTA / Roblox style) and turns to
// face the way she walks.
const LOOK_SPEED = 0.0028
const MIN_PITCH = -0.45 // looking down at her
const MAX_PITCH = 0.95 // looking up past her
const CAM_DISTANCE = 6
const CAM_HEIGHT = 2.3
const LOOK_AT_HEIGHT = 1.4
const TURN_LERP = 0.2

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

const moveDir = new THREE.Vector3()
const WALL_MIN_DIST = PLAYER_RADIUS + COTTAGE_WALL_T / 2

// Push (px,pz) out of a wall segment a→b (capsule test); door/gate gaps are just
// missing segments, so you can walk through them.
function collideWall(pos: THREE.Vector3, ax: number, az: number, bx: number, bz: number) {
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
  const { camera, gl } = useThree()
  const orient = useMemo(() => ({ yaw: Math.PI, pitch: 0.32 }), [])
  const girlRef = useRef<THREE.Group>(null)

  useEffect(() => {
    player.pos.set(0, 0, GARDEN_HALF - 4)
    player.facing = Math.PI // face -z, toward the village
    orient.yaw = Math.PI
    orient.pitch = 0.32
  }, [orient])

  // Desktop: click to lock the pointer; moving the mouse then orbits the camera
  // (feeds the same input.look the touch overlay uses on tablet).
  useEffect(() => {
    if (isTouchDevice) return
    const el = gl.domElement
    const onClick = () => {
      if (document.pointerLockElement !== el) el.requestPointerLock?.()
    }
    const onMove = (e: MouseEvent) => {
      if (document.pointerLockElement === el) {
        input.look.dx += e.movementX
        input.look.dy += e.movementY
      }
    }
    el.addEventListener('click', onClick)
    window.addEventListener('mousemove', onMove)
    return () => {
      el.removeEventListener('click', onClick)
      window.removeEventListener('mousemove', onMove)
    }
  }, [gl])

  useFrame((_, delta) => {
    // ---- Look: orbit the camera (mouse drag or touch both feed input.look). ---
    if (input.look.dx !== 0 || input.look.dy !== 0) {
      orient.yaw -= input.look.dx * LOOK_SPEED
      orient.pitch += input.look.dy * LOOK_SPEED
      orient.pitch = THREE.MathUtils.clamp(orient.pitch, MIN_PITCH, MAX_PITCH)
      input.look.dx = 0
      input.look.dy = 0
    }

    // ---- Move: camera-relative (forward = where the camera looks). ----
    const f =
      (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0) -
      (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0) +
      input.move.y
    const r =
      (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) -
      (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0) +
      input.move.x

    const fx = Math.sin(orient.yaw)
    const fz = Math.cos(orient.yaw)
    // right-hand strafe vector for a camera looking along (fx,fz) is (-cos, sin)
    moveDir.set(fx * f - Math.cos(orient.yaw) * r, 0, fz * f + Math.sin(orient.yaw) * r)
    if (moveDir.lengthSq() > 1) moveDir.normalize()

    if (moveDir.lengthSq() > 1e-4) {
      player.pos.x += moveDir.x * MOVE_SPEED * delta
      player.pos.z += moveDir.z * MOVE_SPEED * delta
      // Turn the girl smoothly toward the way she's walking.
      const target = Math.atan2(moveDir.x, moveDir.z)
      let d = target - player.facing
      while (d > Math.PI) d -= 2 * Math.PI
      while (d < -Math.PI) d += 2 * Math.PI
      player.facing += d * TURN_LERP
    }

    // Collide with the fence + houses; clamp to a safe outer bound.
    for (const w of WALL_SEGMENTS) collideWall(player.pos, w.a[0], w.a[1], w.b[0], w.b[1])
    const outer = GARDEN_HALF + 30
    player.pos.x = THREE.MathUtils.clamp(player.pos.x, -outer, outer)
    player.pos.z = THREE.MathUtils.clamp(player.pos.z, -outer, outer)
    player.pos.y = 0

    // ---- Camera orbits behind the girl. ----
    const hDist = CAM_DISTANCE * Math.cos(orient.pitch)
    camera.position.set(
      player.pos.x - Math.sin(orient.yaw) * hDist,
      player.pos.y + CAM_HEIGHT + Math.sin(orient.pitch) * CAM_DISTANCE,
      player.pos.z - Math.cos(orient.yaw) * hDist,
    )
    camera.lookAt(player.pos.x, player.pos.y + LOOK_AT_HEIGHT, player.pos.z)

    // ---- Place the girl. ----
    if (girlRef.current) {
      girlRef.current.position.copy(player.pos)
      girlRef.current.rotation.y = player.facing
    }
  })

  return (
    <group ref={girlRef}>
      <Girl />
    </group>
  )
}
