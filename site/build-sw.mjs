import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const root = new URL('../dist/site/', import.meta.url);
const sourceHtml = await readFile(new URL('index.html', root), 'utf8');
const template = await readFile(new URL('sw-template.js', import.meta.url), 'utf8');

const routePages = [
  { directory: 'demo', title: 'Demo — Release Env Fingerprint', description: 'Compare five release configuration differences in an isolated browser sample.', canonical: '/demo' },
  { directory: 'privacy', title: 'Privacy — Release Env Fingerprint', description: 'How the site and browser sample handle data.', canonical: '/privacy' },
  { directory: 'terms', title: 'Terms — Release Env Fingerprint', description: 'MIT License terms for Release Env Fingerprint.', canonical: '/terms' }
];

function routeHtml(route) {
  const canonical = `https://release-env-fingerprint.sociobot.in${route.canonical}`;
  return sourceHtml
    .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(" \/>)/, `$1${route.description}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(" \/>)/, `$1${canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${route.title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, `$1${route.description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(" \/>)/, `$1${canonical}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(" \/>)/, `$1${route.title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(" \/>)/, `$1${route.description}$2`);
}

for (const route of routePages) {
  const directory = new URL(`${route.directory}/`, root);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), routeHtml(route));
}
await writeFile(new URL('LICENSE.txt', root), await readFile(new URL('../LICENSE', import.meta.url)));

const hashedAssets = [...sourceHtml.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map((match) => match[1]);
const shell = ['/', '/?demo=1', '/demo/', '/privacy/', '/terms/', ...hashedAssets, '/proof-sheet.webp', '/fingerprint.svg', '/manifest.webmanifest'];
const fileFor = (path) => {
  if (path === '/' || path === '/?demo=1') return 'index.html';
  if (path.endsWith('/')) return `${path.slice(1)}index.html`;
  return path.slice(1);
};

const digest = createHash('sha256');
for (const path of shell) {
  digest.update(path);
  digest.update(await readFile(new URL(fileFor(path), root)));
}

const cacheName = `refp-shell-${digest.digest('hex').slice(0, 16)}`;
const worker = template
  .replace('__CACHE_NAME__', cacheName)
  .replace('__SHELL_ASSETS__', JSON.stringify(shell, null, 2));
await writeFile(new URL('sw.js', root), worker);
console.log(`static routes and service worker: ${cacheName}, ${shell.length} precached files`);
