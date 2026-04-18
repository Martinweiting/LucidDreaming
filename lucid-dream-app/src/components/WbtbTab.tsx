/**
 * WBTB Tab 元件
 * 用於計算和管理 WBTB (Wake-Back-To-Bed) 計畫
 */

import { useState } from 'react'
import { format } from 'date-fns'
import Section from './Section'
import SegmentControl from './SegmentControl'
import { WbtbConfig, WbtbPlan } from '../types/wbtb'
import { wbtbService } from '../services/wbtb'
import { icsExport } from '../services/icsExport'

export default function WbtbTab(): JSX.Element {
  const today = format(new Date(), 'yyyy-MM-dd')

  const [config, setConfig] = useState<WbtbConfig>({
    bedtime: '23:00',
    totalHours: 8,
  })

  const [plan, setPlan] = useState<WbtbPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleBedtimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({
      ...prev,
      bedtime: e.target.value,
    }))
  }

  const handleSleepHoursChange = (hours: number) => {
    setConfig((prev) => ({
      ...prev,
      totalHours: hours as 6 | 7 | 8 | 9,
    }))
  }

  const handleCalculate = () => {
    setError(null)
    try {
      const newPlan = wbtbService.calculateWbtb(config)
      setPlan(newPlan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'WBTB 計算失敗')
    }
  }

  const handleExportIcs = () => {
    if (!plan) {
      setError('請先計算 WBTB 計畫')
      return
    }

    try {
      const icsContent = icsExport.wbtbToIcs(plan, today)
      const filename = `wbtb-${today}.ics`
      icsExport.downloadIcs(icsContent, filename)
    } catch (err) {
      setError(err instanceof Error ? err.message : '匯出 ICS 失敗')
    }
  }

  return (
    <div className="space-y-6">
      {/* 設定區 */}
      <Section title="WBTB 設定" collapsible={false}>
        <div className="space-y-4">
          {/* 就寢時間 */}
          <div>
            <label className="block text-small font-medium text-text-primary mb-2">
              預計就寢時間
            </label>
            <input
              type="time"
              value={config.bedtime}
              onChange={handleBedtimeChange}
              className="w-full px-3 py-2 bg-bg-secondary border border-border-default rounded-lg text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary"
            />
          </div>

          {/* 睡眠時長選擇 */}
          <div>
            <label className="block text-small font-medium text-text-primary mb-2">
              希望總睡眠時長
            </label>
            <SegmentControl<number>
              options={[
                { label: '6 小時', value: 6 },
                { label: '7 小時', value: 7 },
                { label: '8 小時', value: 8 },
                { label: '9 小時', value: 9 },
              ]}
              value={config.totalHours}
              onChange={handleSleepHoursChange}
            />
          </div>
        </div>
      </Section>

      {/* 計算按鈕 */}
      <button
        onClick={handleCalculate}
        className="w-full py-3 px-4 bg-accent text-bg-primary rounded-lg text-body font-medium hover:opacity-90 transition-opacity duration-normal"
      >
        計算 WBTB 計畫
      </button>

      {/* 錯誤顯示 */}
      {error && (
        <div className="p-3 bg-danger/10 border border-danger rounded-lg">
          <p className="text-small text-danger">{error}</p>
        </div>
      )}

      {/* 結果顯示 */}
      {plan && (
        <>
          <Section title="WBTB 計畫" collapsible={false}>
            <div className="space-y-3">
              {/* 主要清醒時間 */}
              <div className="p-3 bg-bg-secondary rounded-lg border border-border-default">
                <p className="text-small text-text-secondary mb-1">建議醒來時間（主要選項）</p>
                <p className="text-display text-accent font-semibold">{plan.primaryWakeTime}</p>
                <p className="text-small text-text-muted mt-1">
                  就寢後 4.5 小時，清明夢效率較高的選項。
                </p>
              </div>

              {/* 備選清醒時間 */}
              <div className="p-3 bg-bg-secondary rounded-lg border border-border-default">
                <p className="text-small text-text-secondary mb-1">備選醒來時間</p>
                <p className="text-h3 text-text-primary font-semibold">{plan.alternateWakeTime}</p>
                <p className="text-small text-text-muted mt-1">
                  就寢後 6 小時，如果主要選項睡眠不足，可選此時間。
                </p>
              </div>

              {/* 清醒時間 */}
              <div className="p-3 bg-surface rounded-lg border border-border-default">
                <p className="text-small text-text-secondary mb-2">清醒時間安排</p>
                <p className="text-body text-text-primary">
                  保持清醒 <span className="font-semibold text-accent">{plan.awakeMinutes} 分鐘</span>
                </p>
                <p className="text-small text-text-muted mt-2">
                  在這段時間內，進行清明夢準備、Reality Check、或靜坐，增強對夢境的覺察。
                </p>
              </div>

              {/* 最終起床時間 */}
              <div className="p-3 bg-surface rounded-lg border border-border-default">
                <p className="text-small text-text-secondary mb-1">最終起床時間</p>
                <p className="text-h3 text-text-primary font-semibold">{plan.finalWakeTime}</p>
                <p className="text-small text-text-muted mt-1">
                  完整睡眠時間（{config.totalHours} 小時）後，該起床的時間。
                </p>
              </div>
            </div>
          </Section>

          {/* 匯出按鈕 */}
          <button
            onClick={handleExportIcs}
            className="w-full py-3 px-4 bg-bg-secondary text-text-primary border border-border-default rounded-lg text-body font-medium hover:bg-surface transition-colors duration-normal"
          >
            匯出為 .ics 行事曆檔
          </button>
        </>
      )}

      {/* WBTB 教學 */}
      <Section title="WBTB 是什麼？" collapsible={true}>
        <p className="text-body text-text-secondary leading-relaxed">
          WBTB（Wake-Back-To-Bed，睡眠中段喚醒法）是一種提高清明夢機率的技巧。在睡眠約
          4.5–6 小時後清醒 15–25 分鐘，再回到床上睡眠，能顯著增加進入 REM
          睡眠階段時的意識清晰度。此時若配合
          Reality Check（現實檢查），更容易在夢境中獲得覺察，實現清明夢。建議在清醒期間進行
          5–10 次的Reality Check，或做簡短靜坐，加強夢境覺察的意圖。
        </p>
      </Section>
    </div>
  )
}
