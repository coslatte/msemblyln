import Card from "../atoms/Card";

type OutputPanelProps = {
  outputPath: string | null;
  command: string | null;
};

export default function OutputPanel({
  outputPath,
  command,
}: OutputPanelProps) {
  return (
    <Card variant="soft" className="space-y-3 animate-slide-up">
      <p className="font-display text-lg font-semibold text-slate-200">
        Last render
      </p>
      <div className="space-y-2 text-sm text-slate-400">
        <p>
          Output:{" "}
          <span className="font-semibold text-tide-400">
            {outputPath || "-"}
          </span>
        </p>
        <p className="text-xs text-slate-600">FFmpeg command</p>
        <code className="block whitespace-pre-wrap rounded-2xl bg-black/50 p-3 text-xs text-slate-300">
          {command || "-"}
        </code>
      </div>
    </Card>
  );
}
