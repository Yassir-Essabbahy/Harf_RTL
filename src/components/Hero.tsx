const STATS = ['5 Arabic fonts', '6 game presets', 'Pixel preview', 'PNG atlas export', '100% client-side']

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden zellij-bg">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute -left-16 top-1/2 -translate-y-1/2 text-[26rem] leading-none font-bold"
        style={{ fontFamily: "'Amiri', serif", color: 'var(--accent)', opacity: 0.05 }}
      >
        ع
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute -right-10 -top-10 text-[20rem] leading-none font-bold"
        style={{ fontFamily: "'Amiri', serif", color: 'var(--accent-3)', opacity: 0.04 }}
      >
        ح
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
        <div className="kicker fade-up" style={{ animationDelay: '0ms' }}>
          Arabic Game Dev Toolkit · Prototype
        </div>
        <h1
          className="fade-up mt-5 text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08]"
          style={{ animationDelay: '70ms' }}
        >
          Arabic text that
          <br />
          <span className="text-acc">actually works</span> in games.
        </h1>
        <p className="fade-up mt-5 mx-auto max-w-2xl text-muted text-base sm:text-lg" style={{ animationDelay: '140ms' }}>
          Test, preview and prepare Arabic RTL text for your game before it breaks inside Unity.
        </p>
        <div className="fade-up mt-8 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '210ms' }}>
          <a href="#text-lab" className="btn btn-primary">
            Open Text Lab <span aria-hidden="true">→</span>
          </a>
          <a href="#fonts" className="btn btn-ghost">
            Explore Fonts
          </a>
        </div>
        <div className="fade-up mt-10 flex flex-wrap items-center justify-center gap-2" style={{ animationDelay: '280ms' }}>
          {STATS.map((s) => (
            <span key={s} className="chip mono">
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="zellij-strip mx-auto max-w-7xl" />
    </section>
  )
}
