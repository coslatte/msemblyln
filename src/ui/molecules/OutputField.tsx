import { cn } from "../../lib/cn";

type OutputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  onBrowse?: () => void;
};

export default function OutputField({
  label,
  hint,
  className,
  onBrowse,
  ...rest
}: OutputFieldProps) {
  return (
    <label className="space-y-1">
      <span className="text-sm font-semibold text-slate-400">{label}</span>
      <div className="flex gap-2">
        <input
          className={cn(
            "min-w-0 flex-1 rounded-2xl border border-slate-700/50 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 transition-all duration-200",
            "focus:border-ember-500/50 focus:bg-ember-500/5 focus:shadow-ember-sm focus:outline-none",
            className,
          )}
          {...rest}
        />
        {onBrowse ? (
          <button
            type="button"
            onClick={onBrowse}
            className="flex items-center gap-2 rounded-2xl border border-slate-700/50 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:border-tide-500/40 hover:bg-tide-500/5 hover:text-tide-400"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            Browse
          </button>
        ) : null}
      </div>
      {hint ? (
        <span className="text-xs text-slate-600">{hint}</span>
      ) : null}
    </label>
  );
}
