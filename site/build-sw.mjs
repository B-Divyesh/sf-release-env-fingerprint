import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../dist/site/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const template = await readFile(new URL('sw-template.js', import.meta.url), 'utf8');
const hashedAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map((match) => match[1]);
const shell = ['/', ...hashedAssets, '/proof-sheet.webp', '/fingerprint.svg', '/manifest.webmanifest'];

const digest = createHash('sha256');
for (const path of shell) {
  const file = path === '/' ? 'index.html' : path.slice(1);
  digest.update(path);
  digest.update(await readFile(new URL(file, root)));
}

const cacheName = `refp-shell-${digest.digest('hex').slice(0, 16)}`;
const worker = template
  .replace('__CACHE_NAME__', cacheName)
  .replace('__SHELL_ASSETS__', JSON.stringify(shell, null, 2));
await writeFile(new URL('sw.js', root), worker);
console.log(`service worker: ${cacheName}, ${shell.length} precached files`);
