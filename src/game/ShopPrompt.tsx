import { useEffect, useState } from 'react'
import { shopUI } from './shopState'

// Bottom-of-screen "click to buy" prompt when you stand in front of a shop
// animal. Inline styles keep it self-contained (no App.css changes).
export function ShopPrompt() {
  const [prompt, setPrompt] = useState<string | null>(null)
  const [affordable, setAffordable] = useState(true)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setPrompt(shopUI.prompt)
      setAffordable(shopUI.affordable)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!prompt) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '14%',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '8px 18px',
        borderRadius: 12,
        background: 'rgba(0,0,0,0.55)',
        color: affordable ? '#bff5b0' : '#ffb0b0',
        font: '700 clamp(1rem, 3.5vw, 1.5rem)/1 "Segoe UI", system-ui, sans-serif',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 20,
        textShadow: '0 2px 4px rgba(0,0,0,0.6)',
      }}
    >
      {prompt}
    </div>
  )
}
