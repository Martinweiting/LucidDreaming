import { Dream, DreamDraft } from '../types/dream'
import { subDays, parseISO, isAfter, isEqual, startOfDay } from 'date-fns'

export interface DreamSign {
  tag: string
  totalCount: number
  lucidCount: number
  lucidRate: number
  isHighPotential: boolean
  dreamIds: string[]
}

export function detectDreamSigns(
  dreams: Dream[],
  windowDays: number = 30,
  minOccurrences: number = 5
): DreamSign[] {
  // Calculate date window (past N days from today)
  const today = new Date()
  const windowStart = startOfDay(subDays(today, windowDays))

  // Filter dreams within window
  const windowDreams = dreams.filter((dream) => {
    const dreamDate = startOfDay(parseISO(dream.dreamDate))
    return isAfter(dreamDate, windowStart) || isEqual(dreamDate, windowStart)
  })

  if (windowDreams.length === 0) {
    return []
  }

  // Count global lucidity rate for threshold calculation
  const globalLucidCount = windowDreams.filter((d) => d.lucidity !== null && d.lucidity > 0).length
  const globalLucidRate = windowDreams.length > 0 ? globalLucidCount / windowDreams.length : 0

  // Count tag occurrences and lucid appearances
  const tagMap = new Map<string, { totalCount: number; lucidCount: number; dreamIds: Set<string> }>()

  windowDreams.forEach((dream) => {
    dream.tags.forEach((tag) => {
      const current = tagMap.get(tag) || { totalCount: 0, lucidCount: 0, dreamIds: new Set() }
      current.totalCount += 1
      current.dreamIds.add(dream.id)

      if (dream.lucidity !== null && dream.lucidity > 0) {
        current.lucidCount += 1
      }

      tagMap.set(tag, current)
    })
  })

  // Build DreamSign array, filter by minOccurrences
  const dreamSigns: DreamSign[] = Array.from(tagMap.entries())
    .filter(([, { totalCount }]) => totalCount >= minOccurrences)
    .map(([tag, { totalCount, lucidCount, dreamIds }]) => {
      const lucidRate = totalCount > 0 ? lucidCount / totalCount : 0
      const isHighPotential =
        lucidRate >= globalLucidRate * 2 || lucidCount >= 3

      return {
        tag,
        totalCount,
        lucidCount,
        lucidRate,
        isHighPotential,
        dreamIds: Array.from(dreamIds),
      }
    })

  // Sort: isHighPotential first, then by totalCount descending
  dreamSigns.sort((a, b) => {
    if (a.isHighPotential !== b.isHighPotential) {
      return a.isHighPotential ? -1 : 1
    }
    return b.totalCount - a.totalCount
  })

  return dreamSigns
}

export function generateTestDreams(count: number = 50): DreamDraft[] {
  const tags = [
    'flying',
    'water',
    'falling',
    'being_chased',
    'losing_teeth',
    'being_naked',
    'stairs',
    'house',
    'car',
    'animal',
    'person',
    'running',
    'jumping',
    'swimming',
    'drowning',
    'trapped',
    'monster',
    'death',
    'ghost',
    'transformation',
  ]

  const dreams: DreamDraft[] = []

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const dreamDate = new Date()
    dreamDate.setDate(dreamDate.getDate() - daysAgo)
    const dreamDateStr = dreamDate.toISOString().split('T')[0] || '2026-04-18' // YYYY-MM-DD

    // Randomly select 1-4 tags
    const tagCount = Math.floor(Math.random() * 4) + 1
    const selectedTags: string[] = []
    for (let j = 0; j < tagCount; j++) {
      const randomTag = tags[Math.floor(Math.random() * tags.length)]
      if (randomTag && !selectedTags.includes(randomTag)) {
        selectedTags.push(randomTag)
      }
    }

    // Bias lucidity: 30% chance of lucid dream
    const isLucid = Math.random() < 0.3
    const lucidity = isLucid ? Math.floor(Math.random() * 4) + 2 : null // 2-6 if lucid, null otherwise

    const dream: DreamDraft = {
      content: `Test dream ${i + 1}: ${selectedTags.join(', ')}`,
      dreamDate: dreamDateStr,
      tags: selectedTags,
      mood: Math.floor(Math.random() * 5),
      vividness: Math.floor(Math.random() * 5),
      lucidity,
      isNightmare: Math.random() < 0.1,
      isRecurring: Math.random() < 0.05,
      lucidNotes: isLucid ? `Lucid moment during ${selectedTags[0]}` : null,
      userNotes: `Test note for dream ${i + 1}`,
    }

    dreams.push(dream)
  }

  return dreams
}
