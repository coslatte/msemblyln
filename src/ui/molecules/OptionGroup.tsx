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
  onChange,
}: OptionGroupProps<T>) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-400">{title}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition-all duration-200",
              value === option.id
                ? "border-ember-500/60 bg-ember-500/10 text-slate-100 shadow-ember-sm"
                : "border-slate-700/50 bg-white/[0.03] text-slate-400 hover:border-tide-500/40 hover:bg-tide-500/5 hover:text-slate-300",
            )}
          >
            <p className="font-display text-sm font-semibold">{option.label}</p>
            <p className="mt-0.5 text-xs text-inherit opacity-60">
              {option.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
