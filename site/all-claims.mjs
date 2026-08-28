import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const claims = JSON.parse(await readFile('.factory/claims.json', 'utf8'));
for (const claim of claims) {
  const tag = `@claim:${claim.id}`;
  console.log(`\n=== ${tag} ===`);
  const result = spawnSync('npm', ['run', 'test:claims', '--', tag], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`\nAll ${claims.length} claim tests passed.`);
