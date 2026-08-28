import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, rm, writeFile } from 'node:fs/promises';

const command = spawnSync('cargo', ['run', '--quiet', '--manifest-path', 'cli/Cargo.toml', '--', 'demo'], {
  encoding: 'utf8'
});
assert.equal(command.status, 2, `refp demo exited ${command.status}: ${command.stderr}`);

const directory = command.stdout.match(/Demo files remain at (.+)/)?.[1];
assert.ok(directory, 'refp demo did not print its temporary directory');
const transcript = `$ refp demo\n${command.stdout}`
  .replace(directory, '<temporary folder>')
  .trim()
  .split('\n');
await rm(directory, { recursive: true, force: true });

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');
const rows = transcript.map((line, index) => {
  const className = line.startsWith('✕') || line.startsWith('-') ? 'bad' : line.startsWith('+') ? 'extra' : line.startsWith('~') ? 'changed' : index === 0 ? 'prompt' : 'line';
  return `  <text class="entry ${className} e${index}" x="54" y="${96 + index * 50}">${escapeXml(line)}</text>`;
}).join('\n');
const delays = transcript.map((_, index) => `.e${index}{animation-delay:${index * 420}ms}`).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">refp demo terminal recording</title>
  <desc id="desc">The real command compares production and candidate fingerprints, finds five differences, and writes only to a temporary folder.</desc>
  <style>
    .entry{font:24px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;fill:#f7efdc;opacity:0;animation:reveal .01s linear forwards}.prompt{fill:#80bf8a}.bad{fill:#ff8374}.extra{fill:#9fd2d8}.changed{fill:#efb763}${delays}
    @keyframes reveal{to{opacity:1}}
    @media(prefers-reduced-motion:reduce){.entry{opacity:1;animation:none}}
  </style>
  <rect width="1200" height="630" fill="#20221f"/>
  <rect x="1" y="1" width="1198" height="628" fill="none" stroke="#191a18" stroke-width="2"/>
  <rect width="1200" height="54" fill="#191a18"/>
  <circle cx="28" cy="27" r="7" fill="#d14b3d"/><circle cx="52" cy="27" r="7" fill="#d58c28"/><circle cx="76" cy="27" r="7" fill="#5b985f"/>
  <text x="1140" y="34" text-anchor="end" fill="#b8baae" font-family="ui-monospace,monospace" font-size="16">REAL CLI · SAMPLE RUN</text>
${rows}
</svg>
`;

const output = new URL('public/refp-demo.svg', import.meta.url);
if (process.argv.includes('--check')) {
  assert.equal(await readFile(output, 'utf8'), svg, 'terminal recording is stale; run npm run record:demo');
  console.log('terminal recording matches the current refp demo output');
} else {
  await writeFile(output, svg);
  console.log('wrote site/public/refp-demo.svg from refp demo');
}
