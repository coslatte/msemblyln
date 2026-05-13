import { useCallback, useState } from "react";
import Card from "../atoms/Card";
import { cn } from "../../lib/cn";

type FileDropProps = {
  label: string;
  description: string;
  accept: string;
  onFile: (file: File) => void;
  file?: File | null;
  previewUrl?: string | null;
};

export default function FileDrop({
  label,
  description,
  accept,
  onFile,
  file,
  previewUrl
}: FileDropProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const dropped = event.dataTransfer.files?.[0];
      if (dropped) {
        onFile(dropped);
      }
    },
    [onFile]
  );

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    if (picked) {
      onFile(picked);
    }
  };

  return (
    <Card
      variant="soft"
      className={cn(
        "relative border-dashed border-2 transition",
        isDragging ? "border-tide-400 bg-tide-50/70" : "border-slate-200"
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={handlePick}
      />
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-base font-semibold text-slate-800">{label}</p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
          <span className="rounded-full bg-ember-100 px-3 py-1 text-xs font-semibold text-ember-600">
            Drop or click
          </span>
        </div>
        {file ? (
          <div className="flex items-center gap-3">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="preview"
                className="h-12 w-12 rounded-2xl object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-2xl bg-slate-100" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-700">{file.name}</p>
              <p className="text-xs text-slate-400">{Math.round(file.size / 1024)} KB</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No file selected.</p>
        )}
      </div>
    </Card>
  );
}
