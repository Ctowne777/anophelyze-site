// Minimal zero-dependency static server for Railway.
// Serves index.html + assets, and a tiny visitor counter at POST /api/buzz.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
// Counter persists to a JSON file. Note: Railway's filesystem is ephemeral,
// so this resets on each redeploy. Swap for a database/Redis later for a
// permanent count.
const COUNTER_FILE = path.join(ROOT, "counter.json");

function readCount() {
  try { return JSON.parse(fs.readFileSync(COUNTER_FILE, "utf8")).count || 0; }
  catch { return 0; }
}
function writeCount(n) {
  try { fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count: n })); } catch {}
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);

  // Health check for Railway
  if (urlPath === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("ok");
  }

  // Visitor counter
  if (urlPath === "/api/buzz") {
    let count = readCount();
    if (req.method === "POST") { count += 1; writeCount(count); }
    res.writeHead(200, { "Content-Type": TYPES[".json"], "Cache-Control": "no-store" });
    return res.end(JSON.stringify({ count }));
  }

  // Static files (default to index.html)
  let reqPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.join(ROOT, path.normalize(reqPath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fallback to index.html so it behaves like a single-page site
      fs.readFile(path.join(ROOT, "index.html"), (e2, home) => {
        if (e2) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          return res.end("Not found");
        }
        res.writeHead(200, { "Content-Type": TYPES[".html"] });
        res.end(home);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Anophelyze running on port ${PORT}`);
});
