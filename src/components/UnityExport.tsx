import { useApp } from '../context/AppContext'
import { Control } from './ui'
import { CopyButton } from './ui'
import { RESOLUTIONS } from './PixelPreview'
import { drawPixelText } from '../utils/canvasText'
import { downloadBlob } from '../utils/atlas'

function hexToColor32(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return 'new Color32(255, 255, 255, 255)'
  const n = parseInt(m[1], 16)
  return `new Color32(${(n >> 16) & 0xff}, ${(n >> 8) & 0xff}, ${n & 0xff}, 255)`
}

export function UnityExport() {
  const {
    active, uploaded,
    text, fontSize, weight, direction, align,
    pixelMode, resIndex, scale, outline, shadow,
    textColor, bgColor,
  } = useApp()

  const res = RESOLUTIONS[resIndex] ?? RESOLUTIONS[0]
  const hasText = text.trim().length > 0

  const alignStr =
    align === 'center' ? 'Center' : align === 'start'
      ? (direction === 'rtl' ? 'Right' : 'Left')
      : (direction === 'rtl' ? 'Left' : 'Right')

  const fontLabel = uploaded ? uploaded.fileName : active.name

  const getTMPSettings = () => {
    return [
      'Haraf Forge — Unity / TextMeshPro preparation sheet',
      '',
      `Font file: ${fontLabel}`,
      `Text (${text.length} chars):`,
      text || '(empty)',
      '',
      'Suggested TMP settings:',
      `- Font Size: ${fontSize}`,
      `- Alignment: ${alignStr}`,
      `- Is Right To Left: ${direction === 'rtl' ? 'true (enable RTL in TMP)' : 'false'}`,
      `- Vertex Color: ${textColor.toUpperCase()}`,
      ...(pixelMode
        ? [
            '',
            'Pixel look (from Pixel Preview):',
            `- Reference resolution: ${res.w} × ${res.h}`,
            `- Scale: ${scale}×`,
            `- Outline: ${outline} px`,
            `- Shadow: ${shadow ? 'on' : 'off'}`,
          ]
        : []),
      '',
      'Note: Unity does not shape Arabic correctly by default. Use an Arabic/RTL',
      'solution or a pre-shaped font asset — this sheet only carries your tested',
      'values over.',
    ].join('\n')
  }

  const getCSharpCode = () => {
    const escapedText = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
    return [
      'using TMPro;',
      'using UnityEngine;',
      '',
      '// Requires TextMeshPro. Unity does not shape Arabic by default;',
      '// pair this with an RTL/Arabic solution or a pre-shaped font asset.',
      `// Font used for testing: ${fontLabel}`,
      'public class HarafForgeExample : MonoBehaviour',
      '{',
      '    [SerializeField] private TMP_Text textComponent;',
      '',
      '    private void Start()',
      '    {',
      `        textComponent.text = "${escapedText}";`,
      `        textComponent.fontSize = ${fontSize}f;`,
      `        textComponent.alignment = TextAlignmentOptions.${alignStr};`,
      `        textComponent.isRightToLeft = ${direction === 'rtl' ? 'true' : 'false'};`,
      `        textComponent.color = ${hexToColor32(textColor)};`,
      '    }',
      '}',
    ].join('\n')
  }

  const exportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      font: fontLabel,
      fontFamily: active.family,
      text,
      direction,
      alignment: alignStr.toLowerCase(),
      fontSize,
      fontWeight: weight,
      textColor,
      pixel: {
        mode: pixelMode,
        resolution: `${res.w}x${res.h}`,
        scale,
        outlinePx: outline,
        shadow,
        bgColor,
      },
    }
    downloadBlob('haraf-forge-settings.json', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  }

  /* Renders the current pixel configuration into a detached canvas so the
     export works without the Pixel Preview tab being mounted. */
  const exportPNG = () => {
    if (!hasText) return
    try {
      const canvas = document.createElement('canvas')
      drawPixelText(canvas, {
        text,
        family: active.family,
        weight: 600,
        fontSize,
        scale,
        lineHeight: 1.6,
        align,
        direction,
        color: textColor,
        outline,
        outlineColor: '#000000',
        shadow,
        shadowColor: 'rgba(0,0,0,0.6)',
        bgColor,
        width: res.w,
        height: res.h,
      })
      canvas.toBlob((blob) => {
        if (blob) downloadBlob('haraf-forge-preview.png', blob)
      }, 'image/png')
    } catch {
      window.alert('Could not generate the PNG in this browser.')
    }
  }

  return (
    <section id="unity-export" className="w-full">
      <div className="grid gap-5 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">

        <div className="flex flex-col gap-5">
          <div className="panel flex flex-col">
            <div className="win-title">UNITY EXPORT</div>
            <div className="p-5 flex flex-col gap-5">

              <div className="text-sm font-semibold pb-2" style={{ borderBottom: '1px solid var(--silver-lo)' }}>
                Your tested configuration, ready to carry into Unity.
              </div>

              {!hasText && (
                <div className="surface p-3 text-sm text-muted">
                  Nothing to export yet — write some text in RTL Text Lab or Pixel Preview first.
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">FONT</div>
                <div className="text-sm mono text-acc break-all">{fontLabel}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">TEXT</div>
                <div
                  className="p-3 surface font-arabic max-h-32 overflow-auto"
                  dir={direction}
                  style={{ fontSize: '18px', textAlign: direction === 'rtl' ? 'right' : 'left' }}
                >
                  {hasText ? (
                    text
                  ) : (
                    <span className="text-muted text-sm">No text to export.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">TEXT SETTINGS</div>
                  <div className="space-y-1">
                    <Control label="Direction" value={direction.toUpperCase()}><div /></Control>
                    <Control label="Alignment" value={alignStr}><div /></Control>
                    <Control label="Font Size" value={`${fontSize}`}><div /></Control>
                    <Control label="Weight" value={weight}><div /></Control>
                    <Control label="Text Color" value={textColor.toUpperCase()}><div /></Control>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">PIXEL SETTINGS</div>
                  <div className="space-y-1">
                    <Control label="Pixel Mode" value={pixelMode ? 'ON' : 'OFF'}><div /></Control>
                    <Control label="Resolution" value={`${res.w} × ${res.h}`}><div /></Control>
                    <Control label="Scale" value={`${scale}x`}><div /></Control>
                    <Control label="Outline" value={`${outline} px`}><div /></Control>
                    <Control label="Shadow" value={shadow ? 'ON' : 'OFF'}><div /></Control>
                    <Control label="Background" value={bgColor.toUpperCase()}><div /></Control>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                This is a preparation/reference step, not a full Unity Arabic pipeline. Unity's default text stack does not shape or order Arabic correctly — plan for an RTL solution or a pre-shaped TMP font asset.
              </p>

            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="panel flex flex-col flex-1">
            <div className="win-title">EXPORT</div>
            <div className="p-5 flex flex-col gap-4">
              <CopyButton
                getText={getTMPSettings}
                label="Copy TMP Settings"
                variant="primary"
                className="w-full py-2"
              />
              <CopyButton getText={getCSharpCode} label="Copy C# Setup" className="w-full py-2" />
              <button type="button" className="btn btn-ghost w-full py-2" onClick={exportJSON}>
                Export Settings (.json)
              </button>
              <button type="button" className="btn btn-ghost w-full py-2" onClick={exportPNG} disabled={!hasText}>
                Export Preview PNG
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
