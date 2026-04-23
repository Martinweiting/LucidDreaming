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

export default function TagChip({
  tag,
  variant = 'quiet',
  size = 'sm',
  onRemove,
  onClick,
  className = '',
}: TagChipProps): JSX.Element {
  const sizeClass =
    size === 'sm'
      ? 'text-caption px-2 py-0.5 gap-1'
      : 'text-small px-3 py-1 gap-1.5';

  const variantClass: Record<TagVariant, string> = {
    quiet: 'border border-border-subtle text-tertiary rounded-sm',
    solid: 'bg-accent-muted text-accent border border-accent-subtle rounded-sm',
    underline: 'border-b border-border-default text-secondary',
    ghost: 'text-secondary hover:text-primary',
  };

  const isInteractive = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <span
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center font-ui transition-colors duration-fast ${sizeClass} ${variantClass[variant]} ${isInteractive ? 'cursor-pointer select-none' : ''} ${className}`}
    >
      <span>#{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex items-center justify-center opacity-50 transition-opacity hover:opacity-100"
          aria-label={`移除 ${tag}`}
        >
          <Icon name="close" size={10} strokeWidth={2} />
        </button>
      )}
    </span>
  );
}
