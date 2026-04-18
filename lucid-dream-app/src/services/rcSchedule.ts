/**
 * Reality Check 排程生成邏輯。
 * 對象方法集合模式，所有業務邏輯在此。
 * 不含 UI 依賴，可獨立測試。
 */

import { RCScheduleConfig, RCScheduleEvent, RCMethod, RC_METHODS, isValidTimeString, isValidDateString } from '../types/realityCheck'

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
 */
function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

/**
 * 生成 N 個隨機時間點，確保間隔 ≥ 60 分鐘
 * @param startTime 開始時刻 (HH:MM)
 * @param endTime 結束時刻 (HH:MM)
 * @param count 要生成的時間點數量
 * @returns 排序後的時間點陣列 (HH:MM 格式)
 * @throws 若時段過短無法容納所需數量的時間點
 */
function generateRandomTimePoints(startTime: string, endTime: string, count: number): string[] {
  const startMin = timeStringToMinutes(startTime)
  const endMin = timeStringToMinutes(endTime)
  const range = endMin - startMin

  // 驗證時段長度是否足夠
  if (range < (count - 1) * 60) {
    throw new Error(
      `時段範圍 (${range} 分鐘) 無法容納 ${count} 個間隔 ≥60 分鐘的提醒。` +
        `最多可容納 ${Math.floor(range / 60) + 1} 個。`
    )
  }

  const points: number[] = []

  for (let i = 0; i < count; i++) {
    if (i === 0) {
      // 第一個點：在起始時段內隨機
      const maxFirst = Math.min(endMin - (count - 1) * 60, startMin + range / (count + 1))
      points.push(startMin + Math.random() * (maxFirst - startMin))
    } else {
      // 後續點：確保與前一點間隔 ≥ 60 分鐘
      const prevPoint = points[i - 1]
      if (prevPoint !== undefined) {
        const minNext = prevPoint + 60
        const maxNext = endMin - (count - i - 1) * 60
        if (minNext <= maxNext) {
          points.push(minNext + Math.random() * (maxNext - minNext))
        }
      }
    }
  }

  // 排序並轉換回 HH:MM
  return points
    .sort((a, b) => a - b)
    .map((m) => minutesToTimeString(Math.round(m)))
}

/**
 * 隨機選擇 N 個 RC 方法 (允許重複)
 */
function selectRandomMethods(methods: RCMethod[], count: number): RCMethod[] {
  if (methods.length === 0) {
    return []
  }

  const selected: RCMethod[] = []
  for (let i = 0; i < count; i++) {
    const randomIdx = Math.floor(Math.random() * methods.length)
    const method = methods[randomIdx]!
    selected.push(method)
  }
  return selected
}

/**
 * RC 排程服務：對象方法集合
 */
export const rcScheduleService = {
  /**
   * 根據配置生成排程
   * @param config 排程配置
   * @returns 排程事件列表，按時間排序
   * @throws 若設定驗證失敗或時段過短
   */
  generateRcSchedule(config: RCScheduleConfig): RCScheduleEvent[] {
    // 驗證配置
    const validation = this.validateConfig(config)
    if (!validation.valid) {
      throw new Error(validation.errors[0] ?? '排程配置無效')
    }

    // 生成隨機時間點
    const timePoints = generateRandomTimePoints(config.startTime, config.endTime, config.remindCount)

    // 隨機指派方法
    const selectedMethods = selectRandomMethods(config.selectedMethods, config.remindCount)

    // 組合為事件
    return timePoints.map((time, idx) => {
      const method = selectedMethods[idx]
      if (method === undefined) {
        throw new Error('方法指派失敗')
      }
      return {
        time: `${config.date}T${time}:00`,
        method,
        durationMinutes: 5,
      }
    })
  },

  /**
   * 驗證排程配置
   * @param config 排程配置
   * @returns 驗證結果與錯誤清單
   */
  validateConfig(config: RCScheduleConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // 驗證日期格式
    if (!isValidDateString(config.date)) {
      errors.push('日期格式必須為 YYYY-MM-DD')
    }

    // 驗證時間格式
    if (!isValidTimeString(config.startTime)) {
      errors.push('開始時間格式必須為 HH:MM')
    }

    if (!isValidTimeString(config.endTime)) {
      errors.push('結束時間格式必須為 HH:MM')
    }

    // 驗證時段順序與長度
    if (isValidTimeString(config.startTime) && isValidTimeString(config.endTime)) {
      const startMin = timeStringToMinutes(config.startTime)
      const endMin = timeStringToMinutes(config.endTime)

      if (startMin >= endMin) {
        errors.push('開始時間必須早於結束時間')
      } else {
        // 驗證時段長度是否足夠
        const range = endMin - startMin
        if (range < (config.remindCount - 1) * 60) {
          errors.push(
            `時段過短：從 ${config.startTime} 到 ${config.endTime} 無法容納 ${config.remindCount} 個間隔 ≥60 分鐘的提醒。` +
              `最多可容納 ${Math.floor(range / 60) + 1} 個。`
          )
        }
      }
    }

    // 驗證方法選擇
    if (config.selectedMethods.length === 0) {
      errors.push('至少需選擇一個 RC 方法')
    }

    // 驗證選中的方法是否有效
    for (const method of config.selectedMethods) {
      if (!RC_METHODS.includes(method)) {
        errors.push(`無效的 RC 方法：${method}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },
}
