// Shared, mutable input state for touch controls.
//
// The HTML overlay (TouchControls) writes into this object every frame the
// user is dragging; the Player's useFrame loop reads it. It is a plain
// module-level singleton on purpose — no React state, so moving your thumb
// never triggers a re-render (same allocation-free spirit as Player's scratch
// vectors).

export const input = {
  // Normalised movement from the left joystick. x = strafe (right +), y =
  // forward (+). Length is 0..1.
  move: { x: 0, y: 0 },
  // Look delta accumulated since the last frame, in pixels. The Player
  // consumes (and zeroes) this each frame. dx = yaw drag, dy = pitch drag.
  look: { dx: 0, dy: 0 },
}

/** True on phones/tablets — used to decide whether to show touch controls. */
export const isTouchDevice =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0)
