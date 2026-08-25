import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Control } from './ui'

export function UnityExport() {
  const state = useApp()
  const { 
    active, text, direction, align, fontSize,
    pixelMode, resIndex, scale, outline, shadow
  } = state

  const [copiedSetup, setCopiedSetup] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const RESOLUTIONS = [
    { label: '320 × 180', w: 320, h: 180 },
    { label: '256 × 144', w: 256, h: 144 },
    { label: '192 × 108', w: 192, h: 108 },
    { label: '160 × 90', w: 160, h: 90 },
  ]
  const res = RESOLUTIONS[resIndex] || RESOLUTIONS[0]

  const getTMPSettings = () => {
    return `RTL Forge — Unity TextMeshPro Setup\n\nFont:\n${(active as any).fileName || active.name}\n\nText:\n${text}\n\nDirection:\n${direction.toUpperCase()}\n\nAlignment:\n${align === 'start' ? (direction === 'rtl' ? 'Right' : 'Left') : align.charAt(0).toUpperCase() + align.slice(1)}\n\nFont Size:\n${fontSize}\n\nRecommended:\nEnable the appropriate RTL/Arabic text processing in your Unity project.`
  }

  const getCSharpCode = () => {
    const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, '\\n')
    const alignStr = align === 'start' ? (direction === 'rtl' ? 'Right' : 'Left') : align.charAt(0).toUpperCase() + align.slice(1)
    
    return `using TMPro;\nusing UnityEngine;\n\n// Arabic RTL shaping may require an RTL text solution/package\n// depending on your Unity setup.\npublic class RTLForgeExample : MonoBehaviour\n{\n    [SerializeField] private TMP_Text textComponent;\n\n    private void Start()\n    {\n        textComponent.text = "${escapedText}";\n        textComponent.alignment = TextAlignmentOptions.${alignStr};\n        textComponent.fontSize = ${fontSize};\n    }\n}`
  }

  const exportJSON = () => {
    const data = {
      font: (active as any).fileName || active.name,
      text,
      direction,
      alignment: align === 'start' ? (direction === 'rtl' ? 'right' : 'left') : align,
      fontSize,
      pixelMode,
      resolution: `${res.w}x${res.h}`,
      scale,
      outline,
      shadow
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rtl-forge-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPNG = () => {
    const canvas = document.querySelector('#pixel-preview-canvas') as HTMLCanvasElement
    if (!canvas) {
      alert("Pixel Preview unavailable. Please visit Pixel Preview first to generate the canvas.")
      return
    }
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'rtl-forge-preview.png'
    a.click()
  }

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      alert('Clipboard unavailable')
    }
  }

  return (
    <section id="unity-export" className="w-full">
      <div className="grid gap-5 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        
        <div className="flex flex-col gap-5">
          <div className="panel flex flex-col">
            <div className="win-title">
              UNITY EXPORT
            </div>
            <div className="p-5 flex flex-col gap-5">
              
              <div className="text-sm font-semibold text-center pb-2 border-b border-silver-lo">
                Prepare your tested Arabic text for Unity.
              </div>

              <div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">FONT</div>
                <div className="text-sm mono text-acc">
                  {(active as any).fileName || active.name || <span className="text-muted">No font selected.</span>}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">TEXT</div>
                <div className="p-3 border border-border surface font-arabic text-right max-h-32 overflow-auto" dir={direction} style={{ fontSize: '18px' }}>
                  {text || <span className="text-muted text-sm">No text to export.</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">TEXT SETTINGS</div>
                  <div className="space-y-1">
                    <Control label="Direction" value={direction.toUpperCase()}><div/></Control>
                    <Control label="Alignment" value={align === 'start' ? (direction === 'rtl' ? 'Right' : 'Left') : align.charAt(0).toUpperCase() + align.slice(1)}><div/></Control>
                    <Control label="Font Size" value={`${fontSize} px`}><div/></Control>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">PIXEL SETTINGS</div>
                  <div className="space-y-1">
                    <Control label="Pixel Mode" value={pixelMode ? 'ON' : 'OFF'}><div/></Control>
                    <Control label="Resolution" value={`${res.w} × ${res.h}`}><div/></Control>
                    <Control label="Scale" value={`${scale}x`}><div/></Control>
                    <Control label="Outline" value={`${outline} px`}><div/></Control>
                    <Control label="Shadow" value={shadow ? 'ON' : 'OFF'}><div/></Control>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="panel flex flex-col flex-1">
            <div className="win-title">EXPORT</div>
            <div className="p-5 flex flex-col gap-4">
              
              <button className="btn btn-primary w-full py-2" onClick={() => copyToClipboard(getTMPSettings(), setCopiedSetup)}>
                {copiedSetup ? 'Copied!' : 'Copy TMP Settings'}
              </button>

              <button className="btn btn-ghost w-full py-2" onClick={() => copyToClipboard(getCSharpCode(), setCopiedCode)}>
                {copiedCode ? 'Copied!' : 'Copy C# Setup'}
              </button>

              <button className="btn btn-ghost w-full py-2" onClick={exportJSON}>
                Export Settings (.json)
              </button>

              <button className="btn btn-ghost w-full py-2" onClick={exportPNG}>
                Export Preview PNG
              </button>

            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
