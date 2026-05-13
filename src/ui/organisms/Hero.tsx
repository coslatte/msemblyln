import Button from "../atoms/Button";

type HeroProps = {
  onPrimary: () => void;
};

export default function Hero({ onPrimary }: HeroProps) {
  return (
    <div className="space-y-4">
      <p className="grad-text font-display text-4xl font-semibold">
        Build videos from a single image and audio.
      </p>
      <p className="text-sm text-slate-600 max-w-xl">
        msemblyln creates MP4 exports optimized for YouTube, Shorts, and square feeds.
        Drop your cover art and audio, pick a layout, and ship a ready-to-upload video.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={onPrimary}>Create video</Button>
        <Button variant="outline">Presets: 16:9 / 9:16 / 1:1</Button>
      </div>
    </div>
  );
}
