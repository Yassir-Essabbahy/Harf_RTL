export interface FontDef {
  id: string
  name: string
  family: string
  stack: string
  style: string
  baseSize: number
  weights: number[]
  pixel?: boolean
  note: string
}

export const FONTS: FontDef[] = [
  {
    id: 'noto',
    name: 'Noto Sans Arabic',
    family: 'Noto Sans Arabic',
    stack: `'Noto Sans Arabic','Segoe UI',Tahoma,sans-serif`,
    style: 'Sans · UI',
    baseSize: 16,
    weights: [400, 600, 800],
    note: 'Broad coverage and neutral tone — a safe default for game UI.',
  },
  {
    id: 'cairo',
    name: 'Cairo',
    family: 'Cairo',
    stack: `'Cairo','Noto Sans Arabic',Tahoma,sans-serif`,
    style: 'Sans · Geometric',
    baseSize: 16,
    weights: [400, 600, 700, 800],
    note: 'Sturdy geometric sans that stays legible at small HUD sizes.',
  },
  {
    id: 'amiri',
    name: 'Amiri',
    family: 'Amiri',
    stack: `'Amiri','Noto Naskh Arabic',serif`,
    style: 'Naskh · Serif',
    baseSize: 18,
    weights: [400, 700],
    note: 'Classical naskh — perfect for dialogue, lore and in-game books.',
  },
  {
    id: 'plex',
    name: 'IBM Plex Sans Arabic',
    family: 'IBM Plex Sans Arabic',
    stack: `'IBM Plex Sans Arabic','Noto Sans Arabic',sans-serif`,
    style: 'Sans · Engineered',
    baseSize: 16,
    weights: [400, 500, 600, 700],
    note: 'Engineered for interfaces with a slightly technical personality.',
  },
  {
    id: 'rtlforge-pixel',
    name: 'RTL Forge Pixel',
    family: 'Noto Sans Arabic',
    stack: `'Noto Sans Arabic','Segoe UI',Tahoma,sans-serif`,
    style: 'Pixel · Prototype',
    baseSize: 12,
    weights: [400, 600],
    pixel: true,
    note: 'Fictional pixel cut — glyphs are rasterized small and upscaled crisp by the pixel preview pipeline.',
  },
]
