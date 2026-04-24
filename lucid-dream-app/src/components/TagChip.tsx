import Icon from './ui/Icon';

export type TagVariant = 'quiet' | 'solid' | 'underline' | 'ghost';
export type TagSize = 'sm' | 'md';

interface TagChipProps {
  tag: string;
  variant?: TagVariant;
  size?: TagSize;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

const VARIANT_STYLES: Record<TagVariant, React.CSSProperties> = {
  quiet: {
    background: 'color-mix(in srgb, var(--accent-default) 10%, transparent)',
    color: 'var(--text-secondary)',
    border: 'none',
    borderRadius: 999,
  },
  solid: {
    background: 'var(--accent-default)',
    color: 'var(--accent-contrast)',
    border: 'none',
    borderRadius: 999,
  },
  underline: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    borderBottom: '1px solid var(--border-subtle)',
    borderRadius: 0,
    padding: '2px 0',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-tertiary)',
    border: '1px dashed var(--border-default)',
    borderRadius: 999,
  },
};

const SIZE_STYLES: Record<TagSize, React.CSSProperties> = {
  sm: { padding: '2px 8px', fontSize: 11.5 },
  md: { padding: '4px 10px', fontSize: 12.5 },
};

export default function TagChip({
  tag,
  variant = 'quiet',
  size = 'sm',
  onRemove,
  onClick,
  className = '',
}: TagChipProps): JSX.Element {
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-ui, system-ui)',
        letterSpacing: '0.02em',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 180ms cubic-bezier(0.2,0,0,1)',
        ...SIZE_STYLES[size],
        ...VARIANT_STYLES[variant],
      }}
    >
      {tag}
      {onRemove !== undefined && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6, padding: 0, display: 'inline-flex' }}
          aria-label={`移除 ${tag}`}
        >
          <Icon name="close" size={11} strokeWidth={2} />
        </button>
      )}
    </span>
  );
}
