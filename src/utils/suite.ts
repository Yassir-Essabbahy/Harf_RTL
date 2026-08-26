import { containsArabic, coverageCheck, fontSpec, inkPixels, shapingProbe } from './glyphs'
import { ensureFontsLoaded } from './canvasText'

export type RowStatus = 'pending' | 'pass' | 'warn' | 'fail'
export type CheckStatus = 'pass' | 'warn' | 'fail' | 'info'

export interface CheckLine {
  name: string
  status: CheckStatus
  message: string
}

export interface CaseResult {
  status: RowStatus
  headline: string
  details: string[]
  checks: CheckLine[]
}

export const STATUS_LABEL: Record<RowStatus, string> = {
  pending: '…',
  pass: '✓ PASS',
  warn: '⚠ WARNING',
  fail: '✕ FAIL',
}

export const STATUS_CLASS: Record<RowStatus, string> = {
  pending: 'text-muted',
  pass: 'text-ok',
  warn: 'text-warn',
  fail: 'text-danger',
}

const STATUS_HEADLINE: Record<Exclude<RowStatus, 'pending'>, string> = {
  pass: 'No problems detected',
  warn: 'Needs attention',
  fail: 'Failed to render',
}

/* Worst-first ordering used by the single suite score and the batch table. */
export function statusRank(s: RowStatus): number {
  return s === 'fail' ? 0 : s === 'warn' ? 1 : s === 'pending' ? 2 : 3
}

function worst(statuses: CheckStatus[]): Exclude<RowStatus, 'pending'> {
  if (statuses.includes('fail')) return 'fail'
  if (statuses.includes('warn')) return 'warn'
  return 'pass'
}

/* Detects double-encoded text (UTF-8 bytes misread as Latin-1/Windows-1252),
   e.g. 'Ù…Ø±Ø­Ø¨Ø§' where 'مرحبا' was intended. Signature: runs of Windows-1252
   "lead" characters immediately followed by continuation-range chars or the
   smart-punctuation those bytes map to. Also flags U+FFFD replacement chars.
   Three or more pairs make accidental accented Latin (déjà, Grüße) vanishingly
   unlikely — those never produce lead+continuation adjacencies. */
const MOJIBAKE_PAIR =
  /[\u00C0-\u00DF][\u0080-\u00BF\u2018\u2019\u201C\u201D\u2020\u2021\u2026\u2030\u2039\u203A\u20AC\u2122\u02C6\u02DC\u2013\u2014]/g

export function integrityCheckLine(text: string): CheckLine {
  const replacementCount = (text.match(/\uFFFD/g) || []).length
  if (replacementCount > 0) {
    return {
      name: 'String integrity',
      status: 'fail',
      message: `${replacementCount} replacement character${replacementCount === 1 ? '' : 's'} found — the text is already corrupted before rendering.`,
    }
  }
  const pairCount = (text.match(MOJIBAKE_PAIR) || []).length
  if (pairCount >= 3) {
    return {
      name: 'String integrity',
      status: 'fail',
      message: `Text looks like double-encoded UTF-8 (${pairCount} suspicious sequences) — the rendered glyphs will not match the intended string. Fix the source encoding.`,
    }
  }
  return { name: 'String integrity', status: 'pass', message: 'No encoding corruption detected in this string.' }
}

export async function ensureSuiteFonts(family: string, weight: number): Promise<void> {
  await ensureFontsLoaded([`${fontSpec(family, weight, 32)}, serif`])
}

/* Pure per-string checker: renders the text against one font family and
   reports what could actually be verified. No React, no app state. */
export async function runTextChecks(
  text: string,
  family: string,
  weight: number,
): Promise<CaseResult> {
  const checks: CheckLine[] = []

  if (!text.trim()) {
    return {
      status: 'fail',
      headline: STATUS_HEADLINE.fail,
      details: ['No text provided.'],
      checks: [{ name: 'Rendering', status: 'fail', message: 'No text provided.' }],
    }
  }

  /* 0. String integrity: catch mojibake/corrupted input before scoring render
     success — garbled Latin still draws ink and would otherwise pass. */
  checks.push(integrityCheckLine(text))

  /* 1. Rendering: does the browser paint any ink for this string? */
  let ink = 0
  let measurable = true
  for (const line of text.split('\n')) {
    const n = inkPixels(line, family, weight)
    if (n === null) measurable = false
    else ink += n
  }
  if (!measurable) {
    checks.push({ name: 'Rendering', status: 'warn', message: 'Rendering could not be measured automatically.' })
  } else if (ink === 0) {
    checks.push({ name: 'Rendering', status: 'fail', message: 'Nothing was drawn for this string.' })
  } else {
    checks.push({ name: 'Rendering', status: 'pass', message: `Rendered by the browser (${ink} px of ink).` })
  }

  /* 2. Shaping: contextual forms make joined text narrower than spaced text.
     Only meaningful when the string holds at least two connectable letters. */
  if (containsArabic(text)) {
    const arabicLetters = [...text].filter((ch) => /[\u0622-\u064A]/.test(ch)).length
    if (arabicLetters >= 2) {
      const shaped = shapingProbe(family, weight)
      if (shaped === null) {
        checks.push({ name: 'Shaping', status: 'warn', message: 'Shaping could not be verified automatically.' })
      } else if (shaped) {
        checks.push({ name: 'Shaping', status: 'pass', message: 'Contextual letter forms applied (verified by width comparison).' })
      } else {
        checks.push({ name: 'Shaping', status: 'warn', message: 'Joined letters measured like isolated ones — letters appear disconnected.' })
      }
    }
  }

  /* 3. Coverage: what the font subsystem reports about glyph availability. */
  const cov = await coverageCheck(family, weight, text)
  if (cov === null) {
    checks.push({ name: 'Glyph coverage', status: 'info', message: 'Glyph coverage could not be verified automatically.' })
  } else if (cov) {
    checks.push({ name: 'Glyph coverage', status: 'pass', message: 'Font system reports coverage for this string.' })
  } else {
    checks.push({ name: 'Glyph coverage', status: 'warn', message: 'Font may be missing some glyphs — fallback rendering was likely used.' })
  }

  /* Bidi ordering cannot be verified reliably; always recommend a visual check. */
  checks.push({ name: 'Bidi order', status: 'info', message: 'Bidi order and visual quality need a quick human look.' })

  const status = worst(checks.map((c) => c.status))
  return {
    status,
    headline: STATUS_HEADLINE[status],
    details: checks.map((c) => c.message),
    checks,
  }
}
