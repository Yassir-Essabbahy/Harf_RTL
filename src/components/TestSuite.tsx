import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { SUITE_CASES, type SuiteCase } from '../data/suite'
import { containsArabic, coverageCheck, fontSpec, inkPixels, shapingProbe } from '../utils/glyphs'
import { ensureFontsLoaded } from '../utils/canvasText'

type RowStatus = 'pending' | 'pass' | 'warn' | 'fail'
type SubStatus = 'pass' | 'warn' | 'fail' | 'info'

interface CaseResult {
  status: RowStatus
  headline: string
  details: string[]
}

const STATUS_LABEL: Record<RowStatus, string> = {
  pending: '…',
  pass: '✓ PASS',
  warn: '⚠ WARNING',
  fail: '✕ FAIL',
}

const STATUS_CLASS: Record<RowStatus, string> = {
  pending: 'text-muted',
  pass: 'text-ok',
  warn: 'text-warn',
  fail: 'text-danger',
}

function worst(statuses: SubStatus[]): Exclude<RowStatus, 'pending'> {
  if (statuses.includes('fail')) return 'fail'
  if (statuses.includes('warn')) return 'warn'
  return 'pass'
}

const STATUS_HEADLINE: Record<Exclude<RowStatus, 'pending'>, string> = {
  pass: 'No problems detected',
  warn: 'Needs attention',
  fail: 'Failed to render',
}

async function runCase(c: SuiteCase, family: string, weight: number): Promise<CaseResult> {
  const details: string[] = []
  const statuses: SubStatus[] = []

  /* 1. Rendering: does the browser paint any ink for this string? */
  const lines = c.text.split('\n')
  let ink = 0
  let measurable = true
  for (const line of lines) {
    const n = inkPixels(line, family, weight)
    if (n === null) measurable = false
    else ink += n
  }
  if (!measurable) {
    statuses.push('warn')
    details.push('Rendering could not be measured automatically.')
  } else if (ink === 0) {
    statuses.push('fail')
    details.push('Nothing was drawn for this string.')
  } else {
    statuses.push('pass')
    details.push(`Rendered by the browser (${ink} px of ink).`)
  }

  /* 2. Shaping: contextual forms make joined text narrower than spaced text. */
  if (c.shaping && containsArabic(c.text)) {
    const shaped = shapingProbe(family, weight)
    if (shaped === null) {
      statuses.push('warn')
      details.push('Shaping could not be verified automatically.')
    } else if (shaped) {
      details.push('Contextual letter forms applied (verified by width comparison).')
    } else {
      statuses.push('warn')
      details.push('Joined letters measured like isolated ones — letters appear disconnected.')
    }
  }

  /* 3. Coverage: what the font subsystem reports about glyph availability. */
  const cov = await coverageCheck(family, weight, c.text)
  if (cov === null) {
    statuses.push('info')
    details.push('Glyph coverage could not be verified automatically.')
  } else if (cov) {
    details.push('Font system reports coverage for this string.')
  } else {
    statuses.push('warn')
    details.push('Font may be missing some glyphs — fallback rendering was likely used.')
  }

  /* Bidi ordering cannot be verified reliably; always recommend a visual check. */
  details.push('Bidi order and visual quality need a quick human look.')

  return { status: worst(statuses), headline: STATUS_HEADLINE[worst(statuses)], details }
}

export function TestSuite() {
  const { active, uploaded, weight } = useApp()
  const [results, setResults] = useState<Record<string, CaseResult>>({})
  const [running, setRunning] = useState(false)
  const runIdRef = useRef(0)

  const runAll = useCallback(async () => {
    const id = ++runIdRef.current
    setRunning(true)
    setResults(Object.fromEntries(SUITE_CASES.map((c) => [c.id, { status: 'pending' as RowStatus, headline: 'Running…', details: [] }])))
    await ensureFontsLoaded([`${fontSpec(active.family, weight, 32)}, serif`])
    for (const c of SUITE_CASES) {
      if (runIdRef.current !== id) return
      const result = await runCase(c, active.family, weight)
      if (runIdRef.current !== id) return
      setResults((prev) => ({ ...prev, [c.id]: result }))
    }
    setRunning(false)
  }, [active.family, weight])

  useEffect(() => {
    void runAll()
  }, [runAll])

  const passed = SUITE_CASES.filter((c) => results[c.id]?.status === 'pass').length
  const warned = SUITE_CASES.filter((c) => results[c.id]?.status === 'warn').length
  const failed = SUITE_CASES.filter((c) => results[c.id]?.status === 'fail').length

  return (
    <section id="test-suite" className="w-full">
      <div className="panel">
        <div className="win-title flex justify-between items-center gap-2">
          <span>ARABIC TEST SUITE</span>
          <button type="button" className="win-btn whitespace-nowrap px-2" onClick={() => void runAll()} disabled={running}>
            {running ? 'Running…' : '▶ Run Full Arabic Test'}
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div className="surface p-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold">Test Results: {passed}/{SUITE_CASES.length} passed</div>
              <div className="mono text-xs mt-0.5">
                <span className="text-warn">{warned} warning{warned === 1 ? '' : 's'}</span>
                {' · '}
                <span className={failed ? 'text-danger' : 'text-muted'}>{failed} failure{failed === 1 ? '' : 's'}</span>
              </div>
            </div>
            <div className="text-xs text-muted leading-relaxed max-w-md">
              Font under test: <span className="mono">{uploaded ? uploaded.fileName : active.name}</span>.
              Checks run locally in this browser only — they do not predict how your font behaves inside Unity or another engine.
            </div>
          </div>

          {!running && failed > 0 && (
            <div className="surface p-3 text-sm text-danger font-semibold" role="alert">
              At least one test failed to render. Check the failing cases below.
            </div>
          )}

          <div className="flex flex-col gap-3">
            {SUITE_CASES.map((c) => {
              const r: CaseResult | undefined = results[c.id]
              return (
                <div key={c.id} className="surface p-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`mono text-sm font-bold ${STATUS_CLASS[r?.status ?? 'pending']}`} aria-live="polite">
                          {STATUS_LABEL[r?.status ?? 'pending']}
                        </span>
                        <span className="text-sm font-semibold">{c.label}</span>
                        <span className="text-xs text-muted">— {c.category}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    dir="rtl"
                    lang="ar"
                    className="field-sample"
                    style={{
                      fontFamily: active.stack,
                      fontWeight: weight,
                      textAlign: 'right',
                    }}
                  >
                    {c.text}
                  </div>

                  {r && r.status !== 'pending' && (
                    <ul className="m-0 pl-5 mono text-xs text-muted flex flex-col gap-1">
                      {r.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Scoring counts only what these checks can actually verify. A passing result means the browser rendered
            the string and reported no missing glyphs — it is not a scientifically accurate compatibility score,
            and browser rendering is never identical to every game-engine configuration.
          </p>
        </div>
      </div>
    </section>
  )
}
