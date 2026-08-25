export interface TextPreset {
  id: string
  label: string
  text: string
  size?: number
  pixel?: boolean
}

export const DEFAULT_TEXT = 'مرحبا بك في عالم الألعاب'

export const PRESETS: TextPreset[] = [
  {
    id: 'dialogue',
    label: 'Dialogue',
    text: 'قال الحاج: «ماذا تفعل هنا في هذا الوقت المتأخر؟»\n— لا شيء… فقط أتمشى بين الأزقة.',
  },
  { id: 'button', label: 'UI Button', text: 'ابدأ اللعبة', size: 30 },
  { id: 'subtitle', label: 'Subtitle', text: 'المدينة القديمة — السوق الكبير\nمساء يوم الجمعة', size: 26 },
  {
    id: 'inventory',
    label: 'Inventory',
    text: 'القائمة:\n· سيف قديم ×1\n· جرعة شفاء ×3\n· خريطة السراديب',
    size: 24,
  },
  {
    id: 'quest',
    label: 'Quest',
    text: 'مهمة جديدة: اعثر على مفتاح البوابة الشرقية\nالمكافأة: ٢٥٠ ديناراً ذهبياً',
    size: 24,
  },
  { id: 'pixel', label: 'Pixel Game', text: 'اضغط للبدء\nرصيدك: 250\nلقد وجدت مفتاحاً', pixel: true },
]
