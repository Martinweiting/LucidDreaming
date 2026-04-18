interface MoodControlProps {
  value: number | null;
  onChange: (value: number) => void;
}

const moods = [
  { value: -2, label: '──' },
  { value: -1, label: '─' },
  { value: 0, label: '0' },
  { value: 1, label: '+' },
  { value: 2, label: '++' },
];

export default function MoodControl({ value, onChange }: MoodControlProps): JSX.Element {
  return (
    <div className="flex gap-2">
      {moods.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onChange(mood.value)}
          className={`
            relative flex h-10 min-w-10 flex-col items-center justify-center rounded-md
            text-small font-medium transition-all duration-normal
            active:scale-95
            ${
              value === mood.value
                ? 'bg-accent text-bg-primary'
                : 'border border-border-subtle bg-bg-secondary text-text-secondary hover:border-border-default hover:text-text-primary'
            }
          `}
        >
          {mood.label}
        </button>
      ))}
    </div>
  );
}
