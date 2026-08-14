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
  ".xml": "application/xml; charset=utf-8",
};

const NOT_FOUND = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>404 &mdash; ANOPHELYZE</title>
<meta name="robots" content="noindex" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
<style>
  body{background:#9bbc0f;color:#0f380f;font-family:'VT323',monospace;font-size:24px;
    display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;}
  .box{background:#e8f0c8;border:4px solid #0f380f;box-shadow:0 0 0 4px #8bac0f,6px 6px 0 4px #0f380f;
    padding:26px 30px;max-width:460px;}
  h1{font-family:'Press Start 2P',monospace;font-size:18px;margin:0 0 18px;}
  a{color:#c1121f;}
</style></head>
<body><div class="box">
  <h1>404</h1>
  <p>This page flew off. Nothing here but empty air.</p>
  <p><a href="/">&#9658; BACK TO ANOPHELYZE</a></p>
</div></body></html>`;

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
      // Return a real 404. Previously this served index.html with a 200 for
      // every unknown path, which made robots.txt/sitemap.xml return HTML and
      // gave search engines an unlimited supply of duplicate "pages".
      res.writeHead(404, { "Content-Type": TYPES[".html"] });
      return res.end(NOT_FOUND);
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Anophelyze running on port ${PORT}`);
});
