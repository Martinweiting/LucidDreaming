interface HeroTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function HeroTitle({
  title,
  subtitle,
  className = '',
}: HeroTitleProps): JSX.Element {
  return (
    <div className={`select-none ${className}`}>
      <h1 className="font-serif text-display font-light leading-tight text-primary">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 font-ui text-small text-tertiary tracking-wide">
          {subtitle}
        </p>
      )}
    </div>
  );
}
