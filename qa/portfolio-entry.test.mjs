// Run from any directory: node --test qa/portfolio-entry.test.mjs
// These are route/configuration unit checks, not deployed-browser verification.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const script = readFileSync(new URL('../portfolio/portfolio.js', import.meta.url), 'utf8');
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const worker = readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
function execute(path, serviceWorker) {
  const url = new URL(path, 'https://portfolio.test');
  const calls = [], handlers = {};
  const location = { pathname: url.pathname, search: url.search, hash: url.hash,
    replace: target => calls.push(target) };
  const navigator = serviceWorker ? { serviceWorker } : {};
  vm.runInNewContext(script, { window: { location,
    addEventListener: (event, handler) => { handlers[event] = handler; } }, navigator });
  return { calls, handlers };
}
for (const hash of ['home', 'play', 'live', 'live-world', 'diagnostics', 'control']) {
  test(`saved /#${hash} stays a demo link`, () => {
    assert.deepEqual(execute('/#' + hash).calls, ['/index.html#' + hash]);
  });
}
for (const path of ['/', '/#work', '/#about', '/#resume', '/#unknown',
  '/portfolio/', '/portfolio/#work', '/portfolio/#home', '/portfolio/ruca-mobile/', '/index.html#home']) {
  test(`no unsolicited demo redirect: ${path}`, () => {
    assert.deepEqual(execute(path).calls, []);
  });
}
test('legacy link preserves its query', () => {
  assert.deepEqual(execute('/?review=1#home').calls, ['/index.html?review=1#home']);
});
test('unknown hashes cannot choose an external redirect', () => {
  assert.deepEqual(execute('/#https://example.org/').calls, []);
});
test('root rewrite is exact and leaves the explicit demo path alone', () => {
  assert.deepEqual(config.rewrites, [{ source: '/', destination: '/portfolio/index.html' }]);
  assert.deepEqual(config.alias, ['ruca-mobile-presentation-hub.vercel.app']);
});
test('resume cache header remains no-store', () => {
  const rule = config.headers.find(entry => entry.source === '/resume/(.*)');
  assert.ok(rule.headers.some(entry => entry.key === 'Cache-Control' && entry.value.includes('no-store')));
});
test('entry migration changes the worker cache namespace', () => {
  assert.ok(worker.includes('ruca-os-public-portfolio-entry-20260909'));
});
test('worker registration and update remain attached to page load', async () => {
  const registrations = [];
  let updates = 0;
  const result = execute('/portfolio/', { register: async (path, options) => {
    registrations.push({ path, updateViaCache: options.updateViaCache });
    return { update: async () => { updates++; } };
  } });
  assert.equal(registrations.length, 0);
  result.handlers.load();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(registrations, [{ path: '/service-worker.js', updateViaCache: 'none' }]);
  assert.equal(updates, 1);
});
test('service-worker failures do not break the portfolio', async () => {
  const result = execute('/portfolio/', { register: async () => { throw new Error('optional cache unavailable'); } });
  result.handlers.load();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(result.calls, []);
});
test('a legacy demo handoff does not register an extra worker', () => {
  const result = execute('/#home', { register: async () => { throw new Error('not expected'); } });
  assert.equal(result.handlers.load, undefined);
});
