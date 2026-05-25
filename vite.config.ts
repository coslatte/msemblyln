import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { backendPlugin } from "./vite-plugin-backend";

export default defineConfig({
  plugins: [react(), backendPlugin()],
  build: {
    target: "es2020",
    outDir: "dist",

  },
});
