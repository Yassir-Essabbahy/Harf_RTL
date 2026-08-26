import { useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Control, DropZone } from './ui'
import { parseBatchFile, parseBatchInput, type BatchEntry } from '../utils/batchParse'
import {
  ensureSuiteFonts, runTextChecks, STATUS_CLASS, STATUS_LABEL, statusRank,
  type CaseResult, type CheckLine,
} from '../utils/suite'
import { downloadBlob } from '../utils/atlas'

const CHUNK_SIZE = 4
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type StatusFilter = 'all' | 'issues'

const SAMPLE_INPUT = [
  'menu.start,ابدأ اللعبة',
  'menu.options,الإعدادات',
  'hud.health,"الصحة: 100"',
  'dialogue.intro,أين كنت؟ هل أنت مستعد؟!',
  'quest.title,(المهمة الجديدة)',
  'mixed.level,Level 01 — المرحلة الأولى',
].join('\n')

interface RowModel extends BatchEntry {
  result?: CaseResult
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export function BatchMode() {
  const { active, uploaded, weight } = useApp()
  const [rawInput, setRawInput] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [entries, setEntries] = useState<BatchEntry[]>([])
  const [skippedEmpty, setSkippedEmpty] = useState(0)
  const [results, setResults] = useState<Record<string, CaseResult>>({})
  const [running, setRunning] = useState(false)
  const [doneCount, setDoneCount] = useState(0)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const runIdRef = useRef(0)

  /* Live parse as the user types or loads a file — parsing is cheap. */
  const applyRaw = (raw: string, name: string | null) => {
    setRawInput(raw)
    setFileName(name)
    try {
      const parsed = parseBatchInput(raw)
      setEntries(parsed.entries)
      setSkippedEmpty(parsed.skippedEmpty)
      setParseError(null)
      setResults({})
      setExpanded(new Set())
    } catch (e) {
      setEntries([])
      setResults({})
      setParseError(e instanceof Error ? e.message : 'Could not parse input.')
    }
  }

  const onFile = (file: File) => {
    void parseBatchFile(file)
      .then((parsed) => {
        setParseError(null)
        setEntries(parsed.entries)
        setSkippedEmpty(parsed.skippedEmpty)
        setFileName(file.name)
        setResults({})
        setExpanded(new Set())
        return file.text()
      })
      .then((content) => setRawInput(content))
      .catch((e) => {
        setParseError(e instanceof Error ? e.message : `Could not read "${file.name}".`)
      })
  }

  const runBatch = async () => {
    if (entries.length === 0) return
    const id = ++runIdRef.current
    setRunning(true)
    setDoneCount(0)
    setResults(Object.fromEntries(entries.map((e) => [e.id, { status: 'pending', headline: 'Running…', details: [], checks: [] } as CaseResult])))
    await ensureSuiteFonts(active.family, weight)
    for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
      if (runIdRef.current !== id) return
      const chunk = entries.slice(i, i + CHUNK_SIZE)
      const chunkResults = await Promise.all(chunk.map((e) => runTextChecks(e.text, active.family, weight)))
      if (runIdRef.current !== id) return
      setResults((prev) => {
        const next = { ...prev }
        chunk.forEach((e, j) => { next[e.id] = chunkResults[j] })
        return next
      })
      setDoneCount(Math.min(i + CHUNK_SIZE, entries.length))
      await sleep(0)
    }
    if (runIdRef.current !== id) return
    setRunning(false)
  }

  const rows: RowModel[] = useMemo(() => {
    const list: RowModel[] = entries.map((e) => ({ ...e, result: results[e.id] }))
    return list.sort((a, b) => {
      const ra = statusRank(a.result?.status ?? 'pending')
      const rb = statusRank(b.result?.status ?? 'pending')
      if (ra !== rb) return ra - rb
      return entries.findIndex((e) => e.id === a.id) - entries.findIndex((e) => e.id === b.id)
    })
  }, [entries, results])

  const visible = rows.filter((r) => {
    if (query && !r.key.toLowerCase().includes(query.toLowerCase())) return false
    if (statusFilter === 'issues') {
      const s = r.result?.status ?? 'pending'
      return s === 'warn' || s === 'fail'
    }
    return true
  })

  const counted = entries.filter((e) => results[e.id] && results[e.id].status !== 'pending')
  const passN = counted.filter((e) => results[e.id].status === 'pass').length
  const warnN = counted.filter((e) => results[e.id].status === 'warn').length
  const failN = counted.filter((e) => results[e.id].status === 'fail').length

  const countsFor = (r: RowModel): { fail: number; warn: number } => {
    const checks = r.result?.checks ?? []
    return {
      fail: checks.filter((c) => c.status === 'fail').length,
      warn: checks.filter((c) => c.status === 'warn').length,
    }
  }

  const toggleRow = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const exportData = () => {
    return rows
      .filter((r) => r.result && r.result.status !== 'pending')
      .map((r) => ({
        key: r.key,
        text: r.text,
        overallStatus: r.result!.status,
        failCount: r.result!.checks.filter((c) => c.status === 'fail').length,
        warnCount: r.result!.checks.filter((c) => c.status === 'warn').length,
        checks: r.result!.checks.map((c) => ({ name: c.name, status: c.status, message: c.message })),
      }))
  }

  const exportJson = () => {
    const data = exportData()
    if (!data.length) return
    const payload = data.map(({ failCount: _f, warnCount: _w, ...rest }) => rest)
    downloadBlob('rtl-forge-batch-results.json', new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
  }

  const exportCsv = () => {
    const data = exportData()
    if (!data.length) return
    const lines = ['key,overall_status,fail_checks,warn_checks,text']
    for (const r of data) {
      lines.push([csvCell(r.key), r.overallStatus, String(r.failCount), String(r.warnCount), csvCell(r.text)].join(','))
    }
    downloadBlob('rtl-forge-batch-results.csv', new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }))
  }

  const hasResults = counted.length > 0
  const progressPct = entries.length ? Math.round((doneCount / entries.length) * 100) : 0

  return (
    <section id="batch-mode" className="w-full">
      <div className="grid gap-5 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">

        {/* Left column: input */}
        <div className="flex flex-col gap-5">
          <div className="panel flex flex-col">
            <div className="win-title">BATCH INPUT</div>
            <div className="p-4 flex flex-col gap-4">
              <DropZone
                onFile={onFile}
                accept=".csv,.json,.txt"
                dropLabel="Drop a .csv / .json / .txt batch file here"
                buttonLabel="⤒ Load batch file"
                hint="JSON array or key,text CSV · stays local"
                ariaLabel="Load batch file"
              />

              <Control label={`Entries (${entries.length})`} value={fileName ?? undefined}>
                <textarea
                  className="textarea font-arabic w-full"
                  dir="auto"
                  value={rawInput}
                  onChange={(e) => applyRaw(e.target.value, null)}
                  rows={10}
                  spellCheck={false}
                  aria-label="Batch entries, one per line as key,text"
                />
                <div className="mono text-xs text-muted mt-1">
                  Format per line: <span dir="ltr">key,text</span> or <span dir="ltr">key→text</span> (tab). JSON arrays work too.
                </div>
              </Control>

              {skippedEmpty > 0 && (
                <div className="mono text-xs text-warn">{skippedEmpty} empty line{skippedEmpty === 1 ? '' : 's'} skipped.</div>
              )}
              {parseError && (
                <div className="text-xs font-semibold text-danger" role="alert">{parseError}</div>
              )}

              <div className="flex flex-col gap-2 pt-3 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-primary w-full justify-center" onClick={() => void runBatch()} disabled={running || entries.length === 0}>
                  {running ? `Testing… ${doneCount}/${entries.length}` : `▶ Run Batch Test${entries.length ? ` (${entries.length})` : ''}`}
                </button>
                <button type="button" className="btn btn-ghost w-full justify-center" onClick={() => applyRaw(SAMPLE_INPUT, null)}>
                  Load sample entries
                </button>
              </div>

              <p className="mono text-xs text-muted m-0">
                Font under test: {uploaded ? uploaded.fileName : active.name}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: results */}
        <div className="flex flex-col gap-5">
          <div className="panel flex flex-col flex-1">
            <div className="win-title">RESULTS</div>
            <div className="p-4 flex flex-col gap-4">

              {!entries.length ? (
                <div className="surface p-6 mono text-sm text-muted text-center">
                  Nothing to test yet.
                  <br />
                  Paste key,text lines above or drop a CSV/JSON file.
                </div>
              ) : !hasResults && !running ? (
                <div className="surface p-6 mono text-sm text-muted text-center">
                  {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} loaded.
                  <br />
                  Run the batch to see results.
                </div>
              ) : (
                <>
                  <div className="surface p-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-bold">
                      Tested: {counted.length}/{entries.length}
                      {' · '}
                      <span className="text-ok">{passN} pass</span>
                      {' · '}
                      <span className="text-warn">{warnN} warn</span>
                      {' · '}
                      <span className={failN ? 'text-danger' : 'text-muted'}>{failN} fail</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="btn btn-mini btn-ghost" onClick={exportJson} disabled={!hasResults}>
                        ↓ JSON
                      </button>
                      <button type="button" className="btn btn-mini btn-ghost" onClick={exportCsv} disabled={!hasResults}>
                        ↓ CSV
                      </button>
                    </div>
                  </div>

                  {running && (
                    <div role="status">
                      <div className="progress">
                        <div style={{ width: `${progressPct}%` }} />
                      </div>
                      <div className="mono text-xs text-muted mt-1">Testing entry {Math.min(doneCount + 1, entries.length)} of {entries.length}…</div>
                    </div>
                  )}

                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 items-center">
                    <input
                      className="input"
                      placeholder="Filter by key…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Filter entries by key"
                    />
                    <div className="seg" role="group" aria-label="Status filter">
                      {([
                        ['all', 'All'],
                        ['issues', 'Warn & Fail'],
                      ] as [StatusFilter, string][]).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          className={`seg-btn ${statusFilter === value ? 'active' : ''}`}
                          aria-pressed={statusFilter === value}
                          onClick={() => setStatusFilter(value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {visible.length === 0 ? (
                    <div className="surface p-4 mono text-xs text-muted text-center">No entries match the current filter.</div>
                  ) : (
                    <>
                      <div className="hidden sm:grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_5.5rem_4rem_1.25rem] gap-3 px-3 mono text-xs text-muted uppercase tracking-wide">
                        <span>Key</span>
                        <span>Text</span>
                        <span>Status</span>
                        <span>F/W</span>
                        <span aria-hidden="true" />
                      </div>
                      <div className="flex flex-col gap-2">
                        {visible.map((r) => {
                          const isOpen = expanded.has(r.id)
                          const counts = countsFor(r)
                          const status = r.result?.status ?? 'pending'
                          return (
                            <div key={r.id} className="surface batch-row">
                              <button
                                type="button"
                                className="w-full text-left p-3 grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_5.5rem_4rem_1.25rem] gap-3 items-center cursor-pointer bg-transparent border-0"
                                onClick={() => toggleRow(r.id)}
                                aria-expanded={isOpen}
                                title={r.text.slice(0, 120)}
                              >
                                <span className="mono text-xs truncate" title={r.key}>{r.key}</span>
                                <span dir="rtl" lang="ar" className="font-arabic text-sm truncate" style={{ fontFamily: active.stack }}>
                                  {r.text.split('\n')[0]}
                                </span>
                                <span className={`mono text-xs font-bold ${STATUS_CLASS[status]}`} aria-live="polite">
                                  {STATUS_LABEL[status]}
                                </span>
                                <span className="mono text-xs text-muted">
                                  {counts.fail > 0 && <span className="text-danger">✕{counts.fail} </span>}
                                  {counts.warn > 0 && <span className="text-warn">⚠{counts.warn}</span>}
                                  {counts.fail === 0 && counts.warn === 0 && (status === 'pass' || status === 'pending') ? status === 'pass' ? '—' : '…' : ''}
                                </span>
                                <span className="mono text-xs text-muted" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
                              </button>

                              {isOpen && (
                                <div className="px-3 pb-3 flex flex-col gap-2">
                                  <div
                                    dir="rtl"
                                    lang="ar"
                                    className="field-sample max-h-32"
                                    style={{ fontFamily: active.stack, fontWeight: weight, textAlign: 'right' }}
                                  >
                                    {r.text}
                                  </div>
                                  {r.result && r.result.status !== 'pending' ? (
                                    <ul className="m-0 pl-5 mono text-xs text-muted flex flex-col gap-1">
                                      {r.result.checks.map((c: CheckLine, i: number) => (
                                        <li key={i}>
                                          <span className={
                                            c.status === 'fail' ? 'text-danger' : c.status === 'warn' ? 'text-warn' : c.status === 'info' ? 'text-acc3' : 'text-ok'
                                          }>
                                            [{c.name}]
                                          </span>{' '}
                                          {c.message}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="mono text-xs text-muted">Not tested yet.</div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}

                  <p className="text-xs text-muted leading-relaxed m-0">
                    Rows are sorted worst-first. Checks are the same local browser checks as the single-string
                    Arabic Test Suite — they do not predict how your font behaves inside Unity or another engine.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
