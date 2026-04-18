/**
 * 夢境記錄資料儲存庫。
 * 透過 Dexie.js 存取 IndexedDB。
 */
import { db } from '../db'
import { SCHEMA_VERSION, type Dream, type DreamDraft, type DreamUpdate } from '../types/dream'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export const dreamRepo = {
  async create(draft: DreamDraft): Promise<Dream> {
    const now = new Date().toISOString()
    const id = generateId()

    const dream: Dream = {
      id,
      schemaVersion: SCHEMA_VERSION,
      content: draft.content,
      dreamDate: draft.dreamDate,
      tags: draft.tags ?? [],
      mood: draft.mood ?? null,
      vividness: draft.vividness ?? null,
      lucidity: draft.lucidity ?? null,
      isNightmare: draft.isNightmare ?? false,
      isRecurring: draft.isRecurring ?? false,
      lucidNotes: draft.lucidNotes ?? null,
      ai: null,
      userNotes: draft.userNotes ?? '',
      createdAt: now,
      updatedAt: now,
    }

    await db.dreams.add(dream as unknown as Parameters<typeof db.dreams.add>[0])
    return dream
  },

  async get(id: string): Promise<Dream | undefined> {
    return (await db.dreams.get(id)) as Dream | undefined
  },

  async update(id: string, patch: DreamUpdate): Promise<void> {
    const now = new Date().toISOString()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.dreams.update as any)(id, {
      ...patch,
      updatedAt: now,
    })
  },

  async delete(id: string): Promise<void> {
    await db.dreams.delete(id)
  },

  async listAll(): Promise<Dream[]> {
    const all = await db.dreams.toArray()
    return all.sort((a, b) => (b.dreamDate as string).localeCompare(a.dreamDate as string)) as Dream[]
  },

  async listByDateRange(start: string, end: string): Promise<Dream[]> {
    return (await db.dreams
      .where('dreamDate')
      .between(start, end, true, true)
      .toArray()) as Dream[]
  },

  async listByTag(tag: string): Promise<Dream[]> {
    const all = await db.dreams.toArray()
    return (all.filter((d) => (d.tags as string[]).includes(tag))) as Dream[]
  },

  async listIncomplete(): Promise<Dream[]> {
    const all = await db.dreams.toArray()
    return (all.filter((d) => !d.mood || !d.ai)) as Dream[]
  },

  async searchFullText(query: string): Promise<Dream[]> {
    const all = await db.dreams.toArray()
    const lower = query.toLowerCase()
    return (all.filter((d) =>
      (d.content as string).toLowerCase().includes(lower)
    )) as Dream[]
  },
}
