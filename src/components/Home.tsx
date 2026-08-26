import { useApp } from '../context/AppContext'
import { Logo } from './Logo'
import type { TabId } from '../App'

const TOOLS: { id: TabId; title: string; desc: string }[] = [
  { id: 'text', title: 'RTL Text Lab', desc: 'Test Arabic and RTL text.' },
  { id: 'font', title: 'Font Lab', desc: 'Check how your font handles Arabic.' },
  { id: 'tests', title: 'Arabic Test Suite', desc: 'Run a standardized battery of Arabic rendering tests.' },
  { id: 'batch', title: 'Batch Mode', desc: 'Test many strings at once from a list, CSV or JSON.' },
  { id: 'pixel', title: 'Pixel Preview', desc: 'See how Arabic looks in a pixel-art style.' },
  { id: 'unity', title: 'Unity Export', desc: 'Take your tested configuration into Unity.' },
]

export function Home({ onOpen }: { onOpen: (tab: TabId) => void }) {
  const { active, uploaded } = useApp()
  return (
    <section className="w-full flex flex-col gap-5">
      <div className="panel">
        <div className="win-title">
          <Logo size={14} />
          Haraf Forge
          <span className="ml-auto mono text-xs opacity-80">v0.1</span>
        </div>
        <div className="p-6 sm:p-8 flex flex-col gap-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight m-0">Arabic tools for game developers.</h1>
            <p className="mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">
              Test Arabic text, fonts, and pixel rendering before they reach your game.
              Everything runs locally in your browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-primary px-4 py-2" onClick={() => onOpen('text')}>
              ▶ Open RTL Text Lab
            </button>
            <span className="mono text-xs text-muted">
              current font: {uploaded ? uploaded.fileName : active.name}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <button key={t.id} type="button" className="panel panel-hover text-left cursor-pointer p-0" onClick={() => onOpen(t.id)}>
            <div className="win-title">{t.title}</div>
            <div className="p-4 flex flex-col gap-3 h-full">
              <span className="text-sm">{t.desc}</span>
              <span className="mono text-xs text-acc mt-auto">Open →</span>
            </div>
          </button>
        ))}
        <button type="button" className="panel panel-hover text-left cursor-pointer p-0" onClick={() => onOpen('help')}>
          <div className="win-title">Help / Docs</div>
          <div className="p-4 flex flex-col gap-3 h-full">
            <span className="text-sm">Short answers: RTL, shaping, and why browsers differ from Unity.</span>
            <span className="mono text-xs text-acc mt-auto">Read →</span>
          </div>
        </button>
      </div>

      <div className="panel">
        <div className="win-title">WORKFLOW</div>
        <div className="p-4 mono text-xs sm:text-sm flex flex-wrap items-center gap-x-2 gap-y-2">
          {['RTL Text Lab', 'Font Lab', 'Test Suite', 'Pixel Preview', 'Unity Export', 'into the game'].map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              {i > 0 && <span className="text-muted" aria-hidden="true">→</span>}
              <span className={i === 5 ? 'text-ok' : ''}>{step}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
