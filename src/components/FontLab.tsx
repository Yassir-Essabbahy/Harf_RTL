import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Control, CopyButton, DropZone } from './ui'
import { analyzeText } from '../utils/rtlCheck'

const TEST_CASES = [
  { id: 'basic', label: 'Arabic', text: 'مرحبا بالعالم' },
  { id: 'mixed', label: 'Arabic + Latin', text: 'Level 01 — المرحلة الأولى' },
  { id: 'numbers', label: 'Numbers', text: 'الصحة: 100 — الذهب: 250' },
  { id: 'diacritics', label: 'Diacritics', text: 'مَرْحَبًا بِكُمْ' },
  { id: 'punctuation', label: 'Punctuation', text: 'هل أنت مستعد؟! أين المفتاح؟' },
]

const DEFAULT_PREVIEW = `مَرْحَبًا بِكُمْ

أين كنت؟ هل أنت مستعد؟!

ابدأ اللعبة

المهمة الجديدة

الصحة: 100
الذهب: 250

Level 01 — المرحلة الأولى`

const LABELS_MAP: Record<string, { title: string; desc: string }> = {
  arabic: { title: 'Arabic rendering', desc: 'Arabic text rendered by the browser' },
  direction: { title: 'RTL preview', desc: 'RTL direction enabled in this preview' },
  shaping: { title: 'Arabic shaping', desc: 'Connected Arabic forms displayed' },
  mixing: { title: 'Script mixing', desc: 'Mixed-script input detected in preview' },
  diacritics: { title: 'Diacritics', desc: 'Tashkeel marks rendered' },
}

export function FontLab() {
  const {
    fonts, active, setFontId, uploadFont, clearUploadedFont,
    uploaded, fontStatus, fontError,
    fontSize,
  } = useApp()
  const [text, setText] = useState(DEFAULT_PREVIEW)
  const [size, setSize] = useState(37)

  const cssLines = [
    `font-family: ${active.stack};`,
    'direction: rtl;',
    'text-align: right;',
    `font-size: ${size}px;`,
  ]
  const cssBlock = cssLines.join('\n')

  const checks = analyzeText(text, 'rtl')

  return (
    <section id="font-lab" className="w-full">
      <div className="grid gap-5 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">

        {/* Left Column */}
        <div className="flex flex-col gap-5">
          <div className="panel flex flex-col">
            <div className="win-title">Font</div>
            <div className="p-4 flex flex-col gap-3">
              <DropZone
                onFile={(file) => void uploadFont(file)}
                accept=".ttf,.otf,.woff,.woff2"
                dropLabel="Drop a font file here"
                buttonLabel="⤒ Upload Font"
                hint="Supported: TTF / OTF / WOFF · stays local"
                ariaLabel="Upload font file"
              />

              {fontStatus === 'loading' && (
                <div className="text-xs font-semibold" role="status">Loading font…</div>
              )}
              {fontError && (
                <div className="text-xs font-semibold text-danger" role="alert">{fontError}</div>
              )}

              <div className="pt-3 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
                <Control label="Current font">
                  <select
                    className="select w-full mt-1"
                    value={active.id}
                    onChange={(e) => setFontId(e.target.value)}
                    aria-label="Active font"
                  >
                    {fonts.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                        {f.id === 'uploaded' ? ' (uploaded)' : ''}
                      </option>
                    ))}
                  </select>
                </Control>
                {uploaded ? (
                  <div className="flex flex-col gap-2 mt-3">
                    <div className="mono text-xs text-ok surface p-2 break-all">
                      ✓ {uploaded.fileName}
                      <br />
                      Loaded locally — never uploaded to a server.
                    </div>
                    <button type="button" className="btn btn-ghost justify-center" onClick={clearUploadedFont}>
                      Remove font
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 surface p-3 text-xs text-muted leading-relaxed">
                    No custom font loaded.
                    <br />
                    Upload a TTF or OTF file to test your own font — until then you can try the built-in fonts above.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="panel flex flex-col">
            <div className="win-title">Test Cases</div>
            <div className="p-4 flex flex-col gap-2">
              {TEST_CASES.map((tc) => (
                <button
                  key={tc.id}
                  type="button"
                  className="btn btn-ghost justify-start"
                  onClick={() => setText(tc.text)}
                >
                  {tc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel flex flex-col">
            <div className="win-title">Size</div>
            <div className="p-4 flex flex-col gap-4">
              <Control label="Size" value={`${size} px`}>
                <input
                  type="range"
                  min={8}
                  max={128}
                  step={1}
                  value={size}
                  onChange={(e) => setSize(+e.target.value)}
                  className="range w-full"
                  aria-label="Preview size"
                />
              </Control>
              <CopyButton getText={() => cssBlock} label="Copy CSS" className="w-full justify-center" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          <div className="panel flex flex-col flex-1">
            <div className="win-title">Preview</div>
            <div className="p-0 flex flex-col flex-1">
              <textarea
                className="textarea font-arabic flex-1 min-h-[300px] border-0"
                dir="rtl"
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                aria-label="Font preview text"
                style={{
                  fontFamily: active.stack,
                  fontSize: `${size}px`,
                  textAlign: 'right',
                  lineHeight: 1.6,
                  padding: '20px',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="panel flex flex-col">
              <div className="win-title">String Checks</div>
              <div className="p-4 flex flex-col gap-3">
                {checks.map((c) => {
                  const mapped = LABELS_MAP[c.id] || { title: c.label, desc: c.detail }
                  return (
                    <div key={c.id} className="flex items-start gap-2.5 text-sm">
                      <span className={`mono shrink-0 ${c.status === 'pass' || c.status === 'warn' ? 'text-ok' : c.status === 'fail' ? 'text-danger' : 'text-acc3'}`}>
                        {c.status === 'pass' || c.status === 'warn' ? '✓' : c.status === 'fail' ? '✕' : 'ⓘ'}
                      </span>
                      <div>
                        <div className="font-semibold">{mapped.title}</div>
                        <div className="text-xs text-muted mt-0.5">{mapped.desc}</div>
                      </div>
                    </div>
                  )
                })}
                <div className="flex items-start gap-2.5 text-sm pt-2" style={{ borderTop: '1px dotted var(--border)' }}>
                  <span className="mono shrink-0 text-warn">⚠</span>
                  <div>
                    <div className="font-semibold">Glyph coverage</div>
                    <div className="text-xs text-muted mt-0.5">
                      A browser preview cannot fully verify which glyphs your font contains. Run the Arabic Test Suite for per-string checks, and always test inside your engine.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel flex flex-col">
              <div className="win-title">Information</div>
              <div className="p-4">
                <div className="grid gap-4 text-sm">
                  <div>
                    <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Font</div>
                    <div className="font-mono truncate" title={uploaded?.fileName || active.name}>
                      {uploaded?.fileName || active.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Type</div>
                    <div className="font-mono">
                      {uploaded
                        ? uploaded.fileName.match(/\.[^.]+$/)?.[0]?.toUpperCase().replace('.', '') || 'UNKNOWN'
                        : 'Built-in'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Preview Size</div>
                    <div className="font-mono">{fontSize} px shared · {size} px here</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Script Test</div>
                    <div className="font-mono">Arabic</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
