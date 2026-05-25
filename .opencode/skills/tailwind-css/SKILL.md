---
name: tailwind-css
description: Use when writing Tailwind CSS classes, configuring the project theme, or checking version compatibility. Covers custom theme tokens (ember/tide colors, fonts, shadows), the cn() utility, CSS utility classes in index.css, and Prettier formatting conventions. Do NOT use for general CSS questions unrelated to this project's setup.
---

# Tailwind CSS — Version tracking & code conventions

## Version tracking

This project pins **Tailwind CSS v3.4** (`package.json` has `"tailwindcss": "^3.4.4"`).

### Before bumping to v4
- Tailwind v4 is a major rewrite (no `tailwind.config`, CSS-first config, `@import "tailwindcss"` instead of `@tailwind` directives)
- Our `tailwind.config.ts` and `postcss.config.cjs` are v3-only — they will break under v4
- The custom theme (ember/tide colors, fonts, shadows, background images) must be migrated to CSS-based `@theme` blocks
- Our custom `.glass` and `.grad-text` utilities in `index.css` are compatible with either version as plain CSS

**Approach**: Watch `tailwindcss` npm releases. When v4 stable matures, do a deliberate migration — do not auto-upgrade.

## Code conventions

### Use the `cn()` utility for conditional classes
```ts
import { cn } from "../../lib/cn";

// cn() is filter(Boolean).join(" ") — no clsx, no tailwind-merge
className={cn("base-class", condition && "extra", className)}
```

### Custom theme tokens (defined in `tailwind.config.ts`)
```ts
// Colors (use full palette):
ember-{50-900}  // rose/crimson spectrum
tide-{50-900}   // cyan spectrum

// Fonts:
font-display    // "Space Grotesk" — titles, headings, hero text
font-body       // "Plus Jakarta Sans" — body, labels, description

// Shadows:
shadow-glow     // cyan-tinted glow (used on glass cards)
shadow-ember    // rose-tinted glow (used on primary buttons)

// Background images:
bg-mesh-soft    // radial gradient mesh (app background)
bg-ember-tide   // diagonal gradient (gradient overlays)
```

### CSS utilities (in `index.css`, use via className, never `@apply`)
```css
.glass       /* white/85 + blur(12px) — frosted glass panels */
.grad-text   /* rose→cyan text gradient — hero headings */
```

### Prettier (defined in `.prettierrc`)
- no semicolons, single quotes, trailing commas es5
- arrow parens avoid, print width 100, tab width 2

### What NOT to do
- Do not use `@apply` in component files — keep Tailwind classes inline in JSX
- Do not add `clsx`, `tailwind-merge`, or `classnames` — use `cn()`
- Do not bypass `cn()` for simple joins
