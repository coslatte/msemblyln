import Button from "../atoms/Button";

type HeroProps = {
  onPrimary: () => void;
};

export default function Hero({ onPrimary }: HeroProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <p className="grad-text font-display text-4xl font-semibold leading-tight">
        Build videos from a single image and audio.
      </p>
      <p className="max-w-xl text-base text-slate-400">
        msemblyln creates MP4 exports optimized for YouTube, Shorts, and square
        feeds. Drop your cover art and audio, pick a layout, and ship a
        ready-to-upload video.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={onPrimary}>Create video</Button>
        <Button variant="outline">Presets: 16:9 / 9:16 / 1:1</Button>
      </div>
    </div>
  );
}
