export interface OptionCard<T extends string> {
  value: T;
  label: string;
  description: string;
}

interface OptionCardsProps<T extends string> {
  options: OptionCard<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Selector de una sola opción entre pocas, cada una con nombre + descripción corta. */
export function OptionCards<T extends string>({ options, value, onChange }: OptionCardsProps<T>) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex flex-col items-center rounded-xl border px-3 py-4 text-center transition-colors ${
            value === option.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border-soft hover:border-foreground/40'
          }`}
        >
          <span className="text-sm font-semibold">{option.label}</span>
          <span className={`mt-1 text-xs leading-tight ${value === option.value ? 'text-primary-foreground/80' : 'text-muted'}`}>
            {option.description}
          </span>
        </button>
      ))}
    </div>
  );
}
