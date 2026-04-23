import { ReactNode, useState } from 'react';
import Icon from './ui/Icon';

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
    <section className="border-t border-border-subtle">
      <button
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
        disabled={!collapsible}
        type="button"
        className={`w-full flex items-center justify-between py-4 text-left outline-none focus-visible:ring-1 focus-visible:ring-border-focus ${
          collapsible
            ? 'cursor-pointer transition-colors duration-fast hover:text-secondary'
            : 'cursor-default'
        }`}
      >
        <span className="font-ui text-caption tracking-ultra text-tertiary uppercase">
          {title}
        </span>
        {collapsible && (
          <Icon
            name="arrowRight"
            size={14}
            strokeWidth={1.25}
            className={`text-disabled transition-transform duration-normal flex-shrink-0 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        )}
      </button>

      {isExpanded && (
        <div className="pb-6 space-y-4">
          {children}
        </div>
      )}
    </section>
  );
}
