/**
 * Lucid Lab 主頁面
 * 三個 tab 結構：Reality Check / Dream Signs / WBTB
 * Sprint 5a 實現：Reality Check, Dream Signs
 * Sprint 5b 規劃：WBTB
 */

import { useState } from 'react'
import { format } from 'date-fns'
import RCScheduleSettings from '../components/RCScheduleSettings'
import RCSchedulePreview from '../components/RCSchedulePreview'
import { DreamSignsTab } from '../components/DreamSignsTab'
import WbtbTab from '../components/WbtbTab'
import { RCScheduleConfig, RCScheduleEvent, RC_METHODS } from '../types/realityCheck'
import { rcScheduleService } from '../services/rcSchedule'
import { icsExport } from '../services/icsExport'

type ActiveTab = 'rc' | 'dream-signs' | 'wbtb'

const tabs: { id: ActiveTab; label: string }[] = [
  { id: 'rc', label: 'Reality Check' },
  { id: 'dream-signs', label: 'Dream Signs' },
  { id: 'wbtb', label: 'WBTB' },
]

export default function LucidLab(): JSX.Element {
  const today = format(new Date(), 'yyyy-MM-dd')

  const [activeTab, setActiveTab] = useState<ActiveTab>('rc')

  // RC 排程狀態
  const [config, setConfig] = useState<RCScheduleConfig>({
    remindCount: 5,
    startTime: '09:00',
    endTime: '22:00',
    selectedMethods: [RC_METHODS[0]],
    date: today,
  })

  const [schedule, setSchedule] = useState<RCScheduleEvent[]>([])
  const [generationError, setGenerationError] = useState<string | null>(null)

  // 生成排程
  const handleGenerateSchedule = () => {
    setGenerationError(null)
    try {
      const newSchedule = rcScheduleService.generateRcSchedule(config)
      setSchedule(newSchedule)
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : '排程生成失敗')
    }
  }

  // 下載 ICS
  const handleDownloadIcs = () => {
    if (schedule.length === 0) {
      setGenerationError('請先生成排程')
      return
    }

    const icsEvents = schedule.map((event) => ({
      startTime: event.time,
      title: `Reality Check：${event.method}`,
      description: '停下來，認真做這個 RC。問自己：我現在是不是在做夢？',
      durationMinutes: event.durationMinutes,
      uid: `rc-${config.date}-${event.time}@lucid-dream-app`,
    }))

    const icsContent = icsExport.toIcs(icsEvents)
    const filename = `rc-schedule-${config.date}.ics`
    icsExport.downloadIcs(icsContent, filename)
  }

  return (
    <div className="min-h-screen bg-surface p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-heading text-text-primary mb-6 mt-8">Lucid Lab</h1>

        {/* Tab 導覽 */}
        <div className="flex gap-1 mb-6 border-b border-border-subtle">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 text-body font-medium transition-colors duration-normal
                border-b-2 -mb-px
                ${
                  activeTab === tab.id
                    ? 'text-accent border-accent'
                    : 'text-text-secondary border-transparent hover:text-text-primary'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 內容 */}
        <div className="space-y-4">
          {activeTab === 'rc' && (
            <>
              {/* 設定區 */}
              <RCScheduleSettings config={config} onChange={setConfig} />

              {/* 生成按鈕 */}
              <button
                onClick={handleGenerateSchedule}
                className="w-full py-3 px-4 bg-accent text-bg-primary rounded-lg text-body font-medium hover:opacity-90 transition-opacity duration-normal"
              >
                生成排程
              </button>

              {/* 錯誤顯示 */}
              {generationError && (
                <div className="p-3 bg-danger/10 border border-danger rounded-lg">
                  <p className="text-small text-danger">{generationError}</p>
                </div>
              )}

              {/* 預覽區 */}
              {schedule.length > 0 && (
                <>
                  <RCSchedulePreview events={schedule} onRegenerate={handleGenerateSchedule} />

                  {/* 下載按鈕 */}
                  <button
                    onClick={handleDownloadIcs}
                    className="w-full py-3 px-4 bg-bg-secondary text-text-primary border border-border-default rounded-lg text-body font-medium hover:bg-surface transition-colors duration-normal"
                  >
                    下載為 .ics 檔案
                  </button>
                </>
              )}
            </>
          )}

          {activeTab === 'dream-signs' && <DreamSignsTab />}

          {activeTab === 'wbtb' && <WbtbTab />}
        </div>
      </div>
    </div>
  )
}
