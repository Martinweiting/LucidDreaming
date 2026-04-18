import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DreamSign } from '../services/dreamSigns'
import { dreamRepo } from '../services/dreamRepo'
import { Dream } from '../types/dream'

interface DreamSignRelatedListProps {
  sign: DreamSign
  isOpen: boolean
  onClose: () => void
}

export function DreamSignRelatedList({ sign, isOpen, onClose }: DreamSignRelatedListProps) {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const loadDreams = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const relatedDreams = await Promise.all(
          sign.dreamIds.map((id) => dreamRepo.get(id))
        )
        setDreams(relatedDreams.filter((d) => d !== undefined))
      } catch (err) {
        setError('無法加載相關的夢，請稍後重試。')
        console.error('Failed to load related dreams:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDreams()
  }, [isOpen, sign])

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center">
      <div className="max-h-[80vh] w-full rounded-t-lg border-t border-border-default bg-bg-primary sm:max-h-96 sm:w-full sm:max-w-2xl sm:rounded-lg sm:border">
        {/* Header */}
        <div className="border-b border-border-default px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              包含「{sign.tag}」的夢
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
              aria-label="關閉"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
          {isLoading ? (
            <p className="text-center text-text-secondary">加載中...</p>
          ) : error ? (
            <p className="text-center text-danger">{error}</p>
          ) : dreams.length === 0 ? (
            <p className="text-center text-text-muted">找不到相關的夢</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {dreams.map((dream) => (
                <Link
                  key={dream.id}
                  to={`/dream/${dream.id}`}
                  onClick={onClose}
                  className="block rounded-lg border border-border-subtle bg-surface p-3 transition-colors hover:border-border-default hover:bg-surface-elevated sm:p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-text-muted">{dream.dreamDate}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                        {dream.content}
                      </p>
                      {dream.lucidity !== null && dream.lucidity > 0 && (
                        <div className="mt-2 inline-block rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                          清明夢 ({dream.lucidity}/6)
                        </div>
                      )}
                    </div>
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
