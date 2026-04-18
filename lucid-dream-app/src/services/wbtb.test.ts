import { describe, it, expect } from 'vitest'
import { wbtbService } from './wbtb'

describe('wbtbService', () => {
  describe('calculateWbtb', () => {
    it('計算 23:00 就寢、8 小時睡眠的 WBTB 計畫', () => {
      const plan = wbtbService.calculateWbtb({
        bedtime: '23:00',
        totalHours: 8,
      })

      expect(plan.bedtime).toBe('23:00')
      expect(plan.primaryWakeTime).toBe('03:30') // 23:00 + 4.5h
      expect(plan.alternateWakeTime).toBe('05:00') // 23:00 + 6h
      expect(plan.finalWakeTime).toBe('07:00') // 23:00 + 8h
      expect(plan.awakeMinutes).toBe(20)
    })

    it('計算 22:00 就寢、7 小時睡眠的 WBTB 計畫', () => {
      const plan = wbtbService.calculateWbtb({
        bedtime: '22:00',
        totalHours: 7,
      })

      expect(plan.bedtime).toBe('22:00')
      expect(plan.primaryWakeTime).toBe('02:30') // 22:00 + 4.5h
      expect(plan.alternateWakeTime).toBe('04:00') // 22:00 + 6h
      expect(plan.finalWakeTime).toBe('05:00') // 22:00 + 7h
    })

    it('計算 00:30 就寢、9 小時睡眠的 WBTB 計畫（跨午夜）', () => {
      const plan = wbtbService.calculateWbtb({
        bedtime: '00:30',
        totalHours: 9,
      })

      expect(plan.bedtime).toBe('00:30')
      expect(plan.primaryWakeTime).toBe('05:00') // 00:30 + 4.5h
      expect(plan.alternateWakeTime).toBe('06:30') // 00:30 + 6h
      expect(plan.finalWakeTime).toBe('09:30') // 00:30 + 9h
    })

    it('計算 20:00 就寢、6 小時睡眠的 WBTB 計畫', () => {
      const plan = wbtbService.calculateWbtb({
        bedtime: '20:00',
        totalHours: 6,
      })

      expect(plan.bedtime).toBe('20:00')
      expect(plan.primaryWakeTime).toBe('00:30') // 20:00 + 4.5h
      expect(plan.alternateWakeTime).toBe('02:00') // 20:00 + 6h
      expect(plan.finalWakeTime).toBe('02:00') // 20:00 + 6h
    })
  })

  describe('validateConfig', () => {
    it('接受有效的配置', () => {
      const result = wbtbService.validateConfig({
        bedtime: '23:00',
        totalHours: 8,
      })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('拒絕無效的時間格式', () => {
      const result = wbtbService.validateConfig({
        bedtime: '25:00',
        totalHours: 8,
      })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('就寢時間格式必須為 HH:MM')
    })

    it('拒絕無效的睡眠時長', () => {
      const result = wbtbService.validateConfig({
        bedtime: '23:00',
        totalHours: 5 as any,
      })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('總睡眠時長必須為 6, 7, 8 或 9 小時')
    })

    it('接受所有有效的睡眠時長選項', () => {
      ;[6, 7, 8, 9].forEach((hours) => {
        const result = wbtbService.validateConfig({
          bedtime: '23:00',
          totalHours: hours as any,
        })

        expect(result.valid).toBe(true)
      })
    })
  })
})
