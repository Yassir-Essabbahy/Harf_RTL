import { useMemo } from 'react'
import { analyzeText, type CheckStatus } from '../utils/rtlCheck'

const ICON: Record<CheckStatus, string> = {
  pass: '✓',
  warn: '⚠',
  fail: '✕',
  info: 'ⓘ',
}

const ICON_CLASS: Record<CheckStatus, string> = {
  pass: 'text-ok',
  warn: 'text-warn',
  fail: 'text-danger',
  info: 'text-acc3',
}

export function CompatibilityCheck({
  text,
  direction,
  letterSpacing,
}: {
  text: string
  direction: 'rtl' | 'ltr'
  letterSpacing: number
}) {
  const checks = useMemo(() => analyzeText(text, direction, letterSpacing), [text, direction, letterSpacing])
  const passing = checks.filter((c) => c.status === 'pass').length

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-2)]" />
          RTL Compatibility Check
        </h3>
        <span className="mono text-xs text-muted">
          {passing}/{checks.length} passing
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-3 rounded-lg px-3 py-2 surface">
            <span className={`mono text-sm leading-5 ${ICON_CLASS[c.status]}`} aria-hidden="true">
              {ICON[c.status]}
            </span>
            <div className="min-w-0">
              <div className="text-xs font-semibold">{c.label}</div>
              <div className="text-xs text-muted mt-0.5">{c.detail}</div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Heuristic client-side checks — string analysis only, nothing leaves the browser.</p>
    </div>
  )
}
