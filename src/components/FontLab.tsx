import { useFonts } from '../App'
import { PixelCanvas } from './PixelCanvas'
import { Button, Section } from './ui'

export function FontLab() {
  const { fonts, active, setFontId, goLab } = useFonts()

  return (
    <Section
      id="fonts"
      kicker="Tool 02 · Font Lab"
      title="Arabic Pixel Fonts"
      desc="Five starting points for game UI. The first four load from Google Fonts; RTL Forge Pixel is a fictional pixel-cut rendered through the pixel pipeline as a visual prototype."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {fonts.map((f, i) => {
          const isActive = active.id === f.id
          return (
            <div
              key={f.id}
              className="panel panel-hover p-5 flex flex-col gap-4 fade-up"
              style={{
                borderColor: isActive ? 'var(--accent)' : undefined,
                background: isActive ? 'var(--select)' : undefined,
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className="h-24 rounded-xl flex items-center justify-center bg-checker" style={{ border: '1px solid var(--border-strong)' }}>
                {f.pixel ? (
                  <PixelCanvas
                    text="اضغط للبدء"
                    family={f.family}
                    weight={600}
                    small={9}
                    scale={4}
                    lineH={1.6}
                    align="center"
                    dir="rtl"
                    color="#17140f"
                  />
                ) : (
                  <div
                    dir="rtl"
                    className="text-3xl"
                    style={{ fontFamily: f.stack, fontWeight: f.weights.includes(700) ? 700 : 600 }}
                  >
                    مرحباً بك
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold">{f.name}</h3>
                {f.pixel && <span className="chip chip-warn">Prototype</span>}
                {isActive && <span className="chip chip-acc">In Text Lab</span>}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="chip">{f.style}</span>
                <span className="chip mono">{f.weights.join(' / ')}</span>
                <span className="chip mono">{f.baseSize}px base</span>
              </div>

              <p className="text-xs text-muted">{f.note}</p>

              <div dir="rtl" className="text-sm text-muted truncate" style={{ fontFamily: f.stack }}>
                سألت الحاج عن البوابة الشرقية، فأشار إلى السوق القديم.
              </div>

              <Button
                variant="primary"
                className="btn-mini mt-auto w-full"
                onClick={() => {
                  setFontId(f.id)
                  goLab()
                }}
              >
                Use in Text Lab
              </Button>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
