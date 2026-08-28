import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { readFile, stat } from 'node:fs/promises';

const root = normalize(new URL('../dist/site/', import.meta.url).pathname);
const port = Number(process.env.PORT || 4173);
const types = { '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json', '.webp': 'image/webp', '.xml': 'application/xml' };

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
  let file = normalize(join(root, pathname));
  if (!file.startsWith(root)) { response.writeHead(400).end('Bad request'); return; }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    response.end(body);
  } catch {
    const body = await readFile(join(root, '404.html'));
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    response.end(body);
  }
}).listen(port, '127.0.0.1', () => console.log(`Static site: http://127.0.0.1:${port}`));
