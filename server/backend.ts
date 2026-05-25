import { spawn, execSync } from "child_process";
import { writeFile, mkdtemp, unlink, rmdir } from "fs/promises";
import { tmpdir } from "os";
import { join, dirname, sep } from "path";
import { existsSync, mkdirSync } from "fs";

function ffmpegBin(): string {
  return process.env.MSEMBLYLN_FFMPEG || "ffmpeg";
}

function ffprobeBin(): string {
  return process.env.MSEMBLYLN_FFPROBE || "ffprobe";
}

function extFromMime(dataUri: string): string {
  const mime = dataUri.split(";")[0].split(":")[1];
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/aac": ".aac",
    "audio/ogg": ".ogg",
    "audio/flac": ".flac",
    "audio/mp4": ".m4a",
  };
  return map[mime] || ".bin";
}

export type ProgressInfo = {
  frame: number;
  fps: number;
  time_sec: number;
  speed: string;
  percent?: number;
};

export type RenderParams = {
  image_path?: string;
  audio_path?: string;
  image_data?: string;
  audio_data?: string;
  width: number;
  height: number;
  fps: number;
  format: string;
  crf?: number;
  output_path?: string;
  duration_sec?: number;
  on_progress?: (info: ProgressInfo) => void;
};

export type RenderResult = {
  output_path: string;
  command: string;
};

export async function renderVideo(
  params: RenderParams,
): Promise<RenderResult> {
  let imagePath = params.image_path;
  let audioPath = params.audio_path;
  let tempDir: string | null = null;
  const cleanup: string[] = [];

  try {
    if (params.image_data && !imagePath) {
      tempDir = await mkdtemp(join(tmpdir(), "msemblyln-"));
      const buf = Buffer.from(params.image_data.split(",")[1], "base64");
      imagePath = join(tempDir, "image" + extFromMime(params.image_data));
      await writeFile(imagePath, buf);
      cleanup.push(imagePath);
    }

    if (params.audio_data && !audioPath) {
      if (!tempDir) tempDir = await mkdtemp(join(tmpdir(), "msemblyln-"));
      const buf = Buffer.from(params.audio_data.split(",")[1], "base64");
      audioPath = join(tempDir, "audio" + extFromMime(params.audio_data));
      await writeFile(audioPath, buf);
      cleanup.push(audioPath);
    }

    if (!imagePath || !audioPath) {
      throw new Error("Image and audio paths or data required");
    }

    let outputFilename: string;
    if (params.output_path) {
      const hasFilename = /[\/\\][^\/\\]+\.\w+$/.test(params.output_path);
      if (hasFilename) {
        outputFilename = params.output_path;
      } else {
        const stem =
          audioPath
            .replace(/\.[^/.]+$/, "")
            .split(/[/\\]/)
            .pop() || "output";
        outputFilename = join(params.output_path, `${stem}.${params.format || "mp4"}`);
      }
    } else {
      const stem =
        audioPath
          .replace(/\.[^/.]+$/, "")
          .split(/[/\\]/)
          .pop() || "output";
      const outDir = join(process.cwd(), "output");
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      outputFilename = join(outDir, `${stem}.${params.format || "mp4"}`);
    }

    const outDir = dirname(outputFilename);
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }

    const crf = params.crf ?? 18;
    const size = `${params.width}:${params.height}`;
    const vf = `scale=${size}:force_original_aspect_ratio=decrease,pad=${size}:(ow-iw)/2:(oh-ih)/2,format=yuv420p`;

    const args = [
      "-y",
      "-loop",
      "1",
      "-i",
      imagePath,
      "-i",
      audioPath,
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      String(crf),
      "-tune",
      "stillimage",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      "-pix_fmt",
      "yuv420p",
      "-r",
      String(params.fps),
      "-vf",
      vf,
      "-movflags",
      "+faststart",
      outputFilename,
    ];

    const cmd = `${ffmpegBin()} ${args.join(" ")}`;

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(ffmpegBin(), args, { stdio: "pipe" });
      let stderr = "";
      proc.stderr?.on("data", (d: Buffer) => {
        const chunk = d.toString();
        stderr += chunk;

        if (params.on_progress) {
          const timeMatch = chunk.match(/time=(\d+):(\d+):(\d+\.\d+)/);
          const frameMatch = chunk.match(/frame=\s*(\d+)/);
          const fpsMatch = chunk.match(/fps=\s*([\d.]+)/);
          const speedMatch = chunk.match(/speed=\s*([\d.]+)x/);

          if (timeMatch) {
            const [_, h, m, s] = timeMatch;
            const timeSec = parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
            const info: ProgressInfo = {
              frame: frameMatch ? parseInt(frameMatch[1]) : 0,
              fps: fpsMatch ? parseFloat(fpsMatch[1]) : 0,
              time_sec: timeSec,
              speed: speedMatch ? speedMatch[1] : "0",
            };
            if (params.duration_sec && params.duration_sec > 0) {
              info.percent = Math.min(100, Math.round((timeSec / params.duration_sec) * 100));
            }
            params.on_progress(info);
          }
        }
      });
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(stderr.slice(-500)));
      });
      proc.on("error", (err) => reject(err));
    });

    return { output_path: outputFilename, command: cmd };
  } finally {
    for (const f of cleanup) {
      try {
        await unlink(f);
      } catch {
        /* ignore */
      }
    }
    if (tempDir) {
      try {
        await rmdir(tempDir);
      } catch {
        /* ignore */
      }
    }
  }
}

export function probeMedia(path: string): {
  duration_seconds: number | null;
  format_name: string | null;
} {
  const raw = execSync(
    `${ffprobeBin()} -v error -print_format json -show_format -show_streams "${path}"`,
    { encoding: "utf-8", timeout: 15000 },
  );
  const parsed = JSON.parse(raw);
  const duration = parsed.format?.duration
    ? parseFloat(parsed.format.duration)
    : null;
  return {
    duration_seconds: duration,
    format_name: parsed.format?.format_name ?? null,
  };
}

export function pickDirectory(): string | null {
  const platform = process.platform;
  try {
    if (platform === "win32") {
      const script =
        'Add-Type -AssemblyName System.Windows.Forms; ' +
        '$f = New-Object System.Windows.Forms.FolderBrowserDialog; ' +
        "$f.Description = 'Select output directory'; " +
        '$r = $f.ShowDialog(); ' +
        "if ($r -eq [System.Windows.Forms.DialogResult]::OK) { " +
        'Write-Output $f.SelectedPath ' +
        "}";
      const out = execSync(
        `powershell -NoLogo -NoProfile -Command "${script}"`,
        { encoding: "utf-8", timeout: 30000 },
      );
      const trimmed = out.trim();
      return trimmed || null;
    }
    if (platform === "darwin") {
      const out = execSync(
        `osascript -e 'POSIX path of (choose folder)'`,
        { encoding: "utf-8", timeout: 30000 },
      );
      return out.trim() || null;
    }
    // Linux
    const out = execSync(
      `zenity --file-selection --directory 2>/dev/null || kdialog --getexistingdirectory 2>/dev/null`,
      { encoding: "utf-8", timeout: 30000 },
    );
    return out.trim() || null;
  } catch {
    return null;
  }
}
