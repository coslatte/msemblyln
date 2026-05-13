import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "Sora", "ui-sans-serif", "system-ui"],
        body: ["Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui"]
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
          900: "#881337"
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
          900: "#164e63"
        }
      },
      boxShadow: {
        glow: "0 20px 60px rgba(14,116,144,0.25)",
        ember: "0 20px 60px rgba(225,29,72,0.25)"
      },
      backgroundImage: {
        "mesh-soft": "radial-gradient(circle at 20% 20%, rgba(14,116,144,0.15), transparent 45%), radial-gradient(circle at 80% 10%, rgba(225,29,72,0.2), transparent 45%), radial-gradient(circle at 50% 80%, rgba(34,211,238,0.18), transparent 40%)",
        "ember-tide": "linear-gradient(120deg, rgba(225,29,72,0.9), rgba(14,116,144,0.9))"
      }
    }
  },
  plugins: []
} satisfies Config;
