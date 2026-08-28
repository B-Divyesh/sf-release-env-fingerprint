import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtemp, readFile, readdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const tag = process.argv[2];
const claims = JSON.parse(await readFile('.factory/claims.json', 'utf8'));
const known = new Set(claims.map((claim) => `@claim:${claim.id}`));
if (!known.has(tag)) throw new Error('unknown claim tag: ' + tag);
const origin = 'http://127.0.0.1:4173';

function cargo(filter) {
  execFileSync('cargo', ['test', '--workspace', filter, '--', '--exact'], { stdio: 'inherit' });
}

function buildSite() {
  execFileSync('npm', ['run', 'build:site'], { stdio: 'inherit' });
}

function demoJson(options = {}) {
  execFileSync('cargo', ['build', '--quiet', '--manifest-path', 'cli/Cargo.toml']);
  const binary = resolve('target/debug/refp');
  try {
    execFileSync(binary, ['--json', 'demo'], { encoding: 'utf8', stdio: 'pipe', ...options });
    assert.fail('demo should return exit 2');
  } catch (error) {
    assert.equal(error.status, 2);
    return JSON.parse(String(error.stdout));
  }
}

async function withPage(action) {
  buildSite();
  const server = spawn(process.execPath, ['site/serve-dist.mjs'], { stdio: 'ignore' });
  try {
    let started = false;
    for (let i = 0; i < 60; i += 1) {
      try { if ((await fetch(origin)).ok) { started = true; break; } } catch { /* wait */ }
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
    }
    assert.equal(started, true, 'static server did not start');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    try { await action(await context.newPage(), context); } finally { await browser.close(); }
  } finally { server.kill('SIGTERM'); }
}

if (tag === '@claim:detect-config-differences') {
  cargo('tests::detects_shape_type_and_allowlisted_value_drift');
} else if (tag === '@claim:sample-differences') {
  await withPage(async (page) => {
    await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });
    await page.locator('.result-header').filter({ hasText: '5 differences' }).waitFor();
    assert.deepEqual(await page.locator('.result-row code').allTextContents(), ['NODE_ENV', 'PUBLIC_API_ORIGIN', 'LOG_LEVEL', 'PUBLIC_API_URL', 'DEBUG']);
    await page.locator('#candidate-input').fill(await page.locator('#baseline-input').inputValue());
    await page.locator('#compare-button').click();
    await page.locator('.result-header.is-match').waitFor();
    assert.match(await page.locator('.result-header').innerText(), /0 differences/);
  });
} else if (tag === '@claim:signed-fingerprints') {
  cargo('tests::rejects_tampered_fingerprint');
} else if (tag === '@claim:no-raw-values') {
  cargo('documented_capture_and_compare_flow_detects_drift_and_never_writes_values');
} else if (tag === '@claim:browser-demo-private') {
  await withPage(async (page) => {
    const requests = [];
    page.on('request', (request) => requests.push(new URL(request.url())));
    await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });
    const beforeInteraction = requests.length;
    await page.locator('#baseline-input').fill('PRIVATE_SENTINEL=do-not-store');
    await page.locator('#candidate-input').fill('PRIVATE_SENTINEL=do-not-store');
    await page.locator('#compare-button').click();
    await page.locator('.result-header.is-match').waitFor();
    const state = await page.evaluate(async () => ({ cookies: document.cookie, local: localStorage.length, session: sessionStorage.length, dbs: 'databases' in indexedDB ? (await indexedDB.databases()).length : 0 }));
    assert.deepEqual(state, { cookies: '', local: 0, session: 0, dbs: 0 });
    assert.equal(requests.length, beforeInteraction, 'comparison made a network request');
    assert.ok(requests.every((url) => url.origin === origin), 'third-party request');
    const staticPath = /^(?:\/$|\/demo\/$|\/privacy\/$|\/terms\/$|\/assets\/[^/]+\.(?:css|js)$|\/(?:sw\.js|proof-sheet\.webp|fingerprint\.svg|manifest\.webmanifest))$/;
    assert.ok(requests.every((url) => staticPath.test(url.pathname)), `unexpected request: ${requests.map((url) => url.pathname).join(', ')}`);
    await page.getByRole('link', { name: 'Start for real' }).click();
    assert.equal((await page.locator('body').innerText()).includes('do-not-store'), false);
  });
} else if (tag === '@claim:offline-reload') {
  await withPage(async (page, context) => {
    await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload({ waitUntil: 'networkidle' });
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#offline-notice').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.result-header').filter({ hasText: '5 differences' }).waitFor();
  });
} else if (tag === '@claim:mit-license') {
  assert.match(await readFile('LICENSE', 'utf8'), /MIT License/);
  buildSite();
  assert.equal(await readFile('dist/site/LICENSE.txt', 'utf8'), await readFile('LICENSE', 'utf8'));
} else if (tag === '@claim:cli-demo-isolated') {
  const watched = await mkdtemp(join(tmpdir(), 'refp-claim-cwd-'));
  const before = await readdir(watched);
  const document = demoJson({ cwd: watched });
  assert.deepEqual(await readdir(watched), before, 'demo changed the working directory');
  assert.equal(document.demo, true);
  assert.ok(document.directory.startsWith(tmpdir()), document.directory);
  assert.notEqual(document.directory, watched);
  assert.deepEqual((await readdir(document.directory)).sort(), ['baseline.env', 'baseline.refp.json', 'candidate.env', 'candidate.refp.json', 'demo.key', 'refp.toml']);
  for (const name of ['baseline.refp.json', 'candidate.refp.json']) {
    const fingerprint = JSON.parse(await readFile(join(document.directory, name), 'utf8'));
    assert.ok(fingerprint.signature);
  }
} else if (tag === '@claim:exit-2-difference') {
  const document = demoJson();
  assert.equal(document.exit_code, 2);
  const count = document.report.missing.length + document.report.extra.length + document.report.type_changed.length + document.report.resolved_changed.length;
  assert.equal(count, 5);
} else if (tag === '@claim:required-rules') {
  cargo('tests::enforces_required_names_and_prefixes');
} else if (tag === '@claim:host-rules') {
  cargo('tests::matches_exact_and_subdomain_hosts_without_recording_urls');
} else if (tag === '@claim:approved-value-hashes') {
  cargo('tests::keys_change_approved_hashes_and_secrets_have_no_hash');
} else if (tag === '@claim:fingerprint-schema') {
  cargo('tests::fingerprint_schema_contains_names_types_and_signature');
} else if (tag === '@claim:json-output') {
  cargo('demo_json_is_one_document_and_uses_real_signed_files');
} else if (tag === '@claim:direct-command') {
  cargo('capture_executes_arguments_without_shell_expansion');
} else if (tag === '@claim:repository-install') {
  const installRoot = await mkdtemp(join(tmpdir(), 'refp-install-'));
  execFileSync('cargo', ['install', '--path', 'cli', '--root', installRoot, '--locked'], { stdio: 'inherit' });
  assert.deepEqual(await readdir(join(installRoot, 'bin')), ['refp']);
  const help = execFileSync(join(installRoot, 'bin/refp'), ['--help'], { encoding: 'utf8' });
  assert.match(help, /Usage: refp/);
  assert.match(help, /demo\s+Run an isolated comparison/);
} else if (tag === '@claim:build-artifacts') {
  execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
  assert.equal((await stat('target/release/refp')).isFile(), true);
  assert.equal((await stat('dist/site/index.html')).isFile(), true);
}

console.log('claim passed: ' + tag);
