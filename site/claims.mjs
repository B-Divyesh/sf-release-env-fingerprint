import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const tag = process.argv[2];
const known = new Set(['@claim:sample-differences', '@claim:signed-fingerprints', '@claim:no-raw-values', '@claim:browser-demo-private', '@claim:offline-reload', '@claim:mit-license', '@claim:cli-demo-isolated', '@claim:exit-2-difference', '@claim:policy-rules', '@claim:approved-value-hashes']);
if (!known.has(tag)) throw new Error('unknown claim tag: ' + tag);

function cargo(filter) {
  execFileSync('cargo', ['test', '--workspace', filter, '--', '--exact'], { stdio: 'inherit' });
}
async function withPage(action) {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--config', 'site/vite.config.ts'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 60; i += 1) {
      try { if ((await fetch('http://127.0.0.1:4173')).ok) break; } catch { /* wait */ }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await action(page, context);
    await browser.close();
  } finally { server.kill('SIGTERM'); }
}

if (tag === '@claim:sample-differences') {
  try { execFileSync('cargo', ['run', '--quiet', '--manifest-path', 'cli/Cargo.toml', '--', 'demo'], { encoding: 'utf8', stdio: 'pipe' }); assert.fail('demo should report differences with exit 2'); }
  catch (error) {
    assert.equal(error.status, 2);
    const text = String(error.stdout);
    for (const item of ['PUBLIC_API_ORIGIN', 'PUBLIC_API_URL', 'DEBUG', 'LOG_LEVEL', 'NODE_ENV']) assert.match(text, new RegExp(item));
    assert.match(text, /Demo files remain at/);
  }
} else if (tag === '@claim:cli-demo-isolated') {
  try { execFileSync('cargo', ['run', '--quiet', '--manifest-path', 'cli/Cargo.toml', '--', 'demo'], { encoding: 'utf8', stdio: 'pipe' }); assert.fail('demo should return 2'); }
  catch (error) { assert.equal(error.status, 2); assert.match(String(error.stdout), /Demo files remain at \/tmp\/refp-demo-/); assert.match(String(error.stdout), /isolated from your project files/); }
} else if (tag === '@claim:exit-2-difference') {
  try { execFileSync('cargo', ['run', '--quiet', '--manifest-path', 'cli/Cargo.toml', '--', 'demo'], { encoding: 'utf8', stdio: 'pipe' }); assert.fail('difference must return 2'); }
  catch (error) { assert.equal(error.status, 2); assert.match(String(error.stdout), /DRIFT DETECTED/); }
} else if (tag === '@claim:policy-rules') {
  cargo('tests::flags_missing_required_and_disallowed_hosts_without_storing_host');
} else if (tag === '@claim:approved-value-hashes') {
  cargo('tests::detects_shape_type_and_allowlisted_value_drift');
} else if (tag === '@claim:signed-fingerprints') {
  cargo('tests::rejects_tampered_fingerprint');
} else if (tag === '@claim:no-raw-values') {
  cargo('documented_capture_and_compare_flow_detects_drift_and_never_writes_values');
} else if (tag === '@claim:mit-license') {
  assert.match(await readFile('LICENSE', 'utf8'), /MIT License/);
} else if (tag === '@claim:browser-demo-private') {
  await withPage(async (page) => {
    const origins = new Set();
    page.on('request', (request) => origins.add(new URL(request.url()).origin));
    await page.goto('http://127.0.0.1:4173/?demo=1', { waitUntil: 'networkidle' });
    await page.locator('.demo-banner').waitFor();
    await page.locator('.result-header.has-drift').waitFor();
    const state = await page.evaluate(async () => ({ cookies: document.cookie, local: localStorage.length, session: sessionStorage.length, dbs: 'databases' in indexedDB ? (await indexedDB.databases()).length : 0 }));
    assert.deepEqual(state, { cookies: '', local: 0, session: 0, dbs: 0 });
    assert.deepEqual([...origins], ['http://127.0.0.1:4173']);
  });
} else if (tag === '@claim:offline-reload') {
  await withPage(async (page, context) => {
    await page.goto('http://127.0.0.1:4173/?demo=1', { waitUntil: 'networkidle' });
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload({ waitUntil: 'networkidle' });
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#offline-notice').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.result-header.has-drift').waitFor();
  });
}
console.log('claim passed: ' + tag);
