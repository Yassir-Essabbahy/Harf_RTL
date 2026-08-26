const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'What is RTL?',
    body: [
      'RTL stands for right-to-left. Arabic (like Hebrew and Persian) is written and read from the right side of the line to the left. A UI that ignores this puts punctuation, numbers and mixed English words in the wrong places.',
      'Setting direction: rtl on a text element fixes line order and alignment. It does not fix letter shaping by itself — that is a separate problem.',
    ],
  },
  {
    title: 'What is Arabic shaping?',
    body: [
      'Arabic letters change shape depending on where they sit in a word: isolated, initial, medial or final. The engine doing the layout picks the right glyph forms and joins them with correct connections.',
      'Browsers do this automatically through their text stack. Many game engines do not — Unity\'s default text components render Arabic letters disconnected or reversed unless you use an RTL-aware solution or a pre-shaped font asset.',
    ],
  },
  {
    title: 'Why can a font look correct here but fail in my game?',
    body: [
      'The browser shapes Arabic before Haraf Forge ever sees it. Your game may use a different shaping engine, an outdated font table, or no shaping at all.',
      'A font that renders perfectly in Chrome can still produce broken output inside Unity. Treat Haraf Forge as an early filter for obvious problems — not as proof your game is safe.',
    ],
  },
  {
    title: 'What does Pixel Preview actually simulate?',
    body: [
      'It rasterizes your text at a small native resolution (e.g. 320×180), then upscales it with smoothing disabled. That approximates how a pixel-art pipeline looks when fonts are rendered at low resolution.',
      'It is a visual approximation. Real pixel fonts are hand-drawn bitmap fonts; a vector font forced to low resolution will never look identical to one.',
    ],
  },
  {
    title: 'What does Unity Export actually export?',
    body: [
      'Text snippets, configuration values (font size, alignment, direction, colors) and the pixel settings you tested with — as copyable TMP notes, C# example code, JSON, or PNG.',
      'It does not generate TMP font assets, does not modify your font file, and does not solve Unity\'s Arabic shaping. It is a preparation sheet so nothing gets lost between testing and implementation.',
    ],
  },
  {
    title: 'What does Haraf Forge NOT guarantee?',
    body: [
      '- That your font contains every Arabic glyph (browser coverage checks are best-effort).',
      '- That browser rendering matches your engine\'s rendering.',
      '- That the test suite score predicts in-game quality — it only counts what can be verified locally.',
      '- That uploaded fonts are safe to ship; Haraf Forge never inspects licensing. Check your font\'s license before using it commercially.',
    ],
  },
]

export function Help() {
  return (
    <section className="w-full flex flex-col gap-5 max-w-4xl">
      <div className="panel">
        <div className="win-title">HELP / DOCS</div>
        <div className="p-5 flex flex-col gap-3 text-sm leading-relaxed">
          <p className="m-0">
            Short, developer-oriented answers about Arabic text in games.
            Nothing on this page is a substitute for testing inside your actual engine.
          </p>
        </div>
      </div>
      {SECTIONS.map((s) => (
        <div key={s.title} className="panel">
          <div className="win-title">{s.title}</div>
          <div className="p-4 flex flex-col gap-2 text-sm leading-relaxed">
            {s.body.map((line, i) => (
              <p key={i} className="m-0 whitespace-pre-line">{line}</p>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
