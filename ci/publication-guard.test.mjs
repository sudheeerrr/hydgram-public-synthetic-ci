import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validatePublicationPaths, inspectFiles } from './publication-guard.mjs';
test('current package contains only allowlisted text files', () => {assert.equal(inspectFiles().length, 15);});
test('refuses private application source, credentials and path traversal', () => {
  const rejects = ['app/page.tsx', 'api/src/config.js','lib/transport.mjs','project_docs/AI_RULES.md','release-import/fragment.txt','.env','docs/report.md','private.pem','ci/../README.md','C:\\secrets\\file'];
  assert.deepEqual(validatePublicationPaths(rejects), rejects);
});
test('refuses unexpected scripts and workflows', () => {
  assert.deepEqual(validatePublicationPaths(['ci/unreviewed.mjs','.github/workflows/deploy.yml']), ['ci/unreviewed.mjs','.github/workflows/deploy.yml']);
});
test('allows declared synthetic files', () => {
  assert.deepEqual(validatePublicationPaths(['README.md','LICENSE','fixtures/synthetic/personas.json','ci/browser-smoke.mjs']), []);
});

test('ignores only top-level GitHub checkout metadata, not publicable application files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'synthetic-public-ci-'));
  try {
    mkdirSync(join(dir,'.git'));
    writeFileSync(join(dir,'.git','config'), '[core]\n');
    writeFileSync(join(dir,'README.md'), 'Synthetic-only example\n');
    assert.deepEqual(inspectFiles(dir), ['README.md']);
    writeFileSync(join(dir,'app.js'), 'private code');
    assert.throws(() => inspectFiles(dir), /PUBLICATION_DENIED/);
  } finally {
    rmSync(dir, { recursive:true, force:true });
  }
});

test('rejects token-shaped values inside allowlisted CI scripts', () => {
  const dir = mkdtempSync(join(tmpdir(), 'synthetic-public-ci-script-scan-'));
  try {
    mkdirSync(join(dir,'ci'));
    writeFileSync(join(dir,'ci/browser-smoke.mjs'), 'const leaked = "ghp_' + 'A'.repeat(36) + '";\n');
    assert.throws(() => inspectFiles(dir), /CREDENTIAL_MATERIAL_FORBIDDEN ci\/browser-smoke\.mjs/);
  } finally {
    rmSync(dir, {recursive:true,force:true});
  }
});
