import { Section } from './ui'

const STEPS = [
  {
    n: '01',
    title: 'Type & tune',
    body: 'Paste your Arabic strings into the Text Lab and watch the compatibility check while you adjust font, size and direction.',
    code: '<p dir="rtl" lang="ar">مرحبا بك</p>',
  },
  {
    n: '02',
    title: 'Lock the look',
    body: 'Switch on Pixel Preview to test legibility at retro resolutions — integer sizes, crisp edges, optional grid.',
    code: "font-family: 'Cairo', 'Noto Sans Arabic';",
  },
  {
    n: '03',
    title: 'Export for your engine',
    body: 'Generate the font atlas prototype, export the PNG plus the character list, then wire both into your Unity pipeline.',
    code: 'rtl-forge-atlas-1024.png + rtl-forge-charset.txt',
  },
]

export function Docs() {
  return (
    <Section
      id="docs"
      kicker="Documentation"
      title="Three steps to safe Arabic"
      desc="The workflow RTL Forge is built around — everything else is detail."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="panel panel-hover p-5">
            <div className="mono text-acc text-sm mb-2">{s.n}</div>
            <h3 className="font-bold mb-1.5">{s.title}</h3>
            <p className="text-sm text-muted mb-3">{s.body}</p>
            <pre
              dir="ltr"
              className="mono text-xs rounded-lg p-3 overflow-x-auto"
              style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}
            >
              {s.code}
            </pre>
          </div>
        ))}
      </div>

      <div className="panel p-5 mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
        <span className="chip chip-acc">Prototype</span>
        <span>
          Atlas output is a visual reference, not a production TextMeshPro asset. Everything runs client-side — no
          servers, no tracking.
        </span>
        <a className="nav-link mono text-xs ml-auto whitespace-nowrap" href="https://github.com/" target="_blank" rel="noreferrer">
          Read the source on GitHub →
        </a>
      </div>
    </Section>
  )
}
