import { createContext, useContext, useState, ReactNode } from 'react'
import type { FontDef } from '../data/fonts'
import { FONTS } from '../data/fonts'

export interface AppState {
  // Font
  fonts: FontDef[]
  active: FontDef
  setFontId: (id: string) => void
  uploadFont: (file: File) => Promise<void>
  clearUploadedFont: () => void

  // Text & Settings
  text: string
  setText: (v: string) => void
  fontSize: number
  setFontSize: (v: number) => void
  direction: 'rtl' | 'ltr'
  setDirection: (v: 'rtl' | 'ltr') => void
  align: 'start' | 'center' | 'end'
  setAlign: (v: 'start' | 'center' | 'end') => void
  
  // Pixel Settings
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [fontId, setFontId] = useState('cairo')
  const [userFont, setUserFont] = useState<(FontDef & { bytes: ArrayBuffer; fileName: string }) | null>(null)

  const uploadFont = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const family = `HarfUploaded-${file.name.replace(/[^a-zA-Z0-9_-]/g, '')}`
    const face = new FontFace(family, buffer)
    await face.load()
    document.fonts.add(face)
    setUserFont({
      id: 'uploaded',
      name: file.name.replace(/\.[^.]+$/, ''),
      family,
      stack: `'${family}','Noto Sans Arabic',Tahoma,sans-serif`,
      style: 'Uploaded',
      baseSize: 16,
      weights: [400, 600, 700],
      note: 'Uploaded font — rendered live in the preview and exportable as an RTL-fixed package.',
      bytes: buffer,
      fileName: file.name,
    })
    setFontId('uploaded')
  }

  const clearUploadedFont = () => {
    if (userFont) {
      const fonts = Array.from(document.fonts as unknown as Iterable<FontFace>)
      const toDelete = fonts.find((f) => f.family === userFont.family)
      if (toDelete) document.fonts.delete(toDelete)
    }
    setUserFont(null)
    setFontId('cairo')
  }

  const fonts = userFont ? [...FONTS, userFont] : FONTS
  const active = fonts.find((f) => f.id === fontId) ?? fonts[0]

  // Shared State
  const [text, setText] = useState('ابدأ اللعبة')
  const [fontSize, setFontSize] = useState(16)
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl')
  const [align, setAlign] = useState<'start' | 'center' | 'end'>('start')
  
  const [pixelMode, setPixelMode] = useState(true)
  const [resIndex, setResIndex] = useState(0)
  const [scale, setScale] = useState(2)
  const [outline, setOutline] = useState(1)
  const [shadow, setShadow] = useState(true)
  const [textColor, setTextColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('#111111')

  return (
    <AppContext.Provider value={{
      fonts, active, setFontId, uploadFont, clearUploadedFont,
      text, setText, fontSize, setFontSize,
      direction, setDirection, align, setAlign,
      pixelMode, setPixelMode, resIndex, setResIndex, scale, setScale,
      outline, setOutline, shadow, setShadow,
      textColor, setTextColor, bgColor, setBgColor
    }}>
      {children}
    </AppContext.Provider>
  )
}
