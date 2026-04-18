/**
 * 共用型別匯出入口。
 * 日後 sprint 會在此目錄新增 dream.ts、preferences.ts 等型別檔。
 */
export type { Dream, DreamDraft, DreamUpdate } from './dream'
export { SCHEMA_VERSION } from './dream'

// Reality Check 排程型別
export type { RCMethod, RCScheduleConfig, RCScheduleEvent, RCSchedule, IcsEvent } from './realityCheck'
export { RC_METHODS, isValidTimeString, isValidDateString } from './realityCheck'
