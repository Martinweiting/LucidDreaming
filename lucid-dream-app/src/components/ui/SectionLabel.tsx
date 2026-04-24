import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  right?: React.ReactNode;
  as?: 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
}

export default function SectionLabel({
  children,
  right,
  as: Tag = 'h2',
  className = '',
}: SectionLabelProps): JSX.Element {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 18,
        paddingBottom: 10,
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <Tag
        style={{
          fontFamily: 'var(--font-ui, system-ui)',
          fontSize: 11.5,
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
          margin: 0,
        }}
      >
        {children}
      </Tag>
      {right !== undefined && <div>{right}</div>}
    </div>
  );
}
