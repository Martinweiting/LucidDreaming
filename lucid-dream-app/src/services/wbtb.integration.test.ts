/**
 * WBTB 集成测试
 * 验证计算 → ICS 导出的完整流程
 */

import { describe, it, expect } from 'vitest'
import { wbtbService } from './wbtb'
import { icsExport } from './icsExport'

describe('WBTB Integration', () => {
  it('完整流程：计算 WBTB + 导出 ICS', () => {
    // 1. 计算 WBTB 计划
    const plan = wbtbService.calculateWbtb({
      bedtime: '23:00',
      totalHours: 8,
    })

    expect(plan).toBeDefined()
    expect(plan.bedtime).toBe('23:00')
    expect(plan.primaryWakeTime).toBe('03:30')
    expect(plan.alternateWakeTime).toBe('05:00')
    expect(plan.finalWakeTime).toBe('07:00')

    // 2. 导出为 ICS
    const icsContent = icsExport.wbtbToIcs(plan, '2026-04-18')

    // 3. 验证 ICS 内容
    expect(icsContent).toContain('BEGIN:VCALENDAR')
    expect(icsContent).toContain('END:VCALENDAR')
    expect(icsContent).toContain('BEGIN:VEVENT')
    expect(icsContent).toContain('END:VEVENT')

    // 4. 验证事件标题
    expect(icsContent).toContain('WBTB 醒來 - 主要選項')
    expect(icsContent).toContain('WBTB 醒來 - 備選選項')
    expect(icsContent).toContain('最終起床時間')

    // 5. 验证时间格式（ICS 格式：YYYYMMDDTHHMMSSZ）
    expect(icsContent).toContain('20260418T033000') // 03:30
    expect(icsContent).toContain('20260418T050000') // 05:00
    expect(icsContent).toContain('20260418T070000') // 07:00

    // 6. 验证 UID 的唯一性
    const uidMatches = icsContent.match(/UID:[^\n]*/g) || []
    const uniqueUids = new Set(uidMatches)
    expect(uniqueUids.size).toBe(uidMatches.length)
  })

  it('验证 ICS 包含描述和持续时间', () => {
    const plan = wbtbService.calculateWbtb({
      bedtime: '22:00',
      totalHours: 7,
    })

    const icsContent = icsExport.wbtbToIcs(plan, '2026-04-18')

    // 验证描述信息
    expect(icsContent).toContain('清明夢')
    expect(icsContent).toContain('保持清醒')

    // 验证时间戳格式
    expect(icsContent).toContain('DTSTART:20260418T023000')
    expect(icsContent).toContain('DTSTART:20260418T040000')
  })

  it('跨午夜情况：22:00 就寝 + 9 小时 = 07:00 起床', () => {
    const plan = wbtbService.calculateWbtb({
      bedtime: '22:00',
      totalHours: 9,
    })

    expect(plan.primaryWakeTime).toBe('02:30') // 22:00 + 4.5h
    expect(plan.alternateWakeTime).toBe('04:00') // 22:00 + 6h
    expect(plan.finalWakeTime).toBe('07:00') // 22:00 + 9h

    const icsContent = icsExport.wbtbToIcs(plan, '2026-04-18')
    expect(icsContent).toContain('20260418T023000')
    expect(icsContent).toContain('20260418T040000')
    expect(icsContent).toContain('20260418T070000')
  })
})
