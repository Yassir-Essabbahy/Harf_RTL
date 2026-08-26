import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Control, Toggle, Segmented } from './ui'
import { PixelCanvas } from './PixelCanvas'

const PRESETS = [
  { id: 'dialogue', label: 'Dialogue', text: 'أين كنت؟\nيجب أن نغادر الآن.' },
  { id: 'button', label: 'Button', text: 'ابدأ اللعبة' },
  { id: 'hud', label: 'HUD', text: 'الصحة: 75\nالذهب: 120' },
  { id: 'inventory', label: 'Inventory', text: 'المسدس\nالمفتاح' },
  { id: 'pixel-rpg', label: 'Pixel RPG', text: 'المهمة الجديدة\nاذهب إلى القرية' },
  { id: 'mixed', label: 'Mixed', text: 'Level 01 — المرحلة الأولى\nHP: 100' },
  { id: 'diacritics', label: 'Diacritics', text: 'مَرْحَبًا بِكُمْ' },
]

export const RESOLUTIONS = [
  { label: '320 × 180', w: 320, h: 180 },
  { label: '256 × 144', w: 256, h: 144 },
  { label: '192 × 108', w: 192, h: 108 },
  { label: '160 × 90', w: 160, h: 90 },
]

export function PixelPreview() {
  const {
    fonts, active, setFontId,
    text, setText, fontSize, setFontSize,
    direction, align,
    pixelMode, setPixelMode,
    resIndex, setResIndex,
    scale, setScale,
    outline, setOutline,
    shadow, setShadow,
    textColor, setTextColor,
    bgColor, setBgColor,
  } = useApp()
  const [grid, setGrid] = useState(false)

  const res = RESOLUTIONS[resIndex] ?? RESOLUTIONS[0]
  const hasText = text.trim().length > 0

  const downloadPng = () => {
    if (!hasText) return
    const canvas = document.querySelector<HTMLCanvasElement>('#pixel-preview-canvas')
    if (!canvas) return
    try {
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = 'pixel-preview.png'
      a.click()
    } catch {
      /* toDataURL can fail on tainted canvases; none are used here */
    }
  }

  return (
    <section id="pixel-preview" className="w-full">
      <div className="grid gap-5 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">

        {/* Left Column */}
        <div className="flex flex-col gap-5">
          <div className="panel flex flex-col">
            <div className="win-title">Font &amp; Text</div>
            <div className="p-4 flex flex-col gap-4">
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

              <textarea
                className="textarea font-arabic w-full"
                dir={direction}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                spellCheck={false}
                aria-label="Pixel preview text"
              />
              <p className="mono text-xs text-muted m-0">
                Text and font are shared with RTL Text Lab.
              </p>
            </div>
          </div>

          <div className="panel flex flex-col">
            <div className="win-title">Pixel Settings</div>
            <div className="p-4 flex flex-col gap-4">
              <Control label="Resolution" value={res.label}>
                <select
                  className="select w-full mt-1"
                  value={resIndex}
                  onChange={(e) => setResIndex(Number(e.target.value))}
                  aria-label="Resolution"
                >
                  {RESOLUTIONS.map((r, i) => (
                    <option key={i} value={i}>{r.label}</option>
                  ))}
                </select>
              </Control>

              <Control label="Scale" value={`${scale}x`}>
                <Segmented
                  value={scale.toString()}
                  onChange={(v) => setScale(Number(v))}
                  options={[
                    { value: '1', label: '1x' },
                    { value: '2', label: '2x' },
                    { value: '3', label: '3x' },
                    { value: '4', label: '4x' },
                  ]}
                />
              </Control>

              <Control label="Font Size" value={`${fontSize} px`}>
                <input
                  type="range" min={8} max={64} step={1}
                  value={fontSize} onChange={(e) => setFontSize(+e.target.value)}
                  className="range w-full"
                  aria-label="Font size at native resolution"
                />
              </Control>

              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Control label="Text Color">
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="color-input w-full h-8 cursor-pointer" aria-label="Text color" />
                </Control>
                <Control label="Background">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="color-input w-full h-8 cursor-pointer" aria-label="Background color" />
                </Control>
              </div>

              <Control label="Outline" value={`${outline} px`}>
                <input
                  type="range" min={0} max={2} step={1}
                  value={outline} onChange={(e) => setOutline(+e.target.value)}
                  className="range w-full"
                  aria-label="Outline width"
                />
              </Control>

              <div className="flex flex-col gap-3 pt-4 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <Toggle label="Pixel Mode" checked={pixelMode} onChange={setPixelMode} />
                <Toggle label="Shadow" checked={shadow} onChange={setShadow} />
                <Toggle label="Pixel Grid" checked={grid} onChange={setGrid} />
              </div>
            </div>
          </div>

          <div className="panel flex flex-col">
            <div className="win-title">Presets</div>
            <div className="p-4 flex flex-wrap gap-2">
              {PRESETS.map((tc) => (
                <button
                  key={tc.id}
                  type="button"
                  className="chip chip-btn"
                  onClick={() => setText(tc.text)}
                >
                  {tc.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          <div className="panel flex flex-col flex-1">
            <div className="win-title flex justify-between items-center">
              Preview
              <button className="btn btn-ghost py-0 px-2 text-xs" onClick={downloadPng} disabled={!hasText}>
                Save PNG
              </button>
            </div>
            <div className="p-4 flex flex-col bg-black min-h-[400px] overflow-auto flex-1 border-t border-silver-lo shadow-[inset_2px_2px_10px_rgba(0,0,0,0.5)]">
              {!hasText ? (
                <div className="m-auto mono text-sm text-neutral-400 text-center px-6">
                  Nothing to preview yet.
                  <br />
                  Type text above — it is shared with RTL Text Lab.
                </div>
              ) : (
                <div className="m-auto flex-shrink-0">
                  {pixelMode ? (
                    <div className="relative shadow-lg ring-1 ring-white/10" style={{ width: res.w * scale, height: res.h * scale }}>
                      <PixelCanvas
                        id="pixel-preview-canvas"
                        text={text}
                        family={active.family}
                        weight={600}
                        small={fontSize}
                        scale={scale}
                        lineH={1.6}
                        align={align}
                        dir={direction}
                        color={textColor}
                        grid={grid}
                        outline={outline}
                        outlineColor="#000000"
                        shadow={shadow}
                        shadowColor="rgba(0,0,0,0.6)"
                        bgColor={bgColor}
                        width={res.w}
                        height={res.h}
                        className="w-full h-full block"
                      />
                    </div>
                  ) : (
                    <div
                      className="relative shadow-lg ring-1 ring-white/10 font-arabic flex items-center justify-center text-center whitespace-pre-wrap"
                      style={{
                        width: res.w * scale,
                        height: res.h * scale,
                        backgroundColor: bgColor,
                        color: textColor,
                        fontFamily: active.stack,
                        fontSize: `${fontSize * scale}px`,
                        lineHeight: 1.6,
                        direction,
                      }}
                    >
                      <div style={{
                        textShadow: shadow ? `2px 2px 0 rgba(0,0,0,0.6)` : 'none',
                        WebkitTextStroke: outline > 0 ? `${outline * scale}px #000` : 'none',
                      }}>
                        {text}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="mono text-xs text-muted">
            Rasterized at native resolution, then upscaled with smoothing off ({scale}×). This approximates a pixel-art pipeline — your engine's result may differ slightly.
          </p>
        </div>

      </div>
    </section>
  )
}
