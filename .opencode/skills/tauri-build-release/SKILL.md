---
name: tauri-build-release
description: Use when building, packaging, or releasing the Tauri desktop application (msemblyln). Covers production builds, installer generation, and the GitHub release workflow. Do NOT use for general Rust development, frontend-only changes, or the CLI/TUI crates.
---

# Tauri Build & Release

## Install dependencies
```bash
bun install
```

## Verify dev mode
```bash
bun run tauri dev
```

## Build production executables
```bash
bun run tauri build
```
- Builds frontend with `bun run build`
- Compiles Rust backend with `cargo build --release`
- Generates installers in `src-tauri/target/release/bundle/`

## Release process

### Manual release
1. Create GitHub release from local:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```
2. Create release on GitHub UI with attached binaries

### Automated release (GitHub Actions)
1. Push to main branch
2. CI workflow builds and uploads artifacts
3. Create release from CI artifacts

## Output artifacts
- **Windows**: `.exe` installer, `.msi`
- **Linux**: `.AppImage`, `.deb`
- Path: `src-tauri/target/release/bundle/`

## Troubleshooting
- Missing FFmpeg: Ensure FFmpeg is on user PATH
- Build errors: `cargo check` in the workspace root
- Tauri CLI issues: Verify `@tauri-apps/cli` installed

## Quick commands
```bash
bun install              # Install deps
bun run tauri dev        # Dev mode
bun run tauri build      # Build all
```

## Project-specific notes
- Tauri app package is `msemblyln` (under `src-tauri/`)
- All Rust crates share workspace `[profile.release]` (panic=abort, LTO, opt-level=s, strip=true)
- Frontend `dist/` is consumed by Tauri via `"frontendDist": "../dist"` in `tauri.conf.json`
