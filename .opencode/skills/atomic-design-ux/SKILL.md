---
name: atomic-design-ux
description: Use when creating new UI components, understanding component hierarchy, or implementing user interactions in the msemblyln React frontend. Covers atomic design layers (atoms/molecules/organisms), import rules, the image+audio→video user flow, and UX patterns from the codebase. Do NOT use for general React questions or for Rust/backend work.
---

# Atomic design & UX conventions

## Component hierarchy (`src/ui/`)

```
atoms/       ← smallest building blocks (Button, Card, IconButton, SectionTitle)
molecules/   ← assembled atoms (FileDrop, OptionGroup, OutputField)
organisms/   ← full sections (AppShell, Hero, ConverterPanel, OutputPanel, TitleBar)
```

### Rules per layer

| Layer | Can import | Cannot import |
|-------|-----------|---------------|
| `atoms/` | `cn()`, types | other components |
| `molecules/` | atoms, `cn()` | other molecules or organisms |
| `organisms/` | molecules + atoms | — |

### Component shape (follow existing)
- Named export default function, typed props interface/type in same file
- Props named after component: `ButtonProps`, `CardProps`
- `cn()` for className merging, accept `className?: string` in all props
- Never use `React.FC`, never use default props

## UX conventions for this app

### Core flow: Image + Audio → Video
The user always follows this sequence:
1. Drop/select cover image (`drag-drop` zone with preview)
2. Drop/select audio file
3. Choose aspect ratio (16:9 / 9:16 / 1:1)
4. Choose resolution (720p / 1080p / 4K)
5. (Optional) Set output path
6. Click "Render MP4"

### Best practices observed in the codebase

**File selection**
- `FileDrop` handles both drag-and-drop and click-to-browse (hidden `<input type="file">` overlays the entire card)
- Files show preview thumbnail + name + size after selection
- Accepts `image/*` and `audio/*` MIME filters
- The `.path` property from Tauri's file dialog is used when available (for native paths), falling back to `file.name`

**Feedback & state**
- `busy` prop on Button shows a spinner and disables interaction during render
- Errors shown inline below the controls (`text-ember-600`)
- Output panel appears below converter after a successful render, showing both file path and FFmpeg command
- No toast/notification system — all feedback is inline

**Navigation**
- Hero CTA scrolls to the converter form (`ref.current.scrollIntoView`)
- No routing/spa navigation — single-page layout

**Layout**
- Max width `max-w-6xl` centered with padding
- Glass title bar with window controls (minimize/maximize/close via `@tauri-apps/api/window`)
- Grid layout: `lg:grid-cols-2` for file drops, `sm:grid-cols-3` for option groups

### What NOT to do
- Do not add routing, modals, toast libraries, or complex animations — keep it a single-page utility
- Do not add external state management — component-local state + prop drilling is the pattern
- Do not break the FileDrop overlay pattern (hidden input covering the card) — it must remain accessible
