import { useEffect, useRef } from 'react'
import { input } from './input'

// Radius (px) of the joystick — how far you can push the knob from its origin.
const JOY_RADIUS = 60

/**
 * Full-screen touch overlay for tablets/phones.
 *
 * - Touch the LEFT half → a virtual joystick appears where your thumb lands;
 *   dragging feeds `input.move` (walk). Origin is wherever you first touched.
 * - Touch the RIGHT half → drag to look around; deltas feed `input.look`.
 *
 * Multiple fingers are tracked by pointerId, so you can walk and look at the
 * same time. Visual updates poke the DOM directly (refs, no React state) to
 * stay smooth and allocation-free, matching the rest of the game loop.
 */
export function TouchControls({ onStart }: { onStart?: () => void }) {
  const baseRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Which pointer is doing what, and the reference point for each.
    let movePointer: number | null = null
    let moveOrigin = { x: 0, y: 0 }
    let lookPointer: number | null = null
    let lookLast = { x: 0, y: 0 }

    const showJoystick = (x: number, y: number) => {
      const base = baseRef.current
      if (!base) return
      base.style.left = `${x}px`
      base.style.top = `${y}px`
      base.style.opacity = '1'
      moveKnob(0, 0)
    }
    const moveKnob = (dx: number, dy: number) => {
      const knob = knobRef.current
      if (knob) knob.style.transform = `translate(${dx}px, ${dy}px)`
    }
    const hideJoystick = () => {
      if (baseRef.current) baseRef.current.style.opacity = '0'
      input.move.x = 0
      input.move.y = 0
    }

    const onDown = (e: PointerEvent) => {
      onStart?.()
      const leftHalf = e.clientX < window.innerWidth / 2
      if (leftHalf && movePointer === null) {
        movePointer = e.pointerId
        moveOrigin = { x: e.clientX, y: e.clientY }
        showJoystick(e.clientX, e.clientY)
      } else if (!leftHalf && lookPointer === null) {
        lookPointer = e.pointerId
        lookLast = { x: e.clientX, y: e.clientY }
      }
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerId === movePointer) {
        let dx = e.clientX - moveOrigin.x
        let dy = e.clientY - moveOrigin.y
        const len = Math.hypot(dx, dy)
        if (len > JOY_RADIUS) {
          dx = (dx / len) * JOY_RADIUS
          dy = (dy / len) * JOY_RADIUS
        }
        moveKnob(dx, dy)
        // Screen y is down; forward (move.y +) should be pushing up.
        input.move.x = dx / JOY_RADIUS
        input.move.y = -dy / JOY_RADIUS
      } else if (e.pointerId === lookPointer) {
        input.look.dx += e.clientX - lookLast.x
        input.look.dy += e.clientY - lookLast.y
        lookLast = { x: e.clientX, y: e.clientY }
      }
    }

    const onUp = (e: PointerEvent) => {
      if (e.pointerId === movePointer) {
        movePointer = null
        hideJoystick()
      } else if (e.pointerId === lookPointer) {
        lookPointer = null
      }
    }

    const el = document.getElementById('touch-layer')!
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [onStart])

  return (
    <div id="touch-layer" className="touch-layer">
      <div ref={baseRef} className="joystick-base">
        <div ref={knobRef} className="joystick-knob" />
      </div>
    </div>
  )
}
