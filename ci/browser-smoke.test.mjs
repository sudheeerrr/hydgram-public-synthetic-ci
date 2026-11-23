import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmsSyntheticPage, pageFixture } from './browser-smoke.mjs';
import { readFileSync } from 'node:fs';

test('browser fixture is synthetic and executes readiness marker', () => {
  assert.match(pageFixture(), /SYNTHETIC_BROWSER_OK/);
  assert.match(pageFixture(), /dataset\.testReady/);
  assert.doesNotMatch(pageFixture(), /https?:\/\//);
});
test('accepts a fully rendered synthetic DOM only', () => {
  assert.equal(confirmsSyntheticPage('<html><body data-test-ready="true"><main id="ci-ready">SYNTHETIC_BROWSER_OK</main></body></html>'), true);
});
test('rejects unrendered HTML, false marker and unrelated text', () => {
  for (const html of [
    pageFixture(),
    '<body data-test-ready="false"><main id="ci-ready">SYNTHETIC_BROWSER_OK</main></body>',
    '<body data-test-ready="true">SYNTHETIC_BROWSER_OK</body>',
    '<body data-test-ready="true"><main id="ci-ready">NOT_READY</main></body>',
  ]) assert.equal(confirmsSyntheticPage(html), false);
});

test('browser runner keeps Chrome OS sandbox enabled', () => {
  const script = readFileSync(new URL('./browser-smoke.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(script, /--no-sandbox|--disable-setuid-sandbox/);
});
