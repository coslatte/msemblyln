import type { Plugin, ViteDevServer } from "vite";
import { renderVideo, probeMedia, pickDirectory } from "./server/backend";

export function backendPlugin(): Plugin {
  return {
    name: "msemblyln-backend",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/create-video", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
          try {
            const params = JSON.parse(body);
            const result = await renderVideo(params);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: msg }));
          }
        });
      });

      server.middlewares.use("/api/render-stream", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
          try {
            const params = JSON.parse(body);
            let durationSec = 0;
            if (params.audio_path) {
              try {
                const info = probeMediaSync(params.audio_path);
                if (info.duration_seconds) durationSec = info.duration_seconds;
              } catch {
                /* ignore */
              }
            }

            res.setHeader("Content-Type", "application/x-ndjson");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            const result = await renderVideo({
              ...params,
              duration_sec: durationSec || undefined,
              on_progress(info) {
                res.write(JSON.stringify({ type: "progress", ...info }) + "\n");
              },
            });

            res.write(
              JSON.stringify({
                type: "done",
                output_path: result.output_path,
                command: result.command,
              }) + "\n",
            );
            res.end();
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            res.setHeader("Content-Type", "application/x-ndjson");
            res.write(JSON.stringify({ type: "error", error: msg }) + "\n");
            res.end();
          }
        });
      });

      server.middlewares.use("/api/probe-media", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          try {
            const { path } = JSON.parse(body);
            const result = probeMedia(path);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: msg }));
          }
        });
      });

      server.middlewares.use("/api/pick-directory", async (_req, res) => {
        try {
          const path = pickDirectory();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ path }));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: msg }));
        }
      });
    },
  };
}
