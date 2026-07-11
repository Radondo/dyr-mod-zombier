import { useEffect, useState } from 'react'
import { wallet } from './wallet'

// Top-of-screen gold counter. Uses inline styles so it stays self-contained and
// doesn't touch App.css. Polls the wallet singleton once per frame.
export function GoldHud() {
  const [gold, setGold] = useState(wallet.gold)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setGold(wallet.gold)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        padding: '6px 14px',
        borderRadius: 999,
        background: 'rgba(0,0,0,0.45)',
        color: '#ffd23f',
        font: '700 clamp(1rem, 3.5vw, 1.6rem)/1 "Segoe UI", system-ui, sans-serif',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
        textShadow: '0 2px 4px rgba(0,0,0,0.6)',
        zIndex: 20,
      }}
    >
      <span style={{ fontSize: '1.2em' }}>🪙</span>
      {gold}
    </div>
  )
}
