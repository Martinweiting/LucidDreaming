import { format, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Dream } from '../../types/dream';
import TagChip from '../TagChip';

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
  const monthDay = format(date, 'MM/dd', { locale: zhTW });
  const weekday = format(date, 'EEEEE', { locale: zhTW }); // 單字週一到日
  const snippet = dream.ai?.summary ?? dream.content.slice(0, 100);
  const hasLucid = dream.lucidity !== null && dream.lucidity !== undefined && dream.lucidity > 0;
  const isNightmare = dream.isNightmare;

  const accentBorder = hasLucid
    ? 'border-l-semantic-lucid'
    : isNightmare
    ? 'border-l-semantic-nightmare'
    : 'border-l-border-subtle group-hover:border-l-border-default';

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
      aria-label={`夢境記錄 ${monthDay}`}
      className={`group flex gap-4 ${compact ? 'py-3' : 'py-4'} cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-border-focus rounded-sm ${className}`}
    >
      {/* 日期軸 */}
      <div className="w-10 flex-shrink-0 pt-0.5 text-right">
        <span className="block text-small tabular-nums text-tertiary font-ui">
          {monthDay}
        </span>
        <span className="block text-caption text-disabled font-ui">
          {weekday}
        </span>
      </div>

      {/* 左側 accent 線 + 內容 */}
      <div
        className={`flex-1 border-l-2 pl-4 transition-colors duration-fast ${accentBorder}`}
      >
        <p
          className={`font-serif text-body text-primary leading-relaxed transition-colors duration-fast group-hover:text-text-primary ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}
        >
          {snippet}
        </p>

        {/* 指示器 + 標籤 */}
        {(showTags && dream.tags.length > 0) || hasLucid || isNightmare ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {hasLucid && (
              <span className="rounded-sm border border-semantic-lucid/30 px-1.5 py-0.5 text-caption text-lucid font-ui">
                清明
              </span>
            )}
            {isNightmare && (
              <span className="rounded-sm border border-semantic-nightmare/30 px-1.5 py-0.5 text-caption text-nightmare font-ui">
                夢魘
              </span>
            )}
            {showTags &&
              dream.tags.slice(0, 3).map((tag) => (
                <TagChip key={tag} tag={tag} variant="quiet" size="sm" />
              ))}
            {showTags && dream.tags.length > 3 && (
              <span className="text-caption text-disabled font-ui">
                +{dream.tags.length - 3}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
