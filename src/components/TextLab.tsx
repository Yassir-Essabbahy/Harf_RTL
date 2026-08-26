import { useRef, useState, type ChangeEvent } from 'react'
import { useApp } from '../context/AppContext'
import { PRESETS, type TextPreset } from '../data/presets'
import { PixelCanvas } from './PixelCanvas'
import { CompatibilityCheck } from './CompatibilityCheck'
import { Control, Segmented, Toggle, CopyButton } from './ui'
import { analyzeText } from '../utils/rtlCheck'
import { downloadBlob, downloadText } from '../utils/atlas'

type Align = 'start' | 'center' | 'end'
type Bg = 'light' | 'checker' | 'paper' | 'game'

const BG_CLASS: Record<Bg, string> = {
  light: 'panel-2',
  checker: 'bg-checker',
  paper: 'bg-paper',
  game: 'bg-game scanlines',
}

const BG_SWATCHES: { id: Bg; label: string; css: string }[] = [
  { id: 'paper', label: 'White', css: '#ffffff' },
  { id: 'light', label: 'Silver', css: '#dfdfdf' },
  { id: 'checker', label: 'Checker', css: 'conic-gradient(#f0f0f0 25%, #ffffff 0 50%, #f0f0f0 0 75%, #ffffff 0) 0 0/8px 8px' },
  { id: 'game', label: 'Game', css: '#000000' },
]

export function TextLab() {
  const {
    fonts, active, setFontId, uploadFont, clearUploadedFont,
    uploaded, fontStatus, fontError,
    text, setText, fontSize, setFontSize, weight, setWeight,
    direction, setDirection, align, setAlign,
    pixelMode, setPixelMode,
  } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [spacing, setSpacing] = useState(0)
  const [lineH, setLineH] = useState(1.6)
  const [bg, setBg] = useState<Bg>('paper')
  const [color, setColor] = useState('#17140f')
  const [grid, setGrid] = useState(true)

  const onFontChange = (id: string) => {
    setFontId(id)
    const f = fonts.find((x) => x.id === id)
    if (f && !f.weights.includes(weight)) setWeight(f.weights[Math.floor(f.weights.length / 2)])
  }

  const applyPreset = (p: TextPreset) => {
    setText(p.text)
    if (p.size) setFontSize(p.size)
    if (p.pixel) {
      setPixelMode(true)
      setGrid(true)
      setBg('game')
      setAlign('center')
    } else if (pixelMode) {
      setPixelMode(false)
      setBg('paper')
      setAlign('start')
    }
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = [...text].length

  const resolvedAlign =
    align === 'center'
      ? 'center'
      : dirSide(direction, align)
  const cssLines = [
    `font-family: ${active.stack};`,
    `direction: ${direction};`,
    `text-align: ${resolvedAlign};`,
    `font-size: ${fontSize}px;`,
    `font-weight: ${weight};`,
    `line-height: ${lineH.toFixed(1)};`,
  ]
  if (spacing !== 0) cssLines.push(`letter-spacing: ${spacing}em;`)
  cssLines.push(`color: ${color};`)
  const cssBlock = cssLines.join('\n')

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void uploadFont(file)
    e.target.value = ''
  }

  const downloadFontFile = () => {
    if (!uploaded) return
    downloadBlob(uploaded.fileName, new Blob([uploaded.bytes], { type: 'application/octet-stream' }))
  }

  const downloadReport = () => {
    const checks = analyzeText(text, direction)
    const lines = [
      'RTL Forge — text report (browser-side analysis)',
      `Date: ${new Date().toISOString()}`,
      `Font: ${uploaded ? `${uploaded.fileName} (loaded locally)` : active.name}`,
      '',
      'Text:',
      text || '(empty)',
      '',
      `Settings: size=${fontSize}px · weight=${weight} · dir=${direction} · align=${align}`,
      `          line-height=${lineH.toFixed(1)}${spacing !== 0 ? ` · letter-spacing=${spacing}em` : ''}`,
      '',
      'String checks:',
      ...checks.map((c) => `  [${c.status.toUpperCase()}] ${c.label} — ${c.detail}`),
      '',
      'Note: this report analyses the text string only. It cannot verify glyph',
      'coverage or in-game rendering — test inside your target engine too.',
    ]
    downloadText(`${active.name.replace(/\s+/g, '-').toLowerCase()}-report.txt`, lines.join('\n'))
  }

  return (
    <section id="text-lab" className="w-full">
      <div className="grid gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-5">
          <div className="panel flex flex-col">
            <div className="win-title">
              Arabic Text
              <span className="ml-auto mono text-xs opacity-80">
                {charCount} chars · {words} words
              </span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <textarea
                className="textarea font-arabic"
                dir={direction}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                spellCheck={false}
                aria-label="Arabic test text"
              />

              <div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Example presets</div>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button key={p.id} type="button" className="chip chip-btn" onClick={() => applyPreset(p)}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-x-3 gap-y-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <Control label="Font">
                  <div className="flex gap-2">
                    <select
                      className="select"
                      value={active.id}
                      onChange={(e) => onFontChange(e.target.value)}
                      aria-label="Preview font"
                    >
                      {fonts.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                          {f.id === 'uploaded' ? ' (uploaded)' : ''}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn btn-ghost whitespace-nowrap" onClick={() => fileRef.current?.click()}>
                      ⤒ Upload font
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      className="hidden"
                      onChange={onUpload}
                      aria-label="Upload font file"
                    />
                  </div>
                </Control>
                {fontStatus === 'loading' && (
                  <div className="text-xs font-semibold" role="status">Loading font…</div>
                )}
                {fontError && (
                  <div className="text-xs font-semibold text-danger" role="alert">{fontError}</div>
                )}
                {uploaded && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono text-xs text-ok">✓ {uploaded.fileName} — loaded locally</span>
                    <span className="flex-1" />
                    <button type="button" className="btn btn-mini btn-ghost" onClick={downloadFontFile} title="Downloads an unmodified copy of the original file">
                      ↓ Download file
                    </button>
                    <button type="button" className="btn btn-mini btn-ghost" onClick={downloadReport}>
                      Report
                    </button>
                    <button type="button" className="btn btn-mini btn-ghost" onClick={clearUploadedFont}>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="panel flex flex-col">
            <div className="win-title">Settings</div>
            <div className="p-4 flex flex-col gap-4">
              <Control label="Size" value={`${fontSize}px`}>
                <input
                  type="range"
                  min={8}
                  max={96}
                  step={1}
                  value={fontSize}
                  onChange={(e) => setFontSize(+e.target.value)}
                  className="range w-full"
                  aria-label="Font size"
                />
              </Control>
              <Control label="Weight" value={weight}>
                <select
                  className="select"
                  value={weight}
                  onChange={(e) => setWeight(+e.target.value)}
                  aria-label="Font weight"
                >
                  {[...new Set([...active.weights, weight])].sort((a, b) => a - b).map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </Control>
              <Control label="Letter Spacing" value={`${spacing.toFixed(2)}em`}>
                <input
                  type="range"
                  min={-0.05}
                  max={0.5}
                  step={0.01}
                  value={spacing}
                  onChange={(e) => setSpacing(+e.target.value)}
                  className="range w-full"
                  aria-label="Letter spacing"
                />
              </Control>
              <Control label="Line Height" value={lineH.toFixed(1)}>
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={lineH}
                  onChange={(e) => setLineH(+e.target.value)}
                  className="range w-full"
                  aria-label="Line height"
                />
              </Control>
            </div>
          </div>

          <div className="panel flex flex-col">
            <div className="win-title">Format</div>
            <div className="p-4 flex flex-col gap-4">
              <Segmented
                value={align}
                onChange={(v) => setAlign(v as Align)}
                options={[
                  { value: 'start', label: 'Start' },
                  { value: 'center', label: 'Center' },
                  { value: 'end', label: 'End' },
                ]}
              />
              <Segmented
                value={direction}
                onChange={(v) => setDirection(v as 'rtl' | 'ltr')}
                options={[
                  { value: 'rtl', label: 'RTL' },
                  { value: 'ltr', label: 'LTR' },
                ]}
              />
              <Toggle label="Pixel render (canvas)" checked={pixelMode} onChange={setPixelMode} />
              {pixelMode && <Toggle label="Pixel grid" checked={grid} onChange={setGrid} />}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="panel flex flex-col flex-1">
            <div className="win-title flex justify-between items-center">
              Preview
              <div className="flex items-center gap-4">
                <span className={`chip mono ${pixelMode ? 'chip-acc' : ''}`}>{pixelMode ? 'PIXEL' : 'DOM'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">BG</span>
                  <div className="flex gap-1" role="group" aria-label="Background style">
                    {BG_SWATCHES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        title={c.label}
                        aria-label={`Set background: ${c.label}`}
                        aria-pressed={c.id === bg}
                        className={`swatch ${c.id === bg ? 'swatch-active' : ''}`}
                        style={{ background: c.css }}
                        onClick={() => setBg(c.id)}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="color-input"
                    aria-label="Text color"
                    title="Text color"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <div className={`preview-surface ${BG_CLASS[bg]} flex-1`} style={{ color }}>
                {!text.trim() ? (
                  <span className="mono text-sm opacity-60">Type text above to preview it.</span>
                ) : pixelMode ? (
                  <PixelCanvas
                    text={text}
                    family={active.family}
                    weight={weight}
                    small={Math.max(8, Math.round(fontSize / 3))}
                    scale={3}
                    lineH={lineH}
                    align={align}
                    dir={direction}
                    color={color}
                    grid={grid}
                  />
                ) : (
                  <div
                    dir={direction}
                    className="max-w-full"
                    style={{
                      fontFamily: active.stack,
                      fontSize,
                      fontWeight: weight,
                      letterSpacing: spacing !== 0 ? `${spacing}em` : undefined,
                      lineHeight: lineH,
                      textAlign: align,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {text}
                  </div>
                )}
              </div>

              <p className="mt-3 mono text-xs text-muted">
                {pixelMode
                  ? `pixel render · ${Math.max(8, Math.round(fontSize / 3))}px raster upscaled ×3 · smoothing off`
                  : `${active.name} · ${fontSize}px · weight ${weight} · dir=${direction}`}
              </p>

              <div className="mt-3 surface p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide">Rendering</span>
                  <CopyButton getText={() => cssBlock} label="Copy CSS" variant="ghost" className="btn-mini" />
                </div>
                <pre className="mono text-xs whitespace-pre-wrap text-muted m-0">{cssBlock}</pre>
              </div>
            </div>
          </div>

          <CompatibilityCheck text={text} direction={direction} />
        </div>
      </div>
    </section>
  )
}

function dirSide(dir: 'rtl' | 'ltr', align: Align): string {
  if (align === 'center') return 'center'
  if (align === 'start') return dir === 'rtl' ? 'right' : 'left'
  return dir === 'rtl' ? 'left' : 'right'
}
