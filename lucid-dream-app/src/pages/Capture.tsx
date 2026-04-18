/**
 * 快速捕捉頁面 — 夢境記錄的入口點。
 * 設計目標：打開 app 到開始打字 < 2 秒。
 * 美學：黑暗清醒 — 深色虛空 + 高對比輸入區，心理上賦予捕捉夢境的權限。
 */
import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { dreamRepo } from '../services/dreamRepo'
import PageLayout from '../components/PageLayout'

const AUTOSAVE_INTERVAL = 3000
const DRAFT_STORAGE_KEY = 'capture-draft'

export default function Capture(): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const navigate = useNavigate()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const autosaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 預設日期為昨天
  const defaultDate = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  const [content, setContent] = useState('')
  const [selectedDate, setSelectedDate] = useState(defaultDate)
  const [draftRestored, setDraftRestored] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 進入頁面時還原草稿
  useEffect(() => {
    const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY)
    if (saved) {
      try {
        const { content: savedContent, date: savedDate } = JSON.parse(saved)
        setContent(savedContent)
        setSelectedDate(savedDate)
        setDraftRestored(true)
      } catch {
        // 無效的 JSON，忽略
      }
    }
    // 立即 focus textarea
    textareaRef.current?.focus()
  }, [])

  // 自動保存到 sessionStorage
  useEffect(() => {
    const save = () => {
      sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ content, date: selectedDate })
      )
    }

    // 初始不保存（避免空内容被保存）
    if (content || selectedDate !== defaultDate) {
      save()
    }

    autosaveTimerRef.current = setInterval(save, AUTOSAVE_INTERVAL)

    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current)
      }
    }
  }, [content, selectedDate, defaultDate])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await dreamRepo.create({
        content,
        dreamDate: selectedDate,
      })
      // 清除草稿
      sessionStorage.removeItem(DRAFT_STORAGE_KEY)
      // 導向首頁
      navigate('/home')
    } catch (error) {
      console.error('Failed to save dream:', error)
      setIsSubmitting(false)
    }
  }

  // 格式化日期顯示
  const displayDate = format(new Date(selectedDate + 'T00:00:00'), 'yyyy年M月d日', {
    locale: zhTW,
  })

  const rightActions = (
    <button
      onClick={handleSave}
      disabled={!content.trim() || isSubmitting}
      className="px-3 py-1 rounded-md bg-accent text-small font-medium text-bg-primary transition-colors duration-normal enabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSubmitting ? '儲存中…' : '儲存'}
    </button>
  )

  return (
    <PageLayout
      title={displayDate}
      showBack={true}
      onBackClick={() => navigate('/home')}
      rightActions={rightActions}
      className="!px-0 !py-0"
    >
      <div className="flex h-full flex-col">
        {/* 日期選擇器 + 還原訊息 */}
        {draftRestored && (
          <div className="border-b border-border-subtle bg-bg-secondary px-4 py-2">
            <p className="text-caption text-text-tertiary">已還原未儲存內容</p>
          </div>
        )}

        {/* 主要區域：Textarea */}
        <div className="flex-1 overflow-hidden px-4 py-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="記下你還記得的一切，零碎也沒關係…"
            className="h-full w-full resize-none bg-surface p-4 font-serif text-body text-text-primary placeholder-text-tertiary outline-none transition-colors duration-normal focus:ring-2 focus:ring-border-default"
            spellCheck="false"
          />
        </div>

        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>
    </PageLayout>
  )
}
