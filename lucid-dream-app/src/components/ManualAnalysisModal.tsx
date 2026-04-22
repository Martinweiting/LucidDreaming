import { useState } from 'react'
import { getManualAnalysisPrompt } from '../services/ai'

interface ManualAnalysisModalProps {
  dreamContent: string
  onClose: () => void
}

export default function ManualAnalysisModal({
  dreamContent,
  onClose,
}: ManualAnalysisModalProps): JSX.Element {
  const [copied, setCopied] = useState(false)
  const prompt = getManualAnalysisPrompt(dreamContent)

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(prompt)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = prompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg rounded-t-2xl bg-bg-secondary border border-border-subtle p-5 space-y-4 max-h-[80dvh] flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-body font-semibold text-text-primary">手動分析說明</h2>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="flex min-h-10 min-w-10 items-center justify-center text-text-muted transition-colors duration-normal hover:text-text-secondary"
          >
            ✕
          </button>
        </div>

        <p className="text-small text-text-secondary">
          將以下提示詞複製後，貼入 ChatGPT、Claude、Gemini 等 AI 服務執行，再將分析結果記錄於筆記欄位。
        </p>

        <div className="flex-1 overflow-y-auto rounded-lg bg-bg-primary border border-border-subtle p-3">
          <pre className="whitespace-pre-wrap font-mono text-caption text-text-secondary leading-relaxed">
            {prompt}
          </pre>
        </div>

        <button
          onClick={handleCopy}
          className="w-full min-h-10 rounded-md bg-accent py-2 text-body font-medium text-bg-primary transition-colors duration-normal hover:bg-accent-hover active:scale-95"
        >
          {copied ? '✓ 已複製' : '複製提示詞'}
        </button>
      </div>
    </div>
  )
}
