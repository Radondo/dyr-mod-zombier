import { useMemo } from 'react'
import * as THREE from 'three'

// Draw text onto a 2D canvas and use it as a texture — robust and self-contained
// (no external font download needed, unlike drei's <Text>).
function makeTextTexture(
  text: string,
  color: string,
  bg: string,
): { texture: THREE.CanvasTexture; aspect: number } {
  const pad = 40
  const fontPx = 140
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  ctx.font = `900 ${fontPx}px "Segoe UI", Arial, sans-serif`
  const textW = ctx.measureText(text).width
  canvas.width = Math.ceil(textW + pad * 2)
  canvas.height = Math.ceil(fontPx + pad * 2)

  const c = canvas.getContext('2d')!
  // plank background
  c.fillStyle = bg
  c.fillRect(0, 0, canvas.width, canvas.height)
  c.strokeStyle = 'rgba(0,0,0,0.35)'
  c.lineWidth = 10
  c.strokeRect(5, 5, canvas.width - 10, canvas.height - 10)
  // text
  c.font = `900 ${fontPx}px "Segoe UI", Arial, sans-serif`
  c.fillStyle = color
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText(text, canvas.width / 2, canvas.height / 2 + 6)

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  texture.needsUpdate = true
  return { texture, aspect: canvas.width / canvas.height }
}

type SignProps = {
  text: string
  height?: number // world height of the sign
  color?: string
  bg?: string
  oneSided?: boolean // only readable from the front (+z of the group)
} & JSX.IntrinsicElements['group']

/** A flat wooden sign board with text. Double-sided by default; pass oneSided to
 *  make it readable only from the front (used so FARLIGT shows on the way out). */
export function Sign({
  text,
  height = 0.8,
  color = '#3a2617',
  bg = '#d8b982',
  oneSided = false,
  ...groupProps
}: SignProps) {
  const { texture, aspect } = useMemo(() => makeTextTexture(text, color, bg), [text, color, bg])
  const width = height * aspect
  return (
    <group {...groupProps}>
      <mesh castShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.8}
          side={oneSided ? THREE.FrontSide : THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
