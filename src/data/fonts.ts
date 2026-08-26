export interface FontDef {
  id: string
  name: string
  family: string
  stack: string
  weights: number[]
  note: string
}

/* Web fonts loaded via index.html (Google Fonts). Everything renders
   locally; uploaded user fonts are added at runtime by AppContext. */
export const FONTS: FontDef[] = [
  {
    id: 'noto',
    name: 'Noto Sans Arabic',
    family: 'Noto Sans Arabic',
    stack: `'Noto Sans Arabic','Segoe UI',Tahoma,sans-serif`,
    weights: [400, 600, 800],
    note: 'Broad coverage and neutral tone — a safe default for game UI.',
  },
  {
    id: 'cairo',
    name: 'Cairo',
    family: 'Cairo',
    stack: `'Cairo','Noto Sans Arabic',Tahoma,sans-serif`,
    weights: [400, 600, 700, 800],
    note: 'Sturdy geometric sans that stays legible at small HUD sizes.',
  },
  {
    id: 'amiri',
    name: 'Amiri',
    family: 'Amiri',
    stack: `'Amiri','Noto Naskh Arabic',serif`,
    weights: [400, 700],
    note: 'Classical naskh — good for dialogue, lore and in-game books.',
  },
  {
    id: 'plex',
    name: 'IBM Plex Sans Arabic',
    family: 'IBM Plex Sans Arabic',
    stack: `'IBM Plex Sans Arabic','Noto Sans Arabic',sans-serif`,
    weights: [400, 500, 600, 700],
    note: 'Engineered for interfaces with a slightly technical personality.',
  },
]
