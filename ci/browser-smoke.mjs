import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const TIMEOUT_MS = 20_000;
const OUTPUT_LIMIT = 1_000_000;

export function pageFixture() {
  return readFileSync(new URL('../fixtures/synthetic/smoke.html', import.meta.url), 'utf8');
}

// A successful OS launch is not a browser smoke pass: require rendered DOM
// containing the element set by the synthetic page's executed JavaScript.
export function confirmsSyntheticPage(dom) {
  return /<body\b[^>]*\bdata-test-ready="true"[^>]*>/i.test(dom) &&
    /<main\s+id="ci-ready">SYNTHETIC_BROWSER_OK<\/main>/i.test(dom);
}

export async function browserSmoke() {
  const html = pageFixture();
  const server = createServer((request, response) => {
    const good = request.url === '/';
    response.writeHead(good ? 200 : 404, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    response.end(good ? html : 'Not Found');
  });
  await new Promise((done, fail) => {
    server.once('error', fail);
    server.listen(0, '127.0.0.1', done);
  });
  const { port } = server.address();
  try {
    const executable = process.env.CHROMIUM_BIN || 'chromium';
    const args = [
      '--headless=new', '--disable-gpu',
      '--disable-dev-shm-usage', '--disable-background-networking',
      '--no-first-run', '--disable-extensions', '--virtual-time-budget=2000',
      '--dump-dom', `http://127.0.0.1:${port}/`,
    ];
    const result = await new Promise((done, fail) => {
      const child = spawn(executable, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: 'disabled:' },
      });
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let overflow = false;
      let settled = false;
      const finish = (fn, payload) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fn(payload);
      };
      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, TIMEOUT_MS);
      child.stdout.on('data', data => {
        stdout += data.toString('utf8');
        if (stdout.length > OUTPUT_LIMIT) {
          overflow = true;
          child.kill('SIGKILL');
        }
      });
      child.stderr.on('data', data => {
        stderr = (stderr + data.toString('utf8')).slice(-2000);
      });
      child.once('error', error => finish(fail, error));
      child.once('close', (code, signal) => {
        finish(done, { code, signal, stdout, stderr, timedOut, overflow });
      });
    });
    if (result.overflow) throw new Error('BROWSER_SMOKE_OUTPUT_LIMIT');
    if (result.timedOut) throw new Error('BROWSER_RUNTIME_TIMEOUT: no completed DOM within 20 seconds');
    if (result.code !== 0) throw new Error(`BROWSER_RUNTIME_EXIT code=${result.code} signal=${result.signal} stderr=${result.stderr.slice(-400)}`);
    if (!confirmsSyntheticPage(result.stdout)) throw new Error('BROWSER_DOM_READINESS_MISSING');
    return true;
  } finally {
    await new Promise(done => server.close(done));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await browserSmoke();
    console.log('SYNTHETIC_CHROMIUM_PASS');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
