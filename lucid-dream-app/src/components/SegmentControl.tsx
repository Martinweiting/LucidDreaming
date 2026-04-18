/**
 * 段落式選擇控制元件
 * 用於提醒次數選擇：3 / 5 / 7 / 9
 */

interface SegmentOption<T extends string | number> {
  label: string
  value: T
}

interface SegmentControlProps<T extends string | number> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  label?: string
}

export default function SegmentControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: SegmentControlProps<T>): JSX.Element {
  return (
    <div>
      {label && <label className="block text-body font-medium text-text-primary mb-2">{label}</label>}
      <div className="flex gap-1 bg-bg-secondary rounded-lg p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              flex-1 py-2 px-3 rounded-md text-small font-medium
              transition-all duration-normal
              ${
                value === opt.value
                  ? 'bg-accent text-bg-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
