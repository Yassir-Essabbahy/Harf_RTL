import { useMemo, useRef, useState } from 'react'
import { useFonts } from '../App'
import { CHAR_PRESETS, CHARSET_GROUPS, buildCharset } from '../data/charsets'
import { atlasToCharacterList, downloadBlob, downloadText, generateAtlas, type AtlasResult } from '../utils/atlas'
import { ensureFontsLoaded } from '../utils/canvasText'
import { Button, Control, Section } from './ui'

type Phase = 'idle' | 'fonts' | 'packing' | 'raster' | 'done'

const PHASE_LABEL: Record<Phase, string> = {
  idle: '',
  fonts: 'Loading fonts…',
  packing: 'Packing glyphs…',
  raster: 'Rasterizing atlas…',
  done: 'Done',
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function UnityExport() {
  const { fonts, active, setFontId } = useFonts()
  const [size, setSize] = useState(48)
  const [weight, setWeight] = useState(400)
  const [presetId, setPresetId] = useState('ui')
  const [groups, setGroups] = useState<string[]>(() => CHAR_PRESETS.find((p) => p.id === 'ui')!.groups)
  const [padding, setPadding] = useState(4)
  const [atlasSize, setAtlasSize] = useState(1024)
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AtlasResult | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const chars = useMemo(() => buildCharset(groups), [groups])
  const running = phase === 'fonts' || phase === 'packing' || phase === 'raster'
  const hasRun = result !== null

  const onFontChange = (id: string) => {
    setFontId(id)
    const f = fonts.find((x) => x.id === id)
    if (f && !f.weights.includes(weight)) setWeight(f.weights[0])
  }

  const onPresetChange = (id: string) => {
    setPresetId(id)
    setGroups(CHAR_PRESETS.find((p) => p.id === id)!.groups)
  }

  const toggleGroup = (id: string) => {
    if (presetId !== 'custom') setPresetId('custom')
    setGroups((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]))
  }

  const generate = async () => {
    if (running || !canvasRef.current) return
    setPhase('fonts')
    setProgress(12)
    await ensureFontsLoaded([`${weight} ${size}px "${active.family}"`])
    setPhase('packing')
    setProgress(38)
    await sleep(200)
    const res = generateAtlas(canvasRef.current, {
      chars,
      family: active.family,
      weight,
      fontSize: size,
      padding,
      size: atlasSize,
    })
    setPhase('raster')
    setProgress(72)
    await sleep(180)
    setProgress(100)
    await sleep(200)
    setResult(res)
    setPhase('done')
  }

  const exportPng = () => {
    canvasRef.current?.toBlob((b) => {
      if (b) downloadBlob(`rtl-forge-atlas-${atlasSize}.png`, b)
    }, 'image/png')
  }

  const exportList = () => {
    if (!result) return
    downloadText(
      'rtl-forge-charset.txt',
      atlasToCharacterList(result, { font: `${active.name} ${weight}`, fontSize: size, padding, size: atlasSize }),
    )
  }

  return (
    <Section
      id="export"
      kicker="Tool 03 · Unity Export"
      title="Unity Font Export"
      desc="A prototype atlas workflow: pick a font, a character set and a layout, then export the PNG plus the character list for your engine pipeline."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="panel panel-beige p-5 flex flex-col gap-4">
          <Control label="Font">
            <select className="select" value={active.id} onChange={(e) => onFontChange(e.target.value)}>
              {fonts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </Control>

          <Control label="Font size" value={`${size}px`}>
            <input type="range" min={16} max={96} step={2} value={size} onChange={(e) => setSize(+e.target.value)} className="range" />
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

          <Control label="Character preset">
            <select className="select" value={presetId} onChange={(e) => onPresetChange(e.target.value)}>
              {CHAR_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Control>

          {presetId === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 surface p-3">
              {CHARSET_GROUPS.map((g) => (
                <label key={g.id} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groups.includes(g.id)}
                    onChange={() => toggleGroup(g.id)}
                    className="accent-[var(--accent)]"
                  />
                  <span>{g.label}</span>
                  <span className="mono text-muted ml-auto">{g.chars.length}</span>
                </label>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between surface p-3 rounded-xl">
            <span className="text-xs font-semibold">Character Set</span>
            <span className="mono text-sm text-acc">{chars.length} glyphs</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Control label="Padding" value={`${padding}px`}>
              <input type="range" min={0} max={8} step={1} value={padding} onChange={(e) => setPadding(+e.target.value)} className="range" />
            </Control>
            <Control label="Atlas size">
              <select className="select" value={atlasSize} onChange={(e) => setAtlasSize(+e.target.value)}>
                <option value={256}>256 × 256</option>
                <option value={512}>512 × 512</option>
                <option value={1024}>1024 × 1024</option>
                <option value={2048}>2048 × 2048</option>
              </select>
            </Control>
          </div>

          <Button variant="primary" onClick={generate} disabled={running} className="w-full">
            {running ? 'Generating…' : 'Generate Atlas'}
          </Button>

          {(running || phase === 'done') && (
            <div className="flex flex-col gap-2">
              <div className="progress">
                <div style={{ width: `${progress}%` }} />
              </div>
              <span className="mono text-xs text-muted">{PHASE_LABEL[phase]}</span>
            </div>
          )}
        </div>

        <div className="panel p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-3)]" />
              Atlas preview
            </h3>
            {result && (
              <div className="flex flex-wrap gap-1.5 justify-end">
                <span className="chip mono">
                  {result.placed.length}/{result.total} glyphs
                </span>
                <span className="chip mono">{Math.round(result.occupancy * 100)}% used</span>
                <span className="chip mono">
                  {atlasSize}×{atlasSize}
                </span>
              </div>
            )}
          </div>

          <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <canvas
              ref={canvasRef}
              width={atlasSize}
              height={atlasSize}
              className="w-full h-auto block"
              style={{ background: '#ffffff' }}
            />
            {!hasRun && (
              <div className="absolute inset-0 flex items-center justify-center bg-checker">
                <span className="mono text-xs text-muted">Atlas renders here — press Generate Atlas</span>
              </div>
            )}
          </div>

          {result && !result.fit && (
            <span className="chip chip-danger">
              ⚠ {result.total - result.placed.length} glyphs did not fit — increase atlas size or reduce font size
            </span>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={exportPng} disabled={!hasRun || !result?.placed.length} className="btn-mini">
              Export PNG
            </Button>
            <Button onClick={exportList} disabled={!hasRun || !result?.placed.length} className="btn-mini">
              Export Character List
            </Button>
          </div>

          <p className="text-xs text-muted">
            Prototype output — a visual reference for your pipeline, not a production-ready TextMeshPro asset.
            All rasterization happens locally in your browser.
          </p>
        </div>
      </div>
    </Section>
  )
}
