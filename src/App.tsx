import { useEffect, useState } from 'react'
import { TextLab } from './components/TextLab'
import { FontLab } from './components/FontLab'
import { PixelPreview } from './components/PixelPreview'
import { UnityExport } from './components/UnityExport'
import { TestSuite } from './components/TestSuite'
import { BatchMode } from './components/BatchMode'
import { Home } from './components/Home'
import { Help } from './components/Help'
import { Logo } from './components/Logo'
import { Segmented } from './components/ui'
import { AppProvider } from './context/AppContext'

export type TabId = 'home' | 'text' | 'font' | 'tests' | 'batch' | 'pixel' | 'unity' | 'help'

const TABS: { value: TabId; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'text', label: 'RTL Text Lab' },
  { value: 'font', label: 'Font Lab' },
  { value: 'tests', label: 'Test Suite' },
  { value: 'batch', label: 'Batch Mode' },
  { value: 'pixel', label: 'Pixel Preview' },
  { value: 'unity', label: 'Unity Export' },
  { value: 'help', label: 'Help' },
]

const VALID_TABS = new Set(TABS.map((t) => t.value))

function tabFromHash(): TabId {
  const h = window.location.hash.replace('#', '') as TabId
  return VALID_TABS.has(h) ? h : 'home'
}

type Theme = 'dark' | 'light'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => tabFromHash())
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem('hf-theme') === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('hf-theme', theme)
  }, [theme])

  useEffect(() => {
    const onHash = () => setActiveTab(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const openTab = (tab: TabId) => {
    setActiveTab(tab)
    window.location.hash = tab
    window.scrollTo({ top: 0 })
  }

  const showAside = activeTab !== 'home' && activeTab !== 'help'

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
          <nav aria-label="Tools">
            <div className="mb-6 w-full">
              <Segmented value={activeTab} onChange={openTab} options={TABS} />
            </div>
          </nav>

          <div className={`grid gap-6 ${showAside ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' : ''}`}>
            <div className="min-w-0">
              {activeTab === 'home' && <Home onOpen={openTab} />}
              {activeTab === 'text' && <TextLab />}
              {activeTab === 'font' && <FontLab />}
              {activeTab === 'tests' && <TestSuite />}
              {activeTab === 'batch' && <BatchMode />}
              {activeTab === 'pixel' && <PixelPreview />}
              {activeTab === 'unity' && <UnityExport />}
              {activeTab === 'help' && <Help />}
            </div>

            {showAside && (
              <aside className="panel h-fit lg:sticky lg:top-6">
                <div className="win-title">
                  <Logo size={14} />
                  Harf Forge
                  <button
                    type="button"
                    className="win-btn"
                    title="Toggle theme"
                    aria-label="Toggle dark mode"
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
                          Preview RTL direction, Arabic shaping, mixed scripts and diacritics.
                          Text, font and settings are shared across every tool.
                        </p>
                      </div>
                      <ul className="grid gap-2 pt-1 m-0 pl-0 list-none" style={{ borderTop: '1px solid var(--silver-lo)' }}>
                        {[
                          'RTL direction and alignment',
                          'Arabic character shaping probe',
                          'Mixed Arabic / Latin text',
                          'Diacritics and punctuation checks',
                          'Pixel rendering preview',
                        ].map((line) => (
                          <li key={line} className="flex items-start gap-2.5 text-sm">
                            <span className="mono text-ok shrink-0" aria-hidden="true">✓</span>
                            {line}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-muted">Arabic tools for game developers.</p>
                    </>
                  ) : activeTab === 'font' ? (
                    <div>
                      <p className="font-bold text-base mb-1">Font Lab</p>
                      <p className="font-semibold text-sm">Test your font before it reaches your game.</p>
                      <p className="mt-2 text-sm text-muted">
                        Uploaded fonts stay local in your browser — nothing is sent to a server.
                        The selected font is used everywhere: previews, the test suite and exports.
                      </p>
                    </div>
                  ) : activeTab === 'tests' ? (
                    <div>
                      <p className="font-bold text-base mb-1">Arabic Test Suite</p>
                      <p className="font-semibold text-sm">A standardized battery of Arabic rendering tests.</p>
                      <p className="mt-2 text-sm text-muted">
                        Uses your current font — no second upload needed. Results only count what can be
                        verified locally in this browser; they are not a guarantee for in-engine quality.
                      </p>
                    </div>
                  ) : activeTab === 'batch' ? (
                    <div>
                      <p className="font-bold text-base mb-1">Batch Mode</p>
                      <p className="font-semibold text-sm">Test many strings at once against your current font.</p>
                      <p className="mt-2 text-sm text-muted">
                        Paste key,text lines or drop a CSV/JSON file. Results are sortable and
                        exportable — using the same local checks as the single-string suite.
                      </p>
                    </div>
                  ) : activeTab === 'pixel' ? (
                    <div>
                      <p className="font-bold text-base mb-1">Pixel Preview</p>
                      <p className="font-semibold text-sm">See how your text renders in a retro game.</p>
                      <p className="mt-2 text-sm text-muted">
                        Text is rasterized small, then upscaled with smoothing off for crisp pixels.
                        An approximation of a pixel pipeline — not identical to engine output.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-base mb-1">Unity Export</p>
                      <p className="font-semibold text-sm">Prepare your tested Arabic text for Unity.</p>
                      <p className="mt-2 text-sm text-muted">
                        Exports tested text and configuration as reference material. Arabic shaping/RTL
                        support still requires an RTL solution compatible with your Unity project.
                      </p>
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>

          <footer className="mt-8 pt-4 flex flex-wrap items-center justify-between gap-2 mono text-xs" style={{ borderTop: '1px solid var(--silver-lo)' }}>
            <span>Harf Forge v0.1 — test Arabic before it reaches your game.</span>
            <span className="text-muted">100% local · fonts never leave your browser.</span>
          </footer>
        </main>
      </div>
    </AppProvider>
  )
}
