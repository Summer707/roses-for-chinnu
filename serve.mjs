import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const host = "127.0.0.1";
const port = 4173;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
};

function sendNotFound(response) {
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
}

createServer(async (request, response) => {
  const requestUrl = request.url === "/" ? "/index.html" : request.url ?? "/index.html";
  const safePath = path.normalize(decodeURIComponent(requestUrl)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(__dirname, safePath);

  if (!filePath.startsWith(__dirname) || !existsSync(filePath)) {
    sendNotFound(response);
    return;
  }

  const fileStats = await stat(filePath);

  if (fileStats.isDirectory()) {
    sendNotFound(response);
    return;
  }

  const extension = path.extname(filePath);
  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": contentTypes[extension] ?? "application/octet-stream",
  });

  createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  console.log(`Rose Bloom UI available at http://${host}:${port}`);
});
