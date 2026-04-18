import { useCallback, useEffect, useState } from 'react'
import { subDays, parseISO, startOfDay } from 'date-fns'
import { detectDreamSigns, type DreamSign, generateTestDreams } from '../services/dreamSigns'
import { dreamRepo } from '../services/dreamRepo'
import {
  getAttentionFlags,
  setAttentionFlag as saveAttentionFlag,
} from '../services/dreamSignsStorage'
import { DreamSignCard } from './DreamSignCard'
import { DreamSignRelatedList } from './DreamSignRelatedList'

type WindowDays = 7 | 30 | 90

export function DreamSignsTab() {
  const [windowDays, setWindowDays] = useState<WindowDays>(30)
  const [dreamSigns, setDreamSigns] = useState<DreamSign[]>([])
  const [attentionFlags, setAttentionFlags] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [totalDreamsInWindow, setTotalDreamsInWindow] = useState(0)
  const [expandedSign, setExpandedSign] = useState<DreamSign | null>(null)

  const isDev = localStorage.getItem('DEV_MODE') === 'true'

  const loadDreamSigns = useCallback(async () => {
    setIsLoading(true)
    try {
      const allDreams = await dreamRepo.listAll()
      const signs = detectDreamSigns(allDreams, windowDays, 5)

      // Count dreams in current window using same logic as service
      const today = new Date()
      const windowStart = startOfDay(subDays(today, windowDays))
      const dreamsInWindow = allDreams.filter((d) => {
        const dreamDate = startOfDay(parseISO(d.dreamDate))
        return dreamDate >= windowStart || dreamDate.getTime() === windowStart.getTime()
      })

      setDreamSigns(signs)
      setTotalDreamsInWindow(dreamsInWindow.length)
      setAttentionFlags(getAttentionFlags())
    } finally {
      setIsLoading(false)
    }
  }, [windowDays])

  useEffect(() => {
    loadDreamSigns()
  }, [loadDreamSigns])

  const handleAttentionToggle = (tag: string, enabled: boolean) => {
    setAttentionFlags((prev) => ({ ...prev, [tag]: enabled }))
    saveAttentionFlag(tag, enabled)
  }

  const handlePopulateTestData = async () => {
    const confirmed = confirm(
      '這會在資料庫中創建 50 個測試夢。你確定要繼續嗎？（可後續手動刪除）'
    )
    if (!confirmed) return

    try {
      const testDreams = generateTestDreams(50)
      for (const dream of testDreams) {
        await dreamRepo.create(dream)
      }
      alert('已成功創建 50 個測試夢！')
      await loadDreamSigns()
    } catch (error) {
      console.error('Failed to populate test data:', error)
      alert('創建測試數據失敗，請檢查瀏覽器控制台。')
    }
  }

  const hasInsufficientData = dreamSigns.length < 5 || totalDreamsInWindow < 10

  const highPotentialSigns = dreamSigns.filter((s) => s.isHighPotential)
  const commonElementSigns = dreamSigns.filter((s) => !s.isHighPotential)

  return (
    <div className="space-y-6">
      {/* Top bar with controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Window selector */}
        <div className="flex gap-2">
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              onClick={() => setWindowDays(days)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                windowDays === days
                  ? 'bg-accent text-text-primary'
                  : 'bg-surface text-text-secondary hover:bg-surface-elevated'
              }`}
            >
              {days} 天
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={loadDreamSigns}
            disabled={isLoading}
            className="rounded-lg bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated disabled:opacity-50"
            aria-label="刷新"
          >
            ↻ 刷新
          </button>

          {isDev && (
            <button
              onClick={handlePopulateTestData}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-accent/90"
            >
              灌測試數據
            </button>
          )}
        </div>
      </div>

      {/* Insufficient data warning */}
      {hasInsufficientData && (
        <div className="rounded-lg border border-border-subtle bg-surface p-4">
          <p className="text-sm text-text-secondary">
            💭 資料還太少，繼續記錄一段時間後這裡會出現有意義的模式。（需要至少 5
            個不同的標籤或 10 個夢）
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-text-secondary">加載中...</div>
      ) : dreamSigns.length === 0 ? (
        <div className="rounded-lg border border-border-subtle bg-surface p-4 text-center text-text-secondary">
          沒有找到夢境模式
        </div>
      ) : (
        <>
          {/* High-Potential Block */}
          {highPotentialSigns.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-text-primary">高潛力觸發點</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {highPotentialSigns.map((sign) => (
                  <DreamSignCard
                    key={sign.tag}
                    sign={sign}
                    windowDays={windowDays}
                    isHighPotential={true}
                    attentionFlagEnabled={attentionFlags[sign.tag] || false}
                    onAttentionToggle={handleAttentionToggle}
                    onExpandRelated={setExpandedSign}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Common Elements Block */}
          {commonElementSigns.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-text-primary">常見元素</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {commonElementSigns.map((sign) => (
                  <DreamSignCard
                    key={sign.tag}
                    sign={sign}
                    windowDays={windowDays}
                    isHighPotential={false}
                    attentionFlagEnabled={attentionFlags[sign.tag] || false}
                    onAttentionToggle={handleAttentionToggle}
                    onExpandRelated={setExpandedSign}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Related dreams modal */}
      {expandedSign && (
        <DreamSignRelatedList
          sign={expandedSign}
          isOpen={!!expandedSign}
          onClose={() => setExpandedSign(null)}
        />
      )}
    </div>
  )
}
