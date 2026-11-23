import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const allowed = new Set([
  '.gitignore', 'README.md', 'PUBLICATION_APPROVAL.md', 'LICENSE', 'package.json',
  '.github/workflows/public-synthetic-ci.yml',
  'ci/publication-guard.mjs', 'ci/publication-guard.test.mjs',
  'ci/database-smoke.mjs', 'ci/database-smoke.test.mjs',
  'ci/browser-smoke.mjs', 'ci/browser-smoke.test.mjs',
  'ci/workflow-policy.test.mjs',
  'fixtures/synthetic/personas.json', 'fixtures/synthetic/smoke.html',
]);
const forbiddenPath = /(^|\/)(?:\.env(?:\..*)?|\.git|node_modules|api|app|lib|release-import|00_MASTER|MASTER|project_docs|docs|android-native|ios-native|reports)(\/|$)|\.(?:pem|key|p12|p8|jks|keystore|sqlite|db|zip|tgz|tar|log)$/i;

export function validatePublicationPaths(paths) {
  const problems = [];
  for (const name of paths) {
    if (name.includes('\\') || name.startsWith('/') || name.split('/').includes('..') ||
        forbiddenPath.test(name) || !allowed.has(name)) problems.push(name);
  }
  return problems;
}

export function inspectFiles(base = root) {
  const names = [];
  const walk = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      // GitHub Actions checkout creates a .git metadata directory. Ignore only
      // that top-level checkout metadata; never include it in a public package.
      if (dir === base && item.name === '.git' && item.isDirectory()) continue;
      const abs = join(dir, item.name);
      const name = relative(base, abs).split(sep).join('/');
      if (item.isSymbolicLink()) throw new Error(`SYMLINK_FORBIDDEN ${name}`);
      if (item.isDirectory()) { walk(abs); continue; }
      if (!item.isFile() || statSync(abs).size > 100_000) throw new Error(`UNSAFE_FILE ${name}`);
      names.push(name);
      const bytes = readFileSync(abs);
      if (bytes.includes(0)) throw new Error(`BINARY_FILE_FORBIDDEN ${name}`);
      // Scan every publishable file, including scripts. Pattern definitions
      // are safe; actual credential-shaped values are not.
      const body = bytes.toString('utf8');
      if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:gh[pousr]_[A-Za-z0-9]{20,})|(?:sk-proj-[A-Za-z0-9_-]{20,})/i.test(body)) {
        throw new Error(`CREDENTIAL_MATERIAL_FORBIDDEN ${name}`);
      }
    }
  };
  walk(base);
  const unexpected = validatePublicationPaths(names);
  if (unexpected.length) throw new Error(`PUBLICATION_DENIED: ${unexpected.join(', ')}`);
  return names;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const names = inspectFiles();
  console.log(`PUBLICATION_GUARD_PASS ${names.length} allowlisted text files`);
}
