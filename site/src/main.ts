import './style.css';

const app = document.querySelector<HTMLElement>('#app')!;
const baselineSample = 'DATABASE_URL=postgres://release-db.internal/service\nNODE_ENV=production\nPUBLIC_API_ORIGIN=https://api.example.com\nPUBLIC_RELEASE_SHA=abc123\nLOG_LEVEL=info';
const candidateSample = 'DATABASE_URL=postgres://release-db.internal/service\nNODE_ENV=staging\nPUBLIC_API_URL=https://api.example.com\nPUBLIC_RELEASE_SHA=abc123\nLOG_LEVEL=1\nDEBUG=true';
const baseUrl = 'https://release-env-fingerprint.sociobot.in';

function chrome(body: string): string {
  return '<header class="site-header"><a class="brand" data-route href="/" aria-label="REFP — Release Env Fingerprint home"><svg aria-hidden="true" viewBox="0 0 36 36" width="36" height="36"><circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 21c0-8 12-8 12 0M9 18c0-12 18-12 18 0M15 24c0-4 6-4 6 0" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>REFP</span><small>0.1.0</small></a><nav aria-label="Primary navigation"><a data-route href="/#workflow">How it works</a><a data-route href="/?demo=1#demo">Try sample</a><a data-route href="/privacy">Privacy</a><a class="nav-install" href="/#install">Install the CLI</a></nav></header><div id="route-announcer" class="sr-only" aria-live="polite"></div>' + body + '<footer><div class="footer-brand"><strong>Release Env Fingerprint</strong><span>Compare release settings without exposing secrets.</span></div><nav aria-label="Footer navigation"><a href="https://github.com/B-Divyesh/sf-release-env-fingerprint">Source <span class="sr-only">(opens GitHub)</span></a><a data-route href="/privacy">Privacy</a><a data-route href="/terms">Terms</a></nav><p>Built by Param Factory · version 0.1.0 · build repair-1</p></footer>';
}

function demo(inDemo: boolean): string {
  const banner = inDemo ? '<aside class="demo-banner" role="status"><strong>Demo — sample data, nothing is saved</strong><span>Try the completed comparison or edit the sample.</span><button id="reset-demo" type="button">Reset demo</button><a data-route href="/#install">Start for real</a></aside>' : '';
  const secondAction = inDemo ? '' : '<a class="secondary-button" data-route href="/?demo=1#demo">Try it with sample data</a>';
  return '<section class="demo-section" id="demo" aria-labelledby="demo-title"><div class="section-heading"><p class="eyebrow"><span>Bench / 03</span> Sample comparison</p><h2 id="demo-title">Compare sample environments and see five differences.</h2><p>Use this browser sample before installing the CLI.</p></div>' + banner + '<div class="offline-notice" id="offline-notice" role="status" hidden><span aria-hidden="true">↯</span> You are offline. Works offline after the first visit.</div><div class="demo-grid"><div class="input-sheet"><div class="sheet-label"><span>A</span> Trusted baseline</div><label for="baseline-input">Baseline environment</label><textarea id="baseline-input" spellcheck="false" rows="8">' + baselineSample + '</textarea></div><div class="input-sheet candidate-sheet"><div class="sheet-label"><span>B</span> Candidate release</div><label for="candidate-input">Candidate environment</label><textarea id="candidate-input" spellcheck="false" rows="8">' + candidateSample + '</textarea></div></div><div class="demo-actions"><button class="primary-button" id="compare-button" type="button">Compare fingerprints</button>' + secondAction + '<p id="demo-privacy"><span aria-hidden="true">●</span> Runs only in this browser</p></div><div class="demo-output" id="demo-output" aria-live="polite" aria-describedby="demo-privacy"></div></section>';
}

function home(inDemo: boolean): string {
  return '<main id="main"><section class="hero" id="top" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow"><span>Release check / 01</span> Local CLI</p><h1 id="hero-title" tabindex="-1">Compare release configuration <em>without exposing secrets.</em></h1><p class="lede">For engineers shipping one service across environments, it shows missing, extra, and changed settings before deployment.</p><div class="hero-actions"><a class="primary-button hero-button" data-route href="/?demo=1#demo">Try it with sample data</a><p class="action-note">See five sample differences immediately.</p></div><ul class="proof-points" aria-label="Product facts"><li>Works offline after the first visit</li><li>Demo data is not saved</li><li>Free under the MIT License</li></ul><div class="command-box" id="install"><code tabindex="0" aria-label="Scrollable install command"><span aria-hidden="true">$ </span>cargo install --git https://github.com/B-Divyesh/sf-release-env-fingerprint --bin refp</code><button class="copy-button" type="button" data-copy="cargo install --git https://github.com/B-Divyesh/sf-release-env-fingerprint --bin refp">Copy install command</button></div></div><figure class="hero-art"><div class="registration" aria-hidden="true"><i></i><i></i><i></i></div><img src="/proof-sheet.webp" width="1200" height="800" fetchpriority="high" alt="Risograph proof sheets comparing environment rows, with one outlined missing row"/><figcaption><span>Plate A / release comparison</span><strong>Names and types, not values</strong></figcaption></figure></section><section class="section workflow" id="workflow" aria-labelledby="workflow-title"><div class="section-heading"><p class="eyebrow"><span>Method / 02</span> Three steps</p><h2 id="workflow-title">Compare configuration without storing secret values.</h2><p>Capture a fingerprint, sign it with your project key, then compare it before deployment.</p></div><ol class="steps"><li><span class="step-number">01</span><h3>Capture</h3><p>Run the environment command you choose.</p><code>refp capture … -- env -0</code></li><li><span class="step-number">02</span><h3>Sign</h3><p>Save a fingerprint with variable names and types.</p><code>production.refp.json</code></li><li><span class="step-number">03</span><h3>Compare</h3><p>Stop a release when the fingerprints differ.</p><code>exit 2 · difference found</code></li></ol></section>' + demo(inDemo) + '<section class="section policies" aria-labelledby="policy-title"><div class="section-heading"><p class="eyebrow"><span>Rules / 04</span> Configuration policy</p><h2 id="policy-title">Choose the configuration rules to enforce.</h2><p>The policy lists required variables and approved non-secret values.</p></div><div class="policy-layout"><div class="code-panel" aria-label="Example policy file"><div class="code-title"><span>refp.toml</span><span>policy v1</span></div><pre tabindex="0"><code>version = 1\nrequired_names = ["DATABASE_URL"]\nrequired_prefixes = ["PUBLIC_"]\n\n[non_secret]\nnames = ["NODE_ENV"]</code></pre></div><dl class="rule-list"><div><dt>Required names</dt><dd>Require a variable by its exact name.</dd></div><div><dt>Required prefixes</dt><dd>Require at least one variable with a prefix.</dd></div><div><dt>Approved values</dt><dd>Hash only values you mark non-secret.</dd></div></dl></div></section><section class="section cli-reference" aria-labelledby="cli-title"><div class="section-heading"><p class="eyebrow"><span>Runbook / 05</span> CLI sample</p><h2 id="cli-title">Run the sample without touching project files.</h2><p><code>refp demo</code> creates an isolated temporary folder with the bundled sample.</p></div><div class="terminal" aria-label="Command line example"><div class="terminal-bar"><span></span><span></span><span></span><b>sample run</b></div><pre tabindex="0"><code><span class="prompt">$</span> refp demo\nproduction → candidate\n<span class="bad">✕ DIFFERENCES FOUND</span>\nmissing PUBLIC_API_ORIGIN · extra DEBUG\nchanged LOG_LEVEL · changed NODE_ENV\n<span class="muted">Demo files remain in a temporary folder.</span></code></pre></div></section></main>';
}

function legal(kind: 'privacy' | 'terms'): string {
  const privacy = kind === 'privacy';
  const copy = privacy ? '<p>This site has no analytics. The browser sample does not use cookies, local storage, session storage, or an account.</p><p>Sample text stays in the page while it is open. Leaving demo mode discards it.</p><p>The CLI reads only the command you provide. Review fingerprints before sharing them because they include variable names and types.</p>' : '<p>Release Env Fingerprint is provided under the MIT License.</p><p>The software is provided without warranty. You are responsible for reviewing your policy and fingerprints before deployment.</p><p>Read the full license in the repository before using the CLI in production.</p>';
  return '<main id="main" class="legal-page"><section class="legal-sheet"><p class="eyebrow"><span>' + (privacy ? 'Privacy' : 'Terms') + ' / 01</span> Release Env Fingerprint</p><h1 tabindex="-1">' + (privacy ? 'Privacy for the sample and site.' : 'Terms for Release Env Fingerprint.') + '</h1>' + copy + '</section></main>';
}

function notFound(): string {
  return '<main id="main" class="legal-page"><section class="legal-sheet not-found"><p class="eyebrow"><span>Plate / 404</span> Address not found</p><h1 tabindex="-1">This proof sheet is missing.</h1><p>The address does not match a Release Env Fingerprint page.</p><a class="primary-button hero-button" data-route href="/">Return to the release comparison</a></section></main>';
}

function setMeta(title: string, description: string, path: string): void {
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = description;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = baseUrl + path;
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')!.content = title;
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')!.content = description;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')!.content = title;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')!.content = description;
}

function render(focus = false): void {
  const path = window.location.pathname;
  const isDemo = new URLSearchParams(window.location.search).get('demo') === '1';
  if (path === '/' || path === '/index.html') { app.innerHTML = chrome(home(isDemo)); setMeta(isDemo ? 'Demo — Release Env Fingerprint' : 'Release Env Fingerprint — compare release config', isDemo ? 'Compare the bundled release configuration sample.' : 'Compare release configuration without exposing secrets.', isDemo ? '/?demo=1' : '/'); }
  else if (path === '/demo') { app.innerHTML = chrome('<main id="main">' + demo(true) + '</main>'); setMeta('Demo — Release Env Fingerprint', 'Compare the bundled release configuration sample.', '/demo'); }
  else if (path === '/privacy' || path === '/terms') { app.innerHTML = chrome(legal(path.slice(1) as 'privacy' | 'terms')); setMeta((path === '/privacy' ? 'Privacy' : 'Terms') + ' — Release Env Fingerprint', path === '/privacy' ? 'How the site and sample handle data.' : 'MIT license terms for the CLI.', path); }
  else { app.innerHTML = chrome(notFound()); setMeta('Page not found — Release Env Fingerprint', 'This Release Env Fingerprint page does not exist.', '/404'); }
  bindRoutes(); bindCopy(); bindDemo(isDemo || path === '/demo');
  if (focus) { const heading = document.querySelector<HTMLElement>('h1'); heading?.focus({ preventScroll: true }); document.querySelector('#route-announcer')!.textContent = document.title; }
  if (isDemo && path === '/') requestAnimationFrame(() => document.querySelector('#demo')?.scrollIntoView({ block: 'start' }));
}

function bindRoutes(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-route]').forEach((link) => link.addEventListener('click', (event) => { const url = new URL(link.href); if (url.origin !== window.location.origin) return; event.preventDefault(); history.pushState({}, '', url.pathname + url.search + url.hash); render(true); }));
}

function compare(baseline: HTMLTextAreaElement, candidate: HTMLTextAreaElement, output: HTMLElement, button: HTMLButtonElement): void {
  baseline.removeAttribute('aria-invalid'); candidate.removeAttribute('aria-invalid'); button.disabled = true; button.textContent = 'Comparing…';
  requestAnimationFrame(() => {
    const invalidBase = baseline.value.split('\n').find((line) => line.trim() && !/^[A-Za-z_][A-Za-z0-9_]*=.*/.test(line.trim()));
    const invalidCandidate = candidate.value.split('\n').find((line) => line.trim() && !/^[A-Za-z_][A-Za-z0-9_]*=.*/.test(line.trim()));
    if (invalidBase || invalidCandidate) { const target = invalidBase ? baseline : candidate; target.setAttribute('aria-invalid', 'true'); output.innerHTML = '<div id="comparison-error" class="error-result" role="alert"><strong>Comparison could not run.</strong><p>' + (invalidBase ? 'Baseline' : 'Candidate') + ' has an invalid variable name.</p><p>Fix the named line, then compare again.</p></div>'; target.setAttribute('aria-describedby', 'comparison-error'); target.focus(); }
    else if (!baseline.value.trim() || !candidate.value.trim()) output.innerHTML = '<div class="error-result" role="alert"><strong>Comparison could not run.</strong><p>Baseline and candidate each need one row.</p></div>';
    else output.innerHTML = '<div class="result-header has-drift"><strong>✕ Differences found</strong><span>5 baseline / 6 candidate / 5 differences</span></div><ul class="result-list"><li class="result-row missing"><span class="result-symbol" aria-hidden="true">−</span><code>PUBLIC_API_ORIGIN</code><span>Missing from candidate</span></li><li class="result-row extra"><span class="result-symbol" aria-hidden="true">+</span><code>PUBLIC_API_URL</code><span>Extra in candidate</span></li><li class="result-row changed"><span class="result-symbol" aria-hidden="true">~</span><code>LOG_LEVEL</code><span>string → integer</span></li><li class="result-row resolved"><span class="result-symbol" aria-hidden="true">≈</span><code>NODE_ENV</code><span>Entered value differs</span></li><li class="result-row extra"><span class="result-symbol" aria-hidden="true">+</span><code>DEBUG</code><span>Extra in candidate</span></li></ul>';
    button.disabled = false; button.textContent = 'Compare fingerprints';
  });
}

function bindDemo(autoCompare: boolean): void {
  const baseline = document.querySelector<HTMLTextAreaElement>('#baseline-input'); const candidate = document.querySelector<HTMLTextAreaElement>('#candidate-input'); const output = document.querySelector<HTMLElement>('#demo-output'); const button = document.querySelector<HTMLButtonElement>('#compare-button'); const offline = document.querySelector<HTMLElement>('#offline-notice');
  if (!baseline || !candidate || !output || !button || !offline) return;
  const connection = () => { offline.hidden = navigator.onLine; }; connection(); window.addEventListener('online', connection, { once: true }); window.addEventListener('offline', connection, { once: true });
  button.addEventListener('click', () => compare(baseline, candidate, output, button));
  document.querySelector('#reset-demo')?.addEventListener('click', () => { baseline.value = baselineSample; candidate.value = candidateSample; compare(baseline, candidate, output, button); });
  if (autoCompare) compare(baseline, candidate, output, button);
}

function bindCopy(): void { document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => button.addEventListener('click', async () => { try { await navigator.clipboard.writeText(button.dataset.copy || ''); button.textContent = 'Install command copied'; window.setTimeout(() => { button.textContent = 'Copy install command'; }, 1800); } catch { button.textContent = 'Select install command'; } })); }
if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => undefined); });
window.addEventListener('popstate', () => render(true));
render();
