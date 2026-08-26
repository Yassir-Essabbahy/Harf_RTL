import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react'
import { copyToClipboard } from '../utils/clipboard'

/* Drag-and-drop + click-to-pick file input, shared by Font Lab and Batch Mode. */
export function DropZone({
  onFile,
  accept,
  dropLabel,
  buttonLabel,
  hint,
  ariaLabel,
}: {
  onFile: (file: File) => void
  accept: string
  dropLabel: string
  buttonLabel: string
  hint?: string
  ariaLabel?: string
}) {
  const [over, setOver] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    setOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      className={`surface p-4 flex flex-col items-center gap-2 text-center ${over ? 'drop-active' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
    >
      <span className="mono text-xs text-muted">{dropLabel}</span>
      <button type="button" className="btn btn-primary w-full justify-center" onClick={() => ref.current?.click()}>
        {buttonLabel}
      </button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
        aria-label={ariaLabel ?? buttonLabel}
      />
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
      <span className="text-xs font-semibold">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`switch ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="knob" />
      </button>
    </label>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
}) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          className={`seg-btn ${o.value === value ? 'active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Control({
  label,
  value,
  children,
}: {
  label: string
  value?: string | number
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</span>
        {value !== undefined && (
          <span className="mono text-xs text-acc" aria-live="polite">
            {value}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

/* Copy button with visible feedback and real error handling. */
export function CopyButton({
  getText,
  label,
  variant = 'ghost',
  className = '',
}: {
  getText: () => string
  label: string
  variant?: 'ghost' | 'primary'
  className?: string
}) {
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle')
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  const onCopy = () => {
    void copyToClipboard(getText()).then((ok) => {
      setState(ok ? 'ok' : 'err')
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setState('idle'), 1600)
    })
  }

  return (
    <button
      type="button"
      className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${className}`}
      onClick={onCopy}
    >
      {state === 'ok' ? '✓ Copied!' : state === 'err' ? '✕ Copy failed' : label}
    </button>
  )
}
