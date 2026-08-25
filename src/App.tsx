import { createContext, useContext, useEffect, useState } from 'react'
import type { FontDef } from './data/fonts'
import { FONTS } from './data/fonts'
import { TextLab } from './components/TextLab'
import { FontLab } from './components/FontLab'
import { Logo } from './components/Logo'
import { Segmented } from './components/ui'

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
  const [activeTab, setActiveTab] = useState<'text' | 'font'>('font')
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
      const fonts = Array.from(document.fonts as unknown as Iterable<FontFace>)
      const toDelete = fonts.find((f) => f.family === userFont.family)
      if (toDelete) document.fonts.delete(toDelete)
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
          
          <div className="mb-6 w-full md:w-[350px]">
            <Segmented
              value={activeTab}
              onChange={setActiveTab}
              options={[
                { value: 'text', label: 'RTL Text Lab' },
                { value: 'font', label: 'Font Lab' },
              ]}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            {activeTab === 'text' ? <TextLab /> : <FontLab />}

            <aside className="panel h-fit lg:sticky lg:top-8">
              <div className="win-title">
                <Logo size={14} />
                RTL Forge
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
                {activeTab === 'text' ? (
                  <>
                    <div>
                      <p className="font-bold">Test Arabic text before it reaches your game.</p>
                      <p className="mt-2 text-sm leading-relaxed">
                        Preview RTL direction, Arabic shaping, mixed scripts, diacritics and
                        pixel rendering — all in one place.
                      </p>
                    </div>

                    <div className="grid gap-2 pt-1" style={{ borderTop: '1px solid var(--silver-lo)' }}>
                      {[
                        'RTL direction and alignment',
                        'Arabic character shaping',
                        'Mixed Arabic / Latin text',
                        'Diacritics and punctuation',
                        'Pixel rendering preview',
                      ].map((line) => (
                        <div key={line} className="flex items-start gap-2.5 text-sm">
                          <span className="mono text-ok shrink-0" aria-hidden="true">✓</span>
                          {line}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted">Arabic tools for game developers.</p>
                  </>
                ) : (
                  <div>
                    <p className="font-bold text-base mb-1">Font Lab</p>
                    <p className="font-semibold text-sm">Test your font before it reaches your game.</p>
                    <p className="mt-2 text-sm text-muted">
                      Your font stays local in the browser.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </FontContext.Provider>
  )
}
