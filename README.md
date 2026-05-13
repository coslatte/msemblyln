# msemblyln

Desktop tool to turn a single image + audio into a ready-to-upload video.

## Goals
- Simple flow: image + audio = video
- Output MP4 (H.264 + AAC) with duration equal to the audio
- Presets for 16:9, 9:16, and 1:1
- Resolutions up to 4K
- Tauri + React UI, Rust core, FFmpeg under the hood

## Requirements
- FFmpeg installed and available on PATH
- Optional env var overrides:
  - `MSEMBLYLN_FFMPEG` (default `ffmpeg`)
  - `MSEMBLYLN_FFPROBE` (default `ffprobe`)

## Development
This repo is scaffolded for Tauri v2 + React + Vite + Tailwind.

Commands are defined in Rust:
- `create_video` renders the output mp4
- `probe_media` extracts duration from audio/video

## CLI (optional)
A minimal CLI is included in `src-tauri/src/bin/msemblyln-cli.rs`:

```
cargo run -p msemblyln --bin msemblyln-cli -- \
  --image /path/cover.png \
  --audio /path/track.mp3 \
  --width 1920 --height 1080 \
  --output /path/out.mp4
```

## License
MIT
