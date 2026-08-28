import './style.css';

type ValueType = 'empty' | 'boolean' | 'integer' | 'number' | 'url' | 'json' | 'string';
type Entry = { name: string; type: ValueType; value?: string };
type Difference = { state: 'missing' | 'extra' | 'changed' | 'resolved'; symbol: string; name: string; detail: string };
type Route = 'home' | 'demo' | 'privacy' | 'terms' | 'not-found';

const app = document.querySelector<HTMLElement>('#app')!;
const baselineSample = 'DATABASE_URL=postgres://release-db.internal/service\nNODE_ENV=production\nPUBLIC_API_ORIGIN=https://api.example.com\nPUBLIC_RELEASE_SHA=abc123\nLOG_LEVEL=info';
const candidateSample = 'DATABASE_URL=postgres://release-db.internal/service\nNODE_ENV=staging\nPUBLIC_API_URL=https://api.example.com\nPUBLIC_RELEASE_SHA=abc123\nLOG_LEVEL=1\nDEBUG=true';
const approvedNonSecrets = new Set(['NODE_ENV']);
const baseUrl = 'https://release-env-fingerprint.sociobot.in';

function demoBanner(): string {
  return '<aside class="demo-banner" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved</strong><span>Edit the sample or restore it at any time.</span><button id="reset-demo" type="button">Reset demo</button><a data-route href="/#install">Start for real</a></aside>';
}

function chrome(body: string, inDemo = false): string {
  return '<header class="site-header"><a class="brand" data-route href="/" aria-label="REFP — Release Env Fingerprint home"><svg aria-hidden="true" viewBox="0 0 36 36" width="36" height="36"><circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 21c0-8 12-8 12 0M9 18c0-12 18-12 18 0M15 24c0-4 6-4 6 0" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>REFP</span><small>0.1.0</small></a><nav aria-label="Primary navigation"><a data-route href="/#workflow">How it works</a><a class="nav-demo" data-route href="/?demo=1">Try sample</a><a data-route href="/privacy">Privacy</a><a class="nav-install" data-route href="/#install">Install the CLI</a></nav></header><div id="route-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>' + (inDemo ? demoBanner() : '') + body + '<footer><div class="footer-brand"><strong>Release Env Fingerprint</strong><span>Compare release settings without exposing secrets.</span></div><nav aria-label="Footer navigation"><a href="https://github.com/B-Divyesh/sf-release-env-fingerprint">Source on GitHub <span aria-hidden="true">↗</span></a><a data-route href="/privacy">Privacy</a><a data-route href="/terms">Terms</a></nav><p>Built by Param Factory · version 0.1.0 · build polish-1</p></footer>';
}

function demo(): string {
  return '<section class="demo-section" id="demo" aria-labelledby="demo-title"><div class="section-heading"><p class="eyebrow"><span>Bench / 03</span> Sample comparison</p><h2 id="demo-title" tabindex="-1">Compare sample environments and see five differences.</h2><p>Change either list, then compare the names, types, and approved non-secret values.</p></div><div class="offline-notice" id="offline-notice" role="status" hidden><span aria-hidden="true">↯</span> You are offline. Works offline after the first visit.</div><div class="demo-grid"><div class="input-sheet"><div class="sheet-label"><span>A</span> Trusted baseline</div><label for="baseline-input">Baseline environment</label><textarea id="baseline-input" spellcheck="false" rows="8">' + baselineSample + '</textarea></div><div class="input-sheet candidate-sheet"><div class="sheet-label"><span>B</span> Candidate release</div><label for="candidate-input">Candidate environment</label><textarea id="candidate-input" spellcheck="false" rows="8">' + candidateSample + '</textarea></div></div><div class="demo-actions"><button class="primary-button" id="compare-button" type="button">Compare fingerprints</button><p id="demo-privacy"><span aria-hidden="true">●</span> Sample data stays in this page</p></div><div class="demo-output" id="demo-output" aria-live="polite" aria-describedby="demo-privacy"></div></section>';
}

function demoPage(): string {
  return '<main id="main"><section class="demo-route-title"><p class="eyebrow"><span>Demo / 01</span> Isolated sample</p><h1 tabindex="-1">See release differences before installing.</h1><p>The completed sample is ready below. Nothing you change here is saved.</p></section>' + demo() + '</main>';
}

function home(): string {
  return '<main id="main"><section class="hero" id="top" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow"><span>Release check / 01</span> Local CLI</p><h1 id="hero-title" tabindex="-1">Compare release configuration <em>without exposing secrets.</em></h1><p class="lede">For engineers shipping one service across environments, it shows missing, extra, and changed settings before deployment.</p><div class="hero-actions"><a class="primary-button hero-button" data-route href="/?demo=1">Try it with sample data</a><p class="action-note">See five sample differences immediately.</p></div><ul class="proof-points" aria-label="Product facts"><li>Works offline after the first visit</li><li>Demo data is not saved</li><li>Free under the MIT License</li></ul></div><figure class="hero-art"><div class="registration" aria-hidden="true"><i></i><i></i><i></i></div><img src="/proof-sheet.webp" width="1200" height="800" fetchpriority="high" alt="Risograph proof sheets comparing environment rows, with one outlined missing row"/><figcaption><span>Plate A / release comparison</span><strong>Names and types, not values</strong></figcaption></figure></section><section class="section workflow" id="workflow" aria-labelledby="workflow-title"><div class="section-heading"><p class="eyebrow"><span>Method / 02</span> Three steps</p><h2 id="workflow-title">Compare configuration without storing secret values.</h2><p>Capture a fingerprint, sign it with your project key, then compare it before deployment.</p></div><ol class="steps"><li><span class="step-number">01</span><h3>Capture</h3><p>Run the environment command you choose.</p><code>refp capture … -- env -0</code></li><li><span class="step-number">02</span><h3>Sign</h3><p>Save a signed fingerprint with variable names and types.</p><code>production.refp.json</code></li><li><span class="step-number">03</span><h3>Compare</h3><p>Stop a release when the fingerprints differ.</p><code>exit 2 · difference found</code></li></ol></section><section class="sample-invite" aria-labelledby="sample-title"><div><p class="eyebrow"><span>Bench / 03</span> Ready to inspect</p><h2 id="sample-title">See the comparison before installing.</h2><p>The isolated sample opens with five differences already marked.</p></div><a class="primary-button hero-button" data-route href="/?demo=1">Try it with sample data</a></section><section class="section policies" aria-labelledby="policy-title"><div class="section-heading"><p class="eyebrow"><span>Rules / 04</span> Configuration policy</p><h2 id="policy-title">Choose the configuration rules to enforce.</h2><p>The policy lists required variables and approved non-secret values.</p></div><div class="policy-layout"><div class="code-panel" aria-label="Example policy file"><div class="code-title"><span>refp.toml</span><span>policy v1</span></div><pre tabindex="0"><code>version = 1\nrequired_names = ["DATABASE_URL"]\nrequired_prefixes = ["PUBLIC_"]\n\n[non_secret]\nnames = ["NODE_ENV"]</code></pre></div><dl class="rule-list"><div><dt>Required names</dt><dd>Require a variable by its exact name.</dd></div><div><dt>Required prefixes</dt><dd>Require at least one variable with a prefix.</dd></div><div><dt>Approved values</dt><dd>Hash only values you mark non-secret.</dd></div></dl></div></section><section class="section cli-reference" id="install" aria-labelledby="cli-title"><div class="section-heading"><p class="eyebrow"><span>Runbook / 05</span> CLI sample</p><h2 id="cli-title">Run the sample without touching project files.</h2><p><code>refp demo</code> creates an isolated temporary folder with the bundled sample.</p></div><div class="command-box"><code tabindex="0" aria-label="Scrollable install command"><span aria-hidden="true">$ </span>cargo install --git https://github.com/B-Divyesh/sf-release-env-fingerprint --bin refp</code><button class="copy-button" type="button" data-copy="cargo install --git https://github.com/B-Divyesh/sf-release-env-fingerprint --bin refp">Copy install command</button></div><div class="terminal" aria-label="Command line sample output"><div class="terminal-bar"><span></span><span></span><span></span><b>sample run</b></div><pre tabindex="0"><code><span class="prompt">$</span> refp demo\nproduction → candidate\n<span class="bad">✕ DIFFERENCES FOUND</span>\nmissing PUBLIC_API_ORIGIN · extra DEBUG\nchanged LOG_LEVEL · changed NODE_ENV\n<span class="muted">Demo files remain in a temporary folder.</span></code></pre></div></section></main>';
}

function legal(kind: 'privacy' | 'terms'): string {
  const privacy = kind === 'privacy';
  const copy = privacy
    ? '<p>This site has no analytics or third-party requests.</p><p>The browser sample uses no cookies or browser storage. Leaving demo mode discards your edits.</p><p>Fingerprints contain variable names and types. They do not contain raw environment values.</p>'
    : '<p>Release Env Fingerprint is free under the MIT License.</p><p>The software is provided without warranty. Review your policy and fingerprints before deployment.</p><p><a href="/LICENSE.txt">Read the full MIT License</a>.</p>';
  return '<main id="main" class="legal-page"><article class="legal-sheet"><p class="eyebrow"><span>' + (privacy ? 'Privacy' : 'Terms') + ' / 01</span> Release Env Fingerprint</p><h1 tabindex="-1">' + (privacy ? 'Privacy for the sample and site.' : 'Terms for Release Env Fingerprint.') + '</h1>' + copy + '</article></main>';
}

function notFound(): string {
  return '<main id="main" class="legal-page"><section class="legal-sheet not-found"><p class="eyebrow"><span>Plate / 404</span> Address not found</p><h1 tabindex="-1">This proof sheet is missing.</h1><p>The address does not match a Release Env Fingerprint page.</p><a class="primary-button hero-button" data-route href="/">Return to the release comparison</a></section></main>';
}

function routeForLocation(): Route {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/index.html') return new URLSearchParams(window.location.search).get('demo') === '1' ? 'demo' : 'home';
  if (path === '/demo') return 'demo';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  return 'not-found';
}

function setMeta(title: string, description: string, canonicalPath: string): void {
  const canonical = baseUrl + canonicalPath;
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = description;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = canonical;
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')!.content = title;
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')!.content = description;
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')!.content = canonical;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')!.content = title;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')!.content = description;
}

function routeMeta(route: Route): [string, string, string] {
  if (route === 'demo') return ['Demo — Release Env Fingerprint', 'Compare five release configuration differences in an isolated browser sample.', window.location.pathname === '/demo' ? '/demo' : '/?demo=1'];
  if (route === 'privacy') return ['Privacy — Release Env Fingerprint', 'How the site and browser sample handle data.', '/privacy'];
  if (route === 'terms') return ['Terms — Release Env Fingerprint', 'MIT License terms for Release Env Fingerprint.', '/terms'];
  if (route === 'not-found') return ['Page not found — Release Env Fingerprint', 'This Release Env Fingerprint page does not exist.', '/404'];
  return ['Release Env Fingerprint — compare release config', 'Compare release configuration without exposing secrets.', '/'];
}

function render(options: { focus?: boolean; restoreScroll?: number } = {}): void {
  const route = routeForLocation();
  if (route === 'home') app.innerHTML = chrome(home());
  else if (route === 'demo') app.innerHTML = chrome(demoPage(), true);
  else if (route === 'privacy' || route === 'terms') app.innerHTML = chrome(legal(route));
  else app.innerHTML = chrome(notFound());
  setMeta(...routeMeta(route));
  bindRoutes();
  bindCopy();
  if (route === 'demo') bindDemo();
  const announce = document.querySelector<HTMLElement>('#route-announcer');
  if (options.focus) {
    document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
    if (announce) announce.textContent = document.title;
  }
  requestAnimationFrame(() => {
    if (typeof options.restoreScroll === 'number') {
      const behavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, options.restoreScroll);
      document.documentElement.style.scrollBehavior = behavior;
    }
    else if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView({ block: 'start' });
    else if (options.focus) window.scrollTo(0, 0);
  });
}

function saveCurrentHistoryState(): void {
  history.replaceState({ ...(history.state || {}), scrollY: window.scrollY }, '', window.location.href);
}

function bindRoutes(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-route]').forEach((link) => link.addEventListener('click', (event) => {
    const url = new URL(link.href);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    saveCurrentHistoryState();
    history.pushState({ scrollY: 0 }, '', url.pathname + url.search + url.hash);
    render({ focus: true });
  }));
}

function classify(value: string | undefined): ValueType {
  if (value === undefined) return 'string';
  if (value === '') return 'empty';
  if (/^(true|false)$/i.test(value)) return 'boolean';
  if (/^-?\d+$/.test(value)) return 'integer';
  if (/^-?(?:\d+\.\d*|\d*\.\d+)$/.test(value)) return 'number';
  try { const url = new URL(value); if (url.protocol === 'http:' || url.protocol === 'https:') return 'url'; } catch { /* not a URL */ }
  try { const parsed: unknown = JSON.parse(value); if (Array.isArray(parsed) || (typeof parsed === 'object' && parsed !== null)) return 'json'; } catch { /* not JSON */ }
  return 'string';
}

function parseInput(value: string, label: string): Map<string, Entry> {
  const entries = new Map<string, Entry>();
  value.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    const separator = line.indexOf('=');
    const name = (separator < 0 ? line : line.slice(0, separator)).trim();
    const resolved = separator < 0 ? undefined : line.slice(separator + 1);
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error(`${label}, line ${index + 1}: “${name || raw}” is not a valid variable name.`);
    if (entries.has(name)) throw new Error(`${label}, line ${index + 1}: ${name} appears more than once.`);
    entries.set(name, { name, type: classify(resolved), value: resolved });
  });
  return entries;
}

function make<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, content?: string): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = content;
  return element;
}

function showError(output: HTMLElement, message: string): void {
  const box = make('div', 'error-result');
  box.id = 'comparison-error';
  box.setAttribute('role', 'alert');
  box.append(make('strong', '', 'Comparison could not run.'), make('p', '', message), make('p', '', 'Fix the named line, then compare again.'));
  output.replaceChildren(box);
}

function addResult(list: HTMLElement, item: Difference): void {
  const row = make('li', `result-row ${item.state}`);
  const badge = make('span', 'result-symbol', item.symbol);
  badge.setAttribute('aria-hidden', 'true');
  row.append(badge, make('code', '', item.name), make('span', '', item.detail));
  list.append(row);
}

function differences(baseline: Map<string, Entry>, candidate: Map<string, Entry>): Difference[] {
  const rows: Difference[] = [];
  baseline.forEach((entry, name) => {
    const next = candidate.get(name);
    if (!next) rows.push({ state: 'missing', symbol: '−', name, detail: 'Missing from candidate' });
    else if (entry.type !== next.type) rows.push({ state: 'changed', symbol: '~', name, detail: `${entry.type} → ${next.type}` });
    else if (approvedNonSecrets.has(name) && entry.value !== undefined && next.value !== undefined && entry.value !== next.value) rows.push({ state: 'resolved', symbol: '≈', name, detail: 'Approved non-secret value differs' });
  });
  candidate.forEach((_entry, name) => { if (!baseline.has(name)) rows.push({ state: 'extra', symbol: '+', name, detail: 'Extra in candidate' }); });
  return rows;
}

function compareInputs(baselineInput: HTMLTextAreaElement, candidateInput: HTMLTextAreaElement, output: HTMLElement, button: HTMLButtonElement): void {
  baselineInput.removeAttribute('aria-invalid');
  candidateInput.removeAttribute('aria-invalid');
  baselineInput.removeAttribute('aria-describedby');
  candidateInput.removeAttribute('aria-describedby');
  button.disabled = true;
  button.textContent = 'Comparing…';
  requestAnimationFrame(() => {
    try {
      const baseline = parseInput(baselineInput.value, 'Baseline');
      const candidate = parseInput(candidateInput.value, 'Candidate');
      if (!baseline.size || !candidate.size) {
        const target = !baseline.size ? baselineInput : candidateInput;
        target.setAttribute('aria-invalid', 'true');
        target.setAttribute('aria-describedby', 'comparison-error');
        showError(output, `${!baseline.size ? 'Baseline' : 'Candidate'} needs at least one NAME or NAME=value row.`);
        target.focus();
        return;
      }
      const rows = differences(baseline, candidate);
      const header = make('div', `result-header ${rows.length ? 'has-drift' : 'is-match'}`);
      header.append(make('strong', '', rows.length ? '✕ Differences found' : '✓ Fingerprints match'), make('span', '', `${baseline.size} baseline / ${candidate.size} candidate / ${rows.length} differences`));
      output.replaceChildren(header);
      if (rows.length) {
        const list = make('ul', 'result-list');
        rows.forEach((item) => addResult(list, item));
        output.append(list);
      } else output.append(make('p', 'match-copy', 'The variable names, types, and approved non-secret values match.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The environment list could not be parsed.';
      const target = message.startsWith('Candidate') ? candidateInput : baselineInput;
      target.setAttribute('aria-invalid', 'true');
      target.setAttribute('aria-describedby', 'comparison-error');
      showError(output, message);
      target.focus();
    } finally {
      button.disabled = false;
      button.textContent = 'Compare fingerprints';
    }
  });
}

function bindDemo(): void {
  const baseline = document.querySelector<HTMLTextAreaElement>('#baseline-input');
  const candidate = document.querySelector<HTMLTextAreaElement>('#candidate-input');
  const output = document.querySelector<HTMLElement>('#demo-output');
  const button = document.querySelector<HTMLButtonElement>('#compare-button');
  const offline = document.querySelector<HTMLElement>('#offline-notice');
  if (!baseline || !candidate || !output || !button || !offline) return;
  const updateConnection = () => { offline.hidden = navigator.onLine; };
  updateConnection();
  window.addEventListener('online', updateConnection, { once: true });
  window.addEventListener('offline', updateConnection, { once: true });
  button.addEventListener('click', () => compareInputs(baseline, candidate, output, button));
  document.querySelector('#reset-demo')?.addEventListener('click', () => {
    baseline.value = baselineSample;
    candidate.value = candidateSample;
    compareInputs(baseline, candidate, output, button);
    document.querySelector<HTMLElement>('#demo-title')?.focus({ preventScroll: true });
  });
  compareInputs(baseline, candidate, output, button);
}

function bindCopy(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy || '');
      button.textContent = 'Install command copied';
      window.setTimeout(() => { button.textContent = 'Copy install command'; }, 1800);
    } catch {
      button.textContent = 'Select install command';
      const code = button.previousElementSibling;
      if (code) window.getSelection()?.selectAllChildren(code);
    }
  }));
}

if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => undefined); });
history.scrollRestoration = 'manual';
history.replaceState({ scrollY: window.scrollY }, '', window.location.href);
window.addEventListener('popstate', (event) => render({ focus: true, restoreScroll: typeof event.state?.scrollY === 'number' ? event.state.scrollY : 0 }));
render();
