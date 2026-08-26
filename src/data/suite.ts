export interface SuiteCase {
  id: string
  label: string
  text: string
  category: string
}

export const SUITE_CASES: SuiteCase[] = [
  {
    id: 'basic',
    label: 'Basic Arabic',
    category: 'Arabic characters rendered',
    text: 'مرحبا بالعالم',
  },
  {
    id: 'connected',
    label: 'Connected letters',
    category: 'Contextual letter forms applied',
    text: 'مدرسة',
  },
  {
    id: 'long',
    label: 'Long Arabic text',
    category: 'Paragraph renders without errors',
    text:
      'في بداية اللعبة يستيقظ البطل في قرية صغيرة على حافة الصحراء، ويعلمه شيخ القرية أن المملكة تحتاج إلى من يعبر الوادي ويستعيد المفتاح قبل حلول الليل.',
  },
  {
    id: 'diacritics',
    label: 'Diacritics',
    category: 'Tashkeel marks positioned',
    text: 'مَرْحَبًا بِكُمْ',
  },
  {
    id: 'arabic-numbers',
    label: 'Arabic numbers',
    category: 'Arabic-Indic digits rendered',
    text: '١٢٣٤٥٦٧٨٩٠',
  },
  {
    id: 'western-numbers',
    label: 'Western numbers',
    category: 'Western digits rendered',
    text: '1234567890',
  },
  {
    id: 'mixed',
    label: 'Arabic + Latin',
    category: 'Both scripts on one line',
    text: 'Level 01 — المرحلة الأولى',
  },
  {
    id: 'punctuation',
    label: 'Punctuation',
    category: 'Question and exclamation marks',
    text: 'هل أنت مستعد؟!',
  },
  {
    id: 'parentheses',
    label: 'Parentheses',
    category: 'Mirrored brackets around RTL text',
    text: '(المهمة الجديدة)',
  },
  {
    id: 'quotes',
    label: 'Quotes',
    category: 'Quoted Arabic string',
    text: '"مرحبا"',
  },
  {
    id: 'mixed-ui',
    label: 'Mixed UI block',
    category: 'Game HUD lines, both scripts',
    text: 'HP: 100\nالصحة: 100\nGold: 250\nالذهب: 250',
  },
  {
    id: 'dialogue',
    label: 'Game dialogue',
    category: 'Multi-line dialogue box',
    text: 'أين كنت؟\nيجب أن نغادر الآن.',
  },
]
