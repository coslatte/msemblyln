import { cn } from "../../lib/cn";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "ember" | "tide" | "slate";
};

const tones = {
  ember: "bg-ember-900/40 text-ember-400 hover:bg-ember-800/60 hover:text-ember-300",
  tide: "bg-tide-900/40 text-tide-400 hover:bg-tide-800/60 hover:text-tide-300",
  slate: "bg-slate-800/40 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300",
};

export default function IconButton({
  tone = "slate",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
