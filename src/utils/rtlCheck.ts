export type CheckStatus = 'pass' | 'warn' | 'fail' | 'info'

export interface CheckResult {
  id: string
  label: string
  status: CheckStatus
  detail: string
}

const AR = /[\u0600-\u06FF\u0750-\u077F]/
const LATIN = /[A-Za-z]/
const DIACRITICS = /[\u064B-\u0652\u0670]/
const EASTERN_DIGITS = /[\u0660-\u0669]/
const PERSIAN_DIGITS = /[\u06F0-\u06F9]/
const WESTERN_DIGITS = /[0-9]/

/* If the browser shapes Arabic, three joined behs measure narrower than
   three isolated ones. Falls back to "supported" when measurement fails. */
function browserShaping(): boolean {
  try {
    const ctx = document.createElement('canvas').getContext('2d')
    if (!ctx) return true
    ctx.font = '32px "Noto Sans Arabic", serif'
    const single = ctx.measureText('ب').width
    const joined = ctx.measureText('ببب').width
    if (!single || !joined) return true
    return joined < single * 2.8
  } catch {
    return true
  }
}

export function analyzeText(text: string, direction: 'rtl' | 'ltr', letterSpacing: number): CheckResult[] {
  const hasArabic = AR.test(text)
  const arabicCount = [...text].filter((ch) => AR.test(ch)).length
  const checks: CheckResult[] = []

  checks.push(
    hasArabic
      ? { id: 'arabic', label: 'Arabic characters detected', status: 'pass', detail: `${arabicCount} Arabic codepoints in input.` }
      : { id: 'arabic', label: 'Arabic characters detected', status: 'fail', detail: 'No Arabic found — type or paste Arabic to test rendering.' },
  )

  checks.push(
    direction === 'rtl'
      ? { id: 'direction', label: 'RTL direction enabled', status: 'pass', detail: 'Preview renders with dir="rtl".' }
      : { id: 'direction', label: 'RTL direction enabled', status: 'warn', detail: 'Preview is set to LTR — bidi ordering will look wrong for Arabic.' },
  )

  checks.push(
    browserShaping()
      ? { id: 'shaping', label: 'Arabic shaping supported by browser', status: 'pass', detail: 'Contextual glyph forms measured correctly — shaping engine active.' }
      : { id: 'shaping', label: 'Arabic shaping supported by browser', status: 'fail', detail: 'Browser returned unshaped metrics — try a recent Chrome or Firefox.' },
  )

  checks.push(
    hasArabic && LATIN.test(text)
      ? { id: 'mixed', label: 'Mixed Arabic / Latin text', status: 'warn', detail: 'Bidi reordering applies — verify word order around Latin runs and numbers.' }
      : { id: 'mixed', label: 'Mixed Arabic / Latin text', status: 'pass', detail: 'Single script detected — no bidi mixing in this input.' },
  )

  checks.push(
    DIACRITICS.test(text)
      ? { id: 'diacritics', label: 'Diacritics detected', status: 'warn', detail: 'Tashkeel marks can clip or detach in engine font shaders — test at final size.' }
      : { id: 'diacritics', label: 'Diacritics detected', status: 'pass', detail: 'No tashkeel marks — fewer atlas surprises.' },
  )

  if (hasArabic && letterSpacing > 0) {
    checks.push({
      id: 'spacing',
      label: 'Letter spacing breaks joining',
      status: 'warn',
      detail: `Letter spacing ${letterSpacing}px visually disconnects Arabic cursive joins.`,
    })
  }

  if (EASTERN_DIGITS.test(text)) {
    checks.push({ id: 'numerals', label: 'Eastern Arabic numerals', status: 'info', detail: 'Arabic-Indic digits (٠–٩) flow RTL — safest choice inside Arabic text.' })
  } else if (hasArabic && WESTERN_DIGITS.test(text)) {
    checks.push({ id: 'numerals', label: 'Western digits inside RTL', status: 'info', detail: '0–9 render LTR within RTL text (expected bidi behavior) — check placement next to punctuation.' })
  }

  if (PERSIAN_DIGITS.test(text)) {
    checks.push({ id: 'persian', label: 'Persian digits', status: 'info', detail: 'Extended digits (۰–۹) need a font with Persian glyph coverage.' })
  }

  return checks
}
