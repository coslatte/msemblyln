import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "Sora", "ui-sans-serif", "system-ui"],
        body: ["Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ember: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        tide: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(6,182,212,0.15), 0 0 80px rgba(6,182,212,0.05)",
        "glow-sm": "0 0 20px rgba(6,182,212,0.12)",
        ember: "0 0 40px rgba(244,63,94,0.2), 0 0 80px rgba(244,63,94,0.05)",
        "ember-sm": "0 0 20px rgba(244,63,94,0.15)",
        card: "0 8px 32px rgba(0,0,0,0.3)",
        "card-hover": "0 12px 48px rgba(0,0,0,0.4)",
      },
      backgroundImage: {
        "mesh-soft":
          "radial-gradient(circle at 20% 20%, rgba(14,116,144,0.25), transparent 50%), radial-gradient(circle at 80% 10%, rgba(225,29,72,0.2), transparent 50%), radial-gradient(circle at 50% 80%, rgba(34,211,238,0.2), transparent 45%), radial-gradient(circle at 10% 70%, rgba(244,63,94,0.15), transparent 40%)",
        "ember-tide":
          "linear-gradient(120deg, #e11d48, #0e7490)",
        "ember-tide-subtle":
          "linear-gradient(120deg, rgba(225,29,72,0.15), rgba(14,116,144,0.15))",
      },
      animation: {
        "mesh-shift": "mesh-shift 30s ease-in-out infinite alternate",
        "shimmer": "shimmer 8s ease-in-out infinite alternate",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite alternate",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
      keyframes: {
        "mesh-shift": {
          "0%": { "background-position": "0% 0%" },
          "100%": { "background-position": "100% 100%" },
        },
        shimmer: {
          "0%": { "background-position": "0% 50%" },
          "100%": { "background-position": "100% 50%" },
        },
        "glow-pulse": {
          "0%": { "box-shadow": "0 0 20px rgba(244,63,94,0.2)" },
          "100%": { "box-shadow": "0 0 40px rgba(244,63,94,0.35)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
