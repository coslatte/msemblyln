import { cn } from "../../lib/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "soft" | "glass";
};

const variants = {
  soft:
    "bg-white/[0.04] border border-slate-700/40 shadow-card hover:shadow-card-hover hover:border-slate-600/50",
  glass:
    "glass shadow-card hover:shadow-card-hover hover:border-slate-500/20",
};

export default function Card({
  variant = "soft",
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl p-6 transition-all duration-300",
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
}
