# Tauri Build & Release Skill

## Overview
Skill for building and releasing Tauri applications (msemblyln) for Windows and Linux.

## Workflow Steps

### 1. Install Dependencies
```bash
bun install
```

### 2. Verify Development Mode
```bash
bun run tauri dev
```
- Confirm app runs without errors
- Check for console errors in devtools

### 3. Build Production Executables
```bash
bun run tauri build
```
- Builds frontend with `bun run build`
- Compiles Rust backend with `cargo build --release`
- Generates installers in `src-tauri/target/release/bundle/`

### 4. Release Process

#### Manual Release
1. Create GitHub release from local:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```
2. Create release on GitHub UI with attached binaries

#### Automated Release (GitHub Actions)
1. Push to main branch
2. CI workflow builds and uploads artifacts
3. Create release from CI artifacts

## Output Artifacts
- **Windows**: `.exe` installer, `.msi`
- **Linux**: `.AppImage`, `.deb`
- Path: `src-tauri/target/release/bundle/`

## Troubleshooting
- Missing FFmpeg: Ensure FFmpeg is on user PATH
- Build errors: Run `cargo check` in `src-tauri/`
- Tauri CLI issues: Verify `@tauri-apps/cli` installed

## Quick Commands
```bash
bun install              # Install deps
bun run tauri dev        # Dev mode
bun run tauri build      # Build all
bun run tauri build --target x86_64-pc-windows-msvc  # Windows only
bun run tauri build --target x86_64-unknown-linux-gnu  # Linux only
```