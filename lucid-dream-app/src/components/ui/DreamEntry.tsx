import { format, parseISO } from 'date-fns';
import { Dream } from '../../types/dream';

interface DreamEntryProps {
  dream: Dream;
  onClick?: (id: string) => void;
  showTags?: boolean;
  compact?: boolean;
  className?: string;
}

export default function DreamEntry({
  dream,
  onClick,
  showTags = true,
  compact = false,
  className = '',
}: DreamEntryProps): JSX.Element {
  const date = parseISO(dream.dreamDate);
  const day = format(date, 'd');
  const month = `${format(date, 'M')}月`;
  const snippet = dream.ai?.summary ?? dream.content.slice(0, 120);
  const hasLucid = dream.lucidity !== null && dream.lucidity !== undefined && dream.lucidity > 0;
  const isNightmare = dream.isNightmare;

  const handleClick = (): void => onClick?.(dream.id);

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(dream.id);
    }
  };

  return (
    <article
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`夢境記錄 ${month}${day}日`}
      className={`group flex items-start gap-6 border-b border-border-subtle ${
        compact ? 'py-4' : 'py-5'
      } cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-border-focus ${className}`}
    >
      {/* 日期欄：大數字 + 月份 */}
      <div className="w-10 flex-shrink-0 text-right pt-1">
        <span className="block font-serif text-heading font-light text-disabled tabular-nums leading-none">
          {day}
        </span>
        <span className="block font-ui text-caption text-disabled mt-1 tracking-wide">
          {month}
        </span>
      </div>

      {/* 內容欄 */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-serif text-body text-secondary leading-relaxed transition-colors duration-fast group-hover:text-primary ${
            compact ? 'line-clamp-2' : 'line-clamp-3'
          }`}
        >
          {snippet}
        </p>

        {/* 標記與標籤 */}
        {(showTags && dream.tags.length > 0) || hasLucid || isNightmare ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {hasLucid && (
              <span className="font-ui text-caption text-lucid tracking-wide">
                清明
              </span>
            )}
            {isNightmare && (
              <span className="font-ui text-caption text-nightmare tracking-wide">
                夢魘
              </span>
            )}
            {showTags &&
              dream.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="font-ui text-caption text-disabled tracking-wide"
                >
                  #{tag}
                </span>
              ))}
            {showTags && dream.tags.length > 3 && (
              <span className="font-ui text-caption text-disabled">
                +{dream.tags.length - 3}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
