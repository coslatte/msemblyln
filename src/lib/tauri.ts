import { invoke } from "@tauri-apps/api/core";

export type RenderRequest = {
  image_path: string;
  audio_path: string;
  output_path?: string;
  width: number;
  height: number;
  fps: number;
  format: "mp4";
  crf?: number;
};

export type RenderResponse = {
  output_path: string;
  command: string;
};

export type ProbeResponse = {
  duration_seconds?: number;
  format_name?: string;
};

export async function createVideo(payload: RenderRequest) {
  return invoke<RenderResponse>("create_video", { request: payload });
}

export async function probeMedia(path: string) {
  return invoke<ProbeResponse>("probe_media", { path });
}
