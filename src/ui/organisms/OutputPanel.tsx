import Card from "../atoms/Card";

type OutputPanelProps = {
  outputPath: string | null;
  command: string | null;
};

export default function OutputPanel({ outputPath, command }: OutputPanelProps) {
  return (
    <Card variant="soft" className="space-y-3">
      <p className="font-display text-lg font-semibold text-slate-800">Last render</p>
      <div className="space-y-2 text-sm text-slate-600">
        <p>
          Output: <span className="font-semibold text-slate-700">{outputPath || "-"}</span>
        </p>
        <p className="text-xs text-slate-400">FFmpeg command</p>
        <code className="block whitespace-pre-wrap rounded-2xl bg-slate-950/95 p-3 text-xs text-slate-100">
          {command || "-"}
        </code>
      </div>
    </Card>
  );
}
