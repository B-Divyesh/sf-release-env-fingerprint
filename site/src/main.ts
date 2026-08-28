import './style.css';

type ValueType = 'empty' | 'boolean' | 'integer' | 'number' | 'url' | 'json' | 'string';
type Entry = { name: string; type: ValueType; value?: string };

const baselineInput = document.querySelector<HTMLTextAreaElement>('#baseline-input')!;
const candidateInput = document.querySelector<HTMLTextAreaElement>('#candidate-input')!;
const output = document.querySelector<HTMLDivElement>('#demo-output')!;
const compareButton = document.querySelector<HTMLButtonElement>('#compare-button')!;
const clearButton = document.querySelector<HTMLButtonElement>('#clear-button')!;
const offlineNotice = document.querySelector<HTMLElement>('#offline-notice')!;

function classify(value: string | undefined): ValueType {
  if (value === undefined) return 'string';
  if (value === '') return 'empty';
  if (/^(true|false)$/i.test(value)) return 'boolean';
  if (/^-?\d+$/.test(value)) return 'integer';
  if (/^-?(?:\d+\.\d*|\d*\.\d+)$/.test(value)) return 'number';
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') return 'url';
  } catch { /* not a URL */ }
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) || (typeof parsed === 'object' && parsed !== null)) return 'json';
  } catch { /* not JSON */ }
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
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      throw new Error(`${label}, line ${index + 1}: “${name || raw}” is not a valid variable name.`);
    }
    if (entries.has(name)) {
      throw new Error(`${label}, line ${index + 1}: ${name} appears more than once.`);
    }
    entries.set(name, { name, type: classify(resolved), value: resolved });
  });
  return entries;
}

function make(tag: string, className?: string, text?: string): HTMLElement {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function showEmpty(): void {
  output.replaceChildren();
  const empty = make('div', 'empty-result');
  const mark = make('span', '', '◎');
  mark.setAttribute('aria-hidden', 'true');
  const text = make('p');
  const strong = make('strong', '', 'Nothing to compare.');
  text.append(strong, ' Add at least one NAME or NAME=value row to each environment.');
  empty.append(mark, text);
  output.append(empty);
}

function showError(message: string): void {
  output.replaceChildren();
  const box = make('div', 'error-result');
  box.setAttribute('role', 'alert');
  const title = make('strong', '', 'Comparison could not run.');
  box.append(title, make('p', '', message), make('p', '', 'Fix the marked list and compare again.'));
  output.append(box);
}

function addResult(list: HTMLElement, state: string, symbol: string, name: string, detail: string): void {
  const row = make('li', `result-row ${state}`);
  const badge = make('span', 'result-symbol', symbol);
  badge.setAttribute('aria-hidden', 'true');
  const key = make('code', '', name);
  const note = make('span', '', detail);
  row.append(badge, key, note);
  list.append(row);
}

function compareInputs(): void {
  const restoreFocus = document.activeElement === compareButton;
  compareButton.disabled = true;
  compareButton.textContent = 'Comparing…';
  requestAnimationFrame(() => {
    try {
      const baseline = parseInput(baselineInput.value, 'Baseline');
      const candidate = parseInput(candidateInput.value, 'Candidate');
      if (baseline.size === 0 || candidate.size === 0) {
        showEmpty();
        return;
      }
      const rows: Array<[string, string, string, string]> = [];
      baseline.forEach((entry, name) => {
        const next = candidate.get(name);
        if (!next) rows.push(['missing', '−', name, 'Missing from candidate']);
        else if (entry.type !== next.type) rows.push(['changed', '~', name, `${entry.type} → ${next.type}`]);
        else if (entry.value !== undefined && next.value !== undefined && entry.value !== next.value) {
          rows.push(['resolved', '≈', name, 'Resolved value differs · CLI hashes only when allowlisted']);
        }
      });
      candidate.forEach((_entry, name) => {
        if (!baseline.has(name)) rows.push(['extra', '+', name, 'Extra in candidate']);
      });

      output.replaceChildren();
      const header = make('div', `result-header ${rows.length ? 'has-drift' : 'is-match'}`);
      header.append(
        make('strong', '', rows.length ? '✕ Drift detected' : '✓ Fingerprints match'),
        make('span', '', `${baseline.size} baseline / ${candidate.size} candidate / ${rows.length} differences`)
      );
      output.append(header);
      if (rows.length) {
        const list = make('ul', 'result-list');
        rows.forEach(([state, symbol, name, detail]) => addResult(list, state, symbol, name, detail));
        output.append(list);
      } else {
        output.append(make('p', 'match-copy', 'The names, inferred types, and entered demo values align. Run the signed CLI to enforce this in CI.'));
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'The environment list could not be parsed.');
    } finally {
      compareButton.disabled = false;
      compareButton.textContent = 'Compare fingerprints';
      if (restoreFocus) compareButton.focus({ preventScroll: true });
    }
  });
}

compareButton.addEventListener('click', compareInputs);
clearButton.addEventListener('click', () => {
  baselineInput.value = '';
  candidateInput.value = '';
  showEmpty();
  baselineInput.focus();
});

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const command = button.dataset.copy ?? '';
    try {
      await navigator.clipboard.writeText(command);
      button.textContent = 'Copied';
      window.setTimeout(() => { button.textContent = 'Copy'; }, 1800);
    } catch {
      button.textContent = 'Select text';
      const code = button.previousElementSibling;
      if (code) window.getSelection()?.selectAllChildren(code);
    }
  });
});

function updateConnection(): void {
  offlineNotice.hidden = navigator.onLine;
}
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // The product remains functional without an offline cache.
    });
  });
}
