const SAMPLE = 'مرحبا ابجدهوز حطيكلمنس ٠١٢٣٤٥٦٧٨٩'

export async function ensureFontsLoaded(specs: string[]): Promise<void> {
  try {
    await Promise.all(specs.map((spec) => document.fonts.load(spec, SAMPLE)))
    await document.fonts.ready
  } catch {
    /* best-effort: CSS fallbacks apply if a font fails to load */
  }
}

export interface PixelTextOptions {
  text: string
  family: string
  weight: number
  fontSize: number
  scale: number
  lineHeight: number
  align: 'start' | 'center' | 'end'
  direction: 'rtl' | 'ltr'
  color: string
  showGrid?: boolean
  outline?: number
  outlineColor?: string
  shadow?: boolean
  shadowColor?: string
  bgColor?: string
  width?: number
  height?: number
}

/* Rasterize text small on an offscreen canvas, then upscale it with
   smoothing disabled — that is what produces the crisp pixel look. */
export function drawPixelText(canvas: HTMLCanvasElement, o: PixelTextOptions): void {
  const lines = (o.text || ' ').split('\n')
  const off = document.createElement('canvas')
  let octx = off.getContext('2d')!
  const font = `${o.weight} ${o.fontSize}px "${o.family}", sans-serif`

  octx.font = font
  const pad = Math.ceil(o.fontSize * 0.75)
  let maxW = 10
  for (const line of lines) maxW = Math.max(maxW, octx.measureText(line).width)
  const lineH = Math.max(1, Math.round(o.fontSize * o.lineHeight))

  // Determine logical canvas size
  off.width = o.width || Math.ceil(maxW) + pad * 2
  off.height = o.height || lineH * lines.length + pad
  octx = off.getContext('2d')!
  
  // Fill background if specified
  if (o.bgColor && o.bgColor !== 'transparent') {
    octx.fillStyle = o.bgColor
    octx.fillRect(0, 0, off.width, off.height)
  }

  octx.font = font
  octx.textBaseline = 'middle'
  octx.direction = o.direction
  if (o.align === 'center') octx.textAlign = 'center'
  else if (o.align === 'start') octx.textAlign = o.direction === 'rtl' ? 'right' : 'left'
  else octx.textAlign = o.direction === 'rtl' ? 'left' : 'right'

  const totalTextHeight = lineH * lines.length
  const startY = o.height ? (o.height - totalTextHeight) / 2 : pad

  lines.forEach((line, i) => {
    if (!line.trim()) return
    const y = startY + lineH * i + lineH / 2
    const x =
      octx.textAlign === 'center'
        ? off.width / 2
        : octx.textAlign === 'right'
          ? off.width - (o.width ? 10 : pad / 2) // add some padding from the edge
          : (o.width ? 10 : pad / 2)
    
    // Shadow
    if (o.shadow) {
      octx.fillStyle = o.shadowColor || 'rgba(0,0,0,0.5)'
      octx.fillText(line, x + 1, y + 1)
    }

    // Outline (using strokeText)
    if (o.outline && o.outline > 0) {
      octx.strokeStyle = o.outlineColor || '#000000'
      octx.lineWidth = o.outline * 2 // line width is centered, so we double it
      octx.lineJoin = 'round'
      octx.strokeText(line, x, y)
    }

    // Main text
    octx.fillStyle = o.color
    octx.fillText(line, x, y)
  })

  const s = o.scale
  canvas.width = off.width * s
  canvas.height = off.height * s
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(off, 0, 0, canvas.width, canvas.height)

  if (o.showGrid) {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x <= canvas.width; x += s) {
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, canvas.height)
    }
    for (let y = 0; y <= canvas.height; y += s) {
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(canvas.width, y + 0.5)
    }
    ctx.stroke()
  }
}
