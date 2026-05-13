import { cn } from "../../lib/cn";

type Option<T extends string> = {
  id: T;
  label: string;
  description: string;
};

type OptionGroupProps<T extends string> = {
  title: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function OptionGroup<T extends string>({
  title,
  options,
  value,
  onChange
}: OptionGroupProps<T>) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition",
              value === option.id
                ? "border-ember-400 bg-ember-50/60 shadow-ember"
                : "border-slate-200 bg-white hover:border-tide-200"
            )}
          >
            <p className="font-display text-sm font-semibold text-slate-800">
              {option.label}
            </p>
            <p className="text-xs text-slate-500">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
