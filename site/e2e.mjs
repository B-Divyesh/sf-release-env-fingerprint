import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const origin = 'http://127.0.0.1:4173';
const server = spawn(process.execPath, ['site/serve-dist.mjs'], { stdio: ['ignore', 'ignore', 'pipe'] });
let serverError = '';
server.stderr.on('data', (chunk) => { serverError += chunk.toString(); });

async function ready() {
  for (let i = 0; i < 60; i += 1) {
    try { if ((await fetch(origin)).ok) return; } catch { /* wait */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('preview did not start: ' + serverError);
}

async function axe(page, route) {
  await page.addScriptTag({ content: await readFile('node_modules/axe-core/axe.min.js', 'utf8') });
  const results = await page.evaluate(async () => globalThis.axe.run(document, { resultTypes: ['violations'] }));
  const bad = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
  assert.deepEqual(bad, [], `axe serious/critical on ${route}`);
}

try {
  await ready();
  for (const [path, status, title] of [
    ['/', 200, 'Release Env Fingerprint — compare release settings'],
    ['/demo', 200, 'Demo — Release Env Fingerprint'],
    ['/privacy', 200, 'Privacy — Release Env Fingerprint'],
    ['/terms', 200, 'Terms — Release Env Fingerprint'],
    ['/does-not-exist-polish-1', 404, 'Page not found — Release Env Fingerprint']
  ]) {
    const response = await fetch(origin + path);
    assert.equal(response.status, status, `${path} HTTP status`);
    assert.match(await response.text(), new RegExp(`<title>${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`), `${path} static title`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(String(error)));

  await page.goto(origin, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('h1').count(), 1);
  assert.match(await page.locator('h1').innerText(), /Compare release settings/i);
  assert.match(await page.locator('.lede').innerText(), /engineers shipping one service/i);
  assert.deepEqual(await page.locator('.steps h3').allTextContents(), ['Capture release settings', 'Sign the fingerprint', 'Compare environments']);
  assert.equal(await page.getByRole('link', { name: 'Open sample comparison' }).count(), 1);
  const heroAction = page.getByRole('link', { name: 'Try it with sample data' }).first();
  await heroAction.waitFor();
  const facts = page.locator('.proof-points li');
  assert.equal(await facts.count(), 3);
  const firstScreenBottom = await facts.last().evaluate((element) => element.getBoundingClientRect().bottom);
  assert.ok(firstScreenBottom <= 844, `mobile facts leave first screen at ${firstScreenBottom}px`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(origin, { waitUntil: 'networkidle' });
  const desktopFactsBottom = await page.locator('.proof-points li').last().evaluate((element) => element.getBoundingClientRect().bottom);
  assert.ok(desktopFactsBottom <= 900, `desktop facts leave first screen at ${desktopFactsBottom}px`);
  assert.equal(await page.locator('.terminal-recording img').getAttribute('src'), '/refp-demo.svg');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin, { waitUntil: 'networkidle' });

  await page.getByRole('link', { name: 'Try it with sample data' }).first().click();
  await page.waitForURL(`${origin}/?demo=1`);
  assert.equal(await page.title(), 'Demo — Release Env Fingerprint');
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('.demo-banner').count(), 1);
  await page.locator('.result-header.has-drift').waitFor();
  assert.equal(await page.locator('.result-row').count(), 5);
  assert.match(await page.locator('.result-header').innerText(), /5 differences/);
  assert.match(await page.locator('h1').innerText(), /production.*candidate/i);
  const mobileResultBottom = await page.locator('.result-row').last().evaluate((element) => element.getBoundingClientRect().bottom);
  assert.ok(mobileResultBottom <= 844, `mobile computed result leaves first demo screen at ${mobileResultBottom}px`);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });
  await page.locator('.result-header.has-drift').waitFor();
  const desktopResultBottom = await page.locator('.result-row').last().evaluate((element) => element.getBoundingClientRect().bottom);
  assert.ok(desktopResultBottom <= 900, `desktop computed result leaves first demo screen at ${desktopResultBottom}px`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });

  await page.locator('#candidate-input').fill(await page.locator('#baseline-input').inputValue());
  await page.locator('#compare-button').click();
  await page.locator('.result-header.is-match').waitFor();
  assert.match(await page.locator('.result-header').innerText(), /0 differences/);
  await page.locator('#candidate-input').fill('ONLY=value');
  await page.locator('#compare-button').click();
  await page.locator('.result-header.has-drift').waitFor();
  assert.equal(await page.locator('.result-row').count(), 6, 'edited data must produce its real six rows');
  await page.locator('#reset-demo').click();
  await page.locator('.result-header.has-drift').filter({ hasText: '5 differences' }).waitFor();
  assert.equal(await page.locator('.result-row').count(), 5);
  assert.match(await page.locator('#baseline-input').inputValue(), /DATABASE_URL/);

  await page.locator('#baseline-input').fill('NOT A NAME=value');
  await page.locator('#compare-button').click();
  await page.locator('.error-result[role="alert"]').waitFor();
  assert.equal(await page.locator('#baseline-input').getAttribute('aria-invalid'), 'true');
  assert.equal(await page.locator(':focus').getAttribute('id'), 'baseline-input');
  assert.match(await page.locator('.error-result').innerText(), /Baseline, line 1/);

  await page.locator('#baseline-input').fill('PRIVATE_SENTINEL=do-not-store');
  await page.locator('#candidate-input').fill('PRIVATE_SENTINEL=do-not-store');
  await page.locator('#compare-button').click();
  await page.locator('.result-header.is-match').waitFor();
  const state = await page.evaluate(async () => ({ cookies: document.cookie, local: localStorage.length, session: sessionStorage.length, dbs: 'databases' in indexedDB ? (await indexedDB.databases()).length : 0 }));
  assert.deepEqual(state, { cookies: '', local: 0, session: 0, dbs: 0 });
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.waitForURL(`${origin}/#install`);
  assert.equal(await page.locator('body').innerText().then((text) => text.includes('do-not-store')), false, 'leaving demo must discard edits');
  assert.equal(await page.locator(':focus').getAttribute('id'), 'hero-title');

  await page.evaluate(() => window.scrollTo(0, 900));
  const savedScroll = await page.evaluate(() => window.scrollY);
  await page.getByRole('link', { name: 'Privacy' }).first().evaluate((element) => element.click());
  assert.equal(await page.title(), 'Privacy — Release Env Fingerprint');
  assert.equal(await page.locator(':focus').evaluate((element) => element.tagName), 'H1');
  assert.match(await page.locator('#route-announcer').textContent(), /Privacy/);
  await page.goBack();
  await page.waitForURL(`${origin}/#install`);
  await page.waitForTimeout(50);
  assert.equal(await page.locator(':focus').evaluate((element) => element.tagName), 'H1');
  assert.ok(Math.abs((await page.evaluate(() => window.scrollY)) - savedScroll) < 5, 'Back must restore scroll');

  for (const route of ['/', '/?demo=1', '/demo', '/privacy', '/terms']) {
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('h1').count(), 1, `${route} one h1`);
    assert.equal(await page.locator('main').count(), 1, `${route} main`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    assert.ok(canonical?.startsWith('https://release-env-fingerprint.sociobot.in/'), `${route} canonical`);
    assert.equal(await page.getByRole('link', { name: 'Open sample comparison' }).count(), 1, `${route} result-naming demo navigation`);
    await axe(page, route);
  }

  const notFoundPage = await context.newPage();
  const notFoundResponse = await notFoundPage.goto(`${origin}/does-not-exist-polish-2`, { waitUntil: 'networkidle' });
  assert.equal(notFoundResponse?.status(), 404);
  assert.equal(await notFoundPage.title(), 'Page not found — Release Env Fingerprint');
  assert.equal(await notFoundPage.locator('.brand svg').count(), 1, '404 shared brand');
  assert.equal(await notFoundPage.locator('.site-header nav a').count(), 4, '404 shared header navigation');
  assert.match(await notFoundPage.locator('.footer-brand').innerText(), /Compare release settings/);
  assert.equal(await notFoundPage.getByRole('link', { name: /Source on GitHub/ }).count(), 1);
  assert.match(await notFoundPage.locator('footer').innerText(), /build polish-2/);
  await axe(notFoundPage, '/404');
  await notFoundPage.close();

  await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#offline-notice').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('.result-header.has-drift').waitFor();
  await context.setOffline(false);

  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(origin);
  const reducedDuration = await reducedPage.locator('.hero-art').evaluate((element) => getComputedStyle(element).animationDuration);
  assert.ok(reducedDuration === '0s' || Number.parseFloat(reducedDuration) <= 0.00001, `reduced motion duration: ${reducedDuration}`);
  await reduced.close();

  for (const width of [390, 640, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(origin + '/?demo=1');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `horizontal overflow at ${width}`);
  }
  assert.deepEqual(consoleErrors, [], 'console errors');
  await browser.close();
  console.log('browser checks: first screen, real demo, routes/status, focus/history, mobile, privacy, offline, reduced motion, console, and axe passed');
} finally {
  server.kill('SIGTERM');
}
