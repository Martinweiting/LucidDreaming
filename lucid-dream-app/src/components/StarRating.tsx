interface StarRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  maxStars?: number;
  label?: string;
}

export default function StarRating({
  value,
  onChange,
  maxStars = 5,
  label,
}: StarRatingProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-small text-text-secondary">{label}</label>}
      <div className="flex gap-1">
        {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="relative flex h-8 w-8 items-center justify-center transition-all duration-normal hover:scale-110 active:scale-95"
            aria-label={`${star} 星`}
          >
            <span
              className={`
                text-body
                ${value !== null && star <= value ? 'text-accent' : 'text-border-subtle'}
              `}
            >
              ★
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
