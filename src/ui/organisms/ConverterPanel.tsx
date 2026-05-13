import { useMemo, useState } from "react";
import Card from "../atoms/Card";
import SectionTitle from "../atoms/SectionTitle";
import FileDrop from "../molecules/FileDrop";
import OptionGroup from "../molecules/OptionGroup";
import OutputField from "../molecules/OutputField";
import Button from "../atoms/Button";
import { aspectPresets, computeSize, sizePresets } from "../../lib/presets";
import { createVideo } from "../../lib/tauri";

type ConverterPanelProps = {
  onRendered: (outputPath: string, command: string) => void;
};

export default function ConverterPanel({ onRendered }: ConverterPanelProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [aspect, setAspect] = useState(aspectPresets[0].id);
  const [size, setSize] = useState(sizePresets[1].id);
  const [outputPath, setOutputPath] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAspect = aspectPresets.find((item) => item.id === aspect)!;
  const selectedSize = sizePresets.find((item) => item.id === size)!;
  const computed = useMemo(
    () => computeSize(selectedAspect, selectedSize),
    [selectedAspect, selectedSize]
  );

  const handleImage = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAudio = (file: File) => {
    setAudioFile(file);
  };

  const handleRender = async () => {
    if (!imageFile || !audioFile) {
      setError("Select both image and audio files.");
      return;
    }

    const imagePath = (imageFile as unknown as { path?: string }).path || imageFile.name;
    const audioPath = (audioFile as unknown as { path?: string }).path || audioFile.name;

    setBusy(true);
    setError(null);
    try {
      const result = await createVideo({
        image_path: imagePath,
        audio_path: audioPath,
        output_path: outputPath || undefined,
        width: computed.width,
        height: computed.height,
        fps: 30,
        format: "mp4",
        crf: 18
      });
      onRendered(result.output_path, result.command);
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="glass" className="space-y-6">
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
          hint="Leave empty to export next to the audio file."
        />
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Computed size</p>
          <p className="font-display text-lg font-semibold text-slate-700">
            {computed.width} x {computed.height}
          </p>
        </div>
      </div>

      {error ? <p className="text-sm text-ember-600">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          Duration matches audio. MP4 (H.264 + AAC).
        </div>
        <Button size="lg" onClick={handleRender} loading={busy}>
          Render MP4
        </Button>
      </div>
    </Card>
  );
}
