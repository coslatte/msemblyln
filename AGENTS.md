# msemblyln — OpenCode agent guide

## Stack
- **Frontend**: React 19 + TypeScript (strict) + Vite 5 + Tailwind CSS 3.4
- **Backend (GUI)**: Tauri v2 + Rust (edition 2021) — Rust workspace with 4 crates; used only for desktop builds
- **Backend (dev)**: Node.js via `vite-plugin-backend.ts` — runs FFmpeg via `child_process` when in browser dev mode
- **Runtime modes**: app works fully in browser (`bun run dev`) OR as Tauri desktop build — API auto-detects environment
- **Package manager**: Bun (lockfile: `bun.lock`)
- **Formatter**: Prettier (no semi, single quotes, trailing commas es5, arrow parens avoid, print 100)

## Commands
```bash
bun install                           # install JS deps
bun run dev                           # Vite dev server — works in browser (port 5173)
bun run build                         # build frontend to dist/
bun run tauri dev                     # full Tauri dev mode (frontend + Rust)
bun run tauri build                   # production desktop build (all bundle targets)
cargo build --workspace               # build all Rust crates
cargo run -p msemblyln-cli -- --image <path> --audio <path>  # CLI mode
cargo run -p msemblyln-tui            # TUI interactive wizard
cargo fmt --check                     # Rust format check (CI)
cargo clippy -- -D warnings           # Rust lint check (CI)
```

## Rust workspace structure
```
Cargo.toml                    # workspace root (resolver 2)
crates/
  core/                       # msemblyln-core — shared types, presets, ffmpeg logic
  cli/                        # msemblyln-cli — CLI binary (args-based)
  tui/                        # msemblyln-tui — TUI interactive wizard (ratatui)
src-tauri/                    # msemblyln — Tauri GUI app (depends on core)
```
All crates share the workspace `[profile.release]` (panic=abort, LTO, opt-level=s).

## Frontend structure
- `src/` — React app (atomic design: `atoms/`, `molecules/`, `organisms/`)
- `src/lib/` — shared utils: `cn()` (class join, no tailwind-merge), `presets.ts` (aspect/resolution presets), `api.ts` (unified API layer — Tauri invoke + fetch fallback)
- `src/types/index.ts` — `AppState`, `RenderOptions`, `FileData` etc.
- `server/backend.ts` — Node.js FFmpeg wrapper (used in browser dev mode)
- `vite-plugin-backend.ts` — Vite plugin registering /api/* routes on the dev server

## Key quirks
- **FFmpeg required on PATH**. Env overrides: `MSEMBLYLN_FFMPEG`, `MSEMBLYLN_FFPROBE`
- **No test framework** installed. `package.json` has no test script.
- **Dual runtime**: `src/lib/api.ts` detects `window.__TAURI__` — uses invoke with Tauri, fetch with Node.js backend otherwise
- **Output directory**: "Browse" button selects a directory natively (Tauri dialog) or via OS dialog through Node.js backend
- **File handling**: In browser mode, files are read as base64 data URLs and uploaded to the Node.js server; in Tauri mode, native paths are used directly
- **Tailwind custom theme**: colors `ember` (rose/CTA) / `tide` (cyan/interactive), fonts `Space Grotesk` (display) / `Plus Jakarta Sans` (body), shadows `glow` / `ember`, bg mesh animated
- **Color system**: `slate-100` headings, `slate-200` body, `slate-400` secondary, `slate-500` hints; ember for CTAs/selections, tide for data/hover states
- **CSS utilities** in `index.css`: `.glass` (dark translucent), `.glass-strong` (darker), `.grad-text` (animated ember→tide→ember text)
- **`cn()`** is a simple `filter(Boolean).join(" ")` — no clsx, no tailwind-merge
- **Tauri capabilities** at `src-tauri/capabilities/default.json`: permits fs read/write/mkdir/exists + dialog open/save
- **Builder pattern**: `AppShell` → `TitleBar` + `Hero` + `ConverterPanel` + `OutputPanel`
- **TypeScript** uses `vite/client` types (not `@types/node`) — server-side files excluded from main tsconfig

## CI (GitHub Actions)
- `bun run build` + Tauri build action on push/PR to main (ubuntu/macos/windows)
- `cargo fmt --check` + `cargo clippy -- -D warnings` (ubuntu only)

## FFmpeg shell reference (what the app does internally)

The app builds these exact ffmpeg commands. Same effect from the shell:

```bash
# Basic: image + audio → MP4 (H.264 + AAC), duration = audio length
ffmpeg -y -loop 1 -i cover.png -i track.mp3 \
  -c:v libx264 -preset medium -crf 18 -tune stillimage \
  -c:a aac -b:a 192k -shortest -pix_fmt yuv420p -r 30 \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p" \
  -movflags +faststart output.mp4

# Key flags explained:
# -loop 1              — treat image as single-frame loop
# -tune stillimage     — optimize H.264 for still image
# -shortest            — stop when audio ends (so video duration = audio)
# -vf scale...pad...   — fit image inside canvas, letterbox/pillarbox if needed
# -movflags +faststart — web-optimized (moov atom at front)

# Change resolution: edit the scale/pad values
# 1920:1080 → 1080:1920 (9:16 vertical)
# 1920:1080 → 1080:1080 (1:1 square)
# 1920:1080 → 3840:2160 (4K 16:9)

# Change quality: CRF scale (0-51, lower = better)
# -crf 18   — visually lossless (default)
# -crf 23   — good balance
# -crf 28   — smaller file, lower quality

# Probe media (get duration from any audio/video file)
ffprobe -v error -print_format json -show_format -show_streams track.mp3

# Available env overrides:
# MSEMBLYLN_FFMPEG  — path to ffmpeg binary (default: ffmpeg)
# MSEMBLYLN_FFPROBE — path to ffprobe binary (default: ffprobe)
```

## If adding deps
- JS: `bun add <pkg>` / `bun add -d <pkg>`
- Rust: add to the relevant crate's `Cargo.toml`, then `cargo build --workspace` from root
