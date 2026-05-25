import { createInterface } from "readline/promises";
import { renderVideo, probeMedia } from "./backend";
import { aspectPresets, sizePresets, computeSize } from "../src/lib/presets";

const rl = createInterface({ input: process.stdin, output: process.stdout });

function cyan(s: string) {
  return `\x1b[36m${s}\x1b[0m`;
}
function green(s: string) {
  return `\x1b[32m${s}\x1b[0m`;
}
function yellow(s: string) {
  return `\x1b[33m${s}\x1b[0m`;
}
function dim(s: string) {
  return `\x1b[2m${s}\x1b[0m`;
}
function bold(s: string) {
  return `\x1b[1m${s}\x1b[0m`;
}

async function ask(question: string, fallback?: string): Promise<string> {
  const hint = fallback ? ` (${dim(fallback)})` : "";
  const answer = await rl.question(`${cyan("?")} ${question}${hint}: `);
  return answer.trim() || fallback || "";
}

async function select<T>(
  label: string,
  options: { id: T; label: string }[],
  defaultIndex: number,
): Promise<T> {
  console.log(`\n  ${bold(label)}`);
  for (let i = 0; i < options.length; i++) {
    const marker = i === defaultIndex ? green("❯") : " ";
    console.log(`  ${marker} ${i + 1}) ${options[i].label}`);
  }
  const answer = await rl.question(`  ${cyan("?")} Choose (1-${options.length}${dim("")}): `);
  const idx = parseInt(answer, 10);
  if (idx >= 1 && idx <= options.length) return options[idx - 1].id;
  return options[defaultIndex].id;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

async function main() {
  console.clear();
  console.log(`${bold("msemblyln")}  ${dim("audio + image → MP4 wizard")}\n`);
  console.log(`${dim("─".repeat(48))}\n`);

  const imagePath = await ask("Cover image path");
  const audioPath = await ask("Audio file path");

  const aspectId = await select("Aspect ratio", aspectPresets, 1);
  const sizeId = await select("Resolution", sizePresets, 1);

  const aspect = aspectPresets.find((a) => a.id === aspectId)!;
  const size = sizePresets.find((s) => s.id === sizeId)!;
  const { width, height } = computeSize(aspect, size);

  const outputPath = await ask("Output path", "");

  console.log(`\n${dim("─".repeat(48))}`);
  console.log(`  ${bold("Summary")}`);
  console.log(`  Image:   ${cyan(imagePath)}`);
  console.log(`  Audio:   ${cyan(audioPath)}`);
  console.log(`  Output:  ${cyan(`${width}×${height} (${aspect.label}, ${size.label})`)}`);
  console.log(`  Save:    ${cyan(outputPath || "(next to audio)")}`);
  console.log(`${dim("─".repeat(48))}\n`);

  const confirm = await rl.question(`${yellow("?")} Start render? ${dim("(Y/n)")}: `);
  if (confirm.toLowerCase() === "n") {
    console.log(dim("Cancelled."));
    rl.close();
    return;
  }

  let durationSec = 0;
  try {
    const info = probeMedia(audioPath);
    if (info.duration_seconds) durationSec = info.duration_seconds;
  } catch {
    /* ignore */
  }

  console.log(`\n${cyan("▶")} Rendering...\n`);

  let lastTime = 0;
  try {
    const result = await renderVideo({
      image_path: imagePath,
      audio_path: audioPath,
      width,
      height,
      fps: 30,
      format: "mp4",
      crf: 18,
      output_path: outputPath || undefined,
      duration_sec: durationSec || undefined,
      on_progress(info) {
        if (info.time_sec - lastTime < 0.3) return;
        lastTime = info.time_sec;

        const barWidth = 30;
        const pct = info.percent ?? 0;
        const filled = Math.round((pct / 100) * barWidth);
        const bar =
          green("█".repeat(filled)) + dim("░".repeat(barWidth - filled));

        const timeStr = formatTime(info.time_sec);
        const totalStr = durationSec ? formatTime(durationSec) : "--:--";
        const line = `  ${bar} ${String(pct).padStart(3)}% ${timeStr}/${totalStr} ${dim(`${info.speed}x`)}`;
        process.stdout.write(`\r${line}${" ".repeat(10)}`);
      },
    });

    process.stdout.write(`\r${" ".repeat(70)}\r`);
    console.log(` ${green("✔")} Done!`);
    console.log(`   Output: ${green(result.output_path)}\n`);
    console.log(` ${dim("FFmpeg command:")}`);
    console.log(`   ${dim(result.command)}\n`);
  } catch (err) {
    process.stdout.write(`\r${" ".repeat(70)}\r`);
    console.error(` ${"✖"} Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  rl.close();
}

main();
