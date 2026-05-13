import { cn } from "../../lib/cn";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "ember" | "tide" | "slate";
};

const tones = {
  ember: "bg-ember-100 text-ember-600 hover:bg-ember-200",
  tide: "bg-tide-100 text-tide-700 hover:bg-tide-200",
  slate: "bg-slate-100 text-slate-600 hover:bg-slate-200"
};

export default function IconButton({ tone = "slate", className, ...rest }: IconButtonProps) {
  return (
    <button
      className={cn(
        "h-9 w-9 rounded-full transition flex items-center justify-center",
        tones[tone],
        className
      )}
      {...rest}
    />
  );
}
