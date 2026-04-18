import { ReactNode, useState } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  collapsible?: boolean;
}

export default function Section({
  title,
  children,
  defaultExpanded = true,
  collapsible = true,
}: SectionProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="border border-border-subtle rounded-lg bg-bg-secondary overflow-hidden">
      <button
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
        disabled={!collapsible}
        className={`
          w-full px-4 py-3 flex items-center justify-between gap-2
          text-text-primary text-body font-medium
          ${collapsible ? 'cursor-pointer hover:bg-surface transition-colors duration-normal' : ''}
          ${!collapsible ? 'cursor-default' : ''}
        `}
      >
        <span>{title}</span>
        {collapsible && (
          <span
            className={`text-text-secondary transition-transform duration-normal ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        )}
      </button>
      {isExpanded && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </section>
  );
}
