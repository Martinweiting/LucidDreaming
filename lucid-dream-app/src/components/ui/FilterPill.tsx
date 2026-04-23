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
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-small font-ui transition-all duration-fast ${
        active
          ? 'bg-accent-default text-bg-base'
          : 'border border-border-subtle bg-surface text-secondary hover:border-border-default hover:text-primary active:bg-inset'
      } ${className}`}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`rounded-full px-1 text-caption tabular-nums ${
            active ? 'bg-bg-base/20 text-bg-base' : 'text-tertiary'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
