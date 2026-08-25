# RTL Forge — Arabic Game Dev Toolkit

A browser-based prototype for game developers who need Arabic / RTL text to work in games
(especially Unity). Test rendering, preview fonts, detect common RTL problems, check a
pixel-art preview, and generate a font-atlas prototype with PNG + character-list export.

**100% client-side.** No backend, no AI, no accounts, no tracking.

## Quick start

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build in dist/
npm run preview  # serve the production build
```

## What's inside

- **Text Lab** — Arabic editor with font / size / weight / spacing / line-height /
  alignment / direction controls, background modes and a live RTL preview.
- **RTL Compatibility Check** — heuristic client-side rules (Arabic detection, bidi
  mixing, diacritics, letter-spacing warnings…). Not AI, just string analysis.
- **Pixel Preview** — text rasterized small on canvas, upscaled with smoothing off:
  integer sizes, crisp edges, optional pixel grid, game-style backgrounds.
- **Font Lab** — Noto Sans Arabic, Cairo, Amiri, IBM Plex Sans Arabic, plus the
  fictional **RTL Forge Pixel** rendered through the pixel pipeline.
- **Unity Font Export (prototype)** — pick font, size, character preset, padding and
  atlas size; generates a canvas atlas, exports PNG and a character list `.txt`.
  Visual reference only — not a production TextMeshPro asset.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS v4 · HTML Canvas.
Arabic web fonts load from Google Fonts with system fallbacks.

## Project structure

```
src/
  App.tsx                    # context (active font, theme) + page assembly
  index.css                  # theme tokens, Zellij patterns, buttons, panels
  data/fonts.ts              # font definitions
  data/charsets.ts           # Arabic character groups + export presets
  data/presets.ts            # Text Lab example presets
  utils/rtlCheck.ts          # compatibility check rules
  utils/canvasText.ts        # pixel rasterization helpers
  utils/atlas.ts             # atlas generation + exports
  components/                # Navbar, Hero, TextLab, FontLab, UnityExport,
                             # Marketing, GameDemo, Docs, Footer, ui primitives
```

## Scope

Prototype / MVP. No Unity integration, no backend, no AI, no auth. Tuning happens in
`src/index.css` (tokens) and `src/data/*` (fonts, presets, character sets).
"# Harf_RTL" 
