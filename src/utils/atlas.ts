export interface AtlasGlyph {
  char: string
  x: number
  y: number
  w: number
  h: number
}

export interface AtlasResult {
  placed: AtlasGlyph[]
  total: number
  fit: boolean
  occupancy: number
}

export interface AtlasOptions {
  chars: string[]
  family: string
  weight: number
  fontSize: number
  padding: number
  size: number
}

/* Row-based bin packing: every glyph gets a cell of its measured advance
   plus padding, wrapped into rows of the fixed cell height. */
export function generateAtlas(canvas: HTMLCanvasElement, o: AtlasOptions): AtlasResult {
  canvas.width = o.size
  canvas.height = o.size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, o.size, o.size)

  const font = `${o.weight} ${o.fontSize}px "${o.family}", sans-serif`
  const measure = document.createElement('canvas').getContext('2d')!
  measure.font = font

  const cellH = Math.ceil(o.fontSize * 1.45) + o.padding * 2
  const placed: AtlasGlyph[] = []
  let fit = true
  let x = 0
  let y = 0

  for (const char of o.chars) {
    const advance = Math.max(measure.measureText(char).width, o.fontSize * 0.28)
    const w = Math.ceil(advance) + o.padding * 2
    if (x + w > o.size) {
      x = 0
      y += cellH
    }
    if (y + cellH > o.size) {
      fit = false
      break
    }
    placed.push({ char, x, y, w, h: cellH })
    x += w
  }

  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.strokeStyle = 'rgba(23, 20, 15, 0.12)'
  ctx.lineWidth = 1
  ctx.fillStyle = '#17140f'
  for (const g of placed) {
    ctx.strokeRect(g.x + 0.5, g.y + 0.5, g.w - 1, g.h - 1)
    ctx.fillText(g.char, g.x + g.w / 2, g.y + g.h / 2 + o.fontSize * 0.04)
  }

  const occupancy = placed.reduce((a, g) => a + g.w * g.h, 0) / (o.size * o.size)
  return { placed, total: o.chars.length, fit, occupancy }
}

export function atlasToCharacterList(
  res: AtlasResult,
  meta: { font: string; fontSize: number; padding: number; size: number },
): string {
  const head = [
    'RTL Forge — font atlas character list (prototype)',
    `Font: ${meta.font}`,
    `Size: ${meta.fontSize}px · Padding: ${meta.padding}px · Atlas: ${meta.size}x${meta.size}`,
    `Glyphs: ${res.placed.length}/${res.total}${res.fit ? '' : ' (overflow — some glyphs did not fit)'}`,
    '',
  ]
  const rows = res.placed.map((g) => {
    const code = g.char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')
    return `U+${code}  ${g.char}  x=${String(g.x).padEnd(6)} y=${String(g.y).padEnd(6)} w=${String(g.w).padEnd(5)} h=${g.h}`
  })
  return [...head, ...rows].join('\n')
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadText(filename: string, content: string): void {
  downloadBlob(filename, new Blob([content], { type: 'text/plain;charset=utf-8' }))
}
