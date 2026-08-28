import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const html = await readFile('dist/site/index.html', 'utf8');
assert.match(html, /<html lang="en">/);
assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, 'site must contain exactly one h1');
assert.match(html, /<main id="main">/);
assert.match(html, /<title>[^<]+<\/title>/);
assert.doesNotMatch(html, /https:\/\/(fonts|cdn|unpkg|jsdelivr)\./);

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
console.log(`site budgets: JS ${jsBytes} B, CSS ${cssBytes} B, hero ${(await stat('dist/site/proof-sheet.webp')).size} B`);
