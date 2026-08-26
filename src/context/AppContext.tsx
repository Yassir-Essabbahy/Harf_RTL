import { createContext, useContext, useState, type ReactNode } from 'react'
import type { FontDef } from '../data/fonts'
import { FONTS } from '../data/fonts'

export interface UploadedFont extends FontDef {
  bytes: ArrayBuffer
  fileName: string
}

export type FontStatus = 'idle' | 'loading' | 'error'

export interface AppState {
  // Font
  fonts: FontDef[]
  active: FontDef
  uploaded: UploadedFont | null
  setFontId: (id: string) => void
  uploadFont: (file: File) => Promise<boolean>
  clearUploadedFont: () => void
  fontStatus: FontStatus
  fontError: string | null

  // Shared text settings
  text: string
  setText: (v: string) => void
  fontSize: number
  setFontSize: (v: number) => void
  weight: number
  setWeight: (v: number) => void
  direction: 'rtl' | 'ltr'
  setDirection: (v: 'rtl' | 'ltr') => void
  align: 'start' | 'center' | 'end'
  setAlign: (v: 'start' | 'center' | 'end') => void

  // Shared pixel settings
  pixelMode: boolean
  setPixelMode: (v: boolean) => void
  resIndex: number
  setResIndex: (v: number) => void
  scale: number
  setScale: (v: number) => void
  outline: number
  setOutline: (v: number) => void
  shadow: boolean
  setShadow: (v: boolean) => void
  textColor: string
  setTextColor: (v: string) => void
  bgColor: string
  setBgColor: (v: string) => void
}

const AppContext = createContext<AppState | null>(null)

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

const FONT_EXT = /\.(ttf|otf|woff2?)/i

function removeFontFace(family: string) {
  const fonts = Array.from(document.fonts as unknown as Iterable<FontFace>)
  for (const f of fonts) {
    const faceFamily = f.family.startsWith('"') || f.family.startsWith("'") ? f.family.slice(1, -1) : f.family
    if (faceFamily === family) {
      document.fonts.delete(f)
      return
    }
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [fontId, setFontId] = useState('cairo')
  const [uploaded, setUploaded] = useState<UploadedFont | null>(null)
  const [fontStatus, setFontStatus] = useState<FontStatus>('idle')
  const [fontError, setFontError] = useState<string | null>(null)

  const uploadFont = async (file: File): Promise<boolean> => {
    setFontError(null)
    if (!FONT_EXT.test(file.name)) {
      setFontError(`Unsupported file "${file.name}". Please select a TTF or OTF font.`)
      return false
    }
    if (file.size > 50 * 1024 * 1024) {
      setFontError(`"${file.name}" is too large (max 50 MB).`)
      return false
    }
    setFontStatus('loading')
    try {
      const buffer = await file.arrayBuffer()
      const clean = file.name.replace(/[^a-zA-Z0-9_-]/g, '')
      const family = `HF-Uploaded-${clean}-${Math.random().toString(36).slice(2, 6)}`
      const face = new FontFace(family, buffer)
      await face.load()
      if (uploaded) removeFontFace(uploaded.family)
      document.fonts.add(face)
      setUploaded({
        id: 'uploaded',
        name: file.name.replace(/\.[^.]+$/, ''),
        family,
        stack: `'${family}','Noto Sans Arabic',Tahoma,sans-serif`,
        weights: [400, 700],
        note: 'Your font, loaded locally. It never leaves the browser.',
        bytes: buffer,
        fileName: file.name,
      })
      setFontId('uploaded')
      setFontStatus('idle')
      return true
    } catch {
      setFontError(`Could not load "${file.name}". The file may be corrupted or not a valid font.`)
      setFontStatus('error')
      return false
    }
  }

  const clearUploadedFont = () => {
    if (uploaded) removeFontFace(uploaded.family)
    setUploaded(null)
    setFontError(null)
    setFontId('cairo')
  }

  const fonts = uploaded ? [...FONTS, uploaded] : FONTS
  const active = fonts.find((f) => f.id === fontId) ?? fonts[0]

  // Shared text settings
  const [text, setText] = useState('مرحبا بك في عالم الألعاب')
  const [fontSize, setFontSize] = useState(24)
  const [weight, setWeight] = useState(600)
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl')
  const [align, setAlign] = useState<'start' | 'center' | 'end'>('start')

  // Shared pixel settings
  const [pixelMode, setPixelMode] = useState(true)
  const [resIndex, setResIndex] = useState(0)
  const [scale, setScale] = useState(2)
  const [outline, setOutline] = useState(1)
  const [shadow, setShadow] = useState(true)
  const [textColor, setTextColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('#111111')

  return (
    <AppContext.Provider value={{
      fonts, active, uploaded, setFontId, uploadFont, clearUploadedFont,
      fontStatus, fontError,
      text, setText, fontSize, setFontSize, weight, setWeight,
      direction, setDirection, align, setAlign,
      pixelMode, setPixelMode, resIndex, setResIndex, scale, setScale,
      outline, setOutline, shadow, setShadow,
      textColor, setTextColor, bgColor, setBgColor,
    }}>
      {children}
    </AppContext.Provider>
  )
}
