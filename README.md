# Haraf Forge

Arabic tools for game developers.

> **Test Arabic before it reaches your game.**

Haraf Forge is a browser-based developer toolkit for testing Arabic/RTL text,
fonts, and pixel rendering before they reach your game engine. Everything
runs locally in your browser.

## Features

- **RTL Text Lab** — test Arabic and RTL text: direction, alignment, shaping,
  mixed Arabic/Latin strings, numbers, punctuation and diacritics, with copyable CSS.
- **Font Lab** — load local `.ttf` / `.otf` / `.woff` fonts (drag-and-drop or picker)
  and see how they render Arabic. Uploaded fonts stay on your machine.
- **Arabic Test Suite** — run a standardized battery of 12 Arabic rendering tests
  (connected letters, diacritics, digits, mixed scripts, parentheses, dialogue…)
  against your current font.
- **Batch Mode** — test many strings at once: paste `key,text` lines or drop a
  CSV/JSON file, then sort, filter and export results as JSON/CSV.
- **Pixel Preview** — preview Arabic text with pixel-style rendering: low
  resolutions (320×180 … 160×90), 1–4× nearest-neighbor scaling, outlines,
  shadows and colors.
- **Unity Export** — carry your tested text and settings into Unity: copy TMP
  preparation notes, C# example code (with `isRightToLeft`), export JSON
  settings or a PNG of the pixel preview.

## Tech Stack

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescript.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- Custom Windows 95/98-style theme (plain CSS custom properties)
- Canvas 2D API for pixel rasterization

No backend. No frameworks beyond React. Built-in font samples are loaded from
Google Fonts at runtime.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build    # type-checks then bundles into dist/
npm run preview  # serve the production build locally
```

The output in `dist/` is fully static — deployable to any static host.

## Privacy

Uploaded fonts are parsed **entirely in your browser** using the FontFace API.
They are never uploaded to any server, and no analytics or tracking exist in
this project.

## Limitations — Read This

Be honest with yourself about what a browser tool can and cannot verify:

- **Browser rendering ≠ game rendering.** Browsers shape Arabic correctly out
  of the box; many game engines (including Unity's default text stack) do not.
  A perfect result here does not guarantee correct output in your engine.
- **Glyph coverage detection is best-effort.** The browser cannot reliably
  enumerate every glyph in your font. The Test Suite reports what the font
  subsystem claims per string — treat warnings as "check manually".
- **Pixel Preview is an approximation.** It simulates low-resolution
  rasterization plus nearest-neighbor upscaling. Real bitmap/pixel fonts are
  hand-drawn and will differ.
- **Test Suite scores are not scientific compatibility ratings.** They count
  only what Haraf Forge can actually verify locally (rendering succeeded,
  shaping metrics look sane, the font subsystem reports coverage).
- **Unity Export is a reference sheet**, not a solution: it does not generate
  TMP font assets, pre-shape Arabic text, or fix engine-side bidi/shaping.
