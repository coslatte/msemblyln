import { cn } from "../../lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

const variants = {
  primary:
    "bg-ember-600 text-white shadow-ember-sm hover:shadow-ember active:brightness-110 animate-glow-pulse",
  ghost: "text-slate-400 hover:text-slate-100 hover:bg-white/5",
  outline:
    "border border-slate-600 text-slate-300 hover:border-ember-500 hover:text-ember-400 hover:shadow-ember-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold transition-all duration-300",
        sizes[size],
        variants[variant],
        disabled || loading ? "pointer-events-none opacity-50" : "",
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      ) : null}
      {children}
    </button>
  );
}
