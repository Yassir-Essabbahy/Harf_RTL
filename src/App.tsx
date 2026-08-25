import { createContext, useContext, useEffect, useState } from 'react'
import type { FontDef } from './data/fonts'
import { FONTS } from './data/fonts'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { TextLab } from './components/TextLab'
import { FontLab } from './components/FontLab'
import { UnityExport } from './components/UnityExport'
import { Marketing } from './components/Marketing'
import { GameDemo } from './components/GameDemo'
import { Docs } from './components/Docs'
import { Footer } from './components/Footer'

interface FontContextValue {
  fonts: FontDef[]
  active: FontDef
  setFontId: (id: string) => void
  goLab: () => void
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
  const active = FONTS.find((f) => f.id === fontId) ?? FONTS[0]
  const goLab = () => document.getElementById('text-lab')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <FontContext.Provider value={{ fonts: FONTS, active, setFontId, goLab }}>
      <div className="min-h-screen flex flex-col">
        <Navbar theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
        <main className="flex-1">
          <Hero />
          <TextLab />
          <div className="zellij-strip mx-auto max-w-7xl" />
          <FontLab />
          <UnityExport />
          <Marketing />
          <GameDemo />
          <Docs />
        </main>
        <Footer />
      </div>
    </FontContext.Provider>
  )
}
