import { Section } from './ui'

const CARDS = [
  {
    title: 'RTL Direction',
    body: 'Arabic reads right-to-left and mixed-language text can create unexpected layout problems.',
    forms: 'ب ⇄ A',
  },
  {
    title: 'Arabic Shaping',
    body: 'Arabic characters change form depending on their position in a word.',
    forms: 'بـ ـبـ ـب',
  },
  {
    title: 'Game UI',
    body: 'Correct text rendering does not automatically mean correct UI layout and interaction.',
    forms: '⌗ ⌗ ⌗',
  },
]

/* Simulates the classic broken render: each glyph isolated in its own span,
   laid out in LTR order — disconnected and reversed, like a naive TextMesh. */
function BrokenArabic({ children }: { children: string }) {
  return (
    <span dir="ltr" className="font-arabic tracking-[0.35em]">
      {[...children].map((ch, i) => (
        <span key={i} className="inline-block">
          {ch}
        </span>
      ))}
    </span>
  )
}

export function Marketing() {
  return (
    <Section
      kicker="The Problem"
      title="Why Arabic text breaks in games"
      desc="Three failure modes every Arabic localization hits sooner or later."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.title} className="panel panel-hover p-5 fade-up">
            <div
              dir="rtl"
              className="h-10 w-10 rounded-lg flex items-center justify-center text-lg mb-4"
              style={{ background: 'var(--panel-2)', color: 'var(--accent)' }}
            >
              {c.forms}
            </div>
            <h3 className="font-bold mb-1.5">{c.title}</h3>
            <p className="text-sm text-muted">{c.body}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-14 mb-4 text-xl font-bold">Built for Game Developers</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel p-6" style={{ borderColor: 'color-mix(in srgb, var(--danger) 40%, var(--border))' }}>
          <div className="chip chip-danger mb-4">BAD · raw TextMesh</div>
          <div className="surface p-5 text-center text-xl">
            <BrokenArabic>النص العربي يبدو مكسوراً</BrokenArabic>
          </div>
          <p className="mt-4 text-sm text-muted">Arabic text looks broken — isolated glyphs, reversed order, no joining.</p>
        </div>
        <div className="panel p-6" style={{ borderColor: 'color-mix(in srgb, var(--accent) 40%, var(--border))' }}>
          <div className="chip chip-acc mb-4">GOOD · RTL Forge pipeline</div>
          <div dir="rtl" className="surface p-5 text-center text-xl font-arabic">
            النص العربي جاهز لواجهة لعبتك
          </div>
          <p className="mt-4 text-sm text-muted">Arabic text ready for your game UI — shaped, bidi-aware, pixel-checked.</p>
        </div>
      </div>
    </Section>
  )
}
