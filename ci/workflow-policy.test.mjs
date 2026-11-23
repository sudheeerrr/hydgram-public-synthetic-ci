import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/public-synthetic-ci.yml', import.meta.url),'utf8');
const digest = 'sha256:5e73baf8179b29f115101bb102763a47a017361f3e9792daccba6646c3ab1532';
test('workflow is manual-only and GitHub token read-only', () => {
  assert.match(workflow,/^on:\s*\n  workflow_dispatch:\s*$/m);
  assert.match(workflow,/^permissions:\s*\n  contents: read\s*$/m);
  assert.doesNotMatch(workflow,/^\s+(?:push|pull_request|schedule|workflow_run):/m);
  assert.doesNotMatch(workflow,/\b(?:secrets\.|repository_dispatch|pull_request_target|id-token: write)\b/i);
});
test('reviewed official runner actions use immutable Git commit references', () => {
  const uses=[...workflow.matchAll(/^\s+-?\s*uses:\s*(\S+)/gm)].map(m=>m[1]);
  assert.equal(uses.length,2);
  for(const ref of uses) assert.match(ref,/^actions\/(?:checkout|setup-node)@[a-f0-9]{40}$/);
});
test('MariaDB official image index pinned and mapped to loopback only', () => {
  assert.ok(workflow.includes('docker.io/library/mariadb:11.4.13-noble@'+digest));
  assert.match(workflow,/127\.0\.0\.1:33306:3306/);
  assert.doesNotMatch(workflow,/\simage:\s*mariadb:11\.4\s*$/m);
});
test('workflow performs synthetic tests only and has no artifact uploads or deployments', () => {
  assert.match(workflow,/run: npm run check:publication/);
  assert.match(workflow,/run: npm test/);
  assert.match(workflow,/run: npm run check:database/);
  assert.match(workflow,/run: npm run check:browser/);
  assert.doesNotMatch(workflow,/upload-artifact|deploy|docker login|\bgh auth\b|git push/i);
});
