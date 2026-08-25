import { useEffect, useState } from 'react'
import { Section } from './ui'

const LINES = [
  'ماذا تفعل هنا في هذا الوقت؟',
  'الأسواق أغلقت منذ زمن طويل يا غريب…',
  'خذ هذا المفتاح قبل أن تغرب الشمس.',
]

const STARS = [
  { left: '12%', top: '18%', size: 2, delay: '0s' },
  { left: '28%', top: '9%', size: 1, delay: '.6s' },
  { left: '46%', top: '22%', size: 2, delay: '1.2s' },
  { left: '63%', top: '12%', size: 1, delay: '.3s' },
  { left: '78%', top: '26%', size: 2, delay: '.9s' },
  { left: '88%', top: '15%', size: 1, delay: '1.5s' },
]

export function GameDemo() {
  const [idx, setIdx] = useState(0)
  const [shown, setShown] = useState('')

  useEffect(() => {
    setShown('')
    let i = 0
    const timer = setInterval(() => {
      i++
      setShown(LINES[idx].slice(0, i))
      if (i >= LINES[idx].length) clearInterval(timer)
    }, 42)
    return () => clearInterval(timer)
  }, [idx])

  const typing = shown.length < LINES[idx].length

  return (
    <Section
      kicker="Live Demo"
      title="From preview to game screen"
      desc="The same Arabic strings from the Text Lab, dropped into a retro Moroccan game dialogue."
    >
      <div className="mx-auto max-w-4xl">
        <div
          className="relative aspect-video rounded-2xl overflow-hidden bg-game scanlines vignette zellij-bg"
          style={{ border: '1px solid var(--border)' }}
        >
          {STARS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                background: '#e8e3f4',
                opacity: 0.7,
                animation: `blink ${1.4 + i * 0.2}s steps(1) infinite`,
                animationDelay: s.delay,
              }}
            />
          ))}

          <div
            className="absolute right-8 top-6 h-14 w-14 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #f7e8c0, #d9b06a 60%, transparent 78%)',
              boxShadow: '0 0 60px 12px rgba(224,168,62,.22)',
            }}
          />

          <div className="absolute left-4 top-4">
            <span className="chip font-arabic" dir="rtl" style={{ background: 'rgba(13,11,18,.7)' }}>
              مهمة: بوابة السوق
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: 'linear-gradient(180deg, transparent, rgba(4,8,6,.9))' }} />

          <div className="absolute inset-x-4 bottom-4 sm:inset-x-8 sm:bottom-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="mono text-[10px]" style={{ color: 'rgba(238,248,243,.7)' }}>
                HP ▓▓▓▓▓▓▓░░ 68/100
              </span>
              <span className="mono text-[10px] font-arabic" style={{ color: 'rgba(224,168,62,.95)' }}>
                رصيدك: 250
              </span>
            </div>

            <div className="game-dialog rounded-xl p-4 sm:p-5">
              <div
                className="absolute -top-3.5 right-6 px-3 py-1 rounded-md text-sm font-bold font-arabic"
                style={{ background: 'var(--accent)', color: '#06231c' }}
                dir="rtl"
              >
                الحاج
              </div>
              <p
                dir="rtl"
                className={`font-arabic text-lg sm:text-2xl leading-relaxed min-h-[2.6em] ${typing ? 'caret' : ''}`}
                style={{ fontFamily: "'Cairo','Noto Sans Arabic',sans-serif" }}
              >
                {shown}
              </p>
              <div className="mt-4 flex items-center justify-end gap-2" dir="rtl">
                <button className="btn btn-primary font-arabic" onClick={() => setIdx((v) => (v + 1) % LINES.length)}>
                  استمرار
                </button>
                <button
                  className="btn btn-ghost font-arabic"
                  style={{ color: '#eef8f3', borderColor: 'rgba(238,248,243,.3)' }}
                  onClick={() => setIdx((v) => (v - 1 + LINES.length) % LINES.length)}
                >
                  رجوع
                </button>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          Retro dialogue mock — typewriter text, scanlines and a two-button choice. The buttons cycle the script.
        </p>
      </div>
    </Section>
  )
}
