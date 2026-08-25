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

export function analyzeText(text: string, direction: 'rtl' | 'ltr'): CheckResult[] {
  const hasArabic = AR.test(text)
  const arabicCount = [...text].filter((ch) => AR.test(ch)).length
  const hasLatin = LATIN.test(text)
  const diacriticCount = [...text].filter((ch) => DIACRITICS.test(ch)).length

  return [
    {
      id: 'arabic',
      label: 'Arabic characters',
      status: hasArabic ? 'pass' : 'fail',
      detail: hasArabic
        ? `${arabicCount} Arabic characters found.`
        : 'No Arabic characters found — type or paste Arabic to test rendering.',
    },
    {
      id: 'direction',
      label: 'RTL direction',
      status: direction === 'rtl' ? 'pass' : 'warn',
      detail:
        direction === 'rtl'
          ? 'Preview is using direction: rtl'
          : 'Preview is using direction: ltr — bidi ordering will look wrong for Arabic.',
    },
    {
      id: 'shaping',
      label: 'Arabic shaping',
      status: browserShaping() ? 'pass' : 'fail',
      detail: browserShaping()
        ? 'Contextual letter forms are rendering correctly.'
        : 'Browser returned unshaped metrics — try a recent Chrome or Firefox.',
    },
    {
      id: 'mixing',
      label: 'Script mixing',
      status: hasArabic && hasLatin ? 'warn' : 'pass',
      detail:
        hasArabic && hasLatin
          ? 'Arabic + Latin text detected.'
          : 'No Arabic/Latin mixing detected.',
    },
    {
      id: 'diacritics',
      label: 'Diacritics',
      status: diacriticCount > 0 ? 'warn' : 'pass',
      detail:
        diacriticCount > 0
          ? `${diacriticCount} tashkeel marks detected — check clipping at final size.`
          : 'No diacritics detected.',
    },
  ]
}
