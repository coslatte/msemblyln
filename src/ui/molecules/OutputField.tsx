import { cn } from "../../lib/cn";

type OutputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export default function OutputField({ label, hint, className, ...rest }: OutputFieldProps) {
  return (
    <label className="space-y-1">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <input
        className={cn(
          "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700",
          "focus:border-ember-400 focus:outline-none",
          className
        )}
        {...rest}
      />
      {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}
