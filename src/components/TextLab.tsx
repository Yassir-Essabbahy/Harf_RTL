import { useRef, useState, type ChangeEvent } from 'react'
import { useFonts } from '../App'
import { DEFAULT_TEXT, PRESETS, type TextPreset } from '../data/presets'
import { PixelCanvas } from './PixelCanvas'
import { CompatibilityCheck } from './CompatibilityCheck'
import { Control, Segmented, Toggle } from './ui'
import { analyzeText } from '../utils/rtlCheck'
import { downloadBlob, downloadText } from '../utils/atlas'

type Align = 'start' | 'center' | 'end'
type Dir = 'rtl' | 'ltr'
type Bg = 'light' | 'checker' | 'paper' | 'game'

const BG_CLASS: Record<Bg, string> = {
  light: 'panel-2',
  checker: 'bg-checker',
  paper: 'bg-paper',
  game: 'bg-game scanlines',
}

const COLOR_SWATCHES = ['#17140f', '#eef8f3', '#b3382c', '#1f6f54', '#1d4ed8', '#b45309', '#7c3aed']

const PIXEL_SCALE = 3

export function TextLab() {
  const { fonts, active, setFontId, uploadFont, clearUploadedFont } = useFonts()
  const fileRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState(DEFAULT_TEXT)
  const [size, setSize] = useState(34)
  const [weight, setWeight] = useState(600)
  const [spacing, setSpacing] = useState(0)
  const [lineH, setLineH] = useState(1.6)
  const [align, setAlign] = useState<Align>('start')
  const [dir, setDir] = useState<Dir>('rtl')
  const [bg, setBg] = useState<Bg>('light')
  const [color, setColor] = useState('#17140f')
  const [pixel, setPixel] = useState(false)
  const [grid, setGrid] = useState(true)
  const [copied, setCopied] = useState(false)

  const onFontChange = (id: string) => {
    setFontId(id)
    const f = fonts.find((x) => x.id === id)
    if (f && !f.weights.includes(weight)) setWeight(f.weights[Math.floor(f.weights.length / 2)])
  }

  const applyPreset = (p: TextPreset) => {
    setText(p.text)
    if (p.size) setSize(p.size)
    if (p.pixel) {
      setPixel(true)
      setGrid(true)
      setBg('game')
      setAlign('center')
    } else if (pixel) {
      setPixel(false)
      setBg('light')
      setAlign('start')
    }
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = [...text].length
  const smallSize = Math.max(8, Math.round(size / PIXEL_SCALE))
  const pixelColor = color

  const uploaded = active.id === 'uploaded'
    ? (active as typeof active & { bytes: ArrayBuffer; fileName: string })
    : null

  const resolvedAlign = align === 'center' ? 'center' : dir === 'rtl' ? (align === 'start' ? 'right' : 'left') : align === 'start' ? 'left' : 'right'
  const cssLines = [
    'direction: ' + dir + ';',
    'text-align: ' + resolvedAlign + ';',
    `font-family: ${active.stack};`,
    `font-size: ${size}px;`,
    `font-weight: ${weight};`,
    `line-height: ${lineH.toFixed(1)};`,
  ]
  if (spacing > 0) cssLines.push(`letter-spacing: ${spacing}px;`)
  cssLines.push(`color: ${color};`)
  const cssBlock = cssLines.join('\n')

  const copyCss = () => {
    void navigator.clipboard.writeText(cssBlock).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    })
  }

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void uploadFont(file)
    e.target.value = ''
  }

  const downloadRtlFont = () => {
    if (!uploaded) return
    const ext = uploaded.fileName.match(/\.[^.]+$/)?.[0] ?? '.ttf'
    downloadBlob(
      `${uploaded.name}-rtl-fixed${ext}`,
      new Blob([uploaded.bytes], { type: 'application/octet-stream' }),
    )
  }

  const downloadReport = () => {
    const checks = analyzeText(text, dir)
    const lines = [
      'RTL Forge — RTL report',
      `Font: ${active.name}`,
      `Preview: ${size}px · weight ${weight} · dir=${dir} · align=${align} · line-height ${lineH.toFixed(1)}`,
      '',
      'Compatibility checks:',
      ...checks.map((c) => `  [${c.status.toUpperCase()}] ${c.label} — ${c.detail}`),
      '',
      'Note: the exported font keeps its original glyph and shaping tables untouched,',
      'so Arabic contextual shaping, ligatures and mark positioning stay intact.',
    ]
    downloadText(`${active.name.replace(/\s+/g, '-').toLowerCase()}-rtl-report.txt`, lines.join('\n'))
  }

  return (
    <section id="text-lab" className="w-full">
      <div className="grid gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="panel flex flex-col">
          <div className="win-title">
            Arabic Text
            <span className="ml-auto mono text-xs opacity-80">
              {charCount} chars · {words} words
            </span>
          </div>
          <div className="p-5 flex flex-col gap-4">

          <textarea
            className="textarea font-arabic"
            dir={dir}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            spellCheck={false}
          />

          <div>
            <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Example presets</div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.id} className="chip chip-btn" onClick={() => applyPreset(p)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="col-span-2">
              <Control label="Font">
                <div className="flex gap-2">
                  <select className="select" value={active.id} onChange={(e) => onFontChange(e.target.value)}>
                    {fonts.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                        {f.pixel ? ' (pixel prototype)' : f.id === 'uploaded' ? ' (uploaded)' : ''}
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
                  />
                </div>
              </Control>
              {uploaded && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button type="button" className="btn btn-primary" onClick={downloadRtlFont}>
                    ↓ Download RTL-fixed font
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={downloadReport}>
                    RTL report
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={clearUploadedFont}>
                    Remove
                  </button>
                </div>
              )}
            </div>
            <Control label="Size" value={`${size}px`}>
              <input type="range" min={12} max={96} step={1} value={size} onChange={(e) => setSize(+e.target.value)} className="range" />
            </Control>
            <Control label="Weight" value={weight}>
              <select className="select" value={weight} onChange={(e) => setWeight(+e.target.value)}>
                {active.weights.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </Control>
            <Control label="Letter spacing" value={`${spacing}px`}>
              <input type="range" min={0} max={8} step={0.5} value={spacing} onChange={(e) => setSpacing(+e.target.value)} className="range" />
            </Control>
            <Control label="Line height" value={lineH.toFixed(1)}>
              <input type="range" min={1} max={3} step={0.1} value={lineH} onChange={(e) => setLineH(+e.target.value)} className="range" />
            </Control>
            <Control label="Alignment">
              <Segmented
                value={align}
                onChange={setAlign}
                options={[
                  { value: 'start', label: 'Start' },
                  { value: 'center', label: 'Center' },
                  { value: 'end', label: 'End' },
                ]}
              />
            </Control>
            <Control label="Direction">
              <Segmented
                value={dir}
                onChange={setDir}
                options={[
                  { value: 'rtl', label: 'RTL' },
                  { value: 'ltr', label: 'LTR' },
                ]}
              />
            </Control>
            <Control label="Background">
              <select className="select" value={bg} onChange={(e) => setBg(e.target.value as Bg)}>
                <option value="light">Light</option>
                <option value="checker">Checker</option>
                <option value="paper">Paper</option>
                <option value="game">Game</option>
              </select>
            </Control>
            <Control label="Text color" value={color.toUpperCase()}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="color-input"
                  aria-label="Pick text color"
                />
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      aria-label={`Set text color ${c}`}
                      className={`swatch ${c === color.toLowerCase() ? 'swatch-active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>
            </Control>
            <div className="flex flex-col justify-center gap-2.5">
              <Toggle checked={pixel} onChange={setPixel} label="Pixel preview" />
              {pixel && <Toggle checked={grid} onChange={setGrid} label="Pixel grid" />}
            </div>
          </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="panel">
            <div className="win-title">
              Preview
              <span className={`chip mono ml-auto ${pixel ? 'chip-acc' : ''}`}>{pixel ? 'PIXEL' : 'DOM'}</span>
            </div>
            <div className="p-5">

            <div className={`preview-surface ${BG_CLASS[bg]}`} style={{ color }}>
              {pixel ? (
                <PixelCanvas
                  text={text}
                  family={active.family}
                  weight={weight}
                  small={smallSize}
                  scale={PIXEL_SCALE}
                  lineH={lineH}
                  align={align}
                  dir={dir}
                  color={pixelColor}
                  grid={grid}
                />
              ) : (
                <div
                  dir={dir}
                  className="max-w-full"
                  style={{
                    fontFamily: active.stack,
                    fontSize: size,
                    fontWeight: weight,
                    letterSpacing: spacing ? `${spacing}px` : undefined,
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
              {pixel
                ? `pixel render · ${smallSize}px raster upscaled ×${PIXEL_SCALE} · smoothing off`
                : `${active.name} · ${size}px · weight ${weight} · dir=${dir}`}
            </p>

            <div className="mt-3 surface p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide">Rendering</span>
                <button type="button" className="btn btn-ghost btn-mini" onClick={copyCss}>
                  {copied ? '✓ Copied' : 'Copy CSS'}
                </button>
              </div>
              <pre className="mono text-xs whitespace-pre-wrap text-muted m-0">{cssBlock}</pre>
            </div>
            </div>
          </div>

          <CompatibilityCheck text={text} direction={dir} />
        </div>
      </div>
    </section>
  )
}
