import { useEffect, useState } from 'react'
import { TextLab } from './components/TextLab'
import { FontLab } from './components/FontLab'
import { PixelPreview } from './components/PixelPreview'
import { UnityExport } from './components/UnityExport'
import { Logo } from './components/Logo'
import { Segmented } from './components/ui'
import { AppProvider } from './context/AppContext'

type Theme = 'dark' | 'light'

export default function App() {
  const [activeTab, setActiveTab] = useState<'text' | 'font' | 'pixel' | 'unity'>('unity')
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem('rf-theme') === 'dark' ? 'dark' : 'light',
  )
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('rf-theme', theme)
  }, [theme])

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          
          <div className="mb-6 w-full md:w-[600px]">
            <Segmented
              value={activeTab}
              onChange={setActiveTab}
              options={[
                { value: 'text', label: 'RTL Text Lab' },
                { value: 'font', label: 'Font Lab' },
                { value: 'pixel', label: 'Pixel Preview' },
                { value: 'unity', label: 'Unity Export' },
              ]}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            {activeTab === 'text' ? <TextLab /> : activeTab === 'font' ? <FontLab /> : activeTab === 'pixel' ? <PixelPreview /> : <UnityExport />}

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
                ) : activeTab === 'font' ? (
                  <div>
                    <p className="font-bold text-base mb-1">Font Lab</p>
                    <p className="font-semibold text-sm">Test your font before it reaches your game.</p>
                    <p className="mt-2 text-sm text-muted">
                      Your font stays local in the browser.
                    </p>
                  </div>
                ) : activeTab === 'pixel' ? (
                  <div>
                    <p className="font-bold text-base mb-1">Pixel Preview</p>
                    <p className="font-semibold text-sm">See how your text renders in a retro game.</p>
                    <p className="mt-2 text-sm text-muted">
                      Uses nearest-neighbor scaling for crisp pixels.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-base mb-1">Unity Export</p>
                    <p className="font-semibold text-sm">Prepare your tested Arabic text for Unity.</p>
                    <p className="mt-2 text-sm text-muted">
                      RTL Forge exports tested text and configuration. Arabic shaping/RTL support may require an RTL solution compatible with your Unity project.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </AppProvider>
  )
}
