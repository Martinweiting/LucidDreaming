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
  const sizeClass = size === 'sm' ? 'text-caption gap-1' : 'text-small gap-1';

  const variantClass: Record<TagVariant, string> = {
    /* 純文字，幾乎隱形 */
    quiet: 'text-disabled',
    /* 微底色，accent 文字 */
    solid: 'bg-accent-subtle text-accent px-2 py-1 rounded-xs',
    /* 底線版 */
    underline: 'border-b border-border-subtle text-tertiary pb-px',
    /* 完全透明 */
    ghost: 'text-tertiary hover:text-secondary',
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
      className={`inline-flex items-center font-ui tracking-wide transition-colors duration-fast ${sizeClass} ${variantClass[variant]} ${
        isInteractive ? 'cursor-pointer select-none' : ''
      } ${className}`}
    >
      <span>#{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex items-center justify-center opacity-40 transition-opacity hover:opacity-80"
          aria-label={`移除 ${tag}`}
        >
          <Icon name="close" size={10} strokeWidth={1.5} />
        </button>
      )}
    </span>
  );
}
