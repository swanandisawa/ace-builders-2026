
'use client';

const DEFAULT_HORIZONS = [30, 60, 90];

interface HorizonSelectorProps {
  horizons?: number[];
  value?: number;
  onChange?: (days: number) => void;
  disabled?: boolean;
}

export default function HorizonSelector({
  horizons,
  value = 30,
  onChange,
  disabled = false,
}: HorizonSelectorProps) {
  const safeHorizons =
    Array.isArray(horizons) && horizons.length > 0 ? horizons : DEFAULT_HORIZONS;

  const handleSelect = (days: number) => {
    if (disabled || days === value) return;
    if (onChange) onChange(days);
  };

  return (
    <div
      role="group"
      aria-label="Forecast horizon"
      className="flex w-full max-w-md flex-wrap gap-1 rounded-[var(--radius)] border border-border bg-muted p-1"
    >
      {safeHorizons.map((days) => {
        const isSelected = days === value;
        return (
          <button data-nexen-component="nx_components_HorizonSelector"
            key={days}
            type="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => handleSelect(days)}
            className={[
              'min-w-0 flex-1 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-transparent text-muted-foreground hover:bg-card hover:text-foreground',
            ].join(' ')}
           data-nexen-id="nx-84f83f87-0">
            {`${days} days`}
          </button>
        );
      })}
    </div>
  );
}
