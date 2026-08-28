import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';

const html = await readFile('dist/site/index.html', 'utf8');
assert.match(html, /<html lang="en">/);
assert.match(html, /<title>[^<]+<\/title>/);
assert.match(html, /rel="canonical"/);
assert.match(html, /property="og:title"/);
assert.match(html, /name="twitter:card"/);
assert.match(html, /apple-touch-icon/);
assert.doesNotMatch(html, /https:\/\/(fonts|cdn|unpkg|jsdelivr)\./);
assert.ok((await stat('dist/site/social-card.jpg')).size > 0, 'social card missing');
assert.ok((await stat('dist/site/apple-touch-icon.png')).size > 0, 'apple touch icon missing');
assert.ok((await stat('dist/site/404.html')).size > 0, 'static 404 missing');

const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
let jsBytes = 0;
let cssBytes = 0;
for (const asset of assets) {
  const size = (await stat(`dist/site${asset}`)).size;
  if (asset.endsWith('.js')) jsBytes += size;
  if (asset.endsWith('.css')) cssBytes += size;
}
assert(jsBytes <= 200 * 1024, `initial JS is ${jsBytes} bytes`);
assert(cssBytes <= 50 * 1024, `CSS is ${cssBytes} bytes`);
assert((await stat('dist/site/proof-sheet.webp')).size <= 300 * 1024, 'hero exceeds 300 KB');

const shell = ['/', ...assets, '/proof-sheet.webp', '/fingerprint.svg', '/manifest.webmanifest'];
const digest = createHash('sha256');
for (const path of shell) {
  digest.update(path);
  digest.update(await readFile(`dist/site/${path === '/' ? 'index.html' : path.slice(1)}`));
}
const expectedCache = `refp-shell-${digest.digest('hex').slice(0, 16)}`;
const worker = await readFile('dist/site/sw.js', 'utf8');
assert.match(worker, new RegExp(`const CACHE = '${expectedCache}'`), 'service worker cache version must follow all shell content');
for (const path of shell) assert.ok(worker.includes(JSON.stringify(path)), `${path} must be precached`);
assert.match(worker, /event\.request\.mode === 'navigate'/, 'navigation requests must use the update-safe strategy');
assert.match(worker, /networkFirst\(event\.request\)/, 'navigation must be network-first');

const staticConfig = JSON.parse(await readFile('dist/site/staticwebapp.config.json', 'utf8'));
const assetRoute = staticConfig.routes.find((route) => route.route === '/assets/*');
assert.equal(assetRoute?.headers?.['Cache-Control'], 'public, max-age=31536000, immutable');
const workerRoute = staticConfig.routes.find((route) => route.route === '/sw.js');
assert.match(workerRoute?.headers?.['Cache-Control'] ?? '', /no-store/);
assert.equal(staticConfig.responseOverrides?.['404']?.statusCode, 404);
console.log(`site budgets: JS ${jsBytes} B, CSS ${cssBytes} B, hero ${(await stat('dist/site/proof-sheet.webp')).size} B`);
