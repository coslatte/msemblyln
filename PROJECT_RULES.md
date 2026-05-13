# Project Rules

## Purpose
msemblyln is a desktop tool that combines a single image + audio into a ready-to-upload video (MP4 H.264 + AAC).

## Core Principles
- **Technical & Direct**: Communication should be clear, concise, and focused on implementation
- **No Morbidity**: Keep discussions professional and productive
- **Single Responsibility**: Image + Audio = Video. No complex editing features
- **Cross-Platform**: Builds for Windows and Linux

## Technical Stack
- **Frontend**: React 19 + Vite + Tailwind CSS + TypeScript
- **Backend**: Tauri v2 + Rust
- **Build Tool**: Bun (package manager)
- **Core Dependency**: FFmpeg (user must have installed)

## Development Workflow
1. `bun install` - Install dependencies
2. `bun run tauri dev` - Run in development mode
3. `bun run tauri build` - Build executables for all platforms
4. Release via GitHub Actions or manual build + upload

## Build Targets
- Windows: `.exe` installer (NSIS/MSI)
- Linux: `.AppImage` or `.deb`
- Bundle target: `all` in tauri.conf.json

## Code Style
- React components: functional + hooks
- TypeScript: strict mode enabled
- Rust: idiomatic, no unnecessary comments
- CSS: Tailwind utility classes

## CI/CD
- GitHub Actions workflow in `.github/workflows/`
- Triggers on push to `main`
- Builds and uploads release artifacts