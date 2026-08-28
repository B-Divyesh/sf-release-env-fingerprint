import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';

const html = await readFile('dist/site/index.html', 'utf8');
assert.match(html, /<html lang="en">/);
assert.match(html, /<title>[^<]+<\/title>/);
assert.match(html, /rel="canonical"/);
assert.match(html, /property="og:title"/);
assert.match(html, /property="og:url"/);
assert.match(html, /name="twitter:card"/);
assert.match(html, /apple-touch-icon/);
assert.doesNotMatch(html, /https:\/\/(fonts|cdn|unpkg|jsdelivr)\./);
assert.ok((await stat('dist/site/social-card.jpg')).size > 0, 'social card missing');
assert.ok((await stat('dist/site/apple-touch-icon.png')).size > 0, 'apple touch icon missing');
assert.ok((await stat('dist/site/404.html')).size > 0, 'static 404 missing');
assert.ok((await stat('dist/site/LICENSE.txt')).size > 0, 'deployed license missing');

for (const [route, title, canonical] of [
  ['demo', 'Demo — Release Env Fingerprint', '/demo'],
  ['privacy', 'Privacy — Release Env Fingerprint', '/privacy'],
  ['terms', 'Terms — Release Env Fingerprint', '/terms']
]) {
  const routeHtml = await readFile(`dist/site/${route}/index.html`, 'utf8');
  assert.match(routeHtml, new RegExp(`<title>${title}</title>`));
  assert.match(routeHtml, new RegExp(`rel="canonical" href="https://release-env-fingerprint.sociobot.in${canonical}"`));
}

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

const shell = ['/', '/?demo=1', '/demo/', '/privacy/', '/terms/', ...assets, '/proof-sheet.webp', '/fingerprint.svg', '/manifest.webmanifest'];
const digest = createHash('sha256');
for (const path of shell) {
  digest.update(path);
  const file = path === '/' || path === '/?demo=1' ? 'index.html' : path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1);
  digest.update(await readFile(`dist/site/${file}`));
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
assert.equal(staticConfig.navigationFallback, undefined, 'unknown routes must reach the real 404 response');
for (const route of ['/demo', '/privacy', '/terms']) assert.ok(staticConfig.routes.some((item) => item.route === route && item.rewrite === `${route}/index.html`), `${route} needs a static rewrite`);

const claims = JSON.parse(await readFile('.factory/claims.json', 'utf8'));
assert.equal(new Set(claims.map((claim) => claim.id)).size, claims.length, 'claim IDs must be unique');
const claimRunner = await readFile('site/claims.mjs', 'utf8');
for (const claim of claims) {
  assert.equal(claim.test, `npm run test:claims -- @claim:${claim.id}`);
  assert.equal(claimRunner.split(`'@claim:${claim.id}'`).length - 1, 1, `${claim.id} needs exactly one tagged branch`);
}
console.log(`site budgets: JS ${jsBytes} B, CSS ${cssBytes} B, hero ${(await stat('dist/site/proof-sheet.webp')).size} B`);
