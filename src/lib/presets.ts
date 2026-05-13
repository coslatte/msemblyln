export type AspectPreset = {
  id: "16:9" | "9:16" | "1:1";
  label: string;
  description: string;
  ratio: [number, number];
};

export type SizePreset = {
  id: "720" | "1080" | "2160";
  label: string;
  description: string;
  longEdge: number;
};

export const aspectPresets: AspectPreset[] = [
  {
    id: "16:9",
    label: "16:9 Landscape",
    description: "YouTube, desktop",
    ratio: [16, 9]
  },
  {
    id: "9:16",
    label: "9:16 Vertical",
    description: "Shorts, Reels",
    ratio: [9, 16]
  },
  {
    id: "1:1",
    label: "1:1 Square",
    description: "Feeds, cover art",
    ratio: [1, 1]
  }
];

export const sizePresets: SizePreset[] = [
  {
    id: "720",
    label: "720p",
    description: "Fast export",
    longEdge: 1280
  },
  {
    id: "1080",
    label: "1080p",
    description: "Balanced",
    longEdge: 1920
  },
  {
    id: "2160",
    label: "4K",
    description: "Max quality",
    longEdge: 3840
  }
];

export function computeSize(aspect: AspectPreset, size: SizePreset) {
  const [w, h] = aspect.ratio;
  if (w >= h) {
    const height = Math.round((size.longEdge * h) / w);
    return { width: size.longEdge, height };
  }

  const width = Math.round((size.longEdge * w) / h);
  return { width, height: size.longEdge };
}
