import { useMemo, useRef, useState } from "react";
import Card from "../atoms/Card";
import SectionTitle from "../atoms/SectionTitle";
import FileDrop from "../molecules/FileDrop";
import OptionGroup from "../molecules/OptionGroup";
import OutputField from "../molecules/OutputField";
import Button from "../atoms/Button";
import { aspectPresets, computeSize, sizePresets } from "../../lib/presets";
import { createVideo, createVideoWithProgress, pickDirectory } from "../../lib/api";
import type { ProgressInfo } from "../../lib/api";

type ConverterPanelProps = {
  onRendered: (outputPath: string, command: string) => void;
};

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function ConverterPanel({
  onRendered,
}: ConverterPanelProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [aspect, setAspect] = useState(aspectPresets[0].id);
  const [size, setSize] = useState(sizePresets[1].id);
  const [outputPath, setOutputPath] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);

  const selectedAspect = aspectPresets.find((item) => item.id === aspect)!;
  const selectedSize = sizePresets.find((item) => item.id === size)!;
  const computed = useMemo(
    () => computeSize(selectedAspect, selectedSize),
    [selectedAspect, selectedSize],
  );

  const handleImage = async (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    const data = await readAsDataURL(file);
    setImageData(data);
  };

  const handleAudio = async (file: File) => {
    setAudioFile(file);
    const data = await readAsDataURL(file);
    setAudioData(data);
  };

  const handleBrowse = async () => {
    const dir = await pickDirectory();
    if (dir) setOutputPath(dir);
  };

  const handleRender = async () => {
    if (!imageFile || !audioFile) {
      setError("Select both image and audio files.");
      return;
    }

    const isTauri = "__TAURI__" in window;
    const tauriPath = (f: File) =>
      (f as unknown as { path?: string }).path;

    const imagePath = isTauri ? tauriPath(imageFile) || undefined : undefined;
    const audioPath = isTauri ? tauriPath(audioFile) || undefined : undefined;

    setBusy(true);
    setError(null);
    setProgress(null);
    const req = {
      image_path: imagePath,
      audio_path: audioPath,
      image_data: isTauri ? undefined : imageData || undefined,
      audio_data: isTauri ? undefined : audioData || undefined,
      output_path: outputPath || undefined,
      width: computed.width,
      height: computed.height,
      fps: 30,
      format: "mp4" as const,
      crf: 18,
    };
    try {
      const result = isTauri
        ? await createVideo(req)
        : await createVideoWithProgress(req, (info) => setProgress(info));
      onRendered(result.output_path, result.command);
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <Card variant="glass" className="animate-fade-in space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <FileDrop
          label="Cover image"
          description="PNG, JPG, or any cover art"
          accept="image/*"
          file={imageFile}
          previewUrl={imagePreview}
          onFile={handleImage}
        />
        <FileDrop
          label="Audio track"
          description="MP3, WAV, or AAC"
          accept="audio/*"
          file={audioFile}
          onFile={handleAudio}
        />
      </div>

      <div className="grid gap-6">
        <SectionTitle
          title="Format presets"
          subtitle="Built for YouTube and vertical platforms"
        />
        <OptionGroup
          title="Aspect ratio"
          options={aspectPresets}
          value={aspect}
          onChange={setAspect}
        />
        <OptionGroup
          title="Resolution"
          options={sizePresets}
          value={size}
          onChange={setSize}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OutputField
          label="Output path (optional)"
          placeholder="C:\\videos\\output.mp4"
          value={outputPath}
          onChange={(event) => setOutputPath(event.target.value)}
          hint="Leave empty to export to ./output/"
          onBrowse={handleBrowse}
        />
        <div className="rounded-2xl border border-slate-700/40 bg-white/[0.03] px-4 py-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Computed size
          </p>
          <p className="font-display text-lg font-semibold text-tide-400">
            {computed.width} x {computed.height}
          </p>
        </div>
      </div>

      {error ? <p className="text-sm text-ember-400">{error}</p> : null}

      {progress ? (
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-ember-500 to-tide-400 transition-all duration-300"
                style={{ width: `${progress.percent ?? 0}%` }}
              />
            </div>
            <span className="min-w-[3ch] text-right font-mono text-xs text-slate-400">
              {progress.percent ?? 0}%
            </span>
          </div>
          <div className="flex justify-between font-mono text-[11px] text-slate-500">
            <span>
              {String(Math.floor(progress.time_sec / 60)).padStart(2, "0")}:
              {String(Math.floor(progress.time_sec % 60)).padStart(2, "0")}
            </span>
            <span>{progress.fps} fps</span>
            <span>{progress.speed}x</span>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          Duration matches audio. MP4 (H.264 + AAC).
        </div>
        <Button size="lg" onClick={handleRender} loading={busy}>
          {busy ? "Rendering…" : "Render MP4"}
        </Button>
      </div>
    </Card>
  );
}
