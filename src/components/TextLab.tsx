import { useState } from 'react'
import { useFonts } from '../App'
import { DEFAULT_TEXT, PRESETS, type TextPreset } from '../data/presets'
import { PixelCanvas } from './PixelCanvas'
import { CompatibilityCheck } from './CompatibilityCheck'
import { Control, Segmented, Toggle } from './ui'

type Align = 'start' | 'center' | 'end'
type Dir = 'rtl' | 'ltr'
type Bg = 'light' | 'checker' | 'paper' | 'game'

const BG_CLASS: Record<Bg, string> = {
  light: 'panel-2',
  checker: 'bg-checker',
  paper: 'bg-paper',
  game: 'bg-game scanlines',
}

const FG_COLOR: Record<Bg, string> = {
  light: 'var(--fg)',
  checker: '#17140f',
  paper: '#17140f',
  game: '#eef8f3',
}

const PIXEL_SCALE = 3

export function TextLab() {
  const { fonts, active, setFontId } = useFonts()
  const [text, setText] = useState(DEFAULT_TEXT)
  const [size, setSize] = useState(34)
  const [weight, setWeight] = useState(600)
  const [spacing, setSpacing] = useState(0)
  const [lineH, setLineH] = useState(1.6)
  const [align, setAlign] = useState<Align>('start')
  const [dir, setDir] = useState<Dir>('rtl')
  const [bg, setBg] = useState<Bg>('light')
  const [pixel, setPixel] = useState(false)
  const [grid, setGrid] = useState(true)

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
  const pixelColor = bg === 'game' ? '#eef8f3' : '#17140f'

  return (
    <section id="text-lab" className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
      <div className="mb-8 sm:mb-10">
        <div className="kicker mb-3">Tool 01 · Text Lab</div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Arabic Text Lab</h2>
        <p className="mt-2 text-muted max-w-2xl text-sm sm:text-base">
          Type Arabic on the left, watch it render live on the right. Test mixed scripts, numbers,
          diacritics and multi-line strings exactly like they will ship.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="panel panel-beige p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              Input
            </h3>
            <span className="mono text-xs text-muted">
              {charCount} chars · {words} words
            </span>
          </div>

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
                <select className="select" value={active.id} onChange={(e) => onFontChange(e.target.value)}>
                  {fonts.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                      {f.pixel ? ' (pixel prototype)' : ''}
                    </option>
                  ))}
                </select>
              </Control>
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
            <div className="flex flex-col justify-center gap-2.5">
              <Toggle checked={pixel} onChange={setPixel} label="Pixel preview" />
              {pixel && <Toggle checked={grid} onChange={setGrid} label="Pixel grid" />}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-3)]" />
                Live preview
              </h3>
              <span className={`chip mono ${pixel ? 'chip-acc' : ''}`}>{pixel ? 'PIXEL' : 'DOM'}</span>
            </div>

            <div className={`preview-surface ${BG_CLASS[bg]}`} style={{ color: FG_COLOR[bg] }}>
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
          </div>

          <CompatibilityCheck text={text} direction={dir} letterSpacing={spacing} />
        </div>
      </div>
    </section>
  )
}
