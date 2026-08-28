import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--config', 'site/vite.config.ts'], {
  stdio: ['ignore', 'ignore', 'pipe']
});
let serverError = '';
server.stderr.on('data', (chunk) => { serverError += chunk.toString(); });

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:4173');
      if (response.ok) return;
    } catch { /* waiting */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`preview server did not start: ${serverError}`);
}

try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const skipText = await page.locator(':focus').textContent();
  if (!skipText?.includes('Skip to main')) throw new Error('skip link is not first in the keyboard order');
  await page.locator('#compare-button').click();
  await page.locator('.result-header.has-drift').waitFor();
  const resultText = await page.locator('#demo-output').textContent();
  if (!resultText?.includes('PUBLIC_API_ORIGIN') || !resultText.includes('DEBUG')) {
    throw new Error('seeded comparison did not report missing and extra variables');
  }

  await context.setOffline(true);
  await page.locator('#offline-notice').waitFor({ state: 'visible' });
  await page.locator('#clear-button').click();
  await page.locator('.empty-result').waitFor();
  await page.locator('#baseline-input').fill('NOT A NAME=value');
  await page.locator('#candidate-input').fill('VALID=yes');
  await page.locator('#compare-button').click();
  await page.locator('.error-result[role="alert"]').waitFor();
  await context.setOffline(false);

  await page.addScriptTag({ content: await readFile('node_modules/axe-core/axe.min.js', 'utf8') });
  const axe = await page.evaluate(async () => globalThis.axe.run(document, {
    resultTypes: ['violations'],
    rules: { region: { enabled: true } }
  }));
  const serious = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
  if (serious.length) throw new Error(`axe serious/critical violations: ${JSON.stringify(serious, null, 2)}`);
  if (consoleErrors.length) throw new Error(`console errors: ${consoleErrors.join('; ')}`);
  if ((await page.locator('h1').count()) !== 1) throw new Error('expected exactly one h1');
  if ((await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth))) {
    throw new Error('390px viewport has horizontal overflow');
  }
  await browser.close();
  console.log('browser checks: 390px layout, keyboard, drift/empty/error/offline states, console, and axe passed');
} finally {
  server.kill('SIGTERM');
}
