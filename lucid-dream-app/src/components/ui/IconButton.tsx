import { useState } from 'react';
import Icon, { IconName } from './Icon';

type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  icon: IconName;
  label: string;
  onClick?: () => void;
  variant?: 'ghost' | 'subtle' | 'solid';
  size?: IconButtonSize;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function IconButton({
  icon,
  label,
  onClick,
  size = 'md',
  active = false,
  disabled = false,
  className = '',
  type = 'button',
}: IconButtonProps): JSX.Element {
  const [hover, setHover] = useState(false);

  const sizeMap: Record<IconButtonSize, { dim: number; icon: number }> = {
    sm: { dim: 32, icon: 16 },
    md: { dim: 40, icon: 18 },
    lg: { dim: 44, icon: 22 },
  };
  const { dim, icon: iconSize } = sizeMap[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active ? true : undefined}
      title={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={className}
      style={{
        width: dim,
        height: dim,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active
          ? 'color-mix(in srgb, var(--accent-default) 15%, transparent)'
          : hover ? 'var(--bg-raised)' : 'transparent',
        color: active ? 'var(--accent-default)' : 'var(--text-secondary)',
        border: 'none',
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 180ms cubic-bezier(0.2,0,0,1)',
      }}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
