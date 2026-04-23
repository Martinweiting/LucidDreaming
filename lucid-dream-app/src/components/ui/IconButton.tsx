import Icon, { IconName } from './Icon';

type IconButtonVariant = 'ghost' | 'subtle' | 'solid';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  icon: IconName;
  label: string;
  onClick?: () => void;
  variant?: IconButtonVariant;
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
  variant = 'ghost',
  size = 'md',
  active = false,
  disabled = false,
  className = '',
  type = 'button',
}: IconButtonProps): JSX.Element {
  const sizeMap: Record<IconButtonSize, { box: string; icon: number }> = {
    sm: { box: 'h-8 w-8', icon: 16 },
    md: { box: 'h-10 w-10', icon: 20 },
    lg: { box: 'h-11 w-11', icon: 22 },
  };

  const { box, icon: iconSize } = sizeMap[size];

  const variantClass: Record<IconButtonVariant, string> = {
    ghost: active
      ? 'text-accent bg-accent-subtle'
      : 'text-secondary hover:text-primary hover:bg-inset active:bg-inset',
    subtle: active
      ? 'text-accent bg-accent-muted'
      : 'text-secondary bg-inset hover:text-primary hover:bg-raised active:bg-raised',
    solid: active
      ? 'text-bg-base bg-accent-default'
      : 'text-secondary bg-raised border border-border-subtle hover:text-primary hover:bg-surface active:bg-surface',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active ? true : undefined}
      className={`inline-flex items-center justify-center rounded-md transition-colors duration-fast ${box} ${variantClass[variant]} ${disabled ? 'pointer-events-none opacity-40' : ''} ${className}`}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
