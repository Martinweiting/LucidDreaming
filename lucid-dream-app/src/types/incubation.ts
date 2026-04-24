export const INCUBATION_SCHEMA_VERSION = 1

export interface IncubationIntent {
  id: string
  schemaVersion: number
  date: string            // YYYY-MM-DD — 孵化的晚上

  // 意圖設定（睡前填寫）
  targetScene: string     // 核心場景描述
  sensoryVisual: string   // 視覺細節
  sensoryAudio: string    // 聽覺細節
  sensoryTactile: string  // 觸覺感受
  emotionTone: string     // 情緒基調（自由文字）
  emotions: string[]      // 情緒標籤（從預設清單選）
  characters: string[]    // 人物
  symbols: string[]       // 意象 / 符號
  mildAffirmation: string // MILD 意圖語句

  // 孵化結果（早晨填寫）
  reviewed: boolean
  dreamId: string | null  // 關聯的夢境記錄
  hitScene: boolean | null
  hitVisual: boolean | null
  hitAudio: boolean | null
  hitTactile: boolean | null
  hitEmotional: boolean | null
  hitCharacters: string[] // 實際命中的人物
  hitSymbols: string[]    // 實際命中的意象
  hitNotes: string        // 早晨備注
  hitOverall: number | null // 整體命中感 1-5

  createdAt: string       // ISO 8601
  updatedAt: string       // ISO 8601
}

export interface IncubationDraft {
  date: string
  targetScene: string
  sensoryVisual?: string
  sensoryAudio?: string
  sensoryTactile?: string
  emotionTone?: string
  emotions?: string[]
  characters?: string[]
  symbols?: string[]
  mildAffirmation?: string
}

export interface IncubationUpdate {
  targetScene?: string
  sensoryVisual?: string
  sensoryAudio?: string
  sensoryTactile?: string
  emotionTone?: string
  emotions?: string[]
  characters?: string[]
  symbols?: string[]
  mildAffirmation?: string
  reviewed?: boolean
  dreamId?: string | null
  hitScene?: boolean | null
  hitVisual?: boolean | null
  hitAudio?: boolean | null
  hitTactile?: boolean | null
  hitEmotional?: boolean | null
  hitCharacters?: string[]
  hitSymbols?: string[]
  hitNotes?: string
  hitOverall?: number | null
}

export interface WeeklyHitStat {
  weekLabel: string // e.g. "4/14"
  rate: number      // 0–1
  count: number     // 該週已回顧的次數
}

export function calcHitScore(intent: IncubationIntent): { hit: number; total: number } {
  if (!intent.reviewed) return { hit: 0, total: 0 }

  let hit = 0
  let total = 0

  if (intent.targetScene) { total++; if (intent.hitScene) hit++ }
  if (intent.sensoryVisual) { total++; if (intent.hitVisual) hit++ }
  if (intent.sensoryAudio) { total++; if (intent.hitAudio) hit++ }
  if (intent.sensoryTactile) { total++; if (intent.hitTactile) hit++ }
  if (intent.emotionTone || intent.emotions.length > 0) { total++; if (intent.hitEmotional) hit++ }
  for (const c of intent.characters) { total++; if (intent.hitCharacters.includes(c)) hit++ }
  for (const s of intent.symbols) { total++; if (intent.hitSymbols.includes(s)) hit++ }

  return { hit, total }
}
