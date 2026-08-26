import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { SUITE_CASES } from '../data/suite'
import {
  ensureSuiteFonts, runTextChecks, STATUS_CLASS, STATUS_LABEL,
  type CaseResult, type RowStatus,
} from '../utils/suite'

export function TestSuite() {
  const { active, uploaded, weight } = useApp()
  const [results, setResults] = useState<Record<string, CaseResult>>({})
  const [running, setRunning] = useState(false)
  const runIdRef = useRef(0)

  const runAll = useCallback(async () => {
    const id = ++runIdRef.current
    setRunning(true)
    setResults(Object.fromEntries(SUITE_CASES.map((c) => [c.id, { status: 'pending' as RowStatus, headline: 'Running…', details: [], checks: [] }])))
    await ensureSuiteFonts(active.family, weight)
    for (const c of SUITE_CASES) {
      if (runIdRef.current !== id) return
      const result = await runTextChecks(c.text, active.family, weight)
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
