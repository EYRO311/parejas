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
          className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
            value === option.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border-soft text-foreground hover:border-foreground/40'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
