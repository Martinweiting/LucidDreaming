/**
 * Reality Check 排程設定區
 * 分為多個 Section，使用現有元件組合
 */

import { useState } from 'react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import Section from './Section'
import SegmentControl from './SegmentControl'
import RCMethodMultiSelect from './RCMethodMultiSelect'
import { RCScheduleConfig, RCMethod } from '../types/realityCheck'

interface RCScheduleSettingsProps {
  config: RCScheduleConfig
  onChange: (config: RCScheduleConfig) => void
}

export default function RCScheduleSettings({ config, onChange }: RCScheduleSettingsProps): JSX.Element {
  const [startTime, setStartTime] = useState(config.startTime)
  const [endTime, setEndTime] = useState(config.endTime)

  const handleRemindCountChange = (count: 3 | 5 | 7 | 9) => {
    onChange({ ...config, remindCount: count })
  }

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value
    setStartTime(newStart)
    onChange({ ...config, startTime: newStart })
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value
    setEndTime(newEnd)
    onChange({ ...config, endTime: newEnd })
  }

  const handleMethodsChange = (methods: RCMethod[]) => {
    onChange({ ...config, selectedMethods: methods })
  }

  const displayDate = format(new Date(config.date + 'T00:00:00'), 'yyyy年M月d日 (EEEE)', { locale: zhTW })

  return (
    <div className="space-y-4">
      {/* 日期顯示 */}
      <Section title="日期" collapsible={false}>
        <p className="text-body text-text-secondary">{displayDate}</p>
      </Section>

      {/* 提醒次數 */}
      <Section title="提醒次數" defaultExpanded>
        <SegmentControl<3 | 5 | 7 | 9>
          options={[
            { label: '3 次', value: 3 },
            { label: '5 次', value: 5 },
            { label: '7 次', value: 7 },
            { label: '9 次', value: 9 },
          ]}
          value={config.remindCount}
          onChange={handleRemindCountChange}
        />
      </Section>

      {/* 時段設定 */}
      <Section title="時段" defaultExpanded>
        <div className="space-y-3">
          <div>
            <label htmlFor="startTime" className="block text-small text-text-secondary mb-1">
              開始時間
            </label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              className="w-full px-3 py-2 border border-border-default bg-bg-secondary rounded-lg text-body text-text-primary focus:outline-none focus:border-accent transition-colors duration-normal"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-small text-text-secondary mb-1">
              結束時間
            </label>
            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              className="w-full px-3 py-2 border border-border-default bg-bg-secondary rounded-lg text-body text-text-primary focus:outline-none focus:border-accent transition-colors duration-normal"
            />
          </div>
        </div>
      </Section>

      {/* RC 方法選擇 */}
      <Section title="Reality Check 方法" defaultExpanded>
        <RCMethodMultiSelect selected={config.selectedMethods} onChange={handleMethodsChange} />
      </Section>
    </div>
  )
}
