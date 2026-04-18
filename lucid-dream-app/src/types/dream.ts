/**
 * 夢境記錄型別定義。
 */

export const SCHEMA_VERSION = 1

export interface Dream {
  id: string
  schemaVersion: number
  content: string
  dreamDate: string // YYYY-MM-DD
  tags: string[]
  mood: number | null
  vividness: number | null
  lucidity: number | null
  isNightmare: boolean
  isRecurring: boolean
  lucidNotes: string | null
  ai: {
    summary: string
    extractedTags: string[]
    model: string
    analyzedAt: string
  } | null
  userNotes: string
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

export interface DreamDraft {
  content: string
  dreamDate: string
  tags?: string[]
  mood?: number | null
  vividness?: number | null
  lucidity?: number | null
  isNightmare?: boolean
  isRecurring?: boolean
  lucidNotes?: string | null
  userNotes?: string
}

export interface DreamUpdate {
  content?: string
  dreamDate?: string
  tags?: string[]
  mood?: number | null
  vividness?: number | null
  lucidity?: number | null
  isNightmare?: boolean
  isRecurring?: boolean
  lucidNotes?: string | null
  ai?: {
    summary: string
    extractedTags: string[]
    model: string
    analyzedAt: string
  } | null
  userNotes?: string
}
