import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnv } from './database-smoke.mjs';
const base = {GITHUB_ACTIONS:'true',CI_DB_HOST:'127.0.0.1',CI_DB_PORT:'33306',CI_DB_NAME:'synthetic_ci',CI_DB_USER:'synthetic_ci',CI_DB_PASSWORD:'synthetic-ci-only-password'};
test('authorizes synthetic database only',()=>{assert.equal(validateEnv(base),true);});
for (const key of ['CI_DB_HOST','CI_DB_PORT','CI_DB_NAME','CI_DB_USER','CI_DB_PASSWORD']) test(`rejects altered ${key}`,()=>{assert.throws(()=>validateEnv({...base,[key]:'other'}),/ONLY_DISPOSABLE/);});
test('requires local disposable confirmation outside GitHub Actions',()=>assert.throws(()=>validateEnv({...base,GITHUB_ACTIONS:'false'}),/DISPOSABLE_CONFIRMATION/));
