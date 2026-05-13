import { cn } from "../../lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base"
};

const variants = {
  primary:
    "bg-ember-600 text-white shadow-ember hover:brightness-110 active:brightness-95",
  ghost:
    "text-slate-700 hover:bg-slate-100/80 active:bg-slate-200/80",
  outline:
    "border border-slate-200 text-slate-700 hover:border-ember-300 hover:text-ember-600"
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
        "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold transition",
        sizes[size],
        variants[variant],
        disabled || loading ? "opacity-60 cursor-not-allowed" : "",
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : null}
      {children}
    </button>
  );
}
