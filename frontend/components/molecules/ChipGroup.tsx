export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  options: ChipOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  allowClear?: boolean;
}

export function ChipGroup<T extends string>({ options, value, onChange, allowClear }: ChipGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(allowClear && value === option.value ? null : option.value)}
          className={`min-h-9 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all active:scale-[0.96] ${
            value === option.value
              ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25'
              : 'border-border-soft text-foreground hover:border-foreground/40 hover:bg-surface/60'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
