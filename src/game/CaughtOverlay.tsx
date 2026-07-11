import { useEffect, useState } from 'react'
import { gameState } from './gameState'

// Big red "Fanget!" banner shown briefly when a zombie catches you outside.
// Inline styles keep it self-contained (no App.css changes).
export function CaughtOverlay() {
  const [caught, setCaught] = useState(false)
  const [loss, setLoss] = useState(0)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setCaught(gameState.caught)
      setLoss(gameState.lastLoss)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!caught) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        textAlign: 'center',
        background: 'rgba(90,0,0,0.5)',
        color: '#fff',
        pointerEvents: 'none',
        zIndex: 30,
        textShadow: '0 3px 8px rgba(0,0,0,0.7)',
      }}
    >
      <div style={{ font: '800 clamp(3rem, 12vw, 7rem)/1 "Segoe UI", system-ui, sans-serif' }}>
        Fanget! 🧟
      </div>
      <div style={{ font: '700 clamp(1.1rem, 4vw, 2rem)/1 "Segoe UI", system-ui, sans-serif' }}>
        Du mistede {loss} 🪙 — tilbage til haven
      </div>
    </div>
  )
}
