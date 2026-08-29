import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Where the timing JSONs live (…/video/timing/<id>.learning.json).
const TIMING_DIR = resolve(__dirname, "..", "timing");
const timingPath = (id: string) => {
  const a = resolve(TIMING_DIR, `${id}.learning.json`);
  const b = resolve(TIMING_DIR, `${id}.json`);
  return existsSync(a) ? a : b;
};
// Only ever touch files inside timing/ — never write outside it.
const safe = (p: string) => p.startsWith(TIMING_DIR + "/") || p === TIMING_DIR;

// A tiny dev-only API: GET returns a timing JSON, PUT writes it back (same
// 2-space format the rest of the repo uses, so git diffs stay clean).
const timingApi = (): Plugin => ({
  name: "timing-api",
  configureServer(server) {
    server.middlewares.use("/api/timing", (req, res) => {
      const url = new URL(req.url ?? "/", "http://x");
      const id = url.searchParams.get("id") ?? "01-aiueo";
      const file = timingPath(id);
      res.setHeader("Content-Type", "application/json");
      if (!safe(file) || !existsSync(file)) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: `no timing for "${id}"` }));
        return;
      }
      if (req.method === "GET") {
        res.end(readFileSync(file, "utf8"));
        return;
      }
      if (req.method === "PUT") {
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", () => {
          try {
            const json = JSON.parse(body);
            writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: String(e) }));
          }
        });
        return;
      }
      res.statusCode = 405;
      res.end(JSON.stringify({ error: "method not allowed" }));
    });
  },
});

export default defineConfig({
  root: __dirname,
  // Serve the Remotion public/ folder at '/', so staticFile('01-aiueo.wav'),
  // the illustrations and the logo all resolve exactly as they do in a render.
  publicDir: resolve(__dirname, "..", "public"),
  plugins: [react(), timingApi()],
  server: {
    port: 3010,
    // Allow importing the template from ../src and its deps in the parent tree.
    fs: { allow: [resolve(__dirname, "..", "..")] },
    // A nudge saves the timing JSON via the API above, and those files are
    // statically imported by the registry — so Vite would force a full page
    // reload on every single adjustment. Ignore the timing dir in the watcher:
    // the app reads live timing from /api/timing and updates in place, so it
    // never needs an HMR reload when a nudge is saved. (Vite merges this with
    // its own node_modules/.git ignores.)
    watch: { ignored: [`${TIMING_DIR}/**`] },
  },
});
