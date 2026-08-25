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

  off.width = Math.ceil(maxW) + pad * 2
  off.height = lineH * lines.length + pad
  octx = off.getContext('2d')!
  octx.font = font
  octx.fillStyle = o.color
  octx.textBaseline = 'middle'
  octx.direction = o.direction
  if (o.align === 'center') octx.textAlign = 'center'
  else if (o.align === 'start') octx.textAlign = o.direction === 'rtl' ? 'right' : 'left'
  else octx.textAlign = o.direction === 'rtl' ? 'left' : 'right'

  lines.forEach((line, i) => {
    if (!line.trim()) return
    const y = pad + lineH * i + lineH / 2
    const x =
      octx.textAlign === 'center'
        ? off.width / 2
        : octx.textAlign === 'right'
          ? off.width - pad / 2
          : pad / 2
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
