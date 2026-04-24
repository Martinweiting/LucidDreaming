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
      className={className}
      style={{
        background: 'none',
        border: 'none',
        padding: '6px 2px',
        marginRight: 18,
        fontFamily: 'var(--font-ui, system-ui)',
        fontSize: 13.5,
        letterSpacing: '0.02em',
        color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'color 180ms cubic-bezier(0.2,0,0,1)',
      }}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--text-disabled)' }}>{count}</span>
      )}
      <span style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -2,
        height: 1,
        background: active ? 'var(--accent-default)' : 'transparent',
        transition: 'background 180ms cubic-bezier(0.2,0,0,1)',
      }} />
    </button>
  );
}
