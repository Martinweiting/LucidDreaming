import { db } from '../db/schema'
import {
  INCUBATION_SCHEMA_VERSION,
  calcHitScore,
  type IncubationDraft,
  type IncubationIntent,
  type IncubationUpdate,
  type WeeklyHitStat,
} from '../types/incubation'
import { format, startOfWeek, addWeeks, isWithinInterval, parseISO } from 'date-fns'
import { zhTW } from 'date-fns/locale'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export const incubationRepo = {
  async create(draft: IncubationDraft): Promise<IncubationIntent> {
    const now = new Date().toISOString()
    const intent: IncubationIntent = {
      id: generateId(),
      schemaVersion: INCUBATION_SCHEMA_VERSION,
      date: draft.date,
      targetScene: draft.targetScene,
      sensoryVisual: draft.sensoryVisual ?? '',
      sensoryAudio: draft.sensoryAudio ?? '',
      sensoryTactile: draft.sensoryTactile ?? '',
      emotionTone: draft.emotionTone ?? '',
      emotions: draft.emotions ?? [],
      characters: draft.characters ?? [],
      symbols: draft.symbols ?? [],
      mildAffirmation: draft.mildAffirmation ?? '',
      reviewed: false,
      dreamId: null,
      hitScene: null,
      hitVisual: null,
      hitAudio: null,
      hitTactile: null,
      hitEmotional: null,
      hitCharacters: [],
      hitSymbols: [],
      hitNotes: '',
      hitOverall: null,
      createdAt: now,
      updatedAt: now,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.incubations.add as any)(intent)
    return intent
  },

  async get(id: string): Promise<IncubationIntent | undefined> {
    return (await db.incubations.get(id)) as IncubationIntent | undefined
  },

  async getByDate(date: string): Promise<IncubationIntent | undefined> {
    const results = await db.incubations.where('date').equals(date).toArray()
    return results[0] as IncubationIntent | undefined
  },

  async update(id: string, patch: IncubationUpdate): Promise<void> {
    const now = new Date().toISOString()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.incubations.update as any)(id, { ...patch, updatedAt: now })
  },

  async delete(id: string): Promise<void> {
    await db.incubations.delete(id)
  },

  async listAll(): Promise<IncubationIntent[]> {
    const all = await db.incubations.toArray()
    return (all as IncubationIntent[]).sort((a, b) => b.date.localeCompare(a.date))
  },

  async listUnreviewed(): Promise<IncubationIntent[]> {
    const all = await db.incubations.where('reviewed').equals(0).toArray()
    return all as IncubationIntent[]
  },

  async getWeeklyStats(weeksBack = 8): Promise<WeeklyHitStat[]> {
    const all = (await db.incubations.toArray()) as IncubationIntent[]
    const reviewed = all.filter((i) => i.reviewed)

    const now = new Date()
    const stats: WeeklyHitStat[] = []

    for (let w = weeksBack - 1; w >= 0; w--) {
      const weekStart = startOfWeek(addWeeks(now, -w), { weekStartsOn: 1 })
      const weekEnd = addWeeks(weekStart, 1)

      const weekItems = reviewed.filter((i) => {
        const d = parseISO(i.date)
        return isWithinInterval(d, { start: weekStart, end: weekEnd })
      })

      const totalHitPoints = weekItems.reduce((sum, i) => {
        const { hit, total } = calcHitScore(i)
        return total > 0 ? sum + hit / total : sum
      }, 0)

      stats.push({
        weekLabel: format(weekStart, 'M/d', { locale: zhTW }),
        rate: weekItems.length > 0 ? totalHitPoints / weekItems.length : 0,
        count: weekItems.length,
      })
    }
    return stats
  },

  async getOverallHitRate(): Promise<number> {
    const all = (await db.incubations.toArray()) as IncubationIntent[]
    const reviewed = all.filter((i) => i.reviewed)
    if (reviewed.length === 0) return 0

    const total = reviewed.reduce((sum, i) => {
      const { hit, total: t } = calcHitScore(i)
      return t > 0 ? sum + hit / t : sum
    }, 0)
    return total / reviewed.length
  },
}
