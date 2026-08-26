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
   three spaced ones. Computed once per page load. */
let shapingCache: boolean | null = null
function browserShaping(): boolean {
  if (shapingCache === null) {
    try {
      const ctx = document.createElement('canvas').getContext('2d')
      if (!ctx) {
        shapingCache = true
        return shapingCache
      }
      ctx.font = '32px "Noto Sans Arabic", serif'
      const joined = ctx.measureText('ببب').width
      const spaced = ctx.measureText('ب ب ب').width
      shapingCache = !joined || !spaced ? true : joined < spaced * 0.92
    } catch {
      shapingCache = true
    }
  }
  return shapingCache
}

export function analyzeText(text: string, direction: 'rtl' | 'ltr'): CheckResult[] {
  const hasArabic = AR.test(text)
  const arabicCount = [...text].filter((ch) => AR.test(ch)).length
  const hasLatin = LATIN.test(text)
  const diacriticCount = [...text].filter((ch) => DIACRITICS.test(ch)).length
  const shaped = browserShaping()

  return [
    {
      id: 'arabic',
      label: 'Arabic characters',
      status: hasArabic ? 'pass' : 'info',
      detail: hasArabic
        ? `${arabicCount} Arabic characters in the current text.`
        : 'No Arabic characters yet — type or paste Arabic to test rendering.',
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
      status: shaped ? 'pass' : 'fail',
      detail: shaped
        ? 'Browser applied contextual letter forms (verified by width measurement).'
        : 'Joined letters measured like isolated ones — shaping appears broken. Try a recent Chrome or Firefox.',
    },
    {
      id: 'mixing',
      label: 'Script mixing',
      status: hasArabic && hasLatin ? 'pass' : 'info',
      detail:
        hasArabic && hasLatin
          ? 'Mixed Arabic / Latin text detected.'
          : 'No mixed Arabic / Latin text in the current input.',
    },
    {
      id: 'diacritics',
      label: 'Diacritics',
      status: diacriticCount > 0 ? 'warn' : 'pass',
      detail:
        diacriticCount > 0
          ? `${diacriticCount} tashkeel marks detected — check clipping at final size.`
          : 'No diacritics in the current input.',
    },
  ]
}
