/**
 * 標準 VCALENDAR/VEVENT ICS 格式導出。
 * 可重用於其他行事曆需求（如 WBTB tab）。
 * 不含 UI 依賴，可獨立測試。
 */

import { IcsEvent } from '../types/realityCheck'
import { WbtbPlan } from '../types/wbtb'

/**
 * 將 ISO 8601 時刻轉換為 ICS 標準格式 (YYYYMMDDTHHMMSSZ)
 * @param isoString ISO 8601 時刻字串
 * @returns ICS 格式的時刻
 */
function toIcsDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

/**
 * 轉換本地時間為 ICS 格式 (YYYYMMDDTHHMMSS，無 Z 表示本地時間)
 * @param dateStr 日期字串 (YYYY-MM-DD)
 * @param timeStr 時間字串 (HH:MM)
 * @returns ICS 格式的本地時刻
 */
function toIcsLocalDateTime(dateStr: string, timeStr: string): string {
  const dateWithoutDash = dateStr.replace(/-/g, '')
  const timeWithoutColon = timeStr.replace(/:/g, '')
  return `${dateWithoutDash}T${timeWithoutColon}00`
}

/**
 * 轉義 ICS 文本中的特殊字元
 * 根據 RFC 5545 規範，需轉義：\ , ; \n
 * @param text 原始文本
 * @returns 轉義後的文本
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
}

/**
 * 生成單個 VEVENT 區塊
 * @param event ICS 事件
 * @param index 事件序號（用於生成預設 UID）
 * @returns VEVENT 區塊文本
 */
function generateVEvent(event: IcsEvent, index: number): string {
  const dtstart = toIcsDateTime(event.startTime)
  const startDate = new Date(event.startTime)
  const endDate = new Date(startDate.getTime() + event.durationMinutes * 60000)
  const dtend = toIcsDateTime(endDate.toISOString())

  const uid = event.uid ?? `rc-event-${index}@lucid-dream-app`
  const dtstamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')

  return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapeIcsText(event.title)}
DESCRIPTION:${escapeIcsText(event.description)}
STATUS:CONFIRMED
END:VEVENT`
}

/**
 * ICS 導出服務：對象方法集合
 */
export const icsExport = {
  /**
   * 根據事件列表生成完整 ICS 檔案內容
   * @param events ICS 事件陣列
   * @returns 完整 ICS 檔案內容（文本）
   */
  toIcs(events: IcsEvent[]): string {
    const vevents = events.map((evt, idx) => generateVEvent(evt, idx)).join('\n')

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lucid Dream App//RC Schedule//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${vevents}
END:VCALENDAR`
  },

  /**
   * 根據 WBTB 計畫生成 ICS 檔案內容
   * 包含三個事件：WBTB 主要醒來 + WBTB 備選醒來 + 最終起床
   * @param plan WBTB 計畫
   * @param date 計畫日期 (YYYY-MM-DD 格式)
   * @returns 完整 ICS 檔案內容（文本）
   */
  wbtbToIcs(plan: WbtbPlan, date: string): string {
    const dtstamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')

    const generateWbtbEvent = (
      title: string,
      time: string,
      duration: number,
      uid: string,
      description: string
    ): string => {
      const dtstart = toIcsLocalDateTime(date, time)
      const timeParts = time.split(':').map(Number)
      const hours = timeParts[0] ?? 0
      const mins = timeParts[1] ?? 0
      const endMins = (hours * 60 + mins + duration) % 1440
      const endHours = Math.floor(endMins / 60)
      const endMinutes = endMins % 60
      const endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMinutes
        .toString()
        .padStart(2, '0')}`
      const dtend = toIcsLocalDateTime(date, endTimeStr)

      return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapeIcsText(title)}
DESCRIPTION:${escapeIcsText(description)}
STATUS:CONFIRMED
END:VEVENT`
    }

    const events = [
      generateWbtbEvent(
        'WBTB 醒來 - 主要選項',
        plan.primaryWakeTime,
        plan.awakeMinutes,
        `wbtb-wake-primary-${date}@lucid-dream-app`,
        `在主要清醒時間醒來。保持清醒 ${plan.awakeMinutes} 分鐘，然後回到床上進行清明夢練習。`
      ),
      generateWbtbEvent(
        'WBTB 醒來 - 備選選項',
        plan.alternateWakeTime,
        plan.awakeMinutes,
        `wbtb-wake-alternate-${date}@lucid-dream-app`,
        `備選清醒時間。保持清醒 ${plan.awakeMinutes} 分鐘，然後回到床上進行清明夢練習。`
      ),
      generateWbtbEvent(
        '最終起床時間',
        plan.finalWakeTime,
        0,
        `wbtb-final-wake-${date}@lucid-dream-app`,
        '結束睡眠，開始一天的活動。'
      ),
    ]

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lucid Dream App//WBTB Schedule//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events.join('\n')}
END:VCALENDAR`
  },

  /**
   * 觸發瀏覽器檔案下載
   * @param content ICS 檔案內容（文本）
   * @param filename 檔案名稱（含 .ics 副檔名）
   */
  downloadIcs(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 清理物件引用
    URL.revokeObjectURL(link.href)
  },
}
