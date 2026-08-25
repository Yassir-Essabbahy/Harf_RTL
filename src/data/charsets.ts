export interface CharsetGroup {
  id: string
  label: string
  chars: string
}

const LETTERS = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'
const HAMZA = 'ءآأؤإئ'
const TATWEEL = 'ـ'
const DIACRITICS = '\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652'
const INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const WESTERN_DIGITS = '0123456789'
const PERSIAN_LETTERS = 'پچژگکی'
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_PUNCT = '،؛؟«»'
const COMMON_PUNCT = '.,:;!?"\'()[]{}\\-_*%&/=<>@#$'
const LATIN_BASIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export const CHARSET_GROUPS: CharsetGroup[] = [
  { id: 'letters', label: 'Arabic letters (28)', chars: LETTERS },
  { id: 'hamza', label: 'Hamza & alef forms', chars: HAMZA },
  { id: 'tatweel', label: 'Tatweel (kashida)', chars: TATWEEL },
  { id: 'diacritics', label: 'Diacritics (tashkeel)', chars: DIACRITICS },
  { id: 'indic', label: 'Arabic-Indic digits', chars: INDIC_DIGITS },
  { id: 'western', label: 'Western digits', chars: WESTERN_DIGITS },
  { id: 'persian', label: 'Persian letters', chars: PERSIAN_LETTERS },
  { id: 'persianDigits', label: 'Persian digits', chars: PERSIAN_DIGITS },
  { id: 'arPunct', label: 'Arabic punctuation', chars: ARABIC_PUNCT },
  { id: 'punct', label: 'Common punctuation', chars: COMMON_PUNCT },
  { id: 'latin', label: 'Latin basic', chars: LATIN_BASIC },
]

export interface CharPreset {
  id: string
  label: string
  groups: string[]
}

export const CHAR_PRESETS: CharPreset[] = [
  { id: 'basic', label: 'Arabic Basic', groups: ['letters', 'hamza', 'tatweel', 'arPunct'] },
  { id: 'persian', label: 'Arabic + Persian', groups: ['letters', 'hamza', 'tatweel', 'arPunct', 'persian', 'persianDigits'] },
  { id: 'numbers', label: 'Arabic + Numbers', groups: ['letters', 'hamza', 'tatweel', 'arPunct', 'indic', 'western'] },
  { id: 'ui', label: 'Arabic UI', groups: CHARSET_GROUPS.map((g) => g.id) },
  { id: 'custom', label: 'Custom', groups: ['letters', 'hamza', 'tatweel', 'arPunct'] },
]

export function buildCharset(groupIds: string[]): string[] {
  const set = new Set<string>()
  for (const id of groupIds) {
    const group = CHARSET_GROUPS.find((g) => g.id === id)
    if (group) for (const ch of group.chars) set.add(ch)
  }
  return [...set]
}
