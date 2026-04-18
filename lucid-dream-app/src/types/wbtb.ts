/**
 * WBTB (Wake-Back-To-Bed) 計算相關的型別定義。
 * WBTB 是在睡眠 4.5-6 小時後醒來，保持清醒 15-25 分鐘後回睡，以提高 REM 期清明夢機率。
 */

/**
 * 使用者設定的 WBTB 配置
 */
export interface WbtbConfig {
  /** 預計就寢時刻 (HH:MM 格式，如 "23:00") */
  bedtime: string
  /** 希望總睡眠時長：6 | 7 | 8 | 9 小時 */
  totalHours: 6 | 7 | 8 | 9
}

/**
 * WBTB 計算結果
 */
export interface WbtbPlan {
  /** 就寢時刻 (HH:MM) */
  bedtime: string
  /** 建議醒來時刻 - 就寢後 4.5 小時 (HH:MM) */
  primaryWakeTime: string
  /** 備選醒來時刻 - 就寢後 6 小時 (HH:MM) */
  alternateWakeTime: string
  /** 建議保持清醒的分鐘數 (通常 15-25) */
  awakeMinutes: number
  /** 最終起床時刻 (就寢 + 總睡眠時長) (HH:MM) */
  finalWakeTime: string
}

/**
 * ICS 導出時的 WBTB 事件格式
 */
export interface WbtbIcsEvents {
  /** WBTB 醒來事件 */
  wakeEvent: {
    startTime: string
    title: string
    description: string
    durationMinutes: number
    uid: string
  }
  /** 最終起床事件 */
  finalWakeEvent: {
    startTime: string
    title: string
    description: string
    durationMinutes: number
    uid: string
  }
}

/**
 * 驗證時間字串是否為有效 HH:MM 格式
 * @param time 時間字串，如 "23:00"
 * @returns 是否為有效格式
 */
export function isValidTimeString(time: string): boolean {
  return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)
}
