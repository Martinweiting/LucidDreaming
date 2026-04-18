/**
 * 需要打字確認的 modal 元件。
 */

interface ConfirmModalProps {
  title: string
  message: string
  confirmText: string
  confirmValue?: string
  currentValue?: string
  onValueChange?: (value: string) => void
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmModal({
  title,
  message,
  confirmText,
  confirmValue,
  currentValue = '',
  onValueChange,
  onConfirm,
  onCancel,
}: ConfirmModalProps): JSX.Element {
  const isConfirmMode = confirmValue !== undefined
  const isConfirmed = isConfirmMode ? currentValue === confirmValue : true

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 md:items-center md:justify-center">
      <div className="w-full rounded-t-2xl bg-bg-secondary p-6 md:w-auto md:max-w-sm md:rounded-2xl">
        <h2 className="font-serif text-title font-light text-text-primary mb-2">{title}</h2>
        <p className="text-body text-text-secondary mb-6">{message}</p>

        {isConfirmMode && (
          <div className="mb-6">
            <label className="block text-small font-medium text-text-primary mb-2">
              輸入「{confirmValue}」確認
            </label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => onValueChange?.(e.target.value)}
              placeholder={confirmValue}
              className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-border-default transition-colors"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-bg-primary border border-border-subtle rounded-lg text-body font-medium text-text-primary transition-colors hover:border-border-default"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmed}
            className="flex-1 px-4 py-2 bg-danger rounded-lg text-body font-medium text-bg-primary transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
