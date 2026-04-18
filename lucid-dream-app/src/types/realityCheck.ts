/**
 * Reality Check 排程相關的型別定義。
 * 排程是動態生成，不持久化到資料庫。
 */

/**
 * 五個內建的 Reality Check 方法
 */
export const RC_METHODS = [
  'Reality Symbol',
  'Dream Sign Journal',
  'Prospective Memory',
  'Reality Check Habit',
  'MILD Affirmation',
] as const

/**
 * Reality Check 方法的型別別名
 */
export type RCMethod = typeof RC_METHODS[number]

/**
 * 使用者設定的排程配置
 */
export interface RCScheduleConfig {
  /** 每日提醒次數：3 / 5 / 7 / 9 */
  remindCount: 3 | 5 | 7 | 9
  /** 開始時刻 (HH:MM 格式，如 "09:00") */
  startTime: string
  /** 結束時刻 (HH:MM 格式，如 "22:00") */
  endTime: string
  /** 選中的 RC 方法 */
  selectedMethods: RCMethod[]
  /** 排程的日期 (YYYY-MM-DD 格式) */
  date: string
}

/**
 * 單一個 Reality Check 排程事件
 */
export interface RCScheduleEvent {
  /** ISO 8601 時刻 (含日期與時間，如 "2026-04-18T09:40:00") */
  time: string
  /** 指派的 RC 方法 */
  method: RCMethod
  /** 事件時長 (分鐘，固定為 5) */
  durationMinutes: number
}

/**
 * 完整的排程物件
 */
export interface RCSchedule {
  /** 排程配置 */
  config: RCScheduleConfig
  /** 排程事件列表 */
  events: RCScheduleEvent[]
  /** 排程生成時刻 (ISO 8601) */
  generatedAt: string
}

/**
 * ICS 導出時的事件格式
 */
export interface IcsEvent {
  /** ISO 8601 時刻 */
  startTime: string
  /** 事件標題 */
  title: string
  /** 事件描述 */
  description: string
  /** 事件時長 (分鐘) */
  durationMinutes: number
  /** 唯一識別符 (UID) */
  uid?: string
}

/**
 * 驗證時間字串是否為有效 HH:MM 格式
 * @param time 時間字串，如 "09:00"
 * @returns 是否為有效格式
 */
export function isValidTimeString(time: string): boolean {
  return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)
}

/**
 * 驗證日期字串是否為有效 YYYY-MM-DD 格式
 * @param date 日期字串，如 "2026-04-18"
 * @returns 是否為有效格式
 */
export function isValidDateString(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
}
