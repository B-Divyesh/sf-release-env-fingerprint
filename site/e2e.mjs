import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--config', 'site/vite.config.ts'], { stdio: ['ignore', 'ignore', 'pipe'] });
let serverError = '';
server.stderr.on('data', (chunk) => { serverError += chunk.toString(); });
async function ready() {
  for (let i = 0; i < 60; i += 1) {
    try { if ((await fetch('http://127.0.0.1:4173')).ok) return; } catch { /* wait */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('preview did not start: ' + serverError);
}

try {
  await ready();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const origins = new Set();
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('http://127.0.0.1:4173/?demo=1', { waitUntil: 'networkidle' });
  await page.locator('.demo-banner').waitFor();
  await page.locator('.result-header.has-drift').waitFor();
  if ((await page.locator('.result-row').count()) !== 5) throw new Error('demo did not render five differences');
  await page.evaluate(() => { document.body.tabIndex = -1; document.body.focus(); });
  await page.keyboard.press('Tab');
  if (!(await page.locator(':focus').textContent())?.includes('Skip to main')) throw new Error('skip link is not first');
  await page.locator('#reset-demo').click();
  await page.locator('.result-row').first().waitFor();
  await page.locator('#baseline-input').fill('NOT A NAME=value');
  await page.locator('#compare-button').click();
  await page.locator('.error-result[role="alert"]').waitFor();
  if (await page.locator('#baseline-input').getAttribute('aria-invalid') !== 'true') throw new Error('invalid input is not marked');

  await page.goto('http://127.0.0.1:4173/privacy', { waitUntil: 'networkidle' });
  if (await page.title() !== 'Privacy — Release Env Fingerprint') throw new Error('privacy title missing');
  if (await page.locator('h1').count() !== 1) throw new Error('privacy needs one h1');
  await page.goto('http://127.0.0.1:4173/terms', { waitUntil: 'networkidle' });
  if (await page.title() !== 'Terms — Release Env Fingerprint') throw new Error('terms title missing');
  await page.goto('http://127.0.0.1:4173/does-not-exist-review-1', { waitUntil: 'networkidle' });
  if (await page.title() !== 'Page not found — Release Env Fingerprint') throw new Error('designed SPA 404 missing');

  await page.goto('http://127.0.0.1:4173/?demo=1', { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#offline-notice').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('.result-header.has-drift').waitFor();
  await context.setOffline(false);

  await page.addScriptTag({ content: await readFile('node_modules/axe-core/axe.min.js', 'utf8') });
  const axe = await page.evaluate(async () => globalThis.axe.run(document, { resultTypes: ['violations'] }));
  const bad = axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  if (bad.length) throw new Error('axe serious/critical: ' + JSON.stringify(bad));
  const client = await page.evaluate(async () => ({ cookies: document.cookie, local: localStorage.length, session: sessionStorage.length, dbs: 'databases' in indexedDB ? (await indexedDB.databases()).length : 0 }));
  if (client.cookies || client.local || client.session || client.dbs) throw new Error('unexpected browser storage: ' + JSON.stringify(client));
  if ([...origins].some((origin) => origin !== 'http://127.0.0.1:4173')) throw new Error('third-party request: ' + JSON.stringify([...origins]));
  if (consoleErrors.length) throw new Error('console errors: ' + consoleErrors.join('; '));
  for (const width of [390, 640, 1440]) { await page.setViewportSize({ width, height: 900 }); if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) throw new Error('horizontal overflow at ' + width); }
  await browser.close();
  console.log('browser checks: routes, demo, mobile, privacy, offline, keyboard, console, and axe passed');
} finally {
  server.kill('SIGTERM');
}
