import { format, parseISO } from 'date-fns';
import { Dream } from '../../types/dream';
import Icon from './Icon';

interface DreamEntryProps {
  dream: Dream;
  onClick?: (id: string) => void;
  showTags?: boolean;
  compact?: boolean;
  className?: string;
}

const WEEKDAYS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function DreamEntry({
  dream,
  onClick,
  showTags = true,
  compact = false,
  className = '',
}: DreamEntryProps): JSX.Element {
  const date = parseISO(dream.dreamDate);
  const dateDisplay = format(date, 'M月d日');
  const weekday = WEEKDAYS_EN[date.getDay()];
  const isLucid = dream.lucidity !== null && dream.lucidity !== undefined && dream.lucidity > 0;

  const handleClick = (): void => onClick?.(dream.id);
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(dream.id); }
  };

  return (
    <article
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`夢境記錄 ${dateDisplay}`}
      className={`group outline-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        padding: '20px 0',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'all 180ms cubic-bezier(0.2,0,0,1)',
      }}
    >
      {/* 日期列 */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <time
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 14,
              letterSpacing: '0.04em',
              color: 'var(--text-secondary)',
              transition: 'color 180ms cubic-bezier(0.2,0,0,1)',
            }}
            className="group-hover:[color:var(--accent-default)]"
          >
            {dateDisplay}
          </time>
          <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {weekday}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isLucid && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--semantic-lucid)', fontSize: 11.5 }}>
              <Icon name="moon" size={12} />
              清明 {dream.lucidity}
            </span>
          )}
          {dream.isNightmare && (
            <span style={{ color: 'var(--semantic-nightmare)', fontSize: 11.5 }}>惡夢</span>
          )}
          {dream.ai !== null && !compact && (
            <span style={{ color: 'var(--text-tertiary)', fontSize: 11.5 }}>已分析</span>
          )}
        </div>
      </div>

      {/* 內文 */}
      <p
        style={{
          fontFamily: 'var(--font-serif, serif)',
          fontSize: compact ? 14.5 : 16,
          lineHeight: 1.75,
          color: 'var(--text-primary)',
          margin: 0,
          marginBottom: showTags && dream.tags.length > 0 ? 12 : 0,
        }}
        className={compact ? 'line-clamp-2' : 'line-clamp-3'}
      >
        {dream.content}
      </p>

      {/* 標籤列 */}
      {showTags && dream.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {dream.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 11.5,
                fontFamily: 'var(--font-ui, system-ui)',
                letterSpacing: '0.02em',
                background: 'color-mix(in srgb, var(--accent-default) 10%, transparent)',
                color: 'var(--text-secondary)',
              }}
            >
              {t}
            </span>
          ))}
          {dream.tags.length > 4 && (
            <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>+{dream.tags.length - 4}</span>
          )}
          {dream.mood !== null && dream.mood !== undefined && (
            <span style={{
              marginLeft: 'auto',
              fontSize: 11.5,
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-ui, system-ui)',
              letterSpacing: '0.04em',
            }}>
              情緒 {dream.mood > 0 ? `+${dream.mood}` : dream.mood}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
