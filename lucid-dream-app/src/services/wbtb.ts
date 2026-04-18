/**
 * WBTB 計算邏輯。
 * 對象方法集合模式，所有業務邏輯在此。
 * 不含 UI 依賴，可獨立測試。
 */

import { WbtbConfig, WbtbPlan, isValidTimeString } from '../types/wbtb'

/**
 * 將 HH:MM 轉換為自午夜起的分鐘數
 */
function timeStringToMinutes(timeStr: string): number {
  const parts = timeStr.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return hours * 60 + minutes
}

/**
 * 將自午夜起的分鐘數轉換為 HH:MM 格式
 * 支援跨天 (超過 1440 分鐘時自動換天)
 */
function minutesToTimeString(minutes: number): string {
  // 處理跨天情況
  const normalizedMinutes = minutes % 1440
  const h = Math.floor(normalizedMinutes / 60)
    .toString()
    .padStart(2, '0')
  const m = (normalizedMinutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

/**
 * WBTB 服務：對象方法集合
 */
export const wbtbService = {
  /**
   * 根據就寢時間和總睡眠時長計算 WBTB 計畫
   * @param config WBTB 配置
   * @returns WBTB 計畫
   * @throws 若配置驗證失敗
   */
  calculateWbtb(config: WbtbConfig): WbtbPlan {
    // 驗證配置
    const validation = this.validateConfig(config)
    if (!validation.valid) {
      throw new Error(validation.errors[0] ?? 'WBTB 配置無效')
    }

    const bedtimeMinutes = timeStringToMinutes(config.bedtime)

    // 計算各個時刻（都是相對於午夜的分鐘數）
    // 主要醒來時刻：就寢 + 4.5 小時
    const primaryWakeMinutes = bedtimeMinutes + 4.5 * 60
    // 備選醒來時刻：就寢 + 6 小時
    const alternateWakeMinutes = bedtimeMinutes + 6 * 60
    // 最終起床時刻：就寢 + 總睡眠時長
    const finalWakeMinutes = bedtimeMinutes + config.totalHours * 60

    return {
      bedtime: config.bedtime,
      primaryWakeTime: minutesToTimeString(primaryWakeMinutes),
      alternateWakeTime: minutesToTimeString(alternateWakeMinutes),
      awakeMinutes: 20, // 固定建議 20 分鐘，在 15-25 範圍內
      finalWakeTime: minutesToTimeString(finalWakeMinutes),
    }
  },

  /**
   * 驗證 WBTB 配置
   * @param config WBTB 配置
   * @returns 驗證結果與錯誤清單
   */
  validateConfig(config: WbtbConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // 驗證就寢時間格式
    if (!isValidTimeString(config.bedtime)) {
      errors.push('就寢時間格式必須為 HH:MM')
    }

    // 驗證總睡眠時長
    if (![6, 7, 8, 9].includes(config.totalHours)) {
      errors.push('總睡眠時長必須為 6, 7, 8 或 9 小時')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },
}
