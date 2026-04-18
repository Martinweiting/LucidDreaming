interface TagChipProps {
  tag: string;
  onRemove?: () => void;
  onClick?: () => void;
  variant?: 'filled' | 'outline' | 'dashed';
}

export default function TagChip({
  tag,
  onRemove,
  onClick,
  variant = 'filled',
}: TagChipProps): JSX.Element {
  const baseClass = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-small transition-all duration-normal';

  const variantClass = {
    filled: 'bg-accent text-bg-primary',
    outline: 'border border-border-default bg-bg-secondary text-text-primary',
    dashed: 'border border-dashed border-border-default bg-bg-secondary text-text-secondary hover:border-border-subtle hover:text-text-primary',
  }[variant];

  return (
    <div
      className={`${baseClass} ${variantClass} ${onClick ? 'cursor-pointer hover:shadow-sm' : ''}`}
      onClick={onClick}
    >
      <span>{tag}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 flex h-4 w-4 items-center justify-center rounded-full hover:opacity-70 transition-opacity"
          aria-label={`移除 ${tag}`}
        >
          ✕
        </button>
      )}
    </div>
  );
}
