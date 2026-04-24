import React from 'react';

interface HeroTitleProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}

export default function HeroTitle({
  eyebrow,
  title,
  subtitle,
  className = '',
}: HeroTitleProps): JSX.Element {
  return (
    <div className={className} style={{ marginBottom: 48 }}>
      {eyebrow !== undefined && (
        <p style={{
          fontFamily: 'var(--font-ui, system-ui)',
          fontSize: 11.5,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--accent-default)',
          margin: 0,
          marginBottom: 14,
        }}>
          {eyebrow}
        </p>
      )}
      <h1 style={{
        fontFamily: 'var(--font-serif, serif)',
        fontSize: 'clamp(28px, 4vw, 44px)',
        fontWeight: 300,
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
        color: 'var(--text-primary)',
        margin: 0,
        marginBottom: subtitle !== undefined ? 14 : 0,
      }}>
        {title}
      </h1>
      {subtitle !== undefined && (
        <p style={{
          fontFamily: 'var(--font-serif, serif)',
          fontSize: 15.5,
          lineHeight: 1.7,
          color: 'var(--text-secondary)',
          margin: 0,
          maxWidth: '46ch',
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
