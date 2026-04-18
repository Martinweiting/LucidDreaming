import { describe, it, expect, beforeEach } from 'vitest'
import { detectDreamSigns, generateTestDreams } from './dreamSigns'
import { type Dream } from '../types/dream'

describe('detectDreamSigns', () => {
  beforeEach(() => {
    // Setup is done per test
  })

  describe('basic algorithm', () => {
    it('should return empty array for empty dreams', () => {
      const result = detectDreamSigns([])
      expect(result).toEqual([])
    })

    it('should ignore tags with count < minOccurrences', () => {
      const dreams: Dream[] = [
        {
          id: '1',
          schemaVersion: 1,
          dreamDate: '2026-04-18',
          content: 'test',
          tags: ['flying', 'water'],
          mood: null,
          vividness: null,
          lucidity: null,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      const result = detectDreamSigns(dreams, 30, 5)
      expect(result).toEqual([])
    })

    it('should include tags with count >= minOccurrences', () => {
      const dreams: Dream[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `${i}`,
        schemaVersion: 1,
        dreamDate: '2026-04-18' as const,
        content: 'test',
        tags: ['flying'],
        mood: null,
        vividness: null,
        lucidity: null,
        isNightmare: false,
        isRecurring: false,
        lucidNotes: null,
        ai: null,
        userNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      const result = detectDreamSigns(dreams, 30, 5)
      expect(result).toHaveLength(1)
      expect(result[0]!).toMatchObject({
        tag: 'flying',
        totalCount: 5,
      })
    })
  })

  describe('window filtering', () => {
    it('should include dreams within window', () => {
      const today = new Date()
      const daysAgo = 10

      const withinWindowDate = new Date()
      withinWindowDate.setDate(today.getDate() - daysAgo)
      const withinWindowStr = withinWindowDate.toISOString().split('T')[0] || '2026-04-18'

      const dreams: Dream[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `${i}`,
        schemaVersion: 1,
        dreamDate: withinWindowStr,
        content: 'test',
        tags: ['flying'],
        mood: null,
        vividness: null,
        lucidity: null,
        isNightmare: false,
        isRecurring: false,
        lucidNotes: null,
        ai: null,
        userNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      const result = detectDreamSigns(dreams, 30, 5)
      expect(result).toHaveLength(1)
      expect(result[0]!.totalCount).toBe(5)
    })

    it('should exclude dreams outside window', () => {
      const today = new Date()
      const outOfWindowDate = new Date()
      outOfWindowDate.setDate(today.getDate() - 40)
      const outOfWindowStr = outOfWindowDate.toISOString().split('T')[0] || '2026-04-18'

      const dreams: Dream[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `${i}`,
        schemaVersion: 1,
        dreamDate: outOfWindowStr,
        content: 'test',
        tags: ['flying'],
        mood: null,
        vividness: null,
        lucidity: null,
        isNightmare: false,
        isRecurring: false,
        lucidNotes: null,
        ai: null,
        userNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      const result = detectDreamSigns(dreams, 30, 5)
      expect(result).toEqual([])
    })
  })

  describe('lucidity calculations', () => {
    it('should correctly count lucidCount for tag', () => {
      const dreams: Dream[] = [
        // 5 dreams with 'flying', 2 are lucid
        ...Array.from({ length: 3 }).map((_, i) => ({
          id: `lucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['flying'],
          mood: null,
          vividness: null,
          lucidity: 3 as const, // lucid
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        ...Array.from({ length: 2 }).map((_, i) => ({
          id: `nonlucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['flying'],
          mood: null,
          vividness: null,
          lucidity: null,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      ]

      const result = detectDreamSigns(dreams, 30, 5)
      expect(result[0]!).toMatchObject({
        totalCount: 5,
        lucidCount: 3,
        lucidRate: 0.6,
      })
    })

    it('should treat null lucidity as non-lucid', () => {
      const dreams: Dream[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `${i}`,
        schemaVersion: 1,
        dreamDate: '2026-04-18' as const,
        content: 'test',
        tags: ['flying'],
        mood: null,
        vividness: null,
        lucidity: null,
        isNightmare: false,
        isRecurring: false,
        lucidNotes: null,
        ai: null,
        userNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      const result = detectDreamSigns(dreams, 30, 5)
      expect(result[0]!.lucidCount).toBe(0)
      expect(result[0]!.lucidRate).toBe(0)
    })

    it('should treat lucidity = 0 as non-lucid', () => {
      const dreams: Dream[] = [
        {
          id: '1',
          schemaVersion: 1,
          dreamDate: '2026-04-18',
          content: 'test',
          tags: ['flying'],
          mood: null,
          vividness: null,
          lucidity: 0,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...Array.from({ length: 4 }).map((_, i) => ({
          id: `${i + 2}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['flying'],
          mood: null,
          vividness: null,
          lucidity: null,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      ]

      const result = detectDreamSigns(dreams, 30, 5)
      expect(result[0]!.lucidCount).toBe(0)
    })
  })

  describe('isHighPotential calculation', () => {
    it('should mark as high potential if lucidRate >= 2x global rate', () => {
      // Create setup where:
      // Global: 1 lucid out of 8 dreams = 0.125
      // 'flying': 3 lucid out of 5 = 0.6 (>= 0.125 * 2 = 0.25) -> HIGH POTENTIAL

      const dreams: Dream[] = [
        // 1 lucid + 7 non-lucid for global count (other tags)
        ...Array.from({ length: 1 }).map((_, i) => ({
          id: `global-lucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['random'],
          mood: null,
          vividness: null,
          lucidity: 3 as const,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        ...Array.from({ length: 7 }).map((_, i) => ({
          id: `global-nonlucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['random'],
          mood: null,
          vividness: null,
          lucidity: null,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        // 3 lucid + 2 non-lucid for 'flying' (rate = 0.6, which is >= 0.125 * 2)
        ...Array.from({ length: 3 }).map((_, i) => ({
          id: `flying-lucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['flying'],
          mood: null,
          vividness: null,
          lucidity: 3 as const,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        ...Array.from({ length: 2 }).map((_, i) => ({
          id: `flying-nonlucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['flying'],
          mood: null,
          vividness: null,
          lucidity: null,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      ]

      const result = detectDreamSigns(dreams, 30, 5)
      const flyingSign = result.find((s) => s.tag === 'flying')
      expect(flyingSign?.isHighPotential).toBe(true)
    })

    it('should mark as high potential if lucidCount >= 3', () => {
      // Even with low lucidRate, if lucidCount >= 3, it's high potential
      const dreams: Dream[] = [
        // Global: 0 lucid, so rate is 0
        ...Array.from({ length: 5 }).map((_, i) => ({
          id: `global-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['other'],
          mood: null,
          vividness: null,
          lucidity: null,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        // 'flying': 3 lucid + 2 non-lucid
        ...Array.from({ length: 3 }).map((_, i) => ({
          id: `flying-lucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['flying'],
          mood: null,
          vividness: null,
          lucidity: 3 as const,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        ...Array.from({ length: 2 }).map((_, i) => ({
          id: `flying-nonlucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['flying'],
          mood: null,
          vividness: null,
          lucidity: null,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      ]

      const result = detectDreamSigns(dreams, 30, 5)
      const flyingSign = result.find((s) => s.tag === 'flying')
      expect(flyingSign?.isHighPotential).toBe(true)
    })
  })

  describe('sorting', () => {
    it('should sort by isHighPotential first, then by totalCount descending', () => {
      // Create dreams with mixed high/low potential and counts
      // Global: 1 lucid out of 8 = 0.125
      // 'water': 3 lucid out of 5 = 0.6 (>= 0.125 * 2, HIGH POTENTIAL, totalCount=5)
      // 'flying': 1 lucid out of 10 = 0.1 (NOT high potential, totalCount=10)

      const dreams: Dream[] = [
        ...Array.from({ length: 1 }).map((_, i) => ({
          id: `global-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['other'],
          mood: null,
          vividness: null,
          lucidity: 3 as const,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        ...Array.from({ length: 7 }).map((_, i) => ({
          id: `global-nonlucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['other'],
          mood: null,
          vividness: null,
          lucidity: null,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        // 'flying': 1 lucid + 9 non-lucid = 10 total, low potential
        ...Array.from({ length: 1 }).map((_, i) => ({
          id: `flying-lucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['flying'],
          mood: null,
          vividness: null,
          lucidity: 3 as const,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        ...Array.from({ length: 9 }).map((_, i) => ({
          id: `flying-nonlucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['flying'],
          mood: null,
          vividness: null,
          lucidity: null,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        // 'water': 3 lucid + 2 non-lucid = 5 total, high potential
        ...Array.from({ length: 3 }).map((_, i) => ({
          id: `water-lucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['water'],
          mood: null,
          vividness: null,
          lucidity: 3 as const,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        ...Array.from({ length: 2 }).map((_, i) => ({
          id: `water-nonlucid-${i}`,
          schemaVersion: 1,
          dreamDate: '2026-04-18' as const,
          content: 'test',
          tags: ['water'],
          mood: null,
          vividness: null,
          lucidity: null,
          isNightmare: false,
          isRecurring: false,
          lucidNotes: null,
          ai: null,
          userNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      ]

      const result = detectDreamSigns(dreams, 30, 5)

      // 'water' should be first (high potential)
      expect(result[0]!.tag).toBe('water')
      expect(result[0]!.isHighPotential).toBe(true)

      // 'flying' should be second (low potential, totalCount=10 > water's 5)
      expect(result[1]!.tag).toBe('flying')
      expect(result[1]!.isHighPotential).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle tags with special characters', () => {
      const dreams: Dream[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `${i}`,
        schemaVersion: 1,
        dreamDate: '2026-04-18' as const,
        content: 'test',
        tags: ['flying_with-dash.period'],
        mood: null,
        vividness: null,
        lucidity: null,
        isNightmare: false,
        isRecurring: false,
        lucidNotes: null,
        ai: null,
        userNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      const result = detectDreamSigns(dreams, 30, 5)
      expect(result[0]!.tag).toBe('flying_with-dash.period')
    })

    it('should handle duplicate tags in single dream', () => {
      // Note: In real usage, duplicates should be prevented, but the algorithm should handle it gracefully
      const dreams: Dream[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `${i}`,
        schemaVersion: 1,
        dreamDate: '2026-04-18' as const,
        content: 'test',
        tags: ['flying', 'flying'],
        mood: null,
        vividness: null,
        lucidity: null,
        isNightmare: false,
        isRecurring: false,
        lucidNotes: null,
        ai: null,
        userNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      const result = detectDreamSigns(dreams, 30, 5)
      expect(result[0]!.totalCount).toBe(10) // Counted twice per dream
    })
  })

  describe('dreamIds tracking', () => {
    it('should track which dreams contain each tag', () => {
      const dreams: Dream[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `dream-${i}`,
        schemaVersion: 1,
        dreamDate: '2026-04-18' as const,
        content: 'test',
        tags: ['flying'],
        mood: null,
        vividness: null,
        lucidity: null,
        isNightmare: false,
        isRecurring: false,
        lucidNotes: null,
        ai: null,
        userNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      const result = detectDreamSigns(dreams, 30, 5)
      expect(result[0]!.dreamIds).toEqual(['dream-0', 'dream-1', 'dream-2', 'dream-3', 'dream-4'])
    })
  })
})

describe('generateTestDreams', () => {
  it('should generate requested number of dreams', () => {
    const dreams = generateTestDreams(10)
    expect(dreams).toHaveLength(10)
  })

  it('should generate 50 dreams by default', () => {
    const dreams = generateTestDreams()
    expect(dreams).toHaveLength(50)
  })

  it('should create dreams with valid structure', () => {
    const dreams = generateTestDreams(1)
    const dream = dreams[0]!

    expect(dream.content).toBeDefined()
    expect(dream.dreamDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Array.isArray(dream.tags)).toBe(true)
    expect(dream.tags!.length).toBeGreaterThan(0)
    expect(typeof dream.mood).toBe('number')
    expect(typeof dream.vividness).toBe('number')
  })

  it('should generate dreams spanning 30 days', () => {
    const dreams = generateTestDreams(100)
    const dates = dreams.map((d) => d.dreamDate).sort()

    const minDate = dates[0]!
    const maxDate = dates[dates.length - 1]!

    // Calculate days between min and max
    const min = new Date(minDate)
    const max = new Date(maxDate)
    const daysDiff = Math.floor((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24))

    expect(daysDiff).toBeLessThanOrEqual(30)
  })

  it('should generate tags that meet high-potential criteria', () => {
    const dreams = generateTestDreams(100)
    const dreamObjects = dreams.map((d) => ({
      ...d,
      id: Math.random().toString(),
      schemaVersion: 1,
      isNightmare: d.isNightmare || false,
      isRecurring: d.isRecurring || false,
      lucidNotes: d.lucidNotes || null,
      ai: null,
      userNotes: d.userNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })) as Dream[]

    const signs = detectDreamSigns(dreamObjects, 30, 5)
    const highPotential = signs.filter((s) => s.isHighPotential)

    // With 100 test dreams, should have at least some high-potential signs
    expect(highPotential.length).toBeGreaterThan(0)
  })
})
