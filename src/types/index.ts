export interface FileData {
  name: string;
  path: string;
  size: number;
  type: string;
}

export interface RenderOptions {
  imagePath: string;
  audioPath: string;
  outputPath?: string;
  width: number;
  height: number;
  fps: number;
  format: "mp4";
  crf?: number;
}

export interface RenderResult {
  outputPath: string;
  command: string;
  duration?: number;
}

export interface MediaProbe {
  duration: number;
  format: string;
  hasVideo: boolean;
  hasAudio: boolean;
}

export interface AppState {
  imageFile: File | null;
  audioFile: File | null;
  aspectRatio: "16:9" | "9:16" | "1:1";
  resolution: "720" | "1080" | "2160";
  outputPath: string;
  isProcessing: boolean;
  lastResult: RenderResult | null;
}