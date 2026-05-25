export type ProgressInfo = {
  frame: number;
  fps: number;
  time_sec: number;
  speed: string;
  percent?: number;
};

export type RenderRequest = {
  image_path: string;
  audio_path: string;
  image_data?: string;
  audio_data?: string;
  width: number;
  height: number;
  fps: number;
  format: "mp4";
  crf?: number;
  output_path?: string;
};

export type RenderResponse = {
  output_path: string;
  command: string;
};

export type ProbeResponse = {
  duration_seconds?: number;
  format_name?: string;
};

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export async function createVideo(
  request: RenderRequest,
): Promise<RenderResponse> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<RenderResponse>("create_video", { request });
  }
  const resp = await fetch("/api/create-video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(err.error || "Render failed");
  }
  return resp.json();
}

export async function createVideoWithProgress(
  request: RenderRequest,
  onProgress: (info: ProgressInfo) => void,
): Promise<RenderResponse> {
  const resp = await fetch("/api/render-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(err.error || "Render failed");
  }

  const reader = resp.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const data = JSON.parse(line);
      if (data.type === "progress") {
        onProgress(data as ProgressInfo);
      } else if (data.type === "done") {
        return { output_path: data.output_path, command: data.command };
      } else if (data.type === "error") {
        throw new Error(data.error);
      }
    }
  }
  throw new Error("Stream ended unexpectedly");
}

export async function probeMedia(
  path: string,
  _content?: string,
): Promise<ProbeResponse> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<ProbeResponse>("probe_media", { path });
  }
  const resp = await fetch("/api/probe-media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  if (!resp.ok) throw new Error("Probe failed");
  return resp.json();
}

export async function pickDirectory(): Promise<string | null> {
  if (isTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const result = await open({ directory: true, multiple: false });
    return result as string | null;
  }
  const resp = await fetch("/api/pick-directory", { method: "POST" });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data.path;
}
