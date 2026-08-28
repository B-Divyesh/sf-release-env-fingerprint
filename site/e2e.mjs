import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

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
  const requestOrigins = new Set();
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('request', (request) => requestOrigins.add(new URL(request.url()).origin));
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const skipText = await page.locator(':focus').textContent();
  if (!skipText?.includes('Skip to main')) throw new Error('skip link is not first in the keyboard order');
  await page.locator('#compare-button').focus();
  await page.keyboard.press('Enter');
  await page.locator('.result-header.has-drift').waitFor();
  if (await page.evaluate(() => document.activeElement?.id) !== 'compare-button') {
    throw new Error('Compare did not preserve keyboard focus after a successful result');
  }
  const resultText = await page.locator('#demo-output').textContent();
  if (!resultText?.includes('PUBLIC_API_ORIGIN') || !resultText.includes('DEBUG')) {
    throw new Error('seeded comparison did not report missing and extra variables');
  }

  await page.locator('#clear-button').click();
  await page.locator('.empty-result').waitFor();
  await page.locator('#baseline-input').fill('NOT A NAME=value');
  await page.locator('#candidate-input').fill('VALID=yes');
  await page.locator('#compare-button').focus();
  await page.keyboard.press('Enter');
  await page.locator('.error-result[role="alert"]').waitFor();
  if (await page.evaluate(() => document.activeElement?.id) !== 'compare-button') {
    throw new Error('Compare did not preserve keyboard focus after an error');
  }

  async function assertMobileLayout(width) {
    await page.setViewportSize({ width, height: 844 });
    const selectors = [
      '.hero-copy', '#hero-title', '.lede', '.hero-art',
      '#install .command-box', '#install .copy-button',
      '.final-cta > div', '.final-cta .command-box', '.final-cta .copy-button'
    ];
    const clipped = await page.evaluate(({ selectors, width }) => selectors.flatMap((selector) =>
      [...document.querySelectorAll(selector)].flatMap((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > width + 1
          ? [{ selector, left: rect.left, right: rect.right, width: rect.width }]
          : [];
      })), { selectors, width });
    if (clipped.length) throw new Error(`${width}px primary content is clipped: ${JSON.stringify(clipped)}`);
    const mainSize = await page.locator('main').evaluate((main) => ({ scroll: main.scrollWidth, client: main.clientWidth }));
    if (mainSize.scroll > mainSize.client) throw new Error(`${width}px main hides ${mainSize.scroll}px content in ${mainSize.client}px`);
  }

  await assertMobileLayout(390);
  await assertMobileLayout(640);
  await page.setViewportSize({ width: 390, height: 844 });

  const undersizedTargets = await page.locator('a, button').evaluateAll((elements) => elements.flatMap((element) => {
    const rect = element.getBoundingClientRect();
    const visible = getComputedStyle(element).display !== 'none' && rect.width > 0 && rect.height > 0;
    if (!visible || element.classList.contains('skip-link') || (rect.width >= 44 && rect.height >= 44)) return [];
    return [{ text: element.textContent?.trim(), width: rect.width, height: rect.height }];
  }));
  if (undersizedTargets.length) throw new Error(`mobile touch targets below 44px: ${JSON.stringify(undersizedTargets)}`);

  const brandName = await page.locator('.brand').getAttribute('aria-label');
  if (!brandName?.includes('REFP')) throw new Error('brand accessible name does not contain its visible label');

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    throw new Error('page is not controlled by the installed service worker');
  }
  const cacheContents = await page.evaluate(async () => {
    const names = await caches.keys();
    const shellName = names.find((name) => name.startsWith('refp-shell-'));
    return shellName ? (await caches.open(shellName)).keys().then((requests) => requests.map((request) => new URL(request.url).pathname)) : [];
  });
  if (!cacheContents.some((path) => path.endsWith('.js')) || !cacheContents.some((path) => path.endsWith('.css'))) {
    throw new Error(`service worker omitted built JS/CSS: ${JSON.stringify(cacheContents)}`);
  }

  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.clearBrowserCache');
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#offline-notice').waitFor({ state: 'visible', timeout: 5000 }).catch(async () => {
    const state = await page.evaluate(async () => ({
      online: navigator.onLine,
      controlled: Boolean(navigator.serviceWorker.controller),
      caches: await Promise.all((await caches.keys()).map(async (name) => ({
        name,
        entries: await Promise.all((await (await caches.open(name)).keys()).map(async (request) => {
          try {
            const response = await caches.match(request);
            return { path: new URL(request.url).pathname, bytes: (await response.arrayBuffer()).byteLength };
          } catch (error) {
            return { path: new URL(request.url).pathname, error: String(error) };
          }
        }))
      }))),
      scripts: [...document.scripts].map((script) => script.src)
    }));
    throw new Error(`cold offline reload did not initialize the app: ${JSON.stringify({ state, consoleErrors })}`);
  });
  await page.locator('#compare-button').click();
  await page.locator('.result-header.has-drift').waitFor();
  await context.setOffline(false);

  const builtHtml = await readFile('dist/site/index.html', 'utf8');
  const updatedHtml = builtHtml.replace('</head>', '<meta name="qa-release-marker" content="fresh" /></head>');
  try {
    await writeFile('dist/site/index.html', updatedHtml);
    await page.reload({ waitUntil: 'networkidle' });
    if ((await page.locator('meta[name="qa-release-marker"]').getAttribute('content')) !== 'fresh') {
      throw new Error('service worker served stale HTML after an online release update');
    }
  } finally {
    await writeFile('dist/site/index.html', builtHtml);
  }

  await page.addScriptTag({ content: await readFile('node_modules/axe-core/axe.min.js', 'utf8') });
  const axe = await page.evaluate(async () => globalThis.axe.run(document, {
    resultTypes: ['violations'],
    rules: { region: { enabled: true } }
  }));
  const serious = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
  if (serious.length) throw new Error(`axe serious/critical violations: ${JSON.stringify(serious, null, 2)}`);
  if (consoleErrors.length) throw new Error(`console errors: ${consoleErrors.join('; ')}`);
  if ([...requestOrigins].some((origin) => origin !== 'http://127.0.0.1:4173')) {
    throw new Error(`third-party request detected: ${JSON.stringify([...requestOrigins])}`);
  }
  const clientState = await page.evaluate(async () => ({
    cookies: document.cookie,
    local: localStorage.length,
    session: sessionStorage.length,
    databases: 'databases' in indexedDB ? (await indexedDB.databases()).length : 0
  }));
  if (clientState.cookies || clientState.local || clientState.session || clientState.databases) {
    throw new Error(`unexpected client storage: ${JSON.stringify(clientState)}`);
  }
  if ((await page.locator('h1').count()) !== 1) throw new Error('expected exactly one h1');
  if ((await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth))) {
    throw new Error('390px viewport has horizontal overflow');
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  if ((await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth))) {
    throw new Error('1440px viewport has horizontal overflow');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedMotion = await page.locator('.hero-art').evaluate((element) => ({
    duration: getComputedStyle(element).animationDuration,
    transform: getComputedStyle(element).transform,
    scroll: getComputedStyle(document.documentElement).scrollBehavior
  }));
  const stationary = reducedMotion.transform === 'none' || reducedMotion.transform === 'matrix(1, 0, 0, 1, 0, 0)';
  if (reducedMotion.duration !== '1e-05s' || !stationary || reducedMotion.scroll !== 'auto') {
    throw new Error(`reduced-motion policy failed: ${JSON.stringify(reducedMotion)}`);
  }
  await browser.close();
  console.log('browser checks: desktop/390/640px, touch, keyboard/focus, cold offline/update, privacy, reduced motion, console, and axe passed');
} finally {
  server.kill('SIGTERM');
}
