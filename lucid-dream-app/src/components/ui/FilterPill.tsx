interface FilterPillProps {
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  className?: string;
}

export default function FilterPill({
  label,
  active = false,
  count,
  onClick,
  className = '',
}: FilterPillProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-4 py-2 font-ui text-small tracking-wide transition-colors duration-fast outline-none focus-visible:ring-1 focus-visible:ring-border-focus ${
        active ? 'text-primary' : 'text-tertiary hover:text-secondary'
      } ${className}`}
    >
      <span>{label}</span>

      {count !== undefined && count > 0 && (
        <span className="font-ui text-caption text-disabled tabular-nums">
          {count}
        </span>
      )}

      {/* 底線指示器 */}
      <span
        className={`absolute bottom-0 left-3 right-3 h-px transition-all duration-normal ${
          active ? 'bg-accent-default' : 'bg-transparent'
        }`}
      />
    </button>
  );
}
