export interface BatchEntry {
  id: string
  key: string
  text: string
}

export interface ParseResult {
  entries: BatchEntry[]
  skippedEmpty: number
  source: 'json' | 'csv' | 'lines'
}

let parseCounter = 0

function makeId(): string {
  parseCounter += 1
  return `b${Date.now().toString(36)}-${parseCounter}`
}

/* Minimal CSV cell reader for simple files: supports double-quoted cells
   with commas/newlines inside and "" escapes. Not full RFC4180. */
function splitCsvLine(line: string, delimiter: ','): string[] {
  const cells: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++ }
        else inQuotes = false
      } else cur += ch
    } else if (ch === '"' && cur === '') {
      inQuotes = true
    } else if (ch === delimiter) {
      cells.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  cells.push(cur)
  return cells.map((c) => c.trim())
}

interface RawItem {
  key: string
  text: string
}

function fromJsonObject(item: unknown): RawItem | null {
  if (typeof item !== 'object' || item === null) return null
  const rec = item as Record<string, unknown>
  const key = rec.key ?? rec.id ?? rec.name
  const text = rec.text ?? rec.value ?? rec.string
  if ((typeof key !== 'string' && typeof key !== 'number') || typeof text !== 'string') return null
  return { key: String(key), text }
}

/* Auto-detects JSON array vs `key,text` / `key<TAB>text` lines.
   Lines without a delimiter become keyless entries (key = line-N).
   Entries whose text is empty are counted as skipped, not tested. */
export function parseBatchInput(raw: string): ParseResult {
  const trimmed = raw.trim()
  if (!trimmed) return { entries: [], skippedEmpty: 0, source: 'lines' }

  let items: RawItem[] = []
  let source: ParseResult['source'] = 'lines'
  let skippedEmpty = 0

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    source = 'json'
    let parsed: unknown
    try {
      parsed = JSON.parse(trimmed)
    } catch {
      throw new Error('Input looks like JSON but could not be parsed. Expected an array of { "key": "...", "text": "..." } objects.')
    }
    const list = Array.isArray(parsed) ? parsed : [parsed]
    for (const item of list) {
      const entry = fromJsonObject(item)
      if (!entry) throw new Error('JSON entries must be objects with at least a "text" field and optionally a "key".')
      items.push(entry)
    }
  } else {
    const lines = trimmed.split(/\r?\n/)
    const hasTabs = lines.some((l) => l.includes('\t'))
    const hasComma = lines.some((l) => l.includes(','))
    /* Skip a conventional header row so it does not become fake data. */
    const firstCells = hasComma && !hasTabs ? splitCsvLine(lines[0], ',') : lines[0]?.split('\t') ?? []
    const startsWithHeader =
      firstCells.length >= 2 &&
      firstCells.slice(0, 2).every((c) => /^key$|^id$|^name$/i.test(c.trim()) || /^text$|^value$|^string$/i.test(c.trim()))
    const bodyLines = startsWithHeader ? lines.slice(1) : lines
    if (bodyLines.length === 0) return { entries: [], skippedEmpty: 0, source: 'csv' }
    if (hasTabs) {
      source = 'csv'
      for (const line of bodyLines) {
        const idx = line.indexOf('\t')
        if (idx === -1) items.push({ key: '', text: line })
        else items.push({ key: line.slice(0, idx), text: line.slice(idx + 1) })
      }
    } else if (hasComma) {
      source = 'csv'
      for (const line of bodyLines) {
        const cells = splitCsvLine(line, ',')
        if (cells.length >= 2) items.push({ key: cells[0], text: cells.slice(1).join(',') })
        else items.push({ key: '', text: line })
      }
    } else {
      for (const line of bodyLines) items.push({ key: '', text: line })
    }
  }

  const entries: BatchEntry[] = []
  let unnamed = 0
  for (const item of items) {
    if (!item.text.trim()) {
      skippedEmpty++
      continue
    }
    const key = item.key.trim() || `entry-${entries.length + 1 + unnamed++}`
    entries.push({ id: makeId(), key, text: item.text })
  }

  return { entries, skippedEmpty, source }
}

const BATCH_EXT = /\.(csv|json|txt)$/i

/* Reads an uploaded batch file; throws readable errors on bad type/content. */
export async function parseBatchFile(file: File): Promise<ParseResult> {
  if (!BATCH_EXT.test(file.name)) {
    throw new Error(`Unsupported file "${file.name}". Please use .csv, .json or .txt.`)
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error(`"${file.name}" is too large (max 5 MB).`)
  }
  const content = await file.text()
  const result = parseBatchInput(content)
  result.source = /\.json$/i.test(file.name) ? 'json' : /\.csv$/i.test(file.name) ? 'csv' : result.source
  return result
}
