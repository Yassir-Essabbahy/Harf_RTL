import { useEffect, useRef } from 'react'
import { drawPixelText, ensureFontsLoaded } from '../utils/canvasText'

interface PixelCanvasProps {
  text: string
  family: string
  weight: number
  small: number
  scale: number
  lineH: number
  align: 'start' | 'center' | 'end'
  dir: 'rtl' | 'ltr'
  color: string
  grid?: boolean
  className?: string
  id?: string
  outline?: number
  outlineColor?: string
  shadow?: boolean
  shadowColor?: string
  bgColor?: string
  width?: number
  height?: number
}

export function PixelCanvas(p: PixelCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await ensureFontsLoaded([`${p.weight} 16px "${p.family}"`])
      if (!cancelled && ref.current) {
        drawPixelText(ref.current, {
          text: p.text,
          family: p.family,
          weight: p.weight,
          fontSize: p.small,
          scale: p.scale,
          lineHeight: p.lineH,
          align: p.align,
          direction: p.dir,
          color: p.color,
          showGrid: p.grid,
          outline: p.outline,
          outlineColor: p.outlineColor,
          shadow: p.shadow,
          shadowColor: p.shadowColor,
          bgColor: p.bgColor,
          width: p.width,
          height: p.height,
        })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [p.text, p.family, p.weight, p.small, p.scale, p.lineH, p.align, p.dir, p.color, p.grid, p.outline, p.outlineColor, p.shadow, p.shadowColor, p.bgColor, p.width, p.height])

  return (
    <canvas
      id={p.id}
      ref={ref}
      className={p.className}
      style={{ imageRendering: 'pixelated', maxWidth: '100%', height: 'auto', display: 'block' }}
    />
  )
}
