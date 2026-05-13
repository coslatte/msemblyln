import { cn } from "../../lib/cn";

type SectionTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  subtitle?: string;
};

export default function SectionTitle({ title, subtitle, className }: SectionTitleProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="font-display text-lg font-semibold text-slate-800">{title}</p>
      {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
