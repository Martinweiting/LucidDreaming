interface SectionLabelProps {
  children: React.ReactNode;
  accent?: boolean;
  as?: 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
}

export default function SectionLabel({
  children,
  accent = false,
  as: Tag = 'h2',
  className = '',
}: SectionLabelProps): JSX.Element {
  return (
    <Tag
      className={`text-caption font-ui uppercase tracking-widest ${
        accent ? 'text-accent' : 'text-tertiary'
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
