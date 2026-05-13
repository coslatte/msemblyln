import { cn } from "../../lib/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "soft" | "glass";
};

const variants = {
  soft: "bg-white/90 border border-slate-200 shadow-sm",
  glass: "glass border border-white/60 shadow-glow"
};

export default function Card({ variant = "soft", className, ...rest }: CardProps) {
  return (
    <div className={cn("rounded-3xl p-6", variants[variant], className)} {...rest} />
  );
}
