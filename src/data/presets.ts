export interface TextPreset {
  id: string
  label: string
  text: string
  size?: number
  pixel?: boolean
}

export const PRESETS: TextPreset[] = [
  { id: 'dialogue', label: 'Dialogue', text: 'أين كنت؟' },
  { id: 'button', label: 'Button', text: 'ابدأ اللعبة', size: 30 },
  { id: 'hud', label: 'HUD', text: 'الصحة: 75', size: 26 },
  { id: 'inventory', label: 'Inventory', text: 'المسدس', size: 24 },
  { id: 'quest', label: 'Quest', text: 'ابحث عن المفتاح', size: 24 },
  { id: 'pixel', label: 'Pixel UI', text: 'اضغط للمتابعة', pixel: true },
]
