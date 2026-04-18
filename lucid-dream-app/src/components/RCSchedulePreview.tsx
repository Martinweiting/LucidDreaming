/**
 * Reality Check 排程預覽列表
 * 顯示已生成的排程事件
 */

import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import Section from './Section'
import { RCScheduleEvent } from '../types/realityCheck'

interface RCSchedulePreviewProps {
  events: RCScheduleEvent[]
  onRegenerate: () => void
}

export default function RCSchedulePreview({ events, onRegenerate }: RCSchedulePreviewProps): JSX.Element {
  return (
    <Section title="排程預覽" defaultExpanded>
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-body text-text-secondary text-center py-4">尚未生成排程</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.map((event, idx) => {
              const eventDate = new Date(event.time)
              const timeStr = format(eventDate, 'HH:mm', { locale: zhTW })

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-bg-primary rounded-lg border border-border-subtle"
                >
                  <div>
                    <p className="text-body text-text-primary font-medium">{timeStr}</p>
                    <p className="text-small text-text-secondary">{event.method}</p>
                  </div>
                  <span className="text-small text-text-muted">5 分鐘</span>
                </div>
              )
            })}
          </div>
        )}
        <button
          onClick={onRegenerate}
          className="w-full py-2 px-4 bg-accent text-bg-primary rounded-lg text-body font-medium hover:opacity-90 transition-opacity duration-normal"
        >
          重新生成
        </button>
      </div>
    </Section>
  )
}
