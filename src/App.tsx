import { createContext, useContext, useEffect, useState } from 'react'
import type { FontDef } from './data/fonts'
import { FONTS } from './data/fonts'
import { TextLab } from './components/TextLab'
import { Logo } from './components/Logo'

interface FontContextValue {
  fonts: FontDef[]
  active: FontDef
  setFontId: (id: string) => void
  uploadFont: (file: File) => Promise<void>
  clearUploadedFont: () => void
}

const FontContext = createContext<FontContextValue | null>(null)

export function useFonts(): FontContextValue {
  const ctx = useContext(FontContext)
  if (!ctx) throw new Error('useFonts must be used inside App')
  return ctx
}

type Theme = 'dark' | 'light'

export default function App() {
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem('rf-theme') === 'dark' ? 'dark' : 'light',
  )
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('rf-theme', theme)
  }, [theme])

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
      document.fonts.delete(document.fonts.find((f) => f.family === userFont.family)!)
    }
    setUserFont(null)
    setFontId('cairo')
  }

  const fonts = userFont ? [...FONTS, userFont] : FONTS
  const active = fonts.find((f) => f.id === fontId) ?? fonts[0]

  return (
    <FontContext.Provider value={{ fonts, active, setFontId, uploadFont, clearUploadedFont }}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <TextLab />

            <aside className="panel h-fit lg:sticky lg:top-8">
              <div className="win-title">
                <Logo size={14} />
                Harf RTL
                <button
                  type="button"
                  className="win-btn"
                  title="Toggle theme"
                  onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                >
                  {theme === 'dark' ? '☀' : '☾'}
                </button>
              </div>

              <div className="p-4 flex flex-col gap-4">
                <p className="text-sm leading-relaxed">
                  Type Arabic and watch it render live. Test mixed scripts, numbers,
                  diacritics and multi-line strings — change the text color and preview
                  it instantly, exactly like it will ship.
                </p>

                <div className="grid gap-2 pt-1" style={{ borderTop: '1px solid var(--silver-lo)' }}>
                  {[
                    'Live RTL / LTR rendering with real Arabic webfonts',
                    'Text color picker with instant preview feedback',
                    'Pixel preview: rasterize, upscale and inspect the grid',
                    'Automatic compatibility checks for common RTL pitfalls',
                  ].map((line) => (
                    <div key={line} className="flex items-start gap-2.5 text-sm">
                      <span className="mono text-ok shrink-0" aria-hidden="true">✓</span>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </FontContext.Provider>
  )
}
