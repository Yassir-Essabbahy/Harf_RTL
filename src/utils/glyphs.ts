const AR = /[\u0600-\u06FF\u0750-\u077F]/

export function fontSpec(family: string, weight: number, size: number): string {
  return `${weight} ${size}px "${family}"`
}

/* Measures how many non-transparent pixels a string paints. Returns null
   when the canvas cannot be measured at all. */
export function inkPixels(text: string, family: string, weight: number, size = 32): number | null {
  try {
    const canvas = document.createElement('canvas')
    const pad = size
    canvas.width = size * text.length * 2 + pad * 2
    canvas.height = size * 3
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.font = `${fontSpec(family, weight, size)}, serif`
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#000'
    ctx.fillText(text, pad, canvas.height / 2)
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let ink = 0
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) ink++
    }
    return ink
  } catch {
    return null
  }
}

/* If the browser applies contextual Arabic forms, joined letters measure
   narrower than spaced ones. Returns null when measurement is unreliable. */
export function shapingProbe(family: string, weight: number): boolean | null {
  try {
    const ctx = document.createElement('canvas').getContext('2d')
    if (!ctx) return null
    ctx.font = `${fontSpec(family, weight, 32)}, serif`
    const joined = ctx.measureText('ببب').width
    const spaced = ctx.measureText('ب ب ب').width
    if (!joined || !spaced) return null
    return joined < spaced * 0.92
  } catch {
    return null
  }
}

/* Asks the font subsystem whether the active face covers this text.
   Browsers disagree on fallback handling, so callers must treat false as
   "may be missing", not "definitely missing". Returns null on failure. */
export async function coverageCheck(
  family: string,
  weight: number,
  text: string,
): Promise<boolean | null> {
  try {
    const spec = `${fontSpec(family, weight, 16)}, serif`
    await document.fonts.load(spec, text)
    return document.fonts.check(spec, text)
  } catch {
    return null
  }
}

export function containsArabic(text: string): boolean {
  return AR.test(text)
}
