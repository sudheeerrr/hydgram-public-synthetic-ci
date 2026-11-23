import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const expected = Object.freeze({
  host: '127.0.0.1', port: '33306', db: 'synthetic_ci', user: 'synthetic_ci', password: 'synthetic-ci-only-password',
});
export function validateEnv(env) {
  for (const [name, value] of Object.entries({CI_DB_HOST:expected.host,CI_DB_PORT:expected.port,CI_DB_NAME:expected.db,CI_DB_USER:expected.user,CI_DB_PASSWORD:expected.password})) {
    if (env[name] !== value) throw new Error(`ONLY_DISPOSABLE_SYNTHETIC_DATABASE_ALLOWED: ${name}`);
  }
  if (env.GITHUB_ACTIONS !== 'true' && env.HYDGRAM_LOCAL_DISPOSABLE_CONFIRM !== 'yes') throw new Error('DISPOSABLE_CONFIRMATION_REQUIRED');
  return true;
}
export function runQuery(statement, env = process.env) {
  validateEnv(env);
  const args = ['--protocol=TCP', `--host=${expected.host}`,`--port=${expected.port}`, `--user=${expected.user}`, `--database=${expected.db}`, '--batch','--skip-column-names','--raw','--execute',statement];
  const result = spawnSync('mariadb',args,{encoding:'utf8',timeout:15000, env:{PATH:process.env.PATH, MYSQL_PWD:expected.password}, maxBuffer:500_000});
  if (result.error || result.status !== 0) throw new Error(`DISPOSABLE_SQL_FAILED ${result.error?.code || result.status}: ${result.stderr?.replaceAll(expected.password,'[REDACTED]') || ''}`);
  return result.stdout.trim();
}
export function smoke(env = process.env) {
  validateEnv(env);
  const version = runQuery('SELECT VERSION()',env);
  assert.match(version,/^11\./,'expected MariaDB 11');
  const identity = runQuery('SELECT CURRENT_USER()',env);
  assert.match(identity,/^synthetic_ci@/);
  // Temp table and transaction are bound to one session, with no persistent app rows.
  const values = runQuery("CREATE TEMPORARY TABLE ci_probe (id INT PRIMARY KEY, marker VARCHAR(32)) ENGINE=InnoDB; START TRANSACTION; INSERT INTO ci_probe VALUES (1,'synthetic-only'); SELECT COUNT(*) FROM ci_probe; ROLLBACK; SELECT COUNT(*) FROM ci_probe;", env).split(/\s+/);
  assert.deepEqual(values,['1','0']);
  return {version,identity,rollback:true};
}
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try { const r=smoke(); console.log(`MARIADB_SYNTHETIC_PASS version=${r.version.split('-')[0]} rollback=${r.rollback}`); }
  catch(e) {console.error(String(e.message));process.exitCode=1;}
}
