import { DreamSign } from '../services/dreamSigns'

interface DreamSignCardProps {
  sign: DreamSign
  windowDays: number
  isHighPotential: boolean
  attentionFlagEnabled: boolean
  onAttentionToggle: (tag: string, enabled: boolean) => void
  onExpandRelated: (sign: DreamSign) => void
}

export function DreamSignCard({
  sign,
  windowDays,
  isHighPotential,
  attentionFlagEnabled,
  onAttentionToggle,
  onExpandRelated,
}: DreamSignCardProps) {
  const percentageStr = (sign.lucidRate * 100).toFixed(0)

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
        isHighPotential
          ? 'border-accent bg-surface-elevated shadow-lg'
          : 'border-border-default bg-surface shadow'
      }`}
    >
      {/* Tag name */}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-base font-semibold text-text-primary">{sign.tag}</h3>
        {isHighPotential && (
          <span className="inline-block rounded bg-accent px-2 py-0.5 text-xs font-medium text-text-primary">
            高潛力觸發點
          </span>
        )}
      </div>

      {/* Occurrence count */}
      <p className="mb-2 text-sm text-text-secondary">
        過去 {windowDays} 天出現 <span className="font-semibold">{sign.totalCount}</span> 次
      </p>

      {/* Lucid count and rate */}
      <p className="mb-4 text-sm text-text-secondary">
        曾在 <span className="font-semibold">{sign.lucidCount}</span> 個清明夢中出現（
        <span className="font-semibold">{percentageStr}%</span>）
      </p>

      {/* Attention toggle */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => onAttentionToggle(sign.tag, !attentionFlagEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            attentionFlagEnabled ? 'bg-accent' : 'bg-surface'
          }`}
          role="switch"
          aria-checked={attentionFlagEnabled}
          aria-label={`在 RC 排程中提示我注意 ${sign.tag}：${attentionFlagEnabled ? '已啟用' : '已停用'}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-surface transition-transform ${
              attentionFlagEnabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span className="text-sm text-text-secondary">在 RC 排程中提示我注意</span>
      </div>

      {/* Related dreams link */}
      <button
        onClick={() => onExpandRelated(sign)}
        className="text-sm text-accent underline transition-colors hover:text-accent/80"
      >
        查看相關的夢 ({sign.dreamIds.length})
      </button>
    </div>
  )
}
